import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { RolSitra, SesionService } from './sesion.service';

export const rolGuard: CanActivateFn = (route) => {
  const sesion = inject(SesionService);
  const router = inject(Router);
  const roles = route.data['roles'] as RolSitra[];
  if (sesion.puedeEntrar(roles)) return true;
  return router.createUrlTree([sesion.autenticado() ? '/sin-acceso' : '/ingresar']);
};
