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

  console.info("[scene] Iniciando escena 3D…");

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

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !isSmallScreen,
    alpha: true,
    powerPreference: "high-performance"
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isSmallScreen ? 1 : 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(palette.bg.getHex(), 0.05);

  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0, 0.6, 6.2);

  const keyLight = new THREE.PointLight(palette.goldBright.getHex(), 55, 14, 2);
  keyLight.position.set(3.2, 3.4, 4);
  scene.add(keyLight);

  const rimLight = new THREE.PointLight(palette.ember.getHex(), 45, 16, 2);
  rimLight.position.set(-4, -1.8, -3.6);
  scene.add(rimLight);

  const fillLight = new THREE.PointLight(palette.water.getHex(), 20, 20, 2);
  fillLight.position.set(0, -3, 3);
  scene.add(fillLight);

  const hemi = new THREE.HemisphereLight(
    palette.goldBright.getHex(),
    palette.bg.getHex(),
    0.4
  );
  scene.add(hemi);

  scene.add(new THREE.AmbientLight(0xffffff, 0.15));

  const core = new THREE.Group();
  scene.add(core);

  const coreGeo = new THREE.IcosahedronGeometry(0.95, 4);
  const coreMat = new THREE.MeshStandardMaterial({
    color: palette.goldBright.getHex(),
    metalness: 1.0,
    roughness: 0.15,
    emissive: palette.gold.getHex(),
    emissiveIntensity: 0.35
  });
  const coreMesh = new THREE.Mesh(coreGeo, coreMat);
  core.add(coreMesh);

  const innerGeo = new THREE.IcosahedronGeometry(0.42, 2);
  const innerMat = new THREE.MeshStandardMaterial({
    color: palette.ember.getHex(),
    emissive: palette.ember.getHex(),
    emissiveIntensity: 2.2,
    roughness: 0.4,
    metalness: 0.2
  });
  const innerMesh = new THREE.Mesh(innerGeo, innerMat);
  core.add(innerMesh);

  const ringMat = new THREE.MeshStandardMaterial({
    color: palette.gold.getHex(),
    metalness: 1,
    roughness: 0.2,
    emissive: palette.gold.getHex(),
    emissiveIntensity: 0.2
  });

  const makeRing = (radius, tube, opacity = 1) => {
    const g = new THREE.TorusGeometry(radius, tube, 16, 160);
    const m = ringMat.clone();
    m.transparent = opacity < 1;
    m.opacity = opacity;
    return new THREE.Mesh(g, m);
  };

  const ring1 = makeRing(1.55, 0.022);
  ring1.rotation.x = Math.PI / 2.4;
  core.add(ring1);

  const ring2 = makeRing(1.95, 0.016, 0.85);
  ring2.rotation.set(Math.PI / 3.2, 0.6, 0.2);
  core.add(ring2);

  const ring3 = makeRing(2.35, 0.012, 0.6);
  ring3.rotation.set(-Math.PI / 3.5, -0.4, -0.3);
  core.add(ring3);

  const segmentMat = new THREE.MeshStandardMaterial({
    color: palette.goldBright.getHex(),
    metalness: 1,
    roughness: 0.12,
    emissive: palette.goldBright.getHex(),
    emissiveIntensity: 0.4
  });
  const segments = new THREE.Group();
  const SEG_COUNT = 24;
  for (let i = 0; i < SEG_COUNT; i++) {
    const angle = (i / SEG_COUNT) * Math.PI * 2;
    const seg = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.02, 0.14),
      segmentMat
    );
    seg.position.set(Math.cos(angle) * 2.75, 0, Math.sin(angle) * 2.75);
    seg.rotation.y = -angle;
    segments.add(seg);
  }
  segments.rotation.x = 0.35;
  core.add(segments);

  const satMat = new THREE.MeshStandardMaterial({
    color: palette.gold.getHex(),
    metalness: 1,
    roughness: 0.25,
    emissive: palette.ember.getHex(),
    emissiveIntensity: 0.3
  });

  const satellites = new THREE.Group();
  const SAT_COUNT = 8;
  const satData = [];
  for (let i = 0; i < SAT_COUNT; i++) {
    const sat = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.09, 0),
      satMat.clone()
    );
    sat.userData = {
      radius: 2.1 + Math.random() * 0.9,
      speed: 0.15 + Math.random() * 0.25,
      offset: Math.random() * Math.PI * 2,
      tilt: (Math.random() - 0.5) * 0.9,
      spin: 0.4 + Math.random() * 1.2
    };
    satData.push(sat);
    satellites.add(sat);
  }
  core.add(satellites);

  const particleCount = isSmallScreen ? 240 : 700;
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    const r = 3 + Math.random() * 6;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.cos(phi) * 0.6;
    positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  const pMat = new THREE.PointsMaterial({
    color: palette.goldBright.getHex(),
    size: 0.035,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });
  const particles = new THREE.Points(pGeo, pMat);
  scene.add(particles);

  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  const onPointerMove = (e) => {
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    pointer.tx = (cx / window.innerWidth) * 2 - 1;
    pointer.ty = -((cy / window.innerHeight) * 2 - 1);
  };
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener("touchmove", onPointerMove, { passive: true });

  const resize = () => {
    const rect = container.getBoundingClientRect();
    const w = Math.max(1, rect.width);
    const h = Math.max(1, rect.height);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.position.z = w < 520 ? 7.4 : 6.2;
    camera.updateProjectionMatrix();
  };
  if (window.ResizeObserver) {
    new ResizeObserver(resize).observe(container);
  } else {
    window.addEventListener("resize", resize);
  }
  resize();

  const themeObserver = new MutationObserver(() => {
    palette = readPalette();
    keyLight.color.copy(palette.goldBright);
    rimLight.color.copy(palette.ember);
    fillLight.color.copy(palette.water);
    coreMat.color.copy(palette.goldBright);
    coreMat.emissive.copy(palette.gold);
    innerMat.color.copy(palette.ember);
    innerMat.emissive.copy(palette.ember);
    ringMat.color.copy(palette.gold);
    ringMat.emissive.copy(palette.gold);
    segmentMat.color.copy(palette.goldBright);
    segmentMat.emissive.copy(palette.goldBright);
    satMat.color.copy(palette.gold);
    satMat.emissive.copy(palette.ember);
    pMat.color.copy(palette.goldBright);
    scene.fog.color.copy(palette.bg);
  });
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme", "data-era"]
  });

  let isVisible = true;
  if (window.IntersectionObserver) {
    new IntersectionObserver((entries) => {
      entries.forEach((entry) => { isVisible = entry.isIntersecting; });
    }, { threshold: 0 }).observe(container);
  }

  const clock = new THREE.Clock();
  let frameCount = 0;
  let fpsAccum = 0;
  const fpsLabel = document.getElementById("scene-fps");

  const animate = () => {
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;

    if (!document.hidden && isVisible) {
      pointer.x += (pointer.tx - pointer.x) * 0.06;
      pointer.y += (pointer.ty - pointer.y) * 0.06;

      core.rotation.y += dt * 0.18;
      core.rotation.x = pointer.y * 0.28;
      core.rotation.z = pointer.x * 0.12;

      const pulse = 1 + Math.sin(t * 1.3) * 0.035;
      coreMesh.scale.setScalar(pulse);
      innerMesh.rotation.x += dt * 0.4;
      innerMesh.rotation.y += dt * 0.55;

      ring1.rotation.z += dt * 0.35;
      ring2.rotation.x += dt * 0.22;
      ring3.rotation.y += dt * 0.14;
      segments.rotation.y += dt * 0.09;

      satData.forEach((sat) => {
        const d = sat.userData;
        const a = t * d.speed + d.offset;
        sat.position.set(
          Math.cos(a) * d.radius,
          Math.sin(a * 0.7 + d.offset) * d.radius * d.tilt,
          Math.sin(a) * d.radius
        );
        sat.rotation.x += dt * d.spin;
        sat.rotation.y += dt * d.spin * 0.7;
      });

      particles.rotation.y += dt * 0.02;
      particles.rotation.x = pointer.y * 0.08;

      camera.position.x += (pointer.x * 0.5 - camera.position.x) * 0.04;
      camera.position.y += (0.6 + pointer.y * 0.35 - camera.position.y) * 0.04;
      camera.lookAt(0, 0, 0);

      keyLight.position.x = 3.2 + pointer.x * 1.2;
      keyLight.position.y = 3.4 + pointer.y * 0.8;

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