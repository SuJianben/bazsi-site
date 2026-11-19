import { productCard } from '../components/layout.js';
import { products } from '../data/products.js';
import { track } from '../analytics/events.js';

export function mountProductRail(section) {
  if (!section) return;
  const rail = section.querySelector('#product-rail');
  const previous = section.querySelector('[data-rail="left"]');
  const next = section.querySelector('[data-rail="right"]');
  const filters = [...section.querySelectorAll('[data-filter]')];
  const listeners = new AbortController();
  const options = { signal: listeners.signal };

  function updateControls() {
    previous.disabled = rail.scrollLeft < 1;
    next.disabled = rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 1;
  }

  function move(direction) {
    const [first, second] = rail.children;
    if (!second) return;
    const distance = second.offsetLeft - first.offsetLeft;
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    rail.scrollBy({ left: direction * distance, behavior: reducedMotion ? 'instant' : 'smooth' });
  }

  for (const filter of filters) {
    filter.addEventListener('click', () => {
      if (filter.getAttribute('aria-pressed') === 'true') return;
      track('collection_filter');
      const group = filter.dataset.filter;
      rail.innerHTML = products.filter(product => group === 'all' || product.group === group).map(productCard).join('');
      for (const button of filters) {
        button.classList.toggle('active', button === filter);
        button.setAttribute('aria-pressed', String(button === filter));
      }
      rail.scrollTo({ left: 0, behavior: 'instant' });
      updateControls();
    }, options);
  }

  rail.addEventListener('scroll', updateControls, options);
  previous.addEventListener('click', () => move(-1), options);
  next.addEventListener('click', () => move(1), options);
  const resize = new ResizeObserver(updateControls);
  resize.observe(rail);
  updateControls();
  return () => {
    listeners.abort();
    resize.disconnect();
  };
}
