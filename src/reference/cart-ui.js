import { addItem, getCart, removeItem } from '../app/cart.js';
import { productById } from '../data/products.js';
import { track } from '../analytics/events.js?v=2';

const lists = '#page-frame:not(.is-previous-container) [data-cart-list], [data-cart-preview]';
const asset = path => new URL(path, document.baseURI).href;

function cartLine(item, product) {
  const article = document.createElement('article');
  article.className = 'store-cart-row rounded-lg border border-white/20 bg-black';
  const imageLink = document.createElement('a');
  imageLink.href = asset(`products/${product.id}/`);
  imageLink.setAttribute('aria-label', product.name);
  const image = document.createElement('img');
  image.src = asset(product.image);
  image.alt = '';
  image.className = 'aspect-square w-full rounded object-cover';
  imageLink.append(image);

  const text = document.createElement('div');
  const title = document.createElement('h2');
  title.className = 'is-h6 text-pretty';
  title.textContent = product.name;
  const details = document.createElement('p');
  details.className = 'store-cart-meta is-technical-scale text-white/70';
  details.textContent = `Fekete · ${item.size} · ${item.quantity} db`;
  text.append(title, details);

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'store-cart-remove is-tag rounded-xs border border-white px-4 py-3 transition-colors hover:bg-white hover:text-black';
  button.textContent = 'Eltávolítás';
  button.setAttribute('aria-label', `${button.textContent} · ${product.name} · ${item.size}`);
  button.dataset.removeProduct = item.id;
  button.dataset.removeSize = item.size;
  article.append(imageLink, text, button);
  return article;
}

export function renderCart() {
  const items = getCart().filter(item => productById(item?.id));
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  document.querySelectorAll('header a[aria-label^="Kosár"]').forEach(link => {
    link.setAttribute('aria-label', count ? `Kosár (${count})` : 'Kosár');
  });
  document.querySelectorAll('[data-cart-count]').forEach(label => {
    label.hidden = count === 0;
    label.textContent = count ? `${count} db termék` : '';
  });
  for (const list of document.querySelectorAll(lists)) {
    const rows = items.map(item => cartLine(item, productById(item.id)));
    if (!rows.length) {
      const message = document.createElement('p');
      message.className = 'rounded-lg border border-white/20 bg-black p-6';
      message.textContent = 'A kosarad jelenleg üres.';
      rows.push(message);
    }
    list.replaceChildren(...rows);
  }
}

document.addEventListener('submit', event => {
  const form = event.target;
  if (!form.matches('[data-product-form]')) return;
  event.preventDefault();
  const product = productById(form.dataset.productForm);
  const size = form.elements.size.value;
  if (!product?.sizes.includes(size)) return;
  addItem(product.id, size);
  track('add_to_cart');
  form.querySelector('[data-cart-status]').textContent = 'A termék a kosárba került.';
  renderCart();
});

document.addEventListener('click', event => {
  const button = event.target.closest('[data-remove-product]');
  if (!button) return;
  const list = button.closest('[data-cart-list], [data-cart-preview]');
  const position = [...list.querySelectorAll('button')].indexOf(button);
  const restoreFocus = document.activeElement === button;
  removeItem(button.dataset.removeProduct, button.dataset.removeSize);
  track('remove_from_cart');
  renderCart();
  if (restoreFocus) {
    const remaining = list.querySelectorAll('button');
    (remaining[position] ?? remaining[position - 1] ?? list.parentElement.querySelector('a'))?.focus();
  }
});
