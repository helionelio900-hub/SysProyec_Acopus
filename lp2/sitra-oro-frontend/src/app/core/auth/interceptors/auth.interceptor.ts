import {
  HttpContextToken,
  HttpErrorResponse,
  HttpInterceptorFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, from, switchMap, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../auth.service';

/**
 * Token de contexto HTTP para marcar peticiones ya reintentadas y prevenir bucles infinitos ante 401.
 */
export const YA_REINTENTADO = new HttpContextToken<boolean>(() => false);

/**
 * Interceptor HTTP (S11 - Paso 3.8).
 * 1. Adjunta Bearer SOLO a peticiones dirigidas al Resource Server (:8081).
 * 2. Omite Keycloak (:38081) y APIs externas (Bloomberg, Kitco, RENIEC).
 * 3. Ante error 401, ejecuta el refresco con refresh_token y reintenta UNA sola vez.
 * 4. Los errores 403 Forbidden NUNCA disparan refresco (son violaciones RBAC, no expiración de credenciales).
 */
export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);

  // Evitar inyectar token a Keycloak o endpoints de autenticación propios
  if (
    request.url.includes('/protocol/openid-connect') ||
    request.url.includes(':38081')
  ) {
    return next(request);
  }

  // Validar si la petición es para nuestro backend (no APIs externas públicas)
  const esBackendLocal =
    request.url.startsWith('/') ||
    request.url.startsWith(environment.apiBaseUrl) ||
    (Boolean(environment.backendUrl) && request.url.startsWith(environment.backendUrl));

  if (!esBackendLocal) {
    return next(request);
  }

  const token = auth.token();
  const reqConToken = token
    ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : request;

  return next(reqConToken).pipe(
    catchError((error: unknown) => {
      // 403 NUNCA dispara refresco; solo 401 Unauthorized
      if (error instanceof HttpErrorResponse && error.status === 401) {
        // Prevenir bucles infinitos: reintentar UNA sola vez por petición
        const yaReintentado = request.context.get(YA_REINTENTADO);
        if (yaReintentado) {
          void auth.iniciarLogin(window.location.pathname);
          return throwError(() => error);
        }

        // Intentar refresco automático transparente
        return from(auth.refrescar(window.location.pathname)).pipe(
          switchMap((nuevoToken) => {
            if (nuevoToken) {
              const retryContext = request.context.set(YA_REINTENTADO, true);
              const retryReq = request.clone({
                context: retryContext,
                setHeaders: { Authorization: `Bearer ${nuevoToken}` },
              });
              return next(retryReq);
            }
            // Si el refresco falló, manda a login preservando destino
            void auth.iniciarLogin(window.location.pathname);
            return throwError(() => error);
          }),
          catchError((refreshErr) => {
            void auth.iniciarLogin(window.location.pathname);
            return throwError(() => refreshErr);
          }),
        );
      }
      return throwError(() => error);
    }),
  );
};
