
/* 光影志 · 模型接入层
 * ------------------------------------------------------------------
 * 演示版默认走 mock：观察与写作由本地规则生成（确定性、无网络、零成本）
 * 接真实模型时只需把 mode 改成 'http'，并实现下方两个函数：
 *
 *   observe({ thumb, stats })  ->  facts 对象（字段与 mock 完全一致）
 *   write({ facts, mood, note, extra, stage }) -> string
 *
 * 真实实现里：
 *   observe  = 把 thumb（dataURL，256px）发给多模态模型，要求返回 JSON：
 *              { scene, light, subjects[], absence[], text_spans[], conf }
 *              服务端用 Zod 校验，失败重试 1 次，缺字段填 null（不要抛错）
 *   write    = 文本模型，stage='draft' 出 2–4 句描述，stage='memory' 出 3 个候选
 *   textReply({ turns, mood }) -> { reply, question }
 *              reply 承接一句；question 可空，问过的不再问
 *   textIntegrate({ turns, mood }) -> { text }
 *              只用用户说过的话整理，不添加画面事实
 *   photoQuestion({ facts, mood, note }) -> string
 *              照片入口只问一句，且不问画面里有什么
 * 密钥只能放在服务端（Next.js Route Handler / 你们已有的后端），不要进前端
 * ------------------------------------------------------------------ */

(function (global) {
  'use strict';

  const apiBase = (location.protocol === 'file:' || ['5173', '5500', '8080'].includes(location.port))
    ? 'http://127.0.0.1:3000'
    : '';
  const actualCalls = [];
  let activeRequestController = new AbortController();
  const nativeFetch = global.fetch.bind(global);
  async function trackedFetch(url, options) { const entry={endpoint:String(url),startedAt:Date.now(),status:null}; actualCalls.push(entry); try { const response=await nativeFetch(url,{...options,signal:options?.signal || activeRequestController.signal}); entry.status=response.status; return response; } catch(e) { entry.status='network_error'; throw e; } }
  const cfg = {
    mode: 'http',                    // 接入真实后端
    endpoint: apiBase + '/api/lumina',
  };

  /* ---------- 小工具 ---------- */
  function hash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return Math.abs(h);
  }
  function pick(arr, seed) { return arr[seed % arr.length]; }
  function hourOf(iso) { return new Date(iso).getHours(); }

  function timeWord(h) {
    if (h < 5) return '深夜';
    if (h < 8) return '清早';
    if (h < 11) return '上午';
    if (h < 14) return '中午';
    if (h < 17) return '下午';
    if (h < 19) return '傍晚';
    if (h < 23) return '夜里';
    return '深夜';
  }

  /* ---------- 观察：由图像统计推断事实（演示用） ----------
   * 真实模型看到的是像素；这里只拿到统计量，所以结论必然粗糙
   * 但字段形状与真实输出一致，前端不用改 */
  function observe({ stats, iso }) {
    const s = stats || {};
    const b = s.brightness == null ? 0.5 : s.brightness;
    const sat = s.saturation == null ? 0.4 : s.saturation;
    const h = hourOf(iso);
    const seed = hash(iso + '|' + Math.round(b * 100));

    const isNight = h >= 21 || h < 5;
    const isDusk = h >= 17 && h < 20;

    let scene, light;
    if (isNight) {
      if (b < 0.35) { scene = '夜里的街道'; light = '路灯把地面照出一块亮'; }
      else { scene = '夜里的室内'; light = '只有一处人工光源'; }
    } else if (isDusk && b < 0.62) {
      scene = '傍晚的街道'; light = '天光将尽，路灯刚亮';
    } else if (b > 0.72) {
      scene = '白天的窗外'; light = '光很足，几乎没有影子';
    } else if (sat < 0.14) {
      scene = '阴天的室外'; light = '均匀的灰白天光';
    } else if (sat > 0.5) {
      scene = '有颜色的角落'; light = '颜色比光线更抢眼';
    } else {
      scene = '室内的一角'; light = '光源在侧面，明暗过渡很缓';
    }

    const pool = {
      '夜里的街道': ['路灯', '停着的自行车', '关了的店门'],
      '夜里的室内': ['一盏台灯', '摊开的书', '半杯水'],
      '傍晚的街道': ['路灯', '停着的自行车', '远处的云'],
      '白天的窗外': ['树影', '楼与楼之间的天空', '晾着的衣服'],
      '阴天的室外': ['湿掉的地面', '一把伞', '路沿'],
      '有颜色的角落': ['一块布', '墙上的画', '摆件'],
      '室内的一角': ['桌角', '椅子', '窗台'],
    }[scene] || ['桌面'];

    const subjects = [pick(pool, seed), pick(pool, seed + 7)].filter((v, i, a) => a.indexOf(v) === i);
    const absence = [];
    if (b < 0.3 || seed % 3 === 0) absence.push('画面里没有人');
    if (seed % 5 === 0) absence.push('桌上只有一副碗筷');

    return {
      scene: scene,
      time: timeWord(h),
      light: light,
      subjects: subjects,
      absence: absence,
      text_spans: [],
      palette: s.palette || [],
      brightness: Number(b.toFixed(2)),
      saturation: Number(sat.toFixed(2)),
      conf: 0.55 + (seed % 30) / 100,
    };
  }

  /* ---------- 写作：两段式 ---------- */
  function joinSent(list) {
    return list.filter(Boolean).join('，').replace(/，+/g, '，').replace(/\s+/g, ' ').trim();
  }

  function clean(s) {
    return String(s == null ? '' : s).replace(/[！？\s]+$/, '');
  }

  function sentence(s) {
    const t = clean(s);
    return t || '';
  }

  function draftFor({ facts, mood, note }) {
    const t = facts.time || '';
    const scene = facts.scene || '一个角落';
    const light = facts.light || '';
    const sub = (facts.subjects || []).slice(0, 2).join('和');
    const abs = (facts.absence || [])[0];

    const parts = [];
    if (note) parts.push(sentence(note));
    parts.push(sentence((t ? t + '，' : '') + scene));
    if (light) parts.push(sentence(light));
    if (sub) parts.push(sentence(sub + '在画面里'));
    if (abs && parts.length < 4) parts.push(sentence(abs));
    return joinSent(parts.slice(0, 4));
  }

  const MEM_TPL = {
    // 承接事实 + 用户原话；不出现“治愈/拥抱/温柔以待”等词
    a: (f, note, extra, seed) => {
      const sub = (f.subjects || [])[0] || '它';
      const first = note ? sentence(note) : sentence((f.time ? f.time + '，' : '') + (f.scene || '那会儿'));
      const second = sentence(sub + '一直在那儿');
      const third = extra ? sentence(extra) : '我坐了一会儿';
      return joinSent([first, second, third]);
    },
    b: (f, note, extra, seed) => {
      const sub = (f.subjects || [])[0] || '它';
      const first = sentence('回来的时候，' + (f.scene || '屋里') + '还是那个样子');
      const second = sentence(extra || '我看着' + sub + '，没想什么');
      const third = note ? sentence(note) : '';
      return joinSent([first, second, third]);
    },
    c: (f, note, extra, seed) => {
      const sub = (f.subjects || [])[0] || '它';
      const first = note ? sentence(note) : '说不上好，也说不上不好';
      const second = sentence(extra || sub + '在，我也在');
      const third = '这一天就这么过去了';
      return joinSent([first, second, third]);
    },
  };

  function memoryFor({ facts, mood, note, extra, variant }) {
    const key = ['a', 'b', 'c'][variant % 3];
    return MEM_TPL[key](facts, note || '', extra || '', variant);
  }

  /* ---------- 文字记录：可以一直聊下去 ----------
   * 规则只做两件事：接一句；在素材还少、且没问过的时候问一句。
   * 不分析、不劝、不添加用户没说过的事实。 */
  function turnText(turns) {
    return (Array.isArray(turns) ? turns : [])
      .filter((t) => t && t.role === 'me')
      .map((t) => String(t.text == null ? '' : t.text).trim())
      .filter(Boolean);
  }

  function askedQuestions(turns) {
    return (Array.isArray(turns) ? turns : [])
      .filter((t) => t && t.role === 'it' && t.question)
      .map((t) => t.question);
  }

  function textReply({ turns, mood }) {
    const mine = turnText(turns);
    const last = mine[mine.length - 1] || '';
    const all = mine.join(' ');
    const turn = mine.length;
    const seed = hash(all + '|' + (mood && mood.phi != null ? mood.phi : 'x') + '|' + turn);
    const replies = [
      '我听着，你慢慢说',
      '嗯，这句我记住了',
      '这些不用写得更好，已经够了',
      '说出来的这些，比画面还清楚',
      '我在，接着说吧',
    ];

    const asked = askedQuestions(turns);
    const candidates = [];
    if (/会|班|公司|学校|课/.test(last)) candidates.push('散会之后，你去了哪儿');
    if (/饭|吃|喝|咖啡|茶/.test(last)) candidates.push('那顿饭，吃了多久');
    if (/家|屋|房间|窗/.test(last)) candidates.push('屋里还有别人吗');
    if (/路|街|车站|地铁|公交/.test(last)) candidates.push('那段路，你走了多久');
    candidates.push('后来呢', '那天还发生了什么', '当时在哪儿，还记得吗', '这句话，你想对谁说', '如果给这会儿留一个画面，会是什么');

    let question = '';
    if (turn <= 3 && last.length < 60) {
      question = candidates.find((q) => asked.indexOf(q) < 0) || '';
    } else if (last.length < 10) {
      question = '还有一点想说的吗';
      if (asked.indexOf(question) >= 0) question = '';
    }
    return { reply: pick(replies, seed), question: question };
  }

  function textIntegrated({ turns }) {
    const mine = turnText(turns);
    const picked = mine.length > 3
      ? [mine[0], mine[mine.length - 2], mine[mine.length - 1]]
      : mine;
    const parts = picked.map((s) => clean(s).replace(/[。；;]+$/, '')).filter(Boolean);
    // 收尾只用中性的说法：不引用光线、时辰，避免和用户已经写下的内容打架
    const closes = ['这些，先放在这里', '就这样，留在这里', '这一页，先写到这儿', '其余的，慢慢再说'];
    const close = pick(closes, hash(mine.join('|')));
    parts.push(close);
    return joinSent(parts.slice(0, 4));
  }

  function photoQuestion({ facts, mood, note }) {
    const n = String(note == null ? '' : note).trim();
    const seed = hash((facts && facts.scene || '') + '|' + (mood && mood.phi != null ? mood.phi : 'x') + '|' + n);
    const qs = [];
    if (n) qs.push('你刚才写的那句，后来呢');
    if (mood && mood.valence < -0.12) qs.push('要是愿意，说说这会儿心里最放不下的是什么');
    else if (mood && mood.valence > 0.15) qs.push('这一天里，有没有哪一刻想多留一会儿');
    qs.push('那会儿，你本来在做什么', '那天还有什么事，是你想留下的');
    return pick(qs, seed);
  }

  /* ---------- http 实现（骨架，接真实模型时补这里） ---------- */
  async function httpObserve(payload) {
    const r = await trackedFetch(cfg.endpoint + '/observe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: payload.thumb, iso: payload.iso }),
    });
    if (!r.ok) throw new Error('observe failed: ' + r.status);
    return await r.json(); // 后端需按同一 schema 返回
  }

  async function httpWrite(payload) {
    const r = await trackedFetch(cfg.endpoint + '/write', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!r.ok) throw new Error('write failed: ' + r.status);
    const j = await r.json();
    return j.text;
  }

  async function httpTextReply(payload) {
    const r = await trackedFetch(cfg.endpoint + '/text/reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ turns: payload.turns, mood: payload.mood }),
    });
    if (!r.ok) throw new Error('text reply failed: ' + r.status);
    return await r.json(); // { reply, question }，缺字段按空串处理
  }

  async function httpTextIntegrate(payload) {
    if (!payload.onDelta) {
      const r = await trackedFetch(cfg.endpoint + '/text/integrate', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({turns:payload.turns,mood:payload.mood})});
      if (!r.ok) throw new Error('text integrate failed: '+r.status); return (await r.json()).text;
    }
    const response=await trackedFetch(cfg.endpoint+'/text/integrate/stream',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({turns:payload.turns,mood:payload.mood}),signal:payload.signal});
    if (!response.ok || !response.body) throw new Error('stream unavailable');
    const reader=response.body.getReader();const decoder=new TextDecoder();let pending='',text='',done=false;
    try {
      while(true){const chunk=await reader.read();if(chunk.done)break;pending+=decoder.decode(chunk.value,{stream:true});const frames=pending.split('\n\n');pending=frames.pop();
        for(const frame of frames){const line=frame.split('\n').find(l=>l.startsWith('data: '));if(!line)continue;const event=JSON.parse(line.slice(6));
          if(event.type==='sentence'){text+=(text?'\n':'')+event.text;payload.onDelta(text);}
          if(event.type==='done'){text=event.text;payload.onDelta(text);done=true;}
          if(frame.startsWith('event: error'))throw new Error(event.message);
        }
      }
      if(!done)throw new Error('incomplete stream');return text;
    } finally { await reader.cancel().catch(()=>{}); }
  }

  async function httpPhotoQuestion(payload) {
    const r = await trackedFetch(cfg.endpoint + '/photo/question', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ facts: payload.facts, mood: payload.mood, note: payload.note }),
    });
    if (!r.ok) throw new Error('photo question failed: ' + r.status);
    const j = await r.json();
    return j.question || '';
  }

  let lastFallbackAt = 0;
  function localFallback(message) { if (Date.now()-lastFallbackAt>8000) { global.LuminaUI?.toast?.(message); lastFallbackAt=Date.now(); } }
  function safeLocalText(payload) {
    const user=[payload.note,payload.extra].filter(Boolean).map(String);
    const facts=payload.facts||{};
    if(facts.scene&&facts.scene!=='未能读取画面')user.push('照片分析（尚待核对）：'+facts.scene);
    if(payload.mood?.label)user.push('心情标注：'+payload.mood.label);
    return user.join('\n') || '还没有可整理的原话。';
  }
  /* ---------- 对外 ---------- */
  global.Providers = {
    cfg: cfg,
    trace() { return { calls:actualCalls.length, requests:actualCalls.map(c=>({...c})), tools:[] }; },
    resetTrace() { activeRequestController.abort(); activeRequestController=new AbortController(); actualCalls.length=0; },
    cancel() { activeRequestController.abort(); },
    async observe(payload) {
      if (cfg.mode === 'http') {
        try { return await httpObserve(payload); }
        catch (e) { if(e?.name==='AbortError')throw e; localFallback('AI 暂时不可用，当前保留原话或使用本地整理。'); console.warn('[Lumina] observe http failed, using local fallback', e); }
      }
      await new Promise((r) => setTimeout(r, 260)); // 模拟一次网络往返
      return { scene:'未能读取画面', time:'', light:'', subjects:[], absence:[], text_spans:[], palette:payload.stats?.palette||[], brightness:payload.stats?.brightness??0.5, saturation:payload.stats?.saturation??0.5, conf:0 };
    },
    async draft(payload) {
      if (cfg.mode === 'http') {
        try { return await httpWrite({ ...payload, stage: 'draft' }); }
        catch (e) { if(e?.name==='AbortError')throw e; localFallback('AI 暂时不可用，当前保留原话或使用本地整理。'); console.warn('[Lumina] draft http failed, using local fallback', e); }
      }
      await new Promise((r) => setTimeout(r, 320));
      return safeLocalText(payload);
    },
    async memory(payload) {
      if (cfg.mode === 'http') {
        try {
          const list = [];
          for (let i = 0; i < 3; i++) list.push(await httpWrite({ ...payload, stage: 'memory', variant: i }));
          return list;
        } catch (e) {
          localFallback('AI 暂时不可用，当前保留原话或使用本地整理。'); console.warn('[Lumina] memory http failed, using local fallback', e);
        }
      }
      await new Promise((r) => setTimeout(r, 380));
      return [0, 1, 2].map(() => safeLocalText(payload));
    },
    async textReply(payload) {
      if (cfg.mode === 'http') {
        try { return await httpTextReply(payload); }
        catch (e) { if(e?.name==='AbortError')throw e; localFallback('AI 暂时不可用，当前保留原话或使用本地整理。'); console.warn('[Lumina] text reply http failed, using local fallback', e); }
      }
      await new Promise((r) => setTimeout(r, 320));
      return { reply:'你写下的是：'+(payload.turns||[]).filter(t=>t.role==='me').slice(-1).map(t=>t.text).join(''), question:'' };
    },
    async textIntegrate(payload) {
      if (cfg.mode === 'http') {
        try { return await httpTextIntegrate(payload); }
        catch (e) { if(e?.name==='AbortError')throw e; localFallback('AI 暂时不可用，当前保留原话或使用本地整理。'); console.warn('[Lumina] text integrate http failed, using local fallback', e); }
      }
      await new Promise((r) => setTimeout(r, 360));
      return { text: (payload.turns||[]).filter(t=>t.role==='me').map(t=>t.text).join('\n') };
    },
    async photoQuestion(payload) {
      if (cfg.mode === 'http') {
        try { return await httpPhotoQuestion(payload); }
        catch (e) { if(e?.name==='AbortError')throw e; localFallback('AI 暂时不可用，当前保留原话或使用本地整理。'); console.warn('[Lumina] photo question http failed, using local fallback', e); }
      }
      await new Promise((r) => setTimeout(r, 220));
      return '';
    },
  };
})(window);

