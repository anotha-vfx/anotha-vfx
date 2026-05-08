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
          '&quality=1080p&color=c4a472&dnt=1';
  f.allow = 'autoplay; fullscreen; picture-in-picture';
  f.allowFullscreen = true;
  wrap.appendChild(f);

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
    });
    player.on('pause', function() { iPlay.style.display = '';     iPause.style.display = 'none'; });
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

    document.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      cursor.style.left = mx + 'px';
      cursor.style.top  = my + 'px';
    });

    /* Keep cursor visible in fullscreen — move elements into/out of the
       fullscreen element so they remain in the visible subtree.          */
    function handleFSChange() {
      const fsEl = document.fullscreenElement || document.webkitFullscreenElement;
      if (fsEl) {
        fsEl.appendChild(cursor);
        fsEl.appendChild(ring);
      } else {
        document.body.appendChild(cursor);
        document.body.appendChild(ring);
      }
    }
    document.addEventListener('fullscreenchange',       handleFSChange);
    document.addEventListener('webkitfullscreenchange', handleFSChange);

    /* Ring trails slightly behind */
    (function rafLoop() {
      rx += (mx - rx) * 0.1;
      ry += (my - ry) * 0.1;
      ring.style.left = rx + 'px';
      ring.style.top  = ry + 'px';
      requestAnimationFrame(rafLoop);
    })();

    /* Grow on interactive elements */
    document.querySelectorAll('a, button, .project-card, input, textarea')
      .forEach(el => {
        el.addEventListener('mouseenter', () => {
          cursor.classList.add('big');
          ring.classList.add('big');
        });
        el.addEventListener('mouseleave', () => {
          cursor.classList.remove('big');
          ring.classList.remove('big');
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
