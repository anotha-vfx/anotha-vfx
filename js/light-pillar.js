/* light-pillar.js — Three.js WebGL background effect (ported from React Bits LightPillar)
   Sits at z-index:0 (behind fluid cursor at z-index:1 and page content at z-index:2) */
(function () {
  'use strict';

  // ── Config ───────────────────────────────────────────────────────────────
  var TOP_COLOR      = '#7700FF';
  var BOTTOM_COLOR   = '#1A0044';
  var INTENSITY      = 1.0;
  var ROTATION_SPEED = 0.3;
  var INTERACTIVE    = false;
  var GLOW_AMOUNT    = 0.005;
  var PILLAR_WIDTH   = 3.0;
  var PILLAR_HEIGHT  = 0.4;
  var NOISE_INTENSITY = 0.5;
  var PILLAR_ROTATION = 32;
  var QUALITY        = 'high'; // 'low' | 'medium' | 'high' — auto-downgraded on mobile

  // Make body transparent so the shader's own dark background shows through,
  // keeping it truly behind all page content (z-index:-1 goes below non-positioned elements)
  var _bg = document.createElement('style');
  _bg.textContent = 'html,body{background:transparent!important;}';
  document.head.appendChild(_bg);

  // ── Container ────────────────────────────────────────────────────────────
  var container = document.createElement('div');
  container.id  = 'light-pillar-bg';
  container.style.cssText =
    'position:fixed;top:0;left:0;width:100%;height:100%;' +
    'z-index:-1;pointer-events:none;';
  document.body.appendChild(container);

  // ── Load Three.js from CDN, then boot ─────────────────────────────────────
  var threeScript = document.createElement('script');
  threeScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
  threeScript.onload  = boot;
  threeScript.onerror = function () { container.remove(); };
  document.head.appendChild(threeScript);

  // ── State ────────────────────────────────────────────────────────────────
  var rafId     = null;
  var renderer  = null;
  var material  = null;
  var scene     = null;
  var camera    = null;
  var geometry  = null;
  var timeVal   = 0;

  // ── Boot ─────────────────────────────────────────────────────────────────
  function boot() {
    // WebGL availability check
    var testCanvas = document.createElement('canvas');
    var testGL = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
    if (!testGL) { container.remove(); return; }

    // Quality auto-detection
    var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    var isLowEnd = isMobile || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);
    var eq = QUALITY;
    if (isLowEnd && eq === 'high') eq = 'medium';
    if (isMobile && eq !== 'low')  eq = 'low';

    var QS = {
      low:    { iter: 24, waveIter: 1, pixelRatio: 0.5,  prec: 'mediump', stepMult: 1.5 },
      medium: { iter: 40, waveIter: 2, pixelRatio: 0.65, prec: 'mediump', stepMult: 1.2 },
      high:   { iter: 80, waveIter: 4, pixelRatio: Math.min(window.devicePixelRatio || 1, 2), prec: 'highp', stepMult: 1.0 }
    };
    var S = QS[eq] || QS.medium;

    var w = container.clientWidth  || window.innerWidth;
    var h = container.clientHeight || window.innerHeight;

    // Renderer
    try {
      renderer = new THREE.WebGLRenderer({
        antialias:       false,
        alpha:           true,
        powerPreference: eq === 'high' ? 'high-performance' : 'low-power',
        precision:       S.prec,
        stencil:         false,
        depth:           false
      });
    } catch (e) { container.remove(); return; }

    renderer.setSize(w, h);
    renderer.setPixelRatio(S.pixelRatio);
    container.appendChild(renderer.domElement);

    // Scene / camera
    scene  = new THREE.Scene();
    camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    // Colour helper
    function parseColor(hex) {
      var c = new THREE.Color(hex);
      return new THREE.Vector3(c.r, c.g, c.b);
    }

    // ── Shaders ─────────────────────────────────────────────────────────────
    var vertexShader = [
      'varying vec2 vUv;',
      'void main() {',
      '  vUv = uv;',
      '  gl_Position = vec4(position, 1.0);',
      '}'
    ].join('\n');

    // Manual tanh — avoids relying on GLSL ES 1.00 missing built-in
    var tanhImpl = [
      'vec3 safeTanh(vec3 v) {',
      '  v = clamp(v, -10.0, 10.0);',
      '  vec3 e = exp(2.0 * v);',
      '  return (e - vec3(1.0)) / (e + vec3(1.0));',
      '}'
    ].join('\n');

    var fragLines = [
      'precision ' + S.prec + ' float;',
      '',
      'uniform float uTime;',
      'uniform vec2  uResolution;',
      'uniform vec2  uMouse;',
      'uniform vec3  uTopColor;',
      'uniform vec3  uBottomColor;',
      'uniform float uIntensity;',
      'uniform bool  uInteractive;',
      'uniform float uGlowAmount;',
      'uniform float uPillarWidth;',
      'uniform float uPillarHeight;',
      'uniform float uNoiseIntensity;',
      'uniform float uRotCos;',
      'uniform float uRotSin;',
      'uniform float uPillarRotCos;',
      'uniform float uPillarRotSin;',
      'uniform float uWaveSin;',
      'uniform float uWaveCos;',
      'varying vec2 vUv;',
      '',
      'const float STEP_MULT = ' + S.stepMult.toFixed(1) + ';',
      'const int   MAX_ITER  = ' + S.iter + ';',
      'const int   WAVE_ITER = ' + S.waveIter + ';',
      '',
      tanhImpl,
      '',
      'void main() {',
      '  vec2 uv = (vUv * 2.0 - 1.0) * vec2(uResolution.x / uResolution.y, 1.0);',
      '  uv = vec2(uPillarRotCos * uv.x - uPillarRotSin * uv.y,',
      '            uPillarRotSin * uv.x + uPillarRotCos * uv.y);',
      '',
      '  vec3 ro = vec3(0.0, 0.0, -10.0);',
      '  vec3 rd = normalize(vec3(uv, 1.0));',
      '',
      '  float rotC = uRotCos;',
      '  float rotS = uRotSin;',
      '  if (uInteractive && (uMouse.x != 0.0 || uMouse.y != 0.0)) {',
      '    float a = uMouse.x * 6.283185;',
      '    rotC = cos(a); rotS = sin(a);',
      '  }',
      '',
      '  vec3 col = vec3(0.0);',
      '  float t = 0.1;',
      '',
      '  for (int i = 0; i < MAX_ITER; i++) {',
      '    vec3 p = ro + rd * t;',
      '    p.xz = vec2(rotC * p.x - rotS * p.z, rotS * p.x + rotC * p.z);',
      '',
      '    vec3 q = p;',
      '    q.y = p.y * uPillarHeight + uTime;',
      '',
      '    float freq = 1.0;',
      '    float amp  = 1.0;',
      '    for (int j = 0; j < WAVE_ITER; j++) {',
      '      q.xz = vec2(uWaveCos * q.x - uWaveSin * q.z,',
      '                  uWaveSin * q.x + uWaveCos * q.z);',
      '      q += cos(q.zxy * freq - uTime * float(j) * 2.0) * amp;',
      '      freq *= 2.0; amp *= 0.5;',
      '    }',
      '',
      '    float d     = length(cos(q.xz)) - 0.2;',
      '    float bound = length(p.xz) - uPillarWidth;',
      '    float k = 4.0;',
      '    float h = max(k - abs(d - bound), 0.0);',
      '    d = max(d, bound) + h * h * 0.0625 / k;',
      '    d = abs(d) * 0.15 + 0.01;',
      '',
      '    float grad = clamp((15.0 - p.y) / 30.0, 0.0, 1.0);',
      '    col += mix(uBottomColor, uTopColor, grad) / d;',
      '',
      '    t += d * STEP_MULT;',
      '    if (t > 50.0) break;',
      '  }',
      '',
      '  float widthNorm = uPillarWidth / 3.0;',
      '  col = safeTanh(col * uGlowAmount / widthNorm);',
      '  col -= fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453)',
      '         / 15.0 * uNoiseIntensity;',
      '',
      '  gl_FragColor = vec4(col * uIntensity, 1.0);',
      '}'
    ].join('\n');

    // ── Shader material ──────────────────────────────────────────────────────
    var pillarRotRad = (PILLAR_ROTATION * Math.PI) / 180;

    material = new THREE.ShaderMaterial({
      vertexShader:   vertexShader,
      fragmentShader: fragLines,
      uniforms: {
        uTime:          { value: 0 },
        uResolution:    { value: new THREE.Vector2(w, h) },
        uMouse:         { value: new THREE.Vector2(0, 0) },
        uTopColor:      { value: parseColor(TOP_COLOR) },
        uBottomColor:   { value: parseColor(BOTTOM_COLOR) },
        uIntensity:     { value: INTENSITY },
        uInteractive:   { value: INTERACTIVE },
        uGlowAmount:    { value: GLOW_AMOUNT },
        uPillarWidth:   { value: PILLAR_WIDTH },
        uPillarHeight:  { value: PILLAR_HEIGHT },
        uNoiseIntensity:{ value: NOISE_INTENSITY },
        uRotCos:        { value: 1.0 },
        uRotSin:        { value: 0.0 },
        uPillarRotCos:  { value: Math.cos(pillarRotRad) },
        uPillarRotSin:  { value: Math.sin(pillarRotRad) },
        uWaveSin:       { value: Math.sin(0.4) },
        uWaveCos:       { value: Math.cos(0.4) }
      },
      transparent: true,
      depthWrite:  false,
      depthTest:   false
    });

    geometry = new THREE.PlaneGeometry(2, 2);
    scene.add(new THREE.Mesh(geometry, material));

    // ── Animation loop ───────────────────────────────────────────────────────
    var lastTime  = performance.now();
    var targetFPS = eq === 'low' ? 30 : 60;
    var frameDur  = 1000 / targetFPS;

    function animate(now) {
      if (!material || !renderer) return;
      var delta = now - lastTime;
      if (delta >= frameDur) {
        timeVal += 0.016 * ROTATION_SPEED;
        material.uniforms.uTime.value    = timeVal;
        material.uniforms.uRotCos.value  = Math.cos(timeVal * 0.3);
        material.uniforms.uRotSin.value  = Math.sin(timeVal * 0.3);
        renderer.render(scene, camera);
        lastTime = now - (delta % frameDur);
      }
      rafId = requestAnimationFrame(animate);
    }
    rafId = requestAnimationFrame(animate);

    // ── Resize ───────────────────────────────────────────────────────────────
    var resizeTimer = null;
    window.addEventListener('resize', function () {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        if (!renderer || !material) return;
        var nw = container.clientWidth  || window.innerWidth;
        var nh = container.clientHeight || window.innerHeight;
        renderer.setSize(nw, nh);
        material.uniforms.uResolution.value.set(nw, nh);
      }, 150);
    }, { passive: true });
  }

})();
