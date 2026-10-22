/**
 * T&T 3D Labs - Real Order Engine & Tracking Pipeline
 * Architecture Standard: Rebuild Spec 2026-10-22
 * Manages orders, tracking projections, multi-stage status, and workshop updates.
 */

(function (window) {
  'use strict';

  const STORAGE_KEY = 'TT_ORDERS_DATABASE_V1';
  const BROADCAST_CHANNEL_NAME = 'TT3D_ORDERS_CHANNEL';

  // 6 mốc trạng thái chuẩn cho khách hàng
  const STATUS_CONFIG = {
    request_received: {
      stepIndex: 1,
      label: 'Đã nhận yêu cầu',
      shortLabel: 'Tiếp nhận',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
      icon: 'fa-file-lines',
      description: 'Hệ thống đã ghi nhận yêu cầu đặt hàng của bạn và gửi đến xưởng chế tác.'
    },
    confirmed: {
      stepIndex: 2,
      label: 'Xưởng xác nhận',
      shortLabel: 'Đã duyệt',
      badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
      icon: 'fa-clipboard-check',
      description: 'Kỹ thuật viên đã duyệt sản phẩm, chốt thông số kỹ thuật và sắp xếp lịch in.'
    },
    in_production: {
      stepIndex: 3,
      label: 'Đang làm (In & Xử lý)',
      shortLabel: 'Đang in 3D',
      badgeClass: 'bg-orange-100 text-orange-800 border-orange-300',
      icon: 'fa-cube',
      description: 'Sản phẩm đang được tạo hình trên dàn máy in Bambu Lab độ mịn 0.16mm và xử lý bề mặt thủ công.'
    },
    quality_check: {
      stepIndex: 4,
      label: 'Kiểm tra chất lượng (QC)',
      shortLabel: 'Kiểm tra QC',
      badgeClass: 'bg-purple-100 text-purple-800 border-purple-300',
      icon: 'fa-magnifying-glass-check',
      description: 'Kiểm tra độ khít, độ bền nếp gấp và chip NFC trước khi đóng gói chống va đập.'
    },
    shipped: {
      stepIndex: 5,
      label: 'Đang giao hàng',
      shortLabel: 'Đang giao',
      badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      icon: 'fa-truck-fast',
      description: 'Kiện hàng đã được bàn giao cho đơn vị bưu chính để chuyển tới bạn.'
    },
    delivered: {
      stepIndex: 6,
      label: 'Đã nhận hàng',
      shortLabel: 'Hoàn tất',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      icon: 'fa-circle-check',
      description: 'Đơn hàng đã được giao thành công. Cảm ơn bạn đã đồng hành cùng T&T 3D!'
    },
    awaiting_customer: {
      stepIndex: 2,
      label: 'Chờ khách xác nhận',
      shortLabel: 'Chờ phản hồi',
      badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
      icon: 'fa-circle-exclamation',
      description: 'Xưởng cần bạn xác nhận lại mẫu chữ khắc, logo hoặc màu sắc trước khi in.'
    },
    on_hold: {
      stepIndex: 2,
      label: 'Tạm hoãn xử lý',
      shortLabel: 'Tạm hoãn',
      badgeClass: 'bg-gray-100 text-gray-800 border-gray-300',
      icon: 'fa-pause',
      description: 'Đơn hàng tạm hoãn theo yêu cầu của quý khách hoặc điều chỉnh kỹ thuật.'
    },
    cancelled: {
      stepIndex: 0,
      label: 'Đã hủy đơn',
      shortLabel: 'Đã hủy',
      badgeClass: 'bg-red-100 text-red-800 border-red-300',
      icon: 'fa-ban',
      description: 'Đơn hàng đã được hủy.'
    }
  };

  function generateSecureToken() {
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const bytes = new Uint8Array(16);
      crypto.getRandomValues(bytes);
      return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
    }
    return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
  }

  function getDemoOrders() {
    const now = new Date();
    const isoNow = now.toISOString();
    const yesterday = new Date(now.getTime() - 24 * 3600 * 1000).toISOString();
    const twoDaysAgo = new Date(now.getTime() - 48 * 3600 * 1000).toISOString();

    return [
      {
        orderId: 'TT3D-DEMO-2026',
        token: 'demo-token-6a8f9c1e2b4d7e0a1b2c3d4e5f6a7b8c',
        clientRequestId: 'TT3D-DEMO-2026',
        createdAt: yesterday,
        updatedAt: isoNow,
        status: 'in_production',
        etaDate: '24/10/2026',
        isDemo: true,
        customer: {
          name: 'Nguyễn Văn Trường',
          phone: '0986888333',
          address: 'Hoàn Kiếm, Hà Nội',
          note: 'In phôi mịn, đóng gói hộp quà tặng giúp mình'
        },
        items: [
          {
            id: 'mw-cn-2084928',
            title: 'Khay Trang Sức Nơ Lụa Sweet Silk',
            price: 139000,
            qty: 1,
            colorName: 'Hồng Lụa Pastel',
            customText: 'Trường & Lan'
          },
          {
            id: 'mw-cn-1836100',
            title: 'Đế WiFi NFC 1 Chạm TapConnect',
            price: 109000,
            qty: 1,
            colorName: 'Gỗ Vintage Sồi'
          }
        ],
        totals: {
          subtotal: 248000,
          shippingFee: 25000,
          finalTotal: 273000
        },
        history: [
          {
            status: 'request_received',
            timestamp: yesterday,
            note: 'Khách hàng gửi yêu cầu qua website',
            staff: 'Hệ thống tự động'
          },
          {
            status: 'confirmed',
            timestamp: new Date(now.getTime() - 20 * 3600 * 1000).toISOString(),
            note: 'Kỹ thuật viên tiếp nhận, duyệt file 3D và chốt màu in',
            staff: 'KTV Nam'
          },
          {
            status: 'in_production',
            timestamp: new Date(now.getTime() - 4 * 3600 * 1000).toISOString(),
            note: 'Đang in 3D trên máy Bambu Lab P1S số 4. Tốc độ lớp 0.16mm',
            staff: 'KTV Nam'
          }
        ],
        carrier: null,
        customerAlert: {
          type: 'info',
          message: 'Sản phẩm đang trong buồng in nhiệt độ ổn định. Dự kiến chuyển sang khâu kiểm định chất lượng (QC) vào 16:00 chiều nay.'
        },
        publicNote: 'Đơn hàng làm theo yêu cầu khắc tên riêng.',
        privateNote: 'Khách quen, chú ý bóc support phần nơ cẩn thận không để lại vết móng gà.'
      },
      {
        orderId: 'TT3D-DEMO-NFC',
        token: 'demo-token-9f8e7d6c5b4a3b2a1f0e9d8c7b6a5f4e',
        clientRequestId: 'TT3D-DEMO-NFC',
        createdAt: twoDaysAgo,
        updatedAt: isoNow,
        status: 'shipped',
        etaDate: '23/10/2026',
        isDemo: true,
        customer: {
          name: 'Lê Thuỳ Dung',
          phone: '0912345678',
          address: 'Cầu Giấy, Hà Nội',
          note: 'Giao giờ hành chính'
        },
        items: [
          {
            id: 'mw-cn-1836100',
            title: 'Đế WiFi NFC 1 Chạm TapConnect (Gói 3 Quán)',
            price: 299000,
            qty: 1,
            colorName: 'Đen Nhám Obsidian'
          }
        ],
        totals: {
          subtotal: 299000,
          shippingFee: 25000,
          finalTotal: 324000
        },
        history: [
          {
            status: 'request_received',
            timestamp: twoDaysAgo,
            note: 'Yêu cầu được tiếp nhận',
            staff: 'Hệ thống tự động'
          },
          {
            status: 'confirmed',
            timestamp: new Date(now.getTime() - 40 * 3600 * 1000).toISOString(),
            note: 'Xác nhận thông tin quán cafe & nạp link WiFi vào chip NTAG215',
            staff: 'KTV Hoàng'
          },
          {
            status: 'in_production',
            timestamp: new Date(now.getTime() - 30 * 3600 * 1000).toISOString(),
            note: 'In phôi PETG chịu nước và đúc chìm chip NFC',
            staff: 'KTV Hoàng'
          },
          {
            status: 'quality_check',
            timestamp: new Date(now.getTime() - 16 * 3600 * 1000).toISOString(),
            note: 'Đã test quét thành công trên iPhone 15 & Samsung S24',
            staff: 'KTV Trưởng'
          },
          {
            status: 'shipped',
            timestamp: new Date(now.getTime() - 5 * 3600 * 1000).toISOString(),
            note: 'Bàn giao cho bưu cục Giao Hàng Tiết Kiệm',
            staff: 'Kho Hà Nội'
          }
        ],
        carrier: {
          name: 'Giao Hàng Tiết Kiệm (GHTK)',
          trackingCode: 'S224899120.VN',
          trackingUrl: 'https://i.ghtk.vn/S224899120.VN'
        },
        customerAlert: null,
        publicNote: 'Chip NFC đã được khóa an toàn tránh bị ghi đè.',
        privateNote: 'Đã dán tem bảo hành 12 tháng chip NFC.'
      }
    ];
  }

  function getStoredOrders() {
    try {
      if (typeof localStorage === 'undefined') return getDemoOrders();
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const demos = getDemoOrders();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(demos));
        return demos;
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        const demos = getDemoOrders();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(demos));
        return demos;
      }
      return parsed;
    } catch (e) {
      console.warn('[OrderEngine] Lỗi đọc cơ sở dữ liệu đơn:', e);
      return getDemoOrders();
    }
  }

  function saveStoredOrders(orders) {
    try {
      if (typeof localStorage === 'undefined') return;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
      broadcastChange();
    } catch (e) {
      console.error('[OrderEngine] Lỗi lưu cơ sở dữ liệu đơn:', e);
    }
  }

  function broadcastChange() {
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        const bc = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
        bc.postMessage({ type: 'ORDER_UPDATED', timestamp: Date.now() });
        bc.close();
      } catch (_) {}
    }
  }

  /**
   * Tạo yêu cầu đặt hàng mới (Idempotent theo clientRequestId)
   */
  function createOrderRequest(orderData) {
    const orders = getStoredOrders();
    const orderId = orderData.clientRequestId || ('TT3D-' + Math.random().toString(36).slice(2, 8).toUpperCase());
    
    // Kiểm tra xem đã tồn tại chưa
    const existing = orders.find(o => o.orderId === orderId || o.clientRequestId === orderId);
    if (existing) {
      return {
        ok: true,
        orderId: existing.orderId,
        token: existing.token,
        status: existing.status,
        isExisting: true
      };
    }

    const token = generateSecureToken();
    const nowIso = new Date().toISOString();

    const newRecord = {
      orderId,
      token,
      clientRequestId: orderId,
      createdAt: nowIso,
      updatedAt: nowIso,
      status: 'request_received',
      etaDate: 'Đang chờ xưởng xác nhận',
      isDemo: false,
      channel: orderData.channel || 'zalo',
      source: orderData.source || 'direct',
      customer: {
        name: orderData.customer?.name || 'Khách hàng',
        phone: orderData.customer?.phone || '',
        address: orderData.customer?.address || '',
        note: orderData.customer?.note || ''
      },
      items: Array.isArray(orderData.items) ? orderData.items : [],
      totals: orderData.totals || { subtotal: 0, shippingFee: 0, finalTotal: 0 },
      history: [
        {
          status: 'request_received',
          timestamp: nowIso,
          note: 'Hệ thống website đã ghi nhận yêu cầu đặt hàng',
          staff: 'Website Handoff'
        }
      ],
      carrier: null,
      customerAlert: null,
      publicNote: '',
      privateNote: ''
    };

    orders.unshift(newRecord);
    saveStoredOrders(orders);

    return {
      ok: true,
      orderId,
      token,
      status: newRecord.status,
      isExisting: false
    };
  }

  /**
   * Trả về projection an toàn cho khách hàng (Bảo mật PII & ẩn ghi chú nội bộ)
   */
  function getOrderProjection(orderId, tokenOrPhone) {
    if (!orderId || typeof orderId !== 'string') {
      return { ok: false, error: 'Mã đơn hàng không được để trống.' };
    }

    const cleanId = orderId.trim().toUpperCase();
    const orders = getStoredOrders();
    const ord = orders.find(o => o.orderId.toUpperCase() === cleanId || (o.clientRequestId && o.clientRequestId.toUpperCase() === cleanId));

    if (!ord) {
      return { ok: false, error: `Không tìm thấy đơn hàng mã "${cleanId}". Vui lòng kiểm tra lại mã đơn của bạn.` };
    }

    // Kiểm tra quyền xem qua token hoặc 4 số cuối điện thoại
    let authorized = false;
    const cleanAuth = String(tokenOrPhone || '').trim();

    if (ord.isDemo) {
      // Đơn demo cho phép xem ngay để trải nghiệm
      authorized = true;
    } else if (cleanAuth && cleanAuth === ord.token) {
      authorized = true;
    } else if (cleanAuth && ord.customer && ord.customer.phone) {
      const cleanTargetPhone = ord.customer.phone.replace(/[\s.-]/g, '');
      const cleanInput = cleanAuth.replace(/[\s.-]/g, '');
      if (cleanTargetPhone.endsWith(cleanInput) || cleanTargetPhone === cleanInput) {
        authorized = true;
      }
    }

    if (!authorized) {
      return {
        ok: false,
        error: 'Cần mã bảo mật (token) trong link tra cứu hoặc số điện thoại đặt hàng để xác thực quyền xem đơn này.',
        needsPhoneAuth: true
      };
    }

    // Mask số điện thoại và địa chỉ nhạy cảm
    let maskedPhone = '';
    if (ord.customer?.phone) {
      const p = ord.customer.phone.replace(/[\s.-]/g, '');
      maskedPhone = p.length > 4 ? p.slice(0, 3) + '••••' + p.slice(-3) : p;
    }

    let maskedAddress = ord.customer?.address || '';
    if (maskedAddress.length > 15) {
      const parts = maskedAddress.split(',');
      if (parts.length > 1) {
        maskedAddress = '•••• ' + parts.slice(-2).join(',').trim();
      }
    }

    return {
      ok: true,
      orderId: ord.orderId,
      token: ord.token,
      status: ord.status,
      statusInfo: STATUS_CONFIG[ord.status] || STATUS_CONFIG.request_received,
      etaDate: ord.etaDate || 'Đang cập nhật',
      createdAt: ord.createdAt,
      updatedAt: ord.updatedAt,
      isDemo: Boolean(ord.isDemo),
      customer: {
        name: ord.customer?.name || 'Khách hàng',
        maskedPhone,
        maskedAddress
      },
      items: ord.items || [],
      totals: ord.totals || {},
      history: (ord.history || []).map(h => ({
        status: h.status,
        statusLabel: STATUS_CONFIG[h.status]?.label || h.status,
        timestamp: h.timestamp,
        note: h.note
      })),
      carrier: ord.carrier || null,
      customerAlert: ord.customerAlert || null,
      publicNote: ord.publicNote || ''
    };
  }

  /**
   * Cập nhật trạng thái từ phía Xưởng (Admin Portal)
   */
  function updateOrderStatus(orderId, updateData, staffName = 'Quản trị xưởng') {
    if (!orderId) return { ok: false, error: 'Thiếu mã đơn hàng' };

    const orders = getStoredOrders();
    const idx = orders.findIndex(o => o.orderId === orderId || o.clientRequestId === orderId);
    if (idx === -1) {
      return { ok: false, error: 'Không tìm thấy đơn hàng' };
    }

    const ord = orders[idx];
    const prevStatus = ord.status;
    const nowIso = new Date().toISOString();

    if (updateData.status && STATUS_CONFIG[updateData.status]) {
      ord.status = updateData.status;
    }
    if (updateData.etaDate !== undefined) {
      ord.etaDate = updateData.etaDate;
    }
    if (updateData.carrier !== undefined) {
      ord.carrier = updateData.carrier;
    }
    if (updateData.customerAlert !== undefined) {
      ord.customerAlert = updateData.customerAlert;
    }
    if (updateData.publicNote !== undefined) {
      ord.publicNote = updateData.publicNote;
    }
    if (updateData.privateNote !== undefined) {
      ord.privateNote = updateData.privateNote;
    }

    ord.updatedAt = nowIso;

    // Thêm bản ghi lịch sử
    const historyNote = updateData.historyNote || (
      ord.status !== prevStatus
        ? `Đổi trạng thái sang "${STATUS_CONFIG[ord.status]?.label || ord.status}"`
        : 'Cập nhật thông tin đơn hàng'
    );

    if (!Array.isArray(ord.history)) ord.history = [];
    ord.history.push({
      status: ord.status,
      timestamp: nowIso,
      note: historyNote,
      staff: staffName
    });

    orders[idx] = ord;
    saveStoredOrders(orders);

    return {
      ok: true,
      order: ord
    };
  }

  /**
   * Lấy toàn bộ danh sách đơn hàng cho Admin Dashboard
   */
  function getAllOrdersAdmin() {
    return getStoredOrders();
  }

  window.TTOrderEngine = {
    STATUS_CONFIG,
    createOrderRequest,
    getOrderProjection,
    updateOrderStatus,
    getAllOrdersAdmin,
    getStoredOrders,
    saveStoredOrders
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.TTOrderEngine;
  }
})(typeof window !== 'undefined' ? window : globalThis);
