/* ============================================================
   Datos de la guía interactiva de Claude Code
   Toda la información del sitio vive aquí: para añadir un
   comando, flag o atajo solo hay que agregar un objeto.
   ============================================================ */
window.CC_DATA = {
  /* ---------- Navegación principal ---------- */
  views: [
    { id: "inicio",      label: "Inicio",           icon: "◆" },
    { id: "como-funciona", label: "Cómo funciona",  icon: "⟳" },
    { id: "comandos",    label: "Comandos /",       icon: "/" },
    { id: "cli",         label: "CLI y flags",      icon: ">_" },
    { id: "atajos",      label: "Atajos",           icon: "⌘" },
    { id: "extensiones", label: "Extensiones",      icon: "⬡" },
    { id: "permisos",    label: "Permisos",         icon: "⛨" },
    { id: "practicas",   label: "Prácticas",        icon: "★" }
  ],

  /* ---------- Hero / presentación ---------- */
  intro: {
    title: "Entiende Claude Code",
    lead: "Claude Code es un agente de programación que vive en tu terminal (y en IDE, escritorio y web). Lee tu código, edita archivos, ejecuta comandos y trabaja contigo hasta terminar la tarea.",
    cards: [
      { view: "como-funciona", title: "Cómo funciona",   text: "El ciclo agéntico, las herramientas y el contexto." },
      { view: "comandos",      title: "Comandos /",      text: "Todos los slash commands con su descripción." },
      { view: "cli",           title: "CLI y flags",     text: "Lanza Claude Code desde la terminal con opciones." },
      { view: "atajos",        title: "Atajos",          text: "Teclas y prefijos para ir más rápido." },
      { view: "extensiones",   title: "Extensiones",     text: "CLAUDE.md, hooks, MCP, subagentes y skills." },
      { view: "permisos",      title: "Permisos y config", text: "Modos de permiso y archivos settings.json." },
      { view: "practicas",     title: "Buenas prácticas", text: "Flujos de trabajo que dan mejores resultados." }
    ]
  },

  /* ---------- Cómo funciona ---------- */
  loop: [
    { step: "1", title: "Prompt",    text: "Describes la tarea en lenguaje natural." },
    { step: "2", title: "Contexto",  text: "Claude reúne contexto: CLAUDE.md, archivos que lee, historial." },
    { step: "3", title: "Acción",    text: "Elige una herramienta: leer, buscar, editar, ejecutar bash…" },
    { step: "4", title: "Permiso",   text: "Si la acción lo requiere, te pide aprobación." },
    { step: "5", title: "Resultado", text: "Observa la salida y decide: repetir el ciclo o responderte." }
  ],
  tools: [
    { name: "Read",      desc: "Lee archivos (código, imágenes, PDFs, notebooks)." },
    { name: "Edit / Write", desc: "Modifica un archivo con reemplazos exactos o lo crea/sobrescribe." },
    { name: "Glob",      desc: "Encuentra archivos por patrón (por ejemplo **/*.ts)." },
    { name: "Grep",      desc: "Busca texto o regex dentro de los archivos." },
    { name: "Bash",      desc: "Ejecuta comandos de shell: tests, git, builds, scripts." },
    { name: "WebFetch / WebSearch", desc: "Lee páginas web y busca información actual." },
    { name: "Agent",     desc: "Lanza subagentes con su propio contexto para tareas acotadas." },
    { name: "MCP",       desc: "Herramientas externas conectadas por servidores MCP (Slack, GitHub, bases de datos…)." }
  ],
  concepts: [
    { title: "Primeros pasos", text: "Para empezar / comenzar (empiezo, instalar, instalación): instala Claude Code siguiendo la documentación oficial (por ejemplo, `npm install -g @anthropic-ai/claude-code`), abre una terminal en la carpeta de tu proyecto, ejecuta `claude` e inicia sesión. Luego prueba /init para generar un CLAUDE.md y pídele una tarea concreta." },
    { title: "Qué es Claude Code", text: "Es un agente de programación de Anthropic que vive en tu terminal (y en IDE, escritorio y web). Lee tu código, edita archivos, ejecuta comandos y trabaja contigo hasta terminar la tarea." },
    { title: "Ventana de contexto", text: "Es la memoria de trabajo de la sesión. Se llena con mensajes, archivos leídos y salidas de herramientas. Cuando se acerca al límite, usa /compact o /clear." },
    { title: "Sesión", text: "Una conversación continua. Puedes retomarla con /resume o `claude --continue`." },
    { title: "Modelo y esfuerzo", text: "Con /model eliges el modelo y con /effort cuánto razona antes de actuar: más esfuerzo = más calidad, más tokens y más tiempo." },
    { title: "Memoria persistente", text: "Los archivos CLAUDE.md se cargan al inicio de cada sesión y le dan a Claude las reglas y el contexto de tu proyecto." }
  ],

  /* ---------- Slash commands ---------- */
  commandCategories: ["Sesión", "Contexto y costo", "Modelo", "Extensiones", "Revisión y automatización", "Cuenta y diagnóstico"],
  commands: [
    // Sesión
    { name: "/clear",   cat: "Sesión", desc: "Borra el historial y empieza una conversación nueva sin contexto previo.", tip: "Úsalo al cambiar de tarea: contexto irrelevante empeora las respuestas." },
    { name: "/compact [instrucciones]", cat: "Sesión", desc: "Resume la conversación para liberar espacio de contexto sin perder lo esencial.", example: "/compact conserva las decisiones de arquitectura y la lista de archivos modificados" },
    { name: "/resume",  cat: "Sesión", desc: "Muestra sesiones anteriores para retomar una conversación." },
    { name: "/rewind",  cat: "Sesión", desc: "Vuelve a un punto anterior de la conversación y/o del código.", tip: "También con Esc dos veces." },
    { name: "/export",  cat: "Sesión", desc: "Exporta la conversación actual a un archivo o al portapapeles." },
    { name: "/exit",    cat: "Sesión", desc: "Cierra Claude Code." },
    // Contexto y costo
    { name: "/context", cat: "Contexto y costo", desc: "Muestra cuánto de la ventana de contexto está usando cada parte (mensajes, herramientas, memoria)." },
    { name: "/cost",    cat: "Contexto y costo", desc: "Muestra el uso de tokens y el costo de la sesión actual." },
    { name: "/status",  cat: "Contexto y costo", desc: "Muestra el estado actual: versión, modelo, cuenta y conexiones." },
    { name: "/memory",  cat: "Contexto y costo", desc: "Abre y edita los archivos de memoria (CLAUDE.md)." },
    { name: "/init",    cat: "Contexto y costo", desc: "Analiza el proyecto y genera un CLAUDE.md inicial con comandos y convenciones.", tip: "Revisa y recorta el resultado: un CLAUDE.md corto funciona mejor." },
    { name: "/add-dir", cat: "Contexto y costo", desc: "Añade otro directorio al espacio de trabajo de la sesión.", example: "/add-dir ../mi-libreria-compartida" },
    // Modelo
    { name: "/model",   cat: "Modelo", desc: "Cambia el modelo que usa la sesión (por ejemplo Sonnet, Opus o Haiku)." },
    { name: "/effort",  cat: "Modelo", desc: "Ajusta el nivel de esfuerzo de razonamiento (low, medium, high…).", tip: "Más esfuerzo mejora tareas difíciles pero consume más tokens." },
    { name: "/fast",    cat: "Modelo", desc: "Activa o desactiva el modo rápido (salida más veloz en los modelos que lo soportan)." },
    // Extensiones
    { name: "/mcp",     cat: "Extensiones", desc: "Gestiona los servidores MCP conectados: estado, autenticación y herramientas disponibles." },
    { name: "/agents",  cat: "Extensiones", desc: "Crea y administra subagentes especializados." },
    { name: "/hooks",   cat: "Extensiones", desc: "Configura hooks: comandos que se ejecutan automáticamente en eventos del ciclo de vida." },
    { name: "/permissions", cat: "Extensiones", desc: "Revisa y edita las reglas de permisos (allow / ask / deny) de las herramientas." },
    { name: "/config",  cat: "Extensiones", desc: "Abre la configuración interactiva: tema, modelo por defecto, notificaciones, etc." },
    // Revisión y automatización
    { name: "/code-review", cat: "Revisión y automatización", desc: "Revisa los cambios actuales o un PR buscando errores de corrección.", note: "Skill incluida" },
    { name: "/security-review", cat: "Revisión y automatización", desc: "Hace una revisión de seguridad de los cambios pendientes de la rama.", note: "Skill incluida" },
    { name: "/simplify", cat: "Revisión y automatización", desc: "Revisa el código cambiado para reutilizar, simplificar y mejorar eficiencia, y aplica los arreglos.", note: "Skill incluida" },
    { name: "/loop [intervalo] [prompt]", cat: "Revisión y automatización", desc: "Ejecuta un prompt o comando de forma repetida en un intervalo.", example: "/loop 5m /revisar-despliegue", note: "Skill incluida" },
    { name: "/schedule", cat: "Revisión y automatización", desc: "Crea y gestiona tareas programadas en la nube que lanzan un agente con cron.", note: "Skill incluida" },
    // Cuenta y diagnóstico
    { name: "/help",    cat: "Cuenta y diagnóstico", desc: "Muestra la ayuda y la lista de comandos disponibles en tu versión." },
    { name: "/doctor",  cat: "Cuenta y diagnóstico", desc: "Diagnostica la instalación y la configuración de Claude Code." },
    { name: "/login",   cat: "Cuenta y diagnóstico", desc: "Inicia sesión o cambia de cuenta." },
    { name: "/logout",  cat: "Cuenta y diagnóstico", desc: "Cierra la sesión de la cuenta actual." },
    { name: "/ide",     cat: "Cuenta y diagnóstico", desc: "Gestiona la integración con tu IDE (VS Code, JetBrains)." },
    { name: "/vim",     cat: "Cuenta y diagnóstico", desc: "Activa o desactiva el modo de edición Vim en el campo de entrada." }
  ],
  commandsNote: "Los comandos disponibles cambian según la versión, el plan y tus skills/plugins instalados. Escribe /help dentro de Claude Code para ver tu lista real.",

  /* ---------- CLI ---------- */
  cliCommands: [
    { name: "claude", desc: "Inicia una sesión interactiva en el directorio actual.", example: "claude" },
    { name: "claude \"prompt\"", desc: "Inicia una sesión interactiva con un prompt inicial.", example: "claude \"explica la estructura de este proyecto\"" },
    { name: "claude -p \"prompt\"", desc: "Modo no interactivo (print): responde y termina. Ideal para scripts y CI.", example: "claude -p \"resume los cambios de git diff\" --output-format json" },
    { name: "claude -c", desc: "Continúa la conversación más reciente del directorio actual.", example: "claude -c" },
    { name: "claude -r [sesión]", desc: "Retoma una sesión concreta por ID o nombre (o elige de una lista).", example: "claude -r" },
    { name: "claude update", desc: "Actualiza Claude Code a la última versión.", example: "claude update" },
    { name: "claude mcp", desc: "Gestiona servidores MCP desde la terminal (add, list, remove…).", example: "claude mcp list" },
    { name: "cat archivo | claude -p", desc: "Pasa contenido por stdin para que Claude lo procese.", example: "cat error.log | claude -p \"explica este error\"" }
  ],
  cliFlags: [
    { name: "--model <modelo>", desc: "Elige el modelo para la sesión." },
    { name: "--permission-mode <modo>", desc: "Inicia en un modo de permisos (default, acceptEdits, plan…)." },
    { name: "--add-dir <ruta>", desc: "Añade directorios extra al espacio de trabajo." },
    { name: "--allowedTools / --disallowedTools", desc: "Permite o prohíbe herramientas concretas sin preguntar." },
    { name: "--output-format <fmt>", desc: "Formato de salida en modo -p: text, json o stream-json." },
    { name: "--verbose", desc: "Muestra salida detallada para depurar." },
    { name: "--append-system-prompt", desc: "Añade instrucciones al prompt de sistema por defecto." },
    { name: "--version, -v", desc: "Muestra la versión instalada." }
  ],
  cliNote: "Ejecuta `claude --help` para ver todas las opciones de tu versión.",

  /* ---------- Atajos ---------- */
  shortcuts: [
    { keys: ["Esc"], desc: "Interrumpe a Claude mientras trabaja (conservas el contexto)." },
    { keys: ["Esc", "Esc"], desc: "Abre el menú para volver atrás (rewind) en la conversación." },
    { keys: ["Shift", "Tab"], desc: "Cambia entre modos de permiso (normal, aceptar ediciones, plan)." },
    { keys: ["Ctrl", "C"], desc: "Cancela la operación o entrada actual." },
    { keys: ["Ctrl", "D"], desc: "Sale de Claude Code (EOF)." },
    { keys: ["Ctrl", "L"], desc: "Limpia la pantalla de la terminal." },
    { keys: ["↑", "↓"], desc: "Recorre el historial de prompts anteriores." },
    { keys: ["/"], desc: "Al inicio de la línea: abre el menú de slash commands." },
    { keys: ["@"], desc: "Menciona un archivo o carpeta para incluirlo en el contexto.", example: "@src/app.ts" },
    { keys: ["!"], desc: "Al inicio de la línea: ejecuta un comando bash directamente.", example: "!git status" },
    { keys: ["Shift", "Enter"], desc: "Inserta un salto de línea sin enviar (en terminales configuradas con /terminal-setup)." }
  ],
  shortcutsNote: "Algunos atajos dependen de tu terminal y sistema operativo. Revisa /help o /config para confirmar los de tu entorno.",

  /* ---------- Extensiones ---------- */
  extensions: [
    {
      id: "claude-md", title: "CLAUDE.md (memoria)", tag: "Contexto",
      summary: "Archivo Markdown que Claude lee al iniciar cada sesión con las reglas de tu proyecto.",
      points: [
        "Va en la raíz del proyecto (compartido con el equipo) o en ~/.claude/CLAUDE.md (personal, global).",
        "Úsalo para: comandos de build/test, convenciones de código, arquitectura y reglas del repo.",
        "Genéralo con /init y edítalo con /memory. Mantenlo breve y específico."
      ],
      code: "# Mi proyecto\n\n## Comandos\n- Tests: npm test\n- Lint: npm run lint\n\n## Convenciones\n- TypeScript estricto, sin `any`\n- Componentes en src/components"
    },
    {
      id: "hooks", title: "Hooks", tag: "Automatización",
      summary: "Comandos que el propio sistema ejecuta en momentos del ciclo de vida (antes/después de una herramienta, al terminar, etc.).",
      points: [
        "Son deterministas: no dependen de que Claude 'se acuerde' de hacer algo.",
        "Se configuran en settings.json o con /hooks.",
        "Casos típicos: formatear tras editar, bloquear comandos peligrosos, notificar al terminar."
      ],
      code: "{\n  \"hooks\": {\n    \"PostToolUse\": [\n      {\n        \"matcher\": \"Edit|Write\",\n        \"hooks\": [{ \"type\": \"command\", \"command\": \"npx prettier --write $FILE\" }]\n      }\n    ]\n  }\n}"
    },
    {
      id: "mcp", title: "Servidores MCP", tag: "Integraciones",
      summary: "Model Context Protocol: un estándar para conectar Claude a herramientas y datos externos.",
      points: [
        "Añade capacidades: GitHub, Slack, bases de datos, navegadores, Notion, etc.",
        "Se gestionan con `claude mcp add` o con /mcp dentro de la sesión.",
        "Conecta solo servidores de confianza: sus herramientas pueden actuar con tus permisos."
      ],
      code: "claude mcp add --transport http mi-servidor https://ejemplo.com/mcp\nclaude mcp list"
    },
    {
      id: "subagentes", title: "Subagentes", tag: "Delegación",
      summary: "Asistentes especializados con su propio contexto, prompt y herramientas, a los que Claude delega tareas.",
      points: [
        "Mantienen limpio tu contexto principal: solo regresa un resumen.",
        "Se definen como archivos Markdown en .claude/agents/ o con /agents.",
        "Útiles para búsquedas amplias, revisiones y tareas en paralelo."
      ],
      code: "---\nname: revisor\ndescription: Revisa código buscando bugs y problemas de seguridad\ntools: Read, Grep, Glob\n---\nEres un revisor de código estricto. Reporta solo problemas reales con archivo y línea."
    },
    {
      id: "skills", title: "Skills", tag: "Capacidades",
      summary: "Paquetes de instrucciones (y archivos de apoyo) que Claude carga cuando la tarea los necesita.",
      points: [
        "Cada skill es una carpeta con un SKILL.md que describe cuándo y cómo usarla.",
        "Pueden invocarse con /nombre-de-la-skill o activarse automáticamente por su descripción.",
        "Ideales para flujos repetibles: deploys, revisiones, generación de documentos."
      ],
      code: ".claude/skills/desplegar/SKILL.md\n---\nname: desplegar\ndescription: Despliega la app a producción siguiendo la checklist del equipo\n---\n1. Corre los tests\n2. Construye la imagen\n3. ..."
    },
    {
      id: "plugins", title: "Plugins", tag: "Distribución",
      summary: "Paquetes instalables que agrupan comandos, skills, subagentes, hooks y servidores MCP para compartirlos.",
      points: [
        "Permiten distribuir una configuración completa a tu equipo.",
        "Se instalan desde marketplaces o repositorios."
      ]
    }
  ],

  /* ---------- Permisos y configuración ---------- */
  permissionModes: [
    { name: "default",     title: "Normal",             desc: "Pide permiso la primera vez que usa cada herramienta con efectos (editar, bash)." },
    { name: "acceptEdits", title: "Aceptar ediciones",  desc: "Aprueba automáticamente las ediciones de archivos; sigue preguntando por comandos." },
    { name: "plan",        title: "Plan",               desc: "Solo lectura: Claude investiga y propone un plan antes de tocar nada." },
    { name: "bypassPermissions", title: "Sin permisos", desc: "Omite todas las confirmaciones. Úsalo solo en entornos aislados (contenedor/VM).", danger: true }
  ],
  settingsFiles: [
    { path: "~/.claude/settings.json",         scope: "Usuario",  desc: "Tus preferencias globales para todos los proyectos." },
    { path: ".claude/settings.json",           scope: "Proyecto", desc: "Configuración compartida con el equipo (se sube a git)." },
    { path: ".claude/settings.local.json",     scope: "Local",    desc: "Tus ajustes personales del proyecto (no se sube a git)." }
  ],
  settingsExample: "{\n  \"permissions\": {\n    \"allow\": [\"Bash(npm run test:*)\", \"Read(src/**)\"],\n    \"deny\":  [\"Read(.env)\", \"Bash(rm -rf:*)\"]\n  },\n  \"model\": \"sonnet\"\n}",

  /* ---------- Buenas prácticas ---------- */
  practices: [
    { title: "Explora, planifica, luego codifica", text: "Para tareas no triviales usa el modo Plan (Shift+Tab) para que Claude investigue y proponga antes de editar. Aprueba el plan y después ejecuta." },
    { title: "Dale una forma de verificar su trabajo", text: "Incluye tests, un linter o una captura esperada. Claude mejora mucho cuando puede comprobar si lo que hizo funciona." },
    { title: "Sé específico en el prompt", text: "Menciona archivos con @, indica restricciones y el resultado esperado. 'Arregla el bug' rinde menos que 'el login falla con emails en mayúsculas, ver @auth.ts'." },
    { title: "Cuida el contexto", text: "Usa /clear entre tareas no relacionadas y /compact en sesiones largas. Mira /context para ver qué consume espacio." },
    { title: "Mantén CLAUDE.md corto", text: "Solo lo que Claude no puede deducir del código: comandos, convenciones no obvias y reglas del repo." },
    { title: "Delega búsquedas pesadas a subagentes", text: "Les piden explorar mucho código sin llenar tu contexto principal; solo recibes el resumen." },
    { title: "Automatiza lo repetitivo", text: "Hooks para lo que debe pasar siempre, skills para flujos repetibles y modo -p para integrarlo en scripts y CI." },
    { title: "Revisa antes de aceptar", text: "Lee los diffs. Claude puede equivocarse; tú eres el responsable final del código que se integra." }
  ]
};
