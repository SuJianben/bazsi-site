import { track } from '../analytics/events.js?v=2';

const selector = '[data-newsletter-preview]';

export function enableNewsletterPreview(page) {
  const button = page?.querySelector(`${selector} button[type="submit"]`);
  if (button) button.disabled = false;
}

document.addEventListener('submit', event => {
  const form = event.target;
  if (!form.matches(selector)) return;

  event.preventDefault();
  form.reset();
  const status = form.querySelector('[data-newsletter-status]');
  status.hidden = false;
  status.textContent = 'Köszönjük az érdeklődést! A feliratkozás jelenleg nem érhető el.';
  track('newsletter_demo_submit');
});
