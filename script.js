(() => {
  "use strict";

  const root = document.documentElement;
  const $ = (sel, scope = document) => scope.querySelector(sel);
  const $$ = (sel, scope = document) => [...scope.querySelectorAll(sel)];

  const safeGet = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
  const safeSet = (k, v) => { try { localStorage.setItem(k, v); } catch {} };
  const prefersReducedMotion = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  console.info("[script] Iniciando…");

  /* =========================================================
     1. INTRO
     ========================================================= */
  const introOverlay = $("#intro-overlay");
  const introBar = $("#intro-bar");
  const introPercent = $("#intro-percent");

  const introAlreadySeen = safeGet("portfolio-intro-seen") === "true";
  const skipIntro = prefersReducedMotion() || introAlreadySeen;

  console.info("[script] intro overlay:", !!introOverlay,
               "| ya vista:", introAlreadySeen,
               "| reduced-motion:", prefersReducedMotion());

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
    console.info("[script] Intro en marcha…");
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
     12. CHATBOT
     ========================================================= */
  const chat = $("#chat");
  const chatToggle = $("#chat-toggle");
  const chatClose = $("#chat-close");
  const chatPanel = $("#chat-panel");
  const chatMessages = $("#chat-messages");
  const chatForm = $("#chat-form");
  const chatInput = $("#chat-input");
  const chatQuick = $("#chat-quick");

  if (chat && chatToggle && chatPanel) {
    const knowledge = [
      { keys: ["hola","buenas","hey"], reply: "¡Hola! Soy el asistente de Javier. Pregúntame por sus <strong>proyectos</strong>, <strong>estudios</strong>, <strong>PC</strong>, <strong>juegos</strong> o <strong>contacto</strong>." },
      { keys: ["proyecto","portfolio","web"], reply: "Javier ha creado este <strong>portafolio</strong> con HTML, CSS y JavaScript. Está estudiando DAM." },
      { keys: ["contacto","whatsapp","linkedin","email"], reply: "Puedes contactarle por el <strong>formulario</strong>, <strong>WhatsApp</strong> o <strong>LinkedIn</strong>." },
      { keys: ["estudio","dam","smx","formacion"], reply: "Terminó <strong>SMX</strong> y ahora estudia <strong>DAM</strong>." },
      { keys: ["pc","ordenador","hardware"], reply: "Montó su propio <strong>PC gaming</strong>. Míralo en la sección <strong>Dentro del ordenador</strong>." },
      { keys: ["juego","fallout","doom","skyrim","bioshock","cyberpunk"], reply: "Sus favoritos: <strong>Fallout</strong>, <strong>Doom</strong>, <strong>Skyrim</strong>, <strong>Bioshock</strong> y <strong>Cyberpunk 2077</strong>." },
      { keys: ["gracias"], reply: "¡De nada! 😊" },
      { keys: ["adios","bye"], reply: "¡Hasta luego! 👋" }
    ];

    const findReply = (text) => {
      const n = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      for (const item of knowledge) {
        for (const k of item.keys) {
          const kn = k.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          if (n.includes(kn)) return item.reply;
        }
      }
      return "No estoy seguro. Prueba con <strong>proyectos</strong>, <strong>estudios</strong>, <strong>PC</strong> o <strong>juegos</strong>.";
    };

    const addMessage = (text, type = "bot") => {
      const msg = document.createElement("div");
      msg.className = `chat__msg chat__msg--${type}`;
      msg.innerHTML = text;
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
        addMessage("¡Hola! 👋 Soy el asistente de <strong>Javier</strong>. ¿Sobre qué quieres saber?", "bot");
        addMessage("Escribe tu pregunta o usa los botones de abajo 👇", "bot");
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
      addMessage(text, "user");
      chatInput.value = "";
      botReply(findReply(text));
    });
    $$(".chat__quick-btn", chatQuick || document).forEach((btn) => {
      btn.addEventListener("click", () => {
        const text = btn.dataset.msg || btn.textContent;
        addMessage(text, "user");
        botReply(findReply(text));
      });
    });

    if (safeGet("portfolio-chat-open") === "true") {
      setTimeout(openChat, 800);
    }
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

  console.info("[script] Todo listo.");
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

  // Info de cada componente
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

  // Mostrar tooltip en una posición (relativa al diagrama)
  const showTooltip = (part, targetEl) => {
    const info = partsInfo[part];
    if (!info || !tooltip) return;

    tooltipTitle.textContent = info.title;
    tooltipDesc.textContent = info.desc;

    // Posición relativa al diagrama
    const diagramRect = pcDiagram.getBoundingClientRect();
    const targetRect = targetEl.getBoundingClientRect();
    const x = targetRect.left + targetRect.width / 2 - diagramRect.left;
    const y = targetRect.top - diagramRect.top;

    tooltip.style.left = x + "px";
    tooltip.style.top = y + "px";
    tooltip.classList.add("is-visible");
    tooltip.setAttribute("aria-hidden", "false");

    // Marcar parte activa
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

  // Eventos en cada parte del SVG
  allParts.forEach((el) => {
    el.addEventListener("mouseenter", () => showTooltip(el.dataset.part, el));
    el.addEventListener("mouseleave", hideTooltip);
    el.addEventListener("focus", () => showTooltip(el.dataset.part, el));
    el.addEventListener("blur", hideTooltip);
    el.addEventListener("click", () => showTooltip(el.dataset.part, el));
  });

  // Eventos en la leyenda (también interactiva)
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

  // Ocultar al salir del diagrama completo
  pcDiagram.addEventListener("mouseleave", hideTooltip);
}
})();
