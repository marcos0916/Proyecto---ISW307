import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'perfil',
    loadComponent: () => import('./perfil/perfil.page').then((m) => m.PerfilPage),
  },
  {
    path: 'bluetooth',
    loadComponent: () => import('./bluetooth/bluetooth.page').then((m) => m.BluetoothPage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
];