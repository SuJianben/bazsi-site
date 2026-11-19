import { products } from '../data/products.js';
import { productCard } from '../components/layout.js';
import { hero } from '../components/hero.js';
export function home() {
  return `${hero()}
  <section class="curved-banner"><div class="banner-inner"><p>BAZSI × LIMITLESS ESSENTIALS</p><h2>VÁLASSZ<br>HATÁROK<br><i>NÉLKÜL.</i></h2><span class="banner-symbol">✳</span></div></section>
  <section class="product-section section-pad"><div class="section-heading"><div><p class="eyebrow">A TE STÍLUSOD. A TE SZABÁLYAID.</p><h2>AZ ÚJ KOLLEKCIÓ</h2></div><a class="text-link" href="#/collections/all">↳ &nbsp; ÖSSZES TERMÉK</a></div><div class="filter-bar"><button class="filter-button active" data-filter="all" aria-pressed="true">ÖSSZES</button><button class="filter-button" data-filter="felnott" aria-pressed="false">FELNŐTT</button><button class="filter-button" data-filter="gyerek" aria-pressed="false">GYEREK</button></div><div class="product-rail" id="product-rail">${products.map(productCard).join('')}</div><div class="rail-controls"><button data-rail="left" aria-label="Előző termékek">←</button><button data-rail="right" aria-label="Következő termékek">→</button></div></section>
  <section class="manifesto"><p>BAZSI × LIMITLESS ESSENTIALS</p><h2>NO LIMITS.<br>JUST YOU.</h2><a class="white-button" href="#/about">↳ &nbsp; A TÖRTÉNETÜNK</a><span>✳</span></section>
  <section class="section-pad"><div class="section-heading"><h2>FEDEZD FEL</h2><p>MINDEN NAPRA. MINDENKINEK.</p></div><div class="feature-grid"><a class="feature feature-hoodie" href="#/collections/felnott"><div><p>LIMITLESS ESSENTIALS</p><h3>FELNŐTT<br>KOLLEKCIÓ</h3><strong>↳ &nbsp; FELFEDEZEM</strong></div></a><a class="feature feature-shirt" href="#/collections/gyerek"><div><p>KIS MÉRET. NAGY ENERGIA.</p><h3>GYEREK<br>KOLLEKCIÓ</h3><strong>↳ &nbsp; FELFEDEZEM</strong></div></a></div></section>
  <section class="story-band"><p>LIMITLESS ESSENTIALS × BAZSI</p><h2>A STÍLUS<br>RAJTAD MÚLIK.</h2><a class="white-button" href="#/about">↳ &nbsp; ISMERJ MEG MINKET</a></section>`;
}
