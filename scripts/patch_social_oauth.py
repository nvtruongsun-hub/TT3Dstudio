import sys
from pathlib import Path

ROOT = Path('.')

def patch_index():
    path = ROOT / 'index.html'
    content = path.read_text(encoding='utf-8')
    target = '      <!-- 1. LOGIN FORM -->'
    social_block = '''      <!-- Social OAuth Buttons (Google / Gmail & Facebook) -->
      <div id="auth-social-container" class="space-y-2.5 mb-5">
        <button type="button" id="auth-btn-google" class="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-zinc-100 text-zinc-900 text-xs font-semibold flex items-center justify-center gap-3 transition-all shadow-sm active:scale-[0.99] border border-zinc-200">
          <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          <span>Tiếp tục với Google</span>
        </button>

        <button type="button" id="auth-btn-facebook" class="w-full py-2.5 px-4 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] text-white text-xs font-semibold flex items-center justify-center gap-3 transition-all shadow-sm active:scale-[0.99]">
          <i class="fa-brands fa-facebook text-sm"></i>
          <span>Tiếp tục với Facebook</span>
        </button>

        <div class="relative flex items-center justify-center pt-2">
          <div class="border-t border-zinc-800 w-full"></div>
          <span class="bg-[#16161A] px-3 text-[10px] text-zinc-500 uppercase tracking-wider absolute">hoặc email</span>
        </div>
      </div>\n\n'''
    if target in content and 'id="auth-btn-google"' not in content:
        content = content.replace(target, social_block + target, 1)
        path.write_text(content, encoding='utf-8')
        print('Patched index.html with social buttons.')
    else:
        print('index.html already has social buttons or target not found.')

def patch_account_manager():
    path = ROOT / 'js' / 'account-manager.js'
    content = path.read_text(encoding='utf-8')

    # Add OAuth listeners in bindEvents
    target = '      // Bind Login Form'
    oauth_listeners = '''      // Social OAuth Buttons (Google & Facebook)
      const btnGoogle = document.getElementById('auth-btn-google');
      if (btnGoogle) {
        btnGoogle.addEventListener('click', async () => {
          if (window.TTSupabase && typeof window.TTSupabase.signInWithOAuth === 'function') {
            const res = await window.TTSupabase.signInWithOAuth('google');
            if (!res.ok) {
              const errBox = document.getElementById('auth-error-alert');
              if (errBox) {
                errBox.textContent = res.error;
                errBox.classList.remove('hidden');
              }
            } else if (res.user) {
              this.closeAuthModal();
              if (window.showToast) window.showToast('Đăng nhập Google thành công!', 'success');
              if (this.pendingIntent === 'checkout' && window.TTCheckout) {
                const cart = (window.TTCart && window.TTCart.getCart) ? window.TTCart.getCart() : [];
                window.TTCheckout.openCheckout(cart, 0, { source: 'cart' });
              }
            }
          }
        });
      }

      const btnFacebook = document.getElementById('auth-btn-facebook');
      if (btnFacebook) {
        btnFacebook.addEventListener('click', async () => {
          if (window.TTSupabase && typeof window.TTSupabase.signInWithOAuth === 'function') {
            const res = await window.TTSupabase.signInWithOAuth('facebook');
            if (!res.ok) {
              const errBox = document.getElementById('auth-error-alert');
              if (errBox) {
                errBox.textContent = res.error;
                errBox.classList.remove('hidden');
              }
            } else if (res.user) {
              this.closeAuthModal();
              if (window.showToast) window.showToast('Đăng nhập Facebook thành công!', 'success');
              if (this.pendingIntent === 'checkout' && window.TTCheckout) {
                const cart = (window.TTCart && window.TTCart.getCart) ? window.TTCart.getCart() : [];
                window.TTCheckout.openCheckout(cart, 0, { source: 'cart' });
              }
            }
          }
        });
      }\n\n'''

    if target in content and 'auth-btn-google' not in content:
        content = content.replace(target, oauth_listeners + target, 1)

    # In switchAuthTab, hide social container when tab is 'forgot'
    tab_target = '      // Clear alerts'
    tab_patch = '''      const socialBox = document.getElementById('auth-social-container');
      if (socialBox) {
        if (tab === 'forgot') socialBox.classList.add('hidden');
        else socialBox.classList.remove('hidden');
      }\n\n      // Clear alerts'''

    if tab_target in content and 'auth-social-container' not in content:
        content = content.replace(tab_target, tab_patch, 1)

    path.write_text(content, encoding='utf-8')
    print('Patched js/account-manager.js with OAuth event listeners.')

if __name__ == '__main__':
    patch_index()
    patch_account_manager()
