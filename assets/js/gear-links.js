/* No tracking URL is generated here. Store only network-issued, verified URLs. */
(function () {
  'use strict';
  const SITE = 'hub.iscuba.online';
  function httpsURL(value) {
    try {
      const url = new URL(value);
      return url.protocol === 'https:' && !url.username && !url.password ? url.href : null;
    } catch (_) { return null; }
  }
  function approvedProduct(product) {
    return product.status === 'approved' && Boolean(product.approved_by && product.approved_at && product.last_verified)
      && typeof product.personally_tested === 'boolean';
  }
  function resolveOffer(product, offers, locale) {
    if (!approvedProduct(product)) return null;
    // Fail closed: a language is not proof of the visitor's country. Restricted
    // country programmes require a separately approved implementation.
    for (const offer of offers) {
      if (offer.product_id !== product.product_id || offer.approval_status !== 'approved'
        || !offer.approval_evidence || !offer.network || !offer.campaign
        || !offer.permitted_locales?.includes(locale) || !offer.permitted_sites?.includes(SITE)
        || offer.country_scope !== 'unrestricted') continue;
      const link = offer.links_by_locale?.[locale] || offer;
      const url = httpsURL(link.affiliate_url);
      if (url && typeof link.sub_id === 'string' && link.sub_id.trim()) {
        return { url, merchant: offer.merchant, sub_id: link.sub_id, offer_id: offer.offer_id };
      }
    }
    return null;
  }
  function trackClick(product, offer, locale, placement) {
    if (!offer || typeof window.fbq !== 'function') return;
    const params = { product_id: product.product_id, merchant: offer.merchant,
      locale, placement, sub_id: offer.sub_id };
    try {
      window.fbq('trackCustom', 'Gear_Product_Click', params);
      window.fbq('trackCustom', 'Gear_Affiliate_Click', params);
    } catch (_) { /* Tracking must never prevent navigation. */ }
  }
  window.GearLinks = Object.freeze({ approvedProduct, resolveOffer, trackClick, httpsURL });
})();
