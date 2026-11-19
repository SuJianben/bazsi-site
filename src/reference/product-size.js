const pickerSelector = '[data-product-size-picker]';
const optionSelector = '[data-size-option]';

function closeAndFocus(picker, trigger) {
  picker.open = false;
  trigger.focus({ preventScroll: true });
}

export function mountProductSizes(page) {
  for (const picker of page?.querySelectorAll(pickerSelector + '[hidden]') ?? []) {
    const select = picker.previousElementSibling;
    const trigger = picker.querySelector('summary');
    const value = trigger.querySelector('[data-dropdown-label]');
    const options = [...picker.querySelectorAll(optionSelector)];

    function syncSize() {
      value.textContent = select.options[select.selectedIndex]?.label ?? '';
      picker.toggleAttribute('data-active', select.selectedIndex > 0);
      for (const option of options) {
        option.setAttribute('aria-pressed', String(option.dataset.sizeOption === select.value));
      }
    }

    picker.addEventListener('click', event => {
      const option = event.target.closest(optionSelector);
      if (!option) return;
      select.value = option.dataset.sizeOption;
      select.dispatchEvent(new Event('change', { bubbles: true }));
      closeAndFocus(picker, trigger);
    });

    picker.addEventListener('keydown', event => {
      if (event.key === 'Escape' && picker.open) {
        event.stopPropagation();
        closeAndFocus(picker, trigger);
        return;
      }
      if (!['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const current = options.indexOf(event.target);
      const step = event.key === 'ArrowUp' ? -1 : 1;
      const next = {
        Home: 0,
        End: options.length - 1,
      }[event.key] ?? (current < 0 ? select.selectedIndex : current + step);
      picker.open = true;
      options[Math.max(0, Math.min(next, options.length - 1))]?.focus();
    });

    picker.addEventListener('focusout', event => {
      if (event.relatedTarget && !picker.contains(event.relatedTarget)) picker.open = false;
    });
    for (const label of select.labels) {
      label.addEventListener('click', event => {
        event.preventDefault();
        trigger.focus({ preventScroll: true });
      });
    }
    select.addEventListener('change', syncSize);
    syncSize();
    select.hidden = true;
    picker.hidden = false;
  }
}

document.addEventListener('click', event => {
  const picker = document.querySelector('#page-frame:not(.is-previous-container) ' + pickerSelector + '[open]');
  if (picker && !picker.contains(event.target)) picker.open = false;
}, { capture: true });
