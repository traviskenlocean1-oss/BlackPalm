// Builds every page of Black Palm Tattoo from one template.
// Run: node tools/build.js
const fs = require('fs'), path = require('path'), { execSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
const SITE = 'https://blackpalm.traviskenlocean1.workers.dev';
const PHONE = '(305) 555-0142', TEL = 'tel:+13055550142';

/* ---------------- data ---------------- */
const WORKS = {
  29211944: ['Tribal back piece', 'Blackwork'], 12878043: ['Geometric stag', 'Blackwork'], 8349189: ['Bold line portrait', 'Blackwork'],
  7878273: ['Full back in progress', 'Blackwork'], 12802253: ['Skull forearm', 'Blackwork'], 40444249: ['Ornamental forearm', 'Ornamental'],
  4125661: ['Black rose hand', 'Ornamental'], 3214681: ['Snake and floral arm', 'Ornamental'], 19669301: ['Floral neck piece', 'Fine line'],
  25526235: ['Flower and eye hand', 'Fine line'], 40444269: ['Single line arm', 'Fine line'], 34155039: ['Line art face', 'Fine line'],
  5088486: ['Feather forearm', 'Fine line'], 14565781: ['Fine line sleeve', 'Fine line'], 40444050: ['Cactus line work', 'Fine line'],
  40444259: ['Shark at the waist', 'Fine line'], 4662164: ['Wrist script', 'Fine line'], 7901490: ['Double triangle hand', 'Fine line'],
  6044740: ['Botanical forearm', 'Fine line'], 32203198: ['Skeleton hand', 'Fine line'], 11619031: ['Zeus portrait', 'Realism'],
  17902000: ['Black and grey shoulder', 'Realism'], 18804974: ['Portrait with horns', 'Realism'], 2183131: ['Japanese style sleeve', 'Realism'],
  39081309: ['Owl and hawk forearms', 'Realism'],
};
const ARTISTS = [
  { slug: 'marco-reyes', name: 'Marco Reyes', role: 'Founder', styles: 'Blackwork, Neo-tribal', since: '2016', chip: 'Founder', portrait: 'img/feat-card.jpg', grid: 'img/feat-card.jpg',
    about: 'Marco opened Black Palm in 2016 after a decade of tattooing up and down the coast. His work is heavy black, bold flow and pieces that follow the body.',
    about2: 'He takes on large-scale back pieces, sleeves and cover-ups, and every project starts with a sit-down consult and a hand-drawn layout.',
    about3: 'Booking two to three weeks out. Large pieces are split into sessions of about four hours.',
    works: [29211944, 12878043, 8349189, 7878273] },
  { slug: 'dante-cruz', name: 'Dante Cruz', role: 'Resident artist', styles: 'Blackwork, Ornamental', since: '2018', chip: 'Resident artist', portrait: 'img/a1-c.jpg', grid: 'img/a1.jpg',
    about: 'Dante draws ornamental work the old way, with symmetry, filigree and dotwork that sits clean on the skin for decades.',
    about2: 'He loves forearms, hands and chest panels, and he is the one to ask about turning an old piece into something new.',
    about3: 'Booking about two weeks out. Walk-in flash on Saturdays.',
    works: [40444249, 12802253, 4125661, 3214681] },
  { slug: 'luna-vega', name: 'Luna Vega', role: 'Resident artist', styles: 'Fine line, Floral', since: '2020', chip: 'Resident artist', portrait: 'img/a2-c.jpg', grid: 'img/a2.jpg',
    about: 'Luna works in single-needle fine line: florals, botanicals and quiet little pieces that look drawn on with a pencil.',
    about2: 'Expect soft shading, careful spacing and honest advice about what holds up over time at small sizes.',
    about3: 'Booking about one week out. Most pieces take under two hours.',
    works: [19669301, 25526235, 40444269, 34155039, 5088486, 14565781] },
  { slug: 'theo-grant', name: 'Theo Grant', role: 'Resident artist', styles: 'Realism, Black and grey', since: '2019', chip: 'Resident artist', portrait: 'img/a3-c.jpg', grid: 'img/a3.jpg',
    about: 'Theo does black and grey realism: portraits, statues, animals and anything that needs smooth gradients and real depth.',
    about2: 'Bring a reference photo and he builds the composition around your placement, so the piece reads from across the room.',
    about3: 'Booking three to four weeks out. Realism is done in multiple sessions.',
    works: [11619031, 17902000, 18804974, 2183131, 39081309] },
  { slug: 'nia-brooks', name: 'Nia Brooks', role: 'Guest artist', styles: 'Micro realism, Script', since: '2022', chip: 'Guest spot', portrait: 'img/a4-c.jpg', grid: 'img/a4.jpg',
    about: 'Nia is with us on a guest spot, doing tiny detailed pieces and script that stays crisp: dates, names, small symbols.',
    about2: 'She is great for first tattoos and for anyone who wants something small that still looks finished.',
    about3: 'Limited dates each month. Ask the front desk for her next opening.',
    works: [40444050, 40444259, 4662164, 7901490, 6044740, 32203198] },
];
const artistOf = {}; ARTISTS.forEach(a => a.works.forEach(w => artistOf[w] = a));
const dims = {};
Object.keys(WORKS).forEach(id => { const o = execSync(`magick identify -format "%w %h" "${path.join(ROOT, 'img/work', id + '.jpg')}"`).toString().split(' '); dims[id] = [+o[0], +o[1]]; });

/* ---------------- shared chrome ---------------- */
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
function head({ title, desc, url, img = 'img/hero.jpg', home = false, ld = '' }) {
  return `<!DOCTYPE html>
<html lang="en"${home ? '' : ' class="intro-done sub"'}>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=5">
<meta name="format-detection" content="telephone=no">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${SITE}${url}">
<meta property="og:type" content="website">
<meta property="og:url" content="${SITE}${url}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${SITE}/${img}">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#000000">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%23d50305'/%3E%3Ctext x='16' y='23' font-family='Arial' font-weight='700' font-size='17' text-anchor='middle' fill='%23eee2c5'%3EBP%3C/text%3E%3C/svg%3E">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/site.css">
${ld}
</head>
<body>
<div id="loading"${home ? '' : ' class="hide"'}></div>
<div id="noise"></div>
<svg id="filters" aria-hidden="true"><defs><filter id="motion-blur-header" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur in="SourceGraphic" stdDeviation="0 0"/></filter></defs></svg>`;
}
const NAV = `
  <nav id="nav" aria-label="Main">
    <a href="/">Black Palm</a>
    <div id="nav-right">
      <a class="book" href="/book/">Book a session</a>
      <div class="items">
        <a href="/">Home</a>
        <a href="/work/">Work</a>
        <a href="/#artists">Artists</a>
        <a href="/book/">Book</a>
      </div>
      <a class="mb book" href="/book/">Book</a>
    </div>
  </nav>
  <div id="footer">
    <div class="left">
      <a href="https://instagram.com/" target="_blank" rel="noopener">Instagram</a>
      <a href="https://www.tiktok.com/" target="_blank" rel="noopener">Tik Tok</a>
      <a href="${TEL}">${PHONE}</a>
    </div>
    <span>Scroll</span>
  </div>`;
const FOOT = `
      <footer class="site-foot">
        <span>© 2026 Black Palm Tattoo, Wynwood, Miami</span>
        <nav aria-label="Footer"><a href="/work/">Work</a><a href="/#artists">Artists</a><a href="/book/">Book</a><a href="https://instagram.com/" target="_blank" rel="noopener">Instagram</a></nav>
      </footer>`;
const MBAR = `<div id="mbar"><a href="${TEL}">Call</a><a href="/book/">Book a session</a></div>`;
const SCRIPTS = (extra = '') => `<script src="/js/gsap.min.js"></script>
<script src="/js/ScrollTrigger.min.js"></script>
<script src="/js/lenis.min.js"></script>
<script src="/assets/site.js"></script>${extra}
</body>
</html>
`;
const INFO = `
        <div class="book-info">
          <div><b>Call or text</b><a href="${TEL}">${PHONE}</a></div>
          <div><b>Studio</b>Wynwood, Miami, FL</div>
          <div><b>Hours</b>Tuesday to Saturday, 12pm to 9pm<br>Walk-ins Friday and Saturday</div>
        </div>`;
const LD = extra => `<script type="application/ld+json">${JSON.stringify(Object.assign({ '@context': 'https://schema.org' }, extra))}</script>`;
const SHOP = { '@type': 'TattooParlor', name: 'Black Palm Tattoo', url: SITE + '/', image: SITE + '/img/hero.jpg', telephone: '+1-305-555-0142', priceRange: '$$',
  address: { '@type': 'PostalAddress', addressLocality: 'Miami', addressRegion: 'FL', addressCountry: 'US', streetAddress: 'Wynwood' },
  openingHoursSpecification: [{ '@type': 'OpeningHoursSpecification', dayOfWeek: ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], opens: '12:00', closes: '21:00' }], areaServed: 'Miami-Dade County' };
