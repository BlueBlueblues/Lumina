/* 锦鲤池背景运行时：两层视差 + 萤火，只在记录/回看/档案显示 */
(function () {
  'use strict';

  var el = document.getElementById('koiScene');
  var back = document.getElementById('koiBack');
  var front = document.getElementById('koiFront');
  var sway = document.getElementById('koiSway');
  var rays = document.querySelector('.koiRays');
  var flies = document.getElementById('koiFlies');
  var dataEl = document.getElementById('koi-data');
  if (!el || !back || !front || !dataEl) return;

  var data = {};
  try { data = JSON.parse(dataEl.textContent || '{}'); } catch (e) { data = {}; }
  if (data.back) back.style.backgroundImage = 'url("' + data.back + '")';
  if (data.front && sway) sway.style.backgroundImage = 'url("' + data.front + '")';

  if (flies && !flies.childElementCount) {
    for (var i = 0; i < 14; i++) {
      var s = document.createElement('span');
      var size = (2 + Math.random() * 2.4).toFixed(1);
      s.style.left = (4 + Math.random() * 92) + '%';
      s.style.top = (24 + Math.random() * 62) + '%';
      s.style.width = size + 'px';
      s.style.height = size + 'px';
      s.style.animationDuration = (9 + Math.random() * 11).toFixed(1) + 's';
      s.style.animationDelay = (-Math.random() * 20).toFixed(1) + 's';
      flies.appendChild(s);
    }
  }

  var mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  var reduced = !!(mq && mq.matches);
  var tx = 0, ty = 0, px = 0, py = 0, raf = 0, running = false, visible = false;

  function apply() {
    back.style.transform =
      'translate3d(' + (-px * 10).toFixed(2) + 'px,' + (-py * 7).toFixed(2) + 'px,0)';
    front.style.transform =
      'translate3d(' + (-px * 20).toFixed(2) + 'px,' + (-py * 13).toFixed(2) + 'px,0)';
    if (rays) rays.style.transform =
      'translate3d(' + (-px * 6).toFixed(2) + 'px,' + (-py * 4).toFixed(2) + 'px,0)';
  }
  function tick() {
    raf = 0;
    if (!running) return;
    px += (tx - px) * 0.05;
    py += (ty - py) * 0.05;
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
    var n = document.body.getAttribute('data-screen');
    var on = n === 'home' || n === 'record' || n === 'review' || n === 'archive';
    el.classList.toggle('on', on);
    document.documentElement.classList.toggle('koi-live', on);
    visible = on;
    if (on) start(); else stop();
  }

  document.addEventListener('pointermove', function (e) {
    tx = Math.max(-1, Math.min(1, (e.clientX / window.innerWidth) * 2 - 1));
    ty = Math.max(-1, Math.min(1, (e.clientY / window.innerHeight) * 2 - 1));
  }, { passive: true });
  document.addEventListener('pointerleave', function () { tx = 0; ty = 0; }, { passive: true });
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stop(); else if (visible) start();
  });

  if (document.body) {
    new MutationObserver(sync).observe(document.body, { attributes: true, attributeFilter: ['data-screen'] });
    sync();
  } else {
    document.addEventListener('DOMContentLoaded', sync);
  }
})();
