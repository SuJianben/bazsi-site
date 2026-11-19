const CART_KEY='limitless-demo-cart';
export function getCart(){try { const value=JSON.parse(localStorage.getItem(CART_KEY) || '[]'); return Array.isArray(value)?value:[]; } catch { return []; }}
function save(items){localStorage.setItem(CART_KEY, JSON.stringify(items));}
export function addItem(id,size){const items=getCart(); const existing=items.find(item=>item.id===id && item.size===size); if(existing) existing.quantity++; else items.push({id,size,quantity:1}); save(items);}
export function removeItem(id,size){save(getCart().filter(item=>!(item.id===id && item.size===size)));}
