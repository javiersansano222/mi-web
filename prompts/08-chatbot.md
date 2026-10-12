# 08 — Chatbot multilingüe

## Fecha
Octubre 2026

## Descripción
Asistente conversacional flotante que responde a preguntas sobre Javier, sus proyectos, estudios, PC y contacto. Detecta el idioma automáticamente y permite cambio manual.

## Características

- **4 idiomas**: Español (ES), Valencià (VA), English (EN), Français (FR).
- **Detección automática** del idioma al escribir.
- **Selector manual** en el header del chat.
- **Persistencia** del idioma en `localStorage` (`portfolio-chat-lang`).
- **Respuestas aleatorias** para no repetir siempre lo mismo.
- **Preguntas rápidas** con botones (Proyectos, Contacto, Estudios, PC, Juegos).
- **Indicador de "escribiendo..."** con animación.
- **Persistencia del estado abierto/cerrado** en `localStorage`.

## Cómo funciona

### Estructura

El chatbot usa un objeto `knowledge` con la estructura:

    const knowledge = {
      es: {
        greeting: {
          keys: ["hola", "buenas", "hey"],
          reply: [
            "¡Hola! Soy el asistente de Javier...",
            "¡Buenas! ¿Sobre qué te gustaría saber?..."
          ]
        },
        projects: { ... },
        contact: { ... },
        studies: { ... },
        pc: { ... },
        games: { ... },
        thanks: { ... },
        bye: { ... },
        unknown: [...]
      },
      va: { ... },
      en: { ... },
      fr: { ... }
    };

### Detección de idioma

Se analiza el texto del usuario con regex y se le asigna una puntuación a cada idioma:

    const hints = {
      es: /\b(qué|que|cómo|como|dónde|...)\b/,
      va: /\b(què|com|on|qui|...)\b/,
      en: /\b(what|how|where|who|...)\b/,
      fr: /\b(quoi|comment|où|qui|...)\b/
    };

Se tienen en cuenta caracteres especiales:
- `ñ`, `¿`, `¡` → suma a español
- `ç` → suma a valenciano y francés
- `à`, `è`, `ù` → suma a francés

### Búsqueda de respuesta

Se normaliza el texto (elimina tildes) y se busca la primera key que coincida:

    for (const key in dict) {
      if (key === "unknown") continue;
      const item = dict[key];
      for (const k of item.keys) {
        if (t.includes(k)) {
          return item.reply[Math.floor(Math.random() * item.reply.length)];
        }
      }
    }

Si no hay coincidencia, se devuelve una respuesta de `unknown`.

## Seguridad

Los mensajes del bot se **escapan** para prevenir XSS:

    const allowed = text
      .replace(/<(?!\/?(strong|em|br)\b)[^>]*>/gi, '')
      .replace(/&(?!(amp|lt|gt|quot|#039);)/g, '&amp;');

Solo permite las etiquetas `<strong>`, `<em>` y `<br>`.

## Accesibilidad

- `role="log"` y `aria-live="polite"` en el contenedor de mensajes.
- `aria-expanded` en el botón de abrir/cerrar.
- `aria-hidden` en el panel cuando está cerrado.
- Cierre con tecla `Escape`.
- Focus al input cuando se abre.

## Estado
✅ Completado

## Commits relacionados
- `feat(chat): añadir chatbot multilingüe con detección automática`
- `feat(chat): persistir idioma y estado abierto/cerrado`
- `fix(chat): escapar HTML en mensajes del bot`