const menu = [
  {label:'KOLLEKCIÓ', href:'#/collections/all', color:'blue'},
  {label:'TERMÉKEK', color:'red', children:[['ÖSSZES TERMÉK','#/collections/all'],['FELNŐTT','#/collections/felnott'],['GYEREK','#/collections/gyerek']]},
  {label:'PULÓVEREK ÉS PÓLÓK', color:'pink', children:[['FELNŐTT PULÓVER','#/products/felnott-pulover'],['GYEREK PULÓVER','#/products/gyerek-pulover'],['FELNŐTT PÓLÓ','#/products/felnott-polo'],['GYEREK PÓLÓ','#/products/gyerek-polo']]},
  {label:'RÓLUNK', color:'purple', children:[['A TÖRTÉNETÜNK','#/about'],['NAPLÓ','#/blog']]},
  {label:'FELFEDEZÉS', color:'yellow', children:[['KERESÉS','#/search'],['KOSÁR','#/cart']]},
  {label:'NAPLÓ', href:'#/blog', color:'blue'}
];
function face(label,icon){return `<span class="menu-face"><span>${label}</span><span class="menu-icon">${icon}</span></span>`;}
function row(item,index){
  const icon=item.children?'+':'↳'; const body=`<span class="menu-flip" style="--dir:${index%2 ? -1 : 1}"><span class="menu-flip-inner">${face(item.label,icon)}<span class="menu-back menu-${item.color}" aria-hidden="true">${face(item.label,icon)}</span></span></span>`;
  if(!item.children)return `<li data-menu-item><a class="menu-row" href="${item.href}">${body}</a></li>`;
  return `<li data-menu-item><button type="button" class="accordion-header menu-row" aria-expanded="false">${body}</button><div class="accordion-content" inert aria-hidden="true"><ul data-accordion-stagger>${item.children.map(([label,href])=>`<li><a href="${href}">${label}</a></li>`).join('')}</ul></div></li>`;
}
export function navigation() {
 return `<header class="site-header" data-navigation><div class="nav-shell"><div class="header-bar"><button class="menu-toggle" data-toggle-menu aria-label="Menü megnyitása" aria-expanded="false" aria-controls="site-menu"><span data-menu-bar></span><span data-menu-bar></span></button><a class="wordmark" href="#/" aria-label="Limitless Essentials – főoldal"><span>LIMITLESS<small>ESSENTIALS</small></span></a><a class="header-icon" href="#/cart" aria-label="Kosár">△</a></div><div data-menu id="site-menu" class="reference-menu" aria-hidden="true" inert><nav data-menu-scroll aria-label="Menü"><ul data-accordion-group class="menu-list">${menu.map(row).join('')}</ul></nav></div></div><nav class="quick-nav" data-header-nav aria-label="Fő navigáció">${flipActions(['collection', 'journal', 'cart'])}</nav></header>`;
}
const actions = {
  collection: { label: 'KOLLEKCIÓ', href: '#/collections/all', direction: 1, accent: 'mint' },
  about: { label: 'RÓLUNK', href: '#/about', direction: -1, accent: 'lilac' },
  journal: { label: 'NAPLÓ', href: '#/blog', direction: 1, accent: 'coral' },
  cart: { label: 'KOSÁR', href: '#/cart', direction: 1, accent: 'coral', cart: true }
};

function actionFace(label, cart, back) {
  return `<span class="flip-button-${back ? 'back' : 'face'}"${back ? ' aria-hidden="true"' : ''}>
    ${label}${cart ? '<span data-cart-count></span>' : ''}
  </span>`;
}

export function flipActions(names) {
  return names.map(name => {
    const { label, href, direction, accent, cart } = actions[name];
    return `<a href="${href}" class="flip-button" data-accent="${accent}" style="--dir:${direction}">
      <span class="flip-button-inner">${actionFace(label, cart, false)}${actionFace(label, cart, true)}</span>
    </a>`;
  }).join('');
}
