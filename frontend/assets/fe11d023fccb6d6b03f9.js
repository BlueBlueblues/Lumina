/* ============================================================
   窗框视差运行时
   - 窗框/窗台固定
   - 窗外是一张更大的图，鼠标移动 = 视线转动
   - 鼠标往左 → 窗外图右移（露出左边）
   - 鼠标往下 → 窗外图上移（露出下面）
   ============================================================ */
(function () {
  'use strict';

  var el = document.getElementById('winScene');
  var outside = document.getElementById('winOutside');
  var frame = document.getElementById('winFrame');
  var dataEl = document.getElementById('window-data');
  if (!el || !outside || !frame || !dataEl) return;

  var data = {};
  try { data = JSON.parse(dataEl.textContent || '{}'); } catch (e) { data = {}; }
  if (!data.record || !data.record.frame || !data.record.outside) return;

  frame.src = data.record.frame;
  outside.style.backgroundImage = 'url("' + data.record.outside + '")';

  var mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  var reduced = !!(mq && mq.matches);

  var MAX_X = 112;
  var MAX_Y = 56;
  var tx = 0, ty = 0, px = 0, py = 0;
  var raf = 0, running = false, visible = false;

  function apply() {
    outside.style.transform =
      'translate3d(' + (-px * MAX_X).toFixed(2) + 'px,' + (-py * MAX_Y).toFixed(2) + 'px,0)';
  }

  function tick() {
    raf = 0;
    if (!running) return;
    px += (tx - px) * 0.06;
    py += (ty - py) * 0.06;
    apply();
    raf = requestAnimationFrame(tick);
  }

  function start() {
    if (reduced) { px = 0; py = 0; apply(); return; }
    if (running) return;
    running = true;
    raf = requestAnimationFrame(tick);
  }

  function stop() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  function sync() {
    var name = document.body.getAttribute('data-screen');
    var on = name === 'record';
    el.classList.toggle('on', on);
    document.documentElement.classList.toggle('win-record', on);
    visible = on;
    if (on) start(); else stop();
  }

  document.addEventListener('pointermove', function (e) {
    tx = Math.max(-1, Math.min(1, (e.clientX / window.innerWidth) * 2 - 1));
    ty = Math.max(-1, Math.min(1, (e.clientY / window.innerHeight) * 2 - 1));
  }, { passive: true });

  document.addEventListener('pointerleave', function () {
    tx = 0; ty = 0;
  }, { passive: true });

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stop();
    else if (visible) start();
  });

  if (document.body) {
    new MutationObserver(sync).observe(document.body, { attributes: true, attributeFilter: ['data-screen'] });
    sync();
  } else {
    document.addEventListener('DOMContentLoaded', sync);
  }
})();
