import {
  c,
  l
} from "./chunk-6Y6ZEJAK.js";
import {
  t
} from "./chunk-7GULNALX.js";
import {
  J,
  z
} from "./chunk-DCSQURQB.js";
import "./chunk-ZZ4OR5I3.js";

// node_modules/@ionic/core/components/p-BT9-hMMz.js
/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */
var n = () => {
  const n2 = window;
  n2.addEventListener("statusTap", (() => {
    z((() => {
      const o = document.elementFromPoint(n2.innerWidth / 2, n2.innerHeight / 2);
      if (!o) return;
      const e = l(o);
      e && new Promise(((o2) => t(e, o2))).then((() => {
        J((async () => {
          e.style.setProperty("--overflow", "hidden"), await c(e, 300), e.style.removeProperty("--overflow");
        }));
      }));
    }));
  }));
};
export {
  n as startStatusTap
};
//# sourceMappingURL=p-BT9-hMMz-GE5KPEWB.js.map
