// Anonymous, session-only interaction counters; no external analytics service is connected.
const allowed = new Set(['page_view','collection_filter','product_view','add_to_cart','remove_from_cart','search_use','newsletter_demo_submit']);
export function track(eventName) {
  if (!allowed.has(eventName)) return;
  try {
    const key = 'limitless-demo-events';
    const counts = JSON.parse(sessionStorage.getItem(key) || '{}');
    counts[eventName] = (counts[eventName] || 0) + 1;
    sessionStorage.setItem(key, JSON.stringify(counts));
  } catch { /* Browsing remains available when storage is disabled. */ }
}
