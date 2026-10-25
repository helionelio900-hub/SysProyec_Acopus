import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Interceptor para inyectar trazabilidad X-Trace-ID a cada petición hacia el backend.
 */
export const traceIdInterceptor: HttpInterceptorFn = (request, next) => {
  if (request.url.includes('/protocol/openid-connect') || request.url.includes(':38081')) {
    return next(request);
  }
  return next(request.clone({ setHeaders: { 'X-Trace-ID': crypto.randomUUID() } }));
};
