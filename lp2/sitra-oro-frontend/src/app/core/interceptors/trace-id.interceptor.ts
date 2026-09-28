import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const traceIdInterceptor: HttpInterceptorFn = (request, next) => {
  const router = inject(Router);
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
        error.status === 401
      ) {
        sessionStorage.removeItem('sitraoro.accessToken');
        void router.navigateByUrl('/ingresar');
      }
      return throwError(() => error);
    }),
  );
};
