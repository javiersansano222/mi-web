(() => {
  "use strict";

  const root = document.documentElement;
  const $ = (sel, scope = document) => scope.querySelector(sel);
  const $$ = (sel, scope = document) => [...scope.querySelectorAll(sel)];

  const safeGet = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
  const safeSet = (k, v) => { try { localStorage.setItem(k, v); } catch {} };
  const prefersReducedMotion = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // --- Función de escape para prevenir XSS en innerHTML ---
  const escapeHTML = (str) => {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  /* =========================================================
     0. WIDGET DEL TIEMPO (Open-Meteo)
     ========================================================= */
  const weatherBox  = $("#weather");
  const weatherIcon = $("#weather-icon");
  const weatherTemp = $("#weather-temp");
  const weatherCity = $("#weather-city");

  const WEATHER_LAT  = 38.6370;
  const WEATHER_LON  = -0.8658;
  const WEATHER_CITY = "Valencia";

  const weatherCodes = {
    0:  { icon: "☀️",  label: "Despejado" },
    1:  { icon: "🌤️", label: "Mayormente despejado" },
    2:  { icon: "⛅",  label: "Parcialmente nublado" },
    3:  { icon: "☁️",  label: "Nublado" },
    45: { icon: "🌫️", label: "Niebla" },
    48: { icon: "🌫️", label: "Niebla helada" },
    51: { icon: "🌦️", label: "Llovizna ligera" },
    53: { icon: "🌦️", label: "Llovizna" },
    55: { icon: "🌧️", label: "Llovizna densa" },
    61: { icon: "🌧️", label: "Lluvia ligera" },
    63: { icon: "🌧️", label: "Lluvia" },
    65: { icon: "🌧️", label: "Lluvia fuerte" },
    71: { icon: "🌨️", label: "Nieve ligera" },
    73: { icon: "❄️",  label: "Nieve" },
    75: { icon: "❄️",  label: "Nieve fuerte" },
    80: { icon: "🌦️", label: "Chubascos" },
    81: { icon: "🌧️", label: "Chubascos fuertes" },
    82: { icon: "⛈️",  label: "Chubascos violentos" },
    95: { icon: "⛈️",  label: "Tormenta" },
    96: { icon: "⛈️",  label: "Tormenta con granizo" },
    99: { icon: "⛈️",  label: "Tormenta fuerte" }
  };

  const getWeatherInfo = (code) =>
    weatherCodes[code] || { icon: "🌡️", label: "—" };

  const loadWeather = async () => {
    if (!weatherBox) return;

    try {
      const url = `https://api.open-meteo.com/v1/forecast` +
        `?latitude=${WEATHER_LAT}` +
        `&longitude=${WEATHER_LON}` +
        `&current_weather=true` +
        `&timezone=auto`;

      const res = await fetch(url);
      if (!res.ok) throw new Error("Open-Meteo " + res.status);
      const data = await res.json();

      if (!data.current_weather) throw new Error("Sin datos");

      const temp = Math.round(data.current_weather.temperature);
      const code = data.current_weather.weathercode;
      const info = getWeatherInfo(code);

      if (weatherIcon) weatherIcon.textContent = info.icon;
      if (weatherTemp) weatherTemp.textContent = `${temp}°C`;
      if (weatherCity) weatherCity.textContent = WEATHER_CITY;

      weatherBox.setAttribute("title",
        `${info.label} · ${temp}°C en ${WEATHER_CITY}`);

      weatherBox.hidden = false;

      console.info("[weather] OK:", temp + "°C,", info.label);

    } catch (err) {
      console.warn("[weather] No se pudo cargar:", err);
      weatherBox.hidden = true;
    }
  };

  loadWeather();
  window.setInterval(loadWeather, 30 * 60 * 1000);

  console.info("[script] Iniciando…");

  /* =========================================================
     1. INTRO
     ========================================================= */
  const introOverlay = $("#intro-overlay");
  const introBar = $("#intro-bar");
  const introPercent = $("#intro-percent");

  const introAlreadySeen = safeGet("portfolio-intro-seen") === "true";
  const skipIntro = prefersReducedMotion() || introAlreadySeen;

  const finishIntro = () => {
    document.body.classList.remove("is-loading");
    safeSet("portfolio-intro-seen", "true");
    if (!introOverlay) return;
    introOverlay.classList.add("is-hidden");
    window.setTimeout(() => {
      introOverlay.setAttribute("aria-hidden", "true");
      introOverlay.style.display = "none";
    }, 1100);
  };

  if (!introOverlay) {
    document.body.classList.remove("is-loading");
  } else if (skipIntro) {
    introOverlay.style.display = "none";
    introOverlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("is-loading");
    console.info("[script] Intro saltada.");
  } else {
    const startTime = performance.now();
    const minDuration = 1400;

    const step = () => {
      const elapsed = performance.now() - startTime;
      const t = Math.min(1, elapsed / minDuration);
      const eased = 1 - Math.pow(1 - t, 3);
      const value = Math.round(eased * 100);

      if (introBar) introBar.style.width = value + "%";
      if (introPercent) introPercent.textContent = value + "%";

      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        window.setTimeout(finishIntro, 350);
      }
    };
    requestAnimationFrame(step);
  }

  window.setTimeout(() => {
    if (document.body.classList.contains("is-loading")) {
      console.warn("[script] Timeout de seguridad: liberando scroll");
      finishIntro();
    }
  }, 4000);

  /* =========================================================
     2. AÑO FOOTER
     ========================================================= */
  const year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());

  /* =========================================================
     3. ERAS
     ========================================================= */
  const eras = ["oro-noche", "cobre-esmeralda", "plata-carbon", "coral-abismo"];
  const eraSelect = $("#era-select");
  const storedEra = safeGet("portfolio-era");
  if (storedEra && eras.includes(storedEra)) root.dataset.era = storedEra;

  if (eraSelect) {
    eraSelect.value = eras.includes(root.dataset.era) ? root.dataset.era : "oro-noche";
    eraSelect.addEventListener("change", () => {
      if (!eras.includes(eraSelect.value)) return;
      root.dataset.era = eraSelect.value;
      safeSet("portfolio-era", eraSelect.value);
    });
  }

  /* =========================================================
     4. TEMA
     ========================================================= */
  const themeToggle = $("#theme-toggle");
  const storedTheme = safeGet("portfolio-theme");
  if (storedTheme === "light" || storedTheme === "dark") root.dataset.theme = storedTheme;

  const syncThemeControl = () => {
    if (!themeToggle) return;
    const light = root.dataset.theme === "light";
    themeToggle.setAttribute("aria-pressed", String(light));
    themeToggle.setAttribute("aria-label",
      light ? "Cambiar a tema oscuro" : "Cambiar a tema claro");
  };
  syncThemeControl();

  themeToggle?.addEventListener("click", () => {
    root.dataset.theme = root.dataset.theme === "light" ? "dark" : "light";
    safeSet("portfolio-theme", root.dataset.theme);
    syncThemeControl();
  });

  /* =========================================================
     5. MENÚ MÓVIL
     ========================================================= */
  const navToggle = $("#nav-toggle");
  const mainNav = $("#main-nav");

  const setMenu = (open) => {
    if (!navToggle || !mainNav) return;
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    mainNav.classList.toggle("nav-open", open);
    document.body.style.overflow = open ? 'hidden' : '';
  };

  navToggle?.addEventListener("click", () => {
    setMenu(navToggle.getAttribute("aria-expanded") !== "true");
  });

  $$("a", mainNav || document).forEach((link) => {
    link.addEventListener("click", () => setMenu(false));
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setMenu(false);
  });

  /* =========================================================
   5.5. EFECTO MATRIX (codificado → descodificar al hover)
   Solo se activa en dispositivos con ratón (hover: hover) y
   puntero fino. En móvil/táctil se deja el texto tal cual.
   ========================================================= */
const matrixChars = "#@$%!*&?¿¡+=";
const finePointerForMatrix = window.matchMedia("(hover: hover) and (pointer: fine)");

const generateRandomCode = (length) => {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += matrixChars[Math.floor(Math.random() * matrixChars.length)];
  }
  return out;
};

