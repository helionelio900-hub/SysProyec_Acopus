import { isDevMode } from '@angular/core';
import { Routes } from '@angular/router';
import { rolGuard } from './core/auth/rol.guard';
import { OperacionesService } from './core/api/operaciones.service';
import {
  MAYORISTA_VISTA_PREVIA,
  MayoristaPreviewService,
} from './features/mayorista/mayorista-preview';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'SITRA-ORO | Tu oro, tu decisión',
    loadComponent: () => import('./core/inicio/inicio').then((m) => m.Inicio),
  },
  {
    path: 'minero/registro',
    title: 'Crear cuenta | SITRA-ORO',
    loadComponent: () => import('./features/minero/cuenta-minero').then((m) => m.CuentaMinero),
    data: { modo: 'registro' },
  },
  {
    path: 'ingresar',
    title: 'Iniciar sesión | SITRA-ORO',
    loadComponent: () => import('./features/minero/cuenta-minero').then((m) => m.CuentaMinero),
    data: { modo: 'ingreso' },
  },
  { path: 'minero/ingresar', pathMatch: 'full', redirectTo: 'ingresar' },
  {
    path: 'minero/cuenta',
    title: 'Mi cuenta | SITRA-ORO',
    canActivate: [rolGuard],
    data: { roles: ['MINERO'] },
    loadComponent: () => import('./features/minero/perfil-minero').then((m) => m.PerfilMinero),
  },
  {
    path: 'sin-acceso',
    title: 'Acceso restringido | SITRA-ORO',
    loadComponent: () => import('./core/layout/sin-acceso').then((m) => m.SinAcceso),
  },
  {
    path: 'vista-previa/mayorista',
    canMatch: [() => isDevMode()],
    providers: [
      { provide: OperacionesService, useClass: MayoristaPreviewService },
      { provide: MAYORISTA_VISTA_PREVIA, useValue: true },
    ],
    loadComponent: () =>
      import('./features/mayorista/mayorista-preview').then((m) => m.MayoristaPreview),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'recepcion',
      },
      {
        path: 'centros',
        title: 'Vista previa centros | SITRA-ORO',
        loadComponent: () => import('./features/mayorista/centros').then((m) => m.CentrosMayorista),
      },
      {
        path: 'recepcion',
        title: 'Vista previa recepción | SITRA-ORO',
        loadComponent: () =>
          import('./features/mayorista/recepcion-mayorista').then((m) => m.RecepcionMayorista),
      },
      {
        path: 'liquidaciones',
        title: 'Vista previa liquidaciones | SITRA-ORO',
        loadComponent: () =>
          import('./features/mayorista/liquidaciones').then((m) => m.LiquidacionesMayorista),
      },
      {
        path: 'consolidacion',
        title: 'Vista previa lotes para exportación | SITRA-ORO',
        loadComponent: () =>
          import('./features/mayorista/consolidacion-mayorista').then(
            (m) => m.ConsolidacionMayorista,
          ),
      },
    ],
  },
  {
    path: '',
    loadComponent: () => import('./core/layout/layout').then((m) => m.Layout),
    canActivateChild: [rolGuard],
    children: [
      {
        path: 'acopio',
        title: 'Resumen de acopio | SITRA-ORO',
        canActivate: [rolGuard],
        data: { roles: ['G2_ACOPIADOR'] },
        loadComponent: () => import('./features/acopio/inicio-acopio').then((m) => m.InicioAcopio),
      },
      {
        path: 'acopio/mineros',
        title: 'Mineros | SITRA-ORO',
        canActivate: [rolGuard],
        data: { roles: ['G2_ACOPIADOR'] },
        loadComponent: () =>
          import('./features/acopio/mineros/minero-list').then((m) => m.MineroList),
      },
      {
        path: 'acopio/mineros/nuevo',
        title: 'Registrar minero | SITRA-ORO',
        canActivate: [rolGuard],
        data: { roles: ['G2_ACOPIADOR'] },
        loadComponent: () =>
          import('./features/acopio/mineros/minero-form').then((m) => m.MineroForm),
      },
      {
        path: 'acopio/mineros/:id/editar',
        title: 'Editar minero | SITRA-ORO',
        canActivate: [rolGuard],
        data: { roles: ['G2_ACOPIADOR'] },
        loadComponent: () =>
          import('./features/acopio/mineros/minero-form').then((m) => m.MineroForm),
      },
      {
        path: 'acopio/operaciones',
        title: 'Compras de oro | SITRA-ORO',
        canActivate: [rolGuard],
        data: { roles: ['G2_ACOPIADOR'] },
        loadComponent: () =>
          import('./features/acopio/operaciones').then((m) => m.OperacionesAcopio),
      },
      {
        path: 'acopio/solicitudes',
        title: 'Cuentas por aprobar | SITRA-ORO',
        canActivate: [rolGuard],
        data: { roles: ['G2_ACOPIADOR'] },
        loadComponent: () =>
          import('./features/acopio/solicitudes').then((m) => m.SolicitudesAcopio),
      },
      {
        path: 'mayorista',
        pathMatch: 'full',
        redirectTo: 'mayorista/recepcion',
      },
      {
        path: 'mayorista/centros',
        title: 'Centros de acopio | SITRA-ORO',
        canActivate: [rolGuard],
        data: { roles: ['G1_MAYORISTA'] },
        loadComponent: () => import('./features/mayorista/centros').then((m) => m.CentrosMayorista),
      },
      {
        path: 'mayorista/recepcion',
        title: 'Recepción y proceso | SITRA-ORO',
        canActivate: [rolGuard],
        data: { roles: ['G1_MAYORISTA'] },
        loadComponent: () =>
          import('./features/mayorista/recepcion-mayorista').then((m) => m.RecepcionMayorista),
      },
      {
        path: 'mayorista/liquidaciones',
        title: 'Liquidaciones | SITRA-ORO',
        canActivate: [rolGuard],
        data: { roles: ['G1_MAYORISTA'] },
        loadComponent: () =>
          import('./features/mayorista/liquidaciones').then((m) => m.LiquidacionesMayorista),
      },
      {
        path: 'mayorista/consolidacion',
        title: 'Lotes para exportación | SITRA-ORO',
        canActivate: [rolGuard],
        data: { roles: ['G1_MAYORISTA'] },
        loadComponent: () =>
          import('./features/mayorista/consolidacion-mayorista').then(
            (m) => m.ConsolidacionMayorista,
          ),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
