import { track } from '../analytics/events.js?v=3';

let cropListener;

export function mountCreatorFilm(page) {
  cropListener?.abort();
  const section = page?.querySelector('[data-creator-film]');
  if (!section) return;

  const link = section.querySelector('[data-creator-video-open]');
  const dialog = section.querySelector('[data-creator-video-dialog]');
  const frame = section.querySelector('[data-creator-video-frame]');
  const loop = section.querySelector('[data-creator-film-loop]');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const [portrait, landscape] = loop.querySelectorAll('source');
  const narrowViewport = matchMedia(portrait.media);
  const setPoster = () => {
    loop.poster = (narrowViewport.matches ? portrait : landscape).dataset.poster;
  };
  setPoster();
  loop.autoplay = !reduceMotion.matches;
  if (reduceMotion.matches) loop.pause();

  cropListener = new AbortController();
  narrowViewport.addEventListener('change', () => {
    setPoster();
    loop.autoplay = !reduceMotion.matches && !dialog.open;
    loop.load();
  }, { signal: cropListener.signal });

  if (typeof dialog.showModal !== 'function') return;
  link.setAttribute('aria-haspopup', 'dialog');

  link.addEventListener('click', event => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const videoId = new URL(link.href).searchParams.get('v');
    frame.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&playsinline=1&rel=0`;
    dialog.showModal();
    loop.pause();
    window.app?.smoothScroll.lenis.stop();
    track('creator_video_open');
  });

  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });

  dialog.addEventListener('close', () => {
    frame.removeAttribute('src');
    window.app?.smoothScroll.lenis.start();
    loop.autoplay = !reduceMotion.matches;
    if (loop.autoplay && section.isConnected) loop.play().catch(() => {});
  });
}

document.addEventListener('swup:visit:start', () => {
  document.querySelector('[data-creator-video-dialog][open]')?.close();
});
