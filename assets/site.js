/* Black Palm Tattoo — shared behaviour for every page */
(function(){
  'use strict';
  var root = document.documentElement;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  gsap.registerPlugin(ScrollTrigger);
  root.style.setProperty('--rvw', root.clientWidth / 100 + 'px');
  var BP = window.BP = { isMobile: function(){ return innerWidth <= 1024; } };

  /* ---- letter markup (inherited.band: .letter > .letter-container > .letter-content) ---- */
  var MIN = [0.15, 0.02, 0.11, 0.03, 0.12, 0.09, 0.05, 0.14, 0.1, 0.08], mi = 0;
  function letter(ch, check){
    var s = document.createElement('span'); s.className = 'letter noise'; s.dataset.min = MIN[mi++ % MIN.length];
    if (check) s.dataset.checkScroll = 'true';
    s.innerHTML = '<span class="letter-container"><span class="letter-content"></span></span>';
    s.querySelector('.letter-content').textContent = ch; s.setAttribute('aria-hidden', 'true'); return s;
  }
  document.querySelectorAll('[data-groups]').forEach(function(t){
    t.dataset.groups.split('|').forEach(function(g){ var gr = document.createElement('span'); gr.className = 'group'; g.split('').forEach(function(c){ gr.appendChild(letter(c)); }); t.appendChild(gr); });
  });
  document.querySelectorAll('[data-lines]').forEach(function(t){
    t.dataset.lines.split('|').forEach(function(l){ var ln = document.createElement('span'); ln.className = 'line ln'; l.split('').forEach(function(c){ if (c === ' ') { ln.appendChild(document.createTextNode(' ')); return; } ln.appendChild(letter(c, true)); }); t.appendChild(ln); });
  });

  /* ---- noise letter: port of inherited.band's per-letter SVG goo + turbulence filter ---- */
  var defs = document.querySelector('#filters defs');
  function Noise(el){
    var self = this; this.el = el; this.check = !!el.dataset.checkScroll; this.ease = Math.random();
    this.min = Number(el.dataset.min || 0); this.max = 30 + Math.random() * 10; this.cur = this.max; this.inView = true;
    this.id = 'f' + Math.floor(Math.random() * 1e8);
    var f = document.createElementNS('http://www.w3.org/2000/svg', 'filter'); f.setAttribute('id', this.id);
    f.innerHTML = '<feGaussianBlur in="SourceGraphic" stdDeviation="0" result="blur"/><feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 18 -8" result="goo"/><feTurbulence type="fractalNoise" baseFrequency="0.01 1" numOctaves="1" seed="1" result="noise"/><feDisplacementMap in="goo" in2="noise" scale="0" result="d"/><feComposite in="SourceGraphic" in2="d" operator="atop"/>';
    var tv = document.createElementNS('http://www.w3.org/2000/svg', 'filter'); tv.setAttribute('id', this.id + 'tv');
    tv.innerHTML = '<feTurbulence type="fractalNoise" baseFrequency="1" numOctaves="5" result="warp"/><feDisplacementMap xChannelSelector="R" yChannelSelector="G" scale="50" in="SourceGraphic" in2="warp"/>';
    defs.appendChild(f); defs.appendChild(tv);
    this.blur = f.querySelector('feGaussianBlur'); this.turb = f.querySelector('feTurbulence'); this.disp = f.querySelector('feDisplacementMap'); this.tvd = tv.querySelector('feDisplacementMap');
    this.target = el.firstElementChild; this.target.style.filter = 'url(#' + this.id + ') url(#' + this.id + 'tv)';
    this.loop = this.loop.bind(this);
    new IntersectionObserver(function(es){ es.forEach(function(e){
      if (e.isIntersecting) { if (!self.inView) { self.target.style.filter = 'url(#' + self.id + ') url(#' + self.id + 'tv)'; self.inView = true; requestAnimationFrame(self.loop); if (self.check) self.play(.5); } }
      else { self.inView = false; self.target.style.filter = 'none'; }
    }); }).observe(el);
    requestAnimationFrame(this.loop);
  }
  function fbm(t){ var e = 0, a = .5; for (var r = 0; r < 4; r++) { e += a * Math.sin(t); t *= 2; a *= .5; } return e; }
  function map(v, a, b, c, d){ return c + (d - c) * ((v - a) / (b - a)); }
  Noise.prototype.loop = function(t){
    if (!this.inView) return; t = t || 0;
    var rest = fbm(t * .01 - t * this.ease * .01), e = this.min, i = this.max;
    this.blur.setAttribute('stdDeviation', this.cur * .1 + this.ease * this.cur * .01);
    this.turb.setAttribute('baseFrequency', map(this.cur, i, e, 0, .01) + ' ' + map(this.cur, i, e, .9, 1));
    this.disp.setAttribute('scale', this.cur * 1.5 + rest * 60 * e);
    this.tvd.setAttribute('scale', this.cur * .5 + rest * 60 * e);
    requestAnimationFrame(this.loop);
  };
  Noise.prototype.play = function(d){ var o = this; o.cur = o.max; gsap.fromTo(o, { cur: o.max }, { cur: o.min, duration: 2, ease: 'power4.out', delay: d || 0 }); };
  BP.noises = [];
  document.querySelectorAll('.letter.noise').forEach(function(el){ BP.noises.push(new Noise(el)); });
  BP.headerNoises = BP.noises.filter(function(n){ return n.el.closest('.header-title'); });
  /* sub-page big titles: settle the noise after the page enters */
  if (root.classList.contains('sub')) setTimeout(function(){ BP.noises.forEach(function(n, i){ if (n.el.getBoundingClientRect().top < innerHeight) n.play(.15 + i * .03); }); }, 250);

  /* ---- smooth scroll ---- */
  var lenis = BP.lenis = new Lenis({ anchors: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(function(t){ lenis.raf(t * 1000); }); gsap.ticker.lagSmoothing(0);

  /* ---- page transitions: scale + fade out, then the next page scales in ---- */
  document.querySelectorAll('a[href]').forEach(function(a){
    var href = a.getAttribute('href');
    if (!href || href.charAt(0) === '#' || /^(https?:|tel:|mailto:)/.test(href) || a.target === '_blank') return;
    a.addEventListener('click', function(e){
      var url = new URL(href, location.href);
      if (url.pathname === location.pathname && url.hash) return;
      e.preventDefault();
      try { sessionStorage.setItem('bp-nav', '1'); } catch (x) {}
      root.classList.add('is-leaving');
      setTimeout(function(){ location.href = url.href; }, reduce ? 0 : 560);
    });
  });
  addEventListener('pageshow', function(e){ if (e.persisted) root.classList.remove('is-leaving'); });

  /* ---- current page in the nav ---- */
  var path = location.pathname.replace(/index\.html$/, '');
  document.querySelectorAll('#nav .items a').forEach(function(a){
    var p = new URL(a.href).pathname; if (p !== '/' && path.indexOf(p) === 0) a.classList.add('cur');
  });

  /* ---- light sections flip the nav to dark text ---- */
  document.querySelectorAll('[data-light]').forEach(function(s){
    ScrollTrigger.create({ trigger: s, start: 'top 40px', end: 'bottom 40px', onToggle: function(st){ root.classList.toggle('on-light', st.isActive); } });
  });

  /* ---- "Book with X" remembers the artist; /book reads it ---- */
  document.querySelectorAll('[data-artist]').forEach(function(a){ a.addEventListener('click', function(){ try { sessionStorage.setItem('bp-artist', a.dataset.artist); } catch (x) {} }); });

  /* ---- booking form: honeypot + 3s time trap (demo: nothing leaves the page) ---- */
  var form = document.getElementById('bookForm');
  if (form) {
    var t0 = Date.now(), msg = form.querySelector('.form-msg'), sel = document.getElementById('f-artist');
    var want = new URLSearchParams(location.search).get('artist'); try { want = want || sessionStorage.getItem('bp-artist'); } catch (x) {}
    if (want && sel) Array.prototype.forEach.call(sel.options, function(o){ if (o.text === want) sel.value = o.text; });
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var bot = form._gotcha.value || Date.now() - t0 < 3000;
      var name = form.name.value.trim(), phone = form.phone.value.replace(/\D/g, '');
      if (!bot && (!name || phone.length < 10)) { msg.className = 'form-msg err'; msg.textContent = 'Add your name and a 10-digit phone number so an artist can text you.'; return; }
      msg.className = 'form-msg ok';
      msg.textContent = 'Got it' + (name ? ', ' + name.split(' ')[0] : '') + '. An artist will text you today to set up your consult.';
      form.reset();
    });
  }

  /* ---- show the mobile call/book bar after the first screen ---- */
  lenis.on('scroll', function(e){ root.classList.toggle('past-hero', e.scroll > innerHeight * .6); });

  /* ================= work page ================= */
  var zoom = document.querySelector('.zoom');
  if (zoom) {
    var grid = zoom.querySelector('.zoom-grid');
    var startScale = function(){ var c = grid.children[4].getBoundingClientRect(); return Math.max(innerWidth / c.width, innerHeight / c.height) * 1.02; };
    gsap.fromTo(grid, { scale: startScale }, { scale: 1, ease: 'none', scrollTrigger: { trigger: zoom, start: 'top top', end: 'bottom bottom', scrub: .5, invalidateOnRefresh: true } });
    gsap.to('.zoom-title, .zoom-hint', { opacity: 0, y: -40, ease: 'none', scrollTrigger: { trigger: zoom, start: 'top top', end: '35% top', scrub: true } });
  }
  var filters = document.querySelectorAll('.filters button'), figs = document.querySelectorAll('.wall figure');
  filters.forEach(function(b){ b.addEventListener('click', function(){
    filters.forEach(function(x){ x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
    var f = b.dataset.f;
    figs.forEach(function(g){ g.classList.toggle('hide', f !== 'all' && g.dataset.style !== f); });
    ScrollTrigger.refresh();
  }); });
  var lb = document.querySelector('.lb');
  if (lb) {
    var lbImg = lb.querySelector('img'), lbCap = lb.querySelector('p');
    var close = function(){ lb.classList.remove('open'); lenis.start(); };
    figs.forEach(function(g){ g.tabIndex = 0; var open = function(){ lbImg.src = g.querySelector('img').src; lbImg.alt = g.querySelector('img').alt; lbCap.textContent = g.querySelector('figcaption').textContent.replace(/\s+/g, ' '); lb.classList.add('open'); lenis.stop(); lb.querySelector('button').focus(); };
      g.addEventListener('click', open); g.addEventListener('keydown', function(e){ if (e.key === 'Enter') open(); }); });
    lb.addEventListener('click', function(e){ if (e.target !== lbImg) close(); });
    addEventListener('keydown', function(e){ if (e.key === 'Escape') close(); });
  }

  /* ================= artist page ================= */
  var ah = document.querySelector('.a-hero img');
  if (ah) gsap.fromTo(ah, { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: '.a-hero', start: 'top bottom', end: 'bottom top', scrub: true } });
  var mosaic = document.querySelector('.mosaic');
  if (mosaic) {
    var mainImg = mosaic.querySelector('.main img'), btns = mosaic.querySelectorAll('.list button');
    var show = function(b){ if (b.classList.contains('on')) return; btns.forEach(function(x){ x.classList.toggle('on', x === b); }); mainImg.style.opacity = 0; setTimeout(function(){ mainImg.src = b.dataset.src; mainImg.alt = b.querySelector('img').alt; mainImg.style.opacity = 1; }, 220); };
    btns.forEach(function(b){ b.addEventListener('click', function(){ show(b); }); b.addEventListener('mouseenter', function(){ show(b); });
      if (!BP.isMobile()) ScrollTrigger.create({ trigger: b, start: 'top 55%', end: 'bottom 55%', onToggle: function(s){ if (s.isActive) show(b); } }); });
  }

  /* ---- generic reveal for cards ---- */
  var ac = new IntersectionObserver(function(es){ es.forEach(function(e){ if (e.isIntersecting) { e.target.classList.add('in'); ac.unobserve(e.target); } }); }, { threshold: .12 });
  document.querySelectorAll('.a-card').forEach(function(c, i){ c.style.transitionDelay = (i % 4) * .09 + 's'; ac.observe(c); });

  addEventListener('resize', function(){ root.style.setProperty('--rvw', root.clientWidth / 100 + 'px'); });
  addEventListener('load', function(){ ScrollTrigger.refresh(); });
})();
