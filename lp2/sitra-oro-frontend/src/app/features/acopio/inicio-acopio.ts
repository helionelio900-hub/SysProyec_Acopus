import { Component, OnInit, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { OperacionesService, ResumenDashboard } from '../../core/api/operaciones.service';
import { MarketCotizacionesService } from '../../core/api/market-cotizaciones.service';
import { MarketChart } from './market-chart';

@Component({
  selector: 'app-inicio-acopio',
  imports: [RouterLink, DecimalPipe, MatButtonModule, MatProgressBarModule, MatChipsModule, MarketChart],
  templateUrl: './inicio-acopio.html',
  styleUrl: './inicio-acopio.css',
})
export class InicioAcopio implements OnInit {
  private readonly operaciones = inject(OperacionesService);
  protected readonly market = inject(MarketCotizacionesService);

  protected readonly resumen = signal<ResumenDashboard | null>(null);
  protected readonly cargando = signal(true);
  protected readonly error = signal('');

  protected readonly horaActual = signal(
    new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  );

  protected readonly fechaActual = new Date().toLocaleDateString('es-PE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  ngOnInit(): void {
    // Reloj digital en vivo para terminal
    setInterval(() => {
      this.horaActual.set(
        new Date().toLocaleTimeString('es-PE', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
      );
    }, 1000);

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
    return `${new Intl.NumberFormat('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(valor ?? 0)} g`;
  }

  protected porcentajeRojo(datos: ResumenDashboard | null): number {
    if (!datos || !datos.totalGeneralGramos) return 0;
    return Math.round((datos.sumatoriaGramosOroRojo / datos.totalGeneralGramos) * 1000) / 10;
  }

  protected porcentajeVerde(datos: ResumenDashboard | null): number {
    if (!datos || !datos.totalGeneralGramos) return 0;
    return Math.round((datos.sumatoriaGramosOroVerde / datos.totalGeneralGramos) * 1000) / 10;
  }
}
