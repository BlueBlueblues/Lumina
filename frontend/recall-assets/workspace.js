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
}, xr = Object.prototype.hasOwnProperty, U = (e, t) => xr.call(e, t), L = Array.isArray, ot = (e) => Gt(e) === "[object Map]", Tn = (e) => Gt(e) === "[object Set]", q = (e) => typeof e == "function", se = (e) => typeof e == "string", We = (e) => typeof e == "symbol", z = (e) => e !== null && typeof e == "object", Cn = (e) => (z(e) || q(e)) && q(e.then) && q(e.catch), En = Object.prototype.toString, Gt = (e) => En.call(e), wr = (e) => Gt(e).slice(8, -1), Mn = (e) => Gt(e) === "[object Object]", Ms = (e) => se(e) && e !== "NaN" && e[0] !== "-" && "" + parseInt(e, 10) === e, mt = /* @__PURE__ */ Ts(
  // the leading comma is intentional so empty string "" is also included
  ",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"
), zt = (e) => {
  const t = /* @__PURE__ */ Object.create(null);
  return (s) => t[s] || (t[s] = e(s));
}, Sr = /-\w/g, Ue = zt(
  (e) => e.replace(Sr, (t) => t.slice(1).toUpperCase())
), Tr = /\B([A-Z])/g, Xe = zt(
  (e) => e.replace(Tr, "-$1").toLowerCase()
), In = zt((e) => e.charAt(0).toUpperCase() + e.slice(1)), ns = zt(
  (e) => e ? `on${In(e)}` : ""
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
}, Is = (e) => {
  const t = parseFloat(e);
  return isNaN(t) ? e : t;
};
let Ws;
const Qt = () => Ws || (Ws = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : {});
function As(e) {
  if (L(e)) {
    const t = {};
    for (let s = 0; s < e.length; s++) {
      const n = e[s], r = se(n) ? Ir(n) : As(n);
      if (r)
        for (const i in r)
          t[i] = r[i];
    }
    return t;
  } else if (se(e) || z(e))
    return e;
}
const Cr = /;(?![^(]*\))/g, Er = /:([^]+)/, Mr = /\/\*[^]*?\*\//g;
function Ir(e) {
  const t = {};
  return e.replace(Mr, "").split(Cr).forEach((s) => {
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
} : We(t) ? rs(t) : z(t) && !L(t) && !Mn(t) ? String(t) : t, rs = (e, t = "") => {
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
  const l = (u) => {
    u && u.trigger();
  };
  if (Os(), t === "clear")
    o.forEach(l);
  else {
    const u = L(e), a = u && Ms(s);
    if (u && s === "length") {
      const d = Number(n);
      o.forEach((p, b) => {
        (b === "length" || b === Ct || !We(b) && b >= d) && l(p);
      });
    } else
      switch ((s !== void 0 || o.has(void 0)) && l(o.get(s)), a && l(o.get(Ct)), t) {
        case "add":
          u ? a && l(o.get("length")) : (l(o.get(ze)), ot(e) && l(o.get(_s)));
          break;
        case "delete":
          u || (l(o.get(ze)), ot(e) && l(o.get(_s)));
          break;
        case "set":
          ot(e) && l(o.get(ze));
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
  const o = Xt(e), l = o !== e && !Ne(e), u = o[t];
  if (u !== Nr[t]) {
    const p = u.apply(e, i);
    return l ? re(p) : p;
  }
  let a = s;
  o !== e && (l ? a = function(p, b) {
    return s.call(this, re(p), b, e);
  } : s.length > 2 && (a = function(p, b) {
    return s.call(this, p, b, e);
  }));
  const d = u.call(o, a, n);
  return l && r ? r(d) : d;
}
function Ys(e, t, s, n) {
  const r = Xt(e);
  let i = s;
  return r !== e && (Ne(e) ? s.length > 3 && (i = function(o, l, u) {
    return s.call(this, o, l, u, e);
  }) : i = function(o, l, u) {
    return s.call(this, o, re(l), u, e);
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
      let u;
      if (o && (u = Dr[s]))
        return u;
      if (s === "hasOwnProperty")
        return jr;
    }
    const l = Reflect.get(
      t,
      s,
      // if this is a proxy wrapping a ref, return methods using the raw ref
      // as receiver so that we don't have to call `toRaw` on the ref in all
      // its class methods
      ve(t) ? t : n
    );
    if ((We(s) ? Vn.has(s) : Lr(s)) || (r || oe(t, "get", s), i))
      return l;
    if (ve(l)) {
      const u = o && Ms(s) ? l : l.value;
      return r && z(u) ? bs(u) : u;
    }
    return z(l) ? r ? bs(l) : qn(l) : l;
  }
}
class Un extends Kn {
  constructor(t = !1) {
    super(!1, t);
  }
  set(t, s, n, r) {
    let i = t[s];
    if (!this._isShallow) {
      const u = Be(i);
      if (!Ne(n) && !Be(n) && (i = V(i), n = V(n)), !L(t) && ve(i) && !ve(n))
        return u || (i.value = n), !0;
    }
    const o = L(t) && Ms(s) ? Number(s) < t.length : U(t, s), l = Reflect.set(
      t,
      s,
      n,
      ve(t) ? t : r
    );
    return t === V(r) && (o ? lt(n, i) && $e(t, "set", s, n) : $e(t, "add", s, n)), l;
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
    const r = this.__v_raw, i = V(r), o = ot(i), l = e === "entries" || e === Symbol.iterator && o, u = e === "keys" && o, a = r[e](...n), d = s ? vs : t ? Ut : re;
    return !t && oe(
      i,
      "iterate",
      u ? _s : ze
    ), {
      // iterator protocol
      next() {
        const { value: p, done: b } = a.next();
        return b ? { value: p, done: b } : {
          value: l ? [d(p[0]), d(p[1])] : d(p),
          done: b
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
      const i = this.__v_raw, o = V(i), l = V(r);
      e || (lt(r, l) && oe(o, "get", r), oe(o, "get", l));
      const { has: u } = Dt(o), a = t ? vs : e ? Ut : re;
      if (u.call(o, r))
        return a(i.get(r));
      if (u.call(o, l))
        return a(i.get(l));
      i !== o && i.get(r);
    },
    get size() {
      const r = this.__v_raw;
      return !e && oe(V(r), "iterate", ze), r.size;
    },
    has(r) {
      const i = this.__v_raw, o = V(i), l = V(r);
      return e || (lt(r, l) && oe(o, "has", r), oe(o, "has", l)), r === l ? i.has(r) : i.has(r) || i.has(l);
    },
    forEach(r, i) {
      const o = this, l = o.__v_raw, u = V(l), a = t ? vs : e ? Ut : re;
      return !e && oe(u, "iterate", ze), l.forEach((d, p) => r.call(i, a(d), a(p), o));
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
        const o = V(this), { has: l, get: u } = Dt(o);
        let a = l.call(o, r);
        a || (r = V(r), a = l.call(o, r));
        const d = u.call(o, r);
        return o.set(r, i), a ? lt(i, d) && $e(o, "set", r, i) : $e(o, "add", r, i), this;
      },
      delete(r) {
        const i = V(this), { has: o, get: l } = Dt(i);
        let u = o.call(i, r);
        u || (r = V(r), u = o.call(i, r)), l && l.call(i, r);
        const a = i.delete(r);
        return u && $e(i, "delete", r, void 0), a;
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
  const l = new Proxy(
    e,
    i === 2 ? n : s
  );
  return r.set(e, l), l;
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
  else if (Mn(e)) {
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
function It(e, t, s, n) {
  try {
    return n ? e(...n) : e();
  } catch (r) {
    Zt(r, t, s);
  }
}
function Qe(e, t, s, n) {
  if (q(e)) {
    const r = It(e, t, s, n);
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
    let l = t.parent;
    const u = t.proxy, a = `https://vuejs.org/error-reference/#runtime-${s}`;
    for (; l; ) {
      const d = l.ec;
      if (d) {
        for (let p = 0; p < d.length; p++)
          if (d[p](e, u, a) === !1)
            return;
      }
      l = l.parent;
    }
    if (i) {
      ut(), It(i, null, 10, [
        e,
        u,
        a
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
let Ie = -1;
const ct = [];
let Ve = null, nt = 0;
const Jn = /* @__PURE__ */ Promise.resolve();
let Bt = null;
function oi(e) {
  const t = Bt || Jn;
  return e ? t.then(this ? e.bind(this) : e) : t;
}
function li(e) {
  let t = Ie + 1, s = fe.length;
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
function Js(e, t, s = Ie + 1) {
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
    for (Ie = 0; Ie < fe.length; Ie++) {
      const t = fe[Ie];
      t && !(t.flags & 8) && (t.flags & 4 && (t.flags &= -2), It(
        t,
        t.i,
        t.i ? 15 : 14
      ), t.flags & 4 || (t.flags &= -2));
    }
  } finally {
    for (; Ie < fe.length; Ie++) {
      const t = fe[Ie];
      t && (t.flags &= -2);
    }
    Ie = -1, fe.length = 0, Qn(), Bt = null, (fe.length || ct.length) && Xn();
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
    let [i, o, l, u = Y] = t[r];
    i && (q(i) && (i = {
      mounted: i,
      updated: i
    }), i.deep && st(o), n.push({
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
function Je(e, t, s, n) {
  const r = e.dirs, i = t && t.dirs;
  for (let o = 0; o < r.length; o++) {
    const l = r[o];
    i && (l.oldValue = i[o].value);
    let u = l.dir[n];
    u && (ut(), Qe(u, s, 8, [
      e.el,
      l,
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
      (R, P) => bt(
        R,
        t && (L(t) ? t[P] : t),
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
  const i = n.shapeFlag & 4 ? ss(n.component) : n.el, o = r ? null : i, { i: l, r: u } = e, a = t && t.r, d = l.refs === Y ? l.refs = {} : l.refs, p = l.setupState, b = V(p), I = p === Y ? Sn : (R) => U(b, R);
  if (a != null && a !== u) {
    if (zs(t), se(a))
      d[a] = null, I(a) && (p[a] = null);
    else if (ve(a)) {
      a.value = null;
      const R = t;
      R.k && (d[R.k] = null);
    }
  }
  if (q(u))
    It(u, l, 12, [o, d]);
  else {
    const R = se(u), P = ve(u);
    if (R || P) {
      const Q = () => {
        if (e.f) {
          const F = R ? I(u) ? p[u] : d[u] : u.value;
          if (r)
            L(F) && yr(F, i);
          else if (L(F))
            F.includes(i) || F.push(i);
          else if (R)
            d[u] = [i], I(u) && (p[u] = d[u]);
          else {
            const X = [i];
            u.value = X, e.k && (d[e.k] = X);
          }
        } else R ? (d[u] = o, I(u) && (p[u] = o)) : P && (u.value = o, e.k && (d[e.k] = o));
      };
      if (o) {
        const F = () => {
          Q(), Wt.delete(e);
        };
        F.id = -1, Wt.set(e, F), be(F, s);
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
    const l = o && Ns(e);
    let u = !1, a = !1;
    l && (u = !Ne(e), a = Be(e), e = Xt(e)), r = new Array(e.length);
    for (let d = 0, p = e.length; d < p; d++)
      r[d] = t(
        u ? a ? Ut(re(e[d])) : re(e[d]) : e[d],
        d,
        void 0,
        i
      );
  } else if (typeof e == "number") {
    r = new Array(e);
    for (let l = 0; l < e; l++)
      r[l] = t(l + 1, l, void 0, i);
  } else if (z(e))
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
    const { ctx: s, setupState: n, data: r, props: i, accessCache: o, type: l, appContext: u } = e;
    let a;
    if (t[0] !== "$") {
      const I = o[t];
      if (I !== void 0)
        switch (I) {
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
          (a = e.propsOptions[0]) && U(a, t)
        )
          return o[t] = 3, i[t];
        if (s !== Y && U(s, t))
          return o[t] = 4, s[t];
        o[t] = 0;
      }
    }
    const d = xt[t];
    let p, b;
    if (d)
      return t === "$attrs" && oe(e.attrs, "get", ""), d(e);
    if (
      // css module (injected by vue-loader)
      (p = l.__cssModules) && (p = p[t])
    )
      return p;
    if (s !== Y && U(s, t))
      return o[t] = 4, s[t];
    if (
      // global properties
      b = u.config.globalProperties, U(b, t)
    )
      return b[t];
  },
  set({ _: e }, t, s) {
    const { data: n, setupState: r, ctx: i } = e;
    return cs(r, t) ? (r[t] = s, !0) : U(e.props, t) || t[0] === "$" && t.slice(1) in e ? !1 : (i[t] = s, !0);
  },
  has({
    _: { data: e, setupState: t, accessCache: s, ctx: n, appContext: r, propsOptions: i, type: o }
  }, l) {
    let u, a;
    return !!(s[l] || cs(t, l) || (u = i[0]) && U(u, l) || U(n, l) || U(xt, l) || U(r.config.globalProperties, l) || (a = o.__cssModules) && a[l]);
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
    const i = er(), o = /* @__PURE__ */ new WeakSet(), l = [];
    let u = !1;
    const a = i.app = {
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
      set config(d) {
      },
      use(d, ...p) {
        return o.has(d) || (d && q(d.install) ? (o.add(d), d.install(a, ...p)) : q(d) && (o.add(d), d(a, ...p))), a;
      },
      mixin(d) {
        return a;
      },
      component(d, p) {
        return p ? (i.components[d] = p, a) : i.components[d];
      },
      directive(d, p) {
        return p ? (i.directives[d] = p, a) : i.directives[d];
      },
      mount(d, p, b) {
        if (!u) {
          const I = a._ceVNode || De(n, r);
          return I.appContext = i, b === !0 ? b = "svg" : b === !1 && (b = void 0), e(I, d, b), u = !0, a._container = d, d.__vue_app__ = a, ss(I.component);
        }
      },
      onUnmount(d) {
        l.push(d);
      },
      unmount() {
        u && (Qe(
          l,
          a._instance,
          16
        ), e(null, a._container), delete a._container.__vue_app__);
      },
      provide(d, p) {
        return i.provides[d] = p, a;
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
  } = e, l = V(r), [u] = e.propsOptions;
  let a = !1;
  if (
    // always force full diff in dev
    // - #1942 if hmr is enabled with sfc component
    // - vite#872 non-sfc component used by sfc component
    (n || o > 0) && !(o & 16)
  ) {
    if (o & 8) {
      const d = e.vnode.dynamicProps;
      for (let p = 0; p < d.length; p++) {
        let b = d[p];
        if (es(e.emitsOptions, b))
          continue;
        const I = t[b];
        if (u)
          if (U(i, b))
            I !== i[b] && (i[b] = I, a = !0);
          else {
            const R = Ue(b);
            r[R] = xs(
              u,
              l,
              R,
              I,
              e,
              !1
            );
          }
        else
          I !== i[b] && (i[b] = I, a = !0);
      }
    }
  } else {
    rr(e, t, r, i) && (a = !0);
    let d;
    for (const p in l)
      (!t || // for camelCase
      !U(t, p) && // it's possible the original props was passed in as kebab-case
      // and converted to camelCase (#955)
      ((d = Xe(p)) === p || !U(t, d))) && (u ? s && // for camelCase
      (s[p] !== void 0 || // for kebab-case
      s[d] !== void 0) && (r[p] = xs(
        u,
        l,
        p,
        void 0,
        e,
        !0
      )) : delete r[p]);
    if (i !== l)
      for (const p in i)
        (!t || !U(t, p)) && (delete i[p], a = !0);
  }
  a && $e(e.attrs, "set", "");
}
function rr(e, t, s, n) {
  const [r, i] = e.propsOptions;
  let o = !1, l;
  if (t)
    for (let u in t) {
      if (mt(u))
        continue;
      const a = t[u];
      let d;
      r && U(r, d = Ue(u)) ? !i || !i.includes(d) ? s[d] = a : (l || (l = {}))[d] = a : es(e.emitsOptions, u) || (!(u in n) || a !== n[u]) && (n[u] = a, o = !0);
    }
  if (i) {
    const u = V(s), a = l || Y;
    for (let d = 0; d < i.length; d++) {
      const p = i[d];
      s[p] = xs(
        r,
        u,
        p,
        a[p],
        e,
        !U(a, p)
      );
    }
  }
  return o;
}
function xs(e, t, s, n, r, i) {
  const o = e[s];
  if (o != null) {
    const l = U(o, "default");
    if (l && n === void 0) {
      const u = o.default;
      if (o.type !== Function && !o.skipFactory && q(u)) {
        const { propsDefaults: a } = r;
        if (s in a)
          n = a[s];
        else {
          const d = pr(r);
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
    ] && (n === "" || n === Xe(s)) && (n = !0));
  }
  return n;
}
function wi(e, t, s = !1) {
  const n = t.propsCache, r = n.get(e);
  if (r)
    return r;
  const i = e.props, o = {}, l = [];
  if (!i)
    return z(e) && n.set(e, it), it;
  if (L(i))
    for (let a = 0; a < i.length; a++) {
      const d = Ue(i[a]);
      Qs(d) && (o[d] = Y);
    }
  else if (i)
    for (const a in i) {
      const d = Ue(a);
      if (Qs(d)) {
        const p = i[a], b = o[d] = L(p) || q(p) ? { type: p } : Le({}, p), I = b.type;
        let R = !1, P = !0;
        if (L(I))
          for (let Q = 0; Q < I.length; ++Q) {
            const F = I[Q], X = q(F) && F.name;
            if (X === "Boolean") {
              R = !0;
              break;
            } else X === "String" && (P = !1);
          }
        else
          R = q(I) && I.name === "Boolean";
        b[
          0
          /* shouldCast */
        ] = R, b[
          1
          /* shouldCastTrue */
        ] = P, (R || U(b, "default")) && l.push(d);
      }
    }
  const u = [o, l];
  return z(e) && n.set(e, u), u;
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
    const l = t._;
    l ? s && l === 1 ? i = !1 : lr(r, t, s) : (i = !t.$stable, ir(t, r)), o = t;
  } else t && (or(e, t), o = { default: 1 });
  if (i)
    for (const l in r)
      !Hs(l) && o[l] == null && delete r[l];
}, be = Li;
function Ei(e) {
  return Mi(e);
}
function Mi(e, t) {
  const s = Qt();
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
    parentNode: p,
    nextSibling: b,
    setScopeId: I = Cs,
    insertStaticContent: R
  } = e, P = (c, f, h, v = null, g = null, m = null, w = void 0, x = null, y = !!f.dynamicChildren) => {
    if (c === f)
      return;
    c && !gt(c, f) && (v = ne(c), G(c, g, m, !0), c = null), f.patchFlag === -2 && (y = !1, f.dynamicChildren = null);
    const { type: _, ref: A, shapeFlag: S } = f;
    switch (_) {
      case ts:
        Q(c, f, h, v);
        break;
      case ke:
        F(c, f, h, v);
        break;
      case fs:
        c == null && X(f, h, v, w);
        break;
      case Z:
        Pt(
          c,
          f,
          h,
          v,
          g,
          m,
          w,
          x,
          y
        );
        break;
      default:
        S & 1 ? qe(
          c,
          f,
          h,
          v,
          g,
          m,
          w,
          x,
          y
        ) : S & 6 ? Ft(
          c,
          f,
          h,
          v,
          g,
          m,
          w,
          x,
          y
        ) : (S & 64 || S & 128) && _.process(
          c,
          f,
          h,
          v,
          g,
          m,
          w,
          x,
          y,
          ue
        );
    }
    A != null && g ? bt(A, c && c.ref, m, f || c, !f) : A == null && c && c.ref != null && bt(c.ref, null, m, c, !0);
  }, Q = (c, f, h, v) => {
    if (c == null)
      n(
        f.el = l(f.children),
        h,
        v
      );
    else {
      const g = f.el = c.el;
      f.children !== c.children && a(g, f.children);
    }
  }, F = (c, f, h, v) => {
    c == null ? n(
      f.el = u(f.children || ""),
      h,
      v
    ) : f.el = c.el;
  }, X = (c, f, h, v) => {
    [c.el, c.anchor] = R(
      c.children,
      f,
      h,
      v,
      c.el,
      c.anchor
    );
  }, le = ({ el: c, anchor: f }, h, v) => {
    let g;
    for (; c && c !== f; )
      g = b(c), n(c, h, v), c = g;
    n(f, h, v);
  }, ie = ({ el: c, anchor: f }) => {
    let h;
    for (; c && c !== f; )
      h = b(c), r(c), c = h;
    r(f);
  }, qe = (c, f, h, v, g, m, w, x, y) => {
    if (f.type === "svg" ? w = "svg" : f.type === "math" && (w = "mathml"), c == null)
      At(
        f,
        h,
        v,
        g,
        m,
        w,
        x,
        y
      );
    else {
      const _ = c.el && c.el._isVueCE ? c.el : null;
      try {
        _ && _._beginPatch(), Ot(
          c,
          f,
          g,
          m,
          w,
          x,
          y
        );
      } finally {
        _ && _._endPatch();
      }
    }
  }, At = (c, f, h, v, g, m, w, x) => {
    let y, _;
    const { props: A, shapeFlag: S, transition: M, dirs: O } = c;
    if (y = c.el = o(
      c.type,
      m,
      A && A.is,
      A
    ), S & 8 ? d(y, c.children) : S & 16 && Oe(
      c.children,
      y,
      null,
      v,
      g,
      us(c, m),
      w,
      x
    ), O && Je(c, null, v, "created"), Ze(y, c, c.scopeId, w, v), A) {
      for (const k in A)
        k !== "value" && !mt(k) && i(y, k, null, A[k], m, v);
      "value" in A && i(y, "value", null, A.value, m), (_ = A.onVnodeBeforeMount) && Me(_, v, c);
    }
    O && Je(c, null, v, "beforeMount");
    const N = Ii(g, M);
    N && M.beforeEnter(y), n(y, f, h), ((_ = A && A.onVnodeMounted) || N || O) && be(() => {
      _ && Me(_, v, c), N && M.enter(y), O && Je(c, null, v, "mounted");
    }, g);
  }, Ze = (c, f, h, v, g) => {
    if (h && I(c, h), v)
      for (let m = 0; m < v.length; m++)
        I(c, v[m]);
    if (g) {
      let m = g.subTree;
      if (f === m || fr(m.type) && (m.ssContent === f || m.ssFallback === f)) {
        const w = g.vnode;
        Ze(
          c,
          w,
          w.scopeId,
          w.slotScopeIds,
          g.parent
        );
      }
    }
  }, Oe = (c, f, h, v, g, m, w, x, y = 0) => {
    for (let _ = y; _ < c.length; _++) {
      const A = c[_] = x ? Ke(c[_]) : Ae(c[_]);
      P(
        null,
        A,
        f,
        h,
        v,
        g,
        m,
        w,
        x
      );
    }
  }, Ot = (c, f, h, v, g, m, w) => {
    const x = f.el = c.el;
    let { patchFlag: y, dynamicChildren: _, dirs: A } = f;
    y |= c.patchFlag & 16;
    const S = c.props || Y, M = f.props || Y;
    let O;
    if (h && Ge(h, !1), (O = M.onVnodeBeforeUpdate) && Me(O, h, f, c), A && Je(f, c, h, "beforeUpdate"), h && Ge(h, !0), (S.innerHTML && M.innerHTML == null || S.textContent && M.textContent == null) && d(x, ""), _ ? dt(
      c.dynamicChildren,
      _,
      x,
      h,
      v,
      us(f, g),
      m
    ) : w || ee(
      c,
      f,
      x,
      null,
      h,
      v,
      us(f, g),
      m,
      !1
    ), y > 0) {
      if (y & 16)
        Rt(x, S, M, h, g);
      else if (y & 2 && S.class !== M.class && i(x, "class", null, M.class, g), y & 4 && i(x, "style", S.style, M.style, g), y & 8) {
        const N = f.dynamicProps;
        for (let k = 0; k < N.length; k++) {
          const K = N[k], ae = S[K], de = M[K];
          (de !== ae || K === "value") && i(x, K, ae, de, g, h);
        }
      }
      y & 1 && c.children !== f.children && d(x, f.children);
    } else !w && _ == null && Rt(x, S, M, h, g);
    ((O = M.onVnodeUpdated) || A) && be(() => {
      O && Me(O, h, f, c), A && Je(f, c, h, "updated");
    }, v);
  }, dt = (c, f, h, v, g, m, w) => {
    for (let x = 0; x < f.length; x++) {
      const y = c[x], _ = f[x], A = (
        // oldVNode may be an errored async setup() component inside Suspense
        // which will not have a mounted element
        y.el && // - In the case of a Fragment, we need to provide the actual parent
        // of the Fragment itself so it can move its children.
        (y.type === Z || // - In the case of different nodes, there is going to be a replacement
        // which also requires the correct parent container
        !gt(y, _) || // - In the case of a component, it could contain anything.
        y.shapeFlag & 198) ? p(y.el) : (
          // In other cases, the parent container is not actually used so we
          // just pass the block element here to avoid a DOM parentNode call.
          h
        )
      );
      P(
        y,
        _,
        A,
        null,
        v,
        g,
        m,
        w,
        !0
      );
    }
  }, Rt = (c, f, h, v, g) => {
    if (f !== h) {
      if (f !== Y)
        for (const m in f)
          !mt(m) && !(m in h) && i(
            c,
            m,
            f[m],
            null,
            g,
            v
          );
      for (const m in h) {
        if (mt(m)) continue;
        const w = h[m], x = f[m];
        w !== x && m !== "value" && i(c, m, x, w, g, v);
      }
      "value" in h && i(c, "value", f.value, h.value, g);
    }
  }, Pt = (c, f, h, v, g, m, w, x, y) => {
    const _ = f.el = c ? c.el : l(""), A = f.anchor = c ? c.anchor : l("");
    let { patchFlag: S, dynamicChildren: M, slotScopeIds: O } = f;
    O && (x = x ? x.concat(O) : O), c == null ? (n(_, h, v), n(A, h, v), Oe(
      // #10007
      // such fragment like `<></>` will be compiled into
      // a fragment which doesn't have a children.
      // In this case fallback to an empty array
      f.children || [],
      h,
      A,
      g,
      m,
      w,
      x,
      y
    )) : S > 0 && S & 64 && M && // #2715 the previous fragment could've been a BAILed one as a result
    // of renderSlot() with no valid children
    c.dynamicChildren ? (dt(
      c.dynamicChildren,
      M,
      h,
      g,
      m,
      w,
      x
    ), // #2080 if the stable fragment has a key, it's a <template v-for> that may
    //  get moved around. Make sure all root level vnodes inherit el.
    // #2134 or if it's a component root, it may also get moved around
    // as the component is being moved.
    (f.key != null || g && f === g.subTree) && cr(
      c,
      f,
      !0
      /* shallow */
    )) : ee(
      c,
      f,
      h,
      A,
      g,
      m,
      w,
      x,
      y
    );
  }, Ft = (c, f, h, v, g, m, w, x, y) => {
    f.slotScopeIds = x, c == null ? f.shapeFlag & 512 ? g.ctx.activate(
      f,
      h,
      v,
      w,
      y
    ) : $t(
      f,
      h,
      v,
      g,
      m,
      w,
      y
    ) : H(c, f, y);
  }, $t = (c, f, h, v, g, m, w) => {
    const x = c.component = Wi(
      c,
      v,
      g
    );
    if (gi(c) && (x.ctx.renderer = ue), qi(x, !1, w), x.asyncDep) {
      if (g && g.registerDep(x, E, w), !c.el) {
        const y = x.subTree = De(ke);
        F(null, y, f, h), c.placeholder = y.el;
      }
    } else
      E(
        x,
        c,
        f,
        h,
        g,
        m,
        w
      );
  }, H = (c, f, h) => {
    const v = f.component = c.component;
    if (Di(c, f, h))
      if (v.asyncDep && !v.asyncResolved) {
        J(v, f, h);
        return;
      } else
        v.next = f, v.update();
    else
      f.el = c.el, v.vnode = f;
  }, E = (c, f, h, v, g, m, w) => {
    const x = () => {
      if (c.isMounted) {
        let { next: S, bu: M, u: O, parent: N, vnode: k } = c;
        {
          const Ce = ur(c);
          if (Ce) {
            S && (S.el = k.el, J(c, S, w)), Ce.asyncDep.then(() => {
              c.isUnmounted || x();
            });
            return;
          }
        }
        let K = S, ae;
        Ge(c, !1), S ? (S.el = k.el, J(c, S, w)) : S = k, M && jt(M), (ae = S.props && S.props.onVnodeBeforeUpdate) && Me(ae, N, S, k), Ge(c, !0);
        const de = Zs(c), Te = c.subTree;
        c.subTree = de, P(
          Te,
          de,
          // parent may have changed if it's in a teleport
          p(Te.el),
          // anchor may have changed if it's in a fragment
          ne(Te),
          c,
          g,
          m
        ), S.el = de.el, K === null && Ni(c, de.el), O && be(O, g), (ae = S.props && S.props.onVnodeUpdated) && be(
          () => Me(ae, N, S, k),
          g
        );
      } else {
        let S;
        const { el: M, props: O } = f, { bm: N, m: k, parent: K, root: ae, type: de } = c, Te = yt(f);
        Ge(c, !1), N && jt(N), !Te && (S = O && O.onVnodeBeforeMount) && Me(S, K, f), Ge(c, !0);
        {
          ae.ce && // @ts-expect-error _def is private
          ae.ce._def.shadowRoot !== !1 && ae.ce._injectChildStyle(de);
          const Ce = c.subTree = Zs(c);
          P(
            null,
            Ce,
            h,
            v,
            c,
            g,
            m
          ), f.el = Ce.el;
        }
        if (k && be(k, g), !Te && (S = O && O.onVnodeMounted)) {
          const Ce = f;
          be(
            () => Me(S, K, Ce),
            g
          );
        }
        (f.shapeFlag & 256 || K && yt(K.vnode) && K.vnode.shapeFlag & 256) && c.a && be(c.a, g), c.isMounted = !0, f = h = v = null;
      }
    };
    c.scope.on();
    const y = c.effect = new Pr(x);
    c.scope.off();
    const _ = c.update = y.run.bind(y), A = c.job = y.runIfDirty.bind(y);
    A.i = c, A.id = c.uid, y.scheduler = () => Gn(A), Ge(c, !0), _();
  }, J = (c, f, h) => {
    f.component = c;
    const v = c.vnode.props;
    c.vnode = f, c.next = null, xi(c, f.props, v, h), Ci(c, f.children, h), ut(), Js(c), ft();
  }, ee = (c, f, h, v, g, m, w, x, y = !1) => {
    const _ = c && c.children, A = c ? c.shapeFlag : 0, S = f.children, { patchFlag: M, shapeFlag: O } = f;
    if (M > 0) {
      if (M & 128) {
        B(
          _,
          S,
          h,
          v,
          g,
          m,
          w,
          x,
          y
        );
        return;
      } else if (M & 256) {
        C(
          _,
          S,
          h,
          v,
          g,
          m,
          w,
          x,
          y
        );
        return;
      }
    }
    O & 8 ? (A & 16 && Se(_, g, m), S !== _ && d(h, S)) : A & 16 ? O & 16 ? B(
      _,
      S,
      h,
      v,
      g,
      m,
      w,
      x,
      y
    ) : Se(_, g, m, !0) : (A & 8 && d(h, ""), O & 16 && Oe(
      S,
      h,
      v,
      g,
      m,
      w,
      x,
      y
    ));
  }, C = (c, f, h, v, g, m, w, x, y) => {
    c = c || it, f = f || it;
    const _ = c.length, A = f.length, S = Math.min(_, A);
    let M;
    for (M = 0; M < S; M++) {
      const O = f[M] = y ? Ke(f[M]) : Ae(f[M]);
      P(
        c[M],
        O,
        h,
        null,
        g,
        m,
        w,
        x,
        y
      );
    }
    _ > A ? Se(
      c,
      g,
      m,
      !0,
      !1,
      S
    ) : Oe(
      f,
      h,
      v,
      g,
      m,
      w,
      x,
      y,
      S
    );
  }, B = (c, f, h, v, g, m, w, x, y) => {
    let _ = 0;
    const A = f.length;
    let S = c.length - 1, M = A - 1;
    for (; _ <= S && _ <= M; ) {
      const O = c[_], N = f[_] = y ? Ke(f[_]) : Ae(f[_]);
      if (gt(O, N))
        P(
          O,
          N,
          h,
          null,
          g,
          m,
          w,
          x,
          y
        );
      else
        break;
      _++;
    }
    for (; _ <= S && _ <= M; ) {
      const O = c[S], N = f[M] = y ? Ke(f[M]) : Ae(f[M]);
      if (gt(O, N))
        P(
          O,
          N,
          h,
          null,
          g,
          m,
          w,
          x,
          y
        );
      else
        break;
      S--, M--;
    }
    if (_ > S) {
      if (_ <= M) {
        const O = M + 1, N = O < A ? f[O].el : v;
        for (; _ <= M; )
          P(
            null,
            f[_] = y ? Ke(f[_]) : Ae(f[_]),
            h,
            N,
            g,
            m,
            w,
            x,
            y
          ), _++;
      }
    } else if (_ > M)
      for (; _ <= S; )
        G(c[_], g, m, !0), _++;
    else {
      const O = _, N = _, k = /* @__PURE__ */ new Map();
      for (_ = N; _ <= M; _++) {
        const ge = f[_] = y ? Ke(f[_]) : Ae(f[_]);
        ge.key != null && k.set(ge.key, _);
      }
      let K, ae = 0;
      const de = M - N + 1;
      let Te = !1, Ce = 0;
      const ht = new Array(de);
      for (_ = 0; _ < de; _++) ht[_] = 0;
      for (_ = O; _ <= S; _++) {
        const ge = c[_];
        if (ae >= de) {
          G(ge, g, m, !0);
          continue;
        }
        let Ee;
        if (ge.key != null)
          Ee = k.get(ge.key);
        else
          for (K = N; K <= M; K++)
            if (ht[K - N] === 0 && gt(ge, f[K])) {
              Ee = K;
              break;
            }
        Ee === void 0 ? G(ge, g, m, !0) : (ht[Ee - N] = _ + 1, Ee >= Ce ? Ce = Ee : Te = !0, P(
          ge,
          f[Ee],
          h,
          null,
          g,
          m,
          w,
          x,
          y
        ), ae++);
      }
      const Us = Te ? Ai(ht) : it;
      for (K = Us.length - 1, _ = de - 1; _ >= 0; _--) {
        const ge = N + _, Ee = f[ge], Bs = f[ge + 1], ks = ge + 1 < A ? (
          // #13559, fallback to el placeholder for unresolved async component
          Bs.el || Bs.placeholder
        ) : v;
        ht[_] === 0 ? P(
          null,
          Ee,
          h,
          ks,
          g,
          m,
          w,
          x,
          y
        ) : Te && (K < 0 || _ !== Us[K] ? te(Ee, h, ks, 2) : K--);
      }
    }
  }, te = (c, f, h, v, g = null) => {
    const { el: m, type: w, transition: x, children: y, shapeFlag: _ } = c;
    if (_ & 6) {
      te(c.component.subTree, f, h, v);
      return;
    }
    if (_ & 128) {
      c.suspense.move(f, h, v);
      return;
    }
    if (_ & 64) {
      w.move(c, f, h, ue);
      return;
    }
    if (w === Z) {
      n(m, f, h);
      for (let S = 0; S < y.length; S++)
        te(y[S], f, h, v);
      n(c.anchor, f, h);
      return;
    }
    if (w === fs) {
      le(c, f, h);
      return;
    }
    if (v !== 2 && _ & 1 && x)
      if (v === 0)
        x.beforeEnter(m), n(m, f, h), be(() => x.enter(m), g);
      else {
        const { leave: S, delayLeave: M, afterLeave: O } = x, N = () => {
          c.ctx.isUnmounted ? r(m) : n(m, f, h);
        }, k = () => {
          m._isLeaving && m[di](
            !0
            /* cancelled */
          ), S(m, () => {
            N(), O && O();
          });
        };
        M ? M(m, N, k) : k();
      }
    else
      n(m, f, h);
  }, G = (c, f, h, v = !1, g = !1) => {
    const {
      type: m,
      props: w,
      ref: x,
      children: y,
      dynamicChildren: _,
      shapeFlag: A,
      patchFlag: S,
      dirs: M,
      cacheIndex: O
    } = c;
    if (S === -2 && (g = !1), x != null && (ut(), bt(x, null, h, c, !0), ft()), O != null && (f.renderCache[O] = void 0), A & 256) {
      f.ctx.deactivate(c);
      return;
    }
    const N = A & 1 && M, k = !yt(c);
    let K;
    if (k && (K = w && w.onVnodeBeforeUnmount) && Me(K, f, c), A & 6)
      He(c.component, h, v);
    else {
      if (A & 128) {
        c.suspense.unmount(h, v);
        return;
      }
      N && Je(c, null, f, "beforeUnmount"), A & 64 ? c.type.remove(
        c,
        f,
        h,
        ue,
        v
      ) : _ && // #5154
      // when v-once is used inside a block, setBlockTracking(-1) marks the
      // parent block with hasOnce: true
      // so that it doesn't take the fast path during unmount - otherwise
      // components nested in v-once are never unmounted.
      !_.hasOnce && // #1153: fast path should not be taken for non-stable (v-for) fragments
      (m !== Z || S > 0 && S & 64) ? Se(
        _,
        f,
        h,
        !1,
        !0
      ) : (m === Z && S & 384 || !g && A & 16) && Se(y, f, h), v && je(c);
    }
    (k && (K = w && w.onVnodeUnmounted) || N) && be(() => {
      K && Me(K, f, c), N && Je(c, null, f, "unmounted");
    }, h);
  }, je = (c) => {
    const { type: f, el: h, anchor: v, transition: g } = c;
    if (f === Z) {
      ce(h, v);
      return;
    }
    if (f === fs) {
      ie(c);
      return;
    }
    const m = () => {
      r(h), g && !g.persisted && g.afterLeave && g.afterLeave();
    };
    if (c.shapeFlag & 1 && g && !g.persisted) {
      const { leave: w, delayLeave: x } = g, y = () => w(h, m);
      x ? x(c.el, m, y) : y();
    } else
      m();
  }, ce = (c, f) => {
    let h;
    for (; c !== f; )
      h = b(c), r(c), c = h;
    r(f);
  }, He = (c, f, h) => {
    const { bum: v, scope: g, job: m, subTree: w, um: x, m: y, a: _ } = c;
    Xs(y), Xs(_), v && jt(v), g.stop(), m && (m.flags |= 8, G(w, c, f, h)), x && be(x, f), be(() => {
      c.isUnmounted = !0;
    }, f);
  }, Se = (c, f, h, v = !1, g = !1, m = 0) => {
    for (let w = m; w < c.length; w++)
      G(c[w], f, h, v, g);
  }, ne = (c) => {
    if (c.shapeFlag & 6)
      return ne(c.component.subTree);
    if (c.shapeFlag & 128)
      return c.suspense.next();
    const f = b(c.anchor || c.el), h = f && f[fi];
    return h ? b(h) : f;
  };
  let ye = !1;
  const et = (c, f, h) => {
    c == null ? f._vnode && G(f._vnode, null, null, !0) : P(
      f._vnode || null,
      c,
      f,
      null,
      null,
      null,
      h
    ), f._vnode = c, ye || (ye = !0, Js(), Qn(), ye = !1);
  }, ue = {
    p: P,
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
function Ii(e, t) {
  return (!e || e && !e.pendingBranch) && t && !t.persisted;
}
function cr(e, t, s = !1) {
  const n = e.children, r = t.children;
  if (L(n) && L(r))
    for (let i = 0; i < n.length; i++) {
      const o = n[i];
      let l = r[i];
      l.shapeFlag & 1 && !l.dynamicChildren && ((l.patchFlag <= 0 || l.patchFlag === 32) && (l = r[i] = Ke(r[i]), l.el = o.el), !s && l.patchFlag !== -2 && cr(o, l)), l.type === ts && // avoid cached text nodes retaining detached dom nodes
      l.patchFlag !== -1 && (l.el = o.el), l.type === ke && !l.el && (l.el = o.el);
    }
}
function Ai(e) {
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
  o && (o.trim && (r = s.map((d) => se(d) ? d.trim() : d)), o.number && (r = s.map(Is)));
  let l, u = n[l = ns(t)] || // also try camelCase event handler (#2249)
  n[l = ns(Ue(t))];
  !u && i && (u = n[l = ns(Xe(t))]), u && Qe(
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
    e.emitted[l] = !0, Qe(
      a,
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
  return i ? (L(i) ? i.forEach((l) => o[l] = null) : Le(o, i), z(e) && n.set(e, o), o) : (z(e) && n.set(e, null), null);
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
    attrs: l,
    emit: u,
    render: a,
    renderCache: d,
    props: p,
    data: b,
    setupState: I,
    ctx: R,
    inheritAttrs: P
  } = e, Q = kt(e);
  let F, X;
  try {
    if (s.shapeFlag & 4) {
      const ie = r || n, qe = ie;
      F = Ae(
        a.call(
          qe,
          ie,
          d,
          p,
          I,
          b,
          R
        )
      ), X = l;
    } else {
      const ie = t;
      F = Ae(
        ie.length > 1 ? ie(
          p,
          { attrs: l, slots: o, emit: u }
        ) : ie(
          p,
          null
        )
      ), X = t.props ? l : Fi(l);
    }
  } catch (ie) {
    wt.length = 0, Zt(ie, e, 1), F = De(ke);
  }
  let le = F;
  if (X && P !== !1) {
    const ie = Object.keys(X), { shapeFlag: qe } = le;
    ie.length && qe & 7 && (i && ie.some(Es) && (X = $i(
      X,
      i
    )), le = at(le, X, !1, !0));
  }
  return s.dirs && (le = at(le, null, !1, !0), le.dirs = le.dirs ? le.dirs.concat(s.dirs) : s.dirs), s.transition && js(le, s.transition), F = le, kt(Q), F;
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
  const { props: n, children: r, component: i } = e, { props: o, children: l, patchFlag: u } = t, a = i.emitsOptions;
  if (t.dirs || t.transition)
    return !0;
  if (s && u >= 0) {
    if (u & 1024)
      return !0;
    if (u & 16)
      return n ? en(n, o, a) : !!o;
    if (u & 8) {
      const d = t.dynamicProps;
      for (let p = 0; p < d.length; p++) {
        const b = d[p];
        if (o[b] !== n[b] && !es(a, b))
          return !0;
      }
    }
  } else
    return (r || l) && (!l || !l.$stable) ? !0 : n === o ? !1 : n ? o ? en(n, o, a) : !0 : !!o;
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
function $(e = !1) {
  wt.push(_e = e ? null : []);
}
function ji() {
  wt.pop(), _e = wt[wt.length - 1] || null;
}
let Mt = 1;
function tn(e, t = !1) {
  Mt += e, e < 0 && _e && t && (_e.hasOnce = !0);
}
function ar(e) {
  return e.dynamicChildren = Mt > 0 ? _e || it : null, ji(), Mt > 0 && _e && _e.push(e), e;
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
function T(e, t = null, s = null, n = 0, r = null, i = e === Z ? 0 : 1, o = !1, l = !1) {
  const u = {
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
  return l ? (Ks(u, s), i & 128 && e.normalize(u)) : s && (u.shapeFlag |= se(s) ? 8 : 16), Mt > 0 && // avoid a block node from tracking itself
  !o && // has current parent block
  _e && // presence of a patch flag indicates this node needs patching on updates.
  // component nodes also should always be patched, because even if the
  // component doesn't need to update, it needs to persist the instance on to
  // the next vnode so that it can be properly unmounted later.
  (u.patchFlag > 0 || i & 6) && // the EVENTS flag is only for hydration and if it is the only flag, the
  // vnode should not be considered dynamic due to handler caching.
  u.patchFlag !== 32 && _e.push(u), u;
}
const De = Vi;
function Vi(e, t = null, s = null, n = 0, r = null, i = !1) {
  if ((!e || e === mi) && (e = ke), dr(e)) {
    const l = at(
      e,
      t,
      !0
      /* mergeRef: true */
    );
    return s && Ks(l, s), Mt > 0 && !i && _e && (l.shapeFlag & 6 ? _e[_e.indexOf(e)] = l : _e.push(l)), l.patchFlag = -2, l;
  }
  if (zi(e) && (e = e.__vccOpts), t) {
    t = Ki(t);
    let { class: l, style: u } = t;
    l && !se(l) && (t.class = St(l)), z(u) && (Ls(u) && !L(u) && (u = Le({}, u)), t.style = As(u));
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
  const { props: r, ref: i, patchFlag: o, children: l, transition: u } = e, a = t ? Ui(r || {}, t) : r, d = {
    __v_isVNode: !0,
    __v_skip: !0,
    type: e.type,
    props: a,
    key: a && hr(a),
    ref: t && t.ref ? (
      // #2078 in the case of <component :is="vnode" ref="extra"/>
      // if the vnode itself already has a ref, cloneVNode will need to merge
      // the refs so the single vnode can be set on multiple refs
      s && i ? L(i) ? i.concat(Ht(t)) : [i, Ht(t)] : Ht(t)
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
    patchFlag: t && e.type !== Z ? o === -1 ? 16 : o | 16 : o,
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
    ssContent: e.ssContent && at(e.ssContent),
    ssFallback: e.ssFallback && at(e.ssFallback),
    placeholder: e.placeholder,
    el: e.el,
    anchor: e.anchor,
    ctx: e.ctx,
    ce: e.ce
  };
  return u && n && js(
    d,
    u.clone(d)
  ), d;
}
function Vt(e = " ", t = 0) {
  return De(ts, null, e, t);
}
function pe(e = "", t = !1) {
  return t ? ($(), Hi(ke, null, e)) : De(ke, null, e);
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
function Me(e, t, s, n = null) {
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
    const r = e.setupContext = n.length > 1 ? Gi(e) : null, i = pr(e), o = It(
      n,
      e,
      0,
      [
        e.props,
        r
      ]
    ), l = Cn(o);
    if (ft(), i(), (l || e.sp) && !yt(e) && pi(e), l) {
      if (o.then(sn, sn), t)
        return o.then((u) => {
          nn(e, u);
        }).catch((u) => {
          Zt(u, e, 0);
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
      const l = on.content;
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
          const l = o.slice(0, o.indexOf(":")).trim();
          s[l] == null && Kt(n, l, "");
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
  n = In(n);
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
    l === "boolean" ? s = On(s) : s == null && l === "string" ? (s = "", o = !0) : l === "number" && (s = 0, o = !0);
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
    const [l, u] = fo(t);
    if (n) {
      const a = i[t] = po(
        n,
        r
      );
      rt(e, l, a, u);
    } else o && (co(e, l, o, u), i[t] = void 0);
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
  return t && (e = e.trim()), s && (e = Is(e)), e;
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
    const l = (i || e.type === "number") && !/^0\d/.test(e.value) ? Is(e.value) : e.value, u = t ?? "";
    l !== u && (document.activeElement === e && e.type !== "range" && (n && t === s || r && e.value.trim() === u) || (e.value = u));
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
      const l = yo[t[o]];
      if (l && l(r, t)) return;
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
], Mo = /(?:没有|没|未|未曾|不曾|并非|不是)[^，。！？；\n]{0,6}$/;
function ps(e, t) {
  let s = e.indexOf(t);
  for (; s !== -1; ) {
    const n = e.slice(Math.max(0, s - 8), s);
    if (!Mo.test(n)) return !0;
    s = e.indexOf(t, s + t.length);
  }
  return !1;
}
function Io(e) {
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
  var i, o, l, u, a, d, p, b, I;
  const t = [], s = (R, P, Q) => {
    if (typeof P == "string" && P.trim())
      for (let F = 0; F < P.length; F += 8e3) t.push({ field: P.length > 8e3 ? `${R}_part_${F / 8e3}` : R, text: P.slice(F, F + 8e3), origin: Q });
  };
  s("user_note", e.note, "user"), s("user_supplement", e.extra, "user");
  for (const [R, P] of (e.chat ?? []).slice(0, 100).entries()) P.role === "me" && s(`user_turn_${R}`, P.text, "user");
  s("user_mood", (i = e.mood) == null ? void 0 : i.label, "user");
  const n = new Date(e.ts ?? ""), r = Number.isNaN(n.getTime()) ? "日期未知" : `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
  return r !== "日期未知" && s("record_date", r, "metadata"), s("image_scene", (o = e.facts) == null ? void 0 : o.scene, "image_model"), s("image_light", (l = e.facts) == null ? void 0 : l.light, "image_model"), s("image_subjects", (a = (u = e.facts) == null ? void 0 : u.subjects) == null ? void 0 : a.join("、"), "image_model"), s("image_text", (p = (d = e.facts) == null ? void 0 : d.text_spans) == null ? void 0 : p.join(`
`), "image_model"), { id: e.id, date: r, title: (e.note || ((I = (b = e.chat) == null ? void 0 : b.find((R) => R.role === "me")) == null ? void 0 : I.text) || "一条记录").slice(0, 80), sources: t, generated: String(e.final || e.draft || "").slice(0, 2e3) };
}
function Ao(e, t) {
  const { exact: s, expanded: n } = Io(t.terms), r = e.flatMap((l) => {
    if (t.from && l.date < t.from || t.to && l.date > t.to) return [];
    const u = l.sources.filter((b) => b.origin !== "image_model").map((b) => b.text).join(`
`).toLowerCase(), a = l.sources.filter((b) => b.origin === "image_model").map((b) => b.text).join(`
`).toLowerCase(), d = l.generated.toLowerCase(), p = s.reduce((b, I) => {
      if (u.includes(I)) return b + 4;
      if (a.includes(I)) return b + 2;
      if (d.includes(I)) return b + 1;
      const R = n.get(I) ?? [];
      return R.some((P) => ps(u, P)) ? b + 2.5 : R.some((P) => ps(a, P)) ? b + 1.2 : R.some((P) => ps(d, P)) ? b + 0.5 : b;
    }, 0);
    return p ? [{ memory: l, score: p }] : [];
  }).sort((l, u) => u.score - l.score || u.memory.date.localeCompare(l.memory.date)), i = [...s, ...[...n.values()].flat()], o = (l) => {
    const u = l.sources.filter((I) => I.origin === "user").map((I) => I.text).join(`
`);
    if (u.length <= 500) return u;
    const a = u.toLowerCase();
    let d = -1;
    for (const I of i) {
      const R = a.indexOf(I);
      R !== -1 && (d === -1 || R < d) && (d = R);
    }
    if (d <= 200) return u.slice(0, 500);
    const p = Math.max(0, d - 160), b = Math.min(u.length, p + 496);
    return `${p > 0 ? "…" : ""}${u.slice(p, b)}${b < u.length ? "…" : ""}`;
  };
  return { matches: r.slice(0, Math.min(12, Math.max(1, t.limit))).map(({ memory: l }) => ({ id: l.id, title: l.title, date: l.date, excerpt: o(l) })), total: r.length, searched: e.length };
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
    const t = he(""), s = he(""), n = he([]), r = he(""), i = he(!1), o = he("说说你记得的片段，线索记不准也没关系。"), l = he(""), u = he(!1), a = he(null), d = he([]), p = he(""), b = he(""), I = he([]), R = he(null), P = /* @__PURE__ */ new Set();
    let Q = 0;
    const F = Lt(() => d.value.find((H) => H.id === p.value)), X = Lt(() => {
      var H;
      return (((H = a.value) == null ? void 0 : H.candidates) ?? []).map((E) => ({ ...E, memory: d.value.find((J) => J.id === E.memoryId) })).filter((E) => E.memory);
    }), le = { supported: "原文支持", conflict: "明确冲突", unknown: "没有足够证据" }, ie = (H) => ({ user_note: "用户原话", user_supplement: "用户补充", user_mood: "自选心情", record_date: "记录日期", image_scene: "图像分析·场景", image_light: "图像分析·光线", image_subjects: "图像分析·主体", image_text: "图像分析·文字" })[H] ?? (H.startsWith("user_turn_") ? "用户对话原话" : H), qe = Lt(() => a.value ? a.value.status === "matched" ? "一条记录与当前线索吻合" : a.value.status === "uncertain" ? "有相关记录，暂时无法确认是哪一次" : "现有记录无法确认这段经历" : ""), At = Lt(() => {
      var H;
      return (((H = a.value) == null ? void 0 : H.comparisons) ?? []).filter((E) => E.memoryId === p.value && (!b.value || E.clueId === b.value));
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
      Q++, (H = R.value) == null || H.abort(), R.value = null, i.value = !1, o.value = "已停止。可以调整线索后重新查找。";
    }
    function Ot(H, E) {
      var J;
      return (J = a.value) == null ? void 0 : J.comparisons.find((ee) => ee.memoryId === H && ee.clueId === E);
    }
    function dt(H) {
      p.value = H;
    }
    function Rt(H) {
      b.value = b.value === H ? "" : H;
    }
    async function Pt(H = !1) {
      var je;
      if (i.value) return;
      const E = t.value.trim();
      if (!E) {
        l.value = "先写一句你记得的片段。";
        return;
      }
      H || (n.value = []), i.value = !0;
      const J = ++Q;
      let ee;
      try {
        ee = u.value ? Ro() : await Oo.list();
      } catch {
        i.value = !1, l.value = "本地数据库未能读取，记录没有改动。请重试。";
        return;
      }
      if (J !== Q) return;
      if (!ee.length) {
        i.value = !1, l.value = "这台设备还没有记录。先记一条，或试用合成案例。";
        return;
      }
      d.value = ee, i.value = !0, l.value = "", a.value = null, I.value = [], p.value = "", b.value = "", P.clear(), r.value = E;
      const C = new AbortController();
      R.value = C;
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
              const Ye = Ao(d.value, ue);
              ye = Ye, et = `检索 ${Ye.searched} 条，命中 ${Ye.total} 条，返回 ${Ye.matches.length} 条`;
            } else if (ne.name === "get_memory") {
              o.value = "正在读取候选原文…";
              const ue = d.value.find((Ye) => Ye.id === ne.args.id) ?? null;
              ue && P.add(ue.id), ye = { memory: ue ? { ...ue, generated: "" } : null }, et = ue ? `已读取 ${ue.date} 的记录及 ${ue.sources.length} 个来源字段` : "原始记录不存在";
            } else throw new Error("模型请求了不支持的工具。");
            return I.value.push({ name: ne.name, args: JSON.stringify(ne.args), result: et, time: Math.round(performance.now() - G) }), { callId: ne.id, result: ye };
          });
          o.value = "正在对照原文，并检查引用和语义…", ce = await Ze("continue", { sessionId: ce.sessionId, results: Se }, C.signal);
        }
        if (J !== Q) return;
        if (!ce.result) throw new Error("没有收到完整的证据结果，请重试。");
        for (const He of ce.result.comparisons) {
          const Se = d.value.find((ne) => ne.id === He.memoryId);
          if (!P.has(He.memoryId) || !Se || He.sources.some((ne) => !Se.sources.some((ye) => ye.field === ne.field && ye.origin !== "image_model" && ye.text.includes(ne.quote))))
            throw new Error("证据与本地原文不一致，本次结果未展示。请重新查找。");
        }
        a.value = ce.result, p.value = ((je = ce.result.candidates[0]) == null ? void 0 : je.memoryId) ?? "", o.value = `已完成 ${I.value.length} 次本地工具执行；${((performance.now() - G) / 1e3).toFixed(1)} 秒。`;
      } catch (ce) {
        if (J !== Q) return;
        l.value = C.signal.aborted ? "已停止检索。" : ce instanceof DOMException && ce.name === "AbortError" ? "请求超时，请稍后重试。" : ce instanceof Error ? ce.message : "检索失败，请稍后重试。", o.value = "这次没有生成结论，也没有修改日记。";
      } finally {
        J === Q && (i.value = !1, R.value = null);
      }
    }
    function Ft(H) {
      if (n.value.length >= 8) {
        l.value = "已达到本轮澄清上限，请开启一次新查询。";
        return;
      }
      n.value.push(H), s.value = "", Pt(!0);
    }
    function $t() {
      Oe(), u.value = !u.value, a.value = null, I.value = [], n.value = [], d.value = [], p.value = "", l.value = "", t.value = u.value ? "我记得去年有次和小林在河边看晚霞，好像还下雨了。" : "", o.value = u.value ? "当前使用三条合成日记；点击查找后将真实执行模型和本地工具。" : "已切回这台设备的记录。";
    }
    return (H, E) => {
      var J, ee;
      return $(), D("section", Po, [
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
          }, j(u.value ? "返回我的记录" : "试用合成案例"), 9, $o)
        ]),
        u.value ? ($(), D("p", Do, "合成案例 · 仅在此工作台临时使用，不会写入、覆盖或同步你的日记。模型输出不预设。")) : pe("", !0),
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
            i.value ? ($(), D("button", {
              key: 0,
              class: "er-link",
              type: "button",
              onClick: Oe
            }, "停止")) : pe("", !0)
          ]),
          E[6] || (E[6] = T("small", null, "检索在本机执行；匹配摘要和选中候选的文字会发送给 AI 服务核对，照片不会随本次查询上传。这里的纠正只改变线索。", -1))
        ], 32),
        T("p", Ho, j(o.value), 1),
        l.value ? ($(), D("p", Vo, j(l.value), 1)) : pe("", !0),
        a.value ? ($(), D("div", Ko, [
          T("h3", null, j(qe.value), 1),
          T("p", null, "这是记录与线索的吻合情况，不能证明当时实际发生了什么。" + j(a.value.rejected ? `有 ${a.value.rejected} 项判断未通过核验，已按未知处理。` : ""), 1)
        ])) : pe("", !0),
        a.value ? ($(), D("div", Uo, [
          T("aside", Bo, [
            E[8] || (E[8] = T("h3", null, "你的线索", -1)),
            E[9] || (E[9] = T("p", { class: "er-hint" }, "点选一条，查看候选与原文如何对应。", -1)),
            ($(!0), D(Z, null, Pe(a.value.clues, (C) => ($(), D("button", {
              key: C.id,
              class: St(["er-clue", { active: b.value === C.id }]),
              "aria-pressed": b.value === C.id,
              onClick: (B) => Rt(C.id)
            }, j(C.text), 11, ko))), 128)),
            n.value.length ? ($(), D("div", Wo, [
              E[7] || (E[7] = T("h4", null, "本轮纠正", -1)),
              ($(!0), D(Z, null, Pe(n.value, (C, B) => ($(), D("p", { key: B }, j(C), 1))), 128))
            ])) : pe("", !0)
          ]),
          T("section", qo, [
            T("h3", null, [
              E[10] || (E[10] = Vt("候选记忆 ", -1)),
              T("span", null, j(X.value.length), 1)
            ]),
            X.value.length ? pe("", !0) : ($(), D("p", Yo, "没有读到可用候选。可以删除不确定的日期或换一个场景词。")),
            ($(!0), D(Z, null, Pe(X.value, (C) => ($(), D("button", {
              key: C.memoryId,
              class: St(["er-memory", { active: p.value === C.memoryId }]),
              "aria-pressed": p.value === C.memoryId,
              onClick: (B) => dt(C.memoryId)
            }, [
              T("span", Go, j(C.memory.date), 1),
              T("strong", null, j(C.memory.title), 1),
              T("span", zo, j(C.supported) + " 条线索有支持 · " + j(C.conflicts) + " 条明确冲突", 1),
              ($(!0), D(Z, null, Pe(a.value.clues.filter((B) => !b.value || B.id === b.value), (B) => {
                var te, G;
                return $(), D("span", {
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
            F.value ? ($(), D(Z, { key: 0 }, [
              T("p", Zo, j(F.value.date) + " · " + j(F.value.id), 1),
              ($(!0), D(Z, null, Pe(At.value, (C) => {
                var B;
                return $(), D("article", {
                  key: C.clueId,
                  class: "er-proof"
                }, [
                  T("h4", null, j((B = a.value.clues.find((te) => te.id === C.clueId)) == null ? void 0 : B.text), 1),
                  T("span", {
                    class: "er-tag",
                    "data-status": C.status
                  }, j(le[C.status]), 9, el),
                  C.status === "unknown" ? ($(), D("p", tl, "没有找到足够的原文依据。未提及，不代表没有发生。")) : pe("", !0),
                  ($(!0), D(Z, null, Pe(C.sources, (te, G) => ($(), D("blockquote", { key: G }, [
                    T("span", null, j(te.quote), 1),
                    T("cite", null, j(ie(te.field)) + " · 已核对逐字引用", 1)
                  ]))), 128))
                ]);
              }), 128)),
              T("details", sl, [
                E[12] || (E[12] = T("summary", null, "查看这条记录的完整来源", -1)),
                ($(!0), D(Z, null, Pe(F.value.sources, (C) => ($(), D("div", {
                  key: C.field
                }, [
                  T("h4", null, [
                    Vt(j(ie(C.field)) + " ", 1),
                    C.origin === "image_model" ? ($(), D("small", nl, "未核对的 AI 观察")) : pe("", !0)
                  ]),
                  T("p", null, j(C.text), 1)
                ]))), 128)),
                F.value.generated ? ($(), D("div", rl, [
                  E[11] || (E[11] = T("h4", null, [
                    Vt("AI 整理 / 保存正文 "),
                    T("small", null, "不作为用户原话证据")
                  ], -1)),
                  T("p", null, j(F.value.generated), 1)
                ])) : pe("", !0),
                F.value.sources.some((C) => C.origin === "user") ? pe("", !0) : ($(), D("p", il, "此记录缺少可用的用户原话，不能仅凭 AI 整理内容确认细节。"))
              ])
            ], 64)) : ($(), D("p", ol, "选一条候选记录查看证据。"))
          ])
        ])) : pe("", !0),
        a.value ? ($(), D("section", ll, [
          T("h3", null, j(((J = a.value.clarification) == null ? void 0 : J.question) || "有什么线索需要调整？"), 1),
          T("div", cl, [
            ($(!0), D(Z, null, Pe(((ee = a.value.clarification) == null ? void 0 : ee.options) ?? [], (C, B) => ($(), D("button", {
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
        I.value.length ? ($(), D("details", hl, [
          T("summary", null, "为什么这样判断 · 查看真实工具执行（" + j(I.value.length) + " 次）", 1),
          T("ol", null, [
            ($(!0), D(Z, null, Pe(I.value, (C, B) => ($(), D("li", { key: B }, [
              T("strong", null, j(C.name), 1),
              T("span", null, j(C.result) + " · " + j(C.time) + "ms", 1),
              T("code", null, j(C.args), 1)
            ]))), 128))
          ]),
          E[16] || (E[16] = T("p", null, "轨迹来自本次模型请求及浏览器实际执行，不是预设步骤。逐字引用校验与语义核验在结论展示前执行。", -1))
        ])) : pe("", !0),
        r.value && !a.value && !i.value && !l.value ? ($(), D("p", pl, "上次线索：" + j(r.value), 1)) : pe("", !0)
      ]);
    };
  }
}), wn = document.getElementById("evidenceWorkspace");
wn && (So(gl).mount(wn), window.LuminaEvidence = { version: "0.1.0" });
