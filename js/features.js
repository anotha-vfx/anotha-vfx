/* features.js — turn sections & effects on/off (managed by ANOTHA Studio)
   Set a flag to false and that section/effect hides across the site until
   you turn it back on. Loads early so it can hide things before they show. */
window.FEATURES = window.FEATURES || {
  /* Homepage */
  showreel:     true,
  projects:     true,
  reels:        true,
  timeline:     true,
  clients:      true,
  reviewsStrip: true,
  ticker:       true,
  aboutTeaser:  true,
  watermark:    true,
  /* Services page */
  processSteps: true,
  /* Reviews page */
  reviewForm:   true,
  /* Everywhere */
  whatsapp:     true,
  fluidCursor:  true
};

(function () {
  var F = window.FEATURES;
  var map = {
    showreel:     '.showreel-section',
    projects:     '#work',
    reels:        '.reels-section',
    timeline:     '.nle-section',
    clients:      '#clientsSection',
    reviewsStrip: '.reviews-marquee-section',
    ticker:       '.ticker-wrap',
    aboutTeaser:  '.about-teaser',
    watermark:    '.hero-ambient',
    processSteps: '.process-section',
    reviewForm:   '.review-form-wrap',
    whatsapp:     '.wa-btn'
  };
  var css = '';
  for (var k in map) if (F[k] === false) css += map[k] + '{display:none !important;}';
  if (css) {
    var s = document.createElement('style');
    s.textContent = css;
    (document.head || document.documentElement).appendChild(s);
  }
})();
