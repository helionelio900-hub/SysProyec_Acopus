import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./core/layout/layout').then((m) => m.Layout),
    children: [
      { path: '', title: 'Inicio | SITRA-ORO', loadComponent: () => import('./core/inicio/inicio').then((m) => m.Inicio) },
      { path: 'acopio/mineros', title: 'Mineros | SITRA-ORO', loadComponent: () => import('./features/acopio/mineros/minero-list').then((m) => m.MineroList) },
      { path: 'acopio/mineros/nuevo', title: 'Registrar minero | SITRA-ORO', loadComponent: () => import('./features/acopio/mineros/minero-form').then((m) => m.MineroForm) },
      { path: 'acopio/mineros/:id/editar', title: 'Editar minero | SITRA-ORO', loadComponent: () => import('./features/acopio/mineros/minero-form').then((m) => m.MineroForm) },
    ],
  },
  { path: '**', redirectTo: '' },
];
