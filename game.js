/* =========================================================
   GAME.JS — Cyber Descent
   Fase 2: Jugador + salto + botón funcional
   ========================================================= */
(() => {
  "use strict";

  const canvas = document.getElementById("game-canvas");
  const overlay = document.getElementById("game-overlay");
  const overlayTitle = document.getElementById("game-overlay-title");
  const overlayText = document.getElementById("game-overlay-text");
  const startBtn = document.getElementById("game-start-btn");
  const distanceEl = document.getElementById("game-distance");
  const recordEl = document.getElementById("game-record");
  const levelEl = document.getElementById("game-level");

  if (!canvas || !overlay || !startBtn) return;

  const ctx = canvas.getContext("2d");

  // --- Dimensiones lógicas ---
  let W = 0;
  let H = 0;

  // --- Estado del juego ---
  const game = {
    state: "menu", // "menu" | "playing" | "gameover"
    distance: 0,
    level: 1,
    record: parseInt(localStorage.getItem("cyber-descent-record") || "0", 10),
    gravity: 0.55,
    groundRatio: 0.8, // el suelo está al 80% de la altura
    groundY: 0,
  };

  // --- Jugador ---
  const player = {
    x: 100,
    y: 0,
    size: 32,
    vy: 0,
    jumpForce: -12,
    onGround: true,
  };

  // Actualizar récord mostrado
  if (recordEl) recordEl.textContent = game.record;

  // --- Redimensionar canvas ---
  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(rect.width * ratio);
    canvas.height = Math.floor(rect.height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    W = rect.width;
    H = rect.height;
    game.groundY = H * game.groundRatio;
  };
  resize();
  window.addEventListener("resize", resize);

  // --- Salto ---
  const jump = () => {
    if (game.state === "playing" && player.onGround) {
      player.vy = player.jumpForce;
      player.onGround = false;
    }
  };

  // --- Controles ---
  document.addEventListener("keydown", (e) => {
    if (e.key === " " || e.key === "ArrowUp") {
      e.preventDefault();
      jump();
    }
  });

  canvas.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    jump();
  });

  // --- Arrancar partida ---
  const startGame = () => {
    game.state = "playing";
    game.distance = 0;
    game.level = 1;
    player.y = game.groundY - player.size;
    player.vy = 0;
    player.onGround = true;
    overlay.classList.add("is-hidden");
    overlay.setAttribute("aria-hidden", "true");
    if (distanceEl) distanceEl.textContent = "0";
    if (levelEl) levelEl.textContent = "1";
  };

  startBtn.addEventListener("click", startGame);

  // --- Actualizar ---
  const update = () => {
    // Física del jugador
    player.vy += game.gravity;
    player.y += player.vy;

    // Colisión con el suelo
    if (player.y >= game.groundY - player.size) {
      player.y = game.groundY - player.size;
      player.vy = 0;
      player.onGround = true;
    }
  };

  // --- Renderizado ---
  const render = () => {
    // Fondo con degradado cyberpunk
    const gradient = ctx.createLinearGradient(0, 0, 0, H);
    gradient.addColorStop(0, "#050510");
    gradient.addColorStop(0.6, "#0a1a2e");
    gradient.addColorStop(1, "#1a0033");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, W, H);

    // Rejilla
    ctx.strokeStyle = "rgba(0, 255, 247, 0.08)";
    ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x < W; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let y = 0; y < H; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    // Suelo (línea cian con glow)
    ctx.fillStyle = "#00fff7";
    ctx.shadowColor = "#00fff7";
    ctx.shadowBlur = 12;
    ctx.fillRect(0, game.groundY, W, 3);
    ctx.shadowBlur = 0;

    // Jugador (cuadrado cian con glow)
    ctx.fillStyle = "#ff00e5";
    ctx.shadowColor = "#ff00e5";
    ctx.shadowBlur = 15;
    ctx.fillRect(player.x, player.y, player.size, player.size);
    ctx.shadowBlur = 0;

    // Borde blanco del jugador
    ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(player.x, player.y, player.size, player.size);
  };

  // --- Bucle principal ---
  const loop = () => {
    if (game.state === "playing") {
      update();
    }
    render();
    requestAnimationFrame(loop);
  };
  loop();

  console.info("[game] Cyber Descent — Fase 2 iniciada.");
})();