import { Routes } from '@angular/router';

// Rutas planas a propósito: NO se usa <ion-tabs> envolviendo un
// <ion-router-outlet> anidado. Esa combinación produce un bug reproducible
// en esta versión de Ionic/Angular (un <ion-router-outlet> huérfano queda
// flotando encima del contenido y bloquea todo clic/scroll — confirmado con
// y sin zone.js, así que no es un tema de change detection). La barra de
// tabs vive en app.component y navega con routerLink contra estas rutas.
export const routes: Routes = [
  {
    path: 'inicio',
    loadComponent: () => import('./pages/noticias/noticias.page').then(m => m.NoticiasPage),
  },
  // Pendiente: módulo de tareas vive en feature/modulo-2-tareas, todavía no mergeado a esta rama.
  // {
  //   path: 'tareas',
  //   loadComponent: () => import('./pages/tareas/tareas.page').then(m => m.TareasPage),
  // },
  {
    path: 'campus',
    loadComponent: () => import('./home/home.page').then(m => m.HomePage),
  },
  // "Podcasts" le pertenece al Módulo 4 (Multimedia + Cámara, Estudiante D),
  // que todavía no está mergeado. Bluetooth/NFC es parte del Módulo 5 (el
  // mismo estudiante de Perfil), así que vive dentro de /configuracion como
  // una sección más, no como tab propio.
  {
    path: 'configuracion',
    loadComponent: () => import('./perfil/perfil.page').then(m => m.PerfilPage),
  },
  {
    path: '',
    redirectTo: 'inicio',
    pathMatch: 'full',
  },
];
