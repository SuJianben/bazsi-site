const dialogSelector = '[data-book-sheet], [data-events-filter-sheet]';
const focusableSelector = 'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), summary';

document.addEventListener('click', event => {
  const tab = event.target.closest('[data-book-tab]');
  if (!tab) return;
  for (const sibling of tab.closest('[role="tablist"]').querySelectorAll('[data-book-tab]')) {
    sibling.tabIndex = sibling === tab ? 0 : -1;
  }
});

document.addEventListener('keydown', event => {
  const dialog = event.target.closest(dialogSelector);
  if (!dialog) return;

  const tab = event.target.closest('[data-book-tab]');
  if (tab && ['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) {
    const tabs = [...tab.closest('[role="tablist"]').querySelectorAll('[data-book-tab]')];
    const index = tabs.indexOf(tab);
    const next = {
      ArrowUp: (index - 1 + tabs.length) % tabs.length,
      ArrowDown: (index + 1) % tabs.length,
      Home: 0,
      End: tabs.length - 1,
    }[event.key];
    event.preventDefault();
    tabs[next].click();
    tabs[next].focus();
  }

  if (event.key !== 'Tab') return;
  const focusable = [...dialog.querySelectorAll(focusableSelector)].filter(node =>
    node.tabIndex >= 0 && node.getClientRects().length && !node.closest('[inert]') &&
    getComputedStyle(node).visibility === 'visible'
  );
  const first = focusable[0];
  const last = focusable.at(-1);
  if (event.shiftKey ? event.target === first : event.target === last) {
    event.preventDefault();
    (event.shiftKey ? last : first)?.focus();
  }
});
