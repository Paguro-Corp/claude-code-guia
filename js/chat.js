/* ============================================================
   Widget de chat — asistente IA sobre Claude Code
   Modelo: Claude Haiku 5.5 · esfuerzo (effort): medium

   Modos (se detectan solos al cargar):
   - PROXY   : el servidor local (server.js) tiene la API key en .env y
               hace de intermediario. La clave nunca llega al navegador.
   - KEY     : sin servidor con clave, pero hay una API key guardada en
               este navegador → llamada directa (solo pruebas locales).
   - OFFLINE : sin ninguna clave → responde buscando en la propia guía.

   Las respuestas llegan en streaming (SSE) y se pueden detener.
   ============================================================ */
(function () {
  "use strict";

  const D = window.CC_DATA;

  /* ---------- Configuración ---------- */
  const CHAT_CONFIG = {
    model: "claude-haiku-5-5",
    effort: "medium",
    maxTokens: 1024,
    proxyChat: "/api/chat",
    proxyHealth: "/api/health",
    directEndpoint: "https://api.anthropic.com/v1/messages",
    apiVersion: "2023-06-01",
    historyTurns: 10,       // mensajes previos enviados como contexto
    maxStored: 40,          // mensajes que se guardan en localStorage
    keyStorage: "cc-anthropic-key",
    logStorage: "cc-chat-log-v1"
  };

  const $ = (s) => document.querySelector(s);
  const el = {
    root: $("#chat"), fab: $("#chatFab"), panel: $("#chatPanel"),
    close: $("#chatCloseBtn"), clear: $("#chatClearBtn"),
    settingsBtn: $("#chatSettingsBtn"), settings: $("#chatSettings"),
    keyInput: $("#apiKeyInput"), keySave: $("#apiKeySave"), keyClear: $("#apiKeyClear"),
    status: $("#chatStatus"), messages: $("#chatMessages"), suggestions: $("#chatSuggestions"),
    form: $("#chatForm"), input: $("#chatInput"), send: $("#chatSend")
  };

  const state = {
    mode: "offline",       // "proxy" | "key" | "offline"
    busy: false,
    abort: null,
    log: []                // [{ role, text, tag?, error?, api? }]
  };

  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const norm = (s) => String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const getKey = () => localStorage.getItem(CHAT_CONFIG.keyStorage) || "";
  const MODEL_TAG = "Haiku 5.5 · effort medium";

  /* ---------- Prompt de sistema con la base de conocimiento ---------- */
  function buildSystemPrompt() {
    const view = window.CCApp ? window.CCApp.getView() : "inicio";
    return [
      "Eres el asistente de una guía interactiva sobre Claude Code (el agente de programación de Anthropic para terminal, IDE, escritorio y web).",
      "Respondes SIEMPRE en español, de forma breve y práctica (normalmente 2-6 líneas), con ejemplos de comandos en bloques de código cuando ayuden.",
      "Solo respondes sobre Claude Code y su uso. Si preguntan otra cosa, indícalo amablemente y reconduce.",
      "Si no estás seguro de un detalle que depende de la versión, dilo y sugiere comprobarlo con /help o `claude --help`. No inventes comandos, flags ni opciones.",
      `El usuario está viendo ahora la sección "${view}" de la guía.`,
      "",
      "ENLACES A LA GUÍA (muy importante): tu objetivo es que el usuario aprenda dónde está la información en la guía y deje de depender del chat.",
      "- Cuando menciones un comando, flag, atajo, extensión, concepto o práctica que aparezca en la lista de abajo, enlázalo con markdown: [/compact](#/comandos?focus=cmd-compact).",
      "- Usa EXCLUSIVAMENTE los enlaces de la lista, copiados tal cual. Nunca inventes ni modifiques un enlace. Si algo no está en la lista, menciónalo sin enlace.",
      "- Enlaza cada elemento solo la primera vez que lo nombres. Pon el enlace en el nombre del comando/concepto, no en frases largas.",
      "- Si la respuesta se apoya en una sección completa, puedes cerrar con una frase corta como «Más detalle en [Comandos /](#/comandos)».",
      "",
      "Referencia de la guía (cada línea: [nombre](enlace) (tipo): descripción). Úsala como base del contenido:",
      window.CCLinks.promptList()
    ].join("\n");
  }

  /* ---------- Markdown mínimo y seguro ---------- */
  function mdToHtml(text) {
    const blocks = [];
    let s = String(text).replace(/```[a-zA-Z0-9]*\n?([\s\S]*?)(```|$)/g, (_, code) => {
      blocks.push(
        `<pre><button type="button" class="copy-code" aria-label="Copiar código">Copiar</button><code>${esc(code.replace(/\n$/, ""))}</code></pre>`
      );
      return `\u0000B${blocks.length - 1}\u0000`;
    });
    s = esc(s)
      .replace(/`([^`\n]+)`/g, "<code>$1</code>")
      // Enlaces a la guía: solo se aceptan hrefs que existan en el catálogo; cualquier otro queda como texto
      .replace(/\[([^\]\n]+)\]\((#\/[a-z0-9\-_?=%.\/]*)\)/g, (_, text, href) => {
        const entry = window.CCLinks.byHref(href);
        return entry
          ? `<a class="guide-link" href="${href}" title="Ver en la guía: ${esc(entry.kind)}">${text}</a>`
          : text;
      })
      .replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>");

    const out = [];
    let list = null;
    const closeList = () => { if (list) { out.push(`</${list}>`); list = null; } };
    for (const line of s.split("\n")) {
      const ul = line.match(/^\s*[-*]\s+(.*)/);
      const ol = line.match(/^\s*\d+[.)]\s+(.*)/);
      if (ul || ol) {
        const tag = ul ? "ul" : "ol";
        if (list !== tag) { closeList(); out.push(`<${tag}>`); list = tag; }
        out.push(`<li>${(ul || ol)[1]}</li>`);
      } else {
        closeList();
        if (line.trim()) out.push(`<p>${line}</p>`);
      }
    }
    closeList();
    return out.join("").replace(/\u0000B(\d+)\u0000/g, (_, i) => blocks[+i]);
  }

  /* ---------- Mensajes en pantalla ---------- */
  const scrollDown = () => { el.messages.scrollTop = el.messages.scrollHeight; };

  function renderBubble(m) {
    const div = document.createElement("div");
    div.className = `msg msg--${m.role === "user" ? "user" : "bot"}${m.error ? " msg--error" : ""}`;
    div.innerHTML = m.role === "user" ? `<p>${esc(m.text).replace(/\n/g, "<br>")}</p>` : mdToHtml(m.text);
    if (m.links && m.links.length) div.insertAdjacentHTML("beforeend", guideChipsHTML(m.links));
    if (m.tag) div.insertAdjacentHTML("beforeend", `<span class="msg__tag">${esc(m.tag)}</span>`);
    return div;
  }

  /* Chips «📖 En la guía» al pie de la respuesta (solo enlaces válidos del catálogo) */
  function guideChipsHTML(hrefs) {
    const chips = hrefs
      .map((h) => window.CCLinks.byHref(h))
      .filter(Boolean)
      .map((e) => `<a class="guide-chip" href="${e.href}"><small>${esc(e.kind)}</small> ${esc(e.short || e.label)}</a>`)
      .join("");
    return chips ? `<div class="guide-links"><span>📖 En la guía:</span>${chips}</div>` : "";
  }

  function pushLog(entry, { persist = true } = {}) {
    state.log.push(entry);
    el.messages.appendChild(renderBubble(entry));
    scrollDown();
    if (persist) saveLog();
    return entry;
  }

  function saveLog() {
    try {
      const keep = state.log.filter((m) => !m.welcome).slice(-CHAT_CONFIG.maxStored);
      localStorage.setItem(CHAT_CONFIG.logStorage, JSON.stringify(keep));
    } catch (_) { /* cuota llena o modo privado: se ignora */ }
  }

  function loadLog() {
    try {
      const arr = JSON.parse(localStorage.getItem(CHAT_CONFIG.logStorage) || "[]");
      return Array.isArray(arr)
        ? arr
            .filter((m) => m && typeof m.text === "string" && (m.role === "user" || m.role === "bot"))
            .map((m) => ({ ...m, links: Array.isArray(m.links) ? m.links.filter((x) => typeof x === "string") : undefined }))
        : [];
    } catch (_) { return []; }
  }

  /* Contexto que se envía a la API: solo turnos que sí se respondieron */
  function apiHistory() {
    return state.log
      .filter((m) => m.api)
      .map((m) => ({ role: m.role === "user" ? "user" : "assistant", content: m.text }))
      .slice(-CHAT_CONFIG.historyTurns);
  }

  function showWelcome() {
    el.messages.appendChild(renderBubble({
      role: "bot",
      text: "¡Hola! Soy el asistente de esta guía. Pregúntame sobre comandos, flags, atajos, hooks, MCP, permisos o cómo funciona Claude Code. Te responderé con **enlaces a la guía** para que aprendas dónde encontrar cada cosa."
    }));
  }

  function redrawAll() {
    el.messages.innerHTML = "";
    showWelcome();
    state.log.forEach((m) => el.messages.appendChild(renderBubble(m)));
    scrollDown();
  }

  /* ---------- Estado visual ---------- */
  function refreshStatus() {
    const label = {
      proxy: `Conectado vía servidor local · ${MODEL_TAG}`,
      key: `Conectado con API key del navegador · ${MODEL_TAG}`,
      offline: "Modo offline (sin API key): respondo con la información de la guía"
    }[state.mode];
    el.status.classList.toggle("is-online", state.mode !== "offline");
    el.status.innerHTML = `<i></i> ${esc(label)}`;
  }

  async function detectMode() {
    state.mode = getKey() ? "key" : "offline";
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 2500);
      const r = await fetch(CHAT_CONFIG.proxyHealth, { signal: ctrl.signal, cache: "no-store" });
      clearTimeout(t);
      if (r.ok) {
        const h = await r.json();
        if (h && h.configured) state.mode = "proxy";
      }
    } catch (_) { /* sin servidor: se mantiene key/offline */ }
    refreshStatus();
  }

  function renderSuggestions() {
    const view = window.CCApp ? window.CCApp.getView() : "inicio";
    const bank = {
      inicio: ["¿Qué es Claude Code?", "¿Cómo empiezo a usarlo?", "¿Qué hace /init?"],
      "como-funciona": ["¿Qué es el ciclo agéntico?", "¿Qué herramientas usa Claude?", "¿Qué es la ventana de contexto?"],
      comandos: ["¿Diferencia entre /clear y /compact?", "¿Para qué sirve /effort?", "¿Cómo veo cuánto contexto uso?"],
      cli: ["¿Cómo uso claude -p en un script?", "¿Cómo retomo una sesión?", "¿Qué hace --permission-mode?"],
      atajos: ["¿Cómo interrumpo a Claude?", "¿Cómo menciono un archivo?", "¿Qué hace Shift+Tab?"],
      extensiones: ["¿Qué es un hook?", "¿Cuándo uso un subagente?", "¿Qué va en CLAUDE.md?"],
      permisos: ["¿Qué es el modo plan?", "¿Dónde configuro permisos?", "¿Es seguro bypassPermissions?"],
      practicas: ["Dame 3 consejos para mejores resultados", "¿Cómo cuido el contexto?", "¿Cómo verifica Claude su trabajo?"]
    };
    el.suggestions.innerHTML = (bank[view] || bank.inicio)
      .map((t) => `<button type="button" class="chip">${esc(t)}</button>`).join("");
  }

  /* ---------- Modo offline: búsqueda en la guía ---------- */
  function offlineAnswer(question) {
    const q = norm(question);
    const stop = new Set(["que", "es", "el", "la", "los", "las", "un", "una", "de", "del", "para", "como", "cual", "cuales", "sirve", "hace", "uso", "usar", "puedo", "me", "en", "y", "o", "a", "se", "por", "con", "diferencia", "entre"]);
    const words = q.replace(/[^\p{L}\p{N}/@!.\-+ ]/gu, " ").split(/\s+/).filter((w) => w.length > 1 && !stop.has(w));
    if (!words.length) return null;
    // "claude" y "code" aparecen en casi todo: solo cuentan si no hay otras palabras
    const generic = new Set(["claude", "code"]);
    const specific = words.filter((w) => !generic.has(w));
    if (specific.length) words.splice(0, words.length, ...specific);

    // El catálogo de enlaces ya contiene todos los elementos de la guía, cada uno con su enlace
    const extPoints = Object.fromEntries(D.extensions.map((e) => ["ext-" + e.id, (e.points || []).join(" ")]));
    const pool = window.CCLinks.entries.map((e) => ({
      kind: e.kind,
      title: e.label,
      text: e.desc + (e.tip ? " Tip: " + e.tip : "") + (extPoints[e.id] ? " " + extPoints[e.id] : ""),
      example: e.example,
      href: e.href
    }));

    const scored = pool
      .map((it) => {
        const t = norm(it.title), body = norm(it.text);
        let score = 0;
        for (const w of words) {
          if (t.includes(w)) score += 4;
          if (body.includes(w)) score += 1;
        }
        return { it, score };
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score);

    if (!scored.length) return null;
    const top = scored[0].score;
    return scored
      .filter((r) => r.score >= top * 0.6)
      .slice(0, 3)
      .map(({ it }) => `**[${it.title.replace(/[\[\]]/g, "")}](${it.href})** (${it.kind}): ${it.text}` + (it.example ? `\n\`\`\`\n${it.example}\n\`\`\`` : ""))
      .join("\n\n");
  }

  /* ---------- Streaming (SSE) ---------- */
  async function readSSE(response, onEvent) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buf = "";
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      let i;
      while ((i = buf.search(/\r?\n\r?\n/)) !== -1) {
        const raw = buf.slice(0, i);
        buf = buf.slice(i).replace(/^\r?\n\r?\n/, "");
        let data = "";
        for (const line of raw.split(/\r?\n/)) {
          if (line.startsWith("data:")) data += line.slice(5).trim();
        }
        if (!data) continue;
        try { onEvent(JSON.parse(data)); } catch (e) { if (e && e.isApiError) throw e; }
      }
    }
  }

  /* Llama a la API (vía proxy o directo) y entrega el texto poco a poco */
  async function streamAnswer(messages, onText, signal) {
    let url, headers, body;
    if (state.mode === "proxy") {
      url = CHAT_CONFIG.proxyChat;
      headers = { "content-type": "application/json" };
      body = { system: buildSystemPrompt(), messages };       // el servidor fija modelo y effort
    } else {
      url = CHAT_CONFIG.directEndpoint;
      headers = {
        "content-type": "application/json",
        "x-api-key": getKey(),
        "anthropic-version": CHAT_CONFIG.apiVersion,
        "anthropic-dangerous-direct-browser-access": "true"    // solo pruebas locales
      };
      body = {
        model: CHAT_CONFIG.model,
        max_tokens: CHAT_CONFIG.maxTokens,
        output_config: { effort: CHAT_CONFIG.effort },
        stream: true,
        system: buildSystemPrompt(),
        messages
      };
    }

    const res = await fetch(url, { method: "POST", headers, body: JSON.stringify(body), signal });
    if (!res.ok) {
      let detail = "";
      try { detail = (await res.json()).error?.message || ""; } catch (_) { /* ignore */ }
      throw Object.assign(new Error(detail || `HTTP ${res.status}`), { status: res.status });
    }

    let stopReason = null;
    await readSSE(res, (ev) => {
      if (ev.type === "content_block_delta" && ev.delta && ev.delta.type === "text_delta") onText(ev.delta.text);
      else if (ev.type === "message_delta" && ev.delta) stopReason = ev.delta.stop_reason || stopReason;
      else if (ev.type === "error") throw Object.assign(new Error(ev.error?.message || "Error del servicio"), { isApiError: true, status: 500 });
    });
    return stopReason;
  }

  function friendlyError(err) {
    if (err.status === 401) return state.mode === "proxy"
      ? "La API key del servidor no es válida. Revisa tu archivo .env y reinicia el servidor."
      : "La API key no es válida. Revísala en ⚙ Ajustes.";
    if (err.status === 403) return "La API key no tiene permiso para este modelo.";
    if (err.status === 429) return "Demasiadas solicitudes. Espera unos segundos e inténtalo de nuevo.";
    if (err.status === 503) return "El servidor no tiene API key configurada. Revisa tu archivo .env.";
    if (err.status === 529 || err.status >= 500) return "El servicio de Anthropic está saturado. Reintenta en un momento.";
    if (err.status === 400) return "La API rechazó la solicitud: " + err.message;
    return "No pude conectar con el asistente (" + err.message + "). Mientras tanto uso el modo offline.";
  }

  /* ---------- Envío ---------- */
  function setBusy(busy) {
    state.busy = busy;
    el.send.textContent = busy ? "Detener" : "Enviar";
    el.send.classList.toggle("btn--stop", busy);
    el.send.setAttribute("aria-label", busy ? "Detener la respuesta" : "Enviar mensaje");
  }

  async function handleSend(text) {
    text = text.trim();
    if (!text || state.busy) return;
    el.input.value = ""; autosize();
    pushLog({ role: "user", text });
    const userEntry = state.log[state.log.length - 1];
    setBusy(true);

    // Burbuja del asistente con indicador de "escribiendo"
    const bubble = document.createElement("div");
    bubble.className = "msg msg--bot";
    bubble.innerHTML = '<span class="typing" aria-label="Escribiendo"><i></i><i></i><i></i></span>';
    el.messages.appendChild(bubble);
    scrollDown();

    try {
      if (state.mode === "offline") {
        await new Promise((r) => setTimeout(r, 300));
        bubble.remove();
        pushLog({
          role: "bot",
          text: offlineAnswer(text) || "No encontré eso en la guía. Configura una API key (archivo .env del servidor) para que Haiku 5.5 responda cualquier pregunta sobre Claude Code.",
          tag: "modo offline"
        });
        return;
      }

      const messages = apiHistory().concat({ role: "user", content: text });
      state.abort = new AbortController();
      let answer = "";
      let raf = 0;
      const paint = () => { raf = 0; bubble.innerHTML = mdToHtml(answer); scrollDown(); };

      let stopReason = null, stopped = false;
      try {
        stopReason = await streamAnswer(messages, (t) => {
          answer += t;
          if (!raf) raf = requestAnimationFrame(paint);
        }, state.abort.signal);
      } catch (err) {
        if (err.name === "AbortError") stopped = true;
        else {
          cancelAnimationFrame(raf);
          bubble.remove();
          pushLog({ role: "bot", text: friendlyError(err), error: true });
          if (!err.status || err.status >= 500) {
            const fb = offlineAnswer(text);
            if (fb) pushLog({ role: "bot", text: fb, tag: "modo offline" });
          }
          return;
        }
      }
      cancelAnimationFrame(raf);
      bubble.remove();

      if (stopReason === "refusal" && !answer.trim()) {
        pushLog({ role: "bot", text: "No puedo ayudar con esa solicitud. ¿Quieres preguntarme algo sobre el uso de Claude Code?" });
        return;
      }
      if (!answer.trim()) {
        pushLog({ role: "bot", text: stopped ? "Respuesta detenida." : "No obtuve respuesta. Intenta reformular la pregunta.", error: !stopped });
        return;
      }
      let tag = MODEL_TAG;
      if (stopped) tag += " · detenida";
      else if (stopReason === "max_tokens") tag += " · respuesta recortada";
      userEntry.api = true;
      // Chips «En la guía»: elementos mencionados que el modelo no enlazó ya en el texto
      const linked = new Set((answer.match(/\]\((#\/[^)\s]*)\)/g) || []).map((s) => s.slice(2, -1)));
      const links = window.CCLinks.related(text, answer, linked).map((e) => e.href);
      pushLog({ role: "bot", text: answer, tag, api: true, links });
    } finally {
      state.abort = null;
      setBusy(false);
      el.input.focus();
    }
  }

  /* ---------- UI ---------- */
  function openChat(open) {
    el.root.classList.toggle("chat--open", open);
    el.panel.hidden = !open;
    el.fab.setAttribute("aria-expanded", String(open));
    if (open) {
      renderSuggestions();
      scrollDown();
      setTimeout(() => el.input.focus(), 50);
    } else {
      el.fab.focus();
    }
  }

  function resetChat() {
    if (state.abort) state.abort.abort();
    state.log = [];
    saveLog();
    redrawAll();
    renderSuggestions();
  }

  function autosize() {
    el.input.style.height = "auto";
    el.input.style.height = Math.min(el.input.scrollHeight, 110) + "px";
    el.input.style.overflowY = el.input.scrollHeight > 110 ? "auto" : "hidden";
  }

  el.fab.addEventListener("click", () => openChat(true));
  el.close.addEventListener("click", () => openChat(false));
  el.clear.addEventListener("click", resetChat);
  el.settingsBtn.addEventListener("click", () => {
    el.settings.hidden = !el.settings.hidden;
    if (!el.settings.hidden) el.keyInput.focus();
  });
  el.keySave.addEventListener("click", async () => {
    const v = el.keyInput.value.trim();
    if (!v) return;
    localStorage.setItem(CHAT_CONFIG.keyStorage, v);
    el.keyInput.value = "";
    el.settings.hidden = true;
    await detectMode();
    window.CCToast && window.CCToast("API key guardada en este navegador");
  });
  el.keyClear.addEventListener("click", async () => {
    localStorage.removeItem(CHAT_CONFIG.keyStorage);
    el.keyInput.value = "";
    await detectMode();
    window.CCToast && window.CCToast("API key borrada");
  });

  el.form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (state.busy) { if (state.abort) state.abort.abort(); return; }   // botón = "Detener"
    handleSend(el.input.value);
  });
  el.input.addEventListener("input", autosize);
  el.input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!state.busy) el.form.requestSubmit();
    }
  });
  el.suggestions.addEventListener("click", (e) => {
    const b = e.target.closest(".chip");
    if (b) handleSend(b.textContent);
  });
  // Enlaces a la guía dentro del chat: navegan por hash; si ya estás ahí, se vuelve a resaltar
  el.messages.addEventListener("click", (e) => {
    const a = e.target.closest(".guide-link, .guide-chip");
    if (!a) return;
    const href = a.getAttribute("href");
    if (location.hash === href) { e.preventDefault(); window.CCApp && window.CCApp.reroute(); }
    // En pantallas pequeñas el chat taparía el destino: se cierra para mostrarlo
    if (window.matchMedia("(max-width: 760px)").matches) openChat(false);
  });
  el.messages.addEventListener("click", async (e) => {
    const b = e.target.closest(".copy-code");
    if (!b) return;
    const code = b.parentElement.querySelector("code").textContent;
    try { await navigator.clipboard.writeText(code); } catch (_) { return; }
    b.textContent = "¡Copiado!";
    setTimeout(() => { b.textContent = "Copiar"; }, 1200);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !el.panel.hidden) openChat(false);
  });
  document.addEventListener("cc:viewchange", () => { if (!el.panel.hidden) renderSuggestions(); });

  /* ---------- Inicio ---------- */
  state.log = loadLog();
  redrawAll();
  refreshStatus();
  detectMode();
})();
