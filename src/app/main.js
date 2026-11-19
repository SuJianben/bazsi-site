import {header, footer, productCard} from '../components/layout.js';
import {home} from '../pages/home.js';
import {collection, product, blog, article, about, search, searchResults, cart, notFound} from '../pages/shop.js';
import {products} from '../data/products.js';
import {getCart,addItem,removeItem} from './cart.js';
import {track} from '../analytics/events.js';
const app=document.querySelector('#app');
document.querySelector('.skip-link').addEventListener('click', event => { event.preventDefault(); document.querySelector('#main')?.focus(); });
function pageForRoute() {
 const path=location.hash.slice(1) || '/';
 if(path==='/') return home();
 if(path.startsWith('/collections/')) return collection(path.split('/')[2]);
 if(path.startsWith('/products/')) return product(path.split('/')[2]);
 if(path==='/blog') return blog();
 if(path==='/blog/hatartalan') return article();
 if(path==='/about') return about();
 if(path==='/search') return search();
 if(path==='/cart') return cart(getCart());
 return notFound();
}
function syncHomeNavigation(){const isHome = location.hash === '' || location.hash === '#/'; document.body.classList.toggle('is-home', isHome); document.body.classList.toggle('home-at-top', isHome && window.scrollY < 80);}
function render(){track('page_view'); if(location.hash.startsWith('#/products/')) track('product_view'); app.innerHTML=`${header()}<main id="main" tabindex="-1">${pageForRoute()}</main>${footer()}`; document.title='Limitless Essentials — Bazsi'; updateCount(); window.scrollTo(0,0); syncHomeNavigation();}
function updateCount(){const count=getCart().reduce((sum,item)=>sum+item.quantity,0); const node=document.querySelector('[data-cart-count]'); if(node) node.textContent=count ? `(${count})` : '';}
app.addEventListener('click',event=>{
 const toggle=event.target.closest('.menu-toggle');
 if(toggle){const menu=document.querySelector('#site-menu'); const open=menu.hidden; menu.hidden=!open; toggle.setAttribute('aria-expanded',String(open)); toggle.setAttribute('aria-label',open?'Menü bezárása':'Menü megnyitása'); document.body.classList.toggle('menu-open',open); return;}
 const filter=event.target.closest('[data-filter]');
 if(filter){track('collection_filter');const rail=document.querySelector('#product-rail'); const selected=filter.dataset.filter; rail.innerHTML=products.filter(p=>selected==='all'||p.group===selected).map(productCard).join(''); document.querySelectorAll('[data-filter]').forEach(button=>button.classList.toggle('active',button===filter)); return;}
 const railButton=event.target.closest('[data-rail]'); if(railButton){document.querySelector('#product-rail').scrollBy({left:railButton.dataset.rail==='right'?340:-340,behavior:'smooth'}); return;}
 const size=event.target.closest('[data-size].size'); if(size){document.querySelectorAll('.size').forEach(button=>{button.classList.toggle('selected',button===size);button.setAttribute('aria-pressed',String(button===size));});return;}
 const add=event.target.closest('[data-product]'); if(add){const size=document.querySelector('.size.selected')?.dataset.size; if(size){track('add_to_cart');addItem(add.dataset.product,size);updateCount();add.textContent='✓  A KOSÁRBA KERÜLT';} return;}
 const remove=event.target.closest('[data-remove]');if(remove){track('remove_from_cart');removeItem(remove.dataset.remove,remove.dataset.size);render();}
 if(event.target.closest('.menu-panel a')) document.body.classList.remove('menu-open');
});
app.addEventListener('input',event=>{if(event.target.id==='query') { if(event.target.value.length===1) track('search_use'); document.querySelector('#search-results').innerHTML=searchResults(event.target.value); }});
app.addEventListener('submit',event=>{if(event.target.id==='search-form') event.preventDefault();});
window.addEventListener('scroll', syncHomeNavigation, {passive:true});
window.addEventListener('hashchange',()=>{document.body.classList.remove('menu-open');render();});
render();