/* ===== 新版：旧版数据与流程接到五屏 ===== */
/* 光影志 · 新版单文件
 * 界面：已批准的三段式预览（封面 → 首页 → 记录 → 回看 → 档案）
 * 功能：沿用旧版 demo/app.js —— localStorage、12 条种子、导入导出、减少动效、
 *       运行状态、照片流程、文字流程、详情/删除、时间线/日历/筛选、聊着找。
 */
(function () {
  'use strict';

  /* ================= 常量 ================= */
  const ANCHORS = [
    { phi: 45, key: '喜', name: '雀跃', hex: '#f2cf96' },
    { phi: 135, key: '怒', name: '烦躁', hex: '#e7b0ad' },
    { phi: 225, key: '哀', name: '低落', hex: '#b6c6d5' },
    { phi: 315, key: '乐', name: '满足', hex: '#b3d6c1' },
  ];
  const CENTER = '#fbfcf9';
  const KEY = 'lumina.records.v3';

  /* ================= 状态 ================= */
  const S = {
    step: 1, shape: 'ring', mode: 'photo',
    full: null, thumb: null, stats: null,
    mood: null, note: '', facts: null, draft: '', extra: '',
    photoQ: '', photoA: '',
    cands: [], picked: -1, iso: null,
    filter: 'all', period: '30',
    cal: null,           // 日历当前月份 {y, m}
    day: null,           // 只看某一天（YYYY-MM-DD）
    keepFilter: false,
    view: 'cover',
    reviewTab: 'time',
    archiveTab: 'analysis',
    arc: 'timeline',
    rp: 'month',         // 回看：上周 / 上月 / 今年 / 全部
    ap: '30',            // 数据分析：近 30 天 / 今年 / 全部
  };

  let recordGeneration = 0;
  let textIntegrationController = null;
  const T = {
    mood: null, t: null, note: '', chat: [], busy: false,
    integrated: '', pick: 'integrated', iso: null,
  };

  const R = {
    turns: [],
    filters: { from: null, to: null, timeLabel: '', mood: null, keywords: [], negative: [] },
  };

  const NEUTRAL_MOOD = {
    phi: null, r: 0, valence: 0, arousal: 0, anchor: '', label: '未标注',
    color: '#c9cdd2', unmarked: true,
  };

  const DAY = 86400000;
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));

  /* 种子缩略图：photo/ 里的 12 张写实照片，构建时内嵌成 900x506 的 WebP（不联网） */
  const SEED_THUMBS = {
    rain: '/assets/03bf75e8a2267d34a8d7.webp',
    book: '/assets/0d1db6a8fd280b056132.webp',
    toast: '/assets/53f3f9e55cabbf934b31.webp',
    windowPlants: '/assets/7bef08ba87cccbd178b9.webp',
    tea: '/assets/79fc4db679646f01a963.webp',
    dinner: '/assets/b4a0c67a9362bd04b896.webp',
    bread: '/assets/b3fe7229da6c321a34fd.webp',
    leaves: '/assets/c6a424236bf4db98f308.webp',
    lamp: '/assets/689a0666f6c00de6196f.webp',
    dew: '/assets/a7d52a4d14ced8f2ead3.webp',
    fruit: '/assets/030c294fa7e4c01e802b.webp',
    plant: '/assets/ec42be1768c34558e0b2.webp'
  };

  /* ================= 小工具 ================= */
  function toast(msg) {
    const t = $('#toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('on');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => { t.classList.remove('on'); }, 2300);
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function emptyState(text, action, label) {
    return '<div class="empty"><p>' + escapeHtml(text) + '</p>' +
      (action ? '<div class="emptyActions"><button class="emptyAct" type="button" data-empty="' +
        action + '">' + escapeHtml(label) + '</button></div>' : '') +
      '</div>';
  }

  function bindEmpty(el) {
    Array.from(el.querySelectorAll('[data-empty]')).forEach((b) => {
      b.onclick = () => {
        const a = b.dataset.empty;
        if (a === 'photo') openSheet('photo');
        if (a === 'text') openTextSheet();
        if (a === 'seed') seed();
        if (a === 'records') { S.day = null; S.filter = 'all'; showView('archive'); }
        if (a === 'review') showView('review');
        if (a === 'cover') backToCover();
      };
    });
  }

  function unique(list) { return list.filter((x, i, a) => x && a.indexOf(x) === i); }
  function pad2(n) { return String(n).padStart(2, '0'); }
  function sod(d) { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; }
  function dayKey(d) { return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }
  function md(d) { return (d.getMonth() + 1) + '.' + pad2(d.getDate()); }
  function cnmd(d) { return (d.getMonth() + 1) + ' 月 ' + d.getDate() + ' 日'; }
  function weekdayCN(d) { return '日一二三四五六'[d.getDay()]; }

  /* ================= 存储 ================= */
  const store = {
    read() { if (window.LuminaRecords) return window.LuminaRecords.list(); try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; } },
    async ready() { if (!window.LuminaRecords) throw new Error('本地数据库还未准备好，请稍后再试'); await window.LuminaRecords.ready; },
    async write(list, deletedIds = []) {
      try { await store.ready(); await window.LuminaRecords.replace(list, { deletedIds }); return true; }
      catch (e) { toast('未能保存，本地原有记录没有改动。请重试。'); console.error('[Lumina] record write failed', e); return false; }
    },
    async add(rec) { try { await store.ready(); } catch { toast('本地数据库还未准备好，请稍后再试'); return false; } const l = store.read(); l.unshift(rec); return store.write(l); },
    async remove(id) { return store.write(store.read().filter((r) => r.id !== id), [id]); },
  };

  /* ================= 颜色与心情 ================= */
  function hex2rgb(hex) {
    const h = String(hex).replace('#', '');
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }
  function rgb2hex(r, g, b) {
    return '#' + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
  }
  function mix(a, b, t) {
    const A = hex2rgb(a), B = hex2rgb(b);
    return rgb2hex(A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t);
  }

  function moodFrom(phi, r) {
    phi = ((phi % 360) + 360) % 360;
    r = Math.max(0, Math.min(1, r));
    const rad = (phi * Math.PI) / 180;
    const valence = r * Math.cos(rad);
    const arousal = r * Math.sin(rad);

    const sorted = ANCHORS.slice().sort((a, b) => a.phi - b.phi);
    let i = sorted.length - 1;
    for (let k = 0; k < sorted.length; k++) { if (sorted[k].phi <= phi) i = k; else break; }
    const a0 = sorted[i], a1 = sorted[(i + 1) % sorted.length];
    const span = ((a1.phi - a0.phi) + 360) % 360 || 360;
    const passed = ((phi - a0.phi) + 360) % 360;
    let color = mix(a0.hex, a1.hex, Math.min(1, passed / span));
    color = mix(CENTER, color, Math.pow(r, 0.7) * 0.95);

    const nearest = ANCHORS.reduce((best, a) => {
      const d = Math.abs(((phi - a.phi + 540) % 360) - 180);
      return d < best.d ? { d: d, a: a } : best;
    }, { d: 999, a: ANCHORS[0] }).a;

    const strength = r < 0.16 ? '说不上来' : r < 0.42 ? '很轻' : r < 0.72 ? '中等' : '强烈';
    return {
      phi: phi, r: r, valence: valence, arousal: arousal,
      anchor: nearest.key, anchorName: nearest.name, color: color,
      label: r < 0.16 ? '平静 · 说不清' : '偏' + nearest.name + '·' + strength,
    };
  }

  function faceSVG(v, a, size, color) {
    const open = 0.55 + 0.5 * Math.max(-0.4, a);
    const bulge = 0.13 * v;
    const brow = -10 * Math.max(0, a) * Math.max(0, -v);
    return `<svg width="${size}" height="${size}" viewBox="-0.5 -0.5 1 1" aria-hidden="true">
      <circle cx="0" cy="0" r="0.47" fill="${color}" stroke="rgba(26,29,34,.22)" stroke-width="0.012"/>
      <ellipse cx="-0.19" cy="-0.10" rx="0.045" ry="${(0.045 * open).toFixed(3)}" fill="#252b34"/>
      <ellipse cx="0.19" cy="-0.10" rx="0.045" ry="${(0.045 * open).toFixed(3)}" fill="#252b34"/>
      <g stroke="#252b34" stroke-width="0.02" stroke-linecap="round">
        <line x1="-0.25" y1="-0.23" x2="-0.13" y2="-0.23" transform="rotate(${brow} -0.19 -0.23)"/>
        <line x1="0.13" y1="-0.23" x2="0.25" y2="-0.23" transform="rotate(${-brow} 0.19 -0.23)"/>
      </g>
      <path d="M-0.15 0.14 Q0 ${(0.14 + bulge * 2.2).toFixed(3)} 0.15 0.14"
            fill="none" stroke="#252b34" stroke-width="0.026" stroke-linecap="round"/>
    </svg>`;
  }

  /* ================= 图像 ================= */
  function loadImage(file) {
    return new Promise((res, rej) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => { URL.revokeObjectURL(url); res(img); };
      img.onerror = rej;
      img.src = url;
    });
  }
  function drawScaled(img, maxEdge) {
    const scale = Math.min(1, maxEdge / Math.max(img.width, img.height));
    const c = document.createElement('canvas');
    c.width = Math.max(1, Math.round(img.width * scale));
    c.height = Math.max(1, Math.round(img.height * scale));
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    return c;
  }
  function analyse(canvas) {
    const data = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
    let sb = 0, ss = 0, n = 0;
    const pts = [];
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2];
      const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
      sb += 0.299 * r + 0.587 * g + 0.114 * b;
      ss += mx === 0 ? 0 : (mx - mn) / mx;
      n++;
      if (i % 16 === 0) pts.push([r, g, b]);
    }
    return { brightness: sb / n / 255, saturation: ss / n, palette: kmeans(pts, 5) };
  }
  function kmeans(points, k) {
    if (!points.length) return ['#8b9299'];
    const c = [];
    for (let i = 0; i < k; i++) c.push(points[Math.floor((points.length * (i + 0.5)) / k)]);
    for (let it = 0; it < 8; it++) {
      const sums = Array.from({ length: k }, () => [0, 0, 0, 0]);
      points.forEach((p) => {
        let best = 0, bd = Infinity;
        for (let j = 0; j < k; j++) {
          const dr = p[0] - c[j][0], dg = p[1] - c[j][1], db = p[2] - c[j][2];
          const d = dr * dr + dg * dg + db * db;
          if (d < bd) { bd = d; best = j; }
        }
        sums[best][0] += p[0]; sums[best][1] += p[1]; sums[best][2] += p[2]; sums[best][3]++;
      });
      for (let j = 0; j < k; j++) if (sums[j][3]) {
        c[j] = [sums[j][0] / sums[j][3], sums[j][1] / sums[j][3], sums[j][2] / sums[j][3]];
      }
    }
    return c.map((x) => rgb2hex(x[0], x[1], x[2]));
  }

  /* ================= 日期 ================= */
  function fmt(iso) {
    const d = new Date(iso);
    return {
      d: d.getDate(), m: d.getMonth() + 1, y: d.getFullYear(),
      hm: pad2(d.getHours()) + ':' + pad2(d.getMinutes()),
      full: d.getFullYear() + '年' + (d.getMonth() + 1) + '月' + d.getDate() + '日',
      key: dayKey(d),
      h: d.getHours(),
    };
  }

  /* ================= 记录类型与占位 ================= */
  function kindOf(r) { return r.kind || (r.thumb ? 'photo' : 'text'); }
  function moodOf(r) { return r.mood || NEUTRAL_MOOD; }
  function dayMood(recs) {
    const marked = recs.find((r) => r.mood);
    return moodOf(marked || recs[0]);
  }
  function recFacts(r) { return kindOf(r) === 'photo' ? r.facts : null; }
  function recText(r) { return r.final || r.draft || r.note || ''; }
  function recBlob(r) {
    const f = recFacts(r) || {};
    const chat = (r.chat || []).map((t) => t.text).join(' ');
    return [r.final, r.draft, r.note, r.reply, chat, f.scene, (f.subjects || []).join('')].join(' ');
  }
  function rowMedia(r) {
    if (kindOf(r) === 'photo' && r.thumb) return '<span class="hthumb"><img src="' + r.thumb + '" alt=""></span>';
    return '<span class="hthumb hthumb--text" aria-hidden="true">“</span>';
  }
  function hitMedia(r) {
    if (kindOf(r) === 'photo' && r.thumb) return '<img src="' + r.thumb + '" alt="">';
    return '<div class="hitLetter" aria-hidden="true">“</div>';
  }

  /* ================= 视图切换 ================= */
  const introVideo = $('#introVideo');
  const cover = $('#screen-cover');
  const skipBtn = $('#skipIntro');
  let coverArrived = false;

  function arriveCover() {
    if (coverArrived) return;
    coverArrived = true;
    cover.classList.add('has-arrived');
    if (skipBtn) skipBtn.hidden = true;
  }
  function coverFallback() {
    cover.classList.remove('has-video');
    cover.classList.add('no-video');
    arriveCover();
  }
  function playCover() {
    coverArrived = false;
    cover.classList.remove('has-arrived');
    if (skipBtn) skipBtn.hidden = false;
    if (!introVideo) { coverFallback(); return; }
    try {
      introVideo.currentTime = 0;
      const p = introVideo.play();
      if (p && p.catch) p.catch(coverFallback);
    } catch (e) { coverFallback(); }
  }
  function pauseCoverVideo() { try { if (introVideo) introVideo.pause(); } catch (e) {} }

  function setScreen(name) {
    $$('.screen').forEach((s) => { s.hidden = s.id !== 'screen-' + name; });
    document.body.dataset.screen = name;
    S.view = name;
  }

  function backToCover() {
    pauseCoverVideo();
    if (document.startViewTransition) {
      document.startViewTransition(function () { setScreen('cover'); });
    } else {
      setScreen('cover');
    }
    $$('.tab').forEach((t) => t.classList.remove('active'));
    window.scrollTo(0, 0);
    playCover();
  }

  function showView(name, opts) {
    opts = opts || {};
    if (name === 'cover') { backToCover(); return; }
    pauseCoverVideo();
    if (name === 'archive' && !S.keepFilter) S.day = null;
    S.keepFilter = false;

    const run = function () {
      setScreen(name);
      $$('.tab').forEach((t) => {
        const on = t.dataset.go === name;
        t.classList.toggle('active', on);
        if (on) t.setAttribute('aria-current', 'page'); else t.removeAttribute('aria-current');
      });
      if (name === 'home') renderHome();
      if (name === 'review') { renderReview(); setReviewTab(S.reviewTab); }
      if (name === 'archive') { setArchiveTab(S.archiveTab); }
      window.scrollTo(0, 0);
    };

    if (document.startViewTransition && !opts.instant) {
      document.startViewTransition(run);
    } else {
      run();
      const el = $('#screen-' + name);
      if (el) { el.classList.remove('in'); void el.offsetWidth; el.classList.add('in'); }
    }
  }

  function setReviewTab(k) {
    S.reviewTab = k === 'chat' ? 'chat' : 'time';
    $$('[data-review]').forEach((b) => b.classList.toggle('active', b.dataset.review === S.reviewTab));
    const t = $('#reviewTime'), c = $('#reviewChat');
    if (t) t.hidden = S.reviewTab !== 'time';
    if (c) c.hidden = S.reviewTab !== 'chat';
    if (S.reviewTab === 'chat') renderRecall();
  }

  function setArchiveTab(k) {
    S.archiveTab = k === 'records' ? 'records' : 'analysis';
    $$('[data-archive]').forEach((b) => b.classList.toggle('active', b.dataset.archive === S.archiveTab));
    const a = $('#archiveAnalysis'), r = $('#archiveRecords');
    if (a) a.hidden = S.archiveTab !== 'analysis';
    if (r) r.hidden = S.archiveTab !== 'records';
    if (S.archiveTab === 'analysis') renderAnalysis();
    else renderRecordsPane();
  }

  function setArc(k) {
    S.arc = k === 'calendar' ? 'calendar' : 'timeline';
    $$('[data-arc]').forEach((b) => b.classList.toggle('active', b.dataset.arc === S.arc));
    const tl = $('#timeline'), cw = $('#calendarWrap');
    if (tl) tl.hidden = S.arc !== 'timeline';
    if (cw) cw.hidden = S.arc !== 'calendar';
    if (S.arc === 'calendar') renderCalendar(filtered(true));
  }

  function renderRecordsPane() {
    setArc(S.arc);
    renderTimeline();
    if (S.arc === 'calendar') renderCalendar(filtered(true));
  }

  /* ================= 首页 ================= */
  function renderDates() {
    const now = new Date();
    const t = cnmd(now) + ' · 周' + weekdayCN(now);
    const h = $('#homeDate');
    if (h) h.textContent = t;
    const r = $('#recordDate');
    if (r) r.textContent = t;
  }

  function renderHome() {
    const list = store.read();
    const now = new Date();
    renderDates();
    const hd = $('#homeDate');
    if (hd) hd.textContent = cnmd(now) + ' · 周' + weekdayCN(now);
    const rl = $('#recentList');
    rl.innerHTML = '';
    if (!list.length) {
      rl.innerHTML = '<div class="empty"><p>还没有留下什么</p><div class="emptyActions">' +
        '<button class="emptyAct" type="button" data-empty="seed">看看示例</button>' +
        '<button class="emptyAct" type="button" data-empty="text">写第一条</button></div></div>';
      bindEmpty(rl);
    } else {
      list.slice(0, 3).forEach((r) => {
        const f = fmt(r.ts);
        const m = moodOf(r);
        const row = document.createElement('button');
        row.type = 'button';
        row.className = 'hrow';
        row.title = '翻开这一条';
        row.innerHTML =
          '<span class="hdate"><b>' + f.m + ' 月 ' + f.d + ' 日</b><span>' + f.hm + '</span></span>' +
          rowMedia(r) +
          '<span class="htxt">' + escapeHtml(recText(r)) + '</span>' +
          '<span class="dot" role="img" aria-label="心情：' + escapeHtml(m.label || '未标注') + '" title="心情：' + escapeHtml(m.label || '未标注') + '" style="background:' + m.color + '"></span>';
        row.onclick = () => openDetail(r.id);
        rl.appendChild(row);
      });
    }

    renderWeek(list);
  }

  function renderWeek(list) {
    const box = $('#weekBand');
    box.innerHTML = '';
    const byDay = {};
    list.forEach((r) => { const k = fmt(r.ts).key; (byDay[k] = byDay[k] || []).push(r); });

    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * DAY);
      const k = dayKey(d);
      days.push({ k: k, d: d, recs: byDay[k] || [] });
    }
    const todayKey = days[days.length - 1].k;
    const max = Math.max(1, days.reduce((s, d) => Math.max(s, d.recs.length), 0));

    days.forEach((day) => {
      const el = document.createElement('div');
      const has = day.recs.length > 0;
      el.className = 'day' + (day.k === todayKey ? ' today' : '') + (has ? '' : ' day--empty');
      const label = document.createElement('span');
      label.className = 'label';
      label.textContent = '一二三四五六日'[(day.d.getDay() + 6) % 7];
      const wrap = document.createElement('div');
      wrap.className = 'barWrap';
      if (has) {
        const m = dayMood(day.recs);
        const h = Math.round(16 + 62 * (day.recs.length / max));
        const bar = document.createElement('span');
        bar.className = 'bar';
        bar.style.height = h + 'px';
        bar.style.setProperty('--c', m.color);
        const num = document.createElement('b');
        num.className = 'barNum';
        num.textContent = day.recs.length;
        wrap.appendChild(num);
        wrap.appendChild(bar);
        el.title = (day.d.getMonth() + 1) + '月' + day.d.getDate() + '日 · ' + day.recs.length + ' 条 · 点开这天';
        el.setAttribute('role', 'button');
        el.tabIndex = 0;
        const go = () => goDay(day.k);
        el.onclick = go;
        el.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } };
      } else {
        const dot = document.createElement('span');
        dot.className = 'bar bar--empty';
        wrap.appendChild(dot);
        el.title = (day.d.getMonth() + 1) + '月' + day.d.getDate() + '日 · 空';
      }
      el.appendChild(wrap);
      el.appendChild(label);
      box.appendChild(el);
    });

    const active = days.filter((d) => d.recs.length).length;
    const wd = $('#weekDays');
    if (wd) wd.textContent = active;
    const wr = $('#weekRange');
    if (wr) wr.textContent = md(days[0].d) + ' – ' + md(days[6].d);

    const wf = $('#weekFoot');
    if (wf) {
      if (!active) {
        wf.textContent = '7 天里还没有记录';
      } else {
        let bestKey = null, bestN = 0;
        days.forEach((d) => {
          if (d.recs.length && d.recs.length >= bestN) { bestN = d.recs.length; bestKey = d.k; }
        });
        const bd = new Date(bestKey + 'T00:00:00');
        wf.textContent = '最多的一天是 ' + cnmd(bd) + '，共 ' + bestN + ' 条';
      }
    }
  }

  /* ================= 记录弹层 ================= */
  function openSheet(mode) {
    if (mode === 'text') { openTextSheet(); return; }
    S.mode = 'photo';
    S.step = 1;
    S.mood = null; S.note = ''; S.facts = null; S.draft = ''; S.extra = '';
    S.cands = []; S.picked = -1; S.iso = new Date().toISOString();
    S.full = null; S.thumb = null; S.stats = null;
    S.photoQ = ''; S.photoA = '';

    $('#preview').removeAttribute('src');
    $('#photoEmpty').style.display = '';
    $('#s2mood').textContent = '心情未选';
    $('#s2mood').style.borderColor = '';
    $('#factsList').innerHTML = '';
    $('#note').value = '';
    $('#extra').value = '';
    $('#cands').innerHTML = '';
    $('#similar').innerHTML = '';
    $('#photoQ').textContent = '';
    $('#photoAnswer').value = '';
    ['draftCard', 'askCard', 'addCard', 'finCard', 'simCard'].forEach((id) => { $('#' + id).hidden = true; });
    $('#moodFace').innerHTML = faceSVG(0, 0, 70, '#e8e2d6');
    $('#moodLabel').textContent = '还没选';
    $('#moodSub').textContent = S.shape === 'ring' ? '在圆环上点一下，或者拖一下' : '在直线上点一下';
    const f = fmt(S.iso);
    $('#s2date').textContent = f.full + ' ' + f.hm;
    document.documentElement.style.setProperty('--mood-col', '#e6cf9f');

    $('#sheetText').hidden = true;
    $('#sheetPhoto').hidden = false;
    $('#record').setAttribute('aria-labelledby', 'stepTitle');
    lastOpener = document.activeElement;
    $('#record').hidden = false;
    goStep(1);
  }

  /* ================= 文字记录 ================= */
  let lastOpener = null;

  /* 统一的关层：重置两张纸的状态，并把焦点还给打开它的那个按钮 */
  function closeRecordOverlay() {
    recordGeneration++; textIntegrationController?.abort(); Providers.cancel();
    const rec = $('#record');
    if (!rec || rec.hidden) return false;
    rec.hidden = true;
    $('#sheetPhoto').hidden = true;
    $('#sheetText').hidden = true;
    const back = lastOpener;
    lastOpener = null;
    if (back && back.isConnected && back.offsetParent !== null && typeof back.focus === 'function') {
      try { back.focus(); } catch (e) { /* 忽略 */ }
    }
    return true;
  }

  function openTextSheet() {
    recordGeneration++; textIntegrationController?.abort();
    S.mode = 'text';
    T.mood = null; T.t = null; T.note = ''; T.chat = [];
    T.integrated = ''; T.pick = 'original'; T.busy = false;
    T.iso = new Date().toISOString();

    $('#sheetPhoto').hidden = true;
    $('#sheetText').hidden = false;
    $('#record').setAttribute('aria-labelledby', 'tTitle');
    if (!lastOpener) lastOpener = document.activeElement;
    $('#record').hidden = false;

    $('#tNote').value = '';
    $('#tAnswer').value = '';
    $('#tThread').innerHTML = '';
    $('#tStage').textContent = '';
    $('#tOriginal').textContent = '';
    $('#tIntegrated').textContent = '';
    $('#tSendAnswer').disabled = false;
    $('#tIntegrate').disabled = false;
    $('#tSend').disabled = false;
    $('#tSave').disabled = false;
    $('#tWritePane').hidden = false;
    $('#tTalkPane').hidden = true;
    $('#tFinalPane').hidden = true;
    $('#tLineHandle').hidden = true;
    $('#tLineHandle').style.left = '50%';
    $('#tLineHandle').style.background = '';
    $('#moodClear').hidden = true;
    $('#tMoodRead').textContent = '未标注';
    const lineReset = $('#tLine');
    if (lineReset) {
      lineReset.setAttribute('aria-valuenow', '50');
      lineReset.setAttribute('aria-valuetext', '未标注');
    }
    document.documentElement.style.setProperty('--mood-col', '#e6cf9f');

    const f = fmt(T.iso);
    $('#tDate').textContent = f.full + ' ' + f.hm;
    setTimeout(() => { const n = $('#tNote'); if (n) n.focus(); }, 80);
  }

  function setTextMood(t) {
    t = Math.max(0, Math.min(1, t));
    T.t = t;
    const phi = t < 0.5 ? 225 : 45;
    const r = Math.abs(t - 0.5) * 2 * 0.9;
    const m = moodFrom(phi, r);
    T.mood = m;

    const h = $('#tLineHandle');
    if (h) {
      h.hidden = false;
      h.style.left = (t * 100) + '%';
      h.style.background = m.color;
    }
    $('#moodClear').hidden = false;
    $('#tMoodRead').innerHTML = '<b>' + m.label + '</b>';
    document.documentElement.style.setProperty('--mood-col', m.color);
    const line = $('#tLine');
    if (line) {
      line.setAttribute('aria-valuenow', String(Math.round(t * 100)));
      line.setAttribute('aria-valuetext', m.label);
    }
  }

  function clearTextMood() {
    T.mood = null;
    T.t = null;
    $('#tLineHandle').hidden = true;
    $('#moodClear').hidden = true;
    $('#tMoodRead').textContent = '未标注';
    document.documentElement.style.setProperty('--mood-col', '#e6cf9f');
    const line = $('#tLine');
    if (line) {
      line.setAttribute('aria-valuenow', '50');
      line.setAttribute('aria-valuetext', '未标注');
    }
  }

  function textLineFromEvent(e) {
    const b = $('#tLine').getBoundingClientRect();
    if (!b.width) return;
    setTextMood((e.clientX - b.left) / b.width);
  }

  function appendTextTurn(role, text, question) {
    const el = document.createElement('div');
    el.className = 'tTurn tTurn--' + (role === 'me' ? 'me' : 'it');
    const who = document.createElement('span');
    who.className = 'tWho';
    who.textContent = role === 'me' ? '你' : '它';
    const p = document.createElement('p');
    p.textContent = text || '';
    el.appendChild(who);
    el.appendChild(p);
    if (question) {
      const q = document.createElement('p');
      q.className = 'tQ';
      q.textContent = question;
      el.appendChild(q);
    }
    const box = $('#tThread');
    box.appendChild(el);
    box.scrollTop = box.scrollHeight || 0;
  }

  async function textCatch() {
    const generation = recordGeneration;
    Providers.resetTrace();
    const note = $('#tNote').value.trim();
    if (!note) return toast('先写一句');
    if (T.busy) return;
    T.busy = true;
    T.note = note;
    T.chat = [{ role: 'me', text: note }];
    $('#tSend').disabled = true;
    $('#tSendAnswer').disabled = true;
    $('#tIntegrate').disabled = true;

    $('#tWritePane').hidden = true;
    $('#tTalkPane').hidden = false;
    $('#tFinalPane').hidden = true;
    $('#tThread').innerHTML = '';
    $('#tStage').textContent = '正在听…';
    appendTextTurn('me', note);

    let r;
    try { r = await Providers.textReply({ turns: T.chat, mood: T.mood }); }
    catch (e) { r = { reply: '这次没接住，你慢慢说，我在', question: '' }; }
    if (generation !== recordGeneration) return;
    const reply = (r && r.reply) || '我在，接着说吧';
    const question = (r && r.question) || '';
    T.chat.push({ role: 'it', text: reply, question: question });
    appendTextTurn('it', reply, question);
    $('#tStage').textContent = '';
    T.busy = false;
    $('#tSendAnswer').disabled = false;
    $('#tIntegrate').disabled = false;
    $('#tSend').disabled = false;
    $('#tAnswer').focus();
  }

  async function textContinue() {
    const generation = recordGeneration;
    const text = $('#tAnswer').value.trim();
    if (!text) return toast('说一句，或者点「整理成一段」');
    if (T.busy) return;
    T.busy = true;
    T.chat.push({ role: 'me', text: text });
    appendTextTurn('me', text);
    $('#tAnswer').value = '';
    $('#tSendAnswer').disabled = true;
    $('#tIntegrate').disabled = true;
    $('#tStage').textContent = '正在听…';

    let r;
    try { r = await Providers.textReply({ turns: T.chat, mood: T.mood }); }
    catch (e) { r = { reply: '这次没接住，你慢慢说，我在', question: '' }; }
    if (generation !== recordGeneration) return;
    const reply = (r && r.reply) || '我在，接着说吧';
    const question = (r && r.question) || '';
    T.chat.push({ role: 'it', text: reply, question: question });
    appendTextTurn('it', reply, question);
    $('#tStage').textContent = '';
    T.busy = false;
    $('#tSendAnswer').disabled = false;
    $('#tIntegrate').disabled = false;
    $('#tAnswer').focus();
  }

  async function textIntegrate() {
    const generation = recordGeneration;
    textIntegrationController = new AbortController();
    if (!T.chat.length) return toast('先写一句');
    if (T.busy) return;
    T.busy = true;
    $('#tSendAnswer').disabled = true;
    $('#tIntegrate').disabled = true;
    $('#tTalkPane').hidden = true;
    $('#tFinalPane').hidden = false;
    $('#tOriginal').textContent = tUserText();
    T.integrated = '';
    $('#tSave').disabled = true;
    $('#tIntegrated').textContent = '正在整理…';

    let out;
    try { out = await Providers.textIntegrate({ turns: T.chat, mood: T.mood, signal: textIntegrationController.signal, onDelta: (text) => { if(generation === recordGeneration) $('#tIntegrated').textContent = text; } }); }
    catch (e) { if(generation!==recordGeneration)return; out = { text: tUserText() }; toast('这次没整理成，先用你写的'); }
    if (generation !== recordGeneration) return;
    T.integrated = typeof out === 'string' ? out : (out && out.text) || tUserText();
    $('#tIntegrated').textContent = T.integrated;
    $('#tSave').disabled = false;
    setTextPick('original');
    T.busy = false;
    $('#tSendAnswer').disabled = false;
    $('#tIntegrate').disabled = false;
  }

  function tUserText() {
    return T.chat.filter((t) => t.role === 'me').map((t) => t.text).join('\n');
  }

  function setTextPick(pick) {
    T.pick = pick === 'original' ? 'original' : 'integrated';
    $$('.tCard').forEach((c) => c.classList.toggle('on', c.dataset.pick === T.pick));
  }

  async function saveTextRecord() {
    if (T.busy || !T.integrated) return toast('还在整理，稍等一下');
    $('#tSave').disabled = true;
    const finalText = T.pick === 'integrated' ? T.integrated : (tUserText() || T.note);
    const m = T.mood;
    const firstIt = T.chat.find((t) => t.role === 'it') || {};
    const aiTurns = T.chat.filter((t) => t.role === 'it').length;
    const rec = {
      id: 'r' + Date.now().toString(36),
      ts: T.iso || new Date().toISOString(),
      kind: 'text',
      thumb: null,
      palette: m ? [m.color] : [],
      mood: m ? {
        phi: m.phi, r: m.r, valence: m.valence, arousal: m.arousal,
        anchor: m.anchor, label: m.label, color: m.color,
      } : null,
      facts: null,
      note: T.note,
      reply: firstIt.text || '',
      question: firstIt.question || '',
      draft: T.integrated,
      final: finalText,
      chat: T.chat.slice(),
      trace: Providers.trace(),
    };
    if (!await store.add(rec)) { $('#tSave').disabled = false; return; }   // 写不进去时 store.write 已经提示过，别再报“成功”
    closeRecordOverlay();
    toast('已经留下来了');
    S.archiveTab = 'records';
    S.arc = 'timeline';
    S.filter = 'all';
    S.day = null;
    $$('.fchip').forEach((x) => x.classList.toggle('active', x.dataset.f === 'all'));
    showView('archive');
  }

  const STEP_UI = {
    1: { k: '第 1 步 · 照片', t: '先放一张照片', d: '', n: '继续' },
    2: { k: '第 2 步 · 心情', t: '你当时是什么心情', d: '', n: '看看它' },
    3: { k: '第 3 步 · 写下', t: '把它写下来', d: '可以改用你自己写的', n: '留下来' },
  };

  function goStep(n) {
    S.step = n;
    const ui = STEP_UI[n];
    $('#stepKicker').textContent = ui.k;
    $('#stepTitle').textContent = ui.t;
    $('#stepDesc').textContent = ui.d;
    $('#btnNext').textContent = ui.n;
    $$('.pane').forEach((p) => p.classList.toggle('active', Number(p.dataset.pane) === n));
    $('#btnBack').textContent = n === 1 ? '取消' : '返回';
    refreshNext();
  }

  function refreshNext() {
    const b = $('#btnNext');
    if (S.step === 1) {
      b.disabled = false;
      b.textContent = S.full ? '用这张，继续' : '不拍照，直接写';
    } else if (S.step === 2) {
      b.disabled = false;
      b.textContent = S.mood ? '看看它' : '先不标，继续';
    } else b.disabled = !(S.cands.length && S.picked >= 0);
  }

  async function onFile(file) {
    if (!file || !file.type.startsWith('image/')) return toast('请选一张图片');
    if (window.LuminaBridge?.captureOriginal) window.LuminaBridge.captureOriginal(file);
    try {
      const img = await loadImage(file);
      S.full = drawScaled(img, 1280).toDataURL('image/jpeg', 0.82);
      S.thumb = drawScaled(img, 256).toDataURL('image/jpeg', 0.78);
      S.stats = analyse(drawScaled(img, 64));
      $('#preview').src = S.full;
      $('#photoEmpty').style.display = 'none';
      goStep(2);
    } catch (e) { toast('这张图读不出来，换一张试试'); }
  }

  /* 心情控件同步给读屏：环形和直线各是一个 slider */
  function syncMoodAria() {
    const m = S.mood;
    const label = m ? m.label : '未选';
    const ring = $('#ring');
    if (ring) {
      ring.setAttribute('aria-valuenow', String(m ? Math.round(m.r * 100) : 0));
      ring.setAttribute('aria-valuetext', label);
    }
    const line = $('#line');
    if (line) {
      const t = m ? (Math.cos((m.phi * Math.PI) / 180) > 0 ? 0.5 + m.r / 2 : 0.5 - m.r / 2) : 0.5;
      line.setAttribute('aria-valuenow', String(Math.round(t * 100)));
      line.setAttribute('aria-valuetext', label);
    }
  }

  function lineT() {
    const m = S.mood;
    if (!m) return 0.5;
    return Math.cos((m.phi * Math.PI) / 180) > 0 ? 0.5 + m.r / 2 : 0.5 - m.r / 2;
  }

  function setMood(phi, r) {
    S.mood = moodFrom(phi, r);
    const m = S.mood;
    document.documentElement.style.setProperty('--mood-col', m.color);
    $('#moodFace').innerHTML = faceSVG(m.valence, m.arousal, 70, m.color);
    $('#moodLabel').textContent = m.label;
    $('#moodSub').textContent = '越靠外，心情越强；不用很准';
    $('#s2mood').textContent = m.label;
    $('#s2mood').style.borderColor = m.color;

    if (S.shape === 'ring') {
      const h = $('#ringHandle');
      if (h) {
        h.style.left = (50 + Math.cos((m.phi * Math.PI) / 180) * m.r * 50) + '%';
        h.style.top = (50 - Math.sin((m.phi * Math.PI) / 180) * m.r * 50) + '%';
        h.style.background = m.color;
      }
    } else {
      const h = $('#lineHandle');
      if (h) {
        const t = lineT();
        h.style.left = (t * 100) + '%';
        h.style.background = m.color;
      }
    }
    syncMoodAria();
    refreshNext();
  }

  function buildRing() {
    const ring = $('#ring');
    ring.innerHTML = '';
    ANCHORS.forEach((a) => {
      const rad = (a.phi * Math.PI) / 180;
      const el = document.createElement('span');
      el.className = 'anchor';
      el.style.left = (50 + Math.cos(rad) * 35) + '%';
      el.style.top = (50 - Math.sin(rad) * 35) + '%';
      el.innerHTML = '<i style="background:' + a.hex + '"></i>' + a.key;
      ring.appendChild(el);
    });
    const h = document.createElement('div');
    h.className = 'handle';
    h.id = 'ringHandle';
    h.style.display = 'none';
    ring.appendChild(h);
  }

  function ringPointer(e) {
    const ring = $('#ring');
    const b = ring.getBoundingClientRect();
    const dx = e.clientX - (b.left + b.width / 2);
    const dy = e.clientY - (b.top + b.height / 2);
    const dist = Math.sqrt(dx * dx + dy * dy);
    const phi = (Math.atan2(-dy, dx) * 180) / Math.PI;
    const h = $('#ringHandle');
    if (h) h.style.display = '';
    setMood(phi, Math.min(1, dist / (b.width / 2 * 0.94)));
  }

  function linePointer(e) {
    const line = $('#line');
    const b = line.getBoundingClientRect();
    const t = Math.max(0, Math.min(1, (e.clientX - b.left) / b.width));
    const h = $('#lineHandle');
    if (h) h.style.display = '';
    setMood(t < 0.5 ? 225 : 45, Math.abs(t - 0.5) * 2 * 0.9);
  }

  async function startObserve() {
    const generation = recordGeneration;
    Providers.resetTrace();
    S.note = $('#note').value.trim();
    S.photoQ = ''; S.photoA = '';
    goStep(3);
    $('#stage').textContent = '正在看这张照片…';
    ['draftCard', 'askCard', 'addCard', 'finCard', 'simCard'].forEach((id) => { $('#' + id).hidden = true; });
    $('#cands').innerHTML = '';
    $('#similar').innerHTML = '';
    S.cands = []; S.picked = -1;
    $('#s2mood').textContent = S.mood ? S.mood.label : '未标注';

    const facts = await Providers.observe({ thumb: S.full || S.thumb, stats: S.stats, iso: S.iso });
    if (generation !== recordGeneration) return;
    S.facts = facts;

    const ul = $('#factsList');
    ul.innerHTML = '';
    const items = []
      .concat(['场景：' + facts.scene])
      .concat(['光线：' + facts.light])
      .concat(['时间：' + facts.time])
      .concat((facts.subjects || []).map((s) => '主体：' + s))
      .concat((facts.absence || []).map((s) => '没有：' + s));
    for (const it of items) {
      const li = document.createElement('li');
      li.textContent = it;
      ul.appendChild(li);
      await new Promise((r) => setTimeout(r, 110));
    }

    $('#stage').textContent = '正在把这一刻写下来…';
    const generatedDraft = await Providers.draft({ facts: facts, mood: S.mood, note: S.note });
    if (generation !== recordGeneration) return;
    S.draft = generatedDraft;
    $('#draft').textContent = S.draft;
    $('#draftCard').hidden = false;
    $('#addCard').hidden = false;

    const photoQuestionResult = await Providers.photoQuestion({ facts: facts, mood: S.mood, note: S.note }).catch(() => '');
    if (generation !== recordGeneration) return;
    S.photoQ = photoQuestionResult;
    $('#photoQ').textContent = S.photoQ || '';
    $('#photoAnswer').value = '';
    $('#stage').textContent = '';
    if (S.photoQ) {
      $('#askCard').hidden = false;
      refreshNext();
    } else {
      $('#askCard').hidden = true;
      await generatePhotoCands();
    }
  }

  async function generatePhotoCands() {
    const generation = recordGeneration;
    if (!S.facts) return;
    $('#photoAnswerGo').disabled = true;
    $('#photoSkipQ').disabled = true;
    $('#extraGo').disabled = true;
    $('#stage').textContent = '正在把这一刻写下来…';
    const supplement = $('#extra').value.trim();
    const extra = [S.photoA, supplement].filter(Boolean).join('，');
    S.extra = supplement;
    try {
      const generatedCandidates = await Providers.memory({ facts: S.facts, mood: S.mood, note: S.note, extra: extra });
      if (generation !== recordGeneration) return;
      S.cands = generatedCandidates;
      S.picked = 0;
      renderCands();
      $('#finCard').hidden = false;
      renderSimilar();
      $('#simCard').hidden = false;
    } catch (e) {
      toast('这次没写出来，再试一次');
    } finally {
      $('#stage').textContent = '';
      $('#photoAnswerGo').disabled = false;
      $('#photoSkipQ').disabled = false;
      $('#extraGo').disabled = false;
      refreshNext();
    }
  }

  async function answerPhotoQ(answer) {
    S.photoA = String(answer || '').trim();
    $('#askCard').hidden = true;
    await generatePhotoCands();
  }

  function renderCands() {
    const box = $('#cands');
    box.innerHTML = '';
    S.cands.forEach((text, i) => {
      const d = document.createElement('div');
      d.className = 'cand' + (S.picked === i ? ' on' : '');
      d.textContent = text;
      d.onclick = () => { S.picked = i; renderCands(); refreshNext(); };
      box.appendChild(d);
    });
  }

  function renderSimilar() {
    const box = $('#similar');
    box.innerHTML = '';
    const pool = store.read().filter((r) => {
      if (!S.facts || kindOf(r) !== 'photo' || !r.facts) return false;
      if (r.facts.scene === S.facts.scene) return true;
      return (r.facts.subjects || []).some((s) => (S.facts.subjects || []).indexOf(s) >= 0);
    }).slice(0, 5);
    if (!pool.length) {
      box.innerHTML = '<span class="snote">还没有相似的时刻，再记几条，就会遇见</span>';
      return;
    }
    pool.forEach((r) => {
      const d = document.createElement('div');
      d.className = 'simitem';
      d.setAttribute('role', 'button');
      d.tabIndex = 0;
      const f = fmt(r.ts);
      d.innerHTML = '<img src="' + r.thumb + '" alt=""><span>' + f.m + '/' + f.d + ' ' + moodOf(r).label + '</span>';
      d.onclick = () => openDetail(r.id);
      d.onkeydown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openDetail(r.id); }
      };
      box.appendChild(d);
    });
  }

  async function saveRecord() {
    if (!(S.cands.length && S.picked >= 0)) return toast('先选一段');
    const m = S.mood;
    const chat = [];
    if (S.photoQ) chat.push({ role: 'it', text: S.photoQ });
    if (S.photoA) chat.push({ role: 'me', text: S.photoA });
    const rec = {
      id: 'r' + Date.now().toString(36),
      ts: S.iso,
      kind: 'photo',
      thumb: S.thumb || null,
      palette: (S.stats && S.stats.palette) || (m ? [m.color] : []),
      mood: m ? {
        phi: m.phi, r: m.r, valence: m.valence, arousal: m.arousal,
        anchor: m.anchor, label: m.label, color: m.color,
      } : null,
      facts: S.facts,
      note: S.note,
      reply: '',
      question: S.photoQ || '',
      extra: S.extra || '',
      draft: S.draft,
      final: S.cands[S.picked],
      chat: chat,
      trace: Providers.trace(),
    };
    if (!await store.add(rec)) return;   // 写不进去时 store.write 已经提示过，别再报“成功”
    closeRecordOverlay();
    toast('已经留下来了');
    S.archiveTab = 'records';
    S.arc = 'timeline';
    S.filter = 'all';
    S.day = null;
    $$('.fchip').forEach((x) => x.classList.toggle('active', x.dataset.f === 'all'));
    showView('archive');
  }

  /* ================= 档案：筛选与时间线 ================= */
  function filtered(ignoreDay) {
    let list = store.read();
    const now = new Date();
    if (S.day && !ignoreDay) return list.filter((r) => fmt(r.ts).key === S.day);
    if (S.filter === 'all') return list;
    if (S.filter === 'month') {
      return list.filter((r) => { const f = fmt(r.ts); return f.y === now.getFullYear() && f.m === now.getMonth() + 1; });
    }
    if (S.filter === 'week') {
      const start = new Date(now.getTime() - ((now.getDay() + 6) % 7) * DAY);
      start.setHours(0, 0, 0, 0);
      return list.filter((r) => new Date(r.ts).getTime() >= start.getTime());
    }
    if (S.filter === 'lastmonth') {
      const y = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return list.filter((r) => { const f = fmt(r.ts); return f.y === y.getFullYear() && f.m === y.getMonth() + 1; });
    }
    return list.filter((r) => r.mood && r.mood.anchor === S.filter);
  }

  function renderTimeline() {
    const list = filtered();
    const fc = $('#filterCount');
    if (S.day) {
      const d = new Date(S.day + 'T00:00:00');
      fc.innerHTML = '只看 ' + (d.getMonth() + 1) + ' 月 ' + d.getDate() + ' 日 · 共 ' + list.length + ' 条' +
        '<button class="dayClear" type="button">看全部</button>';
      const b = fc.querySelector('.dayClear');
      if (b) b.onclick = () => { S.day = null; renderRecordsPane(); };
    } else {
      fc.textContent = '共 ' + list.length + ' 条';
    }

    const tl = $('#timeline');
    tl.innerHTML = '';
    if (!list.length) {
      const isFiltered = S.day || S.filter !== 'all';
      tl.innerHTML = isFiltered
        ? emptyState(S.day ? '这一天还空着' : '这个筛选下还没有', 'records', '看全部')
        : emptyState('这里还空着', 'photo', '写第一条');
      bindEmpty(tl);
      return;
    }
    list.forEach((r) => {
      const f = fmt(r.ts);
      const m = moodOf(r);
      const row = document.createElement('button');
      row.type = 'button';
      row.className = 'trow';
      row.innerHTML =
        '<span class="rdate"><b>' + f.m + ' 月 ' + f.d + ' 日</b><span>' + f.hm + (f.y === new Date().getFullYear() ? '' : ' · ' + f.y) + '</span></span>' +
        rowMedia(r) +
        '<span class="rtext">' + escapeHtml(recText(r)) + '</span>' +
        '<span class="dot" role="img" aria-label="心情：' + escapeHtml(m.label || '未标注') + '" title="心情：' + escapeHtml(m.label || '未标注') + '" style="background:' + m.color + '"></span>';
      row.onclick = () => openDetail(r.id);
      tl.appendChild(row);
    });
  }

  function renderCalendar(all) {
    const cal = $('#calendar');
    const now = new Date();
    if (!S.cal) S.cal = { y: now.getFullYear(), m: now.getMonth() };
    const y = S.cal.y, m = S.cal.m;
    const days = new Date(y, m + 1, 0).getDate();
    const pad = (new Date(y, m, 1).getDay() + 6) % 7;
    const byDay = {};
    all.forEach((r) => { const k = fmt(r.ts).key; (byDay[k] = byDay[k] || []).push(r); });

    const title = $('#calTitle');
    if (title) title.textContent = y + ' 年 ' + (m + 1) + ' 月';

    cal.innerHTML = '';
    ['一', '二', '三', '四', '五', '六', '日'].forEach((d) => {
      const h = document.createElement('div');
      h.className = 'calhead';
      h.textContent = d;
      cal.appendChild(h);
    });
    for (let i = 0; i < pad; i++) cal.appendChild(document.createElement('div'));
    for (let d = 1; d <= days; d++) {
      const key = y + '-' + pad2(m + 1) + '-' + pad2(d);
      const cell = document.createElement('div');
      cell.className = 'calcell';
      if (d === now.getDate() && m === now.getMonth() && y === now.getFullYear()) cell.classList.add('today');
      if (S.day === key) cell.classList.add('picked');
      cell.textContent = d;
      const recs = byDay[key];
      if (recs && recs.length) {
        cell.classList.add('has');
        cell.setAttribute('role', 'button');
        cell.tabIndex = 0;
        const mm = dayMood(recs);
        cell.style.background = mm.color + '66';
        cell.title = recs.length + ' 条 · ' + recs.map((r) => moodOf(r).label).join(' / ') + ' · 点开这天';
        const go = () => pickDay(key);
        cell.onclick = go;
        cell.onkeydown = (e) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); }
        };
      } else {
        cell.title = '这一天没有记录';
      }
      cal.appendChild(cell);
    }
  }

  /* 修 bug：日历点有记录的一天 → 切到时间线并只看那一天 */
  function pickDay(key) {
    if (S.day === key) {
      S.day = null;
    } else {
      S.day = key;
      const d = new Date(key + 'T00:00:00');
      S.cal = { y: d.getFullYear(), m: d.getMonth() };
      S.filter = 'all';
      $$('.fchip').forEach((x) => x.classList.toggle('active', x.dataset.f === 'all'));
    }
    S.arc = 'timeline';
    setArchiveTab('records');
    const tl = $('#timeline');
    if (tl && tl.scrollIntoView) tl.scrollIntoView({ block: 'nearest' });
  }

  function goDay(key) {
    S.day = key;
    S.filter = 'all';
    S.keepFilter = true;
    S.arc = 'timeline';
    S.archiveTab = 'records';
    const d = new Date(key + 'T00:00:00');
    S.cal = { y: d.getFullYear(), m: d.getMonth() };
    $$('.fchip').forEach((x) => x.classList.toggle('active', x.dataset.f === 'all'));
    showView('archive');
  }

  function shiftMonth(d) {
    if (!S.cal) { const n0 = new Date(); S.cal = { y: n0.getFullYear(), m: n0.getMonth() }; }
    const n = new Date(S.cal.y, S.cal.m + d, 1);
    S.cal = { y: n.getFullYear(), m: n.getMonth() };
    renderCalendar(filtered(true));
  }

  /* ================= 档案：数据分析 ================= */
  function apRange(p) {
    const now = new Date();
    if (p === 'year') return { from: new Date(now.getFullYear(), 0, 1), to: now, label: '今年' };
    if (p === 'all') return { from: null, to: null, label: '这些日子' };
    return { from: sod(new Date(now.getTime() - 29 * DAY)), to: now, label: '这 30 天' };
  }

  function inRangeTs(r, from, to) {
    const t = new Date(r.ts).getTime();
    if (from && t < from.getTime()) return false;
    if (to && t > to.getTime()) return false;
    return true;
  }

  function renderAnalysis() {
    const range = apRange(S.ap);
    let list = store.read().filter((r) => inRangeTs(r, range.from, range.to));
    list.sort((a, b) => new Date(b.ts) - new Date(a.ts));

    let start = range.from;
    if (!start) {
      const oldest = store.read().reduce((m, r) => {
        const t = new Date(r.ts).getTime();
        return (!m || t < m) ? t : m;
      }, 0);
      start = oldest ? sod(new Date(oldest)) : sod(new Date(Date.now() - 29 * DAY));
    }

    const end = new Date();
    const byDay = {};
    list.forEach((r) => { const k = fmt(r.ts).key; (byDay[k] = byDay[k] || []).push(r); });
    const dayKeys = Object.keys(byDay);
    const active = dayKeys.length;

    const rangeEl = $('#archiveRange');
    const rangeTxt = md(start) + '–' + md(end) + '，共 ' + list.length + ' 条';
    if (rangeEl) rangeEl.textContent = range.from ? rangeTxt : ('全部，共 ' + list.length + ' 条');

    const lead = $('#riverLead');
    if (lead) {
      lead.innerHTML = range.label + '记了 <b>' + active + '</b> 天';
    }

    renderMap(list);
    renderScenes(list);
    renderContrast(list);
    renderLetters(list, range.label);
  }

  function renderMap(list) {
    const R = 104, C = 114;
    const box = $('#map');
    const marked = list.filter((r) => r.mood);
    if (!marked.length) {
      box.innerHTML = '<span class="snote">还没有标过心情的记录</span>';
      return;
    }
    let dots = '';
    marked.forEach((r) => {
      const rad = (r.mood.phi * Math.PI) / 180;
      const x = C + Math.cos(rad) * r.mood.r * R;
      const y = C - Math.sin(rad) * r.mood.r * R;
      dots += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="4.5" fill="' +
        r.mood.color + '" opacity=".92" stroke="rgba(26,29,34,.15)"/>';
    });
    const anchors = ANCHORS.map((a) => {
      const rad = (a.phi * Math.PI) / 180;
      const x = C + Math.cos(rad) * (R + 16), y = C - Math.sin(rad) * (R + 16);
      return '<text x="' + x + '" y="' + y + '" fill="#8b9299" font-size="11" text-anchor="middle" dominant-baseline="middle">' + a.key + '</text>';
    }).join('');
    box.innerHTML = '<svg width="228" height="228" viewBox="0 0 228 228" role="img" aria-label="心情分布">' +
      '<circle cx="' + C + '" cy="' + C + '" r="' + R + '" fill="none" stroke="rgba(26,29,34,.12)"/>' +
      '<circle cx="' + C + '" cy="' + C + '" r="' + (R / 2) + '" fill="none" stroke="rgba(26,29,34,.07)"/>' +
      '<line x1="' + (C - R) + '" y1="' + C + '" x2="' + (C + R) + '" y2="' + C + '" stroke="rgba(26,29,34,.07)"/>' +
      '<line x1="' + C + '" y1="' + (C - R) + '" x2="' + C + '" y2="' + (C + R) + '" stroke="rgba(26,29,34,.07)"/>' +
      anchors + dots + '</svg>';
  }

  function renderScenes(list) {
    const box = $('#scenes');
    box.innerHTML = '';
    const photos = list.filter((r) => recFacts(r));
    if (!photos.length) {
      box.innerHTML = '<span class="snote">这段时间只有文字，没有画面</span>';
      return;
    }
    const cnt = {};
    photos.forEach((r) => { const f = recFacts(r); cnt[f.scene] = (cnt[f.scene] || 0) + 1; });
    const max = Math.max.apply(null, Object.values(cnt));
    Object.keys(cnt).sort((a, b) => cnt[b] - cnt[a]).slice(0, 6).forEach((k) => {
      const row = document.createElement('div');
      row.className = 'srow';
      row.innerHTML = '<span>' + escapeHtml(k) + '</span><span class="sbar"><i style="width:' +
        ((cnt[k] / max) * 100) + '%"></i></span><span>' + cnt[k] + '</span>';
      box.appendChild(row);
    });
  }

  function colorGap(a, b) {
    const A = hex2rgb(a), B = hex2rgb(b);
    return Math.min(1, Math.sqrt(Math.pow(A[0] - B[0], 2) + Math.pow(A[1] - B[1], 2) + Math.pow(A[2] - B[2], 2)) / 441);
  }

  function renderContrast(list) {
    const box = $('#contrast');
    box.innerHTML = '';
    const photos = list.filter((r) => kindOf(r) === 'photo' && r.palette && r.palette.length);
    if (!photos.length) {
      box.innerHTML = '<span class="snote">文字记录没有照片的颜色可对照</span>';
      return;
    }
    photos.slice(0, 7).forEach((r) => {
      const photo = r.palette[0];
      const gap = colorGap(moodOf(r).color, photo);
      const f = fmt(r.ts);
      const row = document.createElement('div');
      row.className = 'crow';
      row.innerHTML =
        '<span class="sw" style="background:' + moodOf(r).color + '"></span>' +
        '<span class="sw" style="background:' + photo + '"></span>' +
        '<span>' + f.m + '/' + f.d + '</span>' +
        '<span class="gapbar"><i style="width:' + Math.min(100, gap * 100).toFixed(0) + '%"></i></span>' +
        '<span>' + gap.toFixed(2) + '</span>';
      row.title = '照片的颜色，和当时的心情差得越远，越可能是“照片很好看，但我其实不太好”';
      box.appendChild(row);
    });
  }

  function renderLetters(list, label) {
    const box = $('#letters');
    if (!list.length) {
      box.innerHTML = emptyState('还没有记录', 'text', '写第一条');
      bindEmpty(box);
      return;
    }
    const n = list.length;
    const night = list.filter((r) => { const h = fmt(r.ts).h; return h >= 21 || h < 3; }).length;
    const photos = list.filter((r) => recFacts(r));
    const scenes = {};
    photos.forEach((r) => { const f = recFacts(r); scenes[f.scene] = (scenes[f.scene] || 0) + 1; });
    const top = Object.keys(scenes).sort((a, b) => scenes[b] - scenes[a])[0];
    const lines = ['<p>' + escapeHtml(label) + '写了 <b>' + n + '</b> 条。</p>'];
    if (night) lines.push('<p>其中 ' + night + ' 条在 21 点以后。</p>');
    if (top) lines.push('<p>最常出现的地方：' + escapeHtml(top) + '。</p>');
    if (n - photos.length > 0) lines.push('<p>其中 ' + (n - photos.length) + ' 条只有文字。</p>');
    box.innerHTML = lines.join('');
  }

  /* ================= 回看：按时间 ================= */
  function reviewRange(p) {
    const now = new Date();
    if (p === 'week') {
      const wd = (now.getDay() + 6) % 7;
      const thisMon = sod(new Date(now.getTime() - wd * DAY));
      return {
        from: new Date(thisMon.getTime() - 7 * DAY),
        to: new Date(thisMon.getTime() - 1),
        label: '上周', more: '这 7 天',
      };
    }
    if (p === 'month') {
      const from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const to = new Date(new Date(now.getFullYear(), now.getMonth(), 1).getTime() - 1);
      return { from: from, to: to, label: '上个月', more: '上个月' };
    }
    if (p === 'year') {
      return { from: new Date(now.getFullYear(), 0, 1), to: now, label: '今年', more: '今年' };
    }
    return { from: null, to: null, label: '这些日子', more: '全部' };
  }

  function renderReview() {
    $$('[data-period]').forEach((b) => b.classList.toggle('active', b.dataset.period === S.rp));
    const range = reviewRange(S.rp);
    let list = store.read().filter((r) => inRangeTs(r, range.from, range.to));
    list.sort((a, b) => new Date(b.ts) - new Date(a.ts));

    const rangeEl = $('#reviewRange');
    if (rangeEl) {
      rangeEl.textContent = range.from
        ? (md(range.from) + '–' + md(range.to) + '，共 ' + list.length + ' 条')
        : ('全部，共 ' + list.length + ' 条');
    }

    const byDay = {};
    list.forEach((r) => { const k = fmt(r.ts).key; (byDay[k] = byDay[k] || []).push(r); });
    const keys = Object.keys(byDay);

    const lead = $('#sumLead');
    const sub = $('#sumSub');
    if (!list.length) {
      if (lead) lead.innerHTML = range.label + '没有记录。';
      if (sub) sub.textContent = '换个范围，或者现在写一条。';
    } else {
      let topKey = null, topN = -1;
      keys.forEach((k) => {
        const n = byDay[k].length;
        if (n > topN || (n === topN && (!topKey || k > topKey))) { topN = n; topKey = k; }
      });
      const first = byDay[topKey][0];
      const td = new Date(topKey + 'T00:00:00');
      if (lead) lead.innerHTML = range.label + '记了 <b>' + keys.length + '</b> 天。';
      if (sub) sub.textContent = cnmd(td) + '最多，那天写的是：' + recText(first);
    }

    const moreText = $('#reviewMoreText');
    if (moreText) moreText.textContent = range.more;

    const box = $('#reviewList');
    box.innerHTML = '';
    if (!list.length) {
      box.innerHTML = emptyState('这段时间还没有记录', 'text', '写一条');
      bindEmpty(box);
      return;
    }
    list.slice(0, 8).forEach((r) => {
      const f = fmt(r.ts);
      const m = moodOf(r);
      const row = document.createElement('button');
      row.type = 'button';
      row.className = 'rrow';
      row.innerHTML =
        '<span class="rdate"><b>' + f.m + ' 月 ' + f.d + ' 日</b><span>' + f.hm + '</span></span>' +
        rowMedia(r) +
        '<span class="rtext">' + escapeHtml(recText(r)) + '</span>' +
        '<span class="dot" role="img" aria-label="心情：' + escapeHtml(m.label || '未标注') + '" title="心情：' + escapeHtml(m.label || '未标注') + '" style="background:' + m.color + '"></span>';
      row.onclick = () => openDetail(r.id);
      box.appendChild(row);
    });
  }

  /* ================= 回看：聊着找（旧版检索） ================= */
  const MOOD_WORDS = [
    { w: ['难过', '伤心', '难受', '低落', '丧', '委屈', '空落'], phi: [170, 265], r: [0.32, 1] },
    { w: ['累', '疲惫', '撑不住', '没力气'], phi: [185, 275], r: [0.35, 1] },
    { w: ['焦虑', '烦', '生气', '火大', '愤怒', '压力'], phi: [100, 200], r: [0.3, 1] },
    { w: ['开心', '高兴', '快乐', '雀跃', '爽'], phi: [8, 100], r: [0.25, 1] },
    { w: ['治愈', '放松', '轻松', '舒服', '平静', '安心'], phi: [280, 352], r: [0.1, 0.9] },
  ];

  function parseQuery(text) {
    const now = new Date();
    const day = DAY;
    let from = null, to = null, timeLabel = '';

    if (/今天/.test(text)) { from = sod(now); to = new Date(from.getTime() + day); timeLabel = '今天'; }
    else if (/昨天/.test(text)) { from = new Date(sod(now).getTime() - day); to = sod(now); timeLabel = '昨天'; }
    else if (/前天/.test(text)) { from = new Date(sod(now).getTime() - 2 * day); to = new Date(sod(now).getTime() - day); timeLabel = '前天'; }
    else if (/上周/.test(text)) {
      const wd = (now.getDay() + 6) % 7;
      to = sod(new Date(now.getTime() - wd * day));
      from = new Date(to.getTime() - 7 * day); timeLabel = '上周';
    } else if (/本周|这周/.test(text)) {
      const wd = (now.getDay() + 6) % 7;
      from = sod(new Date(now.getTime() - wd * day)); to = now; timeLabel = '本周';
    } else if (/上个月|上月/.test(text)) {
      from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      to = new Date(now.getFullYear(), now.getMonth(), 1); timeLabel = '上个月';
    } else if (/这个月|本月/.test(text)) {
      from = new Date(now.getFullYear(), now.getMonth(), 1); to = now; timeLabel = '这个月';
    } else if (/去年冬天/.test(text)) {
      from = new Date(now.getFullYear() - 1, 11, 1);
      to = new Date(now.getFullYear(), 2, 1); timeLabel = '去年冬天';
    } else if (/去年/.test(text)) {
      from = new Date(now.getFullYear() - 1, 0, 1); to = new Date(now.getFullYear(), 0, 1); timeLabel = '去年';
    } else if (/今年/.test(text)) {
      from = new Date(now.getFullYear(), 0, 1); to = now; timeLabel = '今年';
    } else {
      const m = text.match(/近\s*(\d+)\s*天/);
      if (m) { from = new Date(now.getTime() - (+m[1]) * day); to = now; timeLabel = '近' + m[1] + '天'; }
    }

    let mood = null;
    for (const mw of MOOD_WORDS) if (mw.w.some((w) => text.indexOf(w) >= 0)) { mood = mw; break; }

    let kw = text
      .replace(/今天|昨天|前天|上周|本周|这周|上个月|上月|这个月|本月|去年冬天|去年|今年|近\s*\d+\s*天|最近|的|我|在|干嘛|干什么|做了什么|是什么|那次|那阵子|的时候/g, ' ')
      .replace(/[，？！,.?!、\s]+/g, ' ');
    for (const mw of MOOD_WORDS) for (const w of mw.w) kw = kw.split(w).join(' ');
    return { from: from, to: to, timeLabel: timeLabel, mood: mood, keywords: kw.split(/\s+/).filter((x) => x.length >= 2) };
  }

  function inMoodRange(rec, mood) {
    if (!rec.mood) return false;
    const phi = ((rec.mood.phi % 360) + 360) % 360;
    const inPhi = mood.phi[0] <= mood.phi[1]
      ? (phi >= mood.phi[0] && phi <= mood.phi[1])
      : (phi >= mood.phi[0] || phi <= mood.phi[1]);
    return inPhi && rec.mood.r >= mood.r[0] && rec.mood.r <= mood.r[1];
  }

  function search(parsed, relax) {
    let list = store.read().slice();
    let usedTime = parsed.timeLabel, usedMood = parsed.mood, relaxed = '';

    if (parsed.from && relax < 2) {
      let from = parsed.from;
      const to = parsed.to || new Date();
      if (relax >= 1) {
        const span = Math.max(to - from, DAY);
        from = new Date(from.getTime() - span * 2);
        relaxed = usedTime + '没找到，范围放宽了一些';
      }
      list = list.filter((r) => {
        const t = new Date(r.ts).getTime();
        return t >= from.getTime() && t <= to.getTime();
      });
    } else if (parsed.from) {
      relaxed = '时间范围太窄，先只看心情和内容';
      usedTime = '';
    }

    if (usedMood && relax < 2) {
      const hit = list.filter((r) => inMoodRange(r, usedMood));
      if (hit.length) list = hit;
      else if (relax >= 1) relaxed = relaxed || '严格算这种心情的没有，把相近的也算上了';
      else list = hit;
    } else if (usedMood) usedMood = null;

    if (parsed.keywords.length) {
      list = list.filter((r) => {
        const blob = recBlob(r);
        return parsed.keywords.every((w) => blob.indexOf(w) >= 0);
      });
    }

    return { list: list.sort((a, b) => new Date(b.ts) - new Date(a.ts)), relaxed: relaxed, usedTime: usedTime, usedMood: usedMood };
  }

  function recallHit(r) {
    const f = fmt(r.ts);
    const m = moodOf(r);
    const yPrefix = f.y === new Date().getFullYear() ? '' : f.y + '年';
    const el = document.createElement('div');
    el.className = 'hit';
    el.setAttribute('role', 'button');
    el.tabIndex = 0;
    el.innerHTML = hitMedia(r) +
      '<div class="hm">' +
      '<div class="hd"><span class="dot" style="background:' + m.color + ';display:inline-block;vertical-align:middle;margin-right:6px"></span>' +
      yPrefix + f.m + '月' + f.d + '日 ' + f.hm + ' · ' + m.label + '</div>' +
      '<div class="ht">' + escapeHtml(recText(r)) + '</div></div>';
    el.onclick = () => openDetail(r.id);
    el.onkeydown = (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openDetail(r.id); }
    };
    return el;
  }

  function renderRecallThread() {
    const box = $('#recallThread');
    if (!box) return;
    box.innerHTML = '';
    R.turns.forEach((t) => {
      const el = document.createElement('div');
      el.className = 'rTurn rTurn--' + (t.role === 'me' ? 'me' : 'it');
      const who = document.createElement('span');
      who.className = 'rWho';
      who.textContent = t.role === 'me' ? '你' : '它';
      const p = document.createElement('p');
      p.textContent = t.text || '';
      el.appendChild(who);
      el.appendChild(p);
      if (t.results && t.results.length) {
        const grid = document.createElement('div');
        grid.className = 'hits rHits';
        t.results.forEach((r) => grid.appendChild(recallHit(r)));
        el.appendChild(grid);
      }
      if (t.more) {
        const more = document.createElement('div');
        more.className = 'rMore';
        more.textContent = t.more;
        el.appendChild(more);
      }
      box.appendChild(el);
    });
    const last = box.lastElementChild;
    if (last && typeof last.offsetTop === 'number') {
      box.scrollTop = Math.max(0, last.offsetTop - 8);
    } else {
      box.scrollTop = box.scrollHeight || 0;
    }
  }

  function renderRecall() {
    renderSamples();
    if (!R.turns.length) {
      R.turns.push({ role: 'it', text: '想找哪段日子？说个大概就行，比如「上个月」「去年冬天」' });
    }
    renderRecallThread();
  }

  function recallAnswer(list) {
    if (!list.length) {
      return {
        text: '这段时间没有记录，没有就是没有，我不替你编，要不要把范围放宽一点，或者换个说法',
        results: [],
      };
    }
    const n = list.length;
    const hours = list.map((r) => fmt(r.ts).h);
    const night = hours.filter((h) => h >= 21 || h < 3).length;
    const photos = list.filter((r) => recFacts(r));
    const scenes = {};
    photos.forEach((r) => { const f = recFacts(r); scenes[f.scene] = (scenes[f.scene] || 0) + 1; });
    const top = Object.keys(scenes).sort((a, b) => scenes[b] - scenes[a])[0];

    const parts = [];
    parts.push((R.filters.timeLabel || '') + (R.filters.timeLabel ? '，找到 ' : '找到 ') + n + ' 条');
    if (night >= Math.ceil(n / 2)) parts.push(night + ' 条在 21 点以后');
    if (top) parts.push('最多的是「' + top + '」');
    if (n - photos.length > 0) parts.push('其中 ' + (n - photos.length) + ' 条只有文字');
    parts.push('要再往前翻翻，还是先看看这几条');
    return {
      text: parts.join('，'),
      results: list.slice(0, 4),
      more: list.length > 4 ? '还有 ' + (list.length - 4) + ' 条，没有全列出来' : '',
    };
  }

  function recallSearch() {
    const parsed = {
      from: R.filters.from, to: R.filters.to, timeLabel: R.filters.timeLabel,
      mood: R.filters.mood, keywords: R.filters.keywords,
    };
    let list = search(parsed, 0).list;
    if (R.filters.negative.length) {
      list = list.filter((r) => R.filters.negative.every((w) => recBlob(r).indexOf(w) < 0));
    }
    return list;
  }

  function resetRecallFilters() {
    R.filters = { from: null, to: null, timeLabel: '', mood: null, keywords: [], negative: [] };
  }

  function resetRecallChat() {
    R.turns = [];
    resetRecallFilters();
    const box = $('#recallThread');
    if (box) box.innerHTML = '';
    if (S.view === 'review' && S.reviewTab === 'chat') renderRecall();
  }

  function recallSend(text) {
    const q = String(text || '').trim();
    if (!q) return toast('说一句想问的');
    R.turns.push({ role: 'me', text: q });
    const inp = $('#q');
    if (inp) inp.value = '';

    if (/就这些|够了|可以了|不用了|停吧/.test(q)) {
      R.turns.push({ role: 'it', text: '好，那这些先放在这里，想写一条的话，随时' });
      renderRecallThread();
      return;
    }

    if (/重新|换个|再找一次/.test(q)) {
      resetRecallFilters();
      R.turns.push({ role: 'it', text: '好，重新来，想找哪段日子？' });
      renderRecallThread();
      return;
    }

    const isNegative = /^(不要|除了|别)/.test(q);
    const isCommand = /再早|往前|更早|放宽|再找找|只看|只要|只留|不要|除了|重新|换个/.test(q);
    let changed = false;

    if (/再早|往前|更早|放宽|再找找/.test(q)) {
      if (R.filters.from) {
        R.filters.from = new Date(R.filters.from.getTime() - 90 * DAY);
        R.filters.timeLabel = '再往前';
      } else {
        R.filters.from = new Date(Date.now() - 365 * DAY);
        R.filters.to = new Date();
        R.filters.timeLabel = '再往前';
      }
      changed = true;
    }

    if (/只看|只要|只留/.test(q)) {
      const m = q.match(/(?:只看|只要|只留)(.+)/);
      const kw = m ? m[1].replace(/那几次|那几天|的时候|的事|[的了吧呢啊了，。？！,.?!\s]+/g, '') : '';
      if (kw) {
        R.filters.keywords = unique(R.filters.keywords.concat([kw]));
        changed = true;
      }
    }

    if (isNegative) {
      const m = q.match(/(?:不要|除了|别)(.+)/);
      const kw = m ? m[1].replace(/那几次|那几天|的时候|的事|[的了吧呢啊了，。？！,.?!\s]+/g, '') : '';
      if (kw) {
        R.filters.negative = unique(R.filters.negative.concat([kw]));
        changed = true;
      }
    }

    const parsed = parseQuery(q);
    if (parsed.from || parsed.to) {
      R.filters.from = parsed.from;
      R.filters.to = parsed.to;
      R.filters.timeLabel = parsed.timeLabel;
      changed = true;
    }
    if (parsed.mood) { R.filters.mood = parsed.mood; changed = true; }
    if (!isNegative && !isCommand && parsed.keywords.length) {
      R.filters.keywords = unique(R.filters.keywords.concat(parsed.keywords));
      changed = true;
    }

    const hasAny = !!(R.filters.from || R.filters.mood || R.filters.keywords.length || R.filters.negative.length);
    if (!changed && !hasAny) {
      R.turns.push({ role: 'it', text: '想找哪段时间，或者哪种心情？给我一个大概就行' });
      renderRecallThread();
      return;
    }
    if (!changed && hasAny) {
      R.turns.push({ role: 'it', text: '还是刚才的范围，要不要放宽一点，或者换个说法' });
      renderRecallThread();
      return;
    }

    const list = recallSearch();
    const ans = recallAnswer(list);
    R.turns.push({ role: 'it', text: ans.text, results: ans.results, more: ans.more });
    renderRecallThread();
  }

  function renderSamples() {
    const box = $('#samples');
    if (!box || box.dataset.done) return;
    box.dataset.done = '1';
    ['上个月让我难过的事', '这个月开心的时候', '最近一次觉得轻松', '去年冬天我在干什么'].forEach((s) => {
      const c = document.createElement('button');
      c.className = 'chip';
      c.type = 'button';
      c.textContent = s;
      c.onclick = () => { resetRecallFilters(); recallSend(s); };
      box.appendChild(c);
    });
  }

  /* ================= 详情 ================= */
  function openDetail(id) {
    const r = store.read().find((x) => x.id === id);
    if (!r) return;
    const f = fmt(r.ts);
    const kind = kindOf(r);
    const m = moodOf(r);
    const facts = recFacts(r);
    const isText = kind === 'text';
    const factRows = facts ? [
      ['场景', facts.scene], ['光线', facts.light], ['时间', facts.time],
      ['主体', (facts.subjects || []).join('、')], ['没有', (facts.absence || []).join('、')],
    ].filter((x) => x[1]) : [];

    const media = isText ? ''
      : (r.thumb ? '<img class="dimg" src="' + r.thumb + '" alt="">'
        : '<div class="dimg dimg--none">没有留下照片</div>');

    let body = '';
    if (isText) {
      const said = (r.chat && r.chat.length
        ? r.chat.filter((t) => t.role === 'me').map((t) => t.text).join('\n')
        : (r.note || ''));
      body += '<div class="dsec">你说的</div><div class="dtext">' + escapeHtml(said) + '</div>';
      if (r.reply) body += '<div class="dsec">它接住的</div><div class="dtext">' + escapeHtml(r.reply) + '</div>';
      if (r.question) body += '<div class="dsec">它问的</div><div class="dtext">' + escapeHtml(r.question) + '</div>';
      if (r.final && r.final !== r.note) {
        if (r.draft && r.draft !== r.final) {
          body += '<div class="dsec">它整理的一段</div><div class="dtext">' + escapeHtml(r.draft) + '</div>';
        }
        const label = r.draft && r.draft === r.final ? '它整理的一段' : '留下来的';
        body += '<div class="dsec">' + label + '</div><div class="dtext">' + escapeHtml(r.final) + '</div>';
      } else {
        body += '<p class="dnote">按你写的原话留下</p>';
      }
    } else {
      body += '<div class="dsec">它看见的</div><div class="dfacts">' +
        factRows.map(([k, v]) => '<span class="tag">' + k + '：' + escapeHtml(String(v)) + '</span>').join('') + '</div>';
      body += '<div class="dsec">这一刻</div><div class="dtext">' + escapeHtml(r.draft || '') + '</div>';
      if (r.question) body += '<div class="dsec">它问的</div><div class="dtext">' + escapeHtml(r.question) + '</div>';
      const answerTurn = (r.chat || []).find((t) => t.role === 'me');
      if (answerTurn) body += '<div class="dsec">你答的</div><div class="dtext">' + escapeHtml(answerTurn.text) + '</div>';
      if (r.extra) body += '<div class="dsec">你补的</div><div class="dtext">' + escapeHtml(r.extra) + '</div>';
      body += '<div class="dsec">留一段</div><div class="dtext">' + escapeHtml(r.final || '') + '</div>';
      if (r.note) body += '<div class="dsec">当时写的</div><div class="dtext">' + escapeHtml(r.note) + '</div>';
    }

    $('#detailBody').innerHTML = media +
      '<div class="drow">' +
      '<span class="dot" role="img" aria-label="心情：' + escapeHtml(m.label || '未标注') + '" title="心情：' + escapeHtml(m.label || '未标注') + '" style="background:' + m.color + '"></span>' +
      '<span>' + f.full + ' ' + f.hm + '</span><span>·</span><span>' + m.label + '</span>' +
      (isText ? '<span>·</span><span>文字记录</span>' : '') +
      (r.demo ? '<span>·</span><span>示例记录</span>' : '') +
      '</div>' + body +
      '<div class="detailAct">' +
      '<button class="btn sm" type="button" data-same="' + f.key + '">那天还写了什么</button>' +
      '<button class="btn sm" type="button" data-reflect="1">看看这一段</button>' +
      '<button class="danger" type="button" data-del="' + r.id + '">删除这一条</button>' +
      '</div>';
    $('#detail').hidden = false;

    const same = $('#detailBody').querySelector('[data-same]');
    if (same) same.onclick = () => {
      $('#detail').hidden = true;
      goDay(same.dataset.same);
    };
    const refl = $('#detailBody').querySelector('[data-reflect]');
    if (refl) refl.onclick = () => {
      $('#detail').hidden = true;
      S.rp = 'month';
      showView('review');
    };
    const del = $('#detailBody').querySelector('[data-del]');
    if (del) del.onclick = async () => {
      if (!confirm('删除后不可恢复，确定？')) return;
      if (!await store.remove(r.id)) return;
      $('#detail').hidden = true;
      renderHome(); renderReview();
      if (S.archiveTab === 'analysis') renderAnalysis();
      else renderRecordsPane();
      toast('已删除');
    };
  }

  /* ================= 示例与工具 ================= */
  function syntheticThumb(color) {
    const c = document.createElement('canvas');
    c.width = 320; c.height = 240;
    const ctx = c.getContext('2d');
    const g = ctx.createLinearGradient(0, 0, 320, 240);
    g.addColorStop(0, color); g.addColorStop(1, '#dfe1e5');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 320, 240);
    ctx.globalAlpha = .3;
    for (let k = 0; k < 10; k++) {
      ctx.beginPath();
      ctx.arc(40 + k * 28, 120 + Math.sin(k) * 50, 12 + (k % 4) * 6, 0, Math.PI * 2);
      ctx.fillStyle = k % 2 ? '#ffffff' : '#242a33';
      ctx.fill();
    }
    return c.toDataURL('image/jpeg', 0.72);
  }

  async function seed() {
    try { await store.ready(); } catch { return toast("本地数据库还未准备好"); }
    const specs = [
      {
        iso: '2026-11-12T21:10:00+08:00', phi: 218, r: .52, note: '下雨了', thumb: SEED_THUMBS.rain,
        scene: '窗边的室内', light: '阴天的灰白天光', subj: ['雨点', '玻璃'], abs: ['画面里没有人'], photo: '#8d9b9c',
        draft: '窗边的室内，雨点挂在玻璃上，屋里只有一盏小灯',
        final: '下雨了，雨点挂在玻璃上，屋里只开了一盏小灯，我听了很久的雨',
      },
      {
        iso: '2026-11-10T23:20:00+08:00', phi: 232, r: .72, note: '今天其实有点撑不住', thumb: SEED_THUMBS.book,
        scene: '夜里的桌面', light: '只有一处暖光', subj: ['摊开的书', '深色布面'], abs: ['画面里没有人'], photo: '#3f4a52',
        draft: '夜里的桌面，一本摊开的书放在深色布面上，画面里没有人',
        final: '今天其实有点撑不住，书摊在桌上，我看了很久也没翻页，后来就关灯睡了',
      },
      {
        iso: '2026-11-08T10:30:00+08:00', phi: 52, r: .62, note: '慢慢吃了一顿早饭', thumb: SEED_THUMBS.toast,
        scene: '窗边的餐桌', light: '早上的侧光', subj: ['吐司', '盘子'], abs: [], photo: '#c9a27a',
        draft: '窗边的餐桌，盘子里放着吐司，早上的侧光落在桌面',
        final: '早上煎了吐司，坐在窗边慢慢吃完，阳光落在盘子上，哪儿也没去',
      },
      {
        iso: '2026-11-05T08:20:00+08:00', phi: 305, r: .40, note: '早上难得清醒', thumb: SEED_THUMBS.windowPlants,
        scene: '窗台', light: '上午的阳光', subj: ['一排盆栽', '百叶窗'], abs: [], photo: '#8a9b7a',
        draft: '窗台上摆着一排盆栽，上午的阳光照在叶子上',
        final: '早上难得清醒，窗台的盆栽被光照着，我在那儿站了一会儿',
      },
      {
        iso: '2026-11-02T22:40:00+08:00', phi: 246, r: .58, note: '又加班了', thumb: SEED_THUMBS.tea,
        scene: '木桌上', light: '室内偏暗', subj: ['茶壶', '杯子', '深色木纹'], abs: [], photo: '#5a4a3c',
        draft: '木桌上放着茶壶和杯子，室内偏暗，桌面是深色木纹',
        final: '又加班了，茶凉了也没顾上喝，屋里只剩下键盘的声音',
      },
      {
        iso: '2026-10-29T19:30:00+08:00', phi: 52, r: .55, note: '和朋友吃了顿饭', thumb: SEED_THUMBS.dinner,
        scene: '窗边的餐桌', light: '午后的斜光', subj: ['白桌布', '花', '酒杯'], abs: ['画面里没有人'], photo: '#d8d2c8',
        draft: '窗边的餐桌，白桌布上摆着盘子、花和酒杯，画面里没有人',
        final: '和朋友吃了顿饭，杯子和盘子摆了一桌，谁都没看手机，那顿饭吃了很久',
      },
      {
        iso: '2026-10-25T16:20:00+08:00', phi: 305, r: .33, note: '烤了面包', thumb: SEED_THUMBS.bread,
        scene: '桌面', light: '柔和的自然光', subj: ['面包', '果酱'], abs: [], photo: '#b08a6a',
        draft: '桌面上放着一整块面包和一小碟果酱，光很柔',
        final: '烤了面包，抹了果酱，掰了一半给室友，屋里都是麦子的味道',
      },
      {
        iso: '2026-10-20T17:10:00+08:00', phi: 52, r: .60, note: '叶子红了', thumb: SEED_THUMBS.leaves,
        scene: '户外的树下', light: '秋日下午的光', subj: ['红叶', '枯枝'], abs: [], photo: '#a85a2a',
        draft: '户外的秋日，红叶和枯枝在光里',
        final: '路边的叶子红了，风一吹就落下来，我绕远了一点走回家',
      },
      {
        iso: '2026-11-07T23:10:00+08:00', phi: 232, r: .45, note: '屋里很安静', thumb: SEED_THUMBS.lamp,
        scene: '卧室的床头', light: '一盏暖灯', subj: ['床头灯', '白色花瓶'], abs: ['画面里没有人'], photo: '#c9b8a8',
        draft: '卧室的床头，一盏暖灯亮着，旁边有白色花瓶，画面里没有人',
        final: '晚上把床头灯开着，屋里很安静，什么也没做，就坐了一会儿',
      },
      {
        iso: '2026-09-30T07:30:00+08:00', phi: 305, r: .33, note: '早起走了走', thumb: SEED_THUMBS.dew,
        scene: '清晨的草地', light: '刚升起的太阳', subj: ['草叶', '露水'], abs: [], photo: '#b8b06a',
        draft: '清晨的草地，草叶上都是露水，太阳刚出来',
        final: '早起去楼下走了走，草叶上都是水，太阳刚出来，空气很凉',
      },
      {
        iso: '2026-09-26T15:40:00+08:00', phi: 52, r: .55, note: '难得不着急', thumb: SEED_THUMBS.fruit,
        scene: '桌面', light: '下午的自然光', subj: ['水果盘', '书', '饮料'], abs: [], photo: '#c25a4a',
        draft: '桌面上有一盘水果、一本打开的书和一杯饮料，下午的光',
        final: '下午切了一盘水果，翻了两页书，天还亮着，难得不着急',
      },
      {
        iso: '2026-09-12T16:00:00+08:00', phi: 305, r: .45, note: '绿植长了新叶', thumb: SEED_THUMBS.plant,
        scene: '窗边的绿植', light: '白天的柔光', subj: ['大叶植物', '窗'], abs: [], photo: '#5a7a4a',
        draft: '窗边的绿植，大叶子被白天的柔光照着',
        final: '给窗边的绿植浇了水，新叶子又展开了一点，看着心里松了些',
      },
    ];
    const list = specs.map((sp, i) => {
      const m = moodFrom(sp.phi, sp.r);
      const hour = +sp.iso.slice(11, 13);
      const time = hour < 6 ? '凌晨' : hour < 11 ? '清早' : hour < 14 ? '中午' : hour < 18 ? '下午' : hour < 22 ? '夜里' : '深夜';
      const facts = {
        scene: sp.scene, light: sp.light, time: time,
        subjects: sp.subj, absence: sp.abs, text_spans: [],
        palette: [sp.photo, '#dfe1e5', '#8b9299', '#c7b299', '#242a33'],
        brightness: .45, saturation: .28, conf: .72,
      };
      return {
        id: 'seed' + i, ts: sp.iso, kind: 'photo',
        thumb: sp.thumb || syntheticThumb(sp.photo),
        palette: facts.palette,
        mood: { phi: m.phi, r: m.r, valence: m.valence, arousal: m.arousal, anchor: m.anchor, label: m.label, color: m.color },
        facts: facts, note: sp.note,
        reply: '', question: '',
        draft: sp.draft,
        final: sp.final,
        chat: [],
        trace: { calls:0, requests:[], tools:[], synthetic:true }, demo: true,
      };
    }).sort((a, b) => new Date(b.ts) - new Date(a.ts));
    if (!await store.write(list)) return;
    resetRecallChat();
    toast('已放进 12 条示例');
    renderHome(); renderReview();
    if (S.archiveTab === 'analysis') renderAnalysis();
    else renderRecordsPane();
  }

  /* ================= 菜单动作 ================= */
  function doImport() {
    const inp = $('#importFile');
    if (inp) inp.click();
  }

  function readImport() {
    const f = $('#importFile').files && $('#importFile').files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try { await store.ready(); } catch { return toast("本地数据库还未准备好"); }
      let data;
      try { data = JSON.parse(String(reader.result)); }
      catch (e) { return toast('这个文件不是光影志的备份，请选择之前导出的备份文件'); }
      if (!Array.isArray(data)) return toast('这个文件不是光影志的备份，请选择之前导出的备份文件');
      const ok = data.filter((r) => {
        if (!r || !r.ts) return false;
        if (r.kind === 'text') return true;
        if (!r.kind && !r.thumb) return true;
        return !!r.facts;
      }).map((r) => {
        r.kind = r.kind || (r.thumb ? 'photo' : 'text');
        r.note = r.note || '';
        r.reply = r.reply || '';
        r.question = r.question || '';
        r.chat = Array.isArray(r.chat) ? r.chat : [];
        return r;
      });
      if (!ok.length) return toast('备份里没有可用的记录');
      const ids = {};
      store.read().forEach((r) => { ids[r.id] = 1; });
      let skipped = ok.length;
      const merged = ok.filter((r) => {
        const id = r.id || ('imp' + Math.random().toString(36).slice(2, 9));
        if (ids[id]) return false;
        r.id = id; ids[id] = 1;
        skipped -= 1;
        return true;
      });
      if (!await store.write(store.read().concat(merged).sort((a, b2) => new Date(b2.ts) - new Date(a.ts)))) return;
      resetRecallChat();
      renderHome(); renderReview();
      if (S.archiveTab === 'analysis') renderAnalysis();
      else renderRecordsPane();
      toast('已恢复 ' + merged.length + ' 条' + (skipped ? '，跳过重复 ' + skipped + ' 条' : ''));
    };
    reader.readAsText(f);
    $('#importFile').value = '';
  }

  function doExport() {
    const blob = new Blob([JSON.stringify(store.read(), null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = '光影志备份-' + stamp + '.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    toast('备份已保存到下载文件夹');
  }

  async function doClear() {
    const cloud = Boolean(window.LuminaSyncState && window.LuminaSyncState.enabled);
    if (!confirm(cloud
      ? '将清空本机全部记录，并在下次同步时删除云端记录。不可恢复。继续？'
      : '清空本机全部记录？不可恢复。继续？')) return;
    if (!await store.write([], store.read().map(r => r.id))) return;
    resetRecallChat();
    renderHome(); renderReview();
    if (S.archiveTab === 'analysis') renderAnalysis();
    else renderRecordsPane();
    toast(cloud ? '本机已清空，云端记录将在下次同步时删除' : '本机记录已清空');
  }

  function toggleMotion(btn) {
    document.body.classList.toggle('no-motion');
    const on = document.body.classList.contains('no-motion');
    if (btn) btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    toast(on ? '已减少动效' : '已恢复动效');
  }

  function openStatus() { $('#statusSheet').hidden = false; }
  function closeStatus() { $('#statusSheet').hidden = true; }

  /* ================= 绑定 ================= */
  function bind() {
    /* 封面 */
    const enter = $('#enterCover');
    if (enter) enter.onclick = () => showView('home');
    if (skipBtn) skipBtn.onclick = () => { pauseCoverVideo(); arriveCover(); };

    /* 主页面切换 */
    $$('.tab').forEach((t) => {
      t.onclick = () => {
        if (t.dataset.go === 'archive') {
          if (S.view !== 'archive') S.archiveTab = 'analysis';
          S.filter = 'all';
          S.day = null;
          $$('.fchip').forEach((x) => x.classList.toggle('active', x.dataset.f === 'all'));
        }
        showView(t.dataset.go);
      };
    });
    $$('[data-goto]').forEach((el) => {
      el.onclick = () => {
        const at = el.getAttribute('data-archive-tab');
        if (at) S.archiveTab = at;
        showView(el.dataset.goto);
      };
    });
    const brands = {
      brandHome: () => backToCover(),
      brandRecord: () => showView('home'),
      brandReview: () => showView('home'),
      brandArchive: () => showView('home'),
    };
    Object.keys(brands).forEach((id) => {
      const b = $('#' + id);
      if (b) b.onclick = brands[id];
    });

    /* 首页入口 */
    const start = $('#startRecord');
    if (start) start.onclick = () => showView('record');
    const demo = $('#loadDemo');
    if (demo) demo.onclick = seed;

    $$('[data-start]').forEach((b) => {
      b.onclick = () => openSheet(b.dataset.start === 'text' ? 'text' : 'photo');
    });

    /* 菜单 */
    const menu = $('#menu');
    $$('[data-menu]').forEach((b) => {
      b.onclick = (e) => {
        e.stopPropagation();
        menu.hidden = !menu.hidden;
      };
    });
    document.addEventListener('click', () => { if (menu) menu.hidden = true; });
    if (menu) menu.onclick = (e) => e.stopPropagation();

    $$('#menu button').forEach((b) => {
      b.onclick = () => {
        const act = b.dataset.act;
        menu.hidden = true;
        if (act === 'cover') backToCover();
        if (act === 'seed') {
          if (window.LuminaSyncState && window.LuminaSyncState.enabled
            && !confirm('载入示例会把 12 条示例记录同步到云端，继续？')) return;
          seed();
        }
        if (act === 'import') doImport();
        if (act === 'export') doExport();
        if (act === 'clear') doClear();
        if (act === 'motion') toggleMotion(b);
        if (act === 'status') openStatus();
      };
    });

    const importFile = $('#importFile');
    if (importFile) importFile.onchange = readImport;

    /* 回看子页签 */
    $$('[data-review]').forEach((b) => {
      b.onclick = () => setReviewTab(b.dataset.review);
    });
    $$('[data-period]').forEach((b) => {
      b.onclick = () => {
        S.rp = b.dataset.period;
        renderReview();
      };
    });

    /* 档案子页签 */
    $$('[data-archive]').forEach((b) => {
      b.onclick = () => setArchiveTab(b.dataset.archive);
    });
    $$('[data-ap]').forEach((b) => {
      b.onclick = () => {
        S.ap = b.dataset.ap;
        $$('[data-ap]').forEach((x) => x.classList.toggle('active', x === b));
        renderAnalysis();
      };
    });
    $$('[data-arc]').forEach((b) => {
      b.onclick = () => setArc(b.dataset.arc);
    });
    $$('.fchip').forEach((f) => {
      f.onclick = () => {
        $$('.fchip').forEach((x) => x.classList.remove('active'));
        f.classList.add('active');
        S.filter = f.dataset.f;
        S.day = null;
        renderRecordsPane();
      };
    });

    /* 日历 */
    const calPrev = $('#calPrev'), calNext = $('#calNext'), calToday = $('#calToday');
    if (calPrev) calPrev.onclick = () => shiftMonth(-1);
    if (calNext) calNext.onclick = () => shiftMonth(1);
    if (calToday) calToday.onclick = () => {
      const n = new Date();
      S.cal = { y: n.getFullYear(), m: n.getMonth() };
      S.day = null;
      renderCalendar(filtered(true));
      renderRecordsPane();
    };

    /* 记录弹层 */
    $('#closeRecord').onclick = closeRecordOverlay;
    $('#closeText').onclick = closeRecordOverlay;
    $('#record').onclick = (e) => { if (e.target.id === 'record') closeRecordOverlay(); };

    $('#file').onchange = (e) => onFile(e.target.files[0]);

    $('#photoAnswerGo').onclick = () => {
      const a = $('#photoAnswer').value.trim();
      if (!a) return toast('想答就写一句，或者直接写');
      answerPhotoQ(a);
    };
    $('#photoSkipQ').onclick = () => answerPhotoQ('');
    $('#extraGo').onclick = () => generatePhotoCands();

    $('#tSend').onclick = () => { textCatch(); };
    $('#tSendAnswer').onclick = () => { textContinue(); };
    $('#tIntegrate').onclick = () => { textIntegrate(); };
    $('#tBackWrite').onclick = () => {
      $('#tFinalPane').hidden = true;
      if (T.chat.length) { $('#tTalkPane').hidden = false; $('#tAnswer').focus(); }
      else { $('#tWritePane').hidden = false; $('#tNote').focus(); }
    };
    $('#tSave').onclick = saveTextRecord;
    $('#tAnswer').addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); textContinue(); }
    });
    $('#moodClear').onclick = clearTextMood;
    $$('.tCard').forEach((c) => {
      c.onclick = () => setTextPick(c.dataset.pick);
      c.onkeydown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTextPick(c.dataset.pick); }
      };
    });
    const tLine = $('#tLine');
    tLine.addEventListener('pointerdown', (e) => {
      tLine.setPointerCapture(e.pointerId);
      textLineFromEvent(e);
      tLine.onpointermove = textLineFromEvent;
    });
    tLine.addEventListener('pointerup', () => { tLine.onpointermove = null; });
    tLine.addEventListener('keydown', (e) => {
      const t = T.t == null ? 0.5 : T.t;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); setTextMood(t - 0.05); }
      else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); setTextMood(t + 0.05); }
      else if (e.key === 'Home') { e.preventDefault(); setTextMood(0); }
      else if (e.key === 'End') { e.preventDefault(); setTextMood(1); }
    });

    const drop = $('#drop');
    ['dragenter', 'dragover'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add('over'); }));
    ['dragleave', 'drop'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove('over'); }));
    drop.addEventListener('drop', (e) => { const f = e.dataTransfer.files && e.dataTransfer.files[0]; if (f) onFile(f); });

    $$('[data-shape]').forEach((c) => {
      c.onclick = () => {
        $$('[data-shape]').forEach((x) => x.classList.remove('active'));
        c.classList.add('active');
        S.shape = c.dataset.shape;
        $('#ring').hidden = S.shape !== 'ring';
        $('#line').hidden = S.shape !== 'line';
        $('#shapeTip').textContent = S.shape === 'ring' ? '越靠外，心情越强' : '直线只分好坏；怒和乐，用圆环';
        if (!S.mood) $('#moodSub').textContent = S.shape === 'ring' ? '在圆环上点一下，或者拖一下' : '在直线上点一下';
        if (S.mood) setMood(S.mood.phi, S.mood.r);
      };
    });

    const ring = $('#ring');
    ring.addEventListener('pointerdown', (e) => {
      ring.setPointerCapture(e.pointerId);
      ringPointer(e);
      ring.onpointermove = ringPointer;
    });
    ring.addEventListener('pointerup', () => { ring.onpointermove = null; });

    const line = $('#line');
    line.addEventListener('pointerdown', (e) => {
      line.setPointerCapture(e.pointerId);
      linePointer(e);
      line.onpointermove = linePointer;
    });
    line.addEventListener('pointerup', () => { line.onpointermove = null; });

    /* 心情控件：键盘也能选（原先是纯指针，键盘用户走不过这一步） */
    const ringEl = $('#ring');
    if (ringEl) {
      ringEl.addEventListener('keydown', (e) => {
        const m = S.mood || { phi: 45, r: 0.35 };
        let phi = m.phi, r = m.r;
        if (e.key === 'ArrowLeft') { e.preventDefault(); phi = (phi + 15) % 360; }
        else if (e.key === 'ArrowRight') { e.preventDefault(); phi = (phi + 345) % 360; }
        else if (e.key === 'ArrowUp') { e.preventDefault(); r = Math.min(1, r + 0.1); }
        else if (e.key === 'ArrowDown') { e.preventDefault(); r = Math.max(0, r - 0.1); }
        else if (e.key === 'Home') { e.preventDefault(); phi = 45; r = 0; }
        else return;
        const h = $('#ringHandle');
        if (h) h.style.display = '';
        setMood(phi, r);
      });
    }
    const lineEl = $('#line');
    if (lineEl) {
      lineEl.addEventListener('keydown', (e) => {
        let t = lineT();
        if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); t -= 0.06; }
        else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); t += 0.06; }
        else if (e.key === 'Home') { e.preventDefault(); t = 0; }
        else if (e.key === 'End') { e.preventDefault(); t = 1; }
        else return;
        t = Math.max(0, Math.min(1, t));
        const h = $('#lineHandle');
        if (h) h.style.display = '';
        setMood(t < 0.5 ? 225 : 45, Math.abs(t - 0.5) * 2 * 0.9);
      });
    }

    $('#btnNext').onclick = () => {
      if (S.step === 1) {
        if (S.full) { goStep(2); } else { openTextSheet(); }
        return;
      }
      if (S.step === 2) { startObserve(); return; }
      saveRecord();
    };
    $('#btnBack').onclick = () => {
      if (S.step === 1) { closeRecordOverlay(); return; }
      goStep(S.step - 1);
    };

    /* 聊着找 */
    $('#ask').onclick = () => {
      const q = $('#q').value.trim();
      if (!q) return toast('先写一句想问的');
      recallSend(q);
    };
    $('#q').addEventListener('keydown', (e) => { if (e.key === 'Enter') $('#ask').click(); });

    /* 详情 / 状态 */
    $('#closeDetail').onclick = () => { $('#detail').hidden = true; };
    $('#detail').onclick = (e) => { if (e.target.id === 'detail') $('#detail').hidden = true; };
    $('#closeStatus').onclick = closeStatus;
    $('#statusClose2').onclick = closeStatus;
    $('#statusSheet').onclick = (e) => { if (e.target.id === 'statusSheet') closeStatus(); };

    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      /* 只关最上面那一层，并把焦点还回去 */
      if (closeRecordOverlay()) return;
      if (!$('#detail').hidden) { $('#detail').hidden = true; return; }
      if (!$('#statusSheet').hidden) { closeStatus(); return; }
      if (!$('#menu').hidden) $('#menu').hidden = true;
    });

    /* 弹层里 Tab 不跑到背景：把焦点圈在当前打开的那一层 */
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;
      const open = ['#record', '#detail', '#statusSheet', '#cloudSheet'].map((s) => $(s)).filter((el) => el && !el.hidden).pop();
      if (!open) return;
      const box = open.querySelector('[role="dialog"]') || open;
      const items = Array.from(box.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), summary, [tabindex]:not([tabindex="-1"])'
      )).filter((el) => el.offsetParent !== null || el === document.activeElement);
      if (!items.length) return;
      const first = items[0], last = items[items.length - 1];
      if (!box.contains(document.activeElement)) { e.preventDefault(); first.focus(); return; }
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  /* ================= 启动 ================= */
  buildRing();
  const lh = document.createElement('div');
  lh.className = 'handle';
  lh.id = 'lineHandle';
  lh.style.display = 'none';
  $('#line').appendChild(lh);
  bind();
  $('#moodFace').innerHTML = faceSVG(0, 0, 70, '#e8e2d6');

  const introVideoEl = $('#introVideo');
  if (introVideoEl) {
    introVideoEl.addEventListener('ended', arriveCover);
    introVideoEl.addEventListener('timeupdate', function () {
      if (!coverArrived && introVideoEl.duration && introVideoEl.currentTime >= introVideoEl.duration - 0.7) arriveCover();
    });
    introVideoEl.addEventListener('error', coverFallback);
    /* 开了「减少动态效果」就不播这段 10 秒的开场，直接落到封面 */
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      coverFallback();
    } else {
      const p = introVideoEl.play();
      if (p && p.catch) p.catch(coverFallback);
      setTimeout(function () { if (!coverArrived && introVideoEl.readyState < 2) coverFallback(); }, 5000);
    }
  } else {
    coverFallback();
  }

  renderHome();
  renderReview();
  renderAnalysis();
  setArc('timeline');
  renderTimeline();
  renderCalendar(filtered(true));
  renderSamples();
  renderDates();
  setReviewTab('time');
  $$('.screen').forEach((s) => { s.hidden = s.id !== 'screen-cover'; });
  document.body.dataset.screen = 'cover';

  /* 框架接入：供云同步桥接层刷新界面 */
  window.LuminaUI = {
    refresh() {
      renderHome();
      renderReview();
      renderAnalysis();
      renderRecordsPane();
      renderTimeline();
      renderCalendar(filtered(true));
      renderDates();
    },
    toast,
    openCloud() {
      const status = $('#statusSheet');
      if (status) status.hidden = true;
      if (window.LuminaCloud) window.LuminaCloud.open();
    },
  };
})();

