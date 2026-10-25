import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../auth.service';

/**
 * Guard de autenticación (S11 - Paso 3.6).
 * Verifica que el usuario tenga un token válido.
 * Si no está autenticado, almacena la URL de destino y redirige al login de Keycloak con PKCE.
 */
export const authGuard: CanActivateFn = async (route, state) => {
  const auth = inject(AuthService);

  if (auth.autenticado()) {
    return true;
  }

  // Intenta refrescar antes de forzar redirección
  if (auth.refreshToken()) {
    const nuevoToken = await auth.refrescar();
    if (nuevoToken) {
      return true;
    }
  }

  await auth.iniciarLogin(state.url);
  return false;
};
