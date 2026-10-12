# 01 — Base del proyecto

## Fecha
Septiembre - Octubre 2026

## Descripción
Estructura base del portafolio personal de Javier Sansano Martínez, estudiante de DAM (Desarrollo de Aplicaciones Multiplataforma). Web vanilla (HTML + CSS + JS) sin frameworks ni bundlers, con estética cyberpunk / neón noir.

## Estructura del proyecto

    mi-web/
    ├── index.html                # Página principal
    ├── styles.css                # Todos los estilos (~2900 líneas)
    ├── script.js                 # Lógica principal (~1800 líneas)
    ├── 404.html                  # Página 404 personalizada
    ├── gracias.html              # Página de éxito tras formulario
    ├── estate-genoves.html       # Proyecto secundario (inmobiliaria)
    ├── estate-gracias.html       # Página de éxito de Estate Genovés
    ├── favicon.svg               # Favicon con sello JS
    ├── sitemap.xml               # Sitemap para SEO
    ├── robots.txt                # Instrucciones para crawlers
    ├── README.md                 # Documentación principal
    ├── og-image.html             # Generador de Open Graph (temporal)
    ├── prompts/                  # Documentación técnica
    │   ├── 01-base.md
    │   ├── 02-art-deco.md
    │   ├── 03-tema.md
    │   ├── 04-contador.md
    │   ├── 05-hotspots.md
    │   ├── 06-cursor.md
    │   ├── 07-formulario.md
    │   ├── 08-chatbot.md
    │   ├── 09-apod.md
    │   ├── 10-video-popup.md
    │   ├── 11-analytics.md
    │   └── 12-adr.md
    └── img/                      # Imágenes optimizadas
        ├── avance-genoves.png
        ├── bioshock.webp
        ├── cyberpunk.avif
        ├── doom.webp
        ├── estate-preview.mp4
        ├── fallout-new-vegas.webp
        ├── og-image.jpg
        ├── pc.webp
        └── skyrim-tag-page-cover-art.avif

## Estructura HTML

La página principal sigue una estructura semántica clara:

    <header class="site-header">      # Header sticky con nav
    <main id="contenido">
      <section id="inicio">           # Hero con ciudad animada
      <section id="sobre-mi">         # Quién soy + valores
      <section id="apod">             # NASA APOD
      <section id="proyectos">        # Intereses (juegos, pelis, PC)
      <section id="dentro">           # Diagrama del PC
      <section id="recorrido">        # Timeline
      <section id="contacto">         # Formulario + redes
    </main>
    <footer class="site-footer">      # Sello + enlaces
    <div class="chat">                # Chatbot flotante
    <div class="mini-video">          # Mini reproductor de vídeo

## Variables CSS

Todo el theming se controla con variables CSS en `:root`:

    :root {
      --bg: #050510;
      --bg-deep: #000000;
      --panel: rgba(10, 10, 25, .82);
      --ink: #e0f7fa;
      --muted: #7a90b0;
      --gold: #00fff7;          # cian neón
      --gold-bright: #ff00e5;   # magenta neón
      --gold-deep: #0099cc;
      --ember: #f5ff00;         # amarillo neón
      --line: rgba(0, 255, 247, .35);
      --font-display: 'Bebas Neue', sans-serif;
      --font-body: 'JetBrains Mono', monospace;
    }

Las paletas cambian con `html[data-era="..."]`:
- `neon-nocturno` (default)
- `matrix-verde`
- `blade-runner`
- `vaporwave`
- `sangre-neon`
- `ultravioleta`

## JavaScript modular

`script.js` está organizado en IIFE con secciones numeradas:

    0.  Widget del tiempo (Open-Meteo)
    1.  Intro cinematográfica
    2.  Año footer
    3.  Eras / paletas intercambiables
    4.  Tema claro/oscuro
    5.  Menú móvil
    5.5 Efecto Matrix
    6.  Indicador de sección activa
    7.  Barra de progreso scroll
    8.  Reveal
    9.  Typewriter
    10. Tilt
    11. Partículas fondo
    12. Contadores colapsables
    13. Chatbot multilingüe
    14. NASA APOD con caché
    15. Repos de GitHub
    16. Scene ready
    17. Diagrama interactivo del PC
    18. Formulario de contacto
    19. Geo-IP (pop-up de bienvenida)
    20. Datos de juegos
    21. Datos de películas
    22. TMDB (pósters)
    23. Abanico 3D
    24. Lluvia de código Matrix
    25. Mini reproductor de vídeo

## Accesibilidad

- Estructura semántica (`<header>`, `<main>`, `<section>`, `<footer>`).
- Atributos `aria-*` en menú, botones, chat, formulario, tooltips.
- Skip-link al contenido.
- `prefers-reduced-motion` respetado en animaciones.
- Contraste de colores cuidado.
- Foco visible en elementos interactivos.
- `alt` en todas las imágenes.

## Responsive

Breakpoints principales:
- **900px**: ajustes de grid en hero e intro.
- **700px**: menú móvil, ocultar hero-scene 3D.
- **640px**: abanico de proyectos en grid 2x2.
- **600px**: páginas de estado adaptadas.
- **500px**: ajustes de chat.

## Estado
✅ Completado

## Commits relacionados
- `feat: estructura inicial del portafolio`
- `feat: CSS con variables y temas`
- `refactor: organizar JS en secciones numeradas`
- `docs: actualizar documentación base con estado actual`