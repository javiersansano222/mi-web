# 02 — Estética cyberpunk / neón noir

## Fecha
Septiembre - Octubre 2026

## Nota sobre el nombre
Este archivo se llamaba originalmente `02-art-deco.md` porque el portafolio empezó con una estética Art Déco. En octubre de 2026 se rediseñó completamente a **cyberpunk / neón noir**, pero se mantiene el nombre para no romper el historial de git.

## Descripción
Sistema de diseño visual del portafolio. Combina colores neón, tipografías contrastadas y microinteracciones para crear una identidad cyberpunk coherente.

## Paleta de colores

El portafolio tiene **6 paletas intercambiables**, cada una con 5 colores:

| Paleta | gold | gold-bright | ember | Carácter |
|---|---|---|---|---|
| **Neón Nocturno** (default) | `#00fff7` (cian) | `#ff00e5` (magenta) | `#f5ff00` (amarillo) | Cyberpunk clásico |
| **Matrix Verde** | `#00ff41` (verde) | `#b8ffbe` (verde claro) | `#e0ffe0` | Terminal |
| **Blade Runner** | `#ff6b00` (naranja) | `#ff006e` (rosa) | `#ffd166` | Retro-futurista |
| **Vaporwave** | `#ff71ce` (rosa) | `#01cdfe` (azul) | `#05ffa1` (verde agua) | Años 80 |
| **Sangre Neón** | `#ff003c` (rojo) | `#f5ff00` (amarillo) | `#ff8b00` (naranja) | Agresivo |
| **Ultravioleta** | `#8a2be2` (morado) | `#00fff7` (cian) | `#ff00e5` (magenta) | Elegante |

Cada paleta define además:
- `--bg`, `--bg-deep`, `--panel`, `--ink`, `--muted`, `--line`, `--water`.

## Tipografías

El portafolio usa tipografías que **cambian según la paleta**:

| Paleta | Display (títulos) | Body (texto) |
|---|---|---|
| Neón Nocturno | Bebas Neue | JetBrains Mono |
| Matrix Verde | VT323 | IBM Plex Mono |
| Blade Runner | Cormorant Garamond | Inter |
| Vaporwave | Italiana | Space Grotesk |
| Sangre Neón | Bebas Neue | Space Mono |
| Ultravioleta | Cinzel | Lora |

La carga dinámica se hace en `script.js` con `loadEraFonts(era)`:

    const loadEraFonts = (era) => {
      const fonts = ERA_FONTS[era];
      if (!fonts || fonts.length === 0) return;
      const id = "fonts-" + era;
      if (document.getElementById(id)) return;
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=" + fonts.join("&family=") + "&display=swap";
      document.head.appendChild(link);
    };

## Fondo cyberpunk

El fondo combina varias capas:

1. **Degradados radiales** (cian arriba-izquierda, magenta abajo-derecha).
2. **Rejilla sutil** con `repeating-linear-gradient`.
3. **Scanlines** horizontales tipo CRT.
4. **Ciudad Art Déco de fondo** (silueta SVG con ventanas parpadeando).
5. **Partículas en canvas** que suben y reaccionan al ratón.
6. **Burbujas** con borde neón.
7. **Halo del ocean** con animación de deriva.

## Microinteracciones

- **Cursor personalizado** (rombo cian/magenta).
- **Hover en tarjetas** con elevación y glow.
- **Reveal on scroll** con `IntersectionObserver`.
- **Efecto Matrix** en el menú al hacer hover (se descodifica).
- **Botones con doble borde** decorativo.
- **Sello JS** con draw-on-load.

## Modo claro / oscuro

Cada paleta tiene su versión clara con acentos oscurecidos:

    html[data-theme="light"][data-era="neon-nocturno"]{
      --gold: #007a99;
      --gold-bright: #b300a3;
      --ember: #b38600;
      --bg: #e8ecf0;
      --ink: #0a0a19;
    }

El cambio se controla con `data-theme="dark|light"` en `<html>` y se persiste en `localStorage`.

## Ilustraciones SVG propias

- **Sello JS** (rombo con draw-on-load y glow pulsante).
- **Diagrama del PC** (ver `05-hotspots.md`).
- **Iconos de contacto** (GitHub, LinkedIn, ESTATE GENOVES).
- **Flechas y separadores** decorativos.

## Estado
✅ Completado

## Commits relacionados
- `feat(styles): rediseño cyberpunk con paleta cian/magenta`
- `feat(eras): añadir 6 paletas intercambiables con variables CSS`
- `feat(styles): añadir modo claro con acentos oscurecidos`
- `feat(brand): sello JS animado con draw-on-load`
- `docs(prompts): actualizar estética cyberpunk del proyecto`