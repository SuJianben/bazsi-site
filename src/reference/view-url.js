export function replaceViewUrl(url) {
  if (url.href === location.href) return;
  const state = history.state;
  // Swup uses the saved URL when restoring this entry with Back or Forward.
  const path = url.pathname + url.search + url.hash;
  history.replaceState(state?.source === 'swup' ? { ...state, url: path } : state, '', url);
}
