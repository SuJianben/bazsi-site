import { track } from '../analytics/events.js?v=2';
import { replaceViewUrl } from './view-url.js';

const archiveSelector = '[data-collection-archive]';
const filterSelector = '[data-collection-filter]';
const optionSelector = '[data-collection-option]';
const itemSelector = '[data-collection-item]';
const activeArchive = '#page-frame:not(.is-previous-container) ' + archiveSelector;
const parameter = 'korosztaly';
const pending = new WeakMap();

function applyGroup(archive, group) {
  archive.dataset.collectionSelected = group;
  for (const item of archive.querySelectorAll(itemSelector)) {
    item.hidden = group !== 'all' && item.dataset.collectionItem !== group;
  }
  for (const filter of archive.querySelectorAll(filterSelector)) {
    filter.toggleAttribute('data-active', group !== 'all');
    for (const option of filter.querySelectorAll(optionSelector)) {
      if (option.dataset.collectionOption === group) {
        option.setAttribute('aria-current', 'page');
        filter.querySelector('[data-dropdown-label]').textContent = option.textContent;
      } else {
        option.removeAttribute('aria-current');
      }
    }
  }
}

export function mountCollection(page) {
  const archive = page?.querySelector(archiveSelector);
  if (!archive) return;
  const group = new URL(location.href).searchParams.get(parameter);
  const options = [...archive.querySelectorAll(optionSelector)];
  const valid = options.some(option => option.dataset.collectionOption === group);
  applyGroup(archive, valid ? group : archive.dataset.collectionArchive);
}

async function animateCards(list, signal, entering) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const cards = [...list.querySelectorAll(itemSelector + ':not([hidden])')];
  const visible = { opacity: 1, translate: '0 0' };
  const faded = { opacity: 0, translate: entering ? '0 20px' : '0 -20px' };
  const animations = cards.map((card, index) => card.animate(
    entering ? [faded, visible] : [visible, faded], {
      duration: entering ? 500 : 300,
      delay: index * (entering ? 40 : 30),
      easing: entering ? 'cubic-bezier(.333333, 1, .666667, 1)' : 'cubic-bezier(.333333, 0, .666667, 0)',
      fill: 'both',
    }
  ));
  const cancel = () => animations.forEach(animation => animation.cancel());
  signal.addEventListener('abort', cancel, { once: true });
  await Promise.allSettled(animations.map(animation => animation.finished));
  signal.removeEventListener('abort', cancel);
  cancel();
}

function saveGroup(archive, group) {
  const url = new URL(location.href);
  if (group === archive.dataset.collectionArchive) url.searchParams.delete(parameter);
  else url.searchParams.set(parameter, group);
  replaceViewUrl(url);
}

function refreshScrollLayout(scroll) {
  const app = window.app;
  // The reference bundle exposes its ScrollTrigger through the footer reveal.
  const footer = app?.page.find(controller =>
    controller.svg?.matches('[data-footer-logo-scroll]') && controller.reveal?.scrollTrigger
  );
  footer?.reveal.scrollTrigger.constructor.refresh();

  const lenis = app?.smoothScroll.lenis;
  lenis?.resize();
  if (window.scrollY === scroll) return;
  if (lenis) lenis.scrollTo(scroll, { immediate: true, force: true });
  else window.scrollTo(0, scroll);
}

async function selectGroup(archive, group) {
  if (!archive.dataset.collectionSelected) mountCollection(archive.closest('#page-frame'));
  const list = archive.querySelector('[data-collection-results]');
  const previous = pending.get(archive);
  if (previous?.group === group) return;
  previous?.controller.abort();

  if (group === archive.dataset.collectionSelected) {
    pending.delete(archive);
    list.removeAttribute('aria-busy');
    return;
  }

  const controller = new AbortController();
  pending.set(archive, { group, controller });
  track('collection_filter');
  list.setAttribute('aria-busy', 'true');
  await animateCards(list, controller.signal, false);
  if (controller.signal.aborted) return;

  const scroll = window.scrollY;
  applyGroup(archive, group);
  saveGroup(archive, group);
  refreshScrollLayout(scroll);

  await animateCards(list, controller.signal, true);
  if (controller.signal.aborted) return;
  list.removeAttribute('aria-busy');
  pending.delete(archive);
}

document.addEventListener('click', event => {
  const archive = document.querySelector(activeArchive);
  if (!archive) return;
  const option = event.target.closest(optionSelector);
  if (option && archive.contains(option) && !event.defaultPrevented && event.button === 0 &&
      !event.metaKey && !event.ctrlKey && !event.altKey && !event.shiftKey) {
    event.preventDefault();
    if (!option.closest('[data-events-filter-sheet]')) {
      option.closest(filterSelector).querySelector('summary').focus({ preventScroll: true });
    }
    selectGroup(archive, option.dataset.collectionOption);
  }

  for (const filter of archive.querySelectorAll(filterSelector + '[open]')) {
    if (option || !filter.contains(event.target)) filter.open = false;
  }
}, { capture: true });

document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  const open = filterSelector + '[open]';
  const filter = event.target.closest(open)
    ?? document.querySelector(`[data-events-filter-open][aria-expanded="true"] ~ * ${open}`);
  if (!filter) return;
  event.stopImmediatePropagation();
  filter.open = false;
  filter.querySelector('summary').focus({ preventScroll: true });
}, { capture: true });

document.addEventListener('swup:visit:start', () => {
  const archive = document.querySelector(activeArchive);
  if (!archive) return;
  pending.get(archive)?.controller.abort();
  pending.delete(archive);
  archive.querySelector('[data-collection-results]').removeAttribute('aria-busy');
});
