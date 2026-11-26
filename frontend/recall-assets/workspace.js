/**
* @vue/shared v3.5.24
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
// @__NO_SIDE_EFFECTS__
function Ts(e) {
  const t = /* @__PURE__ */ Object.create(null);
  for (const s of e.split(",")) t[s] = 1;
  return (s) => s in t;
}
const Y = {}, it = [], Cs = () => {
}, Sn = () => !1, Jt = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && // uppercase letter
(e.charCodeAt(2) > 122 || e.charCodeAt(2) < 97), Es = (e) => e.startsWith("onUpdate:"), Le = Object.assign, yr = (e, t) => {
  const s = e.indexOf(t);
  s > -1 && e.splice(s, 1);
}, xr = Object.prototype.hasOwnProperty, U = (e, t) => xr.call(e, t), L = Array.isArray, ot = (e) => Gt(e) === "[object Map]", Tn = (e) => Gt(e) === "[object Set]", q = (e) => typeof e == "function", se = (e) => typeof e == "string", We = (e) => typeof e == "symbol", z = (e) => e !== null && typeof e == "object", Cn = (e) => (z(e) || q(e)) && q(e.then) && q(e.catch), En = Object.prototype.toString, Gt = (e) => En.call(e), wr = (e) => Gt(e).slice(8, -1), In = (e) => Gt(e) === "[object Object]", Is = (e) => se(e) && e !== "NaN" && e[0] !== "-" && "" + parseInt(e, 10) === e, mt = /* @__PURE__ */ Ts(
  // the leading comma is intentional so empty string "" is also included
  ",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"
), zt = (e) => {
  const t = /* @__PURE__ */ Object.create(null);
  return (s) => t[s] || (t[s] = e(s));
}, Sr = /-\w/g, Ue = zt(
  (e) => e.replace(Sr, (t) => t.slice(1).toUpperCase())
), Tr = /\B([A-Z])/g, Xe = zt(
  (e) => e.replace(Tr, "-$1").toLowerCase()
), Mn = zt((e) => e.charAt(0).toUpperCase() + e.slice(1)), ns = zt(
  (e) => e ? `on${Mn(e)}` : ""
), lt = (e, t) => !Object.is(e, t), jt = (e, ...t) => {
  for (let s = 0; s < e.length; s++)
    e[s](...t);
}, An = (e, t, s, n = !1) => {
  Object.defineProperty(e, t, {
    configurable: !0,
    enumerable: !1,
    writable: n,
    value: s
  });
}, Ms = (e) => {
  const t = parseFloat(e);
  return isNaN(t) ? e : t;
};
let Ws;
const Qt = () => Ws || (Ws = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : {});
function As(e) {
  if (L(e)) {
    const t = {};
    for (let s = 0; s < e.length; s++) {
      const n = e[s], r = se(n) ? Mr(n) : As(n);
      if (r)
        for (const i in r)
          t[i] = r[i];
    }
    return t;
  } else if (se(e) || z(e))
    return e;
}
const Cr = /;(?![^(]*\))/g, Er = /:([^]+)/, Ir = /\/\*[^]*?\*\//g;
function Mr(e) {
  const t = {};
  return e.replace(Ir, "").split(Cr).forEach((s) => {
    if (s) {
      const n = s.split(Er);
      n.length > 1 && (t[n[0].trim()] = n[1].trim());
    }
  }), t;
}
function St(e) {
  let t = "";
  if (se(e))
    t = e;
  else if (L(e))
    for (let s = 0; s < e.length; s++) {
      const n = St(e[s]);
      n && (t += n + " ");
    }
  else if (z(e))
    for (const s in e)
      e[s] && (t += s + " ");
  return t.trim();
}
const Ar = "itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly", Or = /* @__PURE__ */ Ts(Ar);
function On(e) {
  return !!e || e === "";
}
const Rn = (e) => !!(e && e.__v_isRef === !0), j = (e) => se(e) ? e : e == null ? "" : L(e) || z(e) && (e.toString === En || !q(e.toString)) ? Rn(e) ? j(e.value) : JSON.stringify(e, Pn, 2) : String(e), Pn = (e, t) => Rn(t) ? Pn(e, t.value) : ot(t) ? {
  [`Map(${t.size})`]: [...t.entries()].reduce(
    (s, [n, r], i) => (s[rs(n, i) + " =>"] = r, s),
    {}
  )
} : Tn(t) ? {
  [`Set(${t.size})`]: [...t.values()].map((s) => rs(s))
} : We(t) ? rs(t) : z(t) && !L(t) && !In(t) ? String(t) : t, rs = (e, t = "") => {
  var s;
  return (
    // Symbol.description in es2019+ so we need to cast here to pass
    // the lib: es2016 check
    We(e) ? `Symbol(${(s = e.description) != null ? s : t})` : e
  );
};
/**
* @vue/reactivity v3.5.24
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
let me;
class Rr {
  constructor(t = !1) {
    this.detached = t, this._active = !0, this._on = 0, this.effects = [], this.cleanups = [], this._isPaused = !1, this.parent = me, !t && me && (this.index = (me.scopes || (me.scopes = [])).push(
      this
    ) - 1);
  }
  get active() {
    return this._active;
  }
  pause() {
    if (this._active) {
      this._isPaused = !0;
      let t, s;
      if (this.scopes)
        for (t = 0, s = this.scopes.length; t < s; t++)
          this.scopes[t].pause();
      for (t = 0, s = this.effects.length; t < s; t++)
        this.effects[t].pause();
    }
  }
  /**
   * Resumes the effect scope, including all child scopes and effects.
   */
  resume() {
    if (this._active && this._isPaused) {
      this._isPaused = !1;
      let t, s;
      if (this.scopes)
        for (t = 0, s = this.scopes.length; t < s; t++)
          this.scopes[t].resume();
      for (t = 0, s = this.effects.length; t < s; t++)
        this.effects[t].resume();
    }
  }
  run(t) {
    if (this._active) {
      const s = me;
      try {
        return me = this, t();
      } finally {
        me = s;
      }
    }
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  on() {
    ++this._on === 1 && (this.prevScope = me, me = this);
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  off() {
    this._on > 0 && --this._on === 0 && (me = this.prevScope, this.prevScope = void 0);
  }
  stop(t) {
    if (this._active) {
      this._active = !1;
      let s, n;
      for (s = 0, n = this.effects.length; s < n; s++)
        this.effects[s].stop();
      for (this.effects.length = 0, s = 0, n = this.cleanups.length; s < n; s++)
        this.cleanups[s]();
      if (this.cleanups.length = 0, this.scopes) {
        for (s = 0, n = this.scopes.length; s < n; s++)
          this.scopes[s].stop(!0);
        this.scopes.length = 0;
      }
      if (!this.detached && this.parent && !t) {
        const r = this.parent.scopes.pop();
        r && r !== this && (this.parent.scopes[this.index] = r, r.index = this.index);
      }
      this.parent = void 0;
    }
  }
}
let W;
const is = /* @__PURE__ */ new WeakSet();
class Pr {
  constructor(t) {
    this.fn = t, this.deps = void 0, this.depsTail = void 0, this.flags = 5, this.next = void 0, this.cleanup = void 0, this.scheduler = void 0, me && me.active && me.effects.push(this);
  }
  pause() {
    this.flags |= 64;
  }
  resume() {
    this.flags & 64 && (this.flags &= -65, is.has(this) && (is.delete(this), this.trigger()));
  }
  /**
   * @internal
   */
  notify() {
    this.flags & 2 && !(this.flags & 32) || this.flags & 8 || $n(this);
  }
  run() {
    if (!(this.flags & 1))
      return this.fn();
    this.flags |= 2, qs(this), Dn(this);
    const t = W, s = we;
    W = this, we = !0;
    try {
      return this.fn();
    } finally {
      Nn(this), W = t, we = s, this.flags &= -3;
    }
  }
  stop() {
    if (this.flags & 1) {
      for (let t = this.deps; t; t = t.nextDep)
        Ps(t);
      this.deps = this.depsTail = void 0, qs(this), this.onStop && this.onStop(), this.flags &= -2;
    }
  }
  trigger() {
    this.flags & 64 ? is.add(this) : this.scheduler ? this.scheduler() : this.runIfDirty();
  }
  /**
   * @internal
   */
  runIfDirty() {
    gs(this) && this.run();
  }
  get dirty() {
    return gs(this);
  }
}
let Fn = 0, _t, vt;
function $n(e, t = !1) {
  if (e.flags |= 8, t) {
    e.next = vt, vt = e;
    return;
  }
  e.next = _t, _t = e;
}
function Os() {
  Fn++;
}
function Rs() {
  if (--Fn > 0)
    return;
  if (vt) {
    let t = vt;
    for (vt = void 0; t; ) {
      const s = t.next;
      t.next = void 0, t.flags &= -9, t = s;
    }
  }
  let e;
  for (; _t; ) {
    let t = _t;
    for (_t = void 0; t; ) {
      const s = t.next;
      if (t.next = void 0, t.flags &= -9, t.flags & 1)
        try {
          t.trigger();
        } catch (n) {
          e || (e = n);
        }
      t = s;
    }
  }
  if (e) throw e;
}
function Dn(e) {
  for (let t = e.deps; t; t = t.nextDep)
    t.version = -1, t.prevActiveLink = t.dep.activeLink, t.dep.activeLink = t;
}
function Nn(e) {
  let t, s = e.depsTail, n = s;
  for (; n; ) {
    const r = n.prevDep;
    n.version === -1 ? (n === s && (s = r), Ps(n), Fr(n)) : t = n, n.dep.activeLink = n.prevActiveLink, n.prevActiveLink = void 0, n = r;
  }
  e.deps = t, e.depsTail = s;
}
function gs(e) {
  for (let t = e.deps; t; t = t.nextDep)
    if (t.dep.version !== t.version || t.dep.computed && (Ln(t.dep.computed) || t.dep.version !== t.version))
      return !0;
  return !!e._dirty;
}
function Ln(e) {
  if (e.flags & 4 && !(e.flags & 16) || (e.flags &= -17, e.globalVersion === Tt) || (e.globalVersion = Tt, !e.isSSR && e.flags & 128 && (!e.deps && !e._dirty || !gs(e))))
    return;
  e.flags |= 2;
  const t = e.dep, s = W, n = we;
  W = e, we = !0;
  try {
    Dn(e);
    const r = e.fn(e._value);
    (t.version === 0 || lt(r, e._value)) && (e.flags |= 128, e._value = r, t.version++);
  } catch (r) {
    throw t.version++, r;
  } finally {
    W = s, we = n, Nn(e), e.flags &= -3;
  }
}
function Ps(e, t = !1) {
  const { dep: s, prevSub: n, nextSub: r } = e;
  if (n && (n.nextSub = r, e.prevSub = void 0), r && (r.prevSub = n, e.nextSub = void 0), s.subs === e && (s.subs = n, !n && s.computed)) {
    s.computed.flags &= -5;
    for (let i = s.computed.deps; i; i = i.nextDep)
      Ps(i, !0);
  }
  !t && !--s.sc && s.map && s.map.delete(s.key);
}
function Fr(e) {
  const { prevDep: t, nextDep: s } = e;
  t && (t.nextDep = s, e.prevDep = void 0), s && (s.prevDep = t, e.nextDep = void 0);
}
let we = !0;
const jn = [];
function ut() {
  jn.push(we), we = !1;
}
function ft() {
  const e = jn.pop();
  we = e === void 0 ? !0 : e;
}
function qs(e) {
  const { cleanup: t } = e;
  if (e.cleanup = void 0, t) {
    const s = W;
    W = void 0;
    try {
      t();
    } finally {
      W = s;
    }
  }
}
let Tt = 0;
class $r {
  constructor(t, s) {
    this.sub = t, this.dep = s, this.version = s.version, this.nextDep = this.prevDep = this.nextSub = this.prevSub = this.prevActiveLink = void 0;
  }
}
class Fs {
  // TODO isolatedDeclarations "__v_skip"
  constructor(t) {
    this.computed = t, this.version = 0, this.activeLink = void 0, this.subs = void 0, this.map = void 0, this.key = void 0, this.sc = 0, this.__v_skip = !0;
  }
  track(t) {
    if (!W || !we || W === this.computed)
      return;
    let s = this.activeLink;
    if (s === void 0 || s.sub !== W)
      s = this.activeLink = new $r(W, this), W.deps ? (s.prevDep = W.depsTail, W.depsTail.nextDep = s, W.depsTail = s) : W.deps = W.depsTail = s, Hn(s);
    else if (s.version === -1 && (s.version = this.version, s.nextDep)) {
      const n = s.nextDep;
      n.prevDep = s.prevDep, s.prevDep && (s.prevDep.nextDep = n), s.prevDep = W.depsTail, s.nextDep = void 0, W.depsTail.nextDep = s, W.depsTail = s, W.deps === s && (W.deps = n);
    }
    return s;
  }
  trigger(t) {
    this.version++, Tt++, this.notify(t);
  }
  notify(t) {
    Os();
    try {
      for (let s = this.subs; s; s = s.prevSub)
        s.sub.notify() && s.sub.dep.notify();
    } finally {
      Rs();
    }
  }
}
function Hn(e) {
  if (e.dep.sc++, e.sub.flags & 4) {
    const t = e.dep.computed;
    if (t && !e.dep.subs) {
      t.flags |= 20;
      for (let n = t.deps; n; n = n.nextDep)
        Hn(n);
    }
    const s = e.dep.subs;
    s !== e && (e.prevSub = s, s && (s.nextSub = e)), e.dep.subs = e;
  }
}
const ms = /* @__PURE__ */ new WeakMap(), ze = Symbol(
  ""
), _s = Symbol(
  ""
), Ct = Symbol(
  ""
);
function oe(e, t, s) {
  if (we && W) {
    let n = ms.get(e);
    n || ms.set(e, n = /* @__PURE__ */ new Map());
    let r = n.get(s);
    r || (n.set(s, r = new Fs()), r.map = n, r.key = s), r.track();
  }
}
function $e(e, t, s, n, r, i) {
  const o = ms.get(e);
  if (!o) {
    Tt++;
    return;
  }
  const c = (f) => {
    f && f.trigger();
  };
  if (Os(), t === "clear")
    o.forEach(c);
  else {
    const f = L(e), d = f && Is(s);
    if (f && s === "length") {
      const a = Number(n);
      o.forEach((g, S) => {
        (S === "length" || S === Ct || !We(S) && S >= a) && c(g);
      });
    } else
      switch ((s !== void 0 || o.has(void 0)) && c(o.get(s)), d && c(o.get(Ct)), t) {
        case "add":
          f ? d && c(o.get("length")) : (c(o.get(ze)), ot(e) && c(o.get(_s)));
          break;
        case "delete":
          f || (c(o.get(ze)), ot(e) && c(o.get(_s)));
          break;
        case "set":
          ot(e) && c(o.get(ze));
          break;
      }
  }
  Rs();
}
function tt(e) {
  const t = V(e);
  return t === e ? t : (oe(t, "iterate", Ct), Ne(e) ? t : t.map(re));
}
function Xt(e) {
  return oe(e = V(e), "iterate", Ct), e;
}
const Dr = {
  __proto__: null,
  [Symbol.iterator]() {
    return os(this, Symbol.iterator, re);
  },
  concat(...e) {
    return tt(this).concat(
      ...e.map((t) => L(t) ? tt(t) : t)
    );
  },
  entries() {
    return os(this, "entries", (e) => (e[1] = re(e[1]), e));
  },
  every(e, t) {
    return Re(this, "every", e, t, void 0, arguments);
  },
  filter(e, t) {
    return Re(this, "filter", e, t, (s) => s.map(re), arguments);
  },
  find(e, t) {
    return Re(this, "find", e, t, re, arguments);
  },
  findIndex(e, t) {
    return Re(this, "findIndex", e, t, void 0, arguments);
  },
  findLast(e, t) {
    return Re(this, "findLast", e, t, re, arguments);
  },
  findLastIndex(e, t) {
    return Re(this, "findLastIndex", e, t, void 0, arguments);
  },
  // flat, flatMap could benefit from ARRAY_ITERATE but are not straight-forward to implement
  forEach(e, t) {
    return Re(this, "forEach", e, t, void 0, arguments);
  },
  includes(...e) {
    return ls(this, "includes", e);
  },
  indexOf(...e) {
    return ls(this, "indexOf", e);
  },
  join(e) {
    return tt(this).join(e);
  },
  // keys() iterator only reads `length`, no optimization required
  lastIndexOf(...e) {
    return ls(this, "lastIndexOf", e);
  },
  map(e, t) {
    return Re(this, "map", e, t, void 0, arguments);
  },
  pop() {
    return pt(this, "pop");
  },
  push(...e) {
    return pt(this, "push", e);
  },
  reduce(e, ...t) {
    return Ys(this, "reduce", e, t);
  },
  reduceRight(e, ...t) {
    return Ys(this, "reduceRight", e, t);
  },
  shift() {
    return pt(this, "shift");
  },
  // slice could use ARRAY_ITERATE but also seems to beg for range tracking
  some(e, t) {
    return Re(this, "some", e, t, void 0, arguments);
  },
  splice(...e) {
    return pt(this, "splice", e);
  },
  toReversed() {
    return tt(this).toReversed();
  },
  toSorted(e) {
    return tt(this).toSorted(e);
  },
  toSpliced(...e) {
    return tt(this).toSpliced(...e);
  },
  unshift(...e) {
    return pt(this, "unshift", e);
  },
  values() {
    return os(this, "values", re);
  }
};
function os(e, t, s) {
  const n = Xt(e), r = n[t]();
  return n !== e && !Ne(e) && (r._next = r.next, r.next = () => {
    const i = r._next();
    return i.done || (i.value = s(i.value)), i;
  }), r;
}
const Nr = Array.prototype;
function Re(e, t, s, n, r, i) {
  const o = Xt(e), c = o !== e && !Ne(e), f = o[t];
  if (f !== Nr[t]) {
    const g = f.apply(e, i);
    return c ? re(g) : g;
  }
  let d = s;
  o !== e && (c ? d = function(g, S) {
    return s.call(this, re(g), S, e);
  } : s.length > 2 && (d = function(g, S) {
    return s.call(this, g, S, e);
  }));
  const a = f.call(o, d, n);
  return c && r ? r(a) : a;
}
function Ys(e, t, s, n) {
  const r = Xt(e);
  let i = s;
  return r !== e && (Ne(e) ? s.length > 3 && (i = function(o, c, f) {
    return s.call(this, o, c, f, e);
  }) : i = function(o, c, f) {
    return s.call(this, o, re(c), f, e);
  }), r[t](i, ...n);
}
function ls(e, t, s) {
  const n = V(e);
  oe(n, "iterate", Ct);
  const r = n[t](...s);
  return (r === -1 || r === !1) && Ls(s[0]) ? (s[0] = V(s[0]), n[t](...s)) : r;
}
function pt(e, t, s = []) {
  ut(), Os();
  const n = V(e)[t].apply(e, s);
  return Rs(), ft(), n;
}
const Lr = /* @__PURE__ */ Ts("__proto__,__v_isRef,__isVue"), Vn = new Set(
  /* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((e) => e !== "arguments" && e !== "caller").map((e) => Symbol[e]).filter(We)
);
function jr(e) {
  We(e) || (e = String(e));
  const t = V(this);
  return oe(t, "has", e), t.hasOwnProperty(e);
}
class Kn {
  constructor(t = !1, s = !1) {
    this._isReadonly = t, this._isShallow = s;
  }
  get(t, s, n) {
    if (s === "__v_skip") return t.__v_skip;
    const r = this._isReadonly, i = this._isShallow;
    if (s === "__v_isReactive")
      return !r;
    if (s === "__v_isReadonly")
      return r;
    if (s === "__v_isShallow")
      return i;
    if (s === "__v_raw")
      return n === (r ? i ? Jr : Wn : i ? kn : Bn).get(t) || // receiver is not the reactive proxy, but has the same prototype
      // this means the receiver is a user proxy of the reactive proxy
      Object.getPrototypeOf(t) === Object.getPrototypeOf(n) ? t : void 0;
    const o = L(t);
    if (!r) {
      let f;
      if (o && (f = Dr[s]))
        return f;
      if (s === "hasOwnProperty")
        return jr;
    }
    const c = Reflect.get(
      t,
      s,
      // if this is a proxy wrapping a ref, return methods using the raw ref
      // as receiver so that we don't have to call `toRaw` on the ref in all
      // its class methods
      ve(t) ? t : n
    );
    if ((We(s) ? Vn.has(s) : Lr(s)) || (r || oe(t, "get", s), i))
      return c;
    if (ve(c)) {
      const f = o && Is(s) ? c : c.value;
      return r && z(f) ? bs(f) : f;
    }
    return z(c) ? r ? bs(c) : qn(c) : c;
  }
}
class Un extends Kn {
  constructor(t = !1) {
    super(!1, t);
  }
  set(t, s, n, r) {
    let i = t[s];
    if (!this._isShallow) {
      const f = Be(i);
      if (!Ne(n) && !Be(n) && (i = V(i), n = V(n)), !L(t) && ve(i) && !ve(n))
        return f || (i.value = n), !0;
    }
    const o = L(t) && Is(s) ? Number(s) < t.length : U(t, s), c = Reflect.set(
      t,
      s,
      n,
      ve(t) ? t : r
    );
    return t === V(r) && (o ? lt(n, i) && $e(t, "set", s, n) : $e(t, "add", s, n)), c;
  }
  deleteProperty(t, s) {
    const n = U(t, s);
    t[s];
    const r = Reflect.deleteProperty(t, s);
    return r && n && $e(t, "delete", s, void 0), r;
  }
  has(t, s) {
    const n = Reflect.has(t, s);
    return (!We(s) || !Vn.has(s)) && oe(t, "has", s), n;
  }
  ownKeys(t) {
    return oe(
      t,
      "iterate",
      L(t) ? "length" : ze
    ), Reflect.ownKeys(t);
  }
}
class Hr extends Kn {
  constructor(t = !1) {
    super(!0, t);
  }
  set(t, s) {
    return !0;
  }
  deleteProperty(t, s) {
    return !0;
  }
}
const Vr = /* @__PURE__ */ new Un(), Kr = /* @__PURE__ */ new Hr(), Ur = /* @__PURE__ */ new Un(!0);
const vs = (e) => e, Dt = (e) => Reflect.getPrototypeOf(e);
function Br(e, t, s) {
  return function(...n) {
    const r = this.__v_raw, i = V(r), o = ot(i), c = e === "entries" || e === Symbol.iterator && o, f = e === "keys" && o, d = r[e](...n), a = s ? vs : t ? Ut : re;
    return !t && oe(
      i,
      "iterate",
      f ? _s : ze
    ), {
      // iterator protocol
      next() {
        const { value: g, done: S } = d.next();
        return S ? { value: g, done: S } : {
          value: c ? [a(g[0]), a(g[1])] : a(g),
          done: S
        };
      },
      // iterable protocol
      [Symbol.iterator]() {
        return this;
      }
    };
  };
}
function Nt(e) {
  return function(...t) {
    return e === "delete" ? !1 : e === "clear" ? void 0 : this;
  };
}
function kr(e, t) {
  const s = {
    get(r) {
      const i = this.__v_raw, o = V(i), c = V(r);
      e || (lt(r, c) && oe(o, "get", r), oe(o, "get", c));
      const { has: f } = Dt(o), d = t ? vs : e ? Ut : re;
      if (f.call(o, r))
        return d(i.get(r));
      if (f.call(o, c))
        return d(i.get(c));
      i !== o && i.get(r);
    },
    get size() {
      const r = this.__v_raw;
      return !e && oe(V(r), "iterate", ze), r.size;
    },
    has(r) {
      const i = this.__v_raw, o = V(i), c = V(r);
      return e || (lt(r, c) && oe(o, "has", r), oe(o, "has", c)), r === c ? i.has(r) : i.has(r) || i.has(c);
    },
    forEach(r, i) {
      const o = this, c = o.__v_raw, f = V(c), d = t ? vs : e ? Ut : re;
      return !e && oe(f, "iterate", ze), c.forEach((a, g) => r.call(i, d(a), d(g), o));
    }
  };
  return Le(
    s,
    e ? {
      add: Nt("add"),
      set: Nt("set"),
      delete: Nt("delete"),
      clear: Nt("clear")
    } : {
      add(r) {
        !t && !Ne(r) && !Be(r) && (r = V(r));
        const i = V(this);
        return Dt(i).has.call(i, r) || (i.add(r), $e(i, "add", r, r)), this;
      },
      set(r, i) {
        !t && !Ne(i) && !Be(i) && (i = V(i));
        const o = V(this), { has: c, get: f } = Dt(o);
        let d = c.call(o, r);
        d || (r = V(r), d = c.call(o, r));
        const a = f.call(o, r);
        return o.set(r, i), d ? lt(i, a) && $e(o, "set", r, i) : $e(o, "add", r, i), this;
      },
      delete(r) {
        const i = V(this), { has: o, get: c } = Dt(i);
        let f = o.call(i, r);
        f || (r = V(r), f = o.call(i, r)), c && c.call(i, r);
        const d = i.delete(r);
        return f && $e(i, "delete", r, void 0), d;
      },
      clear() {
        const r = V(this), i = r.size !== 0, o = r.clear();
        return i && $e(
          r,
          "clear",
          void 0,
          void 0
        ), o;
      }
    }
  ), [
    "keys",
    "values",
    "entries",
    Symbol.iterator
  ].forEach((r) => {
    s[r] = Br(r, e, t);
  }), s;
}
function $s(e, t) {
  const s = kr(e, t);
  return (n, r, i) => r === "__v_isReactive" ? !e : r === "__v_isReadonly" ? e : r === "__v_raw" ? n : Reflect.get(
    U(s, r) && r in n ? s : n,
    r,
    i
  );
}
const Wr = {
  get: /* @__PURE__ */ $s(!1, !1)
}, qr = {
  get: /* @__PURE__ */ $s(!1, !0)
}, Yr = {
  get: /* @__PURE__ */ $s(!0, !1)
};
const Bn = /* @__PURE__ */ new WeakMap(), kn = /* @__PURE__ */ new WeakMap(), Wn = /* @__PURE__ */ new WeakMap(), Jr = /* @__PURE__ */ new WeakMap();
function Gr(e) {
  switch (e) {
    case "Object":
    case "Array":
      return 1;
    case "Map":
    case "Set":
    case "WeakMap":
    case "WeakSet":
      return 2;
    default:
      return 0;
  }
}
function zr(e) {
  return e.__v_skip || !Object.isExtensible(e) ? 0 : Gr(wr(e));
}
function qn(e) {
  return Be(e) ? e : Ds(
    e,
    !1,
    Vr,
    Wr,
    Bn
  );
}
function Qr(e) {
  return Ds(
    e,
    !1,
    Ur,
    qr,
    kn
  );
}
function bs(e) {
  return Ds(
    e,
    !0,
    Kr,
    Yr,
    Wn
  );
}
function Ds(e, t, s, n, r) {
  if (!z(e) || e.__v_raw && !(t && e.__v_isReactive))
    return e;
  const i = zr(e);
  if (i === 0)
    return e;
  const o = r.get(e);
  if (o)
    return o;
  const c = new Proxy(
    e,
    i === 2 ? n : s
  );
  return r.set(e, c), c;
}
function Ns(e) {
  return Be(e) ? Ns(e.__v_raw) : !!(e && e.__v_isReactive);
}
function Be(e) {
  return !!(e && e.__v_isReadonly);
}
function Ne(e) {
  return !!(e && e.__v_isShallow);
}
function Ls(e) {
  return e ? !!e.__v_raw : !1;
}
function V(e) {
  const t = e && e.__v_raw;
  return t ? V(t) : e;
}
function Xr(e) {
  return !U(e, "__v_skip") && Object.isExtensible(e) && An(e, "__v_skip", !0), e;
}
const re = (e) => z(e) ? qn(e) : e, Ut = (e) => z(e) ? bs(e) : e;
function ve(e) {
  return e ? e.__v_isRef === !0 : !1;
}
function he(e) {
  return Zr(e, !1);
}
function Zr(e, t) {
  return ve(e) ? e : new ei(e, t);
}
class ei {
  constructor(t, s) {
    this.dep = new Fs(), this.__v_isRef = !0, this.__v_isShallow = !1, this._rawValue = s ? t : V(t), this._value = s ? t : re(t), this.__v_isShallow = s;
  }
  get value() {
    return this.dep.track(), this._value;
  }
  set value(t) {
    const s = this._rawValue, n = this.__v_isShallow || Ne(t) || Be(t);
    t = n ? t : V(t), lt(t, s) && (this._rawValue = t, this._value = n ? t : re(t), this.dep.trigger());
  }
}
function ti(e) {
  return ve(e) ? e.value : e;
}
const si = {
  get: (e, t, s) => t === "__v_raw" ? e : ti(Reflect.get(e, t, s)),
  set: (e, t, s, n) => {
    const r = e[t];
    return ve(r) && !ve(s) ? (r.value = s, !0) : Reflect.set(e, t, s, n);
  }
};
function Yn(e) {
  return Ns(e) ? e : new Proxy(e, si);
}
class ni {
  constructor(t, s, n) {
    this.fn = t, this.setter = s, this._value = void 0, this.dep = new Fs(this), this.__v_isRef = !0, this.deps = void 0, this.depsTail = void 0, this.flags = 16, this.globalVersion = Tt - 1, this.next = void 0, this.effect = this, this.__v_isReadonly = !s, this.isSSR = n;
  }
  /**
   * @internal
   */
  notify() {
    if (this.flags |= 16, !(this.flags & 8) && // avoid infinite self recursion
    W !== this)
      return $n(this, !0), !0;
  }
  get value() {
    const t = this.dep.track();
    return Ln(this), t && (t.version = this.dep.version), this._value;
  }
  set value(t) {
    this.setter && this.setter(t);
  }
}
function ri(e, t, s = !1) {
  let n, r;
  return q(e) ? n = e : (n = e.get, r = e.set), new ni(n, r, s);
}
function st(e, t = 1 / 0, s) {
  if (t <= 0 || !z(e) || e.__v_skip || (s = s || /* @__PURE__ */ new Map(), (s.get(e) || 0) >= t))
    return e;
  if (s.set(e, t), t--, ve(e))
    st(e.value, t, s);
  else if (L(e))
    for (let n = 0; n < e.length; n++)
      st(e[n], t, s);
  else if (Tn(e) || ot(e))
    e.forEach((n) => {
      st(n, t, s);
    });
  else if (In(e)) {
    for (const n in e)
      st(e[n], t, s);
    for (const n of Object.getOwnPropertySymbols(e))
      Object.prototype.propertyIsEnumerable.call(e, n) && st(e[n], t, s);
  }
  return e;
}
/**
* @vue/runtime-core v3.5.24
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
function Mt(e, t, s, n) {
  try {
    return n ? e(...n) : e();
  } catch (r) {
    Zt(r, t, s);
  }
}
function Qe(e, t, s, n) {
  if (q(e)) {
    const r = Mt(e, t, s, n);
    return r && Cn(r) && r.catch((i) => {
      Zt(i, t, s);
    }), r;
  }
  if (L(e)) {
    const r = [];
    for (let i = 0; i < e.length; i++)
      r.push(Qe(e[i], t, s, n));
    return r;
  }
}
function Zt(e, t, s, n = !0) {
  const r = t ? t.vnode : null, { errorHandler: i, throwUnhandledErrorInProduction: o } = t && t.appContext.config || Y;
  if (t) {
    let c = t.parent;
    const f = t.proxy, d = `https://vuejs.org/error-reference/#runtime-${s}`;
    for (; c; ) {
      const a = c.ec;
      if (a) {
        for (let g = 0; g < a.length; g++)
          if (a[g](e, f, d) === !1)
            return;
      }
      c = c.parent;
    }
    if (i) {
      ut(), Mt(i, null, 10, [
        e,
        f,
        d
      ]), ft();
      return;
    }
  }
  ii(e, s, r, n, o);
}
function ii(e, t, s, n = !0, r = !1) {
  if (r)
    throw e;
  console.error(e);
}
const fe = [];
let Me = -1;
const ct = [];
let Ve = null, nt = 0;
const Jn = /* @__PURE__ */ Promise.resolve();
let Bt = null;
function oi(e) {
  const t = Bt || Jn;
  return e ? t.then(this ? e.bind(this) : e) : t;
}
function li(e) {
  let t = Me + 1, s = fe.length;
  for (; t < s; ) {
    const n = t + s >>> 1, r = fe[n], i = Et(r);
    i < e || i === e && r.flags & 2 ? t = n + 1 : s = n;
  }
  return t;
}
function Gn(e) {
  if (!(e.flags & 1)) {
    const t = Et(e), s = fe[fe.length - 1];
    !s || // fast path when the job id is larger than the tail
    !(e.flags & 2) && t >= Et(s) ? fe.push(e) : fe.splice(li(t), 0, e), e.flags |= 1, zn();
  }
}
function zn() {
  Bt || (Bt = Jn.then(Xn));
}
function ci(e) {
  L(e) ? ct.push(...e) : Ve && e.id === -1 ? Ve.splice(nt + 1, 0, e) : e.flags & 1 || (ct.push(e), e.flags |= 1), zn();
}
function Js(e, t, s = Me + 1) {
  for (; s < fe.length; s++) {
    const n = fe[s];
    if (n && n.flags & 2) {
      if (e && n.id !== e.uid)
        continue;
      fe.splice(s, 1), s--, n.flags & 4 && (n.flags &= -2), n(), n.flags & 4 || (n.flags &= -2);
    }
  }
}
function Qn(e) {
  if (ct.length) {
    const t = [...new Set(ct)].sort(
      (s, n) => Et(s) - Et(n)
    );
    if (ct.length = 0, Ve) {
      Ve.push(...t);
      return;
    }
    for (Ve = t, nt = 0; nt < Ve.length; nt++) {
      const s = Ve[nt];
      s.flags & 4 && (s.flags &= -2), s.flags & 8 || s(), s.flags &= -2;
    }
    Ve = null, nt = 0;
  }
}
const Et = (e) => e.id == null ? e.flags & 2 ? -1 : 1 / 0 : e.id;
function Xn(e) {
  try {
    for (Me = 0; Me < fe.length; Me++) {
      const t = fe[Me];
      t && !(t.flags & 8) && (t.flags & 4 && (t.flags &= -2), Mt(
        t,
        t.i,
        t.i ? 15 : 14
      ), t.flags & 4 || (t.flags &= -2));
    }
  } finally {
    for (; Me < fe.length; Me++) {
      const t = fe[Me];
      t && (t.flags &= -2);
    }
    Me = -1, fe.length = 0, Qn(), Bt = null, (fe.length || ct.length) && Xn();
  }
}
let xe = null, Zn = null;
function kt(e) {
  const t = xe;
  return xe = e, Zn = e && e.type.__scopeId || null, t;
}
function ui(e, t = xe, s) {
  if (!t || e._n)
    return e;
  const n = (...r) => {
    n._d && tn(-1);
    const i = kt(t);
    let o;
    try {
      o = e(...r);
    } finally {
      kt(i), n._d && tn(1);
    }
    return o;
  };
  return n._n = !0, n._c = !0, n._d = !0, n;
}
function Gs(e, t) {
  if (xe === null)
    return e;
  const s = ss(xe), n = e.dirs || (e.dirs = []);
  for (let r = 0; r < t.length; r++) {
    let [i, o, c, f = Y] = t[r];
    i && (q(i) && (i = {
      mounted: i,
      updated: i
    }), i.deep && st(o), n.push({
      dir: i,
      instance: s,
      value: o,
      oldValue: void 0,
      arg: c,
      modifiers: f
    }));
  }
  return e;
}
function Je(e, t, s, n) {
  const r = e.dirs, i = t && t.dirs;
  for (let o = 0; o < r.length; o++) {
    const c = r[o];
    i && (c.oldValue = i[o].value);
    let f = c.dir[n];
    f && (ut(), Qe(f, s, 8, [
      e.el,
      c,
      e,
      t
    ]), ft());
  }
}
const fi = Symbol("_vte"), ai = (e) => e.__isTeleport, di = Symbol("_leaveCb");
function js(e, t) {
  e.shapeFlag & 6 && e.component ? (e.transition = t, js(e.component.subTree, t)) : e.shapeFlag & 128 ? (e.ssContent.transition = t.clone(e.ssContent), e.ssFallback.transition = t.clone(e.ssFallback)) : e.transition = t;
}
// @__NO_SIDE_EFFECTS__
function hi(e, t) {
  return q(e) ? (
    // #8236: extend call and options.name access are considered side-effects
    // by Rollup, so we have to wrap it in a pure-annotated IIFE.
    Le({ name: e.name }, t, { setup: e })
  ) : e;
}
function pi(e) {
  e.ids = [e.ids[0] + e.ids[2]++ + "-", 0, 0];
}
const Wt = /* @__PURE__ */ new WeakMap();
function bt(e, t, s, n, r = !1) {
  if (L(e)) {
    e.forEach(
      (F, $) => bt(
        F,
        t && (L(t) ? t[$] : t),
        s,
        n,
        r
      )
    );
    return;
  }
  if (yt(n) && !r) {
    n.shapeFlag & 512 && n.type.__asyncResolved && n.component.subTree.component && bt(e, t, s, n.component.subTree);
    return;
  }
  const i = n.shapeFlag & 4 ? ss(n.component) : n.el, o = r ? null : i, { i: c, r: f } = e, d = t && t.r, a = c.refs === Y ? c.refs = {} : c.refs, g = c.setupState, S = V(g), A = g === Y ? Sn : (F) => U(S, F);
  if (d != null && d !== f) {
    if (zs(t), se(d))
      a[d] = null, A(d) && (g[d] = null);
    else if (ve(d)) {
      d.value = null;
      const F = t;
      F.k && (a[F.k] = null);
    }
  }
  if (q(f))
    Mt(f, c, 12, [o, a]);
  else {
    const F = se(f), $ = ve(f);
    if (F || $) {
      const Q = () => {
        if (e.f) {
          const R = F ? A(f) ? g[f] : a[f] : f.value;
          if (r)
            L(R) && yr(R, i);
          else if (L(R))
            R.includes(i) || R.push(i);
          else if (F)
            a[f] = [i], A(f) && (g[f] = a[f]);
          else {
            const X = [i];
            f.value = X, e.k && (a[e.k] = X);
          }
        } else F ? (a[f] = o, A(f) && (g[f] = o)) : $ && (f.value = o, e.k && (a[e.k] = o));
      };
      if (o) {
        const R = () => {
          Q(), Wt.delete(e);
        };
        R.id = -1, Wt.set(e, R), be(R, s);
      } else
        zs(e), Q();
    }
  }
}
function zs(e) {
  const t = Wt.get(e);
  t && (t.flags |= 8, Wt.delete(e));
}
Qt().requestIdleCallback;
Qt().cancelIdleCallback;
const yt = (e) => !!e.type.__asyncLoader, gi = (e) => e.type.__isKeepAlive, mi = Symbol.for("v-ndc");
function Pe(e, t, s, n) {
  let r;
  const i = s, o = L(e);
  if (o || se(e)) {
    const c = o && Ns(e);
    let f = !1, d = !1;
    c && (f = !Ne(e), d = Be(e), e = Xt(e)), r = new Array(e.length);
    for (let a = 0, g = e.length; a < g; a++)
      r[a] = t(
        f ? d ? Ut(re(e[a])) : re(e[a]) : e[a],
        a,
        void 0,
        i
      );
  } else if (typeof e == "number") {
    r = new Array(e);
    for (let c = 0; c < e; c++)
      r[c] = t(c + 1, c, void 0, i);
  } else if (z(e))
    if (e[Symbol.iterator])
      r = Array.from(
        e,
        (c, f) => t(c, f, void 0, i)
      );
    else {
      const c = Object.keys(e);
      r = new Array(c.length);
      for (let f = 0, d = c.length; f < d; f++) {
        const a = c[f];
        r[f] = t(e[a], a, f, i);
      }
    }
  else
    r = [];
  return r;
}
const ys = (e) => e ? gr(e) ? ss(e) : ys(e.parent) : null, xt = (
  // Move PURE marker to new line to workaround compiler discarding it
  // due to type annotation
  /* @__PURE__ */ Le(/* @__PURE__ */ Object.create(null), {
    $: (e) => e,
    $el: (e) => e.vnode.el,
    $data: (e) => e.data,
    $props: (e) => e.props,
    $attrs: (e) => e.attrs,
    $slots: (e) => e.slots,
    $refs: (e) => e.refs,
    $parent: (e) => ys(e.parent),
    $root: (e) => ys(e.root),
    $host: (e) => e.ce,
    $emit: (e) => e.emit,
    $options: (e) => e.type,
    $forceUpdate: (e) => e.f || (e.f = () => {
      Gn(e.update);
    }),
    $nextTick: (e) => e.n || (e.n = oi.bind(e.proxy)),
    $watch: (e) => Cs
  })
), cs = (e, t) => e !== Y && !e.__isScriptSetup && U(e, t), _i = {
  get({ _: e }, t) {
    if (t === "__v_skip")
      return !0;
    const { ctx: s, setupState: n, data: r, props: i, accessCache: o, type: c, appContext: f } = e;
    let d;
    if (t[0] !== "$") {
      const A = o[t];
      if (A !== void 0)
        switch (A) {
          case 1:
            return n[t];
          case 2:
            return r[t];
          case 4:
            return s[t];
          case 3:
            return i[t];
        }
      else {
        if (cs(n, t))
          return o[t] = 1, n[t];
        if (
          // only cache other properties when instance has declared (thus stable)
          // props
          (d = e.propsOptions[0]) && U(d, t)
        )
          return o[t] = 3, i[t];
        if (s !== Y && U(s, t))
          return o[t] = 4, s[t];
        o[t] = 0;
      }
    }
    const a = xt[t];
    let g, S;
    if (a)
      return t === "$attrs" && oe(e.attrs, "get", ""), a(e);
    if (
      // css module (injected by vue-loader)
      (g = c.__cssModules) && (g = g[t])
    )
      return g;
    if (s !== Y && U(s, t))
      return o[t] = 4, s[t];
    if (
      // global properties
      S = f.config.globalProperties, U(S, t)
    )
      return S[t];
  },
  set({ _: e }, t, s) {
    const { data: n, setupState: r, ctx: i } = e;
    return cs(r, t) ? (r[t] = s, !0) : U(e.props, t) || t[0] === "$" && t.slice(1) in e ? !1 : (i[t] = s, !0);
  },
  has({
    _: { data: e, setupState: t, accessCache: s, ctx: n, appContext: r, propsOptions: i, type: o }
  }, c) {
    let f, d;
    return !!(s[c] || cs(t, c) || (f = i[0]) && U(f, c) || U(n, c) || U(xt, c) || U(r.config.globalProperties, c) || (d = o.__cssModules) && d[c]);
  },
  defineProperty(e, t, s) {
    return s.get != null ? e._.accessCache[t] = 0 : U(s, "value") && this.set(e, t, s.value, null), Reflect.defineProperty(e, t, s);
  }
};
function er() {
  return {
    app: null,
    config: {
      isNativeTag: Sn,
      performance: !1,
      globalProperties: {},
      optionMergeStrategies: {},
      errorHandler: void 0,
      warnHandler: void 0,
      compilerOptions: {}
    },
    mixins: [],
    components: {},
    directives: {},
    provides: /* @__PURE__ */ Object.create(null),
    optionsCache: /* @__PURE__ */ new WeakMap(),
    propsCache: /* @__PURE__ */ new WeakMap(),
    emitsCache: /* @__PURE__ */ new WeakMap()
  };
}
let vi = 0;
function bi(e, t) {
  return function(n, r = null) {
    q(n) || (n = Le({}, n)), r != null && !z(r) && (r = null);
    const i = er(), o = /* @__PURE__ */ new WeakSet(), c = [];
    let f = !1;
    const d = i.app = {
      _uid: vi++,
      _component: n,
      _props: r,
      _container: null,
      _context: i,
      _instance: null,
      version: Qi,
      get config() {
        return i.config;
      },
      set config(a) {
      },
      use(a, ...g) {
        return o.has(a) || (a && q(a.install) ? (o.add(a), a.install(d, ...g)) : q(a) && (o.add(a), a(d, ...g))), d;
      },
      mixin(a) {
        return d;
      },
      component(a, g) {
        return g ? (i.components[a] = g, d) : i.components[a];
      },
      directive(a, g) {
        return g ? (i.directives[a] = g, d) : i.directives[a];
      },
      mount(a, g, S) {
        if (!f) {
          const A = d._ceVNode || De(n, r);
          return A.appContext = i, S === !0 ? S = "svg" : S === !1 && (S = void 0), e(A, a, S), f = !0, d._container = a, a.__vue_app__ = d, ss(A.component);
        }
      },
      onUnmount(a) {
        c.push(a);
      },
      unmount() {
        f && (Qe(
          c,
          d._instance,
          16
        ), e(null, d._container), delete d._container.__vue_app__);
      },
      provide(a, g) {
        return i.provides[a] = g, d;
      },
      runWithContext(a) {
        try {
          return a();
        } finally {
        }
      }
    };
    return d;
  };
}
const tr = {}, sr = () => Object.create(tr), nr = (e) => Object.getPrototypeOf(e) === tr;
function yi(e, t, s, n = !1) {
  const r = {}, i = sr();
  e.propsDefaults = /* @__PURE__ */ Object.create(null), rr(e, t, r, i);
  for (const o in e.propsOptions[0])
    o in r || (r[o] = void 0);
  s ? e.props = n ? r : Qr(r) : e.type.props ? e.props = r : e.props = i, e.attrs = i;
}
function xi(e, t, s, n) {
  const {
    props: r,
    attrs: i,
    vnode: { patchFlag: o }
  } = e, c = V(r), [f] = e.propsOptions;
  let d = !1;
  if (
    // always force full diff in dev
    // - #1942 if hmr is enabled with sfc component
    // - vite#872 non-sfc component used by sfc component
    (n || o > 0) && !(o & 16)
  ) {
    if (o & 8) {
      const a = e.vnode.dynamicProps;
      for (let g = 0; g < a.length; g++) {
        let S = a[g];
        if (es(e.emitsOptions, S))
          continue;
        const A = t[S];
        if (f)
          if (U(i, S))
            A !== i[S] && (i[S] = A, d = !0);
          else {
            const F = Ue(S);
            r[F] = xs(
              f,
              c,
              F,
              A,
              e,
              !1
            );
          }
        else
          A !== i[S] && (i[S] = A, d = !0);
      }
    }
  } else {
    rr(e, t, r, i) && (d = !0);
    let a;
    for (const g in c)
      (!t || // for camelCase
      !U(t, g) && // it's possible the original props was passed in as kebab-case
      // and converted to camelCase (#955)
      ((a = Xe(g)) === g || !U(t, a))) && (f ? s && // for camelCase
      (s[g] !== void 0 || // for kebab-case
      s[a] !== void 0) && (r[g] = xs(
        f,
        c,
        g,
        void 0,
        e,
        !0
      )) : delete r[g]);
    if (i !== c)
      for (const g in i)
        (!t || !U(t, g)) && (delete i[g], d = !0);
  }
  d && $e(e.attrs, "set", "");
}
function rr(e, t, s, n) {
  const [r, i] = e.propsOptions;
  let o = !1, c;
  if (t)
    for (let f in t) {
      if (mt(f))
        continue;
      const d = t[f];
      let a;
      r && U(r, a = Ue(f)) ? !i || !i.includes(a) ? s[a] = d : (c || (c = {}))[a] = d : es(e.emitsOptions, f) || (!(f in n) || d !== n[f]) && (n[f] = d, o = !0);
    }
  if (i) {
    const f = V(s), d = c || Y;
    for (let a = 0; a < i.length; a++) {
      const g = i[a];
      s[g] = xs(
        r,
        f,
        g,
        d[g],
        e,
        !U(d, g)
      );
    }
  }
  return o;
}
function xs(e, t, s, n, r, i) {
  const o = e[s];
  if (o != null) {
    const c = U(o, "default");
    if (c && n === void 0) {
      const f = o.default;
      if (o.type !== Function && !o.skipFactory && q(f)) {
        const { propsDefaults: d } = r;
        if (s in d)
          n = d[s];
        else {
          const a = pr(r);
          n = d[s] = f.call(
            null,
            t
          ), a();
        }
      } else
        n = f;
      r.ce && r.ce._setProp(s, n);
    }
    o[
      0
      /* shouldCast */
    ] && (i && !c ? n = !1 : o[
      1
      /* shouldCastTrue */
    ] && (n === "" || n === Xe(s)) && (n = !0));
  }
  return n;
}
function wi(e, t, s = !1) {
  const n = t.propsCache, r = n.get(e);
  if (r)
    return r;
  const i = e.props, o = {}, c = [];
  if (!i)
    return z(e) && n.set(e, it), it;
  if (L(i))
    for (let d = 0; d < i.length; d++) {
      const a = Ue(i[d]);
      Qs(a) && (o[a] = Y);
    }
  else if (i)
    for (const d in i) {
      const a = Ue(d);
      if (Qs(a)) {
        const g = i[d], S = o[a] = L(g) || q(g) ? { type: g } : Le({}, g), A = S.type;
        let F = !1, $ = !0;
        if (L(A))
          for (let Q = 0; Q < A.length; ++Q) {
            const R = A[Q], X = q(R) && R.name;
            if (X === "Boolean") {
              F = !0;
              break;
            } else X === "String" && ($ = !1);
          }
        else
          F = q(A) && A.name === "Boolean";
        S[
          0
          /* shouldCast */
        ] = F, S[
          1
          /* shouldCastTrue */
        ] = $, (F || U(S, "default")) && c.push(a);
      }
    }
  const f = [o, c];
  return z(e) && n.set(e, f), f;
}
function Qs(e) {
  return e[0] !== "$" && !mt(e);
}
const Hs = (e) => e === "_" || e === "_ctx" || e === "$stable", Vs = (e) => L(e) ? e.map(Ae) : [Ae(e)], Si = (e, t, s) => {
  if (t._n)
    return t;
  const n = ui((...r) => Vs(t(...r)), s);
  return n._c = !1, n;
}, ir = (e, t, s) => {
  const n = e._ctx;
  for (const r in e) {
    if (Hs(r)) continue;
    const i = e[r];
    if (q(i))
      t[r] = Si(r, i, n);
    else if (i != null) {
      const o = Vs(i);
      t[r] = () => o;
    }
  }
}, or = (e, t) => {
  const s = Vs(t);
  e.slots.default = () => s;
}, lr = (e, t, s) => {
  for (const n in t)
    (s || !Hs(n)) && (e[n] = t[n]);
}, Ti = (e, t, s) => {
  const n = e.slots = sr();
  if (e.vnode.shapeFlag & 32) {
    const r = t._;
    r ? (lr(n, t, s), s && An(n, "_", r, !0)) : ir(t, n);
  } else t && or(e, t);
}, Ci = (e, t, s) => {
  const { vnode: n, slots: r } = e;
  let i = !0, o = Y;
  if (n.shapeFlag & 32) {
    const c = t._;
    c ? s && c === 1 ? i = !1 : lr(r, t, s) : (i = !t.$stable, ir(t, r)), o = t;
  } else t && (or(e, t), o = { default: 1 });
  if (i)
    for (const c in r)
      !Hs(c) && o[c] == null && delete r[c];
}, be = Li;
function Ei(e) {
  return Ii(e);
}
function Ii(e, t) {
  const s = Qt();
  s.__VUE__ = !0;
  const {
    insert: n,
    remove: r,
    patchProp: i,
    createElement: o,
    createText: c,
    createComment: f,
    setText: d,
    setElementText: a,
    parentNode: g,
    nextSibling: S,
    setScopeId: A = Cs,
    insertStaticContent: F
  } = e, $ = (l, u, h, v = null, p = null, m = null, x = void 0, y = null, b = !!u.dynamicChildren) => {
    if (l === u)
      return;
    l && !gt(l, u) && (v = ne(l), G(l, p, m, !0), l = null), u.patchFlag === -2 && (b = !1, u.dynamicChildren = null);
    const { type: _, ref: M, shapeFlag: w } = u;
    switch (_) {
      case ts:
        Q(l, u, h, v);
        break;
      case ke:
        R(l, u, h, v);
        break;
      case fs:
        l == null && X(u, h, v, x);
        break;
      case Z:
        Pt(
          l,
          u,
          h,
          v,
          p,
          m,
          x,
          y,
          b
        );
        break;
      default:
        w & 1 ? qe(
          l,
          u,
          h,
          v,
          p,
          m,
          x,
          y,
          b
        ) : w & 6 ? Ft(
          l,
          u,
          h,
          v,
          p,
          m,
          x,
          y,
          b
        ) : (w & 64 || w & 128) && _.process(
          l,
          u,
          h,
          v,
          p,
          m,
          x,
          y,
          b,
          ue
        );
    }
    M != null && p ? bt(M, l && l.ref, m, u || l, !u) : M == null && l && l.ref != null && bt(l.ref, null, m, l, !0);
  }, Q = (l, u, h, v) => {
    if (l == null)
      n(
        u.el = c(u.children),
        h,
        v
      );
    else {
      const p = u.el = l.el;
      u.children !== l.children && d(p, u.children);
    }
  }, R = (l, u, h, v) => {
    l == null ? n(
      u.el = f(u.children || ""),
      h,
      v
    ) : u.el = l.el;
  }, X = (l, u, h, v) => {
    [l.el, l.anchor] = F(
      l.children,
      u,
      h,
      v,
      l.el,
      l.anchor
    );
  }, le = ({ el: l, anchor: u }, h, v) => {
    let p;
    for (; l && l !== u; )
      p = S(l), n(l, h, v), l = p;
    n(u, h, v);
  }, ie = ({ el: l, anchor: u }) => {
    let h;
    for (; l && l !== u; )
      h = S(l), r(l), l = h;
    r(u);
  }, qe = (l, u, h, v, p, m, x, y, b) => {
    if (u.type === "svg" ? x = "svg" : u.type === "math" && (x = "mathml"), l == null)
      At(
        u,
        h,
        v,
        p,
        m,
        x,
        y,
        b
      );
    else {
      const _ = l.el && l.el._isVueCE ? l.el : null;
      try {
        _ && _._beginPatch(), Ot(
          l,
          u,
          p,
          m,
          x,
          y,
          b
        );
      } finally {
        _ && _._endPatch();
      }
    }
  }, At = (l, u, h, v, p, m, x, y) => {
    let b, _;
    const { props: M, shapeFlag: w, transition: I, dirs: O } = l;
    if (b = l.el = o(
      l.type,
      m,
      M && M.is,
      M
    ), w & 8 ? a(b, l.children) : w & 16 && Oe(
      l.children,
      b,
      null,
      v,
      p,
      us(l, m),
      x,
      y
    ), O && Je(l, null, v, "created"), Ze(b, l, l.scopeId, x, v), M) {
      for (const k in M)
        k !== "value" && !mt(k) && i(b, k, null, M[k], m, v);
      "value" in M && i(b, "value", null, M.value, m), (_ = M.onVnodeBeforeMount) && Ie(_, v, l);
    }
    O && Je(l, null, v, "beforeMount");
    const N = Mi(p, I);
    N && I.beforeEnter(b), n(b, u, h), ((_ = M && M.onVnodeMounted) || N || O) && be(() => {
      _ && Ie(_, v, l), N && I.enter(b), O && Je(l, null, v, "mounted");
    }, p);
  }, Ze = (l, u, h, v, p) => {
    if (h && A(l, h), v)
      for (let m = 0; m < v.length; m++)
        A(l, v[m]);
    if (p) {
      let m = p.subTree;
      if (u === m || fr(m.type) && (m.ssContent === u || m.ssFallback === u)) {
        const x = p.vnode;
        Ze(
          l,
          x,
          x.scopeId,
          x.slotScopeIds,
          p.parent
        );
      }
    }
  }, Oe = (l, u, h, v, p, m, x, y, b = 0) => {
    for (let _ = b; _ < l.length; _++) {
      const M = l[_] = y ? Ke(l[_]) : Ae(l[_]);
      $(
        null,
        M,
        u,
        h,
        v,
        p,
        m,
        x,
        y
      );
    }
  }, Ot = (l, u, h, v, p, m, x) => {
    const y = u.el = l.el;
    let { patchFlag: b, dynamicChildren: _, dirs: M } = u;
    b |= l.patchFlag & 16;
    const w = l.props || Y, I = u.props || Y;
    let O;
    if (h && Ge(h, !1), (O = I.onVnodeBeforeUpdate) && Ie(O, h, u, l), M && Je(u, l, h, "beforeUpdate"), h && Ge(h, !0), (w.innerHTML && I.innerHTML == null || w.textContent && I.textContent == null) && a(y, ""), _ ? dt(
      l.dynamicChildren,
      _,
      y,
      h,
      v,
      us(u, p),
      m
    ) : x || ee(
      l,
      u,
      y,
      null,
      h,
      v,
      us(u, p),
      m,
      !1
    ), b > 0) {
      if (b & 16)
        Rt(y, w, I, h, p);
      else if (b & 2 && w.class !== I.class && i(y, "class", null, I.class, p), b & 4 && i(y, "style", w.style, I.style, p), b & 8) {
        const N = u.dynamicProps;
        for (let k = 0; k < N.length; k++) {
          const K = N[k], ae = w[K], de = I[K];
          (de !== ae || K === "value") && i(y, K, ae, de, p, h);
        }
      }
      b & 1 && l.children !== u.children && a(y, u.children);
    } else !x && _ == null && Rt(y, w, I, h, p);
    ((O = I.onVnodeUpdated) || M) && be(() => {
      O && Ie(O, h, u, l), M && Je(u, l, h, "updated");
    }, v);
  }, dt = (l, u, h, v, p, m, x) => {
    for (let y = 0; y < u.length; y++) {
      const b = l[y], _ = u[y], M = (
        // oldVNode may be an errored async setup() component inside Suspense
        // which will not have a mounted element
        b.el && // - In the case of a Fragment, we need to provide the actual parent
        // of the Fragment itself so it can move its children.
        (b.type === Z || // - In the case of different nodes, there is going to be a replacement
        // which also requires the correct parent container
        !gt(b, _) || // - In the case of a component, it could contain anything.
        b.shapeFlag & 198) ? g(b.el) : (
          // In other cases, the parent container is not actually used so we
          // just pass the block element here to avoid a DOM parentNode call.
          h
        )
      );
      $(
        b,
        _,
        M,
        null,
        v,
        p,
        m,
        x,
        !0
      );
    }
  }, Rt = (l, u, h, v, p) => {
    if (u !== h) {
      if (u !== Y)
        for (const m in u)
          !mt(m) && !(m in h) && i(
            l,
            m,
            u[m],
            null,
            p,
            v
          );
      for (const m in h) {
        if (mt(m)) continue;
        const x = h[m], y = u[m];
        x !== y && m !== "value" && i(l, m, y, x, p, v);
      }
      "value" in h && i(l, "value", u.value, h.value, p);
    }
  }, Pt = (l, u, h, v, p, m, x, y, b) => {
    const _ = u.el = l ? l.el : c(""), M = u.anchor = l ? l.anchor : c("");
    let { patchFlag: w, dynamicChildren: I, slotScopeIds: O } = u;
    O && (y = y ? y.concat(O) : O), l == null ? (n(_, h, v), n(M, h, v), Oe(
      // #10007
      // such fragment like `<></>` will be compiled into
      // a fragment which doesn't have a children.
      // In this case fallback to an empty array
      u.children || [],
      h,
      M,
      p,
      m,
      x,
      y,
      b
    )) : w > 0 && w & 64 && I && // #2715 the previous fragment could've been a BAILed one as a result
    // of renderSlot() with no valid children
    l.dynamicChildren ? (dt(
      l.dynamicChildren,
      I,
      h,
      p,
      m,
      x,
      y
    ), // #2080 if the stable fragment has a key, it's a <template v-for> that may
    //  get moved around. Make sure all root level vnodes inherit el.
    // #2134 or if it's a component root, it may also get moved around
    // as the component is being moved.
    (u.key != null || p && u === p.subTree) && cr(
      l,
      u,
      !0
      /* shallow */
    )) : ee(
      l,
      u,
      h,
      M,
      p,
      m,
      x,
      y,
      b
    );
  }, Ft = (l, u, h, v, p, m, x, y, b) => {
    u.slotScopeIds = y, l == null ? u.shapeFlag & 512 ? p.ctx.activate(
      u,
      h,
      v,
      x,
      b
    ) : $t(
      u,
      h,
      v,
      p,
      m,
      x,
      b
    ) : H(l, u, b);
  }, $t = (l, u, h, v, p, m, x) => {
    const y = l.component = Wi(
      l,
      v,
      p
    );
    if (gi(l) && (y.ctx.renderer = ue), qi(y, !1, x), y.asyncDep) {
      if (p && p.registerDep(y, E, x), !l.el) {
        const b = y.subTree = De(ke);
        R(null, b, u, h), l.placeholder = b.el;
      }
    } else
      E(
        y,
        l,
        u,
        h,
        p,
        m,
        x
      );
  }, H = (l, u, h) => {
    const v = u.component = l.component;
    if (Di(l, u, h))
      if (v.asyncDep && !v.asyncResolved) {
        J(v, u, h);
        return;
      } else
        v.next = u, v.update();
    else
      u.el = l.el, v.vnode = u;
  }, E = (l, u, h, v, p, m, x) => {
    const y = () => {
      if (l.isMounted) {
        let { next: w, bu: I, u: O, parent: N, vnode: k } = l;
        {
          const Ce = ur(l);
          if (Ce) {
            w && (w.el = k.el, J(l, w, x)), Ce.asyncDep.then(() => {
              l.isUnmounted || y();
            });
            return;
          }
        }
        let K = w, ae;
        Ge(l, !1), w ? (w.el = k.el, J(l, w, x)) : w = k, I && jt(I), (ae = w.props && w.props.onVnodeBeforeUpdate) && Ie(ae, N, w, k), Ge(l, !0);
        const de = Zs(l), Te = l.subTree;
        l.subTree = de, $(
          Te,
          de,
          // parent may have changed if it's in a teleport
          g(Te.el),
          // anchor may have changed if it's in a fragment
          ne(Te),
          l,
          p,
          m
        ), w.el = de.el, K === null && Ni(l, de.el), O && be(O, p), (ae = w.props && w.props.onVnodeUpdated) && be(
          () => Ie(ae, N, w, k),
          p
        );
      } else {
        let w;
        const { el: I, props: O } = u, { bm: N, m: k, parent: K, root: ae, type: de } = l, Te = yt(u);
        Ge(l, !1), N && jt(N), !Te && (w = O && O.onVnodeBeforeMount) && Ie(w, K, u), Ge(l, !0);
        {
          ae.ce && // @ts-expect-error _def is private
          ae.ce._def.shadowRoot !== !1 && ae.ce._injectChildStyle(de);
          const Ce = l.subTree = Zs(l);
          $(
            null,
            Ce,
            h,
            v,
            l,
            p,
            m
          ), u.el = Ce.el;
        }
        if (k && be(k, p), !Te && (w = O && O.onVnodeMounted)) {
          const Ce = u;
          be(
            () => Ie(w, K, Ce),
            p
          );
        }
        (u.shapeFlag & 256 || K && yt(K.vnode) && K.vnode.shapeFlag & 256) && l.a && be(l.a, p), l.isMounted = !0, u = h = v = null;
      }
    };
    l.scope.on();
    const b = l.effect = new Pr(y);
    l.scope.off();
    const _ = l.update = b.run.bind(b), M = l.job = b.runIfDirty.bind(b);
    M.i = l, M.id = l.uid, b.scheduler = () => Gn(M), Ge(l, !0), _();
  }, J = (l, u, h) => {
    u.component = l;
    const v = l.vnode.props;
    l.vnode = u, l.next = null, xi(l, u.props, v, h), Ci(l, u.children, h), ut(), Js(l), ft();
  }, ee = (l, u, h, v, p, m, x, y, b = !1) => {
    const _ = l && l.children, M = l ? l.shapeFlag : 0, w = u.children, { patchFlag: I, shapeFlag: O } = u;
    if (I > 0) {
      if (I & 128) {
        B(
          _,
          w,
          h,
          v,
          p,
          m,
          x,
          y,
          b
        );
        return;
      } else if (I & 256) {
        C(
          _,
          w,
          h,
          v,
          p,
          m,
          x,
          y,
          b
        );
        return;
      }
    }
    O & 8 ? (M & 16 && Se(_, p, m), w !== _ && a(h, w)) : M & 16 ? O & 16 ? B(
      _,
      w,
      h,
      v,
      p,
      m,
      x,
      y,
      b
    ) : Se(_, p, m, !0) : (M & 8 && a(h, ""), O & 16 && Oe(
      w,
      h,
      v,
      p,
      m,
      x,
      y,
      b
    ));
  }, C = (l, u, h, v, p, m, x, y, b) => {
    l = l || it, u = u || it;
    const _ = l.length, M = u.length, w = Math.min(_, M);
    let I;
    for (I = 0; I < w; I++) {
      const O = u[I] = b ? Ke(u[I]) : Ae(u[I]);
      $(
        l[I],
        O,
        h,
        null,
        p,
        m,
        x,
        y,
        b
      );
    }
    _ > M ? Se(
      l,
      p,
      m,
      !0,
      !1,
      w
    ) : Oe(
      u,
      h,
      v,
      p,
      m,
      x,
      y,
      b,
      w
    );
  }, B = (l, u, h, v, p, m, x, y, b) => {
    let _ = 0;
    const M = u.length;
    let w = l.length - 1, I = M - 1;
    for (; _ <= w && _ <= I; ) {
      const O = l[_], N = u[_] = b ? Ke(u[_]) : Ae(u[_]);
      if (gt(O, N))
        $(
          O,
          N,
          h,
          null,
          p,
          m,
          x,
          y,
          b
        );
      else
        break;
      _++;
    }
    for (; _ <= w && _ <= I; ) {
      const O = l[w], N = u[I] = b ? Ke(u[I]) : Ae(u[I]);
      if (gt(O, N))
        $(
          O,
          N,
          h,
          null,
          p,
          m,
          x,
          y,
          b
        );
      else
        break;
      w--, I--;
    }
    if (_ > w) {
      if (_ <= I) {
        const O = I + 1, N = O < M ? u[O].el : v;
        for (; _ <= I; )
          $(
            null,
            u[_] = b ? Ke(u[_]) : Ae(u[_]),
            h,
            N,
            p,
            m,
            x,
            y,
            b
          ), _++;
      }
    } else if (_ > I)
      for (; _ <= w; )
        G(l[_], p, m, !0), _++;
    else {
      const O = _, N = _, k = /* @__PURE__ */ new Map();
      for (_ = N; _ <= I; _++) {
        const ge = u[_] = b ? Ke(u[_]) : Ae(u[_]);
        ge.key != null && k.set(ge.key, _);
      }
      let K, ae = 0;
      const de = I - N + 1;
      let Te = !1, Ce = 0;
      const ht = new Array(de);
      for (_ = 0; _ < de; _++) ht[_] = 0;
      for (_ = O; _ <= w; _++) {
        const ge = l[_];
        if (ae >= de) {
          G(ge, p, m, !0);
          continue;
        }
        let Ee;
        if (ge.key != null)
          Ee = k.get(ge.key);
        else
          for (K = N; K <= I; K++)
            if (ht[K - N] === 0 && gt(ge, u[K])) {
              Ee = K;
              break;
            }
        Ee === void 0 ? G(ge, p, m, !0) : (ht[Ee - N] = _ + 1, Ee >= Ce ? Ce = Ee : Te = !0, $(
          ge,
          u[Ee],
          h,
          null,
          p,
          m,
          x,
          y,
          b
        ), ae++);
      }
      const Us = Te ? Ai(ht) : it;
      for (K = Us.length - 1, _ = de - 1; _ >= 0; _--) {
        const ge = N + _, Ee = u[ge], Bs = u[ge + 1], ks = ge + 1 < M ? (
          // #13559, fallback to el placeholder for unresolved async component
          Bs.el || Bs.placeholder
        ) : v;
        ht[_] === 0 ? $(
          null,
          Ee,
          h,
          ks,
          p,
          m,
          x,
          y,
          b
        ) : Te && (K < 0 || _ !== Us[K] ? te(Ee, h, ks, 2) : K--);
      }
    }
  }, te = (l, u, h, v, p = null) => {
    const { el: m, type: x, transition: y, children: b, shapeFlag: _ } = l;
    if (_ & 6) {
      te(l.component.subTree, u, h, v);
      return;
    }
    if (_ & 128) {
      l.suspense.move(u, h, v);
      return;
    }
    if (_ & 64) {
      x.move(l, u, h, ue);
      return;
    }
    if (x === Z) {
      n(m, u, h);
      for (let w = 0; w < b.length; w++)
        te(b[w], u, h, v);
      n(l.anchor, u, h);
      return;
    }
    if (x === fs) {
      le(l, u, h);
      return;
    }
    if (v !== 2 && _ & 1 && y)
      if (v === 0)
        y.beforeEnter(m), n(m, u, h), be(() => y.enter(m), p);
      else {
        const { leave: w, delayLeave: I, afterLeave: O } = y, N = () => {
          l.ctx.isUnmounted ? r(m) : n(m, u, h);
        }, k = () => {
          m._isLeaving && m[di](
            !0
            /* cancelled */
          ), w(m, () => {
            N(), O && O();
          });
        };
        I ? I(m, N, k) : k();
      }
    else
      n(m, u, h);
  }, G = (l, u, h, v = !1, p = !1) => {
    const {
      type: m,
      props: x,
      ref: y,
      children: b,
      dynamicChildren: _,
      shapeFlag: M,
      patchFlag: w,
      dirs: I,
      cacheIndex: O
    } = l;
    if (w === -2 && (p = !1), y != null && (ut(), bt(y, null, h, l, !0), ft()), O != null && (u.renderCache[O] = void 0), M & 256) {
      u.ctx.deactivate(l);
      return;
    }
    const N = M & 1 && I, k = !yt(l);
    let K;
    if (k && (K = x && x.onVnodeBeforeUnmount) && Ie(K, u, l), M & 6)
      He(l.component, h, v);
    else {
      if (M & 128) {
        l.suspense.unmount(h, v);
        return;
      }
      N && Je(l, null, u, "beforeUnmount"), M & 64 ? l.type.remove(
        l,
        u,
        h,
        ue,
        v
      ) : _ && // #5154
      // when v-once is used inside a block, setBlockTracking(-1) marks the
      // parent block with hasOnce: true
      // so that it doesn't take the fast path during unmount - otherwise
      // components nested in v-once are never unmounted.
      !_.hasOnce && // #1153: fast path should not be taken for non-stable (v-for) fragments
      (m !== Z || w > 0 && w & 64) ? Se(
        _,
        u,
        h,
        !1,
        !0
      ) : (m === Z && w & 384 || !p && M & 16) && Se(b, u, h), v && je(l);
    }
    (k && (K = x && x.onVnodeUnmounted) || N) && be(() => {
      K && Ie(K, u, l), N && Je(l, null, u, "unmounted");
    }, h);
  }, je = (l) => {
    const { type: u, el: h, anchor: v, transition: p } = l;
    if (u === Z) {
      ce(h, v);
      return;
    }
    if (u === fs) {
      ie(l);
      return;
    }
    const m = () => {
      r(h), p && !p.persisted && p.afterLeave && p.afterLeave();
    };
    if (l.shapeFlag & 1 && p && !p.persisted) {
      const { leave: x, delayLeave: y } = p, b = () => x(h, m);
      y ? y(l.el, m, b) : b();
    } else
      m();
  }, ce = (l, u) => {
    let h;
    for (; l !== u; )
      h = S(l), r(l), l = h;
    r(u);
  }, He = (l, u, h) => {
    const { bum: v, scope: p, job: m, subTree: x, um: y, m: b, a: _ } = l;
    Xs(b), Xs(_), v && jt(v), p.stop(), m && (m.flags |= 8, G(x, l, u, h)), y && be(y, u), be(() => {
      l.isUnmounted = !0;
    }, u);
  }, Se = (l, u, h, v = !1, p = !1, m = 0) => {
    for (let x = m; x < l.length; x++)
      G(l[x], u, h, v, p);
  }, ne = (l) => {
    if (l.shapeFlag & 6)
      return ne(l.component.subTree);
    if (l.shapeFlag & 128)
      return l.suspense.next();
    const u = S(l.anchor || l.el), h = u && u[fi];
    return h ? S(h) : u;
  };
  let ye = !1;
  const et = (l, u, h) => {
    l == null ? u._vnode && G(u._vnode, null, null, !0) : $(
      u._vnode || null,
      l,
      u,
      null,
      null,
      null,
      h
    ), u._vnode = l, ye || (ye = !0, Js(), Qn(), ye = !1);
  }, ue = {
    p: $,
    um: G,
    m: te,
    r: je,
    mt: $t,
    mc: Oe,
    pc: ee,
    pbc: dt,
    n: ne,
    o: e
  };
  return {
    render: et,
    hydrate: void 0,
    createApp: bi(et)
  };
}
function us({ type: e, props: t }, s) {
  return s === "svg" && e === "foreignObject" || s === "mathml" && e === "annotation-xml" && t && t.encoding && t.encoding.includes("html") ? void 0 : s;
}
function Ge({ effect: e, job: t }, s) {
  s ? (e.flags |= 32, t.flags |= 4) : (e.flags &= -33, t.flags &= -5);
}
function Mi(e, t) {
  return (!e || e && !e.pendingBranch) && t && !t.persisted;
}
function cr(e, t, s = !1) {
  const n = e.children, r = t.children;
  if (L(n) && L(r))
    for (let i = 0; i < n.length; i++) {
      const o = n[i];
      let c = r[i];
      c.shapeFlag & 1 && !c.dynamicChildren && ((c.patchFlag <= 0 || c.patchFlag === 32) && (c = r[i] = Ke(r[i]), c.el = o.el), !s && c.patchFlag !== -2 && cr(o, c)), c.type === ts && // avoid cached text nodes retaining detached dom nodes
      c.patchFlag !== -1 && (c.el = o.el), c.type === ke && !c.el && (c.el = o.el);
    }
}
function Ai(e) {
  const t = e.slice(), s = [0];
  let n, r, i, o, c;
  const f = e.length;
  for (n = 0; n < f; n++) {
    const d = e[n];
    if (d !== 0) {
      if (r = s[s.length - 1], e[r] < d) {
        t[n] = r, s.push(n);
        continue;
      }
      for (i = 0, o = s.length - 1; i < o; )
        c = i + o >> 1, e[s[c]] < d ? i = c + 1 : o = c;
      d < e[s[i]] && (i > 0 && (t[n] = s[i - 1]), s[i] = n);
    }
  }
  for (i = s.length, o = s[i - 1]; i-- > 0; )
    s[i] = o, o = t[o];
  return s;
}
function ur(e) {
  const t = e.subTree.component;
  if (t)
    return t.asyncDep && !t.asyncResolved ? t : ur(t);
}
function Xs(e) {
  if (e)
    for (let t = 0; t < e.length; t++)
      e[t].flags |= 8;
}
const Oi = (e, t) => t === "modelValue" || t === "model-value" ? e.modelModifiers : e[`${t}Modifiers`] || e[`${Ue(t)}Modifiers`] || e[`${Xe(t)}Modifiers`];
function Ri(e, t, ...s) {
  if (e.isUnmounted) return;
  const n = e.vnode.props || Y;
  let r = s;
  const i = t.startsWith("update:"), o = i && Oi(n, t.slice(7));
  o && (o.trim && (r = s.map((a) => se(a) ? a.trim() : a)), o.number && (r = s.map(Ms)));
  let c, f = n[c = ns(t)] || // also try camelCase event handler (#2249)
  n[c = ns(Ue(t))];
  !f && i && (f = n[c = ns(Xe(t))]), f && Qe(
    f,
    e,
    6,
    r
  );
  const d = n[c + "Once"];
  if (d) {
    if (!e.emitted)
      e.emitted = {};
    else if (e.emitted[c])
      return;
    e.emitted[c] = !0, Qe(
      d,
      e,
      6,
      r
    );
  }
}
function Pi(e, t, s = !1) {
  const n = t.emitsCache, r = n.get(e);
  if (r !== void 0)
    return r;
  const i = e.emits;
  let o = {};
  return i ? (L(i) ? i.forEach((c) => o[c] = null) : Le(o, i), z(e) && n.set(e, o), o) : (z(e) && n.set(e, null), null);
}
function es(e, t) {
  return !e || !Jt(t) ? !1 : (t = t.slice(2).replace(/Once$/, ""), U(e, t[0].toLowerCase() + t.slice(1)) || U(e, Xe(t)) || U(e, t));
}
function Zs(e) {
  const {
    type: t,
    vnode: s,
    proxy: n,
    withProxy: r,
    propsOptions: [i],
    slots: o,
    attrs: c,
    emit: f,
    render: d,
    renderCache: a,
    props: g,
    data: S,
    setupState: A,
    ctx: F,
    inheritAttrs: $
  } = e, Q = kt(e);
  let R, X;
  try {
    if (s.shapeFlag & 4) {
      const ie = r || n, qe = ie;
      R = Ae(
        d.call(
          qe,
          ie,
          a,
          g,
          A,
          S,
          F
        )
      ), X = c;
    } else {
      const ie = t;
      R = Ae(
        ie.length > 1 ? ie(
          g,
          { attrs: c, slots: o, emit: f }
        ) : ie(
          g,
          null
        )
      ), X = t.props ? c : Fi(c);
    }
  } catch (ie) {
    wt.length = 0, Zt(ie, e, 1), R = De(ke);
  }
  let le = R;
  if (X && $ !== !1) {
    const ie = Object.keys(X), { shapeFlag: qe } = le;
    ie.length && qe & 7 && (i && ie.some(Es) && (X = $i(
      X,
      i
    )), le = at(le, X, !1, !0));
  }
  return s.dirs && (le = at(le, null, !1, !0), le.dirs = le.dirs ? le.dirs.concat(s.dirs) : s.dirs), s.transition && js(le, s.transition), R = le, kt(Q), R;
}
const Fi = (e) => {
  let t;
  for (const s in e)
    (s === "class" || s === "style" || Jt(s)) && ((t || (t = {}))[s] = e[s]);
  return t;
}, $i = (e, t) => {
  const s = {};
  for (const n in e)
    (!Es(n) || !(n.slice(9) in t)) && (s[n] = e[n]);
  return s;
};
function Di(e, t, s) {
  const { props: n, children: r, component: i } = e, { props: o, children: c, patchFlag: f } = t, d = i.emitsOptions;
  if (t.dirs || t.transition)
    return !0;
  if (s && f >= 0) {
    if (f & 1024)
      return !0;
    if (f & 16)
      return n ? en(n, o, d) : !!o;
    if (f & 8) {
      const a = t.dynamicProps;
      for (let g = 0; g < a.length; g++) {
        const S = a[g];
        if (o[S] !== n[S] && !es(d, S))
          return !0;
      }
    }
  } else
    return (r || c) && (!c || !c.$stable) ? !0 : n === o ? !1 : n ? o ? en(n, o, d) : !0 : !!o;
  return !1;
}
function en(e, t, s) {
  const n = Object.keys(t);
  if (n.length !== Object.keys(e).length)
    return !0;
  for (let r = 0; r < n.length; r++) {
    const i = n[r];
    if (t[i] !== e[i] && !es(s, i))
      return !0;
  }
  return !1;
}
function Ni({ vnode: e, parent: t }, s) {
  for (; t; ) {
    const n = t.subTree;
    if (n.suspense && n.suspense.activeBranch === e && (n.el = e.el), n === e)
      (e = t.vnode).el = s, t = t.parent;
    else
      break;
  }
}
const fr = (e) => e.__isSuspense;
function Li(e, t) {
  t && t.pendingBranch ? L(e) ? t.effects.push(...e) : t.effects.push(e) : ci(e);
}
const Z = Symbol.for("v-fgt"), ts = Symbol.for("v-txt"), ke = Symbol.for("v-cmt"), fs = Symbol.for("v-stc"), wt = [];
let _e = null;
function P(e = !1) {
  wt.push(_e = e ? null : []);
}
function ji() {
  wt.pop(), _e = wt[wt.length - 1] || null;
}
let It = 1;
function tn(e, t = !1) {
  It += e, e < 0 && _e && t && (_e.hasOnce = !0);
}
function ar(e) {
  return e.dynamicChildren = It > 0 ? _e || it : null, ji(), It > 0 && _e && _e.push(e), e;
}
function D(e, t, s, n, r, i) {
  return ar(
    T(
      e,
      t,
      s,
      n,
      r,
      i,
      !0
    )
  );
}
function Hi(e, t, s, n, r) {
  return ar(
    De(
      e,
      t,
      s,
      n,
      r,
      !0
    )
  );
}
function dr(e) {
  return e ? e.__v_isVNode === !0 : !1;
}
function gt(e, t) {
  return e.type === t.type && e.key === t.key;
}
const hr = ({ key: e }) => e ?? null, Ht = ({
  ref: e,
  ref_key: t,
  ref_for: s
}) => (typeof e == "number" && (e = "" + e), e != null ? se(e) || ve(e) || q(e) ? { i: xe, r: e, k: t, f: !!s } : e : null);
function T(e, t = null, s = null, n = 0, r = null, i = e === Z ? 0 : 1, o = !1, c = !1) {
  const f = {
    __v_isVNode: !0,
    __v_skip: !0,
    type: e,
    props: t,
    key: t && hr(t),
    ref: t && Ht(t),
    scopeId: Zn,
    slotScopeIds: null,
    children: s,
    component: null,
    suspense: null,
    ssContent: null,
    ssFallback: null,
    dirs: null,
    transition: null,
    el: null,
    anchor: null,
    target: null,
    targetStart: null,
    targetAnchor: null,
    staticCount: 0,
    shapeFlag: i,
    patchFlag: n,
    dynamicProps: r,
    dynamicChildren: null,
    appContext: null,
    ctx: xe
  };
  return c ? (Ks(f, s), i & 128 && e.normalize(f)) : s && (f.shapeFlag |= se(s) ? 8 : 16), It > 0 && // avoid a block node from tracking itself
  !o && // has current parent block
  _e && // presence of a patch flag indicates this node needs patching on updates.
  // component nodes also should always be patched, because even if the
  // component doesn't need to update, it needs to persist the instance on to
  // the next vnode so that it can be properly unmounted later.
  (f.patchFlag > 0 || i & 6) && // the EVENTS flag is only for hydration and if it is the only flag, the
  // vnode should not be considered dynamic due to handler caching.
  f.patchFlag !== 32 && _e.push(f), f;
}
const De = Vi;
function Vi(e, t = null, s = null, n = 0, r = null, i = !1) {
  if ((!e || e === mi) && (e = ke), dr(e)) {
    const c = at(
      e,
      t,
      !0
      /* mergeRef: true */
    );
    return s && Ks(c, s), It > 0 && !i && _e && (c.shapeFlag & 6 ? _e[_e.indexOf(e)] = c : _e.push(c)), c.patchFlag = -2, c;
  }
  if (zi(e) && (e = e.__vccOpts), t) {
    t = Ki(t);
    let { class: c, style: f } = t;
    c && !se(c) && (t.class = St(c)), z(f) && (Ls(f) && !L(f) && (f = Le({}, f)), t.style = As(f));
  }
  const o = se(e) ? 1 : fr(e) ? 128 : ai(e) ? 64 : z(e) ? 4 : q(e) ? 2 : 0;
  return T(
    e,
    t,
    s,
    n,
    r,
    o,
    i,
    !0
  );
}
function Ki(e) {
  return e ? Ls(e) || nr(e) ? Le({}, e) : e : null;
}
function at(e, t, s = !1, n = !1) {
  const { props: r, ref: i, patchFlag: o, children: c, transition: f } = e, d = t ? Ui(r || {}, t) : r, a = {
    __v_isVNode: !0,
    __v_skip: !0,
    type: e.type,
    props: d,
    key: d && hr(d),
    ref: t && t.ref ? (
      // #2078 in the case of <component :is="vnode" ref="extra"/>
      // if the vnode itself already has a ref, cloneVNode will need to merge
      // the refs so the single vnode can be set on multiple refs
      s && i ? L(i) ? i.concat(Ht(t)) : [i, Ht(t)] : Ht(t)
    ) : i,
    scopeId: e.scopeId,
    slotScopeIds: e.slotScopeIds,
    children: c,
    target: e.target,
    targetStart: e.targetStart,
    targetAnchor: e.targetAnchor,
    staticCount: e.staticCount,
    shapeFlag: e.shapeFlag,
    // if the vnode is cloned with extra props, we can no longer assume its
    // existing patch flag to be reliable and need to add the FULL_PROPS flag.
    // note: preserve flag for fragments since they use the flag for children
    // fast paths only.
    patchFlag: t && e.type !== Z ? o === -1 ? 16 : o | 16 : o,
    dynamicProps: e.dynamicProps,
    dynamicChildren: e.dynamicChildren,
    appContext: e.appContext,
    dirs: e.dirs,
    transition: f,
    // These should technically only be non-null on mounted VNodes. However,
    // they *should* be copied for kept-alive vnodes. So we just always copy
    // them since them being non-null during a mount doesn't affect the logic as
    // they will simply be overwritten.
    component: e.component,
    suspense: e.suspense,
    ssContent: e.ssContent && at(e.ssContent),
    ssFallback: e.ssFallback && at(e.ssFallback),
    placeholder: e.placeholder,
    el: e.el,
    anchor: e.anchor,
    ctx: e.ctx,
    ce: e.ce
  };
  return f && n && js(
    a,
    f.clone(a)
  ), a;
}
function Vt(e = " ", t = 0) {
  return De(ts, null, e, t);
}
function pe(e = "", t = !1) {
  return t ? (P(), Hi(ke, null, e)) : De(ke, null, e);
}
function Ae(e) {
  return e == null || typeof e == "boolean" ? De(ke) : L(e) ? De(
    Z,
    null,
    // #3666, avoid reference pollution when reusing vnode
    e.slice()
  ) : dr(e) ? Ke(e) : De(ts, null, String(e));
}
function Ke(e) {
  return e.el === null && e.patchFlag !== -1 || e.memo ? e : at(e);
}
function Ks(e, t) {
  let s = 0;
  const { shapeFlag: n } = e;
  if (t == null)
    t = null;
  else if (L(t))
    s = 16;
  else if (typeof t == "object")
    if (n & 65) {
      const r = t.default;
      r && (r._c && (r._d = !1), Ks(e, r()), r._c && (r._d = !0));
      return;
    } else {
      s = 32;
      const r = t._;
      !r && !nr(t) ? t._ctx = xe : r === 3 && xe && (xe.slots._ === 1 ? t._ = 1 : (t._ = 2, e.patchFlag |= 1024));
    }
  else q(t) ? (t = { default: t, _ctx: xe }, s = 32) : (t = String(t), n & 64 ? (s = 16, t = [Vt(t)]) : s = 8);
  e.children = t, e.shapeFlag |= s;
}
function Ui(...e) {
  const t = {};
  for (let s = 0; s < e.length; s++) {
    const n = e[s];
    for (const r in n)
      if (r === "class")
        t.class !== n.class && (t.class = St([t.class, n.class]));
      else if (r === "style")
        t.style = As([t.style, n.style]);
      else if (Jt(r)) {
        const i = t[r], o = n[r];
        o && i !== o && !(L(i) && i.includes(o)) && (t[r] = i ? [].concat(i, o) : o);
      } else r !== "" && (t[r] = n[r]);
  }
  return t;
}
function Ie(e, t, s, n = null) {
  Qe(e, t, 7, [
    s,
    n
  ]);
}
const Bi = er();
let ki = 0;
function Wi(e, t, s) {
  const n = e.type, r = (t ? t.appContext : e.appContext) || Bi, i = {
    uid: ki++,
    vnode: e,
    type: n,
    parent: t,
    appContext: r,
    root: null,
    // to be immediately set
    next: null,
    subTree: null,
    // will be set synchronously right after creation
    effect: null,
    update: null,
    // will be set synchronously right after creation
    job: null,
    scope: new Rr(
      !0
      /* detached */
    ),
    render: null,
    proxy: null,
    exposed: null,
    exposeProxy: null,
    withProxy: null,
    provides: t ? t.provides : Object.create(r.provides),
    ids: t ? t.ids : ["", 0, 0],
    accessCache: null,
    renderCache: [],
    // local resolved assets
    components: null,
    directives: null,
    // resolved props and emits options
    propsOptions: wi(n, r),
    emitsOptions: Pi(n, r),
    // emit
    emit: null,
    // to be set immediately
    emitted: null,
    // props default value
    propsDefaults: Y,
    // inheritAttrs
    inheritAttrs: n.inheritAttrs,
    // state
    ctx: Y,
    data: Y,
    props: Y,
    attrs: Y,
    slots: Y,
    refs: Y,
    setupState: Y,
    setupContext: null,
    // suspense related
    suspense: s,
    suspenseId: s ? s.pendingId : 0,
    asyncDep: null,
    asyncResolved: !1,
    // lifecycle hooks
    // not using enums here because it results in computed properties
    isMounted: !1,
    isUnmounted: !1,
    isDeactivated: !1,
    bc: null,
    c: null,
    bm: null,
    m: null,
    bu: null,
    u: null,
    um: null,
    bum: null,
    da: null,
    a: null,
    rtg: null,
    rtc: null,
    ec: null,
    sp: null
  };
  return i.ctx = { _: i }, i.root = t ? t.root : i, i.emit = Ri.bind(null, i), e.ce && e.ce(i), i;
}
let qt = null, Yt, ws;
{
  const e = Qt(), t = (s, n) => {
    let r;
    return (r = e[s]) || (r = e[s] = []), r.push(n), (i) => {
      r.length > 1 ? r.forEach((o) => o(i)) : r[0](i);
    };
  };
  Yt = t(
    "__VUE_INSTANCE_SETTERS__",
    (s) => qt = s
  ), ws = t(
    "__VUE_SSR_SETTERS__",
    (s) => mr = s
  );
}
const pr = (e) => {
  const t = qt;
  return Yt(e), e.scope.on(), () => {
    e.scope.off(), Yt(t);
  };
}, sn = () => {
  qt && qt.scope.off(), Yt(null);
};
function gr(e) {
  return e.vnode.shapeFlag & 4;
}
let mr = !1;
function qi(e, t = !1, s = !1) {
  t && ws(t);
  const { props: n, children: r } = e.vnode, i = gr(e);
  yi(e, n, i, t), Ti(e, r, s || t);
  const o = i ? Yi(e, t) : void 0;
  return t && ws(!1), o;
}
function Yi(e, t) {
  const s = e.type;
  e.accessCache = /* @__PURE__ */ Object.create(null), e.proxy = new Proxy(e.ctx, _i);
  const { setup: n } = s;
  if (n) {
    ut();
    const r = e.setupContext = n.length > 1 ? Gi(e) : null, i = pr(e), o = Mt(
      n,
      e,
      0,
      [
        e.props,
        r
      ]
    ), c = Cn(o);
    if (ft(), i(), (c || e.sp) && !yt(e) && pi(e), c) {
      if (o.then(sn, sn), t)
        return o.then((f) => {
          nn(e, f);
        }).catch((f) => {
          Zt(f, e, 0);
        });
      e.asyncDep = o;
    } else
      nn(e, o);
  } else
    _r(e);
}
function nn(e, t, s) {
  q(t) ? e.type.__ssrInlineRender ? e.ssrRender = t : e.render = t : z(t) && (e.setupState = Yn(t)), _r(e);
}
function _r(e, t, s) {
  const n = e.type;
  e.render || (e.render = n.render || Cs);
}
const Ji = {
  get(e, t) {
    return oe(e, "get", ""), e[t];
  }
};
function Gi(e) {
  const t = (s) => {
    e.exposed = s || {};
  };
  return {
    attrs: new Proxy(e.attrs, Ji),
    slots: e.slots,
    emit: e.emit,
    expose: t
  };
}
function ss(e) {
  return e.exposed ? e.exposeProxy || (e.exposeProxy = new Proxy(Yn(Xr(e.exposed)), {
    get(t, s) {
      if (s in t)
        return t[s];
      if (s in xt)
        return xt[s](e);
    },
    has(t, s) {
      return s in t || s in xt;
    }
  })) : e.proxy;
}
function zi(e) {
  return q(e) && "__vccOpts" in e;
}
const Lt = (e, t) => ri(e, t, mr), Qi = "3.5.24";
/**
* @vue/runtime-dom v3.5.24
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
let Ss;
const rn = typeof window < "u" && window.trustedTypes;
if (rn)
  try {
    Ss = /* @__PURE__ */ rn.createPolicy("vue", {
      createHTML: (e) => e
    });
  } catch {
  }
const vr = Ss ? (e) => Ss.createHTML(e) : (e) => e, Xi = "http://www.w3.org/2000/svg", Zi = "http://www.w3.org/1998/Math/MathML", Fe = typeof document < "u" ? document : null, on = Fe && /* @__PURE__ */ Fe.createElement("template"), eo = {
  insert: (e, t, s) => {
    t.insertBefore(e, s || null);
  },
  remove: (e) => {
    const t = e.parentNode;
    t && t.removeChild(e);
  },
  createElement: (e, t, s, n) => {
    const r = t === "svg" ? Fe.createElementNS(Xi, e) : t === "mathml" ? Fe.createElementNS(Zi, e) : s ? Fe.createElement(e, { is: s }) : Fe.createElement(e);
    return e === "select" && n && n.multiple != null && r.setAttribute("multiple", n.multiple), r;
  },
  createText: (e) => Fe.createTextNode(e),
  createComment: (e) => Fe.createComment(e),
  setText: (e, t) => {
    e.nodeValue = t;
  },
  setElementText: (e, t) => {
    e.textContent = t;
  },
  parentNode: (e) => e.parentNode,
  nextSibling: (e) => e.nextSibling,
  querySelector: (e) => Fe.querySelector(e),
  setScopeId(e, t) {
    e.setAttribute(t, "");
  },
  // __UNSAFE__
  // Reason: innerHTML.
  // Static content here can only come from compiled templates.
  // As long as the user only uses trusted templates, this is safe.
  insertStaticContent(e, t, s, n, r, i) {
    const o = s ? s.previousSibling : t.lastChild;
    if (r && (r === i || r.nextSibling))
      for (; t.insertBefore(r.cloneNode(!0), s), !(r === i || !(r = r.nextSibling)); )
        ;
    else {
      on.innerHTML = vr(
        n === "svg" ? `<svg>${e}</svg>` : n === "mathml" ? `<math>${e}</math>` : e
      );
      const c = on.content;
      if (n === "svg" || n === "mathml") {
        const f = c.firstChild;
        for (; f.firstChild; )
          c.appendChild(f.firstChild);
        c.removeChild(f);
      }
      t.insertBefore(c, s);
    }
    return [
      // first
      o ? o.nextSibling : t.firstChild,
      // last
      s ? s.previousSibling : t.lastChild
    ];
  }
}, to = Symbol("_vtc");
function so(e, t, s) {
  const n = e[to];
  n && (t = (t ? [t, ...n] : [...n]).join(" ")), t == null ? e.removeAttribute("class") : s ? e.setAttribute("class", t) : e.className = t;
}
const ln = Symbol("_vod"), no = Symbol("_vsh"), ro = Symbol(""), io = /(?:^|;)\s*display\s*:/;
function oo(e, t, s) {
  const n = e.style, r = se(s);
  let i = !1;
  if (s && !r) {
    if (t)
      if (se(t))
        for (const o of t.split(";")) {
          const c = o.slice(0, o.indexOf(":")).trim();
          s[c] == null && Kt(n, c, "");
        }
      else
        for (const o in t)
          s[o] == null && Kt(n, o, "");
    for (const o in s)
      o === "display" && (i = !0), Kt(n, o, s[o]);
  } else if (r) {
    if (t !== s) {
      const o = n[ro];
      o && (s += ";" + o), n.cssText = s, i = io.test(s);
    }
  } else t && e.removeAttribute("style");
  ln in e && (e[ln] = i ? n.display : "", e[no] && (n.display = "none"));
}
const cn = /\s*!important$/;
function Kt(e, t, s) {
  if (L(s))
    s.forEach((n) => Kt(e, t, n));
  else if (s == null && (s = ""), t.startsWith("--"))
    e.setProperty(t, s);
  else {
    const n = lo(e, t);
    cn.test(s) ? e.setProperty(
      Xe(n),
      s.replace(cn, ""),
      "important"
    ) : e[n] = s;
  }
}
const un = ["Webkit", "Moz", "ms"], as = {};
function lo(e, t) {
  const s = as[t];
  if (s)
    return s;
  let n = Ue(t);
  if (n !== "filter" && n in e)
    return as[t] = n;
  n = Mn(n);
  for (let r = 0; r < un.length; r++) {
    const i = un[r] + n;
    if (i in e)
      return as[t] = i;
  }
  return t;
}
const fn = "http://www.w3.org/1999/xlink";
function an(e, t, s, n, r, i = Or(t)) {
  n && t.startsWith("xlink:") ? s == null ? e.removeAttributeNS(fn, t.slice(6, t.length)) : e.setAttributeNS(fn, t, s) : s == null || i && !On(s) ? e.removeAttribute(t) : e.setAttribute(
    t,
    i ? "" : We(s) ? String(s) : s
  );
}
function dn(e, t, s, n, r) {
  if (t === "innerHTML" || t === "textContent") {
    s != null && (e[t] = t === "innerHTML" ? vr(s) : s);
    return;
  }
  const i = e.tagName;
  if (t === "value" && i !== "PROGRESS" && // custom elements may use _value internally
  !i.includes("-")) {
    const c = i === "OPTION" ? e.getAttribute("value") || "" : e.value, f = s == null ? (
      // #11647: value should be set as empty string for null and undefined,
      // but <input type="checkbox"> should be set as 'on'.
      e.type === "checkbox" ? "on" : ""
    ) : String(s);
    (c !== f || !("_value" in e)) && (e.value = f), s == null && e.removeAttribute(t), e._value = s;
    return;
  }
  let o = !1;
  if (s === "" || s == null) {
    const c = typeof e[t];
    c === "boolean" ? s = On(s) : s == null && c === "string" ? (s = "", o = !0) : c === "number" && (s = 0, o = !0);
  }
  try {
    e[t] = s;
  } catch {
  }
  o && e.removeAttribute(r || t);
}
function rt(e, t, s, n) {
  e.addEventListener(t, s, n);
}
function co(e, t, s, n) {
  e.removeEventListener(t, s, n);
}
const hn = Symbol("_vei");
function uo(e, t, s, n, r = null) {
  const i = e[hn] || (e[hn] = {}), o = i[t];
  if (n && o)
    o.value = n;
  else {
    const [c, f] = fo(t);
    if (n) {
      const d = i[t] = po(
        n,
        r
      );
      rt(e, c, d, f);
    } else o && (co(e, c, o, f), i[t] = void 0);
  }
}
const pn = /(?:Once|Passive|Capture)$/;
function fo(e) {
  let t;
  if (pn.test(e)) {
    t = {};
    let n;
    for (; n = e.match(pn); )
      e = e.slice(0, e.length - n[0].length), t[n[0].toLowerCase()] = !0;
  }
  return [e[2] === ":" ? e.slice(3) : Xe(e.slice(2)), t];
}
let ds = 0;
const ao = /* @__PURE__ */ Promise.resolve(), ho = () => ds || (ao.then(() => ds = 0), ds = Date.now());
function po(e, t) {
  const s = (n) => {
    if (!n._vts)
      n._vts = Date.now();
    else if (n._vts <= s.attached)
      return;
    Qe(
      go(n, s.value),
      t,
      5,
      [n]
    );
  };
  return s.value = e, s.attached = ho(), s;
}
function go(e, t) {
  if (L(t)) {
    const s = e.stopImmediatePropagation;
    return e.stopImmediatePropagation = () => {
      s.call(e), e._stopped = !0;
    }, t.map(
      (n) => (r) => !r._stopped && n && n(r)
    );
  } else
    return t;
}
const gn = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && // lowercase letter
e.charCodeAt(2) > 96 && e.charCodeAt(2) < 123, mo = (e, t, s, n, r, i) => {
  const o = r === "svg";
  t === "class" ? so(e, n, o) : t === "style" ? oo(e, s, n) : Jt(t) ? Es(t) || uo(e, t, s, n, i) : (t[0] === "." ? (t = t.slice(1), !0) : t[0] === "^" ? (t = t.slice(1), !1) : _o(e, t, n, o)) ? (dn(e, t, n), !e.tagName.includes("-") && (t === "value" || t === "checked" || t === "selected") && an(e, t, n, o, i, t !== "value")) : /* #11081 force set props for possible async custom element */ e._isVueCE && (/[A-Z]/.test(t) || !se(n)) ? dn(e, Ue(t), n, i, t) : (t === "true-value" ? e._trueValue = n : t === "false-value" && (e._falseValue = n), an(e, t, n, o));
};
function _o(e, t, s, n) {
  if (n)
    return !!(t === "innerHTML" || t === "textContent" || t in e && gn(t) && q(s));
  if (t === "spellcheck" || t === "draggable" || t === "translate" || t === "autocorrect" || t === "sandbox" && e.tagName === "IFRAME" || t === "form" || t === "list" && e.tagName === "INPUT" || t === "type" && e.tagName === "TEXTAREA")
    return !1;
  if (t === "width" || t === "height") {
    const r = e.tagName;
    if (r === "IMG" || r === "VIDEO" || r === "CANVAS" || r === "SOURCE")
      return !1;
  }
  return gn(t) && se(s) ? !1 : t in e;
}
const mn = (e) => {
  const t = e.props["onUpdate:modelValue"] || !1;
  return L(t) ? (s) => jt(t, s) : t;
};
function vo(e) {
  e.target.composing = !0;
}
function _n(e) {
  const t = e.target;
  t.composing && (t.composing = !1, t.dispatchEvent(new Event("input")));
}
const hs = Symbol("_assign");
function vn(e, t, s) {
  return t && (e = e.trim()), s && (e = Ms(e)), e;
}
const bn = {
  created(e, { modifiers: { lazy: t, trim: s, number: n } }, r) {
    e[hs] = mn(r);
    const i = n || r.props && r.props.type === "number";
    rt(e, t ? "change" : "input", (o) => {
      o.target.composing || e[hs](vn(e.value, s, i));
    }), (s || i) && rt(e, "change", () => {
      e.value = vn(e.value, s, i);
    }), t || (rt(e, "compositionstart", vo), rt(e, "compositionend", _n), rt(e, "change", _n));
  },
  // set value on mounted so it's after min/max for type="range"
  mounted(e, { value: t }) {
    e.value = t ?? "";
  },
  beforeUpdate(e, { value: t, oldValue: s, modifiers: { lazy: n, trim: r, number: i } }, o) {
    if (e[hs] = mn(o), e.composing) return;
    const c = (i || e.type === "number") && !/^0\d/.test(e.value) ? Ms(e.value) : e.value, f = t ?? "";
    c !== f && (document.activeElement === e && e.type !== "range" && (n && t === s || r && e.value.trim() === f) || (e.value = f));
  }
}, bo = ["ctrl", "shift", "alt", "meta"], yo = {
  stop: (e) => e.stopPropagation(),
  prevent: (e) => e.preventDefault(),
  self: (e) => e.target !== e.currentTarget,
  ctrl: (e) => !e.ctrlKey,
  shift: (e) => !e.shiftKey,
  alt: (e) => !e.altKey,
  meta: (e) => !e.metaKey,
  left: (e) => "button" in e && e.button !== 0,
  middle: (e) => "button" in e && e.button !== 1,
  right: (e) => "button" in e && e.button !== 2,
  exact: (e, t) => bo.some((s) => e[`${s}Key`] && !t.includes(s))
}, yn = (e, t) => {
  const s = e._withMods || (e._withMods = {}), n = t.join(".");
  return s[n] || (s[n] = (r, ...i) => {
    for (let o = 0; o < t.length; o++) {
      const c = yo[t[o]];
      if (c && c(r, t)) return;
    }
    return e(r, ...i);
  });
}, xo = /* @__PURE__ */ Le({ patchProp: mo }, eo);
let xn;
function wo() {
  return xn || (xn = Ei(xo));
}
const So = (...e) => {
  const t = wo().createApp(...e), { mount: s } = t;
  return t.mount = (n) => {
    const r = Co(n);
    if (!r) return;
    const i = t._component;
    !q(i) && !i.render && !i.template && (i.template = r.innerHTML), r.nodeType === 1 && (r.textContent = "");
    const o = s(r, !1, To(r));
    return r instanceof Element && (r.removeAttribute("v-cloak"), r.setAttribute("data-v-app", "")), o;
  }, t;
};
function To(e) {
  if (e instanceof SVGElement)
    return "svg";
  if (typeof MathMLElement == "function" && e instanceof MathMLElement)
    return "mathml";
}
function Co(e) {
  return se(e) ? document.querySelector(e) : e;
}
const Eo = [
  ["下雨", "雨天", "淋雨", "雨停", "大雨", "小雨", "阵雨", "雷雨", "冒雨", "阴雨"],
  ["晴天", "晴朗", "大晴", "艳阳", "阳光", "放晴", "天晴"],
  ["晚霞", "夕阳", "日落", "黄昏", "落日", "暮色"],
  ["清晨", "早上", "早晨", "晨光", "日出", "清早"],
  ["夜里", "夜晚", "深夜", "晚上", "夜色", "月光"],
  ["河边", "江边", "河岸", "溪边", "水边", "沿河"],
  ["海边", "海岸", "沙滩", "海滩", "海风", "海浪"],
  ["咖啡", "咖啡店", "咖啡馆", "拿铁", "美式"],
  ["看书", "读书", "阅读", "书店", "翻书"],
  ["散步", "溜达", "走走", "漫步", "步行"],
  ["开心", "雀跃", "高兴", "愉快", "快乐", "喜悦"],
  ["难过", "低落", "伤心", "沮丧", "失落", "郁闷"],
  ["平静", "安宁", "安静", "宁静", "舒缓"]
], Io = /(?:没有|没|未|未曾|不曾|并非|不是)[^，。！？；\n]{0,6}$/;
function ps(e, t) {
  let s = e.indexOf(t);
  for (; s !== -1; ) {
    const n = e.slice(Math.max(0, s - 8), s);
    if (!Io.test(n)) return !0;
    s = e.indexOf(t, s + t.length);
  }
  return !1;
}
function Mo(e) {
  const t = [...new Set(e.map((n) => n.toLowerCase().trim()).filter(Boolean))], s = /* @__PURE__ */ new Map();
  for (const n of t) {
    const r = /* @__PURE__ */ new Set();
    for (const i of Eo)
      if (i.some((o) => n.includes(o) || o.includes(n)))
        for (const o of i) o !== n && r.add(o);
    if (/^[\u4e00-\u9fff]{3,}$/.test(n))
      for (let i = 0; i < n.length - 1; i++)
        r.add(n.slice(i, i + 2));
    s.set(n, [...r]);
  }
  return { exact: t, expanded: s };
}
function br(e) {
  var i, o, c, f, d, a, g, S, A;
  const t = [], s = (F, $, Q) => {
    if (typeof $ == "string" && $.trim())
      for (let R = 0; R < $.length; R += 8e3) t.push({ field: $.length > 8e3 ? `${F}_part_${R / 8e3}` : F, text: $.slice(R, R + 8e3), origin: Q });
  };
  s("user_note", e.note, "user"), s("user_supplement", e.extra, "user");
  for (const [F, $] of (e.chat ?? []).slice(0, 100).entries()) $.role === "me" && s(`user_turn_${F}`, $.text, "user");
  s("user_mood", (i = e.mood) == null ? void 0 : i.label, "user");
  const n = new Date(e.ts ?? ""), r = Number.isNaN(n.getTime()) ? "日期未知" : `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
  return r !== "日期未知" && s("record_date", r, "metadata"), s("image_scene", (o = e.facts) == null ? void 0 : o.scene, "image_model"), s("image_light", (c = e.facts) == null ? void 0 : c.light, "image_model"), s("image_subjects", (d = (f = e.facts) == null ? void 0 : f.subjects) == null ? void 0 : d.join("、"), "image_model"), s("image_text", (g = (a = e.facts) == null ? void 0 : a.text_spans) == null ? void 0 : g.join(`
`), "image_model"), { id: e.id, date: r, title: (e.note || ((A = (S = e.chat) == null ? void 0 : S.find((F) => F.role === "me")) == null ? void 0 : A.text) || "一条记录").slice(0, 80), sources: t, generated: String(e.final || e.draft || "").slice(0, 2e3) };
}
function Ao(e, t) {
  const { exact: s, expanded: n } = Mo(t.terms), r = e.flatMap((i) => {
    if (t.from && i.date < t.from || t.to && i.date > t.to) return [];
    const o = i.sources.filter((a) => a.origin !== "image_model").map((a) => a.text).join(`
`).toLowerCase(), c = i.sources.filter((a) => a.origin === "image_model").map((a) => a.text).join(`
`).toLowerCase(), f = i.generated.toLowerCase(), d = s.reduce((a, g) => {
      if (o.includes(g)) return a + 4;
      if (c.includes(g)) return a + 2;
      if (f.includes(g)) return a + 1;
      const S = n.get(g) ?? [];
      return S.some((A) => ps(o, A)) ? a + 2.5 : S.some((A) => ps(c, A)) ? a + 1.2 : S.some((A) => ps(f, A)) ? a + 0.5 : a;
    }, 0);
    return d ? [{ memory: i, score: d }] : [];
  }).sort((i, o) => o.score - i.score || o.memory.date.localeCompare(i.memory.date));
  return { matches: r.slice(0, Math.min(12, Math.max(1, t.limit))).map(({ memory: i }) => ({ id: i.id, title: i.title, date: i.date, excerpt: i.sources.filter((o) => o.origin === "user").map((o) => o.text).join(`
`).slice(0, 500) })), total: r.length, searched: e.length };
}
const Oo = { list: async () => {
  var e, t;
  return await ((e = window.LuminaRecords) == null ? void 0 : e.ready), (((t = window.LuminaRecords) == null ? void 0 : t.list()) ?? []).map(br);
} };
function Ro() {
  const e = (/* @__PURE__ */ new Date()).getFullYear() - 1;
  return [
    { id: "synthetic-rain", ts: `${e}-09-18T18:00:00+08:00`, note: "傍晚在河边看晚霞。刚坐下就下雨了，我在桥下等雨停。" },
    { id: "synthetic-friend", ts: `${e}-09-25T18:00:00+08:00`, note: "今天和小林去了河边看晚霞。全程晴天，没有下雨。我们沿河走回家。" },
    { id: "synthetic-coffee", ts: `${e}-10-02T14:00:00+08:00`, note: "下午和小林在咖啡店聊天，没有去河边。" }
  ].map(br);
}
const Po = {
  class: "er-workspace",
  "aria-label": "证据回忆工作台"
}, Fo = { class: "er-intro" }, $o = ["disabled"], Do = {
  key: 0,
  class: "er-demo",
  role: "note"
}, No = { class: "er-search-row" }, Lo = ["disabled"], jo = ["disabled"], Ho = {
  class: "er-stage",
  role: "status",
  "aria-live": "polite"
}, Vo = {
  key: 1,
  class: "er-error",
  role: "alert"
}, Ko = {
  key: 2,
  class: "er-verdict"
}, Uo = {
  key: 3,
  class: "er-grid"
}, Bo = { class: "er-panel er-clues" }, ko = ["aria-pressed", "onClick"], Wo = {
  key: 0,
  class: "er-corrections"
}, qo = { class: "er-panel er-candidates" }, Yo = {
  key: 0,
  class: "er-hint"
}, Jo = ["aria-pressed", "onClick"], Go = { class: "er-date" }, zo = { class: "er-hint" }, Qo = ["data-status"], Xo = { class: "er-panel er-evidence" }, Zo = { class: "er-date" }, el = ["data-status"], tl = {
  key: 0,
  class: "er-hint"
}, sl = { class: "er-original" }, nl = { key: 0 }, rl = { key: 0 }, il = {
  key: 1,
  class: "er-hint"
}, ol = {
  key: 1,
  class: "er-hint"
}, ll = {
  key: 4,
  class: "er-refine"
}, cl = { class: "er-options" }, ul = ["disabled", "onClick"], fl = { class: "er-search-row" }, al = ["disabled"], dl = ["disabled"], hl = {
  key: 5,
  class: "er-trace"
}, pl = {
  key: 6,
  class: "er-hint"
}, gl = /* @__PURE__ */ hi({
  __name: "Workspace",
  setup(e) {
    const t = he(""), s = he(""), n = he([]), r = he(""), i = he(!1), o = he("说说你记得的片段，线索记不准也没关系。"), c = he(""), f = he(!1), d = he(null), a = he([]), g = he(""), S = he(""), A = he([]), F = he(null), $ = /* @__PURE__ */ new Set();
    let Q = 0;
    const R = Lt(() => a.value.find((H) => H.id === g.value)), X = Lt(() => {
      var H;
      return (((H = d.value) == null ? void 0 : H.candidates) ?? []).map((E) => ({ ...E, memory: a.value.find((J) => J.id === E.memoryId) })).filter((E) => E.memory);
    }), le = { supported: "原文支持", conflict: "明确冲突", unknown: "没有足够证据" }, ie = (H) => ({ user_note: "用户原话", user_supplement: "用户补充", user_mood: "自选心情", record_date: "记录日期", image_scene: "图像分析·场景", image_light: "图像分析·光线", image_subjects: "图像分析·主体", image_text: "图像分析·文字" })[H] ?? (H.startsWith("user_turn_") ? "用户对话原话" : H), qe = Lt(() => d.value ? d.value.status === "matched" ? "一条记录与当前线索吻合" : d.value.status === "uncertain" ? "有相关记录，暂时无法确认是哪一次" : "现有记录无法确认这段经历" : ""), At = Lt(() => {
      var H;
      return (((H = d.value) == null ? void 0 : H.comparisons) ?? []).filter((E) => E.memoryId === g.value && (!S.value || E.clueId === S.value));
    });
    async function Ze(H, E, J) {
      var te;
      const ee = new AbortController(), C = () => ee.abort();
      J.addEventListener("abort", C, { once: !0 }), J.aborted && ee.abort();
      const B = window.setTimeout(() => ee.abort(), 1e5);
      try {
        const G = await fetch(`/api/recall/${H}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(E), signal: ee.signal }), je = await G.json();
        if (!G.ok) throw new Error(((te = je.error) == null ? void 0 : te.message) || `请求失败（${G.status}）`);
        return je;
      } finally {
        clearTimeout(B), J.removeEventListener("abort", C);
      }
    }
    function Oe() {
      var H;
      Q++, (H = F.value) == null || H.abort(), F.value = null, i.value = !1, o.value = "已停止。可以调整线索后重新查找。";
    }
    function Ot(H, E) {
      var J;
      return (J = d.value) == null ? void 0 : J.comparisons.find((ee) => ee.memoryId === H && ee.clueId === E);
    }
    function dt(H) {
      g.value = H;
    }
    function Rt(H) {
      S.value = S.value === H ? "" : H;
    }
    async function Pt(H = !1) {
      var je;
      if (i.value) return;
      const E = t.value.trim();
      if (!E) {
        c.value = "先写一句你记得的片段。";
        return;
      }
      H || (n.value = []), i.value = !0;
      const J = ++Q;
      let ee;
      try {
        ee = f.value ? Ro() : await Oo.list();
      } catch {
        i.value = !1, c.value = "本地数据库未能读取，记录没有改动。请重试。";
        return;
      }
      if (J !== Q) return;
      if (!ee.length) {
        i.value = !1, c.value = "这台设备还没有记录。先记一条，或试用合成案例。";
        return;
      }
      a.value = ee, i.value = !0, c.value = "", d.value = null, A.value = [], g.value = "", S.value = "", $.clear(), r.value = E;
      const C = new AbortController();
      F.value = C;
      const B = /* @__PURE__ */ new Date(), te = `${B.getFullYear()}-${String(B.getMonth() + 1).padStart(2, "0")}-${String(B.getDate()).padStart(2, "0")}`, G = performance.now();
      try {
        o.value = "正在理解线索，决定检索条件…";
        let ce = await Ze("start", { query: E, corrections: n.value, today: te }, C.signal);
        for (let He = 0; ce.phase === "tools"; He++) {
          if (He >= 4) throw new Error("已到检索轮数上限，请减少或调整线索后重试。");
          const Se = (ce.calls ?? []).map((ne) => {
            let ye, et;
            if (ne.name === "search_memories") {
              const ue = ne.args;
              o.value = "正在本机查找相关记录…";
              const Ye = Ao(a.value, ue);
              ye = Ye, et = `检索 ${Ye.searched} 条，命中 ${Ye.total} 条，返回 ${Ye.matches.length} 条`;
            } else if (ne.name === "get_memory") {
              o.value = "正在读取候选原文…";
              const ue = a.value.find((Ye) => Ye.id === ne.args.id) ?? null;
              ue && $.add(ue.id), ye = { memory: ue ? { ...ue, generated: "" } : null }, et = ue ? `已读取 ${ue.date} 的记录及 ${ue.sources.length} 个来源字段` : "原始记录不存在";
            } else throw new Error("模型请求了不支持的工具。");
            return A.value.push({ name: ne.name, args: JSON.stringify(ne.args), result: et, time: Math.round(performance.now() - G) }), { callId: ne.id, result: ye };
          });
          o.value = "正在对照原文，并检查引用和语义…", ce = await Ze("continue", { sessionId: ce.sessionId, results: Se }, C.signal);
        }
        if (J !== Q) return;
        if (!ce.result) throw new Error("没有收到完整的证据结果，请重试。");
        for (const He of ce.result.comparisons) {
          const Se = a.value.find((ne) => ne.id === He.memoryId);
          if (!$.has(He.memoryId) || !Se || He.sources.some((ne) => !Se.sources.some((ye) => ye.field === ne.field && ye.origin !== "image_model" && ye.text.includes(ne.quote))))
            throw new Error("证据与本地原文不一致，本次结果未展示。请重新查找。");
        }
        d.value = ce.result, g.value = ((je = ce.result.candidates[0]) == null ? void 0 : je.memoryId) ?? "", o.value = `已完成 ${A.value.length} 次本地工具执行；${((performance.now() - G) / 1e3).toFixed(1)} 秒。`;
      } catch (ce) {
        if (J !== Q) return;
        c.value = C.signal.aborted ? "已停止检索。" : ce instanceof DOMException && ce.name === "AbortError" ? "请求超时，请稍后重试。" : ce instanceof Error ? ce.message : "检索失败，请稍后重试。", o.value = "这次没有生成结论，也没有修改日记。";
      } finally {
        J === Q && (i.value = !1, F.value = null);
      }
    }
    function Ft(H) {
      if (n.value.length >= 8) {
        c.value = "已达到本轮澄清上限，请开启一次新查询。";
        return;
      }
      n.value.push(H), s.value = "", Pt(!0);
    }
    function $t() {
      Oe(), f.value = !f.value, d.value = null, A.value = [], n.value = [], a.value = [], g.value = "", c.value = "", t.value = f.value ? "我记得去年有次和小林在河边看晚霞，好像还下雨了。" : "", o.value = f.value ? "当前使用三条合成日记；点击查找后将真实执行模型和本地工具。" : "已切回这台设备的记录。";
    }
    return (H, E) => {
      var J, ee;
      return P(), D("section", Po, [
        T("div", Fo, [
          E[4] || (E[4] = T("div", null, [
            T("p", { class: "er-eyebrow" }, "聊着找"),
            T("h2", null, "把记得的片段，放回原文里核对。"),
            T("p", null, "线索可以不完整，也可以改。没写下来的事，先留作未知。")
          ], -1)),
          T("button", {
            class: "er-link",
            type: "button",
            disabled: i.value,
            onClick: $t
          }, j(f.value ? "返回我的记录" : "试用合成案例"), 9, $o)
        ]),
        f.value ? (P(), D("p", Do, "合成案例 · 仅在此工作台临时使用，不会写入、覆盖或同步你的日记。模型输出不预设。")) : pe("", !0),
        T("form", {
          class: "er-search",
          onSubmit: E[1] || (E[1] = yn((C) => Pt(!1), ["prevent"]))
        }, [
          E[5] || (E[5] = T("label", { for: "er-query" }, "你记得什么？", -1)),
          T("div", No, [
            Gs(T("textarea", {
              id: "er-query",
              "onUpdate:modelValue": E[0] || (E[0] = (C) => t.value = C),
              disabled: i.value,
              maxlength: "1000",
              rows: "2",
              placeholder: "记得和谁、在哪儿，或者那时的心情…"
            }, null, 8, Lo), [
              [bn, t.value]
            ]),
            T("button", {
              class: "er-primary",
              type: "submit",
              disabled: i.value
            }, j(i.value ? "正在核对…" : "查找并核对"), 9, jo),
            i.value ? (P(), D("button", {
              key: 0,
              class: "er-link",
              type: "button",
              onClick: Oe
            }, "停止")) : pe("", !0)
          ]),
          E[6] || (E[6] = T("small", null, "检索在本机执行；匹配摘要和选中候选的文字会发送给 AI 服务核对，照片不会随本次查询上传。这里的纠正只改变线索。", -1))
        ], 32),
        T("p", Ho, j(o.value), 1),
        c.value ? (P(), D("p", Vo, j(c.value), 1)) : pe("", !0),
        d.value ? (P(), D("div", Ko, [
          T("h3", null, j(qe.value), 1),
          T("p", null, "这是记录与线索的吻合情况，不能证明当时实际发生了什么。" + j(d.value.rejected ? `有 ${d.value.rejected} 项判断未通过核验，已按未知处理。` : ""), 1)
        ])) : pe("", !0),
        d.value ? (P(), D("div", Uo, [
          T("aside", Bo, [
            E[8] || (E[8] = T("h3", null, "你的线索", -1)),
            E[9] || (E[9] = T("p", { class: "er-hint" }, "点选一条，查看候选与原文如何对应。", -1)),
            (P(!0), D(Z, null, Pe(d.value.clues, (C) => (P(), D("button", {
              key: C.id,
              class: St(["er-clue", { active: S.value === C.id }]),
              "aria-pressed": S.value === C.id,
              onClick: (B) => Rt(C.id)
            }, j(C.text), 11, ko))), 128)),
            n.value.length ? (P(), D("div", Wo, [
              E[7] || (E[7] = T("h4", null, "本轮纠正", -1)),
              (P(!0), D(Z, null, Pe(n.value, (C, B) => (P(), D("p", { key: B }, j(C), 1))), 128))
            ])) : pe("", !0)
          ]),
          T("section", qo, [
            T("h3", null, [
              E[10] || (E[10] = Vt("候选记忆 ", -1)),
              T("span", null, j(X.value.length), 1)
            ]),
            X.value.length ? pe("", !0) : (P(), D("p", Yo, "没有读到可用候选。可以删除不确定的日期或换一个场景词。")),
            (P(!0), D(Z, null, Pe(X.value, (C) => (P(), D("button", {
              key: C.memoryId,
              class: St(["er-memory", { active: g.value === C.memoryId }]),
              "aria-pressed": g.value === C.memoryId,
              onClick: (B) => dt(C.memoryId)
            }, [
              T("span", Go, j(C.memory.date), 1),
              T("strong", null, j(C.memory.title), 1),
              T("span", zo, j(C.supported) + " 条线索有支持 · " + j(C.conflicts) + " 条明确冲突", 1),
              (P(!0), D(Z, null, Pe(d.value.clues.filter((B) => !S.value || B.id === S.value), (B) => {
                var te, G;
                return P(), D("span", {
                  key: B.id,
                  class: "er-matrix"
                }, [
                  T("span", null, j(B.text), 1),
                  T("span", {
                    class: "er-tag",
                    "data-status": ((te = Ot(C.memoryId, B.id)) == null ? void 0 : te.status) ?? "unknown"
                  }, j(le[((G = Ot(C.memoryId, B.id)) == null ? void 0 : G.status) ?? "unknown"]), 9, Qo)
                ]);
              }), 128))
            ], 10, Jo))), 128))
          ]),
          T("section", Xo, [
            E[13] || (E[13] = T("h3", null, "原始证据", -1)),
            R.value ? (P(), D(Z, { key: 0 }, [
              T("p", Zo, j(R.value.date) + " · " + j(R.value.id), 1),
              (P(!0), D(Z, null, Pe(At.value, (C) => {
                var B;
                return P(), D("article", {
                  key: C.clueId,
                  class: "er-proof"
                }, [
                  T("h4", null, j((B = d.value.clues.find((te) => te.id === C.clueId)) == null ? void 0 : B.text), 1),
                  T("span", {
                    class: "er-tag",
                    "data-status": C.status
                  }, j(le[C.status]), 9, el),
                  C.status === "unknown" ? (P(), D("p", tl, "没有找到足够的原文依据。未提及，不代表没有发生。")) : pe("", !0),
                  (P(!0), D(Z, null, Pe(C.sources, (te, G) => (P(), D("blockquote", { key: G }, [
                    T("span", null, j(te.quote), 1),
                    T("cite", null, j(ie(te.field)) + " · 已核对逐字引用", 1)
                  ]))), 128))
                ]);
              }), 128)),
              T("details", sl, [
                E[12] || (E[12] = T("summary", null, "查看这条记录的完整来源", -1)),
                (P(!0), D(Z, null, Pe(R.value.sources, (C) => (P(), D("div", {
                  key: C.field
                }, [
                  T("h4", null, [
                    Vt(j(ie(C.field)) + " ", 1),
                    C.origin === "image_model" ? (P(), D("small", nl, "未核对的 AI 观察")) : pe("", !0)
                  ]),
                  T("p", null, j(C.text), 1)
                ]))), 128)),
                R.value.generated ? (P(), D("div", rl, [
                  E[11] || (E[11] = T("h4", null, [
                    Vt("AI 整理 / 保存正文 "),
                    T("small", null, "不作为用户原话证据")
                  ], -1)),
                  T("p", null, j(R.value.generated), 1)
                ])) : pe("", !0),
                R.value.sources.some((C) => C.origin === "user") ? pe("", !0) : (P(), D("p", il, "此记录缺少可用的用户原话，不能仅凭 AI 整理内容确认细节。"))
              ])
            ], 64)) : (P(), D("p", ol, "选一条候选记录查看证据。"))
          ])
        ])) : pe("", !0),
        d.value ? (P(), D("section", ll, [
          T("h3", null, j(((J = d.value.clarification) == null ? void 0 : J.question) || "有什么线索需要调整？"), 1),
          T("div", cl, [
            (P(!0), D(Z, null, Pe(((ee = d.value.clarification) == null ? void 0 : ee.options) ?? [], (C, B) => (P(), D("button", {
              key: B,
              class: "er-option",
              disabled: i.value,
              onClick: (te) => Ft(C.text)
            }, j(C.label), 9, ul))), 128))
          ]),
          T("form", {
            onSubmit: E[3] || (E[3] = yn((C) => s.value.trim() && Ft(s.value.trim()), ["prevent"]))
          }, [
            E[14] || (E[14] = T("label", { for: "er-correction" }, "补充或纠正线索", -1)),
            T("div", fl, [
              Gs(T("input", {
                id: "er-correction",
                "onUpdate:modelValue": E[2] || (E[2] = (C) => s.value = C),
                disabled: i.value,
                maxlength: "500",
                placeholder: "例如：更确定是小林，下雨这条先不算"
              }, null, 8, al), [
                [bn, s.value]
              ]),
              T("button", {
                class: "er-primary",
                disabled: i.value || !s.value.trim()
              }, "调整后重新查找", 8, dl)
            ])
          ], 32),
          E[15] || (E[15] = T("p", { class: "er-hint" }, "每次调整都会重新执行检索；原始日记不会改变。", -1))
        ])) : pe("", !0),
        A.value.length ? (P(), D("details", hl, [
          T("summary", null, "为什么这样判断 · 查看真实工具执行（" + j(A.value.length) + " 次）", 1),
          T("ol", null, [
            (P(!0), D(Z, null, Pe(A.value, (C, B) => (P(), D("li", { key: B }, [
              T("strong", null, j(C.name), 1),
              T("span", null, j(C.result) + " · " + j(C.time) + "ms", 1),
              T("code", null, j(C.args), 1)
            ]))), 128))
          ]),
          E[16] || (E[16] = T("p", null, "轨迹来自本次模型请求及浏览器实际执行，不是预设步骤。逐字引用校验与语义核验在结论展示前执行。", -1))
        ])) : pe("", !0),
        r.value && !d.value && !i.value && !c.value ? (P(), D("p", pl, "上次线索：" + j(r.value), 1)) : pe("", !0)
      ]);
    };
  }
}), wn = document.getElementById("evidenceWorkspace");
wn && (So(gl).mount(wn), window.LuminaEvidence = { version: "0.1.0" });
