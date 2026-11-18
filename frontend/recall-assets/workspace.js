/**
* @vue/shared v3.5.24
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
// @__NO_SIDE_EFFECTS__
function Ss(e) {
  const t = /* @__PURE__ */ Object.create(null);
  for (const s of e.split(",")) t[s] = 1;
  return (s) => s in t;
}
const J = {}, it = [], Cs = () => {
}, wn = () => !1, Yt = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && // uppercase letter
(e.charCodeAt(2) > 122 || e.charCodeAt(2) < 97), Ts = (e) => e.startsWith("onUpdate:"), Le = Object.assign, br = (e, t) => {
  const s = e.indexOf(t);
  s > -1 && e.splice(s, 1);
}, yr = Object.prototype.hasOwnProperty, U = (e, t) => yr.call(e, t), L = Array.isArray, lt = (e) => Gt(e) === "[object Map]", Sn = (e) => Gt(e) === "[object Set]", q = (e) => typeof e == "function", se = (e) => typeof e == "string", We = (e) => typeof e == "symbol", z = (e) => e !== null && typeof e == "object", Cn = (e) => (z(e) || q(e)) && q(e.then) && q(e.catch), Tn = Object.prototype.toString, Gt = (e) => Tn.call(e), xr = (e) => Gt(e).slice(8, -1), En = (e) => Gt(e) === "[object Object]", Es = (e) => se(e) && e !== "NaN" && e[0] !== "-" && "" + parseInt(e, 10) === e, mt = /* @__PURE__ */ Ss(
  // the leading comma is intentional so empty string "" is also included
  ",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"
), zt = (e) => {
  const t = /* @__PURE__ */ Object.create(null);
  return (s) => t[s] || (t[s] = e(s));
}, wr = /-\w/g, Ue = zt(
  (e) => e.replace(wr, (t) => t.slice(1).toUpperCase())
), Sr = /\B([A-Z])/g, Xe = zt(
  (e) => e.replace(Sr, "-$1").toLowerCase()
), In = zt((e) => e.charAt(0).toUpperCase() + e.slice(1)), ns = zt(
  (e) => e ? `on${In(e)}` : ""
), ot = (e, t) => !Object.is(e, t), jt = (e, ...t) => {
  for (let s = 0; s < e.length; s++)
    e[s](...t);
}, Mn = (e, t, s, n = !1) => {
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
let ks;
const Qt = () => ks || (ks = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : {});
function Ms(e) {
  if (L(e)) {
    const t = {};
    for (let s = 0; s < e.length; s++) {
      const n = e[s], r = se(n) ? Ir(n) : Ms(n);
      if (r)
        for (const i in r)
          t[i] = r[i];
    }
    return t;
  } else if (se(e) || z(e))
    return e;
}
const Cr = /;(?![^(]*\))/g, Tr = /:([^]+)/, Er = /\/\*[^]*?\*\//g;
function Ir(e) {
  const t = {};
  return e.replace(Er, "").split(Cr).forEach((s) => {
    if (s) {
      const n = s.split(Tr);
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
const Mr = "itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly", Ar = /* @__PURE__ */ Ss(Mr);
function An(e) {
  return !!e || e === "";
}
const On = (e) => !!(e && e.__v_isRef === !0), j = (e) => se(e) ? e : e == null ? "" : L(e) || z(e) && (e.toString === Tn || !q(e.toString)) ? On(e) ? j(e.value) : JSON.stringify(e, Rn, 2) : String(e), Rn = (e, t) => On(t) ? Rn(e, t.value) : lt(t) ? {
  [`Map(${t.size})`]: [...t.entries()].reduce(
    (s, [n, r], i) => (s[rs(n, i) + " =>"] = r, s),
    {}
  )
} : Sn(t) ? {
  [`Set(${t.size})`]: [...t.values()].map((s) => rs(s))
} : We(t) ? rs(t) : z(t) && !L(t) && !En(t) ? String(t) : t, rs = (e, t = "") => {
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
class Or {
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
class Rr {
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
    this.flags & 2 && !(this.flags & 32) || this.flags & 8 || Fn(this);
  }
  run() {
    if (!(this.flags & 1))
      return this.fn();
    this.flags |= 2, Ws(this), $n(this);
    const t = W, s = we;
    W = this, we = !0;
    try {
      return this.fn();
    } finally {
      Dn(this), W = t, we = s, this.flags &= -3;
    }
  }
  stop() {
    if (this.flags & 1) {
      for (let t = this.deps; t; t = t.nextDep)
        Rs(t);
      this.deps = this.depsTail = void 0, Ws(this), this.onStop && this.onStop(), this.flags &= -2;
    }
  }
  trigger() {
    this.flags & 64 ? is.add(this) : this.scheduler ? this.scheduler() : this.runIfDirty();
  }
  /**
   * @internal
   */
  runIfDirty() {
    ps(this) && this.run();
  }
  get dirty() {
    return ps(this);
  }
}
let Pn = 0, _t, vt;
function Fn(e, t = !1) {
  if (e.flags |= 8, t) {
    e.next = vt, vt = e;
    return;
  }
  e.next = _t, _t = e;
}
function As() {
  Pn++;
}
function Os() {
  if (--Pn > 0)
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
function $n(e) {
  for (let t = e.deps; t; t = t.nextDep)
    t.version = -1, t.prevActiveLink = t.dep.activeLink, t.dep.activeLink = t;
}
function Dn(e) {
  let t, s = e.depsTail, n = s;
  for (; n; ) {
    const r = n.prevDep;
    n.version === -1 ? (n === s && (s = r), Rs(n), Pr(n)) : t = n, n.dep.activeLink = n.prevActiveLink, n.prevActiveLink = void 0, n = r;
  }
  e.deps = t, e.depsTail = s;
}
function ps(e) {
  for (let t = e.deps; t; t = t.nextDep)
    if (t.dep.version !== t.version || t.dep.computed && (Nn(t.dep.computed) || t.dep.version !== t.version))
      return !0;
  return !!e._dirty;
}
function Nn(e) {
  if (e.flags & 4 && !(e.flags & 16) || (e.flags &= -17, e.globalVersion === Ct) || (e.globalVersion = Ct, !e.isSSR && e.flags & 128 && (!e.deps && !e._dirty || !ps(e))))
    return;
  e.flags |= 2;
  const t = e.dep, s = W, n = we;
  W = e, we = !0;
  try {
    $n(e);
    const r = e.fn(e._value);
    (t.version === 0 || ot(r, e._value)) && (e.flags |= 128, e._value = r, t.version++);
  } catch (r) {
    throw t.version++, r;
  } finally {
    W = s, we = n, Dn(e), e.flags &= -3;
  }
}
function Rs(e, t = !1) {
  const { dep: s, prevSub: n, nextSub: r } = e;
  if (n && (n.nextSub = r, e.prevSub = void 0), r && (r.prevSub = n, e.nextSub = void 0), s.subs === e && (s.subs = n, !n && s.computed)) {
    s.computed.flags &= -5;
    for (let i = s.computed.deps; i; i = i.nextDep)
      Rs(i, !0);
  }
  !t && !--s.sc && s.map && s.map.delete(s.key);
}
function Pr(e) {
  const { prevDep: t, nextDep: s } = e;
  t && (t.nextDep = s, e.prevDep = void 0), s && (s.prevDep = t, e.nextDep = void 0);
}
let we = !0;
const Ln = [];
function ut() {
  Ln.push(we), we = !1;
}
function ft() {
  const e = Ln.pop();
  we = e === void 0 ? !0 : e;
}
function Ws(e) {
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
let Ct = 0;
class Fr {
  constructor(t, s) {
    this.sub = t, this.dep = s, this.version = s.version, this.nextDep = this.prevDep = this.nextSub = this.prevSub = this.prevActiveLink = void 0;
  }
}
class Ps {
  // TODO isolatedDeclarations "__v_skip"
  constructor(t) {
    this.computed = t, this.version = 0, this.activeLink = void 0, this.subs = void 0, this.map = void 0, this.key = void 0, this.sc = 0, this.__v_skip = !0;
  }
  track(t) {
    if (!W || !we || W === this.computed)
      return;
    let s = this.activeLink;
    if (s === void 0 || s.sub !== W)
      s = this.activeLink = new Fr(W, this), W.deps ? (s.prevDep = W.depsTail, W.depsTail.nextDep = s, W.depsTail = s) : W.deps = W.depsTail = s, jn(s);
    else if (s.version === -1 && (s.version = this.version, s.nextDep)) {
      const n = s.nextDep;
      n.prevDep = s.prevDep, s.prevDep && (s.prevDep.nextDep = n), s.prevDep = W.depsTail, s.nextDep = void 0, W.depsTail.nextDep = s, W.depsTail = s, W.deps === s && (W.deps = n);
    }
    return s;
  }
  trigger(t) {
    this.version++, Ct++, this.notify(t);
  }
  notify(t) {
    As();
    try {
      for (let s = this.subs; s; s = s.prevSub)
        s.sub.notify() && s.sub.dep.notify();
    } finally {
      Os();
    }
  }
}
function jn(e) {
  if (e.dep.sc++, e.sub.flags & 4) {
    const t = e.dep.computed;
    if (t && !e.dep.subs) {
      t.flags |= 20;
      for (let n = t.deps; n; n = n.nextDep)
        jn(n);
    }
    const s = e.dep.subs;
    s !== e && (e.prevSub = s, s && (s.nextSub = e)), e.dep.subs = e;
  }
}
const gs = /* @__PURE__ */ new WeakMap(), ze = Symbol(
  ""
), ms = Symbol(
  ""
), Tt = Symbol(
  ""
);
function le(e, t, s) {
  if (we && W) {
    let n = gs.get(e);
    n || gs.set(e, n = /* @__PURE__ */ new Map());
    let r = n.get(s);
    r || (n.set(s, r = new Ps()), r.map = n, r.key = s), r.track();
  }
}
function $e(e, t, s, n, r, i) {
  const l = gs.get(e);
  if (!l) {
    Ct++;
    return;
  }
  const c = (f) => {
    f && f.trigger();
  };
  if (As(), t === "clear")
    l.forEach(c);
  else {
    const f = L(e), a = f && Es(s);
    if (f && s === "length") {
      const d = Number(n);
      l.forEach((_, S) => {
        (S === "length" || S === Tt || !We(S) && S >= d) && c(_);
      });
    } else
      switch ((s !== void 0 || l.has(void 0)) && c(l.get(s)), a && c(l.get(Tt)), t) {
        case "add":
          f ? a && c(l.get("length")) : (c(l.get(ze)), lt(e) && c(l.get(ms)));
          break;
        case "delete":
          f || (c(l.get(ze)), lt(e) && c(l.get(ms)));
          break;
        case "set":
          lt(e) && c(l.get(ze));
          break;
      }
  }
  Os();
}
function tt(e) {
  const t = V(e);
  return t === e ? t : (le(t, "iterate", Tt), Ne(e) ? t : t.map(re));
}
function Xt(e) {
  return le(e = V(e), "iterate", Tt), e;
}
const $r = {
  __proto__: null,
  [Symbol.iterator]() {
    return ls(this, Symbol.iterator, re);
  },
  concat(...e) {
    return tt(this).concat(
      ...e.map((t) => L(t) ? tt(t) : t)
    );
  },
  entries() {
    return ls(this, "entries", (e) => (e[1] = re(e[1]), e));
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
    return os(this, "includes", e);
  },
  indexOf(...e) {
    return os(this, "indexOf", e);
  },
  join(e) {
    return tt(this).join(e);
  },
  // keys() iterator only reads `length`, no optimization required
  lastIndexOf(...e) {
    return os(this, "lastIndexOf", e);
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
    return qs(this, "reduce", e, t);
  },
  reduceRight(e, ...t) {
    return qs(this, "reduceRight", e, t);
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
    return ls(this, "values", re);
  }
};
function ls(e, t, s) {
  const n = Xt(e), r = n[t]();
  return n !== e && !Ne(e) && (r._next = r.next, r.next = () => {
    const i = r._next();
    return i.done || (i.value = s(i.value)), i;
  }), r;
}
const Dr = Array.prototype;
function Re(e, t, s, n, r, i) {
  const l = Xt(e), c = l !== e && !Ne(e), f = l[t];
  if (f !== Dr[t]) {
    const _ = f.apply(e, i);
    return c ? re(_) : _;
  }
  let a = s;
  l !== e && (c ? a = function(_, S) {
    return s.call(this, re(_), S, e);
  } : s.length > 2 && (a = function(_, S) {
    return s.call(this, _, S, e);
  }));
  const d = f.call(l, a, n);
  return c && r ? r(d) : d;
}
function qs(e, t, s, n) {
  const r = Xt(e);
  let i = s;
  return r !== e && (Ne(e) ? s.length > 3 && (i = function(l, c, f) {
    return s.call(this, l, c, f, e);
  }) : i = function(l, c, f) {
    return s.call(this, l, re(c), f, e);
  }), r[t](i, ...n);
}
function os(e, t, s) {
  const n = V(e);
  le(n, "iterate", Tt);
  const r = n[t](...s);
  return (r === -1 || r === !1) && Ns(s[0]) ? (s[0] = V(s[0]), n[t](...s)) : r;
}
function pt(e, t, s = []) {
  ut(), As();
  const n = V(e)[t].apply(e, s);
  return Os(), ft(), n;
}
const Nr = /* @__PURE__ */ Ss("__proto__,__v_isRef,__isVue"), Hn = new Set(
  /* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((e) => e !== "arguments" && e !== "caller").map((e) => Symbol[e]).filter(We)
);
function Lr(e) {
  We(e) || (e = String(e));
  const t = V(this);
  return le(t, "has", e), t.hasOwnProperty(e);
}
class Vn {
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
      return n === (r ? i ? Jr : kn : i ? Bn : Un).get(t) || // receiver is not the reactive proxy, but has the same prototype
      // this means the receiver is a user proxy of the reactive proxy
      Object.getPrototypeOf(t) === Object.getPrototypeOf(n) ? t : void 0;
    const l = L(t);
    if (!r) {
      let f;
      if (l && (f = $r[s]))
        return f;
      if (s === "hasOwnProperty")
        return Lr;
    }
    const c = Reflect.get(
      t,
      s,
      // if this is a proxy wrapping a ref, return methods using the raw ref
      // as receiver so that we don't have to call `toRaw` on the ref in all
      // its class methods
      ve(t) ? t : n
    );
    if ((We(s) ? Hn.has(s) : Nr(s)) || (r || le(t, "get", s), i))
      return c;
    if (ve(c)) {
      const f = l && Es(s) ? c : c.value;
      return r && z(f) ? vs(f) : f;
    }
    return z(c) ? r ? vs(c) : Wn(c) : c;
  }
}
class Kn extends Vn {
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
    const l = L(t) && Es(s) ? Number(s) < t.length : U(t, s), c = Reflect.set(
      t,
      s,
      n,
      ve(t) ? t : r
    );
    return t === V(r) && (l ? ot(n, i) && $e(t, "set", s, n) : $e(t, "add", s, n)), c;
  }
  deleteProperty(t, s) {
    const n = U(t, s);
    t[s];
    const r = Reflect.deleteProperty(t, s);
    return r && n && $e(t, "delete", s, void 0), r;
  }
  has(t, s) {
    const n = Reflect.has(t, s);
    return (!We(s) || !Hn.has(s)) && le(t, "has", s), n;
  }
  ownKeys(t) {
    return le(
      t,
      "iterate",
      L(t) ? "length" : ze
    ), Reflect.ownKeys(t);
  }
}
class jr extends Vn {
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
const Hr = /* @__PURE__ */ new Kn(), Vr = /* @__PURE__ */ new jr(), Kr = /* @__PURE__ */ new Kn(!0);
const _s = (e) => e, Dt = (e) => Reflect.getPrototypeOf(e);
function Ur(e, t, s) {
  return function(...n) {
    const r = this.__v_raw, i = V(r), l = lt(i), c = e === "entries" || e === Symbol.iterator && l, f = e === "keys" && l, a = r[e](...n), d = s ? _s : t ? Ut : re;
    return !t && le(
      i,
      "iterate",
      f ? ms : ze
    ), {
      // iterator protocol
      next() {
        const { value: _, done: S } = a.next();
        return S ? { value: _, done: S } : {
          value: c ? [d(_[0]), d(_[1])] : d(_),
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
function Br(e, t) {
  const s = {
    get(r) {
      const i = this.__v_raw, l = V(i), c = V(r);
      e || (ot(r, c) && le(l, "get", r), le(l, "get", c));
      const { has: f } = Dt(l), a = t ? _s : e ? Ut : re;
      if (f.call(l, r))
        return a(i.get(r));
      if (f.call(l, c))
        return a(i.get(c));
      i !== l && i.get(r);
    },
    get size() {
      const r = this.__v_raw;
      return !e && le(V(r), "iterate", ze), r.size;
    },
    has(r) {
      const i = this.__v_raw, l = V(i), c = V(r);
      return e || (ot(r, c) && le(l, "has", r), le(l, "has", c)), r === c ? i.has(r) : i.has(r) || i.has(c);
    },
    forEach(r, i) {
      const l = this, c = l.__v_raw, f = V(c), a = t ? _s : e ? Ut : re;
      return !e && le(f, "iterate", ze), c.forEach((d, _) => r.call(i, a(d), a(_), l));
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
        const l = V(this), { has: c, get: f } = Dt(l);
        let a = c.call(l, r);
        a || (r = V(r), a = c.call(l, r));
        const d = f.call(l, r);
        return l.set(r, i), a ? ot(i, d) && $e(l, "set", r, i) : $e(l, "add", r, i), this;
      },
      delete(r) {
        const i = V(this), { has: l, get: c } = Dt(i);
        let f = l.call(i, r);
        f || (r = V(r), f = l.call(i, r)), c && c.call(i, r);
        const a = i.delete(r);
        return f && $e(i, "delete", r, void 0), a;
      },
      clear() {
        const r = V(this), i = r.size !== 0, l = r.clear();
        return i && $e(
          r,
          "clear",
          void 0,
          void 0
        ), l;
      }
    }
  ), [
    "keys",
    "values",
    "entries",
    Symbol.iterator
  ].forEach((r) => {
    s[r] = Ur(r, e, t);
  }), s;
}
function Fs(e, t) {
  const s = Br(e, t);
  return (n, r, i) => r === "__v_isReactive" ? !e : r === "__v_isReadonly" ? e : r === "__v_raw" ? n : Reflect.get(
    U(s, r) && r in n ? s : n,
    r,
    i
  );
}
const kr = {
  get: /* @__PURE__ */ Fs(!1, !1)
}, Wr = {
  get: /* @__PURE__ */ Fs(!1, !0)
}, qr = {
  get: /* @__PURE__ */ Fs(!0, !1)
};
const Un = /* @__PURE__ */ new WeakMap(), Bn = /* @__PURE__ */ new WeakMap(), kn = /* @__PURE__ */ new WeakMap(), Jr = /* @__PURE__ */ new WeakMap();
function Yr(e) {
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
function Gr(e) {
  return e.__v_skip || !Object.isExtensible(e) ? 0 : Yr(xr(e));
}
function Wn(e) {
  return Be(e) ? e : $s(
    e,
    !1,
    Hr,
    kr,
    Un
  );
}
function zr(e) {
  return $s(
    e,
    !1,
    Kr,
    Wr,
    Bn
  );
}
function vs(e) {
  return $s(
    e,
    !0,
    Vr,
    qr,
    kn
  );
}
function $s(e, t, s, n, r) {
  if (!z(e) || e.__v_raw && !(t && e.__v_isReactive))
    return e;
  const i = Gr(e);
  if (i === 0)
    return e;
  const l = r.get(e);
  if (l)
    return l;
  const c = new Proxy(
    e,
    i === 2 ? n : s
  );
  return r.set(e, c), c;
}
function Ds(e) {
  return Be(e) ? Ds(e.__v_raw) : !!(e && e.__v_isReactive);
}
function Be(e) {
  return !!(e && e.__v_isReadonly);
}
function Ne(e) {
  return !!(e && e.__v_isShallow);
}
function Ns(e) {
  return e ? !!e.__v_raw : !1;
}
function V(e) {
  const t = e && e.__v_raw;
  return t ? V(t) : e;
}
function Qr(e) {
  return !U(e, "__v_skip") && Object.isExtensible(e) && Mn(e, "__v_skip", !0), e;
}
const re = (e) => z(e) ? Wn(e) : e, Ut = (e) => z(e) ? vs(e) : e;
function ve(e) {
  return e ? e.__v_isRef === !0 : !1;
}
function he(e) {
  return Xr(e, !1);
}
function Xr(e, t) {
  return ve(e) ? e : new Zr(e, t);
}
class Zr {
  constructor(t, s) {
    this.dep = new Ps(), this.__v_isRef = !0, this.__v_isShallow = !1, this._rawValue = s ? t : V(t), this._value = s ? t : re(t), this.__v_isShallow = s;
  }
  get value() {
    return this.dep.track(), this._value;
  }
  set value(t) {
    const s = this._rawValue, n = this.__v_isShallow || Ne(t) || Be(t);
    t = n ? t : V(t), ot(t, s) && (this._rawValue = t, this._value = n ? t : re(t), this.dep.trigger());
  }
}
function ei(e) {
  return ve(e) ? e.value : e;
}
const ti = {
  get: (e, t, s) => t === "__v_raw" ? e : ei(Reflect.get(e, t, s)),
  set: (e, t, s, n) => {
    const r = e[t];
    return ve(r) && !ve(s) ? (r.value = s, !0) : Reflect.set(e, t, s, n);
  }
};
function qn(e) {
  return Ds(e) ? e : new Proxy(e, ti);
}
class si {
  constructor(t, s, n) {
    this.fn = t, this.setter = s, this._value = void 0, this.dep = new Ps(this), this.__v_isRef = !0, this.deps = void 0, this.depsTail = void 0, this.flags = 16, this.globalVersion = Ct - 1, this.next = void 0, this.effect = this, this.__v_isReadonly = !s, this.isSSR = n;
  }
  /**
   * @internal
   */
  notify() {
    if (this.flags |= 16, !(this.flags & 8) && // avoid infinite self recursion
    W !== this)
      return Fn(this, !0), !0;
  }
  get value() {
    const t = this.dep.track();
    return Nn(this), t && (t.version = this.dep.version), this._value;
  }
  set value(t) {
    this.setter && this.setter(t);
  }
}
function ni(e, t, s = !1) {
  let n, r;
  return q(e) ? n = e : (n = e.get, r = e.set), new si(n, r, s);
}
function st(e, t = 1 / 0, s) {
  if (t <= 0 || !z(e) || e.__v_skip || (s = s || /* @__PURE__ */ new Map(), (s.get(e) || 0) >= t))
    return e;
  if (s.set(e, t), t--, ve(e))
    st(e.value, t, s);
  else if (L(e))
    for (let n = 0; n < e.length; n++)
      st(e[n], t, s);
  else if (Sn(e) || lt(e))
    e.forEach((n) => {
      st(n, t, s);
    });
  else if (En(e)) {
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
  const r = t ? t.vnode : null, { errorHandler: i, throwUnhandledErrorInProduction: l } = t && t.appContext.config || J;
  if (t) {
    let c = t.parent;
    const f = t.proxy, a = `https://vuejs.org/error-reference/#runtime-${s}`;
    for (; c; ) {
      const d = c.ec;
      if (d) {
        for (let _ = 0; _ < d.length; _++)
          if (d[_](e, f, a) === !1)
            return;
      }
      c = c.parent;
    }
    if (i) {
      ut(), Mt(i, null, 10, [
        e,
        f,
        a
      ]), ft();
      return;
    }
  }
  ri(e, s, r, n, l);
}
function ri(e, t, s, n = !0, r = !1) {
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
function ii(e) {
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
function Yn(e) {
  if (!(e.flags & 1)) {
    const t = Et(e), s = fe[fe.length - 1];
    !s || // fast path when the job id is larger than the tail
    !(e.flags & 2) && t >= Et(s) ? fe.push(e) : fe.splice(li(t), 0, e), e.flags |= 1, Gn();
  }
}
function Gn() {
  Bt || (Bt = Jn.then(Qn));
}
function oi(e) {
  L(e) ? ct.push(...e) : Ve && e.id === -1 ? Ve.splice(nt + 1, 0, e) : e.flags & 1 || (ct.push(e), e.flags |= 1), Gn();
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
function zn(e) {
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
function Qn(e) {
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
    Me = -1, fe.length = 0, zn(), Bt = null, (fe.length || ct.length) && Qn();
  }
}
let xe = null, Xn = null;
function kt(e) {
  const t = xe;
  return xe = e, Xn = e && e.type.__scopeId || null, t;
}
function ci(e, t = xe, s) {
  if (!t || e._n)
    return e;
  const n = (...r) => {
    n._d && en(-1);
    const i = kt(t);
    let l;
    try {
      l = e(...r);
    } finally {
      kt(i), n._d && en(1);
    }
    return l;
  };
  return n._n = !0, n._c = !0, n._d = !0, n;
}
function Ys(e, t) {
  if (xe === null)
    return e;
  const s = ss(xe), n = e.dirs || (e.dirs = []);
  for (let r = 0; r < t.length; r++) {
    let [i, l, c, f = J] = t[r];
    i && (q(i) && (i = {
      mounted: i,
      updated: i
    }), i.deep && st(l), n.push({
      dir: i,
      instance: s,
      value: l,
      oldValue: void 0,
      arg: c,
      modifiers: f
    }));
  }
  return e;
}
function Ye(e, t, s, n) {
  const r = e.dirs, i = t && t.dirs;
  for (let l = 0; l < r.length; l++) {
    const c = r[l];
    i && (c.oldValue = i[l].value);
    let f = c.dir[n];
    f && (ut(), Qe(f, s, 8, [
      e.el,
      c,
      e,
      t
    ]), ft());
  }
}
const ui = Symbol("_vte"), fi = (e) => e.__isTeleport, ai = Symbol("_leaveCb");
function Ls(e, t) {
  e.shapeFlag & 6 && e.component ? (e.transition = t, Ls(e.component.subTree, t)) : e.shapeFlag & 128 ? (e.ssContent.transition = t.clone(e.ssContent), e.ssFallback.transition = t.clone(e.ssFallback)) : e.transition = t;
}
// @__NO_SIDE_EFFECTS__
function di(e, t) {
  return q(e) ? (
    // #8236: extend call and options.name access are considered side-effects
    // by Rollup, so we have to wrap it in a pure-annotated IIFE.
    Le({ name: e.name }, t, { setup: e })
  ) : e;
}
function hi(e) {
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
  const i = n.shapeFlag & 4 ? ss(n.component) : n.el, l = r ? null : i, { i: c, r: f } = e, a = t && t.r, d = c.refs === J ? c.refs = {} : c.refs, _ = c.setupState, S = V(_), O = _ === J ? wn : (F) => U(S, F);
  if (a != null && a !== f) {
    if (Gs(t), se(a))
      d[a] = null, O(a) && (_[a] = null);
    else if (ve(a)) {
      a.value = null;
      const F = t;
      F.k && (d[F.k] = null);
    }
  }
  if (q(f))
    Mt(f, c, 12, [l, d]);
  else {
    const F = se(f), $ = ve(f);
    if (F || $) {
      const Q = () => {
        if (e.f) {
          const R = F ? O(f) ? _[f] : d[f] : f.value;
          if (r)
            L(R) && br(R, i);
          else if (L(R))
            R.includes(i) || R.push(i);
          else if (F)
            d[f] = [i], O(f) && (_[f] = d[f]);
          else {
            const X = [i];
            f.value = X, e.k && (d[e.k] = X);
          }
        } else F ? (d[f] = l, O(f) && (_[f] = l)) : $ && (f.value = l, e.k && (d[e.k] = l));
      };
      if (l) {
        const R = () => {
          Q(), Wt.delete(e);
        };
        R.id = -1, Wt.set(e, R), be(R, s);
      } else
        Gs(e), Q();
    }
  }
}
function Gs(e) {
  const t = Wt.get(e);
  t && (t.flags |= 8, Wt.delete(e));
}
Qt().requestIdleCallback;
Qt().cancelIdleCallback;
const yt = (e) => !!e.type.__asyncLoader, pi = (e) => e.type.__isKeepAlive, gi = Symbol.for("v-ndc");
function Pe(e, t, s, n) {
  let r;
  const i = s, l = L(e);
  if (l || se(e)) {
    const c = l && Ds(e);
    let f = !1, a = !1;
    c && (f = !Ne(e), a = Be(e), e = Xt(e)), r = new Array(e.length);
    for (let d = 0, _ = e.length; d < _; d++)
      r[d] = t(
        f ? a ? Ut(re(e[d])) : re(e[d]) : e[d],
        d,
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
      for (let f = 0, a = c.length; f < a; f++) {
        const d = c[f];
        r[f] = t(e[d], d, f, i);
      }
    }
  else
    r = [];
  return r;
}
const bs = (e) => e ? pr(e) ? ss(e) : bs(e.parent) : null, xt = (
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
    $parent: (e) => bs(e.parent),
    $root: (e) => bs(e.root),
    $host: (e) => e.ce,
    $emit: (e) => e.emit,
    $options: (e) => e.type,
    $forceUpdate: (e) => e.f || (e.f = () => {
      Yn(e.update);
    }),
    $nextTick: (e) => e.n || (e.n = ii.bind(e.proxy)),
    $watch: (e) => Cs
  })
), cs = (e, t) => e !== J && !e.__isScriptSetup && U(e, t), mi = {
  get({ _: e }, t) {
    if (t === "__v_skip")
      return !0;
    const { ctx: s, setupState: n, data: r, props: i, accessCache: l, type: c, appContext: f } = e;
    let a;
    if (t[0] !== "$") {
      const O = l[t];
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
        if (cs(n, t))
          return l[t] = 1, n[t];
        if (
          // only cache other properties when instance has declared (thus stable)
          // props
          (a = e.propsOptions[0]) && U(a, t)
        )
          return l[t] = 3, i[t];
        if (s !== J && U(s, t))
          return l[t] = 4, s[t];
        l[t] = 0;
      }
    }
    const d = xt[t];
    let _, S;
    if (d)
      return t === "$attrs" && le(e.attrs, "get", ""), d(e);
    if (
      // css module (injected by vue-loader)
      (_ = c.__cssModules) && (_ = _[t])
    )
      return _;
    if (s !== J && U(s, t))
      return l[t] = 4, s[t];
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
    _: { data: e, setupState: t, accessCache: s, ctx: n, appContext: r, propsOptions: i, type: l }
  }, c) {
    let f, a;
    return !!(s[c] || cs(t, c) || (f = i[0]) && U(f, c) || U(n, c) || U(xt, c) || U(r.config.globalProperties, c) || (a = l.__cssModules) && a[c]);
  },
  defineProperty(e, t, s) {
    return s.get != null ? e._.accessCache[t] = 0 : U(s, "value") && this.set(e, t, s.value, null), Reflect.defineProperty(e, t, s);
  }
};
function Zn() {
  return {
    app: null,
    config: {
      isNativeTag: wn,
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
let _i = 0;
function vi(e, t) {
  return function(n, r = null) {
    q(n) || (n = Le({}, n)), r != null && !z(r) && (r = null);
    const i = Zn(), l = /* @__PURE__ */ new WeakSet(), c = [];
    let f = !1;
    const a = i.app = {
      _uid: _i++,
      _component: n,
      _props: r,
      _container: null,
      _context: i,
      _instance: null,
      version: zi,
      get config() {
        return i.config;
      },
      set config(d) {
      },
      use(d, ..._) {
        return l.has(d) || (d && q(d.install) ? (l.add(d), d.install(a, ..._)) : q(d) && (l.add(d), d(a, ..._))), a;
      },
      mixin(d) {
        return a;
      },
      component(d, _) {
        return _ ? (i.components[d] = _, a) : i.components[d];
      },
      directive(d, _) {
        return _ ? (i.directives[d] = _, a) : i.directives[d];
      },
      mount(d, _, S) {
        if (!f) {
          const O = a._ceVNode || De(n, r);
          return O.appContext = i, S === !0 ? S = "svg" : S === !1 && (S = void 0), e(O, d, S), f = !0, a._container = d, d.__vue_app__ = a, ss(O.component);
        }
      },
      onUnmount(d) {
        c.push(d);
      },
      unmount() {
        f && (Qe(
          c,
          a._instance,
          16
        ), e(null, a._container), delete a._container.__vue_app__);
      },
      provide(d, _) {
        return i.provides[d] = _, a;
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
const er = {}, tr = () => Object.create(er), sr = (e) => Object.getPrototypeOf(e) === er;
function bi(e, t, s, n = !1) {
  const r = {}, i = tr();
  e.propsDefaults = /* @__PURE__ */ Object.create(null), nr(e, t, r, i);
  for (const l in e.propsOptions[0])
    l in r || (r[l] = void 0);
  s ? e.props = n ? r : zr(r) : e.type.props ? e.props = r : e.props = i, e.attrs = i;
}
function yi(e, t, s, n) {
  const {
    props: r,
    attrs: i,
    vnode: { patchFlag: l }
  } = e, c = V(r), [f] = e.propsOptions;
  let a = !1;
  if (
    // always force full diff in dev
    // - #1942 if hmr is enabled with sfc component
    // - vite#872 non-sfc component used by sfc component
    (n || l > 0) && !(l & 16)
  ) {
    if (l & 8) {
      const d = e.vnode.dynamicProps;
      for (let _ = 0; _ < d.length; _++) {
        let S = d[_];
        if (es(e.emitsOptions, S))
          continue;
        const O = t[S];
        if (f)
          if (U(i, S))
            O !== i[S] && (i[S] = O, a = !0);
          else {
            const F = Ue(S);
            r[F] = ys(
              f,
              c,
              F,
              O,
              e,
              !1
            );
          }
        else
          O !== i[S] && (i[S] = O, a = !0);
      }
    }
  } else {
    nr(e, t, r, i) && (a = !0);
    let d;
    for (const _ in c)
      (!t || // for camelCase
      !U(t, _) && // it's possible the original props was passed in as kebab-case
      // and converted to camelCase (#955)
      ((d = Xe(_)) === _ || !U(t, d))) && (f ? s && // for camelCase
      (s[_] !== void 0 || // for kebab-case
      s[d] !== void 0) && (r[_] = ys(
        f,
        c,
        _,
        void 0,
        e,
        !0
      )) : delete r[_]);
    if (i !== c)
      for (const _ in i)
        (!t || !U(t, _)) && (delete i[_], a = !0);
  }
  a && $e(e.attrs, "set", "");
}
function nr(e, t, s, n) {
  const [r, i] = e.propsOptions;
  let l = !1, c;
  if (t)
    for (let f in t) {
      if (mt(f))
        continue;
      const a = t[f];
      let d;
      r && U(r, d = Ue(f)) ? !i || !i.includes(d) ? s[d] = a : (c || (c = {}))[d] = a : es(e.emitsOptions, f) || (!(f in n) || a !== n[f]) && (n[f] = a, l = !0);
    }
  if (i) {
    const f = V(s), a = c || J;
    for (let d = 0; d < i.length; d++) {
      const _ = i[d];
      s[_] = ys(
        r,
        f,
        _,
        a[_],
        e,
        !U(a, _)
      );
    }
  }
  return l;
}
function ys(e, t, s, n, r, i) {
  const l = e[s];
  if (l != null) {
    const c = U(l, "default");
    if (c && n === void 0) {
      const f = l.default;
      if (l.type !== Function && !l.skipFactory && q(f)) {
        const { propsDefaults: a } = r;
        if (s in a)
          n = a[s];
        else {
          const d = hr(r);
          n = a[s] = f.call(
            null,
            t
          ), d();
        }
      } else
        n = f;
      r.ce && r.ce._setProp(s, n);
    }
    l[
      0
      /* shouldCast */
    ] && (i && !c ? n = !1 : l[
      1
      /* shouldCastTrue */
    ] && (n === "" || n === Xe(s)) && (n = !0));
  }
  return n;
}
function xi(e, t, s = !1) {
  const n = t.propsCache, r = n.get(e);
  if (r)
    return r;
  const i = e.props, l = {}, c = [];
  if (!i)
    return z(e) && n.set(e, it), it;
  if (L(i))
    for (let a = 0; a < i.length; a++) {
      const d = Ue(i[a]);
      zs(d) && (l[d] = J);
    }
  else if (i)
    for (const a in i) {
      const d = Ue(a);
      if (zs(d)) {
        const _ = i[a], S = l[d] = L(_) || q(_) ? { type: _ } : Le({}, _), O = S.type;
        let F = !1, $ = !0;
        if (L(O))
          for (let Q = 0; Q < O.length; ++Q) {
            const R = O[Q], X = q(R) && R.name;
            if (X === "Boolean") {
              F = !0;
              break;
            } else X === "String" && ($ = !1);
          }
        else
          F = q(O) && O.name === "Boolean";
        S[
          0
          /* shouldCast */
        ] = F, S[
          1
          /* shouldCastTrue */
        ] = $, (F || U(S, "default")) && c.push(d);
      }
    }
  const f = [l, c];
  return z(e) && n.set(e, f), f;
}
function zs(e) {
  return e[0] !== "$" && !mt(e);
}
const js = (e) => e === "_" || e === "_ctx" || e === "$stable", Hs = (e) => L(e) ? e.map(Ae) : [Ae(e)], wi = (e, t, s) => {
  if (t._n)
    return t;
  const n = ci((...r) => Hs(t(...r)), s);
  return n._c = !1, n;
}, rr = (e, t, s) => {
  const n = e._ctx;
  for (const r in e) {
    if (js(r)) continue;
    const i = e[r];
    if (q(i))
      t[r] = wi(r, i, n);
    else if (i != null) {
      const l = Hs(i);
      t[r] = () => l;
    }
  }
}, ir = (e, t) => {
  const s = Hs(t);
  e.slots.default = () => s;
}, lr = (e, t, s) => {
  for (const n in t)
    (s || !js(n)) && (e[n] = t[n]);
}, Si = (e, t, s) => {
  const n = e.slots = tr();
  if (e.vnode.shapeFlag & 32) {
    const r = t._;
    r ? (lr(n, t, s), s && Mn(n, "_", r, !0)) : rr(t, n);
  } else t && ir(e, t);
}, Ci = (e, t, s) => {
  const { vnode: n, slots: r } = e;
  let i = !0, l = J;
  if (n.shapeFlag & 32) {
    const c = t._;
    c ? s && c === 1 ? i = !1 : lr(r, t, s) : (i = !t.$stable, rr(t, r)), l = t;
  } else t && (ir(e, t), l = { default: 1 });
  if (i)
    for (const c in r)
      !js(c) && l[c] == null && delete r[c];
}, be = Ni;
function Ti(e) {
  return Ei(e);
}
function Ei(e, t) {
  const s = Qt();
  s.__VUE__ = !0;
  const {
    insert: n,
    remove: r,
    patchProp: i,
    createElement: l,
    createText: c,
    createComment: f,
    setText: a,
    setElementText: d,
    parentNode: _,
    nextSibling: S,
    setScopeId: O = Cs,
    insertStaticContent: F
  } = e, $ = (o, u, h, v = null, p = null, g = null, x = void 0, y = null, b = !!u.dynamicChildren) => {
    if (o === u)
      return;
    o && !gt(o, u) && (v = ne(o), G(o, p, g, !0), o = null), u.patchFlag === -2 && (b = !1, u.dynamicChildren = null);
    const { type: m, ref: M, shapeFlag: w } = u;
    switch (m) {
      case ts:
        Q(o, u, h, v);
        break;
      case ke:
        R(o, u, h, v);
        break;
      case fs:
        o == null && X(u, h, v, x);
        break;
      case Z:
        Pt(
          o,
          u,
          h,
          v,
          p,
          g,
          x,
          y,
          b
        );
        break;
      default:
        w & 1 ? qe(
          o,
          u,
          h,
          v,
          p,
          g,
          x,
          y,
          b
        ) : w & 6 ? Ft(
          o,
          u,
          h,
          v,
          p,
          g,
          x,
          y,
          b
        ) : (w & 64 || w & 128) && m.process(
          o,
          u,
          h,
          v,
          p,
          g,
          x,
          y,
          b,
          ue
        );
    }
    M != null && p ? bt(M, o && o.ref, g, u || o, !u) : M == null && o && o.ref != null && bt(o.ref, null, g, o, !0);
  }, Q = (o, u, h, v) => {
    if (o == null)
      n(
        u.el = c(u.children),
        h,
        v
      );
    else {
      const p = u.el = o.el;
      u.children !== o.children && a(p, u.children);
    }
  }, R = (o, u, h, v) => {
    o == null ? n(
      u.el = f(u.children || ""),
      h,
      v
    ) : u.el = o.el;
  }, X = (o, u, h, v) => {
    [o.el, o.anchor] = F(
      o.children,
      u,
      h,
      v,
      o.el,
      o.anchor
    );
  }, oe = ({ el: o, anchor: u }, h, v) => {
    let p;
    for (; o && o !== u; )
      p = S(o), n(o, h, v), o = p;
    n(u, h, v);
  }, ie = ({ el: o, anchor: u }) => {
    let h;
    for (; o && o !== u; )
      h = S(o), r(o), o = h;
    r(u);
  }, qe = (o, u, h, v, p, g, x, y, b) => {
    if (u.type === "svg" ? x = "svg" : u.type === "math" && (x = "mathml"), o == null)
      At(
        u,
        h,
        v,
        p,
        g,
        x,
        y,
        b
      );
    else {
      const m = o.el && o.el._isVueCE ? o.el : null;
      try {
        m && m._beginPatch(), Ot(
          o,
          u,
          p,
          g,
          x,
          y,
          b
        );
      } finally {
        m && m._endPatch();
      }
    }
  }, At = (o, u, h, v, p, g, x, y) => {
    let b, m;
    const { props: M, shapeFlag: w, transition: I, dirs: A } = o;
    if (b = o.el = l(
      o.type,
      g,
      M && M.is,
      M
    ), w & 8 ? d(b, o.children) : w & 16 && Oe(
      o.children,
      b,
      null,
      v,
      p,
      us(o, g),
      x,
      y
    ), A && Ye(o, null, v, "created"), Ze(b, o, o.scopeId, x, v), M) {
      for (const k in M)
        k !== "value" && !mt(k) && i(b, k, null, M[k], g, v);
      "value" in M && i(b, "value", null, M.value, g), (m = M.onVnodeBeforeMount) && Ie(m, v, o);
    }
    A && Ye(o, null, v, "beforeMount");
    const N = Ii(p, I);
    N && I.beforeEnter(b), n(b, u, h), ((m = M && M.onVnodeMounted) || N || A) && be(() => {
      m && Ie(m, v, o), N && I.enter(b), A && Ye(o, null, v, "mounted");
    }, p);
  }, Ze = (o, u, h, v, p) => {
    if (h && O(o, h), v)
      for (let g = 0; g < v.length; g++)
        O(o, v[g]);
    if (p) {
      let g = p.subTree;
      if (u === g || ur(g.type) && (g.ssContent === u || g.ssFallback === u)) {
        const x = p.vnode;
        Ze(
          o,
          x,
          x.scopeId,
          x.slotScopeIds,
          p.parent
        );
      }
    }
  }, Oe = (o, u, h, v, p, g, x, y, b = 0) => {
    for (let m = b; m < o.length; m++) {
      const M = o[m] = y ? Ke(o[m]) : Ae(o[m]);
      $(
        null,
        M,
        u,
        h,
        v,
        p,
        g,
        x,
        y
      );
    }
  }, Ot = (o, u, h, v, p, g, x) => {
    const y = u.el = o.el;
    let { patchFlag: b, dynamicChildren: m, dirs: M } = u;
    b |= o.patchFlag & 16;
    const w = o.props || J, I = u.props || J;
    let A;
    if (h && Ge(h, !1), (A = I.onVnodeBeforeUpdate) && Ie(A, h, u, o), M && Ye(u, o, h, "beforeUpdate"), h && Ge(h, !0), (w.innerHTML && I.innerHTML == null || w.textContent && I.textContent == null) && d(y, ""), m ? dt(
      o.dynamicChildren,
      m,
      y,
      h,
      v,
      us(u, p),
      g
    ) : x || ee(
      o,
      u,
      y,
      null,
      h,
      v,
      us(u, p),
      g,
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
      b & 1 && o.children !== u.children && d(y, u.children);
    } else !x && m == null && Rt(y, w, I, h, p);
    ((A = I.onVnodeUpdated) || M) && be(() => {
      A && Ie(A, h, u, o), M && Ye(u, o, h, "updated");
    }, v);
  }, dt = (o, u, h, v, p, g, x) => {
    for (let y = 0; y < u.length; y++) {
      const b = o[y], m = u[y], M = (
        // oldVNode may be an errored async setup() component inside Suspense
        // which will not have a mounted element
        b.el && // - In the case of a Fragment, we need to provide the actual parent
        // of the Fragment itself so it can move its children.
        (b.type === Z || // - In the case of different nodes, there is going to be a replacement
        // which also requires the correct parent container
        !gt(b, m) || // - In the case of a component, it could contain anything.
        b.shapeFlag & 198) ? _(b.el) : (
          // In other cases, the parent container is not actually used so we
          // just pass the block element here to avoid a DOM parentNode call.
          h
        )
      );
      $(
        b,
        m,
        M,
        null,
        v,
        p,
        g,
        x,
        !0
      );
    }
  }, Rt = (o, u, h, v, p) => {
    if (u !== h) {
      if (u !== J)
        for (const g in u)
          !mt(g) && !(g in h) && i(
            o,
            g,
            u[g],
            null,
            p,
            v
          );
      for (const g in h) {
        if (mt(g)) continue;
        const x = h[g], y = u[g];
        x !== y && g !== "value" && i(o, g, y, x, p, v);
      }
      "value" in h && i(o, "value", u.value, h.value, p);
    }
  }, Pt = (o, u, h, v, p, g, x, y, b) => {
    const m = u.el = o ? o.el : c(""), M = u.anchor = o ? o.anchor : c("");
    let { patchFlag: w, dynamicChildren: I, slotScopeIds: A } = u;
    A && (y = y ? y.concat(A) : A), o == null ? (n(m, h, v), n(M, h, v), Oe(
      // #10007
      // such fragment like `<></>` will be compiled into
      // a fragment which doesn't have a children.
      // In this case fallback to an empty array
      u.children || [],
      h,
      M,
      p,
      g,
      x,
      y,
      b
    )) : w > 0 && w & 64 && I && // #2715 the previous fragment could've been a BAILed one as a result
    // of renderSlot() with no valid children
    o.dynamicChildren ? (dt(
      o.dynamicChildren,
      I,
      h,
      p,
      g,
      x,
      y
    ), // #2080 if the stable fragment has a key, it's a <template v-for> that may
    //  get moved around. Make sure all root level vnodes inherit el.
    // #2134 or if it's a component root, it may also get moved around
    // as the component is being moved.
    (u.key != null || p && u === p.subTree) && or(
      o,
      u,
      !0
      /* shallow */
    )) : ee(
      o,
      u,
      h,
      M,
      p,
      g,
      x,
      y,
      b
    );
  }, Ft = (o, u, h, v, p, g, x, y, b) => {
    u.slotScopeIds = y, o == null ? u.shapeFlag & 512 ? p.ctx.activate(
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
      g,
      x,
      b
    ) : H(o, u, b);
  }, $t = (o, u, h, v, p, g, x) => {
    const y = o.component = ki(
      o,
      v,
      p
    );
    if (pi(o) && (y.ctx.renderer = ue), Wi(y, !1, x), y.asyncDep) {
      if (p && p.registerDep(y, E, x), !o.el) {
        const b = y.subTree = De(ke);
        R(null, b, u, h), o.placeholder = b.el;
      }
    } else
      E(
        y,
        o,
        u,
        h,
        p,
        g,
        x
      );
  }, H = (o, u, h) => {
    const v = u.component = o.component;
    if ($i(o, u, h))
      if (v.asyncDep && !v.asyncResolved) {
        Y(v, u, h);
        return;
      } else
        v.next = u, v.update();
    else
      u.el = o.el, v.vnode = u;
  }, E = (o, u, h, v, p, g, x) => {
    const y = () => {
      if (o.isMounted) {
        let { next: w, bu: I, u: A, parent: N, vnode: k } = o;
        {
          const Te = cr(o);
          if (Te) {
            w && (w.el = k.el, Y(o, w, x)), Te.asyncDep.then(() => {
              o.isUnmounted || y();
            });
            return;
          }
        }
        let K = w, ae;
        Ge(o, !1), w ? (w.el = k.el, Y(o, w, x)) : w = k, I && jt(I), (ae = w.props && w.props.onVnodeBeforeUpdate) && Ie(ae, N, w, k), Ge(o, !0);
        const de = Xs(o), Ce = o.subTree;
        o.subTree = de, $(
          Ce,
          de,
          // parent may have changed if it's in a teleport
          _(Ce.el),
          // anchor may have changed if it's in a fragment
          ne(Ce),
          o,
          p,
          g
        ), w.el = de.el, K === null && Di(o, de.el), A && be(A, p), (ae = w.props && w.props.onVnodeUpdated) && be(
          () => Ie(ae, N, w, k),
          p
        );
      } else {
        let w;
        const { el: I, props: A } = u, { bm: N, m: k, parent: K, root: ae, type: de } = o, Ce = yt(u);
        Ge(o, !1), N && jt(N), !Ce && (w = A && A.onVnodeBeforeMount) && Ie(w, K, u), Ge(o, !0);
        {
          ae.ce && // @ts-expect-error _def is private
          ae.ce._def.shadowRoot !== !1 && ae.ce._injectChildStyle(de);
          const Te = o.subTree = Xs(o);
          $(
            null,
            Te,
            h,
            v,
            o,
            p,
            g
          ), u.el = Te.el;
        }
        if (k && be(k, p), !Ce && (w = A && A.onVnodeMounted)) {
          const Te = u;
          be(
            () => Ie(w, K, Te),
            p
          );
        }
        (u.shapeFlag & 256 || K && yt(K.vnode) && K.vnode.shapeFlag & 256) && o.a && be(o.a, p), o.isMounted = !0, u = h = v = null;
      }
    };
    o.scope.on();
    const b = o.effect = new Rr(y);
    o.scope.off();
    const m = o.update = b.run.bind(b), M = o.job = b.runIfDirty.bind(b);
    M.i = o, M.id = o.uid, b.scheduler = () => Yn(M), Ge(o, !0), m();
  }, Y = (o, u, h) => {
    u.component = o;
    const v = o.vnode.props;
    o.vnode = u, o.next = null, yi(o, u.props, v, h), Ci(o, u.children, h), ut(), Js(o), ft();
  }, ee = (o, u, h, v, p, g, x, y, b = !1) => {
    const m = o && o.children, M = o ? o.shapeFlag : 0, w = u.children, { patchFlag: I, shapeFlag: A } = u;
    if (I > 0) {
      if (I & 128) {
        B(
          m,
          w,
          h,
          v,
          p,
          g,
          x,
          y,
          b
        );
        return;
      } else if (I & 256) {
        T(
          m,
          w,
          h,
          v,
          p,
          g,
          x,
          y,
          b
        );
        return;
      }
    }
    A & 8 ? (M & 16 && Se(m, p, g), w !== m && d(h, w)) : M & 16 ? A & 16 ? B(
      m,
      w,
      h,
      v,
      p,
      g,
      x,
      y,
      b
    ) : Se(m, p, g, !0) : (M & 8 && d(h, ""), A & 16 && Oe(
      w,
      h,
      v,
      p,
      g,
      x,
      y,
      b
    ));
  }, T = (o, u, h, v, p, g, x, y, b) => {
    o = o || it, u = u || it;
    const m = o.length, M = u.length, w = Math.min(m, M);
    let I;
    for (I = 0; I < w; I++) {
      const A = u[I] = b ? Ke(u[I]) : Ae(u[I]);
      $(
        o[I],
        A,
        h,
        null,
        p,
        g,
        x,
        y,
        b
      );
    }
    m > M ? Se(
      o,
      p,
      g,
      !0,
      !1,
      w
    ) : Oe(
      u,
      h,
      v,
      p,
      g,
      x,
      y,
      b,
      w
    );
  }, B = (o, u, h, v, p, g, x, y, b) => {
    let m = 0;
    const M = u.length;
    let w = o.length - 1, I = M - 1;
    for (; m <= w && m <= I; ) {
      const A = o[m], N = u[m] = b ? Ke(u[m]) : Ae(u[m]);
      if (gt(A, N))
        $(
          A,
          N,
          h,
          null,
          p,
          g,
          x,
          y,
          b
        );
      else
        break;
      m++;
    }
    for (; m <= w && m <= I; ) {
      const A = o[w], N = u[I] = b ? Ke(u[I]) : Ae(u[I]);
      if (gt(A, N))
        $(
          A,
          N,
          h,
          null,
          p,
          g,
          x,
          y,
          b
        );
      else
        break;
      w--, I--;
    }
    if (m > w) {
      if (m <= I) {
        const A = I + 1, N = A < M ? u[A].el : v;
        for (; m <= I; )
          $(
            null,
            u[m] = b ? Ke(u[m]) : Ae(u[m]),
            h,
            N,
            p,
            g,
            x,
            y,
            b
          ), m++;
      }
    } else if (m > I)
      for (; m <= w; )
        G(o[m], p, g, !0), m++;
    else {
      const A = m, N = m, k = /* @__PURE__ */ new Map();
      for (m = N; m <= I; m++) {
        const ge = u[m] = b ? Ke(u[m]) : Ae(u[m]);
        ge.key != null && k.set(ge.key, m);
      }
      let K, ae = 0;
      const de = I - N + 1;
      let Ce = !1, Te = 0;
      const ht = new Array(de);
      for (m = 0; m < de; m++) ht[m] = 0;
      for (m = A; m <= w; m++) {
        const ge = o[m];
        if (ae >= de) {
          G(ge, p, g, !0);
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
        Ee === void 0 ? G(ge, p, g, !0) : (ht[Ee - N] = m + 1, Ee >= Te ? Te = Ee : Ce = !0, $(
          ge,
          u[Ee],
          h,
          null,
          p,
          g,
          x,
          y,
          b
        ), ae++);
      }
      const Ks = Ce ? Mi(ht) : it;
      for (K = Ks.length - 1, m = de - 1; m >= 0; m--) {
        const ge = N + m, Ee = u[ge], Us = u[ge + 1], Bs = ge + 1 < M ? (
          // #13559, fallback to el placeholder for unresolved async component
          Us.el || Us.placeholder
        ) : v;
        ht[m] === 0 ? $(
          null,
          Ee,
          h,
          Bs,
          p,
          g,
          x,
          y,
          b
        ) : Ce && (K < 0 || m !== Ks[K] ? te(Ee, h, Bs, 2) : K--);
      }
    }
  }, te = (o, u, h, v, p = null) => {
    const { el: g, type: x, transition: y, children: b, shapeFlag: m } = o;
    if (m & 6) {
      te(o.component.subTree, u, h, v);
      return;
    }
    if (m & 128) {
      o.suspense.move(u, h, v);
      return;
    }
    if (m & 64) {
      x.move(o, u, h, ue);
      return;
    }
    if (x === Z) {
      n(g, u, h);
      for (let w = 0; w < b.length; w++)
        te(b[w], u, h, v);
      n(o.anchor, u, h);
      return;
    }
    if (x === fs) {
      oe(o, u, h);
      return;
    }
    if (v !== 2 && m & 1 && y)
      if (v === 0)
        y.beforeEnter(g), n(g, u, h), be(() => y.enter(g), p);
      else {
        const { leave: w, delayLeave: I, afterLeave: A } = y, N = () => {
          o.ctx.isUnmounted ? r(g) : n(g, u, h);
        }, k = () => {
          g._isLeaving && g[ai](
            !0
            /* cancelled */
          ), w(g, () => {
            N(), A && A();
          });
        };
        I ? I(g, N, k) : k();
      }
    else
      n(g, u, h);
  }, G = (o, u, h, v = !1, p = !1) => {
    const {
      type: g,
      props: x,
      ref: y,
      children: b,
      dynamicChildren: m,
      shapeFlag: M,
      patchFlag: w,
      dirs: I,
      cacheIndex: A
    } = o;
    if (w === -2 && (p = !1), y != null && (ut(), bt(y, null, h, o, !0), ft()), A != null && (u.renderCache[A] = void 0), M & 256) {
      u.ctx.deactivate(o);
      return;
    }
    const N = M & 1 && I, k = !yt(o);
    let K;
    if (k && (K = x && x.onVnodeBeforeUnmount) && Ie(K, u, o), M & 6)
      He(o.component, h, v);
    else {
      if (M & 128) {
        o.suspense.unmount(h, v);
        return;
      }
      N && Ye(o, null, u, "beforeUnmount"), M & 64 ? o.type.remove(
        o,
        u,
        h,
        ue,
        v
      ) : m && // #5154
      // when v-once is used inside a block, setBlockTracking(-1) marks the
      // parent block with hasOnce: true
      // so that it doesn't take the fast path during unmount - otherwise
      // components nested in v-once are never unmounted.
      !m.hasOnce && // #1153: fast path should not be taken for non-stable (v-for) fragments
      (g !== Z || w > 0 && w & 64) ? Se(
        m,
        u,
        h,
        !1,
        !0
      ) : (g === Z && w & 384 || !p && M & 16) && Se(b, u, h), v && je(o);
    }
    (k && (K = x && x.onVnodeUnmounted) || N) && be(() => {
      K && Ie(K, u, o), N && Ye(o, null, u, "unmounted");
    }, h);
  }, je = (o) => {
    const { type: u, el: h, anchor: v, transition: p } = o;
    if (u === Z) {
      ce(h, v);
      return;
    }
    if (u === fs) {
      ie(o);
      return;
    }
    const g = () => {
      r(h), p && !p.persisted && p.afterLeave && p.afterLeave();
    };
    if (o.shapeFlag & 1 && p && !p.persisted) {
      const { leave: x, delayLeave: y } = p, b = () => x(h, g);
      y ? y(o.el, g, b) : b();
    } else
      g();
  }, ce = (o, u) => {
    let h;
    for (; o !== u; )
      h = S(o), r(o), o = h;
    r(u);
  }, He = (o, u, h) => {
    const { bum: v, scope: p, job: g, subTree: x, um: y, m: b, a: m } = o;
    Qs(b), Qs(m), v && jt(v), p.stop(), g && (g.flags |= 8, G(x, o, u, h)), y && be(y, u), be(() => {
      o.isUnmounted = !0;
    }, u);
  }, Se = (o, u, h, v = !1, p = !1, g = 0) => {
    for (let x = g; x < o.length; x++)
      G(o[x], u, h, v, p);
  }, ne = (o) => {
    if (o.shapeFlag & 6)
      return ne(o.component.subTree);
    if (o.shapeFlag & 128)
      return o.suspense.next();
    const u = S(o.anchor || o.el), h = u && u[ui];
    return h ? S(h) : u;
  };
  let ye = !1;
  const et = (o, u, h) => {
    o == null ? u._vnode && G(u._vnode, null, null, !0) : $(
      u._vnode || null,
      o,
      u,
      null,
      null,
      null,
      h
    ), u._vnode = o, ye || (ye = !0, Js(), zn(), ye = !1);
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
    createApp: vi(et)
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
function or(e, t, s = !1) {
  const n = e.children, r = t.children;
  if (L(n) && L(r))
    for (let i = 0; i < n.length; i++) {
      const l = n[i];
      let c = r[i];
      c.shapeFlag & 1 && !c.dynamicChildren && ((c.patchFlag <= 0 || c.patchFlag === 32) && (c = r[i] = Ke(r[i]), c.el = l.el), !s && c.patchFlag !== -2 && or(l, c)), c.type === ts && // avoid cached text nodes retaining detached dom nodes
      c.patchFlag !== -1 && (c.el = l.el), c.type === ke && !c.el && (c.el = l.el);
    }
}
function Mi(e) {
  const t = e.slice(), s = [0];
  let n, r, i, l, c;
  const f = e.length;
  for (n = 0; n < f; n++) {
    const a = e[n];
    if (a !== 0) {
      if (r = s[s.length - 1], e[r] < a) {
        t[n] = r, s.push(n);
        continue;
      }
      for (i = 0, l = s.length - 1; i < l; )
        c = i + l >> 1, e[s[c]] < a ? i = c + 1 : l = c;
      a < e[s[i]] && (i > 0 && (t[n] = s[i - 1]), s[i] = n);
    }
  }
  for (i = s.length, l = s[i - 1]; i-- > 0; )
    s[i] = l, l = t[l];
  return s;
}
function cr(e) {
  const t = e.subTree.component;
  if (t)
    return t.asyncDep && !t.asyncResolved ? t : cr(t);
}
function Qs(e) {
  if (e)
    for (let t = 0; t < e.length; t++)
      e[t].flags |= 8;
}
const Ai = (e, t) => t === "modelValue" || t === "model-value" ? e.modelModifiers : e[`${t}Modifiers`] || e[`${Ue(t)}Modifiers`] || e[`${Xe(t)}Modifiers`];
function Oi(e, t, ...s) {
  if (e.isUnmounted) return;
  const n = e.vnode.props || J;
  let r = s;
  const i = t.startsWith("update:"), l = i && Ai(n, t.slice(7));
  l && (l.trim && (r = s.map((d) => se(d) ? d.trim() : d)), l.number && (r = s.map(Is)));
  let c, f = n[c = ns(t)] || // also try camelCase event handler (#2249)
  n[c = ns(Ue(t))];
  !f && i && (f = n[c = ns(Xe(t))]), f && Qe(
    f,
    e,
    6,
    r
  );
  const a = n[c + "Once"];
  if (a) {
    if (!e.emitted)
      e.emitted = {};
    else if (e.emitted[c])
      return;
    e.emitted[c] = !0, Qe(
      a,
      e,
      6,
      r
    );
  }
}
function Ri(e, t, s = !1) {
  const n = t.emitsCache, r = n.get(e);
  if (r !== void 0)
    return r;
  const i = e.emits;
  let l = {};
  return i ? (L(i) ? i.forEach((c) => l[c] = null) : Le(l, i), z(e) && n.set(e, l), l) : (z(e) && n.set(e, null), null);
}
function es(e, t) {
  return !e || !Yt(t) ? !1 : (t = t.slice(2).replace(/Once$/, ""), U(e, t[0].toLowerCase() + t.slice(1)) || U(e, Xe(t)) || U(e, t));
}
function Xs(e) {
  const {
    type: t,
    vnode: s,
    proxy: n,
    withProxy: r,
    propsOptions: [i],
    slots: l,
    attrs: c,
    emit: f,
    render: a,
    renderCache: d,
    props: _,
    data: S,
    setupState: O,
    ctx: F,
    inheritAttrs: $
  } = e, Q = kt(e);
  let R, X;
  try {
    if (s.shapeFlag & 4) {
      const ie = r || n, qe = ie;
      R = Ae(
        a.call(
          qe,
          ie,
          d,
          _,
          O,
          S,
          F
        )
      ), X = c;
    } else {
      const ie = t;
      R = Ae(
        ie.length > 1 ? ie(
          _,
          { attrs: c, slots: l, emit: f }
        ) : ie(
          _,
          null
        )
      ), X = t.props ? c : Pi(c);
    }
  } catch (ie) {
    wt.length = 0, Zt(ie, e, 1), R = De(ke);
  }
  let oe = R;
  if (X && $ !== !1) {
    const ie = Object.keys(X), { shapeFlag: qe } = oe;
    ie.length && qe & 7 && (i && ie.some(Ts) && (X = Fi(
      X,
      i
    )), oe = at(oe, X, !1, !0));
  }
  return s.dirs && (oe = at(oe, null, !1, !0), oe.dirs = oe.dirs ? oe.dirs.concat(s.dirs) : s.dirs), s.transition && Ls(oe, s.transition), R = oe, kt(Q), R;
}
const Pi = (e) => {
  let t;
  for (const s in e)
    (s === "class" || s === "style" || Yt(s)) && ((t || (t = {}))[s] = e[s]);
  return t;
}, Fi = (e, t) => {
  const s = {};
  for (const n in e)
    (!Ts(n) || !(n.slice(9) in t)) && (s[n] = e[n]);
  return s;
};
function $i(e, t, s) {
  const { props: n, children: r, component: i } = e, { props: l, children: c, patchFlag: f } = t, a = i.emitsOptions;
  if (t.dirs || t.transition)
    return !0;
  if (s && f >= 0) {
    if (f & 1024)
      return !0;
    if (f & 16)
      return n ? Zs(n, l, a) : !!l;
    if (f & 8) {
      const d = t.dynamicProps;
      for (let _ = 0; _ < d.length; _++) {
        const S = d[_];
        if (l[S] !== n[S] && !es(a, S))
          return !0;
      }
    }
  } else
    return (r || c) && (!c || !c.$stable) ? !0 : n === l ? !1 : n ? l ? Zs(n, l, a) : !0 : !!l;
  return !1;
}
function Zs(e, t, s) {
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
function Di({ vnode: e, parent: t }, s) {
  for (; t; ) {
    const n = t.subTree;
    if (n.suspense && n.suspense.activeBranch === e && (n.el = e.el), n === e)
      (e = t.vnode).el = s, t = t.parent;
    else
      break;
  }
}
const ur = (e) => e.__isSuspense;
function Ni(e, t) {
  t && t.pendingBranch ? L(e) ? t.effects.push(...e) : t.effects.push(e) : oi(e);
}
const Z = Symbol.for("v-fgt"), ts = Symbol.for("v-txt"), ke = Symbol.for("v-cmt"), fs = Symbol.for("v-stc"), wt = [];
let _e = null;
function P(e = !1) {
  wt.push(_e = e ? null : []);
}
function Li() {
  wt.pop(), _e = wt[wt.length - 1] || null;
}
let It = 1;
function en(e, t = !1) {
  It += e, e < 0 && _e && t && (_e.hasOnce = !0);
}
function fr(e) {
  return e.dynamicChildren = It > 0 ? _e || it : null, Li(), It > 0 && _e && _e.push(e), e;
}
function D(e, t, s, n, r, i) {
  return fr(
    C(
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
function ji(e, t, s, n, r) {
  return fr(
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
function ar(e) {
  return e ? e.__v_isVNode === !0 : !1;
}
function gt(e, t) {
  return e.type === t.type && e.key === t.key;
}
const dr = ({ key: e }) => e ?? null, Ht = ({
  ref: e,
  ref_key: t,
  ref_for: s
}) => (typeof e == "number" && (e = "" + e), e != null ? se(e) || ve(e) || q(e) ? { i: xe, r: e, k: t, f: !!s } : e : null);
function C(e, t = null, s = null, n = 0, r = null, i = e === Z ? 0 : 1, l = !1, c = !1) {
  const f = {
    __v_isVNode: !0,
    __v_skip: !0,
    type: e,
    props: t,
    key: t && dr(t),
    ref: t && Ht(t),
    scopeId: Xn,
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
  return c ? (Vs(f, s), i & 128 && e.normalize(f)) : s && (f.shapeFlag |= se(s) ? 8 : 16), It > 0 && // avoid a block node from tracking itself
  !l && // has current parent block
  _e && // presence of a patch flag indicates this node needs patching on updates.
  // component nodes also should always be patched, because even if the
  // component doesn't need to update, it needs to persist the instance on to
  // the next vnode so that it can be properly unmounted later.
  (f.patchFlag > 0 || i & 6) && // the EVENTS flag is only for hydration and if it is the only flag, the
  // vnode should not be considered dynamic due to handler caching.
  f.patchFlag !== 32 && _e.push(f), f;
}
const De = Hi;
function Hi(e, t = null, s = null, n = 0, r = null, i = !1) {
  if ((!e || e === gi) && (e = ke), ar(e)) {
    const c = at(
      e,
      t,
      !0
      /* mergeRef: true */
    );
    return s && Vs(c, s), It > 0 && !i && _e && (c.shapeFlag & 6 ? _e[_e.indexOf(e)] = c : _e.push(c)), c.patchFlag = -2, c;
  }
  if (Gi(e) && (e = e.__vccOpts), t) {
    t = Vi(t);
    let { class: c, style: f } = t;
    c && !se(c) && (t.class = St(c)), z(f) && (Ns(f) && !L(f) && (f = Le({}, f)), t.style = Ms(f));
  }
  const l = se(e) ? 1 : ur(e) ? 128 : fi(e) ? 64 : z(e) ? 4 : q(e) ? 2 : 0;
  return C(
    e,
    t,
    s,
    n,
    r,
    l,
    i,
    !0
  );
}
function Vi(e) {
  return e ? Ns(e) || sr(e) ? Le({}, e) : e : null;
}
function at(e, t, s = !1, n = !1) {
  const { props: r, ref: i, patchFlag: l, children: c, transition: f } = e, a = t ? Ki(r || {}, t) : r, d = {
    __v_isVNode: !0,
    __v_skip: !0,
    type: e.type,
    props: a,
    key: a && dr(a),
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
    patchFlag: t && e.type !== Z ? l === -1 ? 16 : l | 16 : l,
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
  return f && n && Ls(
    d,
    f.clone(d)
  ), d;
}
function Vt(e = " ", t = 0) {
  return De(ts, null, e, t);
}
function pe(e = "", t = !1) {
  return t ? (P(), ji(ke, null, e)) : De(ke, null, e);
}
function Ae(e) {
  return e == null || typeof e == "boolean" ? De(ke) : L(e) ? De(
    Z,
    null,
    // #3666, avoid reference pollution when reusing vnode
    e.slice()
  ) : ar(e) ? Ke(e) : De(ts, null, String(e));
}
function Ke(e) {
  return e.el === null && e.patchFlag !== -1 || e.memo ? e : at(e);
}
function Vs(e, t) {
  let s = 0;
  const { shapeFlag: n } = e;
  if (t == null)
    t = null;
  else if (L(t))
    s = 16;
  else if (typeof t == "object")
    if (n & 65) {
      const r = t.default;
      r && (r._c && (r._d = !1), Vs(e, r()), r._c && (r._d = !0));
      return;
    } else {
      s = 32;
      const r = t._;
      !r && !sr(t) ? t._ctx = xe : r === 3 && xe && (xe.slots._ === 1 ? t._ = 1 : (t._ = 2, e.patchFlag |= 1024));
    }
  else q(t) ? (t = { default: t, _ctx: xe }, s = 32) : (t = String(t), n & 64 ? (s = 16, t = [Vt(t)]) : s = 8);
  e.children = t, e.shapeFlag |= s;
}
function Ki(...e) {
  const t = {};
  for (let s = 0; s < e.length; s++) {
    const n = e[s];
    for (const r in n)
      if (r === "class")
        t.class !== n.class && (t.class = St([t.class, n.class]));
      else if (r === "style")
        t.style = Ms([t.style, n.style]);
      else if (Yt(r)) {
        const i = t[r], l = n[r];
        l && i !== l && !(L(i) && i.includes(l)) && (t[r] = i ? [].concat(i, l) : l);
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
const Ui = Zn();
let Bi = 0;
function ki(e, t, s) {
  const n = e.type, r = (t ? t.appContext : e.appContext) || Ui, i = {
    uid: Bi++,
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
    scope: new Or(
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
    propsOptions: xi(n, r),
    emitsOptions: Ri(n, r),
    // emit
    emit: null,
    // to be set immediately
    emitted: null,
    // props default value
    propsDefaults: J,
    // inheritAttrs
    inheritAttrs: n.inheritAttrs,
    // state
    ctx: J,
    data: J,
    props: J,
    attrs: J,
    slots: J,
    refs: J,
    setupState: J,
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
  return i.ctx = { _: i }, i.root = t ? t.root : i, i.emit = Oi.bind(null, i), e.ce && e.ce(i), i;
}
let qt = null, Jt, xs;
{
  const e = Qt(), t = (s, n) => {
    let r;
    return (r = e[s]) || (r = e[s] = []), r.push(n), (i) => {
      r.length > 1 ? r.forEach((l) => l(i)) : r[0](i);
    };
  };
  Jt = t(
    "__VUE_INSTANCE_SETTERS__",
    (s) => qt = s
  ), xs = t(
    "__VUE_SSR_SETTERS__",
    (s) => gr = s
  );
}
const hr = (e) => {
  const t = qt;
  return Jt(e), e.scope.on(), () => {
    e.scope.off(), Jt(t);
  };
}, tn = () => {
  qt && qt.scope.off(), Jt(null);
};
function pr(e) {
  return e.vnode.shapeFlag & 4;
}
let gr = !1;
function Wi(e, t = !1, s = !1) {
  t && xs(t);
  const { props: n, children: r } = e.vnode, i = pr(e);
  bi(e, n, i, t), Si(e, r, s || t);
  const l = i ? qi(e, t) : void 0;
  return t && xs(!1), l;
}
function qi(e, t) {
  const s = e.type;
  e.accessCache = /* @__PURE__ */ Object.create(null), e.proxy = new Proxy(e.ctx, mi);
  const { setup: n } = s;
  if (n) {
    ut();
    const r = e.setupContext = n.length > 1 ? Yi(e) : null, i = hr(e), l = Mt(
      n,
      e,
      0,
      [
        e.props,
        r
      ]
    ), c = Cn(l);
    if (ft(), i(), (c || e.sp) && !yt(e) && hi(e), c) {
      if (l.then(tn, tn), t)
        return l.then((f) => {
          sn(e, f);
        }).catch((f) => {
          Zt(f, e, 0);
        });
      e.asyncDep = l;
    } else
      sn(e, l);
  } else
    mr(e);
}
function sn(e, t, s) {
  q(t) ? e.type.__ssrInlineRender ? e.ssrRender = t : e.render = t : z(t) && (e.setupState = qn(t)), mr(e);
}
function mr(e, t, s) {
  const n = e.type;
  e.render || (e.render = n.render || Cs);
}
const Ji = {
  get(e, t) {
    return le(e, "get", ""), e[t];
  }
};
function Yi(e) {
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
  return e.exposed ? e.exposeProxy || (e.exposeProxy = new Proxy(qn(Qr(e.exposed)), {
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
function Gi(e) {
  return q(e) && "__vccOpts" in e;
}
const Lt = (e, t) => ni(e, t, gr), zi = "3.5.24";
/**
* @vue/runtime-dom v3.5.24
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
let ws;
const nn = typeof window < "u" && window.trustedTypes;
if (nn)
  try {
    ws = /* @__PURE__ */ nn.createPolicy("vue", {
      createHTML: (e) => e
    });
  } catch {
  }
const _r = ws ? (e) => ws.createHTML(e) : (e) => e, Qi = "http://www.w3.org/2000/svg", Xi = "http://www.w3.org/1998/Math/MathML", Fe = typeof document < "u" ? document : null, rn = Fe && /* @__PURE__ */ Fe.createElement("template"), Zi = {
  insert: (e, t, s) => {
    t.insertBefore(e, s || null);
  },
  remove: (e) => {
    const t = e.parentNode;
    t && t.removeChild(e);
  },
  createElement: (e, t, s, n) => {
    const r = t === "svg" ? Fe.createElementNS(Qi, e) : t === "mathml" ? Fe.createElementNS(Xi, e) : s ? Fe.createElement(e, { is: s }) : Fe.createElement(e);
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
    const l = s ? s.previousSibling : t.lastChild;
    if (r && (r === i || r.nextSibling))
      for (; t.insertBefore(r.cloneNode(!0), s), !(r === i || !(r = r.nextSibling)); )
        ;
    else {
      rn.innerHTML = _r(
        n === "svg" ? `<svg>${e}</svg>` : n === "mathml" ? `<math>${e}</math>` : e
      );
      const c = rn.content;
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
      l ? l.nextSibling : t.firstChild,
      // last
      s ? s.previousSibling : t.lastChild
    ];
  }
}, el = Symbol("_vtc");
function tl(e, t, s) {
  const n = e[el];
  n && (t = (t ? [t, ...n] : [...n]).join(" ")), t == null ? e.removeAttribute("class") : s ? e.setAttribute("class", t) : e.className = t;
}
const ln = Symbol("_vod"), sl = Symbol("_vsh"), nl = Symbol(""), rl = /(?:^|;)\s*display\s*:/;
function il(e, t, s) {
  const n = e.style, r = se(s);
  let i = !1;
  if (s && !r) {
    if (t)
      if (se(t))
        for (const l of t.split(";")) {
          const c = l.slice(0, l.indexOf(":")).trim();
          s[c] == null && Kt(n, c, "");
        }
      else
        for (const l in t)
          s[l] == null && Kt(n, l, "");
    for (const l in s)
      l === "display" && (i = !0), Kt(n, l, s[l]);
  } else if (r) {
    if (t !== s) {
      const l = n[nl];
      l && (s += ";" + l), n.cssText = s, i = rl.test(s);
    }
  } else t && e.removeAttribute("style");
  ln in e && (e[ln] = i ? n.display : "", e[sl] && (n.display = "none"));
}
const on = /\s*!important$/;
function Kt(e, t, s) {
  if (L(s))
    s.forEach((n) => Kt(e, t, n));
  else if (s == null && (s = ""), t.startsWith("--"))
    e.setProperty(t, s);
  else {
    const n = ll(e, t);
    on.test(s) ? e.setProperty(
      Xe(n),
      s.replace(on, ""),
      "important"
    ) : e[n] = s;
  }
}
const cn = ["Webkit", "Moz", "ms"], as = {};
function ll(e, t) {
  const s = as[t];
  if (s)
    return s;
  let n = Ue(t);
  if (n !== "filter" && n in e)
    return as[t] = n;
  n = In(n);
  for (let r = 0; r < cn.length; r++) {
    const i = cn[r] + n;
    if (i in e)
      return as[t] = i;
  }
  return t;
}
const un = "http://www.w3.org/1999/xlink";
function fn(e, t, s, n, r, i = Ar(t)) {
  n && t.startsWith("xlink:") ? s == null ? e.removeAttributeNS(un, t.slice(6, t.length)) : e.setAttributeNS(un, t, s) : s == null || i && !An(s) ? e.removeAttribute(t) : e.setAttribute(
    t,
    i ? "" : We(s) ? String(s) : s
  );
}
function an(e, t, s, n, r) {
  if (t === "innerHTML" || t === "textContent") {
    s != null && (e[t] = t === "innerHTML" ? _r(s) : s);
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
  let l = !1;
  if (s === "" || s == null) {
    const c = typeof e[t];
    c === "boolean" ? s = An(s) : s == null && c === "string" ? (s = "", l = !0) : c === "number" && (s = 0, l = !0);
  }
  try {
    e[t] = s;
  } catch {
  }
  l && e.removeAttribute(r || t);
}
function rt(e, t, s, n) {
  e.addEventListener(t, s, n);
}
function ol(e, t, s, n) {
  e.removeEventListener(t, s, n);
}
const dn = Symbol("_vei");
function cl(e, t, s, n, r = null) {
  const i = e[dn] || (e[dn] = {}), l = i[t];
  if (n && l)
    l.value = n;
  else {
    const [c, f] = ul(t);
    if (n) {
      const a = i[t] = dl(
        n,
        r
      );
      rt(e, c, a, f);
    } else l && (ol(e, c, l, f), i[t] = void 0);
  }
}
const hn = /(?:Once|Passive|Capture)$/;
function ul(e) {
  let t;
  if (hn.test(e)) {
    t = {};
    let n;
    for (; n = e.match(hn); )
      e = e.slice(0, e.length - n[0].length), t[n[0].toLowerCase()] = !0;
  }
  return [e[2] === ":" ? e.slice(3) : Xe(e.slice(2)), t];
}
let ds = 0;
const fl = /* @__PURE__ */ Promise.resolve(), al = () => ds || (fl.then(() => ds = 0), ds = Date.now());
function dl(e, t) {
  const s = (n) => {
    if (!n._vts)
      n._vts = Date.now();
    else if (n._vts <= s.attached)
      return;
    Qe(
      hl(n, s.value),
      t,
      5,
      [n]
    );
  };
  return s.value = e, s.attached = al(), s;
}
function hl(e, t) {
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
const pn = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && // lowercase letter
e.charCodeAt(2) > 96 && e.charCodeAt(2) < 123, pl = (e, t, s, n, r, i) => {
  const l = r === "svg";
  t === "class" ? tl(e, n, l) : t === "style" ? il(e, s, n) : Yt(t) ? Ts(t) || cl(e, t, s, n, i) : (t[0] === "." ? (t = t.slice(1), !0) : t[0] === "^" ? (t = t.slice(1), !1) : gl(e, t, n, l)) ? (an(e, t, n), !e.tagName.includes("-") && (t === "value" || t === "checked" || t === "selected") && fn(e, t, n, l, i, t !== "value")) : /* #11081 force set props for possible async custom element */ e._isVueCE && (/[A-Z]/.test(t) || !se(n)) ? an(e, Ue(t), n, i, t) : (t === "true-value" ? e._trueValue = n : t === "false-value" && (e._falseValue = n), fn(e, t, n, l));
};
function gl(e, t, s, n) {
  if (n)
    return !!(t === "innerHTML" || t === "textContent" || t in e && pn(t) && q(s));
  if (t === "spellcheck" || t === "draggable" || t === "translate" || t === "autocorrect" || t === "sandbox" && e.tagName === "IFRAME" || t === "form" || t === "list" && e.tagName === "INPUT" || t === "type" && e.tagName === "TEXTAREA")
    return !1;
  if (t === "width" || t === "height") {
    const r = e.tagName;
    if (r === "IMG" || r === "VIDEO" || r === "CANVAS" || r === "SOURCE")
      return !1;
  }
  return pn(t) && se(s) ? !1 : t in e;
}
const gn = (e) => {
  const t = e.props["onUpdate:modelValue"] || !1;
  return L(t) ? (s) => jt(t, s) : t;
};
function ml(e) {
  e.target.composing = !0;
}
function mn(e) {
  const t = e.target;
  t.composing && (t.composing = !1, t.dispatchEvent(new Event("input")));
}
const hs = Symbol("_assign");
function _n(e, t, s) {
  return t && (e = e.trim()), s && (e = Is(e)), e;
}
const vn = {
  created(e, { modifiers: { lazy: t, trim: s, number: n } }, r) {
    e[hs] = gn(r);
    const i = n || r.props && r.props.type === "number";
    rt(e, t ? "change" : "input", (l) => {
      l.target.composing || e[hs](_n(e.value, s, i));
    }), (s || i) && rt(e, "change", () => {
      e.value = _n(e.value, s, i);
    }), t || (rt(e, "compositionstart", ml), rt(e, "compositionend", mn), rt(e, "change", mn));
  },
  // set value on mounted so it's after min/max for type="range"
  mounted(e, { value: t }) {
    e.value = t ?? "";
  },
  beforeUpdate(e, { value: t, oldValue: s, modifiers: { lazy: n, trim: r, number: i } }, l) {
    if (e[hs] = gn(l), e.composing) return;
    const c = (i || e.type === "number") && !/^0\d/.test(e.value) ? Is(e.value) : e.value, f = t ?? "";
    c !== f && (document.activeElement === e && e.type !== "range" && (n && t === s || r && e.value.trim() === f) || (e.value = f));
  }
}, _l = ["ctrl", "shift", "alt", "meta"], vl = {
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
  exact: (e, t) => _l.some((s) => e[`${s}Key`] && !t.includes(s))
}, bn = (e, t) => {
  const s = e._withMods || (e._withMods = {}), n = t.join(".");
  return s[n] || (s[n] = (r, ...i) => {
    for (let l = 0; l < t.length; l++) {
      const c = vl[t[l]];
      if (c && c(r, t)) return;
    }
    return e(r, ...i);
  });
}, bl = /* @__PURE__ */ Le({ patchProp: pl }, Zi);
let yn;
function yl() {
  return yn || (yn = Ti(bl));
}
const xl = (...e) => {
  const t = yl().createApp(...e), { mount: s } = t;
  return t.mount = (n) => {
    const r = Sl(n);
    if (!r) return;
    const i = t._component;
    !q(i) && !i.render && !i.template && (i.template = r.innerHTML), r.nodeType === 1 && (r.textContent = "");
    const l = s(r, !1, wl(r));
    return r instanceof Element && (r.removeAttribute("v-cloak"), r.setAttribute("data-v-app", "")), l;
  }, t;
};
function wl(e) {
  if (e instanceof SVGElement)
    return "svg";
  if (typeof MathMLElement == "function" && e instanceof MathMLElement)
    return "mathml";
}
function Sl(e) {
  return se(e) ? document.querySelector(e) : e;
}
function vr(e) {
  var i, l, c, f, a, d, _, S, O;
  const t = [], s = (F, $, Q) => {
    if (typeof $ == "string" && $.trim())
      for (let R = 0; R < $.length; R += 8e3) t.push({ field: $.length > 8e3 ? `${F}_part_${R / 8e3}` : F, text: $.slice(R, R + 8e3), origin: Q });
  };
  s("user_note", e.note, "user"), s("user_supplement", e.extra, "user");
  for (const [F, $] of (e.chat ?? []).slice(0, 100).entries()) $.role === "me" && s(`user_turn_${F}`, $.text, "user");
  s("user_mood", (i = e.mood) == null ? void 0 : i.label, "user");
  const n = new Date(e.ts ?? ""), r = Number.isNaN(n.getTime()) ? "日期未知" : `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
  return r !== "日期未知" && s("record_date", r, "metadata"), s("image_scene", (l = e.facts) == null ? void 0 : l.scene, "image_model"), s("image_light", (c = e.facts) == null ? void 0 : c.light, "image_model"), s("image_subjects", (a = (f = e.facts) == null ? void 0 : f.subjects) == null ? void 0 : a.join("、"), "image_model"), s("image_text", (_ = (d = e.facts) == null ? void 0 : d.text_spans) == null ? void 0 : _.join(`
`), "image_model"), { id: e.id, date: r, title: (e.note || ((O = (S = e.chat) == null ? void 0 : S.find((F) => F.role === "me")) == null ? void 0 : O.text) || "一条记录").slice(0, 80), sources: t, generated: String(e.final || e.draft || "").slice(0, 2e3) };
}
function Cl(e, t) {
  const s = [...new Set(t.terms.map((r) => r.toLowerCase().trim()).filter(Boolean))], n = e.flatMap((r) => {
    if (t.from && r.date < t.from || t.to && r.date > t.to) return [];
    const i = r.sources.filter((a) => a.origin !== "image_model").map((a) => a.text).join(`
`).toLowerCase(), l = r.sources.filter((a) => a.origin === "image_model").map((a) => a.text).join(`
`).toLowerCase(), c = r.generated.toLowerCase(), f = s.reduce((a, d) => a + (i.includes(d) ? 4 : l.includes(d) ? 2 : c.includes(d) ? 1 : 0), 0);
    return f ? [{ memory: r, score: f }] : [];
  }).sort((r, i) => i.score - r.score || i.memory.date.localeCompare(r.memory.date));
  return { matches: n.slice(0, Math.min(12, Math.max(1, t.limit))).map(({ memory: r }) => ({ id: r.id, title: r.title, date: r.date, excerpt: r.sources.filter((i) => i.origin === "user").map((i) => i.text).join(`
`).slice(0, 500) })), total: n.length, searched: e.length };
}
const Tl = { list: async () => {
  var e, t;
  return await ((e = window.LuminaRecords) == null ? void 0 : e.ready), (((t = window.LuminaRecords) == null ? void 0 : t.list()) ?? []).map(vr);
} };
function El() {
  const e = (/* @__PURE__ */ new Date()).getFullYear() - 1;
  return [
    { id: "synthetic-rain", ts: `${e}-09-18T18:00:00+08:00`, note: "傍晚在河边看晚霞。刚坐下就下雨了，我在桥下等雨停。" },
    { id: "synthetic-friend", ts: `${e}-09-25T18:00:00+08:00`, note: "今天和小林去了河边看晚霞。全程晴天，没有下雨。我们沿河走回家。" },
    { id: "synthetic-coffee", ts: `${e}-10-02T14:00:00+08:00`, note: "下午和小林在咖啡店聊天，没有去河边。" }
  ].map(vr);
}
const Il = {
  class: "er-workspace",
  "aria-label": "证据回忆工作台"
}, Ml = { class: "er-intro" }, Al = ["disabled"], Ol = {
  key: 0,
  class: "er-demo",
  role: "note"
}, Rl = { class: "er-search-row" }, Pl = ["disabled"], Fl = ["disabled"], $l = {
  class: "er-stage",
  role: "status",
  "aria-live": "polite"
}, Dl = {
  key: 1,
  class: "er-error",
  role: "alert"
}, Nl = {
  key: 2,
  class: "er-verdict"
}, Ll = {
  key: 3,
  class: "er-grid"
}, jl = { class: "er-panel er-clues" }, Hl = ["aria-pressed", "onClick"], Vl = {
  key: 0,
  class: "er-corrections"
}, Kl = { class: "er-panel er-candidates" }, Ul = {
  key: 0,
  class: "er-hint"
}, Bl = ["aria-pressed", "onClick"], kl = { class: "er-date" }, Wl = { class: "er-hint" }, ql = ["data-status"], Jl = { class: "er-panel er-evidence" }, Yl = { class: "er-date" }, Gl = ["data-status"], zl = {
  key: 0,
  class: "er-hint"
}, Ql = { class: "er-original" }, Xl = { key: 0 }, Zl = { key: 0 }, eo = {
  key: 1,
  class: "er-hint"
}, to = {
  key: 1,
  class: "er-hint"
}, so = {
  key: 4,
  class: "er-refine"
}, no = { class: "er-options" }, ro = ["disabled", "onClick"], io = { class: "er-search-row" }, lo = ["disabled"], oo = ["disabled"], co = {
  key: 5,
  class: "er-trace"
}, uo = {
  key: 6,
  class: "er-hint"
}, fo = /* @__PURE__ */ di({
  __name: "Workspace",
  setup(e) {
    const t = he(""), s = he(""), n = he([]), r = he(""), i = he(!1), l = he("说说你记得的片段，线索记不准也没关系。"), c = he(""), f = he(!1), a = he(null), d = he([]), _ = he(""), S = he(""), O = he([]), F = he(null), $ = /* @__PURE__ */ new Set();
    let Q = 0;
    const R = Lt(() => d.value.find((H) => H.id === _.value)), X = Lt(() => {
      var H;
      return (((H = a.value) == null ? void 0 : H.candidates) ?? []).map((E) => ({ ...E, memory: d.value.find((Y) => Y.id === E.memoryId) })).filter((E) => E.memory);
    }), oe = { supported: "原文支持", conflict: "明确冲突", unknown: "没有足够证据" }, ie = (H) => ({ user_note: "用户原话", user_supplement: "用户补充", user_mood: "自选心情", record_date: "记录日期", image_scene: "图像分析·场景", image_light: "图像分析·光线", image_subjects: "图像分析·主体", image_text: "图像分析·文字" })[H] ?? (H.startsWith("user_turn_") ? "用户对话原话" : H), qe = Lt(() => a.value ? a.value.status === "matched" ? "一条记录与当前线索吻合" : a.value.status === "uncertain" ? "有相关记录，暂时无法确认是哪一次" : "现有记录无法确认这段经历" : ""), At = Lt(() => {
      var H;
      return (((H = a.value) == null ? void 0 : H.comparisons) ?? []).filter((E) => E.memoryId === _.value && (!S.value || E.clueId === S.value));
    });
    async function Ze(H, E, Y) {
      var te;
      const ee = new AbortController(), T = () => ee.abort();
      Y.addEventListener("abort", T, { once: !0 }), Y.aborted && ee.abort();
      const B = window.setTimeout(() => ee.abort(), 1e5);
      try {
        const G = await fetch(`/api/recall/${H}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(E), signal: ee.signal }), je = await G.json();
        if (!G.ok) throw new Error(((te = je.error) == null ? void 0 : te.message) || `请求失败（${G.status}）`);
        return je;
      } finally {
        clearTimeout(B), Y.removeEventListener("abort", T);
      }
    }
    function Oe() {
      var H;
      Q++, (H = F.value) == null || H.abort(), F.value = null, i.value = !1, l.value = "已停止。可以调整线索后重新查找。";
    }
    function Ot(H, E) {
      var Y;
      return (Y = a.value) == null ? void 0 : Y.comparisons.find((ee) => ee.memoryId === H && ee.clueId === E);
    }
    function dt(H) {
      _.value = H;
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
      const Y = ++Q;
      let ee;
      try {
        ee = f.value ? El() : await Tl.list();
      } catch {
        i.value = !1, c.value = "本地数据库未能读取，记录没有改动。请重试。";
        return;
      }
      if (Y !== Q) return;
      if (!ee.length) {
        i.value = !1, c.value = "这台设备还没有记录。先记一条，或试用合成案例。";
        return;
      }
      d.value = ee, i.value = !0, c.value = "", a.value = null, O.value = [], _.value = "", S.value = "", $.clear(), r.value = E;
      const T = new AbortController();
      F.value = T;
      const B = /* @__PURE__ */ new Date(), te = `${B.getFullYear()}-${String(B.getMonth() + 1).padStart(2, "0")}-${String(B.getDate()).padStart(2, "0")}`, G = performance.now();
      try {
        l.value = "正在理解线索，决定检索条件…";
        let ce = await Ze("start", { query: E, corrections: n.value, today: te }, T.signal);
        for (let He = 0; ce.phase === "tools"; He++) {
          if (He >= 4) throw new Error("已到检索轮数上限，请减少或调整线索后重试。");
          const Se = (ce.calls ?? []).map((ne) => {
            let ye, et;
            if (ne.name === "search_memories") {
              const ue = ne.args;
              l.value = "正在本机查找相关记录…";
              const Je = Cl(d.value, ue);
              ye = Je, et = `检索 ${Je.searched} 条，命中 ${Je.total} 条，返回 ${Je.matches.length} 条`;
            } else if (ne.name === "get_memory") {
              l.value = "正在读取候选原文…";
              const ue = d.value.find((Je) => Je.id === ne.args.id) ?? null;
              ue && $.add(ue.id), ye = { memory: ue ? { ...ue, generated: "" } : null }, et = ue ? `已读取 ${ue.date} 的记录及 ${ue.sources.length} 个来源字段` : "原始记录不存在";
            } else throw new Error("模型请求了不支持的工具。");
            return O.value.push({ name: ne.name, args: JSON.stringify(ne.args), result: et, time: Math.round(performance.now() - G) }), { callId: ne.id, result: ye };
          });
          l.value = "正在对照原文，并检查引用和语义…", ce = await Ze("continue", { sessionId: ce.sessionId, results: Se }, T.signal);
        }
        if (Y !== Q) return;
        if (!ce.result) throw new Error("没有收到完整的证据结果，请重试。");
        for (const He of ce.result.comparisons) {
          const Se = d.value.find((ne) => ne.id === He.memoryId);
          if (!$.has(He.memoryId) || !Se || He.sources.some((ne) => !Se.sources.some((ye) => ye.field === ne.field && ye.origin !== "image_model" && ye.text.includes(ne.quote))))
            throw new Error("证据与本地原文不一致，本次结果未展示。请重新查找。");
        }
        a.value = ce.result, _.value = ((je = ce.result.candidates[0]) == null ? void 0 : je.memoryId) ?? "", l.value = `已完成 ${O.value.length} 次本地工具执行；${((performance.now() - G) / 1e3).toFixed(1)} 秒。`;
      } catch (ce) {
        if (Y !== Q) return;
        c.value = T.signal.aborted ? "已停止检索。" : ce instanceof DOMException && ce.name === "AbortError" ? "请求超时，请稍后重试。" : ce instanceof Error ? ce.message : "检索失败，请稍后重试。", l.value = "这次没有生成结论，也没有修改日记。";
      } finally {
        Y === Q && (i.value = !1, F.value = null);
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
      Oe(), f.value = !f.value, a.value = null, O.value = [], n.value = [], d.value = [], _.value = "", c.value = "", t.value = f.value ? "我记得去年有次和小林在河边看晚霞，好像还下雨了。" : "", l.value = f.value ? "当前使用三条合成日记；点击查找后将真实执行模型和本地工具。" : "已切回这台设备的记录。";
    }
    return (H, E) => {
      var Y, ee;
      return P(), D("section", Il, [
        C("div", Ml, [
          E[4] || (E[4] = C("div", null, [
            C("p", { class: "er-eyebrow" }, "聊着找"),
            C("h2", null, "把记得的片段，放回原文里核对。"),
            C("p", null, "线索可以不完整，也可以改。没写下来的事，先留作未知。")
          ], -1)),
          C("button", {
            class: "er-link",
            type: "button",
            disabled: i.value,
            onClick: $t
          }, j(f.value ? "返回我的记录" : "试用合成案例"), 9, Al)
        ]),
        f.value ? (P(), D("p", Ol, "合成案例 · 仅在此工作台临时使用，不会写入、覆盖或同步你的日记。模型输出不预设。")) : pe("", !0),
        C("form", {
          class: "er-search",
          onSubmit: E[1] || (E[1] = bn((T) => Pt(!1), ["prevent"]))
        }, [
          E[5] || (E[5] = C("label", { for: "er-query" }, "你记得什么？", -1)),
          C("div", Rl, [
            Ys(C("textarea", {
              id: "er-query",
              "onUpdate:modelValue": E[0] || (E[0] = (T) => t.value = T),
              disabled: i.value,
              maxlength: "1000",
              rows: "2",
              placeholder: "记得和谁、在哪儿，或者那时的心情…"
            }, null, 8, Pl), [
              [vn, t.value]
            ]),
            C("button", {
              class: "er-primary",
              type: "submit",
              disabled: i.value
            }, j(i.value ? "正在核对…" : "查找并核对"), 9, Fl),
            i.value ? (P(), D("button", {
              key: 0,
              class: "er-link",
              type: "button",
              onClick: Oe
            }, "停止")) : pe("", !0)
          ]),
          E[6] || (E[6] = C("small", null, "检索在本机执行；匹配摘要和选中候选的文字会发送给 AI 服务核对，照片不会随本次查询上传。这里的纠正只改变线索。", -1))
        ], 32),
        C("p", $l, j(l.value), 1),
        c.value ? (P(), D("p", Dl, j(c.value), 1)) : pe("", !0),
        a.value ? (P(), D("div", Nl, [
          C("h3", null, j(qe.value), 1),
          C("p", null, "这是记录与线索的吻合情况，不能证明当时实际发生了什么。" + j(a.value.rejected ? `有 ${a.value.rejected} 项判断未通过核验，已按未知处理。` : ""), 1)
        ])) : pe("", !0),
        a.value ? (P(), D("div", Ll, [
          C("aside", jl, [
            E[8] || (E[8] = C("h3", null, "你的线索", -1)),
            E[9] || (E[9] = C("p", { class: "er-hint" }, "点选一条，查看候选与原文如何对应。", -1)),
            (P(!0), D(Z, null, Pe(a.value.clues, (T) => (P(), D("button", {
              key: T.id,
              class: St(["er-clue", { active: S.value === T.id }]),
              "aria-pressed": S.value === T.id,
              onClick: (B) => Rt(T.id)
            }, j(T.text), 11, Hl))), 128)),
            n.value.length ? (P(), D("div", Vl, [
              E[7] || (E[7] = C("h4", null, "本轮纠正", -1)),
              (P(!0), D(Z, null, Pe(n.value, (T, B) => (P(), D("p", { key: B }, j(T), 1))), 128))
            ])) : pe("", !0)
          ]),
          C("section", Kl, [
            C("h3", null, [
              E[10] || (E[10] = Vt("候选记忆 ", -1)),
              C("span", null, j(X.value.length), 1)
            ]),
            X.value.length ? pe("", !0) : (P(), D("p", Ul, "没有读到可用候选。可以删除不确定的日期或换一个场景词。")),
            (P(!0), D(Z, null, Pe(X.value, (T) => (P(), D("button", {
              key: T.memoryId,
              class: St(["er-memory", { active: _.value === T.memoryId }]),
              "aria-pressed": _.value === T.memoryId,
              onClick: (B) => dt(T.memoryId)
            }, [
              C("span", kl, j(T.memory.date), 1),
              C("strong", null, j(T.memory.title), 1),
              C("span", Wl, j(T.supported) + " 条线索有支持 · " + j(T.conflicts) + " 条明确冲突", 1),
              (P(!0), D(Z, null, Pe(a.value.clues.filter((B) => !S.value || B.id === S.value), (B) => {
                var te, G;
                return P(), D("span", {
                  key: B.id,
                  class: "er-matrix"
                }, [
                  C("span", null, j(B.text), 1),
                  C("span", {
                    class: "er-tag",
                    "data-status": ((te = Ot(T.memoryId, B.id)) == null ? void 0 : te.status) ?? "unknown"
                  }, j(oe[((G = Ot(T.memoryId, B.id)) == null ? void 0 : G.status) ?? "unknown"]), 9, ql)
                ]);
              }), 128))
            ], 10, Bl))), 128))
          ]),
          C("section", Jl, [
            E[13] || (E[13] = C("h3", null, "原始证据", -1)),
            R.value ? (P(), D(Z, { key: 0 }, [
              C("p", Yl, j(R.value.date) + " · " + j(R.value.id), 1),
              (P(!0), D(Z, null, Pe(At.value, (T) => {
                var B;
                return P(), D("article", {
                  key: T.clueId,
                  class: "er-proof"
                }, [
                  C("h4", null, j((B = a.value.clues.find((te) => te.id === T.clueId)) == null ? void 0 : B.text), 1),
                  C("span", {
                    class: "er-tag",
                    "data-status": T.status
                  }, j(oe[T.status]), 9, Gl),
                  T.status === "unknown" ? (P(), D("p", zl, "没有找到足够的原文依据。未提及，不代表没有发生。")) : pe("", !0),
                  (P(!0), D(Z, null, Pe(T.sources, (te, G) => (P(), D("blockquote", { key: G }, [
                    C("span", null, j(te.quote), 1),
                    C("cite", null, j(ie(te.field)) + " · 已核对逐字引用", 1)
                  ]))), 128))
                ]);
              }), 128)),
              C("details", Ql, [
                E[12] || (E[12] = C("summary", null, "查看这条记录的完整来源", -1)),
                (P(!0), D(Z, null, Pe(R.value.sources, (T) => (P(), D("div", {
                  key: T.field
                }, [
                  C("h4", null, [
                    Vt(j(ie(T.field)) + " ", 1),
                    T.origin === "image_model" ? (P(), D("small", Xl, "未核对的 AI 观察")) : pe("", !0)
                  ]),
                  C("p", null, j(T.text), 1)
                ]))), 128)),
                R.value.generated ? (P(), D("div", Zl, [
                  E[11] || (E[11] = C("h4", null, [
                    Vt("AI 整理 / 保存正文 "),
                    C("small", null, "不作为用户原话证据")
                  ], -1)),
                  C("p", null, j(R.value.generated), 1)
                ])) : pe("", !0),
                R.value.sources.some((T) => T.origin === "user") ? pe("", !0) : (P(), D("p", eo, "此记录缺少可用的用户原话，不能仅凭 AI 整理内容确认细节。"))
              ])
            ], 64)) : (P(), D("p", to, "选一条候选记录查看证据。"))
          ])
        ])) : pe("", !0),
        a.value ? (P(), D("section", so, [
          C("h3", null, j(((Y = a.value.clarification) == null ? void 0 : Y.question) || "有什么线索需要调整？"), 1),
          C("div", no, [
            (P(!0), D(Z, null, Pe(((ee = a.value.clarification) == null ? void 0 : ee.options) ?? [], (T, B) => (P(), D("button", {
              key: B,
              class: "er-option",
              disabled: i.value,
              onClick: (te) => Ft(T.text)
            }, j(T.label), 9, ro))), 128))
          ]),
          C("form", {
            onSubmit: E[3] || (E[3] = bn((T) => s.value.trim() && Ft(s.value.trim()), ["prevent"]))
          }, [
            E[14] || (E[14] = C("label", { for: "er-correction" }, "补充或纠正线索", -1)),
            C("div", io, [
              Ys(C("input", {
                id: "er-correction",
                "onUpdate:modelValue": E[2] || (E[2] = (T) => s.value = T),
                disabled: i.value,
                maxlength: "500",
                placeholder: "例如：更确定是小林，下雨这条先不算"
              }, null, 8, lo), [
                [vn, s.value]
              ]),
              C("button", {
                class: "er-primary",
                disabled: i.value || !s.value.trim()
              }, "调整后重新查找", 8, oo)
            ])
          ], 32),
          E[15] || (E[15] = C("p", { class: "er-hint" }, "每次调整都会重新执行检索；原始日记不会改变。", -1))
        ])) : pe("", !0),
        O.value.length ? (P(), D("details", co, [
          C("summary", null, "为什么这样判断 · 查看真实工具执行（" + j(O.value.length) + " 次）", 1),
          C("ol", null, [
            (P(!0), D(Z, null, Pe(O.value, (T, B) => (P(), D("li", { key: B }, [
              C("strong", null, j(T.name), 1),
              C("span", null, j(T.result) + " · " + j(T.time) + "ms", 1),
              C("code", null, j(T.args), 1)
            ]))), 128))
          ]),
          E[16] || (E[16] = C("p", null, "轨迹来自本次模型请求及浏览器实际执行，不是预设步骤。逐字引用校验与语义核验在结论展示前执行。", -1))
        ])) : pe("", !0),
        r.value && !a.value && !i.value && !c.value ? (P(), D("p", uo, "上次线索：" + j(r.value), 1)) : pe("", !0)
      ]);
    };
  }
}), xn = document.getElementById("evidenceWorkspace");
xn && (xl(fo).mount(xn), window.LuminaEvidence = { version: "0.1.0" });
