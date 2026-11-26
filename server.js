/* ============================================================
   Servidor local — Guía de Claude Code
   - Sirve los archivos estáticos (index.html, css/, js/)
   - POST /api/chat  → proxy en streaming hacia la API de Anthropic
   - GET  /api/health → estado del asistente (¿hay API key?)

   La API key vive en el servidor (variable de entorno o archivo
   .env), nunca llega al navegador.

   Uso:   node server.js          (o: npm start)
   Sin dependencias. Requiere Node 18+.
   ============================================================ */
"use strict";

const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

/* ---------- .env mínimo (KEY=VALUE) ---------- */
function loadEnvFile(file) {
  try {
    for (const raw of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
      const line = raw.trim();
      if (!line || line.startsWith("#")) continue;
      const i = line.indexOf("=");
      if (i < 1) continue;
      const key = line.slice(0, i).trim();
      let val = line.slice(i + 1).trim();
      if (/^(".*"|'.*')$/.test(val)) val = val.slice(1, -1);
      if (!(key in process.env)) process.env[key] = val;
    }
  } catch (_) { /* no hay .env: está bien */ }
}
loadEnvFile(path.join(__dirname, ".env"));

/* ---------- Configuración del asistente ---------- */
const CONFIG = {
  port: Number(process.env.PORT) || 8765,
  host: "127.0.0.1", // solo local: nadie más en la red puede usar tu clave
  apiKey: (process.env.ANTHROPIC_API_KEY || "").trim(),
  baseUrl: (process.env.ANTHROPIC_BASE_URL || "https://api.anthropic.com").replace(/\/$/, ""),
  model: "claude-haiku-5-5",       // Haiku 5.5
  effort: "medium",                 // output_config.effort
  maxTokens: 1024,
  apiVersion: "2023-06-01",
  maxBodyBytes: 200 * 1024,
  maxMessages: 40
};

/* ---------- Archivos estáticos permitidos ---------- */
const ROOT = __dirname;
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon"
};
// Solo se sirve index.html y el contenido de css/ y js/ (nunca .env ni server.js)
const isPublicPath = (rel) => rel === "index.html" || /^(css|js|assets)\/[\w./-]+$/.test(rel);

function serveStatic(req, res, pathname) {
  let rel = decodeURIComponent(pathname).replace(/^\/+/, "") || "index.html";
  if (rel.includes("..") || !isPublicPath(rel)) return send(res, 404, "No encontrado");
  const file = path.join(ROOT, rel);
  if (!file.startsWith(ROOT + path.sep)) return send(res, 404, "No encontrado");
  fs.readFile(file, (err, data) => {
    if (err) return send(res, 404, "No encontrado");
    res.writeHead(200, {
      "Content-Type": MIME[path.extname(file)] || "application/octet-stream",
      "Cache-Control": "no-cache" // desarrollo: siempre revalida
    });
    res.end(data);
  });
}

/* ---------- Utilidades HTTP ---------- */
function send(res, status, body, type = "text/plain; charset=utf-8") {
  const payload = typeof body === "string" ? body : JSON.stringify(body);
  res.writeHead(status, { "Content-Type": typeof body === "string" ? type : "application/json; charset=utf-8" });
  res.end(payload);
}

// Defensa contra DNS rebinding / otras webs usando tu proxy local:
// el Host debe ser local y, si hay Origin, debe ser este mismo servidor.
function isLocalRequest(req) {
  const hostOk = /^(127\.0\.0\.1|localhost|\[::1\]):\d+$/.test(req.headers.host || "");
  const origin = req.headers.origin;
  if (!origin) return hostOk;
  try {
    const o = new URL(origin);
    return hostOk && /^(127\.0\.0\.1|localhost|\[::1\])$/.test(o.hostname) && String(o.port) === String(CONFIG.port);
  } catch (_) { return false; }
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on("data", (c) => {
      size += c.length;
      if (size > CONFIG.maxBodyBytes) { reject(Object.assign(new Error("Cuerpo demasiado grande"), { status: 413 })); req.destroy(); return; }
      chunks.push(c);
    });
    req.on("end", () => {
      try { resolve(JSON.parse(Buffer.concat(chunks).toString("utf8"))); }
      catch (_) { reject(Object.assign(new Error("JSON inválido"), { status: 400 })); }
    });
    req.on("error", reject);
  });
}

