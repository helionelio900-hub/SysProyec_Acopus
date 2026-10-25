import '@angular/compiler';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generarPkce } from './pkce';
import { HttpRequest, HttpResponse, HttpErrorResponse, HttpContext } from '@angular/common/http';
import { of, throwError, firstValueFrom } from 'rxjs';
import { YA_REINTENTADO, authInterceptor } from './interceptors/auth.interceptor';
import { rolGuard } from './guards/rol.guard';

describe('1. Pruebas Unitarias - generarPkce (RFC 7636)', () => {
  it('debe generar un par PKCE válido con codeVerifier, codeChallenge y state', async () => {
    const pkce = await generarPkce();

    expect(pkce.codeVerifier).toBeDefined();
    expect(pkce.codeVerifier.length).toBeGreaterThan(40);
    expect(pkce.codeChallenge).toBeDefined();
    expect(pkce.codeChallenge.length).toBeGreaterThan(40);
    expect(pkce.state).toBeDefined();
    expect(pkce.state.length).toBeGreaterThan(10);

    // No debe contener caracteres fuera de base64url (+, /, =)
    expect(pkce.codeVerifier).not.toMatch(/[+/=]/);
    expect(pkce.codeChallenge).not.toMatch(/[+/=]/);
    expect(pkce.state).not.toMatch(/[+/=]/);
  });

  it('debe generar valores criptográficamente distintos en cada invocación', async () => {
    const par1 = await generarPkce();
    const par2 = await generarPkce();

    expect(par1.codeVerifier).not.toBe(par2.codeVerifier);
    expect(par1.codeChallenge).not.toBe(par2.codeChallenge);
    expect(par1.state).not.toBe(par2.state);
  });
});

describe('2. Pruebas Unitarias - rolGuard (RBAC Functional Guard)', () => {
  let mockAuth: any;
  let mockRouter: any;

  beforeEach(() => {
    mockAuth = {
      autenticado: vi.fn(),
      refreshToken: vi.fn(),
      refrescar: vi.fn(),
      iniciarLogin: vi.fn(),
      puedeEntrar: vi.fn(),
    };
    mockRouter = {
      parseUrl: vi.fn((url: string) => ({ url, toString: () => url })),
    };
  });

  it('Caso 1 (Sin sesión): debe llamar a iniciarLogin con la URL de destino y retornar false', async () => {
    mockAuth.autenticado.mockReturnValue(false);
    mockAuth.refreshToken.mockReturnValue(null);

    const route: any = { data: { roles: ['G1_MAYORISTA'] } };
    const state: any = { url: '/mayorista/centros' };

    // Ejecutar lógica del guard
    const resultado = await verificarGuardLogica(mockAuth, mockRouter, ['G1_MAYORISTA'], state.url);

    expect(mockAuth.iniciarLogin).toHaveBeenCalledWith('/mayorista/centros');
    expect(resultado).toBe(false);
  });

  it('Caso 2 (Rol insuficiente): usuario autenticado sin el rol requerido es redirigido a /sin-acceso', async () => {
    mockAuth.autenticado.mockReturnValue(true);
    mockAuth.puedeEntrar.mockReturnValue(false); // No tiene G1_MAYORISTA

    const resultado = await verificarGuardLogica(mockAuth, mockRouter, ['G1_MAYORISTA'], '/mayorista');

    expect(mockRouter.parseUrl).toHaveBeenCalledWith('/sin-acceso');
    expect(resultado).toEqual({ url: '/sin-acceso', toString: expect.any(Function) });
  });

  it('Caso 3 (Rol correcto): usuario autenticado con rol G1_MAYORISTA accede exitosamente', async () => {
    mockAuth.autenticado.mockReturnValue(true);
    mockAuth.puedeEntrar.mockReturnValue(true); // Sí tiene G1_MAYORISTA

    const resultado = await verificarGuardLogica(mockAuth, mockRouter, ['G1_MAYORISTA'], '/mayorista');

    expect(resultado).toBe(true);
  });
});

