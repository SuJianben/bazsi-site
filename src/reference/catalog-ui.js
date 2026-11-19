import { track } from '../analytics/events.js?v=2';

const searchForm = '[data-search-form]';
const openFilter = '[data-collection-filter][open]';
const normalize = value => value.toLocaleLowerCase('hu').normalize('NFD').replace(/\p{Diacritic}/gu, '');

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
  form.querySelector('[data-search-status]').hidden = matches > 0;
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

document.addEventListener('click', event => {
  const filter = document.querySelector(openFilter);
  if (!filter) return;
  const link = event.target.closest('a');
  if (link && filter.contains(link)) {
    if (link.getAttribute('aria-current') !== 'page') track('collection_filter');
    filter.open = false;
  } else if (!filter.contains(event.target)) {
    filter.open = false;
  }
});

document.addEventListener('keydown', event => {
  const filter = event.target.closest(openFilter);
  if (event.key !== 'Escape' || !filter) return;
  filter.open = false;
  filter.querySelector('summary').focus();
});
