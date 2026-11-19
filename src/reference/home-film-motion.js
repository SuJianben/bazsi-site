const configured = new WeakSet();

function configureWordmark() {
  const wordmark = document.querySelector('#page-frame:not(.is-previous-container) [data-home-film-wordmark]');
  if (!wordmark || configured.has(wordmark)) return;

  // The reference theme exposes the SVG's existing controller in the active page.
  const controller = window.app?.page.find(item => item.svg === wordmark);
  const trigger = controller?.timeline?.scrollTrigger;
  if (!trigger) return;

  controller.dances?.forEach(tween => tween.revert());
  controller.dances = [];
  trigger.vars.end = 'top 55%';
  trigger.refresh();
  configured.add(wordmark);
}

function afterThemeMount() {
  requestAnimationFrame(configureWordmark);
}

if (window.app) afterThemeMount();
else document.addEventListener('DOMContentLoaded', afterThemeMount, { once: true });

document.addEventListener('swup:page:view', afterThemeMount);
