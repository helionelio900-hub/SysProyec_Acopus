import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { forkJoin } from 'rxjs';
import {
  GuardarLoteExportacion,
  Liquidacion,
  LoteExportacion,
  OperacionesService,
} from '../../core/api/operaciones.service';
import { MAYORISTA_VISTA_PREVIA } from './mayorista-preview';

interface SeleccionPartida {
  activa: boolean;
  lectura: string;
}

@Component({
  selector: 'app-consolidacion-mayorista',
  imports: [MatButtonModule],
  templateUrl: './consolidacion-mayorista.html',
  styleUrl: './consolidacion-mayorista.css',
})
export class ConsolidacionMayorista implements OnInit {
  private readonly operaciones = inject(OperacionesService);
  protected readonly vistaPrevia = inject(MAYORISTA_VISTA_PREVIA);
  protected readonly fecha = signal(this.fechaLocal());
  protected readonly liquidaciones = signal<Liquidacion[]>([]);
  protected readonly lotes = signal<LoteExportacion[]>([]);
  protected readonly seleccion = signal<Record<number, SeleccionPartida>>({});
  protected readonly editandoId = signal<number | null>(null);
  protected readonly detalleId = signal<number | null>(null);
  protected readonly cargando = signal(false);
  protected readonly guardando = signal(false);
  protected readonly mensaje = signal('');
  protected readonly error = signal('');

  protected readonly disponibles = computed(() => {
    const ocupadas = new Set(
      this.lotes()
        .filter((lote) => lote.idLote !== this.editandoId())
        .flatMap((lote) => lote.partidas.map((partida) => partida.idLiquidacionG1)),
    );
    return this.liquidaciones().filter(
      (liquidacion) => liquidacion.estado === 'REGISTRADA' && !ocupadas.has(liquidacion.idLiquidacionG1),
    );
  });
  protected readonly seleccionadas = computed(() =>
    this.disponibles().filter((liquidacion) => this.seleccion()[liquidacion.idLiquidacionG1]?.activa),
  );
  protected readonly pesoSeleccionado = computed(() =>
    this.seleccionadas().reduce((total, liquidacion) => total + liquidacion.pesoTotalFundidoG, 0),
  );
  protected readonly puedeGuardar = computed(() =>
    this.seleccionadas().length >= 2 &&
    this.seleccionadas().every((liquidacion) =>
      this.lecturaValida(this.seleccion()[liquidacion.idLiquidacionG1]?.lectura ?? ''),
    ),
  );
  protected readonly puedePrepararEnvio = computed(() =>
    this.editandoId() !== null &&
    this.lotes().some((lote) => lote.idLote === this.editandoId() && lote.estado === 'BORRADOR'),
  );

  ngOnInit(): void {
    if (this.vistaPrevia) {
      this.liquidaciones.set([
        this.demoLiquidacion(9001, 'Acopiador de ejemplo A', 85.4),
        this.demoLiquidacion(9002, 'Acopiador de ejemplo B', 62.8),
        this.demoLiquidacion(9003, 'Acopiador de ejemplo C', 41.2),
      ]);
      return;
    }
    this.cargar();
  }

  protected cargar(): void {
    this.cargando.set(true);
    this.error.set('');
    forkJoin({
      liquidaciones: this.operaciones.liquidaciones('REGISTRADA'),
      lotes: this.operaciones.lotesExportacion(),
    }).subscribe({
      next: ({ liquidaciones, lotes }) => {
        this.liquidaciones.set(liquidaciones);
        this.lotes.set(lotes);
        this.cargando.set(false);
      },
      error: (response: HttpErrorResponse) => {
        this.cargando.set(false);
        this.error.set(this.mensajeError(response, 'No se pudieron consultar los lotes y las liquidaciones.'));
      },
    });
  }

  protected elegir(id: number, activa: boolean): void {
    this.seleccion.update((actual) => ({
      ...actual,
      [id]: { activa, lectura: actual[id]?.lectura ?? '' },
    }));
  }

  protected cambiarLectura(id: number, event: Event): void {
    const lectura = (event.target as HTMLInputElement).value;
    this.seleccion.update((actual) => ({
      ...actual,
      [id]: { activa: actual[id]?.activa ?? false, lectura },
    }));
  }

  protected cambiarFecha(event: Event): void {
    this.fecha.set((event.target as HTMLInputElement).value);
  }

  protected guardar(): void {
    this.error.set('');
    this.mensaje.set('');
    if (!this.fecha() || !this.puedeGuardar()) {
      this.error.set('Selecciona al menos dos liquidaciones y completa la lectura decimal de cada una.');
      return;
    }
    const request: GuardarLoteExportacion = {
      fecha: this.fecha(),
      partidas: this.seleccionadas().map((liquidacion) => ({
        idLiquidacionG1: liquidacion.idLiquidacionG1,
        lecturaDecimal: Number(this.seleccion()[liquidacion.idLiquidacionG1].lectura),
      })),
    };
    const id = this.editandoId();
    this.guardando.set(true);
    if (this.vistaPrevia) {
      const guardado = this.loteDemo(id ?? this.siguienteIdDemo++, request);
      this.guardarEnLista(guardado);
      this.guardando.set(false);
      this.mensaje.set('Vista de demostración: el borrador solo existe en esta pantalla.');
      return;
    }
    const peticion = id === null
      ? this.operaciones.crearLoteExportacion(request)
      : this.operaciones.actualizarLoteExportacion(id, request);
    peticion.subscribe({
      next: (guardado) => {
        this.guardarEnLista(guardado);
        this.guardando.set(false);
        this.mensaje.set(id === null ? 'Lote guardado como borrador.' : 'Borrador actualizado.');
      },
      error: (response: HttpErrorResponse) => {
        this.guardando.set(false);
        this.error.set(this.mensajeError(response, 'No se pudo guardar el lote.'));
      },
    });
  }

