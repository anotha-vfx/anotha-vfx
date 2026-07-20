/* videos.js — portfolio videos (managed by ANOTHA Studio)
   PROJECTS = horizontal work cards · REELS = vertical short-form cards.
   Cards are rendered into the page here, BEFORE main.js runs, so all
   the players / hover / lightbox logic hooks onto them normally.
   ── You can hand-edit the two arrays below, or use ANOTHA Studio. ── */

const PROJECTS = [
  {
    vimeo: "1190417066", youtube: "",
    title: "Passage Monster VFX",
    category: "VFX Compositing",
    description: "Cinematic web-slinging sequence with custom particle systems, compositing, and dynamic lighting.",
    tags: ["After Effects","Blender","Compositing"],
    gradient: "linear-gradient(135deg,#12002a 0%,#3d0066 50%,#1a0035 100%)",
    year: "2026",
    views: "2989",
    viewsBase: "", viewsDate: "2026-07-20", viewsRate: "100"
  },
  {
    vimeo: "1204691670", youtube: "",
    title: "Spiderman VFX",
    category: "Atmospheric VFX",
    description: "Atmospheric New-York City environment with volumetric fog, practical lighting FX, and creature compositing.",
    tags: ["Blender","DaVinci Resolve","VFX"],
    gradient: "linear-gradient(135deg,#001510 0%,#003322 50%,#001a14 100%)",
    year: "2026",
    views: "2765",
    viewsBase: "", viewsDate: "2026-07-20", viewsRate: "98"
  },
  {
    vimeo: "1210216476", youtube: "",
    title: "The Hollow House",
    category: "VFX",
    description: "Making a mad look dead and scary...",
    tags: ["After Effects"],
    gradient: "linear-gradient(135deg,#12002a 0%,#3d0066 50%,#1a0035 100%)",
    year: "2026",
    views: "2534",
    viewsBase: "", viewsDate: "2026-07-20", viewsRate: "100"
  },
  {
    vimeo: "1200580512", youtube: "",
    title: "From bedroom to Subway Metro • VFX compositing",
    category: "3D & Environment",
    description: "Subway metro composite • Green screen VFX breakdown",
    tags: ["After Effects","Davinci Resolve","Blender"],
    gradient: "linear-gradient(135deg,#00101e 0%,#001f3d 50%,#000d1a 100%)",
    year: "2026",
    views: "2346",
    viewsBase: "", viewsDate: "2026-07-20", viewsRate: "98"
  },
  {
    vimeo: "1192839854", youtube: "",
    title: "Project Hail Mary Recreation",
    category: "Motion Graphics",
    description: "Recreated the Petrova Line reveal from Project Hail Mary (2026) — such an inspiring shot to break down and rebuild.",
    tags: ["After Effects","Davinci Resolve","Blender"],
    gradient: "linear-gradient(135deg,#100800 0%,#2e1800 50%,#180d00 100%)",
    year: "2026",
    views: "2178",
    viewsBase: "", viewsDate: "2026-07-20", viewsRate: "100"
  },
  {
    vimeo: "1190425024", youtube: "",
    title: "Invisible Effect",
    category: "Visual Effects",
    description: "Turning a Normal clip into an invisible VFX.",
    tags: ["After Effects"],
    gradient: "linear-gradient(135deg,#100800 0%,#2e1800 50%,#180d00 100%)",
    year: "2025",
    views: "1896",
    viewsBase: "", viewsDate: "2026-07-20", viewsRate: "100"
  },
  {
    vimeo: "1190423583", youtube: "",
    title: "Video Editing",
    category: "Motion Graphics",
    description: "Compilation of motion graphics and kinetic typography across film and digital campaigns.",
    tags: ["After Effects","Davinci Resolve","Motion"],
    gradient: "linear-gradient(135deg,#100800 0%,#2e1800 50%,#180d00 100%)",
    year: "2026",
    views: "1554",
    viewsBase: "", viewsDate: "2026-07-20", viewsRate: "100"
  }
];

