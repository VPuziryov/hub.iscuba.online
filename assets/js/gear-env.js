/* Preview access is tied to the actual hostname, never to a query flag alone. */
(function () {
  'use strict';
  const host = location.hostname;
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(host);
  const netlify = /^deploy-preview-\d+--hubiscubaonline\.netlify\.app$/.test(host);
  const preview = netlify || (local && new URLSearchParams(location.search).get('gear_preview') === '1');
  window.GearEnvironment = Object.freeze({ preview, local, netlify });
  // Review traffic must not pollute production Pixel audiences. The existing
  // script itself stays unchanged and is loaded once on ordinary/public pages.
  if (!preview) {
    const pixel = document.createElement('script');
    pixel.src = '/assets/js/pixel.js';
    pixel.async = false;
    document.head.append(pixel);
  }
})();
