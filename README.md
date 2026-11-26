# Guía interactiva de Claude Code

Sitio web dinámico para entender **cómo funciona Claude Code**: comandos, flags de la CLI, atajos, extensiones (CLAUDE.md, hooks, MCP, subagentes, skills) y permisos. Incluye un **asistente de IA** (Claude Haiku 5.5, esfuerzo `medium`) que responde dudas y siempre **enlaza a la sección exacta de la guía**, para que el usuario aprenda dónde está la información y deje de depender del chat.

> Proyecto no oficial para aprender Claude Code. Para información oficial consulta la documentación de Anthropic.

## Características

- **Navegación por categorías:** Inicio, Cómo funciona, Comandos `/`, CLI y flags, Atajos, Extensiones, Permisos y Prácticas.
- **Búsqueda global** (`/` o `Ctrl+K`), filtros por categoría, botón de copiar y tema claro/oscuro.
- **Asistente IA con enlaces profundos:** cada respuesta enlaza a los elementos de la guía (se abren, se resaltan y se centran en pantalla). Solo se aceptan enlaces que existen en el catálogo.
- **Streaming** de respuestas, botón *Detener* e historial persistente.
- **Modo offline:** sin API key, el asistente busca en el contenido de la propia guía.

## Requisitos

- [Node.js](https://nodejs.org) 18 o superior (sin dependencias adicionales).
- Una API key de Anthropic (opcional; sin ella el chat funciona en modo offline).

## Uso

```bash
# 1. Configura tu clave (opcional pero recomendado)
cp .env.example .env        # en Windows: copy .env.example .env
# edita .env y pon tu ANTHROPIC_API_KEY

# 2. Arranca el servidor local
npm start

# 3. Abre http://127.0.0.1:8765
```

La API key vive **solo en el servidor** (`.env`, ignorado por git): el navegador nunca la ve. El servidor escucha únicamente en `127.0.0.1`, rechaza peticiones con `Host`/`Origin` ajenos y fija el modelo y el esfuerzo del lado del servidor.

## Estructura

```
index.html        Marco de la página, barra de navegación y widget de chat
css/styles.css    Estilos (tema claro/oscuro, responsive)
js/data.js        Todo el contenido: comandos, flags, atajos, extensiones…
js/links.js       Catálogo de enlaces profundos (se genera desde data.js)
js/app.js         Router por hash, vistas, búsqueda, filtros
js/chat.js        Asistente IA: streaming, enlaces, modo offline
server.js         Servidor estático + proxy en streaming hacia la API
```

## Añadir contenido

Todo el contenido está en `js/data.js`. Para agregar un comando, flag o atajo basta con añadir un objeto: el catálogo de enlaces (`links.js`), la búsqueda y el prompt del asistente se actualizan solos.

> Los comandos y atajos están escritos según la documentación disponible y pueden variar según la versión de Claude Code. Dentro de Claude Code, `/help` muestra la lista real de tu versión.