const workImg = (id, cls = '', lazy = true) => `<img${cls ? ` class="${cls}"` : ''} src="/img/work/${id}.jpg" alt="${esc(WORKS[id][0])}, ${WORKS[id][1].toLowerCase()} tattoo by ${esc(artistOf[id].name)}" width="${dims[id][0]}" height="${dims[id][1]}"${lazy ? ' loading="lazy"' : ''}>`;
function write(rel, html) { const f = path.join(ROOT, rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, html); console.log('wrote', rel); }

/* ---------------- home ---------------- */
const SELECTED = [29211944, 19669301, 11619031, 40444249, 25526235, 17902000, 12878043, 40444259];
const cards = ARTISTS.slice(1).map(a => `
        <article class="a-card"><a href="/artists/${a.slug}/" class="ph"><img src="/${a.grid}" alt="${a.name}, tattoo artist" loading="lazy" width="900" height="1200"><span class="chip">${a.chip}</span></a><h4><a href="/artists/${a.slug}/">${a.name}</a></h4><p class="st">${a.styles}</p><a class="btn" href="/book/" data-artist="${a.name}">Book with ${a.name.split(' ')[0]}</a></article>`).join('');
write('index.html', head({ title: 'Black Palm Tattoo | Custom Tattoo Studio in Wynwood, Miami', desc: 'Black Palm Tattoo is a custom tattoo studio in Wynwood, Miami. Blackwork, fine line and realism by licensed artists. Book a consult or walk in Friday and Saturday.', url: '/', home: true, ld: LD(SHOP) }) + `
<div id="preloader" aria-hidden="true">
  <video muted loop playsinline preload="auto">
    <source src="/video/preloader.mp4" media="(min-width:1025px)" type="video/mp4">
    <source src="/video/preloader-m.mp4" type="video/mp4">
  </video>
</div>
<div id="page">${NAV}
  <main id="main">
    <header id="hero" class="header">
      <img class="header-image d" src="/img/hero.jpg" alt="Tattooed artist at Black Palm Tattoo under red studio light" width="2400" height="1600" fetchpriority="high">
      <img class="header-image m" src="/img/hero-m.jpg" alt="" width="800" height="1422">
      <h1 class="h1 header-title" aria-label="Black Palm Tattoo, Miami" data-groups="BL|ACK|PA|LM"><span class="sr">Black Palm Tattoo</span></h1>
      <h2 class="h3 header-subtitle"><span>Est. 2016</span><span>Blackwork</span><span>Fine line</span></h2>
      <div class="header-mobile">
        <span>Blackwork · Fine line · Realism</span>
        <span>Wynwood, Miami</span>
        <a class="btn" href="/book/">Book a session</a>
      </div>
    </header>

    <section id="featured" class="member" data-scroll-item aria-label="Founder Marco Reyes">
      <div class="bg" data-scroll-speed="300"><picture><img src="/img/feat-bg.jpg" alt="Marco Reyes, founder of Black Palm Tattoo" loading="lazy" width="2000" height="1250"></picture></div>
      <h2 class="h1 title" data-scroll-item data-lines="MARCO|REYES" aria-label="Marco Reyes"></h2>
      <div class="right">
        <div class="h3 description">
          <div class="row" data-scroll-item><span>Founder</span><span>(&nbsp;&nbsp;&nbsp;&nbsp;MIA&nbsp;&nbsp;&nbsp;&nbsp;)</span></div>
          <div class="row" data-scroll-item><span>Blackwork</span></div>
          <div class="row" data-scroll-item><span>Neo-tribal</span></div>
        </div>
        <div class="card">
          <img src="/img/feat-card.jpg" alt="Marco Reyes portrait" loading="lazy" width="1100" height="1650">
          <a class="bk" href="/artists/marco-reyes/">See Marco's work</a>
        </div>
      </div>
    </section>

    <section class="sel" aria-labelledby="sel-t">
      <div class="sel-pin">
        <div class="sel-head"><h2 id="sel-t">Selected<br>work</h2><p>Healed and fresh pieces from the chair. Every one drawn for the person wearing it.</p></div>
        <div class="sel-track">${SELECTED.map(id => `
          <figure class="sel-item"><a class="ph" href="/work/">${workImg(id)}</a><figcaption><span>${WORKS[id][1]}</span><span>${artistOf[id].name}</span></figcaption></figure>`).join('')}
          <a class="sel-end" href="/work/">See all work</a>
        </div>
      </div>
    </section>

    <section id="why" class="why" aria-labelledby="why-t">
      <div class="why-inner">
        <div class="why-lead">
          <div class="why-lead-inner">
            <div class="why-head">
              <h2 class="why-ttl" id="why-t">The studio</h2>
              <ul class="why-anchors">
                <li class="cur"><a href="#w1"><span>01</span>Drawn for you</a></li>
                <li><a href="#w2"><span>02</span>Clean, licensed room</a></li>
                <li><a href="#w3"><span>03</span>With you through the heal</a></li>
              </ul>
            </div>
            <div>
              <p class="why-catch">Custom work only. Nothing off the wall.</p>
              <a class="btn" href="/book/">Book a free consult</a>
            </div>
          </div>
        </div>
        <div class="why-main">
          <div class="why-main-inner">
            <article class="why-item" id="w1">
              <div class="why-img"><img src="/img/w1.jpg" alt="Artist outlining a geometric blackwork tattoo" loading="lazy" width="1400" height="1987"></div>
              <span class="why-num">01</span>
              <h3>Drawn for you, not picked from a binder</h3>
              <p>Every piece starts with a consult. We sketch around your body, your placement and your story, then refine it with you before the needle touches skin.</p>
            </article>
            <article class="why-item" id="w2">
              <div class="why-img"><img src="/img/w2.jpg" alt="Gloved artist tattooing a skull on a forearm" loading="lazy" width="1400" height="2100"></div>
              <span class="why-num">02</span>
              <h3>A clean room and licensed artists</h3>
              <p>Single-use needles, barrier film on every surface and Florida-licensed artists. You watch us open everything fresh.</p>
            </article>
            <article class="why-item" id="w3">
              <div class="why-img"><img src="/img/w3.jpg" alt="Healed fine line flower tattoo on a hand" loading="lazy" width="1400" height="2100"></div>
              <span class="why-num">03</span>
              <h3>We stay with you through the heal</h3>
              <p>You leave with an aftercare kit, get a check-in text on day three, and a free touch-up within 60 days if anything settles unevenly.</p>
            </article>
          </div>
        </div>
      </div>
    </section>

    <section class="meet" aria-label="Meet the artists">
      <div class="meet-stick"><h2><span class="ln"><span>Meet</span></span><span class="ln"><span>the</span></span><span class="ln"><span>artists</span></span></h2></div>
    </section>

    <section id="artists" class="artists" aria-labelledby="art-t">
      <div class="artists-head">
        <h3 id="art-t">Artists</h3>
        <p>Five artists, five specialties. Open an artist to see their work, or tell us the idea and we'll match you.</p>
      </div>
      <div class="grid">${cards}
      </div>
    </section>

    <section id="before" class="before" data-light aria-labelledby="bf-t">
      <div class="before-inner">
        <div class="before-head">
          <h2 id="bf-t">Before you book</h2>
          <p>The short version of everything people ask us at the front desk.</p>
          <a class="btn" href="/book/" style="color:#141414">Book a session</a>
        </div>
        <div class="before-main">
          <dl>
            <div class="r"><dt>Walk-ins</dt><dd>Friday and Saturday, 12pm to 6pm. First come, first inked.</dd></div>
            <div class="r"><dt>Deposit</dt><dd>$100 holds your spot and comes off your final price.</dd></div>
            <div class="r"><dt>Shop minimum</dt><dd>$120 for small pieces. Larger work is quoted at your consult.</dd></div>
            <div class="r"><dt>Age</dt><dd>18 and up with a valid photo ID. No exceptions.</dd></div>
            <div class="r"><dt>Aftercare</dt><dd>Every client leaves with a kit and a written healing guide.</dd></div>
          </dl>
        </div>
      </div>
    </section>

    <section class="reveal" aria-label="Book your session">
      <div class="reveal-visual"><img src="/img/studio.jpg" alt="Black Palm artist tattooing a client in the Wynwood studio" loading="lazy" width="2400" height="1350"></div>
      <div class="reveal-inner">
        <small>Wynwood, Miami</small>
        <h2>Bring the idea. We'll take it from there.</h2>
        <p>Send a few details and an artist texts you back the same day with a time for your consult.</p>
        <div class="acts"><a class="btn solid" href="/book/">Book a session</a><a class="btn" href="${TEL}">Call ${PHONE}</a></div>
      </div>
    </section>

    <section class="close" aria-labelledby="close-t">
      <div class="close-grid">
        <h2 id="close-t" data-lines="Black|Palm" aria-label="Black Palm"></h2>${INFO}
      </div>${FOOT}
    </section>
  </main>
  ${MBAR}
</div>
` + SCRIPTS('\n<script src="/assets/home.js"></script>'));