const initMatrixElement = (el) => {
  // Guardamos el texto original
  if (!el.dataset.matrixOriginal) {
    el.dataset.matrixOriginal = el.textContent.trim();
  }
  const original = el.dataset.matrixOriginal;
  const len = original.length;

  // Estado inicial: codificado, QUIETO (no cambia solo)
  el.textContent = generateRandomCode(len);
  el.classList.add("is-coded");

  // Función para descodificar letra a letra
  const decode = () => {
    if (el.dataset.matrixRunning === "true") return;
    if (el.classList.contains("is-decoded")) return;

    el.dataset.matrixRunning = "true";
    el.classList.remove("is-coded");
    el.classList.add("is-decoding");

    const chars = original.split("");
    const totalSteps = 12;
    let step = 0;

    const interval = setInterval(() => {
      el.textContent = chars.map((ch, i) => {
        if (ch === " ") return " ";
        const threshold = (i / chars.length) * totalSteps;
        if (step >= totalSteps - threshold) return ch;
        return matrixChars[Math.floor(Math.random() * matrixChars.length)];
      }).join("");

      step++;

      if (step > totalSteps) {
        clearInterval(interval);
        el.textContent = original;
        el.classList.remove("is-decoding");
        el.classList.add("is-decoded");
        el.dataset.matrixRunning = "false";
      }
    }, 50);
  };

  el.addEventListener("mouseenter", decode);
  el.addEventListener("touchstart", decode, { passive: true });
  el.addEventListener("focus", decode);
};

