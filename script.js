/// script.js

document.addEventListener("DOMContentLoaded", () => {
  // 1. Año dinámico en el pie de página
  const year = document.getElementById("year");
  if (year) {
    year.textContent = new Date().getFullYear();
  }

  // 2. Lógica para abrir/cerrar el menú responsivo (Hamburguesa)
  const navToggle = document.getElementById("nav-toggle");
  const mainNav = document.getElementById("main-nav");

  if (navToggle && mainNav) {
    navToggle.addEventListener("click", () => {
      navToggle.classList.toggle("open");
      mainNav.classList.toggle("nav-open");
    });

    // Cerrar el menú al hacer clic en cualquier enlace
    const navLinks = mainNav.querySelectorAll("a");
    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        navToggle.classList.remove("open");
        mainNav.classList.remove("nav-open");
      });
    });
  }

  // 3. Barra de progreso de lectura al hacer scroll
  const progressBar = document.getElementById("scroll-progress");
  if (progressBar) {
    window.addEventListener(
      "scroll",
      () => {
        const winScroll = document.documentElement.scrollTop;
        const height =
          document.documentElement.scrollHeight -
          document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        progressBar.style.width = scrolled + "%";
      },
      { passive: true }
    );
  }

  // 4. Animación de aparición escalonada (Stagger Effect)
  const reveals = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");

            // Animación en cascada para tarjetas y elementos de la línea de tiempo
            const cards = entry.target.querySelectorAll(".card, .timeline li");
            cards.forEach((card, index) => {
              setTimeout(() => {
                card.style.opacity = "1";
                card.style.transform = "translateY(0)";
              }, index * 120);
            });

            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    reveals.forEach((el) => observer.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("visible"));
  }

  // 5. Parpadeo dinámico aleatorio para las luces de las torres Art Déco
  const windows = document.querySelectorAll(".tower-body .win");
  if (windows.length > 0) {
    setInterval(() => {
      const randomIndex = Math.floor(Math.random() * windows.length);
      windows[randomIndex].classList.toggle("on");
    }, 1800);
  }

  // 6. Desplazamiento suave para enlaces internos
  const internalLinks = document.querySelectorAll('a[href^="#"]');

  internalLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");
      const target = document.querySelector(href);

      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  // 7. Resaltar enlace activo de navegación al hacer scroll
  const sections = document.querySelectorAll("section[id], footer[id]");
  const navLinks = document.querySelectorAll(".main-nav a");

  const activateLink = () => {
    let currentId = "";

    sections.forEach((section) => {
      const sectionTop = section.offsetTop - 140;

      if (window.scrollY >= sectionTop) {
        currentId = section.getAttribute("id");
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove("active");

      if (link.getAttribute("href") === `#${currentId}`) {
        link.classList.add("active");
      }
    });
  };

  window.addEventListener("scroll", activateLink, { passive: true });
  activateLink();
});

// 8. Modo claro / oscuro con persistencia en localStorage
(function () {
  const root = document.documentElement;
  const btn = document.getElementById("theme-toggle");
  if (!btn) return;

  const saved = localStorage.getItem("theme");
  const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
  root.setAttribute("data-theme", saved || (prefersLight ? "light" : "dark"));

  function sync() {
    const light = root.getAttribute("data-theme") === "light";
    btn.setAttribute("aria-pressed", String(light));
    btn.setAttribute(
      "aria-label",
      light ? "Cambiar a modo oscuro" : "Cambiar a modo claro"
    );
  }
  sync();

  btn.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
    root.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    sync();
  });
})();
// =========================================
// EFECTO MÁQUINA DE ESCRIBIR MÍSTICA / ART DÉCO
// =========================================
document.addEventListener("DOMContentLoaded", () => {
  const textElement = document.getElementById("typewriter-text");
  
  if (textElement) {
    const textToType = "Construyo mi futuro línea a línea: codigo,constancia, y estilo Art deco: asi construyo mi futuro";
    let index = 0;
    const speed = 45; // Velocidad de escritura en milisegundos por letra

    function typeWriter() {
      if (index < textToType.length) {
        const char = textToType.charAt(index);
        
        // Creamos un span para que la última letra escrita haga un leve destello dorado
        const charSpan = document.createElement("span");
        charSpan.classList.add("type-char");
        charSpan.textContent = char;
        
        textElement.appendChild(charSpan);
        index++;

        // Pequeño ritmo irregular para simular el pulso humano de tecleo
        const randomSpeed = speed + Math.random() * 30 - 15;
        setTimeout(typeWriter, randomSpeed);
      }
    }

    // Iniciamos la animación con un pequeño retraso inicial
    setTimeout(typeWriter, 500);
  }
});
// =========================================
// EFECTO TILT 3D INTERACTIVO PARA TARJETAS
// =========================================
document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".card");

  cards.forEach((card) => {
    // Cuando el ratón se mueve dentro de la tarjeta
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      
      // Obtenemos las coordenadas X e Y relativas al centro de la tarjeta
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      // Dividimos para suavizar los grados de inclinación (máximo ~12deg)
      const rotateX = (-y / rect.height) * 15;
      const rotateY = (x / rect.width) * 15;

      // Aplicamos la rotación en 3D + una ligera escala de elevación
      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.03, 1.03, 1.03)`;
    });

    // Cuando el ratón sale de la tarjeta, vuelve suavemente a su posición original
    card.addEventListener("mouseleave", () => {
      card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
    });
  });
});