/* ---------------- work ---------------- */
const ZOOM = [12878043, 19669301, 11619031, 40444249, 29211944, 25526235, 17902000, 40444259, 4125661];
const allIds = Object.keys(WORKS).map(Number);
const order = [29211944, 19669301, 11619031, 40444249, 25526235, 12878043, 17902000, 40444050, 3214681, 34155039, 2183131, 8349189, 5088486, 39081309, 4125661, 40444259, 18804974, 14565781, 12802253, 4662164, 7878273, 7901490, 6044740, 40444269, 32203198];
allIds.forEach(id => { if (!order.includes(id)) order.push(id); });
write('work/index.html', head({ title: 'Tattoo Work | Black Palm Tattoo, Miami', desc: 'Blackwork, fine line, ornamental and realism tattoos from the artists at Black Palm Tattoo in Wynwood, Miami.', url: '/work/', img: 'img/work/29211944.jpg', ld: LD({ '@type': 'CollectionPage', name: 'Tattoo work', isPartOf: SHOP }) }) + `
<div id="page">${NAV}
  <main>
    <section class="zoom" aria-label="Our work">
      <div class="zoom-stage">
        <div class="zoom-grid">${ZOOM.map((id, i) => `<div class="z">${workImg(id, '', i !== 4)}</div>`).join('')}</div>
        <h1 class="zoom-title" data-lines="The work" aria-label="The work"></h1>
        <span class="zoom-hint">Scroll</span>
      </div>
    </section>
    <div class="filters" role="group" aria-label="Filter by style">
      <button type="button" data-f="all" aria-pressed="true">All</button>${['Blackwork', 'Fine line', 'Realism', 'Ornamental'].map(s => `<button type="button" data-f="${s}" aria-pressed="false">${s}</button>`).join('')}
    </div>
    <section class="wall" aria-label="Tattoo gallery">${order.map(id => `
      <figure data-style="${WORKS[id][1]}">${workImg(id)}<figcaption><span>${WORKS[id][0]}</span><span>${artistOf[id].name}</span></figcaption></figure>`).join('')}
    </section>
    <div class="lb" role="dialog" aria-modal="true" aria-label="Tattoo photo"><button type="button">Close</button><img alt=""><p></p></div>
    <div class="cta-band"><h2>See something close to what you want? Tell us about it.</h2><a class="btn solid" href="/book/">Book a session</a></div>${FOOT}
  </main>
  ${MBAR}
</div>
` + SCRIPTS());

