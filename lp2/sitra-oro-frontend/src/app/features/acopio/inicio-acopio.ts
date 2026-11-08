import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe, registerLocaleData } from '@angular/common';
import localeEsPe from '@angular/common/locales/es-PE';
import { RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  CompraAcopio,
  OperacionesService,
  PrestamoMinero,
  SolicitudMinero,
  TransaccionAcopio,
} from '../../core/api/operaciones.service';
import { EntregaMinero } from '../../core/api/entregas-minero';
import { MarketCotizacionesService } from '../../core/api/market-cotizaciones.service';
import { MarketChart } from './market-chart';
import { CajaPanel } from '../../core/caja/caja-panel';

registerLocaleData(localeEsPe, 'es-PE');

type Rango = 7 | 30 | 90;

/** Fecha local (Perú) en formato AAAA-MM-DD, para agrupar por día sin desfases de zona horaria. */
function diaLocal(fecha: string | Date): string {
  const d = typeof fecha === 'string' ? new Date(fecha) : fecha;
  const dos = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}`;
}

/**
 * Resumen del acopiador: lo que pagó hoy, el oro que tiene por enviar al mayorista, lo que le deben los
 * mineros y lo que necesita su atención. Todo sale de las compras y préstamos reales del centro.
 */
@Component({
  selector: 'app-inicio-acopio',
  imports: [RouterLink, DatePipe, DecimalPipe, MarketChart, CajaPanel],
  templateUrl: './inicio-acopio.html',
  styleUrl: './inicio-acopio.css',
})
export class InicioAcopio implements OnInit {
  private readonly operaciones = inject(OperacionesService);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly market = inject(MarketCotizacionesService);

  protected readonly rango = signal<Rango>(30);
  protected readonly cargando = signal(true);
  protected readonly error = signal('');
  protected readonly compras = signal<CompraAcopio[]>([]);
  protected readonly partidas = signal<TransaccionAcopio[]>([]);
  protected readonly prestamos = signal<PrestamoMinero[]>([]);
  protected readonly cuentasPorAprobar = signal<SolicitudMinero[]>([]);
  protected readonly entregasPorAtender = signal<EntregaMinero[]>([]);

  protected readonly horaActual = signal(this.hora());
  protected readonly fechaActual = ((f: string) => f.charAt(0).toUpperCase() + f.slice(1))(
    new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
  );

  /** Compras dentro del rango elegido (solo partidas vigentes). */
  private readonly comprasRango = computed(() => {
    const desde = new Date();
    desde.setHours(0, 0, 0, 0);
    desde.setDate(desde.getDate() - (this.rango() - 1));
    return this.compras().filter((c) => new Date(c.fechaCompra) >= desde);
  });

  protected readonly hoy = computed(() => {
    const clave = diaLocal(new Date());
    const deHoy = this.compras().filter((c) => diaLocal(c.fechaCompra) === clave);
    return {
      compras: deHoy.length,
      pagado: deHoy.reduce((s, c) => s + this.neto(c), 0),
      gramos: deHoy.reduce((s, c) => s + this.gramosCompra(c), 0),
    };
  });

  protected readonly periodo = computed(() => {
    const lista = this.comprasRango();
    const valorOro = lista.reduce((s, c) => s + c.totalPagadoPen, 0);
    const pagado = lista.reduce((s, c) => s + this.neto(c), 0);
    const gramos = lista.reduce((s, c) => s + this.gramosCompra(c), 0);
    const mineros = new Set(lista.map((c) => c.minero.idMinero)).size;
    return { compras: lista.length, valorOro, pagado, gramos, mineros,
      precioPromedio: gramos > 0 ? valorOro / gramos : 0 };
  });

  /** Oro comprado que todavía no se envió al mayorista, por color. */
  protected readonly porEnviar = computed(() => {
    const disponibles = this.partidas().filter((p) => !p.anulada && p.idRecepcionMayorista === null);
    const suma = (color: 'ROJO' | 'VERDE') => {
      const grupo = disponibles.filter((p) => p.tipoOro === color);
      return { gramos: grupo.reduce((s, p) => s + p.pesoFundidoNetoG, 0), valor: grupo.reduce((s, p) => s + p.totalPagadoPen, 0) };
    };
    const rojo = suma('ROJO');
    const verde = suma('VERDE');
    const total = rojo.gramos + verde.gramos;
    return { rojo, verde, total, valor: rojo.valor + verde.valor, partidas: disponibles.length,
      pctRojo: total > 0 ? (rojo.gramos / total) * 100 : 0 };
  });

  protected readonly porCobrar = computed(() => ({
    total: this.prestamos().reduce((s, p) => s + p.montoPen, 0),
    cantidad: this.prestamos().length,
    mineros: new Set(this.prestamos().map((p) => p.idMinero)).size,
  }));

  /** Gramos fundidos comprados por día, para el gráfico. */
  protected readonly barras = computed(() => {
    const porDia = new Map<string, { gramos: number; pagado: number; compras: number }>();
    for (const c of this.comprasRango()) {
      const clave = diaLocal(c.fechaCompra);
      const acc = porDia.get(clave) ?? { gramos: 0, pagado: 0, compras: 0 };
      acc.gramos += this.gramosCompra(c);
      acc.pagado += this.neto(c);
      acc.compras += 1;
      porDia.set(clave, acc);
    }
    const dias: { fecha: string; gramos: number; pagado: number; compras: number }[] = [];
    for (let i = this.rango() - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const clave = diaLocal(d);
      dias.push({ fecha: clave, ...(porDia.get(clave) ?? { gramos: 0, pagado: 0, compras: 0 }) });
    }
    const max = Math.max(...dias.map((d) => d.gramos), 0);
    const cada = Math.ceil(dias.length / 10);
    return dias.map((d, i) => ({ ...d, altura: max > 0 ? Math.max((d.gramos / max) * 100, d.gramos > 0 ? 3 : 0) : 0,
      etiqueta: i % cada === 0 || i === dias.length - 1 }));
  });

  protected readonly mejorDia = computed(() => {
    const mejor = this.barras().reduce<{ fecha: string; gramos: number } | null>(
      (a, b) => (b.gramos > (a?.gramos ?? 0) ? b : a), null);
    return mejor && mejor.gramos > 0 ? mejor : null;
  });

  protected readonly ultimasCompras = computed(() => this.compras().slice(0, 6));

  protected readonly pendientes = computed(() =>
    this.cuentasPorAprobar().length + this.entregasPorAtender().length);

  ngOnInit(): void {
    const reloj = setInterval(() => this.horaActual.set(this.hora()), 1000);
    this.destroyRef.onDestroy(() => clearInterval(reloj));
    this.cargar();
  }

  protected cambiarRango(dias: Rango): void {
    this.rango.set(dias);
  }

  protected cargar(): void {
    this.cargando.set(true);
    this.error.set('');
    // Si un dato secundario falla, el resumen se muestra igual con ese bloque vacío.
    forkJoin({
      compras: this.operaciones.compras(),
      partidas: this.operaciones.transacciones().pipe(catchError(() => of<TransaccionAcopio[]>([]))),
      prestamos: this.operaciones.prestamos(undefined, 'PENDIENTE').pipe(catchError(() => of<PrestamoMinero[]>([]))),
      cuentas: this.operaciones.solicitudes().pipe(catchError(() => of<SolicitudMinero[]>([]))),
      entregas: this.operaciones.solicitudesEntrega().pipe(catchError(() => of<EntregaMinero[]>([]))),
    }).subscribe({
      next: (r) => {
        this.compras.set([...r.compras].sort((a, b) => b.fechaCompra.localeCompare(a.fechaCompra)));
        this.partidas.set(r.partidas);
        this.prestamos.set(r.prestamos);
        this.cuentasPorAprobar.set(r.cuentas);
        this.entregasPorAtender.set(r.entregas.filter((e) => e.ESTADO === 'PENDIENTE'));
        this.cargando.set(false);
      },
      error: (e) => {
        this.error.set(e?.status === 403 ? 'Tu cuenta no tiene permiso para ver este resumen.' : 'No se pudo cargar el resumen. Intenta nuevamente.');
        this.cargando.set(false);
      },
    });
  }

  protected neto(c: CompraAcopio): number {
    return c.netoPagadoPen ?? c.totalPagadoPen;
  }

  private gramosCompra(c: CompraAcopio): number {
    return c.detalles.filter((p) => !p.anulada).reduce((s, p) => s + p.pesoFundidoNetoG, 0);
  }

  protected dinero(valor: number | null | undefined): string {
    return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(valor ?? 0);
  }

  protected gramos(valor: number | null | undefined): string {
    return `${new Intl.NumberFormat('es-PE', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(valor ?? 0)} g`;
  }

  protected tituloBarra(d: { fecha: string; gramos: number; pagado: number; compras: number }): string {
    return `${d.fecha}: ${this.gramos(d.gramos)} · ${this.dinero(d.pagado)} pagado · ${d.compras} compra(s)`;
  }

  private hora(): string {
    return new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }
}
