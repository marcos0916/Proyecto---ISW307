import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'tareas',
    pathMatch: 'full',
  },
  {
    path: 'tareas',
    loadComponent: () => import('./pages/tareas/tareas.page').then( m => m.TareasPage)
  },
];
