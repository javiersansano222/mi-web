# 13 — Caso de estudio y métricas

## Fecha
Octubre 2026

## Descripción
Sección añadida al portafolio para cumplir con el criterio de "Contenido propio y densidad" de la rúbrica del profesor. El objetivo era demostrar que el alumno no solo sabe hacer una web bonita, sino que también sabe contar el proceso técnico detrás de un proyecto real (Estate Genovés) y medir sus resultados con datos objetivos.

## Problema que resuelve
El profesor pedía "casos de proyecto reales con problema→solución→resultado, datos o métricas propias". Hasta ese momento, el portafolio mostraba los intereses de Javier (juegos, pelis, PC) pero no un proyecto propio con contexto técnico.

## Solución implementada
Se añadió una sección `#caso-estudio` con dos bloques:

1. **Tres tarjetas (Problema, Solución, Resultado)**: Cada una cuenta una parte del proyecto Estate Genovés.
2. **Bloque de métricas**: Cinco datos objetivos del portafolio (SEO 100, Rendimiento 70-90, 7 paletas, 4 idiomas, 5 APIs).

## Estructura HTML

```html
<section class="case-study section-shell" id="caso-estudio">
  <div class="section-heading section-heading--row reveal">
    <div>
      <p class="eyebrow">02.5 / CASO DE ESTUDIO</p>
      <h2>De la idea<br><em>a la realidad.</em></h2>
    </div>
    <span class="section-index">PROYECTO · ESTATE GENOVÉS</span>
  </div>

  <div class="case-study__grid reveal">
    <div class="case-study__card">
      <span class="case-study__num">01</span>
      <h3>El Problema</h3>
      <p>Quería crear una web inmobiliaria que transmitiera lujo...</p>
    </div>
    <div class="case-study__card">
      <span class="case-study__num">02</span>
      <h3>La Solución</h3>
      <p>Desarrollé desde cero la web con HTML, CSS y JavaScript vanilla...</p>
    </div>
    <div class="case-study__card">
      <span class="case-study__num">03</span>
      <h3>El Resultado</h3>
      <p>Una web funcional con un rendimiento excelente...</p>
    </div>
  </div>

  <div class="metrics reveal">
    <p class="metrics__title">Mi portafolio en números</p>
    <div class="metrics__grid">
      <div class="metrics__item"><strong>100</strong><span>SEO (Lighthouse)</span></div>
      <div class="metrics__item"><strong>70-90</strong><span>Rendimiento (Lighthouse)</span></div>
      <div class="metrics__item"><strong>7</strong><span>Paletas intercambiables</span></div>
      <div class="metrics__item"><strong>4</strong><span>Idiomas en el chatbot</span></div>
      <div class="metrics__item"><strong>5</strong><span>APIs externas integradas</span></div>
      <p class="metrics__note">* Rango variable según caché y navegador. GitHub Pages limita la caché a 10 min.</p>
    </div>
  </div>
</section>