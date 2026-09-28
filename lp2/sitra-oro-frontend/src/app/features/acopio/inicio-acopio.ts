import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { OperacionesService, ResumenDashboard } from '../../core/api/operaciones.service';

@Component({
  selector: 'app-inicio-acopio',
  imports: [RouterLink, MatButtonModule],
  templateUrl: './inicio-acopio.html',
  styleUrl: './inicio-acopio.css',
})
export class InicioAcopio implements OnInit {
  private readonly operaciones = inject(OperacionesService);
  protected readonly resumen = signal<ResumenDashboard | null>(null);
  protected readonly cargando = signal(true);
  protected readonly error = signal('');
  ngOnInit(): void {
    this.operaciones.dashboard().subscribe({
      next: (datos) => {
        this.resumen.set(datos);
        this.cargando.set(false);
        console.info('[Acopio] Resumen consolidado cargado.');
      },
      error: (response: HttpErrorResponse) => {
        this.error.set(
          response.status === 403
            ? 'Tu cuenta no tiene permiso para ver este resumen.'
            : 'No se pudo cargar el resumen. Intenta nuevamente.',
        );
        this.cargando.set(false);
        console.error('[Acopio] No se pudo consultar el resumen.', response.status);
      },
    });
  }
  protected dinero(valor: number | null | undefined): string {
    return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(
      valor ?? 0,
    );
  }
  protected gramos(valor: number | null | undefined): string {
    return `${new Intl.NumberFormat('es-PE', { maximumFractionDigits: 3 }).format(valor ?? 0)} g`;
  }
}
