/* ================================================================
   ANOTHA VFX — main.js
   All content is hardcoded in HTML. This file handles:
   - Loader
   - Nav scroll behaviour + mobile menu
   - Custom cursor
   - Scroll-reveal animations (IntersectionObserver)
   - Hero parallax
   - Stat counter animation
   - Showreel embed (reads vimeoId / youtubeId from content.js)
   - Project card video hover
   ================================================================ */

/* ── Add .js-loaded early so CSS reveal classes activate ── */
document.documentElement.classList.add('js-loaded');

/* ================================================================
   VIMEO CUSTOM PLAYER
   Builds an iframe with controls=0 and overlays minimal
   play/pause + mute/unmute buttons using the Vimeo Player SDK.
   Used by the showreel, portrait reels, and project lightbox.
   ================================================================ */
/* ── Global Vimeo player registry ──────────────────────────────────
   Stores { player, iframe } for every active embed so we can:
   • Pause every other player when a new one starts
   • Pause all players when the user leaves the browser             */
var vcPlayers = [];

/* Send pause both via SDK and direct postMessage (more reliable on
   mobile where SDK messages can be dropped during page suspension)  */
function forceStopEntry(entry) {
  try { entry.player.pause().catch(function() {}); } catch(e) {}
  try {
    entry.iframe.contentWindow.postMessage(
      JSON.stringify({ method: 'pause' }), 'https://player.vimeo.com'
    );
  } catch(e) {}
}

function pauseAllPlayers(exceptPlayer) {
  /* Drop entries whose iframes were removed from the DOM */
  vcPlayers = vcPlayers.filter(function(e) {
    try { return e.iframe && e.iframe.isConnected; } catch(_) { return false; }
  });
  vcPlayers.forEach(function(e) {
    if (e.player !== exceptPlayer) forceStopEntry(e);
  });
}

/* Stop all audio when user presses home / switches app.
   Both events used: visibilitychange (standard) + pagehide (iOS) */
/* ── Theater mode — dim the page while a video plays ─────────── */
var theaterHost = null;
function theaterOn(el) {
  var dim = document.getElementById('theaterDim');
  if (!dim) {
    dim = document.createElement('div');
    dim.id = 'theaterDim';
    document.body.appendChild(dim);
  }
  if (theaterHost) theaterHost.classList.remove('theater-active');
  theaterHost = el ? el.closest('.showreel-player, .reel-card, .project-media') : null;
  if (theaterHost) {
    theaterHost.classList.add('theater-active');
    requestAnimationFrame(function() { dim.classList.add('on'); });
  }
}
function theaterOff(el) {
  var host = el ? el.closest('.showreel-player, .reel-card, .project-media') : null;
  if (host && host !== theaterHost) return; /* a newer video owns the dim */
  var dim = document.getElementById('theaterDim');
  if (dim) dim.classList.remove('on');
  if (theaterHost) theaterHost.classList.remove('theater-active');
  theaterHost = null;
}

function onPageHide() {
  vcPlayers.forEach(forceStopEntry);
  /* Catch any Vimeo iframes not yet in our registry (e.g. YouTube
     fallbacks are plain iframes — skip, but cover late-registered ones) */
  document.querySelectorAll('iframe[src*="vimeo.com"]').forEach(function(f) {
    try {
      f.contentWindow.postMessage(
        JSON.stringify({ method: 'pause' }), 'https://player.vimeo.com'
      );
    } catch(e) {}
  });
}
document.addEventListener('visibilitychange', function() { if (document.hidden) onPageHide(); });
document.addEventListener('pagehide', onPageHide);

/* ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── */

/* landscape = true  → lock landscape when going fullscreen (showreel, project clips)
   landscape = false → no orientation lock (portrait reel cards)              */
