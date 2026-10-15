/* =========================================================
   GAME.JS — Cyber Descent
   Versión final: 5 niveles + victoria + más rápido y difícil
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

  /* =========================================================
     AUDIO — Web Audio API (motor de sonido)
     ========================================================= */
  let audioCtx = null;
  let muted = localStorage.getItem("cyber-descent-muted") === "true";

  const getAudio = () => {
    if (muted) return null;
    if (!audioCtx) {
      try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      } catch (err) {
        console.warn("[audio] No se pudo crear AudioContext:", err);
        return null;
      }
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    return audioCtx;
  };

  const playTone = ({
    freq = 440,
    type = "square",
    duration = 0.12,
    volume = 0.15,
    slideTo = null,
  } = {}) => {
    const ac = getAudio();
    if (!ac) return;

    const now = ac.currentTime;
    const osc = ac.createOscillator();
    const gain = ac.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    if (slideTo !== null) {
      osc.frequency.exponentialRampToValueAtTime(
        Math.max(1, slideTo),
        now + duration
      );
    }

    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(ac.destination);

    osc.start(now);
    osc.stop(now + duration + 0.02);
  };

  let W = 0;
  let H = 0;

  // --- 5 niveles con dificultad progresiva ---
  const LEVELS = [
    { name: "INICIACIÓN",   distance: 400, speed: 9,  spawnInterval: 60, obstacleTypes: ["block", "float"],                  gravity: 0.95, jumpForce: -16 },
    { name: "ACELERACIÓN",  distance: 500, speed: 11, spawnInterval: 50, obstacleTypes: ["block", "spike", "float"],        gravity: 0.95, jumpForce: -16 },
    { name: "PELIGRO",      distance: 600, speed: 13, spawnInterval: 42, obstacleTypes: ["block", "spike", "laser", "float"], gravity: 0.95, jumpForce: -16 },
    { name: "SOBRECARGA",   distance: 700, speed: 15, spawnInterval: 35, obstacleTypes: ["block", "spike", "laser", "float"], gravity: 0.95, jumpForce: -17 },
    { name: "SINGULARIDAD", distance: 800, speed: 18, spawnInterval: 28, obstacleTypes: ["block", "spike", "laser", "float"], gravity: 0.95, jumpForce: -17 },
  ];

  const game = {
    state: "menu",
    distance: 0,
    level: 1,
    record: parseInt(localStorage.getItem("cyber-descent-record") || "0", 10),
    gravity: 0.95,
    groundRatio: 0.85,
    groundY: 0,
    speed: 9,
    baseSpeed: 9,
    spawnTimer: 0,
    spawnInterval: 60,
    frame: 0,
    shake: 0,
    flashTimer: 0,
    palette: 0,
    levelStartDistance: 0,
    palettes: [
      { primary: "#00fff7", secondary: "#ff00e5", bg1: "#050510", bg2: "#0a1a2e", bg3: "#1a0033" },
      { primary: "#00ff41", secondary: "#b8ffbe", bg1: "#000a00", bg2: "#0a1a0a", bg3: "#003300" },
      { primary: "#ff6b00", secondary: "#ffd166", bg1: "#100500", bg2: "#2e0a00", bg3: "#330f00" },
      { primary: "#8a2be2", secondary: "#00fff7", bg1: "#0a0010", bg2: "#1a002e", bg3: "#2a0033" },
      { primary: "#ff003c", secondary: "#f5ff00", bg1: "#100000", bg2: "#2e0000", bg3: "#330000" },
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
      playTone({ freq: 880, type: "square", duration: 0.08, volume: 0.12 });
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

  const spawnObstacle = () => {
    const currentLevel = LEVELS[game.level - 1] || LEVELS[LEVELS.length - 1];
    const types = currentLevel.obstacleTypes;
    const type = types[Math.floor(Math.random() * types.length)];

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
    } else if (type === "float") {
      const w = 40 + Math.random() * 20;
      const h = 30 + Math.random() * 20;
      const y = game.groundY - 80 - Math.random() * 30;
      obstacles.push({ x: W + 50, y, w, h, type: "float", passed: false });
    }
  };

  const checkCollision = (a, b) => {
    return (
      a.x < b.x + b.w &&
      a.x + a.size > b.x &&
      a.y < b.y + b.h &&
      a.y + a.size > b.y
    );
  };

  const winGame = () => {
    game.state = "won";
    game.shake = 15;
    playTone({ freq: 523, type: "triangle", duration: 0.12, volume: 0.18 });
    setTimeout(() => playTone({ freq: 659, type: "triangle", duration: 0.12, volume: 0.18 }), 130);
    setTimeout(() => playTone({ freq: 784, type: "triangle", duration: 0.12, volume: 0.18 }), 260);
    setTimeout(() => playTone({ freq: 1046, type: "triangle", duration: 0.3, volume: 0.2 }), 390);

    const palette = game.palettes[game.palette];
    spawnParticles(player.x + player.size / 2, player.y + player.size / 2, 80, palette.primary, 10);
    spawnParticles(player.x + player.size / 2, player.y + player.size / 2, 60, palette.secondary, 8);

    const finalDistance = Math.floor(game.distance);
    if (finalDistance > game.record) {
      game.record = finalDistance;
      localStorage.setItem("cyber-descent-record", String(game.record));
      if (recordEl) recordEl.textContent = game.record;
    }

    overlayTitle.textContent = "¡MISIÓN COMPLETADA!";
    overlayText.innerHTML = `Has superado los <strong>5 niveles</strong>.<br>Distancia total: <strong>${finalDistance} m</strong>.<br>¡Eres una leyenda del Cyber Descent!`;
    startBtn.innerHTML = 'Jugar otra vez <span aria-hidden="true">↻</span>';

    setTimeout(() => {
      overlay.classList.remove("is-hidden");
      overlay.setAttribute("aria-hidden", "false");
    }, 1000);
  };

  const gameOver = () => {
    game.state = "gameover";
    game.shake = 20;
    playTone({ freq: 220, type: "sawtooth", duration: 0.4, volume: 0.18, slideTo: 60 });

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

    const currentLevel = LEVELS[game.level - 1] || LEVELS[LEVELS.length - 1];
    overlayText.innerHTML = `Has llegado a <strong>${finalDistance} m</strong><br>Nivel ${game.level} · ${currentLevel.name}`;
    startBtn.innerHTML = 'Reintentar <span aria-hidden="true">↻</span>';

    setTimeout(() => {
      overlay.classList.remove("is-hidden");
      overlay.setAttribute("aria-hidden", "false");
    }, 800);
  };

  const startGame = () => {
    game.state = "playing";
    game.distance = 0;
    game.level = 1;
    game.palette = 0;
    game.levelStartDistance = 0;

    const level = LEVELS[0];
    game.speed = level.speed;
    game.baseSpeed = level.speed;
    game.spawnInterval = level.spawnInterval;
    game.gravity = level.gravity;
    player.jumpForce = level.jumpForce;

    game.spawnTimer = 0;
    game.frame = 0;
    game.shake = 0;
    game.flashTimer = 0;

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

    player.vy += game.gravity;
    player.y += player.vy;

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

    player.trail.push({ x: player.x, y: player.y, life: 1 });
    if (player.trail.length > 12) player.trail.shift();
    player.trail.forEach((t) => (t.life -= 0.06));

    stars.forEach((s) => {
      s.x -= s.speed;
      if (s.x < 0) {
        s.x = W;
        s.y = Math.random() * H * 0.7;
      }
    });

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

    game.spawnTimer++;
    if (game.spawnTimer >= game.spawnInterval) {
      spawnObstacle();
      game.spawnTimer = 0;
      game.spawnInterval = Math.max(20, game.spawnInterval - 0.5);
    }

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

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.15;
      p.life -= p.decay;
      if (p.life <= 0) particles.splice(i, 1);
    }

    const currentLevel = LEVELS[game.level - 1];
    if (currentLevel) {
      const distanceInLevel = game.distance - game.levelStartDistance;
      if (distanceInLevel >= currentLevel.distance) {
        if (game.level < LEVELS.length) {
          game.level++;
          game.levelStartDistance = game.distance;
          const nextLevel = LEVELS[game.level - 1];
          game.speed = nextLevel.speed;
          game.spawnInterval = nextLevel.spawnInterval;
          game.gravity = nextLevel.gravity;
          player.jumpForce = nextLevel.jumpForce;
          game.palette = (game.level - 1) % game.palettes.length;
          game.flashTimer = 25;
          playTone({ freq: 523, type: "triangle", duration: 0.1, volume: 0.15 });
          setTimeout(() => playTone({ freq: 659, type: "triangle", duration: 0.1, volume: 0.15 }), 90);
          setTimeout(() => playTone({ freq: 784, type: "triangle", duration: 0.15, volume: 0.15 }), 180);
          if (levelEl) levelEl.textContent = game.level;
          console.info(`[game] Nivel ${game.level}: ${nextLevel.name}`);
        } else {
          winGame();
          return;
        }
      }
    }

    if (distanceEl) distanceEl.textContent = Math.floor(game.distance);

    if (game.shake > 0) game.shake *= 0.9;
    if (game.flashTimer > 0) game.flashTimer--;
  };

  const render = () => {
    const palette = game.palettes[game.palette];

    ctx.save();

    if (game.shake > 0.5) {
      ctx.translate(
        (Math.random() - 0.5) * game.shake,
        (Math.random() - 0.5) * game.shake
      );
    }

    const gradient = ctx.createLinearGradient(0, 0, 0, H);
    gradient.addColorStop(0, palette.bg1);
    gradient.addColorStop(0.6, palette.bg2);
    gradient.addColorStop(1, palette.bg3);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, W, H);

    stars.forEach((s) => {
      ctx.globalAlpha = s.alpha;
      ctx.fillStyle = palette.primary;
      ctx.fillRect(s.x, s.y, s.size, s.size);
    });
    ctx.globalAlpha = 1;

    buildings.forEach((b) => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
      ctx.fillRect(b.x, game.groundY - b.h, b.w, b.h);

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

    ctx.fillStyle = palette.primary;
    ctx.fillRect(0, game.groundY, W, 3);
    ctx.fillStyle = palette.primary + "55";
    ctx.fillRect(0, game.groundY + 3, W, 10);
    ctx.fillStyle = palette.primary + "22";
    ctx.fillRect(0, game.groundY + 13, W, 15);

    for (let i = 0; i < obstacles.length; i++) {
      const o = obstacles[i];

      if (o.type === "block") {
        ctx.fillStyle = palette.primary;
        ctx.fillRect(o.x, o.y, o.w, o.h);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
        ctx.lineWidth = 2;
        ctx.strokeRect(o.x, o.y, o.w, o.h);

        ctx.strokeStyle = palette.secondary;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(o.x + 5, o.y + 5);
        ctx.lineTo(o.x + o.w - 5, o.y + o.h - 5);
        ctx.moveTo(o.x + o.w - 5, o.y + 5);
        ctx.lineTo(o.x + 5, o.y + o.h - 5);
        ctx.stroke();

      } else if (o.type === "spike") {
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
        const alpha = 0.7 + Math.sin(game.frame * 0.3) * 0.3;
        ctx.fillStyle = palette.secondary;
        ctx.globalAlpha = alpha;
        ctx.fillRect(o.x, o.y, o.w, o.h);
        ctx.globalAlpha = 1;
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        ctx.fillRect(o.x, o.y + o.h / 2 - 1, o.w, 2);

      } else if (o.type === "float") {
        ctx.fillStyle = palette.primary;
        ctx.globalAlpha = 0.85;
        ctx.fillRect(o.x, o.y, o.w, o.h);
        ctx.globalAlpha = 1;
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.strokeRect(o.x, o.y, o.w, o.h);
        ctx.setLineDash([]);
        ctx.strokeStyle = palette.secondary;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(o.x + 5, o.y + 5);
        ctx.lineTo(o.x + o.w - 5, o.y + o.h - 5);
        ctx.stroke();
      }
    }

    player.trail.forEach((t) => {
      ctx.globalAlpha = t.life * 0.3;
      ctx.fillStyle = palette.secondary;
      ctx.fillRect(t.x + 5, t.y + 5, player.size - 10, player.size - 10);
    });
    ctx.globalAlpha = 1;

    ctx.save();
    ctx.translate(player.x + player.size / 2, player.y + player.size / 2);
    ctx.rotate(player.rotation);

    ctx.fillStyle = palette.secondary;
    ctx.fillRect(-player.size / 2, -player.size / 2, player.size, player.size);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.strokeRect(-player.size / 2, -player.size / 2, player.size, player.size);

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(-4, -4, 8, 8);
    ctx.fillStyle = palette.primary;
    ctx.fillRect(-2, -2, 4, 4);

    ctx.restore();

    particles.forEach((p) => {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    });
    ctx.globalAlpha = 1;

    if (game.flashTimer > 0) {
      ctx.fillStyle = `rgba(255, 255, 255, ${game.flashTimer / 40})`;
      ctx.fillRect(0, 0, W, H);
    }

    const currentLevel = LEVELS[game.level - 1] || LEVELS[LEVELS.length - 1];
    if (game.state === "playing" && currentLevel) {
      ctx.font = "bold 14px 'JetBrains Mono', monospace";
      ctx.fillStyle = palette.primary;
      ctx.globalAlpha = 0.5;
      ctx.fillText(`NIVEL ${game.level} · ${currentLevel.name}`, 16, 32);
      ctx.globalAlpha = 1;
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

  window.__playTone = playTone;

  /* =========================================================
     BOTÓN DE MUTE + ATAJO DE TECLADO
     ========================================================= */
  const muteBtn = document.getElementById("game-mute");

  const syncMuteButton = () => {
    if (!muteBtn) return;
    muteBtn.textContent = muted ? "🔇" : "🔊";
    muteBtn.setAttribute("aria-pressed", String(muted));
    muteBtn.setAttribute(
      "aria-label",
      muted ? "Activar sonido" : "Silenciar sonido"
    );
  };

  const toggleMute = () => {
    muted = !muted;
    localStorage.setItem("cyber-descent-muted", String(muted));
    syncMuteButton();
    if (!muted) {
      playTone({ freq: 660, type: "sine", duration: 0.1, volume: 0.15 });
    }
  };

  syncMuteButton();

  muteBtn?.addEventListener("click", toggleMute);

  document.addEventListener("keydown", (e) => {
    if (e.key === "w" || e.key === "W") {
      e.preventDefault();
      toggleMute();
    }
  });

  console.info("[game] Cyber Descent — 5 niveles con victoria.");
})();