/* ============================================================
   光影志 · 背景场景运行时
   - 一层固定 canvas，颜色图 + 深度图
   - 指针移动时按景深错位；底部草木加风
   - prefers-reduced-motion 只画一帧
   ============================================================ */
(function () {
  'use strict';

  var el = document.getElementById('sceneBg');
  if (!el) return;
  var canvas = el.querySelector('canvas');
  var dataEl = document.getElementById('scene-data');
  var DATA = {};
  try { DATA = JSON.parse(dataEl ? dataEl.textContent : '{}'); } catch (e) { DATA = {}; }

  var NAMES = ['record', 'review', 'archive'];
  var mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  var reduced = !!(mq && mq.matches);

  var gl = null;
  try {
    gl = canvas.getContext('webgl', {
      alpha: false, antialias: true, depth: false, stencil: false,
      premultipliedAlpha: false, preserveDrawingBuffer: false, powerPreference: 'low-power'
    });
  } catch (e) { gl = null; }
  if (!gl) { el.classList.add('no-webgl'); return; }

  var VS = [
    'attribute vec3 aPos;',
    'attribute vec2 aUV;',
    'uniform vec2 uScale;',
    'uniform vec2 uPointer;',
    'uniform vec2 uUV;',
    'uniform float uTime;',
    'uniform float uAmp;',
    'varying vec2 vUV;',
    'void main(){',
    '  float near = aPos.z * 0.5 + 0.5;',
    '  vec3 p = aPos;',
    '  p.x -= uPointer.x * uAmp * near;',
    '  p.y += uPointer.y * uAmp * near;',
    '  float w = smoothstep(0.58, 1.0, aUV.y);',
    '  p.x += sin(uTime * 1.15 + aUV.y * 8.0 + aUV.x * 2.3) * 0.006 * w;',
    '  gl_Position = vec4(p.xy * uScale, 0.0, 1.0);',
    '  vUV = (aUV - 0.5) * uUV + 0.5;',
    '}'
  ].join('\n');

  var FS = [
    'precision mediump float;',
    'uniform sampler2D uTex;',
    'varying vec2 vUV;',
    'void main(){',
    '  vec3 c = texture2D(uTex, vUV).rgb;',
    '  gl_FragColor = vec4(c, 1.0);',
    '}'
  ].join('\n');

  function compile(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      if (window.console) console.warn('scene shader', gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  }

  var vs = compile(gl.VERTEX_SHADER, VS);
  var fs = compile(gl.FRAGMENT_SHADER, FS);
  if (!vs || !fs) { el.classList.add('no-webgl'); return; }
  var prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    el.classList.add('no-webgl');
    return;
  }
  gl.useProgram(prog);

  var aPos = gl.getAttribLocation(prog, 'aPos');
  var aUV = gl.getAttribLocation(prog, 'aUV');
  var uScale = gl.getUniformLocation(prog, 'uScale');
  var uPointer = gl.getUniformLocation(prog, 'uPointer');
  var uUV = gl.getUniformLocation(prog, 'uUV');
  var uTime = gl.getUniformLocation(prog, 'uTime');
  var uAmp = gl.getUniformLocation(prog, 'uAmp');
  var uTex = gl.getUniformLocation(prog, 'uTex');
  gl.uniform1i(uTex, 0);

  var cache = {};
  var current = null;
  var raf = 0;
  var running = false;
  var px = 0, py = 0, tx = 0, ty = 0;
  var lastMove = 0;
  var t0 = performance.now();
  var visible = false;

  function makeTex(img) {
    var t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return t;
  }

  function buildMesh(img) {
    var NX = 160, NY = 100;
    var c = document.createElement('canvas');
    c.width = NX; c.height = NY;
    var ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0, NX, NY);
    var d = ctx.getImageData(0, 0, NX, NY).data;

    var n = (NX + 1) * (NY + 1);
    var pos = new Float32Array(n * 3);
    var uv = new Float32Array(n * 2);
    for (var j = 0; j <= NY; j++) {
      for (var i = 0; i <= NX; i++) {
        var k = j * (NX + 1) + i;
        var u = i / NX, v = j / NY;
        pos[k * 3] = u - 0.5;
        pos[k * 3 + 1] = 0.5 - v;
        pos[k * 3 + 2] = (d[(j * NX + Math.min(i, NX - 1)) * 4] / 255) * 2 - 1;
        uv[k * 2] = u;
        uv[k * 2 + 1] = v;
      }
    }
    var idx = new Uint16Array(NX * NY * 6);
    var o = 0;
    for (var jj = 0; jj < NY; jj++) {
      for (var ii = 0; ii < NX; ii++) {
        var a = jj * (NX + 1) + ii;
        var b = a + 1;
        var cc = a + NX + 1;
        var dd = cc + 1;
        idx[o++] = a; idx[o++] = cc; idx[o++] = b;
        idx[o++] = b; idx[o++] = cc; idx[o++] = dd;
      }
    }

    var vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, pos, gl.STATIC_DRAW);
    var uvbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvbo);
    gl.bufferData(gl.ARRAY_BUFFER, uv, gl.STATIC_DRAW);
    var ibo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idx, gl.STATIC_DRAW);

    return { vbo: vbo, uvbo: uvbo, ibo: ibo, count: idx.length };
  }

  function load(name) {
    var s = cache[name];
    if (s && s.loaded) return s;
    if (s && s.loading) return null;
    var d = DATA[name];
    if (!d || !d.img || !d.depth) return null;

    s = cache[name] = { loading: true, loaded: false, w: d.w || 1920, h: d.h || 1200 };
    var got = 0;
    function done() {
      if (++got < 2) return;
      s.tex = makeTex(s.colorImg);
      s.mesh = buildMesh(s.depthImg);
      s.loaded = true;
      s.loading = false;
      s.colorImg = s.depthImg = null;
      document.documentElement.classList.add('scene-live');
      if (current === s) {
        el.classList.add('ready');
        resize();
        draw(performance.now());
      }
    }
    s.colorImg = new Image();
    s.colorImg.onload = done;
    s.colorImg.onerror = function () { s.loading = false; s.failed = true; };
    s.colorImg.src = d.img;
    s.depthImg = new Image();
    s.depthImg.onload = done;
    s.depthImg.onerror = function () { s.loading = false; s.failed = true; };
    s.depthImg.src = d.depth;
    return null;
  }

  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var cw = Math.max(1, Math.round(canvas.clientWidth * dpr));
    var ch = Math.max(1, Math.round(canvas.clientHeight * dpr));
    if (canvas.width !== cw || canvas.height !== ch) {
      canvas.width = cw;
      canvas.height = ch;
    }
  }

  function draw(ts) {
    var s = current;
    if (!s || !s.loaded) return;
    resize();
    var cw = canvas.width, ch = canvas.height;
    var sc = Math.max(cw / s.w, ch / s.h);
    var ndcW = (s.w * sc / cw) * 2;
    var ndcH = (s.h * sc / ch) * 2;
    var OV = 1.14;

    gl.viewport(0, 0, cw, ch);
    gl.clearColor(0.969, 0.949, 0.906, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(prog);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, s.tex);

    gl.bindBuffer(gl.ARRAY_BUFFER, s.mesh.vbo);
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, s.mesh.uvbo);
    gl.enableVertexAttribArray(aUV);
    gl.vertexAttribPointer(aUV, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, s.mesh.ibo);

    gl.uniform2f(uScale, ndcW * OV, ndcH * OV);
    gl.uniform2f(uUV, 1 / OV, 1 / OV);
    gl.uniform2f(uPointer, px, py);
    gl.uniform1f(uTime, ts ? (ts - t0) / 1000 : 0);
    gl.uniform1f(uAmp, 0.026);
    gl.drawElements(gl.TRIANGLES, s.mesh.count, gl.UNSIGNED_SHORT, 0);

    el.style.setProperty('--lx', (px * 16).toFixed(1) + 'px');
    el.style.setProperty('--ly', (py * 12).toFixed(1) + 'px');
  }

  function tick(ts) {
    raf = 0;
    if (!running) return;
    px += (tx - px) * 0.055;
    py += (ty - py) * 0.055;

    var now = performance.now();
    if (now - lastMove > 9000) {
      tx += (Math.sin(now * 0.00016) * 0.45 - tx) * 0.008;
      ty += (Math.cos(now * 0.00011) * 0.30 - ty) * 0.008;
    }
    draw(ts);
    raf = requestAnimationFrame(tick);
  }

  function start() {
    if (running) return;
    if (reduced) { px = 0; py = 0; draw(0); return; }
    running = true;
    raf = requestAnimationFrame(tick);
  }

  function stop() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  function show(name) {
    el.classList.add('on');
    el.classList.remove('ready');
    var s = load(name);
    current = s || cache[name] || null;
    visible = true;
    if (current && current.loaded) {
      el.classList.add('ready');
      draw(performance.now());
    }
    start();
  }

  function hide() {
    visible = false;
    stop();
    el.classList.remove('on');
    el.classList.remove('ready');
    current = null;
  }

  function sync() {
    var name = document.body.getAttribute('data-screen');
    if (NAMES.indexOf(name) >= 0) {
      show(name);
    } else {
      hide();
    }
  }

  document.addEventListener('pointermove', function (e) {
    tx = Math.max(-1, Math.min(1, (e.clientX / window.innerWidth) * 2 - 1));
    ty = Math.max(-1, Math.min(1, (e.clientY / window.innerHeight) * 2 - 1));
    lastMove = performance.now();
  }, { passive: true });

  document.addEventListener('pointerleave', function () {
    tx = 0; ty = 0; lastMove = performance.now();
  }, { passive: true });

  window.addEventListener('resize', function () {
    if (visible && current && current.loaded) {
      resize();
      if (reduced) draw(0);
    }
  }, { passive: true });

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stop();
    else if (visible) start();
  });

  if (mq && mq.addEventListener) {
    mq.addEventListener('change', function (e) {
      reduced = e.matches;
      stop();
      if (visible) { px = 0; py = 0; draw(0); if (!reduced) start(); }
    });
  }

  if (document.body) {
    new MutationObserver(sync).observe(document.body, { attributes: true, attributeFilter: ['data-screen'] });
    sync();
  } else {
    document.addEventListener('DOMContentLoaded', sync);
  }
})();
