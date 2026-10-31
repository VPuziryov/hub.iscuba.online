(function () {
  'use strict';
  const VERSION = '1';
  const categories = ['safari', 'comfort50', 'kids', 'safety'];
  const locale = document.documentElement.lang;
  // Deliberately unavailable on production, deploy previews and arbitrary hosts.
  // Query parameters alone can never expose candidates on the live site.
  const preview = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname)
    && new URLSearchParams(location.search).get('gear_preview') === '1';
  const grid = document.getElementById('gear-grid');
  const state = document.getElementById('gear-state');
  const filters = document.getElementById('gear-filters');
  const back = document.querySelector('[data-gear-back]');
  if (!grid || !state || !filters) return;
  // Preserve exact query and hash on internal navigation. Neither is forwarded
  // to merchants or appended to a network-issued tracking URL.
  if (back) back.href = '/' + locale + '/' + location.search + location.hash;
  function node(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined) el.textContent = text;
    return el;
  }
  async function json(path) {
    const response = await fetch('/assets/data/gear/' + path + '?v=' + VERSION);
    if (!response.ok) throw new Error('Gear data unavailable');
    return response.json();
  }
  function editorialReady(product, t) {
    const copy = t.products?.[product.product_id];
    return window.GearLinks.approvedProduct(product) && copy && copy.purpose
      && Array.isArray(copy.advantages) && copy.advantages.length > 0
      && Array.isArray(copy.limitations) && copy.limitations.length > 0;
  }
  function card(product, offers, t, demo) {
    const el = node('article', 'card gear-card');
    el.id = (demo ? 'demo-' : '') + product.product_id;
    el.dataset.productId = product.product_id;
    if (demo) el.append(node('p', 'gear-badge', t.demoTitle));
    const image = product.image;
    if (image?.rights_confirmed === true && image.src?.startsWith('/assets/img/gear/')
      && !image.src.includes('..') && image.rights_evidence) {
      const img = node('img', 'gear-image');
      img.src = image.src; img.alt = image.alt?.[locale] || product.title;
      img.width = 560; img.height = 320; img.loading = 'lazy';
      el.append(img);
    } else {
      const placeholder = node('div', 'gear-placeholder');
      placeholder.append(node('span', 'gear-placeholder-shape'), node('span', '', t.imagePending));
      placeholder.firstChild.setAttribute('aria-hidden', 'true');
      el.append(placeholder);
    }
    el.append(node('h3', '', product.title));
    const copy = t.products?.[product.product_id];
    for (const key of ['purpose', 'advantages', 'limitations']) {
      const section = node('div', 'gear-field');
      section.append(node('h4', '', t[key]));
      const value = copy?.[key];
      if (Array.isArray(value) && value.length) {
        const list = node('ul'); value.forEach(item => list.append(node('li', '', item))); section.append(list);
      } else section.append(node('p', '', typeof value === 'string' && value ? value : t.pendingReview));
      el.append(section);
    }
    const exp = node('div', 'gear-field');
    exp.append(node('h4', '', t.experience), node('p', '', product.personally_tested === true
      ? t.experienceYes : product.personally_tested === false ? t.experienceNo : t.experienceUnknown));
    el.append(exp);
    const offer = demo || !t.activeDisclosure ? null : window.GearLinks.resolveOffer(product, offers, locale);
    const action = node('div', 'gear-action');
    if (offer) {
      const link = node('a', 'btn', t.viewAt + ' ' + offer.merchant);
      link.href = offer.url; link.target = '_blank'; link.rel = 'sponsored noopener';
      link.addEventListener('click', () => window.GearLinks.trackClick(product, offer, locale, 'card'));
      action.append(link, node('p', 'gear-link-note', t.affiliate));
    } else {
      const button = node('button', 'btn', t.unavailable);
      button.type = 'button'; button.disabled = true;
      action.append(button, node('p', 'gear-link-note', t.approvalPending));
    }
    el.append(action);
    return el;
  }
  Promise.all([json('products.json'), json('offers.json'), json('i18n/' + locale + '.json')])
    .then(([catalog, merchants, t]) => {
      if (catalog.schema_version !== 1 || merchants.schema_version !== 1
        || !Array.isArray(catalog.products) || !Array.isArray(merchants.offers)) throw new Error('Invalid Gear schema');
      const products = catalog.products.filter(p => editorialReady(p, t));
      let active = 'all';
      const buttons = [];
      function render() {
        grid.replaceChildren(...products.filter(p => active === 'all' || p.categories.includes(active))
          .map(p => card(p, merchants.offers, t, false)));
        buttons.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.category === active)));
        // Native product/category anchors remain usable after asynchronous data load.
        const anchor = document.getElementById(location.hash.slice(1));
        if (anchor && grid.contains(anchor)) anchor.scrollIntoView({ block: 'start' });
      }
      const available = categories.filter(category => products.some(p => p.categories.includes(category)));
      if (available.length) {
        ['all', ...available].forEach(category => {
          const button = node('button', 'gear-filter', t[category]);
          button.type = 'button'; button.dataset.category = category;
          button.addEventListener('click', () => { active = category; render(); });
          buttons.push(button); filters.append(button);
        });
        filters.hidden = false;
      }
      state.hidden = products.length > 0;
      render();
      // Candidates never populate the real filters, including in the preview.
      if (preview) {
        document.getElementById('gear-preview').hidden = false;
        const demoProducts = catalog.products.filter(p => p.status === 'candidate');
        if (demoProducts.length) {
          document.getElementById('gear-demo').hidden = false;
          document.getElementById('gear-demo-grid').replaceChildren(...demoProducts.map(p => card(p, [], t, true)));
        }
      }
      if (products.some(p => window.GearLinks.resolveOffer(p, merchants.offers, locale))) {
        // The detailed, approved programme disclosure must be supplied per locale
        // before activation; absence is additionally checked by the validator.
        document.getElementById('gear-disclosure').textContent = t.activeDisclosure || t.disclosure;
      }
      document.body.dataset.gearReady = 'true';
    }).catch(() => {
      grid.replaceChildren(); filters.replaceChildren(); filters.hidden = true;
      state.hidden = false;
      state.textContent = state.dataset.error;
      document.body.dataset.gearReady = 'error';
    });
})();
