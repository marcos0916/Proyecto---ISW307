import { importProvidersFrom } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { IonicStorageModule } from '@ionic/storage-angular';

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
import { defineCustomElements as definePwaElements } from '@ionic/pwa-elements/loader';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';

// Registra <pwa-action-sheet> / <pwa-camera-modal> / etc., que @capacitor/camera
// usa en el navegador (source: Prompt) para dejar elegir entre cámara y galería.
// Sin esto, el botón "Cambiar foto" no hacía nada: el elemento se creaba pero
// nadie lo sabía renderizar, así que la promesa de Camera.getPhoto() quedaba
// esperando una selección que nunca iba a llegar.
definePwaElements(window);

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    importProvidersFrom(IonicStorageModule.forRoot()),
    provideHttpClient(),
    provideRouter(routes, withPreloading(PreloadAllModules), withComponentInputBinding()),
  ],
});
