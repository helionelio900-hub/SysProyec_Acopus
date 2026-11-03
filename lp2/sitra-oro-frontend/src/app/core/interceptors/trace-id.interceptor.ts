import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

/**
 * Interceptor para inyectar trazabilidad X-Trace-ID a cada petición hacia el backend.
 * Omite Keycloak y APIs externas públicas (Binance, Kitco, SUNAT) para prevenir fallos de CORS preflight.
 */
export const traceIdInterceptor: HttpInterceptorFn = (request, next) => {
  if (request.url.includes('/protocol/openid-connect') || request.url.includes(':38081')) {
    return next(request);
  }

  const esBackendLocal =
    request.url.startsWith('/') ||
    request.url.startsWith(environment.apiBaseUrl) ||
    (Boolean(environment.backendUrl) && request.url.startsWith(environment.backendUrl));

  if (!esBackendLocal) {
    return next(request);
  }

  return next(request.clone({ setHeaders: { 'X-Trace-ID': crypto.randomUUID() } }));
};
