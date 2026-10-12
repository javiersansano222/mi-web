# 06 — Cursor personalizado

## Fecha
Septiembre - Octubre 2026

## Descripción
Cursor personalizado en forma de rombo cyberpunk que cambia según el contexto. Se implementa con SVG inline en CSS usando la propiedad `cursor`.

## Características

- **Rombo cian/magenta** para el cursor normal (default).
- **Círculo con punto** para elementos clicables (enlaces, botones).
- **Lápiz diagonal** para campos de texto e inputs.
- **Coherente** con la estética cyberpunk.
- **Cero peso** adicional (SVG inline en data URI).

## Cómo funciona

### Cursor por defecto (rombo)

Se aplica al `<html>` y `<body>`:

    html, body {
      cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Cpath d='M16 2 L30 16 L16 30 L2 16 Z' fill='%23050510' stroke='%2300fff7' stroke-width='1.5'/%3E%3Cpath d='M16 8 L24 16 L16 24 L8 16 Z' fill='%23ff00e5'/%3E%3C/svg%3E") 2 2, auto;
    }

Desglose del SVG:
- **Rombo exterior**: borde cian, relleno oscuro.
- **Rombo interior**: relleno magenta.
- **Punto caliente**: `2 2` (esquina superior izquierda).

### Cursor para elementos clicables

Se aplica a enlaces, botones, hotspots, etc.:

    a, button, .hotspot, .counter__head, .theme-toggle, .era-select,
    .contact-link, .contact-form__submit, .game, .nav a, .back-top,
    .scroll-cue, .text-link {
      cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Ccircle cx='16' cy='16' r='13' fill='none' stroke='%2300fff7' stroke-width='1.5'/%3E%3Ccircle cx='16' cy='16' r='6' fill='%23ff00e5'/%3E%3Ccircle cx='16' cy='16' r='2.5' fill='%23050510'/%3E%3C/svg%3E") 16 16, pointer;
    }

Desglose:
- **Círculo exterior**: borde cian.
- **Círculo medio**: relleno magenta.
- **Centro**: punto oscuro.
- **Punto caliente**: `16 16` (centro).

### Cursor para inputs de texto

Se aplica a campos de formulario:

    input, textarea, [contenteditable] {
      cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Cline x1='8' y1='24' x2='24' y2='8' stroke='%2300fff7' stroke-width='1.5' stroke-linecap='round'/%3E%3Cline x1='22' y1='6' x2='26' y2='10' stroke='%23ff00e5' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E") 8 24, text;
    }

Desglose:
- **Lápiz diagonal**: línea cian + punta magenta.
- **Punto caliente**: `8 24` (esquina inferior izquierda).

## Cómo se codifica el SVG

El SVG tiene que ir **inline** en formato `data:image/svg+xml,...` con caracteres especiales codificados:

| Carácter | Codificación |
|---|---|
| `<` | `%3C` |
| `>` | `%3E` |
| `#` | `%23` |
| `"` | `'` (comillas simples) |
| espacio | ` ` (mantener) |

**Ejemplo**: `#00fff7` → `%2300fff7`.

## Punto caliente

El **punto caliente** es la coordenada donde el clic "cuenta". Se define con los dos números al final:

    url(...) 2 2, auto;
             ^^^
             punto caliente

- **2 2**: esquina superior izquierda (rombo).
- **16 16**: centro (círculo).
- **8 24**: esquina inferior izquierda (lápiz).

## Compatibilidad

- **Chrome / Edge / Firefox**: soportan SVG en `cursor` desde hace años.
- **Safari**: soporta SVG, pero a veces tiene problemas con `data URI` largos.
- **Móvil**: los cursores no se aplican (no hay cursor físico).

**Fallback**: si el SVG no carga, se usa el valor por defecto (`auto`, `pointer`, `text`).

## Accesibilidad

Los cursores personalizados **no afectan a la accesibilidad**:
- El usuario que use **lector de pantalla** no depende del cursor.
- El usuario que use **teclado** navega con Tab.
- El usuario que use **puntero estándar** puede cambiar el cursor en su sistema operativo.

## Rendimiento

- **Cero peticiones HTTP** adicionales (SVG inline).
- **Cero peso** de descarga.
- **Renderizado nativo** del navegador.
- **Solo se aplica en desktop**: en móvil no se usa.

## Estado
✅ Completado

## Commits relacionados
- `feat(cursor): añadir cursor personalizado con rombo cyberpunk`
- `feat(cursor): variantes para clicables e inputs`
- `docs(prompts): documentar sistema de cursor personalizado`