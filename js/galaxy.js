/* galaxy.js — Vanilla JS port of React Bits Galaxy starfield WebGL effect
   Raw WebGL, no dependencies. Background layer: z-index:-1, pointer-events:none */
(function () {
  'use strict';

  // ── Config ────────────────────────────────────────────────────────────────
  var FOCAL                 = [0.5, 0.5];
  var ROTATION              = [1.0, 0.0];
  var STAR_SPEED            = 0.5;
  var DENSITY               = 1.0;
  var HUE_SHIFT             = 140;
  var SPEED                 = 1.0;
  var MOUSE_INTERACTION     = true;
  var GLOW_INTENSITY        = 0.3;
  var SATURATION            = 0.0;
  var MOUSE_REPULSION       = true;
  var REPULSION_STRENGTH    = 2.0;
  var TWINKLE_INTENSITY     = 0.3;
  var ROTATION_SPEED        = 0.1;
  var AUTO_CENTER_REPULSION = 0.0;
  var TRANSPARENT           = false; // false = canvas provides its own dark background

  // Make body transparent so the canvas at z-index:-1 shows through as the page background
  var _bg = document.createElement('style');
  _bg.textContent = 'html,body{background:transparent!important;}';
  document.head.appendChild(_bg);

  // ── Container ─────────────────────────────────────────────────────────────
  var container = document.createElement('div');
  container.id  = 'galaxy-bg';
  container.style.cssText =
    'position:fixed;top:0;left:0;width:100%;height:100%;' +
    'z-index:-1;pointer-events:none;overflow:hidden;';
  document.body.appendChild(container);

  // ── WebGL availability check ──────────────────────────────────────────────
  var testCanvas = document.createElement('canvas');
  var testGL = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
  if (!testGL) { container.remove(); return; }

  // ── Mobile detection ──────────────────────────────────────────────────────
  var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  var pixelRatio = isMobile ? 0.5 : Math.min(window.devicePixelRatio || 1, 2);

  // ── Canvas + GL context ───────────────────────────────────────────────────
  var canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;display:block;';
  container.appendChild(canvas);

  var ctxOpts = { alpha: TRANSPARENT, premultipliedAlpha: false, antialias: false,
                  powerPreference: isMobile ? 'low-power' : 'high-performance' };
  var gl = canvas.getContext('webgl', ctxOpts) ||
           canvas.getContext('experimental-webgl', { alpha: TRANSPARENT, premultipliedAlpha: false });

  if (!gl) { container.remove(); return; }

  if (TRANSPARENT) {
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);
  } else {
    gl.clearColor(0, 0, 0, 1);
  }

  // ── Vertex shader ─────────────────────────────────────────────────────────
  var VS = [
    'attribute vec2 uv;',
    'attribute vec2 position;',
    'varying vec2 vUv;',
    'void main() {',
    '  vUv = uv;',
    '  gl_Position = vec4(position, 0.0, 1.0);',
    '}'
  ].join('\n');

  // ── Fragment shader ───────────────────────────────────────────────────────
  var FS = [
    'precision highp float;',
    '',
    'uniform float uTime;',
    'uniform vec3  uResolution;',
    'uniform vec2  uFocal;',
    'uniform vec2  uRotation;',
    'uniform float uStarSpeed;',
    'uniform float uDensity;',
    'uniform float uHueShift;',
    'uniform float uSpeed;',
    'uniform vec2  uMouse;',
    'uniform float uGlowIntensity;',
    'uniform float uSaturation;',
    'uniform bool  uMouseRepulsion;',
    'uniform float uTwinkleIntensity;',
    'uniform float uRotationSpeed;',
    'uniform float uRepulsionStrength;',
    'uniform float uMouseActiveFactor;',
    'uniform float uAutoCenterRepulsion;',
    'uniform bool  uTransparent;',
    '',
    'varying vec2 vUv;',
    '',
    '#define NUM_LAYER 4.0',
    '#define STAR_COLOR_CUTOFF 0.2',
    '#define MAT45 mat2(0.7071, -0.7071, 0.7071, 0.7071)',
    '#define PERIOD 3.0',
    '',
    'float Hash21(vec2 p) {',
    '  p = fract(p * vec2(123.34, 456.21));',
    '  p += dot(p, p + 45.32);',
    '  return fract(p.x * p.y);',
    '}',
    '',
    'float tri(float x) {',
    '  return abs(fract(x) * 2.0 - 1.0);',
    '}',
    '',
    'float tris(float x) {',
    '  float t = fract(x);',
    '  return 1.0 - smoothstep(0.0, 1.0, abs(2.0 * t - 1.0));',
    '}',
    '',
    'float trisn(float x) {',
    '  float t = fract(x);',
    '  return 2.0 * (1.0 - smoothstep(0.0, 1.0, abs(2.0 * t - 1.0))) - 1.0;',
    '}',
    '',
    'vec3 hsv2rgb(vec3 c) {',
    '  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);',
    '  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);',
    '  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);',
    '}',
    '',
    'float Star(vec2 uv, float flare) {',
    '  float d = length(uv);',
    '  float m = (0.05 * uGlowIntensity) / d;',
    '  float rays = smoothstep(0.0, 1.0, 1.0 - abs(uv.x * uv.y * 1000.0));',
    '  m += rays * flare * uGlowIntensity;',
    '  uv *= MAT45;',
    '  rays = smoothstep(0.0, 1.0, 1.0 - abs(uv.x * uv.y * 1000.0));',
    '  m += rays * 0.3 * flare * uGlowIntensity;',
    '  m *= smoothstep(1.0, 0.2, d);',
    '  return m;',
    '}',
    '',
    'vec3 StarLayer(vec2 uv) {',
    '  vec3 col = vec3(0.0);',
    '  vec2 gv  = fract(uv) - 0.5;',
    '  vec2 id  = floor(uv);',
    '  for (int y = -1; y <= 1; y++) {',
    '    for (int x = -1; x <= 1; x++) {',
    '      vec2  offset    = vec2(float(x), float(y));',
    '      vec2  si        = id + offset;',
    '      float seed      = Hash21(si);',
    '      float size      = fract(seed * 345.32);',
    '      float glossLocal = tri(uStarSpeed / (PERIOD * seed + 1.0));',
    '      float flareSize  = smoothstep(0.9, 1.0, size) * glossLocal;',
    '      float red = smoothstep(STAR_COLOR_CUTOFF, 1.0, Hash21(si + 1.0)) + STAR_COLOR_CUTOFF;',
    '      float blu = smoothstep(STAR_COLOR_CUTOFF, 1.0, Hash21(si + 3.0)) + STAR_COLOR_CUTOFF;',
    '      float grn = min(red, blu) * seed;',
    '      vec3  base = vec3(red, grn, blu);',
    '      float hue = atan(base.g - base.r, base.b - base.r) / (2.0 * 3.14159) + 0.5;',
    '      hue = fract(hue + uHueShift / 360.0);',
    '      float sat = length(base - vec3(dot(base, vec3(0.299, 0.587, 0.114)))) * uSaturation;',
    '      float val = max(max(base.r, base.g), base.b);',
    '      base = hsv2rgb(vec3(hue, sat, val));',
    '      vec2 pad = vec2(',
    '        tris(seed * 34.0 + uTime * uSpeed / 10.0),',
    '        tris(seed * 38.0 + uTime * uSpeed / 30.0)',
    '      ) - 0.5;',
    '      float star    = Star(gv - offset - pad, flareSize);',
    '      float twinkle = trisn(uTime * uSpeed + seed * 6.2831) * 0.5 + 1.0;',
    '      twinkle = mix(1.0, twinkle, uTwinkleIntensity);',
    '      star *= twinkle;',
    '      col  += star * size * base;',
    '    }',
    '  }',
    '  return col;',
    '}',
    '',
    'void main() {',
    '  vec2 focalPx  = uFocal * uResolution.xy;',
    '  vec2 uv       = (vUv * uResolution.xy - focalPx) / uResolution.y;',
    '  vec2 mouseNorm = uMouse - vec2(0.5);',
    '',
    '  if (uAutoCenterRepulsion > 0.0) {',
    '    float cDist    = length(uv);',
    '    vec2 repulsion = normalize(uv) * (uAutoCenterRepulsion / (cDist + 0.1));',
    '    uv += repulsion * 0.05;',
    '  } else if (uMouseRepulsion) {',
    '    vec2  mUV      = (uMouse * uResolution.xy - focalPx) / uResolution.y;',
    '    float mDist    = length(uv - mUV);',
    '    vec2 repulsion = normalize(uv - mUV) * (uRepulsionStrength / (mDist + 0.1));',
    '    uv += repulsion * 0.05 * uMouseActiveFactor;',
    '  } else {',
    '    uv += mouseNorm * 0.1 * uMouseActiveFactor;',
    '  }',
    '',
    '  float a = uTime * uRotationSpeed;',
    '  uv = mat2(cos(a), -sin(a), sin(a), cos(a)) * uv;',
    '  uv = mat2(uRotation.x, -uRotation.y, uRotation.y, uRotation.x) * uv;',
    '',
    '  vec3 col = vec3(0.0);',
    '  for (float i = 0.0; i < 1.0; i += 1.0 / NUM_LAYER) {',
    '    float depth = fract(i + uStarSpeed * uSpeed);',
    '    float scale = mix(20.0 * uDensity, 0.5 * uDensity, depth);',
    '    float fade  = depth * smoothstep(1.0, 0.9, depth);',
    '    col += StarLayer(uv * scale + i * 453.32) * fade;',
    '  }',
    '',
    '  if (uTransparent) {',
    '    float alpha = smoothstep(0.0, 0.3, length(col));',
    '    gl_FragColor = vec4(col, min(alpha, 1.0));',
    '  } else {',
    '    gl_FragColor = vec4(col, 1.0);',
    '  }',
    '}'
  ].join('\n');

  // ── Compile & link ────────────────────────────────────────────────────────
  function makeShader(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.error('[galaxy.js] shader compile error:', gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  }

  var vs = makeShader(gl.VERTEX_SHADER,   VS);
  var fs = makeShader(gl.FRAGMENT_SHADER, FS);
  if (!vs || !fs) { container.remove(); return; }

  var prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.error('[galaxy.js] program link error:', gl.getProgramInfoLog(prog));
    container.remove(); return;
  }

  // ── Full-screen triangle geometry ─────────────────────────────────────────
  // One big triangle that covers the whole clip-space — faster than a quad
  var posBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);

  var uvBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, uvBuf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0,0, 2,0, 0,2]), gl.STATIC_DRAW);

  var aPos = gl.getAttribLocation(prog, 'position');
  var aUV  = gl.getAttribLocation(prog, 'uv');

  // ── Uniform locations ─────────────────────────────────────────────────────
  var U = {};
  ['uTime','uResolution','uFocal','uRotation','uStarSpeed','uDensity',
   'uHueShift','uSpeed','uMouse','uGlowIntensity','uSaturation',
   'uMouseRepulsion','uTwinkleIntensity','uRotationSpeed','uRepulsionStrength',
   'uMouseActiveFactor','uAutoCenterRepulsion','uTransparent'
  ].forEach(function(n) { U[n] = gl.getUniformLocation(prog, n); });

  // ── Mouse state ───────────────────────────────────────────────────────────
  var tMouse  = { x: 0.5, y: 0.5 };
  var sMouse  = { x: 0.5, y: 0.5 };
  var tActive = 0.0;
  var sActive = 0.0;

  if (MOUSE_INTERACTION) {
    window.addEventListener('mousemove', function(e) {
      tMouse.x = e.clientX / window.innerWidth;
      tMouse.y = 1.0 - e.clientY / window.innerHeight;
      tActive  = 1.0;
    }, { passive: true });
    document.addEventListener('mouseleave', function() { tActive = 0.0; });
  }

  // ── Resize ────────────────────────────────────────────────────────────────
  function resize() {
    canvas.width  = Math.round(window.innerWidth  * pixelRatio);
    canvas.height = Math.round(window.innerHeight * pixelRatio);
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  resize();
  var resizeTimer;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 150);
  }, { passive: true });

  // ── Render loop ───────────────────────────────────────────────────────────
  var rafId = null;

  function animate(ms) {
    var t  = ms * 0.001;     // seconds
    var lp = 0.05;           // lerp factor

    sMouse.x += (tMouse.x - sMouse.x) * lp;
    sMouse.y += (tMouse.y - sMouse.y) * lp;
    sActive  += (tActive  - sActive)  * lp;

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(prog);

    gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuf);
    gl.enableVertexAttribArray(aUV);
    gl.vertexAttribPointer(aUV, 2, gl.FLOAT, false, 0, 0);

    var cw = canvas.width;
    var ch = canvas.height;

    gl.uniform1f(U.uTime,                t);
    gl.uniform3f(U.uResolution,          cw, ch, cw / ch);
    gl.uniform2f(U.uFocal,               FOCAL[0], FOCAL[1]);
    gl.uniform2f(U.uRotation,            ROTATION[0], ROTATION[1]);
    gl.uniform1f(U.uStarSpeed,           (t * STAR_SPEED) / 10.0);
    gl.uniform1f(U.uDensity,             DENSITY);
    gl.uniform1f(U.uHueShift,            HUE_SHIFT);
    gl.uniform1f(U.uSpeed,               SPEED);
    gl.uniform2f(U.uMouse,               sMouse.x, sMouse.y);
    gl.uniform1f(U.uGlowIntensity,       GLOW_INTENSITY);
    gl.uniform1f(U.uSaturation,          SATURATION);
    gl.uniform1i(U.uMouseRepulsion,      MOUSE_REPULSION ? 1 : 0);
    gl.uniform1f(U.uTwinkleIntensity,    TWINKLE_INTENSITY);
    gl.uniform1f(U.uRotationSpeed,       ROTATION_SPEED);
    gl.uniform1f(U.uRepulsionStrength,   REPULSION_STRENGTH);
    gl.uniform1f(U.uMouseActiveFactor,   sActive);
    gl.uniform1f(U.uAutoCenterRepulsion, AUTO_CENTER_REPULSION);
    gl.uniform1i(U.uTransparent,         TRANSPARENT ? 1 : 0);

    gl.drawArrays(gl.TRIANGLES, 0, 3);

    rafId = requestAnimationFrame(animate);
  }
  rafId = requestAnimationFrame(animate);

})();