  protected editar(lote: LoteExportacion): void {
    if (lote.estado !== 'BORRADOR') return;
    this.editandoId.set(lote.idLote);
    this.fecha.set(lote.fecha);
    this.seleccion.set(Object.fromEntries(lote.partidas.map((partida) => [
      partida.idLiquidacionG1,
      { activa: true, lectura: String(partida.lecturaDecimal) },
    ])));
    this.mensaje.set(`Editando Lote ${String(lote.idLote).padStart(3, '0')}.`);
    this.error.set('');
  }

  protected alternarDetalle(id: number): void {
    this.detalleId.update((actual) => actual === id ? null : id);
  }

  protected eliminar(lote: LoteExportacion): void {
    if (lote.estado !== 'BORRADOR') return;
    if (!this.vistaPrevia && !window.confirm(`¿Eliminar el borrador del Lote ${lote.idLote}?`)) return;
    this.error.set('');
    if (this.vistaPrevia) {
      this.quitarDeLista(lote.idLote);
      return;
    }
    this.operaciones.eliminarLoteExportacion(lote.idLote).subscribe({
      next: () => this.quitarDeLista(lote.idLote),
      error: (response: HttpErrorResponse) =>
        this.error.set(this.mensajeError(response, 'No se pudo eliminar el borrador.')),
    });
  }

  protected prepararEnvio(): void {
    const id = this.editandoId();
    if (id === null || !this.puedePrepararEnvio()) return;
    const lote = this.lotes().find((item) => item.idLote === id);
    if (!lote || !window.confirm(`¿Preparar el lote ${id} con ${lote.partidas.length} liquidaciones y ${this.gramos(lote.pesoTotalFundidoG)} g? Después no podrá editarse.`)) return;
    this.error.set('');
    this.guardando.set(true);
    if (this.vistaPrevia) {
      this.guardarEnLista({ ...lote, estado: 'PREPARADO', fechaPreparacion: new Date().toISOString() });
      this.guardando.set(false);
      this.limpiar();
      this.mensaje.set('Vista de demostración: el lote se marcó como preparado solo en esta pantalla.');
      return;
    }
    this.operaciones.prepararLoteExportacion(id).subscribe({
      next: (preparado) => {
        this.guardarEnLista(preparado);
        this.guardando.set(false);
        this.limpiar();
        this.mensaje.set('Lote preparado y registrado. El envío al exportador se gestiona fuera del sistema.');
      },
      error: (response: HttpErrorResponse) => {
        this.guardando.set(false);
        this.error.set(this.mensajeError(response, 'No se pudo preparar el lote.'));
      },
    });
  }

  protected limpiar(): void {
    this.editandoId.set(null);
    this.fecha.set(this.fechaLocal());
    this.seleccion.set({});
    this.error.set('');
  }

  protected gramos(valor: number): string {
    return new Intl.NumberFormat('es-PE', { minimumFractionDigits: 3, maximumFractionDigits: 3 }).format(valor);
  }

  private siguienteIdDemo = 1;

  private guardarEnLista(lote: LoteExportacion): void {
    this.lotes.update((actuales) => [lote, ...actuales.filter((item) => item.idLote !== lote.idLote)]);
    this.editandoId.set(lote.idLote);
  }

  private quitarDeLista(id: number): void {
    this.lotes.update((actuales) => actuales.filter((lote) => lote.idLote !== id));
    if (this.editandoId() === id) this.limpiar();
    this.mensaje.set('Borrador eliminado.');
  }

  private lecturaValida(valor: string): boolean {
    return /^\d+(?:\.\d{1,6})?$/.test(valor) && Number.isFinite(Number(valor));
  }

  private mensajeError(response: HttpErrorResponse, alternativo: string): string {
    if (response.status === 401) return 'Tu sesión venció. Vuelve a ingresar.';
    if (response.status === 403) return 'Tu cuenta no tiene permiso para gestionar lotes.';
    return response.error?.message ?? alternativo;
  }

  private loteDemo(id: number, request: GuardarLoteExportacion): LoteExportacion {
    return {
      idLote: id,
      fecha: request.fecha,
      estado: 'BORRADOR',
      fechaPreparacion: null,
      pesoTotalFundidoG: this.pesoSeleccionado(),
      partidas: request.partidas.map((partida) => {
        const liquidacion = this.liquidaciones().find((item) => item.idLiquidacionG1 === partida.idLiquidacionG1)!;
        return {
          ...partida,
          nombreAcopiadorG2: liquidacion.nombreAcopiadorG2,
          pesoFundidoG: liquidacion.pesoTotalFundidoG,
        };
      }),
    };
  }

  private demoLiquidacion(id: number, nombre: string, peso: number): Liquidacion {
    return {
      idLiquidacionG1: id,
      idCentroAcopio: 901,
      nombreAcopiadorG2: nombre,
      estado: 'REGISTRADA',
      pesoTotalFundidoG: peso,
      cotizacionOnzaUsd: 0,
      tipoCambioUsdPen: 0,
      totalPagadoG2Pen: 0,
      fechaLiquidacion: '2026-09-20T10:30:00',
      detalles: [],
    };
  }

  private fechaLocal(): string {
    const ahora = new Date();
    return `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}-${String(ahora.getDate()).padStart(2, '0')}`;
  }
}
