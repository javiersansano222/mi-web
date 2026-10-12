# 11 — Analítica ligera (GoatCounter)

## Fecha
Octubre 2026

## Descripción
Sistema de analítica web sin cookies basado en GoatCounter. Permite saber cuántas visitas recibe el portafolio, desde dónde y qué páginas son las más vistas, todo sin comprometer la privacidad del usuario.

## Características

- **Sin cookies**: cumple GDPR por diseño.
- **Sin banner de consentimiento**: no hace falta.
- **Peso mínimo**: ~3 KB (vs. ~100 KB de Google Analytics).
- **Estadísticas en tiempo real**: visitas, páginas, referrers.
- **Panel público o privado**: configurable.
- **Filtra bots**: ignora rastreadores identificados.
- **No afecta al Lighthouse**: el script es muy ligero.

## Cómo funciona

### Instalación

Se añade un script en el `<head>` de `index.html`:

    <script data-goatcounter="https://javiersansano.goatcounter.com/count"
            async src="https://gc.zgo.at/count.js"></script>

**Importante**: usar `https://` explícito (no `//`) para que funcione también en local.

### Qué hace el script

1. Detecta una visita a la página.
2. Envía un ping al servidor de GoatCounter.
3. GoatCounter lo registra (sin cookies, sin IP).
4. Los datos se muestran en el panel `javiersansano.goatcounter.com`.

### Panel de estadísticas

Accesible en `https://javiersansano.goatcounter.com`:
- **Visitas totales**.
- **Visitas por día/hora**.
- **Páginas más vistas**.
- **Referrers** (desde dónde llegan).
- **Países**.
- **Navegadores y sistemas operativos**.
- **Resolución de pantalla**.

## Por qué GoatCounter

Se evaluaron 3 alternativas:

| Servicio | Precio | Cookies | Peso | GDPR |
|---|---|---|---|---|
| **Google Analytics** | Gratis | Sí | ~100 KB | ❌ Requiere banner |
| **Plausible** | 9€/mes | No | ~1 KB | ✅ |
| **GoatCounter** | Gratis | No | ~3 KB | ✅ |

**GoatCounter** es la mejor relación calidad/precio para un portafolio personal.

## Limitaciones

- **Bloqueadores de anuncios**: ~30% de usuarios usan bloqueadores que pueden bloquear el script. Las cifras serán ligeramente inferiores a la realidad.
- **Actualización**: el panel se actualiza cada 10 segundos.
- **Sin datos personales**: no se puede saber "quién" visitó, solo "cuántos".

## Privacidad

GoatCounter **no usa cookies** ni almacena direcciones IP. Los datos son **agregados**:
- ✅ "40 personas usaron Firefox hoy"
- ❌ "Juan Pérez de Valencia visitó a las 3:14"

Esto lo hace **GDPR-compliant** por diseño. No se necesita banner de cookies.

## Uso para la defensa oral

Se puede consultar el panel en vivo durante la defensa para mostrar:
- **Número de visitas** del portafolio.
- **Páginas más vistas**.
- **Países** desde donde se accede.

**Argumento técnico**: *"Añadí GoatCounter en lugar de Google Analytics porque pesa 30 veces menos, no usa cookies y cumple GDPR sin necesidad de banner. Con la información del panel puedo saber qué secciones interesan más a los visitantes."*

## Estado
✅ Completado

## Commits relacionados
- `feat(analytics): añadir GoatCounter para estadísticas sin cookies`
- `fix(analytics): usar https explícito para evitar fallos en local`