/* Black Palm Tattoo — home page only */
(function(){
  'use strict';
  var root = document.documentElement, BP = window.BP, lenis = BP.lenis;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  lenis.stop();

  /* ---- intro: montage video -> page wipes up -> letters land (inherited.band timings) ---- */
  var hl = Array.prototype.slice.call(document.querySelectorAll('.header-title .letter'));
  var subs = document.querySelectorAll('.header-subtitle span');
  var offs = [{x:100},{y:100},{y:-100},{x:100},{x:100},{y:-100},{y:100},{x:100},{y:100}];
  function initIntro(){
    hl.forEach(function(l, i){ gsap.set(l, Object.assign({ opacity: 0 }, offs[i] || { y: 100 })); });
    gsap.set(subs[0], { opacity: 0, x: -40 }); gsap.set(subs[1], { opacity: 0, x: 40 }); gsap.set(subs[2], { opacity: 0, x: -40 });
  }
  function land(idx, delay){ idx.forEach(function(i){ if (!hl[i]) return; gsap.set(hl[i], { opacity: 1, delay: delay }); gsap.to(hl[i], { x: 0, y: 0, duration: 1.2, ease: 'expo.out', delay: delay, onStart: function(){ BP.headerNoises[i] && BP.headerNoises[i].play(); } }); }); }
  function intro(){
    root.classList.add('intro-done');
    land([0, 5], .5); land([3, 6], .6); land([1, 2], .7); land([4, 7, 8], .8);
    gsap.to(subs, { opacity: 1, x: 0, duration: 1.4, ease: 'expo.out', delay: 1, stagger: .08 });
    setTimeout(function(){ var p = document.getElementById('preloader'); p && p.remove(); document.getElementById('page').classList.add('no-clip'); lenis.start(); ScrollTrigger.refresh(); }, 1450);
  }
  var started = false, vid = document.querySelector('#preloader video');
  var returning = false; try { returning = sessionStorage.getItem('bp-nav') === '1'; } catch (x) {}
  function ready(){
    if (started) return; started = true;
    if (!returning) { var pr = vid.play(); if (pr && pr.catch) pr.catch(function(){}); }
    document.getElementById('loading').classList.add('hide');
    initIntro(); setTimeout(intro, reduce || returning ? 150 : 1000);
  }
  if (returning) { ready(); }
  else {
    vid.addEventListener('canplaythrough', ready); vid.addEventListener('loadeddata', function(){ setTimeout(ready, 400); });
    vid.load(); if (vid.readyState >= 3) ready();
    setTimeout(ready, 2500);
  }

  /* ---- hero: horizontal motion blur + darkening on scroll; founder photo parallax ---- */
  var hf = document.querySelector('#motion-blur-header feGaussianBlur'), hi = document.querySelector('.header-image.d'), hero = document.getElementById('hero');
  function inOutQuad(o){ return (o /= .5) < 1 ? .5 * o * o : -.5 * (--o * (o - 2) - 1); }
  var spd = document.querySelectorAll('[data-scroll-speed]');
  function onScroll(e){
    if (BP.isMobile()) return;
    var p = Math.min(Math.max(e.scroll / hero.offsetHeight, 0), 1); p = Math.round(inOutQuad(p) * 100) / 100;
    hf.setAttribute('stdDeviation', 50 * p + ' 0');
    hi.style.filter = "url('#motion-blur-header') brightness(" + (.99 - .5 * p) + ') contrast(' + (1.01 + .1 * p) + ')';
    spd.forEach(function(r){ var s = r.getAttribute('data-scroll-speed') * .5, n = r.parentElement.getBoundingClientRect(); var a = 1 - (n.top + n.height) / (innerHeight + n.height); a = Math.min(1, Math.max(0, a)); r.style.transform = 'translate3d(0,' + (s - 2 * s * a) + 'px,0)'; });
  }
  lenis.on('scroll', onScroll); onScroll({ scroll: 0 });

  /* ---- founder section .show (inherited.band scrollObserver) ---- */
  var so = new IntersectionObserver(function(es){ es.forEach(function(e){ if (e.isIntersecting) { e.target.classList.add('show'); so.unobserve(e.target); } }); }, { threshold: .25 });
  document.querySelectorAll('[data-scroll-item]').forEach(function(el){ so.observe(el); });
  function rh(){ var r = document.querySelector('#featured .right'); r.parentElement.style.setProperty('--right-height', r.offsetHeight + 'px'); }
  rh(); addEventListener('resize', rh); addEventListener('load', rh);

  /* ---- selected work: vertical scroll drives the strip sideways ---- */
  var sel = document.querySelector('.sel'), track = document.querySelector('.sel-track');
  if (sel && !BP.isMobile()) {
    var dist = function(){ return Math.max(0, track.scrollWidth - innerWidth); };
    gsap.to(track, { x: function(){ return -dist(); }, ease: 'none', scrollTrigger: { trigger: sel, pin: '.sel-pin', start: 'top top', end: function(){ return '+=' + dist(); }, scrub: .6, invalidateOnRefresh: true } });
  }

  /* ---- the studio (bright-avenue.jp feature): bg wipe, image reveals, current-item list ---- */
  var why = document.getElementById('why');
  new IntersectionObserver(function(es){ es.forEach(function(e){ if (e.isIntersecting) why.classList.add('on'); }); }, { threshold: .05 }).observe(why);
  var items = document.querySelectorAll('.why-item'), lis = document.querySelectorAll('.why-anchors li');
  var io = new IntersectionObserver(function(es){ es.forEach(function(e){ if (e.isIntersecting) e.target.classList.add('in'); }); }, { rootMargin: '0px 0px -18% 0px' });
  items.forEach(function(it){ io.observe(it); });
  var spy = new IntersectionObserver(function(es){ es.forEach(function(e){ if (e.isIntersecting) { var i = Array.prototype.indexOf.call(items, e.target); lis.forEach(function(l, k){ l.classList.toggle('cur', k === i); }); } }); }, { rootMargin: '-45% 0px -45% 0px' });
  items.forEach(function(it){ spy.observe(it); });
  if (!BP.isMobile()) gsap.fromTo('.why-inner', { y: 0 }, { y: function(){ return innerHeight * .3; }, ease: 'none', scrollTrigger: { trigger: why, start: 'bottom 50%', end: 'bottom top', scrub: true } });

  /* ---- meet the artists (monolith.nyc): giant type rises, room fades to black ---- */
  gsap.set('.meet h2 .ln span', { yPercent: 135 });
  var tog = function(s){ root.classList.toggle('on-light', s.isActive && s.progress < .55); };
  gsap.timeline({ scrollTrigger: { trigger: '.meet', start: 'top 35%', end: 'bottom bottom', scrub: .6, onToggle: tog, onUpdate: tog } })
    .to('.meet h2 .ln span', { yPercent: 0, stagger: .1, duration: .3, ease: 'power3.out' }, 0)
    .to('.meet-stick', { backgroundColor: '#010101', duration: .35, ease: 'none' }, .5)
    .to('.meet h2', { color: '#3a3a3a', duration: .3, ease: 'none' }, .5)
    .to('.meet h2', { opacity: 0, y: -40, duration: .2, ease: 'none' }, .8);
})();
