(() => {
  "use strict";

  const root = document.documentElement;
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

  /* ---------------------------------------------------------
     Almacenamiento robusto
     --------------------------------------------------------- */
  const memoryStore = {};
  const safeGet = (key) => {
    try { return localStorage.getItem(key); }
    catch { return memoryStore[key] ?? null; }
  };
  const safeSet = (key, value) => {
    try { localStorage.setItem(key, value); }
    catch { memoryStore[key] = String(value); }
  };

  /* ---------------------------------------------------------
     Año del footer
     --------------------------------------------------------- */
  const year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());

  /* ---------------------------------------------------------
     Selector de paletas
     --------------------------------------------------------- */
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

  /* ---------------------------------------------------------
     Modo claro / oscuro
     --------------------------------------------------------- */
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

  /* ---------------------------------------------------------
     Menú móvil
     --------------------------------------------------------- */
  const navToggle = $("#nav-toggle");
  const mainNav = $("#main-nav");

  const setMenu = (open) => {
    if (!navToggle || !mainNav) return;
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
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
    if (mainNav?.classList.contains("nav-open") &&
        !mainNav.contains(event.target) &&
        !navToggle?.contains(event.target)) {
      setMenu(false);
    }
  });

  /* ---------------------------------------------------------
     Barra de progreso del scroll
     --------------------------------------------------------- */
  const progress = $("#scroll-progress");
  let scrollQueued = false;

  const updateProgress = () => {
    if (!progress) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const value = max > 0 ? Math.min(100, Math.max(0, (window.scrollY / max) * 100)) : 0;
    progress.style.width = `${value}%`;
    progress.setAttribute("aria-valuenow", String(Math.round(value)));
    scrollQueued = false;
  };

  window.addEventListener("scroll", () => {
    if (!scrollQueued) {
      window.requestAnimationFrame(updateProgress);
      scrollQueued = true;
    }
  }, { passive: true });

  window.addEventListener("resize", updateProgress, { passive: true });
  updateProgress();

  /* ---------------------------------------------------------
     Animación .reveal
     --------------------------------------------------------- */
  const revealItems = $$(".reveal");
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -35px 0px" });
    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  /* ---------------------------------------------------------
     Máquina de escribir
     --------------------------------------------------------- */
  const typewriter = $("#typewriter");
  const phrases = [
    "ser programador",
    "crear proyectos diferentes",
    "no rendirme ante un reto"
  ];

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

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
      if (letterIndex >= phrases[phraseIndex].length && !deleting) {
        deleting = true;
        delay = 1450;
      }
      window.setTimeout(type, delay);
    };
    window.setTimeout(type, 1700);
  }

  /* ---------------------------------------------------------
     Tilt 3D
     --------------------------------------------------------- */
  const cards = $$("[data-tilt]");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

  if (finePointer.matches && !reduceMotion.matches) {
    cards.forEach((card) => {
      card.addEventListener("pointermove", (event) => {
        const bounds = card.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width - 0.5;
        const y = (event.clientY - bounds.top) / bounds.height - 0.5;
        card.style.transform =
          `perspective(900px) rotateX(${-y * 3}deg) rotateY(${x * 3}deg) translateY(-2px)`;
      });
      card.addEventListener("pointerleave", () => {
        card.style.transform = "";
      });
    });
  }

  /* ---------------------------------------------------------
     Partículas del fondo
     --------------------------------------------------------- */
  const canvas = $("#particles");
  const context = canvas?.getContext("2d", { alpha: true });

  if (canvas && context && !reduceMotion.matches) {
    let width = 0;
    let height = 0;
    let particles = [];
    let frame = 0;
    const pointer = { x: -1000, y: -1000, active: false };

    const particleCount = () =>
      Math.min(48, Math.max(18, Math.floor(window.innerWidth / 28)));

    const resizeCanvas = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      particles = Array.from({ length: particleCount() }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.7 + 0.4,
        speed: Math.random() * 0.22 + 0.08,
        phase: Math.random() * Math.PI * 2
      }));
    };

    const draw = () => {
      context.clearRect(0, 0, width, height);
      const time = performance.now() * 0.001;
      particles.forEach((p) => {
        p.y -= p.speed;
        p.x += Math.sin(time + p.phase) * 0.13;
        if (p.y < -4) {
          p.y = height + 4;
          p.x = Math.random() * width;
        }
        let alpha = 0.28 + Math.sin(time * 0.8 + p.phase) * 0.14;
        if (pointer.active) {
          const dx = pointer.x - p.x;
          const dy = pointer.y - p.y;
          if (dx * dx + dy * dy < 90 * 90) alpha = 0.78;
        }
        context.beginPath();
        context.fillStyle = `rgba(230, 204, 139, ${alpha})`;
        context.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        context.fill();
      });
      frame = window.requestAnimationFrame(draw);
    };

    resizeCanvas();
    draw();

    window.addEventListener("resize", resizeCanvas, { passive: true });
    window.addEventListener("pointermove", (event) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.active = true;
    }, { passive: true });
    window.addEventListener("pointerleave", () => {
      pointer.active = false;
    }, { passive: true });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) window.cancelAnimationFrame(frame);
      else if (!reduceMotion.matches) draw();
    });
  }

  /* ---------------------------------------------------------
     Contador "cosas que he hecho"
     --------------------------------------------------------- */
  const counter = $("#counter");
  const counterHead = $(".counter__head");

  const setCounter = (open) => {
    if (!counter || !counterHead) return;
    counter.classList.toggle("is-open", open);
    counterHead.setAttribute("aria-expanded", String(open));
    safeSet("portfolio-counter", open ? "open" : "closed");
  };

  const storedCounter = safeGet("portfolio-counter");
  if (storedCounter === "open") setCounter(true);

  counterHead?.addEventListener("click", () => {
    const isOpen = counter?.classList.contains("is-open");
    setCounter(!isOpen);
  });

  /* =========================================================
     CHATBOT FLOTANTE — ASISTENTE DE JAVIER
     ========================================================= */

  const chat = $("#chat");
  const chatToggle = $("#chat-toggle");
  const chatClose = $("#chat-close");
  const chatPanel = $("#chat-panel");
  const chatMessages = $("#chat-messages");
  const chatForm = $("#chat-form");
  const chatInput = $("#chat-input");
  const chatQuick = $("#chat-quick");

  if (!chat || !chatToggle || !chatPanel) return;

  /* ---------------------------------------------------------
     Base de conocimiento del bot
     Cada entrada tiene:
     - keys: array de palabras clave que activan la respuesta
     - reply: la respuesta del bot
     --------------------------------------------------------- */
  const knowledge = [
    {
      keys: ["hola", "hey", "buenas", "buenos dias", "buenas tardes", "buenas noches", "saludos"],
      reply: "¡Hola! Soy el asistente de Javier. Puedo contarte sobre sus <strong>proyectos</strong>, <strong>estudios</strong>, su <strong>PC</strong>, sus <strong>juegos</strong> favoritos o cómo <strong>contactar</strong> con él."
    },
    {
      keys: ["proyecto", "proyectos", "trabajo", "trabajos", "portfolio", "portafolio", "web"],
      reply: "Javier ha desarrollado este <strong>portafolio web</strong> desde cero con HTML, CSS y JavaScript. Está estudiando DAM y sigue aprendiendo. ¿Quieres saber sobre sus <strong>estudios</strong> o su <strong>PC</strong>?"
    },
    {
      keys: ["contacto", "contactar", "email", "correo", "escribir", "hablar", "whatsapp", "linkedin"],
      reply: "Puedes contactar con Javier desde el <strong>formulario de contacto</strong> (abajo), por <strong>WhatsApp</strong>, o a través de su <strong>LinkedIn</strong>. Todos los enlaces están en la sección de contacto."
    },
    {
      keys: ["estudio", "estudios", "formacion", "dam", "smx", "recorrido", "carrera", "daw"],
      reply: "Javier terminó el <strong>Grado Medio de SMX</strong> y ahora estudia <strong>DAM</strong> (Desarrollo de Aplicaciones Multiplataforma). Además está mejorando su inglés. Puedes ver su recorrido completo en la sección <strong>Mi recorrido</strong>."
    },
    {
      keys: ["pc", "ordenador", "computadora", "hardware", "grafica", "cpu", "ram", "montaje"],
      reply: "Javier montó su propio <strong>PC gaming</strong> y le apasiona el hardware. En la sección <strong>Dentro del ordenador</strong> hay una foto con puntos interactivos sobre cada componente. ¡Pasa el ratón por encima!"
    },
    {
      keys: ["juego", "juegos", "videojuego", "videojuegos", "gaming", "fallout", "doom", "skyrim", "bioshock", "cyberpunk"],
      reply: "Sus juegos favoritos son <strong>Fallout</strong>, <strong>Doom</strong>, <strong>Skyrim</strong>, <strong>Bioshock</strong> y <strong>Cyberpunk 2077</strong>. Puedes ver las carátulas en la sección <strong>Intereses</strong>."
    },
    {
      keys: ["ingles", "inglés", "b1", "b2", "idioma"],
      reply: "Javier está mejorando su <strong>inglés</strong> paso a paso: B1, B2 y los siguientes. Es uno de sus objetivos personales."
    },
    {
      keys: ["entrena", "entrenar", "entrenamiento", "gimnasio", "deporte", "rutina"],
      reply: "Javier entrena <strong>casi a diario</strong>. Es parte de su disciplina y le ayuda a mantener el compromiso con sus objetivos."
    },
    {
      keys: ["gracias", "genial", "perfecto", "guay", "ok"],
      reply: "¡De nada! 😊 Si necesitas algo más, aquí estoy."
    },
    {
      keys: ["adios", "adiós", "bye", "hasta luego", "chao", "nos vemos"],
      reply: "¡Hasta luego! Que tengas un buen día. 👋"
    },
    {
      keys: ["quien eres", "quién eres", "que eres", "qué eres", "como te llamas", "cómo te llamas", "nombre"],
      reply: "Soy el asistente virtual de Javier Sansano, creado para ayudarte a conocer mejor su portafolio. Pregúntame lo que quieras sobre él."
    }
  ];

  /* ---------------------------------------------------------
     Función que busca la mejor respuesta
     --------------------------------------------------------- */
  const findReply = (text) => {
    const normalized = text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, ""); // quita tildes

    // Buscamos coincidencia por palabra clave
    for (const item of knowledge) {
      for (const key of item.keys) {
        const keyNorm = key.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        if (normalized.includes(keyNorm)) return item.reply;
      }
    }

    // Respuesta por defecto si no encuentra nada
    return "No estoy seguro de eso. Prueba con: <strong>proyectos</strong>, <strong>estudios</strong>, <strong>contacto</strong>, <strong>PC</strong> o <strong>juegos</strong>. También puedes usar los botones de abajo. 👇";
  };

  /* ---------------------------------------------------------
     Añadir un mensaje al chat
     --------------------------------------------------------- */
  const addMessage = (text, type = "bot") => {
    const msg = document.createElement("div");
    msg.className = `chat__msg chat__msg--${type}`;
    msg.innerHTML = text;
    chatMessages.appendChild(msg);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  };

  /* ---------------------------------------------------------
     Mostrar indicador "escribiendo..." y luego la respuesta
     --------------------------------------------------------- */
  const botReply = (text) => {
    // Indicador de escritura
    const typing = document.createElement("div");
    typing.className = "chat__typing";
    typing.innerHTML = "<span></span><span></span><span></span>";
    chatMessages.appendChild(typing);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Esperamos entre 500 y 1000ms (simula que "piensa")
    const delay = 500 + Math.random() * 500;

    window.setTimeout(() => {
      typing.remove();
      addMessage(text, "bot");
    }, delay);
  };

  /* ---------------------------------------------------------
     Abrir / cerrar el chat
     --------------------------------------------------------- */
  const openChat = () => {
    chat.classList.add("is-open");
    chatToggle.setAttribute("aria-expanded", "true");
    chatPanel.setAttribute("aria-hidden", "false");
    safeSet("portfolio-chat-open", "true");
    window.setTimeout(() => chatInput?.focus(), 350);
  };

  const closeChat = () => {
    chat.classList.remove("is-open");
    chatToggle.setAttribute("aria-expanded", "false");
    chatPanel.setAttribute("aria-hidden", "true");
    safeSet("portfolio-chat-open", "false");
  };

  chatToggle.addEventListener("click", openChat);
  chatClose?.addEventListener("click", closeChat);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && chat.classList.contains("is-open")) {
      closeChat();
    }
  });

  /* ---------------------------------------------------------
     Mensaje de bienvenida (solo la primera vez que se abre)
     --------------------------------------------------------- */
  let welcomeShown = false;

  const showWelcome = () => {
    if (welcomeShown) return;
    welcomeShown = true;
    addMessage(
      "¡Hola! 👋 Soy el asistente de <strong>Javier</strong>. ¿Sobre qué te gustaría saber?",
      "bot"
    );
    addMessage(
      "Puedes escribir tu pregunta o usar los botones de abajo. 👇",
      "bot"
    );
  };

  chatToggle.addEventListener("click", () => {
    if (!welcomeShown) showWelcome();
  });

  /* ---------------------------------------------------------
     Enviar mensaje desde el formulario
     --------------------------------------------------------- */
  chatForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const text = chatInput.value.trim();
    if (!text) return;

    addMessage(text, "user");
    chatInput.value = "";

    const reply = findReply(text);
    botReply(reply);
  });

  /* ---------------------------------------------------------
     Botones rápidos
     --------------------------------------------------------- */
  $$(".chat__quick-btn", chatQuick).forEach((btn) => {
    btn.addEventListener("click", () => {
      const text = btn.dataset.msg || btn.textContent;
      addMessage(text, "user");
      const reply = findReply(text);
      botReply(reply);
    });
  });

  /* ---------------------------------------------------------
     Si el chat estaba abierto, reabrirlo al cargar
     --------------------------------------------------------- */
  const storedChatOpen = safeGet("portfolio-chat-open");
  if (storedChatOpen === "true") {
    window.setTimeout(openChat, 800);
  }

})();