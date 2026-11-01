#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Patch index.html and admin.html with Supabase Auth, Modals, and RBAC Screen
"""

import sys, io
from pathlib import Path

if sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

ROOT = Path(__file__).resolve().parent.parent

def patch_index():
    path = ROOT / "index.html"
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Add Supabase scripts
    head_target = '  <!-- Central Runtime Engines -->'
    head_insert = '''  <!-- Supabase Cloud PostgreSQL 15+ & Auth Engine -->
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  <script src="js/supabase-client.js?v=5.0"></script>
  <script src="js/account-manager.js?v=5.0"></script>

  <!-- Central Runtime Engines -->'''

    if head_target in content and 'js/supabase-client.js' not in content:
        content = content.replace(head_target, head_insert, 1)

    # 2. Add header-account-btn before Cart Drawer Button
    cart_btn_target = '        <!-- Cart Drawer Button -->'
    account_btn_insert = '''        <!-- Customer Account / Auth Button (Bắt buộc xác thực đặt hàng) -->
        <button type="button" 
                id="header-account-btn"
                class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--bg-surface)] hover:border-[var(--accent-primary)] text-[var(--text-primary)] border border-[var(--border-subtle)] text-xs font-medium transition-all shadow-sm cursor-pointer" 
                title="Tài khoản &amp; Đơn hàng" 
                aria-label="Tài khoản">
          <i class="fa-regular fa-user text-xs"></i>
          <span class="hidden sm:inline">Đăng nhập</span>
        </button>

        <!-- Cart Drawer Button -->'''

    if cart_btn_target in content and 'id="header-account-btn"' not in content:
        content = content.replace(cart_btn_target, account_btn_insert, 1)

    # 3. Add Auth Modal and Customer Account Modal before </body>
    auth_modal_html = '''
  <!-- =========================================================================
       SECURE SUPABASE AUTH MODAL (MANDATORY LOGIN GATE FOR ECOMMERCE)
       ========================================================================= -->
  <div id="auth-modal" class="fixed inset-0 z-[150] hidden items-center justify-center p-4 bg-black/75 backdrop-blur-md" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title">
    <div class="w-full max-w-md bg-[#16161A] border border-[rgba(255,255,255,0.08)] rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 relative text-[#F4F4F5]">
      
      <!-- Close button -->
      <button type="button" id="auth-modal-close-btn" class="absolute top-5 right-5 w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition-colors" aria-label="Đóng cửa sổ">
        <i class="fa-solid fa-xmark text-sm"></i>
      </button>

      <!-- Brand Header -->
      <div class="text-center space-y-1.5 mb-6">
        <div class="w-12 h-12 mx-auto rounded-2xl bg-[#FF5C00]/10 border border-[#FF5C00]/30 flex items-center justify-center text-[#FF5C00] text-xl shadow-inner mb-3">
          <i class="fa-solid fa-shield-halved"></i>
        </div>
        <h2 id="auth-modal-title" class="text-lg font-bold text-white tracking-tight">T&amp;T 3D Studio Account</h2>
        <p class="text-xs text-zinc-400">Đăng nhập hoặc tạo tài khoản để đặt hàng &amp; theo dõi tiến độ in 3D</p>
      </div>

      <!-- Auth Tabs -->
      <div class="flex items-center border-b border-zinc-800 mb-6 text-xs">
        <button type="button" data-auth-tab="login" class="flex-1 py-2.5 text-center font-semibold text-orange-500 border-b-2 border-orange-500 transition-all">
          Đăng nhập
        </button>
        <button type="button" data-auth-tab="register" class="flex-1 py-2.5 text-center text-zinc-400 hover:text-zinc-200 transition-all">
          Đăng ký mới
        </button>
        <button type="button" data-auth-tab="forgot" class="flex-1 py-2.5 text-center text-zinc-400 hover:text-zinc-200 transition-all">
          Quên mật khẩu
        </button>
      </div>

      <!-- Error / Notice Alert -->
      <div id="auth-error-alert" class="hidden p-3 rounded-xl text-xs bg-rose-500/10 border border-rose-500/30 text-rose-300 mb-4"></div>

      <!-- 1. LOGIN FORM -->
      <form id="auth-login-form" class="space-y-4">
        <div class="space-y-1">
          <label for="auth-login-email" class="block text-[11px] font-medium text-zinc-400">Email đăng ký</label>
          <input type="email" id="auth-login-email" required placeholder="tenban@gmail.com" 
                 class="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-orange-500 transition-colors">
        </div>

        <div class="space-y-1">
          <div class="flex items-center justify-between">
            <label for="auth-login-pass" class="block text-[11px] font-medium text-zinc-400">Mật khẩu</label>
            <button type="button" onclick="const el = document.getElementById('auth-login-pass'); el.type = el.type === 'password' ? 'text' : 'password';" class="text-[10px] text-zinc-500 hover:text-zinc-300">Hiện/Ẩn</button>
          </div>
          <input type="password" id="auth-login-pass" required placeholder="••••••••" minlength="6"
                 class="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-orange-500 transition-colors">
        </div>

        <div class="flex items-center justify-between text-[11px] text-zinc-400 pt-1">
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" id="auth-login-remember" checked class="rounded bg-zinc-900 border-zinc-700 text-orange-500 focus:ring-0">
            <span>Ghi nhớ đăng nhập</span>
          </label>
        </div>

        <button type="submit" class="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold transition-all shadow-lg shadow-orange-600/20 active:scale-[0.99]">
          Đăng nhập an toàn
        </button>
      </form>

      <!-- 2. REGISTER FORM -->
      <form id="auth-register-form" class="space-y-3.5 hidden">
        <div class="space-y-1">
          <label for="auth-reg-name" class="block text-[11px] font-medium text-zinc-400">Họ và tên khách hàng</label>
          <input type="text" id="auth-reg-name" required placeholder="Nguyễn Văn A" 
                 class="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-orange-500 transition-colors">
        </div>

        <div class="space-y-1">
          <label for="auth-reg-phone" class="block text-[11px] font-medium text-zinc-400">Số điện thoại nhận hàng</label>
          <input type="tel" id="auth-reg-phone" required placeholder="0912 345 678" 
                 class="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-orange-500 transition-colors">
        </div>

        <div class="space-y-1">
          <label for="auth-reg-email" class="block text-[11px] font-medium text-zinc-400">Email xác thực</label>
          <input type="email" id="auth-reg-email" required placeholder="email@gmail.com" 
                 class="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-orange-500 transition-colors">
        </div>

        <div class="space-y-1">
          <div class="flex items-center justify-between">
            <label for="auth-reg-pass" class="block text-[11px] font-medium text-zinc-400">Mật khẩu (tối thiểu 6 ký tự)</label>
            <button type="button" onclick="const el = document.getElementById('auth-reg-pass'); el.type = el.type === 'password' ? 'text' : 'password';" class="text-[10px] text-zinc-500 hover:text-zinc-300">Hiện/Ẩn</button>
          </div>
          <input type="password" id="auth-reg-pass" required minlength="6" placeholder="••••••••" 
                 class="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-orange-500 transition-colors">
        </div>

        <button type="submit" class="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold transition-all shadow-lg shadow-orange-600/20 active:scale-[0.99]">
          Tạo tài khoản &amp; Nhận mã kích hoạt
        </button>
      </form>

      <!-- 3. FORGOT PASSWORD FORM -->
      <form id="auth-forgot-form" class="space-y-4 hidden">
        <div class="space-y-1">
          <label for="auth-forgot-email" class="block text-[11px] font-medium text-zinc-400">Email tài khoản cần khôi phục</label>
          <input type="email" id="auth-forgot-email" required placeholder="email@gmail.com" 
                 class="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-orange-500 transition-colors">
        </div>

        <button type="submit" class="w-full py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold transition-all">
          Gửi liên kết đặt lại mật khẩu
        </button>
      </form>

      <div class="mt-6 pt-4 border-t border-zinc-800 text-center text-[11px] text-zinc-500 font-mono">
        <i class="fa-solid fa-lock text-[10px] text-emerald-400 mr-1"></i> Supabase GoTrue Auth • Mã hóa TLS 256-bit
      </div>
    </div>
  </div>

  <!-- =========================================================================
       CUSTOMER PORTAL MODAL (TÀI KHOẢN CỦA TÔI & THEO DÕI TIẾN ĐỘ IN 3D)
       ========================================================================= -->
  <div id="account-modal" class="fixed inset-0 z-[140] hidden items-center justify-center p-4 bg-black/75 backdrop-blur-md" role="dialog" aria-modal="true" aria-labelledby="account-modal-title">
    <div class="w-full max-w-2xl bg-[#16161A] border border-[rgba(255,255,255,0.08)] rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 relative text-[#F4F4F5] max-h-[90vh] flex flex-col">
      
      <!-- Close button -->
      <button type="button" id="account-modal-close-btn" class="absolute top-5 right-5 w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition-colors" aria-label="Đóng trang cá nhân">
        <i class="fa-solid fa-xmark text-sm"></i>
      </button>

      <!-- Header -->
      <div class="flex items-center gap-3.5 pb-4 border-b border-zinc-800 shrink-0">
        <div class="w-11 h-11 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-500 text-lg shadow-sm">
          <i class="fa-solid fa-user-gear"></i>
        </div>
        <div>
          <h2 id="account-modal-title" class="text-base font-bold text-white">Tài khoản của tôi</h2>
          <p class="text-xs text-zinc-400">Theo dõi đơn hàng in 3D &amp; cập nhật thông tin cá nhân</p>
        </div>
      </div>

      <!-- Account Tabs -->
      <div class="flex items-center gap-2 py-3 border-b border-zinc-800/80 shrink-0 overflow-x-auto text-xs">
        <button type="button" data-account-tab="orders" class="px-3.5 py-1.5 rounded-xl border border-orange-500/40 bg-orange-500/10 text-orange-400 font-medium transition-colors flex items-center gap-1.5">
          <i class="fa-solid fa-clock-rotate-left text-xs"></i>
          <span>Đơn hàng của tôi</span>
        </button>
        <button type="button" data-account-tab="profile" class="px-3.5 py-1.5 rounded-xl border border-transparent text-zinc-400 hover:text-zinc-200 transition-colors flex items-center gap-1.5">
          <i class="fa-regular fa-id-card text-xs"></i>
          <span>Hồ sơ nhận hàng</span>
        </button>
        <button type="button" data-account-tab="security" class="px-3.5 py-1.5 rounded-xl border border-transparent text-zinc-400 hover:text-zinc-200 transition-colors flex items-center gap-1.5">
          <i class="fa-solid fa-shield-halved text-xs"></i>
          <span>Bảo mật</span>
        </button>
      </div>

      <!-- Tab Contents (Scrollable) -->
      <div class="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
        
        <!-- SECTION 1: ORDERS & 3D TRACKER -->
        <div id="account-sec-orders" class="space-y-3">
          <div id="account-orders-list" class="space-y-3">
            <!-- Populated dynamically by account-manager.js -->
          </div>
        </div>

        <!-- SECTION 2: PROFILE FORM -->
        <div id="account-sec-profile" class="hidden space-y-4">
          <div class="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3">
            <h3 class="text-xs font-bold text-white uppercase tracking-wider">Thông tin giao hàng mặc định</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label class="block text-zinc-400 text-[11px] mb-1">Họ và tên</label>
                <input type="text" id="profile-name" class="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none">
              </div>
              <div>
                <label class="block text-zinc-400 text-[11px] mb-1">Số điện thoại</label>
                <input type="tel" id="profile-phone" class="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none">
              </div>
            </div>
            <div>
              <label class="block text-zinc-400 text-[11px] mb-1">Địa chỉ nhận hàng chi tiết</label>
              <textarea id="profile-address" rows="2" class="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none text-xs"></textarea>
            </div>
            <button type="button" class="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold transition-colors">
              Lưu thay đổi hồ sơ
            </button>
          </div>
        </div>

        <!-- SECTION 3: SECURITY & LOGOUT -->
        <div id="account-sec-security" class="hidden space-y-4">
          <div class="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3">
            <h3 class="text-xs font-bold text-white uppercase tracking-wider">Đổi mật khẩu tài khoản</h3>
            <div class="space-y-3 text-xs">
              <div>
                <label class="block text-zinc-400 text-[11px] mb-1">Mật khẩu mới (tối thiểu 6 ký tự)</label>
                <input type="password" id="security-new-pass" minlength="6" class="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none">
              </div>
              <button type="button" class="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold transition-colors">
                Cập nhật mật khẩu
              </button>
            </div>
          </div>

          <div class="pt-2">
            <button type="button" id="account-logout-btn" class="w-full py-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold transition-colors flex items-center justify-center gap-2">
              <i class="fa-solid fa-arrow-right-from-bracket"></i>
              <span>Đăng xuất khỏi tài khoản</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  </div>
'''

    if '</body>' in content and 'id="auth-modal"' not in content:
        content = content.replace('</body>', auth_modal_html + '\n</body>', 1)

    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print("index.html successfully updated.")

def patch_admin():
    path = ROOT / "admin.html"
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Add Supabase scripts to admin.html
    admin_scripts_target = '  <script type="module" src="js/firebase-init.js?v=1.0"></script>'
    admin_scripts_insert = '''  <!-- Supabase Cloud PostgreSQL 15+ & Auth Engine -->
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  <script src="js/supabase-client.js?v=5.0"></script>

  <script type="module" src="js/firebase-init.js?v=1.0"></script>'''

    if admin_scripts_target in content and 'js/supabase-client.js' not in content:
        content = content.replace(admin_scripts_target, admin_scripts_insert, 1)

    # 2. Replace PIN Lock Screen with Supabase Admin Login Form
    old_lock_screen = '''  <!-- =========================================================================
       1. SECURITY LOCK SCREEN (PIN PROTECTION: 2026)
       ========================================================================= -->
  <div id="admin-lock-screen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0C0C0E]/95 backdrop-blur-xl">
    <div class="w-full max-w-sm p-6 rounded-2xl admin-card border border-[rgba(255,255,255,0.07)] text-center space-y-6 shadow-2xl bg-[#16161A]">
      <div class="w-14 h-14 mx-auto rounded-xl bg-[rgba(255,92,0,0.1)] border border-[#FF5C00]/30 flex items-center justify-center text-[#FF5C00] text-xl shadow-sm">
        <i class="fa-solid fa-shield-halved"></i>
      </div>

      <div class="space-y-1.5">
        <h1 class="text-base font-bold text-[#F4F4F5] tracking-tight">T&amp;T 3D Labs Studio OS</h1>
        <p class="text-xs text-[#A1A1AA]">Nhập mã PIN quản trị xưởng để tiếp tục</p>
      </div>

      <form id="pin-form" class="space-y-4">
        <div>
          <input type="password" id="admin-pin-input" maxlength="6" autofocus placeholder="••••" 
                 class="w-full px-4 py-2.5 rounded-xl admin-input text-center text-lg font-mono tracking-widest text-[#F4F4F5] focus:outline-none">
          <p id="pin-error" class="text-[#F43F5E] text-xs mt-2 hidden">Mã PIN không chính xác. Mặc định là 2026.</p>
        </div>

        <button type="submit" class="w-full py-2.5 rounded-xl btn-orange-primary text-xs font-semibold">
          Xác thực truy cập
        </button>
      </form>

      <div class="text-[11px] text-[#71717A] font-mono flex items-center justify-center gap-2">
        <span class="status-dot-6 bg-[#10B981]"></span>
        <span>Bảo mật nội bộ • Cổng Admin T&amp;T 3D Labs</span>
      </div>
    </div>
  </div>'''

    new_lock_screen = '''  <!-- =========================================================================
       1. SECURITY RBAC LOGIN SCREEN (SUPABASE POSTGRESQL 15 AUTH)
       ========================================================================= -->
  <div id="admin-lock-screen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0C0C0E]/95 backdrop-blur-xl">
    <div class="w-full max-w-sm p-6 rounded-2xl admin-card border border-[rgba(255,255,255,0.07)] text-center space-y-6 shadow-2xl bg-[#16161A]">
      <div class="w-14 h-14 mx-auto rounded-xl bg-[rgba(255,92,0,0.1)] border border-[#FF5C00]/30 flex items-center justify-center text-[#FF5C00] text-xl shadow-sm">
        <i class="fa-solid fa-user-shield"></i>
      </div>

      <div class="space-y-1.5">
        <h1 class="text-base font-bold text-[#F4F4F5] tracking-tight">T&amp;T 3D Labs Studio OS</h1>
        <p class="text-xs text-[#A1A1AA]">Cổng Quản Trị Hệ Thống (RBAC Backend Auth)</p>
      </div>

      <form id="admin-login-form" class="space-y-4 text-left">
        <div>
          <label for="admin-email-input" class="block text-[11px] font-medium text-zinc-400 mb-1">Email Quản trị viên</label>
          <input type="email" id="admin-email-input" required autofocus placeholder="admin@tt3dlabs.vn" 
                 class="w-full px-3.5 py-2.5 rounded-xl admin-input text-xs text-[#F4F4F5] focus:outline-none">
        </div>

        <div>
          <label for="admin-password-input" class="block text-[11px] font-medium text-zinc-400 mb-1">Mật khẩu xác thực</label>
          <input type="password" id="admin-password-input" required placeholder="••••••••" 
                 class="w-full px-3.5 py-2.5 rounded-xl admin-input text-xs text-[#F4F4F5] focus:outline-none">
        </div>

        <p id="admin-login-error" class="text-[#F43F5E] text-xs hidden p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-center"></p>

        <button type="submit" class="w-full py-2.5 rounded-xl btn-orange-primary text-xs font-semibold">
          Đăng nhập Quản trị viên
        </button>
      </form>

      <div class="text-[11px] text-[#71717A] font-mono flex items-center justify-center gap-2">
        <span class="status-dot-6 bg-[#10B981]"></span>
        <span>Phân quyền Backend • Supabase PostgreSQL RLS</span>
      </div>
    </div>
  </div>'''

    if old_lock_screen in content:
        content = content.replace(old_lock_screen, new_lock_screen, 1)

    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print("admin.html successfully updated.")

if __name__ == "__main__":
    patch_index()
    patch_admin()
