/* 首页锦鲤池。坐标使用 CSS 像素，移动和天气共用同一个时钟。 */
(() => {
  'use strict';

  const scene = document.getElementById('koiScene');
  const front = document.getElementById('koiFront');
  const sway = document.getElementById('koiSway');
  const moodBar = document.getElementById('koiMoodBar');
  const home = document.getElementById('screen-home');
  if (!scene || !front || !sway || !moodBar || !home) return;

  const canvas = document.createElement('canvas');
  canvas.id = 'koiInteractive';
  canvas.hidden = true;
  scene.insertBefore(canvas, front);
  const header = home.querySelector('.top');
  const grid = home.querySelector('.overviewGrid');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const tau = Math.PI * 2;
  const rand = (min, max) => min + Math.random() * (max - min);
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const angleDiff = (a, b) => Math.atan2(Math.sin(b - a), Math.cos(b - a));
  const approach = (value, target, rate, dt) => target + (value - target) * Math.exp(-rate * dt);

  /* 四档心情参数：拉开显著视觉层次 */
  const moods = {
    happy: { key: 'happy', rain: 0,   sun: 1.0  },
    calm:  { key: 'calm',  rain: 0,   sun: .06  },
    low:   { key: 'low',   rain: .36, sun: 0    },
    sad:   { key: 'sad',   rain: 1.0, sun: 0    },
  };
  scene.dataset.weather = 'calm';

  const colors = [
    ['#f8e5c1', '#dc693d'], ['#efb855', '#a56a32'], ['#fff3d5', '#cfc39b'],
    ['#e47b45', '#a9302d'], ['#ded1a5', '#485353'], ['#f3e8ce', '#d58045'],
    ['#eabc4f', '#695135'],
  ];

  // Top of the rock bank in the original 16:9 foreground image.
  const bank = [[0,.73],[.07,.73],[.14,.80],[.22,.86],[.31,.89],[.48,.92],[.56,.92],
    [.68,.85],[.78,.86],[.90,.92],[.96,.81],[1,.81]];
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let width, height, ratio, waterClip, sunshine, sunBeamGrad, stormMistGrad, waterTop, laneBottom;
  let shoreline = [];
  let rain = 0, sun = moods.calm.sun, target = moods.calm, rainCredit = 0, clock = 0;
  let running = false, frameId = 0, lastTime = 0;
  let pointer = null, foregroundMask = null;
  const fishes = [], drops = [], rainRipples = [], touchRipples = [], sparkles = [];

  function cover(rect) {
    const w = Math.max(rect.width, rect.height * 16 / 9);
    const h = w * 9 / 16;
    return { x: rect.left + (rect.width - w) / 2, y: rect.top + (rect.height - h) / 2, w, h };
  }

  const foreground = new Image();
  foreground.onload = () => {
    const sample = document.createElement('canvas');
    sample.width = 256;
    sample.height = 144;
    const sampling = sample.getContext('2d', { willReadFrequently: true });
    sampling.drawImage(foreground, 0, 0, sample.width, sample.height);
    foregroundMask = sampling.getImageData(0, 0, sample.width, sample.height).data;
  };
  const foregroundUrl = JSON.parse(document.getElementById('koi-data').textContent).front;
  if (foregroundUrl) foreground.src = foregroundUrl;

  function bankAt(x) {
    const right = shoreline.findIndex(point => point.x >= x);
    if (right < 0) return shoreline.at(-1).y;
    if (right === 0) return shoreline[0].y;
    const a = shoreline[right - 1], b = shoreline[right];
    return a.y + (b.y - a.y) * (x - a.x) / (b.x - a.x);
  }

  function waterAt(x, y) {
    return x >= 0 && x < width && y >= 0 && y < Math.min(height, bankAt(x));
  }

  // 前景层位置每帧只读取一次（避免每个雨滴/波光点都触发布局读取）
  let foregroundRect = null;
  function refreshForegroundRect() {
    foregroundRect = cover(sway.getBoundingClientRect());
  }

  function foregroundAt(x, y) {
    if (!foregroundMask) return false;
    if (!foregroundRect) refreshForegroundRect();
    const rect = foregroundRect;
    const i = Math.floor((x - rect.x) / rect.w * 256);
    const j = Math.floor((y - rect.y) / rect.h * 144);
    return i >= 0 && i < 256 && j >= 0 && j < 144 && foregroundMask[(j * 256 + i) * 4 + 3] > 110;
  }

  function initSparkles(w, h) {
    sparkles.length = 0;
    for (let i = 0; i < 28; i++) {
      sparkles.push({
        x: rand(w * .03, w * .72),
        y: rand(h * .07, h * .62),
        r: rand(1.4, 3.4),
        phase: rand(0, tau),
        speed: rand(1.6, 3.2),
      });
    }
  }

  function resize() {
    const w = scene.clientWidth, h = scene.clientHeight;
    if (!w || !h) return;
    waterTop = header.offsetHeight;
    const gridTop = grid.getBoundingClientRect().top + window.scrollY;
    laneBottom = Math.max(waterTop + 50, Math.min(gridTop - 12, waterTop + 160));
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (w === width && h === height && dpr === ratio) return;
    const oldWidth = width || w, oldHeight = height || h;
    width = w; height = h; ratio = dpr;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const fitted = cover({ left: -w * .05, top: -h * .05, width: w * 1.1, height: h * 1.1 });
    shoreline = bank.map(([x,y]) => ({ x: fitted.x + x * fitted.w, y: fitted.y + y * fitted.h }));
    waterClip = new Path2D();
    waterClip.moveTo(0, 0);
    waterClip.lineTo(w, 0);
    waterClip.lineTo(w, bankAt(w));
    for (const point of shoreline.slice().reverse()) {
      if (point.x > 0 && point.x < w) waterClip.lineTo(point.x, point.y);
    }
    waterClip.lineTo(0, bankAt(0));
    waterClip.closePath();

    // 左上角主暖阳光晕（增强亮度与覆盖范围）
    sunshine = ctx.createRadialGradient(w * .04, h * .05, 0, w * .04, h * .05, Math.max(w * .88, h * .75));
    sunshine.addColorStop(0, 'rgba(255, 232, 148, .78)');
    sunshine.addColorStop(.28, 'rgba(255, 214, 115, .44)');
    sunshine.addColorStop(.62, 'rgba(255, 228, 156, .16)');
    sunshine.addColorStop(1, 'rgba(255, 231, 168, 0)');

    // 丁达尔斜射暖光束渐变
    sunBeamGrad = ctx.createLinearGradient(0, 0, w * .78, h * .78);
    sunBeamGrad.addColorStop(0, 'rgba(255, 240, 178, .42)');
    sunBeamGrad.addColorStop(.45, 'rgba(255, 224, 138, .18)');
    sunBeamGrad.addColorStop(1, 'rgba(255, 224, 138, 0)');

    // 雨天顶部与水面冷雾渐变
    stormMistGrad = ctx.createLinearGradient(0, 0, 0, h);
    stormMistGrad.addColorStop(0, 'rgba(10, 32, 48, .56)');
    stormMistGrad.addColorStop(.45, 'rgba(12, 42, 60, .34)');
    stormMistGrad.addColorStop(1, 'rgba(8, 26, 40, .52)');

    initSparkles(w, h);
    for (const fish of fishes) {
      fish.x *= w / oldWidth;
      fish.y *= h / oldHeight;
    }
    drops.length = rainRipples.length = touchRipples.length = 0;
  }

  function makeFish(index) {
    const top = waterTop;
    const x = width * (.09 + (index + .5) * .82 / colors.length);
    return {
      x, y: index < 4 ? rand(top + 48, laneBottom) : rand(top + 65, Math.max(top + 70, bankAt(x) - 42)),
      length: rand(44, 64), direction: rand(0, tau), turn: rand(0, tau),
      speed: 16, cruise: rand(19, 39), phase: rand(0, tau), tail: 1,
      wander: rand(.5, 2.8), pause: 0, reaction: 0, burst: false, lane: index < 4,
      color: colors[index],
    };
  }

  function updateFish(fish, dt) {
    fish.reaction = Math.max(0, fish.reaction - dt);
    fish.pause = Math.max(0, fish.pause - dt);
    fish.wander -= dt;
    if (fish.wander <= 0 && !fish.reaction) {
      fish.turn = fish.direction + rand(-1.5, 1.5);
      fish.cruise = rand(19, 39);
      fish.wander = rand(1.4, 4.8);
      if (Math.random() < .24) fish.pause = rand(.55, 1.45);
    }

    const size = fishSize(fish);
    const margin = size * .54;
    const left = margin, right = width - margin, ceiling = waterTop + size * .30;
    const bottomAt = x => Math.max(ceiling + 20, Math.min(bankAt(x) - margin, fish.lane ? laneBottom : height - margin));
    const bottom = bottomAt(fish.x);
    const travel = Math.max(fish.speed, 14) * .56 + 8;
    const aheadX = fish.x + Math.cos(fish.direction) * travel;
    const aheadY = fish.y + Math.sin(fish.direction) * travel;
    const inwardX = clamp(aheadX, left, right) - aheadX;
    const inwardY = clamp(aheadY, ceiling, bottomAt(aheadX)) - aheadY;
    const turningAtBank = inwardX !== 0 || inwardY !== 0;
    const desired = turningAtBank ? Math.atan2(inwardY, inwardX) : fish.turn;
    let steering = angleDiff(fish.direction, desired) * 1.9;
    if (!turningAtBank && !fish.reaction) {
      for (const other of fishes) {
        if (other === fish) continue;
        const dx = fish.x - other.x, dy = fish.y - other.y;
        const distance = Math.hypot(dx, dy);
        if (distance > 1 && distance < size * 1.05) {
          steering += clamp(angleDiff(fish.direction, Math.atan2(dy, dx)), -.65, .65) * (1 - distance / (size * 1.05));
        }
      }
    }
    const rate = turningAtBank ? 2.8 : fish.reaction ? 2.65 : 1.3;
    fish.direction += clamp(steering, -rate, rate) * dt;
    if (turningAtBank && !fish.reaction) fish.turn = fish.direction;
    const boosting = fish.burst && fish.reaction > .26;
    const speed = fish.pause ? 1.6 : fish.cruise * (boosting ? 2.25 : 1);
    fish.speed = approach(fish.speed, turningAtBank ? Math.min(speed, 16) : speed, 4.2, dt);
    fish.x = clamp(fish.x + Math.cos(fish.direction) * fish.speed * dt, left, right);
    fish.y = clamp(fish.y + Math.sin(fish.direction) * fish.speed * dt, ceiling, bottom);
    fish.tail = approach(fish.tail, fish.reaction ? 1.75 : fish.pause ? .38 : 1, 6, dt);
    fish.phase += (3 + fish.speed * .09) * dt;
  }

  function fishSize(fish) {
    return fish.length * (width <= 640 ? .83 : 1);
  }

  function drawFish(fish) {
    const length = fishSize(fish);
    const wag = Math.sin(fish.phase) * fish.tail * .11;

    // 晴天暖光下，鱼身在池底投出柔和偏移水影
    if (sun > .18) {
      ctx.save();
      ctx.translate(fish.x + 8 * sun, fish.y + 11 * sun);
      ctx.rotate(fish.direction);
      ctx.scale(length * .96, length * .96);
      ctx.globalAlpha = .22 * sun;
      ctx.fillStyle = '#06241f';
      ctx.beginPath();
      ctx.moveTo(.53, 0);
      ctx.bezierCurveTo(.48, -.24, .08, -.26, -.46, wag);
      ctx.bezierCurveTo(.05, .26, .48, .24, .53, 0);
      ctx.fill();
      ctx.restore();
    }

    ctx.save();
    ctx.translate(fish.x, fish.y);
    ctx.rotate(fish.direction);
    ctx.scale(length, length);

    // Dappled patches follow the curved body.
    ctx.globalAlpha = .92;
    ctx.beginPath();
    ctx.moveTo(.53, 0);
    ctx.bezierCurveTo(.48,-.24,.08,-.26,-.46,wag);
    ctx.bezierCurveTo(.05,.26,.48,.24,.53,0);
    ctx.fillStyle = fish.color[0];
    ctx.fill();
    ctx.save();
    ctx.clip();
    ctx.fillStyle = fish.color[1];
    ctx.beginPath();
    ctx.ellipse(.29, -.054, .16, .11, -.4, 0, tau);
    ctx.ellipse(-.13, .06, .17, .115, .37, 0, tau);
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = fish.color[0];
    ctx.globalAlpha = .72;
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.ellipse(.10, side * .17, .14, .048, side * (-.61 + wag), 0, tau);
      ctx.fill();
    }
    ctx.beginPath();
    ctx.moveTo(-.30, wag * .5);
    ctx.quadraticCurveTo(-.55,wag * .75,-.70,wag * 1.5 - .135);
    ctx.quadraticCurveTo(-.66,wag * 1.5,-.76,wag * 1.5 + .13);
    ctx.quadraticCurveTo(-.51,wag,-.30,wag * .5);
    ctx.fill();
    ctx.globalAlpha = .88;
    ctx.fillStyle = '#2a302a';
    for (const y of [-.085, .085]) {
      ctx.beginPath();
      ctx.arc(.40, y, .023, 0, tau);
      ctx.fill();
    }
    ctx.restore();
  }

  function hitFish(fish, x, y) {
    const dx = x - fish.x, dy = y - fish.y, l = fishSize(fish);
    const cosine = Math.cos(fish.direction), sine = Math.sin(fish.direction);
    return ((dx * cosine + dy * sine + l * .06) / (l * .69)) ** 2 +
      ((dy * cosine - dx * sine) / (l * .24 + 5)) ** 2 < 1;
  }

  function react(fish) {
    if (fish.reaction || reduced()) return;
    fish.pause = 0;
    fish.reaction = .94;
    fish.burst = Math.random() < .5;
    fish.turn = fish.direction + (Math.random() < .5 ? -1 : 1) * (fish.burst ? .48 : 1.42);
  }

  /* 绘制愉快晴天的左上角斜射光束与水面波光 */
  function drawSunlightEffects(dt) {
    if (sun <= .01) return;
    ctx.save();
    ctx.globalAlpha = sun;
    ctx.fillStyle = sunshine;
    ctx.fillRect(0, 0, width, height);

    const beamStrength = clamp((sun - .12) / .88, 0, 1);
    if (beamStrength > .01) {
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      const beams = [
        [.16, .34, .88, .55],
        [.38, .58, .95, .72],
        [.62, .84, .78, .92],
        [.04, .18, .68, .95],
      ];
      for (let i = 0; i < beams.length; i++) {
        const [a0, a1, reach, weight] = beams[i];
        const drift = Math.sin(clock * (.7 + i * .23) + i * 1.4) * .035;
        ctx.globalAlpha = beamStrength * weight;
        ctx.fillStyle = sunBeamGrad;
        ctx.beginPath();
        ctx.moveTo(-20, -20);
        ctx.lineTo(width * (a0 + drift) * reach, height * reach);
        ctx.lineTo(width * (a1 + drift) * reach, height * reach);
        ctx.closePath();
        ctx.fill();
      }

      // 暖阳水面浮光点点
      for (const sp of sparkles) {
        if (!waterAt(sp.x, sp.y) || foregroundAt(sp.x, sp.y)) continue;
        const pulse = .5 + .5 * Math.sin(clock * sp.speed + sp.phase);
        const alpha = beamStrength * pulse * .72;
        if (alpha < .08) continue;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#fff6cf';
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.r * (.7 + pulse * .45), 0, tau);
        ctx.fill();
      }
      ctx.restore();
    }
    ctx.restore();
  }

  function spawnDrop() {
    const heavy = rain > .55;
    for (let attempt = 0; attempt < 4; attempt++) {
      const x = rand(4, width - 4);
      const maxBank = Math.min(height - 4, bankAt(x) - 4);
      const y = rand(14, Math.max(30, maxBank));
      if (foregroundAt(x, y)) continue;
      drops.push({
        x,
        y,
        life: 0,
        travel: heavy ? rand(140, 250) : rand(90, 170),
        duration: heavy ? rand(.32, .48) : rand(.44, .62),
        length: heavy ? rand(26, 46) : rand(17, 27),
        width: heavy ? rand(1.4, 2.15) : rand(1.15, 1.5),
        canRipple: waterAt(x, y),
      });
      return;
    }
  }

  function ripple(list, x, y, fromRain) {
    const heavy = rain > .55;
    const cap = fromRain ? (heavy ? 92 : 36) : 22;
    if (list.length >= cap) list.shift();
    list.push({
      x,
      y,
      life: 0,
      duration: fromRain ? (heavy ? .92 : .85) : 1.15,
      radius: fromRain ? (heavy ? rand(22, 42) : rand(16, 28)) : rand(48, 64),
      fromRain,
      heavy: fromRain && heavy,
    });
  }

  function drawRipples(list, dt) {
    for (let i = list.length - 1; i >= 0; i--) {
      const item = list[i];
      item.life += dt;
      const t = item.life / item.duration;
      if (t >= 1) { list.splice(i, 1); continue; }
      const x = item.x, y = item.y;
      const radius = item.radius * (1 - (1 - t) ** 2);
      const count = item.fromRain ? (item.heavy ? 2 : 1) : 2;
      for (let ring = 0; ring < count; ring++) {
        const r = radius - ring * (item.fromRain ? 7 : 9);
        if (r <= 0) continue;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, tau);
        ctx.lineWidth = item.fromRain ? (item.heavy ? 1.45 : 1.15) : 1.75;
        const baseAlpha = item.fromRain ? (item.heavy ? .76 : .58) : .88;
        ctx.strokeStyle = `rgba(218, 246, 252, ${(1 - t) * baseAlpha * (ring ? .56 : 1)})`;
        ctx.stroke();
      }
      // 雨滴刚落水时的中心水珠亮点
      if (item.fromRain && t < .22) {
        ctx.beginPath();
        ctx.arc(x, y, item.heavy ? 2.1 : 1.5, 0, tau);
        ctx.fillStyle = `rgba(235, 250, 255, ${(1 - t / .22) * (item.heavy ? .82 : .55)})`;
        ctx.fill();
      }
    }
  }

  function draw(dt) {
    clock += dt;
    refreshForegroundRect();
    ctx.clearRect(0, 0, width, height);
    const still = reduced();
    rain = still ? target.rain : approach(rain, target.rain, 1.85, dt);
    sun = still ? target.sun : approach(sun, target.sun, 1.85, dt);

    ctx.save();
    ctx.clip(waterClip);

    for (const fish of fishes) {
      if (!still) updateFish(fish, dt);
      drawFish(fish);
    }

    // 晴天暖光束与波光
    drawSunlightEffects(dt);

    // 雨天水面冷色压暗：稍低落微凉，很低落深沉明显
    if (rain > .004) {
      const darkAlpha = rain < .5 ? rain * .52 : .19 + (rain - .36) * .45;
      ctx.fillStyle = stormMistGrad;
      ctx.globalAlpha = clamp(darkAlpha, 0, .58);
      ctx.fillRect(0, 0, width, height);
      ctx.globalAlpha = 1;

      if (!still) {
        // 拉开「稍低落（细雨稀疏）」与「很低落（密集雨幕）」的雨量差距（约 4 倍密度差）
        const areaScale = clamp(width * height / 15000, 32, 86);
        const rainRate = rain <= .42 ? rain * 1.05 : .44 + (rain - .36) * 2.15;
        rainCredit += rainRate * areaScale * dt;
      }
    }
    while (rainCredit >= 1) { spawnDrop(); rainCredit--; }

    drawRipples(rainRipples, dt);
    drawRipples(touchRipples, dt);
    ctx.restore();

    // 雨丝在全画幅绘制（不被岸石裁切，使雨丝清晰可见）
    for (let i = drops.length - 1; i >= 0; i--) {
      const drop = drops[i];
      drop.life += dt;
      const remaining = 1 - drop.life / drop.duration;
      if (remaining <= 0) {
        if (drop.canRipple) ripple(rainRipples, drop.x, drop.y, true);
        drops.splice(i, 1);
        continue;
      }
      const slant = .24;
      const x = drop.x - drop.travel * remaining * slant;
      const y = drop.y - drop.travel * remaining;
      ctx.beginPath();
      ctx.moveTo(x - drop.length * slant, y - drop.length);
      ctx.lineTo(x, y);
      ctx.lineWidth = drop.width;
      const streakAlpha = (.38 + rain * .46) * Math.min(1, drop.life * 14);
      ctx.strokeStyle = `rgba(224, 244, 255, ${streakAlpha})`;
      ctx.stroke();
    }
  }

  function reduced() { return motion.matches || document.body.classList.contains('no-motion'); }

  function frame(now) {
    if (!running) return;
    draw(clamp((now - lastTime) / 1000, 0, .05));
    lastTime = now;
    frameId = requestAnimationFrame(frame);
  }

  function sync() {
    const atHome = document.body.dataset.screen === 'home';
    canvas.hidden = !atHome;
    if (!atHome || document.hidden || reduced()) {
      running = false;
      cancelAnimationFrame(frameId);
      drops.length = rainRipples.length = 0;
      rainCredit = 0;
      if (!atHome || document.hidden) {
        pointer = null;
        touchRipples.length = 0;
        return;
      }
    }
    resize();
    if (!fishes.length) for (let i = 0; i < colors.length; i++) fishes.push(makeFish(i));
    if (reduced()) draw(0);
    else if (!running) {
      running = true;
      lastTime = performance.now();
      frameId = requestAnimationFrame(frame);
    }
  }

  function isPoolPointer(event) {
    const el = event.target;
    refreshForegroundRect();
    return !canvas.hidden && home.contains(el) &&
      !el.closest('.panel,.top,#koiMoodBar,button,a,input,select,textarea,label,summary,[role="button"],[role="slider"]') &&
      waterAt(event.clientX, event.clientY) && !foregroundAt(event.clientX, event.clientY);
  }

  document.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0 || !isPoolPointer(event)) return;
    const { clientX: x, clientY: y } = event;
    const fish = fishes.slice().reverse().find(item => hitFish(item, x, y));
    pointer = { id: event.pointerId, x, y, fish };
  }, { passive: true });
  document.addEventListener('pointerup', event => {
    const press = pointer;
    if (!press || event.pointerId !== press.id) return;
    pointer = null;
    const { clientX: x, clientY: y } = event;
    if (Math.hypot(press.x - x, press.y - y) > 9 || !isPoolPointer(event)) return;
    if (press.fish) react(press.fish);
    else if (!reduced()) ripple(touchRipples, x, y, false);
  }, { passive: true });
  document.addEventListener('pointercancel', () => { pointer = null; }, { passive: true });

  moodBar.addEventListener('click', event => {
    const button = event.target.closest('button[data-mood]');
    if (!button) return;
    const nextMood = moods[button.dataset.mood];
    if (!nextMood) return;
    target = nextMood;
    scene.dataset.weather = nextMood.key;
    for (const option of moodBar.querySelectorAll('button')) {
      option.setAttribute('aria-pressed', String(option === button));
    }
    if (reduced() && !canvas.hidden) draw(0);
  });

  new MutationObserver(sync).observe(document.body, { attributes: true, attributeFilter: ['data-screen','class'] });
  window.addEventListener('resize', sync, { passive: true });
  document.addEventListener('visibilitychange', sync);
  motion.addEventListener('change', sync);
  sync();
})();
