/* =========================================================
   GAME.JS — Cyber Descent
   Versión optimizada + más rápida
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

  const ctx = canvas.getContext("2d", { alpha: false });

  // --- Dimensiones lógicas ---
  let W = 0;
  let H = 0;

  // --- Estado del juego ---
  const game = {
    state: "menu",
    distance: 0,
    level: 1,
    record: parseInt(localStorage.getItem("cyber-descent-record") || "0", 10),
    gravity: 0.9,           // más gravedad = saltos más rápidos
    groundRatio: 0.85,
    groundY: 0,
    speed: 7,               // velocidad base más alta
    spawnTimer: 0,
    spawnInterval: 70,      // obstáculos más seguidos
    frame: 0,
  };

  // --- Jugador ---
  const player = {
    x: 100,
    y: 0,
    size: 32,
    vy: 0,
    jumpForce: -16,         // salto más alto y rápido
    onGround: true,
  };

  // --- Obstáculos ---
  let obstacles = [];

  if (recordEl) recordEl.textContent = game.record;

  // --- Redimensionar canvas (con debounce) ---
  let resizeTimeout = null;
  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    // Limitar el ratio a 1 para mejorar rendimiento
    const ratio = 1;
    canvas.width = Math.floor(rect.width * ratio);
    canvas.height = Math.floor(rect.height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    W = rect.width;
    H = rect.height;
    game.groundY = H * game.groundRatio;
  };

  const debouncedResize = () => {
    if (resizeTimeout) clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(resize, 150);
  };

  resize();
  window.addEventListener("resize", debouncedResize);

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

  // --- Generar obstáculo ---
  const spawnObstacle = () => {
    const baseSize = 30;
    const sizeVariation = Math.min(game.level * 2, 20);
    const w = baseSize + Math.random() * sizeVariation;
    const h = 30 + Math.random() * 30;

    obstacles.push({
      x: W + 50,
      y: game.groundY - h,
      w,
      h,
      passed: false,
    });
  };

  // --- Colisión AABB ---
  const checkCollision = (a, b) => {
    return (
      a.x < b.x + b.w &&
      a.x + a.size > b.x &&
      a.y < b.y + b.h &&
      a.y + a.size > b.y
    );
  };

  // --- Game Over ---
  const gameOver = () => {
    game.state = "gameover";

    const finalDistance = Math.floor(game.distance);
    if (finalDistance > game.record) {
      game.record = finalDistance;
      localStorage.setItem("cyber-descent-record", String(game.record));
      if (recordEl) recordEl.textContent = game.record;
      overlayTitle.textContent = "¡NUEVO RÉCORD!";
    } else {
      overlayTitle.textContent = "GAME OVER";
    }

    overlayText.textContent = `Has llegado a ${finalDistance} m · Nivel ${game.level}`;
    startBtn.innerHTML = 'Jugar otra vez <span aria-hidden="true">↻</span>';
    overlay.classList.remove("is-hidden");
    overlay.setAttribute("aria-hidden", "false");
  };

  // --- Arrancar partida ---
  const startGame = () => {
    game.state = "playing";
    game.distance = 0;
    game.level = 1;
    game.speed = 7;
    game.spawnTimer = 0;
    game.spawnInterval = 70;
    game.frame = 0;

    obstacles = [];

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
    game.frame++;

    // Física del jugador
    player.vy += game.gravity;
    player.y += player.vy;

    if (player.y >= game.groundY - player.size) {
      player.y = game.groundY - player.size;
      player.vy = 0;
      player.onGround = true;
    }

    game.distance += game.speed * 0.1;

    // Generar obstáculos
    game.spawnTimer++;
    if (game.spawnTimer >= game.spawnInterval) {
      spawnObstacle();
      game.spawnTimer = 0;
      game.spawnInterval = Math.max(35, game.spawnInterval - 1);
    }

    // Mover obstáculos
    for (let i = obstacles.length - 1; i >= 0; i--) {
      const o = obstacles[i];
      o.x -= game.speed;

      if (!o.passed && o.x + o.w < player.x) {
        o.passed = true;
        game.distance += 10;
      }

      // Eliminar si sale de pantalla
      if (o.x + o.w < -50) {
        obstacles.splice(i, 1);
        continue;
      }

      // Colisión
      if (checkCollision(player, o)) {
        gameOver();
        return;
      }
    }

    // Subir de nivel cada 500 m
    const newLevel = Math.floor(game.distance / 500) + 1;
    if (newLevel > game.level) {
      game.level = newLevel;
      game.speed += 0.7;
      if (levelEl) levelEl.textContent = game.level;
    }

    if (distanceEl) distanceEl.textContent = Math.floor(game.distance);
  };

  // --- Renderizado (sin shadowBlur) ---
  const render = () => {
    // Fondo con degradado cyberpunk (cacheado en un objeto)
    const gradient = ctx.createLinearGradient(0, 0, 0, H);
    gradient.addColorStop(0, "#050510");
    gradient.addColorStop(0.6, "#0a1a2e");
    gradient.addColorStop(1, "#1a0033");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, W, H);

    // Rejilla con offset (se mueve con la distancia)
    ctx.strokeStyle = "rgba(0, 255, 247, 0.08)";
    ctx.lineWidth = 1;
    const gridSize = 40;
    const offsetX = -(game.frame * game.speed * 0.15) % gridSize;
    ctx.beginPath();
    for (let x = offsetX; x < W; x += gridSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
    }
    for (let y = 0; y < H; y += gridSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
    }
    ctx.stroke();

    // Suelo
    ctx.fillStyle = "#00fff7";
    ctx.fillRect(0, game.groundY, W, 3);
    // Brillo del suelo (sin shadowBlur, con segunda línea translúcida)
    ctx.fillStyle = "rgba(0, 255, 247, 0.3)";
    ctx.fillRect(0, game.groundY + 3, W, 8);

    // Obstáculos
    for (let i = 0; i < obstacles.length; i++) {
      const o = obstacles[i];
      ctx.fillStyle = "#00fff7";
      ctx.fillRect(o.x, o.y, o.w, o.h);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(o.x, o.y, o.w, o.h);
    }

    // Jugador
    ctx.fillStyle = "#ff00e5";
    ctx.fillRect(player.x, player.y, player.size, player.size);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.strokeRect(player.x, player.y, player.size, player.size);
  };

  // --- Bucle principal ---
  let lastTime = 0;
  const FRAME_INTERVAL = 1000 / 60; // 60 FPS

  const loop = (timestamp) => {
    requestAnimationFrame(loop);

    const elapsed = timestamp - lastTime;
    if (elapsed < FRAME_INTERVAL) return;
    lastTime = timestamp - (elapsed % FRAME_INTERVAL);

    if (game.state === "playing") {
      update();
    }
    render();
  };

  requestAnimationFrame(loop);

  console.info("[game] Cyber Descent — versión optimizada.");
})();