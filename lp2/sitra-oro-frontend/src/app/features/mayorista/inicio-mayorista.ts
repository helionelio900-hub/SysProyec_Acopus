import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe, registerLocaleData } from '@angular/common';
import localeEsPe from '@angular/common/locales/es-PE';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import {
  DashboardMayorista,
  DiaDashboard,
  MonedaPago,
  OperacionesService,
  ResumenCaja,
} from '../../core/api/operaciones.service';
import { MAYORISTA_VISTA_PREVIA } from './mayorista-preview';
import { MarketCotizacionesService } from '../../core/api/market-cotizaciones.service';

// Nombres de días y meses en español para las fechas del resumen.
registerLocaleData(localeEsPe, 'es-PE');

type Rango = 7 | 30 | 90;

@Component({
  selector: 'app-inicio-mayorista',
  imports: [RouterLink, DatePipe, DecimalPipe],
  templateUrl: './inicio-mayorista.html',
  styleUrl: './inicio-mayorista.css',
})
export class InicioMayorista implements OnInit {
  private readonly operaciones = inject(OperacionesService);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly market = inject(MarketCotizacionesService);
  protected readonly vistaPrevia = inject(MAYORISTA_VISTA_PREVIA);

  protected readonly rango = signal<Rango>(30);
  protected readonly tablero = signal<DashboardMayorista | null>(null);
  protected readonly cargando = signal(true);
  protected readonly error = signal('');
  protected readonly caja = signal<ResumenCaja | null>(null);

  protected readonly horaActual = signal(this.hora());

  protected readonly fechaActual = ((f: string) => f.charAt(0).toUpperCase() + f.slice(1))(
    new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
  );

  /** Barras del gráfico: altura relativa al mejor día del rango. */
  protected readonly barras = computed(() => {
    const serie = this.tablero()?.serieDiaria ?? [];
    const max = Math.max(...serie.map((d) => d.ingresoPen), 0);
    const cadaCuanto = Math.ceil(serie.length / 10);
    return serie.map((d, i) => ({
      ...d,
      altura: max > 0 ? Math.max((d.ingresoPen / max) * 100, d.ingresoPen > 0 ? 3 : 0) : 0,
      etiqueta: i % cadaCuanto === 0 || i === serie.length - 1,
    }));
  });
  protected readonly diasConMovimiento = computed(() =>
    [...(this.tablero()?.serieDiaria ?? [])]
      .filter((d) => d.operaciones > 0 || d.adelantosEntregadosPen > 0)
      .reverse()
      .slice(0, 10),
  );
  protected readonly maxCentro = computed(() =>
    Math.max(...(this.tablero()?.topCentros ?? []).map((c) => c.ingresoPen), 1),
  );
  /** Peso de cada moneda en el total pagado, convertido a soles con el tipo de cambio del formulario. */
  protected readonly participacionUsd = computed(() => {
    const t = this.tablero();
    if (!t) return 0;
    const pen = t.pagosPorMoneda.find((m) => m.moneda === 'PEN')?.monto ?? 0;
    const usd = (t.pagosPorMoneda.find((m) => m.moneda === 'USD')?.monto ?? 0) * this.tipoCambioReferencia();
    return pen + usd > 0 ? Math.round((usd / (pen + usd)) * 100) : 0;
  });
  protected readonly totalLotes = computed(() => {
    const e = this.tablero()?.estados;
    return e ? e.pendientes + e.valorizados + e.enLote : 0;
  });

  ngOnInit(): void {
    const reloj = setInterval(() => this.horaActual.set(this.hora()), 1000);
    this.destroyRef.onDestroy(() => clearInterval(reloj));
    this.cargarTablero();
    this.operaciones.caja().subscribe({
      next: (datos) => this.caja.set(datos),
      error: () => this.caja.set(null),
    });
  }

  protected cambiarRango(dias: Rango): void {
    if (this.rango() === dias) return;
    this.rango.set(dias);
    this.cargarTablero();
  }

  protected cargarTablero(): void {
    this.cargando.set(true);
    this.error.set('');
    const hasta = new Date();
    const desde = new Date();
    desde.setDate(hasta.getDate() - (this.rango() - 1));
    this.operaciones.dashboardMayorista(this.isoLocal(desde), this.isoLocal(hasta)).subscribe({
      next: (datos) => {
        this.tablero.set(datos);
        this.cargando.set(false);
      },
      error: (response: HttpErrorResponse) => {
        this.error.set(
          response.status === 403
            ? 'Tu cuenta no tiene permiso para ver el tablero mayorista.'
            : 'No se pudo cargar el tablero. Intenta nuevamente.',
        );
        this.cargando.set(false);
      },
    });
  }

  /** Ruta de una sección del mayorista, dentro o fuera de la vista previa. */
  protected ruta(seccion: string): string {
    return (this.vistaPrevia ? '/vista-previa/mayorista/' : '/mayorista/') + seccion;
  }

  protected dinero(valor: number | null | undefined, moneda: MonedaPago = 'PEN'): string {
    return new Intl.NumberFormat('es-PE', { style: 'currency', currency: moneda }).format(valor ?? 0);
  }

  protected tituloBarra(d: DiaDashboard): string {
    return `${d.fecha}: ${this.dinero(d.ingresoPen)} (${this.dinero(d.ingresoUsd, 'USD')}) · ${d.operaciones} lote(s)`;
  }

  private tipoCambioReferencia(): number {
    const usd = this.market.tickers().find((t) => t.simbolo === 'USD/PEN')?.valor;
    return usd && usd > 0 ? usd : 3.75;
  }

  private isoLocal(fecha: Date): string {
    const mm = String(fecha.getMonth() + 1).padStart(2, '0');
    const dd = String(fecha.getDate()).padStart(2, '0');
    return `${fecha.getFullYear()}-${mm}-${dd}`;
  }

  private hora(): string {
    return new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }
}
