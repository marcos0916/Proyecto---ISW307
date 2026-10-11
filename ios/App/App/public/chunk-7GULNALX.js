// node_modules/@ionic/core/components/p-Dojwmvde.js
/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */
var r = (r2) => {
  for (let t2 = r2; t2; t2 = t2.parentElement) {
    const r3 = t2.getAttribute("dir")?.toLowerCase();
    if ("rtl" === r3) return true;
    if ("ltr" === r3) return false;
  }
  return "rtl" === document?.dir?.toLowerCase();
};

// node_modules/@ionic/core/components/p-C09TXohi.js
/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */
var t = (a, i) => {
  a.componentOnReady ? a.componentOnReady().then(((a2) => i(a2))) : m((() => i(a)));
};
var n = (a) => void 0 !== a.componentOnReady;
var o = (a, i = []) => {
  const r2 = {};
  return i.forEach(((i2) => {
    a.hasAttribute(i2) && (null !== a.getAttribute(i2) && (r2[i2] = a.getAttribute(i2)), a.removeAttribute(i2));
  })), r2;
};
var s = ["role", "aria-activedescendant", "aria-atomic", "aria-autocomplete", "aria-braillelabel", "aria-brailleroledescription", "aria-busy", "aria-checked", "aria-colcount", "aria-colindex", "aria-colindextext", "aria-colspan", "aria-controls", "aria-current", "aria-describedby", "aria-description", "aria-details", "aria-disabled", "aria-errormessage", "aria-expanded", "aria-flowto", "aria-haspopup", "aria-hidden", "aria-invalid", "aria-keyshortcuts", "aria-label", "aria-labelledby", "aria-level", "aria-live", "aria-multiline", "aria-multiselectable", "aria-orientation", "aria-owns", "aria-placeholder", "aria-posinset", "aria-pressed", "aria-readonly", "aria-relevant", "aria-required", "aria-roledescription", "aria-rowcount", "aria-rowindex", "aria-rowindextext", "aria-rowspan", "aria-selected", "aria-setsize", "aria-sort", "aria-valuemax", "aria-valuemin", "aria-valuenow", "aria-valuetext"];
var l = (a) => o(a, s);
var u = (a, i, r2, e) => a.addEventListener(i, r2, e);
var d = (a, i, r2, e) => a.removeEventListener(i, r2, e);
var c = (a, i = a) => a.shadowRoot || i;
var m = (a) => "function" == typeof __zone_symbol__requestAnimationFrame ? __zone_symbol__requestAnimationFrame(a) : "function" == typeof requestAnimationFrame ? requestAnimationFrame(a) : setTimeout(a);
var p = (a) => !!a.shadowRoot && !!a.attachShadow;
var f = (a) => {
  if (a.focus(), a.classList.contains("ion-focusable")) {
    const i = a.closest("ion-app");
    i && i.setFocus([a]);
  }
};
var b = (a, i, r2, e, t2) => {
  {
    let a2 = i.querySelector("input.aux-input");
    a2 || (a2 = i.ownerDocument.createElement("input"), a2.type = "hidden", a2.classList.add("aux-input"), i.appendChild(a2)), a2.disabled = t2, a2.name = r2, a2.value = e || "";
  }
};
var v = (a, i, r2) => Math.max(a, Math.min(i, r2));
var x = (a) => {
  if (a) {
    const i = a.changedTouches;
    if (i && i.length > 0) {
      const a2 = i[0];
      return { x: a2.clientX, y: a2.clientY };
    }
    if (void 0 !== a.pageX) return { x: a.pageX, y: a.pageY };
  }
  return { x: 0, y: 0 };
};
var T = (a, i) => {
  if (a ??= {}, i ??= {}, a === i) return true;
  const r2 = Object.keys(a);
  if (r2.length !== Object.keys(i).length) return false;
  for (const e of r2) {
    if (!(e in i)) return false;
    if (a[e] !== i[e]) return false;
  }
  return true;
};

export {
  r,
  t,
  n,
  o,
  l,
  u,
  d,
  c,
  m,
  p,
  f,
  b,
  v,
  x,
  T
};
//# sourceMappingURL=chunk-7GULNALX.js.map