// ⚠️ Solo aplicar efecto Matrix en dispositivos con ratón.
// En móvil/táctil, dejamos el texto normal legible.
if (finePointerForMatrix.matches && !prefersReducedMotion()) {
  $$("[data-matrix]").forEach((el) => initMatrixElement(el));
} else {
  // En táctil: nos aseguramos de que el texto original está tal cual,
  // y guardamos el original en dataset por si acaso.
  $$("[data-matrix]").forEach((el) => {
    if (!el.dataset.matrixOriginal) {
      el.dataset.matrixOriginal = el.textContent.trim();
    }
    el.textContent = el.dataset.matrixOriginal;
  });
}
  /* =========================================================
     16. INDICADOR DE SECCIÓN ACTIVA EN EL MENÚ
     ========================================================= */
  const navLinks = $$("a", mainNav || document).filter((a) => {
    const href = a.getAttribute("href") || "";
    return href.startsWith("#") && href.length > 1;
  });

  if (navLinks.length > 0 && "IntersectionObserver" in window) {
    const linkMap = new Map();
    navLinks.forEach((link) => {
      const id = link.getAttribute("href").slice(1);
      const section = document.getElementById(id);
      if (section) linkMap.set(section, link);
    });

    const sections = [...linkMap.keys()];

    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.forEach((l) => l.classList.remove("is-active"));
        link.classList.add("is-active");
      });
    });

    const setActive = (section) => {
      navLinks.forEach((l) => l.classList.remove("is-active"));
      const link = linkMap.get(section);
      if (link) link.classList.add("is-active");
    };

    const visibleSections = new Map();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            visibleSections.set(entry.target, entry.intersectionRatio);
          } else {
            visibleSections.delete(entry.target);
          }
        });

        if (visibleSections.size > 0) {
          let bestSection = null;
          let bestRatio = 0;
          visibleSections.forEach((ratio, section) => {
            if (ratio > bestRatio) {
              bestRatio = ratio;
              bestSection = section;
            }
          });
          if (bestSection) setActive(bestSection);
        }
      },
      {
        rootMargin: "-40% 0px -40% 0px",
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1]
      }
    );

    sections.forEach((section) => observer.observe(section));
  }

  /* =========================================================
     6. BARRA DE PROGRESO SCROLL
     ========================================================= */
  const progress = $("#scroll-progress");
  let scrollQueued = false;
  const updateProgress = () => {
    if (!progress) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const value = max > 0 ? Math.min(100, Math.max(0, (window.scrollY / max) * 100)) : 0;
    progress.style.width = value + "%";
    progress.setAttribute("aria-valuenow", String(Math.round(value)));
    scrollQueued = false;
  };
  window.addEventListener("scroll", () => {
    if (!scrollQueued) {
      requestAnimationFrame(updateProgress);
      scrollQueued = true;
    }
  }, { passive: true });
  window.addEventListener("resize", updateProgress, { passive: true });
  updateProgress();

  /* =========================================================
     7. REVEAL
     ========================================================= */
  const revealItems = $$(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -35px 0px" });
    revealItems.forEach((el) => io.observe(el));
  } else {
    revealItems.forEach((el) => el.classList.add("is-visible"));
  }

  /* =========================================================
     8. TYPEWRITER
     ========================================================= */
  const typewriter = $("#typewriter");
  const phrases = ["ser programador", "crear proyectos diferentes", "no rendirme ante un reto"];
  if (typewriter && !prefersReducedMotion()) {
    let pi = 0, li = phrases[0].length, deleting = true;
    const type = () => {
      const phrase = phrases[pi];
      li += deleting ? -1 : 1;
      typewriter.textContent = phrase.slice(0, li);
      let delay = deleting ? 42 : 75;
      if (li <= 0) {
        deleting = false;
        pi = (pi + 1) % phrases.length;
        delay = 380;
      }
      if (li >= phrases[pi].length && !deleting) {
        deleting = true;
        delay = 1450;
      }
      setTimeout(type, delay);
    };
    setTimeout(type, 1700);
  }

  /* =========================================================
     9. TILT
     ========================================================= */
  const cards = $$("[data-tilt]");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  if (finePointer.matches && !prefersReducedMotion()) {
    cards.forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const b = card.getBoundingClientRect();
        const x = (e.clientX - b.left) / b.width - 0.5;
        const y = (e.clientY - b.top) / b.height - 0.5;
        card.style.transform =
          `perspective(900px) rotateX(${-y * 3}deg) rotateY(${x * 3}deg) translateY(-2px)`;
      });
      card.addEventListener("pointerleave", () => { card.style.transform = ""; });
    });
  }

  /* =========================================================
     10. PARTÍCULAS FONDO
     ========================================================= */
  const canvas = $("#particles");
  const ctx = canvas?.getContext("2d", { alpha: true });
  if (canvas && ctx && !prefersReducedMotion()) {
    let w = 0, h = 0, parts = [], frame = 0;
    const pointer = { x: -1000, y: -1000, active: false };
    const pCount = () => Math.min(48, Math.max(18, Math.floor(window.innerWidth / 28)));

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * ratio);
      canvas.height = Math.floor(h * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      parts = Array.from({ length: pCount() }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.7 + 0.4,
        speed: Math.random() * 0.22 + 0.08,
        phase: Math.random() * Math.PI * 2
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const t = performance.now() * 0.001;
      parts.forEach((p) => {
        p.y -= p.speed;
        p.x += Math.sin(t + p.phase) * 0.13;
        if (p.y < -4) { p.y = h + 4; p.x = Math.random() * w; }
        let a = 0.28 + Math.sin(t * 0.8 + p.phase) * 0.14;
        if (pointer.active) {
          const dx = pointer.x - p.x, dy = pointer.y - p.y;
          if (dx * dx + dy * dy < 90 * 90) a = 0.78;
        }
        ctx.beginPath();
        ctx.fillStyle = `rgba(230, 204, 139, ${a})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });
      frame = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("pointermove", (e) => {
      pointer.x = e.clientX; pointer.y = e.clientY; pointer.active = true;
    }, { passive: true });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) cancelAnimationFrame(frame);
      else if (!prefersReducedMotion()) draw();
    });
  }

  /* =========================================================
     11. CONTADORES COLAPSABLES
     ========================================================= */
  const counter = $("#counter");
  const counterHead = counter ? $(".counter__head", counter) : null;
  const setCounter = (open) => {
    if (!counter || !counterHead) return;
    counter.classList.toggle("is-open", open);
    counterHead.setAttribute("aria-expanded", String(open));
    safeSet("portfolio-counter", open ? "open" : "closed");
  };
  if (safeGet("portfolio-counter") === "open") setCounter(true);
  counterHead?.addEventListener("click", () => {
    setCounter(!counter.classList.contains("is-open"));
  });

  const reposCounter = $("#counter-repos");
  const reposHead = reposCounter ? $(".counter__head", reposCounter) : null;
  const setReposCounter = (open) => {
    if (!reposCounter || !reposHead) return;
    reposCounter.classList.toggle("is-open", open);
    reposHead.setAttribute("aria-expanded", String(open));
  };
  reposHead?.addEventListener("click", () => {
    setReposCounter(!reposCounter.classList.contains("is-open"));
  });

  /* =========================================================
     12. CHATBOT MULTILINGÜE (ES · VA · EN · FR)
     ========================================================= */
  const chat = $("#chat");
  const chatToggle = $("#chat-toggle");
  const chatClose = $("#chat-close");
  const chatPanel = $("#chat-panel");
  const chatMessages = $("#chat-messages");
  const chatForm = $("#chat-form");
  const chatInput = $("#chat-input");
  const chatQuick = $("#chat-quick");
  const chatLang = $("#chat-lang");
  const chatLangBtns = $$(".chat__lang-btn", chatLang || document);

  if (chat && chatToggle && chatPanel) {

    const knowledge = {
      es: {
        greeting: {
          keys: ["hola", "buenas", "hey", "saludos", "buenos dias", "buenas tardes", "buenas noches"],
          reply: [
            "¡Hola! Soy el asistente de Javier. Pregúntame por sus <strong>proyectos</strong>, <strong>estudios</strong>, <strong>PC</strong>, <strong>juegos</strong> o <strong>contacto</strong>.",
            "¡Buenas! ¿Sobre qué te gustaría saber? Puedo contarte sobre sus <strong>proyectos</strong>, <strong>estudios</strong>, <strong>PC</strong>, <strong>juegos</strong> o cómo <strong>contactar</strong>."
          ]
        },
        projects: {
          keys: ["proyecto", "proyectos", "portfolio", "portafolio", "web", "trabajo", "trabajos"],
          reply: [
            "Javier ha creado este <strong>portafolio web</strong> desde cero con HTML, CSS y JavaScript. Está estudiando DAM y sigue aprendiendo.",
            "Su proyecto principal es este <strong>portafolio</strong>, hecho a mano con HTML, CSS y JavaScript."
          ]
        },
        contact: {
          keys: ["contacto", "contactar", "email", "correo", "escribir", "hablar", "whatsapp", "linkedin"],
          reply: [
            "Puedes contactar con Javier desde el <strong>formulario de contacto</strong>, por <strong>WhatsApp</strong> o a través de su <strong>LinkedIn</strong>.",
            "Tienes varias formas: el <strong>formulario</strong> de la web, <strong>WhatsApp</strong> directo o <strong>LinkedIn</strong>."
          ]
        },
        studies: {
          keys: ["estudio", "estudios", "formacion", "dam", "smx", "recorrido", "carrera", "daw"],
          reply: [
            "Javier terminó el <strong>Grado Medio de SMX</strong> y ahora estudia <strong>DAM</strong> (Desarrollo de Aplicaciones Multiplataforma).",
            "Estudió <strong>SMX</strong> y ahora está con <strong>DAM</strong>. También está mejorando su inglés."
          ]
        },
        pc: {
          keys: ["pc", "ordenador", "computadora", "hardware", "grafica", "cpu", "ram", "montaje"],
          reply: [
            "Javier montó su propio <strong>PC gaming</strong> y le apasiona el hardware. Míralo en la sección <strong>Dentro del ordenador</strong>.",
            "Es un manitas del hardware: montó su <strong>PC gaming</strong> desde cero."
          ]
        },
        games: {
          keys: ["juego", "juegos", "videojuego", "videojuegos", "gaming", "fallout", "doom", "skyrim", "bioshock", "cyberpunk"],
          reply: [
            "Sus juegos favoritos son <strong>Fallout</strong>, <strong>Doom</strong>, <strong>Skyrim</strong>, <strong>Bioshock</strong> y <strong>Cyberpunk 2077</strong>.",
            "Le van los clásicos y las distopías: <strong>Fallout</strong>, <strong>Doom</strong>, <strong>Skyrim</strong>, <strong>Bioshock</strong> y <strong>Cyberpunk 2077</strong>."
          ]
        },
        thanks: {
          keys: ["gracias", "genial", "perfecto", "guay", "ok"],
          reply: [
            "¡De nada! 😊 Si necesitas algo más, aquí estoy.",
            "¡Un placer! 😊 Pregúntame lo que quieras."
          ]
        },
        bye: {
          keys: ["adios", "adiós", "bye", "hasta luego", "chao", "nos vemos"],
          reply: [
            "¡Hasta luego! Que tengas un buen día. 👋",
            "¡Nos vemos! 👋 Gracias por pasarte."
          ]
        },
        unknown: [
          "No estoy seguro de eso. Prueba con <strong>proyectos</strong>, <strong>estudios</strong>, <strong>contacto</strong>, <strong>PC</strong> o <strong>juegos</strong>.",
          "Hmm, no te he entendido del todo. Pregúntame por sus <strong>proyectos</strong>, <strong>estudios</strong>, <strong>contacto</strong>, <strong>PC</strong> o <strong>juegos</strong>."
        ]
      },
      va: {
        greeting: {
          keys: ["hola", "bones", "bon dia", "bona vesprada", "bona nit", "salut"],
          reply: [
            "Hola! Soc l'assistent de Javier. Pregunta'm pels seus <strong>projectes</strong>, <strong>estudis</strong>, <strong>PC</strong>, <strong>jocs</strong> o <strong>contacte</strong>.",
            "Bones! Sobre què vols saber? Puc contar-te sobre els seus <strong>projectes</strong>, <strong>estudis</strong>, <strong>PC</strong>, <strong>jocs</strong> o com <strong>contactar</strong>."
          ]
        },
        projects: {
          keys: ["projecte", "projectes", "portfolio", "web", "treball", "treballs"],
          reply: [
            "Javier ha creat aquest <strong>portfolio web</strong> des de zero amb HTML, CSS i JavaScript. Està estudiant DAM i continua aprenent.",
            "El seu projecte principal és aquest <strong>portfolio</strong>, fet a mà amb HTML, CSS i JavaScript."
          ]
        },
        contact: {
          keys: ["contacte", "contactar", "email", "correu", "escriure", "parlar", "whatsapp", "linkedin"],
          reply: [
            "Pots contactar amb Javier des del <strong>formulari de contacte</strong>, per <strong>WhatsApp</strong> o pel seu <strong>LinkedIn</strong>.",
            "Tens diverses formes: el <strong>formulari</strong> de la web, <strong>WhatsApp</strong> directe o <strong>LinkedIn</strong>."
          ]
        },
        studies: {
          keys: ["estudi", "estudis", "formacio", "dam", "smx", "recorregut", "carrera"],
          reply: [
            "Javier va acabar el <strong>Grau Mitjà de SMX</strong> i ara estudia <strong>DAM</strong> (Desenvolupament d'Aplicacions Multiplataforma).",
            "Va estudiar <strong>SMX</strong> i ara està amb <strong>DAM</strong>. També millora el seu anglès pas a pas."
          ]
        },
        pc: {
          keys: ["pc", "ordinador", "hardware", "grafica", "cpu", "ram", "muntatge"],
          reply: [
            "Javier va muntar el seu propi <strong>PC gaming</strong> i li apassiona el maquinari. Mira-ho a la secció <strong>Dins de l'ordinador</strong>.",
            "És un manetes del maquinari: va muntar el seu <strong>PC gaming</strong> des de zero."
          ]
        },
        games: {
          keys: ["joc", "jocs", "videojoc", "videojocs", "gaming", "fallout", "doom", "skyrim", "bioshock", "cyberpunk"],
          reply: [
            "Els seus jocs preferits són <strong>Fallout</strong>, <strong>Doom</strong>, <strong>Skyrim</strong>, <strong>Bioshock</strong> i <strong>Cyberpunk 2077</strong>.",
            "Li agraden els clàssics i les distopies: <strong>Fallout</strong>, <strong>Doom</strong>, <strong>Skyrim</strong>, <strong>Bioshock</strong> i <strong>Cyberpunk 2077</strong>."
          ]
        },
        thanks: {
          keys: ["gracies", "grasies", "genial", "perfecte", "guai", "ok"],
          reply: [
            "De res! 😊 Si necessites alguna cosa més, ací estic.",
            "Un plaer! 😊 Pregunta'm el que vulgues."
          ]
        },
        bye: {
          keys: ["adéu", "adeu", "bye", "fins despres", "fins després", "fins aviat", "xao"],
          reply: [
            "Fins després! Que tingues un bon dia. 👋",
            "Ens veiem! 👋 Gràcies per passar-te."
          ]
        },
        unknown: [
          "No estic segur d'això. Prova amb <strong>projectes</strong>, <strong>estudis</strong>, <strong>contacte</strong>, <strong>PC</strong> o <strong>jocs</strong>.",
          "Hmm, no t'he entès del tot. Pregunta'm pels seus <strong>projectes</strong>, <strong>estudis</strong>, <strong>contacte</strong>, <strong>PC</strong> o <strong>jocs</strong>."
        ]
      },
      en: {
        greeting: {
          keys: ["hello", "hi", "hey", "good morning", "good afternoon", "good evening", "greetings"],
          reply: [
            "Hi! I'm Javier's assistant. Ask me about his <strong>projects</strong>, <strong>studies</strong>, <strong>PC</strong>, <strong>games</strong> or <strong>contact</strong>.",
            "Hey there! What would you like to know? You can ask about his <strong>projects</strong>, <strong>studies</strong>, <strong>PC</strong>, <strong>games</strong> or how to <strong>contact</strong> him."
          ]
        },
        projects: {
          keys: ["project", "projects", "portfolio", "web", "work", "works"],
          reply: [
            "Javier built this <strong>portfolio website</strong> from scratch with HTML, CSS and JavaScript. He's studying DAM and keeps learning.",
            "His main project is this <strong>portfolio</strong>, hand-coded with HTML, CSS and JavaScript."
          ]
        },
        contact: {
          keys: ["contact", "email", "write", "talk", "whatsapp", "linkedin", "message"],
          reply: [
            "You can reach Javier through the <strong>contact form</strong>, <strong>WhatsApp</strong> or his <strong>LinkedIn</strong>.",
            "Several options: the <strong>form</strong>, <strong>WhatsApp</strong> or <strong>LinkedIn</strong>."
          ]
        },
        studies: {
          keys: ["study", "studies", "education", "dam", "smx", "career", "course"],
          reply: [
            "Javier finished <strong>SMX</strong> (vocational training in IT) and now studies <strong>DAM</strong> (Multiplatform App Development).",
            "He completed <strong>SMX</strong> and is now doing <strong>DAM</strong>. He's also improving his English."
          ]
        },
        pc: {
          keys: ["pc", "computer", "hardware", "gpu", "cpu", "ram", "build"],
          reply: [
            "Javier built his own <strong>gaming PC</strong> and loves hardware. Check it out in the <strong>Inside the computer</strong> section.",
            "He's a hardware guy: he built his <strong>gaming PC</strong> from scratch."
          ]
        },
        games: {
          keys: ["game", "games", "videogame", "videogames", "gaming", "fallout", "doom", "skyrim", "bioshock", "cyberpunk"],
          reply: [
            "His favorites are <strong>Fallout</strong>, <strong>Doom</strong>, <strong>Skyrim</strong>, <strong>Bioshock</strong> and <strong>Cyberpunk 2077</strong>.",
            "He likes classics and dystopias: <strong>Fallout</strong>, <strong>Doom</strong>, <strong>Skyrim</strong>, <strong>Bioshock</strong> and <strong>Cyberpunk 2077</strong>."
          ]
        },
        thanks: {
          keys: ["thanks", "thank you", "great", "perfect", "cool", "ok"],
          reply: [
            "You're welcome! 😊 Anything else, just ask.",
            "My pleasure! 😊 Ask me whatever you like."
          ]
        },
        bye: {
          keys: ["bye", "goodbye", "see you", "later", "cya"],
          reply: [
            "See you! Have a great day. 👋",
            "Bye! 👋 Thanks for stopping by."
          ]
        },
        unknown: [
          "I'm not sure about that. Try <strong>projects</strong>, <strong>studies</strong>, <strong>contact</strong>, <strong>PC</strong> or <strong>games</strong>.",
          "Hmm, I didn't quite get that. Ask me about his <strong>projects</strong>, <strong>studies</strong>, <strong>contact</strong>, <strong>PC</strong> or <strong>games</strong>."
        ]
      },
      fr: {
        greeting: {
          keys: ["bonjour", "salut", "coucou", "bonsoir", "hey"],
          reply: [
            "Salut ! Je suis l'assistant de Javier. Demande-moi ses <strong>projets</strong>, <strong>études</strong>, <strong>PC</strong>, <strong>jeux</strong> ou <strong>contact</strong>.",
            "Bonjour ! Que veux-tu savoir ? Tu peux demander ses <strong>projets</strong>, <strong>études</strong>, <strong>PC</strong>, <strong>jeux</strong> ou comment le <strong>contacter</strong>."
          ]
        },
        projects: {
          keys: ["projet", "projets", "portfolio", "site", "travail", "travaux"],
          reply: [
            "Javier a créé ce <strong>portfolio</strong> à partir de zéro avec HTML, CSS et JavaScript.",
            "Son projet principal est ce <strong>portfolio</strong>, codé à la main en HTML, CSS et JavaScript."
          ]
        },
        contact: {
          keys: ["contact", "email", "écrire", "ecrire", "parler", "whatsapp", "linkedin"],
          reply: [
            "Tu peux contacter Javier via le <strong>formulaire de contact</strong>, <strong>WhatsApp</strong> ou son <strong>LinkedIn</strong>.",
            "Plusieurs options : le <strong>formulaire</strong>, <strong>WhatsApp</strong> ou <strong>LinkedIn</strong>."
          ]
        },
        studies: {
          keys: ["étude", "etude", "études", "etudes", "formation", "dam", "smx", "cursus"],
          reply: [
            "Javier a terminé <strong>SMX</strong> et étudie maintenant <strong>DAM</strong> (développement d'applications multiplateformes).",
            "Il a fait <strong>SMX</strong> et poursuit avec <strong>DAM</strong>. Il améliore aussi son anglais."
          ]
        },
        pc: {
          keys: ["pc", "ordinateur", "hardware", "carte graphique", "cpu", "ram", "montage"],
          reply: [
            "Javier a monté son propre <strong>PC gaming</strong> et adore le hardware.",
            "C'est un passionné de hardware : il a monté son <strong>PC gaming</strong> de A à Z."
          ]
        },
        games: {
          keys: ["jeu", "jeux", "jeuvideo", "jeuxvideo", "gaming", "fallout", "doom", "skyrim", "bioshock", "cyberpunk"],
          reply: [
            "Ses préférés : <strong>Fallout</strong>, <strong>Doom</strong>, <strong>Skyrim</strong>, <strong>Bioshock</strong> et <strong>Cyberpunk 2077</strong>.",
            "Il aime les classiques et les dystopies : <strong>Fallout</strong>, <strong>Doom</strong>, <strong>Skyrim</strong>, <strong>Bioshock</strong> et <strong>Cyberpunk 2077</strong>."
          ]
        },
        thanks: {
          keys: ["merci", "super", "parfait", "cool", "ok"],
          reply: [
            "De rien ! 😊 Si tu as besoin d'autre chose, je suis là.",
            "Avec plaisir ! 😊 Demande-moi ce que tu veux."
          ]
        },
        bye: {
          keys: ["au revoir", "bye", "à bientôt", "a bientot", "salut", "ciao"],
          reply: [
            "À bientôt ! Bonne journée. 👋",
            "Au revoir ! 👋 Merci de ta visite."
          ]
        },
        unknown: [
          "Je ne suis pas sûr. Essaie <strong>projets</strong>, <strong>études</strong>, <strong>contact</strong>, <strong>PC</strong> ou <strong>jeux</strong>.",
          "Hmm, je n'ai pas bien compris. Demande-moi ses <strong>projets</strong>, <strong>études</strong>, <strong>contact</strong>, <strong>PC</strong> ou <strong>jeux</strong>."
        ]
      }
    };

    const ui = {
      es: {
        placeholder: "Escribe tu pregunta...",
        quick: { projects: "Proyectos", contact: "Contacto", studies: "Estudios", pc: "PC", games: "Juegos" },
        welcome: "¡Hola! 👋 Soy el asistente de Javier. ¿Sobre qué quieres saber?",
        welcomeSub: "Escribe tu pregunta o usa los botones de abajo 👇"
      },
      va: {
        placeholder: "Escriu la teua pregunta...",
        quick: { projects: "Projectes", contact: "Contacte", studies: "Estudis", pc: "PC", games: "Jocs" },
        welcome: "Hola! 👋 Soc l'assistent de Javier. Sobre què vols saber?",
        welcomeSub: "Escriu la teua pregunta o usa els botons de davall 👇"
      },
      en: {
        placeholder: "Type your question...",
        quick: { projects: "Projects", contact: "Contact", studies: "Studies", pc: "PC", games: "Games" },
        welcome: "Hi! 👋 I'm Javier's assistant. What would you like to know?",
        welcomeSub: "Type your question or use the buttons below 👇"
      },
      fr: {
        placeholder: "Écris ta question...",
        quick: { projects: "Projets", contact: "Contact", studies: "Études", pc: "PC", games: "Jeux" },
        welcome: "Salut ! 👋 Je suis l'assistant de Javier. Que veux-tu savoir ?",
        welcomeSub: "Écris ta question ou utilise les boutons ci-dessous 👇"
      }
    };

    const detectLang = (text) => {
      if (!text) return null;
      const t = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

      const hints = {
        es: /\b(qué|que|cómo|como|dónde|donde|quién|quien|hola|buenas|gracias|por favor|está|esta)\b/,
        va: /\b(què|com|on|qui|hola|bones|gracies|si us plau|està|estic|vull|puc|soc)\b/,
        en: /\b(what|how|where|who|hello|hi|thanks|please|the|you|your|is|are|does)\b/,
        fr: /\b(quoi|comment|où|qui|bonjour|salut|merci|s'il|vous|tu|est|sont|je)\b/
      };

      let scores = { es: 0, va: 0, en: 0, fr: 0 };
      for (const lang in hints) {
        const matches = t.match(hints[lang]);
        if (matches) scores[lang] = matches.length;
      }

      if (/[ñ¿¡]/.test(text)) scores.es += 2;
      if (/ç/.test(text)) { scores.va += 1; scores.fr += 1; }
      if (/[àèù]/.test(text)) scores.fr += 1;
      if (/\b(l'|d'|n'|s'|qu')/.test(t)) { scores.va += 1; scores.fr += 1; }

      const best = Object.keys(scores).reduce((a, b) => scores[a] >= scores[b] ? a : b);
      return scores[best] > 0 ? best : null;
    };

    const storedLang = safeGet("portfolio-chat-lang");
    let currentLang = (storedLang && ui[storedLang]) ? storedLang : null;

    if (!currentLang) {
      const navLang = (navigator.language || "es").toLowerCase();
      if (navLang.startsWith("ca") || navLang.startsWith("va")) currentLang = "va";
      else if (navLang.startsWith("en")) currentLang = "en";
      else if (navLang.startsWith("fr")) currentLang = "fr";
      else currentLang = "es";
    }

    const applyLangToUI = (lang) => {
      const t = ui[lang] || ui.es;
      if (chatInput) chatInput.placeholder = t.placeholder;
      const quickBtns = $$(".chat__quick-btn", chatQuick || document);
      const quickMap = ["projects", "contact", "studies", "pc", "games"];
      quickBtns.forEach((btn, i) => {
        const key = quickMap[i];
        if (key && t.quick[key]) btn.textContent = t.quick[key];
      });
      chatLangBtns.forEach((b) => {
        b.classList.toggle("is-active", b.dataset.lang === lang);
      });
    };

    applyLangToUI(currentLang);

    const findReply = (text, lang) => {
      const t = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const dict = knowledge[lang] || knowledge.es;

      for (const key in dict) {
        if (key === "unknown") continue;
        const item = dict[key];
        if (!item || !item.keys) continue;
        for (const k of item.keys) {
          const kn = k.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          if (t.includes(kn)) {
            return Array.isArray(item.reply)
              ? item.reply[Math.floor(Math.random() * item.reply.length)]
              : item.reply;
          }
        }
      }
      const unknown = dict.unknown || knowledge.es.unknown;
      return Array.isArray(unknown)
        ? unknown[Math.floor(Math.random() * unknown.length)]
        : unknown;
    };

    const addMessage = (text, type = "bot") => {
      const msg = document.createElement("div");
      msg.className = `chat__msg chat__msg--${type}`;
      // Sanitizamos el HTML permitido (strong, em, br)
      const allowed = text
        .replace(/<(?!\/?(strong|em|br)\b)[^>]*>/gi, '')
        .replace(/&(?!(amp|lt|gt|quot|#039);)/g, '&amp;');
      msg.innerHTML = allowed;
      chatMessages.appendChild(msg);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    };

    const botReply = (text) => {
      const typing = document.createElement("div");
      typing.className = "chat__typing";
      typing.innerHTML = "<span></span><span></span><span></span>";
      chatMessages.appendChild(typing);
      chatMessages.scrollTop = chatMessages.scrollHeight;
      setTimeout(() => {
        typing.remove();
        addMessage(text, "bot");
      }, 500 + Math.random() * 500);
    };

    const handleUserMessage = (text) => {
      if (!text) return;

      const detected = detectLang(text);
      if (detected && detected !== currentLang) {
        currentLang = detected;
        safeSet("portfolio-chat-lang", currentLang);
        applyLangToUI(currentLang);
      }

      addMessage(text, "user");
      botReply(findReply(text, currentLang));
    };

    const openChat = () => {
      chat.classList.add("is-open");
      chatToggle.setAttribute("aria-expanded", "true");
      chatPanel.setAttribute("aria-hidden", "false");
      safeSet("portfolio-chat-open", "true");
      setTimeout(() => chatInput?.focus(), 350);
    };

    const closeChat = () => {
      chat.classList.remove("is-open");
      chatToggle.setAttribute("aria-expanded", "false");
      chatPanel.setAttribute("aria-hidden", "true");
      safeSet("portfolio-chat-open", "false");
    };

    let welcomeShown = false;
    chatToggle.addEventListener("click", () => {
      if (!welcomeShown) {
        welcomeShown = true;
        const t = ui[currentLang] || ui.es;
        addMessage(t.welcome, "bot");
        addMessage(t.welcomeSub, "bot");
      }
      openChat();
    });

    chatClose?.addEventListener("click", closeChat);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && chat.classList.contains("is-open")) closeChat();
    });

    chatForm?.addEventListener("submit", (e) => {
      e.preventDefault();
      const text = chatInput.value.trim();
      if (!text) return;
      chatInput.value = "";
      handleUserMessage(text);
    });

    $$(".chat__quick-btn", chatQuick || document).forEach((btn) => {
      btn.addEventListener("click", () => {
        const text = btn.dataset.msg || btn.textContent;
        handleUserMessage(text);
      });
    });

    chatLangBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const lang = btn.dataset.lang;
        if (!ui[lang]) return;
        currentLang = lang;
        safeSet("portfolio-chat-lang", lang);
        applyLangToUI(lang);
        const t = ui[lang];
        addMessage(t.welcome, "bot");
      });
    });

    if (safeGet("portfolio-chat-open") === "true") {
      setTimeout(openChat, 800);
    }
  }

  /* =========================================================
     12.4. TMDB — Cartelera personal de películas favoritas
     ========================================================= */
  // 🔑 PON AQUÍ TU API KEY DE TMDB
  const TMDB_API_KEY = "eb84a38debac4f94c4f640978ca7a112";

  const movieGrid = $("#movie-grid");
  const movieTooltip = $("#movie-tooltip");
  const movieTooltipTitle = movieTooltip?.querySelector(".movie-tooltip__title");
  const movieTooltipDesc = movieTooltip?.querySelector(".movie-tooltip__desc");

  const FAVORITE_MOVIES = [
    { title: "Gladiator", year: 2000 },
    { title: "Star Wars: Episode VI - Return of the Jedi", year: 1983 },
    { title: "The Silence of the Lambs", year: 1991 },
    { title: "Se7en", year: 1995 },
    { title: "Spider-Man", year: 2002 }
  ];

  const showMovieTooltip = (movie, targetEl) => {
    if (!movieTooltip || !movie) return;
    movieTooltipTitle.textContent = `${movie.title} (${movie.year})`;
    movieTooltipDesc.textContent = movie.overview || "Sin sinopsis disponible.";

    const cardRect = movieGrid.getBoundingClientRect();
    const targetRect = targetEl.getBoundingClientRect();
    const x = targetRect.left + targetRect.width / 2 - cardRect.left;
    const y = targetRect.top - cardRect.top;

    movieTooltip.style.left = x + "px";
    movieTooltip.style.top = (y - 10) + "px";
    movieTooltip.style.transform = "translate(-50%, -100%)";
    movieTooltip.classList.add("is-visible");
    movieTooltip.setAttribute("aria-hidden", "false");
  };

  const hideMovieTooltip = () => {
    if (!movieTooltip) return;
    movieTooltip.classList.remove("is-visible");
    movieTooltip.setAttribute("aria-hidden", "true");
  };

  const loadMovies = async () => {
    if (!movieGrid) return;

    if (!TMDB_API_KEY || TMDB_API_KEY === "TU_API_KEY_DE_TMDB_AQUI") {
      console.warn("[tmdb] Falta la API key de TMDB");
      movieGrid.innerHTML = `
        <div class="movie" style="grid-column: 1 / -1; aspect-ratio: auto; padding: 20px; text-align: center; border-color: var(--line-soft);">
          <div class="movie__meta" style="position: static; background: none;">
            <strong>Añade tu API key de TMDB</strong>
            <small>Regístrate gratis en themoviedb.org</small>
          </div>
        </div>
      `;
      return;
    }

    movieGrid.innerHTML = "";

    try {
      const promises = FAVORITE_MOVIES.map(async (fav) => {
        let url = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&language=es-ES&query=${encodeURIComponent(fav.title)}`;
        if (fav.year) url += `&year=${fav.year}`;

        const res = await fetch(url);
        const data = await res.json();
        const movie = data.results?.[0] || null;

        if (!movie) return null;

        return {
          title: movie.title,
          year: movie.release_date ? movie.release_date.split("-")[0] : "—",
          rating: movie.vote_average ? movie.vote_average.toFixed(1) : "—",
          poster: movie.poster_path
            ? `https://image.tmdb.org/t/p/w342${movie.poster_path}`
            : "",
          overview: movie.overview || "Sin sinopsis disponible."
        };
      });

      const movies = await Promise.all(promises);

      movies.forEach((movie) => {
        const div = document.createElement("div");
        div.className = "movie";

        if (!movie) {
          div.innerHTML = `
            <div class="movie__poster-skeleton"></div>
            <div class="movie__meta">
              <strong>No encontrada</strong>
              <small>—</small>
            </div>
          `;
          movieGrid.appendChild(div);
          return;
        }

        div.innerHTML = `
          ${movie.poster
            ? `<img class="movie__poster" src="${escapeHTML(movie.poster)}" alt="${escapeHTML(movie.title)}" loading="lazy">`
            : `<div class="movie__poster-skeleton"></div>`}
          <div class="movie__meta">
            <strong>${escapeHTML(movie.title)}</strong>
            <small>${escapeHTML(movie.year)} · ⭐ ${escapeHTML(movie.rating)}</small>
          </div>
        `;

        const img = div.querySelector("img.movie__poster");
        if (img) {
          img.onload = () => div.classList.add("is-loaded");
          img.onerror = () => div.classList.add("is-loaded");
        } else {
          div.classList.add("is-loaded");
        }

        div.addEventListener("mouseenter", () => {
          div.classList.add("is-hovering");
          showMovieTooltip(movie, div);
        });
        div.addEventListener("mouseleave", () => {
          div.classList.remove("is-hovering");
          hideMovieTooltip();
        });

        div.addEventListener("touchstart", () => {
          showMovieTooltip(movie, div);
          setTimeout(hideMovieTooltip, 2500);
        }, { passive: true });

        movieGrid.appendChild(div);
      });

      console.info("[tmdb] Cartelera cargada ✅");

    } catch (err) {
      console.warn("[tmdb] Error:", err);
      movieGrid.innerHTML = `
        <div class="movie" style="grid-column: 1 / -1; aspect-ratio: auto; padding: 20px; text-align: center; border-color: var(--line-soft);">
          <div class="movie__meta" style="position: static; background: none;">
            <strong>No se pudieron cargar las películas</strong>
            <small>Inténtalo más tarde</small>
          </div>
        </div>
      `;
    }
  };

  if (movieGrid) loadMovies();

  /* =========================================================
     12.5. NASA APOD
     ========================================================= */
  const NASA_API_KEY = "STsrnenqw6mMNKQdq19HYWDUdkDKVD7QqNl11Wp3";

  const apodLoader = $("#apod-loader");
  const apodMedia = $("#apod-media");
  const apodDate = $("#apod-date");
  const apodType = $("#apod-type");
  const apodTitle = $("#apod-title");
  const apodExplanation = $("#apod-explanation");
  const apodLink = $("#apod-link");
  const apodDatePicker = $("#apod-date-picker");
  const apodToday = $("#apod-today");

  const mostrarApodError = (err) => {
    if (apodLoader) apodLoader.classList.add("is-hidden");
    if (apodMedia) {
      apodMedia.innerHTML = `
        <div class="apod__placeholder">
          <span class="apod__placeholder-icon">✳</span>
          <strong>El cosmos está en silencio</strong>
          <small>La API de NASA no responde ahora mismo (error ${escapeHTML(String(err.code || "desconocido"))}). Mientras se recupera, puedes ver la galería completa en <a href="https://apod.nasa.gov/apod/archivepix.html" target="_blank" rel="noopener">apod.nasa.gov</a>.</small>
          <button class="apod__retry" id="apod-retry" type="button">Reintentar</button>
        </div>
      `;
      const retryBtn = document.getElementById("apod-retry");
      retryBtn?.addEventListener("click", () => {
        if (apodDatePicker && apodDatePicker.value) {
          loadApod(apodDatePicker.value);
        } else {
          loadApod();
        }
      });
    }
    if (apodTitle) apodTitle.textContent = "Esperando al cosmos…";
    if (apodExplanation) apodExplanation.textContent = "La NASA está actualizando su servicio. Puedes reintentar o consultar su web oficial.";
    if (apodDate) apodDate.textContent = "—";
    if (apodType) apodType.textContent = "Sin conexión";
  };

  const loadApod = async (date) => {
    if (!apodMedia) return;

    if (apodLoader) apodLoader.classList.remove("is-hidden");
    if (apodTitle) apodTitle.textContent = "Cargando…";
    if (apodExplanation) apodExplanation.textContent = "—";
    if (apodDate) apodDate.textContent = "—";
    if (apodType) apodType.textContent = "—";
    if (apodMedia) apodMedia.innerHTML = "";

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      let url = `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}&thumbs=true`;
      if (date) url += `&date=${date}`;

      console.info("[apod] Consultando:", date || "hoy");

      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      const data = await res.json();

      if (data.code && data.code !== 200) {
        console.warn("[apod] NASA respondió con error:", data);

        if (!date && (data.code === 500 || data.code === 503)) {
          console.info("[apod] Reintentando con la foto de ayer…");
          const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
          return loadApod(yesterday);
        }

        mostrarApodError(data);
        return;
      }

      const apod = Array.isArray(data) ? data[0] : data;

      const esPlaceholder = (apod.title === "NASA Science") ||
                            (apod.url && apod.url.includes("nasa-logo"));

      if (esPlaceholder) {
        if (!date) {
          console.info("[apod] Placeholder detectado. Probando ayer…");
          const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
          return loadApod(yesterday);
        }
        mostrarApodError({ code: 503, msg: "APOD no disponible" });
        return;
      }

      if (apodTitle) apodTitle.textContent = apod.title || "Sin título";
      if (apodDate) apodDate.textContent = apod.date || "—";
      if (apodType) apodType.textContent = apod.media_type === "video" ? "Vídeo" : "Imagen";
      if (apodExplanation) apodExplanation.textContent = apod.explanation || "—";
      if (apodLink) apodLink.href = apod.hdurl || apod.url || "#";

      const media = apod.media_type === "video"
        ? apod.url
        : (apod.url || apod.hdurl);

      if (apod.media_type === "video") {
        if (media && media.includes("youtube")) {
          const embedUrl = media.replace("watch?v=", "embed/").replace("http://", "https://");
          apodMedia.innerHTML = `<iframe src="${escapeHTML(embedUrl)}" allowfullscreen loading="lazy" title="${escapeHTML(apod.title)}"></iframe>`;
        } else {
          apodMedia.innerHTML = `<video src="${escapeHTML(media)}" controls poster="${escapeHTML(apod.thumbnail_url || '')}" preload="metadata"></video>`;
        }
      } else {
        const img = document.createElement("img");
        img.src = media;
        img.alt = apod.title || "APOD";
        img.loading = "lazy";
        img.onerror = () => mostrarApodError({ code: 0, msg: "Imagen no disponible" });
        apodMedia.appendChild(img);
      }

      if (apodLoader) apodLoader.classList.add("is-hidden");

      console.info("[apod] Cargado:", apod.title);

    } catch (err) {
      clearTimeout(timeoutId);
      console.warn("[apod] Error:", err);

      if (!date && err.name === "AbortError") {
        console.info("[apod] Timeout. Probando ayer…");
        const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
        return loadApod(yesterday);
      }

      mostrarApodError({ code: 0, msg: err.name === "AbortError" ? "Timeout" : "Sin conexión" });
    }
  };

  if (apodMedia) {
    loadApod();

    apodDatePicker?.addEventListener("change", () => {
      if (apodDatePicker.value) loadApod(apodDatePicker.value);
    });

    apodToday?.addEventListener("click", () => {
      if (apodDatePicker) apodDatePicker.value = "";
      loadApod();
    });
  }

  /* =========================================================
     13. REPOS DE GITHUB
     ========================================================= */
  const reposList = $("#repos-list");
  const reposCount = $("#repos-count");

  const GITHUB_USER = "javiersansano222";
  const REPOS_LIMIT = 6;
  const CACHE_KEY = "portfolio-github-repos";
  const CACHE_TTL = 60 * 60 * 1000;

  const colorForLang = (lang) => {
    const map = {
      JavaScript: "#f1e05a", TypeScript: "#3178c6", HTML: "#e34c26",
      CSS: "#563d7c", Java: "#b07219", Python: "#3572A5", PHP: "#4F5D95",
      "C#": "#178600", "C++": "#f34b7d", C: "#555555", Shell: "#89e051"
    };
    return map[lang] || "#d4a84b";
  };

  const renderTree = (repos) => {
    if (!reposList) return;
    if (!repos || repos.length === 0) {
      reposList.innerHTML = `<li class="tree__empty">No se pudieron cargar los repos. <a href="https://github.com/${GITHUB_USER}?tab=repositories" target="_blank" rel="noopener">Ver en GitHub ↗</a></li>`;
      if (reposCount) reposCount.textContent = "00";
      return;
    }
    if (reposCount) {
      reposCount.textContent = String(repos.length).padStart(2, "0");
      reposCount.dataset.target = String(repos.length);
    }
    reposList.innerHTML = "";
    repos.forEach((repo) => {
      const li = document.createElement("li");
      li.className = "tree__item";
      const a = document.createElement("a");
      a.className = "tree__row";
      a.href = repo.html_url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.setAttribute("aria-label", `Abrir ${repo.name} en GitHub`);

      const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      icon.setAttribute("viewBox", "0 0 16 16");
      icon.setAttribute("width", "16");
      icon.setAttribute("height", "16");
      icon.setAttribute("class", "tree__icon");
      icon.style.width = "16px";
      icon.style.height = "16px";
      icon.style.flexShrink = "0";
      icon.innerHTML = `<path d="M1.5 3.5 h4 l1.5 2 h7.5 v8.5 h-13 z" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/><line x1="1.5" y1="6" x2="14.5" y2="6" stroke="currentColor" stroke-width="0.7" opacity="0.6"/>`;

      const name = document.createElement("span");
      name.className = "tree__name";
      name.textContent = repo.name;

      const meta = document.createElement("span");
      meta.className = "tree__meta";
      if (repo.language) {
        const lang = document.createElement("span");
        lang.className = "tree__lang";
        const dot = document.createElement("i");
        const c = colorForLang(repo.language);
        dot.style.background = c;
        dot.style.color = c;
        lang.appendChild(dot);
        lang.appendChild(document.createTextNode(repo.language));
        meta.appendChild(lang);
      }
      const arrow = document.createElement("span");
      arrow.className = "tree__arrow";
      arrow.textContent = "↗";

      a.appendChild(icon);
      a.appendChild(name);
      a.appendChild(meta);
      a.appendChild(arrow);
      li.appendChild(a);
      reposList.appendChild(li);
    });
  };

  const loadRepos = async () => {
    if (!reposList) return;
    try {
      const cached = JSON.parse(safeGet(CACHE_KEY) || "null");
      if (cached && Date.now() - cached.time < CACHE_TTL) {
        renderTree(cached.data);
        return;
      }
    } catch {}
    try {
      const res = await fetch(
        `https://api.github.com/users/${GITHUB_USER}/repos?sort=updated&per_page=100`,
        { headers: { Accept: "application/vnd.github+json" } }
      );
      if (!res.ok) throw new Error("GitHub " + res.status);
      const all = await res.json();
      const filtered = all
        .filter((r) => !r.fork && !r.archived)
        .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
        .slice(0, REPOS_LIMIT);
      safeSet(CACHE_KEY, JSON.stringify({ time: Date.now(), data: filtered }));
      renderTree(filtered);
    } catch (err) {
      console.warn("[script] Repos fallo:", err);
      renderTree(null);
    }
  };
  loadRepos();

  /* =========================================================
     14. SCENE READY
     ========================================================= */
  document.addEventListener("scene:ready", () => {
    document.body.classList.add("scene-ready");
    console.info("[script] Escena 3D lista.");
  });

  /* =========================================================
     15. DIAGRAMA INTERACTIVO DEL PC
     ========================================================= */
  const pcDiagram = document.querySelector(".pc-diagram");
  if (pcDiagram) {
    const tooltip = pcDiagram.querySelector("#pc-tooltip");
    const tooltipTitle = tooltip?.querySelector(".pc-tooltip__title");
    const tooltipDesc = tooltip?.querySelector(".pc-tooltip__desc");
    const allParts = pcDiagram.querySelectorAll("[data-part]");
    const legendBtns = pcDiagram.querySelectorAll(".pc-legend__btn");

    const partsInfo = {
      cpu: { title: "CPU", desc: "Procesador — el cerebro del PC. Ejecuta todas las instrucciones y coordina el resto de componentes." },
      ram: { title: "RAM", desc: "Memoria de acceso aleatorio — guarda temporalmente los datos que el PC está usando ahora mismo." },
      gpu: { title: "GPU", desc: "Tarjeta gráfica — se encarga de dibujar los gráficos, los juegos y acelerar tareas pesadas." },
      storage: { title: "Almacenamiento", desc: "SSD o disco duro — guarda de forma permanente tus archivos, programas y el sistema operativo." },
      cooling: { title: "Refrigeración", desc: "Ventiladores y radiador — mantienen fríos los componentes para que no se sobrecalienten." },
      psu: { title: "Fuente de alimentación", desc: "Transforma la corriente de la pared en la energía estable que necesitan todos los componentes." },
      mobo: { title: "Placa base", desc: "La columna vertebral del PC — conecta y comunica todos los componentes entre sí." },
      case: { title: "Caja / Chasis", desc: "Protege los componentes, guía el flujo de aire y define el aspecto de tu equipo." }
    };

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
      allParts.forEach((el) => {
        el.classList.toggle("is-active", el.dataset.part === part);
      });
      legendBtns.forEach((btn) => {
        btn.classList.toggle("is-active", btn.dataset.part === part);
      });
    };

    const hideTooltip = () => {
      if (!tooltip) return;
      tooltip.classList.remove("is-visible");
      tooltip.setAttribute("aria-hidden", "true");
      pcDiagram.classList.remove("is-hovering");
      allParts.forEach((el) => el.classList.remove("is-active"));
      legendBtns.forEach((btn) => btn.classList.remove("is-active"));
    };

    allParts.forEach((el) => {
      el.addEventListener("mouseenter", () => showTooltip(el.dataset.part, el));
      el.addEventListener("mouseleave", hideTooltip);
      el.addEventListener("focus", () => showTooltip(el.dataset.part, el));
      el.addEventListener("blur", hideTooltip);
      el.addEventListener("click", () => showTooltip(el.dataset.part, el));
    });

    legendBtns.forEach((btn) => {
      btn.addEventListener("mouseenter", () => {
        const part = btn.dataset.part;
        const svgPart = pcDiagram.querySelector(`[data-part="${part}"]`);
        if (svgPart) showTooltip(part, svgPart);
      });
      btn.addEventListener("mouseleave", hideTooltip);
      btn.addEventListener("focus", () => {
        const part = btn.dataset.part;
        const svgPart = pcDiagram.querySelector(`[data-part="${part}"]`);
        if (svgPart) showTooltip(part, svgPart);
      });
      btn.addEventListener("blur", hideTooltip);
    });

    pcDiagram.addEventListener("mouseleave", hideTooltip);
  }

  /* =========================================================
     16. FORMULARIO DE CONTACTO
     ========================================================= */
  const contactForm = document.querySelector('.contact-form');
  if (contactForm) {
    const submitBtn = contactForm.querySelector('.contact-form__submit');
    contactForm.addEventListener('submit', (e) => {
      if (submitBtn) {
        submitBtn.disabled = true;
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = 'Enviando... <span aria-hidden="true">⏳</span>';
        // Re-habilitar tras 5 segundos por si falla la red
        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }, 5000);
      }
    });
  }

  console.info("[script] Todo listo.");
})();
