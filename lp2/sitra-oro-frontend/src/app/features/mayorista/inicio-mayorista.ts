import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import {
  CentroAcopio,
  OperacionesService,
  ReporteLiquidaciones,
} from '../../core/api/operaciones.service';
import { MAYORISTA_VISTA_PREVIA } from './mayorista-preview';

@Component({
  selector: 'app-inicio-mayorista',
  imports: [RouterLink, DatePipe, MatButtonModule],
  templateUrl: './inicio-mayorista.html',
  styleUrl: './inicio-mayorista.css',
})
export class InicioMayorista implements OnInit {
  private readonly operaciones = inject(OperacionesService);
  protected readonly vistaPrevia = inject(MAYORISTA_VISTA_PREVIA);
  protected readonly reporte = signal<ReporteLiquidaciones | null>(null);
  protected readonly centros = signal<CentroAcopio[] | null>(null);
  protected readonly centrosActivos = computed(
    () => this.centros()?.filter((centro) => centro.activo).length ?? null,
  );
  protected readonly cargandoReporte = signal(true);
  protected readonly cargandoCentros = signal(true);
  protected readonly errorReporte = signal('');
  protected readonly errorCentros = signal('');
  ngOnInit(): void {
    this.operaciones.reporteLiquidaciones().subscribe({
      next: (datos) => {
        this.reporte.set(datos);
        this.cargandoReporte.set(false);
        console.info('[Mayorista] Resumen de liquidaciones cargado.');
      },
      error: (response) => {
        this.errorReporte.set(
          response.status === 403
            ? 'Tu cuenta no tiene permiso para ver liquidaciones.'
            : 'No se pudo cargar el resumen. Intenta nuevamente.',
        );
        this.cargandoReporte.set(false);
        console.error('[Mayorista] No se pudo consultar el resumen.', response.status);
      },
    });
    this.operaciones.centros().subscribe({
      next: (datos) => {
        this.centros.set(datos);
        this.cargandoCentros.set(false);
      },
      error: (response) => {
        this.errorCentros.set(
          response.status === 403
            ? 'Tu cuenta no tiene permiso para consultar los centros.'
            : 'No se pudo cargar la red de centros.',
        );
        this.cargandoCentros.set(false);
      },
    });
  }
  protected dinero(valor: number | null | undefined): string {
    return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(
      valor ?? 0,
    );
  }
}
