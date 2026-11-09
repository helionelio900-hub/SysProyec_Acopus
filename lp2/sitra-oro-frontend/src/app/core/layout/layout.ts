import { Component, computed, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../auth/auth.service';

/**
 * Layout principal con menú adaptativo según rol, datos de usuario y fecha/hora en vivo (S11 - Paso 3.9).
 */
@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatButtonModule],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout implements OnInit, OnDestroy {
  private readonly auth = inject(AuthService);

  protected readonly fechaHora = signal<string>(this.obtenerFechaHora());
  private relojTimer: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    this.relojTimer = setInterval(() => {
      this.fechaHora.set(this.obtenerFechaHora());
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.relojTimer) clearInterval(this.relojTimer);
  }

  private obtenerFechaHora(): string {
    const ahora = new Date();
    return ahora.toLocaleString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  }

  protected readonly navegacion = computed(() => {
    const rol = this.auth.rol();
    if (rol === 'G2_ACOPIADOR') {
      return [
        { ruta: '/acopio', texto: 'Resumen' },
        { ruta: '/acopio/operaciones', texto: 'Compras de oro' },
        { ruta: '/acopio/caja', texto: 'Caja' },
        { ruta: '/acopio/mineros', texto: 'Mineros' },
        { ruta: '/acopio/solicitudes', texto: 'Cuentas por aprobar' },
        { ruta: '/acopio/mercado', texto: 'Mercado del oro' },
      ];
    }
    if (rol === 'G1_MAYORISTA') {
      return [
        { ruta: '/mayorista', texto: 'Resumen' },
        { ruta: '/mayorista/recepcion', texto: 'Compra al acopiador' },
        { ruta: '/mayorista/caja', texto: 'Caja y adelantos' },
        { ruta: '/mayorista/liquidaciones', texto: 'Liquidaciones' },
        { ruta: '/mayorista/consolidacion', texto: 'Lotes para exportación' },
        { ruta: '/mayorista/centros', texto: 'Centros y cuentas' },
        { ruta: '/mayorista/mercado', texto: 'Mercado del oro' },
      ];
    }
    if (rol === 'MINERO') {
      return [{ ruta: '/minero/cuenta', texto: 'Mi Cuenta de Minero' }];
    }
    return [];
  });

  protected readonly rolLabel = computed(() => {
    const r = this.auth.rol();
    if (r === 'G1_MAYORISTA') return 'Mayorista';
    if (r === 'G2_ACOPIADOR') return 'Acopiador';
    if (r === 'MINERO') return 'Minero';
    return 'Usuario';
  });

  protected readonly usuario = computed(() => this.auth.nombreUsuario());

  protected cerrarSesion(): void {
    this.auth.cerrarSesion();
  }
}
