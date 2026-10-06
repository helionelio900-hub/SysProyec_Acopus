import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { SesionService } from '../auth/sesion.service';

export const traceIdInterceptor: HttpInterceptorFn = (request, next) => {
  const sesion = inject(SesionService);
  const token =
    typeof sessionStorage === 'undefined' ? null : sessionStorage.getItem('sitraoro.accessToken');
  const headers: Record<string, string> = { 'X-Trace-ID': crypto.randomUUID() };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return next(request.clone({ setHeaders: headers })).pipe(
    catchError((error: unknown) => {
      if (
        token &&
        typeof error === 'object' &&
        error !== null &&
        'status' in error &&
        error.status === 401 &&
        sessionStorage.getItem('sitraoro.accessToken') === token
      ) {
        sesion.expirar();
      }
      return throwError(() => error);
    }),
  );
};
