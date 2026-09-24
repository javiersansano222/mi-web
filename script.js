() => {
  "use strict";

  const root = document.documentElement;
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

  const safeGet = (key) => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  };

  const safeSet = (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch {
      // El sitio sigue funcionando aunque el navegador bloquee el almacenamiento.
    }
  };

  const eras = [
    "oro-noche",
    "cobre-esmeralda",
    "plata-carbon",
    "coral-abismo"
  ];

  const year = $("#year");
  if (year) {
    year.textContent = String(new Date().getFullYear());
  }

  const eraSelect = $("#era-select");
  const storedEra = safeGet("portfolio-era");

  if (storedEra && eras.includes(storedEra)) {
    root.dataset.era = storedEra;
  }

  if (eraSelect) {
    eraSelect.value = eras.includes(root.dataset.era)
      ? root.dataset.era
      : "oro-noche";

    eraSelect.addEventListener("change", () => {
      if (!eras.includes(eraSelect.value)) return;

      root.dataset.era = eraSelect.value;
      safeSet("portfolio-era", eraSelect.value);
    });
  }

  const themeToggle = $("#theme-toggle");
  const storedTheme = safeGet("portfolio-theme");

  if (storedTheme === "light" || storedTheme === "dark") {
    root.dataset.theme = storedTheme;
  }

  const syncThemeControl = () => {
    if (!themeToggle) return;

    const light = root.dataset.theme === "light";
    themeToggle.setAttribute("aria-pressed", String(light));
    themeToggle.setAttribute(
      "aria-label",
      light ? "Cambiar a tema oscuro" : "Cambiar a tema claro"
    );
  };

  syncThemeControl();

  themeToggle?.addEventListener("click", () => {
    root.dataset.theme =
      root.dataset.theme === "light" ? "dark" : "light";

    safeSet("portfolio-theme", root.dataset.theme);
    syncThemeControl();
  });

  const navToggle = $("#nav-toggle");
  const mainNav = $("#main-nav");

  const setMenu = (open) => {
    if (!navToggle || !mainNav) return;

    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute(
      "aria-label",
      open ? "Cerrar menú" : "Abrir menú"
    );
    mainNav.classList.toggle("nav-open", open);
  };

  navToggle?.addEventListener("click", () => {
    setMenu(navToggle.getAttribute("aria-expanded") !== "true");
  });

  $$("a", mainNav || document).forEach((link) => {
    link.addEventListener("click", () => setMenu(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMenu(false);
  });

  document.addEventListener("click", (event) => {
    if (
      mainNav?.classList.contains("nav-open") &&
      !mainNav.contains(event.target) &&
      !navToggle?.contains(event.target)
    ) {
      setMenu(false);
    }
  });

  const progress = $("#scroll-progress");
  let scrollQueued = false;

  const updateProgress = () => {
    if (!progress) return;

    const max =
      document.documentElement.scrollHeight - window.innerHeight;

    const value =
      max > 0
        ? Math.min(100, Math.max(0, (window.scrollY / max) * 100))
        : 0;

    progress.style.width = `${value}%`;
    progress.setAttribute("aria-valuenow", String(Math.round(value)));
    scrollQueued = false;
  };

  window.addEventListener(
    "scroll",
    () => {
      if (!scrollQueued) {
        window.requestAnimationFrame(updateProgress);
        scrollQueued = true;
      }
    },
    { passive: true }
  );

  window.addEventListener("resize", updateProgress, { passive: true });
  updateProgress();

  const revealItems = $$(".reveal");

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -35px 0px"
      }
    );

    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  const typewriter = $("#typewriter");
  const phrases = [
    "ser programador",
    "crear proyectos diferentes",
    "no rendirme ante un reto"
  ];

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  if (typewriter && !reduceMotion.matches) {
    let phraseIndex = 0;
    let letterIndex = phrases[0].length;
    let deleting = true;

    const type = () => {
      const phrase = phrases[phraseIndex];
      letterIndex += deleting ? -1 : 1;
      typewriter.textContent = phrase.slice(0, letterIndex);

      let delay = deleting ? 42 : 75;

      if (letterIndex <= 0) {
        deleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        delay = 380;
      }

      if (
        letterIndex >= phrases[phraseIndex].length &&
        !deleting
      ) {
        deleting = true;
        delay = 1450;
      }

      window.setTimeout(type, delay);
    };

    window.setTimeout(type, 1700);
  }

  const cards = $$("[data-tilt]");
  const finePointer = window.matchMedia(
    "(hover: hover) and (pointer: fine)"
  );

  if (finePointer.matches && !reduceMotion.matches) {
    cards.forEach((card) => {
      card.addEventListener("pointermove", (event) => {
        const bounds = card.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width - 0.5;
        const y = (event.clientY - bounds.top) / bounds.height - 0.5;

        card.style.transform =
          `perspective(900px) rotateX(${-y * 3}deg) ` +
          `rotateY(${x * 3}deg) translateY(-2px)`;
      });

      card.addEventListener("pointerleave", () => {
        card.style.transform = "";
      });
    });
  }

  const canvas = $("#particles");
  const context = canvas?.getContext("2d", { alpha: true });

  if (canvas && context && !reduceMotion.matches) {
    let width = 0;
    let height = 0;
    let particles = [];
    let frame = 0;

    const pointer = {
      x: -1000,
      y: -1000,
      active: false
    };

    const particleCount = () =>
      Math.min(48, Math.max(18, Math.floor(window.innerWidth / 28)));

    const resizeCanvas = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);

      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);

      context.setTransform(ratio, 0, 0, ratio, 0, 0);

      particles = Array.from(
        { length: particleCount() },
        () => ({
          x: Math.random() * width,
          y: Math.random() * height,
          r: Math.random() * 1.7 + 0.4,
          speed: Math.random() * 0.22 + 0.08,
          phase: Math.random() * Math.PI * 2
        })
      );
    };

    const draw = () => {
      context.clearRect(0, 0, width, height);
      const time = performance.now() * 0.001;

      particles.forEach((particle) => {
        particle.y -= particle.speed;
        particle.x += Math.sin(time + particle.phase) * 0.13;

        if (particle.y < -4) {
          particle.y = height + 4;
          particle.x = Math.random() * width;
        }

        let alpha =
          0.28 + Math.sin(time * 0.8 + particle.phase) * 0.14;

        if (pointer.active) {
          const dx = pointer.x - particle.x;
          const dy = pointer.y - particle.y;

          if (dx * dx + dy * dy < 90 * 90) {
            alpha = 0.78;
          }
        }

        context.beginPath();
        context.fillStyle = `rgba(230, 204, 139, ${alpha})`;
        context.arc(
          particle.x,
          particle.y,
          particle.r,
          0,
          Math.PI * 2
        );
        context.fill();
      });

      frame = window.requestAnimationFrame(draw);
    };

    resizeCanvas();
    draw();

    window.addEventListener("resize", resizeCanvas, { passive: true });

    window.addEventListener(
      "pointermove",
      (event) => {
        pointer.x = event.clientX;
        pointer.y = event.clientY;
        pointer.active = true;
      },
      { passive: true }
    );

    window.addEventListener(
      "pointerleave",
      () => {
        pointer.active = false;
      },
      { passive: true }
    );

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        window.cancelAnimationFrame(frame);
      } else if (!reduceMotion.matches) {
        draw();
      }
    });
  }

    /* =========================================================
     CONTADOR "COSAS QUE HE HECHO"
     ========================================================= */

  // 1. Cogemos las referencias del DOM
  //    counter    → el contenedor (.counter) que lleva la clase is-open
  //    counterHead → el botón (.counter__head) que recibe el clic
  const counter = $("#counter");
  const counterHead = $(".counter__head");

  // 2. Función que abre o cierra el contador
  //    Recibe un booleano: true = abrir, false = cerrar
  const setCounter = (open) => {
    // Si no existe el contador en el DOM, no hacemos nada (por seguridad)
    if (!counter || !counterHead) return;

    // Añade o quita la clase .is-open del contenedor
    // classList.toggle("is-open", true)  → añade la clase
    // classList.toggle("is-open", false) → quita la clase
    counter.classList.toggle("is-open", open);

    // Actualiza el atributo aria-expanded para accesibilidad
    // (los lectores de pantalla sabrán si está abierto o cerrado)
    counterHead.setAttribute("aria-expanded", String(open));

    // Guarda el estado en localStorage
    // "open" o "closed" → así al recargar recordamos cómo estaba
    safeSet("portfolio-counter", open ? "open" : "closed");
  };

  // 3. Al cargar la página, leemos la preferencia guardada
  //    Si el usuario dejó el contador abierto, lo abrimos otra vez
  const storedCounter = safeGet("portfolio-counter");
  if (storedCounter === "open") {
    setCounter(true);
  }

  // 4. Escuchamos el clic en la cabecera
  //    El símbolo "?." (optional chaining) evita error si counterHead es null
  counterHead?.addEventListener("click", () => {
    // ¿Está abierto AHORA MISMO?
    const isOpen = counter?.classList.contains("is-open");

    // Si está abierto (true), lo cerramos (false)
    // Si está cerrado (false), lo abrimos (true)
    // El "!" invierte el valor: !true = false, !false = true
    setCounter(!isOpen);
  });
})();
