/**
 * T&T 3D Studio - PBR Studio 3D Viewer & Real-time Material Configurator
 * Benchmark: Apple / Sketchfab PBR Quality
 * (Sheet 3: ID-11, ID-20, ID-21, ID-37)
 */

(function () {
  'use strict';

  // Preset PBR Palette Tokens (Matte Industrial Standards)
  const PBR_PALETTES = [
    { id: 'obsidian', name: 'Đen Obsidian', hex: '#26282B', color: 0x26282b, roughness: 0.75, metalness: 0.05 },
    { id: 'white', name: 'Trắng Sứ Nordic', hex: '#F5F2EB', color: 0xf5f2eb, roughness: 0.70, metalness: 0.02 },
    { id: 'orange', name: 'Safety Orange', hex: '#FF5C00', color: 0xff5c00, roughness: 0.65, metalness: 0.08 },
    { id: 'terracotta', name: 'Cam Đất Terracotta', hex: '#C85A32', color: 0xc85a32, roughness: 0.82, metalness: 0.02 },
    { id: 'sage', name: 'Xanh Rêu Mộc', hex: '#5B684E', color: 0x5b684e, roughness: 0.78, metalness: 0.03 }
  ];

  let currentPalette = PBR_PALETTES[0];
  let currentModelKey = 'nfc_wifi';
  let isWireframe = false;
  let isAutoRotate = true;

  // Three.js instances
  let scene, camera, renderer, controls;
  let activeMesh, shadowFloor;
  let animFrameId = null;

  // Initialize 3D Viewer in designated container
  function initViewer(canvasId = 'viewer-canvas') {
    if (typeof THREE === 'undefined') return;
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const parent = canvas.parentElement;
    const width = parent.clientWidth || 600;
    const height = parent.clientHeight || 500;

    // 1. Scene
    scene = new THREE.Scene();
    
    // Determine background color based on theme
    const isLight = document.body.classList.contains('light-theme');
    scene.background = new THREE.Color(isLight ? 0xF8F9FA : 0x0B0C0E);

    // 2. Camera
    camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 4.5, 12);

    // 3. Renderer with high PBR fidelity
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    // 4. OrbitControls with Touch-Friendly configuration (ID-37: Does NOT freeze mobile scrolling)
    if (typeof THREE.OrbitControls === 'function') {
      controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.maxPolarAngle = Math.PI / 2 + 0.05; // Không cho camera chìm dưới sàn
      controls.minDistance = 4;
      controls.maxDistance = 25;
      controls.autoRotate = isAutoRotate;
      controls.autoRotateSpeed = 1.2;
      controls.enablePan = false;
      // Tránh chặn touch cuộn trang dọc nếu không kéo ngang
      controls.touches = {
        ONE: THREE.TOUCH.ROTATE,
        TWO: THREE.TOUCH.DOLLY_PAN
      };
    }

    // 5. Realistic Studio 3-Point Lighting (No laser lights, ID-11)
    setupStudioLights();

    // 6. Contact Shadow Floor (Realistic Soft Shadow Plane)
    setupContactShadow();

    // 7. Build Model
    loadModelGeometry(currentModelKey);

    // 8. Animation Loop (Resource-Optimized: pauses render when tab is hidden)
    function animate() {
      animFrameId = requestAnimationFrame(animate);
      const viewEl = document.getElementById('view-studio3d');
      if (viewEl && viewEl.classList.contains('hidden')) {
        return; // Don't waste GPU cycles when studio tab is hidden
      }
      if (controls) controls.update();
      if (renderer && scene && camera) renderer.render(scene, camera);
    }
    animate();

    // Responsive resize
    window.addEventListener('resize', onResize);

    // Render palette switcher bar
    renderPaletteToolbar();
  }

  function setupStudioLights() {
    // Ambient Soft Studio Fill
    const ambLight = new THREE.AmbientLight(0xFFFFFF, 0.9);
    scene.add(ambLight);

    // Key Light (Main soft light from top-right-front)
    const keyLight = new THREE.DirectionalLight(0xFFFFFF, 1.8);
    keyLight.position.set(6, 12, 8);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 30;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    // Fill Light (Soft cool light from left)
    const fillLight = new THREE.DirectionalLight(0xEDEDED, 0.8);
    fillLight.position.set(-8, 5, 4);
    scene.add(fillLight);

    // Subtle Warm Rim Light (Gives definition to edges)
    const rimLight = new THREE.DirectionalLight(0xFF7733, 0.45);
    rimLight.position.set(0, -2, -10);
    scene.add(rimLight);
  }

  function setupContactShadow() {
    // Contact shadow receiver plane
    const planeGeo = new THREE.PlaneGeometry(24, 24);
    const planeMat = new THREE.ShadowMaterial({
      opacity: 0.35
    });
    shadowFloor = new THREE.Mesh(planeGeo, planeMat);
    shadowFloor.rotation.x = -Math.PI / 2;
    shadowFloor.position.y = -2.2;
    shadowFloor.receiveShadow = true;
    scene.add(shadowFloor);

    // Grid guide subtle
    const gridHelper = new THREE.GridHelper(16, 16, 0x333333, 0x1A1D24);
    gridHelper.position.y = -2.201;
    scene.add(gridHelper);
  }

  // Load Parametric Aesthetic 3D Models
  function loadModelGeometry(modelKey) {
    if (activeMesh) {
      scene.remove(activeMesh);
      if (activeMesh.geometry) activeMesh.geometry.dispose();
      if (activeMesh.material) activeMesh.material.dispose();
    }

    let geometry;

    if (modelKey === 'pleated_vase') {
      // 1. Origami Pleated Vase (Parametric Pleats)
      const height = 5.2;
      const radialSegments = 16;
      const heightSegments = 32;
      geometry = new THREE.CylinderGeometry(1.4, 2.1, height, radialSegments, heightSegments, true);
      const pos = geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const y = pos.getY(i);
        const angle = Math.atan2(pos.getZ(i), pos.getX(i));
        const pleatWave = Math.sin(angle * 8 + y * 1.2) * 0.22;
        const radius = Math.sqrt(pos.getX(i)**2 + pos.getZ(i)**2);
        const newRadius = radius + pleatWave;
        pos.setX(i, Math.cos(angle) * newRadius);
        pos.setZ(i, Math.sin(angle) * newRadius);
      }
      geometry.computeVertexNormals();

    } else if (modelKey === 'soft_lamp') {
      // 2. Swirl Soft-Serve Lamp (Lathe Spirals)
      const points = [];
      for (let i = 0; i <= 24; i++) {
        const t = i / 24;
        const r = Math.sin(t * Math.PI) * 1.7 + 0.9 + Math.sin(t * 16) * 0.12;
        points.push(new THREE.Vector2(r, (t - 0.5) * 4.8));
      }
      geometry = new THREE.LatheGeometry(points, 32);

    } else if (modelKey === 'desk_dock') {
      // 3. Desk Dock Organizer (Multi-section dock with beveled slots)
      const group = new THREE.Group();
      
      const baseGeo = new THREE.BoxGeometry(5.2, 0.7, 3.2);
      const baseMesh = new THREE.Mesh(baseGeo, createPBRMaterial());
      baseMesh.castShadow = true;
      baseMesh.receiveShadow = true;
      group.add(baseMesh);

      const standGeo = new THREE.BoxGeometry(2.8, 3.2, 0.4);
      const standMesh = new THREE.Mesh(standGeo, createPBRMaterial());
      standMesh.position.set(-0.8, 1.4, -0.6);
      standMesh.rotation.x = -0.25;
      standMesh.castShadow = true;
      group.add(standMesh);

      const grooveGeo = new THREE.CylinderGeometry(0.2, 0.2, 4.4, 16);
      const grooveMesh = new THREE.Mesh(grooveGeo, createPBRMaterial());
      grooveMesh.rotation.z = Math.PI / 2;
      grooveMesh.position.set(0, 0.4, 1.0);
      group.add(grooveMesh);

      activeMesh = group;
      activeMesh.position.y = -0.5;
      scene.add(activeMesh);
      return;

    } else if (modelKey === 'pegboard') {
      // 4. Hexagonal Pegboard
      geometry = new THREE.CylinderGeometry(3.0, 3.0, 0.35, 6);
      geometry.rotateX(Math.PI / 2);

    } else if (modelKey === 'monogram') {
      // 5. Monogram Custom 3D Typography Stand
      const group = new THREE.Group();
      const baseGeo = new THREE.BoxGeometry(3.6, 0.45, 2.4);
      const baseMesh = new THREE.Mesh(baseGeo, createPBRMaterial());
      baseMesh.castShadow = true;
      baseMesh.receiveShadow = true;
      group.add(baseMesh);

      // Monogram Typographic T-letter facets
      const topBarGeo = new THREE.BoxGeometry(2.6, 0.55, 0.6);
      const topBarMesh = new THREE.Mesh(topBarGeo, createPBRMaterial());
      topBarMesh.position.set(0, 3.0, 0);
      topBarMesh.castShadow = true;
      group.add(topBarMesh);

      const stemGeo = new THREE.BoxGeometry(0.7, 2.4, 0.6);
      const stemMesh = new THREE.Mesh(stemGeo, createPBRMaterial());
      stemMesh.position.set(0, 1.55, 0);
      stemMesh.castShadow = true;
      group.add(stemMesh);

      activeMesh = group;
      activeMesh.position.y = -0.6;
      scene.add(activeMesh);
      return;

    } else {
      // Default: NFC WiFi Stand (TapConnect) with angled stand & NFC chip cavity
      const group = new THREE.Group();

      // Base plate
      const baseGeo = new THREE.BoxGeometry(3.6, 0.5, 2.8);
      const baseMesh = new THREE.Mesh(baseGeo, createPBRMaterial());
      baseMesh.castShadow = true;
      baseMesh.receiveShadow = true;
      group.add(baseMesh);

      // Angled display face with rounded top
      const faceGeo = new THREE.BoxGeometry(3.2, 4.0, 0.35);
      const faceMesh = new THREE.Mesh(faceGeo, createPBRMaterial());
      faceMesh.position.set(0, 1.8, -0.4);
      faceMesh.rotation.x = -0.22;
      faceMesh.castShadow = true;
      group.add(faceMesh);

      // Embedded NFC Touch Target Emblem (Circular medallion)
      const nfcMedallionGeo = new THREE.CylinderGeometry(0.65, 0.65, 0.08, 32);
      nfcMedallionGeo.rotateX(Math.PI / 2);
      const nfcMat = new THREE.MeshStandardMaterial({
        color: 0xFF5C00,
        roughness: 0.5,
        metalness: 0.2
      });
      const nfcMesh = new THREE.Mesh(nfcMedallionGeo, nfcMat);
      nfcMesh.position.set(0, 2.1, -0.21);
      nfcMesh.rotation.x = -0.22;
      group.add(nfcMesh);

      activeMesh = group;
      activeMesh.position.y = -0.8;
      scene.add(activeMesh);
      return;
    }

    const material = createPBRMaterial();
    activeMesh = new THREE.Mesh(geometry, material);
    activeMesh.castShadow = true;
    activeMesh.receiveShadow = true;
    activeMesh.position.y = 0.2;
    scene.add(activeMesh);
  }

  function createPBRMaterial() {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(currentPalette.color),
      roughness: currentPalette.roughness,
      metalness: currentPalette.metalness,
      wireframe: isWireframe,
      side: THREE.DoubleSide
    });
  }

  // Real-time PBR Palette Switcher
  function applyColorToActiveModel(paletteItem) {
    currentPalette = paletteItem;
    if (!activeMesh) return;

    if (activeMesh.isGroup) {
      activeMesh.traverse(child => {
        if (child.isMesh && child.material) {
          // Keep NFC badge orange
          if (child.material.color && child.material.color.getHex() !== 0xff5c00) {
            child.material.color.set(paletteItem.color);
            child.material.roughness = paletteItem.roughness;
            child.material.metalness = paletteItem.metalness;
          }
        }
      });
    } else if (activeMesh.material) {
      activeMesh.material.color.set(paletteItem.color);
      activeMesh.material.roughness = paletteItem.roughness;
      activeMesh.material.metalness = paletteItem.metalness;
    }

    // Update active toolbar pill
    document.querySelectorAll('.viewer-color-pill').forEach(pill => {
      if (pill.dataset.paletteId === paletteItem.id) {
        pill.classList.add('active');
      } else {
        pill.classList.remove('active');
      }
    });

    const label = document.getElementById('viewer-active-color-label');
    if (label) label.textContent = paletteItem.name;

    update3DActionBar();
  }

  function renderPaletteToolbar() {
    const container = document.getElementById('viewer-palette-toolbar');
    if (!container) return;

    container.innerHTML = `
      <div class="flex items-center gap-3">
        <span class="text-xs font-semibold text-secondary-color hidden sm:inline">Màu vỏ:</span>
        <div class="flex items-center gap-2">
          ${PBR_PALETTES.map((p, idx) => `
            <button type="button" 
                    class="viewer-color-pill ${idx === 0 ? 'active' : ''}" 
                    style="background-color: ${p.hex};" 
                    data-palette-id="${p.id}" 
                    title="${p.name}" 
                    onclick="window.set3DViewerColor('${p.id}')"></button>
          `).join('')}
        </div>
        <span id="viewer-active-color-label" class="text-xs font-medium text-primary-color ml-1">
          ${currentPalette.name}
        </span>
      </div>
      
      <div class="h-4 w-[1px] bg-[var(--border-subtle)] mx-1"></div>

      <div class="flex items-center gap-2">
        <button type="button" 
                id="viewer-btn-wireframe" 
                class="btn-ghost !p-1.5 text-xs text-secondary-color hover:text-primary-color" 
                title="Khung dây lưới in" 
                onclick="window.toggle3DWireframe()">
          <i class="fa-solid fa-vector-square"></i>
        </button>
        <button type="button" 
                id="viewer-btn-autorotate" 
                class="btn-ghost !p-1.5 text-xs text-[#FF5C00]" 
                title="Tự động xoay 360°" 
                onclick="window.toggle3DAutoRotate()">
          <i class="fa-solid fa-arrows-rotate"></i>
        </button>
        <button type="button" 
                class="btn-ghost !p-1.5 text-xs text-secondary-color hover:text-primary-color" 
                title="Đặt lại góc nhìn" 
                onclick="window.reset3DCamera()">
          <i class="fa-solid fa-arrows-to-dot"></i>
        </button>
      </div>
    `;
  }

  function onResize() {
    if (!renderer || !camera) return;
    const canvas = renderer.domElement;
    const parent = canvas ? canvas.parentElement : null;
    if (!parent) return;

    const width = parent.clientWidth;
    const height = parent.clientHeight;
    if (width === 0 || height === 0) return;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    if (scene) renderer.render(scene, camera);
  }
  window.onResize3DViewer = onResize;

  // Update Action Bar at the bottom of 3D Viewport
  function update3DActionBar() {
    const products = (typeof window.getStoredProducts === 'function' ? window.getStoredProducts() : []) || [];
    const prod = products.find(p => p.modelKey === currentModelKey) || products[0];

    const titleEl = document.getElementById('viewer-active-model-title');
    const priceEl = document.getElementById('viewer-active-model-price');
    const colorEl = document.getElementById('viewer-active-model-color');

    if (titleEl && prod) titleEl.textContent = prod.title;
    if (priceEl && prod) priceEl.textContent = (prod.price || 109000).toLocaleString('vi-VN') + ' đ';
    if (colorEl && currentPalette) colorEl.textContent = `Màu: ${currentPalette.name}`;
  }
  window.update3DActionBar = update3DActionBar;

  // Add currently inspected 3D model directly to Cart
  window.addActive3DModelToCart = function () {
    const products = (typeof window.getStoredProducts === 'function' ? window.getStoredProducts() : []) || [];
    const prod = products.find(p => p.modelKey === currentModelKey) || products[0];
    if (!prod) return;

    const activeMat = (prod.materials && prod.materials[0]) || { id: 'pla_matte', name: 'Bio-PLA Matte' };
    const cartItem = {
      id: `${prod.id}-${currentPalette.id}-${activeMat.id}`,
      productId: prod.id,
      title: prod.title,
      price: prod.price,
      qty: 1,
      image: prod.image,
      category: prod.category,
      color: {
        id: currentPalette.id,
        name: currentPalette.name,
        hex: currentPalette.hex
      },
      material: activeMat,
      customText: '',
      specs: prod.specs || {}
    };

    if (window.TTStore && typeof window.TTStore.addToCart === 'function') {
      window.TTStore.addToCart(cartItem);
      if (window.TTCart && typeof window.TTCart.openCart === 'function') {
        window.TTCart.openCart();
      }
      if (typeof window.showToast === 'function') {
        window.showToast(`Đã thêm "${prod.title} (${currentPalette.name})" vào giỏ hàng!`);
      }
    }
  };

  // Global APIs
  window.set3DViewerColor = function (paletteId) {
    const item = PBR_PALETTES.find(p => p.id === paletteId);
    if (item) applyColorToActiveModel(item);
  };

  window.switch3DModel = function (modelKey) {
    currentModelKey = modelKey;
    loadModelGeometry(modelKey);
    applyColorToActiveModel(currentPalette);
    update3DActionBar();

    // Update active model tab
    document.querySelectorAll('.model-tab-btn').forEach(btn => {
      if (btn.dataset.modelKey === modelKey) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  };

  window.toggle3DWireframe = function () {
    isWireframe = !isWireframe;
    if (activeMesh) {
      if (activeMesh.isGroup) {
        activeMesh.traverse(child => {
          if (child.isMesh && child.material) child.material.wireframe = isWireframe;
        });
      } else if (activeMesh.material) {
        activeMesh.material.wireframe = isWireframe;
      }
    }
    const btn = document.getElementById('viewer-btn-wireframe');
    if (btn) {
      btn.classList.toggle('text-[#FF5C00]', isWireframe);
      btn.classList.toggle('text-secondary-color', !isWireframe);
    }
  };

  window.toggle3DAutoRotate = function () {
    isAutoRotate = !isAutoRotate;
    if (controls) controls.autoRotate = isAutoRotate;
    const btn = document.getElementById('viewer-btn-autorotate');
    if (btn) {
      btn.classList.toggle('text-[#FF5C00]', isAutoRotate);
      btn.classList.toggle('text-secondary-color', !isAutoRotate);
    }
  };

  window.reset3DCamera = function () {
    if (camera && controls) {
      camera.position.set(0, 4.5, 12);
      controls.target.set(0, 0, 0);
      controls.update();
    }
  };

  // Request custom quote from active 3D Model (Cross-workspace transition R3 / Spec Section 3.1)
  window.requestQuoteFrom3DViewer = function () {
    const products = (typeof window.getStoredProducts === 'function' ? window.getStoredProducts() : []) || [];
    const prod = products.find(p => p.modelKey === currentModelKey) || products[0];
    const modelTitle = prod ? prod.title : 'Mẫu 3D Studio';
    const colorName = currentPalette ? currentPalette.name : 'Tiêu chuẩn';

    if (typeof window.switchWorkspace === 'function') {
      window.switchWorkspace('view-configurator', true, true);
    }

    const notesInput = document.getElementById('config-custom-notes');
    if (notesInput) {
      notesInput.value = `Mẫu tham khảo từ Studio 3D: ${modelTitle} (${colorName})`;
    }

    if (typeof window.showToast === 'function') {
      window.showToast(`Đã chuyển sang Báo Giá In với thông tin: ${modelTitle}`);
    }
  };

  // Launch 3D Viewer directly for a specific product
  window.open3DViewerById = function (prodId) {
    const products = (typeof window.getStoredProducts === 'function' ? window.getStoredProducts() : []) || [];
    const prod = products.find(p => p.id === prodId);
    const targetKey = (prod && prod.modelKey) || 'nfc_wifi';

    // 1. Transition to #view-studio3d dedicated tab
    if (typeof window.switchWorkspace === 'function') {
      window.switchWorkspace('view-studio3d', true, true);
    }

    // Match selected swatch from card if user selected one, else product default
    const chosenColorId = (window.cardSelectedColors && window.cardSelectedColors[prodId]) ||
                          (prod && prod.colors && prod.colors[0] && prod.colors[0].id);
    if (chosenColorId) {
      const match = PBR_PALETTES.find(p => p.id === chosenColorId);
      if (match) currentPalette = match;
    }

    // 2. Load model geometry and update action bar
    window.switch3DModel(targetKey);
    update3DActionBar();

    // 3. Ensure proper canvas sizing and rendering
    onResize();
    requestAnimationFrame(onResize);

    if (typeof window.showToast === 'function') {
      window.showToast(`Đang hiển thị mô hình 3D: ${prod ? prod.title : 'Sản phẩm'}`);
    }
  };

  // Listen to Theme changes
  window.addEventListener('tt_theme_changed', (e) => {
    if (scene) {
      const isLight = e.detail === 'light';
      scene.background = new THREE.Color(isLight ? 0xF8F9FA : 0x0B0C0E);
    }
  });

  // Init on DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    initViewer('viewer-canvas');
    update3DActionBar();
  });

})();
