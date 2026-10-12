# 04 — Contadores colapsables

## Fecha
Septiembre - Octubre 2026

## Descripción
Dos contadores colapsables en la sección "Sobre mí" que muestran información personal de forma interactiva. Se pueden abrir y cerrar con un clic, y el estado se persiste en `localStorage`.

## Características

- **Contador 1**: "cosas que he hecho" (6 hitos personales).
- **Contador 2**: "repositorios en GitHub" (cargados dinámicamente).
- **Animación de apertura** con `max-height` y `transition`.
- **Persistencia** del estado abierto/cerrado en `localStorage`.
- **Accesibilidad** con `aria-expanded`.
- **Carga dinámica** de repos desde la API de GitHub.

## Estructura HTML

    <div class="counter" id="counter">
      <button class="counter__head" type="button" aria-expanded="false" aria-controls="counter-list">
        <span class="counter__num">06</span>
        <span class="counter__title">cosas que he hecho</span>
        <span class="counter__chevron">▾</span>
      </button>
      <div class="counter__body" id="counter-list">
        <ul class="counter__list">
          <li><span>01</span> Terminé el Grado Medio de SMX</li>
          <li><span>02</span> Empecé el Grado Superior de DAM</li>
          <li><span>03</span> Monté mi primer PC desde cero</li>
          <li><span>04</span> Aprendí HTML, CSS y JavaScript</li>
          <li><span>05</span> Creé mi primera página web</li>
          <li><span>06</span> Llevo años entrenando a diario</li>
        </ul>
      </div>
    </div>

## Cómo funciona

### JS: contador simple

    const counter = $("#counter");
    const counterHead = counter ? $(".counter__head", counter) : null;

    const setCounter = (open) => {
      if (!counter || !counterHead) return;
      counter.classList.toggle("is-open", open);
      counterHead.setAttribute("aria-expanded", String(open));
      safeSet("portfolio-counter", open ? "open" : "closed");
    };

    if (safeGet("portfolio-counter") === "open") setCounter(true);

    counterHead?.addEventListener("click", () => {
      setCounter(!counter.classList.contains("is-open"));
    });

### JS: contador de repos de GitHub

    const reposCounter = $("#counter-repos");
    const reposHead = reposCounter ? $(".counter__head", reposCounter) : null;

    const setReposCounter = (open) => {
      if (!reposCounter || !reposHead) return;
      reposCounter.classList.toggle("is-open", open);
      reposHead.setAttribute("aria-expanded", String(open));
    };

    reposHead?.addEventListener("click", () => {
      setReposCounter(!reposCounter.classList.contains("is-open"));
    });

### CSS: animación de apertura

    .counter__body {
      max-height: 0;
      overflow: hidden;
      transition: max-height .5s var(--ease);
    }
    .counter.is-open .counter__body {
      max-height: 500px;
    }
    .counter--tree.is-open .counter__body {
      max-height: 800px;
    }

    .counter__chevron {
      transition: transform .4s var(--ease);
    }
    .counter.is-open .counter__chevron {
      transform: rotate(180deg);
    }

### CSS: apertura escalonada de los items

Cada item aparece con un pequeño retraso:

    .counter__list li {
      opacity: 0;
      transform: translateX(-12px);
      transition: opacity .4s var(--ease), transform .4s var(--ease);
    }
    .counter.is-open .counter__list li { opacity: 1; transform: translateX(0); }
    .counter.is-open .counter__list li:nth-child(1){ transition-delay: .05s }
    .counter.is-open .counter__list li:nth-child(2){ transition-delay: .10s }
    .counter.is-open .counter__list li:nth-child(3){ transition-delay: .15s }
    .counter.is-open .counter__list li:nth-child(4){ transition-delay: .20s }
    .counter.is-open .counter__list li:nth-child(5){ transition-delay: .25s }
    .counter.is-open .counter__list li:nth-child(6){ transition-delay: .30s }

## Carga de repos desde GitHub

El contador de repos se rellena con la API de GitHub:

    const GITHUB_USER = "javiersansano222";
    const REPOS_LIMIT = 6;

    const loadRepos = async () => {
      const res = await fetch(
        `https://api.github.com/users/${GITHUB_USER}/repos?sort=updated&per_page=100`,
        { headers: { Accept: "application/vnd.github+json" } }
      );
      const all = await res.json();
      const filtered = all
        .filter((r) => !r.fork && !r.archived)
        .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
        .slice(0, REPOS_LIMIT);
      renderTree(filtered);
    };

Los repos se cachean 1 hora en `localStorage` bajo la clave `portfolio-github-repos`.

## Estructura de árbol

Cada repo se muestra como un item de árbol con:
- **Icono SVG de carpeta** (inline, sin dependencias).
- **Nombre del repo**.
- **Lenguaje principal** con color identificativo.
- **Flecha ↗** para abrir en GitHub.

    <ul class="tree">
      <li class="tree__item">
        <a class="tree__row" href="..." target="_blank">
          <svg class="tree__icon">...</svg>
          <span class="tree__name">nombre-repo</span>
          <span class="tree__meta">
            <span class="tree__lang"><i style="background:#f1e05a"></i>JavaScript</span>
          </span>
          <span class="tree__arrow">↗</span>
        </a>
      </li>
    </ul>

## Caché de repos

    const CACHE_KEY = "portfolio-github-repos";
    const CACHE_TTL = 60 * 60 * 1000; // 1 hora

    const loadRepos = async () => {
      try {
        const cached = JSON.parse(safeGet(CACHE_KEY) || "null");
        if (cached && Date.now() - cached.time < CACHE_TTL) {
          renderTree(cached.data);
          return;
        }
      } catch {}
      // ... fetch a la API
    };

**Ventaja**: no se llama a la API de GitHub en cada visita. Solo una vez por hora.

## Accesibilidad

- `aria-expanded` en el botón (true/false).
- `aria-controls` apunta al `id` del cuerpo colapsable.
- Chevron con `aria-hidden="true"` (decorativo).
- Botón real (`<button>`) en vez de `<div>`.

## Persistencia

| Clave | Valores | Qué guarda |
|---|---|---|
| `portfolio-counter` | `open`, `closed` | Estado del contador 1 |
| `portfolio-github-repos` | JSON con timestamp y datos | Caché de repos |

## Estado
✅ Completado

## Commits relacionados
- `feat(counter): añadir contador colapsable con persistencia`
- `feat(counter): cargar repos de GitHub dinámicamente`
- `feat(counter): cachear repos con TTL de 1 hora`
- `docs(prompts): actualizar documentación de contadores`