function buildVimeoEmbed(vimeoId, landscape) {
  if (landscape === undefined) landscape = true;

  var wrap = document.createElement('div');
  wrap.className = 'vc-wrap';

  var f = document.createElement('iframe');
  f.src = 'https://player.vimeo.com/video/' + vimeoId +
          '?autoplay=1&controls=0&title=0&byline=0&portrait=0' +
          '&playsinline=1&quality=1080p&color=c4a472&dnt=1';
  f.allow = 'autoplay; fullscreen; picture-in-picture';
  f.allowFullscreen = true;
  wrap.appendChild(f);

  /* Transparent tap-intercept layer — sits above the iframe so mobile taps
     never reach Vimeo's native play/pause overlay; routed to our controls instead */
  var tapLayer = document.createElement('div');
  tapLayer.className = 'vc-tap';
  wrap.appendChild(tapLayer);

  var bar = document.createElement('div');
  bar.className = 'vc-bar';
  bar.innerHTML =
    '<button class="vc-btn vc-play-btn" aria-label="Play / Pause">' +
      '<svg class="icon-play" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>' +
      '<svg class="icon-pause" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="display:none"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>' +
    '</button>' +
    '<button class="vc-btn vc-mute-btn" aria-label="Mute / Unmute">' +
      '<svg class="icon-vol" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>' +
      '<svg class="icon-muted" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="display:none"><path d="M16.5 12A4.5 4.5 0 0 0 14 7.97v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.796 8.796 0 0 0 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06A8.99 8.99 0 0 0 17.73 19L19 20.27 20.27 19 5.27 4 4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>' +
    '</button>' +
    '<button class="vc-btn vc-fs-btn" aria-label="Fullscreen">' +
      '<svg class="icon-fs" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>' +
      '<svg class="icon-fs-exit" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="display:none"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/></svg>' +
    '</button>';
  wrap.appendChild(bar);

  /* Wire up controls after a short delay so the iframe is in the DOM */
  setTimeout(function() {
    if (!window.Vimeo) return;
    var player = new Vimeo.Player(f);
    /* Register and immediately stop every other active video */
    vcPlayers.push({ player: player, iframe: f });
    pauseAllPlayers(player);

    var playBtn = bar.querySelector('.vc-play-btn');
    var muteBtn = bar.querySelector('.vc-mute-btn');
    var fsBtn   = bar.querySelector('.vc-fs-btn');
    var iPlay   = bar.querySelector('.icon-play');
    var iPause  = bar.querySelector('.icon-pause');
    var iVol    = bar.querySelector('.icon-vol');
    var iMuted  = bar.querySelector('.icon-muted');

    /* Tap layer: toggle play/pause without triggering Vimeo's native overlay */
    tapLayer.addEventListener('click', function() {
      player.getPaused().then(function(p) { p ? player.play() : player.pause(); });
    });

    playBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      player.getPaused().then(function(p) { p ? player.play() : player.pause(); });
    });
    muteBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      player.getMuted().then(function(m) { player.setMuted(!m); });
    });

    /* Fullscreen toggle — uses Vimeo SDK (works on iOS too) with native fallback */
    var iFS    = bar.querySelector('.icon-fs');
    var iFSExit = bar.querySelector('.icon-fs-exit');

    function lockLandscape() {
      if (landscape && screen.orientation && screen.orientation.lock) {
        screen.orientation.lock('landscape').catch(function() {});
      }
    }
    function unlockOrientation() {
      if (screen.orientation && screen.orientation.unlock) {
        screen.orientation.unlock();
      }
    }

    /* Vimeo SDK fullscreen change — updates icon + unlocks orientation */
    player.on('fullscreenchange', function(data) {
      iFS.style.display     = data.fullscreen ? 'none' : '';
      iFSExit.style.display = data.fullscreen ? ''     : 'none';
      if (!data.fullscreen) unlockOrientation();
    });

    /* Also catch native fullscreen exits (e.g. ESC key) */
    function onNativeFSChange() {
      var isFS = !!(document.fullscreenElement || document.webkitFullscreenElement);
      iFS.style.display     = isFS ? 'none' : '';
      iFSExit.style.display = isFS ? ''     : 'none';
      if (!isFS) unlockOrientation();
    }
    document.addEventListener('fullscreenchange',       onNativeFSChange);
    document.addEventListener('webkitfullscreenchange', onNativeFSChange);

    fsBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      player.getFullscreen().then(function(isFS) {
        if (isFS) {
          /* Exit — try Vimeo SDK first, then native */
          player.exitFullscreen().catch(function() {
            var exit = document.exitFullscreen || document.webkitExitFullscreen;
            if (exit) exit.call(document);
          });
        } else {
          /* Enter — try Vimeo SDK first (works on iOS), then native wrap */
          player.requestFullscreen().then(lockLandscape).catch(function() {
            var req = wrap.requestFullscreen || wrap.webkitRequestFullscreen;
            if (req) req.call(wrap).then(lockLandscape).catch(function() {});
          });
        }
      });
    });

    player.on('play',  function() {
      iPlay.style.display = 'none';
      iPause.style.display = '';
      pauseAllPlayers(player); /* belt-and-suspenders: stop others on play too */
      theaterOn(wrap);
    });
    player.on('pause', function() { iPlay.style.display = '';     iPause.style.display = 'none'; theaterOff(wrap); });
    player.on('ended', function() { theaterOff(wrap); });
    player.on('volumechange', function(d) {
      var off = d.muted || d.volume === 0;
      iVol.style.display   = off ? 'none' : '';
      iMuted.style.display = off ? '' : 'none';
    });
  }, 150);

  return wrap;
}

/* ================================================================
   VIMEO THUMBNAIL AUTO-LOADER
   Fetches the real thumbnail from Vimeo's oEmbed API and sets it
   as the background of any element passed in. Falls back to the
   existing gradient silently if the fetch fails.
   ================================================================ */
