import { Injectable, computed, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { generarPkce } from './pkce';

export type RolSitra = 'MINERO' | 'G2_ACOPIADOR' | 'G1_MAYORISTA';

export interface UsuarioSesion {
  sub: string;
  preferred_username: string;
  name?: string;
  email?: string;
  documentoIdentidad?: string;
  roles: string[];
  rolSitra?: RolSitra;
  exp: number;
}

const STORAGE_KEY_VERIFIER = 'sitraoro.pkce_verifier';
const STORAGE_KEY_STATE = 'sitraoro.oauth_state';
const STORAGE_KEY_DESTINO = 'sitraoro.destino_pendiente';

/**
 * Decodifica el payload JWT usando atob nativo UTF-8 (S11 - Paso 3.5).
 */
export function decodificarJwtPayload(token: string | null): UsuarioSesion | null {
  if (!token) return null;
  try {
    const parte = token.split('.')[1];
    if (!parte) return null;
    const base64 = parte.replace(/-/g, '+').replace(/_/g, '/');
    const jsonStr = decodeURIComponent(
      Array.from(atob(base64))
        .map((c) => `%${c.charCodeAt(0).toString(16).padStart(2, '0')}`)
        .join(''),
    );
    const payload = JSON.parse(jsonStr);

    const rolesRaw: string[] = [
      ...(payload.roles ?? []),
      ...(payload.realm_access?.roles ?? []),
    ];

    let rolSitra: RolSitra | undefined;
    if (rolesRaw.some((r) => r === 'G1_MAYORISTA' || r === 'Mayorista')) {
      rolSitra = 'G1_MAYORISTA';
    } else if (rolesRaw.some((r) => r === 'G2_ACOPIADOR' || r === 'acopiador')) {
      rolSitra = 'G2_ACOPIADOR';
    } else if (rolesRaw.some((r) => r === 'MINERO' || r === 'Minero')) {
      rolSitra = 'MINERO';
    }

    return {
      sub: payload.sub ?? '',
      preferred_username: payload.preferred_username ?? '',
      name: payload.name,
      email: payload.email,
      documentoIdentidad: payload.documentoIdentidad,
      roles: rolesRaw,
      rolSitra,
      exp: payload.exp ?? 0,
    };
  } catch {
    return null;
  }
}

/**
 * AuthService completo con Authorization Code + PKCE, refresco y logout (S11 - Paso 3.3 y 3.5).
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly router = inject(Router);

  // Tokens viven ÚNICAMENTE en memoria volátil de Angular Signals (Cero almacenamiento en disco/storage)
  readonly token = signal<string | null>(null);
  readonly refreshToken = signal<string | null>(null);

  private promesaRefrescoEnCurso: Promise<string | null> | null = null;

  readonly usuario = computed<UsuarioSesion | null>(() => decodificarJwtPayload(this.token()));
  readonly rol = computed<RolSitra | undefined>(() => this.usuario()?.rolSitra);
  readonly roles = computed<string[]>(() => this.usuario()?.roles ?? []);

  readonly documento = computed<string>(
    () => this.usuario()?.documentoIdentidad ?? this.usuario()?.sub ?? '',
  );

  readonly nombreUsuario = computed<string>(() => {
    const u = this.usuario();
    if (!u) return '';
    if (u.name && u.name.trim().length > 0) return u.name;
    if (u.documentoIdentidad) return `DNI ${u.documentoIdentidad}`;
    const pref = u.preferred_username;
    if (pref && !pref.includes('demo')) return pref;
    return this.documento() ? `DNI ${this.documento()}` : (pref ?? '');
  });

  readonly autenticado = computed<boolean>(() => {
    const u = this.usuario();
    const t = this.token();
    if (!u || !t || typeof u.exp !== 'number') return false;
    return u.exp * 1000 > Date.now();
  });

  /**
   * Inicia el flujo Authorization Code con PKCE redirigiendo a Keycloak (Paso 3.3).
   * Almacena verifier y state de forma efímera durante la redirección.
   */
  async iniciarLogin(destino?: string): Promise<void> {
    const { codeVerifier, codeChallenge, state } = await generarPkce();

    sessionStorage.setItem(STORAGE_KEY_VERIFIER, codeVerifier);
    sessionStorage.setItem(STORAGE_KEY_STATE, state);
    if (destino) {
      sessionStorage.setItem(STORAGE_KEY_DESTINO, destino);
    } else {
      sessionStorage.removeItem(STORAGE_KEY_DESTINO);
    }

    const keycloak = environment.keycloak;
    const params = new URLSearchParams({
      client_id: keycloak.clientId,
      response_type: 'code',
      redirect_uri: keycloak.redirectUri,
      scope: keycloak.scope,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      state: state,
    });

    window.location.href = `${keycloak.issuer}/protocol/openid-connect/auth?${params.toString()}`;
  }

  /**
   * Procesa el código devuelto por Keycloak en /auth/callback e intercambia por tokens (Paso 3.3/3.4).
   * Validación estricta de state y manejo de errores de Keycloak.
   */
  async completarLogin(code: string, state?: string | null): Promise<string> {
    const stateEsperado = sessionStorage.getItem(STORAGE_KEY_STATE);
    sessionStorage.removeItem(STORAGE_KEY_STATE);

    // Chequeo de state ESTRICTO: si falta o no coinciden, rechazar
    if (!stateEsperado || !state || stateEsperado !== state) {
      this.limpiar();
      throw new Error('Estado OAuth2 inválido o posible intento de CSRF: state no coincide o ausente');
    }

    const codeVerifier = sessionStorage.getItem(STORAGE_KEY_VERIFIER);
    sessionStorage.removeItem(STORAGE_KEY_VERIFIER);
    if (!codeVerifier) {
      this.limpiar();
      throw new Error('Código verifier de PKCE no encontrado en el contexto de sesión');
    }

    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: environment.keycloak.clientId,
      redirect_uri: environment.keycloak.redirectUri,
      code: code,
      code_verifier: codeVerifier,
    });

    const resp = await fetch(`${environment.keycloak.issuer}/protocol/openid-connect/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    if (!resp.ok) {
      this.limpiar();
      let detalle = `${resp.status} ${resp.statusText}`;
      try {
        const errJson = await resp.json();
        detalle = errJson.error_description || errJson.error || detalle;
      } catch {
        const errText = await resp.text();
        if (errText) detalle = errText;
      }
      throw new Error(`Keycloak rechazó el intercambio de código PKCE: ${detalle}`);
    }

    const data = await resp.json();
    this.guardarTokens(data.access_token, data.refresh_token);

    const destino = sessionStorage.getItem(STORAGE_KEY_DESTINO);
    sessionStorage.removeItem(STORAGE_KEY_DESTINO);
    if (destino) return destino;

    return this.rutaPorDefectoSegunRol();
  }

  /**
   * Refresca el access_token usando el refresh_token guardado (Paso 3.3).
   * Implementa una única promesa compartida: múltiples 401 concurrentes esperan el mismo refresco.
   */
  async refrescar(destino?: string): Promise<string | null> {
    const refresh = this.refreshToken();
    if (!refresh) {
      this.limpiar();
      return null;
    }

    if (this.promesaRefrescoEnCurso) {
      return this.promesaRefrescoEnCurso;
    }

    this.promesaRefrescoEnCurso = (async () => {
      try {
        const body = new URLSearchParams({
          grant_type: 'refresh_token',
          client_id: environment.keycloak.clientId,
          refresh_token: refresh,
        });

        const resp = await fetch(`${environment.keycloak.issuer}/protocol/openid-connect/token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: body.toString(),
        });

        if (!resp.ok) {
          this.limpiar();
          if (destino) {
            void this.iniciarLogin(destino);
          }
          return null;
        }

        const data = await resp.json();
        this.guardarTokens(data.access_token, data.refresh_token ?? refresh);
        return data.access_token as string;
      } catch {
        this.limpiar();
        if (destino) {
          void this.iniciarLogin(destino);
        }
        return null;
      } finally {
        this.promesaRefrescoEnCurso = null;
      }
    })();

    return this.promesaRefrescoEnCurso;
  }

  /**
   * Cierra sesión localmente y en el SSO de Keycloak (Paso 3.3).
   */
  cerrarSesion(): void {
    this.limpiar();
    const keycloak = environment.keycloak;
    const logoutUrl = `${keycloak.issuer}/protocol/openid-connect/logout?post_logout_redirect_uri=${encodeURIComponent(
      window.location.origin,
    )}&client_id=${encodeURIComponent(keycloak.clientId)}`;
    window.location.href = logoutUrl;
  }

  /**
   * Valida si el usuario actual posee alguno de los roles requeridos.
   */
  puedeEntrar(rolesRequeridos: readonly RolSitra[]): boolean {
    const r = this.rol();
    return this.autenticado() && !!r && rolesRequeridos.includes(r);
  }

  guardarTokens(accessToken: string, refreshToken?: string): void {
    // Tokens viven EXCLUSIVAMENTE en memoria volátil de Signals
    this.token.set(accessToken);
    if (refreshToken) {
      this.refreshToken.set(refreshToken);
    }
  }

  limpiar(): void {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(STORAGE_KEY_VERIFIER);
      sessionStorage.removeItem(STORAGE_KEY_STATE);
      sessionStorage.removeItem(STORAGE_KEY_DESTINO);
    }
    this.token.set(null);
    this.refreshToken.set(null);
  }

  rutaPorDefectoSegunRol(): string {
    const r = this.rol();
    if (r === 'G1_MAYORISTA') return '/mayorista';
    if (r === 'G2_ACOPIADOR') return '/acopio';
    if (r === 'MINERO') return '/minero/cuenta';
    return '/';
  }
}
