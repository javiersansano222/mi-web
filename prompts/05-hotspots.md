# 05 — Diagrama interactivo del PC (hotspots)

## Fecha
Septiembre - Octubre 2026

## Descripción
Diagrama SVG interactivo de un PC gaming con hotspots que muestran información de cada componente al pasar el ratón. Reemplaza a un modelo 3D `.glb` original (65 MB, inviable).

## Características

- **SVG propio** dibujado a mano con ~300 líneas.
- **8 componentes** identificables: CPU, RAM, GPU, SSD, refrigeración, PSU, placa base, caja.
- **Tooltips** explicativos con título y descripción.
- **Ventiladores animados** con CSS (`transform: rotate`).
- **LEDs parpadeando** con `@keyframes`.
- **Modo "resaltar componente"** al pasar el ratón.
- **Leyenda clicable** con filtros por componente.
- **Cero peso adicional** (~40 KB de SVG).

## Estructura HTML

    <div class="pc-diagram">
      <svg class="pc-svg" viewBox="0 0 800 700">
        <!-- Chasis, componentes, ventiladores, LEDs... -->
      </svg>
      <div class="pc-tooltip" id="pc-tooltip" role="tooltip" aria-hidden="true">
        <strong class="pc-tooltip__title"></strong>
        <small class="pc-tooltip__desc"></small>
      </div>
      <ul class="pc-legend">
        <li><button type="button" class="pc-legend__btn" data-part="cpu">
          <span class="pc-legend__dot" style="--c:#ffd166"></span>CPU
        </button></li>
        <!-- ... más componentes ... -->
      </ul>
    </div>

## Cómo funciona

### JS: información de cada componente

    const partsInfo = {
      cpu: {
        title: "CPU",
        desc: "Procesador — el cerebro del PC. Ejecuta todas las instrucciones y coordina el resto de componentes."
      },
      ram: {
        title: "RAM",
        desc: "Memoria de acceso aleatorio — guarda temporalmente los datos que el PC está usando ahora mismo."
      },
      gpu: {
        title: "GPU",
        desc: "Tarjeta gráfica — se encarga de dibujar los gráficos, los juegos y acelerar tareas pesadas."
      },
      storage: {
        title: "Almacenamiento",
        desc: "SSD o disco duro — guarda de forma permanente tus archivos, programas y el sistema operativo."
      },
      cooling: {
        title: "Refrigeración",
        desc: "Ventiladores y radiador — mantienen fríos los componentes para que no se sobrecalienten."
      },
      psu: {
        title: "Fuente de alimentación",
        desc: "Transforma la corriente de la pared en la energía estable que necesitan todos los componentes."
      },
      mobo: {
        title: "Placa base",
        desc: "La columna vertebral del PC — conecta y comunica todos los componentes entre sí."
      },
      case: {
        title: "Caja / Chasis",
        desc: "Protege los componentes, guía el flujo de aire y define el aspecto de tu equipo."
      }
    };

### JS: mostrar/ocultar tooltip

    const showTooltip = (part, targetEl) => {
      const info = partsInfo[part];
      if (!info || !tooltip) return;
      tooltipTitle.textContent = info.title;
      tooltipDesc.textContent = info.desc;

      const diagramRect = pcDiagram.getBoundingClientRect();
      const targetRect = targetEl.getBoundingClientRect();
      const x = targetRect.left + targetRect.width / 2 - diagramRect.left;
      const y = targetRect.top - diagramRect.top;

      tooltip.style.left = x + "px";
      tooltip.style.top = y + "px";
      tooltip.classList.add("is-visible");
      tooltip.setAttribute("aria-hidden", "false");

      pcDiagram.classList.add("is-hovering");
      allParts.forEach((el) => el.classList.toggle("is-active", el.dataset.part === part));
    };

### JS: eventos

    allParts.forEach((el) => {
      el.addEventListener("mouseenter", () => showTooltip(el.dataset.part, el));
      el.addEventListener("mouseleave", hideTooltip);
      el.addEventListener("focus", () => showTooltip(el.dataset.part, el));
      el.addEventListener("blur", hideTooltip);
      el.addEventListener("click", () => showTooltip(el.dataset.part, el));
    });

### Ventiladores animados (CSS)

    .pc-fan__blades {
      transform-box: fill-box;
      transform-origin: center;
      animation: pc-fan-spin 3s linear infinite;
    }
    @keyframes pc-fan-spin {
      to { transform: rotate(360deg); }
    }

Cada grupo de ventiladores tiene velocidad distinta:
- **GPU**: 2.2s (más rápido).
- **CPU**: 2.5s.
- **Radiador**: 4s (más lento).
- **PSU**: 3.5s.

### LEDs parpadeando (SVG nativo)

    <circle cx="0" cy="0" r="2" fill="#00fff7">
      <animate attributeName="opacity" values="1;0.5;1" dur="1.8s" repeatCount="indefinite"/>
    </circle>

### Modo hover: atenuar los no activos

    .pc-diagram.is-hovering .pc-part {
      opacity: .3;
      filter: grayscale(.7);
    }
    .pc-diagram.is-hovering .pc-part.is-active {
      opacity: 1;
      filter: grayscale(0) drop-shadow(0 0 12px currentColor);
    }

## Por qué SVG en lugar de modelo 3D

El proyecto empezó con un modelo `.glb` de 65 MB (1.035.437 triángulos, 95 materiales). **Inviable para una web.**

Alternativas consideradas:
- **Comprimir a Draco**: bajaba a ~5 MB, pero con pérdida notable.
- **Carga diferida en desktop**: seguía siendo 5 MB de espera.
- **Foto del PC**: poco interactivo.

Se eligió el **SVG interactivo** porque:
- ✅ Cero peso adicional (~40 KB).
- ✅ Lighthouse 90+ intacto.
- ✅ Interactividad real (hotspots, tooltips, hover).
- ✅ Coherencia visual con la estética cyberpunk.
- ✅ Demuestra comprensión real de los componentes.

## Accesibilidad

- `role="tooltip"` en el tooltip.
- `aria-hidden` correctamente gestionado.
- `aria-label` en cada hotspot.
- Navegación por teclado con Tab + Enter.
- El tooltip aparece también en `:focus`.

## Estado
✅ Completado

## Commits relacionados
- `feat(pc): añadir diagrama SVG interactivo del PC`
- `feat(pc): implementar tooltips y hotspots`
- `feat(pc): animar ventiladores con CSS`
- `refactor(pc): eliminar modelo 3D .glb (65 MB) y quedarse con SVG`
- `docs(prompts): actualizar documentación de hotspots`