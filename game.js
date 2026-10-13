/* =========================================================
   GAME.JS — Cyber Descent (versión espectacular)
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

  let W = 0;
  let H = 0;

  const game = {
    state: "menu",
    distance: 0,
    level: 1,
    record: parseInt(localStorage.getItem("cyber-descent-record") || "0", 10),
    gravity: 0.95,
    groundRatio: 0.85,
    groundY: 0,
    speed: 7,
    baseSpeed: 7,
    spawnTimer: 0,
    spawnInterval: 70,
    frame: 0,
    shake: 0,
    flashTimer: 0,
    palette: 0, // 0=cian/magenta, 1=verde, 2=naranja, 3=azul
    palettes: [
      { primary: "#00fff7", secondary: "#ff00e5", bg1: "#050510", bg2: "#0a1a2e", bg3: "#1a0033" },
      { primary: "#00ff41", secondary: "#b8ffbe", bg1: "#000a00", bg2: "#0a1a0a", bg3: "#003300" },
      { primary: "#ff6b00", secondary: "#ffd166", bg1: "#100500", bg2: "#2e0a00", bg3: "#330f00" },
      { primary: "#8a2be2", secondary: "#00fff7", bg1: "#0a0010", bg2: "#1a002e", bg3: "#2a0033" },
    ],
  };

  const player = {
    x: 100,
    y: 0,
    size: 34,
    vy: 0,
    jumpForce: -16,
    onGround: true,
    rotation: 0,
    trail: [],
  };

  let obstacles = [];
  let particles = [];
  let stars = [];
  let buildings = [];

  if (recordEl) recordEl.textContent = game.record;

  // --- Estrellas de fondo (parallax) ---
  const initStars = () => {
    stars = [];
    for (let i = 0; i < 60; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H * 0.7,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 1.5 + 0.3,
        alpha: Math.random() * 0.7 + 0.3,
      });
    }
  };

  // --- Edificios de fondo (parallax) ---
  const initBuildings = () => {
    buildings = [];
    let x = 0;
    while (x < W + 200) {
      const w = 30 + Math.random() * 50;
      const h = 60 + Math.random() * 180;
      buildings.push({ x, w, h, windows: Math.random() > 0.4 });
      x += w + 20 + Math.random() * 30;
    }
  };

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.floor(rect.width);
    canvas.height = Math.floor(rect.height);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    W = rect.width;
    H = rect.height;
    game.groundY = H * game.groundRatio;
    initStars();
    initBuildings();
  };

  let resizeTimeout = null;
  const debouncedResize = () => {
    if (resizeTimeout) clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(resize, 150);
  };

  resize();
  window.addEventListener("resize", debouncedResize);

  // --- Partículas ---
  const spawnParticles = (x, y, count, color, speed = 3) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const v = Math.random() * speed + 1;
      particles.push({
        x, y,
        vx: Math.cos(angle) * v,
        vy: Math.sin(angle) * v - 1,
        life: 1,
        decay: 0.02 + Math.random() * 0.02,
        size: Math.random() * 3 + 1,
        color,
      });
    }
  };

  const jump = () => {
    if (game.state === "playing" && player.onGround) {
      player.vy = player.jumpForce;
      player.onGround = false;
      spawnParticles(player.x + player.size / 2, player.y + player.size, 12, game.palettes[game.palette].primary);
    }
  };

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
    const types = ["block", "spike", "laser"];
    const type = types[Math.floor(Math.random() * Math.min(game.level, 3))];
    const palette = game.palettes[game.palette];

    if (type === "block") {
      const w = 30 + Math.random() * 20;
      const h = 40 + Math.random() * 30;
      obstacles.push({ x: W + 50, y: game.groundY - h, w, h, type, passed: false });
    } else if (type === "spike") {
      const w = 30 + Math.random() * 15;
      const h = 50 + Math.random() * 20;
      obstacles.push({ x: W + 50, y: game.groundY - h, w, h, type: "spike", passed: false });
    } else if (type === "laser") {
      const h = 8;
      const y = game.groundY - 100 - Math.random() * 60;
      obstacles.push({ x: W + 50, y, w: 40, h, type: "laser", passed: false });
    }
  };

  const checkCollision = (a, b) => {
    if (b.type === "laser") {
      // Laser: solo colisiona si el jugador está en su rango vertical
      return (
        a.x < b.x + b.w &&
        a.x + a.size > b.x &&
        a.y < b.y + b.h &&
        a.y + a.size > b.y
      );
    }
    return (
      a.x < b.x + b.w &&
      a.x + a.size > b.x &&
      a.y < b.y + b.h &&
      a.y + a.size > b.y
    );
  };

  const gameOver = () => {
    game.state = "gameover";
    game.shake = 20;

    const palette = game.palettes[game.palette];
    spawnParticles(player.x + player.size / 2, player.y + player.size / 2, 60, palette.secondary, 8);
    spawnParticles(player.x + player.size / 2, player.y + player.size / 2, 30, palette.primary, 6);

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

    setTimeout(() => {
      overlay.classList.remove("is-hidden");
      overlay.setAttribute("aria-hidden", "false");
    }, 800);
  };

  const startGame = () => {
    game.state = "playing";
    game.distance = 0;
    game.level = 1;
    game.speed = game.baseSpeed;
    game.spawnTimer = 0;
    game.spawnInterval = 70;
    game.frame = 0;
    game.shake = 0;
    game.palette = 0;

    obstacles = [];
    particles = [];
    player.trail = [];

    player.y = game.groundY - player.size;
    player.vy = 0;
    player.onGround = true;
    player.rotation = 0;

    overlay.classList.add("is-hidden");
    overlay.setAttribute("aria-hidden", "true");

    if (distanceEl) distanceEl.textContent = "0";
    if (levelEl) levelEl.textContent = "1";
  };

  startBtn.addEventListener("click", startGame);

  const update = () => {
    game.frame++;

    // Física del jugador
    player.vy += game.gravity;
    player.y += player.vy;

    // Rotación del jugador al saltar
    if (!player.onGround) {
      player.rotation += 0.15;
    } else {
      player.rotation *= 0.8;
    }

    if (player.y >= game.groundY - player.size) {
      player.y = game.groundY - player.size;
      if (!player.onGround && player.vy > 5) {
        spawnParticles(player.x + player.size / 2, game.groundY, 8, game.palettes[game.palette].primary);
      }
      player.vy = 0;
      player.onGround = true;
    }

    // Estela del jugador
    player.trail.push({ x: player.x, y: player.y, life: 1 });
    if (player.trail.length > 12) player.trail.shift();
    player.trail.forEach((t) => (t.life -= 0.06));

    // Estrellas parallax
    stars.forEach((s) => {
      s.x -= s.speed;
      if (s.x < 0) {
        s.x = W;
        s.y = Math.random() * H * 0.7;
      }
    });

    // Edificios parallax
    buildings.forEach((b) => {
      b.x -= game.speed * 0.3;
    });
    buildings = buildings.filter((b) => b.x + b.w > -50);
    if (buildings.length === 0 || buildings[buildings.length - 1].x < W) {
      const last = buildings[buildings.length - 1];
      const startX = last ? last.x + last.w + 20 : W;
      const w = 30 + Math.random() * 50;
      const h = 60 + Math.random() * 180;
      buildings.push({ x: startX, w, h, windows: Math.random() > 0.4 });
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

      if (o.x + o.w < -50) {
        obstacles.splice(i, 1);
        continue;
      }

      if (checkCollision(player, o)) {
        gameOver();
        return;
      }
    }

    // Partículas
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.15;
      p.life -= p.decay;
      if (p.life <= 0) particles.splice(i, 1);
    }

    // Subir de nivel cada 500 m + cambio de paleta
    const newLevel = Math.floor(game.distance / 500) + 1;
    if (newLevel > game.level) {
      game.level = newLevel;
      game.speed += 0.7;
      game.palette = (game.palette + 1) % game.palettes.length;
      game.flashTimer = 20;
      if (levelEl) levelEl.textContent = game.level;
    }

    if (distanceEl) distanceEl.textContent = Math.floor(game.distance);

    if (game.shake > 0) game.shake *= 0.9;
    if (game.flashTimer > 0) game.flashTimer--;
  };

  const render = () => {
    const palette = game.palettes[game.palette];

    ctx.save();

    // Screen shake
    if (game.shake > 0.5) {
      ctx.translate(
        (Math.random() - 0.5) * game.shake,
        (Math.random() - 0.5) * game.shake
      );
    }

    // Fondo degradado
    const gradient = ctx.createLinearGradient(0, 0, 0, H);
    gradient.addColorStop(0, palette.bg1);
    gradient.addColorStop(0.6, palette.bg2);
    gradient.addColorStop(1, palette.bg3);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, W, H);

    // Estrellas
    stars.forEach((s) => {
      ctx.globalAlpha = s.alpha;
      ctx.fillStyle = palette.primary;
      ctx.fillRect(s.x, s.y, s.size, s.size);
    });
    ctx.globalAlpha = 1;

    // Edificios (silueta)
    buildings.forEach((b) => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
      ctx.fillRect(b.x, game.groundY - b.h, b.w, b.h);

      // Ventanas
      if (b.windows) {
        ctx.fillStyle = palette.primary;
        ctx.globalAlpha = 0.4;
        for (let wy = game.groundY - b.h + 15; wy < game.groundY - 10; wy += 20) {
          for (let wx = b.x + 6; wx < b.x + b.w - 6; wx += 12) {
            if (Math.random() > 0.7) {
              ctx.fillRect(wx, wy, 3, 5);
            }
          }
        }
        ctx.globalAlpha = 1;
      }
    });

    // Rejilla parallax
    ctx.strokeStyle = `rgba(0, 255, 247, 0.06)`;
    ctx.lineWidth = 1;
    const gridSize = 50;
    const offsetX = -(game.frame * game.speed * 0.2) % gridSize;
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

    // Suelo con glow
    ctx.fillStyle = palette.primary;
    ctx.fillRect(0, game.groundY, W, 3);
    ctx.fillStyle = palette.primary + "55";
    ctx.fillRect(0, game.groundY + 3, W, 10);
    ctx.fillStyle = palette.primary + "22";
    ctx.fillRect(0, game.groundY + 13, W, 15);

    // Obstáculos
    for (let i = 0; i < obstacles.length; i++) {
      const o = obstacles[i];

      if (o.type === "block") {
        ctx.fillStyle = palette.primary;
        ctx.fillRect(o.x, o.y, o.w, o.h);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
        ctx.lineWidth = 2;
        ctx.strokeRect(o.x, o.y, o.w, o.h);

        // Interior con líneas
        ctx.strokeStyle = palette.secondary;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(o.x + 5, o.y + 5);
        ctx.lineTo(o.x + o.w - 5, o.y + o.h - 5);
        ctx.moveTo(o.x + o.w - 5, o.y + 5);
        ctx.lineTo(o.x + 5, o.y + o.h - 5);
        ctx.stroke();

      } else if (o.type === "spike") {
        // Pincho triangular
        ctx.fillStyle = palette.secondary;
        ctx.beginPath();
        ctx.moveTo(o.x, game.groundY);
        ctx.lineTo(o.x + o.w / 2, o.y);
        ctx.lineTo(o.x + o.w, game.groundY);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
        ctx.lineWidth = 2;
        ctx.stroke();

      } else if (o.type === "laser") {
        // Láser parpadeante
        const alpha = 0.7 + Math.sin(game.frame * 0.3) * 0.3;
        ctx.fillStyle = palette.secondary;
        ctx.globalAlpha = alpha;
        ctx.fillRect(o.x, o.y, o.w, o.h);
        ctx.globalAlpha = 1;
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        ctx.fillRect(o.x, o.y + o.h / 2 - 1, o.w, 2);
      }
    }

    // Estela del jugador
    player.trail.forEach((t) => {
      ctx.globalAlpha = t.life * 0.3;
      ctx.fillStyle = palette.secondary;
      ctx.fillRect(t.x + 5, t.y + 5, player.size - 10, player.size - 10);
    });
    ctx.globalAlpha = 1;

    // Jugador (nave)
    ctx.save();
    ctx.translate(player.x + player.size / 2, player.y + player.size / 2);
    ctx.rotate(player.rotation);

    // Núcleo
    ctx.fillStyle = palette.secondary;
    ctx.fillRect(-player.size / 2, -player.size / 2, player.size, player.size);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.strokeRect(-player.size / 2, -player.size / 2, player.size, player.size);

    // Ojo/visor central
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(-4, -4, 8, 8);
    ctx.fillStyle = palette.primary;
    ctx.fillRect(-2, -2, 4, 4);

    ctx.restore();

    // Partículas
    particles.forEach((p) => {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    });
    ctx.globalAlpha = 1;

    // Flash al subir de nivel
    if (game.flashTimer > 0) {
      ctx.fillStyle = `rgba(255, 255, 255, ${game.flashTimer / 40})`;
      ctx.fillRect(0, 0, W, H);
    }

    ctx.restore();
  };

  let lastTime = 0;
  const FRAME_INTERVAL = 1000 / 60;

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

  console.info("[game] Cyber Descent — versión espectacular.");
})();