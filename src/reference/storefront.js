import { addItem, getCart, removeItem } from '../app/cart.js';
import { productById } from '../data/products.js';
import { track } from '../analytics/events.js';

const normalize = value => value.toLocaleLowerCase('hu').normalize('NFD').replace(/\p{Diacritic}/gu, '');
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

function updateSearch(input) {
  const query = normalize(input.value.trim());
  const form = input.closest('form');
  let matches = 0;
  for (const result of document.querySelectorAll('[data-search-name]')) {
    const found = normalize(result.dataset.searchName).includes(query);
    result.hidden = !found;
    if (found) matches++;
  }
  form.querySelector('[data-search-status]').hidden = matches > 0;
  if (query && !form.dataset.tracked) {
    track('search_use');
    form.dataset.tracked = 'true';
  }
}

function cartLine(item, product) {
  const article = document.createElement('article');
  article.className = 'flex flex-wrap items-center gap-4 rounded-lg bg-black p-4 sm:p-8';
  const imageLink = document.createElement('a');
  imageLink.href = asset('products/' + product.id + '/');
  const image = document.createElement('img');
  image.src = asset(product.image);
  image.alt = product.name;
  image.className = 'aspect-square w-20 rounded object-cover';
  imageLink.append(image);

  const text = document.createElement('div');
  const title = document.createElement('h2');
  title.className = 'is-h6';
  title.textContent = product.name;
  const details = document.createElement('p');
  details.textContent = 'Fekete · ' + item.size + ' · ' + item.quantity + ' db';
  text.append(title, details);

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'is-tag rounded-xs border border-white px-4 py-3 hover:bg-white hover:text-black';
  button.textContent = 'Eltávolítás';
  button.dataset.removeProduct = item.id;
  button.dataset.removeSize = item.size;
  article.append(imageLink, text, button);
  return article;
}

function updateCart() {
  const items = getCart().filter(item => productById(item?.id));
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  document.querySelectorAll('header a[aria-label^="Kosár"]').forEach(link => {
    link.setAttribute('aria-label', count ? 'Kosár (' + count + ')' : 'Kosár');
  });
  const lists = document.querySelectorAll('#page-frame:not(.is-previous-container) [data-cart-list], [data-cart-preview]');
  for (const list of lists) {
    const rows = items.map(item => cartLine(item, productById(item.id)));
    if (!rows.length) {
      const message = document.createElement('p');
      message.textContent = 'A kosarad jelenleg üres.';
      rows.push(message);
    }
    list.replaceChildren(...rows);
  }
}

document.addEventListener('input', event => {
  if (event.target.matches('[data-search-form] input')) updateSearch(event.target);
});

document.addEventListener('submit', event => {
  const form = event.target;
  if (form.matches('[data-search-form]')) {
    event.preventDefault();
    updateSearch(form.elements.q);
    return;
  }
  if (!form.matches('[data-product-form]')) return;
  event.preventDefault();
  const product = productById(form.dataset.productForm);
  const size = form.elements.size.value;
  if (!product?.sizes.includes(size)) return;
  addItem(product.id, size);
  track('add_to_cart');
  form.querySelector('[data-cart-status]').textContent = 'A termék a kosárba került.';
  updateCart();
});

document.addEventListener('click', event => {
  const button = event.target.closest('[data-remove-product]');
  if (!button) return;
  removeItem(button.dataset.removeProduct, button.dataset.removeSize);
  track('remove_from_cart');
  updateCart();
});

function mountPage() {
  track('page_view');
  if (document.querySelector('[data-product-form]')) track('product_view');
  updateCart();
}

document.addEventListener('swup:visit:start', () => {
  if (document.activeElement?.closest('#page-frame')) document.activeElement.blur();
});
document.addEventListener('swup:page:view', () => {
  mountPage();
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
