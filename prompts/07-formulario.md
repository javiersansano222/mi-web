# 07 — Formulario de contacto

## Fecha
Septiembre - Octubre 2026

## Descripción
Formulario de contacto del portafolio y de la página secundaria "Estate Genovés". Ambos envían correos reales a través de Web3Forms, sin necesidad de backend.

## Características

- **Envío real** de correos vía Web3Forms (250 envíos/mes gratis).
- **Honeypot anti-spam** (`botcheck`).
- **Redirección** a página de gracias personalizada.
- **Feedback visual** al enviar (botón deshabilitado + texto "Enviando...").
- **Doble formulario** en el proyecto:
  - Portafolio principal → `gracias.html`.
  - Estate Genovés → `estate-gracias.html`.
- **Accesibilidad**: labels, autocomplete, foco visible.

## Estructura HTML

### Formulario del portafolio principal (`index.html`)

    <form class="contact-form"
          action="https://api.web3forms.com/submit"
          method="POST">
      <input type="hidden" name="access_key" value="b5eb61c8-d0c0-4069-9a99-07ef5e5ef04f">
      <input type="hidden" name="redirect" value="https://javiersansano222.github.io/mi-web/gracias.html">
      <input type="hidden" name="subject" value="Nuevo mensaje desde tu portafolio">
      <input type="hidden" name="from_name" value="Portafolio Javier Sansano">
      <input type="checkbox" name="botcheck" style="display:none" tabindex="-1" autocomplete="off">

      <p class="contact-form__label">O escríbeme directamente:</p>

      <div class="contact-form__row">
        <div class="contact-form__field">
          <label for="form-nombre">Nombre</label>
          <input type="text" id="form-nombre" name="nombre"
                 placeholder="Tu nombre" required autocomplete="name">
        </div>
        <div class="contact-form__field">
          <label for="form-email">Email</label>
          <input type="email" id="form-email" name="email"
                 placeholder="tu@email.com" required autocomplete="email">
        </div>
      </div>

      <div class="contact-form__field">
        <label for="form-mensaje">Mensaje</label>
        <textarea id="form-mensaje" name="mensaje" rows="5"
                  placeholder="Cuéntame en qué puedo ayudarte..." required></textarea>
      </div>

      <button type="submit" class="contact-form__submit">
        Enviar mensaje <span aria-hidden="true">→</span>
      </button>
    </form>

### Formulario de Estate Genovés (`estate-genoves.html`)

Mismo patrón, pero con `subject`, `from_name` y `redirect` adaptados:

    <input type="hidden" name="subject" value="Nuevo mensaje desde Estate Genovés">
    <input type="hidden" name="from_name" value="Estate Genovés">
    <input type="hidden" name="redirect" value="https://javiersansano222.github.io/mi-web/estate-gracias.html">

## Cómo funciona Web3Forms

1. El usuario rellena el formulario.
2. Al enviar, se hace `POST` a `https://api.web3forms.com/submit`.
3. Web3Forms recibe los datos y los reenvía al correo asociado al `access_key`.
4. Redirige al usuario a la página indicada en `redirect`.

## Por qué Web3Forms

Se evaluaron 3 alternativas:

| Servicio | Precio | Autoresponder | Panel | Límite |
|---|---|---|---|---|
| **Web3Forms** | Gratis | Solo Pro | ✅ | 250/mes |
| **Formspree** | Gratis | ✅ | ✅ | 50/mes |
| **FormSubmit** | Gratis | ✅ | ❌ | Sin límite |

**Web3Forms** fue el elegido porque:
- 250 envíos/mes (5× más que Formspree).
- Tiene panel de control.
- Redirección personalizada.
- Se probó FormSubmit, pero mostraba su propia página de "Thanks!" antes de activar el formulario y era más opaco.
- El **autoresponder** (respuesta automática) solo está en el plan Pro, pero no es crítico.

## Honeypot anti-spam

El campo `botcheck` está oculto con CSS. Los bots lo rellenan, los humanos no. Web3Forms ignora los envíos con `botcheck` relleno.

    <input type="checkbox" name="botcheck" style="display:none" tabindex="-1" autocomplete="off">

## Feedback visual al enviar

En `script.js`:

    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
      const submitBtn = contactForm.querySelector('.contact-form__submit');
      contactForm.addEventListener('submit', () => {
        if (submitBtn) {
          submitBtn.disabled = true;
          const originalText = submitBtn.innerHTML;
          submitBtn.innerHTML = 'Enviando... <span aria-hidden="true">⏳</span>';
          setTimeout(() => {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
          }, 5000);
        }
      });
    }

Cuando el usuario envía:
- El botón se deshabilita.
- El texto cambia a "Enviando... ⏳".
- Tras 5 segundos se restaura (por si falla el envío).

## Páginas de gracias

Ambos formularios redirigen a su propia página de gracias:

- **Portafolio**: `gracias.html` con estética cyberpunk (cian/magenta).
- **Estate Genovés**: `estate-gracias.html` con estética elegante (dorado/negro).

Cada página tiene:
- Mensaje personalizado.
- Botón de volver al inicio.
- Enlaces secundarios.
- Footer coherente con su estilo.

## Accesibilidad

- **`<label>`** asociado a cada input con `for`/`id`.
- **`autocomplete`** en nombre y email.
- **`required`** en todos los campos obligatorios.
- **Foco visible** con `outline` en `:focus`.
- **Contraste** cuidado en textos y placeholders.
- **`aria-label`** en el botón de envío.

## Estado
✅ Completado

## Commits relacionados
- `feat(contact): añadir formulario con Web3Forms`
- `feat(contact): añadir página de gracias personalizada`
- `feat(estate): conectar formulario de Estate Genovés a Web3Forms`
- `feat(estate): crear página de gracias específica para Estate Genovés`
- `revert(contact): volver a Web3Forms tras descartar FormSubmit`
- `docs(prompts): documentar sistema de formularios`