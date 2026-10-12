# 09 — NASA APOD con caché

## Fecha
Octubre 2026

## Descripción
Sección que muestra la Foto Astronómica del Día (Astronomy Picture of the Day) de la NASA. Incluye sistema de caché en `localStorage` con fallback para cuando la API falla.

## Características

- **Foto del día** de la NASA con título, fecha y explicación.
- **Selector de fecha** para consultar días anteriores.
- **Botón "Hoy"** para volver a la fecha actual.
- **Caché en localStorage** con TTL de 24 horas.
- **Fallback a caché antigua** (hasta 30 días) si la API falla.
- **Soporte para vídeo** (YouTube embebido o MP4 directo).
- **Placeholder elegante** si la API no responde.
- **Botón "Reintentar"** para volver a intentar.

## Cómo funciona

### Flujo de carga

1. Si no se ha pedido fecha concreta, se mira primero la caché:
   - **Caché fresca (< 24h)** → se usa directamente sin llamar a la API.
   - **Sin caché o caducada** → se llama a la API.
2. Si la API responde OK → se guarda en caché y se renderiza.
3. Si la API falla → se intenta con la foto de ayer.
4. Si ayer también falla → se usa la caché antigua como fallback.
5. Si no hay caché → se muestra el placeholder de error.

### Estructura de la caché

    {
      time: 1697049600000,       // timestamp
      data: {
        title: "...",
        date: "2026-10-12",
        media_type: "image",
        url: "...",
        hdurl: "...",
        explanation: "..."
      }
    }

### Variables clave

    const APOD_CACHE_KEY = "portfolio-apod-cache";
    const APOD_CACHE_TTL = 24 * 60 * 60 * 1000;        // 24h fresca
    const APOD_CACHE_MAX_AGE = 30 * 24 * 60 * 60 * 1000; // 30 días máximo

### Funciones principales

- `getApodCache()`: lee la caché de localStorage.
- `setApodCache(data)`: guarda la caché con timestamp.
- `isCacheFresh(cache)`: comprueba si es menor de 24h.
- `isCacheUsable(cache)`: comprueba si es menor de 30 días.
- `renderApod(apod, fromCache)`: pinta el APOD en el DOM.
- `loadApod(date)`: carga la foto (con o sin fecha).

## Por qué la caché

La API de la NASA **devuelve errores 500 con mucha frecuencia** (servidor antiguo, mantenimiento, etc.). Sin caché, la sección siempre mostraría el placeholder de error.

Con caché:
- **Primera visita exitosa** → guarda la foto.
- **Siguientes visitas** → muestra la foto cacheada aunque la API falle.
- **Solo se consulta la API** una vez al día.

## Estado
✅ Completado

## Commits relacionados
- `feat(apod): añadir sección con foto del día de la NASA`
- `feat(apod): añadir caché en localStorage con fallback si la NASA falla`
- `fix(apod): manejar errores 500 y 503 de la API`