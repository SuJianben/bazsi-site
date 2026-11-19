/* Adapted from The Rechabite public navigation controller. Original uses GSAP,
   a height tween, a staggered item timeline, and one open accordion per group.
   Site-specific smooth-scroll and ScrollTrigger hooks were removed. */
class Accordion {
  constructor(header,onOpen) {
    this.header=header; this.content=header.nextElementSibling; this.onOpen=onOpen;
    this.staggerItems=[...this.content.querySelectorAll('[data-accordion-stagger] > *')];
    this.content.style.maxHeight='0px'; this.onClick=this.toggle.bind(this);
    header.addEventListener('click',this.onClick);
  }
  get isOpen(){return this.header.classList.contains('active');}
  open(){this.content.inert=false;this.content.setAttribute('aria-hidden','false');this.header.classList.add('active'); this.header.setAttribute('aria-expanded','true'); this.content.style.maxHeight=`${this.content.scrollHeight}px`; this.resetAnimation(); if(this.staggerItems.length && !window.matchMedia('(prefers-reduced-motion: reduce)').matches)this.animation=gsap.fromTo(this.staggerItems,{opacity:0,y:16},{opacity:1,y:0,duration:.5,delay:.12,stagger:.06,ease:'power2.out',clearProps:'opacity,transform'});}
  resetAnimation(){this.animation?.kill();this.animation=null;if(this.staggerItems.length)gsap.set(this.staggerItems,{clearProps:'opacity,transform'});}
  close(){this.content.inert=true;this.content.setAttribute('aria-hidden','true');this.resetAnimation();this.header.classList.remove('active');this.header.setAttribute('aria-expanded','false');this.content.style.maxHeight='0px';}
  toggle(){if(this.isOpen){this.close();return;}this.onOpen?.(this);this.open();}
  destroy(){this.resetAnimation();this.header.removeEventListener('click',this.onClick);}
}
function initAccordions(panel){
 const groups=new Map();
 const closeOthers=item=>groups.get(item.header.closest('[data-accordion-group]'))?.forEach(other=>{if(other!==item&&other.isOpen)other.close();});
 return [...panel.querySelectorAll('.accordion-header')].map(header=>{const group=header.closest('[data-accordion-group]');const item=new Accordion(header,group?closeOthers:null);if(group){if(!groups.has(group))groups.set(group,[]);groups.get(group).push(item);}return item;});
}
export class Navigation {
 constructor(root){
  this.root=root;this.panel=root.querySelector('[data-menu]');this.scroller=root.querySelector('[data-menu-scroll]');this.toggles=[...root.querySelectorAll('[data-toggle-menu]')];this.items=[...this.panel.querySelectorAll('[data-menu-item]')];this.bars=[...root.querySelectorAll('[data-menu-bar]')];this.isOpen=false;this.accordions=initAccordions(this.panel);
  const offset=this.bars.length>1?(this.bars[1].offsetTop-this.bars[0].offsetTop)/2:0;
  this.motion=window.matchMedia('(prefers-reduced-motion: reduce)');
  this.timeline=gsap.timeline({paused:true,defaults:{ease:'expo.out'}}).to(this.bars,{y:i=>i===0?offset:-offset,rotate:i=>i===0?45:-45,scaleX:.8,duration:.3,ease:'back.inOut'},0).from(this.items,{y:24,opacity:0,duration:.5,stagger:.03},.3);
  this.toggle=this.toggle.bind(this);this.close=this.close.bind(this);this.measure=this.measure.bind(this);this.onKeydown=this.onKeydown.bind(this);this.onDocumentClick=this.onDocumentClick.bind(this);
  this.toggles.forEach(toggle=>toggle.addEventListener('click',this.toggle));document.addEventListener('keydown',this.onKeydown);document.addEventListener('click',this.onDocumentClick);window.addEventListener('resize',this.measure);this.measure();
 }
 measure(){const secondary=this.root.querySelector('[data-header-nav]');const navHeight=secondary&&getComputedStyle(secondary).visibility!=='hidden'?secondary.offsetHeight:0;const rect=this.scroller.getBoundingClientRect();const space=window.innerHeight-rect.top-navHeight-16;this.scroller.style.setProperty('--menu-max',`${Math.max(200,space)}px`);}
 onKeydown(event){if(event.key==='Escape')this.close();}
 onDocumentClick(event){if(!event.target.closest('[data-menu], [data-toggle-menu], [data-header-nav]'))this.close();else if(event.target.closest('[data-menu] a'))this.close();}
 animatePanel(){this.panelTween?.kill();if(this.motion.matches){gsap.set(this.panel,{height:this.isOpen?'auto':0});return;}this.panelTween=gsap.to(this.panel,{height:this.isOpen?'auto':0,duration:.5,ease:'expo.inOut',onComplete:()=>{if(this.isOpen)gsap.set(this.panel,{height:'auto'});}});}
 toggle(){this.isOpen=!this.isOpen;if(!this.isOpen && this.panel.contains(document.activeElement))this.toggles[0].focus({preventScroll:true});document.body.classList.toggle('menu-open',this.isOpen);this.toggles.forEach(toggle=>{toggle.setAttribute('aria-expanded',String(this.isOpen));toggle.setAttribute('aria-label',this.isOpen?'Menü bezárása':'Menü megnyitása');});this.panel.inert=!this.isOpen;this.panel.setAttribute('aria-hidden',String(!this.isOpen));if(this.isOpen)this.measure();this.animatePanel();if(!this.isOpen)this.accordions.forEach(item=>item.close());if(this.motion.matches)this.timeline.progress(this.isOpen?1:0).pause();else if(this.isOpen)this.timeline.play();else this.timeline.reverse();}
 close(){if(this.isOpen)this.toggle();}
 destroy(){this.panelTween?.kill();this.accordions.forEach(item=>item.destroy());this.toggles.forEach(toggle=>toggle.removeEventListener('click',this.toggle));window.removeEventListener('resize',this.measure);document.removeEventListener('keydown',this.onKeydown);document.removeEventListener('click',this.onDocumentClick);this.timeline.kill();document.body.classList.remove('menu-open');}
}
