import { Injectable, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { inject } from '@angular/core';

export type RolSitra = 'MINERO' | 'G2_ACOPIADOR' | 'G1_MAYORISTA';

interface TokenPayload {
  sub?: string;
  roles?: string[];
  exp?: number;
  realm_access?: {
    roles?: string[];
  };
  documentoIdentidad?: string;
  preferred_username?: string;
  name?: string;
}

@Injectable({ providedIn: 'root' })
export class SesionService {
  private readonly router = inject(Router);
  private readonly tokenActual = signal(this.tokenGuardado());
  private temporizadorExpiracion: ReturnType<typeof setTimeout> | null = null;
  readonly rol = computed<RolSitra | undefined>(() => {
    const payload = this.leerPayload();
    if (!payload) return undefined;
    const lista = [...(payload.roles ?? []), ...(payload.realm_access?.roles ?? [])];
    if (lista.some((r) => r === 'G1_MAYORISTA' || r === 'Mayorista')) return 'G1_MAYORISTA';
    if (lista.some((r) => r === 'G2_ACOPIADOR' || r === 'acopiador')) return 'G2_ACOPIADOR';
    if (lista.some((r) => r === 'MINERO' || r === 'Minero')) return 'MINERO';
    return undefined;
  });
  readonly documento = computed(
    () => this.leerPayload()?.documentoIdentidad ?? this.leerPayload()?.sub ?? '',
  );
  readonly nombreUsuario = computed(
    () =>
      this.leerPayload()?.preferred_username ??
      this.leerPayload()?.name ??
      this.documento(),
  );
  readonly autenticado = computed(() => !!this.tokenActual() && !this.tokenVencido());

  constructor() {
    this.programarExpiracion();
  }

  guardar(token: string): void {
    sessionStorage.setItem('sitraoro.accessToken', token);
    this.tokenActual.set(token);
    this.programarExpiracion();
  }

  cerrar(): void {
    this.cancelarTemporizador();
    sessionStorage.removeItem('sitraoro.accessToken');
    this.tokenActual.set(null);
    void this.router.navigateByUrl('/');
  }

  expirar(): void {
    this.cancelarTemporizador();
    sessionStorage.removeItem('sitraoro.accessToken');
    this.tokenActual.set(null);
    void this.router.navigateByUrl('/ingresar');
  }

  puedeEntrar(roles: readonly RolSitra[]): boolean {
    return this.autenticado() && !!this.rol() && roles.includes(this.rol()!);
  }

  private tokenGuardado(): string | null {
    return typeof sessionStorage === 'undefined'
      ? null
      : sessionStorage.getItem('sitraoro.accessToken');
  }

  private leerPayload(): TokenPayload | null {
    const token = this.tokenActual();
    if (!token) return null;
    try {
      const parte = token.split('.')[1];
      if (!parte) return null;
      const base64 = parte.replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(
        decodeURIComponent(
          Array.from(atob(base64))
            .map((letra) => `%${letra.charCodeAt(0).toString(16).padStart(2, '0')}`)
            .join(''),
        ),
      ) as TokenPayload;
    } catch {
      return null;
    }
  }

  private tokenVencido(): boolean {
    const exp = this.leerPayload()?.exp;
    return !exp || exp * 1000 <= Date.now();
  }

  private programarExpiracion(): void {
    this.cancelarTemporizador();
    if (!this.tokenActual()) return;
    const exp = this.leerPayload()?.exp;
    const restante = exp ? exp * 1000 - Date.now() : 0;
    if (restante <= 0) {
      if (typeof sessionStorage !== 'undefined') sessionStorage.removeItem('sitraoro.accessToken');
      this.tokenActual.set(null);
      return;
    }
    this.temporizadorExpiracion = setTimeout(() => this.expirar(), Math.min(restante, 2_147_483_647));
  }

  private cancelarTemporizador(): void {
    if (this.temporizadorExpiracion) clearTimeout(this.temporizadorExpiracion);
    this.temporizadorExpiracion = null;
  }
}
