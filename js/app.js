/* ============================================================
   Guía interactiva de Claude Code — lógica principal
   - Router por hash (#/vista)
   - Renderizado de vistas desde window.CC_DATA
   - Búsqueda global, filtros, copiar, tema, menú móvil
   ============================================================ */
(function () {
  "use strict";

  const D = window.CC_DATA;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const viewEl = $("#view");
  const navList = $("#navList");
  const nav = $("#nav");
  const navToggle = $("#navToggle");
  const searchInput = $("#globalSearch");

  /* ---------- Utilidades ---------- */
  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const norm = (s) => String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

  function highlight(text, q) {
    const safe = esc(text);
    if (!q) return safe;
    const re = new RegExp("(" + esc(q).replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "ig");
    return safe.replace(re, "<mark>$1</mark>");
  }

  let toastTimer;
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 1600);
  }
  window.CCToast = toast;

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch (_) {
      const ta = document.createElement("textarea");
      ta.value = text; document.body.appendChild(ta); ta.select();
      document.execCommand("copy"); ta.remove();
    }
    toast("Copiado: " + (text.length > 40 ? text.slice(0, 40) + "…" : text));
  }

  /* Nombre "copiable" de un comando: quita los argumentos entre corchetes */
  const copyableName = (name) => name.replace(/\s*\[.*$/, "").trim();

  /* ---------- Tema ---------- */
  function initTheme() {
    const saved = localStorage.getItem("cc-theme");
    const prefersLight = window.matchMedia && matchMedia("(prefers-color-scheme: light)").matches;
    document.documentElement.dataset.theme = saved || (prefersLight ? "light" : "dark");
    $("#themeToggle").addEventListener("click", () => {
      const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = next;
      localStorage.setItem("cc-theme", next);
    });
  }

  /* ---------- Navegación ---------- */
  function buildNav() {
    navList.innerHTML = D.views
      .map(
        (v) => `<li><a class="nav__link" href="#/${v.id}" data-view="${v.id}">
          <span class="ico" aria-hidden="true">${esc(v.icon)}</span>${esc(v.label)}</a></li>`
      )
      .join("");
    navToggle.addEventListener("click", () => setMenu(!nav.classList.contains("is-open")));
    navList.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
  }
  function setMenu(open) {
    nav.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
  }
  function markActive(id) {
    $$(".nav__link").forEach((a) => {
      if (a.dataset.view === id) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
  }

  /* ---------- Router ---------- */
  const views = {};
  function parseHash() {
    const raw = location.hash.replace(/^#\/?/, "");
    const [path, query] = raw.split("?");
    const params = new URLSearchParams(query || "");
    return { id: path || "inicio", params };
  }

  function route() {
    const { id, params } = parseHash();
    const render = views[id] || views.inicio;
    const realId = views[id] ? id : "inicio";
    markActive(realId);
    document.body.classList.remove("uc-open");   // por si se salió con el detalle abierto
    viewEl.innerHTML = "";
    viewEl.style.animation = "none"; void viewEl.offsetWidth; viewEl.style.animation = "";
    render(viewEl, params);
    const view = D.views.find((v) => v.id === realId);
    document.title = (view ? view.label + " · " : id === "buscar" ? "Búsqueda · " : "") + "Guía de Claude Code";
    window.scrollTo(0, 0);
    const focus = params.get("focus");
    if (focus) requestAnimationFrame(() => focusItem(focus));
    document.dispatchEvent(new CustomEvent("cc:viewchange", { detail: { id: realId } }));
  }

  /* Enlace profundo: abre, desplaza y resalta el elemento destino (?focus=<id>) */
  function focusItem(id) {
    const target = Array.from(viewEl.querySelectorAll("[data-id]")).find((n) => n.dataset.id === id);
    if (!target) return;
    if (target.tagName === "DETAILS") target.open = true;
    target.scrollIntoView({ block: "center", behavior: "smooth" });
    target.classList.remove("flash");
    void target.offsetWidth;
    target.classList.add("flash");
    target.addEventListener("animationend", () => target.classList.remove("flash"), { once: true });
  }

  /* ---------- Bloques reutilizables ---------- */
  function pageHead(title, text) {
    return `<div class="page-head"><h1>${esc(title)}</h1><p>${esc(text)}</p></div>`;
  }

  function itemHTML(it, q, opts = {}) {
    const name = esc(it.name);
    const hasBody = it.tip || it.example || it.longDesc;
    const nameHTML = q ? highlight(it.name, q) : name;
    const inner = `
        <span class="item__name">${nameHTML}</span>
        <span class="item__desc">${q ? highlight(it.desc, q) : esc(it.desc)}</span>
        <span class="item__meta">
          ${it.note ? `<span class="badge badge--accent">${esc(it.note)}</span>` : ""}
          ${opts.showCat && it.cat ? `<span class="badge">${esc(it.cat)}</span>` : ""}
          <button class="copy" data-copy="${esc(copyableName(it.name))}" type="button" aria-label="Copiar ${name}">Copiar</button>
        </span>`;
    const dataId = opts.id ? ` data-id="${esc(opts.id)}"` : "";
    if (!hasBody) {
      return `<div class="item"${dataId}><div class="item__summary" style="cursor:default">${inner}</div></div>`;
    }
    const summary = `<summary class="item__summary">${inner}</summary>`;
    return `<details class="item"${dataId}>${summary}
      <div class="item__body">
        ${it.tip ? `<p><strong>Tip:</strong> ${esc(it.tip)}</p>` : ""}
        ${it.example ? `<div><p><strong>Ejemplo</strong></p><pre class="code"><code>${esc(it.example)}</code></pre></div>` : ""}
      </div></details>`;
  }

  /* Delegación global para los botones "Copiar" */
  document.addEventListener("click", (e) => {
    const b = e.target.closest(".copy");
    if (!b) return;
    e.preventDefault(); e.stopPropagation();
    copyText(b.dataset.copy);
  });

  /* ============================================================
     VISTAS
     ============================================================ */

  /* ----- Inicio ----- */
  views.inicio = function (root) {
    const demo = [
      ['<span class="p">$</span> claude', 0],
      ['<span class="m">✻ Bienvenido a Claude Code</span>', 350],
      ['<span class="p">&gt;</span> arregla el test que falla en @auth.test.ts', 700],
      ['<span class="m">● Read(auth.test.ts)</span>', 1100],
      ['<span class="m">● Bash(npm test)</span>', 1450],
      ['<span class="m">● Edit(src/auth.ts)</span>', 1800],
      ['<span class="ok">✓ Tests pasando (24/24)</span>', 2200]
    ];
    root.innerHTML = `
      <section class="hero">
        <div class="hero__eyebrow">// guía interactiva</div>
        <h1>${esc(D.intro.title)}</h1>
        <p>${esc(D.intro.lead)}</p>
        <div class="terminal" aria-hidden="true">
          <div class="terminal__bar"><i></i><i></i><i></i></div>
          <div class="terminal__body" id="termBody"></div>
        </div>
      </section>
      <h2 class="section-title">Explora por categoría</h2>
      <div class="cards">
        ${D.intro.cards.map((c) => `
          <a class="card" href="#/${c.view}">
            <h3>${esc(c.title)}</h3><p>${esc(c.text)}</p><span class="arrow">abrir →</span>
          </a>`).join("")}
      </div>
      <div class="note">💬 ¿Dudas? Usa el asistente de IA en la esquina inferior derecha: responde preguntas sobre Claude Code.</div>`;

    const body = $("#termBody", root);
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timers = [];
    demo.forEach(([html, delay]) => {
      const show = () => {
        if (!body.isConnected) return;
        const p = document.createElement("p");
        p.className = "terminal__line";
        p.innerHTML = html;
        const old = body.querySelector(".caret");
        if (old) old.remove();
        body.appendChild(p);
      };
      reduce ? show() : timers.push(setTimeout(show, delay));
    });
    if (!reduce) timers.push(setTimeout(() => {
      if (body.isConnected) body.insertAdjacentHTML("beforeend", '<span class="caret"></span>');
    }, 2300));
  };

  /* ----- Cómo funciona ----- */
  views["como-funciona"] = function (root) {
    root.innerHTML = `
      ${pageHead("Cómo funciona", "Claude Code no solo responde: actúa en bucle. Observa tu proyecto, usa herramientas y verifica el resultado hasta completar la tarea.")}
      <h2 class="section-title">El ciclo agéntico</h2>
      <div class="loop" data-id="loop">
        ${D.loop.map((s) => `<div class="loop__step"><div class="loop__num">${esc(s.step)}</div><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></div>`).join("")}
      </div>
      <div class="loop__back">↺ si la tarea no está terminada, vuelve al paso 3</div>

      <h2 class="section-title">Herramientas que usa</h2>
      <div class="list-grid">
        ${D.tools.map((t) => `<div class="tool" data-id="${CCLinks.entryId("tool", t.name)}"><code>${esc(t.name)}</code><span>${esc(t.desc)}</span></div>`).join("")}
      </div>

      <h2 class="section-title">Conceptos clave</h2>
      <div class="cards">
        ${D.concepts.map((c) => `<div class="card" data-id="${CCLinks.entryId("concept", c.title)}"><h3>${esc(c.title)}</h3><p>${esc(c.text)}</p></div>`).join("")}
      </div>`;
  };

  /* ----- Casos de uso ----- */
  views.casos = function (root, params) {
    const intro = D.useCaseIntro;
    const state = { biz: "Todos", type: "Todos", q: "" };
    const levelDots = { Básico: 1, Intermedio: 2, Avanzado: 3 };
    const dots = (lvl) => "●".repeat(levelDots[lvl] || 1) + "○".repeat(3 - (levelDots[lvl] || 1));
    const ucId = (u) => CCLinks.entryId("uc", u.title);

    root.innerHTML = `
      ${pageHead(intro.title, intro.lead)}
      <ol class="uc-steps">
        ${intro.steps.map((s) => {
          const e = CCLinks.byId(s.link);
          return `<li><span class="uc-steps__n">${esc(s.n)}</span><div><strong>${esc(s.title)}</strong><p>${esc(s.text)}</p>${e ? `<a class="guide-chip" href="${e.href}"><small>${esc(e.kind)}</small> ${esc(e.short || e.label)}</a>` : ""}</div></li>`;
        }).join("")}
      </ol>
      <div class="toolbar"><span class="toolbar__label">Negocio</span><div class="chips" id="ucBiz" role="group" aria-label="Filtrar por negocio"></div></div>
      <div class="toolbar"><span class="toolbar__label">Tipo</span><div class="chips" id="ucType" role="group" aria-label="Filtrar por tipo de proyecto"></div></div>
      <div class="toolbar">
        <input class="filter-input" id="ucFilter" type="search" placeholder="Buscar un caso de uso…" aria-label="Buscar un caso de uso">
        <span class="count" id="ucCount"></span>
      </div>
      <div id="ucList"></div>
      <div class="note">${esc(intro.note)}</div>
      <div class="uc-overlay" id="ucOverlay" hidden><div class="uc-sheet" id="ucSheet" role="dialog" aria-modal="false" aria-labelledby="ucTitle" tabindex="-1"></div></div>`;

    const bizEl = $("#ucBiz", root), typeEl = $("#ucType", root), listEl = $("#ucList", root), countEl = $("#ucCount", root);
    const overlay = $("#ucOverlay", root), sheet = $("#ucSheet", root);
    let lastOpener = null;

    const chips = (arr, active, attr) => ["Todos", ...arr].map((c) => `<button class="chip" type="button" aria-pressed="${c === active}" data-${attr}="${esc(c)}">${esc(c)}</button>`).join("");

    function draw() {
      bizEl.innerHTML = chips(D.useCaseCategories, state.biz, "biz");
      typeEl.innerHTML = chips(D.useCaseTypes, state.type, "type");
      const q = norm(state.q.trim());
      const list = D.useCases.filter((u) =>
        (state.biz === "Todos" || u.cat === state.biz) &&
        (state.type === "Todos" || u.type === state.type) &&
        (!q || norm([u.title, u.summary, u.cat, u.type, u.features.join(" ")].join(" ")).includes(q))
      );
      countEl.textContent = list.length + (list.length === 1 ? " caso de uso" : " casos de uso");
      if (!list.length) { listEl.innerHTML = `<div class="empty">Ningún caso coincide con tu búsqueda. Prueba con otro filtro o pregúntale al asistente de IA qué podrías construir.</div>`; return; }
      listEl.innerHTML = D.useCaseCategories
        .map((cat) => {
          const items = list.filter((u) => u.cat === cat);
          if (!items.length) return "";
          return `<h2 class="section-title">${esc(cat)} <span class="badge">${items.length}</span></h2>
            <div class="uc-grid">${items.map((u) => `
              <div class="uc-card" data-id="${ucId(u)}" role="button" tabindex="0" aria-label="Ver el caso de uso: ${esc(u.title)}">
                <div class="uc-card__top"><span class="badge badge--accent">${esc(u.type)}</span><span class="uc-level" title="Dificultad: ${esc(u.level)}" aria-label="Dificultad: ${esc(u.level)}">${dots(u.level)} <small>${esc(u.level)}</small></span></div>
                <h3>${esc(u.title)}</h3>
                <p>${esc(u.summary)}</p>
                <span class="arrow">Ver detalle →</span>
              </div>`).join("")}</div>`;
        }).join("");
    }

    function open(id, fromEl) {
      const u = D.useCases.find((x) => ucId(x) === id);
      if (!u) return;
      lastOpener = fromEl || null;
      const related = u.related.map((r) => CCLinks.byId(r)).filter(Boolean)
        .map((e) => `<a class="guide-chip" href="${e.href}"><small>${esc(e.kind)}</small> ${esc(e.short || e.label)}</a>`).join("");
      sheet.innerHTML = `
        <button class="uc-close icon-btn" type="button" aria-label="Cerrar detalle">✕</button>
        <div class="uc-badges"><span class="badge badge--accent">${esc(u.type)}</span><span class="badge">${esc(u.cat)}</span><span class="badge">Dificultad: ${esc(u.level)} ${dots(u.level)}</span></div>
        <h2 id="ucTitle">${esc(u.title)}</h2>
        <p class="uc-summary">${esc(u.summary)}</p>
        <h3>Qué obtienes</h3>
        <ul>${u.features.map((f) => `<li>${esc(f)}</li>`).join("")}</ul>
        <div class="uc-cols">
          <div><h3>Lo que necesitarás</h3><ul>${u.needs.map((n) => `<li>${esc(n)}</li>`).join("")}</ul></div>
          <div><h3>Stack sugerido</h3><p>${esc(u.stack)}</p></div>
        </div>
        <h3>Prompt para empezar</h3>
        <pre class="code"><code>${esc(u.prompt)}</code></pre>
        <p><button class="copy" type="button" data-copy="${esc(u.prompt)}">Copiar prompt</button> <span class="uc-hint">Cambia lo que está entre [corchetes] por los datos de tu negocio.</span></p>
        <p class="uc-tip"><strong>Tip:</strong> ${esc(u.tip)}</p>
        ${related ? `<h3>📖 Aprende en la guía lo que necesitas</h3><div class="uc-related">${related}</div>` : ""}`;
      overlay.hidden = false;
      document.body.classList.add("uc-open");
      sheet.scrollTop = 0;
      $(".uc-close", sheet).focus({ preventScroll: true });
      history.replaceState(null, "", "#/casos?focus=" + id);   // enlace compartible, sin recargar la vista
    }

    function close() {
      if (overlay.hidden) return;
      overlay.hidden = true;
      document.body.classList.remove("uc-open");
      history.replaceState(null, "", "#/casos");
      if (lastOpener && lastOpener.isConnected) lastOpener.focus({ preventScroll: true });
    }

    bizEl.addEventListener("click", (e) => { const b = e.target.closest("[data-biz]"); if (b) { state.biz = b.dataset.biz; draw(); } });
    typeEl.addEventListener("click", (e) => { const b = e.target.closest("[data-type]"); if (b) { state.type = b.dataset.type; draw(); } });
    $("#ucFilter", root).addEventListener("input", (e) => { state.q = e.target.value; draw(); });
    listEl.addEventListener("click", (e) => { const c = e.target.closest(".uc-card"); if (c) open(c.dataset.id, c); });
    listEl.addEventListener("keydown", (e) => {
      if ((e.key === "Enter" || e.key === " ") && e.target.classList.contains("uc-card")) { e.preventDefault(); open(e.target.dataset.id, e.target); }
    });
    overlay.addEventListener("click", (e) => { if (e.target === overlay || e.target.closest(".uc-close")) close(); });
    overlay.addEventListener("click", (e) => { if (e.target.closest("a")) { overlay.hidden = true; document.body.classList.remove("uc-open"); } });
    root.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });

    draw();
    const focus = params.get("focus");
    if (focus && focus.startsWith("uc-")) open(focus, $(`.uc-card[data-id="${focus}"]`, root));
  };

  /* ----- Comandos (con filtros) ----- */
  views.comandos = function (root, params) {
    const state = { cat: params.get("cat") || "Todos", q: params.get("q") || "" };
    root.innerHTML = `
      ${pageHead("Comandos /", "Los slash commands controlan la sesión de Claude Code. Escribe / en el prompt para abrir el menú. Haz clic en un comando para ver más detalle.")}
      <div class="toolbar">
        <div class="chips" id="cmdChips" role="group" aria-label="Filtrar por categoría"></div>
      </div>
      <div class="toolbar">
        <input class="filter-input" id="cmdFilter" type="search" placeholder="Filtrar comandos…" aria-label="Filtrar comandos" value="${esc(state.q)}">
        <span class="count" id="cmdCount"></span>
      </div>
      <div class="items" id="cmdItems"></div>
      <div class="note">${esc(D.commandsNote)}</div>`;

    const chipsEl = $("#cmdChips", root), itemsEl = $("#cmdItems", root), countEl = $("#cmdCount", root);
    const cats = ["Todos", ...D.commandCategories];

    function draw() {
      chipsEl.innerHTML = cats.map((c) => `<button class="chip" type="button" aria-pressed="${c === state.cat}" data-cat="${esc(c)}">${esc(c)}</button>`).join("");
      const q = norm(state.q.trim());
      const list = D.commands.filter((c) =>
        (state.cat === "Todos" || c.cat === state.cat) &&
        (!q || norm(c.name + " " + c.desc + " " + (c.tip || "")).includes(q))
      );
      countEl.textContent = list.length + (list.length === 1 ? " comando" : " comandos");
      itemsEl.innerHTML = list.length
        ? list.map((c) => itemHTML(c, state.q.trim(), { showCat: state.cat === "Todos", id: CCLinks.entryId("cmd", copyableName(c.name)) })).join("")
        : `<div class="empty">Sin resultados para “${esc(state.q)}”. Prueba con otra palabra o pregunta al asistente de IA.</div>`;
    }
    chipsEl.addEventListener("click", (e) => {
      const b = e.target.closest(".chip"); if (!b) return;
      state.cat = b.dataset.cat; draw();
    });
    $("#cmdFilter", root).addEventListener("input", (e) => { state.q = e.target.value; draw(); });
    draw();
  };

  /* ----- CLI ----- */
  views.cli = function (root) {
    root.innerHTML = `
      ${pageHead("CLI y flags", "Además de la sesión interactiva, puedes lanzar Claude Code desde la terminal con distintos comandos y opciones, o integrarlo en scripts.")}
      <h2 class="section-title">Comandos de terminal</h2>
      <div class="items">${D.cliCommands.map((c) => itemHTML(c, "", { id: CCLinks.entryId("cli", c.name) })).join("")}</div>
      <h2 class="section-title">Flags útiles</h2>
      <div class="items">${D.cliFlags.map((c) => itemHTML(c, "", { id: CCLinks.entryId("flag", c.name) })).join("")}</div>
      <div class="note">${esc(D.cliNote.replace(/`/g, ""))}</div>`;
  };

  /* ----- Atajos ----- */
  views.atajos = function (root) {
    root.innerHTML = `
      ${pageHead("Atajos de teclado", "Teclas y prefijos que aceleran el trabajo diario dentro de Claude Code.")}
      <div class="items">
        ${D.shortcuts.map((s) => `
          <div class="shortcut" data-id="${CCLinks.keyId(s.keys)}">
            <div class="keys">${s.keys.map((k, i) => (i ? '<span class="plus">+</span>' : "") + `<kbd>${esc(k)}</kbd>`).join("")}</div>
            <p>${esc(s.desc)}${s.example ? ` <code>${esc(s.example)}</code>` : ""}</p>
          </div>`).join("")}
      </div>
      <div class="note">${esc(D.shortcutsNote)}</div>`;
  };

  /* ----- Extensiones (tabs) ----- */
  views.extensiones = function (root, params) {
    let active = params.get("tab") || D.extensions[0].id;
    if (!D.extensions.some((e) => e.id === active)) active = D.extensions[0].id;
    root.innerHTML = `
      ${pageHead("Extensiones", "Claude Code se adapta a tu forma de trabajar: memoria, automatizaciones, integraciones y capacidades reutilizables.")}
      <div class="tabs" role="tablist" id="extTabs">
        ${D.extensions.map((e) => `<button class="tab" role="tab" id="tab-${e.id}" aria-selected="${e.id === active}" aria-controls="extPanel" data-id="${e.id}" tabindex="${e.id === active ? 0 : -1}">${esc(e.title)}</button>`).join("")}
      </div>
      <div id="extPanel" role="tabpanel"></div>`;

    const tabs = $("#extTabs", root), panel = $("#extPanel", root);
    function draw() {
      const e = D.extensions.find((x) => x.id === active);
      $$(".tab", tabs).forEach((t) => {
        const on = t.dataset.id === active;
        t.setAttribute("aria-selected", on); t.tabIndex = on ? 0 : -1;
      });
      panel.setAttribute("aria-labelledby", "tab-" + e.id);
      panel.innerHTML = `<div class="panel">
        <h2>${esc(e.title)} <span class="badge badge--accent">${esc(e.tag)}</span></h2>
        <p class="summary">${esc(e.summary)}</p>
        ${e.points ? `<ul>${e.points.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>` : ""}
        ${e.code ? `<pre class="code"><code>${esc(e.code)}</code></pre><p style="margin-top:10px"><button class="copy" data-copy="${esc(e.code)}" type="button">Copiar ejemplo</button></p>` : ""}
      </div>`;
    }
    tabs.addEventListener("click", (ev) => {
      const b = ev.target.closest(".tab"); if (!b) return;
      active = b.dataset.id; draw();
    });
    tabs.addEventListener("keydown", (ev) => {
      if (ev.key !== "ArrowRight" && ev.key !== "ArrowLeft") return;
      const ids = D.extensions.map((x) => x.id);
      const i = ids.indexOf(active);
      active = ids[(i + (ev.key === "ArrowRight" ? 1 : -1) + ids.length) % ids.length];
      draw(); $(`#tab-${active}`, tabs).focus();
    });
    draw();
  };

  /* ----- Permisos y configuración ----- */
  views.permisos = function (root) {
    root.innerHTML = `
      ${pageHead("Permisos y configuración", "Controla qué puede hacer Claude sin preguntar y dónde se guardan tus preferencias.")}
      <h2 class="section-title">Modos de permiso <span class="badge">Shift+Tab para alternar</span></h2>
      <div class="modes">
        ${D.permissionModes.map((m) => `
          <div class="mode ${m.danger ? "mode--danger" : ""}" data-id="${CCLinks.entryId("mode", m.name)}">
            <code>${esc(m.name)}</code><h3>${esc(m.title)}</h3><p>${esc(m.desc)}</p>
          </div>`).join("")}
      </div>
      <h2 class="section-title">Archivos de configuración</h2>
      <div data-id="settings">
      ${D.settingsFiles.map((s) => `
        <div class="settings-row"><code>${esc(s.path)}</code><span class="badge badge--accent">${esc(s.scope)}</span><p>${esc(s.desc)}</p></div>`).join("")}
      </div>
      <h2 class="section-title">Ejemplo de settings.json</h2>
      <pre class="code"><code>${esc(D.settingsExample)}</code></pre>
      <p style="margin-top:10px"><button class="copy" data-copy="${esc(D.settingsExample)}" type="button">Copiar ejemplo</button></p>
      <div class="note">Las reglas <code>deny</code> tienen prioridad sobre <code>allow</code>. Usa /permissions para verlas y editarlas.</div>`;
  };

  /* ----- Buenas prácticas ----- */
  views.practicas = function (root) {
    root.innerHTML = `
      ${pageHead("Buenas prácticas", "Hábitos que marcan la diferencia entre un resultado mediocre y uno excelente con Claude Code.")}
      <div class="practices">
        ${D.practices.map((p) => `<div class="practice" data-id="${CCLinks.entryId("practice", p.title)}"><div><h3>${esc(p.title)}</h3><p>${esc(p.text)}</p></div></div>`).join("")}
      </div>`;
  };

  /* ----- Búsqueda global ----- */
  views.buscar = function (root, params) {
    const q = (params.get("q") || "").trim();
    const nq = norm(q);
    const match = (...parts) => norm(parts.join(" ")).includes(nq);

    const groups = [
      { title: "Comandos /", view: "comandos", items: D.commands.filter((c) => match(c.name, c.desc, c.tip || "")) },
      { title: "Comandos de terminal", view: "cli", items: D.cliCommands.filter((c) => match(c.name, c.desc)) },
      { title: "Flags", view: "cli", items: D.cliFlags.filter((c) => match(c.name, c.desc)) },
      { title: "Atajos", view: "atajos", items: D.shortcuts.filter((s) => match(s.keys.join(" "), s.desc)).map((s) => ({ name: s.keys.join(" + "), desc: s.desc })) },
      { title: "Casos de uso", view: "casos", items: D.useCases.filter((u) => match(u.title, u.summary, u.cat, u.type)).map((u) => ({ name: u.title, desc: u.summary, note: u.cat })) },
      { title: "Extensiones", view: "extensiones", items: D.extensions.filter((e) => match(e.title, e.summary, (e.points || []).join(" "))).map((e) => ({ name: e.title, desc: e.summary })) },
      { title: "Buenas prácticas", view: "practicas", items: D.practices.filter((p) => match(p.title, p.text)).map((p) => ({ name: p.title, desc: p.text })) }
    ].filter((g) => q && g.items.length);

    const total = groups.reduce((n, g) => n + g.items.length, 0);
    root.innerHTML = `
      ${pageHead(q ? `Resultados para “${q}”` : "Búsqueda", q ? `${total} coincidencia${total === 1 ? "" : "s"} en toda la guía.` : "Escribe algo en el buscador de la barra superior.")}
      ${groups.length
        ? groups.map((g) => `
          <h2 class="section-title">${esc(g.title)} <a class="badge" href="#/${g.view}" style="text-decoration:none">ver sección</a></h2>
          <div class="items">${g.items.map((i) => itemHTML({ name: i.name, desc: i.desc, note: i.note }, q)).join("")}</div>`).join("")
        : `<div class="empty">${q ? "No encontré coincidencias. Prueba con otra palabra o pregunta al asistente de IA." : "Aún no hay búsqueda."}</div>`}`;
  };

  /* ---------- Búsqueda: eventos ---------- */
  let searchTimer;
  searchInput.addEventListener("input", () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      const q = searchInput.value.trim();
      if (q) location.hash = "#/buscar?q=" + encodeURIComponent(q);
      else if (parseHash().id === "buscar") location.hash = "#/inicio";
    }, 220);
  });
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { searchInput.value = ""; searchInput.blur(); }
  });
  document.addEventListener("keydown", (e) => {
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName);
    if ((e.key === "/" && !typing) || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k")) {
      e.preventDefault(); searchInput.focus(); searchInput.select();
    }
  });

  /* ---------- Barra de progreso de lectura ---------- */
  const progress = $("#progress");
  window.addEventListener("scroll", () => {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    progress.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + "%";
  }, { passive: true });

  /* ---------- Arranque ---------- */
  initTheme();
  buildNav();
  window.addEventListener("hashchange", () => {
    route();
    // Mantener el buscador sincronizado con la ruta
    const { id, params } = parseHash();
    if (id !== "buscar") searchInput.value = "";
    else searchInput.value = params.get("q") || "";
  });
  route();

  /* API pública mínima para otros módulos (chat) */
  window.CCApp = {
    getView: () => parseHash().id,
    goTo: (id) => { location.hash = "#/" + id; },
    reroute: route    // re-ejecuta la ruta actual (útil si el enlace apunta a donde ya estás)
  };
})();
