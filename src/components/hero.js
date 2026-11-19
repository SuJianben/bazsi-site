import { illustrations } from './hero-art.js';
import { flipButton } from './navigation.js';

/** The homepage masthead is kept separate from the rest of the page for precise visual tuning. */
export function hero() {
  return `<section class="hero" aria-labelledby="hero-heading">
    <div class="hero-artboard">
      <h1 class="hero-heading" id="hero-heading">
        <span class="hero-line hero-line-one">ÉLJ TE IS${illustrations.mouth}${illustrations.birds}</span>
        <span class="hero-line hero-line-two">MINDIG${illustrations.eye}${illustrations.hand}</span>
        <span class="hero-line hero-line-three">SZABADON${illustrations.hive}</span>
      </h1>
    </div>
    <span class="hero-side hero-side-left">BAZSI</span><span class="hero-side hero-side-right">LE</span>
    <nav class="hero-actions" aria-label="Felfedezés">${flipButton('KOLLEKCIÓ','#/collections/all',1)}${flipButton('RÓLUNK','#/about')}${flipButton('NAPLÓ','#/blog',-1)}</nav>
  </section>`;
}