async function loadVimeoThumb(bgEl, vimeoId) {
  if (!bgEl || !vimeoId) return;
  try {
    const r = await fetch(
      'https://vimeo.com/api/oembed.json?url=https://vimeo.com/' + vimeoId + '&width=1280'
    );
    if (!r.ok) return;
    const d = await r.json();
    if (!d.thumbnail_url) return;
    /* Only apply once the image actually downloads — if it fails the
       gradient CSS stays intact (inline style is never written).       */
    const img = new Image();
    img.onload = () => {
      bgEl.style.background = 'url(' + d.thumbnail_url + ') center/cover no-repeat';
    };
    /* onerror: do nothing — gradient fallback stays */
    img.src = d.thumbnail_url;
  } catch(e) { /* gradient fallback stays */ }
}

/* ================================================================
   LOADER
   ================================================================ */
window.addEventListener('load', () => {
  setTimeout(() => {
    const loader = document.getElementById('loader');
    if (loader) {
      loader.style.opacity = '0';
      loader.style.visibility = 'hidden';
    }
  }, 1600);
});

/* ================================================================
   NAV
   ================================================================ */
document.addEventListener('DOMContentLoaded', () => {

  const nav    = document.getElementById('nav');
  const toggle = document.getElementById('navToggle');
  const menu   = document.getElementById('mobileMenu');

  /* Scroll → add .scrolled class */
  if (nav) {
    const tick = () => nav.classList.toggle('scrolled', window.scrollY > 40);
    window.addEventListener('scroll', tick, { passive: true });
    tick();
  }

  /* Hamburger */
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      const open = toggle.classList.toggle('open');
      menu.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    menu.querySelectorAll('.mobile-link').forEach(l => {
      l.addEventListener('click', () => {
        toggle.classList.remove('open');
        menu.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  /* ================================================================
     CUSTOM CURSOR  (only on real pointer devices)
     ================================================================ */
  const cursor = document.getElementById('cursor');
  const ring   = document.getElementById('cursorRing');

  if (cursor && ring && window.matchMedia('(pointer:fine)').matches) {
    let mx = -300, my = -300;
    let rx = -300, ry = -300;
    let prevMx = -300, prevMy = -300;
    let isBig = false;

    /* ── Trail dots (chain: each follows the previous) ── */
    const TRAIL_COUNT = 7;
    const trail = Array.from({ length: TRAIL_COUNT }, (_, i) => {
      const d = document.createElement('div');
      d.className = 'cursor-trail';
      const size = Math.max(1.5, 5.5 - i * 0.65);
      d.style.cssText = `width:${size}px;height:${size}px;opacity:${(0.38 - i * 0.048).toFixed(3)};`;
      document.body.appendChild(d);
      return { el: d, x: -300, y: -300 };
    });

    /* ── Mouse move — dot snaps instantly, velocity for stretch ── */
    document.addEventListener('mousemove', e => {
      prevMx = mx; prevMy = my;
      mx = e.clientX; my = e.clientY;
      cursor.style.left = mx + 'px';
      cursor.style.top  = my + 'px';

      if (!isBig) {
        const vx = mx - prevMx, vy = my - prevMy;
        const speed = Math.hypot(vx, vy);
        if (speed > 1.5) {
          const angle   = Math.atan2(vy, vx) * 180 / Math.PI;
          const stretch = Math.min(1 + speed * 0.055, 2.6);
          const squeeze = 1 / Math.sqrt(stretch);
          cursor.style.transform =
            `translate(-50%,-50%) rotate(${angle}deg) scaleX(${stretch.toFixed(3)}) scaleY(${squeeze.toFixed(3)})`;
        } else {
          cursor.style.transform = 'translate(-50%,-50%)';
        }
      }
    });

    /* ── Click ripple ── */
    document.addEventListener('mousedown', e => {
      const r = document.createElement('div');
      r.className = 'cursor-ripple';
      r.style.left = e.clientX + 'px';
      r.style.top  = e.clientY + 'px';
      document.body.appendChild(r);
      r.addEventListener('animationend', () => r.remove(), { once: true });
    });

    /* ── Keep cursor visible in fullscreen ── */
    function handleFSChange() {
      const fsEl = document.fullscreenElement || document.webkitFullscreenElement;
      const target = fsEl || document.body;
      target.appendChild(cursor);
      target.appendChild(ring);
      trail.forEach(t => target.appendChild(t.el));
    }
    document.addEventListener('fullscreenchange',       handleFSChange);
    document.addEventListener('webkitfullscreenchange', handleFSChange);

    /* ── RAF loop: ring lerp + trail chain ── */
    (function rafLoop() {
      /* Ring */
      rx += (mx - rx) * 0.1;
      ry += (my - ry) * 0.1;
      ring.style.left = rx + 'px';
      ring.style.top  = ry + 'px';

      /* Trail: each dot chases the previous position */
      let px = mx, py = my;
      trail.forEach(dot => {
        dot.x += (px - dot.x) * 0.32;
        dot.y += (py - dot.y) * 0.32;
        dot.el.style.left = dot.x + 'px';
        dot.el.style.top  = dot.y + 'px';
        px = dot.x; py = dot.y;
      });

      requestAnimationFrame(rafLoop);
    })();

    /* ── Grow on interactive elements ── */
    document.querySelectorAll('a, button, .project-card, input, textarea')
      .forEach(el => {
        el.addEventListener('mouseenter', () => {
          isBig = true;
          cursor.classList.add('big');
          ring.classList.add('big');
          cursor.style.transform = 'translate(-50%,-50%) scale(3)';
        });
        el.addEventListener('mouseleave', () => {
          isBig = false;
          cursor.classList.remove('big');
          ring.classList.remove('big');
          cursor.style.transform = 'translate(-50%,-50%)';
        });
      });
  }

  /* ================================================================
     SCROLL REVEAL  (IntersectionObserver)
     Elements with class .reveal start invisible (via CSS .js-loaded)
     and get class .vis when they enter the viewport.
     ================================================================ */
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('vis');
        revealObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll(
    '.reveal, .project-card, .section-header, .about-teaser, ' +
    '.about-bio, .skills-block, .about-cta, .contact-info-col, ' +
    '.contact-form-col, .showreel-section, .showreel-header, .showreel-player'
  ).forEach(el => revealObs.observe(el));

  /* ================================================================
     HERO PARALLAX
     ================================================================ */
  const heroContent = document.getElementById('heroContent');
  const heroVideo   = document.querySelector('.hero-video');
  const heroH       = window.innerHeight;

  if (heroContent) {
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (y > heroH) return;
      const p = y / heroH;
      heroContent.style.transform = `translateY(${y * 0.3}px)`;
      heroContent.style.opacity   = String(Math.max(0, 1 - p * 1.6));
      if (heroVideo) heroVideo.style.transform = `translateY(${y * 0.15}px)`;
    }, { passive: true });
  }

  /* ================================================================
     STAT COUNTERS  — animate numbers up on load
     Usage: <div data-count="50" data-suffix="+">50+</div>
     ================================================================ */
  setTimeout(() => {
    document.querySelectorAll('[data-count]').forEach(el => {
      const target = parseInt(el.dataset.count, 10);
      const suffix = el.dataset.suffix || '';
      const dur    = 1400; // ms
      const start  = performance.now();

      function step(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / dur, 1);
        /* ease-out cubic */
        const ease = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(ease * target) + suffix;
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }, 1800); /* start after loader fades */

  /* ================================================================
     SHOWREEL PLAYER
     Reads content.js (window.SITE.showreel) and injects the right embed.
     Falls back gracefully if content.js is missing.
     ================================================================ */
  const player  = document.getElementById('showreelPlayer');
  const playBtn = document.getElementById('playBtn');

  if (player && playBtn) {
    const sr = (window.SITE && window.SITE.showreel) || {};

    /* Auto-load Vimeo thumbnail as poster if no local poster image is set */
    if (sr.vimeoId && sr.vimeoId !== '') {
      const posterImg = player.querySelector('.showreel-poster');
      if (posterImg && (!posterImg.src || posterImg.src.endsWith('showreel-poster.jpg'))) {
        fetch('https://vimeo.com/api/oembed.json?url=https://vimeo.com/' + sr.vimeoId + '&width=1920')
          .then(r => r.json())
          .then(d => { if (d.thumbnail_url) posterImg.src = d.thumbnail_url; })
          .catch(() => {});
      }
    }

    function buildEmbed() {
      player.classList.add('playing');

      /* ── Vimeo ── */
      if (sr.vimeoId && sr.vimeoId !== '') {
        player.appendChild(buildVimeoEmbed(sr.vimeoId));
        return;
      }

      /* ── YouTube ── */
      if (sr.youtubeId && sr.youtubeId !== '') {
        const f = document.createElement('iframe');
        f.src = `https://www.youtube.com/embed/${sr.youtubeId}?autoplay=1&rel=0&modestbranding=1`;
        f.allow = 'autoplay; encrypted-media; picture-in-picture';
        f.allowFullscreen = true;
        f.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:none;z-index:10';
        player.appendChild(f);
        return;
      }

      /* ── Local file ── */
      const localSrc = (sr.localFile && sr.localFile !== '') ? sr.localFile : 'assets/showreel.mp4';
      const v = document.createElement('video');
      v.src      = localSrc;
      v.controls = true;
      v.autoplay = true;
      v.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:10;background:#000';
      player.appendChild(v);
      v.play().catch(() => {});
    }

    playBtn.addEventListener('click', buildEmbed);
    /* Allow clicking the poster area too */
    player.addEventListener('click', e => {
      if (!player.classList.contains('playing') && !playBtn.contains(e.target)) {
        buildEmbed();
      }
    });
  }

  /* ================================================================
     PORTRAIT REELS — click to play + drag to scroll
     ================================================================ */
  const reelCards = document.querySelectorAll('.reel-card');

  reelCards.forEach(card => {
    card.addEventListener('click', () => {
      if (card.classList.contains('playing')) return;

      const vimeoId   = card.dataset.vimeo;
      const youtubeId = card.dataset.youtube;

      /* Need at least one ID set */
      if (!vimeoId && !youtubeId) {
        /* No video ID — nothing to play yet */
        return;
      }

      card.classList.add('playing');

      if (vimeoId) {
        card.appendChild(buildVimeoEmbed(vimeoId, false)); /* portrait reel — no rotation */

        /* Hook into the Vimeo player once it registers (buildVimeoEmbed uses a 150ms delay) */
        setTimeout(() => {
          const entry = vcPlayers[vcPlayers.length - 1];
          if (!entry) return;

          /* Show/hide info overlay based on actual play state */
          entry.player.on('play',  () => card.classList.add('is-playing'));
          entry.player.on('pause', () => card.classList.remove('is-playing'));

          /* When video ends: restore the card to its original thumbnail state */
          entry.player.on('ended', () => {
            card.classList.remove('playing', 'is-playing');
            const wrap = card.querySelector('.vc-wrap');
            if (wrap) wrap.remove();
          });
        }, 300);
      } else {
        const f = document.createElement('iframe');
        f.src = `https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`;
        f.allow = 'autoplay; encrypted-media; picture-in-picture';
        f.allowFullscreen = true;
        f.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:none;z-index:10';
        card.appendChild(f);
      }
    });
  });

  /* Drag-to-scroll on the reels track */
  const trackWrap = document.querySelector('.reels-track-wrap');
  if (trackWrap) {
    let isDragging = false, startX = 0, scrollStart = 0;

    trackWrap.addEventListener('mousedown', e => {
      isDragging  = true;
      startX      = e.pageX;
      scrollStart = trackWrap.scrollLeft;
      trackWrap.style.userSelect = 'none';
    });
    window.addEventListener('mousemove', e => {
      if (!isDragging) return;
      trackWrap.scrollLeft = scrollStart - (e.pageX - startX);
    });
    window.addEventListener('mouseup', () => {
      isDragging = false;
      trackWrap.style.userSelect = '';
    });

    /* Generate pip dots from card count — no manual editing needed */
    const pipBar = document.getElementById('reelsPipBar');
    if (pipBar) {
      reelCards.forEach((_, i) => {
        const p = document.createElement('div');
        p.className = 'reels-scroll-pip' + (i === 0 ? ' active' : '');
        pipBar.appendChild(p);
      });
    }

    /* Pip progress indicator */
    const pips = document.querySelectorAll('.reels-scroll-pip');
    if (pips.length) {
      trackWrap.addEventListener('scroll', () => {
        const max  = trackWrap.scrollWidth - trackWrap.clientWidth;
        const prog = max > 0 ? trackWrap.scrollLeft / max : 0;
        const idx  = Math.round(prog * (pips.length - 1));
        pips.forEach((p, i) => p.classList.toggle('active', i === idx));
      }, { passive: true });
    }
  }

  /* ================================================================
     PROJECT CARD VIDEO HOVER
     ================================================================ */
  document.querySelectorAll('.project-card').forEach(card => {
    const vid = card.querySelector('video');
    if (!vid) return;
    let t;
    card.addEventListener('mouseenter', () => {
      t = setTimeout(() => vid.play().catch(() => {}), 80);
    });
    card.addEventListener('mouseleave', () => {
      clearTimeout(t);
      vid.pause();
      vid.currentTime = 0;
    });
  });

  /* ================================================================
     PROJECT CARD SUBTLE 3-D TILT on mousemove
     ================================================================ */
  document.querySelectorAll('.project-card').forEach(card => {
    const media = card.querySelector('.project-media');
    if (!media) return;

    card.addEventListener('mousemove', e => {
      const rect   = card.getBoundingClientRect();
      const cx     = rect.left + rect.width  / 2;
      const cy     = rect.top  + rect.height / 2;
      const dx     = (e.clientX - cx) / (rect.width  / 2); // -1 … 1
      const dy     = (e.clientY - cy) / (rect.height / 2);
      media.style.transform = `perspective(800px) rotateY(${dx * 4}deg) rotateX(${-dy * 3}deg) scale(1.02)`;
    });

    card.addEventListener('mouseleave', () => {
      media.style.transform = '';
    });
  });

  /* ================================================================
     VIMEO THUMBNAIL AUTO-LOAD + PROJECT COUNT
     Fires for every card that has data-vimeo set.
     ================================================================ */

  /* Portrait reel cards */
  reelCards.forEach(card => {
    const vid = card.dataset.vimeo;
    if (vid) loadVimeoThumb(card.querySelector('.reel-bg'), vid);
  });

  /* Project cards */
  document.querySelectorAll('.project-card').forEach(card => {
    const vid = card.dataset.vimeo;
    if (vid) loadVimeoThumb(card.querySelector('.project-bg'), vid);
  });

  /* Keep the "04" count in sync with however many cards exist */
  const countEl = document.querySelector('.work .section-count');
  if (countEl) {
    countEl.textContent = String(document.querySelectorAll('.project-card').length).padStart(2, '0');
  }

  /* ================================================================
     PROJECT CARD LIGHTBOX
     Click a .project-card with data-vimeo or data-youtube set
     → full-screen 16:9 player opens. ESC or backdrop click closes.
     ================================================================ */
  const lightbox  = document.getElementById('projectLightbox');
  const lbPlayer  = document.getElementById('lightboxPlayer');
  const lbClose   = document.getElementById('lightboxClose');
  const lbBdrop   = document.getElementById('lightboxBackdrop');

  function openLightbox(vimeoId, youtubeId) {
    lbPlayer.innerHTML = '';
    if (vimeoId) {
      lbPlayer.appendChild(buildVimeoEmbed(vimeoId));
    } else {
      const f = document.createElement('iframe');
      f.src   = `https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`;
      f.allow = 'autoplay; encrypted-media; picture-in-picture';
      f.allowFullscreen = true;
      f.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:none;';
      lbPlayer.appendChild(f);
    }
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    /* Stop video by clearing the player after the fade */
    setTimeout(() => { lbPlayer.innerHTML = ''; }, 350);
  }

  if (lightbox) {
    document.querySelectorAll('.project-card').forEach(card => {
      card.addEventListener('click', () => {
        const vid = card.dataset.vimeo;
        const yt  = card.dataset.youtube;
        if (vid || yt) openLightbox(vid || '', yt || '');
      });
    });

    lbClose.addEventListener('click', closeLightbox);
    lbBdrop.addEventListener('click', closeLightbox);
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox();
    });
  }

}); /* end DOMContentLoaded */

/* ================================================================
   ██████╗ ██╗   ██╗███╗   ██╗ █████╗ ███╗   ███╗██╗ ██████╗
   ██╔══██╗╚██╗ ██╔╝████╗  ██║██╔══██╗████╗ ████║██║██╔════╝
   ██║  ██║ ╚████╔╝ ██╔██╗ ██║███████║██╔████╔██║██║██║
   ██║  ██║  ╚██╔╝  ██║╚██╗██║██╔══██║██║╚██╔╝██║██║██║
   ██████╔╝   ██║   ██║ ╚████║██║  ██║██║ ╚═╝ ██║██║╚██████╗
   ╚═════╝    ╚═╝   ╚═╝  ╚═══╝╚═╝  ╚═╝╚═╝     ╚═╝╚═╝ ╚═════╝
   DYNAMIC ENHANCEMENTS
   - Scroll progress bar
   - Cursor spotlight
   - Page transitions
   - Magnetic buttons
   - Text scramble on titles
   - Hero mouse parallax
   - Reel card 3-D tilt
   - Hero name glitch on hover
   - Canvas floating particles
   - Typewriter hero tagline
   - Side section number indicator
   ================================================================ */

/* ── 1. SCROLL PROGRESS BAR ──────────────────────────────────── */
(function initScrollProgress() {
  const bar = document.createElement('div');
  bar.id = 'scrollProgress';
  document.body.prepend(bar);
  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + '%';
  };
  window.addEventListener('scroll', update, { passive: true });
  update();
})();

/* ── 2. PAGE TRANSITIONS ─────────────────────────────────────── */
(function initPageTransitions() {
  const overlay = document.createElement('div');
  overlay.className = 'page-transition';
  document.body.appendChild(overlay);

  /* Fade from black on load */
  overlay.style.opacity    = '1';
  overlay.style.transition = 'none';
  requestAnimationFrame(() => requestAnimationFrame(() => {
    overlay.style.transition = 'opacity .65s cubic-bezier(.87,0,.13,1)';
    overlay.style.opacity    = '0';
  }));

  /* When browser restores page from bfcache (back/forward button),
     the overlay is still black with pointerEvents:all — reset it */
  window.addEventListener('pageshow', function(e) {
    if (e.persisted) {
      overlay.style.transition    = 'opacity .4s ease';
      overlay.style.opacity       = '0';
      overlay.style.pointerEvents = 'none';
    }
  });

  /* Fade to black on internal navigation */
  document.addEventListener('click', e => {
    const link = e.target.closest('a[href]');
    if (!link) return;
    const href = link.getAttribute('href') || '';
    if (!href || href.startsWith('#') || href.startsWith('http') ||
        href.startsWith('mailto') || href.startsWith('tel') ||
        link.target === '_blank') return;
    e.preventDefault();
    overlay.style.transition    = 'opacity .42s cubic-bezier(.87,0,.13,1)';
    overlay.style.opacity       = '1';
    overlay.style.pointerEvents = 'all';
    setTimeout(() => { window.location.href = href; }, 440);
  });
})();

/* ── DOM-DEPENDENT FEATURES ──────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {

  const isDesktop = window.matchMedia('(pointer:fine)').matches;
  const isMobile  = window.innerWidth <= 768;

  /* Helper: linear interpolation */
  function lerp(a, b, t) { return a + (b - a) * t; }

  /* ── 3. MAGNETIC BUTTONS (desktop only) ──────────────────── */
  if (isDesktop) {
    document.querySelectorAll('.hero-cta-btn, .form-btn').forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const r  = btn.getBoundingClientRect();
        const dx = (e.clientX - r.left - r.width  / 2) * 0.16;
        const dy = (e.clientY - r.top  - r.height / 2) * 0.16;
        btn.style.transform = `translate(${dx}px,${dy}px)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transition = 'transform .55s cubic-bezier(.16,1,.3,1)';
        btn.style.transform  = '';
        setTimeout(() => { btn.style.transition = ''; }, 580);
      });
    });
  }

  /* ── 4. HERO MOUSE PARALLAX — smooth lerp (desktop only) ─── */
  const heroSec   = document.getElementById('hero');
  const heroAmb   = document.querySelector('.hero-ambient');
  const heroFrm   = document.querySelector('.hero-frame');
  const heroChips = document.querySelector('.hero-chips');
  const heroRole  = document.querySelector('.hero-role');

  if (heroSec && isDesktop) {
    let tMx = 0, tMy = 0, cMx = 0, cMy = 0, pRaf = null;

    function parallaxTick() {
      cMx = lerp(cMx, tMx, 0.05);
      cMy = lerp(cMy, tMy, 0.05);

      if (heroAmb)   heroAmb.style.transform   = `translate(calc(-50% + ${cMx*42}px),calc(-50% + ${cMy*20}px))`;
      if (heroFrm)   heroFrm.style.transform   = `translate(${cMx*9}px,${cMy*5}px)`;
      if (heroChips) heroChips.style.transform = `translate(${cMx*5}px,${cMy*3}px)`;
      if (heroRole)  heroRole.style.transform  = `translate(${cMx*3}px,${cMy*1.5}px)`;

      const done = Math.abs(tMx - cMx) < 0.0002 && Math.abs(tMy - cMy) < 0.0002;
      pRaf = done ? null : requestAnimationFrame(parallaxTick);
    }

    heroSec.addEventListener('mousemove', e => {
      const r = heroSec.getBoundingClientRect();
      tMx = (e.clientX - r.width  / 2) / r.width;
      tMy = (e.clientY - r.height / 2) / r.height;
      if (!pRaf) pRaf = requestAnimationFrame(parallaxTick);
    }, { passive: true });

    heroSec.addEventListener('mouseleave', () => {
      tMx = 0; tMy = 0;
      if (!pRaf) pRaf = requestAnimationFrame(parallaxTick);
    });
  }

  /* ── 5. REEL CARD 3-D TILT — smooth lerp (desktop only) ──── */
  if (isDesktop) {
    document.querySelectorAll('.reel-card').forEach(card => {
      let tDx = 0, tDy = 0, cDx = 0, cDy = 0, tRaf = null;
      let isHovered = false;

      function tiltTick() {
        cDx = lerp(cDx, tDx, 0.09);
        cDy = lerp(cDy, tDy, 0.09);
        const lift = isHovered ? 1 : 0;
        card.style.transform =
          `perspective(700px) rotateY(${cDx*6}deg) rotateX(${-cDy*5}deg) translateY(${-lift*4}px) scale(${1 + lift*0.015})`;
        const done = !isHovered && Math.abs(cDx) < 0.003 && Math.abs(cDy) < 0.003;
        if (done) { card.style.transform = ''; tRaf = null; }
        else tRaf = requestAnimationFrame(tiltTick);
      }

      card.addEventListener('mouseenter', () => {
        if (card.classList.contains('playing')) return;
        isHovered = true;
        if (!tRaf) tRaf = requestAnimationFrame(tiltTick);
      });
      card.addEventListener('mousemove', e => {
        if (card.classList.contains('playing')) return;
        const r = card.getBoundingClientRect();
        tDx = (e.clientX - r.left - r.width  / 2) / (r.width  / 2);
        tDy = (e.clientY - r.top  - r.height / 2) / (r.height / 2);
      });
      card.addEventListener('mouseleave', () => {
        isHovered = false; tDx = 0; tDy = 0;
        if (!tRaf) tRaf = requestAnimationFrame(tiltTick);
      });
    });
  }

  /* ── 6. CANVAS FLOATING PARTICLES — hero ─────────────────── */
  const heroEl = document.getElementById('hero');
  if (heroEl) {
    const COUNT  = isMobile ? 28 : 58;
    const canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.cssText =
      'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:0;';
    const mediaEl   = heroEl.querySelector('.hero-media');
    const overlayEl = mediaEl && mediaEl.querySelector('.hero-overlay');
    if (overlayEl) mediaEl.insertBefore(canvas, overlayEl);
    else if (mediaEl) mediaEl.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let W, H, pts;

    function resize() {
      W = canvas.width  = heroEl.offsetWidth;
      H = canvas.height = heroEl.offsetHeight;
    }
    function spawn() {
      pts = Array.from({ length: COUNT }, () => ({
        x:  Math.random() * W,
        y:  Math.random() * H,
        r:  Math.random() * 1.0 + 0.2,
        vx: (Math.random() - 0.5) * 0.2,
        vy: -(Math.random() * 0.28 + 0.06),
        a:  Math.random() * 0.28 + 0.07,
      }));
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      pts.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201,169,110,${p.a})`;
        ctx.fill();
        p.x += p.vx; p.y += p.vy;
        if (p.y < -4)    { p.y = H + 4; p.x = Math.random() * W; }
        if (p.x < -4)      p.x = W + 4;
        if (p.x > W + 4)   p.x = -4;
      });
      requestAnimationFrame(draw);
    }
    resize(); spawn(); draw();
    window.addEventListener('resize', () => { resize(); spawn(); });
  }

  /* ── 7. TYPEWRITER — hero tagline ────────────────────────── */
  const taglineEl = document.querySelector('.hero-tagline');
  if (taglineEl) {
    const txt = taglineEl.textContent.trim();
    taglineEl.textContent    = '';
    taglineEl.style.opacity   = '0';
    taglineEl.style.animation = 'none';
    taglineEl.style.transform = 'none';
    setTimeout(() => {
      taglineEl.style.opacity = '1';
      let i = 0;
      (function typeChar() {
        if (i < txt.length) {
          taglineEl.textContent += txt[i++];
          setTimeout(typeChar, 34 + Math.random() * 18);
        }
      })();
    }, 2280);
  }

  /* ── 8. SIDE SECTION NUMBER INDICATOR (desktop) ──────────── */
  if (document.getElementById('hero')) {
    const si = document.createElement('div');
    si.id = 'sideIndicator';
    si.innerHTML =
      '<span class="si-label">SECTION</span>' +
      '<span class="si-num">01</span>' +
      '<div class="si-line"></div>';
    document.body.appendChild(si);

    const siNum = si.querySelector('.si-num');
    const sects = [
      { el: document.getElementById('hero'),             num: '01' },
      { el: document.querySelector('.showreel-section'), num: '02' },
      { el: document.querySelector('.reels-section'),    num: '03' },
      { el: document.getElementById('work'),             num: '04' },
      { el: document.querySelector('.about-teaser'),     num: '05' },
    ].filter(s => s.el);

    const siObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const hit = sects.find(s => s.el === e.target);
        if (!hit || !siNum) return;
        siNum.classList.add('si-num-exit');
        setTimeout(() => {
          siNum.textContent = hit.num;
          siNum.classList.remove('si-num-exit');
          siNum.classList.add('si-num-enter');
          setTimeout(() => siNum.classList.remove('si-num-enter'), 320);
        }, 190);
      });
    }, { threshold: 0.35 });
    sects.forEach(s => siObs.observe(s.el));
  }

}); /* end DOMContentLoaded — dynamic enhancements */

