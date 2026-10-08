'use client';

import React, { useEffect, useRef, useState } from 'react';
import { X, RotateCcw, Eye, Box, Sparkles, HelpCircle, ZoomIn } from 'lucide-react';
import { Product, ColorVariant } from '../../types';
import { useStore } from '../../context/StoreContext';

interface Viewer3DModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const Viewer3DModal: React.FC<Viewer3DModalProps> = ({ product, isOpen, onClose }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [activeColor, setActiveColor] = useState<ColorVariant | null>(null);
  const [isWireframe, setIsWireframe] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Three.js instances ref
  const threeRef = useRef<{
    renderer?: any;
    scene?: any;
    camera?: any;
    controls?: any;
    mesh?: any;
    animationId?: number;
    initialCameraPos?: { x: number; y: number; z: number };
  }>({});

  useEffect(() => {
    if (product && product.colors.length > 0) {
      setActiveColor(product.colors[0]);
    }
  }, [product]);

  // Lazy-load Three.js ONLY when modal opens
  useEffect(() => {
    if (!isOpen || !product || !mountRef.current) return;

    let isSubscribed = true;
    setIsLoading(true);

    const initThree = async () => {
      // Dynamic import of Three.js and OrbitControls
      const THREE = await import('three');
      const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js');

      if (!isSubscribed || !mountRef.current) return;

      const container = mountRef.current;
      const width = container.clientWidth;
      const height = container.clientHeight;

      // 1. Scene
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0xf7f5f0); // Warm Nordic off-white canvas

      // 2. Camera
      const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
      camera.position.set(0, 5, 12);
      threeRef.current.initialCameraPos = { x: 0, y: 5, z: 12 };

      // 3. Renderer
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      container.innerHTML = '';
      container.appendChild(renderer.domElement);

      // 4. OrbitControls
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.maxPolarAngle = Math.PI / 2 + 0.1; // Don't flip under floor
      controls.minDistance = 4;
      controls.maxDistance = 24;
      controls.autoRotate = true;
      controls.autoRotateSpeed = 1.2;

      // 5. Lighting (Warm Scandinavian ambient setup)
      const ambientLight = new THREE.AmbientLight(0xfff6ea, 1.4);
      scene.add(ambientLight);

      const dirLight = new THREE.DirectionalLight(0xffffff, 1.8);
      dirLight.position.set(8, 14, 8);
      dirLight.castShadow = true;
      dirLight.shadow.mapSize.width = 1024;
      dirLight.shadow.mapSize.height = 1024;
      scene.add(dirLight);

      const rimLight = new THREE.DirectionalLight(0xc85a32, 0.6); // Terracotta rim reflection
      rimLight.position.set(-8, -4, -6);
      scene.add(rimLight);

      // 6. Ground Shadow Plane
      const planeGeo = new THREE.PlaneGeometry(30, 30);
      const planeMat = new THREE.ShadowMaterial({ opacity: 0.14 });
      const plane = new THREE.Mesh(planeGeo, planeMat);
      plane.rotation.x = -Math.PI / 2;
      plane.position.y = -2.5;
      plane.receiveShadow = true;
      scene.add(plane);

      // 7. Create Procedural Model based on Product modelKey
      let geometry: any;
      const initialHex = activeColor ? activeColor.hex : (product.colors[0]?.hex || '#c85a32');

      const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(initialHex),
        roughness: 0.35, // Matte silk texture
        metalness: 0.05,
        wireframe: isWireframe,
      });

      if (product.modelKey === 'pleated_vase') {
        // Origami Pleated Vase Geometry
        geometry = new THREE.CylinderGeometry(1.6, 2.2, 5.5, 12, 16, true);
        const pos = geometry.attributes.position;
        for (let i = 0; i < pos.count; i++) {
          const y = pos.getY(i);
          const angle = Math.atan2(pos.getZ(i), pos.getX(i));
          const wave = Math.sin(angle * 6 + y * 1.5) * 0.25;
          const currentRadius = Math.sqrt(pos.getX(i) ** 2 + pos.getZ(i) ** 2);
          const newRadius = currentRadius + wave;
          pos.setX(i, Math.cos(angle) * newRadius);
          pos.setZ(i, Math.sin(angle) * newRadius);
        }
        geometry.computeVertexNormals();
      } else if (product.modelKey === 'soft_lamp') {
        // Swirl Soft Serve Lamp Lathe Geometry
        const points = [];
        for (let i = 0; i < 20; i++) {
          const t = i / 20;
          const r = Math.sin(t * Math.PI) * 1.8 + 0.8 + Math.cos(t * 12) * 0.15;
          points.push(new THREE.Vector2(r, (t - 0.5) * 5));
        }
        geometry = new THREE.LatheGeometry(points, 24);
      } else {
        // NFC WiFi Stand / Desk Dock Geometry
        geometry = new THREE.BoxGeometry(4.2, 5.2, 1.8);
      }

      const mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.position.y = 0.2;
      scene.add(mesh);

      // Store in ref
      threeRef.current = {
        renderer,
        scene,
        camera,
        controls,
        mesh,
        initialCameraPos: { x: 0, y: 5, z: 12 },
      };

      // Animation Loop
      const animate = () => {
        threeRef.current.animationId = requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
      };

      animate();
      setIsLoading(false);

      // Handle Resize
      const handleResize = () => {
        if (!container) return;
        const w = container.clientWidth;
        const h = container.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
      };
    };

    initThree();

    return () => {
      isSubscribed = false;
      if (threeRef.current.animationId) {
        cancelAnimationFrame(threeRef.current.animationId);
      }
      if (threeRef.current.controls) {
        threeRef.current.controls.dispose();
      }
      if (threeRef.current.renderer) {
        threeRef.current.renderer.dispose();
      }
      if (threeRef.current.scene) {
        threeRef.current.scene.clear();
      }
    };
  }, [isOpen, product]);

  // Live Color Switch in 3D Mesh
  const handleColorChange = async (color: ColorVariant) => {
    setActiveColor(color);
    if (threeRef.current.mesh) {
      const THREE = await import('three');
      threeRef.current.mesh.material.color = new THREE.Color(color.hex);
    }
  };

  // Wireframe toggle
  const toggleWireframe = () => {
    const nextState = !isWireframe;
    setIsWireframe(nextState);
    if (threeRef.current.mesh) {
      threeRef.current.mesh.material.wireframe = nextState;
    }
  };

  // Reset Camera View
  const handleResetCamera = () => {
    if (threeRef.current.camera && threeRef.current.controls && threeRef.current.initialCameraPos) {
      threeRef.current.camera.position.set(
        threeRef.current.initialCameraPos.x,
        threeRef.current.initialCameraPos.y,
        threeRef.current.initialCameraPos.z
      );
      threeRef.current.controls.target.set(0, 0, 0);
      threeRef.current.controls.update();
    }
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-charcoal-900/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl border border-cream-300 shadow-warm-xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-cream-300 flex items-center justify-between bg-cream-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-tech-100 text-tech-600 flex items-center justify-center border border-tech-200">
              <Box className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-charcoal-900 truncate max-w-xs sm:max-w-md">
                Kiểm tra 3D: {product.title}
              </h3>
              <p className="text-xs text-charcoal-500">
                Kéo chuột để xoay 360° • Cuộn để phóng to / thu nhỏ
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-charcoal-400 hover:text-charcoal-800 hover:bg-cream-200 transition-colors"
            aria-label="Đóng bảng xem 3D"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3D WebGL Canvas Viewport */}
        <div className="relative flex-1 min-h-[380px] sm:min-h-[460px] bg-cream-100 overflow-hidden">
          
          {isLoading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-cream-100/90 backdrop-blur-xs">
              <div className="w-9 h-9 border-3 border-terracotta-500 border-t-transparent rounded-full animate-spin mb-3" />
              <span className="text-xs font-semibold text-charcoal-700">
                Đang khởi tạo mô hình 3D WebGL...
              </span>
            </div>
          )}

          {/* Mount Div */}
          <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

          {/* Overlay Viewport Controls */}
          <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
            <button
              type="button"
              onClick={handleResetCamera}
              className="p-2.5 rounded-xl bg-white/90 hover:bg-white text-charcoal-800 backdrop-blur-sm border border-cream-300 shadow-warm-sm hover:scale-105 transition-all text-xs font-medium flex items-center gap-1.5"
              title="Đặt lại góc nhìn ban đầu"
            >
              <RotateCcw className="w-4 h-4 text-terracotta-500" />
              <span className="hidden sm:inline">Đặt lại góc nhìn</span>
            </button>

            <button
              type="button"
              onClick={toggleWireframe}
              className={`p-2.5 rounded-xl backdrop-blur-sm border transition-all text-xs font-medium flex items-center gap-1.5 ${
                isWireframe
                  ? 'bg-charcoal-900 text-white border-charcoal-900'
                  : 'bg-white/90 hover:bg-white text-charcoal-800 border-cream-300 shadow-warm-sm'
              }`}
              title="Xem cấu trúc lưới in 3D"
            >
              <Eye className="w-4 h-4 text-tech-500" />
              <span className="hidden sm:inline">Lưới Mesh</span>
            </button>
          </div>

          {/* Quality Spec Watermark */}
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-cream-300 text-[11px] text-charcoal-600 font-mono flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-tech-500 animate-pulse" />
            <span>Độ mịn lớp in: {product.specifications.layerResolution}</span>
          </div>

        </div>

        {/* Bottom Material & Color Switcher Tray */}
        <div className="p-4 sm:p-5 bg-white border-t border-cream-300 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Color Switcher */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-charcoal-800 shrink-0">
              Màu xem thử:
            </span>
            <div className="flex items-center gap-2">
              {product.colors.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleColorChange(c)}
                  className={`w-7 h-7 rounded-full border-2 transition-all flex items-center justify-center ${
                    activeColor?.id === c.id
                      ? 'border-terracotta-500 scale-110 shadow-warm-sm'
                      : 'border-cream-400 hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              ))}
            </div>
            {activeColor && (
              <span className="text-xs text-charcoal-600 font-medium ml-1">
                {activeColor.name}
              </span>
            )}
          </div>

          {/* Action Trigger */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-charcoal-900 hover:bg-charcoal-800 text-white text-xs sm:text-sm font-semibold transition-colors"
            >
              Hoàn tất kiểm tra
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
