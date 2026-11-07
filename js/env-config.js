/**
 * T&T 3D STUDIO - ENVIRONMENT CONFIGURATION (STATIC BUILD-TIME)
 * =========================================================================
 * Build-time immutable configuration. URL (?env=...) cannot override this.
 * Target: PRODUCTION (https://nbsumfhfxohawiuxrwqj.supabase.co)
 * Generated At: 2026-11-01T07:21:43.919Z
 * =========================================================================
 */

(function (window) {
  'use strict';

  var ENV_CONFIG = {
    ENV_NAME: 'production',
    SUPABASE_URL: 'https://nbsumfhfxohawiuxrwqj.supabase.co',
    SUPABASE_ANON_KEY: 'sb_publishable_axTex7YiB0DOBquiWFtR-g_L-0q8n5e',
    IS_STAGING: false,
    BUILD_TIMESTAMP: '2026-11-01T07:21:43.920Z',
    VERSION: '5.2.0-prod'
  };

  if (typeof Object.freeze === 'function') {
    Object.freeze(ENV_CONFIG);
  }

  if (typeof window !== 'undefined') {
    window.TT_ENV = ENV_CONFIG;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ENV_CONFIG;
  }
})(typeof window !== 'undefined' ? window : this);
