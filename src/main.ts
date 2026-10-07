import { importProvidersFrom } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { IonicStorageModule } from '@ionic/storage-angular';
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
