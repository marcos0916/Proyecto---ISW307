// jeep-sqlite/loader trae su propia app de Stencil completa, que choca con el runtime
// de Stencil que ya usan los componentes de Ionic (pantalla en blanco + NG0203 en
// `ng serve`). Se registra el componente directo contra el mismo runtime liviano
// (@stencil/core/internal/client) que usa @ionic/angular, sin esa app duplicada.
import { JeepSqlite } from 'jeep-sqlite/dist/components/jeep-sqlite';

if (!customElements.get('jeep-sqlite')) {
  customElements.define('jeep-sqlite', JeepSqlite);
}

import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withComponentInputBinding, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules), withComponentInputBinding()),
  ],
});
