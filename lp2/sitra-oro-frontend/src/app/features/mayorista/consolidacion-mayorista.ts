import { NumeroClaroPipe } from '../../core/numero-claro.pipe';
import { RegistroPonderacion } from './registro-ponderacion';
import { A11yModule } from '@angular/cdk/a11y';
import { HttpErrorResponse } from '@angular/common/http';

import { FormsModule } from '@angular/forms';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  GuardarLoteExportacion,
  Liquidacion,
  LoteExportacion,
  OperacionesService,
  RecepcionLey,
} from '../../core/api/operaciones.service';
import { MAYORISTA_VISTA_PREVIA } from './mayorista-preview';

interface SeleccionPartida {
  activa: boolean;
  lectura: string;
}

@Component({
  selector: 'app-consolidacion-mayorista',
  imports: [MatButtonModule, NumeroClaroPipe, FormsModule, RegistroPonderacion, A11yModule],
  templateUrl: './consolidacion-mayorista.html',
  styleUrl: './consolidacion-mayorista.css',
})
export class ConsolidacionMayorista implements OnInit {
  private readonly operaciones = inject(OperacionesService);
  protected readonly vistaPrevia = inject(MAYORISTA_VISTA_PREVIA);
  protected readonly fecha = signal(this.fechaLocal());
  protected readonly liquidaciones = signal<Liquidacion[]>([]);
  protected readonly lotes = signal<LoteExportacion[]>([]);
  protected readonly loteEditor = signal<LoteExportacion | null>(null);
  protected readonly loteEliminar = signal<LoteExportacion | null>(null);
  protected readonly opcionesEditor = signal<RecepcionLey[]>([]);
  protected readonly idsEditor = signal<number[]>([]);
  protected readonly fechaEditor = signal('');
  protected editarLote(lote: LoteExportacion): void {
    if (lote.estado !== 'BORRADOR' || this.guardando()) return;
    this.error.set(''); this.fechaEditor.set(lote.fecha);
    this.idsEditor.set((lote.recepciones ?? []).map(r => r.idRecepcion));
    this.operaciones.recepcionesPorLey().subscribe({
      next: items => {
        this.opcionesEditor.set(items.filter(r => r.estado === 'VALORIZADO' || r.idLoteExportacion === lote.idLote));
        this.loteEditor.set(lote);
      },
      error: () => this.error.set('No se pudieron cargar los lotes recibidos para editar.'),
    });
  }
  protected elegirLoteEditor(id: number, incluir: boolean): void {
    this.idsEditor.update(ids => incluir ? [...new Set([...ids,id])] : ids.filter(x => x !== id));
  }
  protected guardarLoteEditor(): void {
    const lote=this.loteEditor();
    if (!lote || !this.fechaEditor() || !this.idsEditor().length || this.guardando()) return;
    this.guardando.set(true);
    this.operaciones.editarRecepcionesExportacion(lote.idLote,this.fechaEditor(),this.idsEditor()).subscribe({
      next: actualizado => { this.lotes.update(items => items.map(x => x.idLote === actualizado.idLote ? actualizado : x)); this.loteEditor.set(null); this.guardando.set(false); },
      error: () => { this.guardando.set(false); this.error.set('No se pudo actualizar el lote. Revisa si alguna recepción ya pertenece a otro lote.'); },
    });
  }
  protected readonly pesoFundidoFinal = signal<number | null>(null);
  protected readonly fundidoInvalido = computed(() => {
    const peso = this.pesoFundidoFinal();
    return peso !== null && (!Number.isFinite(peso) || peso < 0 || peso > this.promedioExportacion().peso
      || Math.abs(peso * 1000 - Math.round(peso * 1000)) > 0.00001);
  });
  protected readonly mermaFinal = computed(() => {
    const peso = this.pesoFundidoFinal();
    return peso === null || this.fundidoInvalido() ? 0 : Math.round((this.promedioExportacion().peso - peso) * 1000) / 1000;
  });
  protected imprimirPromedio(): void {
    if (!this.fundidoInvalido() && this.promedioExportacion().lectura !== null) window.print();
  }
  protected readonly promedioExportacion = computed(() => {
    const filas = this.lotes().flatMap(lote => this.filasPorLey(lote));
    const pesoMiligramos = filas.reduce((total, fila) => total + Math.round(fila.peso * 1000), 0);
    const incompletos = filas.some(fila => fila.ley === null && fila.peso > 0);
    const sumaPonderada = filas.reduce((total, fila) => total + Math.round(fila.peso * 1000) * (fila.ley ?? 0) / 100, 0);
    return { peso: pesoMiligramos / 1000,
      lectura: pesoMiligramos > 0 && !incompletos ? sumaPonderada / pesoMiligramos : null,
      incompletos };
  });
  protected filasPorLey(lote: LoteExportacion): { ley: number | null; peso: number }[] {
    const pesos = new Map<number | null, number>();
    const sumar = (ley: number | null, peso: number) => pesos.set(ley, (pesos.get(ley) ?? 0) + Math.round(peso * 1000));
    for (const recepcion of lote.recepciones ?? []) {
      if (recepcion.leyes?.length) {
        for (const fila of recepcion.leyes) sumar(fila.ley, fila.pesoFundidoG);
      } else sumar(null, recepcion.pesoFundidoG);
    }
    for (const partida of lote.partidas) sumar(null, partida.pesoFundidoG);
    if (!pesos.size) sumar(null, lote.pesoTotalFundidoG);
    return Array.from(pesos, ([ley, peso]) => ({ ley, peso: peso / 1000 }));
  }
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
      this.operaciones.lotesExportacion().subscribe(lotes => this.lotes.set(lotes));
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
    this.operaciones.lotesExportacion().subscribe({
      next: (lotes) => {
        this.lotes.set(lotes);
        this.cargando.set(false);
      },
      error: (response: HttpErrorResponse) => {
        this.cargando.set(false);
        this.error.set(this.mensajeError(response, 'No se pudieron consultar los lotes de exportación.'));
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
    if (lote.estado !== 'BORRADOR' || lote.recepciones?.length) return;
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
    this.error.set('');
    this.guardando.set(true);
    if (this.vistaPrevia) {
      this.quitarDeLista(lote.idLote);
      this.guardando.set(false); this.loteEliminar.set(null);
      return;
    }
    this.operaciones.eliminarLoteExportacion(lote.idLote).subscribe({
      next: () => { this.quitarDeLista(lote.idLote); this.guardando.set(false); this.loteEliminar.set(null); },
      error: (response: HttpErrorResponse) => {
        this.guardando.set(false);
        this.error.set(this.mensajeError(response, 'No se pudo eliminar el borrador.'));
      },
    });
  }

  protected prepararEnvio(idLote?: number): void {
    const id = idLote ?? this.editandoId();
    if (id === null || this.guardando()) return;
    const lote = this.lotes().find((item) => item.idLote === id);
    if (!lote || lote.estado !== 'BORRADOR' || !window.confirm(`¿Preparar el lote de exportación ${id} con ${lote.partidas.length + (lote.recepciones?.length ?? 0)} registros y ${this.gramos(lote.pesoTotalFundidoG)} g? Después no podrá editarse.`)) return;
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
    return new Intl.NumberFormat('en-US', { useGrouping: false, minimumFractionDigits: 0, maximumFractionDigits: 3 }).format(valor);
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
