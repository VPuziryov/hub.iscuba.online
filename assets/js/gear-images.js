/* Source permissions are independent from affiliate-link approval. No CDN is
   trusted by default: populate image-sources.json from an approved official feed. */
(function () {
  'use strict';
  function localAsset(src) {
    return typeof src === 'string' && /^\/assets\/img\/gear\/[a-z0-9-]+\.(svg|webp|png|jpg)$/.test(src);
  }
  function evidence(value) { return typeof value === 'string' && value.trim().length > 0; }
  function httpsURL(src) {
    if (typeof src !== 'string' || !src.startsWith('https://') || src.includes('\\')) return null;
    try {
      const u = new URL(src);
      if (u.protocol !== 'https:' || u.username || u.password || u.hash) return null;
      // Match decoded paths without accepting encoded separators/double encoding.
      if (/%2f|%5c/i.test(u.pathname)) return null;
      const path = decodeURIComponent(u.pathname);
      if (path.includes('%') || path.includes('\\') || path.split('/').some(p => p === '.' || p === '..')) return null;
      return { url: u, path };
    } catch (_) { return null; }
  }
  function resolve(image, policy, locale) {
    if (image?.rights_confirmed !== true || !evidence(image.rights_evidence)) return null;
    if (localAsset(image.src)) return { src: image.src, external: false };
    const target = httpsURL(image.src);
    if (!target || !evidence(image.source_id) || !evidence(image.feed_item_id)
      || policy?.schema_version !== 1 || !Array.isArray(policy.sources)) return null;
    const source = policy.sources.find(s => s && s.source_id === image.source_id);
    if (!source || source.approval_status !== 'approved'
      || !['tradeinn', 'daisycon'].includes(source.provider) || !evidence(source.rights_evidence)
      || !Array.isArray(source.permitted_sites) || !source.permitted_sites.includes('hub.iscuba.online')
      || !Array.isArray(source.permitted_locales) || !source.permitted_locales.includes(locale) || !Array.isArray(source.image_rules)) return null;
    const allowed = source.image_rules.some(rule => {
      const origin = httpsURL(rule?.origin);
      return origin && origin.url.href === origin.url.origin + '/'
        && origin.url.origin === target.url.origin
        && typeof rule.path_prefix === 'string' && rule.path_prefix.startsWith('/')
        && rule.path_prefix.endsWith('/') && !/[%\\?#]/.test(rule.path_prefix)
        && !rule.path_prefix.split('/').some(p => p === '.' || p === '..')
        && target.path.startsWith(rule.path_prefix);
    });
    return allowed ? { src: target.url.href, external: true } : null;
  }
  window.GearImages = Object.freeze({ resolve, localAsset });
})();
