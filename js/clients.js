/* clients.js — "Worked With" logo strip (managed by ANOTHA Studio)
   Each client = { name, logo }.  logo is a data: URI (the PNG embedded),
   so it's fully self-contained — no separate image files to manage.
   If the list is empty, the whole section removes itself. */

const CLIENTS = [

];

(function () {
  'use strict';
  var section = document.getElementById('clientsSection');
  var track   = document.getElementById('clientsTrack');
  if (!section || !track) return;

  // Turned off in ANOTHA Studio → hide the whole strip
  if (window.FEATURES && window.FEATURES.clients === false) { section.remove(); return; }

  // No clients → the whole section vanishes
  if (!CLIENTS.length) { section.remove(); return; }
  section.style.display = '';

  function esc(s){ return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); }
  function item(c){
    return '<div class="client-item">' +
      (c.logo ? '<img class="client-logo" src="' + c.logo + '" alt="' + esc(c.name || '') + '">' : '') +
      (c.name ? '<span class="client-name">' + esc(c.name) + '</span>' : '') +
    '</div>';
  }

  // Doubled for a seamless infinite loop
  var one = CLIENTS.map(item).join('');
  track.innerHTML = one + one;

  requestAnimationFrame(function () {
    var half = track.scrollWidth / 2;
    if (!half) return;
    var dur = Math.max(14000, CLIENTS.length * 3600); // ms — slower with more logos

    // Right-to-left content? No — this moves LEFT→RIGHT (opposite of the reviews strip)
    var anim = track.animate(
      [{ transform: 'translateX(-' + half + 'px)' }, { transform: 'translateX(0px)' }],
      { duration: dur, iterations: Infinity, easing: 'linear' }
    );

    // Pause on hover (desktop only)
    if (window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      track.addEventListener('mouseenter', function () { anim.pause(); });
      track.addEventListener('mouseleave', function () { anim.play();  });
    }
  });
})();
