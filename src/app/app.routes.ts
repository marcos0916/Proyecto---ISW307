import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'inicio',
    loadComponent: () => import('./pages/noticias/noticias.page').then(m => m.NoticiasPage),
  },
  {
    path: 'tareas',
    loadComponent: () => import('./pages/tareas/tareas.page').then(m => m.TareasPage),
  },
  {
    path: 'campus',
    loadComponent: () => import('./home/home.page').then(m => m.HomePage),
  },
  {
    path: 'multimedia',
    loadComponent: () => import('./pages/multimedia/multimedia.page').then(m => m.MultimediaPage),
  },
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
