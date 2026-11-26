/* ============================================================
   Casos de uso — proyectos que se pueden construir con Claude Code
   Cada caso: negocio (cat), tipo de proyecto, dificultad, qué
   obtienes, qué necesitas, prompt de ejemplo y elementos de la guía
   que conviene aprender (related → ids del catálogo de links.js).
   Para añadir un caso basta con agregar un objeto a `items`.
   ============================================================ */
(function () {
  "use strict";
  const D = window.CC_DATA;

  D.useCaseIntro = {
    title: "Casos de uso",
    lead: "Claude Code no es solo para programadores: puedes pedirle sitios web, embudos de venta, dashboards, herramientas internas y automatizaciones para tu negocio. Estos 20 proyectos son un punto de partida para ver qué es posible. Elige el tuyo, copia el prompt y adáptalo.",
    steps: [
      { n: "1", title: "Pide un plan primero", text: "Describe el objetivo y pídele un plan antes de escribir código (modo Plan).", link: "mode-plan" },
      { n: "2", title: "Dale contexto al proyecto", text: "Con /init genera un CLAUDE.md con las reglas de tu proyecto.", link: "cmd-init" },
      { n: "3", title: "Construye por partes", text: "Pide una pieza a la vez y que verifique que funciona.", link: "practice-dale-una-forma-de-verificar-su-trabajo" },
      { n: "4", title: "Revisa antes de publicar", text: "Lee los cambios; con pagos o datos personales, revisa con más cuidado.", link: "practice-revisa-antes-de-aceptar" }
    ],
    note: "Son ideas de partida. El resultado depende de tus datos, cuentas e integraciones (pasarelas de pago, WhatsApp, email…). Revisa siempre el código antes de publicarlo y ten especial cuidado con pagos y datos personales de clientes."
  };

  D.useCaseCategories = [
    "Ecommerce", "Agencia de marketing", "Negocio de barrio", "Salón de belleza", "Agendamiento de citas",
    "Restaurante y cafetería", "Servicios profesionales", "Educación y creadores", "Finanzas del negocio"
  ];
  D.useCaseTypes = ["Página web", "Sales funnel", "Dashboard", "Automatización", "App o herramienta"];

  D.useCases = [
    /* ---------------- Ecommerce ---------------- */
    {
      title: "Tienda online con catálogo, carrito y checkout",
      cat: "Ecommerce", type: "Página web", level: "Intermedio",
      summary: "Una tienda completa: catálogo con filtros, ficha de producto, carrito persistente y checkout conectado a una pasarela en modo de pruebas.",
      features: [
        "Catálogo con búsqueda, categorías y filtros por precio",
        "Carrito que se conserva al recargar la página",
        "Checkout con pasarela de pagos en modo de pruebas (Stripe, Mercado Pago…)",
        "Diseño adaptado a celular"
      ],
      needs: ["Cuenta en la pasarela de pagos (claves de prueba para empezar)", "Datos y fotos de tus productos (CSV o JSON)"],
      stack: "HTML, CSS y JavaScript + un pequeño servidor Node para el checkout",
      prompt: "Quiero una tienda online para vender [tus productos]. Primero propón un plan (páginas, datos y estructura de carpetas) y espera mi aprobación. Después construye el catálogo leyendo products.json, un carrito persistente en localStorage y una página de checkout conectada a Stripe en modo de pruebas. Que sea responsive y accesible. Al terminar, ejecuta el proyecto y verifica el flujo completo de compra.",
      tip: "Empieza con 5 productos de prueba; cuando todo funcione, cargas el catálogo real.",
      related: ["mode-plan", "cmd-init", "cmd-security-review"]
    },
    {
      title: "Dashboard de ventas e inventario",
      cat: "Ecommerce", type: "Dashboard", level: "Intermedio",
      summary: "Un panel que lee tus exportaciones (CSV de Shopify, WooCommerce o Excel) y muestra ventas, productos estrella y stock por reponer.",
      features: [
        "Ventas por día, semana y mes",
        "Top de productos y categorías",
        "Alertas de stock bajo",
        "Filtros por rango de fechas y canal"
      ],
      needs: ["Una exportación de tus ventas y otra de tu inventario (CSV)"],
      stack: "HTML + JavaScript, con gráficos propios o una librería ligera",
      prompt: "Tengo ventas.csv e inventario.csv en esta carpeta. Léelos, explícame qué columnas hay y propón qué métricas mostrar. Luego construye un dashboard en un solo index.html con ventas por periodo, top 10 de productos y una tabla de stock bajo (menos de 5 unidades). Incluye filtro por rango de fechas y verifica con mis datos reales que los totales cuadran.",
      tip: "Si tu plataforma ofrece un servidor MCP, Claude puede consultar los datos directamente en lugar de usar CSV.",
      related: ["key-at", "ext-mcp", "tool-read"]
    },
    {
      title: "Sales funnel de lanzamiento de producto",
      cat: "Ecommerce", type: "Sales funnel", level: "Intermedio",
      summary: "El recorrido completo para lanzar un producto: landing de captación, página de oferta y página de gracias con el siguiente paso.",
      features: [
        "Landing con propuesta de valor, prueba social y formulario",
        "Página de oferta con cuenta regresiva",
        "Página de gracias y borradores de correos de bienvenida",
        "Registro de leads para medir cada etapa"
      ],
      needs: ["Un servicio de email o CRM para guardar los contactos (o un CSV para empezar)"],
      stack: "HTML/CSS/JS + un endpoint Node que recibe los formularios",
      prompt: "Crea un sales funnel para lanzar [producto]: 1) landing con formulario de email, 2) página de oferta con cuenta regresiva de 48 h contadas desde el registro de cada persona, 3) página de gracias. Guarda los registros en leads.csv. Escribe 3 correos de bienvenida en /emails. Usa textos honestos, sin escasez falsa.",
      tip: "La cuenta regresiva debe ser real (por persona), no un reloj que se reinicia: es más ético y genera más confianza.",
      related: ["mode-plan", "practice-se-especifico-en-el-prompt", "cmd-clear"]
    },

    /* ---------------- Agencia de marketing ---------------- */
    {
      title: "Landing pages por cliente desde una plantilla",
      cat: "Agencia de marketing", type: "Página web", level: "Básico",
      summary: "Una plantilla de landing que se rellena con los datos de cada cliente y genera páginas listas para publicar en minutos.",
      features: [
        "Una plantilla y un archivo JSON por cliente (colores, textos, logo)",
        "Genera todas las landings con un solo comando",
        "Secciones intercambiables: beneficios, testimonios, preguntas frecuentes",
        "SEO básico y metaetiquetas incluidos"
      ],
      needs: ["Logos, colores y textos de cada cliente"],
      stack: "HTML + un script de Node que genera las páginas",
      prompt: "Construye una plantilla de landing page en /template y un script build.js que, leyendo /clients/*.json (nombre, colores, textos, logo), genere /dist/<cliente>/index.html por cada cliente. Crea 2 clientes de ejemplo. Verifica que ambas páginas se vean bien en celular y en escritorio.",
      tip: "Cuando el flujo funcione, conviértelo en una skill para repetirlo con cada cliente nuevo.",
      related: ["cmd-init", "ext-claude-md", "ext-skills"]
    },
    {
      title: "Reporte mensual de campañas",
      cat: "Agencia de marketing", type: "Dashboard", level: "Intermedio",
      summary: "Convierte las exportaciones de Meta Ads o Google Ads en un reporte visual por cliente: inversión, resultados, costo por resultado y comparativa.",
      features: [
        "Importa los CSV de las plataformas de anuncios",
        "KPIs y comparativa contra el mes anterior",
        "Gráficos de tendencia por campaña",
        "Reporte HTML imprimible (PDF desde el navegador)"
      ],
      needs: ["Exportaciones CSV de tus campañas"],
      stack: "HTML + JavaScript, o un script de Node que genera el reporte",
      prompt: "En /datos hay exportaciones CSV de campañas de Meta Ads de dos meses. Analízalas, explícame qué métricas hay y construye un reporte HTML imprimible con inversión, resultados, costo por resultado, comparativa mensual y las 3 campañas con mejor y peor desempeño. No inventes datos: si falta una métrica, dilo.",
      tip: "Con claude -p puedes lanzar la generación del reporte desde un script cada mes.",
      related: ["cli-claude-p-prompt", "tool-read", "ext-mcp"]
    },
    {
      title: "Calendario de contenidos y briefs",
      cat: "Agencia de marketing", type: "App o herramienta", level: "Básico",
      summary: "Una herramienta para planear publicaciones por semana y generar briefs claros para tu equipo creativo.",
      features: [
        "Calendario mensual con filtros por red social y cliente",
        "Plantilla de brief: objetivo, público, formato y llamada a la acción",
        "Estados: idea, en producción, aprobado, publicado",
        "Exporta a CSV o Markdown"
      ],
      needs: ["Tus redes y formatos habituales para configurar las plantillas"],
      stack: "HTML + JavaScript, datos en el navegador (localStorage) o en un JSON",
      prompt: "Crea una herramienta web de calendario de contenidos: vista mensual, tarjetas por publicación (cliente, red social, formato, estado, fecha) y un botón que genere el brief en Markdown con objetivo, público, mensaje clave y CTA. Guarda los datos en localStorage y permite exportar a CSV.",
      tip: "Pide primero una versión mínima y luego añade filtros y estados: es más fácil de revisar.",
      related: ["mode-plan", "practice-se-especifico-en-el-prompt", "cmd-compact"]
    },
    {
      title: "Portal del cliente con estado de entregables",
      cat: "Agencia de marketing", type: "App o herramienta", level: "Avanzado",
      summary: "Un espacio donde cada cliente ve el avance de sus entregables, aprueba piezas y deja comentarios.",
      features: [
        "Acceso por cliente (enlace mágico o contraseña)",
        "Lista de entregables con estado y fecha",
        "Aprobación con un clic y comentarios",
        "Panel interno para la agencia"
      ],
      needs: ["Hosting con servidor y base de datos (SQLite basta para empezar)", "Servicio de email para los accesos"],
      stack: "Node.js + SQLite + HTML/JS",
      prompt: "Diseña y construye un portal de clientes para una agencia. Primero entrégame un plan con modelo de datos, pantallas y riesgos de seguridad, y espera mi aprobación. Luego implementa: login por enlace mágico, lista de entregables por cliente, aprobación y comentarios, y un panel interno. Incluye pruebas del flujo de aprobación.",
      tip: "Al manejar accesos de clientes, ejecuta /security-review antes de publicar.",
      related: ["mode-plan", "ext-subagentes", "cmd-security-review"]
    },

    /* ---------------- Negocio de barrio ---------------- */
    {
      title: "Catálogo digital con pedidos por WhatsApp",
      cat: "Negocio de barrio", type: "Página web", level: "Básico",
      summary: "Un catálogo de tus productos del día a día que los vecinos abren desde el celular y envían su pedido armado por WhatsApp.",
      features: [
        "Productos por categoría con precio y disponibilidad",
        "Carrito que genera el mensaje del pedido",
        "Botón que abre WhatsApp con el detalle y el total",
        "Cambias precios editando un solo archivo"
      ],
      needs: ["Tu lista de productos y precios", "Tu número de WhatsApp"],
      stack: "Un index.html + productos.json (sin servidor)",
      prompt: "Soy dueño de una tienda de barrio. Crea un catálogo web pensado para celular que lea mis productos de productos.json (nombre, precio, categoría, disponible). Los clientes arman su pedido y un botón abre WhatsApp con el mensaje listo (número: XXXXXXXXXX) con el detalle y el total. Letra grande y botones fáciles de tocar. Explícame paso a paso cómo actualizar precios.",
      tip: "Pídele que te explique cómo editar productos.json sin romperlo: así no dependes de nadie para actualizar precios.",
      related: ["cmd-init", "key-at", "practice-se-especifico-en-el-prompt"]
    },
    {
      title: "Control de inventario con alertas de bajo stock",
      cat: "Negocio de barrio", type: "App o herramienta", level: "Básico",
      summary: "Una herramienta sencilla para registrar entradas y salidas de mercancía y saber qué comprar antes de que se acabe.",
      features: [
        "Registro de entradas y salidas por producto",
        "Alerta de productos por agotarse",
        "Productos más vendidos de la semana",
        "Funciona sin internet, con datos guardados en tu equipo"
      ],
      needs: ["Tu lista de productos y el stock actual"],
      stack: "HTML + JavaScript, datos en el navegador o en un archivo",
      prompt: "Crea una app web de inventario para una tienda de víveres: tabla de productos con stock y stock mínimo, botones rápidos para registrar entrada y salida, y una sección 'Por comprar' con lo que está bajo el mínimo. Guarda todo en localStorage, permite exportar/importar un respaldo en JSON y que se use bien desde el celular.",
      tip: "Pide siempre la función de respaldo: si los datos viven en el navegador, borrarlo borra el inventario.",
      related: ["cmd-init", "mode-plan", "practice-dale-una-forma-de-verificar-su-trabajo"]
    },
    {
      title: "Libro de fiado y cuentas por cobrar",
      cat: "Negocio de barrio", type: "App o herramienta", level: "Básico",
      summary: "Reemplaza el cuaderno del fiado: saldo por cliente, compras a crédito, abonos y recordatorios listos para enviar.",
      features: [
        "Ficha por cliente con su saldo actual",
        "Registro de compras a crédito y abonos",
        "Lista de quién debe más y desde cuándo",
        "Mensaje de recordatorio listo para copiar"
      ],
      needs: ["Tu lista de clientes con sus saldos actuales"],
      stack: "HTML + JavaScript, datos locales",
      prompt: "Construye una app web para llevar el fiado de una tienda: clientes con saldo, registrar compra a crédito y abono, historial por cliente y una lista ordenada por quién debe más y hace más tiempo. Agrega un botón que copie un mensaje amable de recordatorio con el saldo. Guarda en localStorage con respaldo exportable.",
      tip: "Son datos de personas: guárdalos solo en tu equipo, haz copias de seguridad y no los publiques en internet.",
      related: ["cmd-init", "mode-plan", "cmd-security-review"]
    },

    /* ---------------- Salón de belleza ---------------- */
    {
      title: "Sitio web del salón con servicios y reservas",
      cat: "Salón de belleza", type: "Página web", level: "Básico",
      summary: "Un sitio elegante con tus servicios, precios, galería de trabajos y un botón para reservar tu cita en segundos.",
      features: [
        "Servicios con precio y duración",
        "Galería de trabajos y reseñas de clientas",
        "Botón de reserva por WhatsApp o enlace a tu agenda",
        "Mapa, horarios y redes sociales"
      ],
      needs: ["Fotos de tus trabajos", "Lista de servicios con precios", "Tus datos de contacto"],
      stack: "HTML, CSS y JavaScript (un sitio estático)",
      prompt: "Crea el sitio web de mi salón de belleza [nombre], con estilo elegante y colores [tus colores]. Secciones: inicio, servicios (leídos de servicios.json con precio y duración), galería, reseñas, horarios con mapa y un botón 'Reservar por WhatsApp' (número: XXXXXXXXXX). Optimizado para celular y con buen rendimiento. Primero muéstrame el plan.",
      tip: "Pega tus fotos en una carpeta y menciónala con @ para que Claude las use en la galería.",
      related: ["mode-plan", "key-at", "cmd-init"]
    },
    {
      title: "Tarjeta de fidelización digital",
      cat: "Salón de belleza", type: "App o herramienta", level: "Básico",
      summary: "Una tarjeta de sellos digital: cada visita suma un sello y al completar la tarjeta la clienta recibe su premio.",
      features: [
        "Sellos por visita y premio al completar",
        "Código QR por clienta",
        "Pantalla para que tú sumes sellos",
        "Aviso de promociones y cumpleaños"
      ],
      needs: ["Definir tu regla de premios (por ejemplo, cada 8 visitas)"],
      stack: "HTML + JavaScript con almacenamiento local o un servidor Node sencillo",
      prompt: "Crea una tarjeta de fidelización digital para mi salón: cada clienta tiene una tarjeta con 8 sellos y un código QR. Haz una pantalla de administración donde yo escaneo o busco a la clienta y sumo un sello, y una vista de la clienta donde ve su progreso y su premio. Guarda los datos en un archivo JSON y explícame cómo hacer respaldo.",
      tip: "Empieza con un solo premio y una sola regla; las promociones por cumpleaños se agregan después.",
      related: ["mode-plan", "cmd-init", "cmd-compact"]
    },

    /* ---------------- Agendamiento de citas ---------------- */
    {
      title: "Sistema de reservas con calendario y disponibilidad",
      cat: "Agendamiento de citas", type: "App o herramienta", level: "Avanzado",
      summary: "Tu propia agenda online: el cliente elige servicio, profesional y horario libre, y tú gestionas las citas desde un panel.",
      features: [
        "Horarios por profesional y duración por servicio",
        "Evita dobles reservas",
        "Confirmación por email",
        "Panel para ver, mover y cancelar citas"
      ],
      needs: ["Servicio de email (SMTP) para las confirmaciones", "Hosting con servidor y base de datos"],
      stack: "Node.js + SQLite + HTML/JS",
      prompt: "Construye un sistema de reservas para [tipo de negocio]. Primero propón el modelo de datos (servicios, profesionales, horarios, citas) y el flujo del cliente, y espera mi aprobación. Luego implementa la vista pública para reservar, la prevención de dobles reservas, el envío de confirmaciones por email y un panel de administración. Escribe pruebas para la lógica de disponibilidad.",
      tip: "La lógica de disponibilidad es lo más delicado: pide pruebas automáticas para zonas horarias y citas que se traslapan.",
      related: ["mode-plan", "ext-hooks", "cmd-security-review"]
    },
    {
      title: "Recordatorios y reprogramación de citas",
      cat: "Agendamiento de citas", type: "Automatización", level: "Intermedio",
      summary: "Avisos automáticos antes de cada cita, con enlace para confirmar o reprogramar, para ayudar a reducir las inasistencias.",
      features: [
        "Recordatorio 24 horas y 2 horas antes",
        "Enlace para confirmar o reprogramar",
        "Lista de espera cuando se libera un cupo",
        "Registro de quién confirmó y quién no"
      ],
      needs: ["Un canal de envío (email o proveedor de WhatsApp Business) y sus credenciales", "Tu agenda en un formato legible (CSV, hoja de cálculo o base de datos)"],
      stack: "Script de Node programado + plantillas de mensajes",
      prompt: "Lee citas.csv (cliente, contacto, servicio, fecha, hora) y crea un script de Node que, ejecutado cada hora, envíe recordatorios 24 h y 2 h antes por email usando plantillas en /mensajes. Incluye enlace para confirmar o reprogramar, un modo de prueba que solo imprime los mensajes sin enviarlos y un registro de lo enviado.",
      tip: "Prueba siempre en modo simulación antes de enviar mensajes reales a clientes.",
      related: ["cmd-schedule", "cmd-loop", "cli-claude-p-prompt"]
    },

    /* ---------------- Restaurante y cafetería ---------------- */
    {
      title: "Menú digital con QR y pedido por mesa",
      cat: "Restaurante y cafetería", type: "Página web", level: "Intermedio",
      summary: "Un menú que se abre al escanear el QR de la mesa, con fotos, alérgenos y un pedido que llega a la cocina.",
      features: [
        "Menú por categorías con fotos, precios y alérgenos",
        "QR distinto por mesa",
        "Pedido enviado a una pantalla de cocina",
        "Marca platos agotados al instante"
      ],
      needs: ["Tu carta con precios y fotos", "Un dispositivo (tablet o PC) para la pantalla de cocina"],
      stack: "HTML/JS + servidor Node con actualizaciones en vivo",
      prompt: "Crea un menú digital para mi restaurante leyendo menu.json (categorías, platos, precio, foto, alérgenos). Cada mesa tiene un QR (?mesa=N). El cliente arma el pedido y lo envía a una pantalla de cocina (/cocina) que muestra los pedidos nuevos en tiempo real y permite marcarlos como listos. Genera también los QR de las mesas 1 a 10.",
      tip: "Empieza solo con el menú digital y deja el pedido por mesa para una segunda fase.",
      related: ["mode-plan", "ext-subagentes", "cmd-init"]
    },
    {
      title: "Dashboard de ventas del día y platos más vendidos",
      cat: "Restaurante y cafetería", type: "Dashboard", level: "Básico",
      summary: "Un panel que convierte el reporte de tu caja registradora en ventas por hora, platos estrella y días fuertes de la semana.",
      features: [
        "Ventas por hora y por día de la semana",
        "Platos y bebidas más vendidos",
        "Ticket promedio",
        "Comparativa entre semanas"
      ],
      needs: ["La exportación de ventas de tu caja o punto de venta (CSV)"],
      stack: "HTML + JavaScript (un solo archivo)",
      prompt: "Tengo ventas.csv exportado de mi punto de venta. Analízalo, dime qué columnas hay y construye un dashboard en un solo index.html con ventas por hora, por día de la semana, top 10 de platos y ticket promedio, con comparación entre semanas. Verifica con mis datos que los totales coinciden con el CSV.",
      tip: "Pide que el dashboard explique en una frase cada gráfico: facilita decidir qué hacer con la información.",
      related: ["key-at", "tool-read", "practice-dale-una-forma-de-verificar-su-trabajo"]
    },

    /* ---------------- Servicios profesionales ---------------- */
    {
      title: "Sales funnel para captar clientes con un quiz",
      cat: "Servicios profesionales", type: "Sales funnel", level: "Intermedio",
      summary: "Landing con un quiz de diagnóstico que clasifica al prospecto, le da un resultado personalizado y lo invita a agendar una llamada.",
      features: [
        "Landing con una promesa clara",
        "Quiz de 5 a 7 preguntas que califica al prospecto",
        "Resultado personalizado y llamada a la acción para agendar",
        "Lista de leads con su puntuación"
      ],
      needs: ["Definir tus tipos de cliente y las preguntas del diagnóstico", "Un enlace a tu agenda (por ejemplo, un calendario online)"],
      stack: "HTML/CSS/JS + endpoint Node para guardar los leads",
      prompt: "Soy [consultor/coach/abogado/contador]. Crea un funnel: landing con promesa clara → quiz de 6 preguntas (en quiz.json) que puntúa al prospecto en 3 perfiles → página de resultado personalizada con botón para agendar una llamada [enlace]. Guarda cada respuesta con nombre y email en leads.csv. Primero propón el plan y el copy.",
      tip: "Escribe tú el diagnóstico (las preguntas y los perfiles): es lo que da valor; Claude se encarga de la técnica.",
      related: ["mode-plan", "practice-se-especifico-en-el-prompt", "cmd-compact"]
    },
    {
      title: "Propuestas y cotizaciones automáticas",
      cat: "Servicios profesionales", type: "Automatización", level: "Intermedio",
      summary: "Rellenas un formulario con los datos del cliente y los servicios, y obtienes una propuesta con tu marca lista para enviar.",
      features: [
        "Formulario con datos del cliente y servicios elegidos",
        "Propuesta en HTML imprimible o PDF con tu marca",
        "Cálculo de precios, descuentos e impuestos",
        "Historial de cotizaciones enviadas"
      ],
      needs: ["Tu lista de servicios con precios", "Tu logo y colores", "Un ejemplo de propuesta que ya uses"],
      stack: "Node.js + plantillas HTML",
      prompt: "Mira @propuesta-ejemplo.pdf y crea una herramienta que, con un formulario (cliente, servicios de servicios.json, descuento), genere una propuesta en HTML imprimible con mi logo y condiciones, calcule subtotal, descuento e impuestos, y guarde un historial en cotizaciones.json. Que se pueda abrir desde el navegador sin instalar nada más.",
      tip: "Si repites esta tarea cada semana, conviértela en una skill para generar propuestas con un solo comando.",
      related: ["key-at", "cli-claude-p-prompt", "ext-skills"]
    },

    /* ---------------- Educación y creadores ---------------- */
    {
      title: "Mini-sitio de un curso con página de venta y área de alumnos",
      cat: "Educación y creadores", type: "Sales funnel", level: "Avanzado",
      summary: "Todo lo necesario para vender un curso: página de venta, pago y un área privada con lecciones y progreso.",
      features: [
        "Página de venta con temario y preguntas frecuentes",
        "Pago con pasarela (en modo de pruebas al desarrollar)",
        "Área privada con lecciones en video y progreso",
        "Certificado descargable al terminar"
      ],
      needs: ["Cuenta en una pasarela de pagos", "Tus videos alojados en un servicio de video", "Hosting con servidor y base de datos"],
      stack: "Node.js + SQLite + HTML/JS",
      prompt: "Construye un sitio para vender mi curso [tema]. Primero entrégame un plan por fases (página de venta, pago, área de alumnos, certificado) con riesgos y qué cuentas necesito, y espera mi aprobación. Después implementa la fase 1 (página de venta desde curso.json) y verifícala. Avanzaremos fase por fase.",
      tip: "Trabajar por fases mantiene el contexto limpio: usa /clear entre fases y deja las decisiones en el CLAUDE.md.",
      related: ["mode-plan", "cmd-clear", "ext-claude-md"]
    },

    /* ---------------- Finanzas del negocio ---------------- */
    {
      title: "Dashboard de finanzas del negocio",
      cat: "Finanzas del negocio", type: "Dashboard", level: "Básico",
      summary: "Ingresos, gastos y flujo de caja en un solo panel, a partir del extracto de tu banco o de tu hoja de cálculo.",
      features: [
        "Ingresos y gastos por mes y por categoría",
        "Flujo de caja y saldo acumulado",
        "Gastos fijos frente a variables",
        "Clasificación de movimientos con reglas que tú defines"
      ],
      needs: ["Un extracto bancario o una hoja de cálculo exportada a CSV"],
      stack: "HTML + JavaScript; los datos se procesan en tu equipo",
      prompt: "Tengo movimientos.csv con el extracto de mi cuenta. Revísalo y propón categorías de gasto. Luego crea un dashboard en un solo index.html con ingresos y gastos por mes, gastos por categoría, flujo de caja acumulado y una tabla de movimientos sin clasificar. Todo debe procesarse localmente, sin enviar datos a ningún servicio.",
      tip: "Es una herramienta de organización, no asesoría contable ni financiera. Mantén tus datos bancarios solo en tu equipo.",
      related: ["key-at", "tool-read", "cmd-security-review"]
    }
  ];
})();
