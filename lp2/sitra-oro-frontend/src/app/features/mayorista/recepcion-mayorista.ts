import { NumeroClaroPipe } from '../../core/numero-claro.pipe';
import { ReporteComprasMayorista } from './reporte-compras';
import { A11yModule } from '@angular/cdk/a11y';
import { DatePipe, DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators, ValidationErrors } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, debounceTime, map, of, switchMap, tap } from 'rxjs';
import { CalculoLey, DetalleLey, GuardarRecepcionLey, OperacionesService, PartidaLey, RecepcionLey } from '../../core/api/operaciones.service';
import { MercadoLiveService } from '../../core/api/mercado-live.service';
import { MAYORISTA_VISTA_PREVIA } from './mayorista-preview';

export interface GrupoAcopiador {
  idCentroAcopio: number;
  nombreAcopiador: string;
  lotes: RecepcionLey[];
  totalLotes: number;
  totalPesoFundido: number;
  totalPagar: number;
}

export interface GrupoLey {
  idLey: number;
  ley: number;
  totalPesoFundido: number;
  totalPagar: number;
  partidas: {
    idRecepcion: number;
    nombreAcopiador: string;
    fecha: string;
    pesoFundidoG: number;
    precioUsd: number;
    precioPen: number;
    totalPen: number;
  }[];
}

