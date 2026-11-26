/**
* @vue/shared v3.5.24
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
// @__NO_SIDE_EFFECTS__
function Es(e) {
  const t = /* @__PURE__ */ Object.create(null);
  for (const s of e.split(",")) t[s] = 1;
  return (s) => s in t;
}
const te = {}, ht = [], Is = () => {
}, An = () => !1, zt = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && // uppercase letter
(e.charCodeAt(2) > 122 || e.charCodeAt(2) < 97), As = (e) => e.startsWith("onUpdate:"), We = Object.assign, Ar = (e, t) => {
  const s = e.indexOf(t);
  s > -1 && e.splice(s, 1);
}, Or = Object.prototype.hasOwnProperty, W = (e, t) => Or.call(e, t), V = Array.isArray, pt = (e) => Qt(e) === "[object Map]", On = (e) => Qt(e) === "[object Set]", z = (e) => typeof e == "function", ce = (e) => typeof e == "string", Ze = (e) => typeof e == "symbol", ie = (e) => e !== null && typeof e == "object", Rn = (e) => (ie(e) || z(e)) && z(e.then) && z(e.catch), Pn = Object.prototype.toString, Qt = (e) => Pn.call(e), Rr = (e) => Qt(e).slice(8, -1), Fn = (e) => Qt(e) === "[object Object]", Os = (e) => ce(e) && e !== "NaN" && e[0] !== "-" && "" + parseInt(e, 10) === e, wt = /* @__PURE__ */ Es(
  // the leading comma is intentional so empty string "" is also included
  ",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"
), Xt = (e) => {
  const t = /* @__PURE__ */ Object.create(null);
  return (s) => t[s] || (t[s] = e(s));
}, Pr = /-\w/g, ze = Xt(
  (e) => e.replace(Pr, (t) => t.slice(1).toUpperCase())
), Fr = /\B([A-Z])/g, it = Xt(
  (e) => e.replace(Fr, "-$1").toLowerCase()
), $n = Xt((e) => e.charAt(0).toUpperCase() + e.slice(1)), is = Xt(
  (e) => e ? `on${$n(e)}` : ""
), gt = (e, t) => !Object.is(e, t), Ht = (e, ...t) => {
  for (let s = 0; s < e.length; s++)
    e[s](...t);
}, Dn = (e, t, s, n = !1) => {
  Object.defineProperty(e, t, {
    configurable: !0,
    enumerable: !1,
    writable: n,
    value: s
  });
}, Rs = (e) => {
  const t = parseFloat(e);
  return isNaN(t) ? e : t;
};
let Js;
const Zt = () => Js || (Js = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : {});
function Ps(e) {
  if (V(e)) {
    const t = {};
    for (let s = 0; s < e.length; s++) {
      const n = e[s], r = ce(n) ? Lr(n) : Ps(n);
      if (r)
        for (const i in r)
          t[i] = r[i];
    }
    return t;
  } else if (ce(e) || ie(e))
    return e;
}
const $r = /;(?![^(]*\))/g, Dr = /:([^]+)/, Nr = /\/\*[^]*?\*\//g;
function Lr(e) {
  const t = {};
  return e.replace(Nr, "").split($r).forEach((s) => {
    if (s) {
      const n = s.split(Dr);
      n.length > 1 && (t[n[0].trim()] = n[1].trim());
    }
  }), t;
}
function Ot(e) {
  let t = "";
  if (ce(e))
    t = e;
  else if (V(e))
    for (let s = 0; s < e.length; s++) {
      const n = Ot(e[s]);
      n && (t += n + " ");
    }
  else if (ie(e))
    for (const s in e)
      e[s] && (t += s + " ");
  return t.trim();
}
const jr = "itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly", Hr = /* @__PURE__ */ Es(jr);
function Nn(e) {
  return !!e || e === "";
}
const Ln = (e) => !!(e && e.__v_isRef === !0), K = (e) => ce(e) ? e : e == null ? "" : V(e) || ie(e) && (e.toString === Pn || !z(e.toString)) ? Ln(e) ? K(e.value) : JSON.stringify(e, jn, 2) : String(e), jn = (e, t) => Ln(t) ? jn(e, t.value) : pt(t) ? {
  [`Map(${t.size})`]: [...t.entries()].reduce(
    (s, [n, r], i) => (s[os(n, i) + " =>"] = r, s),
    {}
  )
} : On(t) ? {
  [`Set(${t.size})`]: [...t.values()].map((s) => os(s))
} : Ze(t) ? os(t) : ie(t) && !V(t) && !Fn(t) ? String(t) : t, os = (e, t = "") => {
  var s;
  return (
    // Symbol.description in es2019+ so we need to cast here to pass
    // the lib: es2016 check
    Ze(e) ? `Symbol(${(s = e.description) != null ? s : t})` : e
  );
};
/**
* @vue/reactivity v3.5.24
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
let Se;
class Vr {
  constructor(t = !1) {
    this.detached = t, this._active = !0, this._on = 0, this.effects = [], this.cleanups = [], this._isPaused = !1, this.parent = Se, !t && Se && (this.index = (Se.scopes || (Se.scopes = [])).push(
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
      const s = Se;
      try {
        return Se = this, t();
      } finally {
        Se = s;
      }
    }
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  on() {
    ++this._on === 1 && (this.prevScope = Se, Se = this);
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  off() {
    this._on > 0 && --this._on === 0 && (Se = this.prevScope, this.prevScope = void 0);
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
let Y;
const ls = /* @__PURE__ */ new WeakSet();
class Kr {
  constructor(t) {
    this.fn = t, this.deps = void 0, this.depsTail = void 0, this.flags = 5, this.next = void 0, this.cleanup = void 0, this.scheduler = void 0, Se && Se.active && Se.effects.push(this);
  }
  pause() {
    this.flags |= 64;
  }
  resume() {
    this.flags & 64 && (this.flags &= -65, ls.has(this) && (ls.delete(this), this.trigger()));
  }
  /**
   * @internal
   */
  notify() {
    this.flags & 2 && !(this.flags & 32) || this.flags & 8 || Vn(this);
  }
  run() {
    if (!(this.flags & 1))
      return this.fn();
    this.flags |= 2, zs(this), Kn(this);
    const t = Y, s = Ae;
    Y = this, Ae = !0;
    try {
      return this.fn();
    } finally {
      Bn(this), Y = t, Ae = s, this.flags &= -3;
    }
  }
  stop() {
    if (this.flags & 1) {
      for (let t = this.deps; t; t = t.nextDep)
        Ds(t);
      this.deps = this.depsTail = void 0, zs(this), this.onStop && this.onStop(), this.flags &= -2;
    }
  }
  trigger() {
    this.flags & 64 ? ls.add(this) : this.scheduler ? this.scheduler() : this.runIfDirty();
  }
  /**
   * @internal
   */
  runIfDirty() {
    _s(this) && this.run();
  }
  get dirty() {
    return _s(this);
  }
}
let Hn = 0, Ct, Tt;
function Vn(e, t = !1) {
  if (e.flags |= 8, t) {
    e.next = Tt, Tt = e;
    return;
  }
  e.next = Ct, Ct = e;
}
function Fs() {
  Hn++;
}
function $s() {
  if (--Hn > 0)
    return;
  if (Tt) {
    let t = Tt;
    for (Tt = void 0; t; ) {
      const s = t.next;
      t.next = void 0, t.flags &= -9, t = s;
    }
  }
  let e;
  for (; Ct; ) {
    let t = Ct;
    for (Ct = void 0; t; ) {
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
function Kn(e) {
  for (let t = e.deps; t; t = t.nextDep)
    t.version = -1, t.prevActiveLink = t.dep.activeLink, t.dep.activeLink = t;
}
function Bn(e) {
  let t, s = e.depsTail, n = s;
  for (; n; ) {
    const r = n.prevDep;
    n.version === -1 ? (n === s && (s = r), Ds(n), Br(n)) : t = n, n.dep.activeLink = n.prevActiveLink, n.prevActiveLink = void 0, n = r;
  }
  e.deps = t, e.depsTail = s;
}
function _s(e) {
  for (let t = e.deps; t; t = t.nextDep)
    if (t.dep.version !== t.version || t.dep.computed && (Un(t.dep.computed) || t.dep.version !== t.version))
      return !0;
  return !!e._dirty;
}
function Un(e) {
  if (e.flags & 4 && !(e.flags & 16) || (e.flags &= -17, e.globalVersion === Rt) || (e.globalVersion = Rt, !e.isSSR && e.flags & 128 && (!e.deps && !e._dirty || !_s(e))))
    return;
  e.flags |= 2;
  const t = e.dep, s = Y, n = Ae;
  Y = e, Ae = !0;
  try {
    Kn(e);
    const r = e.fn(e._value);
    (t.version === 0 || gt(r, e._value)) && (e.flags |= 128, e._value = r, t.version++);
  } catch (r) {
    throw t.version++, r;
  } finally {
    Y = s, Ae = n, Bn(e), e.flags &= -3;
  }
}
function Ds(e, t = !1) {
  const { dep: s, prevSub: n, nextSub: r } = e;
  if (n && (n.nextSub = r, e.prevSub = void 0), r && (r.prevSub = n, e.nextSub = void 0), s.subs === e && (s.subs = n, !n && s.computed)) {
    s.computed.flags &= -5;
    for (let i = s.computed.deps; i; i = i.nextDep)
      Ds(i, !0);
  }
  !t && !--s.sc && s.map && s.map.delete(s.key);
}
function Br(e) {
  const { prevDep: t, nextDep: s } = e;
  t && (t.nextDep = s, e.prevDep = void 0), s && (s.prevDep = t, e.nextDep = void 0);
}
let Ae = !0;
const kn = [];
function _t() {
  kn.push(Ae), Ae = !1;
}
function bt() {
  const e = kn.pop();
  Ae = e === void 0 ? !0 : e;
}
function zs(e) {
  const { cleanup: t } = e;
  if (e.cleanup = void 0, t) {
    const s = Y;
    Y = void 0;
    try {
      t();
    } finally {
      Y = s;
    }
  }
}
let Rt = 0;
class Ur {
  constructor(t, s) {
    this.sub = t, this.dep = s, this.version = s.version, this.nextDep = this.prevDep = this.nextSub = this.prevSub = this.prevActiveLink = void 0;
  }
}
class Ns {
  // TODO isolatedDeclarations "__v_skip"
  constructor(t) {
    this.computed = t, this.version = 0, this.activeLink = void 0, this.subs = void 0, this.map = void 0, this.key = void 0, this.sc = 0, this.__v_skip = !0;
  }
  track(t) {
    if (!Y || !Ae || Y === this.computed)
      return;
    let s = this.activeLink;
    if (s === void 0 || s.sub !== Y)
      s = this.activeLink = new Ur(Y, this), Y.deps ? (s.prevDep = Y.depsTail, Y.depsTail.nextDep = s, Y.depsTail = s) : Y.deps = Y.depsTail = s, Wn(s);
    else if (s.version === -1 && (s.version = this.version, s.nextDep)) {
      const n = s.nextDep;
      n.prevDep = s.prevDep, s.prevDep && (s.prevDep.nextDep = n), s.prevDep = Y.depsTail, s.nextDep = void 0, Y.depsTail.nextDep = s, Y.depsTail = s, Y.deps === s && (Y.deps = n);
    }
    return s;
  }
  trigger(t) {
    this.version++, Rt++, this.notify(t);
  }
  notify(t) {
    Fs();
    try {
      for (let s = this.subs; s; s = s.prevSub)
        s.sub.notify() && s.sub.dep.notify();
    } finally {
      $s();
    }
  }
}
function Wn(e) {
  if (e.dep.sc++, e.sub.flags & 4) {
    const t = e.dep.computed;
    if (t && !e.dep.subs) {
      t.flags |= 20;
      for (let n = t.deps; n; n = n.nextDep)
        Wn(n);
    }
    const s = e.dep.subs;
    s !== e && (e.prevSub = s, s && (s.nextSub = e)), e.dep.subs = e;
  }
}
const bs = /* @__PURE__ */ new WeakMap(), nt = Symbol(
  ""
), vs = Symbol(
  ""
), Pt = Symbol(
  ""
);
function de(e, t, s) {
  if (Ae && Y) {
    let n = bs.get(e);
    n || bs.set(e, n = /* @__PURE__ */ new Map());
    let r = n.get(s);
    r || (n.set(s, r = new Ns()), r.map = n, r.key = s), r.track();
  }
}
function Be(e, t, s, n, r, i) {
  const o = bs.get(e);
  if (!o) {
    Rt++;
    return;
  }
  const l = (u) => {
    u && u.trigger();
  };
  if (Fs(), t === "clear")
    o.forEach(l);
  else {
    const u = V(e), a = u && Os(s);
    if (u && s === "length") {
      const d = Number(n);
      o.forEach((m, w) => {
        (w === "length" || w === Pt || !Ze(w) && w >= d) && l(m);
      });
    } else
      switch ((s !== void 0 || o.has(void 0)) && l(o.get(s)), a && l(o.get(Pt)), t) {
        case "add":
          u ? a && l(o.get("length")) : (l(o.get(nt)), pt(e) && l(o.get(vs)));
          break;
        case "delete":
          u || (l(o.get(nt)), pt(e) && l(o.get(vs)));
          break;
        case "set":
          pt(e) && l(o.get(nt));
          break;
      }
  }
  $s();
}
function ut(e) {
  const t = U(e);
  return t === e ? t : (de(t, "iterate", Pt), ke(e) ? t : t.map(fe));
}
function es(e) {
  return de(e = U(e), "iterate", Pt), e;
}
const kr = {
  __proto__: null,
  [Symbol.iterator]() {
    return cs(this, Symbol.iterator, fe);
  },
  concat(...e) {
    return ut(this).concat(
      ...e.map((t) => V(t) ? ut(t) : t)
    );
  },
  entries() {
    return cs(this, "entries", (e) => (e[1] = fe(e[1]), e));
  },
  every(e, t) {
    return je(this, "every", e, t, void 0, arguments);
  },
  filter(e, t) {
    return je(this, "filter", e, t, (s) => s.map(fe), arguments);
  },
  find(e, t) {
    return je(this, "find", e, t, fe, arguments);
  },
  findIndex(e, t) {
    return je(this, "findIndex", e, t, void 0, arguments);
  },
  findLast(e, t) {
    return je(this, "findLast", e, t, fe, arguments);
  },
  findLastIndex(e, t) {
    return je(this, "findLastIndex", e, t, void 0, arguments);
  },
  // flat, flatMap could benefit from ARRAY_ITERATE but are not straight-forward to implement
  forEach(e, t) {
    return je(this, "forEach", e, t, void 0, arguments);
  },
  includes(...e) {
    return us(this, "includes", e);
  },
  indexOf(...e) {
    return us(this, "indexOf", e);
  },
  join(e) {
    return ut(this).join(e);
  },
  // keys() iterator only reads `length`, no optimization required
  lastIndexOf(...e) {
    return us(this, "lastIndexOf", e);
  },
  map(e, t) {
    return je(this, "map", e, t, void 0, arguments);
  },
  pop() {
    return xt(this, "pop");
  },
  push(...e) {
    return xt(this, "push", e);
  },
  reduce(e, ...t) {
    return Qs(this, "reduce", e, t);
  },
  reduceRight(e, ...t) {
    return Qs(this, "reduceRight", e, t);
  },
  shift() {
    return xt(this, "shift");
  },
  // slice could use ARRAY_ITERATE but also seems to beg for range tracking
  some(e, t) {
    return je(this, "some", e, t, void 0, arguments);
  },
  splice(...e) {
    return xt(this, "splice", e);
  },
  toReversed() {
    return ut(this).toReversed();
  },
  toSorted(e) {
    return ut(this).toSorted(e);
  },
  toSpliced(...e) {
    return ut(this).toSpliced(...e);
  },
  unshift(...e) {
    return xt(this, "unshift", e);
  },
  values() {
    return cs(this, "values", fe);
  }
};
function cs(e, t, s) {
  const n = es(e), r = n[t]();
  return n !== e && !ke(e) && (r._next = r.next, r.next = () => {
    const i = r._next();
    return i.done || (i.value = s(i.value)), i;
  }), r;
}
const Wr = Array.prototype;
function je(e, t, s, n, r, i) {
  const o = es(e), l = o !== e && !ke(e), u = o[t];
  if (u !== Wr[t]) {
    const m = u.apply(e, i);
    return l ? fe(m) : m;
  }
  let a = s;
  o !== e && (l ? a = function(m, w) {
    return s.call(this, fe(m), w, e);
  } : s.length > 2 && (a = function(m, w) {
    return s.call(this, m, w, e);
  }));
  const d = u.call(o, a, n);
  return l && r ? r(d) : d;
}
function Qs(e, t, s, n) {
  const r = es(e);
  let i = s;
  return r !== e && (ke(e) ? s.length > 3 && (i = function(o, l, u) {
    return s.call(this, o, l, u, e);
  }) : i = function(o, l, u) {
    return s.call(this, o, fe(l), u, e);
  }), r[t](i, ...n);
}
function us(e, t, s) {
  const n = U(e);
  de(n, "iterate", Pt);
  const r = n[t](...s);
  return (r === -1 || r === !1) && Vs(s[0]) ? (s[0] = U(s[0]), n[t](...s)) : r;
}
function xt(e, t, s = []) {
  _t(), Fs();
  const n = U(e)[t].apply(e, s);
  return $s(), bt(), n;
}
const qr = /* @__PURE__ */ Es("__proto__,__v_isRef,__isVue"), qn = new Set(
  /* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((e) => e !== "arguments" && e !== "caller").map((e) => Symbol[e]).filter(Ze)
);
function Gr(e) {
  Ze(e) || (e = String(e));
  const t = U(this);
  return de(t, "has", e), t.hasOwnProperty(e);
}
class Gn {
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
      return n === (r ? i ? ni : Qn : i ? zn : Jn).get(t) || // receiver is not the reactive proxy, but has the same prototype
      // this means the receiver is a user proxy of the reactive proxy
      Object.getPrototypeOf(t) === Object.getPrototypeOf(n) ? t : void 0;
    const o = V(t);
    if (!r) {
      let u;
      if (o && (u = kr[s]))
        return u;
      if (s === "hasOwnProperty")
        return Gr;
    }
    const l = Reflect.get(
      t,
      s,
      // if this is a proxy wrapping a ref, return methods using the raw ref
      // as receiver so that we don't have to call `toRaw` on the ref in all
      // its class methods
      Ce(t) ? t : n
    );
    if ((Ze(s) ? qn.has(s) : qr(s)) || (r || de(t, "get", s), i))
      return l;
    if (Ce(l)) {
      const u = o && Os(s) ? l : l.value;
      return r && ie(u) ? xs(u) : u;
    }
    return ie(l) ? r ? xs(l) : Xn(l) : l;
  }
}
class Yn extends Gn {
  constructor(t = !1) {
    super(!1, t);
  }
  set(t, s, n, r) {
    let i = t[s];
    if (!this._isShallow) {
      const u = Qe(i);
      if (!ke(n) && !Qe(n) && (i = U(i), n = U(n)), !V(t) && Ce(i) && !Ce(n))
        return u || (i.value = n), !0;
    }
    const o = V(t) && Os(s) ? Number(s) < t.length : W(t, s), l = Reflect.set(
      t,
      s,
      n,
      Ce(t) ? t : r
    );
    return t === U(r) && (o ? gt(n, i) && Be(t, "set", s, n) : Be(t, "add", s, n)), l;
  }
  deleteProperty(t, s) {
    const n = W(t, s);
    t[s];
    const r = Reflect.deleteProperty(t, s);
    return r && n && Be(t, "delete", s, void 0), r;
  }
  has(t, s) {
    const n = Reflect.has(t, s);
    return (!Ze(s) || !qn.has(s)) && de(t, "has", s), n;
  }
  ownKeys(t) {
    return de(
      t,
      "iterate",
      V(t) ? "length" : nt
    ), Reflect.ownKeys(t);
  }
}
class Yr extends Gn {
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
const Jr = /* @__PURE__ */ new Yn(), zr = /* @__PURE__ */ new Yr(), Qr = /* @__PURE__ */ new Yn(!0);
const ys = (e) => e, Nt = (e) => Reflect.getPrototypeOf(e);
function Xr(e, t, s) {
  return function(...n) {
    const r = this.__v_raw, i = U(r), o = pt(i), l = e === "entries" || e === Symbol.iterator && o, u = e === "keys" && o, a = r[e](...n), d = s ? ys : t ? kt : fe;
    return !t && de(
      i,
      "iterate",
      u ? vs : nt
    ), {
      // iterator protocol
      next() {
        const { value: m, done: w } = a.next();
        return w ? { value: m, done: w } : {
          value: l ? [d(m[0]), d(m[1])] : d(m),
          done: w
        };
      },
      // iterable protocol
      [Symbol.iterator]() {
        return this;
      }
    };
  };
}
function Lt(e) {
  return function(...t) {
    return e === "delete" ? !1 : e === "clear" ? void 0 : this;
  };
}
function Zr(e, t) {
  const s = {
    get(r) {
      const i = this.__v_raw, o = U(i), l = U(r);
      e || (gt(r, l) && de(o, "get", r), de(o, "get", l));
      const { has: u } = Nt(o), a = t ? ys : e ? kt : fe;
      if (u.call(o, r))
        return a(i.get(r));
      if (u.call(o, l))
        return a(i.get(l));
      i !== o && i.get(r);
    },
    get size() {
      const r = this.__v_raw;
      return !e && de(U(r), "iterate", nt), r.size;
    },
    has(r) {
      const i = this.__v_raw, o = U(i), l = U(r);
      return e || (gt(r, l) && de(o, "has", r), de(o, "has", l)), r === l ? i.has(r) : i.has(r) || i.has(l);
    },
    forEach(r, i) {
      const o = this, l = o.__v_raw, u = U(l), a = t ? ys : e ? kt : fe;
      return !e && de(u, "iterate", nt), l.forEach((d, m) => r.call(i, a(d), a(m), o));
    }
  };
  return We(
    s,
    e ? {
      add: Lt("add"),
      set: Lt("set"),
      delete: Lt("delete"),
      clear: Lt("clear")
    } : {
      add(r) {
        !t && !ke(r) && !Qe(r) && (r = U(r));
        const i = U(this);
        return Nt(i).has.call(i, r) || (i.add(r), Be(i, "add", r, r)), this;
      },
      set(r, i) {
        !t && !ke(i) && !Qe(i) && (i = U(i));
        const o = U(this), { has: l, get: u } = Nt(o);
        let a = l.call(o, r);
        a || (r = U(r), a = l.call(o, r));
        const d = u.call(o, r);
        return o.set(r, i), a ? gt(i, d) && Be(o, "set", r, i) : Be(o, "add", r, i), this;
      },
      delete(r) {
        const i = U(this), { has: o, get: l } = Nt(i);
        let u = o.call(i, r);
        u || (r = U(r), u = o.call(i, r)), l && l.call(i, r);
        const a = i.delete(r);
        return u && Be(i, "delete", r, void 0), a;
      },
      clear() {
        const r = U(this), i = r.size !== 0, o = r.clear();
        return i && Be(
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
    s[r] = Xr(r, e, t);
  }), s;
}
function Ls(e, t) {
  const s = Zr(e, t);
  return (n, r, i) => r === "__v_isReactive" ? !e : r === "__v_isReadonly" ? e : r === "__v_raw" ? n : Reflect.get(
    W(s, r) && r in n ? s : n,
    r,
    i
  );
}
const ei = {
  get: /* @__PURE__ */ Ls(!1, !1)
}, ti = {
  get: /* @__PURE__ */ Ls(!1, !0)
}, si = {
  get: /* @__PURE__ */ Ls(!0, !1)
};
const Jn = /* @__PURE__ */ new WeakMap(), zn = /* @__PURE__ */ new WeakMap(), Qn = /* @__PURE__ */ new WeakMap(), ni = /* @__PURE__ */ new WeakMap();
function ri(e) {
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
function ii(e) {
  return e.__v_skip || !Object.isExtensible(e) ? 0 : ri(Rr(e));
}
function Xn(e) {
  return Qe(e) ? e : js(
    e,
    !1,
    Jr,
    ei,
    Jn
  );
}
function oi(e) {
  return js(
    e,
    !1,
    Qr,
    ti,
    zn
  );
}
function xs(e) {
  return js(
    e,
    !0,
    zr,
    si,
    Qn
  );
}
function js(e, t, s, n, r) {
  if (!ie(e) || e.__v_raw && !(t && e.__v_isReactive))
    return e;
  const i = ii(e);
  if (i === 0)
    return e;
  const o = r.get(e);
  if (o)
    return o;
  const l = new Proxy(
    e,
    i === 2 ? n : s
  );
  return r.set(e, l), l;
}
function Hs(e) {
  return Qe(e) ? Hs(e.__v_raw) : !!(e && e.__v_isReactive);
}
function Qe(e) {
  return !!(e && e.__v_isReadonly);
}
function ke(e) {
  return !!(e && e.__v_isShallow);
}
function Vs(e) {
  return e ? !!e.__v_raw : !1;
}
function U(e) {
  const t = e && e.__v_raw;
  return t ? U(t) : e;
}
function li(e) {
  return !W(e, "__v_skip") && Object.isExtensible(e) && Dn(e, "__v_skip", !0), e;
}
const fe = (e) => ie(e) ? Xn(e) : e, kt = (e) => ie(e) ? xs(e) : e;
function Ce(e) {
  return e ? e.__v_isRef === !0 : !1;
}
function be(e) {
  return ci(e, !1);
}
function ci(e, t) {
  return Ce(e) ? e : new ui(e, t);
}
class ui {
  constructor(t, s) {
    this.dep = new Ns(), this.__v_isRef = !0, this.__v_isShallow = !1, this._rawValue = s ? t : U(t), this._value = s ? t : fe(t), this.__v_isShallow = s;
  }
  get value() {
    return this.dep.track(), this._value;
  }
  set value(t) {
    const s = this._rawValue, n = this.__v_isShallow || ke(t) || Qe(t);
    t = n ? t : U(t), gt(t, s) && (this._rawValue = t, this._value = n ? t : fe(t), this.dep.trigger());
  }
}
function fi(e) {
  return Ce(e) ? e.value : e;
}
const ai = {
  get: (e, t, s) => t === "__v_raw" ? e : fi(Reflect.get(e, t, s)),
  set: (e, t, s, n) => {
    const r = e[t];
    return Ce(r) && !Ce(s) ? (r.value = s, !0) : Reflect.set(e, t, s, n);
  }
};
function Zn(e) {
  return Hs(e) ? e : new Proxy(e, ai);
}
class di {
  constructor(t, s, n) {
    this.fn = t, this.setter = s, this._value = void 0, this.dep = new Ns(this), this.__v_isRef = !0, this.deps = void 0, this.depsTail = void 0, this.flags = 16, this.globalVersion = Rt - 1, this.next = void 0, this.effect = this, this.__v_isReadonly = !s, this.isSSR = n;
  }
  /**
   * @internal
   */
  notify() {
    if (this.flags |= 16, !(this.flags & 8) && // avoid infinite self recursion
    Y !== this)
      return Vn(this, !0), !0;
  }
  get value() {
    const t = this.dep.track();
    return Un(this), t && (t.version = this.dep.version), this._value;
  }
  set value(t) {
    this.setter && this.setter(t);
  }
}
function hi(e, t, s = !1) {
  let n, r;
  return z(e) ? n = e : (n = e.get, r = e.set), new di(n, r, s);
}
function ft(e, t = 1 / 0, s) {
  if (t <= 0 || !ie(e) || e.__v_skip || (s = s || /* @__PURE__ */ new Map(), (s.get(e) || 0) >= t))
    return e;
  if (s.set(e, t), t--, Ce(e))
    ft(e.value, t, s);
  else if (V(e))
    for (let n = 0; n < e.length; n++)
      ft(e[n], t, s);
  else if (On(e) || pt(e))
    e.forEach((n) => {
      ft(n, t, s);
    });
  else if (Fn(e)) {
    for (const n in e)
      ft(e[n], t, s);
    for (const n of Object.getOwnPropertySymbols(e))
      Object.prototype.propertyIsEnumerable.call(e, n) && ft(e[n], t, s);
  }
  return e;
}
/**
* @vue/runtime-core v3.5.24
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
function Dt(e, t, s, n) {
  try {
    return n ? e(...n) : e();
  } catch (r) {
    ts(r, t, s);
  }
}
function rt(e, t, s, n) {
  if (z(e)) {
    const r = Dt(e, t, s, n);
    return r && Rn(r) && r.catch((i) => {
      ts(i, t, s);
    }), r;
  }
  if (V(e)) {
    const r = [];
    for (let i = 0; i < e.length; i++)
      r.push(rt(e[i], t, s, n));
    return r;
  }
}
function ts(e, t, s, n = !0) {
  const r = t ? t.vnode : null, { errorHandler: i, throwUnhandledErrorInProduction: o } = t && t.appContext.config || te;
  if (t) {
    let l = t.parent;
    const u = t.proxy, a = `https://vuejs.org/error-reference/#runtime-${s}`;
    for (; l; ) {
      const d = l.ec;
      if (d) {
        for (let m = 0; m < d.length; m++)
          if (d[m](e, u, a) === !1)
            return;
      }
      l = l.parent;
    }
    if (i) {
      _t(), Dt(i, null, 10, [
        e,
        u,
        a
      ]), bt();
      return;
    }
  }
  pi(e, s, r, n, o);
}
function pi(e, t, s, n = !0, r = !1) {
  if (r)
    throw e;
  console.error(e);
}
const ge = [];
let De = -1;
const mt = [];
let Ye = null, at = 0;
const er = /* @__PURE__ */ Promise.resolve();
let Wt = null;
function gi(e) {
  const t = Wt || er;
  return e ? t.then(this ? e.bind(this) : e) : t;
}
function mi(e) {
  let t = De + 1, s = ge.length;
  for (; t < s; ) {
    const n = t + s >>> 1, r = ge[n], i = Ft(r);
    i < e || i === e && r.flags & 2 ? t = n + 1 : s = n;
  }
  return t;
}
function tr(e) {
  if (!(e.flags & 1)) {
    const t = Ft(e), s = ge[ge.length - 1];
    !s || // fast path when the job id is larger than the tail
    !(e.flags & 2) && t >= Ft(s) ? ge.push(e) : ge.splice(mi(t), 0, e), e.flags |= 1, sr();
  }
}
function sr() {
  Wt || (Wt = er.then(rr));
}
function _i(e) {
  V(e) ? mt.push(...e) : Ye && e.id === -1 ? Ye.splice(at + 1, 0, e) : e.flags & 1 || (mt.push(e), e.flags |= 1), sr();
}
function Xs(e, t, s = De + 1) {
  for (; s < ge.length; s++) {
    const n = ge[s];
    if (n && n.flags & 2) {
      if (e && n.id !== e.uid)
        continue;
      ge.splice(s, 1), s--, n.flags & 4 && (n.flags &= -2), n(), n.flags & 4 || (n.flags &= -2);
    }
  }
}
function nr(e) {
  if (mt.length) {
    const t = [...new Set(mt)].sort(
      (s, n) => Ft(s) - Ft(n)
    );
    if (mt.length = 0, Ye) {
      Ye.push(...t);
      return;
    }
    for (Ye = t, at = 0; at < Ye.length; at++) {
      const s = Ye[at];
      s.flags & 4 && (s.flags &= -2), s.flags & 8 || s(), s.flags &= -2;
    }
    Ye = null, at = 0;
  }
}
const Ft = (e) => e.id == null ? e.flags & 2 ? -1 : 1 / 0 : e.id;
function rr(e) {
  try {
    for (De = 0; De < ge.length; De++) {
      const t = ge[De];
      t && !(t.flags & 8) && (t.flags & 4 && (t.flags &= -2), Dt(
        t,
        t.i,
        t.i ? 15 : 14
      ), t.flags & 4 || (t.flags &= -2));
    }
  } finally {
    for (; De < ge.length; De++) {
      const t = ge[De];
      t && (t.flags &= -2);
    }
    De = -1, ge.length = 0, nr(), Wt = null, (ge.length || mt.length) && rr();
  }
}
let Ie = null, ir = null;
function qt(e) {
  const t = Ie;
  return Ie = e, ir = e && e.type.__scopeId || null, t;
}
function bi(e, t = Ie, s) {
  if (!t || e._n)
    return e;
  const n = (...r) => {
    n._d && on(-1);
    const i = qt(t);
    let o;
    try {
      o = e(...r);
    } finally {
      qt(i), n._d && on(1);
    }
    return o;
  };
  return n._n = !0, n._c = !0, n._d = !0, n;
}
function Zs(e, t) {
  if (Ie === null)
    return e;
  const s = rs(Ie), n = e.dirs || (e.dirs = []);
  for (let r = 0; r < t.length; r++) {
    let [i, o, l, u = te] = t[r];
    i && (z(i) && (i = {
      mounted: i,
      updated: i
    }), i.deep && ft(o), n.push({
      dir: i,
      instance: s,
      value: o,
      oldValue: void 0,
      arg: l,
      modifiers: u
    }));
  }
  return e;
}
function tt(e, t, s, n) {
  const r = e.dirs, i = t && t.dirs;
  for (let o = 0; o < r.length; o++) {
    const l = r[o];
    i && (l.oldValue = i[o].value);
    let u = l.dir[n];
    u && (_t(), rt(u, s, 8, [
      e.el,
      l,
      e,
      t
    ]), bt());
  }
}
const vi = Symbol("_vte"), yi = (e) => e.__isTeleport, xi = Symbol("_leaveCb");
function Ks(e, t) {
  e.shapeFlag & 6 && e.component ? (e.transition = t, Ks(e.component.subTree, t)) : e.shapeFlag & 128 ? (e.ssContent.transition = t.clone(e.ssContent), e.ssFallback.transition = t.clone(e.ssFallback)) : e.transition = t;
}
// @__NO_SIDE_EFFECTS__
function Si(e, t) {
  return z(e) ? (
    // #8236: extend call and options.name access are considered side-effects
    // by Rollup, so we have to wrap it in a pure-annotated IIFE.
    We({ name: e.name }, t, { setup: e })
  ) : e;
}
function wi(e) {
  e.ids = [e.ids[0] + e.ids[2]++ + "-", 0, 0];
}
const Gt = /* @__PURE__ */ new WeakMap();
function Mt(e, t, s, n, r = !1) {
  if (V(e)) {
    e.forEach(
      ($, F) => Mt(
        $,
        t && (V(t) ? t[F] : t),
        s,
        n,
        r
      )
    );
    return;
  }
  if (Et(n) && !r) {
    n.shapeFlag & 512 && n.type.__asyncResolved && n.component.subTree.component && Mt(e, t, s, n.component.subTree);
    return;
  }
  const i = n.shapeFlag & 4 ? rs(n.component) : n.el, o = r ? null : i, { i: l, r: u } = e, a = t && t.r, d = l.refs === te ? l.refs = {} : l.refs, m = l.setupState, w = U(m), O = m === te ? An : ($) => W(w, $);
  if (a != null && a !== u) {
    if (en(t), ce(a))
      d[a] = null, O(a) && (m[a] = null);
    else if (Ce(a)) {
      a.value = null;
      const $ = t;
      $.k && (d[$.k] = null);
    }
  }
  if (z(u))
    Dt(u, l, 12, [o, d]);
  else {
    const $ = ce(u), F = Ce(u);
    if ($ || F) {
      const J = () => {
        if (e.f) {
          const D = $ ? O(u) ? m[u] : d[u] : u.value;
          if (r)
            V(D) && Ar(D, i);
          else if (V(D))
            D.includes(i) || D.push(i);
          else if ($)
            d[u] = [i], O(u) && (m[u] = d[u]);
          else {
            const Z = [i];
            u.value = Z, e.k && (d[e.k] = Z);
          }
        } else $ ? (d[u] = o, O(u) && (m[u] = o)) : F && (u.value = o, e.k && (d[e.k] = o));
      };
      if (o) {
        const D = () => {
          J(), Gt.delete(e);
        };
        D.id = -1, Gt.set(e, D), Te(D, s);
      } else
        en(e), J();
    }
  }
}
function en(e) {
  const t = Gt.get(e);
  t && (t.flags |= 8, Gt.delete(e));
}
Zt().requestIdleCallback;
Zt().cancelIdleCallback;
const Et = (e) => !!e.type.__asyncLoader, Ci = (e) => e.type.__isKeepAlive, Ti = Symbol.for("v-ndc");
function He(e, t, s, n) {
  let r;
  const i = s, o = V(e);
  if (o || ce(e)) {
    const l = o && Hs(e);
    let u = !1, a = !1;
    l && (u = !ke(e), a = Qe(e), e = es(e)), r = new Array(e.length);
    for (let d = 0, m = e.length; d < m; d++)
      r[d] = t(
        u ? a ? kt(fe(e[d])) : fe(e[d]) : e[d],
        d,
        void 0,
        i
      );
  } else if (typeof e == "number") {
    r = new Array(e);
    for (let l = 0; l < e; l++)
      r[l] = t(l + 1, l, void 0, i);
  } else if (ie(e))
    if (e[Symbol.iterator])
      r = Array.from(
        e,
        (l, u) => t(l, u, void 0, i)
      );
    else {
      const l = Object.keys(e);
      r = new Array(l.length);
      for (let u = 0, a = l.length; u < a; u++) {
        const d = l[u];
        r[u] = t(e[d], d, u, i);
      }
    }
  else
    r = [];
  return r;
}
const Ss = (e) => e ? xr(e) ? rs(e) : Ss(e.parent) : null, It = (
  // Move PURE marker to new line to workaround compiler discarding it
  // due to type annotation
  /* @__PURE__ */ We(/* @__PURE__ */ Object.create(null), {
    $: (e) => e,
    $el: (e) => e.vnode.el,
    $data: (e) => e.data,
    $props: (e) => e.props,
    $attrs: (e) => e.attrs,
    $slots: (e) => e.slots,
    $refs: (e) => e.refs,
    $parent: (e) => Ss(e.parent),
    $root: (e) => Ss(e.root),
    $host: (e) => e.ce,
    $emit: (e) => e.emit,
    $options: (e) => e.type,
    $forceUpdate: (e) => e.f || (e.f = () => {
      tr(e.update);
    }),
    $nextTick: (e) => e.n || (e.n = gi.bind(e.proxy)),
    $watch: (e) => Is
  })
), fs = (e, t) => e !== te && !e.__isScriptSetup && W(e, t), Mi = {
  get({ _: e }, t) {
    if (t === "__v_skip")
      return !0;
    const { ctx: s, setupState: n, data: r, props: i, accessCache: o, type: l, appContext: u } = e;
    let a;
    if (t[0] !== "$") {
      const O = o[t];
      if (O !== void 0)
        switch (O) {
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
        if (fs(n, t))
          return o[t] = 1, n[t];
        if (
          // only cache other properties when instance has declared (thus stable)
          // props
          (a = e.propsOptions[0]) && W(a, t)
        )
          return o[t] = 3, i[t];
        if (s !== te && W(s, t))
          return o[t] = 4, s[t];
        o[t] = 0;
      }
    }
    const d = It[t];
    let m, w;
    if (d)
      return t === "$attrs" && de(e.attrs, "get", ""), d(e);
    if (
      // css module (injected by vue-loader)
      (m = l.__cssModules) && (m = m[t])
    )
      return m;
    if (s !== te && W(s, t))
      return o[t] = 4, s[t];
    if (
      // global properties
      w = u.config.globalProperties, W(w, t)
    )
      return w[t];
  },
  set({ _: e }, t, s) {
    const { data: n, setupState: r, ctx: i } = e;
    return fs(r, t) ? (r[t] = s, !0) : W(e.props, t) || t[0] === "$" && t.slice(1) in e ? !1 : (i[t] = s, !0);
  },
  has({
    _: { data: e, setupState: t, accessCache: s, ctx: n, appContext: r, propsOptions: i, type: o }
  }, l) {
    let u, a;
    return !!(s[l] || fs(t, l) || (u = i[0]) && W(u, l) || W(n, l) || W(It, l) || W(r.config.globalProperties, l) || (a = o.__cssModules) && a[l]);
  },
  defineProperty(e, t, s) {
    return s.get != null ? e._.accessCache[t] = 0 : W(s, "value") && this.set(e, t, s.value, null), Reflect.defineProperty(e, t, s);
  }
};
function or() {
  return {
    app: null,
    config: {
      isNativeTag: An,
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
let Ei = 0;
function Ii(e, t) {
  return function(n, r = null) {
    z(n) || (n = We({}, n)), r != null && !ie(r) && (r = null);
    const i = or(), o = /* @__PURE__ */ new WeakSet(), l = [];
    let u = !1;
    const a = i.app = {
      _uid: Ei++,
      _component: n,
      _props: r,
      _container: null,
      _context: i,
      _instance: null,
      version: oo,
      get config() {
        return i.config;
      },
      set config(d) {
      },
      use(d, ...m) {
        return o.has(d) || (d && z(d.install) ? (o.add(d), d.install(a, ...m)) : z(d) && (o.add(d), d(a, ...m))), a;
      },
      mixin(d) {
        return a;
      },
      component(d, m) {
        return m ? (i.components[d] = m, a) : i.components[d];
      },
      directive(d, m) {
        return m ? (i.directives[d] = m, a) : i.directives[d];
      },
      mount(d, m, w) {
        if (!u) {
          const O = a._ceVNode || Ue(n, r);
          return O.appContext = i, w === !0 ? w = "svg" : w === !1 && (w = void 0), e(O, d, w), u = !0, a._container = d, d.__vue_app__ = a, rs(O.component);
        }
      },
      onUnmount(d) {
        l.push(d);
      },
      unmount() {
        u && (rt(
          l,
          a._instance,
          16
        ), e(null, a._container), delete a._container.__vue_app__);
      },
      provide(d, m) {
        return i.provides[d] = m, a;
      },
      runWithContext(d) {
        try {
          return d();
        } finally {
        }
      }
    };
    return a;
  };
}
const lr = {}, cr = () => Object.create(lr), ur = (e) => Object.getPrototypeOf(e) === lr;
function Ai(e, t, s, n = !1) {
  const r = {}, i = cr();
  e.propsDefaults = /* @__PURE__ */ Object.create(null), fr(e, t, r, i);
  for (const o in e.propsOptions[0])
    o in r || (r[o] = void 0);
  s ? e.props = n ? r : oi(r) : e.type.props ? e.props = r : e.props = i, e.attrs = i;
}
function Oi(e, t, s, n) {
  const {
    props: r,
    attrs: i,
    vnode: { patchFlag: o }
  } = e, l = U(r), [u] = e.propsOptions;
  let a = !1;
  if (
    // always force full diff in dev
    // - #1942 if hmr is enabled with sfc component
    // - vite#872 non-sfc component used by sfc component
    (n || o > 0) && !(o & 16)
  ) {
    if (o & 8) {
      const d = e.vnode.dynamicProps;
      for (let m = 0; m < d.length; m++) {
        let w = d[m];
        if (ss(e.emitsOptions, w))
          continue;
        const O = t[w];
        if (u)
          if (W(i, w))
            O !== i[w] && (i[w] = O, a = !0);
          else {
            const $ = ze(w);
            r[$] = ws(
              u,
              l,
              $,
              O,
              e,
              !1
            );
          }
        else
          O !== i[w] && (i[w] = O, a = !0);
      }
    }
  } else {
    fr(e, t, r, i) && (a = !0);
    let d;
    for (const m in l)
      (!t || // for camelCase
      !W(t, m) && // it's possible the original props was passed in as kebab-case
      // and converted to camelCase (#955)
      ((d = it(m)) === m || !W(t, d))) && (u ? s && // for camelCase
      (s[m] !== void 0 || // for kebab-case
      s[d] !== void 0) && (r[m] = ws(
        u,
        l,
        m,
        void 0,
        e,
        !0
      )) : delete r[m]);
    if (i !== l)
      for (const m in i)
        (!t || !W(t, m)) && (delete i[m], a = !0);
  }
  a && Be(e.attrs, "set", "");
}
function fr(e, t, s, n) {
  const [r, i] = e.propsOptions;
  let o = !1, l;
  if (t)
    for (let u in t) {
      if (wt(u))
        continue;
      const a = t[u];
      let d;
      r && W(r, d = ze(u)) ? !i || !i.includes(d) ? s[d] = a : (l || (l = {}))[d] = a : ss(e.emitsOptions, u) || (!(u in n) || a !== n[u]) && (n[u] = a, o = !0);
    }
  if (i) {
    const u = U(s), a = l || te;
    for (let d = 0; d < i.length; d++) {
      const m = i[d];
      s[m] = ws(
        r,
        u,
        m,
        a[m],
        e,
        !W(a, m)
      );
    }
  }
  return o;
}
function ws(e, t, s, n, r, i) {
  const o = e[s];
  if (o != null) {
    const l = W(o, "default");
    if (l && n === void 0) {
      const u = o.default;
      if (o.type !== Function && !o.skipFactory && z(u)) {
        const { propsDefaults: a } = r;
        if (s in a)
          n = a[s];
        else {
          const d = yr(r);
          n = a[s] = u.call(
            null,
            t
          ), d();
        }
      } else
        n = u;
      r.ce && r.ce._setProp(s, n);
    }
    o[
      0
      /* shouldCast */
    ] && (i && !l ? n = !1 : o[
      1
      /* shouldCastTrue */
    ] && (n === "" || n === it(s)) && (n = !0));
  }
  return n;
}
function Ri(e, t, s = !1) {
  const n = t.propsCache, r = n.get(e);
  if (r)
    return r;
  const i = e.props, o = {}, l = [];
  if (!i)
    return ie(e) && n.set(e, ht), ht;
  if (V(i))
    for (let a = 0; a < i.length; a++) {
      const d = ze(i[a]);
      tn(d) && (o[d] = te);
    }
  else if (i)
    for (const a in i) {
      const d = ze(a);
      if (tn(d)) {
        const m = i[a], w = o[d] = V(m) || z(m) ? { type: m } : We({}, m), O = w.type;
        let $ = !1, F = !0;
        if (V(O))
          for (let J = 0; J < O.length; ++J) {
            const D = O[J], Z = z(D) && D.name;
            if (Z === "Boolean") {
              $ = !0;
              break;
            } else Z === "String" && (F = !1);
          }
        else
          $ = z(O) && O.name === "Boolean";
        w[
          0
          /* shouldCast */
        ] = $, w[
          1
          /* shouldCastTrue */
        ] = F, ($ || W(w, "default")) && l.push(d);
      }
    }
  const u = [o, l];
  return ie(e) && n.set(e, u), u;
}
function tn(e) {
  return e[0] !== "$" && !wt(e);
}
const Bs = (e) => e === "_" || e === "_ctx" || e === "$stable", Us = (e) => V(e) ? e.map(Ne) : [Ne(e)], Pi = (e, t, s) => {
  if (t._n)
    return t;
  const n = bi((...r) => Us(t(...r)), s);
  return n._c = !1, n;
}, ar = (e, t, s) => {
  const n = e._ctx;
  for (const r in e) {
    if (Bs(r)) continue;
    const i = e[r];
    if (z(i))
      t[r] = Pi(r, i, n);
    else if (i != null) {
      const o = Us(i);
      t[r] = () => o;
    }
  }
}, dr = (e, t) => {
  const s = Us(t);
  e.slots.default = () => s;
}, hr = (e, t, s) => {
  for (const n in t)
    (s || !Bs(n)) && (e[n] = t[n]);
}, Fi = (e, t, s) => {
  const n = e.slots = cr();
  if (e.vnode.shapeFlag & 32) {
    const r = t._;
    r ? (hr(n, t, s), s && Dn(n, "_", r, !0)) : ar(t, n);
  } else t && dr(e, t);
}, $i = (e, t, s) => {
  const { vnode: n, slots: r } = e;
  let i = !0, o = te;
  if (n.shapeFlag & 32) {
    const l = t._;
    l ? s && l === 1 ? i = !1 : hr(r, t, s) : (i = !t.$stable, ar(t, r)), o = t;
  } else t && (dr(e, t), o = { default: 1 });
  if (i)
    for (const l in r)
      !Bs(l) && o[l] == null && delete r[l];
}, Te = qi;
function Di(e) {
  return Ni(e);
}
function Ni(e, t) {
  const s = Zt();
  s.__VUE__ = !0;
  const {
    insert: n,
    remove: r,
    patchProp: i,
    createElement: o,
    createText: l,
    createComment: u,
    setText: a,
    setElementText: d,
    parentNode: m,
    nextSibling: w,
    setScopeId: O = Is,
    insertStaticContent: $
  } = e, F = (c, f, h, b = null, p = null, g = null, S = void 0, y = null, v = !!f.dynamicChildren) => {
    if (c === f)
      return;
    c && !St(c, f) && (b = ue(c), re(c, p, g, !0), c = null), f.patchFlag === -2 && (v = !1, f.dynamicChildren = null);
    const { type: _, ref: R, shapeFlag: C } = f;
    switch (_) {
      case ns:
        J(c, f, h, b);
        break;
      case Xe:
        D(c, f, h, b);
        break;
      case ds:
        c == null && Z(f, h, b, S);
        break;
      case oe:
        ot(
          c,
          f,
          h,
          b,
          p,
          g,
          S,
          y,
          v
        );
        break;
      default:
        C & 1 ? se(
          c,
          f,
          h,
          b,
          p,
          g,
          S,
          y,
          v
        ) : C & 6 ? lt(
          c,
          f,
          h,
          b,
          p,
          g,
          S,
          y,
          v
        ) : (C & 64 || C & 128) && _.process(
          c,
          f,
          h,
          b,
          p,
          g,
          S,
          y,
          v,
          pe
        );
    }
    R != null && p ? Mt(R, c && c.ref, g, f || c, !f) : R == null && c && c.ref != null && Mt(c.ref, null, g, c, !0);
  }, J = (c, f, h, b) => {
    if (c == null)
      n(
        f.el = l(f.children),
        h,
        b
      );
    else {
      const p = f.el = c.el;
      f.children !== c.children && a(p, f.children);
    }
  }, D = (c, f, h, b) => {
    c == null ? n(
      f.el = u(f.children || ""),
      h,
      b
    ) : f.el = c.el;
  }, Z = (c, f, h, b) => {
    [c.el, c.anchor] = $(
      c.children,
      f,
      h,
      b,
      c.el,
      c.anchor
    );
  }, x = ({ el: c, anchor: f }, h, b) => {
    let p;
    for (; c && c !== f; )
      p = w(c), n(c, h, b), c = p;
    n(f, h, b);
  }, I = ({ el: c, anchor: f }) => {
    let h;
    for (; c && c !== f; )
      h = w(c), r(c), c = h;
    r(f);
  }, se = (c, f, h, b, p, g, S, y, v) => {
    if (f.type === "svg" ? S = "svg" : f.type === "math" && (S = "mathml"), c == null)
      ee(
        f,
        h,
        b,
        p,
        g,
        S,
        y,
        v
      );
    else {
      const _ = c.el && c.el._isVueCE ? c.el : null;
      try {
        _ && _._beginPatch(), ae(
          c,
          f,
          p,
          g,
          S,
          y,
          v
        );
      } finally {
        _ && _._endPatch();
      }
    }
  }, ee = (c, f, h, b, p, g, S, y) => {
    let v, _;
    const { props: R, shapeFlag: C, transition: A, dirs: P } = c;
    if (v = c.el = o(
      c.type,
      g,
      R && R.is,
      R
    ), C & 8 ? d(v, c.children) : C & 16 && N(
      c.children,
      v,
      null,
      b,
      p,
      as(c, g),
      S,
      y
    ), P && tt(c, null, b, "created"), Q(v, c, c.scopeId, S, b), R) {
      for (const G in R)
        G !== "value" && !wt(G) && i(v, G, null, R[G], g, b);
      "value" in R && i(v, "value", null, R.value, g), (_ = R.onVnodeBeforeMount) && $e(_, b, c);
    }
    P && tt(c, null, b, "beforeMount");
    const H = Li(p, A);
    H && A.beforeEnter(v), n(v, f, h), ((_ = R && R.onVnodeMounted) || H || P) && Te(() => {
      _ && $e(_, b, c), H && A.enter(v), P && tt(c, null, b, "mounted");
    }, p);
  }, Q = (c, f, h, b, p) => {
    if (h && O(c, h), b)
      for (let g = 0; g < b.length; g++)
        O(c, b[g]);
    if (p) {
      let g = p.subTree;
      if (f === g || mr(g.type) && (g.ssContent === f || g.ssFallback === f)) {
        const S = p.vnode;
        Q(
          c,
          S,
          S.scopeId,
          S.slotScopeIds,
          p.parent
        );
      }
    }
  }, N = (c, f, h, b, p, g, S, y, v = 0) => {
    for (let _ = v; _ < c.length; _++) {
      const R = c[_] = y ? Je(c[_]) : Ne(c[_]);
      F(
        null,
        R,
        f,
        h,
        b,
        p,
        g,
        S,
        y
      );
    }
  }, ae = (c, f, h, b, p, g, S) => {
    const y = f.el = c.el;
    let { patchFlag: v, dynamicChildren: _, dirs: R } = f;
    v |= c.patchFlag & 16;
    const C = c.props || te, A = f.props || te;
    let P;
    if (h && st(h, !1), (P = A.onVnodeBeforeUpdate) && $e(P, h, f, c), R && tt(f, c, h, "beforeUpdate"), h && st(h, !0), (C.innerHTML && A.innerHTML == null || C.textContent && A.textContent == null) && d(y, ""), _ ? Me(
      c.dynamicChildren,
      _,
      y,
      h,
      b,
      as(f, p),
      g
    ) : S || ne(
      c,
      f,
      y,
      null,
      h,
      b,
      as(f, p),
      g,
      !1
    ), v > 0) {
      if (v & 16)
        ye(y, C, A, h, p);
      else if (v & 2 && C.class !== A.class && i(y, "class", null, A.class, p), v & 4 && i(y, "style", C.style, A.style, p), v & 8) {
        const H = f.dynamicProps;
        for (let G = 0; G < H.length; G++) {
          const k = H[G], me = C[k], _e = A[k];
          (_e !== me || k === "value") && i(y, k, me, _e, p, h);
        }
      }
      v & 1 && c.children !== f.children && d(y, f.children);
    } else !S && _ == null && ye(y, C, A, h, p);
    ((P = A.onVnodeUpdated) || R) && Te(() => {
      P && $e(P, h, f, c), R && tt(f, c, h, "updated");
    }, b);
  }, Me = (c, f, h, b, p, g, S) => {
    for (let y = 0; y < f.length; y++) {
      const v = c[y], _ = f[y], R = (
        // oldVNode may be an errored async setup() component inside Suspense
        // which will not have a mounted element
        v.el && // - In the case of a Fragment, we need to provide the actual parent
        // of the Fragment itself so it can move its children.
        (v.type === oe || // - In the case of different nodes, there is going to be a replacement
        // which also requires the correct parent container
        !St(v, _) || // - In the case of a component, it could contain anything.
        v.shapeFlag & 198) ? m(v.el) : (
          // In other cases, the parent container is not actually used so we
          // just pass the block element here to avoid a DOM parentNode call.
          h
        )
      );
      F(
        v,
        _,
        R,
        null,
        b,
        p,
        g,
        S,
        !0
      );
    }
  }, ye = (c, f, h, b, p) => {
    if (f !== h) {
      if (f !== te)
        for (const g in f)
          !wt(g) && !(g in h) && i(
            c,
            g,
            f[g],
            null,
            p,
            b
          );
      for (const g in h) {
        if (wt(g)) continue;
        const S = h[g], y = f[g];
        S !== y && g !== "value" && i(c, g, y, S, p, b);
      }
      "value" in h && i(c, "value", f.value, h.value, p);
    }
  }, ot = (c, f, h, b, p, g, S, y, v) => {
    const _ = f.el = c ? c.el : l(""), R = f.anchor = c ? c.anchor : l("");
    let { patchFlag: C, dynamicChildren: A, slotScopeIds: P } = f;
    P && (y = y ? y.concat(P) : P), c == null ? (n(_, h, b), n(R, h, b), N(
      // #10007
      // such fragment like `<></>` will be compiled into
      // a fragment which doesn't have a children.
      // In this case fallback to an empty array
      f.children || [],
      h,
      R,
      p,
      g,
      S,
      y,
      v
    )) : C > 0 && C & 64 && A && // #2715 the previous fragment could've been a BAILed one as a result
    // of renderSlot() with no valid children
    c.dynamicChildren ? (Me(
      c.dynamicChildren,
      A,
      h,
      p,
      g,
      S,
      y
    ), // #2080 if the stable fragment has a key, it's a <template v-for> that may
    //  get moved around. Make sure all root level vnodes inherit el.
    // #2134 or if it's a component root, it may also get moved around
    // as the component is being moved.
    (f.key != null || p && f === p.subTree) && pr(
      c,
      f,
      !0
      /* shallow */
    )) : ne(
      c,
      f,
      h,
      R,
      p,
      g,
      S,
      y,
      v
    );
  }, lt = (c, f, h, b, p, g, S, y, v) => {
    f.slotScopeIds = y, c == null ? f.shapeFlag & 512 ? p.ctx.activate(
      f,
      h,
      b,
      S,
      v
    ) : Le(
      f,
      h,
      b,
      p,
      g,
      S,
      v
    ) : B(c, f, v);
  }, Le = (c, f, h, b, p, g, S) => {
    const y = c.component = eo(
      c,
      b,
      p
    );
    if (Ci(c) && (y.ctx.renderer = pe), to(y, !1, S), y.asyncDep) {
      if (p && p.registerDep(y, E, S), !c.el) {
        const v = y.subTree = Ue(Xe);
        D(null, v, f, h), c.placeholder = v.el;
      }
    } else
      E(
        y,
        c,
        f,
        h,
        p,
        g,
        S
      );
  }, B = (c, f, h) => {
    const b = f.component = c.component;
    if (ki(c, f, h))
      if (b.asyncDep && !b.asyncResolved) {
        X(b, f, h);
        return;
      } else
        b.next = f, b.update();
    else
      f.el = c.el, b.vnode = f;
  }, E = (c, f, h, b, p, g, S) => {
    const y = () => {
      if (c.isMounted) {
        let { next: C, bu: A, u: P, parent: H, vnode: G } = c;
        {
          const Pe = gr(c);
          if (Pe) {
            C && (C.el = G.el, X(c, C, S)), Pe.asyncDep.then(() => {
              c.isUnmounted || y();
            });
            return;
          }
        }
        let k = C, me;
        st(c, !1), C ? (C.el = G.el, X(c, C, S)) : C = G, A && Ht(A), (me = C.props && C.props.onVnodeBeforeUpdate) && $e(me, H, C, G), st(c, !0);
        const _e = nn(c), Re = c.subTree;
        c.subTree = _e, F(
          Re,
          _e,
          // parent may have changed if it's in a teleport
          m(Re.el),
          // anchor may have changed if it's in a fragment
          ue(Re),
          c,
          p,
          g
        ), C.el = _e.el, k === null && Wi(c, _e.el), P && Te(P, p), (me = C.props && C.props.onVnodeUpdated) && Te(
          () => $e(me, H, C, G),
          p
        );
      } else {
        let C;
        const { el: A, props: P } = f, { bm: H, m: G, parent: k, root: me, type: _e } = c, Re = Et(f);
        st(c, !1), H && Ht(H), !Re && (C = P && P.onVnodeBeforeMount) && $e(C, k, f), st(c, !0);
        {
          me.ce && // @ts-expect-error _def is private
          me.ce._def.shadowRoot !== !1 && me.ce._injectChildStyle(_e);
          const Pe = c.subTree = nn(c);
          F(
            null,
            Pe,
            h,
            b,
            c,
            p,
            g
          ), f.el = Pe.el;
        }
        if (G && Te(G, p), !Re && (C = P && P.onVnodeMounted)) {
          const Pe = f;
          Te(
            () => $e(C, k, Pe),
            p
          );
        }
        (f.shapeFlag & 256 || k && Et(k.vnode) && k.vnode.shapeFlag & 256) && c.a && Te(c.a, p), c.isMounted = !0, f = h = b = null;
      }
    };
    c.scope.on();
    const v = c.effect = new Kr(y);
    c.scope.off();
    const _ = c.update = v.run.bind(v), R = c.job = v.runIfDirty.bind(v);
    R.i = c, R.id = c.uid, v.scheduler = () => tr(R), st(c, !0), _();
  }, X = (c, f, h) => {
    f.component = c;
    const b = c.vnode.props;
    c.vnode = f, c.next = null, Oi(c, f.props, b, h), $i(c, f.children, h), _t(), Xs(c), bt();
  }, ne = (c, f, h, b, p, g, S, y, v = !1) => {
    const _ = c && c.children, R = c ? c.shapeFlag : 0, C = f.children, { patchFlag: A, shapeFlag: P } = f;
    if (A > 0) {
      if (A & 128) {
        q(
          _,
          C,
          h,
          b,
          p,
          g,
          S,
          y,
          v
        );
        return;
      } else if (A & 256) {
        T(
          _,
          C,
          h,
          b,
          p,
          g,
          S,
          y,
          v
        );
        return;
      }
    }
    P & 8 ? (R & 16 && Oe(_, p, g), C !== _ && d(h, C)) : R & 16 ? P & 16 ? q(
      _,
      C,
      h,
      b,
      p,
      g,
      S,
      y,
      v
    ) : Oe(_, p, g, !0) : (R & 8 && d(h, ""), P & 16 && N(
      C,
      h,
      b,
      p,
      g,
      S,
      y,
      v
    ));
  }, T = (c, f, h, b, p, g, S, y, v) => {
    c = c || ht, f = f || ht;
    const _ = c.length, R = f.length, C = Math.min(_, R);
    let A;
    for (A = 0; A < C; A++) {
      const P = f[A] = v ? Je(f[A]) : Ne(f[A]);
      F(
        c[A],
        P,
        h,
        null,
        p,
        g,
        S,
        y,
        v
      );
    }
    _ > R ? Oe(
      c,
      p,
      g,
      !0,
      !1,
      C
    ) : N(
      f,
      h,
      b,
      p,
      g,
      S,
      y,
      v,
      C
    );
  }, q = (c, f, h, b, p, g, S, y, v) => {
    let _ = 0;
    const R = f.length;
    let C = c.length - 1, A = R - 1;
    for (; _ <= C && _ <= A; ) {
      const P = c[_], H = f[_] = v ? Je(f[_]) : Ne(f[_]);
      if (St(P, H))
        F(
          P,
          H,
          h,
          null,
          p,
          g,
          S,
          y,
          v
        );
      else
        break;
      _++;
    }
    for (; _ <= C && _ <= A; ) {
      const P = c[C], H = f[A] = v ? Je(f[A]) : Ne(f[A]);
      if (St(P, H))
        F(
          P,
          H,
          h,
          null,
          p,
          g,
          S,
          y,
          v
        );
      else
        break;
      C--, A--;
    }
    if (_ > C) {
      if (_ <= A) {
        const P = A + 1, H = P < R ? f[P].el : b;
        for (; _ <= A; )
          F(
            null,
            f[_] = v ? Je(f[_]) : Ne(f[_]),
            h,
            H,
            p,
            g,
            S,
            y,
            v
          ), _++;
      }
    } else if (_ > A)
      for (; _ <= C; )
        re(c[_], p, g, !0), _++;
    else {
      const P = _, H = _, G = /* @__PURE__ */ new Map();
      for (_ = H; _ <= A; _++) {
        const xe = f[_] = v ? Je(f[_]) : Ne(f[_]);
        xe.key != null && G.set(xe.key, _);
      }
      let k, me = 0;
      const _e = A - H + 1;
      let Re = !1, Pe = 0;
      const yt = new Array(_e);
      for (_ = 0; _ < _e; _++) yt[_] = 0;
      for (_ = P; _ <= C; _++) {
        const xe = c[_];
        if (me >= _e) {
          re(xe, p, g, !0);
          continue;
        }
        let Fe;
        if (xe.key != null)
          Fe = G.get(xe.key);
        else
          for (k = H; k <= A; k++)
            if (yt[k - H] === 0 && St(xe, f[k])) {
              Fe = k;
              break;
            }
        Fe === void 0 ? re(xe, p, g, !0) : (yt[Fe - H] = _ + 1, Fe >= Pe ? Pe = Fe : Re = !0, F(
          xe,
          f[Fe],
          h,
          null,
          p,
          g,
          S,
          y,
          v
        ), me++);
      }
      const qs = Re ? ji(yt) : ht;
      for (k = qs.length - 1, _ = _e - 1; _ >= 0; _--) {
        const xe = H + _, Fe = f[xe], Gs = f[xe + 1], Ys = xe + 1 < R ? (
          // #13559, fallback to el placeholder for unresolved async component
          Gs.el || Gs.placeholder
        ) : b;
        yt[_] === 0 ? F(
          null,
          Fe,
          h,
          Ys,
          p,
          g,
          S,
          y,
          v
        ) : Re && (k < 0 || _ !== qs[k] ? le(Fe, h, Ys, 2) : k--);
      }
    }
  }, le = (c, f, h, b, p = null) => {
    const { el: g, type: S, transition: y, children: v, shapeFlag: _ } = c;
    if (_ & 6) {
      le(c.component.subTree, f, h, b);
      return;
    }
    if (_ & 128) {
      c.suspense.move(f, h, b);
      return;
    }
    if (_ & 64) {
      S.move(c, f, h, pe);
      return;
    }
    if (S === oe) {
      n(g, f, h);
      for (let C = 0; C < v.length; C++)
        le(v[C], f, h, b);
      n(c.anchor, f, h);
      return;
    }
    if (S === ds) {
      x(c, f, h);
      return;
    }
    if (b !== 2 && _ & 1 && y)
      if (b === 0)
        y.beforeEnter(g), n(g, f, h), Te(() => y.enter(g), p);
      else {
        const { leave: C, delayLeave: A, afterLeave: P } = y, H = () => {
          c.ctx.isUnmounted ? r(g) : n(g, f, h);
        }, G = () => {
          g._isLeaving && g[xi](
            !0
            /* cancelled */
          ), C(g, () => {
            H(), P && P();
          });
        };
        A ? A(g, H, G) : G();
      }
    else
      n(g, f, h);
  }, re = (c, f, h, b = !1, p = !1) => {
    const {
      type: g,
      props: S,
      ref: y,
      children: v,
      dynamicChildren: _,
      shapeFlag: R,
      patchFlag: C,
      dirs: A,
      cacheIndex: P
    } = c;
    if (C === -2 && (p = !1), y != null && (_t(), Mt(y, null, h, c, !0), bt()), P != null && (f.renderCache[P] = void 0), R & 256) {
      f.ctx.deactivate(c);
      return;
    }
    const H = R & 1 && A, G = !Et(c);
    let k;
    if (G && (k = S && S.onVnodeBeforeUnmount) && $e(k, f, c), R & 6)
      Ge(c.component, h, b);
    else {
      if (R & 128) {
        c.suspense.unmount(h, b);
        return;
      }
      H && tt(c, null, f, "beforeUnmount"), R & 64 ? c.type.remove(
        c,
        f,
        h,
        pe,
        b
      ) : _ && // #5154
      // when v-once is used inside a block, setBlockTracking(-1) marks the
      // parent block with hasOnce: true
      // so that it doesn't take the fast path during unmount - otherwise
      // components nested in v-once are never unmounted.
      !_.hasOnce && // #1153: fast path should not be taken for non-stable (v-for) fragments
      (g !== oe || C > 0 && C & 64) ? Oe(
        _,
        f,
        h,
        !1,
        !0
      ) : (g === oe && C & 384 || !p && R & 16) && Oe(v, f, h), b && qe(c);
    }
    (G && (k = S && S.onVnodeUnmounted) || H) && Te(() => {
      k && $e(k, f, c), H && tt(c, null, f, "unmounted");
    }, h);
  }, qe = (c) => {
    const { type: f, el: h, anchor: b, transition: p } = c;
    if (f === oe) {
      he(h, b);
      return;
    }
    if (f === ds) {
      I(c);
      return;
    }
    const g = () => {
      r(h), p && !p.persisted && p.afterLeave && p.afterLeave();
    };
    if (c.shapeFlag & 1 && p && !p.persisted) {
      const { leave: S, delayLeave: y } = p, v = () => S(h, g);
      y ? y(c.el, g, v) : v();
    } else
      g();
  }, he = (c, f) => {
    let h;
    for (; c !== f; )
      h = w(c), r(c), c = h;
    r(f);
  }, Ge = (c, f, h) => {
    const { bum: b, scope: p, job: g, subTree: S, um: y, m: v, a: _ } = c;
    sn(v), sn(_), b && Ht(b), p.stop(), g && (g.flags |= 8, re(S, c, f, h)), y && Te(y, f), Te(() => {
      c.isUnmounted = !0;
    }, f);
  }, Oe = (c, f, h, b = !1, p = !1, g = 0) => {
    for (let S = g; S < c.length; S++)
      re(c[S], f, h, b, p);
  }, ue = (c) => {
    if (c.shapeFlag & 6)
      return ue(c.component.subTree);
    if (c.shapeFlag & 128)
      return c.suspense.next();
    const f = w(c.anchor || c.el), h = f && f[vi];
    return h ? w(h) : f;
  };
  let Ee = !1;
  const ct = (c, f, h) => {
    c == null ? f._vnode && re(f._vnode, null, null, !0) : F(
      f._vnode || null,
      c,
      f,
      null,
      null,
      null,
      h
    ), f._vnode = c, Ee || (Ee = !0, Xs(), nr(), Ee = !1);
  }, pe = {
    p: F,
    um: re,
    m: le,
    r: qe,
    mt: Le,
    mc: N,
    pc: ne,
    pbc: Me,
    n: ue,
    o: e
  };
  return {
    render: ct,
    hydrate: void 0,
    createApp: Ii(ct)
  };
}
function as({ type: e, props: t }, s) {
  return s === "svg" && e === "foreignObject" || s === "mathml" && e === "annotation-xml" && t && t.encoding && t.encoding.includes("html") ? void 0 : s;
}
function st({ effect: e, job: t }, s) {
  s ? (e.flags |= 32, t.flags |= 4) : (e.flags &= -33, t.flags &= -5);
}
function Li(e, t) {
  return (!e || e && !e.pendingBranch) && t && !t.persisted;
}
function pr(e, t, s = !1) {
  const n = e.children, r = t.children;
  if (V(n) && V(r))
    for (let i = 0; i < n.length; i++) {
      const o = n[i];
      let l = r[i];
      l.shapeFlag & 1 && !l.dynamicChildren && ((l.patchFlag <= 0 || l.patchFlag === 32) && (l = r[i] = Je(r[i]), l.el = o.el), !s && l.patchFlag !== -2 && pr(o, l)), l.type === ns && // avoid cached text nodes retaining detached dom nodes
      l.patchFlag !== -1 && (l.el = o.el), l.type === Xe && !l.el && (l.el = o.el);
    }
}
function ji(e) {
  const t = e.slice(), s = [0];
  let n, r, i, o, l;
  const u = e.length;
  for (n = 0; n < u; n++) {
    const a = e[n];
    if (a !== 0) {
      if (r = s[s.length - 1], e[r] < a) {
        t[n] = r, s.push(n);
        continue;
      }
      for (i = 0, o = s.length - 1; i < o; )
        l = i + o >> 1, e[s[l]] < a ? i = l + 1 : o = l;
      a < e[s[i]] && (i > 0 && (t[n] = s[i - 1]), s[i] = n);
    }
  }
  for (i = s.length, o = s[i - 1]; i-- > 0; )
    s[i] = o, o = t[o];
  return s;
}
function gr(e) {
  const t = e.subTree.component;
  if (t)
    return t.asyncDep && !t.asyncResolved ? t : gr(t);
}
function sn(e) {
  if (e)
    for (let t = 0; t < e.length; t++)
      e[t].flags |= 8;
}
const Hi = (e, t) => t === "modelValue" || t === "model-value" ? e.modelModifiers : e[`${t}Modifiers`] || e[`${ze(t)}Modifiers`] || e[`${it(t)}Modifiers`];
function Vi(e, t, ...s) {
  if (e.isUnmounted) return;
  const n = e.vnode.props || te;
  let r = s;
  const i = t.startsWith("update:"), o = i && Hi(n, t.slice(7));
  o && (o.trim && (r = s.map((d) => ce(d) ? d.trim() : d)), o.number && (r = s.map(Rs)));
  let l, u = n[l = is(t)] || // also try camelCase event handler (#2249)
  n[l = is(ze(t))];
  !u && i && (u = n[l = is(it(t))]), u && rt(
    u,
    e,
    6,
    r
  );
  const a = n[l + "Once"];
  if (a) {
    if (!e.emitted)
      e.emitted = {};
    else if (e.emitted[l])
      return;
    e.emitted[l] = !0, rt(
      a,
      e,
      6,
      r
    );
  }
}
function Ki(e, t, s = !1) {
  const n = t.emitsCache, r = n.get(e);
  if (r !== void 0)
    return r;
  const i = e.emits;
  let o = {};
  return i ? (V(i) ? i.forEach((l) => o[l] = null) : We(o, i), ie(e) && n.set(e, o), o) : (ie(e) && n.set(e, null), null);
}
function ss(e, t) {
  return !e || !zt(t) ? !1 : (t = t.slice(2).replace(/Once$/, ""), W(e, t[0].toLowerCase() + t.slice(1)) || W(e, it(t)) || W(e, t));
}
function nn(e) {
  const {
    type: t,
    vnode: s,
    proxy: n,
    withProxy: r,
    propsOptions: [i],
    slots: o,
    attrs: l,
    emit: u,
    render: a,
    renderCache: d,
    props: m,
    data: w,
    setupState: O,
    ctx: $,
    inheritAttrs: F
  } = e, J = qt(e);
  let D, Z;
  try {
    if (s.shapeFlag & 4) {
      const I = r || n, se = I;
      D = Ne(
        a.call(
          se,
          I,
          d,
          m,
          O,
          w,
          $
        )
      ), Z = l;
    } else {
      const I = t;
      D = Ne(
        I.length > 1 ? I(
          m,
          { attrs: l, slots: o, emit: u }
        ) : I(
          m,
          null
        )
      ), Z = t.props ? l : Bi(l);
    }
  } catch (I) {
    At.length = 0, ts(I, e, 1), D = Ue(Xe);
  }
  let x = D;
  if (Z && F !== !1) {
    const I = Object.keys(Z), { shapeFlag: se } = x;
    I.length && se & 7 && (i && I.some(As) && (Z = Ui(
      Z,
      i
    )), x = vt(x, Z, !1, !0));
  }
  return s.dirs && (x = vt(x, null, !1, !0), x.dirs = x.dirs ? x.dirs.concat(s.dirs) : s.dirs), s.transition && Ks(x, s.transition), D = x, qt(J), D;
}
const Bi = (e) => {
  let t;
  for (const s in e)
    (s === "class" || s === "style" || zt(s)) && ((t || (t = {}))[s] = e[s]);
  return t;
}, Ui = (e, t) => {
  const s = {};
  for (const n in e)
    (!As(n) || !(n.slice(9) in t)) && (s[n] = e[n]);
  return s;
};
function ki(e, t, s) {
  const { props: n, children: r, component: i } = e, { props: o, children: l, patchFlag: u } = t, a = i.emitsOptions;
  if (t.dirs || t.transition)
    return !0;
  if (s && u >= 0) {
    if (u & 1024)
      return !0;
    if (u & 16)
      return n ? rn(n, o, a) : !!o;
    if (u & 8) {
      const d = t.dynamicProps;
      for (let m = 0; m < d.length; m++) {
        const w = d[m];
        if (o[w] !== n[w] && !ss(a, w))
          return !0;
      }
    }
  } else
    return (r || l) && (!l || !l.$stable) ? !0 : n === o ? !1 : n ? o ? rn(n, o, a) : !0 : !!o;
  return !1;
}
function rn(e, t, s) {
  const n = Object.keys(t);
  if (n.length !== Object.keys(e).length)
    return !0;
  for (let r = 0; r < n.length; r++) {
    const i = n[r];
    if (t[i] !== e[i] && !ss(s, i))
      return !0;
  }
  return !1;
}
function Wi({ vnode: e, parent: t }, s) {
  for (; t; ) {
    const n = t.subTree;
    if (n.suspense && n.suspense.activeBranch === e && (n.el = e.el), n === e)
      (e = t.vnode).el = s, t = t.parent;
    else
      break;
  }
}
const mr = (e) => e.__isSuspense;
function qi(e, t) {
  t && t.pendingBranch ? V(e) ? t.effects.push(...e) : t.effects.push(e) : _i(e);
}
const oe = Symbol.for("v-fgt"), ns = Symbol.for("v-txt"), Xe = Symbol.for("v-cmt"), ds = Symbol.for("v-stc"), At = [];
let we = null;
function L(e = !1) {
  At.push(we = e ? null : []);
}
function Gi() {
  At.pop(), we = At[At.length - 1] || null;
}
let $t = 1;
function on(e, t = !1) {
  $t += e, e < 0 && we && t && (we.hasOnce = !0);
}
function _r(e) {
  return e.dynamicChildren = $t > 0 ? we || ht : null, Gi(), $t > 0 && we && we.push(e), e;
}
function j(e, t, s, n, r, i) {
  return _r(
    M(
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
function Yi(e, t, s, n, r) {
  return _r(
    Ue(
      e,
      t,
      s,
      n,
      r,
      !0
    )
  );
}
function br(e) {
  return e ? e.__v_isVNode === !0 : !1;
}
function St(e, t) {
  return e.type === t.type && e.key === t.key;
}
const vr = ({ key: e }) => e ?? null, Vt = ({
  ref: e,
  ref_key: t,
  ref_for: s
}) => (typeof e == "number" && (e = "" + e), e != null ? ce(e) || Ce(e) || z(e) ? { i: Ie, r: e, k: t, f: !!s } : e : null);
function M(e, t = null, s = null, n = 0, r = null, i = e === oe ? 0 : 1, o = !1, l = !1) {
  const u = {
    __v_isVNode: !0,
    __v_skip: !0,
    type: e,
    props: t,
    key: t && vr(t),
    ref: t && Vt(t),
    scopeId: ir,
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
    ctx: Ie
  };
  return l ? (ks(u, s), i & 128 && e.normalize(u)) : s && (u.shapeFlag |= ce(s) ? 8 : 16), $t > 0 && // avoid a block node from tracking itself
  !o && // has current parent block
  we && // presence of a patch flag indicates this node needs patching on updates.
  // component nodes also should always be patched, because even if the
  // component doesn't need to update, it needs to persist the instance on to
  // the next vnode so that it can be properly unmounted later.
  (u.patchFlag > 0 || i & 6) && // the EVENTS flag is only for hydration and if it is the only flag, the
  // vnode should not be considered dynamic due to handler caching.
  u.patchFlag !== 32 && we.push(u), u;
}
const Ue = Ji;
function Ji(e, t = null, s = null, n = 0, r = null, i = !1) {
  if ((!e || e === Ti) && (e = Xe), br(e)) {
    const l = vt(
      e,
      t,
      !0
      /* mergeRef: true */
    );
    return s && ks(l, s), $t > 0 && !i && we && (l.shapeFlag & 6 ? we[we.indexOf(e)] = l : we.push(l)), l.patchFlag = -2, l;
  }
  if (io(e) && (e = e.__vccOpts), t) {
    t = zi(t);
    let { class: l, style: u } = t;
    l && !ce(l) && (t.class = Ot(l)), ie(u) && (Vs(u) && !V(u) && (u = We({}, u)), t.style = Ps(u));
  }
  const o = ce(e) ? 1 : mr(e) ? 128 : yi(e) ? 64 : ie(e) ? 4 : z(e) ? 2 : 0;
  return M(
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
function zi(e) {
  return e ? Vs(e) || ur(e) ? We({}, e) : e : null;
}
function vt(e, t, s = !1, n = !1) {
  const { props: r, ref: i, patchFlag: o, children: l, transition: u } = e, a = t ? Qi(r || {}, t) : r, d = {
    __v_isVNode: !0,
    __v_skip: !0,
    type: e.type,
    props: a,
    key: a && vr(a),
    ref: t && t.ref ? (
      // #2078 in the case of <component :is="vnode" ref="extra"/>
      // if the vnode itself already has a ref, cloneVNode will need to merge
      // the refs so the single vnode can be set on multiple refs
      s && i ? V(i) ? i.concat(Vt(t)) : [i, Vt(t)] : Vt(t)
    ) : i,
    scopeId: e.scopeId,
    slotScopeIds: e.slotScopeIds,
    children: l,
    target: e.target,
    targetStart: e.targetStart,
    targetAnchor: e.targetAnchor,
    staticCount: e.staticCount,
    shapeFlag: e.shapeFlag,
    // if the vnode is cloned with extra props, we can no longer assume its
    // existing patch flag to be reliable and need to add the FULL_PROPS flag.
    // note: preserve flag for fragments since they use the flag for children
    // fast paths only.
    patchFlag: t && e.type !== oe ? o === -1 ? 16 : o | 16 : o,
    dynamicProps: e.dynamicProps,
    dynamicChildren: e.dynamicChildren,
    appContext: e.appContext,
    dirs: e.dirs,
    transition: u,
    // These should technically only be non-null on mounted VNodes. However,
    // they *should* be copied for kept-alive vnodes. So we just always copy
    // them since them being non-null during a mount doesn't affect the logic as
    // they will simply be overwritten.
    component: e.component,
    suspense: e.suspense,
    ssContent: e.ssContent && vt(e.ssContent),
    ssFallback: e.ssFallback && vt(e.ssFallback),
    placeholder: e.placeholder,
    el: e.el,
    anchor: e.anchor,
    ctx: e.ctx,
    ce: e.ce
  };
  return u && n && Ks(
    d,
    u.clone(d)
  ), d;
}
function Kt(e = " ", t = 0) {
  return Ue(ns, null, e, t);
}
function ve(e = "", t = !1) {
  return t ? (L(), Yi(Xe, null, e)) : Ue(Xe, null, e);
}
function Ne(e) {
  return e == null || typeof e == "boolean" ? Ue(Xe) : V(e) ? Ue(
    oe,
    null,
    // #3666, avoid reference pollution when reusing vnode
    e.slice()
  ) : br(e) ? Je(e) : Ue(ns, null, String(e));
}
function Je(e) {
  return e.el === null && e.patchFlag !== -1 || e.memo ? e : vt(e);
}
function ks(e, t) {
  let s = 0;
  const { shapeFlag: n } = e;
  if (t == null)
    t = null;
  else if (V(t))
    s = 16;
  else if (typeof t == "object")
    if (n & 65) {
      const r = t.default;
      r && (r._c && (r._d = !1), ks(e, r()), r._c && (r._d = !0));
      return;
    } else {
      s = 32;
      const r = t._;
      !r && !ur(t) ? t._ctx = Ie : r === 3 && Ie && (Ie.slots._ === 1 ? t._ = 1 : (t._ = 2, e.patchFlag |= 1024));
    }
  else z(t) ? (t = { default: t, _ctx: Ie }, s = 32) : (t = String(t), n & 64 ? (s = 16, t = [Kt(t)]) : s = 8);
  e.children = t, e.shapeFlag |= s;
}
function Qi(...e) {
  const t = {};
  for (let s = 0; s < e.length; s++) {
    const n = e[s];
    for (const r in n)
      if (r === "class")
        t.class !== n.class && (t.class = Ot([t.class, n.class]));
      else if (r === "style")
        t.style = Ps([t.style, n.style]);
      else if (zt(r)) {
        const i = t[r], o = n[r];
        o && i !== o && !(V(i) && i.includes(o)) && (t[r] = i ? [].concat(i, o) : o);
      } else r !== "" && (t[r] = n[r]);
  }
  return t;
}
function $e(e, t, s, n = null) {
  rt(e, t, 7, [
    s,
    n
  ]);
}
const Xi = or();
let Zi = 0;
function eo(e, t, s) {
  const n = e.type, r = (t ? t.appContext : e.appContext) || Xi, i = {
    uid: Zi++,
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
    scope: new Vr(
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
    propsOptions: Ri(n, r),
    emitsOptions: Ki(n, r),
    // emit
    emit: null,
    // to be set immediately
    emitted: null,
    // props default value
    propsDefaults: te,
    // inheritAttrs
    inheritAttrs: n.inheritAttrs,
    // state
    ctx: te,
    data: te,
    props: te,
    attrs: te,
    slots: te,
    refs: te,
    setupState: te,
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
  return i.ctx = { _: i }, i.root = t ? t.root : i, i.emit = Vi.bind(null, i), e.ce && e.ce(i), i;
}
let Yt = null, Jt, Cs;
{
  const e = Zt(), t = (s, n) => {
    let r;
    return (r = e[s]) || (r = e[s] = []), r.push(n), (i) => {
      r.length > 1 ? r.forEach((o) => o(i)) : r[0](i);
    };
  };
  Jt = t(
    "__VUE_INSTANCE_SETTERS__",
    (s) => Yt = s
  ), Cs = t(
    "__VUE_SSR_SETTERS__",
    (s) => Sr = s
  );
}
const yr = (e) => {
  const t = Yt;
  return Jt(e), e.scope.on(), () => {
    e.scope.off(), Jt(t);
  };
}, ln = () => {
  Yt && Yt.scope.off(), Jt(null);
};
function xr(e) {
  return e.vnode.shapeFlag & 4;
}
let Sr = !1;
function to(e, t = !1, s = !1) {
  t && Cs(t);
  const { props: n, children: r } = e.vnode, i = xr(e);
  Ai(e, n, i, t), Fi(e, r, s || t);
  const o = i ? so(e, t) : void 0;
  return t && Cs(!1), o;
}
function so(e, t) {
  const s = e.type;
  e.accessCache = /* @__PURE__ */ Object.create(null), e.proxy = new Proxy(e.ctx, Mi);
  const { setup: n } = s;
  if (n) {
    _t();
    const r = e.setupContext = n.length > 1 ? ro(e) : null, i = yr(e), o = Dt(
      n,
      e,
      0,
      [
        e.props,
        r
      ]
    ), l = Rn(o);
    if (bt(), i(), (l || e.sp) && !Et(e) && wi(e), l) {
      if (o.then(ln, ln), t)
        return o.then((u) => {
          cn(e, u);
        }).catch((u) => {
          ts(u, e, 0);
        });
      e.asyncDep = o;
    } else
      cn(e, o);
  } else
    wr(e);
}
function cn(e, t, s) {
  z(t) ? e.type.__ssrInlineRender ? e.ssrRender = t : e.render = t : ie(t) && (e.setupState = Zn(t)), wr(e);
}
function wr(e, t, s) {
  const n = e.type;
  e.render || (e.render = n.render || Is);
}
const no = {
  get(e, t) {
    return de(e, "get", ""), e[t];
  }
};
function ro(e) {
  const t = (s) => {
    e.exposed = s || {};
  };
  return {
    attrs: new Proxy(e.attrs, no),
    slots: e.slots,
    emit: e.emit,
    expose: t
  };
}
function rs(e) {
  return e.exposed ? e.exposeProxy || (e.exposeProxy = new Proxy(Zn(li(e.exposed)), {
    get(t, s) {
      if (s in t)
        return t[s];
      if (s in It)
        return It[s](e);
    },
    has(t, s) {
      return s in t || s in It;
    }
  })) : e.proxy;
}
function io(e) {
  return z(e) && "__vccOpts" in e;
}
const jt = (e, t) => hi(e, t, Sr), oo = "3.5.24";
/**
* @vue/runtime-dom v3.5.24
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
let Ts;
const un = typeof window < "u" && window.trustedTypes;
if (un)
  try {
    Ts = /* @__PURE__ */ un.createPolicy("vue", {
      createHTML: (e) => e
    });
  } catch {
  }
const Cr = Ts ? (e) => Ts.createHTML(e) : (e) => e, lo = "http://www.w3.org/2000/svg", co = "http://www.w3.org/1998/Math/MathML", Ke = typeof document < "u" ? document : null, fn = Ke && /* @__PURE__ */ Ke.createElement("template"), uo = {
  insert: (e, t, s) => {
    t.insertBefore(e, s || null);
  },
  remove: (e) => {
    const t = e.parentNode;
    t && t.removeChild(e);
  },
  createElement: (e, t, s, n) => {
    const r = t === "svg" ? Ke.createElementNS(lo, e) : t === "mathml" ? Ke.createElementNS(co, e) : s ? Ke.createElement(e, { is: s }) : Ke.createElement(e);
    return e === "select" && n && n.multiple != null && r.setAttribute("multiple", n.multiple), r;
  },
  createText: (e) => Ke.createTextNode(e),
  createComment: (e) => Ke.createComment(e),
  setText: (e, t) => {
    e.nodeValue = t;
  },
  setElementText: (e, t) => {
    e.textContent = t;
  },
  parentNode: (e) => e.parentNode,
  nextSibling: (e) => e.nextSibling,
  querySelector: (e) => Ke.querySelector(e),
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
      fn.innerHTML = Cr(
        n === "svg" ? `<svg>${e}</svg>` : n === "mathml" ? `<math>${e}</math>` : e
      );
      const l = fn.content;
      if (n === "svg" || n === "mathml") {
        const u = l.firstChild;
        for (; u.firstChild; )
          l.appendChild(u.firstChild);
        l.removeChild(u);
      }
      t.insertBefore(l, s);
    }
    return [
      // first
      o ? o.nextSibling : t.firstChild,
      // last
      s ? s.previousSibling : t.lastChild
    ];
  }
}, fo = Symbol("_vtc");
function ao(e, t, s) {
  const n = e[fo];
  n && (t = (t ? [t, ...n] : [...n]).join(" ")), t == null ? e.removeAttribute("class") : s ? e.setAttribute("class", t) : e.className = t;
}
const an = Symbol("_vod"), ho = Symbol("_vsh"), po = Symbol(""), go = /(?:^|;)\s*display\s*:/;
function mo(e, t, s) {
  const n = e.style, r = ce(s);
  let i = !1;
  if (s && !r) {
    if (t)
      if (ce(t))
        for (const o of t.split(";")) {
          const l = o.slice(0, o.indexOf(":")).trim();
          s[l] == null && Bt(n, l, "");
        }
      else
        for (const o in t)
          s[o] == null && Bt(n, o, "");
    for (const o in s)
      o === "display" && (i = !0), Bt(n, o, s[o]);
  } else if (r) {
    if (t !== s) {
      const o = n[po];
      o && (s += ";" + o), n.cssText = s, i = go.test(s);
    }
  } else t && e.removeAttribute("style");
  an in e && (e[an] = i ? n.display : "", e[ho] && (n.display = "none"));
}
const dn = /\s*!important$/;
function Bt(e, t, s) {
  if (V(s))
    s.forEach((n) => Bt(e, t, n));
  else if (s == null && (s = ""), t.startsWith("--"))
    e.setProperty(t, s);
  else {
    const n = _o(e, t);
    dn.test(s) ? e.setProperty(
      it(n),
      s.replace(dn, ""),
      "important"
    ) : e[n] = s;
  }
}
const hn = ["Webkit", "Moz", "ms"], hs = {};
function _o(e, t) {
  const s = hs[t];
  if (s)
    return s;
  let n = ze(t);
  if (n !== "filter" && n in e)
    return hs[t] = n;
  n = $n(n);
  for (let r = 0; r < hn.length; r++) {
    const i = hn[r] + n;
    if (i in e)
      return hs[t] = i;
  }
  return t;
}
const pn = "http://www.w3.org/1999/xlink";
function gn(e, t, s, n, r, i = Hr(t)) {
  n && t.startsWith("xlink:") ? s == null ? e.removeAttributeNS(pn, t.slice(6, t.length)) : e.setAttributeNS(pn, t, s) : s == null || i && !Nn(s) ? e.removeAttribute(t) : e.setAttribute(
    t,
    i ? "" : Ze(s) ? String(s) : s
  );
}
function mn(e, t, s, n, r) {
  if (t === "innerHTML" || t === "textContent") {
    s != null && (e[t] = t === "innerHTML" ? Cr(s) : s);
    return;
  }
  const i = e.tagName;
  if (t === "value" && i !== "PROGRESS" && // custom elements may use _value internally
  !i.includes("-")) {
    const l = i === "OPTION" ? e.getAttribute("value") || "" : e.value, u = s == null ? (
      // #11647: value should be set as empty string for null and undefined,
      // but <input type="checkbox"> should be set as 'on'.
      e.type === "checkbox" ? "on" : ""
    ) : String(s);
    (l !== u || !("_value" in e)) && (e.value = u), s == null && e.removeAttribute(t), e._value = s;
    return;
  }
  let o = !1;
  if (s === "" || s == null) {
    const l = typeof e[t];
    l === "boolean" ? s = Nn(s) : s == null && l === "string" ? (s = "", o = !0) : l === "number" && (s = 0, o = !0);
  }
  try {
    e[t] = s;
  } catch {
  }
  o && e.removeAttribute(r || t);
}
function dt(e, t, s, n) {
  e.addEventListener(t, s, n);
}
function bo(e, t, s, n) {
  e.removeEventListener(t, s, n);
}
const _n = Symbol("_vei");
function vo(e, t, s, n, r = null) {
  const i = e[_n] || (e[_n] = {}), o = i[t];
  if (n && o)
    o.value = n;
  else {
    const [l, u] = yo(t);
    if (n) {
      const a = i[t] = wo(
        n,
        r
      );
      dt(e, l, a, u);
    } else o && (bo(e, l, o, u), i[t] = void 0);
  }
}
const bn = /(?:Once|Passive|Capture)$/;
function yo(e) {
  let t;
  if (bn.test(e)) {
    t = {};
    let n;
    for (; n = e.match(bn); )
      e = e.slice(0, e.length - n[0].length), t[n[0].toLowerCase()] = !0;
  }
  return [e[2] === ":" ? e.slice(3) : it(e.slice(2)), t];
}
let ps = 0;
const xo = /* @__PURE__ */ Promise.resolve(), So = () => ps || (xo.then(() => ps = 0), ps = Date.now());
function wo(e, t) {
  const s = (n) => {
    if (!n._vts)
      n._vts = Date.now();
    else if (n._vts <= s.attached)
      return;
    rt(
      Co(n, s.value),
      t,
      5,
      [n]
    );
  };
  return s.value = e, s.attached = So(), s;
}
function Co(e, t) {
  if (V(t)) {
    const s = e.stopImmediatePropagation;
    return e.stopImmediatePropagation = () => {
      s.call(e), e._stopped = !0;
    }, t.map(
      (n) => (r) => !r._stopped && n && n(r)
    );
  } else
    return t;
}
const vn = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && // lowercase letter
e.charCodeAt(2) > 96 && e.charCodeAt(2) < 123, To = (e, t, s, n, r, i) => {
  const o = r === "svg";
  t === "class" ? ao(e, n, o) : t === "style" ? mo(e, s, n) : zt(t) ? As(t) || vo(e, t, s, n, i) : (t[0] === "." ? (t = t.slice(1), !0) : t[0] === "^" ? (t = t.slice(1), !1) : Mo(e, t, n, o)) ? (mn(e, t, n), !e.tagName.includes("-") && (t === "value" || t === "checked" || t === "selected") && gn(e, t, n, o, i, t !== "value")) : /* #11081 force set props for possible async custom element */ e._isVueCE && (/[A-Z]/.test(t) || !ce(n)) ? mn(e, ze(t), n, i, t) : (t === "true-value" ? e._trueValue = n : t === "false-value" && (e._falseValue = n), gn(e, t, n, o));
};
function Mo(e, t, s, n) {
  if (n)
    return !!(t === "innerHTML" || t === "textContent" || t in e && vn(t) && z(s));
  if (t === "spellcheck" || t === "draggable" || t === "translate" || t === "autocorrect" || t === "sandbox" && e.tagName === "IFRAME" || t === "form" || t === "list" && e.tagName === "INPUT" || t === "type" && e.tagName === "TEXTAREA")
    return !1;
  if (t === "width" || t === "height") {
    const r = e.tagName;
    if (r === "IMG" || r === "VIDEO" || r === "CANVAS" || r === "SOURCE")
      return !1;
  }
  return vn(t) && ce(s) ? !1 : t in e;
}
const yn = (e) => {
  const t = e.props["onUpdate:modelValue"] || !1;
  return V(t) ? (s) => Ht(t, s) : t;
};
function Eo(e) {
  e.target.composing = !0;
}
function xn(e) {
  const t = e.target;
  t.composing && (t.composing = !1, t.dispatchEvent(new Event("input")));
}
const gs = Symbol("_assign");
function Sn(e, t, s) {
  return t && (e = e.trim()), s && (e = Rs(e)), e;
}
const wn = {
  created(e, { modifiers: { lazy: t, trim: s, number: n } }, r) {
    e[gs] = yn(r);
    const i = n || r.props && r.props.type === "number";
    dt(e, t ? "change" : "input", (o) => {
      o.target.composing || e[gs](Sn(e.value, s, i));
    }), (s || i) && dt(e, "change", () => {
      e.value = Sn(e.value, s, i);
    }), t || (dt(e, "compositionstart", Eo), dt(e, "compositionend", xn), dt(e, "change", xn));
  },
  // set value on mounted so it's after min/max for type="range"
  mounted(e, { value: t }) {
    e.value = t ?? "";
  },
  beforeUpdate(e, { value: t, oldValue: s, modifiers: { lazy: n, trim: r, number: i } }, o) {
    if (e[gs] = yn(o), e.composing) return;
    const l = (i || e.type === "number") && !/^0\d/.test(e.value) ? Rs(e.value) : e.value, u = t ?? "";
    l !== u && (document.activeElement === e && e.type !== "range" && (n && t === s || r && e.value.trim() === u) || (e.value = u));
  }
}, Io = ["ctrl", "shift", "alt", "meta"], Ao = {
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
  exact: (e, t) => Io.some((s) => e[`${s}Key`] && !t.includes(s))
}, Cn = (e, t) => {
  const s = e._withMods || (e._withMods = {}), n = t.join(".");
  return s[n] || (s[n] = (r, ...i) => {
    for (let o = 0; o < t.length; o++) {
      const l = Ao[t[o]];
      if (l && l(r, t)) return;
    }
    return e(r, ...i);
  });
}, Oo = /* @__PURE__ */ We({ patchProp: To }, uo);
let Tn;
function Ro() {
  return Tn || (Tn = Di(Oo));
}
const Po = (...e) => {
  const t = Ro().createApp(...e), { mount: s } = t;
  return t.mount = (n) => {
    const r = $o(n);
    if (!r) return;
    const i = t._component;
    !z(i) && !i.render && !i.template && (i.template = r.innerHTML), r.nodeType === 1 && (r.textContent = "");
    const o = s(r, !1, Fo(r));
    return r instanceof Element && (r.removeAttribute("v-cloak"), r.setAttribute("data-v-app", "")), o;
  }, t;
};
function Fo(e) {
  if (e instanceof SVGElement)
    return "svg";
  if (typeof MathMLElement == "function" && e instanceof MathMLElement)
    return "mathml";
}
function $o(e) {
  return ce(e) ? document.querySelector(e) : e;
}
const Ws = [
  ["下雨", "雨天", "淋雨", "雨停", "大雨", "小雨", "阵雨", "雷雨", "冒雨", "阴雨", "梅雨", "细雨"],
  ["晴天", "晴朗", "大晴", "艳阳", "阳光", "放晴", "天晴", "万里无云"],
  ["下雪", "雪天", "暴雪", "小雪", "飘雪", "初雪", "积雪", "雪景"],
  ["刮风", "大风", "吹风", "微风", "晚风", "寒风", "海风", "江风"],
  ["晚霞", "夕阳", "日落", "黄昏", "落日", "暮色", "余晖", "傍晚"],
  ["清晨", "早上", "早晨", "晨光", "日出", "清早", "天刚亮", "早起"],
  ["夜里", "夜晚", "深夜", "晚上", "夜色", "月光", "凌晨", "半夜", "宵夜"],
  ["河边", "江边", "河岸", "溪边", "水边", "沿河", "滨江", "河堤", "江岸"],
  ["海边", "海岸", "沙滩", "海滩", "海风", "海浪", "看海", "礁石", "灯塔"],
  ["公园", "草坪", "银杏", "树林", "湖边", "植物园", "林荫道", "步道"],
  ["咖啡", "咖啡店", "咖啡馆", "拿铁", "美式", "手冲", "卡布奇诺", "冷萃"],
  ["茶馆", "喝茶", "奶茶", "清茶", "乌龙", "抹茶", "茶室"],
  ["看书", "读书", "阅读", "书店", "翻书", "图书馆", "小说", "自习", "书架"],
  ["散步", "溜达", "走走", "漫步", "步行", "压马路", "逛街", "闲逛"],
  ["跑步", "夜跑", "晨跑", "慢跑", "操场", "运动", "健身", "骑行", "骑车"],
  ["吃饭", "聚餐", "晚饭", "午饭", "火锅", "烧烤", "拉面", "小馆", "餐厅", "做饭"],
  ["电影", "看电影", "影院", "电影院", "观影", "放映厅"],
  ["展览", "美术馆", "博物馆", "画展", "看展", "艺术馆"],
  ["开心", "雀跃", "高兴", "愉快", "快乐", "喜悦", "满足", "畅快", "轻松", "舒畅"],
  ["难过", "低落", "伤心", "沮丧", "失落", "郁闷", "烦躁", "压抑", "堵得慌", "很闷", "心情差", "委屈", "焦虑"],
  ["平静", "安宁", "安静", "宁静", "舒缓", "踏实", "发呆", "放空"],
  ["疲惫", "好累", "累坏了", "困倦", "通宵", "熬夜", "加班", "赶稿"],
  ["独自", "一个人", "独处", "孤身", "自己"],
  ["一起", "同行", "陪同", "结伴", "聚会", "约了", "碰面", "聊天"],
  ["实验", "答辩", "论文", "代码", "调试", "比赛", "项目", "实验室", "课题组", "汇报"],
  ["旅行", "出游", "爬山", "徒步", "古镇", "高铁", "火车", "航班", "民宿"],
  ["拍照", "相机", "胶片", "快门", "摄影", "镜头", "抓拍"],
  ["猫", "小猫", "猫咪", "橘猫", "狸花猫", "狗", "小狗", "遛狗"]
], Tr = /(?:没有|没|未曾|不曾|并非|不是|不在|不去|别去)[^，,。！？；\n]{0,6}$/, Mr = /* @__PURE__ */ new Set([
  "今天",
  "昨天",
  "那天",
  "当时",
  "时候",
  "觉得",
  "感觉",
  "一下",
  "一点",
  "有点",
  "一个",
  "一起",
  "因为",
  "所以",
  "但是",
  "还是",
  "已经",
  "真的",
  "非常",
  "特别",
  "自己",
  "我们",
  "他们",
  "什么",
  "怎么",
  "好像",
  "记得",
  "去年",
  "今年",
  "前年"
]);
function Ve(e, t) {
  let s = e.indexOf(t);
  for (; s !== -1; ) {
    const n = e.slice(Math.max(0, s - 8), s);
    if (!Tr.test(n)) return !0;
    s = e.indexOf(t, s + t.length);
  }
  return !1;
}
function Do(e, t) {
  if (!t) return 0;
  let s = 0, n = e.indexOf(t);
  for (; n !== -1; ) {
    const r = e.slice(Math.max(0, n - 8), n);
    Tr.test(r) || s++, n = e.indexOf(t, n + t.length);
  }
  return s;
}
function Er(e) {
  const t = [...new Set(e.map((n) => n.toLowerCase().trim()).filter(Boolean))], s = /* @__PURE__ */ new Map();
  for (const n of t) {
    const r = /* @__PURE__ */ new Set();
    for (const i of Ws)
      if (i.some((o) => n.includes(o) || o.includes(n)))
        for (const o of i) o !== n && r.add(o);
    if (/^[\u4e00-\u9fff]{3,}$/.test(n))
      for (let i = 0; i < n.length - 1; i++) {
        const o = n.slice(i, i + 2);
        Mr.has(o) || r.add(o);
      }
    s.set(n, [...r]);
  }
  return { exact: t, expanded: s };
}
const Ut = Ws.length, Ms = 68, ms = Ut + Ms;
function Mn(e) {
  let t = 2166136261;
  for (let s = 0; s < e.length; s++)
    t ^= e.charCodeAt(s), t = Math.imul(t, 16777619);
  return t >>> 0;
}
function En(e) {
  const t = new Float32Array(ms), s = e.toLowerCase();
  for (let o = 0; o < Ut; o++) {
    const l = Ws[o];
    let u = 0;
    for (const a of l)
      Ve(s, a) && (u += 1);
    u > 0 && (t[o] = 1.6 * (1 + Math.log1p(u)));
  }
  const n = s.replace(/[^\u4e00-\u9fff]/g, "");
  for (let o = 0; o < n.length - 1; o++) {
    const l = n.slice(o, o + 2);
    if (Mr.has(l)) continue;
    const u = Mn(l), a = Ut + u % Ms, d = u & 1 ? -1 : 1;
    t[a] += d * 0.7;
  }
  const r = s.match(/[a-z0-9]{2,}/g) ?? [];
  for (const o of r) {
    const l = Mn(o), u = Ut + l % Ms, a = l & 1 ? -1 : 1;
    t[u] += a * 0.9;
  }
  let i = 0;
  for (let o = 0; o < ms; o++) i += t[o] * t[o];
  if (i = Math.sqrt(i), i > 0)
    for (let o = 0; o < ms; o++) t[o] = t[o] / i;
  return t;
}
function No(e, t) {
  const s = Math.min(e.length, t.length);
  let n = 0;
  for (let r = 0; r < s; r++) n += e[r] * t[r];
  return n;
}
function Lo(e, t, s = "hybrid") {
  const { exact: n, expanded: r } = Er(t);
  if (!n.length || !e.length) return [];
  const i = e.map((x) => {
    const I = x.sources.filter((N) => N.origin !== "image_model").map((N) => N.text).join(`
`).toLowerCase(), se = x.sources.filter((N) => N.origin === "image_model").map((N) => N.text).join(`
`).toLowerCase(), ee = x.generated.toLowerCase(), Q = Math.max(1, I.length + se.length * 0.5 + ee.length * 0.25);
    return { memory: x, original: I, image: se, generated: ee, len: Q };
  });
  if (s === "keyword")
    return i.flatMap(({ memory: x, original: I, image: se, generated: ee }) => {
      const Q = n.reduce((N, ae) => I.includes(ae) ? N + 4 : se.includes(ae) ? N + 2 : ee.includes(ae) ? N + 1 : N, 0);
      return Q > 0 ? [{ memory: x, score: Q, bm25Score: Q, semanticScore: 0 }] : [];
    }).sort((x, I) => I.score - x.score || I.memory.date.localeCompare(x.memory.date));
  if (s === "synonym")
    return i.flatMap(({ memory: x, original: I, image: se, generated: ee }) => {
      const Q = n.reduce((N, ae) => {
        if (I.includes(ae)) return N + 4;
        if (se.includes(ae)) return N + 2;
        if (ee.includes(ae)) return N + 1;
        const Me = r.get(ae) ?? [];
        return Me.some((ye) => Ve(I, ye)) ? N + 2.5 : Me.some((ye) => Ve(se, ye)) ? N + 1.2 : Me.some((ye) => Ve(ee, ye)) ? N + 0.5 : N;
      }, 0);
      return Q > 0 ? [{ memory: x, score: Q, bm25Score: Q, semanticScore: 0 }] : [];
    }).sort((x, I) => I.score - x.score || I.memory.date.localeCompare(x.memory.date));
  const o = i.length, l = i.reduce((x, I) => x + I.len, 0) / o, u = 1.5, a = 0.75, d = /* @__PURE__ */ new Map();
  for (const x of n) {
    let I = 0;
    const se = r.get(x) ?? [];
    for (const ee of i)
      (ee.original.includes(x) || ee.image.includes(x) || ee.generated.includes(x) || se.some((Q) => Ve(ee.original, Q) || Ve(ee.image, Q))) && I++;
    d.set(x, I);
  }
  const m = En(n.join(" ")), O = i.map((x) => {
    let I = 0;
    const se = 1 - a + a * (x.len / l);
    for (const N of n) {
      const ae = d.get(N) ?? 0, Me = Math.log(1 + (o - ae + 0.5) / (ae + 0.5)), ye = x.original.includes(N) ? Math.max(1, Do(x.original, N)) : 0, ot = x.image.includes(N) ? 1 : 0, lt = x.generated.includes(N) ? 1 : 0;
      let Le = ye * 4 + ot * 1.8 + lt * 0.8;
      if (ye === 0) {
        const B = r.get(N) ?? [];
        let E = 0, X = 0, ne = 0;
        for (const T of B)
          Ve(x.original, T) ? E++ : Ve(x.image, T) ? X++ : Ve(x.generated, T) && ne++;
        Le += Math.min(2, E) * 2.4 + Math.min(1, X) * 1.1 + Math.min(1, ne) * 0.4;
      }
      Le > 0 && (I += Me * (Le * (u + 1) / (Le + u * se)));
    }
    const ee = x.original || x.image || x.generated, Q = No(m, En(ee));
    return { memory: x.memory, bm25Score: I, semanticScore: Q };
  }).filter((x) => x.bm25Score > 0 || x.semanticScore >= 0.22);
  if (!O.length) return [];
  const $ = 60, F = [...O].sort((x, I) => I.bm25Score - x.bm25Score || I.semanticScore - x.semanticScore), J = [...O].sort((x, I) => I.semanticScore - x.semanticScore || I.bm25Score - x.bm25Score), D = /* @__PURE__ */ new Map(), Z = /* @__PURE__ */ new Map();
  return F.forEach((x, I) => D.set(x.memory.id, I + 1)), J.forEach((x, I) => Z.set(x.memory.id, I + 1)), O.map((x) => {
    const I = D.get(x.memory.id) ?? O.length, se = Z.get(x.memory.id) ?? O.length, ee = x.bm25Score > 0 ? 0.68 / ($ + I) : 0, Q = x.semanticScore > 0.08 ? 0.32 / ($ + se) : 0, N = ee + Q + x.bm25Score * 5e-4 + Math.max(0, x.semanticScore) * 1e-3;
    return {
      memory: x.memory,
      score: N,
      bm25Score: x.bm25Score,
      semanticScore: x.semanticScore
    };
  }).sort((x, I) => I.score - x.score || I.memory.date.localeCompare(x.memory.date));
}
function Ir(e) {
  var i, o, l, u, a, d, m, w, O;
  const t = [], s = ($, F, J) => {
    if (typeof F == "string" && F.trim())
      for (let D = 0; D < F.length; D += 8e3) t.push({ field: F.length > 8e3 ? `${$}_part_${D / 8e3}` : $, text: F.slice(D, D + 8e3), origin: J });
  };
  s("user_note", e.note, "user"), s("user_supplement", e.extra, "user");
  for (const [$, F] of (e.chat ?? []).slice(0, 100).entries()) F.role === "me" && s(`user_turn_${$}`, F.text, "user");
  s("user_mood", (i = e.mood) == null ? void 0 : i.label, "user");
  const n = new Date(e.ts ?? ""), r = Number.isNaN(n.getTime()) ? "日期未知" : `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
  return r !== "日期未知" && s("record_date", r, "metadata"), s("image_scene", (o = e.facts) == null ? void 0 : o.scene, "image_model"), s("image_light", (l = e.facts) == null ? void 0 : l.light, "image_model"), s("image_subjects", (a = (u = e.facts) == null ? void 0 : u.subjects) == null ? void 0 : a.join("、"), "image_model"), s("image_text", (m = (d = e.facts) == null ? void 0 : d.text_spans) == null ? void 0 : m.join(`
`), "image_model"), { id: e.id, date: r, title: (e.note || ((O = (w = e.chat) == null ? void 0 : w.find(($) => $.role === "me")) == null ? void 0 : O.text) || "一条记录").slice(0, 80), sources: t, generated: String(e.final || e.draft || "").slice(0, 2e3) };
}
function jo(e, t, s = "hybrid") {
  const { exact: n, expanded: r } = Er(t.terms), i = e.filter(
    (a) => !(t.from && a.date < t.from) && !(t.to && a.date > t.to)
  ), o = Lo(i, t.terms, s), l = [...n, ...[...r.values()].flat()], u = (a) => {
    const d = a.sources.filter((F) => F.origin === "user").map((F) => F.text).join(`
`);
    if (d.length <= 500) return d;
    const m = d.toLowerCase();
    let w = -1;
    for (const F of l) {
      const J = m.indexOf(F);
      J !== -1 && (w === -1 || J < w) && (w = J);
    }
    if (w <= 200) return d.slice(0, 500);
    const O = Math.max(0, w - 160), $ = Math.min(d.length, O + 496);
    return `${O > 0 ? "…" : ""}${d.slice(O, $)}${$ < d.length ? "…" : ""}`;
  };
  return {
    matches: o.slice(0, Math.min(12, Math.max(1, t.limit))).map(({ memory: a }) => ({
      id: a.id,
      title: a.title,
      date: a.date,
      excerpt: u(a)
    })),
    total: o.length,
    searched: e.length
  };
}
const Ho = { list: async () => {
  var e, t;
  return await ((e = window.LuminaRecords) == null ? void 0 : e.ready), (((t = window.LuminaRecords) == null ? void 0 : t.list()) ?? []).map(Ir);
} };
function Vo() {
  const e = (/* @__PURE__ */ new Date()).getFullYear() - 1;
  return [
    { id: "synthetic-rain", ts: `${e}-09-18T18:00:00+08:00`, note: "傍晚在河边看晚霞。刚坐下就下雨了，我在桥下等雨停。" },
    { id: "synthetic-friend", ts: `${e}-09-25T18:00:00+08:00`, note: "今天和小林去了河边看晚霞。全程晴天，没有下雨。我们沿河走回家。" },
    { id: "synthetic-coffee", ts: `${e}-10-02T14:00:00+08:00`, note: "下午和小林在咖啡店聊天，没有去河边。" }
  ].map(Ir);
}
const Ko = {
  class: "er-workspace",
  "aria-label": "证据回忆工作台"
}, Bo = { class: "er-intro" }, Uo = ["disabled"], ko = {
  key: 0,
  class: "er-demo",
  role: "note"
}, Wo = { class: "er-search-row" }, qo = ["disabled"], Go = ["disabled"], Yo = {
  class: "er-stage",
  role: "status",
  "aria-live": "polite"
}, Jo = {
  key: 1,
  class: "er-error",
  role: "alert"
}, zo = {
  key: 2,
  class: "er-verdict"
}, Qo = {
  key: 3,
  class: "er-grid"
}, Xo = { class: "er-panel er-clues" }, Zo = ["aria-pressed", "onClick"], el = {
  key: 0,
  class: "er-corrections"
}, tl = { class: "er-panel er-candidates" }, sl = {
  key: 0,
  class: "er-hint"
}, nl = ["aria-pressed", "onClick"], rl = { class: "er-date" }, il = { class: "er-hint" }, ol = ["data-status"], ll = { class: "er-panel er-evidence" }, cl = { class: "er-date" }, ul = ["data-status"], fl = {
  key: 0,
  class: "er-hint"
}, al = { class: "er-original" }, dl = { key: 0 }, hl = { key: 0 }, pl = {
  key: 1,
  class: "er-hint"
}, gl = {
  key: 1,
  class: "er-hint"
}, ml = {
  key: 4,
  class: "er-refine"
}, _l = { class: "er-options" }, bl = ["disabled", "onClick"], vl = { class: "er-search-row" }, yl = ["disabled"], xl = ["disabled"], Sl = {
  key: 5,
  class: "er-trace"
}, wl = {
  key: 6,
  class: "er-hint"
}, Cl = /* @__PURE__ */ Si({
  __name: "Workspace",
  setup(e) {
    const t = be(""), s = be(""), n = be([]), r = be(""), i = be(!1), o = be("说说你记得的片段，线索记不准也没关系。"), l = be(""), u = be(!1), a = be(null), d = be([]), m = be(""), w = be(""), O = be([]), $ = be(null), F = /* @__PURE__ */ new Set();
    let J = 0;
    const D = jt(() => d.value.find((B) => B.id === m.value)), Z = jt(() => {
      var B;
      return (((B = a.value) == null ? void 0 : B.candidates) ?? []).map((E) => ({ ...E, memory: d.value.find((X) => X.id === E.memoryId) })).filter((E) => E.memory);
    }), x = { supported: "原文支持", conflict: "明确冲突", unknown: "没有足够证据" }, I = (B) => ({ user_note: "用户原话", user_supplement: "用户补充", user_mood: "自选心情", record_date: "记录日期", image_scene: "图像分析·场景", image_light: "图像分析·光线", image_subjects: "图像分析·主体", image_text: "图像分析·文字" })[B] ?? (B.startsWith("user_turn_") ? "用户对话原话" : B), se = jt(() => a.value ? a.value.status === "matched" ? "一条记录与当前线索吻合" : a.value.status === "uncertain" ? "有相关记录，暂时无法确认是哪一次" : "现有记录无法确认这段经历" : ""), ee = jt(() => {
      var B;
      return (((B = a.value) == null ? void 0 : B.comparisons) ?? []).filter((E) => E.memoryId === m.value && (!w.value || E.clueId === w.value));
    });
    async function Q(B, E, X) {
      var le;
      const ne = new AbortController(), T = () => ne.abort();
      X.addEventListener("abort", T, { once: !0 }), X.aborted && ne.abort();
      const q = window.setTimeout(() => ne.abort(), 1e5);
      try {
        const re = await fetch(`/api/recall/${B}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(E), signal: ne.signal }), qe = await re.json();
        if (!re.ok) throw new Error(((le = qe.error) == null ? void 0 : le.message) || `请求失败（${re.status}）`);
        return qe;
      } finally {
        clearTimeout(q), X.removeEventListener("abort", T);
      }
    }
    function N() {
      var B;
      J++, (B = $.value) == null || B.abort(), $.value = null, i.value = !1, o.value = "已停止。可以调整线索后重新查找。";
    }
    function ae(B, E) {
      var X;
      return (X = a.value) == null ? void 0 : X.comparisons.find((ne) => ne.memoryId === B && ne.clueId === E);
    }
    function Me(B) {
      m.value = B;
    }
    function ye(B) {
      w.value = w.value === B ? "" : B;
    }
    async function ot(B = !1) {
      var qe;
      if (i.value) return;
      const E = t.value.trim();
      if (!E) {
        l.value = "先写一句你记得的片段。";
        return;
      }
      B || (n.value = []), i.value = !0;
      const X = ++J;
      let ne;
      try {
        ne = u.value ? Vo() : await Ho.list();
      } catch {
        i.value = !1, l.value = "本地数据库未能读取，记录没有改动。请重试。";
        return;
      }
      if (X !== J) return;
      if (!ne.length) {
        i.value = !1, l.value = "这台设备还没有记录。先记一条，或试用合成案例。";
        return;
      }
      d.value = ne, i.value = !0, l.value = "", a.value = null, O.value = [], m.value = "", w.value = "", F.clear(), r.value = E;
      const T = new AbortController();
      $.value = T;
      const q = /* @__PURE__ */ new Date(), le = `${q.getFullYear()}-${String(q.getMonth() + 1).padStart(2, "0")}-${String(q.getDate()).padStart(2, "0")}`, re = performance.now();
      try {
        o.value = "正在理解线索，决定检索条件…";
        let he = await Q("start", { query: E, corrections: n.value, today: le }, T.signal);
        for (let Ge = 0; he.phase === "tools"; Ge++) {
          if (Ge >= 4) throw new Error("已到检索轮数上限，请减少或调整线索后重试。");
          const Oe = (he.calls ?? []).map((ue) => {
            let Ee, ct;
            if (ue.name === "search_memories") {
              const pe = ue.args;
              o.value = "正在本机查找相关记录…";
              const et = jo(d.value, pe);
              Ee = et, ct = `检索 ${et.searched} 条，命中 ${et.total} 条，返回 ${et.matches.length} 条`;
            } else if (ue.name === "get_memory") {
              o.value = "正在读取候选原文…";
              const pe = d.value.find((et) => et.id === ue.args.id) ?? null;
              pe && F.add(pe.id), Ee = { memory: pe ? { ...pe, generated: "" } : null }, ct = pe ? `已读取 ${pe.date} 的记录及 ${pe.sources.length} 个来源字段` : "原始记录不存在";
            } else throw new Error("模型请求了不支持的工具。");
            return O.value.push({ name: ue.name, args: JSON.stringify(ue.args), result: ct, time: Math.round(performance.now() - re) }), { callId: ue.id, result: Ee };
          });
          o.value = "正在对照原文，并检查引用和语义…", he = await Q("continue", { sessionId: he.sessionId, results: Oe }, T.signal);
        }
        if (X !== J) return;
        if (!he.result) throw new Error("没有收到完整的证据结果，请重试。");
        for (const Ge of he.result.comparisons) {
          const Oe = d.value.find((ue) => ue.id === Ge.memoryId);
          if (!F.has(Ge.memoryId) || !Oe || Ge.sources.some((ue) => !Oe.sources.some((Ee) => Ee.field === ue.field && Ee.origin !== "image_model" && Ee.text.includes(ue.quote))))
            throw new Error("证据与本地原文不一致，本次结果未展示。请重新查找。");
        }
        a.value = he.result, m.value = ((qe = he.result.candidates[0]) == null ? void 0 : qe.memoryId) ?? "", o.value = `已完成 ${O.value.length} 次本地工具执行；${((performance.now() - re) / 1e3).toFixed(1)} 秒。`;
      } catch (he) {
        if (X !== J) return;
        l.value = T.signal.aborted ? "已停止检索。" : he instanceof DOMException && he.name === "AbortError" ? "请求超时，请稍后重试。" : he instanceof Error ? he.message : "检索失败，请稍后重试。", o.value = "这次没有生成结论，也没有修改日记。";
      } finally {
        X === J && (i.value = !1, $.value = null);
      }
    }
    function lt(B) {
      if (n.value.length >= 8) {
        l.value = "已达到本轮澄清上限，请开启一次新查询。";
        return;
      }
      n.value.push(B), s.value = "", ot(!0);
    }
    function Le() {
      N(), u.value = !u.value, a.value = null, O.value = [], n.value = [], d.value = [], m.value = "", l.value = "", t.value = u.value ? "我记得去年有次和小林在河边看晚霞，好像还下雨了。" : "", o.value = u.value ? "当前使用三条合成日记；点击查找后将真实执行模型和本地工具。" : "已切回这台设备的记录。";
    }
    return (B, E) => {
      var X, ne;
      return L(), j("section", Ko, [
        M("div", Bo, [
          E[4] || (E[4] = M("div", null, [
            M("p", { class: "er-eyebrow" }, "聊着找"),
            M("h2", null, "把记得的片段，放回原文里核对。"),
            M("p", null, "线索可以不完整，也可以改。没写下来的事，先留作未知。")
          ], -1)),
          M("button", {
            class: "er-link",
            type: "button",
            disabled: i.value,
            onClick: Le
          }, K(u.value ? "返回我的记录" : "试用合成案例"), 9, Uo)
        ]),
        u.value ? (L(), j("p", ko, "合成案例 · 仅在此工作台临时使用，不会写入、覆盖或同步你的日记。模型输出不预设。")) : ve("", !0),
        M("form", {
          class: "er-search",
          onSubmit: E[1] || (E[1] = Cn((T) => ot(!1), ["prevent"]))
        }, [
          E[5] || (E[5] = M("label", { for: "er-query" }, "你记得什么？", -1)),
          M("div", Wo, [
            Zs(M("textarea", {
              id: "er-query",
              "onUpdate:modelValue": E[0] || (E[0] = (T) => t.value = T),
              disabled: i.value,
              maxlength: "1000",
              rows: "2",
              placeholder: "记得和谁、在哪儿，或者那时的心情…"
            }, null, 8, qo), [
              [wn, t.value]
            ]),
            M("button", {
              class: "er-primary",
              type: "submit",
              disabled: i.value
            }, K(i.value ? "正在核对…" : "查找并核对"), 9, Go),
            i.value ? (L(), j("button", {
              key: 0,
              class: "er-link",
              type: "button",
              onClick: N
            }, "停止")) : ve("", !0)
          ]),
          E[6] || (E[6] = M("small", null, "检索在本机执行；匹配摘要和选中候选的文字会发送给 AI 服务核对，照片不会随本次查询上传。这里的纠正只改变线索。", -1))
        ], 32),
        M("p", Yo, K(o.value), 1),
        l.value ? (L(), j("p", Jo, K(l.value), 1)) : ve("", !0),
        a.value ? (L(), j("div", zo, [
          M("h3", null, K(se.value), 1),
          M("p", null, "这是记录与线索的吻合情况，不能证明当时实际发生了什么。" + K(a.value.rejected ? `有 ${a.value.rejected} 项判断未通过核验，已按未知处理。` : ""), 1)
        ])) : ve("", !0),
        a.value ? (L(), j("div", Qo, [
          M("aside", Xo, [
            E[8] || (E[8] = M("h3", null, "你的线索", -1)),
            E[9] || (E[9] = M("p", { class: "er-hint" }, "点选一条，查看候选与原文如何对应。", -1)),
            (L(!0), j(oe, null, He(a.value.clues, (T) => (L(), j("button", {
              key: T.id,
              class: Ot(["er-clue", { active: w.value === T.id }]),
              "aria-pressed": w.value === T.id,
              onClick: (q) => ye(T.id)
            }, K(T.text), 11, Zo))), 128)),
            n.value.length ? (L(), j("div", el, [
              E[7] || (E[7] = M("h4", null, "本轮纠正", -1)),
              (L(!0), j(oe, null, He(n.value, (T, q) => (L(), j("p", { key: q }, K(T), 1))), 128))
            ])) : ve("", !0)
          ]),
          M("section", tl, [
            M("h3", null, [
              E[10] || (E[10] = Kt("候选记忆 ", -1)),
              M("span", null, K(Z.value.length), 1)
            ]),
            Z.value.length ? ve("", !0) : (L(), j("p", sl, "没有读到可用候选。可以删除不确定的日期或换一个场景词。")),
            (L(!0), j(oe, null, He(Z.value, (T) => (L(), j("button", {
              key: T.memoryId,
              class: Ot(["er-memory", { active: m.value === T.memoryId }]),
              "aria-pressed": m.value === T.memoryId,
              onClick: (q) => Me(T.memoryId)
            }, [
              M("span", rl, K(T.memory.date), 1),
              M("strong", null, K(T.memory.title), 1),
              M("span", il, K(T.supported) + " 条线索有支持 · " + K(T.conflicts) + " 条明确冲突", 1),
              (L(!0), j(oe, null, He(a.value.clues.filter((q) => !w.value || q.id === w.value), (q) => {
                var le, re;
                return L(), j("span", {
                  key: q.id,
                  class: "er-matrix"
                }, [
                  M("span", null, K(q.text), 1),
                  M("span", {
                    class: "er-tag",
                    "data-status": ((le = ae(T.memoryId, q.id)) == null ? void 0 : le.status) ?? "unknown"
                  }, K(x[((re = ae(T.memoryId, q.id)) == null ? void 0 : re.status) ?? "unknown"]), 9, ol)
                ]);
              }), 128))
            ], 10, nl))), 128))
          ]),
          M("section", ll, [
            E[13] || (E[13] = M("h3", null, "原始证据", -1)),
            D.value ? (L(), j(oe, { key: 0 }, [
              M("p", cl, K(D.value.date) + " · " + K(D.value.id), 1),
              (L(!0), j(oe, null, He(ee.value, (T) => {
                var q;
                return L(), j("article", {
                  key: T.clueId,
                  class: "er-proof"
                }, [
                  M("h4", null, K((q = a.value.clues.find((le) => le.id === T.clueId)) == null ? void 0 : q.text), 1),
                  M("span", {
                    class: "er-tag",
                    "data-status": T.status
                  }, K(x[T.status]), 9, ul),
                  T.status === "unknown" ? (L(), j("p", fl, "没有找到足够的原文依据。未提及，不代表没有发生。")) : ve("", !0),
                  (L(!0), j(oe, null, He(T.sources, (le, re) => (L(), j("blockquote", { key: re }, [
                    M("span", null, K(le.quote), 1),
                    M("cite", null, K(I(le.field)) + " · 已核对逐字引用", 1)
                  ]))), 128))
                ]);
              }), 128)),
              M("details", al, [
                E[12] || (E[12] = M("summary", null, "查看这条记录的完整来源", -1)),
                (L(!0), j(oe, null, He(D.value.sources, (T) => (L(), j("div", {
                  key: T.field
                }, [
                  M("h4", null, [
                    Kt(K(I(T.field)) + " ", 1),
                    T.origin === "image_model" ? (L(), j("small", dl, "未核对的 AI 观察")) : ve("", !0)
                  ]),
                  M("p", null, K(T.text), 1)
                ]))), 128)),
                D.value.generated ? (L(), j("div", hl, [
                  E[11] || (E[11] = M("h4", null, [
                    Kt("AI 整理 / 保存正文 "),
                    M("small", null, "不作为用户原话证据")
                  ], -1)),
                  M("p", null, K(D.value.generated), 1)
                ])) : ve("", !0),
                D.value.sources.some((T) => T.origin === "user") ? ve("", !0) : (L(), j("p", pl, "此记录缺少可用的用户原话，不能仅凭 AI 整理内容确认细节。"))
              ])
            ], 64)) : (L(), j("p", gl, "选一条候选记录查看证据。"))
          ])
        ])) : ve("", !0),
        a.value ? (L(), j("section", ml, [
          M("h3", null, K(((X = a.value.clarification) == null ? void 0 : X.question) || "有什么线索需要调整？"), 1),
          M("div", _l, [
            (L(!0), j(oe, null, He(((ne = a.value.clarification) == null ? void 0 : ne.options) ?? [], (T, q) => (L(), j("button", {
              key: q,
              class: "er-option",
              disabled: i.value,
              onClick: (le) => lt(T.text)
            }, K(T.label), 9, bl))), 128))
          ]),
          M("form", {
            onSubmit: E[3] || (E[3] = Cn((T) => s.value.trim() && lt(s.value.trim()), ["prevent"]))
          }, [
            E[14] || (E[14] = M("label", { for: "er-correction" }, "补充或纠正线索", -1)),
            M("div", vl, [
              Zs(M("input", {
                id: "er-correction",
                "onUpdate:modelValue": E[2] || (E[2] = (T) => s.value = T),
                disabled: i.value,
                maxlength: "500",
                placeholder: "例如：更确定是小林，下雨这条先不算"
              }, null, 8, yl), [
                [wn, s.value]
              ]),
              M("button", {
                class: "er-primary",
                disabled: i.value || !s.value.trim()
              }, "调整后重新查找", 8, xl)
            ])
          ], 32),
          E[15] || (E[15] = M("p", { class: "er-hint" }, "每次调整都会重新执行检索；原始日记不会改变。", -1))
        ])) : ve("", !0),
        O.value.length ? (L(), j("details", Sl, [
          M("summary", null, "为什么这样判断 · 查看真实工具执行（" + K(O.value.length) + " 次）", 1),
          M("ol", null, [
            (L(!0), j(oe, null, He(O.value, (T, q) => (L(), j("li", { key: q }, [
              M("strong", null, K(T.name), 1),
              M("span", null, K(T.result) + " · " + K(T.time) + "ms", 1),
              M("code", null, K(T.args), 1)
            ]))), 128))
          ]),
          E[16] || (E[16] = M("p", null, "轨迹来自本次模型请求及浏览器实际执行，不是预设步骤。逐字引用校验与语义核验在结论展示前执行。", -1))
        ])) : ve("", !0),
        r.value && !a.value && !i.value && !l.value ? (L(), j("p", wl, "上次线索：" + K(r.value), 1)) : ve("", !0)
      ]);
    };
  }
}), In = document.getElementById("evidenceWorkspace");
In && (Po(Cl).mount(In), window.LuminaEvidence = { version: "0.1.0" });