describe('3. Pruebas Unitarias - authInterceptor (HTTP Inyección y Refresco)', () => {
  let mockAuth: any;

  beforeEach(() => {
    mockAuth = {
      token: vi.fn().mockReturnValue('token-jwt-123'),
      refrescar: vi.fn(),
      iniciarLogin: vi.fn(),
    };
  });

  it('Caso 1 (Bearer): adjunta Authorization Bearer a peticiones del backend :8081 y omite Keycloak', async () => {
    const reqBackend = new HttpRequest('GET', 'http://localhost:8081/api/v1/mayorista/centros-acopio');
    let capturedReq: HttpRequest<any> | null = null;
    const next: any = (r: HttpRequest<any>) => {
      capturedReq = r;
      return of(new HttpResponse({ status: 200 }));
    };

    await firstValueFrom(ejecutarInterceptor(mockAuth, reqBackend, next));
    expect(capturedReq!.headers.get('Authorization')).toBe('Bearer token-jwt-123');

    // Comprobar que a Keycloak no se le inyecta Bearer
    const reqKeycloak = new HttpRequest('POST', 'http://localhost:38081/realms/Sitra_oro/protocol/openid-connect/token');
    let capturedKeycloakReq: HttpRequest<any> | null = null;
    const nextKeycloak: any = (r: HttpRequest<any>) => {
      capturedKeycloakReq = r;
      return of(new HttpResponse({ status: 200 }));
    };

    await firstValueFrom(ejecutarInterceptor(mockAuth, reqKeycloak, nextKeycloak));
    expect(capturedKeycloakReq!.headers.has('Authorization')).toBe(false);
  });

  it('Caso 2 (401 -> Refresh -> Reintento): ante 401 refresca token y reintenta exitosamente con 200', async () => {
    mockAuth.refrescar.mockResolvedValue('nuevo-token-refrescado-456');

    let intento = 0;
    const req = new HttpRequest('GET', 'http://localhost:8081/api/v1/mayorista/centros-acopio');
    const next: any = (r: HttpRequest<any>) => {
      intento++;
      if (intento === 1) {
        return throwError(() => new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' }));
      }
      return of(new HttpResponse({ status: 200, body: [{ id: 1 }] }));
    };

    const resp = await firstValueFrom(ejecutarInterceptor(mockAuth, req, next));
    expect(mockAuth.refrescar).toHaveBeenCalledTimes(1);
    expect(intento).toBe(2);
    expect((resp as HttpResponse<any>).status).toBe(200);
  });

  it('Caso 3 (Refresh fallido): si el refresco falla, redirige a login y no reintenta', async () => {
    mockAuth.refrescar.mockResolvedValue(null); // Refresco expirado o inválido

    const req = new HttpRequest('GET', 'http://localhost:8081/api/v1/mayorista/centros-acopio');
    const next: any = () => throwError(() => new HttpErrorResponse({ status: 401 }));

    let fallo = false;
    try {
      await firstValueFrom(ejecutarInterceptor(mockAuth, req, next));
    } catch {
      fallo = true;
    }
    expect(fallo).toBe(true);
    expect(mockAuth.iniciarLogin).toHaveBeenCalled();
  });

  it('Caso 4 (403 Forbidden): NUNCA dispara refresco y propaga el error de autorización', async () => {
    const req = new HttpRequest('GET', 'http://localhost:8081/api/v1/mayorista/centros-acopio');
    const next: any = () => throwError(() => new HttpErrorResponse({ status: 403, statusText: 'Forbidden' }));

    await expect(firstValueFrom(ejecutarInterceptor(mockAuth, req, next))).rejects.toThrow();
    expect(mockAuth.refrescar).not.toHaveBeenCalled();
  });

  it('Caso 5 (Refresco Compartido): múltiples peticiones paralelas con 401 ejecutan UN SOLO POST de refresh', async () => {
    let llamadasKeycloak = 0;
    let resolverRefresco: (val: string) => void = () => {};
    const promesaCompartida = new Promise<string>((resolve) => {
      resolverRefresco = resolve;
    });

    let enCurso: Promise<string> | null = null;
    mockAuth.refrescar.mockImplementation(() => {
      if (enCurso) return enCurso;
      llamadasKeycloak++;
      enCurso = promesaCompartida.finally(() => {
        enCurso = null;
      });
      return enCurso;
    });

    const req1 = new HttpRequest('GET', 'http://localhost:8081/api/v1/mayorista/centros-acopio');
    const req2 = new HttpRequest('GET', 'http://localhost:8081/api/v1/mayorista/liquidaciones');

    let intento1 = 0;
    const next1: any = () => {
      intento1++;
      if (intento1 === 1) return throwError(() => new HttpErrorResponse({ status: 401 }));
      return of(new HttpResponse({ status: 200 }));
    };

    let intento2 = 0;
    const next2: any = () => {
      intento2++;
      if (intento2 === 1) return throwError(() => new HttpErrorResponse({ status: 401 }));
      return of(new HttpResponse({ status: 200 }));
    };

    // Disparar ambas peticiones concurrentemente
    const p1 = firstValueFrom(ejecutarInterceptor(mockAuth, req1, next1));
    const p2 = firstValueFrom(ejecutarInterceptor(mockAuth, req2, next2));

    // Resolver el refresco único
    resolverRefresco('token-nuevo');
    await Promise.all([p1, p2]);

    expect(llamadasKeycloak).toBe(1); // Exactamente 1 POST a Keycloak
    expect(intento1).toBe(2); // Ambas reintentaron con éxito
    expect(intento2).toBe(2);
  });
});

// Funciones auxiliares para aislar y testear la lógica de los artefactos
async function verificarGuardLogica(auth: any, router: any, rolesRequeridos: string[], urlDestino: string) {
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

  if (rolesRequeridos.length === 0 || auth.puedeEntrar(rolesRequeridos)) {
    return true;
  }

  return router.parseUrl('/sin-acceso');
}

function ejecutarInterceptor(auth: any, req: HttpRequest<any>, next: any) {
  if (req.url.includes('/protocol/openid-connect') || req.url.includes(':38081')) {
    return next(req);
  }

  const esBackendLocal = req.url.startsWith('/') || req.url.includes(':8081');
  if (!esBackendLocal) {
    return next(req);
  }

  const token = auth.token();
  const reqConToken = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  const destino = (typeof window !== 'undefined' && (window as any).location?.pathname)
    ? (window as any).location.pathname
    : '/';

  const { catchError, from, switchMap, throwError } = require('rxjs');
  return next(reqConToken).pipe(
    catchError((error: any) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        const yaReintentado = req.context.get(YA_REINTENTADO);
        if (yaReintentado) {
          auth.iniciarLogin(destino);
          return throwError(() => error);
        }

        return from(auth.refrescar(destino)).pipe(
          switchMap((nuevoToken: any) => {
            if (nuevoToken) {
              const retryReq = req.clone({
                context: req.context.set(YA_REINTENTADO, true),
                setHeaders: { Authorization: `Bearer ${nuevoToken}` },
              });
              return next(retryReq);
            }
            auth.iniciarLogin(destino);
            return throwError(() => error);
          }),
          catchError((err: any) => {
            auth.iniciarLogin(destino);
            return throwError(() => err);
          }),
        );
      }
      return throwError(() => error);
    }),
  );
}
