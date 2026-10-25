import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './auth.service';

/**
 * Componente que atiende la redirección de Keycloak tras autenticación (S11 - Paso 3.4).
 */
@Component({
  selector: 'app-auth-callback',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="callback-container">
      <div class="callback-card">
        @if (cargando()) {
          <div class="spinner"></div>
          <h2>Validando sesión con Keycloak...</h2>
          <p class="subtitle">Intercambiando código de autorización mediante PKCE</p>
        } @else if (error()) {
          <div class="error-badge">⚠️ Error de autenticación</div>
          <p class="error-msg">{{ error() }}</p>
          <button (click)="reintentar()" class="btn-retry">Volver a intentar</button>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .callback-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        background: #0f172a;
        color: #f8fafc;
        font-family: system-ui, -apple-system, sans-serif;
      }
      .callback-card {
        background: #1e293b;
        border: 1px solid #334155;
        border-radius: 12px;
        padding: 2.5rem;
        max-width: 440px;
        width: 90%;
        text-align: center;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
      }
      .spinner {
        width: 48px;
        height: 48px;
        border: 4px solid #334155;
        border-top-color: #f59e0b;
        border-radius: 50%;
        margin: 0 auto 1.5rem;
        animation: spin 0.8s linear infinite;
      }
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
      h2 {
        font-size: 1.25rem;
        margin: 0 0 0.5rem;
        color: #f1f5f9;
      }
      .subtitle {
        font-size: 0.875rem;
        color: #94a3b8;
        margin: 0;
      }
      .error-badge {
        color: #ef4444;
        font-weight: 600;
        font-size: 1.1rem;
        margin-bottom: 0.75rem;
      }
      .error-msg {
        color: #cbd5e1;
        font-size: 0.875rem;
        margin-bottom: 1.5rem;
      }
      .btn-retry {
        background: #f59e0b;
        color: #0f172a;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 6px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.2s;
      }
      .btn-retry:hover {
        background: #d97706;
      }
    `,
  ],
})
export class AuthCallback implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  readonly cargando = signal<boolean>(true);
  readonly error = signal<string | null>(null);

  async ngOnInit(): Promise<void> {
    const params = this.route.snapshot.queryParams;
    const errorParam = params['error'] || params['error_description'];

    if (errorParam) {
      this.cargando.set(false);
      this.error.set(`Keycloak reportó: ${errorParam}`);
      return;
    }

    const code = params['code'];
    const state = params['state'];

    if (!code) {
      this.cargando.set(false);
      this.error.set('La URL de respuesta no incluye el parámetro code requerido.');
      return;
    }

    try {
      const rutaDestino = await this.auth.completarLogin(code, state);
      if (rutaDestino) {
        this.cargando.set(false);
        await this.router.navigateByUrl(rutaDestino);
      }
    } catch (e: unknown) {
      this.cargando.set(false);
      const msg = e instanceof Error ? e.message : 'Error desconocido al validar el código';
      this.error.set(msg);
    }
  }

  reintentar(): void {
    void this.auth.iniciarLogin();
  }
}
