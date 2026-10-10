<div align="center">

# ✦ Portafolio Javier Sansano ✦

### Estudiante de Desarrollo de Aplicaciones Multiplataforma (DAM)

Portafolio personal con estética **Art Déco moderna**, experiencia 3D, chatbot multilingüe y APIs en tiempo real.

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-d4a84b?style=for-the-badge&logo=github)](https://javiersansano222.github.io/mi-web/)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/es/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/es/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/es/docs/Web/JavaScript)
[![Three.js](https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org/)

</div>

---

## 📖 Descripción

Portafolio personal de **Javier Sansano Martínez**, estudiante de **Desarrollo de Aplicaciones Multiplataforma**. 

Esta web es el resultado de aplicar conocimientos de **HTML5**, **CSS3 moderno** y **JavaScript vanilla**, combinando diseño **Art Déco moderno** con tecnologías actuales como WebGL (Three.js) y consumo de APIs REST.

**🌐 Web en vivo:** [javiersansano222.github.io/mi-web](https://javiersansano222.github.io/mi-web/)

---

## 🎨 Estética y diseño

- **Art Déco moderno** inspirado en Bioshock, con marco dorado y tipografías serif clásicas.
- **4 paletas de colores** intercambiables: Oro & Noche, Cobre & Esmeralda, Plata & Carbón, Coral & Abismo.
- **Modo claro/oscuro** con persistencia en `localStorage`.
- **100% responsive** (desktop, tablet, móvil).
- **Accesibilidad**: `aria-labels`, `role`, `sr-only`, `prefers-reduced-motion`, skip-links.

---

## ✨ Características

### 🎬 Experiencia de entrada
- **Intro cinematográfica** con efecto de máquina de escribir sobre el nombre.
- **Barra de progreso dorada** que aparece en la primera visita.
- **Fondo Art Déco** con ciudad animada en 3 capas + partículas doradas + burbujas subiendo.

### 🖥️ 3D interactivo (Three.js)
- **Rascacielos Art Déco procedural** en el hero con rotación continua.
- **Ventanas iluminadas** que parpadean aleatoriamente.
- **Interacción con el cursor** (parallax + rotación).
- **Cambia de color** según la paleta activa.

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

### 🎮 Secciones de contenido
- **Hero** con rascacielos 3D y presentación personal.
- **Sobre mí** con lista de valores y contador de repos GitHub.
- **Intereses**:
  - Videojuegos (con carátulas reales de Fallout, Doom, Skyrim, Bioshock, Cyberpunk 2077).
  - Cine (con pósters reales de TMDB).
  - Hardware (con diagrama SVG interactivo).
- **Dentro del ordenador** → Diagrama SVG de un PC gaming con hotspots interactivos.
- **Recorrido** → Timeline con hitos formativos y personales.
- **Contacto** → Formulario funcional vía Web3Forms + enlaces profesionales.

### 🎨 Detalles avanzados
- **Efecto Matrix** en el menú: los enlaces aparecen codificados con símbolos y se descodifican al pasar el ratón.
- **Indicador de sección activa** en el menú mientras haces scroll.
- **Cursor personalizado** en forma de rombo Art Déco.
- **Barra de progreso de lectura** en la parte superior.
- **Tilt 3D** en las tarjetas de proyectos al pasar el ratón.
- **Favicon SVG** con el sello "JS" dorado.
- **Página 404 personalizada** con estética Art Déco.
- **Página de gracias** tras enviar el formulario.

---

## 🛠️ Stack tecnológico

| Categoría | Tecnología |
|---|---|
| **Estructura** | HTML5 semántico |
| **Estilos** | CSS3 moderno (custom properties, `color-mix`, `:has()`, grid, flexbox, `backdrop-filter`) |
| **JavaScript** | Vanilla JS (ES6+, sin frameworks) |
| **3D** | Three.js r128 (WebGL) |
| **Tipografía** | Google Fonts: Cinzel + Lora |
| **APIs** | Open-Meteo, NASA APOD, GitHub, TMDB |
| **Formulario** | Web3Forms |
| **Hosting** | GitHub Pages |

---

## 📁 Estructura del proyecto

```
mi-web/
├── index.html              # Página principal
├── styles.css              # Todos los estilos
├── script.js               # Lógica principal (chat, temas, APIs, efectos)
├── scene.js                # Escena 3D del hero (Three.js)
├── 404.html                # Página 404 personalizada
├── gracias.html            # Página tras enviar el formulario
├── favicon.svg             # Favicon del sello JS
├── README.md               # Este archivo
├── .gitignore
└── img/
    ├── bioshock.png
    ├── cyberpunk.avif
    ├── doom.webp
    ├── fallout new vegas.jpg
    ├── skyrim-tag-page-cover-art.avif
    ├── pc.jpg
    ├── og-image.jpg
    
```

---

## 🚀 Cómo probarlo en local

### Opción 1 — Abrir directamente
```bash
# Clonar el repo
git clone https://github.com/javiersansano222/mi-web.git
cd mi-web

# Abrir index.html con doble clic
```

> ⚠️ **Nota:** algunas funciones como el modelo 3D `.glb` **requieren un servidor local** (por política CORS del navegador).

### Opción 2 — Live Server (recomendado)
1. Instalar la extensión **Live Server** en VS Code.
2. Clic derecho sobre `index.html` → **"Open with Live Server"**.
3. Se abre en `http://127.0.0.1:5500/`.

### Opción 3 — Python
```bash
python3 -m http.server 8000
# Abrir http://localhost:8000
```

---

## 🔑 Variables y claves de API

Las claves de API se encuentran en `script.js`. **Este proyecto usa claves públicas por ser un portafolio personal educativo.**

| Variable | Dónde se usa | Requiere key |
|---|---|---|
| `WEATHER_LAT`, `WEATHER_LON`, `WEATHER_CITY` | Widget del tiempo | ❌ No (Open-Meteo es libre) |
| `GITHUB_USER` | Listado de repos | ❌ No (API pública) |
| `NASA_API_KEY` | Foto del día | ✅ Sí (gratis en [api.nasa.gov](https://api.nasa.gov/)) |
| `TMDB_API_KEY` | Galería de películas | ✅ Sí (gratis en [themoviedb.org](https://www.themoviedb.org/settings/api)) |

---

## ✅ Estado del proyecto

### Completado
- [x] Intro cinematográfica
- [x] Fondo Art Déco animado
- [x] Tema claro/oscuro + 4 paletas
- [x] Hero con rascacielos 3D
- [x] Sección "Sobre mí" con repos GitHub
- [x] Sección "Intereses" con videojuegos, cine y hardware
- [x] Diagrama SVG interactivo del PC
- [x] Timeline de recorrido
- [x] Formulario de contacto con Web3Forms
- [x] Enlaces a GitHub, LinkedIn y proyecto ESTATE GENOVES
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

### Pendiente
- [ ] Integrar visor 3D del PC con modelo `.glb`
- [ ] Añadir atribución obligatoria de TMDB en el footer
- [ ] Buscar ciudad Art Déco real en Sketchfab (reemplazar rascacielos procedural)
- [ ] Añadir sitemap.xml y robots.txt para SEO
- [ ] Optimizar imágenes (WebP/AVIF)

---

## 📸 Capturas

*(Añadir capturas de pantalla de las secciones principales)*

| Hero | Chat multilingüe | Foto NASA |
|---|---|---|
| ![Hero](img/og-image.jpg) | *(pendiente)* | *(pendiente)* |

---

## 📄 Licencia y créditos

- **Contenido y código:** © 2026 Javier Sansano Martínez.
- **NASA APOD:** datos y fotografías de dominio público por [NASA](https://apod.nasa.gov/).
- **TMDB:** datos de películas por [The Movie Database](https://www.themoviedb.org/). *Este producto usa la API de TMDB pero no está respaldado ni certificado por TMDB.*
- **Open-Meteo:** datos meteorológicos por [open-meteo.com](https://open-meteo.com/) (CC BY 4.0).
- **Tipografías:** [Cinzel](https://fonts.google.com/specimen/Cinzel) y [Lora](https://fonts.google.com/specimen/Lora) de Google Fonts (SIL Open Font License).

---

## 📬 Contacto

- **Web:** [javiersansano222.github.io/mi-web](https://javiersansano222.github.io/mi-web/)
- **GitHub:** [@javiersansano222](https://github.com/javiersansano222)
- **LinkedIn:** *(pendiente de actualizar)*
- **Email:** A través del formulario de contacto de la web

---

<div align="center">

**Hecho con curiosidad, disciplina y mucho ☕**

*Un paso cada día. Una idea cada vez.*

</div>