/* ---------------- artists ---------------- */
ARTISTS.forEach((a, i) => {
  const nx = ARTISTS[(i + 1) % ARTISTS.length];
  const first = a.name.split(' ')[0];
  write(`artists/${a.slug}/index.html`, head({ title: `${a.name}, ${a.styles} Tattoo Artist | Black Palm Tattoo, Miami`, desc: `${a.name} tattoos ${a.styles.toLowerCase()} at Black Palm Tattoo in Wynwood, Miami. See recent work and book a consult.`, url: `/artists/${a.slug}/`, img: `img/work/${a.works[0]}.jpg`,
    ld: LD({ '@type': 'Person', name: a.name, jobTitle: 'Tattoo artist', worksFor: SHOP }) }) + `
<div id="page">${NAV}
  <main>
    <section class="sub-top">
      <div class="a-top">
        <div class="thumb"><img src="/${a.portrait}" alt="${a.name}" width="900" height="1200"></div>
        <h1 class="big-name" data-lines="${a.name.split(' ').join('|')}" aria-label="${a.name}"></h1>
      </div>
      <div class="meta">
        <div class="wide"><b>Styles</b>${a.styles}</div>
        <div><b>${a.role}</b>Since ${a.since}</div>
        <div><b>Location</b>Wynwood, Miami</div>
        <div class="wide"><b>Book</b><a href="/book/" data-artist="${a.name}" style="border-bottom:1px solid rgba(238,226,197,.4)">Book with ${first}</a></div>
      </div>
    </section>
    <div class="a-hero">${workImg(a.works[0], '', false)}</div>
    <section class="a-about">
      <span class="lbl">About the artist</span>
      <p class="txt">${a.about}</p>
      <p class="txt2">${a.about2}</p>
      <p class="txt3">${a.about3}</p>
    </section>
    <section class="latest" aria-labelledby="lw-t">
      <h2 id="lw-t">Latest works</h2>
      <div class="mosaic">
        <div class="main">${workImg(a.works[0])}</div>
        <div class="list">${a.works.map((id, k) => `<button type="button" data-src="/img/work/${id}.jpg"${k === 0 ? ' class="on"' : ''} aria-label="Show ${esc(WORKS[id][0])}">${workImg(id)}</button>`).join('')}</div>
      </div>
    </section>
    <div class="cta-band"><h2>Want a piece from ${first}?</h2><a class="btn solid" href="/book/" data-artist="${a.name}">Book with ${first}</a></div>
    <div class="next-artist"><div><small>Next artist</small><a class="n" href="/artists/${nx.slug}/">${nx.name}</a></div><a class="btn" href="/#artists">All artists</a></div>${FOOT}
  </main>
  ${MBAR}
</div>
` + SCRIPTS());
});

