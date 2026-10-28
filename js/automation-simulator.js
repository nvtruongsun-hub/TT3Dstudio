/**
 * T&T 3D Labs - Layercraft Engine 2.5D Automation Simulator
 * Architecture: Codex Master Controller (Directive TT3D-ARCH-20261023)
 * Implemented by: Antigravity Lead Executor
 *
 * Simulates high-precision FDM 3D printing in real-time on Canvas 2D + DOM Telemetry HUD.
 * Features:
 * - Layer-by-layer parametric deposition with toolhead XY gantry & Z elevation
 * - Realtime filament color switching, play/pause, seek scrubber, 2.5D isometric projection
 * - Strict lifecycle guardrails: IntersectionObserver auto-pause, tab visibility throttle,
 *   devicePixelRatio capping <= 2.0, zero memory leak on destroy.
 */

(function (window, document) {
  'use strict';

  const DEFAULT_OPTIONS = {
    totalLayers: 120,
    cycleDurationMs: 12000,
    defaultColor: '#64E8F5',
    defaultTheme: 'dark',
    autoPlay: true
  };

  const COLOR_PALETTES = [
    { id: 'cyan', name: 'PLA Silk Cyan', hex: '#64E8F5', accent: '#00F0FF' },
    { id: 'orange', name: 'PLA Craft Orange', hex: '#FF5C00', accent: '#FF8A00' },
    { id: 'amber', name: 'PLA Silk Gold', hex: '#F59E0B', accent: '#FBBF24' },
    { id: 'pearl', name: 'PLA Pearl White', hex: '#E2E8F0', accent: '#FFFFFF' },
    { id: 'emerald', name: 'PLA Neo Emerald', hex: '#10B981', accent: '#34D399' }
  ];

  class LayercraftSimulator {
    constructor(container, options = {}) {
      this.container = typeof container === 'string' ? document.querySelector(container) : container;
      if (!this.container) {
        throw new Error('[LayercraftSimulator] Invalid container element');
      }

      this.opts = Object.assign({}, DEFAULT_OPTIONS, options);
      this.currentProgress = 0; // 0.0 to 1.0
      this.isPlaying = this.opts.autoPlay;
      this.activeColor = this.opts.defaultColor;
      this.activeTheme = this.opts.defaultTheme;
      this.rafId = null;
      this.lastTimestamp = 0;
      this.isDestroyed = false;
      this.isVisible = true;

      // Check prefers-reduced-motion
      this.reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (this.reducedMotion) {
        this.isPlaying = false;
        this.currentProgress = 1.0;
      }

      this._buildGeometry();
      this._initDOM();
      this._bindEvents();
      this._setupObservers();

      if (this.isPlaying) {
        this.play();
      } else {
        this.render();
      }
    }

    _initDOM() {
      this.container.innerHTML = `
        <div class="layercraft-viewport precision-grid-bg relative w-full h-full min-h-[380px] lg:min-h-[460px] rounded-3xl overflow-hidden flex flex-col justify-between" role="region" aria-label="Trình mô phỏng in 3D FDM tự động hóa">
          
          <!-- TOP TELEMETRY HUD -->
          <div class="layercraft-hud p-3 sm:p-4 flex flex-wrap items-center justify-between gap-2 z-10 pointer-events-none">
            <div class="layercraft-hud-badge pointer-events-auto">
              <span class="w-2.5 h-2.5 rounded-full bg-[#64E8F5] animate-pulse hud-status-dot"></span>
              <span class="font-bold text-[11px] sm:text-xs tracking-wider uppercase text-cyan-300 hud-status-text">FDM LIVE SIMULATION</span>
            </div>

            <div class="flex items-center gap-2 pointer-events-auto">
              <div class="layercraft-hud-badge text-[11px] font-mono hidden sm:inline-flex">
                <i class="fa-solid fa-temperature-half text-amber-400"></i>
                <span class="hud-temp-nozzle">215°C</span>
                <span class="text-slate-500">|</span>
                <i class="fa-solid fa-layer-group text-cyan-400"></i>
                <span class="hud-layer-counter">L0 / 120</span>
              </div>
              <div class="layercraft-hud-badge text-[11px] font-mono">
                <span class="hud-height-indicator">Z: 0.0mm</span>
              </div>
            </div>
          </div>

          <!-- CANVAS AREA -->
          <div class="relative flex-1 w-full flex items-center justify-center overflow-hidden">
            <canvas class="layercraft-canvas w-full h-full cursor-grab active:cursor-grabbing"></canvas>
            
            <!-- BED ORIGIN GRID LABEL -->
            <div class="absolute bottom-16 left-4 text-[10px] font-mono text-slate-500 pointer-events-none tracking-widest hidden sm:block">
              BED: 256×256mm • LAYER: 0.16mm • SPEED: 180mm/s
            </div>
          </div>

          <!-- BOTTOM CONTROLS & TIMELINE -->
          <div class="layercraft-controls-bar m-3 sm:m-4 p-2.5 sm:p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-3 z-10">
            <!-- Play/Pause & Replay -->
            <div class="flex items-center gap-2">
              <button type="button" class="btn-play-pause w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-transform active:scale-95" aria-label="Tạm dừng / Tiếp tục">
                <i class="fa-solid fa-pause text-xs"></i>
              </button>
              <button type="button" class="btn-replay w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-transform active:scale-95" title="Chạy lại từ đầu" aria-label="Chạy lại từ đầu">
                <i class="fa-solid fa-rotate-left text-xs"></i>
              </button>
            </div>

            <!-- Timeline Scrubber -->
            <div class="flex-1 flex items-center gap-3 min-w-[140px]">
              <span class="text-[10px] font-mono text-slate-400 w-8 text-right hud-progress-pct">0%</span>
              <input type="range" class="layercraft-seek-slider w-full" min="0" max="1000" value="0" aria-label="Tiến độ in mô phỏng">
            </div>

            <!-- Material Color Swatches -->
            <div class="flex items-center gap-1.5" role="group" aria-label="Chọn màu sợi nhựa mô phỏng">
              ${COLOR_PALETTES.map((p, idx) => `
                <button type="button" 
                        class="swatch-btn w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${idx === 0 ? 'border-white scale-110 ring-2 ring-cyan-400/50' : 'border-transparent'}" 
                        style="background-color: ${p.hex}" 
                        data-color="${p.hex}" 
                        data-name="${p.name}"
                        title="${p.name}">
                </button>
              `).join('')}
            </div>
          </div>
        </div>
      `;

      this.canvas = this.container.querySelector('.layercraft-canvas');
      try {
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
      } catch (_) {
        this.ctx = null;
      }
      this.btnPlayPause = this.container.querySelector('.btn-play-pause');
      this.btnReplay = this.container.querySelector('.btn-replay');
      this.seekSlider = this.container.querySelector('.layercraft-seek-slider');
      this.hudLayer = this.container.querySelector('.hud-layer-counter');
      this.hudHeight = this.container.querySelector('.hud-height-indicator');
      this.hudProgressPct = this.container.querySelector('.hud-progress-pct');
      this.hudStatusText = this.container.querySelector('.hud-status-text');
      this.hudStatusDot = this.container.querySelector('.hud-status-dot');
      this.swatchButtons = this.container.querySelectorAll('.swatch-btn');

      if (this.ctx) {
        this.resize();
      } else {
        this._renderFallback();
      }
    }

    _renderFallback() {
      if (!this.container) return;
      const viewport = this.container.querySelector('.layercraft-viewport');
      if (viewport) {
        if (this.canvas) {
          this.canvas.style.display = 'none';
        }
        const fallback = document.createElement('div');
        fallback.className = 'layercraft-fallback flex flex-col items-center justify-center p-6 text-center text-slate-400 absolute inset-0';
        fallback.innerHTML = `
          <div class="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-3 border border-cyan-500/20">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <p class="text-xs font-mono font-bold text-slate-200 mb-1">Mô Phỏng Máy In 3D Chuẩn Xác</p>
          <p class="text-[11px] text-slate-400 max-w-xs">Trình duyệt không hỗ trợ Canvas 2D. Vui lòng bật hỗ trợ đồ họa để trải nghiệm công nghệ mô phỏng lớp in.</p>
        `;
        viewport.appendChild(fallback);
      }
    }

    _buildGeometry() {
      // Build parametric 3D cross-sections (an artistic faceted geometric vase/stand)
      const layers = [];
      const total = this.opts.totalLayers;

      for (let i = 0; i < total; i++) {
        const t = i / total;
        // Radius oscillates with elegant twisting vase contour
        const baseRadius = 55 + Math.sin(t * Math.PI * 2.5) * 18 - Math.pow(t - 0.4, 2) * 20;
        const numSides = 8;
        const twistAngle = t * Math.PI * 0.8;
        const points = [];

        for (let j = 0; j < numSides; j++) {
          const angle = (j / numSides) * Math.PI * 2 + twistAngle;
          // Subtly indent alternate vertices for faceted fluted look
          const r = j % 2 === 0 ? baseRadius : baseRadius * 0.88;
          points.push({
            x: Math.cos(angle) * r,
            y: Math.sin(angle) * r * 0.55 // 2.5D isometric foreshortening
          });
        }

        // Inner hollow contour (vase wall thickness)
        const innerPoints = [];
        const wallRatio = 0.82;
        for (let j = 0; j < numSides; j++) {
          innerPoints.push({
            x: points[j].x * wallRatio,
            y: points[j].y * wallRatio
          });
        }

        layers.push({
          index: i,
          zRatio: t,
          points: points,
          innerPoints: innerPoints
        });
      }

      this.geometryLayers = layers;
    }

    _bindEvents() {
      // Play / Pause
      this.btnPlayPause.addEventListener('click', () => {
        if (this.isPlaying) {
          this.pause();
        } else {
          if (this.currentProgress >= 0.999) {
            this.currentProgress = 0;
          }
          this.play();
        }
      });

      // Replay
      this.btnReplay.addEventListener('click', () => {
        this.seek(0);
        this.play();
      });

      // Seek Slider
      this.seekSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value) / 1000;
        this.seek(val);
      });

      // Material Swatches
      this.swatchButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          const hex = btn.dataset.color;
          this.setMaterial({ colorHex: hex });
          this.swatchButtons.forEach(b => {
            b.classList.remove('border-white', 'scale-110', 'ring-2', 'ring-cyan-400/50');
            b.classList.add('border-transparent');
          });
          btn.classList.add('border-white', 'scale-110', 'ring-2', 'ring-cyan-400/50');
          btn.classList.remove('border-transparent');
        });
      });

      // Window resize
      this._onResize = () => this.resize();
      window.addEventListener('resize', this._onResize, { passive: true });
    }

    _canRunLoop() {
      const isDocVisible = typeof document !== 'undefined' ? !document.hidden : true;
      return this.isPlaying && !this.isDestroyed && this.isVisible && isDocVisible;
    }

    _setupObservers() {
      // IntersectionObserver to pause rendering when offscreen
      if ('IntersectionObserver' in window) {
        this.observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            this.isVisible = entry.isIntersecting;
            if (!this._canRunLoop()) {
              this._stopLoop();
            } else if (!this.rafId) {
              this.lastTimestamp = performance.now();
              this._startLoop();
            }
          });
        }, { threshold: 0.05 });
        this.observer.observe(this.container);
      }

      // Document Visibility Change
      this._onVisibilityChange = () => {
        if (!this._canRunLoop()) {
          this._stopLoop();
        } else if (!this.rafId) {
          this.lastTimestamp = performance.now();
          this._startLoop();
        }
      };
      document.addEventListener('visibilitychange', this._onVisibilityChange);
    }

    resize() {
      if (!this.canvas || !this.ctx) return;
      const rect = this.canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2.0); // Guardrail: max DPR 2.0
      this.width = rect.width;
      this.height = rect.height;

      this.canvas.width = Math.floor(rect.width * dpr);
      this.canvas.height = Math.floor(rect.height * dpr);
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.ctx.scale(dpr, dpr);

      this.render();
    }

    play() {
      this.isPlaying = true;
      this.btnPlayPause.innerHTML = '<i class="fa-solid fa-pause text-xs"></i>';
      this.btnPlayPause.setAttribute('aria-label', 'Tạm dừng mô phỏng');
      if (this.hudStatusDot) {
        this.hudStatusDot.className = 'w-2.5 h-2.5 rounded-full bg-[#64E8F5] animate-pulse hud-status-dot';
      }
      if (this.hudStatusText) {
        this.hudStatusText.textContent = 'FDM LIVE SIMULATION';
      }
      this.lastTimestamp = performance.now();
      this._startLoop();
    }

    pause() {
      this.isPlaying = false;
      this.btnPlayPause.innerHTML = '<i class="fa-solid fa-play text-xs ml-0.5"></i>';
      this.btnPlayPause.setAttribute('aria-label', 'Tiếp tục mô phỏng');
      if (this.hudStatusDot) {
        this.hudStatusDot.className = 'w-2.5 h-2.5 rounded-full bg-amber-400 hud-status-dot';
      }
      if (this.hudStatusText) {
        this.hudStatusText.textContent = 'SIMULATION PAUSED';
      }
      this._stopLoop();
    }

    seek(progress01) {
      this.currentProgress = Math.max(0, Math.min(1, progress01));
      if (this.seekSlider) {
        this.seekSlider.value = Math.floor(this.currentProgress * 1000);
      }
      this._updateHUD();
      this.render();
    }

    setMaterial({ colorHex }) {
      if (colorHex) {
        this.activeColor = colorHex;
        this.render();
      }
    }

    setTheme(theme) {
      this.activeTheme = theme === 'light' ? 'light' : 'dark';
      this.render();
    }

    _startLoop() {
      if (this.rafId) return;
      const step = (now) => {
        if (!this._canRunLoop()) {
          this.rafId = null;
          return;
        }

        const delta = now - this.lastTimestamp;
        this.lastTimestamp = now;

        // Progress delta based on cycle duration
        if (delta > 0 && delta < 500) {
          const stepDelta = delta / this.opts.cycleDurationMs;
          this.currentProgress += stepDelta;

          if (this.currentProgress >= 1.0) {
            this.currentProgress = 1.0;
            this.pause();
            if (this.hudStatusText) {
              this.hudStatusText.textContent = 'COMPLETED (120/120 LAYERS)';
            }
          }
        }

        if (this.seekSlider) {
          this.seekSlider.value = Math.floor(this.currentProgress * 1000);
        }
        this._updateHUD();
        this.render();

        if (this.isPlaying) {
          this.rafId = requestAnimationFrame(step);
        } else {
          this.rafId = null;
        }
      };

      this.rafId = requestAnimationFrame(step);
    }

    _stopLoop() {
      if (this.rafId) {
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
      }
    }

    _updateHUD() {
      const currentLayer = Math.floor(this.currentProgress * this.opts.totalLayers);
      const currentZ = (this.currentProgress * 54.0).toFixed(1);
      const pct = Math.floor(this.currentProgress * 100);

      if (this.hudLayer) {
        this.hudLayer.textContent = `L${currentLayer} / ${this.opts.totalLayers}`;
      }
      if (this.hudHeight) {
        this.hudHeight.textContent = `Z: ${currentZ}mm`;
      }
      if (this.hudProgressPct) {
        this.hudProgressPct.textContent = `${pct}%`;
      }
    }

    render() {
      if (!this.ctx || !this.width || !this.height) return;
      if (!this.geometryLayers || this.geometryLayers.length === 0) return;
      const ctx = this.ctx;
      const w = this.width;
      const h = this.height;

      ctx.clearRect(0, 0, w, h);

      // Center coordinates
      const centerX = w / 2;
      const centerY = h * 0.72; // Origin bed baseline
      const total = this.geometryLayers.length;
      const activeLayerIdx = Math.min(total - 1, Math.floor(this.currentProgress * total));
      const layerProgress = (this.currentProgress * total) - activeLayerIdx;

      // 1. Draw Simulated Print Bed (Hexagonal Isometric Heated Bed)
      this._drawPrintBed(ctx, centerX, centerY);

      // 2. Draw Deposited Layers up to activeLayerIdx
      for (let i = 0; i <= activeLayerIdx; i++) {
        const layer = this.geometryLayers[i];
        const isCurrentLayer = (i === activeLayerIdx);
        const zOffset = i * 1.8; // Vertical height per layer in pixels
        const yPos = centerY - zOffset;

        this._drawLayer(ctx, centerX, yPos, layer, isCurrentLayer, layerProgress, i / total);
      }

      // 3. Draw Active Toolhead / Extruder Nozzle
      if (this.currentProgress > 0 && this.currentProgress < 1.0) {
        const activeLayer = this.geometryLayers[activeLayerIdx];
        const zOffset = activeLayerIdx * 1.8;
        const yPos = centerY - zOffset;
        this._drawToolhead(ctx, centerX, yPos, activeLayer, layerProgress);
      }
    }

    _drawPrintBed(ctx, cx, cy) {
      const isDark = (this.activeTheme !== 'light');
      ctx.save();
      ctx.translate(cx, cy);

      // Base plate outline
      const bedW = 160;
      const bedH = 80;

      ctx.beginPath();
      ctx.ellipse(0, 0, bedW, bedH, 0, 0, Math.PI * 2);
      ctx.fillStyle = isDark ? 'rgba(18, 24, 32, 0.7)' : 'rgba(230, 238, 244, 0.8)';
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = isDark ? 'rgba(100, 232, 245, 0.25)' : 'rgba(0, 107, 122, 0.2)';
      ctx.stroke();

      // Heated bed radial concentric rings
      for (let r = 30; r <= 130; r += 25) {
        ctx.beginPath();
        ctx.ellipse(0, 0, r, r * 0.5, 0, 0, Math.PI * 2);
        ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Origin indicator (0,0)
      ctx.beginPath();
      ctx.arc(0, 0, 3, 0, Math.PI * 2);
      ctx.fillStyle = this.activeColor;
      ctx.fill();

      ctx.restore();
    }

    _drawLayer(ctx, cx, cy, layer, isCurrent, progressInLayer, depthRatio) {
      ctx.save();
      ctx.translate(cx, cy);

      const pts = layer.points;
      const inner = layer.innerPoints;

      // Color shading based on depth and layer height
      const baseHex = this.activeColor;
      const alpha = 0.55 + depthRatio * 0.45;

      ctx.beginPath();
      // Outer path
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let j = 1; j < pts.length; j++) {
        ctx.lineTo(pts[j].x, pts[j].y);
      }
      ctx.closePath();

      // Inner hole (counter-clockwise)
      ctx.moveTo(inner[0].x, inner[0].y);
      for (let j = inner.length - 1; j >= 0; j--) {
        ctx.lineTo(inner[j].x, inner[j].y);
      }
      ctx.closePath();

      // Layer surface fill
      ctx.fillStyle = this._getShadedColor(baseHex, depthRatio, isCurrent);
      ctx.fill('evenodd');

      // Layer perimeter stroke
      ctx.strokeStyle = isCurrent ? '#FFFFFF' : this._getStrokeColor(baseHex, depthRatio);
      ctx.lineWidth = isCurrent ? 2 : 1;
      ctx.stroke();

      // Active printing bead on top layer
      if (isCurrent && progressInLayer < 1.0) {
        const segTotal = pts.length;
        const currentSeg = Math.floor(progressInLayer * segTotal);
        const segT = (progressInLayer * segTotal) - currentSeg;

        const p1 = pts[currentSeg % segTotal];
        const p2 = pts[(currentSeg + 1) % segTotal];
        const beadX = p1.x + (p2.x - p1.x) * segT;
        const beadY = p1.y + (p2.y - p1.y) * segT;

        // Glowing extrusion point
        ctx.beginPath();
        ctx.arc(beadX, beadY, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = baseHex;
        ctx.shadowBlur = 12;
        ctx.fill();
      }

      ctx.restore();
    }

    _drawToolhead(ctx, cx, cy, layer, progressInLayer) {
      ctx.save();
      ctx.translate(cx, cy);

      const pts = layer.points;
      const segTotal = pts.length;
      const currentSeg = Math.floor(progressInLayer * segTotal);
      const segT = (progressInLayer * segTotal) - currentSeg;

      const p1 = pts[currentSeg % segTotal];
      const p2 = pts[(currentSeg + 1) % segTotal];
      const toolX = p1.x + (p2.x - p1.x) * segT;
      const toolY = p1.y + (p2.y - p1.y) * segT;

      // Draw Toolhead assembly
      ctx.translate(toolX, toolY);

      // Brass Nozzle cone
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-6, -12);
      ctx.lineTo(6, -12);
      ctx.closePath();
      ctx.fillStyle = '#F59E0B'; // Brass gold
      ctx.fill();
      ctx.strokeStyle = '#D97706';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Heater block
      ctx.fillStyle = '#475569'; // Aluminum block
      ctx.fillRect(-10, -22, 20, 10);
      ctx.strokeStyle = '#334155';
      ctx.strokeRect(-10, -22, 20, 10);

      // Cooling heatsink fins
      for (let f = 0; f < 3; f++) {
        ctx.fillStyle = '#64748B';
        ctx.fillRect(-12, -26 - (f * 5), 24, 3);
      }

      // Vertical Gantry axis line
      ctx.beginPath();
      ctx.moveTo(0, -40);
      ctx.lineTo(0, -120);
      ctx.strokeStyle = 'rgba(100, 232, 245, 0.25)';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.restore();
    }

    _getShadedColor(hex, depthRatio, isCurrent) {
      if (isCurrent) return hex;
      // Darken layers near the bottom to create 3D depth and ambient occlusion
      const factor = 0.45 + depthRatio * 0.55;
      return this._adjustBrightness(hex, factor);
    }

    _getStrokeColor(hex, depthRatio) {
      const factor = 0.6 + depthRatio * 0.4;
      return this._adjustBrightness(hex, factor);
    }

    _adjustBrightness(hex, factor) {
      // Basic hex color shade calculation
      const c = hex.replace('#', '');
      const r = Math.min(255, Math.floor(parseInt(c.substring(0, 2), 16) * factor));
      const g = Math.min(255, Math.floor(parseInt(c.substring(2, 4), 16) * factor));
      const b = Math.min(255, Math.floor(parseInt(c.substring(4, 6), 16) * factor));
      return `rgb(${r}, ${g}, ${b})`;
    }

    destroy() {
      this.isDestroyed = true;
      this._stopLoop();
      if (this.observer) {
        this.observer.disconnect();
      }
      if (this._onResize) {
        window.removeEventListener('resize', this._onResize);
      }
      if (this._onVisibilityChange) {
        document.removeEventListener('visibilitychange', this._onVisibilityChange);
      }
      if (this.container) {
        this.container.innerHTML = '';
      }
    }
  }

  // Factory API conforming strictly to Codex Directive
  window.TTAutomationSimulator = {
    create: function (container, options) {
      return new LayercraftSimulator(container, options);
    }
  };

})(window, document);
