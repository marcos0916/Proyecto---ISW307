import {
  n
} from "./chunk-JM2NKB7Q.js";
import {
  r,
  v
} from "./chunk-7GULNALX.js";
import "./chunk-DCSQURQB.js";
import "./chunk-ZZ4OR5I3.js";

// node_modules/@ionic/core/components/p-CWuIRJQN.js
/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */
var s = (s2, e, n2, a, c) => {
  const i = s2.ownerDocument.defaultView;
  let p = r(s2);
  const m = (t) => p ? -t.deltaX : t.deltaX;
  return n({ el: s2, gestureName: "goback-swipe", gesturePriority: 101, threshold: 10, canStart: (t) => (p = r(s2), ((t2) => {
    const { startX: o } = t2;
    return p ? o >= i.innerWidth - 50 : o <= 50;
  })(t) && e()), onStart: n2, onMove: (t) => {
    const o = m(t);
    a(o / i.innerWidth);
  }, onEnd: (o) => {
    const r2 = m(o), s3 = i.innerWidth, e2 = r2 / s3, n3 = ((t) => p ? -t.velocityX : t.velocityX)(o), a2 = n3 >= 0 && (n3 > 0.2 || r2 > s3 / 2), f = (a2 ? 1 - e2 : e2) * s3;
    let h = 0;
    if (f > 5) {
      const t = f / Math.abs(n3);
      h = Math.min(t, 540);
    }
    c(a2, e2 <= 0 ? 0.01 : v(0, e2, 0.9999), h);
  } });
};
export {
  s as createSwipeBackGesture
};
//# sourceMappingURL=p-CWuIRJQN-LUMEAKED.js.map