type Seccion = 'recepciones' | 'exportacion' | 'historial' | 'reporte';
@Component({
  selector: 'app-recepcion-mayorista',
  imports: [ReactiveFormsModule, MatButtonModule, NumeroClaroPipe, DatePipe, DecimalPipe, A11yModule, RouterLink, ReporteComprasMayorista],
  templateUrl: './recepcion-mayorista.html',
  styleUrl: './recepcion-mayorista.css',
})
export class RecepcionMayorista implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly api = inject(OperacionesService);
  private readonly route = inject(ActivatedRoute);
  protected readonly vistaPrevia = inject(MAYORISTA_VISTA_PREVIA);
  protected readonly mercado = inject(MercadoLiveService);
  protected readonly oroMercado = this.mercado.oroMercado;
  protected readonly dolarMercado = this.mercado.dolarMercado;
  protected readonly ultimoTickHora = this.mercado.ultimoTickHora;
  protected readonly titilarPrecio = this.mercado.titilarPrecio;

  protected aplicarValoresMercado(): void {
    const oro = this.mercado.oroMercado();
    const dolar = this.mercado.dolarMercado();
    const onza = Number((oro?.ultimo || oro?.bid || 4000).toFixed(2));
    const tipoCambio = Number((dolar?.sunatVenta || dolar?.interbancario || 3.4411).toFixed(4));

    for (const fila of this.partidas.controls) {
      fila.patchValue({
        onza,
        tipoCambio,
      });
    }
    this.valoresCalculo.set(this.form.getRawValue());
  }
  protected readonly registros = signal<RecepcionLey[]>([]);
  protected readonly seccion = signal<Seccion>('recepciones');
  protected readonly modoVistaHistorial = signal<'acopiador' | 'ley'>('acopiador');
  protected readonly editando = signal<RecepcionLey | null>(null);
  protected readonly origenesAcumulados = signal<RecepcionLey[]>([]);
  protected readonly compraDirecta = signal(false);
  protected agregarCompraDirecta(): void {
    if (this.editando() || this.guardando()) return;
    this.compraDirecta.set(true);
    this.origenesAcumulados.set([]);
    this.abrir({ idRecepcion: 0, fecha: new Date().toISOString().slice(0,10), idCentroAcopio: 0,
      nombreAcopiador: 'Compra directa al minero', revision: 0, estado: 'PENDIENTE', idLoteExportacion: null,
      pesoDeclaradoG: 0, pesoRojoSinFundirG: null, pesoVerdeSinFundirG: null, pesoFundidoG: 0,
      subtotal: null, adelanto: 0, total: 0, detalles: [] });
  }
  private readonly calculoServidor = signal<CalculoLey | null>(null);
  protected readonly cargando = signal(false);
  protected readonly calculando = signal(false);
  protected readonly guardando = signal(false);
  protected readonly error = signal('');
  protected readonly errorCalculo = signal('');
  protected readonly mensaje = signal('');
  protected readonly filtro = signal('');
  protected readonly seleccion = signal<number[]>([]);
  protected readonly confirmacion = signal<'guardar' | 'exportar' | 'eliminar' | null>(null);
  protected readonly loteAEliminar = signal<RecepcionLey | null>(null);
  private seccionPrevia: Seccion = 'recepciones';
  protected readonly ticketActual = signal<RecepcionLey | null>(null);
  protected abrirTicket(r: RecepcionLey): void { this.ticketActual.set(r); }
  protected cerrarTicket(): void { this.ticketActual.set(null); }
  protected abrirTicketPorId(id: number): void {
    const lote = this.registros().find(r => r.idRecepcion === id);
    if (lote) this.abrirTicket(lote);
  }
  protected abrirPorId(id: number): void {
    const lote = this.registros().find(r => r.idRecepcion === id);
    if (lote) this.abrir(lote);
  }
  protected solicitarEliminar(r: RecepcionLey): void {
    if (r.estado === 'EN_LOTE' || this.guardando() || this.editando()) return;
    this.loteAEliminar.set(r);
    this.confirmacion.set('eliminar');
  }
  protected solicitarEliminarPorId(id: number): void {
    const lote = this.registros().find(r => r.idRecepcion === id);
    if (lote) this.solicitarEliminar(lote);
  }
  protected cerrarModalConfirmacion(): void {
    if (this.guardando()) return;
    this.confirmacion.set(null);
    this.loteAEliminar.set(null);
  }

  protected construirTicketConsolidado(lotes: RecepcionLey[], idLoteExp?: number): RecepcionLey {
    const todosDetalles: DetalleLey[] = [];
    let pesoDeclarado = 0;
    let pesoFundido = 0;
    let subtotal = 0;
    let adelanto = 0;
    let total = 0;

    lotes.forEach(lote => {
      pesoDeclarado += lote.pesoDeclaradoG || 0;
      pesoFundido += lote.pesoFundidoG || 0;
      subtotal += (lote.subtotal ?? (lote.total + lote.adelanto)) || 0;
      adelanto += lote.adelanto || 0;
      total += lote.total || 0;
      lote.detalles.forEach(d => {
        todosDetalles.push({
          ...d,
          loteOrigen: lote.idRecepcion,
        } as DetalleLey & { loteOrigen?: number });
      });
    });

    const numerosLotes = lotes.map(l => `#${l.idRecepcion}`).join(', ');
    const idPrincipal = idLoteExp ?? (lotes.length === 1 ? lotes[0].idRecepcion : lotes[0].idRecepcion);

    return {
      idRecepcion: idPrincipal,
      fecha: new Date().toISOString().slice(0, 10),
      idCentroAcopio: 0,
      nombreAcopiador: `Consolidación de exportación (${lotes.length} lotes: ${numerosLotes})`,
      revision: 1,
      estado: 'VALORIZADO',
      idLoteExportacion: idLoteExp ?? null,
      pesoDeclaradoG: pesoDeclarado,
      pesoRojoSinFundirG: null,
      pesoVerdeSinFundirG: null,
      pesoFundidoG: pesoFundido,
      subtotal,
      adelanto,
      total,
      detalles: todosDetalles,
    };
  }

  protected abrirTicketConsolidado(): void {
    const lotes = this.seleccionados();
    if (!lotes.length) return;
    const consolidado = this.construirTicketConsolidado(lotes);
    this.ticketActual.set(consolidado);
  }

  protected fDinero(n: number | string | null | undefined): string {
    return Number(n ?? 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  protected fPeso(n: number | string | null | undefined): string {
    return Number(n ?? 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  private revisionFormulario = 0;
  protected readonly form = this.fb.nonNullable.group({
    adelanto: [0, [Validators.required, Validators.min(0), Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
    detalles: this.fb.array([this.nuevaFila()], {
      validators: (control: AbstractControl): ValidationErrors | null => {
        const filas = control.value as { ley: number | null }[];
        if (!filas || filas.length < 1 || filas.length > 200) return { cantidadPartidas: true };
        const leyes = filas.filter(f => f.ley !== null).map(f => Math.round(Number(f.ley) * 10000));
        return new Set(leyes).size !== leyes.length ? { leyRepetida: true } : null;
      },
    }),
  });
  private readonly valoresCalculo = signal(this.form.getRawValue());
  private readonly formularioValido = signal(false);
  protected readonly calculoValidado = computed(() => {
    const local = this.calculo(); const servidor = this.calculoServidor();
    return !!local && !!servidor && local.total === servidor.total && local.subtotal === servidor.subtotal
      && local.detalles.length === servidor.detalles.length && local.detalles.every((p,i) => p.precioPen === servidor.detalles[i].precioPen && p.totalPen === servidor.detalles[i].totalPen);
  });
  protected readonly calculo = computed<CalculoLey | null>(() => {
    const valores = this.valoresCalculo();
    if (!this.formularioValido()) return null;
    const escala = (valor: number, decimales: number): bigint => {
      const [entero, fraccion = ''] = String(valor).split('.');
      return BigInt(entero) * 10n ** BigInt(decimales) + BigInt(fraccion.padEnd(decimales, '0'));
    };
    const redondear = (n: bigint, d: bigint) => (n + d / 2n) / d;
    let peso = 0n, subtotal = 0n;
    const detalles = valores.detalles.map(p => {
      const onza = escala(p.onza!,4), ley = escala(p.ley!,4), porcentaje = escala(p.porcentaje!,4), dolar = escala(p.tipoCambio!,4);
      const usd16 = redondear(onza * ley * (1000000n - porcentaje) * 10n ** 16n, 1000000000000n * 310999n);
      const precioUsd = Number(redondear(usd16,10n ** 14n)) / 100;
      const precioCentimos = redondear(usd16 * dolar,10n ** 18n);
      const pesoFila = escala(p.pesoFundidoG!,3);
      const totalCentimos = redondear(precioCentimos * pesoFila,1000n);
      subtotal += totalCentimos; peso += pesoFila;
      return { onza:p.onza!, ley:p.ley!, porcentaje:p.porcentaje!, tipoCambio:p.tipoCambio!, pesoSinFundirG:p.pesoSinFundirG!, pesoFundidoG:p.pesoFundidoG!, idLey:Number(ley), precioUsd, precioPen:Number(precioCentimos)/100, totalPen:Number(totalCentimos)/100 };
    });
    const adelanto = escala(valores.adelanto,2);
    return { detalles, pesoFundidoG:Number(peso)/1000, subtotal:Number(subtotal)/100, adelanto:valores.adelanto, total:Number(subtotal - adelanto)/100 };
  });
  protected get partidas() { return this.form.controls.detalles; }
  protected readonly visibles = computed(() => this.registros().filter(r =>
    (this.seccion() === 'historial' || (this.seccion() === 'exportacion' ? r.estado === 'VALORIZADO' : r.estado !== 'EN_LOTE')) &&
    (!this.filtro() || `${r.idRecepcion} ${r.nombreAcopiador}`.toLowerCase().includes(this.filtro().toLowerCase()))));
  protected readonly pendientes = computed(() => this.registros().filter(r => r.estado === 'PENDIENTE').length);
  protected readonly valorizados = computed(() => this.registros().filter(r => r.estado === 'VALORIZADO').length);
  protected readonly seleccionados = computed(() => this.registros().filter(r => r.estado === 'VALORIZADO' && this.seleccion().includes(r.idRecepcion)));
  protected readonly pesoSeleccionado = computed(() => this.seleccionados().reduce((s, r) => s + r.pesoFundidoG, 0));

  protected readonly gruposPorAcopiador = computed<GrupoAcopiador[]>(() => {
    const mapa = new Map<number, RecepcionLey[]>();
    for (const r of this.visibles()) {
      if (this.seccion() === 'recepciones' && r.estado !== 'PENDIENTE') continue;
      const clave = r.idCentroAcopio;
      const lista = mapa.get(clave) ?? [];
      lista.push(r);
      mapa.set(clave, lista);
    }
    return Array.from(mapa.entries()).map(([idCentroAcopio, lotes]) => ({
      idCentroAcopio,
      nombreAcopiador: lotes[0].nombreAcopiador,
      lotes,
      totalLotes: lotes.length,
      totalPesoFundido: lotes.reduce((sum, x) => sum + (x.pesoFundidoG || 0), 0),
      totalPagar: lotes.reduce((sum, x) => sum + (x.total || 0), 0),
    }));
  });

  protected resumenColores(lotes: RecepcionLey[]) {
    return [
      { tipo: 'ROJO', nombre: 'Oro rojo', campo: 'pesoRojoSinFundirG' as const },
      { tipo: 'VERDE', nombre: 'Oro verde', campo: 'pesoVerdeSinFundirG' as const },
    ].map(color => {
      const recibidos = lotes.filter(r => (r[color.campo] ?? 0) > 0);
      return { ...color, cantidad: recibidos.length,
        peso: recibidos.reduce((total, r) => total + (r[color.campo] ?? 0), 0) };
    });
  }

  protected readonly gruposPorLey = computed<GrupoLey[]>(() => {
    const mapa = new Map<number, GrupoLey>();
    for (const r of this.visibles()) {
      for (const d of r.detalles) {
        let grupo = mapa.get(d.idLey);
        if (!grupo) {
          grupo = {
            idLey: d.idLey,
            ley: d.ley,
            totalPesoFundido: 0,
            totalPagar: 0,
            partidas: [],
          };
          mapa.set(d.idLey, grupo);
        }
        grupo.totalPesoFundido += d.pesoFundidoG;
        grupo.totalPagar += d.totalPen;
        grupo.partidas.push({
          idRecepcion: r.idRecepcion,
          nombreAcopiador: r.nombreAcopiador,
          fecha: r.fecha,
          pesoFundidoG: d.pesoFundidoG,
          precioUsd: d.precioUsd,
          precioPen: d.precioPen,
          totalPen: d.totalPen,
        });
      }
    }
    return Array.from(mapa.values()).sort((a, b) => b.ley - a.ley);
  });

  protected separarColores(lotes: RecepcionLey[]) {
    return [
      { tipo: 'ROJO', nombre: 'Oro rojo' },
      { tipo: 'VERDE', nombre: 'Oro verde' },
      { tipo: '', nombre: 'Partidas por ley sin color registrado' },
    ].map(color => ({
      ...color,
      lotes: lotes.flatMap(r => {
        if (r.detalles.length) {
          const detalles = r.detalles.filter(p =>
            color.tipo ? p.tipoOro === color.tipo : !['ROJO', 'VERDE'].includes(p.tipoOro ?? ''));
          return detalles.length ? [{ ...r, detalles }] : [];
        }
        const peso = color.tipo === 'ROJO' ? r.pesoRojoSinFundirG
          : color.tipo === 'VERDE' ? r.pesoVerdeSinFundirG
          : !r.pesoRojoSinFundirG && !r.pesoVerdeSinFundirG ? r.pesoDeclaradoG : 0;
        return peso ? [{ ...r,
          pesoRojoSinFundirG: color.tipo === 'ROJO' ? peso : 0,
          pesoVerdeSinFundirG: color.tipo === 'VERDE' ? peso : 0,
          pesoDeclaradoG: peso,
        }] : [];
      }),
    })).filter(color => color.lotes.length);
  }

  ngOnInit(): void {
    if (this.route.snapshot.queryParamMap.get('seccion') === 'exportacion') this.seccion.set('exportacion');
    this.form.valueChanges.pipe(
      tap(() => { this.valoresCalculo.set(this.form.getRawValue()); this.formularioValido.set(this.form.valid); this.revisionFormulario++; this.calculoServidor.set(null); this.errorCalculo.set(''); this.calculando.set(false); }),
      debounceTime(350),
      switchMap(() => {
        const revision = this.revisionFormulario;
        if (!this.editando() || this.form.invalid || !this.partidas.length) return of(null);
        this.calculando.set(true);
        return this.api.calcularRecepcionLey(this.solicitud()).pipe(
          map(calculo => ({ calculo, revision, error: '' })),
          catchError((e: HttpErrorResponse) => of({ calculo: null, revision, error: this.textoError(e, 'No se pudo calcular el importe.') })),
        );
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(resultado => {
      if (!resultado || resultado.revision !== this.revisionFormulario) return;
      this.calculando.set(false); this.calculoServidor.set(resultado.calculo); this.errorCalculo.set(resultado.error);
      if(resultado.calculo && !this.calculoValidado()) this.errorCalculo.set('El cálculo visual no coincide con el servidor. Revisa los datos antes de guardar.');
    });
    this.cargar();
  }

  protected cargar(): void {
    if (this.guardando() || this.editando()) return;
    this.cargando.set(true); this.error.set('');
    this.api.recepcionesPorLey().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: items => {
        this.registros.set(items); this.cargando.set(false);
        this.seleccion.update(ids => ids.filter(id => items.some(r => r.idRecepcion === id && r.estado === 'VALORIZADO')));
      },
      error: e => { this.cargando.set(false); this.error.set(this.textoError(e, 'No se pudieron cargar los lotes recibidos.')); },
    });
  }
  protected cambiarSeccion(valor: Seccion): void {
    if (this.editando() || this.guardando()) return;
    this.seccion.set(valor); this.error.set(''); this.mensaje.set(''); this.filtro.set('');
  }
  protected abrir(r: RecepcionLey): void {
    if (r.estado === 'EN_LOTE' || this.guardando() || this.editando()) return;
    this.seccionPrevia = this.seccion();
    this.editando.set(r); this.error.set(''); this.mensaje.set('');
    this.partidas.clear({ emitEvent: false });
    if (r.detalles.length) {
      r.detalles.forEach(p => {
        const tipoOro = (r.pesoRojoSinFundirG && Math.abs(p.pesoSinFundirG - r.pesoRojoSinFundirG) < 0.001)
          ? 'ROJO'
          : (r.pesoVerdeSinFundirG && Math.abs(p.pesoSinFundirG - r.pesoVerdeSinFundirG) < 0.001)
          ? 'VERDE'
          : (p.ley >= 85 ? 'ROJO' : 'VERDE');
        this.partidas.push(this.nuevaFila({ ...p, tipoOro }), { emitEvent: false });
      });
    } else {
      const rojo = r.pesoRojoSinFundirG ?? 0;
      const verde = r.pesoVerdeSinFundirG ?? 0;
      if (rojo > 0) this.partidas.push(this.nuevaFila({ tipoOro: 'ROJO', pesoSinFundirG: rojo }), { emitEvent: false });
      if (verde > 0) this.partidas.push(this.nuevaFila({ tipoOro: 'VERDE', pesoSinFundirG: verde }), { emitEvent: false });
      if (!this.partidas.length) this.partidas.push(this.nuevaFila({ pesoSinFundirG: r.pesoDeclaradoG || undefined }), { emitEvent: false });
    }
    this.form.controls.adelanto.setValue(r.adelanto);
    setTimeout(() => document.getElementById('editor-lote')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }
  protected analizarAcumulado(grupo: GrupoAcopiador): void {
    const pendientes = grupo.lotes.filter(r => r.estado === 'PENDIENTE');
    if (!pendientes.length || this.editando() || this.guardando()) return;
    const rojo = pendientes.reduce((s, r) => s + (r.pesoRojoSinFundirG ?? 0), 0);
    const verde = pendientes.reduce((s, r) => s + (r.pesoVerdeSinFundirG ?? 0), 0);
    this.abrir({ ...pendientes[0], idRecepcion: 0, revision: 0,
      pesoRojoSinFundirG: rojo, pesoVerdeSinFundirG: verde, pesoDeclaradoG: rojo + verde,
      detalles: [], adelanto: 0, total: 0 });
    this.origenesAcumulados.set(pendientes);
  }
  protected tienePendientes(grupo: GrupoAcopiador): boolean {
    return grupo.lotes.some(r => r.estado === 'PENDIENTE');
  }
  protected agregar(): void {
    if (this.partidas.length >= 200 || this.guardando()) return;
    const anterior = this.partidas.at(this.partidas.length - 1)?.getRawValue();
    this.partidas.push(this.nuevaFila(anterior ? {
      tipoOro: anterior.tipoOro === 'ROJO' ? 'VERDE' : 'ROJO',
      onza: anterior.onza ?? undefined,
      porcentaje: anterior.porcentaje ?? undefined,
      tipoCambio: anterior.tipoCambio ?? undefined,
    } : undefined));
  }
  protected quitar(i: number): void { if (this.partidas.length > 1 && !this.guardando()) this.partidas.removeAt(i); }
  protected cancelar(): void {
    if (this.guardando()) return;
    this.editando.set(null); this.confirmacion.set(null); this.calculoServidor.set(null); this.errorCalculo.set('');
    this.origenesAcumulados.set([]);
    this.compraDirecta.set(false);
    this.revisionFormulario++; this.calculando.set(false);
  }
  protected revisar(): void {
    this.form.markAllAsTouched();
    if (this.form.valid && this.calculoValidado() && !this.errorCalculo() && !this.calculando() && this.editando()) this.confirmacion.set('guardar');
  }
  protected seleccionar(id: number, marcada: boolean): void {
    if (this.guardando()) return;
    this.seleccion.update(ids => marcada ? [...new Set([...ids, id])] : ids.filter(x => x !== id));
  }
  protected confirmar(): void {
    if (this.guardando()) return;
    if (this.confirmacion() === 'guardar') {
      const r = this.editando();
      if (!r || this.form.invalid || !this.calculoValidado() || this.errorCalculo()) return;
      this.guardando.set(true);
      const origenes = this.origenesAcumulados();
      const directa = this.compraDirecta();
      const guardado$ = directa
        ? this.api.compraDirectaMayorista(this.solicitud())
        : origenes.length
        ? this.api.guardarAnalisisAcumulado(origenes.map(o => ({ id: o.idRecepcion, revision: o.revision })), this.solicitud())
        : this.api.guardarRecepcionLey(r.idRecepcion, this.solicitud());
      guardado$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: guardado => {
          this.guardando.set(false); this.cancelar();
          this.registros.update(items => directa ? [...items, guardado] : origenes.length
            ? [...items.filter(x => !origenes.some(o => o.idRecepcion === x.idRecepcion)), guardado]
            : items.map(x => x.idRecepcion === guardado.idRecepcion ? guardado : x));
          const destino = this.seccionPrevia === 'recepciones' ? 'historial' : this.seccionPrevia;
          this.seccion.set(destino); this.filtro.set(String(guardado.idRecepcion));
          this.mensaje.set(`Lote recibido #${guardado.idRecepcion} registrado con ${guardado.detalles.length} partida(s). Total: S/ ${guardado.total.toFixed(2)}.`);
          this.ticketActual.set(guardado);
        },
        error: e => { this.guardando.set(false); this.confirmacion.set(null); this.error.set(this.textoError(e, 'No se pudo guardar el lote.')); },
      });
    } else if (this.confirmacion() === 'exportar' && this.seleccionados().length) {
      this.guardando.set(true);
      const seleccionados = [...this.seleccionados()];
      this.api.enviarRecepcionesALote(this.seleccionados().map(r => r.idRecepcion)).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: lote => {
          this.guardando.set(false); this.confirmacion.set(null); this.seleccion.set([]); this.cargar();
          this.mensaje.set(`Lote de exportación #${lote.idLote} creado con éxito reuniendo ${seleccionados.length} lote(s). Total: ${seleccionados.reduce((s, r) => s + r.pesoFundidoG, 0).toFixed(2)} g.`);
          this.ticketActual.set(this.construirTicketConsolidado(seleccionados, lote.idLote));
        },
        error: e => { this.guardando.set(false); this.confirmacion.set(null); this.error.set(this.textoError(e, 'No se pudo crear el lote de exportación.')); },
      });
    } else if (this.confirmacion() === 'eliminar') {
      const r = this.loteAEliminar();
      if (!r) return;
      this.guardando.set(true);
      this.api.eliminarRecepcionMayorista(r.idRecepcion).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => {
          this.guardando.set(false);
          this.confirmacion.set(null);
          this.loteAEliminar.set(null);
          this.registros.update(items => items.filter(x => x.idRecepcion !== r.idRecepcion));
          this.seleccion.update(ids => ids.filter(x => x !== r.idRecepcion));
          this.mensaje.set(`Registro #${r.idRecepcion} (${r.nombreAcopiador}) eliminado correctamente.`);
        },
        error: e => {
          this.guardando.set(false);
          this.confirmacion.set(null);
          this.loteAEliminar.set(null);
          this.error.set(this.textoError(e, 'No se pudo eliminar el registro.'));
        },
      });
    }
  }

  protected previsualizarTicket(): void {
    const edit = this.editando();
    const calc = this.calculo();
    if (!edit || !calc) return;
    const sim: RecepcionLey = {
      idRecepcion: edit.idRecepcion || 0,
      fecha: new Date().toISOString().slice(0, 10),
      idCentroAcopio: edit.idCentroAcopio,
      nombreAcopiador: edit.nombreAcopiador,
      revision: edit.revision,
      estado: 'VALORIZADO',
      idLoteExportacion: null,
      pesoDeclaradoG: calc.detalles.reduce((s, d) => s + d.pesoSinFundirG, 0),
      pesoRojoSinFundirG: edit.pesoRojoSinFundirG,
      pesoVerdeSinFundirG: edit.pesoVerdeSinFundirG,
      pesoFundidoG: calc.pesoFundidoG,
      subtotal: calc.subtotal,
      adelanto: calc.adelanto,
      total: calc.total,
      detalles: calc.detalles,
    };
    this.imprimirTicket(sim);
  }

  protected imprimirTicket(lote?: RecepcionLey | null): void {
    const r = lote || this.ticketActual();
    if (!r) return;
    const ventana = window.open('', '_blank', 'width=460,height=760');
    if (!ventana) {
      window.print();
      return;
    }
    const doc = ventana.document;
    doc.title = `Ticket_${r.idRecepcion || 'PREVIO'}_${r.nombreAcopiador}`;
    const estilo = doc.createElement('style');
    estilo.textContent = `
      @page {
        size: 76mm auto;
        margin: 0;
      }
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      html, body {
        width: 76mm;
        max-width: 76mm;
        margin: 0 auto !important;
        padding: 4mm 3mm !important;
        font-family: 'Consolas', 'Courier New', Monaco, monospace;
        font-size: 9px;
        line-height: 1.3;
        font-weight: 600;
        color: #000 !important;
        background: #fff !important;
        -webkit-font-smoothing: antialiased;
        font-variant-numeric: tabular-nums;
      }
      .ticket {
        width: 100% !important;
        max-width: 76mm !important;
        margin: 0 auto !important;
        padding: 0 !important;
      }
      .ticket-brand {
        text-align: center;
        padding-bottom: 5px;
        border-bottom: 2px solid #000;
        margin-bottom: 5px;
      }
      .brand-title {
        font-size: 14px;
        font-weight: 900;
        letter-spacing: 2px;
        color: #000;
      }
      .brand-subtitle {
        font-size: 8.5px;
        font-weight: 800;
        letter-spacing: 0.5px;
        color: #000;
        margin-top: 2px;
      }
      .brand-sede {
        font-size: 7.5px;
        font-weight: 700;
        color: #333;
        margin-top: 1px;
      }
      .ticket-meta {
        padding-bottom: 5px;
        border-bottom: 1.5px dashed #000;
        margin-bottom: 6px;
        font-size: 8.5px;
      }
      .meta-row {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 6px;
        margin-bottom: 2.5px;
      }
      .meta-lbl {
        color: #222;
        font-weight: 800;
        text-transform: uppercase;
        white-space: nowrap;
      }
      .meta-val {
        color: #000;
        font-weight: 900;
        text-align: right;
        word-break: break-word;
      }
      .meta-highlight {
        font-weight: 900;
        letter-spacing: 0.5px;
      }
      .section-title {
        font-size: 8.5px;
        font-weight: 900;
        letter-spacing: 0.6px;
        text-transform: uppercase;
        color: #000;
        margin-bottom: 4px;
        text-align: center;
        border-bottom: 1px solid #000;
        padding-bottom: 2px;
      }
      .partida-card {
        border: 1.5px solid #000;
        margin-bottom: 6px;
        background: #fff;
        page-break-inside: avoid;
      }
      .partida-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: #f4f4f4;
        border-bottom: 1px solid #000;
        padding: 3px 5px;
        font-size: 8.5px;
        font-weight: 900;
      }
      .partida-badges {
        display: flex;
        align-items: center;
        gap: 4px;
      }
      .badge-item {
        background: #000;
        color: #fff;
        font-size: 8px;
        font-weight: 900;
        padding: 1px 5px;
      }
      .badge-lote {
        background: #fff;
        color: #000;
        border: 1px solid #000;
        font-size: 8px;
        font-weight: 900;
        padding: 0 4px;
      }
      .badge-tipo {
        font-size: 8px;
        font-weight: 800;
        color: #000;
      }
      /* 1. Bloque de Pesos (Arriba): Entrada, Fundido, Merma */
      .partida-pesos {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        border-bottom: 1px dashed #000;
        background: #fff;
      }
      .partida-pesos div {
        padding: 3px 4px;
        border-right: 1px solid #ddd;
      }
      .partida-pesos div:last-child {
        border-right: none;
      }
      .peso-lbl {
        display: block;
        font-size: 7px;
        font-weight: 800;
        color: #444;
        text-transform: uppercase;
      }
      .peso-val {
        display: block;
        font-size: 9.5px;
        font-weight: 900;
        color: #000;
        margin-top: 1px;
      }
      .font-fundido {
        font-weight: 900;
        color: #000;
      }
      .text-merma {
        color: #000;
        font-weight: 900;
      }

      /* 2. Factores: Onza, Ley, Descuento %, T/C */
      .partida-factores {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        border-bottom: 1px dashed #000;
        background: #fafafa;
      }
      .partida-factores div {
        padding: 2.5px 3px;
        text-align: center;
        border-right: 1px solid #ddd;
      }
      .partida-factores div:last-child {
        border-right: none;
      }
      .factor-lbl {
        display: block;
        font-size: 6.5px;
        font-weight: 800;
        color: #444;
        text-transform: uppercase;
      }
      .factor-val {
        display: block;
        font-size: 9px;
        font-weight: 900;
        color: #000;
        margin-top: 1px;
      }

      /* Precios en Dólares y Soles */
      .partida-precios {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: #fff;
        border-bottom: 1px solid #000;
        padding: 3px 5px;
        font-size: 8px;
        font-weight: 800;
      }
      .partida-precios span {
        color: #222;
        font-weight: 800;
        font-size: 7.5px;
      }
      .partida-precios strong {
        color: #000;
        font-size: 9px;
      }
      .precio-usd-txt {
        color: #000 !important;
      }

      /* 3. Liquidación de partida: Fundido x Soles = Resultado */
      .partida-resultado {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: #f4f4f4;
        padding: 3.5px 6px;
      }
      .resultado-formula {
        font-size: 8.5px;
        font-weight: 800;
        color: #000;
      }
      .resultado-total {
        font-size: 11.5px;
        font-weight: 900;
        color: #000;
      }
      .ticket-totales {
        border-top: 2px solid #000;
        border-bottom: 2px solid #000;
        padding: 5px 2px;
        margin: 6px 0 4px 0;
        font-size: 8.5px;
        page-break-inside: avoid;
      }
      .totales-row {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        margin-bottom: 2px;
      }
      .totales-row span {
        color: #333;
        font-weight: 800;
      }
      .totales-row strong {
        color: #000;
        font-weight: 900;
      }
      .totales-sep {
        border-bottom: 1px dotted #000;
        margin: 3px 0;
      }
      .gran-total-row {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        border-top: 1.5px solid #000;
        padding-top: 3px;
        margin-top: 3px;
        font-size: 10px;
        font-weight: 900;
      }
      .gran-total-row span {
        color: #000;
        letter-spacing: 0.5px;
      }
      .gran-total-row strong {
        color: #000;
        font-size: 13px;
      }
      .barcode-box {
        text-align: center;
        margin-top: 6px;
        padding-top: 4px;
        border-top: 1px dashed #000;
        page-break-inside: avoid;
      }
      .barcode-box svg {
        display: inline-block;
        max-width: 220px;
        height: 26px;
      }
      .hash-code {
        font-size: 7.5px;
        font-weight: 900;
        color: #000;
        letter-spacing: 0.5px;
        margin-top: 2px;
      }
      .pie-ticket {
        text-align: center;
        font-size: 7px;
        font-weight: 700;
        color: #333;
        margin-top: 5px;
        padding-top: 3px;
        border-top: 1px dotted #000;
        line-height: 1.35;
        page-break-inside: avoid;
      }
      @media print {
        html, body {
          width: 76mm !important;
          margin: 0 !important;
          padding: 2.5mm !important;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
      }
    `;
    doc.head.append(estilo);

    const fDinero = (n: number | string | null | undefined) =>
      Number(n ?? 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const fPeso = (n: number | string | null | undefined) =>
      Number(n ?? 0).toLocaleString('es-PE', { minimumFractionDigits: 1, maximumFractionDigits: 3 });
    const fLey = (n: number | string | null | undefined) =>
      Number(n ?? 0).toLocaleString('es-PE', { minimumFractionDigits: 1, maximumFractionDigits: 2 });
    const fTC = (n: number | string | null | undefined) =>
      Number(n ?? 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
    const fOz = (n: number | string | null | undefined) =>
      Number(n ?? 0).toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

    const totalSinFundir = r.detalles.reduce((s, p) => s + (p.pesoSinFundirG || p.pesoFundidoG || 0), 0);
    const mermaTotal = Math.max(0, totalSinFundir - (r.pesoFundidoG || 0));
    const mermaPorc = totalSinFundir > 0 ? ((mermaTotal / totalSinFundir) * 100).toFixed(2) : '0.00';
    const subtotal = r.subtotal ?? (r.total + r.adelanto);
    const esConsolidado = Boolean(r.idLoteExportacion || (r.detalles.length > 1 && r.detalles.some(d => (d as any).loteOrigen)));
    const codigoOp = r.idLoteExportacion
      ? `TK-EXP-${String(r.idLoteExportacion).padStart(6, '0')}`
      : esConsolidado
      ? 'TK-CONSOLIDADO'
      : `TK-${String(r.idRecepcion || '161').padStart(6, '0')}`;
    const horaActual = new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

    let fechaFormateada = '';
    if (r.fecha) {
      const match = String(r.fecha).match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (match) {
        fechaFormateada = `${match[3]}/${match[2]}/${match[1]} ${horaActual}`;
      } else {
        fechaFormateada = `${r.fecha} ${horaActual}`;
      }
    } else {
      const hoy = new Date();
      fechaFormateada = `${String(hoy.getDate()).padStart(2, '0')}/${String(hoy.getMonth() + 1).padStart(2, '0')}/${hoy.getFullYear()} ${horaActual}`;
    }

    const estadoTexto = r.estado === 'EN_LOTE'
      ? `EN EXPORTACIÓN #${r.idLoteExportacion ?? ''}`
      : (r.estado || 'VALORIZADO');

    let partidasHtml = '';
    r.detalles.forEach((p, idx) => {
      const loteId = (p as any).loteOrigen;
      const loteBadge = loteId ? `<span class="badge-lote">Lote #${loteId}</span>` : '';
      const tipo = p.tipoOro ? (p.tipoOro === 'ROJO' ? 'ORO ROJO' : 'ORO VERDE') : 'ORO BRUTO';
      const pesoEntrada = p.pesoSinFundirG || p.pesoFundidoG || 0;
      const pesoFundido = p.pesoFundidoG || 0;
      const mermaItem = Math.max(0, pesoEntrada - pesoFundido);
      const precioUsd = p.precioUsd || (p.tipoCambio ? p.precioPen / p.tipoCambio : 0);

      partidasHtml += `
        <div class="partida-card">
          <div class="partida-head">
            <div class="partida-badges">
              <span class="badge-item">ITEM #${idx + 1}</span>
              ${loteBadge}
              <span class="badge-tipo">(${tipo})</span>
            </div>
          </div>

          <!-- 1. Pesos: Entrada, Fundido, Merma -->
          <div class="partida-pesos">
            <div>
              <span class="peso-lbl">Entrada (Bruto)</span>
              <span class="peso-val">${fPeso(pesoEntrada)} g</span>
            </div>
            <div>
              <span class="peso-lbl">Fundido (Neto)</span>
              <span class="peso-val font-fundido">${fPeso(pesoFundido)} g</span>
            </div>
            <div>
              <span class="peso-lbl">Merma</span>
              <span class="peso-val text-merma">${fPeso(mermaItem)} g</span>
            </div>
          </div>

          <!-- 2. Factores: Onza, Ley, Descuento %, T/C -->
          <div class="partida-factores">
            <div>
              <span class="factor-lbl">Onza</span>
              <span class="factor-val">$${fDinero(p.onza).replace('.00', '')}</span>
            </div>
            <div>
              <span class="factor-lbl">Ley</span>
              <span class="factor-val">${fLey(p.ley)}</span>
            </div>
            <div>
              <span class="factor-lbl">Desc. (%)</span>
              <span class="factor-val">${Number(p.porcentaje || 0).toFixed(1)}%</span>
            </div>
            <div>
              <span class="factor-lbl">T/C</span>
              <span class="factor-val">${fTC(p.tipoCambio)}</span>
            </div>
          </div>

          <!-- Precios: Dólar y Soles -->
          <div class="partida-precios">
            <div>
              <span>Precio Dólar: </span>
              <strong class="precio-usd-txt">$ ${fDinero(precioUsd)} /g</strong>
            </div>
            <div>
              <span>Precio Soles: </span>
              <strong>S/ ${fDinero(p.precioPen)} /g</strong>
            </div>
          </div>

          <!-- 3. Resultado: Fundido x Soles = Resultado -->
          <div class="partida-resultado">
            <span class="resultado-formula">${fPeso(pesoFundido)} g × S/ ${fDinero(p.precioPen)} =</span>
            <strong class="resultado-total">S/ ${fDinero(p.totalPen)}</strong>
          </div>
        </div>
      `;
    });

    doc.body.innerHTML = `
      <div class="ticket">
        <div class="ticket-brand">
          <div class="brand-title">S I T R A - O R O</div>
          <div class="brand-subtitle">${esConsolidado ? 'LIQUIDACIÓN CONSOLIDADA DE EXPORTACIÓN' : 'COMPROBANTE DE LIQUIDACIÓN POR LEY'}</div>
          <div class="brand-sede">Planta Mayorista · Sede Juliaca, Puno</div>
        </div>

        <div class="ticket-meta">
          <div class="meta-row">
            <span class="meta-lbl">COMPROBANTE:</span>
            <span class="meta-val meta-highlight">${codigoOp}</span>
          </div>
          <div class="meta-row">
            <span class="meta-lbl">FECHA / HORA:</span>
            <span class="meta-val">${fechaFormateada}</span>
          </div>
          <div class="meta-row">
            <span class="meta-lbl">PROVEEDOR:</span>
            <span class="meta-val">${r.nombreAcopiador}</span>
          </div>
          <div class="meta-row">
            <span class="meta-lbl">ESTADO:</span>
            <span class="meta-val">${estadoTexto}</span>
          </div>
        </div>

        <div class="section-title">DETALLE DE PARTIDAS</div>
        <div class="partidas-container">
          ${partidasHtml}
        </div>

        <div class="ticket-totales">
          <div class="totales-row">
            <span>Total bruto (entrada):</span>
            <strong>${fPeso(totalSinFundir)} g</strong>
          </div>
          <div class="totales-row">
            <span>Total neto (fundido):</span>
            <strong class="font-bold">${fPeso(r.pesoFundidoG)} g</strong>
          </div>
          <div class="totales-row">
            <span>Merma en fundición:</span>
            <strong class="text-red">${fPeso(mermaTotal)} g (${mermaPorc}%)</strong>
          </div>
          <div class="totales-sep"></div>
          <div class="totales-row">
            <span>Subtotal material:</span>
            <strong>S/ ${fDinero(subtotal)}</strong>
          </div>
          ${r.adelanto > 0 ? `
          <div class="totales-row">
            <span>(-) Adelanto entregado:</span>
            <strong>- S/ ${fDinero(r.adelanto)}</strong>
          </div>` : ''}
          <div class="gran-total-row">
            <span>TOTAL A PAGAR:</span>
            <strong>S/ ${fDinero(r.total)}</strong>
          </div>
        </div>

        <div class="barcode-box">
          <svg width="220" height="26" viewBox="0 0 220 26" fill="#0f172a">
            <rect x="4" y="0" width="2" height="26"/>
            <rect x="8" y="0" width="4" height="26"/>
            <rect x="15" y="0" width="2" height="26"/>
            <rect x="20" y="0" width="5" height="26"/>
            <rect x="28" y="0" width="3" height="26"/>
            <rect x="34" y="0" width="2" height="26"/>
            <rect x="39" y="0" width="4" height="26"/>
            <rect x="46" y="0" width="2" height="26"/>
            <rect x="51" y="0" width="6" height="26"/>
            <rect x="60" y="0" width="3" height="26"/>
            <rect x="66" y="0" width="2" height="26"/>
            <rect x="71" y="0" width="5" height="26"/>
            <rect x="79" y="0" width="3" height="26"/>
            <rect x="85" y="0" width="2" height="26"/>
            <rect x="90" y="0" width="4" height="26"/>
            <rect x="97" y="0" width="2" height="26"/>
            <rect x="102" y="0" width="6" height="26"/>
            <rect x="111" y="0" width="3" height="26"/>
            <rect x="117" y="0" width="2" height="26"/>
            <rect x="122" y="0" width="5" height="26"/>
            <rect x="130" y="0" width="2" height="26"/>
            <rect x="135" y="0" width="4" height="26"/>
            <rect x="142" y="0" width="3" height="26"/>
            <rect x="148" y="0" width="2" height="26"/>
            <rect x="153" y="0" width="6" height="26"/>
            <rect x="162" y="0" width="2" height="26"/>
            <rect x="167" y="0" width="4" height="26"/>
            <rect x="174" y="0" width="3" height="26"/>
            <rect x="180" y="0" width="5" height="26"/>
            <rect x="188" y="0" width="2" height="26"/>
            <rect x="193" y="0" width="4" height="26"/>
            <rect x="200" y="0" width="3" height="26"/>
            <rect x="206" y="0" width="5" height="26"/>
            <rect x="214" y="0" width="2" height="26"/>
          </svg>
          <div class="hash-code">${codigoOp} · OPERACIÓN CONFORME</div>
        </div>

        <div class="pie-ticket">
          <div>*** SITRA-ORO · SISTEMA DE TRAZABILIDAD AURÍFERA ***</div>
          <div>Comprobante digital para fines contables y de auditoría</div>
          <div>Sesión autenticada con Keycloak · SITRA-ORO v2.0</div>
        </div>
      </div>
    `;

    setTimeout(() => {
      ventana.focus();
      ventana.print();
    }, 250);
  }

  protected estado(r: RecepcionLey): string {
    return r.estado === 'EN_LOTE' ? `En exportación #${r.idLoteExportacion}` : r.estado === 'VALORIZADO' ? 'Valorizado' : 'Ley pendiente';
  }
  private solicitud(): GuardarRecepcionLey {
    const raw = this.partidas.getRawValue() as (PartidaLey & { tipoOro?: string })[];
    const detalles: PartidaLey[] = raw.map(({ tipoOro, ...p }) => p);
    return {
      revision: this.editando()?.revision ?? 0,
      adelanto: this.form.controls.adelanto.value,
      detalles,
    };
  }
  private nuevaFila(p?: Partial<PartidaLey>) {
    const oro = this.mercado.oroMercado();
    const dolar = this.mercado.dolarMercado();
    const onzaDefecto = p?.onza ?? (oro?.ultimo ? Number(oro.ultimo.toFixed(2)) : (oro?.bid ? Number(oro.bid.toFixed(2)) : 4000));
    const dolarDefecto = p?.tipoCambio ?? (dolar?.sunatVenta ? Number(dolar.sunatVenta.toFixed(4)) : (dolar?.interbancario ? Number(dolar.interbancario.toFixed(4)) : 3.75));

    const numero = (valor: number | undefined | null, min: number, max: number, decimales: number) =>
      this.fb.control<number | null>(valor ?? null, [Validators.required, Validators.min(min), Validators.max(max), Validators.pattern(new RegExp(`^\\d+(\\.\\d{1,${decimales}})?$`))]);
    return this.fb.group({
      tipoOro: this.fb.nonNullable.control<string>(p?.tipoOro ?? (p?.ley && p.ley < 85 ? 'VERDE' : 'ROJO')),
      onza: numero(onzaDefecto, 0.0001, 9999999999.9999, 4),
      ley: numero(p?.ley, 0.0001, 100, 4),
      porcentaje: numero(p?.porcentaje ?? 0, 0, 99.9999, 4),
      tipoCambio: numero(dolarDefecto, 0.0001, 999999.9999, 4),
      pesoSinFundirG: numero(p?.pesoSinFundirG, 0.001, 9999999.999, 3),
      pesoFundidoG: numero(p?.pesoFundidoG, 0.001, 9999999.999, 3),
    });
  }
  private textoError(e: HttpErrorResponse, defecto: string): string {
    if(e.error?.code === 'PESO_FUNDIDO_SUPERA_ENTRADA') return 'El backend rechazó la partida: el peso fundido supera el peso recibido. Corrige esos pesos.';
    if(e.error?.code === 'ADELANTO_SUPERA_TOTAL') return 'El backend rechazó el adelanto: supera el total del material. Reduce el adelanto.';
    if(e.error?.code === 'LEY_REPETIDA') return 'El backend rechazó una ley repetida. Reúne su peso en una sola partida.';
    if (e.status === 401) return 'Tu sesión venció. Vuelve a ingresar.';
    if (e.status === 403) return 'Tu cuenta no tiene permiso para gestionar el Mayorista.';
    return e.error?.message ?? e.error?.detail ?? defecto;
  }
}

