# 12 — Decisiones de arquitectura (ADR)

## Fecha
Octubre 2026

## Descripción
Índice y resumen de las decisiones de arquitectura documentadas en el README principal. Los ADRs (Architecture Decision Records) explican **qué se decidió**, **por qué** y **qué consecuencias tiene**.

## Qué es un ADR

Un **ADR** (Architecture Decision Record) es un documento corto que registra una decisión técnica importante. Sigue un formato estándar:

- **Contexto**: ¿qué problema había?
- **Decisión**: ¿qué se eligió?
- **Alternativas consideradas**: ¿qué otras opciones había?
- **Consecuencias**: ¿qué se gana y qué se pierde?

## ADRs documentados

Los 5 ADRs están **en el README principal** del repositorio (`README.md`), en la sección **"Decisiones de arquitectura (ADR)"**.

| # | Título | Tema |
|---|---|---|
| **ADR-001** | Paletas intercambiables con variables CSS | Diseño / Theming |
| **ADR-002** | Vanilla JS vs. framework | Stack técnico |
| **ADR-003** | SVG animado vs. Three.js | Rendimiento / Hero |
| **ADR-004** | Web3Forms para formularios | Contacto |
| **ADR-005** | SVG interactivo vs. modelo 3D | Medios / PC |

## Resumen de cada ADR

### ADR-001 — Paletas intercambiables con variables CSS
**Decisión**: 6 paletas intercambiables mediante variables CSS y atributos `data-era` en `<html>`.
**Alternativa rechazada**: CSS separado por paleta (más peso, sin cambio instantáneo).
**Consecuencia**: cambio de paleta instantáneo sin recargar.

### ADR-002 — Vanilla JS vs. framework
**Decisión**: JavaScript vanilla (ES6+) sin frameworks ni bundlers.
**Alternativa rechazada**: React, Vue, Astro (más peso, build innecesario).
**Consecuencia**: bundle de ~30 KB, Lighthouse 90+, control total.

### ADR-003 — SVG animado vs. Three.js
**Decisión**: SVG animado con CSS en el hero en vez de Three.js.
**Alternativa rechazada**: Three.js (600 KB extra solo para un rascacielos girando).
**Consecuencia**: ahorro de 600 KB, Lighthouse 90+ en ambos dispositivos.

### ADR-004 — Web3Forms para formularios
**Decisión**: Web3Forms con `access_key` pública en el HTML.
**Alternativas evaluadas**: FormSubmit (probado, opaco), Formspree (límite bajo).
**Consecuencia**: 250 envíos/mes gratis, panel de control, sin backend.

### ADR-005 — SVG interactivo vs. modelo 3D
**Decisión**: diagrama SVG interactivo con hotspots en vez de modelo `.glb`.
**Alternativa rechazada**: modelo 3D original (65 MB, 1M triángulos, inviable).
**Consecuencia**: cero peso adicional, interactividad real, coherencia visual.

## Por qué documentar ADRs

1. **Demuestra criterio técnico**: no solo haces, también decides.
2. **Facilita el mantenimiento**: en 6 meses sabrás por qué elegiste cada cosa.
3. **Ayuda en la defensa oral**: puedes explicar cada decisión con contexto.
4. **Es una buena práctica profesional**: equipos reales usan ADRs.

## Formato de un ADR

    ### ADR-00X: Título de la decisión

    **Fecha:** Mes Año · **Estado:** Aceptada

    **Contexto**
    Qué problema había.

    **Decisión**
    Qué se eligió.

    **Alternativas consideradas**
    - Alternativa A: por qué se rechazó.
    - Alternativa B: por qué se rechazó.

    **Consecuencias**
    - ✅ Ventaja 1.
    - ✅ Ventaja 2.
    - ⚠️ Desventaja 1.

## Estado
✅ Completado

## Ubicación
Los ADRs completos están en el `README.md` del repositorio, sección "🧠 Decisiones de arquitectura (ADR)".