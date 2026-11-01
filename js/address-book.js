/**
 * T&T 3D Labs - Smart Address Book Manager
 * Quản lý sổ địa chỉ giao hàng của khách hàng (CRUD, Đặt mặc định, Nhãn Nhà riêng/Cơ quan, Định dạng 2 cấp 2025/2026)
 * Tương thích với PostgreSQL RLS & Schema customer_addresses
 */

(function (window) {
  'use strict';

  const STORAGE_KEY = 'tt3d_saved_customer_addresses';

  const LABEL_META = {
    home: { key: 'home', text: 'Nhà riêng', icon: 'fa-house', color: 'emerald' },
    office: { key: 'office', text: 'Cơ quan', icon: 'fa-briefcase', color: 'blue' },
    other: { key: 'other', text: 'Khác', icon: 'fa-location-dot', color: 'zinc' }
  };

  class TTAddressBook {
    constructor() {
      this.addresses = [];
      this.isLoaded = false;
      this.listeners = [];
    }

    onChange(fn) {
      if (typeof fn === 'function') {
        this.listeners.push(fn);
      }
    }

    notify() {
      this.listeners.forEach(fn => {
        try { fn(this.addresses); } catch (e) { console.warn(e); }
      });
    }

    getLabelMeta(labelKey) {
      return LABEL_META[labelKey] || LABEL_META.home;
    }

    formatFullAddress(addr) {
      if (!addr) return '';
      const parts = [];
      if (addr.address_line) parts.push(addr.address_line.trim());
      if (addr.ward_name) parts.push(addr.ward_name.trim());
      if (addr.province_name) parts.push(addr.province_name.trim());
      return parts.join(', ');
    }

    /**
     * Nạp danh sách địa chỉ của khách hàng hiện tại
     */
    async loadAddresses(forceRefresh = false) {
      if (this.isLoaded && !forceRefresh) {
        return this.addresses;
      }

      // 1. Thử tải qua Supabase Database Client
      if (window.TTSupabase && typeof window.TTSupabase.getCustomerAddresses === 'function') {
        const res = await window.TTSupabase.getCustomerAddresses();
        if (res.ok && Array.isArray(res.addresses)) {
          this.addresses = res.addresses;
          this.isLoaded = true;
          this.saveLocalCache();
          this.notify();
          return this.addresses;
        }
      }

      // 2. Fallback đọc cache trình duyệt
      try {
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed)) {
            this.addresses = parsed;
            this.isLoaded = true;
            this.notify();
            return this.addresses;
          }
        }
      } catch (e) {}

      this.addresses = [];
      this.isLoaded = true;
      this.notify();
      return this.addresses;
    }

    saveLocalCache() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.addresses));
      } catch (e) {}
    }

    getDefaultAddress() {
      if (!Array.isArray(this.addresses) || this.addresses.length === 0) {
        return null;
      }
      const def = this.addresses.find(a => a.is_default);
      return def || this.addresses[0];
    }

    getAddressById(id) {
      if (!id || !Array.isArray(this.addresses)) return null;
      return this.addresses.find(a => a.id === id) || null;
    }

    /**
     * Thêm địa chỉ mới vào sổ địa chỉ
     */
    async addAddress(addrData) {
      const isFirst = this.addresses.length === 0;
      const isDefault = addrData.is_default !== undefined ? !!addrData.is_default : isFirst;

      const payload = {
        label: addrData.label || 'home',
        recipient_name: (addrData.recipient_name || '').trim(),
        recipient_phone: (addrData.recipient_phone || '').trim().replace(/[\s.-]/g, ''),
        province_code: String(addrData.province_code || ''),
        province_name: (addrData.province_name || '').trim(),
        ward_code: String(addrData.ward_code || ''),
        ward_name: (addrData.ward_name || '').trim(),
        address_line: (addrData.address_line || '').trim(),
        delivery_note: (addrData.delivery_note || '').trim() || null,
        is_default: isDefault
      };

      if (!payload.recipient_name) {
        return { ok: false, error: 'Vui lòng nhập họ và tên người nhận.' };
      }
      if (!/^(?:0|\+84)(?:3|5|7|8|9)\d{8}$/.test(payload.recipient_phone)) {
        return { ok: false, error: 'Số điện thoại người nhận không hợp lệ (10 chữ số tiêu chuẩn Việt Nam).' };
      }
      if (!payload.province_code || !payload.province_name) {
        return { ok: false, error: 'Vui lòng chọn Tỉnh / Thành phố.' };
      }
      if (!payload.ward_code || !payload.ward_name) {
        return { ok: false, error: 'Vui lòng chọn Phường / Xã.' };
      }
      if (!payload.address_line || payload.address_line.length < 3) {
        return { ok: false, error: 'Vui lòng nhập địa chỉ cụ thể (số nhà, đường, thôn/xóm).' };
      }

      // Thử lưu vào Supabase
      if (window.TTSupabase && typeof window.TTSupabase.addCustomerAddress === 'function') {
        const res = await window.TTSupabase.addCustomerAddress(payload);
        if (res.ok && res.address) {
          if (res.address.is_default) {
            this.addresses.forEach(a => { a.is_default = false; });
          }
          this.addresses.unshift(res.address);
          this.saveLocalCache();
          this.notify();
          return { ok: true, address: res.address };
        }
      }

      // Fallback local simulation
      const newLocalAddr = {
        id: 'addr_' + Date.now().toString(36),
        ...payload,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (newLocalAddr.is_default) {
        this.addresses.forEach(a => { a.is_default = false; });
      }
      this.addresses.unshift(newLocalAddr);
      this.saveLocalCache();
      this.notify();
      return { ok: true, address: newLocalAddr };
    }

    /**
     * Cập nhật địa chỉ đã có
     */
    async updateAddress(id, updateData) {
      if (!id) return { ok: false, error: 'Thiếu ID địa chỉ' };

      const idx = this.addresses.findIndex(a => a.id === id);
      if (idx === -1) {
        return { ok: false, error: 'Không tìm thấy địa chỉ trong danh bạ.' };
      }

      const existing = this.addresses[idx];
      const payload = {
        label: updateData.label !== undefined ? updateData.label : existing.label,
        recipient_name: (updateData.recipient_name !== undefined ? updateData.recipient_name : existing.recipient_name).trim(),
        recipient_phone: (updateData.recipient_phone !== undefined ? updateData.recipient_phone : existing.recipient_phone).trim().replace(/[\s.-]/g, ''),
        province_code: String(updateData.province_code !== undefined ? updateData.province_code : existing.province_code),
        province_name: (updateData.province_name !== undefined ? updateData.province_name : existing.province_name).trim(),
        ward_code: String(updateData.ward_code !== undefined ? updateData.ward_code : existing.ward_code),
        ward_name: (updateData.ward_name !== undefined ? updateData.ward_name : existing.ward_name).trim(),
        address_line: (updateData.address_line !== undefined ? updateData.address_line : existing.address_line).trim(),
        delivery_note: updateData.delivery_note !== undefined ? (updateData.delivery_note ? updateData.delivery_note.trim() : null) : existing.delivery_note,
        is_default: updateData.is_default !== undefined ? !!updateData.is_default : existing.is_default
      };

      if (!payload.recipient_name) return { ok: false, error: 'Họ tên người nhận không được để trống.' };
      if (!/^(?:0|\+84)(?:3|5|7|8|9)\d{8}$/.test(payload.recipient_phone)) {
        return { ok: false, error: 'Số điện thoại không đúng định dạng 10 chữ số.' };
      }

      if (window.TTSupabase && typeof window.TTSupabase.updateCustomerAddress === 'function') {
        const res = await window.TTSupabase.updateCustomerAddress(id, payload);
        if (res.ok && res.address) {
          if (res.address.is_default) {
            this.addresses.forEach(a => { if (a.id !== id) a.is_default = false; });
          }
          this.addresses[idx] = res.address;
          this.saveLocalCache();
          this.notify();
          return { ok: true, address: res.address };
        }
      }

      // Local fallback
      const updatedLocal = {
        ...existing,
        ...payload,
        updated_at: new Date().toISOString()
      };
      if (updatedLocal.is_default) {
        this.addresses.forEach(a => { if (a.id !== id) a.is_default = false; });
      }
      this.addresses[idx] = updatedLocal;
      this.saveLocalCache();
      this.notify();
      return { ok: true, address: updatedLocal };
    }

    /**
     * Xóa địa chỉ khỏi sổ địa chỉ
     */
    async deleteAddress(id) {
      if (!id) return { ok: false, error: 'Thiếu ID địa chỉ' };
      const idx = this.addresses.findIndex(a => a.id === id);
      if (idx === -1) return { ok: false, error: 'Không tìm thấy địa chỉ' };

      const wasDefault = this.addresses[idx].is_default;

      if (window.TTSupabase && typeof window.TTSupabase.deleteCustomerAddress === 'function') {
        const res = await window.TTSupabase.deleteCustomerAddress(id);
        if (!res.ok) {
          return { ok: false, error: res.error || 'Lỗi khi xóa địa chỉ' };
        }
      }

      this.addresses.splice(idx, 1);
      // Nếu xóa địa chỉ mặc định mà còn địa chỉ khác, gán cái đầu tiên làm mặc định
      if (wasDefault && this.addresses.length > 0) {
        this.addresses[0].is_default = true;
        if (window.TTSupabase && typeof window.TTSupabase.setDefaultCustomerAddress === 'function') {
          window.TTSupabase.setDefaultCustomerAddress(this.addresses[0].id);
        }
      }
      this.saveLocalCache();
      this.notify();
      return { ok: true };
    }

    /**
     * Đặt địa chỉ làm mặc định
     */
    async setDefault(id) {
      if (!id) return { ok: false, error: 'Thiếu ID địa chỉ' };
      const target = this.addresses.find(a => a.id === id);
      if (!target) return { ok: false, error: 'Không tìm thấy địa chỉ' };

      if (window.TTSupabase && typeof window.TTSupabase.setDefaultCustomerAddress === 'function') {
        const res = await window.TTSupabase.setDefaultCustomerAddress(id);
        if (!res.ok) {
          return { ok: false, error: res.error || 'Lỗi đặt địa chỉ mặc định' };
        }
      }

      this.addresses.forEach(a => {
        a.is_default = (a.id === id);
      });
      this.saveLocalCache();
      this.notify();
      return { ok: true };
    }
  }

  window.TTAddressBook = new TTAddressBook();

})(typeof window !== 'undefined' ? window : global);
