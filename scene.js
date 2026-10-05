/* =========================================================
   SCENE.JS — Rascacielos Art Déco
   Un solo rascacielos monumental con detalle
   ========================================================= */

(() => {
  "use strict";

  const canvas = document.getElementById("scene-3d");
  const container = document.getElementById("hero-scene");
  const fallback = document.getElementById("hero-art-fallback");

  if (!canvas || !container) return;

  if (typeof THREE === "undefined") {
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

  if (!hasWebGL || prefersReducedMotion) {
    container.style.display = "none";
    if (fallback) fallback.style.display = "block";
    return;
  }

  console.info("[scene] Iniciando Rascacielos Art Déco…");

  /* ---------------------------------------------------------
     PALETA
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
      water: parse(styles.getPropertyValue("--water") || "#1a2a44")
    };
  };

  let palette = readPalette();

  /* ---------------------------------------------------------
     RENDERER / SCENE / CAMERA
     --------------------------------------------------------- */
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !isSmallScreen,
    alpha: true,
    powerPreference: "high-performance"
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isSmallScreen ? 1 : 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(palette.bg.getHex(), 0.04);

  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  // Vista ligeramente desde abajo para dar grandeza
  camera.position.set(0, -0.5, 8);
  camera.lookAt(0, 1.5, 0);

  /* ---------------------------------------------------------
     ILUMINACIÓN
     --------------------------------------------------------- */
  scene.add(new THREE.AmbientLight(0xffffff, 0.18));

  const hemi = new THREE.HemisphereLight(
    palette.goldBright.getHex(),
    palette.bg.getHex(),
    0.35
  );
  scene.add(hemi);

  // Key light frontal-derecha (ilumina las caras frontales y derechas)
  const keyLight = new THREE.DirectionalLight(palette.goldBright.getHex(), 1.6);
  keyLight.position.set(6, 8, 10);
  scene.add(keyLight);

  // Rim light trasera (silueta contra el fondo)
  const rimLight = new THREE.DirectionalLight(palette.ember.getHex(), 1.2);
  rimLight.position.set(-4, 4, -10);
  scene.add(rimLight);

  // Fill light tenue desde abajo (luces de la calle)
  const fillLight = new THREE.DirectionalLight(palette.ember.getHex(), 0.35);
  fillLight.position.set(0, -6, 4);
  scene.add(fillLight);

  /* ---------------------------------------------------------
     SKYBOX DE FONDO CON HALO DORADO
     --------------------------------------------------------- */
  const skyGeo = new THREE.SphereGeometry(60, 32, 16);
  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {
      topColor:    { value: palette.bg.clone().multiplyScalar(0.4) },
      midColor:    { value: palette.bg.clone().multiplyScalar(1.1) },
      glowColor:   { value: palette.ember.clone() },
      bottomColor: { value: palette.bg.clone().multiplyScalar(0.5) }
    },
    vertexShader: `
      varying vec3 vWorldPosition;
      void main() {
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorldPosition = wp.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: `
      uniform vec3 topColor;
      uniform vec3 midColor;
      uniform vec3 glowColor;
      uniform vec3 bottomColor;
      varying vec3 vWorldPosition;
      void main() {
        vec3 dir = normalize(vWorldPosition);
        float h = dir.y;
        vec3 col = mix(midColor, topColor, smoothstep(0.0, 0.7, h));
        if (h < 0.0) col = mix(midColor, bottomColor, smoothstep(0.0, -0.4, h));
        float glow = smoothstep(0.5, 0.0, abs(h)) * 0.6;
        col += glowColor * glow * 0.35;
        gl_FragColor = vec4(col, 1.0);
      }`
  });
  const sky = new THREE.Mesh(skyGeo, skyMat);
  scene.add(sky);

  // Estrellas
  const starCount = isSmallScreen ? 100 : 250;
  const starPositions = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    const r = 40 + Math.random() * 15;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    starPositions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
    starPositions[i * 3 + 1] = Math.abs(r * Math.cos(phi)) * 0.6 + 5;
    starPositions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
  const starMat = new THREE.PointsMaterial({
    color: palette.goldBright.getHex(),
    size: 0.15,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.7,
    depthWrite: false
  });
  const stars = new THREE.Points(starGeo, starMat);
  scene.add(stars);

  /* ---------------------------------------------------------
     MATERIALES
     --------------------------------------------------------- */
  // Cuerpo del edificio: piedra oscura con tinte azul profundo
  const stoneMat = new THREE.MeshStandardMaterial({
    color: 0x1a1e2e,
    metalness: 0.25,
    roughness: 0.75,
    emissive: 0x05070d,
    emissiveIntensity: 0.25
  });

  // Variante más clara (para la base, que recibe más luz)
  const stoneLightMat = new THREE.MeshStandardMaterial({
    color: 0x252a3d,
    metalness: 0.3,
    roughness: 0.7,
    emissive: 0x05070d,
    emissiveIntensity: 0.3
  });

  // Detalles dorados (remates, cornisas)
  const goldMat = new THREE.MeshStandardMaterial({
    color: palette.gold.getHex(),
    metalness: 1,
    roughness: 0.18,
    emissive: palette.gold.getHex(),
    emissiveIntensity: 0.55
  });

  // Puntas luminosas
  const glowMat = new THREE.MeshBasicMaterial({
    color: palette.goldBright.getHex(),
    toneMapped: false
  });

  // Ventanas encendidas (doradas, emisivas)
  const windowLitMat = new THREE.MeshBasicMaterial({
    color: palette.goldBright.getHex(),
    toneMapped: false
  });

  // Ventanas apagadas (oscuras)
  const windowDarkMat = new THREE.MeshStandardMaterial({
    color: 0x0a0d18,
    metalness: 0.5,
    roughness: 0.5
  });

  /* ---------------------------------------------------------
     GRUPO PRINCIPAL: el rascacielos
     --------------------------------------------------------- */
  const building = new THREE.Group();
  scene.add(building);

  // Referencias para animar luces
  const litWindows = [];

  /* ---------------------------------------------------------
     FUNCIÓN: crear una fila de ventanas en una cara
     --------------------------------------------------------- */
  const addWindowGrid = (
    width, height, depth, centerY,
    cols, rows,
    group,
    litProbability = 0.3
  ) => {
    const maxPerLevel = isSmallScreen ? 60 : 150;

    // Geometrías compartidas (todas las ventanas iguales)
    const winW = width * 0.055;
    const winH = height / rows * 0.55;
    const winGeo = new THREE.PlaneGeometry(winW, winH);

    const totalRequested = cols * rows * 4;
    const skipFactor = Math.max(1, Math.ceil(totalRequested / maxPerLevel));

    let count = 0;
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        count++;
        if (count % skipFactor !== 0) continue;

        const x = ((c + 0.5) / cols - 0.5) * width * 0.88;
        const y = centerY + ((r + 0.5) / rows - 0.5) * height * 0.82;

        // 4 caras
        const faces = [
          { px:  x,                pz:  depth / 2 + 0.005, ry: 0 },
          { px: -x,                pz: -depth / 2 - 0.005, ry: Math.PI },
          { px:  width / 2 + 0.005, pz: -x,               ry: Math.PI / 2 },
          { px: -width / 2 - 0.005, pz:  x,               ry: -Math.PI / 2 }
        ];

        faces.forEach((f) => {
          const isLit = Math.random() < litProbability;
          const mat = isLit ? windowLitMat : windowDarkMat;
          const win = new THREE.Mesh(winGeo, mat);
          win.position.set(f.px, y, f.pz);
          win.rotation.y = f.ry;
          group.add(win);
          if (isLit) {
            win.userData.flickerPhase = Math.random() * Math.PI * 2;
            litWindows.push(win);
          }
        });
      }
    }
  };

  /* ---------------------------------------------------------
     CONSTRUCCIÓN DEL RASCACIELOS
     --------------------------------------------------------- */

  // Dimensiones maestras
  const BASE_W = 1.6;
  const BASE_H = 0.8;

  // ----- NIVEL 0: plataforma de entrada -----
  const podiumGeo = new THREE.BoxGeometry(2.2, 0.35, 2.2);
  const podium = new THREE.Mesh(podiumGeo, stoneLightMat);
  podium.position.y = 0.175;
  building.add(podium);

  // Cornisa dorada de la plataforma
  const podiumTrimGeo = new THREE.BoxGeometry(2.24, 0.04, 2.24);
  const podiumTrim = new THREE.Mesh(podiumTrimGeo, goldMat);
  podiumTrim.position.y = 0.35;
  building.add(podiumTrim);

  // Ventanas del podio
  addWindowGrid(2.2, 0.3, 2.2, 0.175, 5, 1, building, 0.4);

  // ----- NIVEL 1: base principal -----
  const base1Geo = new THREE.BoxGeometry(BASE_W, BASE_H, BASE_W);
  const base1 = new THREE.Mesh(base1Geo, stoneLightMat);
  base1.position.y = 0.35 + BASE_H / 2;
  building.add(base1);

  // Ventanas de la base principal
  addWindowGrid(BASE_W, BASE_H, BASE_W, 0.35 + BASE_H / 2, 6, 5, building, 0.35);

  // Cornisa superior de la base
  const base1TrimGeo = new THREE.BoxGeometry(BASE_W + 0.08, 0.06, BASE_W + 0.08);
  const base1Trim = new THREE.Mesh(base1TrimGeo, goldMat);
  base1Trim.position.y = 0.35 + BASE_H;
  building.add(base1Trim);

  // ----- NIVEL 2: primer escalón -----
  const L2_W = BASE_W * 0.82;
  const L2_H = 1.4;
  const L2_Y0 = 0.35 + BASE_H;

  const level2Geo = new THREE.BoxGeometry(L2_W, L2_H, L2_W);
  const level2 = new THREE.Mesh(level2Geo, stoneMat);
  level2.position.y = L2_Y0 + L2_H / 2;
  building.add(level2);

  addWindowGrid(L2_W, L2_H, L2_W, L2_Y0 + L2_H / 2, 5, 7, building, 0.3);

  // Cornisa
  const l2TrimGeo = new THREE.BoxGeometry(L2_W + 0.06, 0.05, L2_W + 0.06);
  const l2Trim = new THREE.Mesh(l2TrimGeo, goldMat);
  l2Trim.position.y = L2_Y0 + L2_H;
  building.add(l2Trim);

  // ----- NIVEL 3: segundo escalón -----
  const L3_W = L2_W * 0.78;
  const L3_H = 1.1;
  const L3_Y0 = L2_Y0 + L2_H;

  const level3Geo = new THREE.BoxGeometry(L3_W, L3_H, L3_W);
  const level3 = new THREE.Mesh(level3Geo, stoneMat);
  level3.position.y = L3_Y0 + L3_H / 2;
  building.add(level3);

  addWindowGrid(L3_W, L3_H, L3_W, L3_Y0 + L3_H / 2, 4, 6, building, 0.3);

  const l3TrimGeo = new THREE.BoxGeometry(L3_W + 0.05, 0.045, L3_W + 0.05);
  const l3Trim = new THREE.Mesh(l3TrimGeo, goldMat);
  l3Trim.position.y = L3_Y0 + L3_H;
  building.add(l3Trim);

  // ----- NIVEL 4: tercer escalón (más estrecho) -----
  const L4_W = L3_W * 0.72;
  const L4_H = 0.8;
  const L4_Y0 = L3_Y0 + L3_H;

  const level4Geo = new THREE.BoxGeometry(L4_W, L4_H, L4_W);
  const level4 = new THREE.Mesh(level4Geo, stoneMat);
  level4.position.y = L4_Y0 + L4_H / 2;
  building.add(level4);

  addWindowGrid(L4_W, L4_H, L4_W, L4_Y0 + L4_H / 2, 3, 4, building, 0.35);

  const l4TrimGeo = new THREE.BoxGeometry(L4_W + 0.05, 0.04, L4_W + 0.05);
  const l4Trim = new THREE.Mesh(l4TrimGeo, goldMat);
  l4Trim.position.y = L4_Y0 + L4_H;
  building.add(l4Trim);

  // ----- NIVEL 5: remate piramidal escalonado (tipo Chrysler) -----
  const L5_Y0 = L4_Y0 + L4_H;

  // Tres "arcos" o anillos escalonados en la parte superior
  const crownLayers = [
    { w: L4_W * 0.85, h: 0.22 },
    { w: L4_W * 0.65, h: 0.22 },
    { w: L4_W * 0.45, h: 0.22 }
  ];
  let crownY = L5_Y0;
  crownLayers.forEach((layer) => {
    const crownGeo = new THREE.CylinderGeometry(
      layer.w * 0.5, layer.w * 0.55,
      layer.h, 8
    );
    const crownMesh = new THREE.Mesh(crownGeo, goldMat);
    crownMesh.position.y = crownY + layer.h / 2;
    building.add(crownMesh);
    crownY += layer.h;
  });

  // ----- AGUJA FINAL -----
  const spireH = 1.4;
  const spireGeo = new THREE.ConeGeometry(L4_W * 0.18, spireH, 8);
  const spire = new THREE.Mesh(spireGeo, goldMat);
  spire.position.y = crownY + spireH / 2;
  building.add(spire);

  // Punta luminosa
  const tipGeo = new THREE.SphereGeometry(0.05, 8, 8);
  const tip = new THREE.Mesh(tipGeo, glowMat);
  tip.position.y = crownY + spireH + 0.03;
  building.add(tip);

  // Pequeña esfera luminosa en la base de la aguja
  const beaconGeo = new THREE.SphereGeometry(0.08, 12, 12);
  const beaconMat = new THREE.MeshBasicMaterial({
    color: palette.goldBright.getHex(),
    toneMapped: false
  });
  const beacon = new THREE.Mesh(beaconGeo, beaconMat);
  beacon.position.y = crownY - 0.05;
  building.add(beacon);

  /* ---------------------------------------------------------
     BASE DEL EDIFICIO: suelo bajo él
     --------------------------------------------------------- */
  const plinthGeo = new THREE.CylinderGeometry(2.6, 2.8, 0.15, 32);
  const plinthMat = new THREE.MeshStandardMaterial({
    color: 0x0a0d18,
    metalness: 0.6,
    roughness: 0.4
  });
  const plinth = new THREE.Mesh(plinthGeo, plinthMat);
  plinth.position.y = 0;
  building.add(plinth);

  /* ---------------------------------------------------------
     CÁMARA Y POSICIÓN
     --------------------------------------------------------- */
  // El edificio mide aproximadamente 6 unidades de alto.
  // Centramos la cámara para que quepa entero.
  const buildingHeight = 0.35 + BASE_H + 1.4 + 1.1 + 0.8 + 0.66 + spireH;

  camera.position.set(0, buildingHeight * 0.45, 8);
  camera.lookAt(0, buildingHeight * 0.42, 0);

  // Rotamos ligeramente el edificio para verlo de tres cuartos
  building.rotation.y = Math.PI / 6;

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
    // Ajustamos la distancia de cámara según proporción
    const baseDistance = w < 520 ? 9.5 : 8;
    camera.position.z = baseDistance;
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
    keyLight.color.copy(palette.goldBright);
    rimLight.color.copy(palette.ember);
    fillLight.color.copy(palette.ember);
    goldMat.color.copy(palette.gold);
    goldMat.emissive.copy(palette.gold);
    glowMat.color.copy(palette.goldBright);
    windowLitMat.color.copy(palette.goldBright);
    beaconMat.color.copy(palette.goldBright);
    starMat.color.copy(palette.goldBright);
    skyMat.uniforms.topColor.value.copy(palette.bg.clone().multiplyScalar(0.4));
    skyMat.uniforms.midColor.value.copy(palette.bg.clone().multiplyScalar(1.1));
    skyMat.uniforms.glowColor.value.copy(palette.ember);
    skyMat.uniforms.bottomColor.value.copy(palette.bg.clone().multiplyScalar(0.5));
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
     LOOP
     --------------------------------------------------------- */
  const clock = new THREE.Clock();
  let frameCount = 0;
  let fpsAccum = 0;
  const fpsLabel = document.getElementById("scene-fps");

  const animate = () => {
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;

    if (!document.hidden && isVisible) {
      pointer.x += (pointer.tx - pointer.x) * 0.05;
      pointer.y += (pointer.ty - pointer.y) * 0.05;

      // Rotación lenta y continua del edificio
      building.rotation.y += dt * 0.12;

      // Inclinación muy sutil siguiendo el ratón
      building.rotation.x = pointer.y * 0.03;

      // La esfera luminosa de la aguja pulsa
      const pulse = 0.9 + Math.sin(t * 2.2) * 0.15;
      beacon.scale.setScalar(pulse);
      tip.scale.setScalar(0.9 + Math.sin(t * 2.2) * 0.2);

      // Parpadeo aleatorio de ventanas encendidas
      litWindows.forEach((win) => {
        const phase = win.userData.flickerPhase || 0;
        const flicker = Math.sin(t * 1.5 + phase) > 0.85 ? 0.3 : 1;
        win.material = flicker > 0.5 ? windowLitMat : windowDarkMat;
      });

      // Cámara con parallax muy suave
      camera.position.x = pointer.x * 0.8;
      camera.position.y = buildingHeight * 0.45 + pointer.y * 0.4;
      camera.lookAt(0, buildingHeight * 0.42 + pointer.y * 0.15, 0);

      stars.rotation.y += dt * 0.004;

      renderer.render(scene, camera);

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

  window.setTimeout(() => {
    document.dispatchEvent(new CustomEvent("scene:ready"));
  }, 100);

  animate();

  window.addEventListener("beforeunload", () => {
    renderer.dispose();
  });
})();