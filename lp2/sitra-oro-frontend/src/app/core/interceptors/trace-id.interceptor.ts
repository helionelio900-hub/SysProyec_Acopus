import { HttpInterceptorFn } from '@angular/common/http';

export const traceIdInterceptor: HttpInterceptorFn = (request, next) =>
  next(request.clone({ setHeaders: { 'X-Trace-ID': crypto.randomUUID() } }));
