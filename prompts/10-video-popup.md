# 10 — Mini reproductor de vídeo

## Fecha
Octubre 2026

## Descripción
Mini reproductor flotante que aparece en la esquina inferior derecha al cargar la página. Muestra un vídeo de preview del próximo proyecto (Estate Genovés) y desaparece al terminar o al pulsar la X.

## Características

- **Vídeo propio generado con IA** (sin música).
- **Mini reproductor flotante** en esquina inferior derecha.
- **Aparece tras la intro** (1,2 s después).
- **Se reproduce sin sonido** (evita bloqueo de autoplay).
- **Se cierra automáticamente** al terminar el vídeo.
- **Botón de cerrar** manual.
- **Cierre con tecla `Escape`**.
- **Link directo** a `estate-genoves.html`.
- **Poster** (imagen previa) mientras carga.
- **Estilos coherentes** con la paleta activa.

## Cómo funciona

### Aparición

Al cargar la página:

1. Espera a que la intro termine (`body.is-loading` se elimina).
2. Espera 1,2 segundos adicionales.
3. Añade la clase `.is-visible` al mini reproductor.
4. Reproduce el vídeo tras 400 ms (para suavizar la transición).

### Cierre

El mini reproductor se cierra:

- **Al terminar el vídeo** (con 1 segundo de gracia para ver el botón).
- **Al pulsar la X** (botón manual).
- **Al pulsar `Escape`**.
- **Recarga de página** → vuelve a aparecer.

### Posicionamiento

- **Escritorio**: `bottom: 120px; right: 24px; width: 300px`.
- **Móvil (< 700px)**: ocupa todo el ancho disponible con `left` y `right` a 12px.
- **Encima del chatbot** para no solaparse (chatbot en `bottom: 28px`).

### Código clave

    const openMiniVideo = () => {
      miniVideo.classList.add("is-visible");
      miniVideo.setAttribute("aria-hidden", "false");
      setTimeout(() => {
        miniVideoPlayer.play().catch((err) => {
          console.warn("[mini-video] Autoplay bloqueado:", err);
        });
      }, 400);
    };

    const closeMiniVideo = () => {
      if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
      miniVideo.classList.remove("is-visible");
      miniVideo.setAttribute("aria-hidden", "true");
      miniVideoPlayer.pause();
    };

    miniVideoPlayer.addEventListener("ended", () => {
      closeTimer = setTimeout(closeMiniVideo, 1000);
    });

## Accesibilidad

- `aria-hidden` correctamente gestionado.
- Botón de cerrar con `aria-label`.
- Cierre con tecla `Escape`.
- `preload="metadata"` para no cargar el vídeo entero al inicio.
- `muted` y `playsinline` para permitir autoplay en móvil.

## Optimización

- **Vídeo comprimido** a ~1 MB.
- **Poster** en PNG/JPG ligero.
- **`preload="metadata"`**: solo carga la cabecera del vídeo, no el contenido.
- **Sin `autoplay`** en el HTML: se controla por JS para respetar `prefers-reduced-motion`.

## Estado
✅ Completado

## Commits relacionados
- `feat(video): añadir mini reproductor con vídeo del próximo proyecto`
- `feat(video): estilos del mini reproductor flotante en esquina inferior derecha`
- `feat(video): lógica del mini reproductor con cierre automático y manual`
- `fix(video): usar avance-genoves.png como poster del mini reproductor`