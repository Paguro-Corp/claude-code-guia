/* ============================================================
   Catálogo de enlaces profundos de la guía
   Construye, a partir de data.js, un enlace por cada elemento
   (comando, flag, atajo, extensión, concepto…) con la forma
       #/vista?focus=<id>      (o #/extensiones?tab=<id>)
   y lo comparte entre la guía (app.js) y el chat (chat.js):
   - app.js usa entryId() para poner data-id y resaltar el destino.
   - chat.js usa el catálogo para enlazar respuestas y validar que
     solo existan enlaces reales (nunca se enlaza algo inventado).
   ============================================================ */
(function () {
  "use strict";

  const D = window.CC_DATA;

  const norm = (s) => String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const slug = (s) => norm(s).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const copyable = (name) => name.replace(/\s*\[.*$/, "").trim();
  const entryId = (prefix, text) => prefix + "-" + slug(text);
  // Teclas simbólicas: su slug sería vacío, así que se les da nombre
  const KEY_NAMES = { "/": "slash", "@": "at", "!": "bang", "↑": "up", "↓": "down" };
  const keyId = (keys) => entryId("key", keys.map((k) => KEY_NAMES[k] || k).join("-"));
  const cut = (s, n) => (s.length > n ? s.slice(0, n - 1).trimEnd() + "…" : s);
  const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\\/]/g, "\\$&");

  /* ---------- Términos extra (para detectar menciones en el texto) ---------- */
  const EXT_TERMS = {
    "claude-md": ["claude.md"],
    hooks: ["hook", "hooks"],
    mcp: ["mcp"],
    subagentes: ["subagente", "subagentes"],
    skills: ["skill", "skills"],
    plugins: ["plugin", "plugins"]
  };
  const CONCEPT_TERMS = {
    "primeros-pasos": ["primeros pasos"],
    "ventana-de-contexto": ["ventana de contexto"],
    "modelo-y-esfuerzo": ["effort", "esfuerzo"],
    "memoria-persistente": ["memoria persistente"]
  };
  const TOOL_TERMS = { grep: ["grep"], glob: ["glob"], bash: ["bash"] };
  const MODE_TERMS = { plan: ["modo plan"], acceptedits: ["acceptedits"], bypasspermissions: ["bypasspermissions"] };

  /* ---------- Construcción del catálogo ---------- */
  const entries = [];
  function add(e) {
    e.terms = (e.terms || []).map(norm);
    e.href = `#/${e.view}?${e.param}=${e.value}`;
    if (!e.short) e.short = e.label;   // nombre corto para los chips
    e.order = entries.length;
    entries.push(e);
  }

  // Secciones (para enlazar una vista completa)
  const viewEntries = D.views.map((v) => ({
    id: "view-" + v.id, kind: "Sección", label: v.label, desc: "Sección «" + v.label + "» de la guía",
    href: "#/" + v.id, view: v.id, terms: [], order: -1
  }));

  D.commands.forEach((c) => {
    const n = copyable(c.name);
    const id = entryId("cmd", n);
    add({ id, kind: "Comando", label: n, desc: c.desc, tip: c.tip, example: c.example, view: "comandos", param: "focus", value: id, terms: [n] });
  });

  D.cliCommands.forEach((c) => {
    const id = entryId("cli", c.name);
    let t = [], short = c.name;
    if (!c.name.includes("|")) {
      const base = c.name.replace(/"[^"]*"/g, "").replace(/\s+\[.*$/, "").trim();
      if (base !== "claude") { t = [base]; short = base; }
    }
    add({ id, kind: "CLI", label: c.name, short, desc: c.desc, example: c.example, view: "cli", param: "focus", value: id, terms: t });
  });

  D.cliFlags.forEach((f) => {
    const id = entryId("flag", f.name);
    const t = f.name.split(/\s*(?:,|\/)\s*/).map((p) => p.split(" ")[0]).filter((p) => p.startsWith("--"));
    add({ id, kind: "Flag", label: f.name, short: t.join(" / ") || f.name, desc: f.desc, view: "cli", param: "focus", value: id, terms: t });
  });

  D.shortcuts.forEach((s) => {
    const id = keyId(s.keys);
    const t = s.keys.length > 1 ? [s.keys.join("+")] : s.keys[0] === "Esc" ? ["esc"] : [];
    add({ id, kind: "Atajo", label: s.keys.join(" + "), desc: s.desc, example: s.example, view: "atajos", param: "focus", value: id, terms: t });
  });

  D.extensions.forEach((e) => {
    add({ id: "ext-" + e.id, kind: "Extensión", label: e.title, desc: e.summary, view: "extensiones", param: "tab", value: e.id, terms: EXT_TERMS[e.id] || [] });
  });

  add({ id: "loop", kind: "Concepto", label: "El ciclo agéntico", desc: "Prompt → contexto → acción → permiso → resultado, en bucle hasta terminar la tarea.", view: "como-funciona", param: "focus", value: "loop", terms: ["ciclo agentico"] });

  D.tools.forEach((t) => {
    const id = entryId("tool", t.name);
    add({ id, kind: "Herramienta", label: t.name, desc: t.desc, view: "como-funciona", param: "focus", value: id, terms: TOOL_TERMS[slug(t.name)] || [] });
  });

  D.concepts.forEach((c) => {
    const id = entryId("concept", c.title);
    add({ id, kind: "Concepto", label: c.title, desc: c.text, view: "como-funciona", param: "focus", value: id, terms: CONCEPT_TERMS[slug(c.title)] || [] });
  });

  D.permissionModes.forEach((m) => {
    const id = entryId("mode", m.name);
    add({ id, kind: "Permisos", label: `${m.name} (${m.title})`, desc: m.desc, view: "permisos", param: "focus", value: id, terms: MODE_TERMS[slug(m.name)] || [] });
  });

  add({ id: "settings", kind: "Config", label: "Archivos de configuración (settings.json)", desc: "Dónde se guardan las preferencias: usuario, proyecto y local.", view: "permisos", param: "focus", value: "settings", terms: ["settings.json", "settings.local.json"] });

  D.practices.forEach((p) => {
    const id = entryId("practice", p.title);
    add({ id, kind: "Práctica", label: p.title, desc: p.text, view: "practicas", param: "focus", value: id, terms: [] });
  });

  /* ---------- Consulta ---------- */
  const byHrefMap = new Map();
  entries.concat(viewEntries).forEach((e) => byHrefMap.set(e.href, e));
  const byHref = (href) => byHrefMap.get(href) || null;

  const reCache = new Map();
  function termRe(t) {
    let re = reCache.get(t);
    if (!re) { re = new RegExp("(^|[^a-z0-9_])" + escapeRe(t) + "(?![a-z0-9_])"); reCache.set(t, re); }
    return re;
  }

  /* Elementos de la guía mencionados en la pregunta/respuesta */
  function related(question, answer, exclude = new Set(), max = 4) {
    const clean = (s) => norm(s).replace(/\]\(#[^)]*\)/g, "]").replace(/\s*\+\s*/g, "+");
    const q = clean(question), a = clean(answer);
    const found = [];
    for (const e of entries) {
      if (!e.terms.length || exclude.has(e.href)) continue;
      let score = 0;
      for (const t of e.terms) {
        const re = termRe(t);
        if (re.test(a)) score += 2;
        if (re.test(q)) score += 1;
      }
      if (score) found.push({ e, score });
    }
    found.sort((x, y) => y.score - x.score || x.e.order - y.e.order);
    return found.slice(0, max).map((r) => r.e);
  }

  /* Lista para el prompt del modelo: [nombre](enlace): descripción */
  function promptList() {
    const secs = viewEntries.map((v) => `- [${v.label}](${v.href})`).join("\n");
    const items = entries.map((e) => `- [${e.label}](${e.href}) (${e.kind}): ${cut(e.desc, 190)}`).join("\n");
    return "### Secciones\n" + secs + "\n### Elementos\n" + items;
  }

  window.CCLinks = { entries, viewEntries, entryId, keyId, slug, copyable, byHref, related, promptList };
})();