/* ---------------- book ---------------- */
write('book/index.html', head({ title: 'Book a Tattoo Session | Black Palm Tattoo, Miami', desc: 'Book a tattoo consult at Black Palm Tattoo in Wynwood, Miami. Pick an artist, tell us your idea and an artist texts you back the same day.', url: '/book/', ld: LD(SHOP) }) + `
<div id="page">${NAV}
  <main>
    <section class="book-page" aria-labelledby="book-t">
      <span class="eyebrow">Consults are free</span>
      <div class="book-top">
        <h1 class="book-title" id="book-t" data-lines="Book|a session" aria-label="Book a session"></h1>${INFO}
        <form id="bookForm" novalidate>
          <div><label for="f-name">Name</label><input id="f-name" name="name" autocomplete="name" required></div>
          <div><label for="f-phone">Phone</label><input id="f-phone" name="phone" type="tel" autocomplete="tel" required></div>
          <div><label for="f-artist">Artist</label><select id="f-artist" name="artist"><option>Any artist</option>${ARTISTS.map(a => `<option>${a.name}</option>`).join('')}</select></div>
          <div><label for="f-place">Placement and size</label><input id="f-place" name="placement" placeholder="Forearm, about palm size"></div>
          <div class="full"><label for="f-idea">Your idea</label><textarea id="f-idea" name="idea" placeholder="A fine line palm frond with my daughter's birth date."></textarea></div>
          <input class="hp" name="_gotcha" tabindex="-1" autocomplete="off" aria-hidden="true">
          <div class="full"><button class="btn solid" type="submit">Request my session</button></div>
          <p class="form-msg" role="status" aria-live="polite"></p>
        </form>
      </div>
    </section>
    <section class="after" aria-labelledby="af-t">
      <h2 id="af-t">How it works</h2>
      <ol>
        <li><b>Send the idea</b>Fill out the form or call. Photos of references help, and you can text them after.</li>
        <li><b>Free consult</b>Fifteen minutes with your artist, in the studio or on a call, to talk placement, size and price.</li>
        <li><b>Hold your date</b>A $100 deposit holds the session and comes off your final price.</li>
        <li><b>Tattoo and heal</b>You leave with an aftercare kit, a day-three check-in and a free touch-up within 60 days.</li>
      </ol>
    </section>
    <section class="after" aria-labelledby="bf2-t" style="margin-top:0">
      <h2 id="bf2-t">Before you come in</h2>
      <ol>
        <li><b>Eat and hydrate</b>A full meal and water before your session make a long sitting much easier.</li>
        <li><b>Bring ID</b>18 and up with a valid photo ID. No exceptions.</li>
        <li><b>Skip the drinks</b>No alcohol for 24 hours before. It thins the blood and slows the work.</li>
        <li><b>Wear the right clothes</b>Something loose that gives easy access to the placement.</li>
      </ol>
    </section>${FOOT.replace('<footer class="site-foot">', '<footer class="site-foot" style="margin:40px var(--margin) 0;padding-bottom:60px">')}
  </main>
  ${MBAR}
</div>
` + SCRIPTS());
