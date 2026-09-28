import { Injectable, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { inject } from '@angular/core';

export type RolSitra = 'MINERO' | 'G2_ACOPIADOR' | 'G1_MAYORISTA';

interface TokenPayload {
  sub?: string;
  roles?: string[];
  exp?: number;
}

@Injectable({ providedIn: 'root' })
export class SesionService {
  private readonly router = inject(Router);
  private readonly tokenActual = signal(this.tokenGuardado());
  readonly rol = computed(() => this.leerPayload()?.roles?.[0] as RolSitra | undefined);
  readonly documento = computed(() => this.leerPayload()?.sub ?? '');
  readonly autenticado = computed(() => !!this.tokenActual() && !this.tokenVencido());

  guardar(token: string): void {
    sessionStorage.setItem('sitraoro.accessToken', token);
    this.tokenActual.set(token);
  }

  cerrar(): void {
    sessionStorage.removeItem('sitraoro.accessToken');
    this.tokenActual.set(null);
    void this.router.navigateByUrl('/');
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
}