/* ================================================================
   BOOKING — availability slots badge + Calendly call button
   Configured in js/content.js → SITE.booking
   ================================================================ */
document.addEventListener('DOMContentLoaded', function () {
  var cfg = (window.SITE && window.SITE.booking) || null;
  if (!cfg) return;

  /* ── 1. Slots-left badges (replaces "Available for projects") ── */
  var slots = cfg.slotsLeft;
  var month = cfg.slotsMonth;

  /* "auto": month from today's date; slot count seeded by the month
     so it's 2–5, looks organic, and stays stable all month long */
  if (slots === 'auto') {
    var now  = new Date();
    var seed = now.getFullYear() * 12 + now.getMonth();
    slots = 2 + (seed * 2654435761) % 4;
    month = ['January','February','March','April','May','June','July',
             'August','September','October','November','December'][now.getMonth()];
  }

  if (typeof slots === 'number' && slots >= 0) {
    var full = slots === 0;
    var txt  = full
      ? 'Fully booked for ' + month
      : slots + (slots === 1 ? ' slot' : ' slots') + ' left for ' + month;

    document.querySelectorAll('.hero-avail, .mob-avail, .srv-avail, .contact-avail')
      .forEach(function (el) {
        var dot = el.querySelector(
          '.hero-avail-dot, .mob-avail-dot, .srv-avail-dot, .avail-dot');
        el.textContent = '';
        if (dot) el.appendChild(dot);
        el.appendChild(document.createTextNode(txt));
        if (full) el.classList.add('avail-full');
      });
  }

  /* ── 2. "Book a free call" button on the Contact page ────────── */
  if (cfg.calendlyUrl) {
    var avail = document.querySelector('.contact-avail');
    if (avail && avail.parentNode) {
      var btn = document.createElement('a');
      btn.className = 'call-btn';
      btn.href      = cfg.calendlyUrl;
      btn.target    = '_blank';
      btn.rel       = 'noopener noreferrer';
      btn.innerHTML =
        '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" ' +
        'stroke="currentColor" stroke-width="1.5">' +
        '<rect x="3" y="4" width="18" height="18" rx="2"/>' +
        '<path d="M16 2v4M8 2v4M3 10h18"/></svg>' +
        'Book a free 30-min call';
      avail.parentNode.insertBefore(btn, avail.nextSibling);
    }
  }
});
