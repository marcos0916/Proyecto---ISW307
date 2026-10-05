import {
  Component,
  IonApp,
  IonRouterOutlet,
  IonicRouteStrategy,
  PreloadAllModules,
  RouteReuseStrategy,
  bootstrapApplication,
  provideIonicAngular,
  provideRouter,
  setClassMetadata,
  withComponentInputBinding,
  withPreloading,
  ɵsetClassDebugInfo,
  ɵɵdefineComponent,
  ɵɵelement,
  ɵɵelementEnd,
  ɵɵelementStart
} from "./chunk-Y2I7626S.js";
import "./chunk-6Y6ZEJAK.js";
import "./chunk-KLDKUAUC.js";
import "./chunk-VYVJT42A.js";
import "./chunk-VRPLDO2N.js";
import "./chunk-NAGTPKJY.js";
import "./chunk-JM2NKB7Q.js";
import "./chunk-J3TW4DM3.js";
import "./chunk-KQQH3YTO.js";
import "./chunk-7GULNALX.js";
import "./chunk-DCSQURQB.js";
import "./chunk-DI3VEDFV.js";
import "./chunk-ZZ4OR5I3.js";

// src/app/app.routes.ts
var routes = [
  {
    path: "home",
    loadComponent: () => import("./home.page-4PFIWJUV.js").then((m) => m.HomePage)
  },
  {
    path: "",
    redirectTo: "home",
    pathMatch: "full"
  }
];

// src/app/app.component.ts
var _AppComponent = class _AppComponent {
  constructor() {
  }
};
_AppComponent.\u0275fac = function AppComponent_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || _AppComponent)();
};
_AppComponent.\u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _AppComponent, selectors: [["app-root"]], decls: 2, vars: 0, template: function AppComponent_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "ion-app");
    \u0275\u0275element(1, "ion-router-outlet");
    \u0275\u0275elementEnd();
  }
}, dependencies: [IonApp, IonRouterOutlet], encapsulation: 2 });
var AppComponent = _AppComponent;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(AppComponent, [{
    type: Component,
    args: [{ selector: "app-root", imports: [IonApp, IonRouterOutlet], template: "<ion-app>\n  <ion-router-outlet></ion-router-outlet>\n</ion-app>\n" }]
  }], () => [], null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(AppComponent, { className: "AppComponent", filePath: "src/app/app.component.ts", lineNumber: 9 });
})();

// src/main.ts
bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules), withComponentInputBinding())
  ]
});
//# sourceMappingURL=main.js.map
