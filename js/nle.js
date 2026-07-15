/* nle.js — "Sequence 01" portfolio timeline (homepage)
   Builds an editing-timeline view of the project grid: clips on video
   tracks, a scrubbing playhead, and a running timecode readout. */
(function () {
  'use strict';

  var nle      = document.getElementById('nle');
  var ruler    = document.getElementById('nleRuler');
  var trackV1  = document.getElementById('nleV1');
  var trackV2  = document.getElementById('nleV2');
  var trackA1  = document.getElementById('nleA1');
  var playhead = document.getElementById('nlePlayhead');
  var timecode = document.getElementById('nleTimecode');
  if (!nle || !ruler || !trackV1 || !trackV2 || !playhead) return;

  // Turned off in ANOTHA Studio → don't build the timeline
  if (window.FEATURES && window.FEATURES.timeline === false) {
    var _s = nle.closest('.nle-section'); if (_s) _s.remove(); return;
  }

  var cards = Array.prototype.slice.call(
    document.querySelectorAll('.projects-grid .project-card')
  );
  if (!cards.length) { nle.closest('.nle-section').style.display = 'none'; return; }

  var GUTTER = 44;             // px — track label column
  var SEQ_SECONDS = 60;        // fictional sequence length for the timecode
  var FPS = 24;

  // ── Ruler marks every 1/8th ────────────────────────────────────────────
  for (var m = 0; m <= 8; m++) {
    var mark = document.createElement('span');
    mark.className = 'nle-mark';
    var secs = Math.round((m / 8) * SEQ_SECONDS);
    mark.textContent = '00:' + String(secs).padStart(2, '0');
    mark.style.left = (m / 8 * 100) + '%';
    ruler.appendChild(mark);
  }

  // ── Clips — alternate V1/V2, widths derived from title length ─────────
  var clips = [];
  var cursors = { v1: 0.4, v2: 6.5 };   // % offsets so tracks feel staggered

  cards.forEach(function (card, i) {
    var titleEl = card.querySelector('.project-title');
    var title   = titleEl ? titleEl.textContent.trim() : 'Clip ' + (i + 1);
    var short   = title.length > 26 ? title.slice(0, 24) + '…' : title;

    var isV1  = i % 2 === 0;
    var key   = isV1 ? 'v1' : 'v2';
    var track = isV1 ? trackV1 : trackV2;

    // deterministic pseudo-random width: 11–19%
    var w = 11 + ((title.length * 7 + i * 13) % 9);
    var left = cursors[key];
    if (left + w > 99) w = Math.max(6, 99 - left);
    cursors[key] = left + w + 1.2;

    var clip = document.createElement('button');
    clip.type = 'button';
    clip.className = 'nle-clip ' + (isV1 ? 'nc-gold' : 'nc-purple');
    clip.style.left  = left + '%';
    clip.style.width = w + '%';
    clip.innerHTML = '<span class="nle-clip-label">' + short.replace(/</g, '&lt;') + '</span>';
    clip.setAttribute('aria-label', 'Play: ' + title);

    clip.addEventListener('click', function () {
      if (card.dataset.vimeo || card.dataset.youtube) {
        card.click();                       // opens the existing lightbox
      } else {
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });

    track.appendChild(clip);
    clips.push({ el: clip, left: left, right: left + w });
  });

  // ── A1 — decorative audio waveform clip ───────────────────────────────
  if (trackA1) {
    var audio = document.createElement('div');
    audio.className = 'nle-clip nle-wave';
    audio.style.left  = '0.4%';
    audio.style.width = '97%';
    audio.innerHTML = '<span class="nle-clip-label">score_master.wav</span>';
    trackA1.appendChild(audio);
  }

  // ── Playhead: auto-crawl + drag to scrub ──────────────────────────────
  var pct       = 0;        // 0..1 position
  var dragging  = false;
  var rafId     = null;
  var lastTs    = null;

  function laneWidth()  { return nle.clientWidth - GUTTER; }

  function render() {
    playhead.style.left = (GUTTER + pct * laneWidth()) + 'px';

    // timecode: 00:MM:SS:FF over the fictional sequence
    var total = pct * SEQ_SECONDS;
    var s  = Math.floor(total);
    var f  = Math.floor((total - s) * FPS);
    timecode.textContent = '00:' +
      String(Math.floor(s / 60)).padStart(2, '0') + ':' +
      String(s % 60).padStart(2, '0') + ':' +
      String(f).padStart(2, '0');

    // light up the clips currently under the playhead
    var x = pct * 100;
    clips.forEach(function (c) {
      c.el.classList.toggle('nle-lit', x >= c.left && x <= c.right);
    });
  }

  function tick(ts) {
    rafId = requestAnimationFrame(tick);
    if (lastTs === null) { lastTs = ts; return; }
    var dt = (ts - lastTs) / 1000;
    lastTs = ts;
    if (dragging) return;
    pct += dt / SEQ_SECONDS;         // real-time crawl, loops each "minute"
    if (pct >= 1) pct = 0;
    render();
  }

  // Only animate while the section is on screen
  var running = false;
  var vis = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting && !running) {
        running = true; lastTs = null;
        rafId = requestAnimationFrame(tick);
      } else if (!en.isIntersecting && running) {
        running = false;
        cancelAnimationFrame(rafId);
      }
    });
  }, { threshold: 0.05 });
  vis.observe(nle);

  function scrubTo(clientX) {
    var r = nle.getBoundingClientRect();
    pct = Math.min(Math.max((clientX - r.left - GUTTER) / laneWidth(), 0), 1);
    render();
  }

  function startDrag(el) {
    el.addEventListener('pointerdown', function (e) {
      dragging = true;
      el.setPointerCapture(e.pointerId);
      scrubTo(e.clientX);
      e.preventDefault();
    });
    el.addEventListener('pointermove', function (e) {
      if (dragging) scrubTo(e.clientX);
    });
    el.addEventListener('pointerup',     function () { dragging = false; });
    el.addEventListener('pointercancel', function () { dragging = false; });
  }
  startDrag(playhead);  // grab the playhead (generous hit area via CSS)
  startDrag(ruler);     // or click/drag anywhere on the ruler to jump + scrub

  window.addEventListener('resize', render, { passive: true });
  render();
})();
