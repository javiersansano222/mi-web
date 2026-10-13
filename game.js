/* =========================================================
   GAME.JS — Cyber Descent
   Fases 3 y 4: Obstáculos, colisiones, niveles y récord
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
    gravity: 0.7,
    groundRatio: 0.85,
    groundY: 0,
    speed: 4,           // velocidad base
    spawnTimer: 0,      // temporizador para el próximo obstáculo
    spawnInterval: 90,  // frames entre obstáculos (a menor, más seguidos)
    frame: 0,           // contador de frames
  };

  // --- Jugador ---
  const player = {
    x: 100,
    y: 0,
    size: 32,
    vy: 0,
    jumpForce: -14,
    onGround: true,
  };

  // --- Obstáculos ---
  let obstacles = [];

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

  // --- Generar obstáculo ---
  const spawnObstacle = () => {
    // Variar tamaño según nivel
    const baseSize = 30;
    const sizeVariation = Math.min(game.level * 2, 20);
    const w = baseSize + Math.random() * sizeVariation;
    const h = 30 + Math.random() * 30;

    obstacles.push({
      x: W + 50,
      y: game.groundY - h,
      w,
      h,
      passed: false, // para contar la puntuación
    });
  };

  // --- Comprobar colisión (AABB) ---
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

    // Guardar récord
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
    game.speed = 4;
    game.spawnTimer = 0;
    game.spawnInterval = 90;
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

    // Colisión con el suelo
    if (player.y >= game.groundY - player.size) {
      player.y = game.groundY - player.size;
      player.vy = 0;
      player.onGround = true;
    }

    // Distancia
    game.distance += game.speed * 0.1;

    // Generar obstáculos
    game.spawnTimer++;
    if (game.spawnTimer >= game.spawnInterval) {
      spawnObstacle();
      game.spawnTimer = 0;
      // Reducir un poco el intervalo para hacerlo más difícil
      game.spawnInterval = Math.max(40, game.spawnInterval - 1);
    }

    // Mover obstáculos
    obstacles.forEach((o) => {
      o.x -= game.speed;

      // Contar puntos al pasar un obstáculo
      if (!o.passed && o.x + o.w < player.x) {
        o.passed = true;
        game.distance += 10;
      }
    });

    // Eliminar obstáculos fuera de pantalla
    obstacles = obstacles.filter((o) => o.x + o.w > -50);

    // Detección de colisiones
    for (const o of obstacles) {
      if (checkCollision(player, o)) {
        gameOver();
        return;
      }
    }

    // Subir de nivel cada 500 m
    const newLevel = Math.floor(game.distance / 500) + 1;
    if (newLevel > game.level) {
      game.level = newLevel;
      game.speed += 0.5; // aumentar velocidad
      if (levelEl) levelEl.textContent = game.level;
    }

    // Actualizar HUD
    if (distanceEl) distanceEl.textContent = Math.floor(game.distance);
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
    const offsetX = -(game.distance * 2) % gridSize;
    for (let x = offsetX; x < W; x += gridSize) {
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

    // Obstáculos (rectángulos cian con glow)
    obstacles.forEach((o) => {
      ctx.fillStyle = "#00fff7";
      ctx.shadowColor = "#00fff7";
      ctx.shadowBlur = 10;
      ctx.fillRect(o.x, o.y, o.w, o.h);
      ctx.shadowBlur = 0;

      // Borde blanco
      ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
      ctx.lineWidth = 1;
      ctx.strokeRect(o.x, o.y, o.w, o.h);
    });

    // Jugador (cuadrado magenta con glow)
    ctx.fillStyle = "#ff00e5";
    ctx.shadowColor = "#ff00e5";
    ctx.shadowBlur = 15;
    ctx.fillRect(player.x, player.y, player.size, player.size);
    ctx.shadowBlur = 0;

    // Borde blanco del jugador
    ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
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

  console.info("[game] Cyber Descent — Fases 3 y 4 iniciadas.");
})();