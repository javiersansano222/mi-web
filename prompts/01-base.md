# 01 — Web base (estructura HTML / CSS / JS)

## Fecha
Septiembre 2026

## Objetivo
Partir de una web de portafolio personal con estructura HTML
semántica, CSS con variables y JavaScript modular. Que fuera
responsive y accesible, para luego personalizarla.

## Enfoque
Le pedí a la IA que me ayudara a montar la **estructura base**:

- `index.html` con secciones: hero, sobre mí, intereses, recorrido
  y contacto.
- `styles.css` con **variables CSS** para colores, tipografías y
  espaciados.
- `script.js` con módulos independientes: tema claro/oscuro,
  menú responsive, efecto máquina de escribir y animaciones
  al hacer scroll.

## Resultado

- ✅ Estructura semántica clara (`<header>`, `<main>`,
  `<section>`, `<footer>`).
- ✅ Variables CSS para colores y tipografías.
- ✅ Uso de `aria-*` para accesibilidad (menú, botones,
  formulario).
- ✅ Scroll progress bar.
- ✅ Animación `.reveal` con `IntersectionObserver`.

## Qué modifiqué yo

- Cambié los colores a la paleta Art Déco (ver `02-art-deco.md`).
- Añadí más secciones (contador, hotspots, formulario).
- Ajusté los textos para que fueran **míos**, no de la plantilla
  genérica.

## Commits relacionados
- `feat: estructura inicial del portafolio`
