import { NumeroClaroPipe } from '../../core/numero-claro.pipe';
import { ReporteComprasMayorista } from './reporte-compras';
import { A11yModule } from '@angular/cdk/a11y';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators, ValidationErrors } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, debounceTime, map, of, switchMap, tap } from 'rxjs';
import { CalculoLey, GuardarRecepcionLey, OperacionesService, PartidaLey, RecepcionLey } from '../../core/api/operaciones.service';
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
  imports: [ReactiveFormsModule, MatButtonModule, NumeroClaroPipe, DatePipe, A11yModule, RouterLink, ReporteComprasMayorista],
  templateUrl: './recepcion-mayorista.html',
  styleUrl: './recepcion-mayorista.css',
})
export class RecepcionMayorista implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly api = inject(OperacionesService);
  private readonly route = inject(ActivatedRoute);
  protected readonly vistaPrevia = inject(MAYORISTA_VISTA_PREVIA);
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
  protected readonly confirmacion = signal<'guardar' | 'exportar' | null>(null);
  protected readonly ticketActual = signal<RecepcionLey | null>(null);
  protected abrirTicket(r: RecepcionLey): void { this.ticketActual.set(r); }
  protected cerrarTicket(): void { this.ticketActual.set(null); }
  protected abrirTicketPorId(id: number): void {
    const lote = this.registros().find(r => r.idRecepcion === id);
    if (lote) this.abrirTicket(lote);
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
          this.seccion.set('historial'); this.filtro.set(String(guardado.idRecepcion));
          this.mensaje.set(`Lote recibido #${guardado.idRecepcion} registrado con ${guardado.detalles.length} partida(s). Total: S/ ${guardado.total.toFixed(2)}.`);
          this.ticketActual.set(guardado);
        },
        error: e => { this.guardando.set(false); this.confirmacion.set(null); this.error.set(this.textoError(e, 'No se pudo guardar el lote.')); },
      });
    } else if (this.confirmacion() === 'exportar' && this.seleccionados().length) {
      this.guardando.set(true);
      this.api.enviarRecepcionesALote(this.seleccionados().map(r => r.idRecepcion)).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: lote => {
          this.guardando.set(false); this.confirmacion.set(null); this.seleccion.set([]); this.cargar();
          this.mensaje.set(`Lote de exportación #${lote.idLote} creado como borrador. Continúa en Lotes para exportación.`);
        },
        error: e => { this.guardando.set(false); this.confirmacion.set(null); this.error.set(this.textoError(e, 'No se pudo crear el lote de exportación.')); },
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
    const ventana = window.open('', '_blank', 'width=460,height=720');
    if (!ventana) {
      window.print();
      return;
    }
    const doc = ventana.document;
    doc.title = `Ticket_${r.idRecepcion || 'PREVIO'}_${r.nombreAcopiador}`;
    const estilo = doc.createElement('style');
    estilo.textContent = `
      @page { size: 72mm auto; margin: 0; }
      * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; margin: 0; padding: 0; }
      html, body {
        width: 72mm;
        max-width: 72mm;
        margin: 0 !important;
        padding: 2mm 3mm !important;
        height: auto !important;
        overflow: hidden !important;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
        font-size: 9px;
        line-height: 1.15;
        color: #000;
        background: #fff;
      }
      .ticket {
        width: 100% !important;
        max-width: 72mm !important;
        margin: 0 !important;
        padding: 0 !important;
        page-break-after: avoid !important;
        page-break-inside: avoid !important;
      }
      .encabezado { text-align: center; border-bottom: 1.5px solid #000; padding-bottom: 2px; margin-bottom: 3px; }
      .logo { font-size: 13px; font-weight: 900; letter-spacing: 1.5px; margin: 0; text-transform: uppercase; }
      .subtitulo { font-size: 8px; font-weight: 700; letter-spacing: 0.3px; margin: 1px 0 0; text-transform: uppercase; color: #222; }
      .meta { border-bottom: 1px dashed #333; padding-bottom: 2px; margin-bottom: 3px; font-size: 8.5px; }
      .meta-fila { display: flex; justify-content: space-between; margin-bottom: 1px; }
      .tabla-partidas { width: 100%; border-collapse: collapse; margin-bottom: 3px; }
      .tabla-partidas th { border-bottom: 1px solid #000; font-size: 8px; text-transform: uppercase; padding: 2px 1px; font-weight: 800; color: #111; }
      .tabla-partidas td { padding: 2px 1px; border-bottom: 1px dotted #bbb; font-size: 8.5px; vertical-align: top; }
      .partida-main { font-weight: 700; font-size: 9px; }
      .partida-sub { font-size: 7.5px; color: #444; }
      .totales { border-top: 1.5px solid #000; border-bottom: 1.5px solid #000; padding: 2px 0; margin-top: 2px; }
      .pesos-bar { display: flex; justify-content: space-between; font-size: 7.8px; background: #eee; padding: 2px 3px; margin-bottom: 2px; border-radius: 2px; font-weight: 600; }
      .totales-fila { display: flex; justify-content: space-between; font-size: 8.5px; margin-bottom: 1px; }
      .total-final { font-size: 10.5px; font-weight: 900; border-top: 1px dashed #000; margin-top: 2px; padding-top: 2px; }
      .firmas { margin-top: 10px; display: flex; justify-content: space-between; text-align: center; font-size: 7.5px; }
      .firma-col { border-top: 1px solid #000; width: 44%; padding-top: 2px; font-weight: 600; }
      .pie { text-align: center; font-size: 7px; margin-top: 4px; padding-bottom: 2px; letter-spacing: 0.5px; color: #555; }
      @media print {
        html, body { width: 72mm !important; margin: 0 !important; padding: 1mm 2mm !important; }
        .no-print { display: none !important; }
      }
    `;
    doc.head.append(estilo);

    const fDinero = (n: number | string | null | undefined) =>
      Number(n ?? 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const fPeso = (n: number | string | null | undefined) =>
      Number(n ?? 0).toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 3 });
    const fLey = (n: number | string | null | undefined) =>
      Number(n ?? 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const fTC = (n: number | string | null | undefined) =>
      Number(n ?? 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
    const fOz = (n: number | string | null | undefined) =>
      Number(n ?? 0).toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

    const totalSinFundir = r.detalles.reduce((s, p) => s + (p.pesoSinFundirG || 0), 0);
    const mermaTotal = Math.max(0, totalSinFundir - (r.pesoFundidoG || 0));

    let htmlPartidas = '';
    r.detalles.forEach((p, idx) => {
      htmlPartidas += `
        <tr>
          <td style="text-align:left">
            <div class="partida-main">#${idx + 1} Ley: ${fLey(p.ley)}%</div>
            <div class="partida-sub">Oz:$${fOz(p.onza)} · TC:${fTC(p.tipoCambio)}</div>
          </td>
          <td style="text-align:center">
            <div>${fPeso(p.pesoSinFundirG)}g / <b>${fPeso(p.pesoFundidoG)}g</b></div>
            <div class="partida-sub">P/g S/${fDinero(p.precioPen)}</div>
          </td>
          <td style="text-align:right; font-weight:bold; vertical-align:top">
            S/ ${fDinero(p.totalPen)}
          </td>
        </tr>
      `;
    });

    doc.body.innerHTML = `
      <div class="ticket">
        <div class="encabezado">
          <div class="logo">SITRA - ORO</div>
          <div class="subtitulo">Comprobante de Liquidación por Ley</div>
        </div>
        <div class="meta">
          <div class="meta-fila">
            <span><b>COMPROBANTE:</b> ${r.idRecepcion ? '#' + r.idRecepcion : 'VISTA PREVIA'}</span>
            <span><b>FECHA:</b> ${r.fecha}</span>
          </div>
          <div class="meta-fila">
            <span><b>ACOPIO:</b> ${r.nombreAcopiador}</span>
            <span><b>ESTADO:</b> ${r.estado}</span>
          </div>
        </div>
        <table class="tabla-partidas">
          <thead>
            <tr>
              <th style="text-align:left">Partida / Ley</th>
              <th style="text-align:center">Entr / Fund</th>
              <th style="text-align:right">Total S/</th>
            </tr>
          </thead>
          <tbody>
            ${htmlPartidas}
          </tbody>
        </table>
        <div class="totales">
          <div class="pesos-bar">
            <span>Ent: <b>${fPeso(totalSinFundir)}g</b></span>
            <span>Fund: <b>${fPeso(r.pesoFundidoG)}g</b></span>
            <span>Merma: <b>${fPeso(mermaTotal)}g</b></span>
          </div>
          <div class="totales-fila">
            <span>Partidas: <b>${r.detalles.length}</b> · Subtotal:</span>
            <span><b>S/ ${fDinero(r.subtotal ?? (r.total + r.adelanto))}</b></span>
          </div>
          ${r.adelanto > 0 ? `
          <div class="totales-fila">
            <span>Adelanto descontado:</span>
            <span><b>- S/ ${fDinero(r.adelanto)}</b></span>
          </div>` : ''}
          <div class="totales-fila total-final">
            <span>TOTAL NETO A PAGAR:</span>
            <span>S/ ${fDinero(r.total)}</span>
          </div>
        </div>
        <div class="firmas">
          <div class="firma-col">Firma Mayorista</div>
          <div class="firma-col">Firma Acopiador</div>
        </div>
        <div class="pie">
          *** SITRA-ORO · MÓDULO MAYORISTA ***
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
    const numero = (valor: number | undefined, min: number, max: number, decimales: number) =>
      this.fb.control<number | null>(valor ?? null, [Validators.required, Validators.min(min), Validators.max(max), Validators.pattern(new RegExp(`^\\d+(\\.\\d{1,${decimales}})?$`))]);
    return this.fb.group({
      tipoOro: this.fb.nonNullable.control<string>(p?.tipoOro ?? (p?.ley && p.ley < 85 ? 'VERDE' : 'ROJO')),
      onza: numero(p?.onza, 0.0001, 9999999999.9999, 4),
      ley: numero(p?.ley, 0.0001, 100, 4),
      porcentaje: numero(p?.porcentaje ?? 0, 0, 99.9999, 4),
      tipoCambio: numero(p?.tipoCambio, 0.0001, 999999.9999, 4),
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

