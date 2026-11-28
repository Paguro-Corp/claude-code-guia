/* ============================================================
   Modelos y effort — qué modelo y qué nivel de esfuerzo elegir
   Datos de precios, contexto y niveles de effort: documentación de
   la API de Anthropic (referencia consultada el 2026-11-03).
   Las recomendaciones por tarea (tasks) son una guía práctica
   construida sobre esa documentación; ajústalas con tus resultados.
   Para añadir una tarea o una estrategia basta con agregar un objeto.
   ============================================================ */
(function () {
  "use strict";
  const D = window.CC_DATA;

  D.modelsGuide = {
    title: "Modelos y effort",
    lead: "Elegir bien el modelo y el nivel de effort es la forma más rápida de ahorrar tiempo y consumo sin perder calidad. Aquí ves para qué sirve cada modelo, por qué elegirlo, qué casos de uso resuelve mejor y qué effort usar según lo que necesites.",
    refNote: "Precios en USD por millón de tokens (API de Anthropic), consultados el 2026-11-03. Si usas Claude Code con una suscripción no pagas por token, pero los modelos grandes y el effort alto agotan más rápido tu límite de uso. Confirma lo disponible en tu plan con /model.",

    rules: [
      { n: "1", title: "Empieza barato, sube con motivo", text: "Parte de Sonnet 5.5 con effort medium. Sube solo cuando falle o cuando el riesgo lo justifique.", link: "model-sonnet-5-5" },
      { n: "2", title: "Primero effort, luego modelo", text: "Subir un escalón de effort suele costar menos que saltar al siguiente modelo.", link: "concept-modelo-y-esfuerzo" },
      { n: "3", title: "Haiku para el volumen", text: "Subagentes, lotes y consultas simples: 20 veces más barato que Sonnet 5.5.", link: "model-haiku-5-5" },
      { n: "4", title: "Los grandes, para pensar", text: "Fable y Opus rinden más en planes, bugs difíciles y trabajo largo, no en ediciones mecánicas.", link: "model-fable-5-2" }
    ],

    /* ---------- Modelos ---------- */
    models: [
      {
        id: "fable", name: "Claude Fable 5.2", short: "Fable 5.2", apiId: "claude-fable-5-2", tier: "Máxima capacidad",
        tagline: "El modelo más capaz: razonamiento profundo y trabajo autónomo de larga duración.",
        price: { in: 8, out: 40 }, ctx: "1M tokens", maxOut: "128K", fast: "Sí · $16 / $80", effortDefault: "high", effortStart: "high",
        cmd: "/model",
        why: [
          "Es el más capaz de la familia: resuelve lo que otros modelos dejan a medias o resuelven mal.",
          "Pensado para tareas de largo recorrido: muchos pasos o muchas horas con pocas intervenciones.",
          "Con effort moderado ya iguala a modelos anteriores con effort alto, así que no necesitas subirlo al máximo."
        ],
        useCases: [
          { t: "Refactors y migraciones grandes", d: "Pasar un proyecto a otro framework o reorganizar decenas de archivos manteniendo los tests en verde." },
          { t: "Bugs que nadie encuentra", d: "Fallos intermitentes, condiciones de carrera o errores sin causa clara tras 2-3 intentos con otro modelo." },
          { t: "Agentes autónomos de larga duración", d: "Dejarlo trabajar horas en un módulo completo con un plan aprobado y tests que verifiquen el resultado." },
          { t: "Diseño de arquitectura", d: "Decidir estructura de datos, pagos o seguridad en modo Plan antes de escribir una línea de código." }
        ],
        avoid: [
          "Cambios pequeños, preguntas rápidas o textos: pagas 4 veces el precio de Sonnet 5.5 por el mismo resultado.",
          "Cuando necesitas respuesta inmediata: en tareas difíciles un solo turno puede durar varios minutos."
        ],
        notes: [
          "Su razonamiento está siempre activo: lo único que controlas es el effort. Empieza en high y sube a xhigh solo donde midas una mejora real.",
          "El effort casi no cambia la longitud de la respuesta: si la quieres corta o larga, díselo en el prompt.",
          "No está disponible con retención cero de datos (exige 30 días de retención). Revísalo si tu organización lo requiere."
        ],
        effortMap: {
          low: ["ok", "Tareas rutinarias en las que ya lo usas"],
          medium: ["ok", "Trabajo rutinario con buena calidad base"],
          high: ["rec", "Punto de partida recomendado"],
          xhigh: ["ok", "Solo donde midas una mejora"],
          max: ["rare", "Techo del modelo; casos excepcionales"]
        }
      },
      {
        id: "opus", name: "Claude Opus 5.5", short: "Opus 5.5", apiId: "claude-opus-5-5", tier: "Alto rendimiento",
        tagline: "Código y análisis exigentes a la mitad de precio que Fable.",
        price: { in: 4, out: 20 }, ctx: "1M tokens", maxOut: "128K", fast: "Sí · $8 / $40", effortDefault: "medium", effortStart: "high",
        cmd: "/model opus",
        why: [
          "Gran capacidad en código complejo y razonamiento de varios pasos, con la mitad del precio de Fable 5.2.",
          "Más barato que las generaciones Opus anteriores ($5 / $25 en Opus 5 y 4.x).",
          "Con effort high o xhigh es la opción habitual para coding agéntico difícil sin llegar al techo de costo."
        ],
        useCases: [
          { t: "Funcionalidades en proyectos reales", d: "Cambios que tocan varios archivos y deben respetar el estilo y la arquitectura existentes." },
          { t: "Revisión de código y seguridad", d: "/code-review y /security-review antes de publicar, sobre todo con pagos o datos personales de clientes." },
          { t: "Planes y arquitectura medianos", d: "Modo Plan para decidir el enfoque de una tienda, un funnel o una integración antes de construirla." },
          { t: "Análisis de datos con lógica compleja", d: "Dashboards de ventas e inventario donde los totales deben cuadrar con tus CSV." },
          { t: "Depurar antes de escalar a Fable", d: "Bugs difíciles: prueba Opus con xhigh antes de pagar el modelo más caro." }
        ],
        avoid: [
          "Tareas mecánicas o de alto volumen: Sonnet o Haiku hacen lo mismo más barato.",
          "Effort max por costumbre: sube de a un escalón y comprueba si de verdad mejora."
        ],
        notes: [
          "Su razonamiento no se puede desactivar: para ahorrar, baja el effort en lugar de buscar un modo sin pensar.",
          "Su effort por defecto en la API es medium; para trabajo exigente conviene subirlo a high."
        ],
        effortMap: {
          low: ["ok", "Preguntas y cambios simples"],
          medium: ["ok", "Valor por defecto en la API"],
          high: ["rec", "Código y análisis exigentes"],
          xhigh: ["rec", "Coding agéntico difícil"],
          max: ["rare", "Cuando acertar pesa más que el costo"]
        }
      },
      {
        id: "sonnet", name: "Claude Sonnet 5.5", short: "Sonnet 5.5", apiId: "claude-sonnet-5-5", tier: "Equilibrado",
        tagline: "El caballo de batalla: velocidad y capacidad para el trabajo diario.",
        price: { in: 2, out: 10 }, ctx: "1M tokens", maxOut: "128K", fast: "No", effortDefault: "high", effortStart: "medium",
        cmd: "/model sonnet",
        why: [
          "Rinde bien en la mayoría de las tareas de programación del día a día con un costo contenido.",
          "Cuesta la mitad que Opus 5.5 y una cuarta parte que Fable 5.2.",
          "Con effort medium es el punto de partida recomendado para coding agéntico y tareas de varios pasos."
        ],
        useCases: [
          { t: "Construir webs, tiendas y funnels", d: "Los proyectos de la sección Casos de uso: catálogo, carrito, landing, formularios y paneles." },
          { t: "Corregir bugs con error claro", d: "Un stack trace que apunta a un archivo: leer, corregir y volver a correr el test." },
          { t: "Tests y documentación", d: "Escribir tests unitarios, README y comentarios con un patrón claro y repetible." },
          { t: "Textos de negocio", d: "Descripciones de producto, correos y respuestas a clientes con el tono de tu marca." },
          { t: "Ejecutar el plan de otro modelo", d: "Plan hecho con Opus o Fable en modo Plan; Sonnet lo implementa paso a paso." }
        ],
        avoid: [
          "Problemas de razonamiento muy profundo o de causa desconocida: escala a Opus o Fable.",
          "Volumen masivo de tareas triviales: Haiku es 20 veces más barato."
        ],
        notes: [
          "Sus niveles de effort están recalibrados respecto a Sonnet 5: si vienes de esa versión, vuelve a probar qué nivel te basta.",
          "Para chat y consultas rápidas suele alcanzar con low; para coding agéntico, con medium."
        ],
        effortMap: {
          low: ["ok", "Chat, ediciones y consultas rápidas"],
          medium: ["rec", "Inicio para coding agéntico"],
          high: ["rec", "Valor por defecto de la API"],
          xhigh: ["ok", "Problemas difíciles sin saltar a Opus"],
          max: ["rare", "Rara vez necesario"]
        }
      },
      {
        id: "haiku", name: "Claude Haiku 5.5", short: "Haiku 5.5", apiId: "claude-haiku-5-5", tier: "Rápido y económico",
        tagline: "Muy barato para volumen, subagentes y tareas acotadas.",
        price: { in: 0.1, out: 0.5 }, ctx: "1M tokens", maxOut: "128K", fast: "No", effortDefault: "medium", effortStart: "medium",
        cmd: "/model haiku",
        why: [
          "Es la opción más barata: 20 veces menos que Sonnet 5.5 por token.",
          "Ideal para delegar el trabajo mecánico y reservar presupuesto para los modelos grandes.",
          "Aun así razona (thinking adaptativo), no es solo «respuestas rápidas». Esta guía lo usa en su asistente con effort medium."
        ],
        useCases: [
          { t: "Subagente explorador", d: "Buscar en el código y devolver un resumen sin llenar tu contexto principal." },
          { t: "Procesar muchos archivos con claude -p", d: "Clasificar reseñas, extraer datos de facturas o resumir cientos de logs en un script." },
          { t: "Preguntas frecuentes y chat", d: "Respuestas cortas sobre tu negocio, como hace el asistente de esta guía." },
          { t: "Pequeñas ediciones", d: "Renombrar variables, formatear, cambiar textos o corregir erratas." },
          { t: "Resumir material", d: "Logs, correos, reseñas de clientes o notas de reuniones." }
        ],
        avoid: [
          "Diseño de arquitectura, bugs difíciles o código que toca pagos y seguridad.",
          "Tareas largas de varios pasos donde un error temprano se arrastra hasta el final."
        ],
        notes: [
          "Los precios son para prompts de hasta 100K tokens; por encima suben a $0.50 / $2.50.",
          "Con xhigh o max rara vez compensa: si necesitas más capacidad, cambia de modelo."
        ],
        effortMap: {
          low: ["rec", "Volumen, clasificación y subagentes"],
          medium: ["rec", "Valor por defecto: tareas acotadas"],
          high: ["ok", "Más cuidado en tareas medianas"],
          xhigh: ["rare", "Mejor sube de modelo"],
          max: ["rare", "Mejor sube de modelo"]
        }
      }
    ],

    /* ---------- Niveles de effort ---------- */
    effortLevels: [
      { id: "low", level: 1, tag: "Rápido y barato",
        text: "Piensa poco: menos llamadas a herramientas, menos preámbulo y respuestas más escuetas.",
        use: "Preguntas simples, ediciones mecánicas, subagentes y trabajo en volumen.",
        watch: "Puede saltarse verificaciones. No lo uses cuando un error sea caro." },
      { id: "medium", level: 2, tag: "Equilibrio",
        text: "El escalón de ahorro que, en la mayoría de tareas, mantiene la calidad.",
        use: "Coding agéntico en Sonnet, exploración de código y trabajo diario.",
        watch: "Si notas respuestas superficiales o pasos omitidos, sube a high." },
      { id: "high", level: 3, tag: "Calidad con eficiencia",
        text: "El punto dulce entre calidad y tokens. Es el mínimo recomendado cuando la inteligencia importa.",
        use: "Funcionalidades nuevas, depuración, revisión y planes.",
        watch: "Es el valor por defecto de varios modelos: no siempre hace falta subir más." },
      { id: "xhigh", level: 4, tag: "Coding difícil",
        text: "El mejor ajuste para la mayoría del coding y del trabajo agéntico en modelos de nivel Opus. Según la documentación suele ser el valor por defecto de Claude Code; compruébalo con /effort.",
        use: "Bugs difíciles, refactors y agentes largos en Opus 5.5.",
        watch: "En Fable 5.2 empieza en high y usa xhigh solo donde midas una mejora." },
      { id: "max", level: 5, tag: "Máxima corrección",
        text: "Para cuando acertar importa más que el costo o el tiempo.",
        use: "Casos excepcionales: revisión de seguridad crítica o medir el techo del modelo.",
        watch: "Consume mucho y solo compensa en problemas muy difíciles." }
    ],

    /* ---------- Recomendador por tarea ---------- */
    priorities: [
      { id: "calidad", label: "Máxima calidad", hint: "El resultado importa más que el costo." },
      { id: "equilibrio", label: "Equilibrio", hint: "Buena calidad sin gastar de más." },
      { id: "ahorro", label: "Ahorro", hint: "Lo más barato que aún funciona." }
    ],
    taskCategories: ["Programar", "Depurar y revisar", "Planificar y explorar", "Automatizar", "Negocio y contenido"],
    tasks: [
      /* ---- Programar ---- */
      { title: "Cambio pequeño o consulta rápida", cat: "Programar",
        desc: "Renombrar una variable, cambiar un texto, corregir una errata o preguntar qué hace una función.",
        rec: { calidad: ["sonnet", "medium"], equilibrio: ["sonnet", "low"], ahorro: ["haiku", "low"] },
        why: "Es trabajo mecánico y bien acotado: más razonamiento no mejora el resultado, solo cuesta más.",
        up: "Si el cambio rompe algo inesperado, sube a Sonnet 5.5 con medium." },
      { title: "Nueva funcionalidad en un proyecto existente", cat: "Programar",
        desc: "Añadir un filtro, un formulario o un endpoint que toca varios archivos.",
        rec: { calidad: ["opus", "high"], equilibrio: ["sonnet", "medium"], ahorro: ["sonnet", "low"] },
        why: "Hay que entender el código vecino y respetar su estilo. Sonnet con medium suele bastar y dejas el modelo grande para cuando se atasque.",
        up: "Si falla dos veces o rompe tests, pasa a Sonnet 5.5 con high y después a Opus 5.5." },
      { title: "Construir una web, tienda o funnel desde cero", cat: "Programar",
        desc: "Los proyectos de la sección Casos de uso: tienda online, landing, dashboard.",
        rec: { calidad: ["opus", "high"], equilibrio: ["sonnet", "high"], ahorro: ["sonnet", "medium"] },
        why: "Primero un plan (modo Plan) y luego muchas piezas pequeñas: un buen plan inicial vale más que gastar effort en cada pieza.",
        up: "Haz el plan con Opus 5.5 en high y ejecútalo con Sonnet 5.5." },
      { title: "Refactor o migración grande", cat: "Programar",
        desc: "Cambiar de framework, reorganizar carpetas o actualizar una dependencia mayor en muchos archivos.",
        rec: { calidad: ["fable", "high"], equilibrio: ["opus", "high"], ahorro: ["sonnet", "high"] },
        why: "Exige coherencia entre muchos archivos y mantener los tests en verde durante horas; los errores pequeños se acumulan.",
        up: "Divide el trabajo en etapas con un commit por etapa y verifica cada una con los tests." },
      { title: "Tests y documentación", cat: "Programar",
        desc: "Escribir tests unitarios, un README o comentarios de un módulo.",
        rec: { calidad: ["sonnet", "high"], equilibrio: ["sonnet", "medium"], ahorro: ["haiku", "medium"] },
        why: "Es trabajo repetitivo con un patrón claro. El modelo mediano rinde bien; revisa que los tests prueben comportamiento real.",
        up: "Si los tests salen vacíos o triviales, sube a Sonnet 5.5 con high." },

      /* ---- Depurar y revisar ---- */
      { title: "Bug con error claro", cat: "Depurar y revisar",
        desc: "Un stack trace o mensaje de error que apunta a un archivo y una línea.",
        rec: { calidad: ["sonnet", "high"], equilibrio: ["sonnet", "medium"], ahorro: ["haiku", "medium"] },
        why: "El error ya dice dónde mirar: basta con leer, corregir y volver a ejecutar el test.",
        up: "Si la causa no es la que parece, pasa a la tarea «Bug difícil o intermitente»." },
      { title: "Bug difícil o intermitente", cat: "Depurar y revisar",
        desc: "Falla solo a veces, depende de concurrencia, datos o entorno, y la causa no es evidente.",
        rec: { calidad: ["fable", "high"], equilibrio: ["opus", "xhigh"], ahorro: ["sonnet", "high"] },
        why: "Hay que formular hipótesis, probarlas y descartarlas: justo donde más rinde el razonamiento extra.",
        up: "Pídele que reproduzca el bug con un test antes de intentar arreglarlo." },
      { title: "Revisión de código y de seguridad", cat: "Depurar y revisar",
        desc: "/code-review o /security-review antes de publicar, sobre todo con pagos o datos personales.",
        rec: { calidad: ["opus", "xhigh"], equilibrio: ["opus", "high"], ahorro: ["sonnet", "high"] },
        why: "Un fallo que se escapa cuesta más que el consumo extra: aquí conviene no ahorrar.",
        up: "Con dinero o datos de clientes, añade siempre una revisión humana." },

      /* ---- Planificar y explorar ---- */
      { title: "Plan o arquitectura antes de codificar", cat: "Planificar y explorar",
        desc: "Modo Plan (Shift+Tab): decidir estructura, datos e integraciones antes de tocar código.",
        rec: { calidad: ["fable", "high"], equilibrio: ["opus", "high"], ahorro: ["sonnet", "high"] },
        why: "Un error de diseño se paga después en cada archivo. Planificar es la fase corta donde más rinde el modelo fuerte.",
        up: "Aprobado el plan, cambia con /model a Sonnet 5.5 para ejecutarlo." },
      { title: "Entender un código desconocido", cat: "Planificar y explorar",
        desc: "Explorar un repositorio nuevo, mapear carpetas o encontrar dónde vive una función.",
        rec: { calidad: ["opus", "medium"], equilibrio: ["sonnet", "medium"], ahorro: ["haiku", "medium"] },
        why: "Es mucha lectura y poco razonamiento. Delégala a un subagente con Haiku para no llenar tu contexto.",
        up: "Si el resumen es confuso, repite la pregunta con Sonnet 5.5." },

      /* ---- Automatizar ---- */
      { title: "Subagentes de búsqueda y tareas acotadas", cat: "Automatizar",
        desc: "Un subagente que busca en el código, lista los usos de una función o resume archivos.",
        rec: { calidad: ["sonnet", "low"], equilibrio: ["haiku", "medium"], ahorro: ["haiku", "low"] },
        why: "Hacen una cosa concreta y devuelven un resumen: la velocidad y el costo importan más que el razonamiento profundo.",
        up: "Fija el modelo en el frontmatter del subagente (model: haiku)." },
      { title: "Procesar muchos archivos con claude -p", cat: "Automatizar",
        desc: "Clasificar reseñas, extraer datos de facturas o resumir cientos de logs desde un script.",
        rec: { calidad: ["sonnet", "medium"], equilibrio: ["haiku", "medium"], ahorro: ["haiku", "low"] },
        why: "El volumen multiplica el costo: un modelo barato por elemento ahorra mucho. Prueba con 20 ejemplos antes de lanzar todo.",
        up: "Si falla en los casos ambiguos, sube solo esos casos a Sonnet 5.5." },
      { title: "Agente autónomo de larga duración", cat: "Automatizar",
        desc: "Dejar a Claude trabajando muchos pasos u horas con un plan aprobado y tests que verifican.",
        rec: { calidad: ["fable", "high"], equilibrio: ["opus", "high"], ahorro: ["sonnet", "medium"] },
        why: "Cada error temprano se arrastra durante toda la tarea: cuanto más larga, más compensa un modelo capaz.",
        up: "Dale una forma de verificar (tests, linter) y revisa los diffs al final." },

      /* ---- Negocio y contenido ---- */
      { title: "Textos de tienda, correos y contenido", cat: "Negocio y contenido",
        desc: "Descripciones de productos, respuestas a clientes y textos para redes.",
        rec: { calidad: ["sonnet", "medium"], equilibrio: ["sonnet", "low"], ahorro: ["haiku", "medium"] },
        why: "La calidad de escritura de Sonnet basta casi siempre. Darle tu tono y ejemplos reales importa más que el modelo.",
        up: "Si el tono no te convence, mejora el prompt antes de subir de modelo." },
      { title: "Análisis de datos y dashboards", cat: "Negocio y contenido",
        desc: "Leer CSV de ventas o inventario, calcular métricas y construir un panel.",
        rec: { calidad: ["opus", "high"], equilibrio: ["sonnet", "medium"], ahorro: ["sonnet", "low"] },
        why: "Lo crítico es que los números cuadren: pídele que verifique los totales contra tus datos reales.",
        up: "Si los totales no cuadran, sube a Opus 5.5 con high y pide comprobar una muestra fila por fila." },
      { title: "Cambios críticos: pagos, datos personales, permisos", cat: "Negocio y contenido",
        desc: "Checkout, facturación, inicio de sesión o cualquier cosa que toque dinero o datos de clientes.",
        rec: { calidad: ["fable", "high"], equilibrio: ["opus", "high"], ahorro: ["sonnet", "high"] },
        why: "El costo de un error es alto: es la categoría donde menos conviene ahorrar en modelo o en effort.",
        up: "Revisa el diff tú mismo y pasa /security-review antes de publicar." }
    ],

    /* ---------- Estrategias combinadas ---------- */
    combos: [
      { title: "Planea con el fuerte, ejecuta con el equilibrado",
        text: "Usa el modo Plan (Shift+Tab) con Opus 5.5 o Fable 5.2 en high para decidir el enfoque. Cuando apruebes el plan, cambia con /model a Sonnet 5.5 para ejecutarlo. Pagas el modelo caro solo en la fase corta donde más rinde. Algunas versiones incluyen un alias que automatiza este cambio: revisa /model.",
        code: "# 1. Plan con el modelo fuerte (Shift+Tab hasta modo Plan)\n/model opus\n/effort high\n> Propón un plan para [tu tarea]\n\n# 2. Plan aprobado → modelo equilibrado\n/model sonnet\n/effort medium\n> Ejecuta el plan paso a paso y corre los tests",
        link: "mode-plan" },
      { title: "Primero sube el effort, luego el modelo",
        text: "Si un resultado no te convence: 1) sube un escalón de effort; 2) si sigue fallando, cambia al siguiente modelo; 3) al terminar, vuelve al nivel barato. Cambia una cosa a la vez para saber qué funcionó.",
        link: "cmd-effort" },
      { title: "Un modelo mayor con menos effort",
        text: "En los modelos más nuevos, un effort bajo suele igualar a modelos anteriores con effort alto. Antes de montar cascadas complicadas entre modelos, prueba el modelo más capaz con low o medium en la misma tarea y compara el costo por tarea terminada, no por petición.",
        link: "concept-modelo-y-esfuerzo" },
      { title: "Subagentes baratos para explorar",
        text: "Un subagente con su propio modelo busca y resume sin llenar tu contexto principal. Define el modelo en el frontmatter del archivo del subagente.",
        code: "---\nname: explorador\ndescription: Busca en el código y resume lo que encuentra\ntools: Read, Grep, Glob\nmodel: haiku\n---\nBusca lo que se te pida y responde con un resumen breve citando archivo y línea.",
        link: "ext-subagentes" },
      { title: "Lotes y scripts con modelo barato",
        text: "En trabajos repetitivos, el modelo barato por elemento ahorra mucho. Prueba primero con unos 20 ejemplos y revisa que la calidad sea suficiente antes de lanzar el lote completo.",
        code: "cat resenas.txt | claude -p \"Clasifica cada reseña como positiva, neutra o negativa\" --model haiku",
        link: "cli-claude-p-prompt" },
      { title: "No cambies de modelo a cada rato",
        text: "La caché del contexto es por modelo: cambiar de modelo (y a veces de effort) en mitad de una sesión puede obligar a Claude a releer todo sin descuento. Decide al empezar cada fase de trabajo, no mensaje a mensaje.",
        link: "cmd-model" },
      { title: "Modo rápido cuando esperas cada respuesta",
        text: "/fast acelera la salida del mismo modelo (hasta 2,5 veces) a un precio premium; en Opus 5.5 es el doble del estándar. Úsalo en sesiones interactivas en las que esperas cada respuesta; evítalo en trabajos largos desatendidos o por lotes. Solo funciona en los modelos que lo soportan.",
        link: "cmd-fast" }
    ],

    /* ---------- Cuándo subir o bajar ---------- */
    signals: {
      up: [
        "Las respuestas son superficiales o se salta pasos y verificaciones.",
        "Falló dos veces seguidas en el mismo problema.",
        "La tarea depende de muchas piezas conectadas (muchos archivos o muchas reglas).",
        "Un error sería caro: pagos, datos personales o seguridad.",
        "No sabes qué causa el problema y no hay pista clara."
      ],
      down: [
        "La tarea es mecánica y está bien definida (renombrar, formatear, mover).",
        "Claude piensa mucho para dar una respuesta sencilla.",
        "Haces la misma tarea cientos de veces (lotes y scripts).",
        "Estás en un subagente que solo busca y resume.",
        "Esperas cada respuesta y la calidad actual ya es suficiente."
      ]
    },

    /* ---------- Cómo se cambia ---------- */
    commands: [
      { cmd: "/model", text: "Abre el selector para cambiar de modelo en mitad de la sesión.", link: "cmd-model" },
      { cmd: "/effort", text: "Cambia el nivel de razonamiento (low, medium, high…).", link: "cmd-effort" },
      { cmd: "/fast", text: "Activa o desactiva el modo rápido en los modelos que lo soportan.", link: "cmd-fast" },
      { cmd: "claude --model sonnet", text: "Arranca la sesión directamente con un modelo.", link: "flag-model-modelo" },
      { cmd: "\"model\": \"sonnet\"", text: "Fija el modelo por defecto del proyecto en settings.json.", link: "settings" },
      { cmd: "/cost", text: "Mira cuántos tokens y cuánto costó la sesión para comparar tus elecciones.", link: "cmd-cost" }
    ],

    note: "Las recomendaciones por tarea son una guía práctica: cada proyecto es distinto. Prueba con tu caso real, compara el resultado y el consumo (/cost) y ajusta. Los modelos y niveles disponibles dependen de tu versión y tu plan; /model muestra los tuyos."
  };
})();