const REELS = [
  { vimeo: "1190436345", youtube: "", title: "Real Estate", tag: "Editing", gradient: "linear-gradient(160deg,#12002a,#3d0066,#1a0035)", views: "3786", viewsBase: "", viewsDate: "2026-07-20", viewsRate: "100" },
  { vimeo: "1195672726", youtube: "", title: "Green Screen Action", tag: "War Operation VFX", gradient: "linear-gradient(160deg,#001510,#003322,#001a14)", views: "3097", viewsBase: "", viewsDate: "2026-07-20", viewsRate: "70" },
  { vimeo: "1192841105", youtube: "", title: "Fast Paced Edits", tag: "Editing", gradient: "linear-gradient(160deg,#100800,#2e1800,#180d00)", views: "1896", viewsBase: "", viewsDate: "2026-07-20", viewsRate: "100" },
  { vimeo: "1192841961", youtube: "", title: "3D One Piece (Anime)", tag: "3D & Environment", gradient: "linear-gradient(160deg,#00101e,#001f3d,#000d1a)", views: "2567", viewsBase: "", viewsDate: "2026-07-20", viewsRate: "120" }
];

/* ── Render (runs immediately; containers already parsed above) ── */
(function () {
  'use strict';
  function esc(s){ return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); }

  /* ── View count ──────────────────────────────────────────────────
     Two modes per video:
       MANUAL : views = "12.4K"  → shown exactly as typed
       AUTO   : viewsBase + viewsDate + viewsRate → projects the count
                forward from a REAL number you recorded on a REAL date,
                at your REAL observed daily rate.
     Auto is an ESTIMATE and drifts — re-enter the true number in
     ANOTHA Studio every so often to re-anchor it.                    */
  function fmtViews(n) {
    n = Math.round(n);
    if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (n >= 1000)    return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return String(n);
  }
  /* "12.4K" / "1.2M" / "2,989" / "2989"  →  a plain number (NaN if unparseable) */
  function parseViewNum(s) {
    s = String(s).trim().replace(/,/g, '');
    var m = s.match(/^([\d.]+)\s*([KkMm])?$/);
    if (!m) return NaN;
    var n = parseFloat(m[1]);
    if (isNaN(n)) return NaN;
    var suf = (m[2] || '').toUpperCase();
    if (suf === 'K') n *= 1000;
    if (suf === 'M') n *= 1000000;
    return n;
  }
  /* returns { text: what to show, num: the value to count up to } */
  function viewsInfo(item) {
    var rate = parseFloat(item.viewsRate);
    var base = parseFloat(item.viewsBase);
    if (rate > 0 && !isNaN(base) && item.viewsDate) {
      var start = new Date(item.viewsDate + 'T00:00:00');
      if (!isNaN(start.getTime())) {
        var days = Math.floor((Date.now() - start.getTime()) / 86400000);
        if (days < 0) days = 0;
        if (days > 3650) days = 3650;            // sanity cap
        var total = base;
        for (var d = 0; d < days; d++) {
          // deterministic wobble so the number is stable all day, but
          // day-to-day growth varies naturally (±15%)
          var seed = Math.floor(start.getTime() / 86400000) + d;
          var r = Math.abs(Math.sin(seed * 12.9898) * 43758.5453) % 1;
          total += rate * (0.85 + r * 0.3);
        }
        return { text: fmtViews(total), num: total };
      }
    }
    var t = item.views || '';
    return { text: t, num: parseViewNum(t) };
  }
  /* badge markup + the data the roll-up animation needs */
  function viewsAttrs(vi) {
    return isFinite(vi.num)
      ? ' data-count="' + vi.num + '" data-final="' + esc(vi.text) + '"'
      : '';
  }
  var ARROW = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M7 17L17 7M17 7H7M17 7V17"/></svg>';

  var grid = document.getElementById('projectsGrid');
  if (grid) {
    grid.innerHTML = PROJECTS.map(function (p, i) {
      var num = String(i + 1).padStart(2, '0');
      var tags = (p.tags || []).map(function (t) { return '<span class="tag">' + esc(t) + '</span>'; }).join('\n              ');
      var vi = viewsInfo(p);
      return '<article class="project-card" data-vimeo="' + esc(p.vimeo || '') + '" data-youtube="' + esc(p.youtube || '') + '">' +
        '<div class="project-link"><div class="project-media">' +
          '<div class="project-bg" style="background:' + esc(p.gradient || '') + '"></div>' +
          '<div class="project-cat">' + esc(p.category || '') + '</div>' +
          (vi.text ? '<div class="view-count"' + viewsAttrs(vi) + '>' + esc(vi.text) + ' views</div>' : '') +
          '<div class="project-media-overlay"><div class="project-arrow">' + ARROW + '</div></div>' +
        '</div><div class="project-info">' +
          '<div class="project-meta"><span class="project-num">' + num + '</span><span class="project-year">' + esc(p.year || '') + '</span></div>' +
          '<h3 class="project-title">' + esc(p.title || '') + '</h3>' +
          '<p class="project-desc">' + esc(p.description || '') + '</p>' +
          '<div class="project-tags">' + tags + '</div>' +
        '</div></div></article>';
    }).join('\n');
  }

  var track = document.getElementById('reelsTrack');
  if (track) {
    track.innerHTML = REELS.map(function (r, i) {
      var num = String(i + 1).padStart(2, '0');
      var vi = viewsInfo(r);
      return '<div class="reel-card" data-vimeo="' + esc(r.vimeo || '') + '" data-youtube="' + esc(r.youtube || '') + '" style="--reel-bg: ' + esc(r.gradient || '') + '">' +
        '<div class="reel-bg"></div><div class="reel-overlay"></div>' +
        '<div class="reel-play-btn"><div class="reel-play-circle"><div class="reel-play-icon"></div></div></div>' +
        '<div class="reel-info"><span class="reel-num">' + num + '</span>' +
          '<span class="reel-title">' + esc(r.title || '') + '</span>' +
          '<span class="reel-tag">' + esc(r.tag || '') + '</span>' +
          (vi.text ? '<span class="reel-views"' + viewsAttrs(vi) + '>' + esc(vi.text) + ' views</span>' : '') + '</div>' +
      '</div>';
    }).join('\n');
  }

  /* ── Roll-up: count from 0 → the number when the card scrolls in ── */
  (function () {
    var els = [].slice.call(document.querySelectorAll('[data-count][data-final]'));
    if (!els.length) return;
    // No observer support, or the visitor prefers less motion → leave it static
    if (!('IntersectionObserver' in window)) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Count in the SAME format the final value uses (K / M / commas / plain)
    function formatterFor(txt) {
      var s = String(txt).trim();
      if (/[Mm]$/.test(s)) return function (n) { return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M'; };
      if (/[Kk]$/.test(s)) return function (n) { return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K'; };
      var comma = s.indexOf(',') >= 0;
      return function (n) { n = Math.round(n); return comma ? n.toLocaleString() : String(n); };
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        io.unobserve(el);
        var target = parseFloat(el.getAttribute('data-count'));
        var finalTxt = el.getAttribute('data-final');
        if (!isFinite(target)) { el.textContent = finalTxt + ' views'; return; }
        var fmt = formatterFor(finalTxt), dur = 1500, t0 = null;
        function step(ts) {
          if (t0 === null) t0 = ts;
          var p = Math.min(1, (ts - t0) / dur);
          var e = 1 - Math.pow(1 - p, 3);              // ease-out
          if (p < 1) {
            el.textContent = fmt(target * e) + ' views';
            requestAnimationFrame(step);
          } else {
            el.textContent = finalTxt + ' views';      // land exactly on the real value
          }
        }
        requestAnimationFrame(step);
      });
    }, { threshold: 0.35 });

    els.forEach(function (el) {
      var f = el.getAttribute('data-final');
      el.textContent = formatterFor(f)(0) + ' views';   // start at zero
      io.observe(el);
    });
  })();
})();
