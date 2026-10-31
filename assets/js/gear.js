(function () {
  'use strict';
  const VERSION = '3';
  const categories = ['safari', 'comfort50', 'kids', 'safety'];
  const locale = document.documentElement.lang;
  const preview = window.GearEnvironment?.preview === true;
  const state = document.getElementById('gear-state');
  const filters = document.getElementById('gear-filters');
  const sectionIds = ['instructor', 'color'];
  const back = document.querySelector('[data-gear-back]');
  if (!state || !filters) return;
  if (back) back.href = '/' + locale + '/' + location.search + location.hash;
  let palette = 'teal';
  function node(tag, cls, text) {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    if (text !== undefined) el.textContent = text;
    return el;
  }
  async function json(path) {
    const r = await fetch('/assets/data/gear/' + path + '?v=' + VERSION);
    if (!r.ok) throw new Error('Gear data unavailable');
    return r.json();
  }
  function editorialReady(p, t) {
    const copy = t.products?.[p.product_id];
    return t.editorial_status === 'approved' && copy?.status === 'approved'
      && window.GearLinks.approvedProduct(p) && copy.purpose
      && copy.advantages?.length > 0 && copy.limitations?.length > 0;
  }
  function localAsset(src) {
    return typeof src === 'string' && /^\/assets\/img\/gear\/[a-z0-9-]+\.(svg|webp|png|jpg)$/.test(src);
  }
  function illustration(p, t) {
    const fig = node('figure', 'gear-figure');
    let src;
    let real = false;
    if (p.image?.rights_confirmed === true && p.image.rights_evidence && localAsset(p.image.src)) {
      src = p.image.src; real = true;
    } else src = p.artwork?.palette_variants?.[palette] || p.artwork?.src;
    if (localAsset(src)) {
      const img = node('img', 'gear-art');
      img.src = src; img.alt = real ? (p.image.alt?.[locale] || p.title) : t.artLabel;
      img.width = 520; img.height = 320; img.loading = 'lazy';
      if (!real && p.artwork?.palette_variants) img.dataset.paletteProduct = p.product_id;
      fig.append(img);
      if (!real) fig.append(node('figcaption', '', t.artLabel));
    } else fig.append(node('p', 'gear-no-art', t.imagePending));
    return fig;
  }
  function safeSource(url) {
    const href = window.GearLinks.httpsURL(url);
    if (!href) return null;
    // Only the explicit researched manufacturers are clickable references.
    const host = new URL(href).hostname;
    return ['www.hollis.com', 'scubapro.johnsonoutdoors.com'].includes(host) ? href : null;
  }
  function card(p, offers, ui, content, draft) {
    const copy = content.products[p.product_id];
    const el = node('article', 'card gear-card');
    el.id = p.product_id; el.dataset.productId = p.product_id;
    if (content.content_locale !== locale) el.lang = content.content_locale;
    el.append(illustration(p, ui));
    const body = node('div', 'gear-card-body');
    const top = node('div', 'gear-card-top');
    top.append(node('p', 'gear-kicker', copy.kicker));
    if (draft) top.append(node('span', 'gear-draft', ui.draft));
    body.append(top, node('h3', '', p.title), node('p', 'gear-purpose', copy.purpose));
    const facts = node('ul', 'gear-specs');
    (copy.facts || []).forEach(f => facts.append(node('li', '', f)));
    body.append(facts);
    for (const [key, label] of [['advantages', 'why'], ['limitations', 'limits']]) {
      const field = node('div', 'gear-field gear-' + key);
      field.append(node('h4', '', ui[label]));
      copy[key].forEach(text => field.append(node('p', '', text)));
      body.append(field);
    }
    const exp = node('div', 'gear-experience');
    exp.append(node('h4', '', ui.basis), node('p', '', copy.experience)); body.append(exp);
    if (copy.accessory) {
      const accessory = node('details', 'gear-accessory');
      accessory.append(node('summary', '', copy.accessoryTitle), node('p', '', copy.accessory));
      if (copy.story) accessory.append(node('p', 'gear-story', copy.story));
      body.append(accessory);
    }
    if (preview) {
      const sources = node('details', 'gear-sources');
      sources.append(node('summary', '', ui.sourceTitle));
      const all = [p, ...(p.components || [])];
      for (const item of all) {
        const row = node('div', 'gear-source');
        row.append(node('p', '', item.title));
        const url = safeSource(item.manufacturer_url);
        if (url) {
          const link = node('a', '', ui.manufacturer + ' ↗');
          link.href = url; link.target = '_blank'; link.rel = 'noopener'; row.append(link);
        }
        // Provenance only: no active store CTA before programme approval.
        row.append(node('span', 'gear-source-label', ui.listing), node('code', '', item.source_url));
        sources.append(row);
      }
      sources.append(node('p', 'gear-stock', ui.stock)); body.append(sources);
    }
    const offer = draft || !ui.activeDisclosure ? null : window.GearLinks.resolveOffer(p, offers, locale);
    const action = node('div', 'gear-action');
    if (offer) {
      const link = node('a', 'btn', ui.viewAt + ' ' + offer.merchant);
      link.href = offer.url; link.target = '_blank'; link.rel = 'sponsored noopener';
      link.addEventListener('click', () => window.GearLinks.trackClick(p, offer, locale, 'card'));
      action.append(link, node('p', 'gear-link-note', ui.affiliate));
    } else {
      const button = node('button', 'btn', ui.unavailable); button.type = 'button'; button.disabled = true;
      action.append(button, node('p', 'gear-link-note', ui.approvalPending));
    }
    body.append(action); el.append(body); return el;
  }
  Promise.all([json('products.json'), json('offers.json'), json('i18n/' + locale + '.json')])
    .then(async ([catalog, merchants, ui]) => {
      if (catalog.schema_version !== 1 || merchants.schema_version !== 1
        || !Array.isArray(catalog.products) || !Array.isArray(merchants.offers)) throw new Error('Invalid Gear schema');
      const content = ui.content_fallback ? await json('i18n/' + ui.content_fallback + '.json') : ui;
      // Fallback translations are visible only as preview drafts, never approved copy.
      const publicProducts = ui.content_fallback ? [] : catalog.products.filter(p => editorialReady(p, ui));
      const products = preview ? catalog.products.filter(p => ['candidate', 'approved'].includes(p.status)
        && content.products?.[p.product_id]?.advantages?.length && content.products[p.product_id].limitations?.length)
        : publicProducts;
      let active = 'all';
      const filterButtons = [];
      function render() {
        for (const id of sectionIds) {
          const selected = products.filter(p => p.collection === id && (active === 'all' || p.categories.includes(active)));
          document.getElementById('gear-' + id + '-grid').replaceChildren(...selected.map(p =>
            card(p, merchants.offers, ui, content, preview || p.status !== 'approved')));
          document.getElementById(id).hidden = selected.length === 0;
        }
        filterButtons.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.category === active)));
      }
      const available = categories.filter(cat => products.some(p => p.categories.includes(cat)));
      if (available.length) {
        ['all', ...available].forEach(category => {
          const button = node('button', 'gear-filter', ui[category]);
          button.type = 'button'; button.dataset.category = category;
          button.addEventListener('click', () => { active = category; render(); });
          filterButtons.push(button); filters.append(button);
        });
        filters.hidden = false;
      }
      const hasInstructor = products.some(p => p.collection === 'instructor');
      const hasColor = products.some(p => p.collection === 'color');
      document.getElementById('gear-entry-instructor').hidden = !hasInstructor;
      document.getElementById('gear-entry-color').hidden = !hasColor;
      document.getElementById('gear-entries').hidden = !products.length;
      document.getElementById('gear-palette').hidden = !hasColor;
      state.hidden = products.length > 0;
      if (preview) {
        document.getElementById('gear-preview').hidden = false;
        document.getElementById('gear-translation').hidden = false;
      }
      document.querySelectorAll('[data-palette]').forEach(button => button.addEventListener('click', () => {
        palette = button.dataset.palette;
        document.querySelectorAll('[data-palette]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
        document.querySelectorAll('[data-palette-product]').forEach(img => {
          const product = products.find(p => p.product_id === img.dataset.paletteProduct);
          const src = product?.artwork?.palette_variants?.[palette];
          if (localAsset(src)) img.src = src;
        });
        document.getElementById('gear-hero-art').src = '/assets/img/gear/hero-' + palette + '.svg?v=3';
      }));
      render();
      if (!preview && publicProducts.some(p => window.GearLinks.resolveOffer(p, merchants.offers, locale)) && ui.activeDisclosure)
        document.getElementById('gear-disclosure').textContent = ui.activeDisclosure;
      document.body.dataset.gearReady = 'true';
      const anchor = document.getElementById(location.hash.slice(1));
      if (anchor && !anchor.hidden) anchor.scrollIntoView({block:'start'});
    }).catch(() => {
      sectionIds.forEach(id => { document.getElementById(id).hidden = true;
        document.getElementById('gear-' + id + '-grid').replaceChildren(); });
      filters.hidden = true;
      document.getElementById('gear-entries').hidden = true;
      document.getElementById('gear-palette').hidden = true;
      state.hidden = false; state.textContent = state.dataset.error;
      document.body.dataset.gearReady = 'error';
    });
})();
