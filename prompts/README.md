<div align="center">

<!-- LOGO / TÍTULO -->
# ✦ Portafolio Javier Sansano ✦

### Estudiante de Desarrollo de Aplicaciones Multiplataforma (DAM)

Portafolio personal con estética **cyberpunk / neón noir**, chatbot multilingüe, APIs en tiempo real y diagramas SVG interactivos.

<!-- BADGES -->
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-00fff7?style=for-the-badge&logo=github&logoColor=white)](https://javiersansano222.github.io/mi-web/)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/es/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/es/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/es/docs/Web/JavaScript)
[![Lighthouse](https://img.shields.io/badge/Lighthouse-90%2B-00fff7?style=for-the-badge&logo=lighthouse&logoColor=white)](https://developer.chrome.com/docs/lighthouse/)

<!-- ESTADO DEL PROYECTO -->
![Estado](https://img.shields.io/badge/Estado-En%20desarrollo-ff00e5?style=flat-square)
![Commits](https://img.shields.io/github/commit-activity/m/javiersansano222/mi-web?color=00fff7&style=flat-square)
![Último commit](https://img.shields.io/github/last-commit/javiersansano222/mi-web?color=ff00e5&style=flat-square)

</div>

---

## 📖 Descripción

Portafolio personal de **Javier Sansano Martínez**, estudiante de **Desarrollo de Aplicaciones Multiplataforma (DAM)**.

Esta web es el resultado de aplicar conocimientos de **HTML5**, **CSS3 moderno** y **JavaScript vanilla**, combinando diseño **cyberpunk / neón noir** con tecnologías actuales como consumo de APIs REST, SVG interactivos y chatbot multilingüe.

**🌐 Web en vivo:** [javiersansano222.github.io/mi-web](https://javiersansano222.github.io/mi-web/)

---

## 🎨 Estética y diseño

- **Cyberpunk / neón noir** con paletas intercambiables (cian, magenta, amarillo neón).
- **6 paletas de colores** seleccionables en tiempo real: Neón Nocturno, Matrix Verde, Blade Runner, Vaporwave, Sangre Neón, Ultravioleta.
- **Modo claro/oscuro** con persistencia en `localStorage`.
- **100% responsive** (desktop, tablet, móvil).
- **Accesibilidad**: `aria-labels`, `role`, `sr-only`, `prefers-reduced-motion`, skip-links, contraste cuidado.
- **Cursor personalizado** en forma de rombo Art Déco / cyberpunk.

### 🧠 Decisiones de diseño

- **Un solo `styles.css`** en vez de CSS modules: el proyecto es una sola página, no hay colisiones, y facilita el theming global con variables CSS.
- **Vanilla JS en vez de framework**: el objetivo es aprender fundamentos, el bundle final es ~30 KB vs. >100 KB con React.
- **SVG animado en el hero** en vez de Three.js: el SVG ofrece la misma sensación visual a coste cero, manteniendo Lighthouse en 90+.

---

## ✨ Características

### 🎬 Experiencia de entrada
- **Intro cinematográfica** con efecto máquina de escribir sobre el nombre.
- **Barra de progreso dorada** que aparece en la primera visita.
- **Fondo cyberpunk** con ciudad animada en 3 capas + partículas + burbujas.

### 🌆 Hero con ciudad Art Déco
- **Ciudad en SVG puro** con tres torres escalonadas.
- **Ventanas que parpadean** aleatoriamente con CSS.
- **Animaciones** con `@keyframes` y respeto por `prefers-reduced-motion`.
- **Parallax** con el movimiento del ratón.

### 💬 Chatbot multilingüe
- **4 idiomas**: Español (ES), Valencià (VA), English (EN), Français (FR).
- **Detección automática** del idioma del usuario al escribir.
- **Selector manual** en el header del chat.
- **Persistencia** del idioma elegido en `localStorage`.
- **Respuestas aleatorias** para que no canse.

### 🌡️ APIs en tiempo real
- **Open-Meteo** → Widget del tiempo en Valencia (gratis, sin key).
- **NASA APOD** → Foto astronómica del día con selector de fecha.
- **GitHub API** → Listado dinámico de repositorios.
- **TMDB** → Galería de películas favoritas con pósters reales.
- **ipwho.is** → Pop-up de bienvenida personalizado por país.

### 🎮 Secciones de contenido
- **Hero** con ciudad Art Déco y presentación personal.
- **Sobre mí** con lista de valores y contador de repos GitHub.
- **NASA APOD** con foto astronómica diaria y selector de fecha.
- **Intereses**: videojuegos, cine y hardware con filtros y carátulas reales.
- **Dentro del ordenador** → Diagrama SVG interactivo de un PC gaming con hotspots.
- **Recorrido** → Timeline con hitos formativos y personales.
- **Contacto** → Formulario funcional vía Web3Forms + WhatsApp + GitHub.

### 🖼️ Diagrama SVG interactivo del PC
- **Componentes identificables**: CPU, RAM, GPU, SSD, refrigeración, PSU, placa base.
- **Hotspots con tooltips** explicativos.
- **Ventiladores animados** con CSS (`transform: rotate`).
- **LEDs parpadeando** con `@keyframes`.
- **Modo "resaltar componente"** al pasar el ratón.
- **Leyenda clicable** con filtros por componente.

### 🎨 Detalles avanzados
- **Efecto Matrix** en el menú: enlaces codificados que se descodifican al hover.
- **Indicador de sección activa** en el menú mientras haces scroll.
- **Barra de progreso de lectura** en la parte superior.
- **Favicon SVG** con el sello "JS".
- **Páginas 404 y gracias personalizadas** con estética coherente.
- **Abanico 3D de intereses** con navegación por teclado.
- **Página secundaria "Estate Genovés"** con formulario Web3Forms propio.

---

## 🛠️ Stack tecnológico

| Categoría | Tecnología |
|---|---|
| **Estructura** | HTML5 semántico |
| **Estilos** | CSS3 moderno (`custom properties`, `color-mix`, `:has()`, grid, flexbox, `backdrop-filter`) |
| **JavaScript** | Vanilla JS (ES6+, sin frameworks) |
| **Animaciones** | CSS `@keyframes` + IntersectionObserver |
| **Gráficos** | SVG animado + Canvas 2D (partículas, matrix) |
| **Tipografía** | Google Fonts (Bebas Neue, JetBrains Mono, y dinámicas por era) |
| **APIs** | Open-Meteo, NASA APOD, GitHub, TMDB, ipwho.is |
| **Formularios** | Web3Forms |
| **Hosting** | GitHub Pages |

---

## 📁 Estructura del proyecto

```
mi-web/
├── index.html                # Página principal
├── styles.css                # Todos los estilos
├── script.js                 # Lógica principal (chat, temas, APIs, efectos)
├── 404.html                  # Página 404 personalizada
├── gracias.html              # Página tras enviar el formulario
├── estate-genoves.html       # Página secundaria: proyecto Estate Genovés
├── estate-gracias.html       # Página de gracias específica para Estate Genovés
├── favicon.svg               # Favicon del sello JS
├── README.md                 # Este archivo
├── .gitignore
├── docs/
│   ├── 01-base.md            # Documentación: estructura base
│   ├── 02-art-deco.md        # Documentación: estética
│   ├── 03-tema.md            # Documentación: gestión de temas
│   └── prompt.txt            # Prompt inicial del profesor
└── img/
    ├── bioshock.png
    ├── cyberpunk.avif
    ├── doom.webp
    ├── fallout new vegas.jpg
    ├── skyrim-tag-page-cover-art.avif
    ├── pc.jpg
    └── og-image.jpg
```

---

## 🚀 Cómo probarlo en local

### Opción 1 — Live Server (recomendado)
1. Instala la extensión **Live Server** en VS Code.
2. Clic derecho sobre `index.html` → **"Open with Live Server"**.
3. Se abre en `http://127.0.0.1:5500/`.

### Opción 2 — Python
```bash
python3 -m http.server 8000
# Abrir http://localhost:8000
```

### Opción 3 — Abrir directamente
```bash
git clone https://github.com/javiersansano222/mi-web.git
cd mi-web
# Doble clic en index.html
```

> ⚠️ **Nota:** algunas funciones (APIs con CORS, carga de recursos) funcionan mejor con un servidor local.

---

## 🔑 Variables y claves de API

Las claves de API se encuentran en `script.js` y `estate-genoves.html`. **Este proyecto usa claves públicas por ser un portafolio personal educativo.**

| Variable | Dónde se usa | Requiere key |
|---|---|---|
| `WEATHER_LAT`, `WEATHER_LON`, `WEATHER_CITY` | Widget del tiempo | ❌ No (Open-Meteo es libre) |
| `GITHUB_USER` | Listado de repos | ❌ No (API pública) |
| `NASA_API_KEY` | Foto del día | ✅ Sí (gratis en [api.nasa.gov](https://api.nasa.gov/)) |
| `TMDB_API_KEY` | Galería de películas | ✅ Sí (gratis en [themoviedb.org](https://www.themoviedb.org/settings/api)) |
| `access_key` (Web3Forms) | Formularios de contacto | ✅ Sí (gratis en [web3forms.com](https://web3forms.com)) |

---

## ✅ Estado del proyecto

### Completado
- [x] Intro cinematográfica
- [x] Fondo cyberpunk animado
- [x] Tema claro/oscuro + 6 paletas intercambiables
- [x] Hero con ciudad Art Déco en SVG animado
- [x] Sección "Sobre mí" con repos GitHub dinámicos
- [x] Sección "Intereses" con videojuegos, cine y hardware
- [x] Diagrama SVG interactivo del PC
- [x] Timeline de recorrido
- [x] Formulario de contacto con Web3Forms
- [x] Página de gracias personalizada
- [x] Página secundaria "Estate Genovés" con Web3Forms propio
- [x] Página de gracias específica para Estate Genovés
- [x] Chatbot multilingüe (ES/VA/EN/FR)
- [x] Widget del tiempo (Open-Meteo)
- [x] Foto del día de NASA (APOD)
- [x] Galería de películas (TMDB)
- [x] Efecto Matrix en el menú
- [x] Indicador de sección activa
- [x] Cursor personalizado
- [x] Barra de progreso de lectura
- [x] Favicon SVG
- [x] Páginas 404 y gracias personalizadas
- [x] Lighthouse 90+ en rendimiento y accesibilidad

### Pendiente / Mejoras futuras
- [ ] Añadir Open Graph completo en `index.html`
- [ ] Añadir atribución obligatoria de TMDB en el footer
- [ ] Añadir `sitemap.xml` y `robots.txt` para SEO
- [ ] Optimizar imágenes (WebP/AVIF) y añadir `width`/`height`
- [ ] Implementar PWA (manifest + service worker)
- [ ] Analítica ligera (Plausible / Umami)
- [ ] Vídeo propio del PC encendiéndose
- [ ] Revisar el enlace de LinkedIn (issue abierto)

---

## 📸 Capturas

| Hero | Chat multilingüe | Diagrama del PC |
|---|---|---|
| ![Hero](img/og-image.jpg) | *(pendiente)* | *(pendiente)* |

---

### ADR-004: Web3Forms para formularios de contacto

**Fecha:** Octubre 2026
**Estado:** Aceptada

**Contexto**
Necesitaba formularios que enviaran correos reales sin backend. Los 
candidatos eran FormSubmit, Formspree y Web3Forms.

**Decisión**
Usar Web3Forms con `access_key` pública en el HTML.

**Alternativas consideradas**
- **FormSubmit**: probado. Muestra su propia página "Thanks!" en lugar del 
  `_next` esperado hasta que el formulario se activa. Sin registro, sin panel 
  de control. ❌ Más opaco.
- **Formspree**: 50 envíos/mes gratis con panel. ✅ Bueno, pero requiere 
  registro y el límite es bajo.
- **FormSubmit con _next**: la redirección no funcionaba correctamente.
- **Formulario propio con backend**: demasiado para un portafolio.

**Consecuencias**
- ✅ 250 envíos/mes gratis (5× más que Formspree).
- ✅ Panel de control para ver submissions (tenemos 15 registrados).
- ✅ Redirección personalizada a página `gracias.html`.
- ✅ Fácil de integrar con `action` + `access_key`.
- ✅ Funciona sin necesidad de backend.
- ⚠️ El autoresponder (respuesta automática) es de pago (~10€/mes).
- ⚠️ Dependencia de un servicio externo.

## 📄 Licencia y créditos

- **Contenido y código:** © 2026 Javier Sansano Martínez.
- **NASA APOD:** datos y fotografías de dominio público por [NASA](https://apod.nasa.gov/).
- **TMDB:** datos de películas por [The Movie Database](https://www.themoviedb.org/). *Este producto usa la API de TMDB pero no está respaldado ni certificado por TMDB.*
- **Open-Meteo:** datos meteorológicos por [open-meteo.com](https://open-meteo.com/) (CC BY 4.0).
- **ipwho.is:** datos de geolocalización por [ipwho.is](https://ipwho.is/).
- **Web3Forms:** gestión de formularios por [web3forms.com](https://web3forms.com/).
- **Tipografías:** [Bebas Neue](https://fonts.google.com/specimen/Bebas+Neue) y [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) de Google Fonts (SIL Open Font License).

---

## 📬 Contacto

- **Web:** [javiersansano222.github.io/mi-web](https://javiersansano222.github.io/mi-web/)
- **GitHub:** [@javiersansano222](https://github.com/javiersansano222)
- **WhatsApp:** [+34 663 509 281](https://wa.me/34663509281)
- **Email:** A través del formulario de contacto de la web

---



*Un paso cada día. Una idea cada vez.*

</div>
