/* =========================================================
   SCENE.JS — "La Ciudad Sumergida" (Art Déco 3D)
   ========================================================= */

(() => {
  "use strict";

  const canvas = document.getElementById("scene-3d");
  const container = document.getElementById("hero-scene");
  const fallback = document.getElementById("hero-art-fallback");

  if (!canvas || !container) {
    console.warn("[scene] Falta #scene-3d o #hero-scene");
    return;
  }

  if (typeof THREE === "undefined") {
    console.warn("[scene] THREE no cargó. Mostrando fallback 2D.");
    container.style.display = "none";
    if (fallback) fallback.style.display = "block";
    return;
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isSmallScreen = window.matchMedia("(max-width: 700px)").matches;

  const hasWebGL = (() => {
    try {
      const c = document.createElement("canvas");
      return !!(window.WebGLRenderingContext &&
        (c.getContext("webgl2") || c.getContext("webgl")));
    } catch { return false; }
  })();

  if (!hasWebGL) {
    console.warn("[scene] WebGL no disponible.");
    container.style.display = "none";
    if (fallback) fallback.style.display = "block";
    return;
  }

  if (prefersReducedMotion) {
    console.info("[scene] Reduced-motion activo, se omite 3D.");
    container.style.display = "none";
    if (fallback) fallback.style.display = "block";
    return;
  }

  console.info("[scene] Iniciando ciudad Art Déco…");

  /* ---------------------------------------------------------
     Paleta reactiva al tema
     --------------------------------------------------------- */
  const readPalette = () => {
    const styles = getComputedStyle(document.documentElement);
    const parse = (v) => {
      const s = (v || "").trim();
      if (s.startsWith("#")) {
        const hex = s.replace("#", "");
        const bigint = parseInt(hex.length === 3
          ? hex.split("").map(c => c + c).join("")
          : hex, 16);
        return new THREE.Color(bigint);
      }
      const m = s.match(/rgba?\(([^)]+)\)/);
      if (m) {
        const [r, g, b] = m[1].split(",").map(n => parseFloat(n) / 255);
        return new THREE.Color(r, g, b);
      }
      return new THREE.Color(0xd4a84b);
    };
    return {
      gold: parse(styles.getPropertyValue("--gold") || "#d4a84b"),
      goldBright: parse(styles.getPropertyValue("--gold-bright") || "#f4d98a"),
      ember: parse(styles.getPropertyValue("--ember") || "#e08a3c"),
      bg: parse(styles.getPropertyValue("--bg-deep") || "#050810"),
      bgLight: parse(styles.getPropertyValue("--bg") || "#0a1220"),
      water: parse(styles.getPropertyValue("--water") || "#1a2a44")
    };
  };

  let palette = readPalette();

  /* ---------------------------------------------------------
     Renderer / Scene / Camera
     --------------------------------------------------------- */
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !isSmallScreen,
    alpha: true,
    powerPreference: "high-performance"
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isSmallScreen ? 1 : 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(palette.bg.getHex(), 0.018);

  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 200);
  camera.position.set(0, 4.5, 22);
  camera.lookAt(0, 4, 0);

  /* ---------------------------------------------------------
     Iluminación
     --------------------------------------------------------- */
  const hemi = new THREE.HemisphereLight(
    palette.goldBright.getHex(),
    palette.bg.getHex(),
    0.55
  );
  scene.add(hemi);

  const ambient = new THREE.AmbientLight(0xffffff, 0.25);
  scene.add(ambient);

  // Luna / foco cenital
  const moon = new THREE.DirectionalLight(palette.goldBright.getHex(), 0.9);
  moon.position.set(-15, 30, 20);
  scene.add(moon);

  // Contraluz cálida detrás de la ciudad
  const backGlow = new THREE.PointLight(palette.ember.getHex(), 180, 60, 2);
  backGlow.position.set(0, 8, -20);
  scene.add(backGlow);

  // Luz frontal suave
  const frontLight = new THREE.PointLight(palette.goldBright.getHex(), 60, 40, 2);
  frontLight.position.set(6, 12, 18);
  scene.add(frontLight);

  /* ---------------------------------------------------------
     Cielo nocturno con estrellas
     --------------------------------------------------------- */
  const skyGeo = new THREE.SphereGeometry(120, 32, 16);
  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    uniforms: {
      topColor: { value: palette.bg.getHex() === 0x050810 ? new THREE.Color(0x050810) : palette.bg.clone() },
      bottomColor: { value: palette.water.clone() },
      offset: { value: 8 },
      exponent: { value: 0.7 }
    },
    vertexShader: `
      varying vec3 vWorldPosition;
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: `
      uniform vec3 topColor;
      uniform vec3 bottomColor;
      uniform float offset;
      uniform float exponent;
      varying vec3 vWorldPosition;
      void main() {
        float h = normalize(vWorldPosition + vec3(0.0, offset, 0.0)).y;
        gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
      }`
  });
  const sky = new THREE.Mesh(skyGeo, skyMat);
  scene.add(sky);

  // Estrellas
  const starCount = isSmallScreen ? 200 : 500;
  const starPositions = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    const r = 60 + Math.random() * 50;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    starPositions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
    starPositions[i * 3 + 1] = Math.abs(r * Math.cos(phi)) * 0.5 + 8;
    starPositions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
  const starMat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.6,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.85,
    depthWrite: false
  });
  const stars = new THREE.Points(starGeo, starMat);
  scene.add(stars);

  /* ---------------------------------------------------------
     MATERIALES COMPARTIDOS
     --------------------------------------------------------- */
  // Edificio: oscuro con bordes metálicos
  const buildingMatFar = new THREE.MeshStandardMaterial({
    color: palette.bg.clone().multiplyScalar(1.15),
    metalness: 0.5,
    roughness: 0.85,
    emissive: palette.bg.clone().multiplyScalar(0.3),
    emissiveIntensity: 1
  });
  const buildingMatMid = new THREE.MeshStandardMaterial({
    color: palette.bg.clone().multiplyScalar(1.3),
    metalness: 0.6,
    roughness: 0.7,
    emissive: palette.bg.clone().multiplyScalar(0.4),
    emissiveIntensity: 1
  });
  const buildingMatNear = new THREE.MeshStandardMaterial({
    color: palette.bg.clone().multiplyScalar(1.5),
    metalness: 0.7,
    roughness: 0.55,
    emissive: palette.bg.clone().multiplyScalar(0.35),
    emissiveIntensity: 1
  });

  // Corona dorada de los edificios
  const crownMat = new THREE.MeshStandardMaterial({
    color: palette.gold.getHex(),
    metalness: 1,
    roughness: 0.2,
    emissive: palette.gold.getHex(),
    emissiveIntensity: 0.6
  });

  // Ventanas emisivas
  const windowMatGold = new THREE.MeshBasicMaterial({
    color: palette.goldBright.getHex()
  });

  /* ---------------------------------------------------------
     FUNCIÓN: crear un edificio Art Déco
     Genera un rascacielos con base + pisos escalonados + corona
     --------------------------------------------------------- */
  const createBuilding = (width, height, depth, tier, mat) => {
    const building = new THREE.Group();

    // Base principal (volumen del edificio)
    const baseGeo = new THREE.BoxGeometry(width, height, depth);
    const base = new THREE.Mesh(baseGeo, mat);
    base.position.y = height / 2;
    building.add(base);

    // Pisos escalonados (silueta Art Déco)
    const tiers = 2 + Math.floor(Math.random() * 2);
    let currentWidth = width;
    let currentDepth = depth;
    let currentY = height;

    for (let t = 0; t < tiers; t++) {
      currentWidth *= 0.72;
      currentDepth *= 0.72;
      const tierHeight = height * (0.12 + Math.random() * 0.08);
      const tierGeo = new THREE.BoxGeometry(currentWidth, tierHeight, currentDepth);
      const tierMesh = new THREE.Mesh(tierGeo, mat);
      tierMesh.position.y = currentY + tierHeight / 2;
      building.add(tierMesh);
      currentY += tierHeight;
    }

    // Corona final (aguja Art Déco)
    const spireHeight = height * (0.15 + Math.random() * 0.1);
    const spireGeo = new THREE.ConeGeometry(currentWidth * 0.35, spireHeight, 6);
    const spire = new THREE.Mesh(spireGeo, crownMat);
    spire.position.y = currentY + spireHeight / 2;
    building.add(spire);

    // Punta luminosa
    const tipGeo = new THREE.SphereGeometry(0.12, 8, 8);
    const tip = new THREE.Mesh(tipGeo, windowMatGold);
    tip.position.y = currentY + spireHeight + 0.05;
    building.add(tip);

    /* ----- VENTANAS ----- */
    // Distribuidas por la fachada frontal y laterales
    const cols = Math.max(2, Math.floor(width / 0.5));
    const rows = Math.max(3, Math.floor(height / 0.7));
    const windowGeo = new THREE.PlaneGeometry(0.12, 0.2);

    const windowCount = isSmallScreen ? 6 : 12; // máx por edificio
    const placedWindows = [];

    for (let w = 0; w < windowCount; w++) {
      const col = Math.floor(Math.random() * cols);
      const row = Math.floor(Math.random() * rows);

      const x = (col / (cols - 1) - 0.5) * width * 0.85;
      const y = (row / (rows - 1)) * height * 0.85 + height * 0.05;

      // Evitar duplicados
      const key = `${col}-${row}`;
      if (placedWindows.includes(key)) continue;
      placedWindows.push(key);

      // 4 fachadas
      const positions = [
        { pos: [x, y, depth / 2 + 0.01], rotY: 0 },
        { pos: [-x, y, -depth / 2 - 0.01], rotY: Math.PI },
        { pos: [width / 2 + 0.01, y, -x], rotY: Math.PI / 2 },
        { pos: [-width / 2 - 0.01, y, x], rotY: -Math.PI / 2 }
      ];

      positions.forEach((p) => {
        const w = new THREE.Mesh(windowGeo, windowMatGold.clone());
        w.material.color = windowMatGold.color.clone();
        w.material.opacity = 0.7 + Math.random() * 0.3;
        w.material.transparent = true;
        w.position.set(...p.pos);
        w.rotation.y = p.rotY;
        building.add(w);

        // Parpadeo aleatorio (algunas ventanas)
        if (Math.random() < 0.25) {
          w.userData.flicker = true;
          w.userData.flickerPhase = Math.random() * Math.PI * 2;
          flickerWindows.push(w);
        }
      });
    }

    return building;
  };

  const flickerWindows = [];

  /* ---------------------------------------------------------
     GENERAR CIUDAD
     --------------------------------------------------------- */
  const city = new THREE.Group();
  scene.add(city);

  const CITY_DEPTH = 90;         // profundidad total
  const CITY_WIDTH = 50;         // ancho
  const BUILDING_COUNT = isSmallScreen ? 32 : 60;
  const towers = [];

  for (let i = 0; i < BUILDING_COUNT; i++) {
    // Distribuir en 3 capas de profundidad
    const layerRand = Math.random();
    let z, scaleFactor, mat;

    if (layerRand < 0.4) {
      // Lejos
      z = -30 - Math.random() * 30;
      scaleFactor = 0.75;
      mat = buildingMatFar;
    } else if (layerRand < 0.75) {
      // Medio
      z = -10 - Math.random() * 20;
      scaleFactor = 0.95;
      mat = buildingMatMid;
    } else {
      // Cerca
      z = 5 + Math.random() * 15;
      scaleFactor = 1.15;
      mat = buildingMatNear;
    }

    // Posición X aleatoria, evitando el centro exacto (para que se vea a través)
    let x = (Math.random() - 0.5) * CITY_WIDTH;

    // Ancho, alto, profundidad
    const w = (1.2 + Math.random() * 1.6) * scaleFactor;
    const h = (3 + Math.random() * 10) * scaleFactor;
    const d = (1.2 + Math.random() * 1.6) * scaleFactor;

    const building = createBuilding(w, h, d, 0, mat);
    building.position.set(x, 0, z);
    building.rotation.y = (Math.random() - 0.5) * 0.15;

    // Guardar datos para animación
    building.userData = {
      baseZ: z,
      speed: 0.02 + Math.random() * 0.04,
      originalX: x
    };

    city.add(building);
    towers.push(building);
  }

  /* ---------------------------------------------------------
     SUELO REFLECTANTE (agua/niebla)
     --------------------------------------------------------- */
  const groundGeo = new THREE.PlaneGeometry(200, 200);
  const groundMat = new THREE.MeshStandardMaterial({
    color: palette.bg.getHex(),
    metalness: 0.95,
    roughness: 0.15,
    envMapIntensity: 1
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.02;
  scene.add(ground);

  // Brillo en el suelo (simulando agua/luces)
  const groundGlowGeo = new THREE.PlaneGeometry(120, 30);
  const groundGlowMat = new THREE.MeshBasicMaterial({
    color: palette.ember.getHex(),
    transparent: true,
    opacity: 0.15,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const groundGlow = new THREE.Mesh(groundGlowGeo, groundGlowMat);
  groundGlow.rotation.x = -Math.PI / 2;
  groundGlow.position.y = 0.01;
  scene.add(groundGlow);

  /* ---------------------------------------------------------
     NIEBLA BAJA (nubes flotando entre edificios)
     --------------------------------------------------------- */
  const cloudGroup = new THREE.Group();
  const cloudMat = new THREE.MeshBasicMaterial({
    color: palette.gold.getHex(),
    transparent: true,
    opacity: 0.06,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  for (let i = 0; i < 12; i++) {
    const cloudGeo = new THREE.SphereGeometry(
      6 + Math.random() * 8,
      12, 8
    );
    const cloud = new THREE.Mesh(cloudGeo, cloudMat.clone());
    cloud.position.set(
      (Math.random() - 0.5) * 60,
      2 + Math.random() * 5,
      -20 + Math.random() * 40
    );
    cloud.scale.y = 0.25;
    cloud.userData.speed = 0.1 + Math.random() * 0.15;
    cloudGroup.add(cloud);
  }
  scene.add(cloudGroup);

  /* ---------------------------------------------------------
     INTERACCIÓN CON RATÓN
     --------------------------------------------------------- */
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  const onPointerMove = (e) => {
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    pointer.tx = (cx / window.innerWidth) * 2 - 1;
    pointer.ty = -((cy / window.innerHeight) * 2 - 1);
  };
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener("touchmove", onPointerMove, { passive: true });

  /* ---------------------------------------------------------
     RESIZE
     --------------------------------------------------------- */
  const resize = () => {
    const rect = container.getBoundingClientRect();
    const w = Math.max(1, rect.width);
    const h = Math.max(1, rect.height);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.position.z = w < 520 ? 30 : 22;
    camera.position.y = w < 520 ? 6 : 4.5;
    camera.updateProjectionMatrix();
  };
  if (window.ResizeObserver) {
    new ResizeObserver(resize).observe(container);
  } else {
    window.addEventListener("resize", resize);
  }
  resize();

  /* ---------------------------------------------------------
     TEMA REACTIVO
     --------------------------------------------------------- */
  const themeObserver = new MutationObserver(() => {
    palette = readPalette();
    hemi.color.copy(palette.goldBright);
    hemi.groundColor.copy(palette.bg);
    moon.color.copy(palette.goldBright);
    backGlow.color.copy(palette.ember);
    frontLight.color.copy(palette.goldBright);
    buildingMatFar.color.copy(palette.bg.clone().multiplyScalar(1.15));
    buildingMatMid.color.copy(palette.bg.clone().multiplyScalar(1.3));
    buildingMatNear.color.copy(palette.bg.clone().multiplyScalar(1.5));
    crownMat.color.copy(palette.gold);
    crownMat.emissive.copy(palette.gold);
    windowMatGold.color.copy(palette.goldBright);
    flickerWindows.forEach((w) => w.material.color.copy(palette.goldBright));
    groundMat.color.copy(palette.bg);
    groundGlowMat.color.copy(palette.ember);
    cloudMat.color.copy(palette.gold);
    cloudGroup.children.forEach((c) => c.material.color.copy(palette.gold));
    starMat.color.set(palette.goldBright.getHex() === 0xf4d98a ? 0xffffff : palette.goldBright.getHex());
    scene.fog.color.copy(palette.bg);
  });
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme", "data-era"]
  });

  /* ---------------------------------------------------------
     VISIBILIDAD
     --------------------------------------------------------- */
  let isVisible = true;
  if (window.IntersectionObserver) {
    new IntersectionObserver((entries) => {
      entries.forEach((entry) => { isVisible = entry.isIntersecting; });
    }, { threshold: 0 }).observe(container);
  }

  /* ---------------------------------------------------------
     LOOP DE ANIMACIÓN
     --------------------------------------------------------- */
  const clock = new THREE.Clock();
  let frameCount = 0;
  let fpsAccum = 0;
  const fpsLabel = document.getElementById("scene-fps");

  const animate = () => {
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;

    if (!document.hidden && isVisible) {
      // Suavizado del puntero
      pointer.x += (pointer.tx - pointer.x) * 0.05;
      pointer.y += (pointer.ty - pointer.y) * 0.05;

      // Cámara con parallax
      camera.position.x = pointer.x * 3;
      camera.position.y = 4.5 + pointer.y * 1.5;
      camera.lookAt(pointer.x * 1.5, 4 + pointer.y * 1, 0);

      // Edificios: parallax + bucle infinito
      towers.forEach((b) => {
        const d = b.userData;
        // Desplazar hacia la cámara lentamente
        b.position.z += d.speed * dt * 8;

        // Cuando pasan la cámara, vuelven al fondo
        if (b.position.z > 20) {
          b.position.z = -CITY_DEPTH + Math.random() * 20;
          b.position.x = (Math.random() - 0.5) * CITY_WIDTH;
          d.originalX = b.position.x;
        }

        // Ligero movimiento oscilante (respiración)
        b.position.x = d.originalX + Math.sin(t * 0.5 + b.position.z * 0.1) * 0.3;
      });

      // Nubes flotando
      cloudGroup.children.forEach((cloud) => {
        cloud.position.x += cloud.userData.speed * dt;
        if (cloud.position.x > 40) cloud.position.x = -40;
      });

      // Parpadeo de ventanas
      flickerWindows.forEach((w) => {
        const phase = w.userData.flickerPhase || 0;
        const flicker = Math.sin(t * 3 + phase) > 0.7 ? 0.2 : 1;
        w.material.opacity = flicker * 0.9;
      });

      // Estrellas rotan muy lentamente
      stars.rotation.y += dt * 0.005;

      // Renderizar
      renderer.render(scene, camera);

      // FPS
      frameCount++;
      fpsAccum += dt;
      if (fpsAccum >= 0.5) {
        if (fpsLabel) fpsLabel.textContent = Math.round(frameCount / fpsAccum) + " FPS";
        frameCount = 0;
        fpsAccum = 0;
      }
    }

    requestAnimationFrame(animate);
  };

  // Avisar a script.js
  window.setTimeout(() => {
    document.dispatchEvent(new CustomEvent("scene:ready"));
  }, 100);

  animate();

  window.addEventListener("beforeunload", () => {
    renderer.dispose();
  });
})();