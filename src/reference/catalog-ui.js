import { track } from '../analytics/events.js?v=2';

const searchForm = '[data-search-form]';
const openFilter = '[data-collection-filter][open]';
const normalize = value => value.toLocaleLowerCase('hu').normalize('NFD').replace(/\p{Diacritic}/gu, '');

document.addEventListener('swup:visit:end', () => {
  if (!location.hash.startsWith('#collection-results-')) return;
  const target = document.getElementById(location.hash.slice(1));
  if (!target) return;
  const top = target.getBoundingClientRect().top;
  const offset = parseFloat(getComputedStyle(target).scrollMarginTop);
  // Swup's incoming frame is fixed while its page animation is running.
  if (Math.abs(top - offset) > 1) {
    window.app.smoothScroll.lenis.scrollTo(window.scrollY + top - offset, { immediate: true, force: true });
  }
});

function updateResults(form) {
  const value = form.elements.q.value.trim();
  const query = normalize(value);
  const results = form.closest('main').querySelector('#search-results');
  let matches = 0;
  for (const item of results.querySelectorAll('[data-search-name]')) {
    const visible = normalize(item.dataset.searchName).includes(query);
    item.hidden = !visible;
    if (visible) matches++;
  }

  form.querySelector('[data-search-count]').textContent = `${matches} találat`;
  results.querySelector('[data-search-status]').hidden = matches > 0;
  if (query && !form.dataset.tracked) {
    track('search_use');
    form.dataset.tracked = 'true';
  }
}

export function mountSearch(page) {
  const form = page?.querySelector(searchForm);
  if (!form) return;
  form.elements.q.value = new URL(location.href).searchParams.get('q') ?? '';
  updateResults(form);
}

function saveAndUpdate(form) {
  const url = new URL(location.href);
  const value = form.elements.q.value.trim();
  if (value) url.searchParams.set('q', value);
  else url.searchParams.delete('q');
  if (url.href !== location.href) {
    const state = history.state;
    // Swup reads its saved URL when restoring this entry with Back or Forward.
    const path = `${url.pathname}${url.search}${url.hash}`;
    const next = state?.source === 'swup' ? { ...state, url: path } : state;
    history.replaceState(next, '', url);
  }
  updateResults(form);
}

document.addEventListener('input', event => {
  const form = event.target.closest(searchForm);
  if (form && event.target === form.elements.q) saveAndUpdate(form);
});

document.addEventListener('submit', event => {
  if (!event.target.matches(searchForm)) return;
  event.preventDefault();
  saveAndUpdate(event.target);
});

document.addEventListener('reset', event => {
  const form = event.target;
  if (!form.matches(searchForm)) return;
  event.preventDefault();
  form.elements.q.value = '';
  saveAndUpdate(form);
  form.elements.q.focus();
});

document.addEventListener('click', event => {
  const link = event.target.closest('a');
  for (const filter of document.querySelectorAll(openFilter)) {
    if (link && filter.contains(link)) {
      if (link.getAttribute('aria-current') === 'page') {
        event.preventDefault();
        if (!filter.closest('[data-events-filter-sheet]')) filter.querySelector('summary').focus();
      } else {
        track('collection_filter');
      }
      filter.open = false;
    } else if (!filter.contains(event.target)) {
      filter.open = false;
    }
  }
}, { capture: true });

document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  const filter = event.target.closest(openFilter)
    ?? document.querySelector(`[data-events-filter-open][aria-expanded="true"] ~ * ${openFilter}`);
  if (!filter) return;
  event.stopImmediatePropagation();
  filter.open = false;
  filter.querySelector('summary').focus();
}, { capture: true });
