import { NumeroClaroPipe } from '../../core/numero-claro.pipe';
import { A11yModule } from '@angular/cdk/a11y';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
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

type Seccion = 'recepciones' | 'exportacion' | 'historial';
@Component({
  selector: 'app-recepcion-mayorista',
  imports: [ReactiveFormsModule, MatButtonModule, NumeroClaroPipe, DatePipe, A11yModule, RouterLink],
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
  protected readonly calculo = signal<CalculoLey | null>(null);
  protected readonly cargando = signal(false);
  protected readonly calculando = signal(false);
  protected readonly guardando = signal(false);
  protected readonly error = signal('');
  protected readonly errorCalculo = signal('');
  protected readonly mensaje = signal('');
  protected readonly filtro = signal('');
  protected readonly seleccion = signal<number[]>([]);
  protected readonly confirmacion = signal<'guardar' | 'exportar' | null>(null);
  private revisionFormulario = 0;
  protected readonly form = this.fb.nonNullable.group({
    adelanto: [0, [Validators.required, Validators.min(0), Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
    detalles: this.fb.array([this.nuevaFila()]),
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
      tap(() => { this.revisionFormulario++; this.calculo.set(null); this.errorCalculo.set(''); this.calculando.set(false); }),
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
      this.calculando.set(false); this.calculo.set(resultado.calculo); this.errorCalculo.set(resultado.error);
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
    this.editando.set(null); this.confirmacion.set(null); this.calculo.set(null); this.errorCalculo.set('');
    this.origenesAcumulados.set([]);
    this.compraDirecta.set(false);
    this.revisionFormulario++; this.calculando.set(false);
  }
  protected revisar(): void {
    this.form.markAllAsTouched();
    if (this.form.valid && this.calculo() && !this.calculando() && this.editando()) this.confirmacion.set('guardar');
  }
  protected seleccionar(id: number, marcada: boolean): void {
    if (this.guardando()) return;
    this.seleccion.update(ids => marcada ? [...new Set([...ids, id])] : ids.filter(x => x !== id));
  }
  protected confirmar(): void {
    if (this.guardando()) return;
    if (this.confirmacion() === 'guardar') {
      const r = this.editando();
      if (!r || this.form.invalid || !this.calculo()) return;
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
    if (e.status === 401) return 'Tu sesión venció. Vuelve a ingresar.';
    if (e.status === 403) return 'Tu cuenta no tiene permiso para gestionar el Mayorista.';
    return e.error?.message ?? e.error?.detail ?? defecto;
  }
}

