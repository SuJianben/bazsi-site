import {header, footer} from '../components/layout.js';
import {home} from '../pages/home.js';
import {collection, product, blog, article, about, search, searchResults, cart, notFound} from '../pages/shop.js';
import {getCart,addItem,removeItem} from './cart.js';
import {track} from '../analytics/events.js';
import {Navigation} from './navigation.js';
import {mountProductRail} from './product-rail.js';
let navigationController;
let unmountRail;
const app=document.querySelector('#app');
document.querySelector('.skip-link').addEventListener('click', event => { event.preventDefault(); document.querySelector('#main')?.focus(); });
function pageForRoute() {
 const path=location.hash.slice(1) || '/';
 if(path==='/') return home();
 if(path==='/collections') return collection();
 const pathParts=path.split('/');
 if(pathParts.length===3 && pathParts[2]){
  if(pathParts[1]==='collections') return collection(pathParts[2]);
  if(pathParts[1]==='products') return product(pathParts[2]);
 }
 if(path==='/blog') return blog();
 if(path==='/blog/hatartalan') return article();
 if(path==='/about') return about();
 if(path==='/search') return search();
 if(path==='/cart') return cart(getCart());
 return notFound();
}
function syncHomeNavigation(){const isHome = location.hash === '' || location.hash === '#/'; document.body.classList.toggle('is-home', isHome); document.body.classList.toggle('home-at-top', isHome && window.scrollY < 80);}
function render({ focus = false, trackView = true } = {}) {
  navigationController?.destroy();
  unmountRail?.();
  if (trackView) {
    track('page_view');
    if (location.hash.startsWith('#/products/')) track('product_view');
  }
  app.innerHTML = `${header()}<main id="main" tabindex="-1">${pageForRoute()}</main>${footer()}`;
  const heading = app.querySelector('h1')?.textContent.replace(/\s+/g, ' ').trim();
  document.title = heading ? `${heading} | Limitless Essentials` : 'Limitless Essentials — Bazsi';
  updateCount();
  window.scrollTo({ top: 0, behavior: 'instant' });
  syncHomeNavigation();
  navigationController = new Navigation(app.querySelector('[data-navigation]'));
  unmountRail = mountProductRail(app.querySelector('.product-section'));
  if (focus) app.querySelector('main').focus({ preventScroll: true });
}

function updateCount() {
  const count = getCart().reduce((sum, item) => sum + item.quantity, 0);
  for (const node of app.querySelectorAll('[data-cart-count]')) node.textContent = count ? `(${count})` : '';
}

app.addEventListener('click',event=>{
 const size=event.target.closest('[data-size].size'); if(size){document.querySelectorAll('.size').forEach(button=>{button.classList.toggle('selected',button===size);button.setAttribute('aria-pressed',String(button===size));});return;}
 const add=event.target.closest('[data-product]'); if(add){const size=document.querySelector('.size.selected')?.dataset.size; if(size){track('add_to_cart');addItem(add.dataset.product,size);updateCount();add.textContent='✓  A KOSÁRBA KERÜLT';} return;}
 const remove=event.target.closest('[data-remove]');if(remove){track('remove_from_cart');removeItem(remove.dataset.remove,remove.dataset.size);render({focus:true,trackView:false});}
});
app.addEventListener('input',event=>{if(event.target.id==='query') { if(event.target.value.trim() && !event.target.dataset.tracked) { track('search_use'); event.target.dataset.tracked='true'; } document.querySelector('#search-results').innerHTML=searchResults(event.target.value); }});
app.addEventListener('submit',event=>{if(event.target.id==='search-form') event.preventDefault();});
window.addEventListener('scroll', syncHomeNavigation, {passive:true});
window.addEventListener('hashchange', () => render({focus:true}));
render();
