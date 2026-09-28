import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { SesionService } from '../auth/sesion.service';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatButtonModule],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout {
  private readonly sesion = inject(SesionService);
  protected readonly navegacion = computed(() =>
    this.sesion.rol() === 'G2_ACOPIADOR'
      ? [
          { ruta: '/acopio', texto: 'Resumen' },
          { ruta: '/acopio/operaciones', texto: 'Compras de oro' },
          { ruta: '/acopio/mineros', texto: 'Mineros' },
          { ruta: '/acopio/solicitudes', texto: 'Cuentas por aprobar' },
        ]
      : [
          { ruta: '/mayorista/recepcion', texto: 'Compra al acopiador' },
          { ruta: '/mayorista/consolidacion', texto: 'Lotes para exportación' },
          { ruta: '/mayorista/centros', texto: 'Centros y cuentas' },
        ],
  );
  protected readonly rolLabel = computed(() =>
    this.sesion.rol() === 'G2_ACOPIADOR' ? 'Acopiador' : 'Mayorista',
  );
  protected cerrarSesion(): void {
    this.sesion.cerrar();
  }
}
