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
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ic3VtZmhmeG9oYXdpdXhyd3FqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM0Njk4NzAsImV4cCI6MjEwOTA0NTg3MH0.fptFtIhcY90mm_Oj4FoxzI6ZPpkf9du876UMMXj14Io',
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
