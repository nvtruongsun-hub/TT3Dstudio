/**
 * T&T 3D Labs - Central Catalog Store & Data Synchronization Engine
 * Quản lý kho dữ liệu sản phẩm tập trung cho Client và Admin Portal
 * Tuân thủ quy tắc kiến trúc Codex Master Controller (Directive 2026-10-21)
 */

(function (window) {
  'use strict';

  const STORAGE_KEY = 'tt_products';
  const META_STORAGE_KEY = 'tt_catalog_meta';
  const EVENT_NAME = 'tt_products_updated';
  const FALLBACK_URL = 'products.json';
  const CURRENT_SCHEMA_VERSION = 5;
  const CURRENT_CATALOG_REVISION = 'mw-55-v1';

  // 6 Sản phẩm legacy chuẩn làm fixture làm giàu dữ liệu cũ (Codex Directive)
  const LEGACY_FIXTURE_PRODUCTS = [
    {
      id: 'prod-1',
      title: 'Đế WiFi 1 Chạm Thông Minh TapConnect™',
      category: 'Ca_Nhan_Hoa_NFC',
      type: 'nfc',
      price: 109000,
      originalPrice: 149000,
      badge: '⚡ NTAG215',
      image: 'assets/images/product-nfc-wifi.jpg',
      specs: {
        dimensions: '82 x 64 x 95 mm',
        weight: '90g',
        layer: '0.16mm (Lớp in siêu mịn)',
        material: 'Bio-PLA Matte nguyên sinh',
        nfc: 'Chip NTAG215 đúc chìm (iOS & Android)',
        warranty: '12 tháng đổi mới 1-1'
      },
      colors: [
        { id: 'obsidian', name: 'Đen Obsidian', hex: '#26282B' },
        { id: 'white', name: 'Trắng Sứ Nordic', hex: '#F5F2EB' },
        { id: 'terracotta', name: 'Cam Đất Mờ', hex: '#C85A32' },
        { id: 'walnut', name: 'Gỗ Walnut Sẫm', hex: '#4A3525' }
      ],
      materials: [
        { id: 'pla_plus', name: 'PLA+ Nguyên Sinh', label: 'PLA+ Nguyên Sinh (Mờ mịn)', priceModifier: 0, desc: 'Bề mặt mờ nhám siêu mịn, chống bám vân tay' },
        { id: 'wood_pla', name: 'Wood Composite', label: 'Wood Composite (Mộc ấm cúng)', priceModifier: 20000, desc: 'Chứa 30% bột gỗ tự nhiên, cảm giác thớ gỗ thật' },
        { id: 'petg', name: 'PETG Ngoài Trời', label: 'PETG Chịu Nhiệt Ngoài Trời', priceModifier: 15000, desc: 'Chịu nhiệt và nắng mưa bàn cafe ngoài trời' }
      ]
    },
    {
      id: 'prod-2',
      title: 'Bình Hoa Dập Ly Origami Watertight',
      category: 'Decor_Den_Noi_That',
      type: 'standard',
      price: 125000,
      specs: { dimensions: '110 x 110 x 220 mm', weight: '160g', layer: '0.24mm Watertight Extrusion', warranty: 'Cam kết kín nước tuyệt đối' },
      colors: [{ id: 'terracotta', name: 'Đất Nung Thô', hex: '#C85A32' }, { id: 'white', name: 'Trắng Ngà Tối Giản', hex: '#EFEBE2' }],
      materials: [{ id: 'pla_matte', name: 'PLA+ Sinh Học', label: 'PLA+ Sinh Học Từ Ngô', priceModifier: 0 }]
    },
    {
      id: 'prod-3',
      title: 'Kệ Đa Năng BedSide & Desk Organizer Pro',
      category: 'Hop_De_Ban_Tien_Ich',
      type: 'standard',
      price: 199000,
      specs: { dimensions: '210 x 140 x 45 mm', weight: '220g', layer: '0.20mm High Precision', warranty: 'Bảo hành 12 tháng' },
      colors: [{ id: 'obsidian', name: 'Đen Obsidian', hex: '#1E293B' }, { id: 'white', name: 'Trắng Bắc Âu', hex: '#F8FAFC' }],
      materials: [{ id: 'pla_matte', name: 'PLA+ Matte Siêu Mịn', label: 'PLA+ Matte Siêu Mịn', priceModifier: 0 }]
    },
    {
      id: 'prod-4',
      title: 'Đèn Bàn Xoắn Kem Swirl Soft-Serve™',
      category: 'Decor_Den_Noi_That',
      type: 'standard',
      price: 320000,
      specs: { dimensions: '140 x 140 x 190 mm', weight: '210g', layer: '0.16mm Tán xạ quang học', warranty: 'Bảo hành 12 tháng' },
      colors: [{ id: 'cream', name: 'Vàng Bơ Mịn', hex: '#FFF3B0' }, { id: 'white', name: 'Trắng Sữa Xuyên Sáng', hex: '#FAF9F6' }],
      materials: [{ id: 'pla_trans', name: 'PLA Xuyên Sáng Tự Nhiên', label: 'PLA Xuyên Sáng Tự Nhiên', priceModifier: 0 }]
    },
    {
      id: 'prod-5',
      title: 'Hệ Bảng Treo Tường Module Hexa Pegboard',
      category: 'Hop_De_Ban_Tien_Ich',
      type: 'standard',
      price: 145000,
      specs: { dimensions: '200 x 175 x 12 mm', weight: '140g', layer: '0.20mm Cấu trúc lục giác tổ ong', warranty: 'Bảo hành 6 tháng' },
      colors: [{ id: 'white', name: 'Trắng Sứ Nordic', hex: '#F8FAFC' }, { id: 'gray', name: 'Xám Xi Măng', hex: '#94A3B8' }],
      materials: [{ id: 'pla_std', name: 'PLA+ Chịu Lực', label: 'PLA+ Chịu Lực Treo Đồ', priceModifier: 0 }]
    },
    {
      id: 'prod-6',
      title: 'Bảng Tên & Chữ Cái Monogram 3D Signature',
      category: 'Ca_Nhan_Hoa_NFC',
      type: 'monogram',
      price: 135000,
      specs: { dimensions: '120 x 85 x 42 mm', weight: '110g', layer: '0.12mm Hoàn thiện sắc nét', warranty: 'Bảo hành hoàn tiền' },
      colors: [{ id: 'orange', name: 'Cam Safety Orange', hex: '#FF5C00' }, { id: 'black', name: 'Đen Obsidian Mờ', hex: '#1E293B' }],
      materials: [{ id: 'pla_dual', name: 'PLA+ 2 Màu Tương Phản', label: 'PLA+ Đúc 2 Màu Liền Khối', priceModifier: 0 }]
    }
  ];

  // 5 Danh mục sản phẩm chuẩn hóa toàn hệ thống (Shared Category Registry)
  const CATEGORY_REGISTRY = {
    Trang_Diem_Vanity: {
      id: 'Trang_Diem_Vanity',
      shortName: 'Trang Điểm & Nơ Lụa',
      title: 'Hộp Đựng Đồ Trang Điểm, Cọ Mỹ Phẩm & Trang Sức Lụa Thắt Nơ',
      accentColor: '#E11D48',
      accentBg: '#FFF1F2',
      icon: 'fa-wand-magic-sparkles',
      badgeText: '✦ Coquette Chic'
    },
    Decor_Den_Noi_That: {
      id: 'Decor_Den_Noi_That',
      shortName: 'Đèn & Bình Hoa Decor',
      title: 'Đèn Ngủ Nghệ Thuật, Bình Hoa Đánh Lừa Thị Giác & Tượng Decor',
      accentColor: '#D97706',
      accentBg: '#FEF3C7',
      icon: 'fa-lightbulb',
      badgeText: '✦ Ambient Craft'
    },
    Do_Choi_Moc_Khoa: {
      id: 'Do_Choi_Moc_Khoa',
      shortName: 'Khớp Động & Fidget',
      title: 'Đồ Chơi Khớp Động, Móc Khóa Hoạt Hình & Fidget Xả Stress',
      accentColor: '#0284C7',
      accentBg: '#E0F2FE',
      icon: 'fa-gamepad',
      badgeText: '✦ Viral Fidget'
    },
    Hop_De_Ban_Tien_Ich: {
      id: 'Hop_De_Ban_Tien_Ich',
      shortName: 'Hộp Bàn & Bánh Răng',
      title: 'Hộp Để Bàn Thông Minh, Cơ Cấu Bánh Răng & Tiện Ích Đa Năng',
      accentColor: '#16A34A',
      accentBg: '#DCFCE7',
      icon: 'fa-gears',
      badgeText: '✦ Mechanical Desk'
    },
    Ca_Nhan_Hoa_NFC: {
      id: 'Ca_Nhan_Hoa_NFC',
      shortName: 'Cá Nhân Hóa & NFC',
      title: 'Sản Phẩm Cá Nhân Hóa, Biển Số Xe, Mã QR & Móc Khóa NFC',
      accentColor: '#7C3AED',
      accentBg: '#F3E8FF',
      icon: 'fa-fingerprint',
      badgeText: '✦ Smart Custom'
    }
  };

  let cachedProducts = null;
  let cachedMetadata = null;
  let initPromise = null;
  let isWritingStorage = false;

  /**
   * Đọc metadata lưu trữ (revision, tombstones, version)
   */
  function readMetadata() {
    try {
      const raw = localStorage.getItem(META_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          return {
            schemaVersion: parsed.schemaVersion || 0,
            catalogRevision: parsed.catalogRevision || null,
            tombstones: Array.isArray(parsed.tombstones) ? parsed.tombstones : [],
            migratedAt: parsed.migratedAt || null
          };
        }
      }
    } catch (e) {
      console.warn('[CatalogStore] Lỗi đọc metadata:', e);
    }
    return {
      schemaVersion: 0,
      catalogRevision: null,
      tombstones: [],
      migratedAt: null
    };
  }

  /**
   * Ghi metadata lưu trữ an toàn
   */
  function writeMetadata(meta) {
    try {
      localStorage.setItem(META_STORAGE_KEY, JSON.stringify(meta));
      cachedMetadata = meta;
    } catch (e) {
      console.warn('[CatalogStore] Lỗi ghi metadata:', e);
    }
  }

  /**
   * Kiểm tra schema tối thiểu của 1 sản phẩm
   */
  function isValidProduct(p) {
    return p && typeof p === 'object' &&
      typeof p.id === 'string' && p.id.trim() !== '' &&
      typeof p.title === 'string' && p.title.trim() !== '' &&
      typeof p.price === 'number' && Number.isSafeInteger(p.price) && p.price >= 0;
  }

  /**
   * Chuẩn hóa và làm sạch dữ liệu sản phẩm đầy đủ 55 thuộc tính
   */
  function sanitizeProduct(p, index) {
    const idx = (typeof index === 'number') ? index + 1 : 1;
    const cat = String(p.category || 'Hop_De_Ban_Tien_Ich').trim();
    const fallbackBadge = CATEGORY_REGISTRY[cat]?.badgeText || '✦ 3D Print';

    return {
      id: String(p.id || 'prod-' + idx).trim(),
      modelId: p.modelId ? String(p.modelId).trim() : null,
      title: String(p.title || 'Sản phẩm ' + idx).trim(),
      originalTitle: p.originalTitle ? String(p.originalTitle).trim() : null,
      category: cat,
      type: String(p.type || 'standard').trim(),
      price: Math.max(0, parseInt(p.price, 10) || 0),
      originalPrice: p.originalPrice ? Math.max(0, parseInt(p.originalPrice, 10) || 0) : null,
      badge: String(p.badge || fallbackBadge).trim(),
      image: String(p.image || 'assets/images/logo-premium-mark.svg').trim(),
      imageAlt: String(p.imageAlt || p.title || 'Sản phẩm in 3D').trim(),
      imageSource: ['upload', 'url', 'preset'].includes(p.imageSource) ? p.imageSource : 'preset',
      presetId: p.presetId ? String(p.presetId).trim() : null,
      modelKey: p.modelKey ? String(p.modelKey).trim() : null,
      author: p.author ? String(p.author).trim() : 'T&T 3D Labs',
      makerworldUrl: p.makerworldUrl ? String(p.makerworldUrl).trim() : null,
      downloads: Math.max(0, parseInt(p.downloads, 10) || 0),
      likes: Math.max(0, parseInt(p.likes, 10) || 0),
      prints: Math.max(0, parseInt(p.prints, 10) || 0),
      weightGrams: Math.max(0, parseInt(p.weightGrams, 10) || 0),
      printTimeSeconds: Math.max(0, parseInt(p.printTimeSeconds, 10) || 0),
      aestheticScore: Math.max(1, Math.min(5, parseInt(p.aestheticScore, 10) || 5)),
      uniquenessScore: Math.max(1, Math.min(5, parseInt(p.uniquenessScore, 10) || 5)),
      feasibilityScore: Math.max(1, Math.min(5, parseInt(p.feasibilityScore, 10) || 5)),
      selectionScore: (typeof p.selectionScore === 'number') ? p.selectionScore : 100.0,
      materialRecommendation: String(p.materialRecommendation || '').trim(),
      headlineBenefit: String(p.headlineBenefit || '').trim(),
      desc: String(p.desc || '').trim(),
      videoScript: String(p.videoScript || '').trim(),
      productionNotes: String(p.productionNotes || '').trim(),
      licenseName: String(p.licenseName || 'Standard Digital File License').trim(),
      commercialStatus: String(p.commercialStatus || 'Chua_ro').trim(),
      isHero: Boolean(p.isHero),
      specLine: String(p.specLine || '').trim(),
      specs: (p.specs && typeof p.specs === 'object' && !Array.isArray(p.specs)) ? { ...p.specs } : {},
      colors: Array.isArray(p.colors) ? p.colors.map(c => ({
        id: String(c.id || 'c_default').trim(),
        name: String(c.name || 'Mặc định').trim(),
        hex: String(c.hex || '#26282B').trim()
      })) : [],
      materials: Array.isArray(p.materials) ? p.materials.map(m => ({
        id: String(m.id || 'm_default').trim(),
        name: String(m.name || m.label || 'Tiêu chuẩn').trim(),
        label: String(m.label || m.name || 'Tiêu chuẩn').trim(),
        desc: String(m.desc || '').trim(),
        priceModifier: Math.max(0, parseInt(m.priceModifier, 10) || 0)
      })) : [],
      status: ['active', 'draft', 'archived'].includes(p.status) ? p.status : 'active',
      updatedAt: p.updatedAt || new Date().toISOString()
    };
  }

  /**
   * Hợp nhất an toàn các trường được cung cấp (Partial Update)
   */
  function mergeProvidedFields(existing, patch) {
    if (!existing) return patch;
    const merged = { ...existing };
    for (const key of Object.keys(patch)) {
      if (patch[key] === undefined) continue;

      if (key === 'specs' && patch.specs && typeof patch.specs === 'object' && !Array.isArray(patch.specs)) {
        merged.specs = { ...(existing.specs || {}), ...patch.specs };
      } else {
        merged[key] = patch[key];
      }
    }
    merged.updatedAt = new Date().toISOString();
    return merged;
  }

  /**
   * Tải catalog nền từ products.json
   */
  async function fetchDefaultCatalog() {
    try {
      const res = await fetch(FALLBACK_URL + '?t=' + Date.now());
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      if (Array.isArray(data)) {
        return data.filter(isValidProduct).map(sanitizeProduct);
      }
    } catch (err) {
      console.warn('[CatalogStore] Không thể tải products.json nền:', err);
    }
    return [];
  }

  /**
   * Làm giàu dữ liệu sản phẩm cũ (Enrichment) từ bản gốc chuẩn
   * Bảo tồn tuyệt đối dữ liệu tùy chỉnh của người dùng (ảnh upload, trọng lượng riêng, v.v.)
   */
  function enrichWithBaseProduct(storedItem, baseDefaults) {
    if (!baseDefaults || !Array.isArray(baseDefaults) || baseDefaults.length === 0) {
      return { item: storedItem, changed: false };
    }
    const base = baseDefaults.find(b => b.id === storedItem.id);
    if (!base) {
      // Sản phẩm tự tạo không có bản chuẩn: không chế tạo tùy chọn giả
      return { item: storedItem, changed: false };
    }

    const enriched = { ...storedItem };
    let hasChanged = false;

    // Phục hồi màu nếu thiếu hoặc rỗng
    if (!Array.isArray(enriched.colors) || enriched.colors.length === 0) {
      if (Array.isArray(base.colors) && base.colors.length > 0) {
        enriched.colors = JSON.parse(JSON.stringify(base.colors));
        hasChanged = true;
      }
    }

    // Phục hồi vật liệu nếu thiếu hoặc rỗng
    if (!Array.isArray(enriched.materials) || enriched.materials.length === 0) {
      if (Array.isArray(base.materials) && base.materials.length > 0) {
        enriched.materials = JSON.parse(JSON.stringify(base.materials));
        hasChanged = true;
      }
    }

    // Phục hồi từng thông số kỹ thuật thiếu (giữ nguyên thông số riêng, ví dụ 101g)
    enriched.specs = (enriched.specs && typeof enriched.specs === 'object' && !Array.isArray(enriched.specs))
      ? { ...enriched.specs }
      : {};

    if (base.specs && typeof base.specs === 'object') {
      for (const [k, v] of Object.entries(base.specs)) {
        if (enriched.specs[k] === undefined || enriched.specs[k] === null || enriched.specs[k] === '' || enriched.specs[k] === 'N/A') {
          enriched.specs[k] = v;
          hasChanged = true;
        }
      }
    }

    // Bổ sung metadata MakerWorld nếu thiếu
    const metaFields = [
      'modelId', 'originalTitle', 'author', 'makerworldUrl', 'downloads', 'likes', 'prints',
      'weightGrams', 'printTimeSeconds', 'aestheticScore', 'uniquenessScore', 'feasibilityScore',
      'selectionScore', 'materialRecommendation', 'headlineBenefit', 'desc', 'videoScript',
      'productionNotes', 'licenseName', 'commercialStatus', 'isHero'
    ];
    for (const field of metaFields) {
      if ((enriched[field] === undefined || enriched[field] === null || enriched[field] === '') && base[field] !== undefined) {
        enriched[field] = base[field];
        hasChanged = true;
      }
    }

    return { item: enriched, changed: hasChanged };
  }

  /**
   * Hàm thuần thực hiện di trú Catalog (Pure Migration Algorithm)
   * Tuân thủ các quy tắc bảo toàn của Codex:
   * 1. Storage chưa tồn tại -> nạp defaults
   * 2. Storage [] -> giữ []
   * 3. Có dữ liệu cũ -> giữ sản phẩm Admin, bổ sung seed mới chưa tombstone
   * 4. Trùng ID -> giữ tùy chỉnh người dùng, bổ sung trường thiếu
   * 5. Đã migration cùng revision -> không nạp lại seed đã xóa
   */
  function buildMigration({ storedProducts, previousDefaults, incomingDefaults, metadata }) {
    if (storedProducts === null) {
      return {
        products: incomingDefaults.map(sanitizeProduct),
        metadata: {
          schemaVersion: CURRENT_SCHEMA_VERSION,
          catalogRevision: CURRENT_CATALOG_REVISION,
          tombstones: [],
          migratedAt: new Date().toISOString()
        },
        changed: true
      };
    }

    if (!Array.isArray(storedProducts)) {
      return {
        products: incomingDefaults.map(sanitizeProduct),
        metadata: {
          schemaVersion: CURRENT_SCHEMA_VERSION,
          catalogRevision: CURRENT_CATALOG_REVISION,
          tombstones: [],
          migratedAt: new Date().toISOString()
        },
        changed: true
      };
    }

    // Tôn trọng mảng rỗng [] nếu người dùng đã xóa hết sản phẩm
    if (storedProducts.length === 0) {
      return {
        products: [],
        metadata: metadata || {
          schemaVersion: CURRENT_SCHEMA_VERSION,
          catalogRevision: CURRENT_CATALOG_REVISION,
          tombstones: [],
          migratedAt: new Date().toISOString()
        },
        changed: false
      };
    }

    const tombstones = new Set(metadata?.tombstones || []);
    let hasChanged = false;

    // 1. Enrich các sản phẩm đã có trong storage (từ incoming defaults, previous defaults & legacy fixture)
    const allKnownBases = [...(incomingDefaults || []), ...(previousDefaults || []), ...LEGACY_FIXTURE_PRODUCTS];
    const enrichedExisting = storedProducts.map((p, idx) => {
      const sanitized = sanitizeProduct(p, idx);
      const res = enrichWithBaseProduct(sanitized, allKnownBases);
      if (res.changed) hasChanged = true;
      return res.item || res;
    });

    const existingIdSet = new Set(enrichedExisting.map(p => p.id));
    const finalProducts = [...enrichedExisting];

    // 2. Nếu revision catalog thay đổi hoặc chưa migrate revision này:
    // Bổ sung các seed sản phẩm mới từ incomingDefaults mà chưa có trong storage và chưa bị tombstone
    if (metadata?.catalogRevision !== CURRENT_CATALOG_REVISION) {
      for (const def of incomingDefaults) {
        if (!existingIdSet.has(def.id) && !tombstones.has(def.id)) {
          finalProducts.push(sanitizeProduct(def, finalProducts.length));
          hasChanged = true;
        }
      }
    }

    const nextMeta = {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      catalogRevision: CURRENT_CATALOG_REVISION,
      tombstones: Array.from(tombstones),
      migratedAt: new Date().toISOString()
    };

    return {
      products: finalProducts,
      metadata: nextMeta,
      changed: hasChanged
    };
  }

  /**
   * Khởi tạo và đọc catalog với cơ chế Auto-Migration
   */
  async function initCatalog() {
    if (initPromise) return initPromise;

    initPromise = (async () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const meta = readMetadata();
        cachedMetadata = meta;

        const defaults = await fetchDefaultCatalog();

        let parsed = null;
        if (raw !== null) {
          try {
            parsed = JSON.parse(raw);
          } catch (jsonErr) {
            console.error('[CatalogStore] Dữ liệu trong localStorage không hợp lệ (hỏng JSON):', jsonErr);
            // Giữ nguyên dữ liệu thô bị hỏng để người dùng khôi phục, không tự ghi đè []
            cachedProducts = defaults;
            return cachedProducts;
          }
        }

        const migrationResult = buildMigration({
          storedProducts: parsed,
          incomingDefaults: defaults,
          metadata: meta
        });

        cachedProducts = migrationResult.products;
        cachedMetadata = migrationResult.metadata;

        if (migrationResult.changed) {
          try {
            isWritingStorage = true;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(cachedProducts));
            writeMetadata(cachedMetadata);
          } catch (saveErr) {
            console.warn('[CatalogStore] Không thể lưu migration vào localStorage:', saveErr);
          } finally {
            isWritingStorage = false;
          }
        }

        return cachedProducts;
      } catch (err) {
        console.error('[CatalogStore] Lỗi đọc dữ liệu localStorage:', err);
        cachedProducts = await fetchDefaultCatalog();
        return cachedProducts;
      }
    })();

    return initPromise;
  }

  /**
   * Lấy danh sách sản phẩm đồng bộ (sau khi init hoàn tất)
   */
  function getProductsSync(onlyActive = true) {
    const list = cachedProducts || [];
    if (onlyActive) {
      return list.filter(p => p.status === 'active');
    }
    return list;
  }

  /**
   * Lấy danh sách sản phẩm bất đồng bộ
   */
  async function getProducts(onlyActive = true) {
    await initCatalog();
    return getProductsSync(onlyActive);
  }

  /**
   * Lấy danh sách sản phẩm theo Category (đồng bộ)
   */
  function getProductsByCategorySync(categoryId, onlyActive = true) {
    const list = getProductsSync(onlyActive);
    if (!categoryId || categoryId === 'all') {
      return list;
    }
    return list.filter(p => p.category === categoryId);
  }

  /**
   * Lấy danh sách sản phẩm theo Category (bất đồng bộ)
   */
  async function getProductsByCategory(categoryId, onlyActive = true) {
    await initCatalog();
    return getProductsByCategorySync(categoryId, onlyActive);
  }

  /**
   * Lấy Hero Item của 1 Category (đồng bộ)
   */
  function getCategoryHeroSync(categoryId) {
    const prods = getProductsByCategorySync(categoryId, true);
    if (prods.length === 0) return null;
    const hero = prods.find(p => p.isHero);
    if (hero) return hero;
    // Fallback nếu không có cờ isHero: lấy item có selectionScore và prints cao nhất
    return prods.slice().sort((a, b) => {
      const sa = a.selectionScore || 0;
      const sb = b.selectionScore || 0;
      if (sb !== sa) return sb - sa;
      return (b.prints || 0) - (a.prints || 0);
    })[0];
  }

  /**
   * Lấy 1 sản phẩm theo ID (đồng bộ)
   */
  function getProductByIdSync(id) {
    const list = cachedProducts || [];
    return list.find(p => p.id === id) || null;
  }

  /**
   * Lấy 1 sản phẩm theo ID (bất đồng bộ)
   */
  async function getProductById(id) {
    await initCatalog();
    return getProductByIdSync(id);
  }

  /**
   * Lưu toàn bộ catalog mới
   */
  function saveProducts(productsList) {
    if (!Array.isArray(productsList)) {
      throw new Error('Catalog phải là một mảng!');
    }
    const sanitized = productsList.map(sanitizeProduct);
    const jsonStr = JSON.stringify(sanitized);

    try {
      isWritingStorage = true;
      localStorage.setItem(STORAGE_KEY, jsonStr);
      cachedProducts = sanitized;
      window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { products: sanitized } }));
      return true;
    } catch (err) {
      console.error('[CatalogStore] Lỗi ghi localStorage (có thể đầy quota):', err);
      throw err;
    } finally {
      isWritingStorage = false;
    }
  }

  /**
   * Thêm hoặc Cập nhật 1 sản phẩm (Partial Merge bảo vệ trường không truyền vào)
   */
  async function upsertProduct(patch) {
    await initCatalog();
    if (!patch || typeof patch !== 'object' || !patch.id) {
      throw new Error('Cần cung cấp dữ liệu sản phẩm với id hợp lệ!');
    }

    const list = [...(cachedProducts || [])];
    const existingIndex = list.findIndex(p => p.id === patch.id);

    if (existingIndex >= 0) {
      const merged = mergeProvidedFields(list[existingIndex], patch);
      const clean = sanitizeProduct(merged, existingIndex);
      list[existingIndex] = clean;
    } else {
      const clean = sanitizeProduct(patch, list.length);
      list.push(clean);
    }

    saveProducts(list);
    return getProductByIdSync(patch.id);
  }

  /**
   * Xóa 1 sản phẩm và ghi nhận tombstone nếu là seed catalog
   */
  async function deleteProduct(productId) {
    await initCatalog();
    const list = (cachedProducts || []).filter(p => p.id !== productId);
    
    // Ghi nhận tombstone
    const meta = cachedMetadata || readMetadata();
    if (!meta.tombstones.includes(productId)) {
      meta.tombstones.push(productId);
      writeMetadata(meta);
    }

    saveProducts(list);
    return true;
  }

  /**
   * Khôi phục về danh mục gốc từ products.json
   */
  async function resetToDefaults() {
    const defaults = await fetchDefaultCatalog();
    saveProducts(defaults);
    const meta = {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      catalogRevision: CURRENT_CATALOG_REVISION,
      tombstones: [],
      migratedAt: new Date().toISOString()
    };
    writeMetadata(meta);
    return defaults;
  }

  /**
   * Lắng nghe sự kiện thay đổi từ các tab khác (storage event)
   */
  window.addEventListener('storage', function (e) {
    if (isWritingStorage) return;
    if (e.key === STORAGE_KEY) {
      try {
        if (e.newValue) {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            cachedProducts = parsed.map(sanitizeProduct);
            window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { products: cachedProducts, fromStorageEvent: true } }));
          }
        }
      } catch (err) {
        console.warn('[CatalogStore] Lỗi đồng bộ từ tab khác:', err);
      }
    } else if (e.key === META_STORAGE_KEY) {
      try {
        if (e.newValue) {
          cachedMetadata = JSON.parse(e.newValue);
        }
      } catch (err) {
        // Ignored
      }
    }
  });

  // Export API
  window.TTCatalogStore = {
    init: initCatalog,
    initCatalog,
    getProducts,
    getProductsSync,
    getProductsByCategory,
    getProductsByCategorySync,
    getCategoryHeroSync,
    getProductById,
    getProductByIdSync,
    saveProducts,
    upsertProduct,
    deleteProduct,
    resetToDefaults,
    buildMigration,
    CATEGORY_REGISTRY,
    EVENT_NAME,
    STORAGE_KEY,
    META_STORAGE_KEY,
    CURRENT_SCHEMA_VERSION,
    CURRENT_CATALOG_REVISION
  };

  // Khởi động sẵn sàng ngầm
  initCatalog();

})(typeof window !== 'undefined' ? window : this);
