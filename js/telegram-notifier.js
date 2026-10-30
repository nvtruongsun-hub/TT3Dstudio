/**
 * T&T 3D Labs - Telegram Bot Order Notifier Module
 * Automated instant notifications to Telegram Chatbot when new orders arrive
 * Handles token/chatId storage, HTML message formatting, and safe async dispatch.
 */

(function (window) {
  'use strict';

  const STORAGE_KEY = 'TT_TELEGRAM_CONFIG_V1';

  const DEFAULT_CONFIG = {
    token: '', // Không hardcode secret bot token trong client bundle (Codex TT3D-MASTER-AUDIT-R7)
    chatId: '8773439139',
    enabled: true
  };

  /**
   * Lấy cấu hình Telegram từ localStorage
   */
  function getTelegramConfig() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...DEFAULT_CONFIG };
      const parsed = JSON.parse(raw);
      let token = (parsed.token || DEFAULT_CONFIG.token || '').trim();
      let chatId = (parsed.chatId || DEFAULT_CONFIG.chatId || '').trim();
      
      // Tự động sửa lỗi nếu người dùng lưu nhầm số điện thoại vào Chat ID
      if (/^0\d{9,10}$/.test(chatId) && DEFAULT_CONFIG.chatId) {
        console.warn(`[TTTelegram] Phát hiện số điện thoại (${chatId}) trong Chat ID. Tự động chuyển sang Telegram Chat ID chuẩn: ${DEFAULT_CONFIG.chatId}`);
        chatId = DEFAULT_CONFIG.chatId;
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify({
            token,
            chatId,
            enabled: parsed.enabled !== false,
            updatedAt: new Date().toISOString()
          }));
        } catch (_) {}
      }

      return {
        token,
        chatId,
        enabled: parsed.enabled !== false
      };
    } catch (e) {
      console.warn('[TTTelegram] Cannot parse config from localStorage:', e);
      return { ...DEFAULT_CONFIG };
    }
  }

  /**
   * Lưu cấu hình Telegram vào localStorage và Firestore (nếu có)
   */
  async function saveTelegramConfig(config) {
    try {
      const cleanConfig = {
        token: (config.token || '').trim(),
        chatId: (config.chatId || '').trim(),
        enabled: config.enabled !== false,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanConfig));

      // Đồng bộ lên Cloud Firestore nếu có TTFirestore
      if (window.TTFirestore && typeof window.TTFirestore.saveTelegramConfig === 'function') {
        try {
          await window.TTFirestore.saveTelegramConfig(cleanConfig);
        } catch (fsErr) {
          console.warn('[TTTelegram] Cloud Firestore sync skipped:', fsErr);
        }
      }

      return { ok: true };
    } catch (e) {
      console.error('[TTTelegram] saveTelegramConfig error:', e);
      return { ok: false, error: e.message };
    }
  }

  /**
   * Định dạng số tiền VND
   */
  function formatMoney(amount) {
    return new Intl.NumberFormat('vi-VN').format(Math.round(amount || 0)) + '₫';
  }

  /**
   * Format nội dung tin nhắn Telegram dạng HTML sắc nét
   */
  function formatOrderTelegramMessage(order) {
    if (!order) return '';

    const orderId = order.orderId || order.clientRequestId || 'TT3D-ORDER';
    const createdAt = order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : new Date().toLocaleString('vi-VN');
    const custName = order.customer?.name || 'Khách vãng lai';
    const custPhone = order.customer?.phone || 'Chưa cung cấp';
    const custAddress = order.customer?.address || 'Nhận tại xưởng / Thỏa thuận qua Zalo';
    const custNote = order.customer?.note || 'Không có ghi chú';
    const channel = (order.channel || 'zalo').toUpperCase();
    const finalTotal = formatMoney(
      order.totals?.finalTotal ??
      order.totals?.payableTotal ??
      order.totals?.total ??
      order.total ??
      order.pricing?.total ??
      0
    );

    const items = Array.isArray(order.items) ? order.items : [];
    let itemsHtml = '';
    if (items.length === 0) {
      itemsHtml = '• <i>Không có chi tiết sản phẩm</i>\n';
    } else {
      items.forEach((item, idx) => {
        const title = escapeHtml(item.title || 'Sản phẩm in 3D');
        const qty = item.qty || item.quantity || 1;
        const price = formatMoney(item.price || 0);
        let specs = [];
        if (item.colorName) specs.push(`Màu: ${escapeHtml(item.colorName)}`);
        if (item.materialName) specs.push(`Nhựa: ${escapeHtml(item.materialName)}`);
        if (item.customText) specs.push(`Khắc: "${escapeHtml(item.customText)}"`);
        if (item.fontName) specs.push(`Font: ${escapeHtml(item.fontName)}`);

        const specStr = specs.length > 0 ? ` (${specs.join(', ')})` : '';
        itemsHtml += `${idx + 1}. <b>${title}</b> x${qty} - <code>${price}</code>${specStr}\n`;
      });
    }

    const adminUrl = 'https://nvtruongsun-hub.github.io/TT3Dstudio/admin.html';

    return `🔔 <b>CÓ ĐƠN HÀNG MỚI - T&T 3D LABS</b>\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `📦 <b>Mã đơn:</b> <code>#${orderId}</code>\n` +
      `⏰ <b>Thời gian:</b> <code>${createdAt}</code>\n` +
      `🛒 <b>Kênh đặt:</b> <code>${channel}</code>\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `👤 <b>Khách hàng:</b> <b>${escapeHtml(custName)}</b>\n` +
      `📞 <b>Điện thoại:</b> <code>${escapeHtml(custPhone)}</code>\n` +
      `📍 <b>Địa chỉ:</b> ${escapeHtml(custAddress)}\n` +
      `📝 <b>Ghi chú:</b> <i>${escapeHtml(custNote)}</i>\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `🛍️ <b>Danh sách sản phẩm (${items.length} món):</b>\n` +
      itemsHtml +
      `━━━━━━━━━━━━━━━━━━\n` +
      `💰 <b>TỔNG THANH TOÁN:</b> <b>${finalTotal}</b>\n\n` +
      `👉 <a href="${adminUrl}">Mở Trang Quản Trị Đơn Hàng</a>`;
  }

  function escapeHtml(text) {
    if (!text) return '';
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * Gửi tin nhắn đến Telegram API
   */
  async function sendTelegramMessage(token, chatId, htmlText) {
    if (!token || !chatId || !htmlText) {
      throw new Error('Thiếu Telegram Bot Token, Chat ID hoặc nội dung tin nhắn.');
    }

    const cleanToken = token.trim();
    const cleanChatId = chatId.trim();
    const url = `https://api.telegram.org/bot${cleanToken}/sendMessage`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          chat_id: cleanChatId,
          text: htmlText,
          parse_mode: 'HTML',
          disable_web_page_preview: false
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.description || `Lỗi Telegram API HTTP ${response.status}`);
      }

      return { ok: true, data };
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        throw new Error('Kết nối tới Telegram API bị quá hạn thời gian (Timeout 6s).');
      }
      throw err;
    }
  }

  /**
   * Tự động gửi thông báo khi có đơn hàng mới (chạy ngầm an toàn)
   */
  async function notifyNewOrder(order) {
    let config = getTelegramConfig();

    // 1. Tự động lấy cấu hình từ Cloud Firestore nếu localStorage chưa có (khách đặt từ storefront)
    if ((!config.token || !config.chatId) && window.TTFirestore && typeof window.TTFirestore.getTelegramConfig === 'function') {
      try {
        const cloudConfig = await window.TTFirestore.getTelegramConfig();
        if (cloudConfig && cloudConfig.token) {
          config = {
            token: (cloudConfig.token || '').trim(),
            chatId: (cloudConfig.chatId || '').trim(),
            enabled: cloudConfig.enabled !== false
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
        }
      } catch (cloudErr) {
        console.warn('[TTTelegram] Không thể nạp cấu hình từ Cloud Firestore:', cloudErr);
      }
    }

    if (!config.enabled) {
      console.log('[TTTelegram] Thông báo đơn hàng tự động đang bị tắt.');
      return { ok: false, reason: 'disabled' };
    }

    if (!config.token) {
      console.log('[TTTelegram] Chưa cấu hình Telegram Bot Token.');
      return { ok: false, reason: 'unconfigured' };
    }

    // 2. Tự động xử lý nếu Chat ID là số điện thoại (ví dụ: 0349657529) hoặc bị trống
    let effectiveChatId = (config.chatId || '').trim();
    if (!effectiveChatId || /^0\d{9,10}$/.test(effectiveChatId)) {
      if (DEFAULT_CONFIG.chatId && !/^0\d{9,10}$/.test(DEFAULT_CONFIG.chatId)) {
        effectiveChatId = DEFAULT_CONFIG.chatId;
        config.chatId = effectiveChatId;
        saveTelegramConfig(config);
      } else {
        console.log('[TTTelegram] Chat ID là số điện thoại hoặc chưa có. Đang tự động dò tìm Chat ID thực tế từ Telegram Bot...');
        try {
          const detectRes = await detectLatestChatId(config.token);
          if (detectRes && detectRes.ok && detectRes.chatId) {
            effectiveChatId = detectRes.chatId;
            config.chatId = effectiveChatId;
            saveTelegramConfig(config);
            console.log(`[TTTelegram] Đã tự động cập nhật Chat ID thực tế: ${effectiveChatId}`);
          }
        } catch (detErr) {
          console.warn('[TTTelegram] Tự động dò Chat ID thất bại:', detErr);
        }
      }
    }

    if (!effectiveChatId || /^0\d{9,10}$/.test(effectiveChatId)) {
      console.warn('[TTTelegram] Chưa có Chat ID Telegram hợp lệ để gửi thông báo.');
      return { ok: false, reason: 'invalid_chat_id' };
    }

    try {
      const messageHtml = formatOrderTelegramMessage(order);
      const res = await sendTelegramMessage(config.token, effectiveChatId, messageHtml);
      console.log('[TTTelegram] Đã gửi thông báo đơn hàng mới tới Telegram thành công!');
      return res;
    } catch (err) {
      console.warn('[TTTelegram] Không thể gửi thông báo tới Telegram:', err.message);
      return { ok: false, error: err.message };
    }
  }

  /**
   * Tự động dò Chat ID từ tin nhắn gần nhất gửi tới Bot qua getUpdates API
   */
  async function detectLatestChatId(token) {
    const cleanToken = (token || getTelegramConfig().token || '').trim();
    if (!cleanToken) {
      return {
        ok: false,
        error: 'Vui lòng nhập Telegram Bot Token trước khi bấm Tự động dò Chat ID.'
      };
    }

    const url = `https://api.telegram.org/bot${cleanToken}/getUpdates`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    try {
      const response = await fetch(url, {
        method: 'GET',
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(data.description || `Lỗi Telegram API HTTP ${response.status}`);
      }

      const updates = Array.isArray(data.result) ? data.result : [];
      if (updates.length === 0) {
        return {
          ok: false,
          reason: 'no_messages',
          error: 'Chưa tìm thấy tin nhắn nào gửi tới bot. Vui lòng mở Telegram, tìm bot của bạn, bấm "Start" (/start hoặc gửi 1 tin nhắn bất kỳ), sau đó bấm lại nút này!'
        };
      }

      // Duyệt ngược từ tin nhắn mới nhất để tìm chat.id
      for (let i = updates.length - 1; i >= 0; i--) {
        const u = updates[i];
        const chat = u.message?.chat || u.my_chat_member?.chat || u.channel_post?.chat || u.callback_query?.message?.chat;
        if (chat && chat.id) {
          const senderName = chat.title || [chat.first_name, chat.last_name].filter(Boolean).join(' ') || 'Tài khoản Telegram';
          return {
            ok: true,
            chatId: String(chat.id),
            chatType: chat.type || 'private',
            senderName
          };
        }
      }

      return {
        ok: false,
        error: 'Không tìm thấy ID người chat trong danh sách tin nhắn của bot.'
      };
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        return { ok: false, error: 'Kết nối tới Telegram API bị quá hạn thời gian (Timeout 6s).' };
      }
      return { ok: false, error: err.message };
    }
  }

  /**
   * Gửi tin nhắn test kiểm tra kết nối Telegram
   */
  async function testTelegramConnection(token, chatId) {
    const testToken = token || getTelegramConfig().token;
    const testChatId = chatId || getTelegramConfig().chatId;

    if (!testToken || !testChatId) {
      return {
        ok: false,
        error: 'Vui lòng nhập đầy đủ Telegram Bot Token và Chat ID trước khi kiểm tra.'
      };
    }

    // Kiểm tra nếu người dùng vô tình nhập số điện thoại thay vì Chat ID
    const cleanId = String(testChatId).trim();
    let actualChatId = cleanId;
    let autoResolvedFromPhone = false;

    if (/^0\d{9,10}$/.test(cleanId) || /^\+84\d{9,10}$/.test(cleanId)) {
      // Tự động tìm Chat ID thật từ bot hoặc lấy Chat ID xưởng đã xác thực (8773439139)
      const detectRes = await detectLatestChatId(testToken);
      if (detectRes.ok && detectRes.chatId) {
        actualChatId = detectRes.chatId;
        autoResolvedFromPhone = true;
      } else if (DEFAULT_CONFIG.chatId) {
        actualChatId = DEFAULT_CONFIG.chatId;
        autoResolvedFromPhone = true;
      } else {
        return {
          ok: false,
          error: `"${cleanId}" là số điện thoại, không phải Telegram Chat ID! Telegram Chat ID là một mã số nội bộ (ví dụ: 8773439139). Hãy bấm nút "Tự động dò Chat ID" ở trên hoặc chat với @userinfobot để lấy ID.`
        };
      }
    }

    const now = new Date().toLocaleString('vi-VN');
    const testMsg = `🔔 <b>T&T 3D LABS - KIỂM TRA KẾT NỐI BOT</b>\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `✅ Kết nối thành công giữa Hệ thống Quản trị Xưởng và Telegram Bot!\n` +
      `⏰ Thời gian: <code>${now}</code>\n` +
      `🤖 Trạng thái: <b>Sẵn sàng nhận thông báo đơn hàng mới tự động 24/7.</b>\n` +
      (autoResolvedFromPhone ? `📱 Ghi chú: Đã tự động liên kết từ SĐT <code>${cleanId}</code> sang Telegram Chat ID <code>${actualChatId}</code>.\n` : '') +
      `━━━━━━━━━━━━━━━━━━`;

    try {
      const res = await sendTelegramMessage(testToken, actualChatId, testMsg);
      // Tự động lưu Chat ID chuẩn nếu vừa resolve từ SĐT
      if (autoResolvedFromPhone) {
        await saveTelegramConfig({ token: testToken, chatId: actualChatId, enabled: true });
      }
      return {
        ok: true,
        res,
        autoResolved: autoResolvedFromPhone,
        realChatId: actualChatId,
        message: autoResolvedFromPhone
          ? `Đã tự động chuyển từ số điện thoại (${cleanId}) sang Telegram Chat ID chuẩn: ${actualChatId}! Tin nhắn test đã gửi thành công.`
          : 'Kết nối thành công! Tin nhắn mẫu đã được gửi tới bot Telegram của bạn.'
      };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }

  // Khởi tạo và đồng bộ config từ Firestore (nếu có)
  async function initFromCloud() {
    if (window.TTFirestore && typeof window.TTFirestore.getTelegramConfig === 'function') {
      try {
        const cloudConfig = await window.TTFirestore.getTelegramConfig();
        if (cloudConfig && cloudConfig.token && cloudConfig.chatId) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudConfig));
        }
      } catch (e) {
        // Silently skip
      }
    }
  }

  // Lắng nghe sự kiện firebase ready nếu firebase khởi tạo sau
  if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
    window.addEventListener('tt:firebase-ready', () => {
      initFromCloud();
    });
  }

  if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initFromCloud);
    } else {
      initFromCloud();
    }
  }

  window.TTTelegram = {
    getTelegramConfig,
    saveTelegramConfig,
    formatOrderTelegramMessage,
    sendTelegramMessage,
    notifyNewOrder,
    testTelegramConnection,
    detectLatestChatId
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.TTTelegram;
  }

})(typeof window !== 'undefined' ? window : global);
