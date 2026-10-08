/* =========================================================
   PC-SCENE.JS — Visor 3D del PC (modelo .glb)
   Carga img/custom_gaming_pc.glb y lo hace girar.
   ========================================================= */

(() => {
  "use strict";

  const canvas = document.getElementById("pc-canvas");
  const viewer = document.getElementById("pc-viewer");
  const loader = document.getElementById("pc-loader");
  const fallback = document.getElementById("pc-fallback");

  if (!canvas || !viewer) {
    console.warn("[pc-scene] Falta #pc-canvas o #pc-viewer");
    return;
  }

  console.info("[pc-scene] Iniciando…");

  // ¿Three.js y GLTFLoader están cargados?
  if (typeof THREE === "undefined") {
    console.warn("[pc-scene] THREE no cargó. Mostrando fallback.");
    showFallback();
    return;
  }
  if (typeof THREE.GLTFLoader === "undefined") {
    console.warn("[pc-scene] GLTFLoader no cargó. Mostrando fallback.");
    showFallback();
    return;
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isSmallScreen = window.matchMedia("(max-width: 700px)").matches;

  function showFallback() {
    if (fallback) fallback.hidden = false;
    if (loader) loader.classList.add("is-hidden");
  }

  /* ---------------------------------------------------------
     Paleta reactiva
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
  renderer.toneMappingExposure = 1.3;

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.set(3, 1.5, 4);
  camera.lookAt(0, 0, 0);

  /* ---------------------------------------------------------
     Luces (más potentes)
     --------------------------------------------------------- */
  scene.add(new THREE.AmbientLight(0xffffff, 0.9));

  const hemi = new THREE.HemisphereLight(
    palette.goldBright.getHex(),
    palette.bg.getHex(),
    1.0
  );
  scene.add(hemi);

  const keyLight = new THREE.DirectionalLight(palette.goldBright.getHex(), 2.5);
  keyLight.position.set(5, 8, 6);
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(palette.ember.getHex(), 1.8);
  rimLight.position.set(-6, 4, -5);
  scene.add(rimLight);

  const fillLight = new THREE.DirectionalLight(0xffffff, 0.8);
  fillLight.position.set(0, -4, 3);
  scene.add(fillLight);

  // Luz frontal específica para el PC
  const frontLight = new THREE.DirectionalLight(0xffffff, 1.2);
  frontLight.position.set(0, 2, 8);
  scene.add(frontLight);

  /* ---------------------------------------------------------
     OrbitControls (arrastrar para girar)
     --------------------------------------------------------- */
  let controls = null;
  if (typeof THREE.OrbitControls !== "undefined") {
    controls = new THREE.OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.minDistance = 2.5;
    controls.maxDistance = 12;
    controls.minPolarAngle = Math.PI / 6;
    controls.maxPolarAngle = Math.PI / 1.6;
    controls.autoRotate = !prefersReducedMotion;
    controls.autoRotateSpeed = 0.8;
    console.info("[pc-scene] OrbitControls OK");
  } else {
    console.warn("[pc-scene] OrbitControls no disponible.");
  }

  /* ---------------------------------------------------------
     Modelo
     --------------------------------------------------------- */
  const model = new THREE.Group();
  scene.add(model);

  let isLoaded = false;

  const MODEL_URL = "img/custom_gaming_pc.glb";

  console.info("[pc-scene] Cargando:", MODEL_URL);

  const gltfLoader = new THREE.GLTFLoader();
  gltfLoader.load(
    MODEL_URL,

    // onLoad
    (gltf) => {
      console.info("[pc-scene] Modelo cargado ✅");

      const obj = gltf.scene || gltf.scenes[0];

      // Reforzar materiales para que se vean mejor
      obj.traverse((child) => {
        if (child.isMesh) {
          if (child.material) {
            const materials = Array.isArray(child.material) ? child.material : [child.material];
            materials.forEach((m) => {
              if (m.isMeshStandardMaterial) {
                m.envMapIntensity = 1.2;
                if (m.color) m.color.multiplyScalar(1.3);
              }
            });
          }
        }
      });

      // Autoencuadre: centrar y escalar
      const box = new THREE.Box3().setFromObject(obj);
      const size = new THREE.Vector3();
      const center = new THREE.Vector3();
      box.getSize(size);
      box.getCenter(center);

      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 2.6 / maxDim;
      obj.scale.setScalar(scale);

      // Recentrar al origen
      obj.position.sub(center.multiplyScalar(scale));

      model.add(obj);

      // Rotación inicial en tres cuartos
      model.rotation.y = -Math.PI / 5;

      // Ajustar cámara según el tamaño final
      const finalBox = new THREE.Box3().setFromObject(obj);
      const finalSize = new THREE.Vector3();
      finalBox.getSize(finalSize);
      const finalMax = Math.max(finalSize.x, finalSize.y, finalSize.z);

      camera.position.set(finalMax * 0.9, finalMax * 0.5, finalMax * 1.2);
      camera.lookAt(0, 0, 0);

      if (controls) {
        controls.target.set(0, 0, 0);
        controls.minDistance = finalMax * 0.8;
        controls.maxDistance = finalMax * 3;
        controls.update();
      }

      if (loader) loader.classList.add("is-hidden");
      isLoaded = true;
    },

    // onProgress
    (xhr) => {
      if (xhr.total > 0) {
        const pct = Math.round((xhr.loaded / xhr.total) * 100);
        if (loader) {
          const span = loader.querySelector("span");
          if (span) span.textContent = `Cargando modelo 3D… ${pct}%`;
        }
      }
    },

    // onError
    (err) => {
      console.warn("[pc-scene] Error al cargar el modelo:", err);
      showFallback();
    }
  );

  /* ---------------------------------------------------------
     Resize
     --------------------------------------------------------- */
  const resize = () => {
    const rect = viewer.getBoundingClientRect();
    const w = Math.max(1, rect.width);
    const h = Math.max(1, rect.height);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  if (window.ResizeObserver) {
    new ResizeObserver(resize).observe(viewer);
  } else {
    window.addEventListener("resize", resize);
  }
  resize();

  /* ---------------------------------------------------------
     Visibilidad
     --------------------------------------------------------- */
  let isVisible = true;
  if (window.IntersectionObserver) {
    new IntersectionObserver((entries) => {
      entries.forEach((entry) => { isVisible = entry.isIntersecting; });
    }, { threshold: 0 }).observe(viewer);
  }

  /* ---------------------------------------------------------
     Tema reactivo
     --------------------------------------------------------- */
  const themeObserver = new MutationObserver(() => {
    palette = readPalette();
    hemi.color.copy(palette.goldBright);
    hemi.groundColor.copy(palette.bg);
    keyLight.color.copy(palette.goldBright);
    rimLight.color.copy(palette.ember);
  });
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme", "data-era"]
  });

  /* ---------------------------------------------------------
     Loop
     --------------------------------------------------------- */
  const clock = new THREE.Clock();

  const animate = () => {
    const dt = Math.min(clock.getDelta(), 0.05);

    if (!document.hidden && isVisible && isLoaded) {
      if (controls) controls.update();
      // Oscilación vertical sutil para dar vida
      model.position.y = Math.sin(clock.elapsedTime * 0.8) * 0.05;
    }

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  };

  animate();

  window.addEventListener("beforeunload", () => {
    renderer.dispose();
    if (controls) controls.dispose();
  });

})();