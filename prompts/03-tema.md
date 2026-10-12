# 03 — Gestión de temas y paletas

## Fecha
Septiembre - Octubre 2026

## Descripción
Sistema de gestión de temas (claro/oscuro) y paletas de color (6 eras cyberpunk). Todo controlado con atributos `data-*` en `<html>` y variables CSS.

## Características

- **2 temas**: claro (`dark`/`light`) con persistencia en `localStorage`.
- **6 paletas** intercambiables en tiempo real.
- **Sincronización automática** entre selector y `localStorage`.
- **Carga dinámica** de tipografías por paleta.
- **Reactividad con `MutationObserver`** en la escena 3D y el Matrix.
- **Sincronización de `aria-pressed`** para accesibilidad.

## Cómo funciona

### Atributos en `<html>`

    <html lang="es" data-era="neon-nocturno" data-theme="dark">

- `data-era`: paleta activa (6 posibles).
- `data-theme`: tema claro u oscuro.

### Variables CSS por era

Cada paleta redefine las variables en `styles.css`:

    html[data-era="neon-nocturno"]{
      --gold: #00fff7;
      --gold-bright: #ff00e5;
      --gold-deep: #0099cc;
      --ember: #f5ff00;
      --font-display: 'Bebas Neue', 'Arial Narrow', sans-serif;
      --font-body: 'JetBrains Mono', 'Courier New', monospace;
      --deco-city: block;
      --deco-matrix: none;
      --deco-rays: none;
      --deco-rain: none;
      --deco-sun: none;
    }

### JavaScript: carga de eras

    const eras = [
      "neon-nocturno",
      "matrix-verde",
      "blade-runner",
      "vaporwave",
      "sangre-neon",
      "ultravioleta"
    ];

    const eraSelect = $("#era-select");
    const storedEra = safeGet("portfolio-era");
    if (storedEra && eras.includes(storedEra)) root.dataset.era = storedEra;

    if (eraSelect) {
      eraSelect.value = eras.includes(root.dataset.era) ? root.dataset.era : "neon-nocturno";
      eraSelect.addEventListener("change", () => {
        if (!eras.includes(eraSelect.value)) return;
        root.dataset.era = eraSelect.value;
        safeSet("portfolio-era", eraSelect.value);
        loadEraFonts(eraSelect.value);
      });
    }

### URL params (personalización)

Se puede activar una paleta directamente desde la URL:

    https://javiersansano222.github.io/mi-web/?era=matrix-verde

Código:

    const urlParams = new URLSearchParams(window.location.search);
    const eraFromUrl = urlParams.get("era");
    if (eraFromUrl && eras.includes(eraFromUrl)) {
      root.dataset.era = eraFromUrl;
      safeSet("portfolio-era", eraFromUrl);
      console.info("[era] Activada desde URL:", eraFromUrl);
    }

### JavaScript: tema claro/oscuro

    const themeToggle = $("#theme-toggle");
    const storedTheme = safeGet("portfolio-theme");
    if (storedTheme === "light" || storedTheme === "dark") root.dataset.theme = storedTheme;

    const syncThemeControl = () => {
      if (!themeToggle) return;
      const light = root.dataset.theme === "light";
      themeToggle.setAttribute("aria-pressed", String(light));
      themeToggle.setAttribute("aria-label",
        light ? "Cambiar a tema oscuro" : "Cambiar a tema claro");
    };
    syncThemeControl();

    themeToggle?.addEventListener("click", () => {
      root.dataset.theme = root.dataset.theme === "light" ? "dark" : "light";
      safeSet("portfolio-theme", root.dataset.theme);
      syncThemeControl();
    });

## Carga dinámica de fuentes

Cada paleta tiene sus tipografías. Se cargan solo cuando se activa la paleta:

    const ERA_FONTS = {
      "neon-nocturno": [],
      "matrix-verde": ["VT323", "IBM+Plex+Mono:wght@400;700"],
      "blade-runner": ["Cormorant+Garamond:wght@500;700", "Inter:wght@400;500"],
      "vaporwave":    ["Italiana", "Space+Grotesk:wght@400;500"],
      "sangre-neon":  ["Bebas+Neue", "Space+Mono:wght@400;700"],
      "ultravioleta": ["Cinzel:wght@400;500", "Lora:ital,wght@0,400;0,500;1,400"]
    };

**Ventaja**: no se cargan 12 fuentes al inicio, solo las 2 de la paleta activa.

## Reactividad con otros módulos

Los módulos de escena 3D y lluvia Matrix escuchan cambios en `data-era`:

    const themeObserver = new MutationObserver(matrixCheckEra);
    themeObserver.observe(root, {
      attributes: true,
      attributeFilter: ["data-era"]
    });

Esto permite:
- **La lluvia Matrix** solo se activa en `matrix-verde`.
- **La escena 3D** cambia de colores según la paleta.

## Accesibilidad

- **`aria-pressed`** en el botón de tema (indica el estado claro/oscuro).
- **`aria-label`** descriptivo que cambia según el estado.
- **Foco visible** en selector y botón.
- **Persistencia** para que el usuario no tenga que elegir cada vez.

## Persistencia

| Clave | Valores | Qué guarda |
|---|---|---|
| `portfolio-era` | `neon-nocturno`, `matrix-verde`, etc. | Paleta activa |
| `portfolio-theme` | `dark`, `light` | Tema claro/oscuro |

Todo se guarda con `safeSet()` que envuelve `localStorage` en try/catch para navegadores con `localStorage` bloqueado.

## Estado
✅ Completado

## Commits relacionados
- `feat(theme): toggle claro/oscuro con persistencia`
- `feat(eras): 6 paletas intercambiables con variables CSS`
- `feat(eras): carga dinámica de tipografías por paleta`
- `feat(eras): activar paleta desde URL con ?era=`
- `docs(prompts): actualizar sistema de temas y paletas`