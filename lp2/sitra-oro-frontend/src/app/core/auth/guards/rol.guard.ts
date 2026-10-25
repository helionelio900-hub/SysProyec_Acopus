import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService, RolSitra } from '../auth.service';

/**
 * Guard de rol con soporte dual (S11 - Paso 3.7):
 * 1. Factoría explícita: canActivate: [rolGuard('G1_MAYORISTA')]
 * 2. Desde route.data: canActivate: [rolGuard], data: { roles: ['G2_ACOPIADOR'] }
 */
export function rolGuard(...args: unknown[]): CanActivateFn {
  // Caso 1: Angular lo invoca directamente como canActivate: [rolGuard] pasándole (route, state)
  if (args.length >= 2 && typeof args[0] === 'object' && args[0] !== null && 'routeConfig' in args[0]) {
    const route = args[0] as ActivatedRouteSnapshot;
    const state = args[1] as RouterStateSnapshot;
    return () => verificarRol(route.data?.['roles'] as RolSitra[] | undefined, state?.url);
  }

  // Caso 2: Se usa como factoría: rolGuard('G1_MAYORISTA', ...)
  const roles = args as RolSitra[];
  return (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const rolesParaVerificar = roles.length > 0 ? roles : (route.data?.['roles'] as RolSitra[] | undefined);
    return verificarRol(rolesParaVerificar, state?.url);
  };
}

async function verificarRol(
  rolesRequeridos?: readonly RolSitra[],
  urlDestino?: string,
): Promise<boolean | UrlTree> {
  const auth = inject(AuthService);
  const router = inject(Router);

  // 1. Si no está autenticado, intentar refresco automático o redirigir preservando destino
  if (!auth.autenticado()) {
    if (auth.refreshToken()) {
      const refreshed = await auth.refrescar(urlDestino);
      if (!refreshed) {
        await auth.iniciarLogin(urlDestino);
        return false;
      }
    } else {
      await auth.iniciarLogin(urlDestino);
      return false;
    }
  }

  // 2. Si no hay roles restringidos, permitir acceso
  if (!rolesRequeridos || rolesRequeridos.length === 0 || auth.puedeEntrar(rolesRequeridos)) {
    return true;
  }

  // 3. Autenticado pero sin el rol requerido -> acceso restringido
  return router.parseUrl('/sin-acceso');
}