/* ---------- /api/chat ---------- */
function validateMessages(messages) {
  if (!Array.isArray(messages) || !messages.length || messages.length > CONFIG.maxMessages) return null;
  const out = [];
  for (const m of messages) {
    if (!m || (m.role !== "user" && m.role !== "assistant") || typeof m.content !== "string" || !m.content.trim()) return null;
    out.push({ role: m.role, content: m.content });
  }
  if (out[0].role !== "user" || out[out.length - 1].role !== "user") return null;
  return out;
}

async function handleChat(req, res) {
  if (!CONFIG.apiKey) return send(res, 503, { error: { message: "El servidor no tiene ANTHROPIC_API_KEY configurada." } });

  let body;
  try { body = await readJson(req); }
  catch (e) { return send(res, e.status || 400, { error: { message: e.message } }); }

  const messages = validateMessages(body.messages);
  if (!messages) return send(res, 400, { error: { message: "Mensajes inválidos." } });
  const system = typeof body.system === "string" ? body.system.slice(0, 30000) : undefined;

  const abort = new AbortController();
  res.on("close", () => { if (!res.writableEnded) abort.abort(); }); // el usuario pulsó "Detener"

  let upstream;
  try {
    upstream = await fetch(`${CONFIG.baseUrl}/v1/messages`, {
      method: "POST",
      signal: abort.signal,
      headers: {
        "content-type": "application/json",
        "x-api-key": CONFIG.apiKey,
        "anthropic-version": CONFIG.apiVersion
      },
      // El modelo y el esfuerzo los fija el servidor: el navegador no puede cambiarlos.
      body: JSON.stringify({
        model: CONFIG.model,
        max_tokens: CONFIG.maxTokens,
        output_config: { effort: CONFIG.effort },
        stream: true,
        ...(system ? { system } : {}),
        messages
      })
    });
  } catch (e) {
    if (abort.signal.aborted) return;
    return send(res, 502, { error: { message: "No se pudo contactar con la API de Anthropic: " + e.message } });
  }

  if (!upstream.ok) {
    let msg = `Error ${upstream.status} de la API`;
    try { msg = (await upstream.json()).error?.message || msg; } catch (_) { /* ignore */ }
    return send(res, upstream.status, { error: { message: msg } });
  }

  res.writeHead(200, {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    "Connection": "keep-alive",
    "X-Accel-Buffering": "no"
  });
  try {
    const reader = upstream.body.getReader();
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(value);
    }
  } catch (e) {
    if (!abort.signal.aborted) {
      res.write(`event: error\ndata: ${JSON.stringify({ type: "error", error: { message: "Conexión interrumpida: " + e.message } })}\n\n`);
    }
  }
  res.end();
}

/* ---------- Router ---------- */
const server = http.createServer(async (req, res) => {
  try {
    if (!isLocalRequest(req)) return send(res, 403, "Prohibido");
    const { pathname } = new URL(req.url, "http://localhost");

    if (pathname === "/api/health" && req.method === "GET") {
      return send(res, 200, { ok: true, configured: !!CONFIG.apiKey, model: CONFIG.model, effort: CONFIG.effort });
    }
    if (pathname === "/api/chat") {
      if (req.method !== "POST") return send(res, 405, "Método no permitido");
      return await handleChat(req, res);
    }
    if (req.method !== "GET" && req.method !== "HEAD") return send(res, 405, "Método no permitido");
    return serveStatic(req, res, pathname);
  } catch (e) {
    console.error(e);
    if (!res.headersSent) send(res, 500, "Error interno"); else res.end();
  }
});

server.listen(CONFIG.port, CONFIG.host, () => {
  console.log(`\n  Guía de Claude Code → http://${CONFIG.host}:${CONFIG.port}`);
  console.log(`  Asistente: ${CONFIG.model} · effort ${CONFIG.effort}`);
  console.log(CONFIG.apiKey
    ? "  API key: configurada ✓\n"
    : "  API key: NO configurada → el chat funcionará en modo offline.\n  Crea un archivo .env con ANTHROPIC_API_KEY=sk-ant-... y reinicia.\n");
});
