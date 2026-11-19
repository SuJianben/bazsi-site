import { productById } from '../data/products.js';
import { track } from '../analytics/events.js?v=2';
import { mountSearch } from './catalog-ui.js?v=5';
import { mountCollection } from './collection-filter.js?v=1';
import { renderCart } from './cart-ui.js?v=1';
import { enableNewsletterPreview } from './newsletter-preview.js?v=1';
import './home-film-motion.js?v=2';
import './overlay-focus.js';

const asset = path => new URL(path, document.baseURI).href;

const legacyPages = new Set([
  'collections', 'collections/all', 'collections/felnott', 'collections/gyerek',
  'blog', 'blog/hatartalan', 'about', 'search', 'cart'
]);

function redirectLegacyHash() {
  const hash = location.hash.match(/^#\/([\w/-]*)$/);
  if (!hash) return;
  const route = hash[1].replace(/\/$/, '');
  const [type, id, extra] = route.split('/');
  const productRoute = type === 'products' && id && extra === undefined && productById(id);
  const destination = !route ? './' : legacyPages.has(route) || productRoute ? route + '/' : '404.html';
  location.replace(asset(destination));
}

window.addEventListener('hashchange', redirectLegacyHash);
redirectLegacyHash();
document.querySelector('.skip-link')?.addEventListener('click', event => {
  event.preventDefault();
  const main = document.querySelector('#page-frame:not(.is-previous-container) main');
  main?.focus({ preventScroll: true });
  main?.scrollIntoView();
});

function mountPage() {
  const frame = document.querySelector('#page-frame:not(.is-previous-container)');
  track('page_view');
  if (frame?.querySelector('[data-product-form]')) track('product_view');
  enableNewsletterPreview(frame);
  mountSearch(frame);
  mountCollection(frame);
  renderCart();
}

document.addEventListener('swup:visit:start', () => {
  window.app.transitions.swup.hooks.before('content:insert', () => {
    // Closing a drawer during navigation can return focus to the old page.
    if (document.activeElement?.closest('#page-frame')) document.activeElement.blur();
  });
}, { once: true });
document.addEventListener('swup:page:view', mountPage);
document.addEventListener('swup:visit:end', () => {
  document.querySelector('#page-frame:not(.is-previous-container) main')?.focus({ preventScroll: true });
});
mountPage();

const navigation = document.querySelector('[data-navigation]');
if (navigation) {
  const trigger = navigation.querySelector('[data-toggle-menu]');
  const menu = navigation.querySelector('[data-menu]');
  const accordionHeaders = [...navigation.querySelectorAll('.accordion-header')];

  function updateMenuAccess() {
    const open = document.body.classList.contains('menu-open');
    if (!open && menu.contains(document.activeElement)) trigger.focus({ preventScroll: true });
    menu.inert = !open;
    trigger.setAttribute('aria-expanded', String(open));
    for (const item of accordionHeaders) {
      const expanded = item.classList.contains('active');
      item.setAttribute('aria-expanded', String(expanded));
      item.nextElementSibling.inert = !expanded;
    }
  }

  const observer = new MutationObserver(updateMenuAccess);
  for (const element of [document.body, ...accordionHeaders]) {
    observer.observe(element, { attributes: true, attributeFilter: ['class'] });
  }
  updateMenuAccess();
}
