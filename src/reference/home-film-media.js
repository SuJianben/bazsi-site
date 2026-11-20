import { track } from '../analytics/events.js?v=3';

let filmListeners;

export function mountCreatorFilm(page) {
  filmListeners?.abort();
  const section = page?.querySelector('[data-creator-film]');
  if (!section) return;

  const link = section.querySelector('[data-creator-video-open]');
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

  filmListeners = new AbortController();
  const options = { signal: filmListeners.signal };
  narrowViewport.addEventListener('change', () => {
    setPoster();
    loop.autoplay = !reduceMotion.matches;
    loop.load();
  }, options);
  link.addEventListener('click', () => track('creator_video_open'), options);
}
