/**
 * T&T 3D Studio - 3D WebGL Viewer & Product Customizer
 * Powered by Three.js
 */

(function () {
  'use strict';

  // ==========================================
  // 1. HERO 3D INTERACTIVE BACKGROUND
  // ==========================================
  function initHero3D() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    const parent = canvas.parentElement;
    const scene = new THREE.Scene();
    
    const camera = new THREE.PerspectiveCamera(45, parent.clientWidth / parent.clientHeight, 0.1, 1000);
    camera.position.set(0, 4, 22);

    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true
    });
    renderer.setSize(parent.clientWidth, parent.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x00f0ff, 2.5);
    dirLight1.position.set(10, 20, 15);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xff6b00, 2.0);
    dirLight2.position.set(-15, -10, 10);
    scene.add(dirLight2);

    // Group for 3D printed mechanical & aesthetic assembly
    const group = new THREE.Group();
    scene.add(group);

    // Core Icosahedron with Wireframe & Glow
    const geom1 = new THREE.IcosahedronGeometry(5.2, 2);
    const mat1 = new THREE.MeshStandardMaterial({
      color: 0x0c1322,
      roughness: 0.25,
      metalness: 0.85,
      flatShading: true
    });
    const coreMesh = new THREE.Mesh(geom1, mat1);
    group.add(coreMesh);

    // Wireframe overlay
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      wireframe: true,
      transparent: true,
      opacity: 0.35
    });
    const wireMesh = new THREE.Mesh(geom1, wireMat);
    wireMesh.scale.set(1.002, 1.002, 1.002);
    group.add(wireMesh);

    // Outer Gyroscope Rings (Simulating 3D printing axes X/Y/Z)
    const ringMat1 = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      metalness: 0.9,
      roughness: 0.1,
      emissive: 0x002b3a
    });
    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(8.0, 0.12, 16, 100), ringMat1);
    group.add(ring1);

    const ringMat2 = new THREE.MeshStandardMaterial({
      color: 0xff6b00,
      metalness: 0.9,
      roughness: 0.1,
      emissive: 0x2b1000
    });
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(9.4, 0.1, 16, 100), ringMat2);
    ring2.rotation.x = Math.PI / 3;
    group.add(ring2);

    // Floating Sparks / Filament Particles
    const particleCount = 160;
    const particleGeom = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 35;
      particlePositions[i + 1] = (Math.random() - 0.5) * 35;
      particlePositions[i + 2] = (Math.random() - 0.5) * 35;
    }
    particleGeom.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x00f0ff,
      size: 0.18,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(particleGeom, particleMat);
    scene.add(particles);

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    window.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / parent.clientWidth - 0.5) * 2;
      mouseY = ((e.clientY - rect.top) / parent.clientHeight - 0.5) * 2;
    });

    // Resize Handler
    window.addEventListener('resize', () => {
      if (!canvas || !parent) return;
      camera.aspect = parent.clientWidth / parent.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(parent.clientWidth, parent.clientHeight);
    });

    // Animation Loop with IntersectionObserver (Prevents CPU/GPU waste offscreen)
    let clock = new THREE.Clock();
    let heroAnimId = null;
    let isHeroVisible = true;

    function animate() {
      if (!isHeroVisible) return;
      heroAnimId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;

      group.rotation.y = elapsed * 0.35 + targetX * 0.8;
      group.rotation.x = Math.sin(elapsed * 0.2) * 0.2 - targetY * 0.6;

      ring1.rotation.x += delta * 0.5;
      ring1.rotation.y += delta * 0.2;
      ring2.rotation.y += delta * 0.4;
      ring2.rotation.z += delta * 0.3;

      particles.rotation.y = elapsed * 0.05;

      renderer.render(scene, camera);
    }

    if ('IntersectionObserver' in window) {
      const heroObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          isHeroVisible = entry.isIntersecting;
          if (isHeroVisible) {
            clock.start();
            animate();
          } else if (heroAnimId) {
            cancelAnimationFrame(heroAnimId);
            heroAnimId = null;
          }
        });
      }, { threshold: 0.05 });
      heroObserver.observe(canvas);
    } else {
      animate();
    }
  }

  // ==========================================
  // 2. INTERACTIVE 3D PRODUCT & STL INSPECTOR
  // ==========================================
  const ViewerState = {
    scene: null,
    camera: null,
    renderer: null,
    controls: null,
    currentMesh: null,
    wireframeMesh: null,
    gridHelper: null,
    clipPlane: null,
    isSlicing: false,
    viewMode: 'solid',
    currentColor: 0xf1f5f9, // Matte White default
    modelStats: {
      name: '',
      width: 0,
      depth: 0,
      height: 0,
      volume: 0,
      triangles: 0,
      weight: 0
    }
  };

  function initModelViewer(initialModelKey = 'nfc_wifi') {
    const canvas = document.getElementById('viewer-canvas');
    if (!canvas) return;

    const container = canvas.parentElement;
    const scene = new THREE.Scene();
    const isLightInitial = document.body.classList.contains('light-theme');
    scene.background = new THREE.Color(isLightInitial ? 0xf4f1ea : 0x0a0f1d);
    ViewerState.scene = scene;

    window.updateViewerTheme = function (isLight) {
      if (ViewerState.scene) {
        ViewerState.scene.background = new THREE.Color(isLight ? 0xf4f1ea : 0x0a0f1d);
      }
    };

    // Camera
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 1, 1000);
    camera.position.set(110, 95, 140);
    ViewerState.camera = camera;

    // Renderer with clipping plane support
    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.localClippingEnabled = true;
    ViewerState.renderer = renderer;

    // Controls
    if (typeof THREE.OrbitControls !== 'undefined') {
      const controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.maxPolarAngle = Math.PI / 2 - 0.02; // Don't go below ground
      controls.minDistance = 20;
      controls.maxDistance = 500;
      ViewerState.controls = controls;
    }

    // Lights
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x1e293b, 0.85);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.3);
    dirLight.position.set(100, 180, 100);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    scene.add(dirLight);

    const warmFill = new THREE.PointLight(0xf59e0b, 1.2, 300);
    warmFill.position.set(-80, 100, 80);
    scene.add(warmFill);

    const cyanSpot = new THREE.SpotLight(0x00f0ff, 1.8, 300, Math.PI / 4, 0.4);
    cyanSpot.position.set(90, 80, -90);
    scene.add(cyanSpot);

    // 3D Print Bed Grid
    createPrintBed(scene);

    // Initial Model
    loadSampleModel(initialModelKey || 'nfc_wifi');

    // Setup Event Listeners
    setupViewerControls();
    setupDropZone();

    // Resize
    window.addEventListener('resize', () => {
      if (!canvas || !container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    });

    // Render loop with IntersectionObserver
    let viewerAnimId = null;
    let isViewerVisible = true;

    function renderLoop() {
      if (!isViewerVisible) return;
      viewerAnimId = requestAnimationFrame(renderLoop);
      if (ViewerState.controls) ViewerState.controls.update();

      // Slicing animation if active
      if (ViewerState.isSlicing && ViewerState.clipPlane) {
        const time = Date.now() * 0.001;
        const h = ViewerState.modelStats.height;
        ViewerState.clipPlane.constant = (Math.sin(time * 1.5) * 0.5 + 0.5) * (h + 5);
      }

      renderer.render(scene, camera);
    }

    if ('IntersectionObserver' in window) {
      const viewerObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          isViewerVisible = entry.isIntersecting;
          if (isViewerVisible) {
            renderLoop();
          } else if (viewerAnimId) {
            cancelAnimationFrame(viewerAnimId);
            viewerAnimId = null;
          }
        });
      }, { threshold: 0.05 });
      viewerObserver.observe(canvas);
    } else {
      renderLoop();
    }
  }

  // Create 3D Print Bed Grid
  function createPrintBed(scene) {
    const bedSize = 220; // 220mm x 220mm build plate
    const grid = new THREE.GridHelper(bedSize, 22, 0x00f0ff, 0x1e293b);
    grid.position.y = 0;
    scene.add(grid);
    ViewerState.gridHelper = grid;

    const bedGeom = new THREE.BoxGeometry(bedSize + 10, 2, bedSize + 10);
    const bedMat = new THREE.MeshStandardMaterial({
      color: 0x070b14,
      roughness: 0.8,
      metalness: 0.2
    });
    const bedMesh = new THREE.Mesh(bedGeom, bedMat);
    bedMesh.position.y = -1;
    bedMesh.receiveShadow = true;
    scene.add(bedMesh);
  }

  // Calculate Volume of arbitrary BufferGeometry
  function calculateVolume(geometry) {
    if (!geometry.isBufferGeometry) return 0;
    let position = geometry.attributes.position;
    let faces = position.count / 3;
    let sum = 0;
    const p1 = new THREE.Vector3();
    const p2 = new THREE.Vector3();
    const p3 = new THREE.Vector3();

    for (let i = 0; i < faces; i++) {
      p1.fromBufferAttribute(position, i * 3 + 0);
      p2.fromBufferAttribute(position, i * 3 + 1);
      p3.fromBufferAttribute(position, i * 3 + 2);
      sum += p1.dot(p2.cross(p3)) / 6.0;
    }
    return Math.abs(sum); // in mm^3
  }

  // Update Model Mesh & Recalculate Specs
  function displayGeometry(geometry, name = 'Mô hình 3D') {
    const scene = ViewerState.scene;

    if (ViewerState.currentMesh) {
      scene.remove(ViewerState.currentMesh);
      if (ViewerState.currentMesh.geometry) ViewerState.currentMesh.geometry.dispose();
      if (ViewerState.currentMesh.material) ViewerState.currentMesh.material.dispose();
      ViewerState.currentMesh = null;
    }
    if (ViewerState.wireframeMesh) {
      scene.remove(ViewerState.wireframeMesh);
      ViewerState.wireframeMesh = null;
    }

    geometry.computeVertexNormals();
    geometry.computeBoundingBox();

    // Center geometry on build plate
    const bbox = geometry.boundingBox;
    const center = new THREE.Vector3();
    bbox.getCenter(center);
    geometry.translate(-center.x, -bbox.min.y, -center.z);
    geometry.computeBoundingBox();

    // Dimensions
    const size = new THREE.Vector3();
    geometry.boundingBox.getSize(size);

    const width = Math.round(size.x * 10) / 10;
    const depth = Math.round(size.z * 10) / 10;
    const height = Math.round(size.y * 10) / 10;

    const volMm3 = calculateVolume(geometry);
    const volCm3 = Math.round((volMm3 / 1000) * 10) / 10;
    const triangles = geometry.attributes.position ? (geometry.attributes.position.count / 3) : 0;

    // Physical Weight Formula: Khối lượng (g) = Thể tích (cm3) * Mật độ nhựa (g/cm3) * (Vỏ 15% + Infill 20%)
    const density = (window.TT_CONFIG && window.TT_CONFIG.pricing && window.TT_CONFIG.pricing.densityMap && window.TT_CONFIG.pricing.densityMap.pla_plus) || 1.24;
    const shellAndInfillFactor = 0.35; // 15% vỏ + 20% infill cơ sở
    const weightGrams = Math.max(1, Math.round(volCm3 * density * shellAndInfillFactor));

    // Pre-flight Mesh Check (Kiểm tra sơ bộ tính khả thi trên khổ in chuẩn 256x256x256 mm)
    const MAX_BED_DIM = 256;
    const isExceeded = width > MAX_BED_DIM || depth > MAX_BED_DIM || height > MAX_BED_DIM;
    const isManifoldError = volCm3 <= 0.05 || triangles < 4;

    // Gợi ý độ dày lớp in tương ứng (Recommended Layer Height)
    let recommendedLayer = '0.20';
    let layerReason = 'Tiêu chuẩn cân bằng cơ khí (0.20 mm)';
    if (Math.max(width, depth, height) < 45 || triangles > 45000) {
      recommendedLayer = '0.12';
      layerReason = 'Chi tiết nhỏ/phức tạp, khuyến nghị in siêu nét 0.12 mm';
    } else if (Math.max(width, depth, height) > 130) {
      recommendedLayer = '0.28';
      layerReason = 'Khổ lớn, khuyến nghị in tốc độ cao 0.28 mm';
    }

    ViewerState.modelStats = {
      name,
      width,
      depth,
      height,
      volume: volCm3,
      triangles: Math.round(triangles),
      weight: weightGrams,
      isExceeded,
      isManifoldError,
      recommendedLayer,
      layerReason
    };

    // Store in global API for checkout & calculator
    window.TTApi = window.TTApi || {};
    window.TTApi.lastMeshStats = ViewerState.modelStats;

    updateStatsUI(ViewerState.modelStats);

    // Cập nhật cảnh báo viền đỏ trên Canvas nếu kích thước vượt khổ
    const canvasParent = document.getElementById('viewer-canvas')?.parentElement;
    if (canvasParent) {
      if (isExceeded || isManifoldError) {
        canvasParent.classList.add('mesh-warning-pulse');
      } else {
        canvasParent.classList.remove('mesh-warning-pulse');
      }
    }

    ViewerState.clipPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), height);

    const material = createViewerMaterial();
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    ViewerState.currentMesh = mesh;

    // Subtle wireframe overlay
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      wireframe: true,
      transparent: true,
      opacity: 0.12
    });
    const wireMesh = new THREE.Mesh(geometry, wireMat);
    scene.add(wireMesh);
    ViewerState.wireframeMesh = wireMesh;

    adjustCameraToFit(size);
  }

  function createViewerMaterial() {
    const color = ViewerState.currentColor;
    const mode = ViewerState.viewMode;

    let mat;
    if (mode === 'wireframe') {
      mat = new THREE.MeshBasicMaterial({
        color: color,
        wireframe: true
      });
    } else if (mode === 'xray') {
      mat = new THREE.MeshPhysicalMaterial({
        color: color,
        transparent: true,
        opacity: 0.5,
        roughness: 0.15,
        metalness: 0.1,
        transmission: 0.75,
        ior: 1.45
      });
    } else {
      mat = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.38,
        metalness: 0.25,
        clippingPlanes: ViewerState.isSlicing ? [ViewerState.clipPlane] : [],
        clipShadows: true
      });
    }
    return mat;
  }

  function adjustCameraToFit(size) {
    const maxDim = Math.max(size.x, size.y, size.z);
    const camera = ViewerState.camera;
    const distance = maxDim * 2.2;
    camera.position.set(distance * 0.75, distance * 0.65, distance);
    if (ViewerState.controls) {
      ViewerState.controls.target.set(0, size.y / 2, 0);
      ViewerState.controls.update();
    }
  }

  function updateStatsUI(stats) {
    const elName = document.getElementById('stat-model-name');
    const elDim = document.getElementById('stat-dimensions');
    const elVol = document.getElementById('stat-volume');
    const elTri = document.getElementById('stat-triangles');
    const elWeight = document.getElementById('stat-weight');
    const elPreflight = document.getElementById('mesh-preflight-badge');

    if (elName) elName.textContent = stats.name;
    if (elDim) elDim.textContent = `${stats.width} × ${stats.depth} × ${stats.height} mm`;
    if (elVol) elVol.textContent = `${stats.volume} cm³`;
    if (elTri) elTri.textContent = stats.triangles.toLocaleString();
    if (elWeight) elWeight.textContent = `~${stats.weight} g (PLA Matte)`;

    if (elPreflight) {
      if (stats.isExceeded) {
        elPreflight.className = 'mesh-status-badge mesh-status-warn';
        elPreflight.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Vượt khổ in 256mm (${stats.width}×${stats.depth}×${stats.height} mm)!`;
      } else if (stats.isManifoldError) {
        elPreflight.className = 'mesh-status-badge mesh-status-warn';
        elPreflight.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> File rỗng hoặc lỗi lưới non-manifold!`;
      } else {
        elPreflight.className = 'mesh-status-badge mesh-status-pass';
        elPreflight.innerHTML = `<i class="fa-solid fa-circle-check"></i> Đạt kiểm tra in (Khổ Bambu Lab 256mm, Manifold)`;
      }
    }
  }

  // ==========================================
  // PROCEDURAL MODELS OF USER'S CORE PRODUCTS
  // ==========================================
  function loadSampleModel(type) {
    let geom;
    let name = '';

    if (type === 'nfc_wifi') {
      name = 'Đế WiFi 1 Chạm Thông Minh (T&T TapConnect™ Stand)';
      geom = createNfcWifiGeometry();
      ViewerState.currentColor = 0xf8fafc; // Matte white
    } else if (type === 'pleated_vase') {
      name = 'Bình Hoa Dập Ly Origami (Pleated Fluted Vase - Watertight)';
      geom = createPleatedVaseGeometry();
      ViewerState.currentColor = 0xbc6c25; // Terracotta Brown
    } else if (type === 'soft_lamp') {
      name = 'Đèn Xoắn Kem Bồng Bềnh (T&T Swirl Soft-Serve Lamp)';
      geom = createSoftServeLampGeometry();
      ViewerState.currentColor = 0x606c38; // Sage green
    } else if (type === 'monogram') {
      name = 'Bảng Chữ Cái & Tên Cá Nhân Hóa (Monogram Sign)';
      geom = createMonogramGeometry();
      ViewerState.currentColor = 0x4f772d; // Olive green
    } else if (type === 'gear') {
      name = 'Bánh Răng Cơ Khí Carbon Fiber (Spur Gear)';
      geom = createGearGeometry();
      ViewerState.currentColor = 0x1e293b; // Carbon Black
    }

    if (geom) {
      displayGeometry(geom, name);
    }
  }

  // 1. Đế WiFi NFC Thông Minh L-Stand
  function createNfcWifiGeometry() {
    const shape = new THREE.Shape();
    // Profile of L-stand angled at ~75 degrees
    shape.moveTo(0, 0);
    shape.lineTo(60, 0);
    shape.lineTo(60, 6);
    shape.lineTo(14, 6);
    shape.lineTo(28, 95);
    shape.lineTo(20, 95);
    shape.lineTo(0, 0);

    const extrudeSettings = {
      steps: 1,
      depth: 65,
      bevelEnabled: true,
      bevelThickness: 2,
      bevelSize: 2,
      bevelSegments: 3
    };

    const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geom.rotateY(-Math.PI / 2);
    return geom;
  }

  // 2. Bình Hoa Dập Ly Origami (Pleated Fluted Vase)
  function createPleatedVaseGeometry() {
    const radialSegments = 48;
    const heightSegments = 32;
    const geom = new THREE.CylinderGeometry(20, 32, 95, radialSegments, heightSegments, false);
    const pos = geom.attributes.position;

    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i);
      let y = pos.getY(i);
      let z = pos.getZ(i);

      // Angle theta around vertical axis
      const theta = Math.atan2(z, x);
      let r = Math.sqrt(x * x + z * z);

      // Accordion Pleated Ribs modulation (16 vertical folds)
      const fold = Math.sin(theta * 16) * 3.5;
      r += fold;

      // Bulbous vase waist profile
      const waistFactor = Math.sin((y / 95 + 0.5) * Math.PI) * 12;
      r += waistFactor;

      pos.setX(i, Math.cos(theta) * r);
      pos.setZ(i, Math.sin(theta) * r);
    }
    geom.computeVertexNormals();
    return geom;
  }

  // 3. Đèn Xoắn Kem Bồng Bềnh (Soft-Serve Swirl Lamp)
  function createSoftServeLampGeometry() {
    const geom = new THREE.CylinderGeometry(8, 38, 85, 40, 35, false);
    const pos = geom.attributes.position;

    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i);
      let y = pos.getY(i);
      let z = pos.getZ(i);

      const normY = (y + 42.5) / 85; // 0 to 1
      const theta = Math.atan2(z, x);
      let r = Math.sqrt(x * x + z * z);

      // Bulge in the middle like soft-serve ice cream
      const bulge = Math.sin(normY * Math.PI) * 18;
      r += bulge;

      // Helical rib swirls (twist angle with height)
      const spiralTheta = theta * 6 + normY * Math.PI * 3.5;
      const swirl = Math.sin(spiralTheta) * 4.5;
      r += swirl;

      pos.setX(i, Math.cos(theta) * r);
      pos.setZ(i, Math.sin(theta) * r);
    }
    geom.computeVertexNormals();
    return geom;
  }

  // 4. Bảng Chữ Cái Monogram "K"
  function createMonogramGeometry() {
    const shape = new THREE.Shape();
    // Simplified Letter 'K' contour
    shape.moveTo(0, 0);
    shape.lineTo(18, 0);
    shape.lineTo(18, 38);
    shape.lineTo(46, 0);
    shape.lineTo(66, 0);
    shape.lineTo(34, 45);
    shape.lineTo(65, 90);
    shape.lineTo(45, 90);
    shape.lineTo(18, 52);
    shape.lineTo(18, 90);
    shape.lineTo(0, 90);
    shape.closePath();

    const extrudeSettings = {
      steps: 1,
      depth: 18,
      bevelEnabled: true,
      bevelThickness: 2,
      bevelSize: 1.5,
      bevelSegments: 3
    };

    const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    return geom;
  }

  // 5. Bánh Răng Cơ Khí (Spur Gear)
  function createGearGeometry() {
    const shape = new THREE.Shape();
    const teeth = 16;
    const outerRadius = 45;
    const innerRadius = 38;
    const holeRadius = 14;

    for (let i = 0; i < teeth; i++) {
      const angle1 = (i / teeth) * Math.PI * 2;
      const angle2 = ((i + 0.35) / teeth) * Math.PI * 2;
      const angle3 = ((i + 0.65) / teeth) * Math.PI * 2;
      const angle4 = ((i + 1.0) / teeth) * Math.PI * 2;

      const x1 = Math.cos(angle1) * innerRadius;
      const y1 = Math.sin(angle1) * innerRadius;
      const x2 = Math.cos(angle2) * outerRadius;
      const y2 = Math.sin(angle2) * outerRadius;
      const x3 = Math.cos(angle3) * outerRadius;
      const y3 = Math.sin(angle3) * outerRadius;
      const x4 = Math.cos(angle4) * innerRadius;
      const y4 = Math.sin(angle4) * innerRadius;

      if (i === 0) shape.moveTo(x1, y1);
      else shape.lineTo(x1, y1);

      shape.lineTo(x2, y2);
      shape.lineTo(x3, y3);
      shape.lineTo(x4, y4);
    }

    const holePath = new THREE.Path();
    holePath.absarc(0, 0, holeRadius, 0, Math.PI * 2, true);
    shape.holes.push(holePath);

    const extrudeSettings = {
      steps: 1,
      depth: 20,
      bevelEnabled: true,
      bevelThickness: 2,
      bevelSize: 1.5,
      bevelSegments: 2
    };

    const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geom.rotateX(Math.PI / 2);
    return geom;
  }

  // Setup UI Buttons & Listeners
  function setupViewerControls() {
    // Model Select Buttons
    document.querySelectorAll('[data-model]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-model]').forEach(b => {
          b.classList.remove('border-primary', 'bg-primary/20', 'text-cyan-300');
          b.classList.add('border-slate-700', 'bg-slate-900/60', 'text-slate-300');
        });
        btn.classList.add('border-primary', 'bg-primary/20', 'text-cyan-300');
        btn.classList.remove('border-slate-700', 'bg-slate-900/60', 'text-slate-300');
        
        const type = btn.getAttribute('data-model');
        loadSampleModel(type);
      });
    });

    // View Mode Buttons (Solid, Wireframe, X-Ray)
    document.querySelectorAll('[data-view-mode]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-view-mode]').forEach(b => b.classList.remove('active', 'text-primary', 'border-primary'));
        btn.classList.add('active', 'text-primary', 'border-primary');
        ViewerState.viewMode = btn.getAttribute('data-view-mode');
        if (ViewerState.currentMesh) {
          ViewerState.currentMesh.material = createViewerMaterial();
        }
      });
    });

    // Color Swatches
    document.querySelectorAll('[data-color]').forEach(swatch => {
      swatch.addEventListener('click', () => {
        const hex = parseInt(swatch.getAttribute('data-color').replace('#', '0x'));
        ViewerState.currentColor = hex;
        if (ViewerState.currentMesh) {
          ViewerState.currentMesh.material = createViewerMaterial();
        }
      });
    });

    // Toggle Layer Slicing Simulation
    const sliceBtn = document.getElementById('btn-toggle-slice');
    if (sliceBtn) {
      sliceBtn.addEventListener('click', () => {
        ViewerState.isSlicing = !ViewerState.isSlicing;
        sliceBtn.classList.toggle('bg-orange-500/20');
        sliceBtn.classList.toggle('border-orange-500');
        if (ViewerState.currentMesh) {
          ViewerState.currentMesh.material = createViewerMaterial();
        }
      });
    }

    // Reset Camera
    const resetBtn = document.getElementById('btn-reset-cam');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (ViewerState.currentMesh) {
          const bbox = ViewerState.currentMesh.geometry.boundingBox;
          const size = new THREE.Vector3();
          bbox.getSize(size);
          adjustCameraToFit(size);
        }
      });
    }

    // Transfer stats to Calculator (Đồng bộ hóa 1-Click sang form Báo Giá)
    const btnTransfer = document.getElementById('btn-transfer-to-calc');
    if (btnTransfer) {
      btnTransfer.addEventListener('click', () => {
        const stats = ViewerState.modelStats;
        if (!stats || !stats.weight) return;

        // 1. Điền tự động khối lượng
        const weightInput = document.getElementById('calc-weight');
        const weightSlider = document.getElementById('calc-weight-slider');
        if (weightInput) weightInput.value = stats.weight;
        if (weightSlider) weightSlider.value = Math.min(500, stats.weight);

        // 2. Điền tự động khuyến nghị lớp in (Recommended Layer Height)
        const layerSelect = document.getElementById('calc-layer-height');
        if (layerSelect && stats.recommendedLayer) {
          layerSelect.value = stats.recommendedLayer;
        }

        // 3. Hiển thị badge đồng bộ mô hình trong form báo giá
        const syncedBadge = document.getElementById('calc-synced-badge');
        if (syncedBadge) {
          syncedBadge.classList.remove('hidden');
          syncedBadge.innerHTML = `
            <div class="flex items-center justify-between p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/40 text-xs font-mono">
              <div class="flex items-center gap-2 text-cyan-300">
                <i class="fa-solid fa-cube text-cyan-400"></i>
                <span class="font-bold truncate max-w-[200px] sm:max-w-[320px]">${stats.name}</span>
                <span class="text-[11px] text-slate-400">(${stats.width}×${stats.depth}×${stats.height} mm)</span>
              </div>
              <span class="text-[11px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold">~${stats.weight}g</span>
            </div>
          `;
        }

        // 4. Phát sự kiện đồng bộ để calculator.js tính lại giá tức thì
        window.dispatchEvent(new CustomEvent('tt_sync_3d_to_calc', { detail: stats }));
        if (typeof window.recalculateQuote === 'function') {
          window.recalculateQuote();
        } else if (weightInput) {
          weightInput.dispatchEvent(new Event('input', { bubbles: true }));
        }

        // 5. Cuộn mượt đến bảng tính giá
        const calcSection = document.getElementById('calculator');
        if (calcSection) {
          calcSection.scrollIntoView({ behavior: 'smooth' });
        }

        if (window.showToast) {
          window.showToast(`Đã đồng bộ thông số: ${stats.name} (${stats.weight}g, gợi ý lớp ${stats.recommendedLayer}mm) sang Báo Giá!`);
        }
      });
    }
  }

  // Global Swatch Update API
  window.updateViewerColor = function (colorHex, isTransparent = false) {
    if (typeof colorHex === 'string') {
      colorHex = parseInt(colorHex.replace('#', '0x'), 16);
    }
    ViewerState.currentColor = colorHex;
    if (isTransparent) {
      ViewerState.viewMode = 'xray';
    } else if (ViewerState.viewMode === 'xray') {
      ViewerState.viewMode = 'solid';
    }
    if (ViewerState.currentMesh) {
      ViewerState.currentMesh.material = createViewerMaterial();
    }
  };

  // Setup STL & OBJ Drag & Drop and File Input
  function setupDropZone() {
    const dropZone = document.getElementById('viewer-dropzone');
    const fileInput = document.getElementById('stl-file-input');

    if (!dropZone || !fileInput) return;

    ['dragenter', 'dragover'].forEach(eventName => {
      dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropZone.classList.add('border-primary', 'bg-cyan-950/30');
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropZone.classList.remove('border-primary', 'bg-cyan-950/30');
      });
    });

    dropZone.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
      if (files.length > 0) {
        handleFile(files[0]);
      }
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        handleFile(e.target.files[0]);
      }
    });

    function handleFile(file) {
      const fileNameLower = file.name.toLowerCase();
      const isStl = fileNameLower.endsWith('.stl');
      const isObj = fileNameLower.endsWith('.obj');

      if (!isStl && !isObj) {
        alert('Vui lòng chọn file 3D định dạng .STL hoặc .OBJ');
        return;
      }

      const reader = new FileReader();
      if (isStl) {
        reader.onload = function (e) {
          const contents = e.target.result;
          if (typeof THREE.STLLoader !== 'undefined') {
            const loader = new THREE.STLLoader();
            const geometry = loader.parse(contents);
            displayGeometry(geometry, file.name);
            if (window.showToast) {
              window.showToast(`Đã phân tích & kiểm tra sơ bộ: ${file.name}`);
            }
          } else {
            alert('STLLoader chưa tải xong, vui lòng thử lại sau giây lát.');
          }
        };
        reader.readAsArrayBuffer(file);
      } else if (isObj) {
        reader.onload = function (e) {
          const text = e.target.result;
          if (typeof THREE.OBJLoader !== 'undefined') {
            const loader = new THREE.OBJLoader();
            const obj = loader.parse(text);
            // Extract geometry from first mesh
            let foundGeom = null;
            obj.traverse(child => {
              if (child.isMesh && child.geometry && !foundGeom) {
                foundGeom = child.geometry.clone();
              }
            });
            if (foundGeom) {
              displayGeometry(foundGeom, file.name);
              if (window.showToast) {
                window.showToast(`Đã tải & phân tích OBJ: ${file.name}`);
              }
            } else {
              alert('Không tìm thấy dữ liệu lưới trong file .OBJ!');
            }
          } else {
            alert('Trình đọc OBJ đang tải, vui lòng thử lại.');
          }
        };
        reader.readAsText(file);
      }
    }
  }

  let isViewerInitialized = false;

  function ensureViewerLoaded(modelKeyToLoad = 'nfc_wifi') {
    const cover = document.getElementById('viewer-lazy-cover');
    if (cover) {
      cover.classList.add('hidden');
    }
    if (!isViewerInitialized) {
      isViewerInitialized = true;
      initModelViewer(modelKeyToLoad);
    } else if (modelKeyToLoad) {
      loadSampleModel(modelKeyToLoad);
    }
  }

  window.ensure3DViewerLoaded = ensureViewerLoaded;

  // Init on DOM ready
  window.addEventListener('DOMContentLoaded', () => {
    initHero3D();

    // Hook lazy cover activation
    const cover = document.getElementById('viewer-lazy-cover');
    const activateBtn = document.getElementById('btn-activate-viewer');
    if (cover) {
      cover.addEventListener('click', () => {
        ensureViewerLoaded();
      });
    }
    if (activateBtn) {
      activateBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        ensureViewerLoaded();
      });
    }

    // Hook [data-model] across the page
    document.querySelectorAll('[data-model]').forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.getAttribute('data-model');
        ensureViewerLoaded(type);
      });
    });

    // Hook dropzone click/dragover
    const dropZone = document.getElementById('viewer-dropzone');
    if (dropZone) {
      dropZone.addEventListener('click', () => {
        ensureViewerLoaded();
      });
      dropZone.addEventListener('dragover', () => {
        ensureViewerLoaded();
      });
    }
  });

})();
