import { DatePipe } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { EntregaMinero } from '../../core/api/entregas-minero';
import { environment } from '../../../environments/environment';
import { Component, DestroyRef, ElementRef, OnInit, computed, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormArray, FormBuilder, FormControl, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { Minero } from './mineros/minero';
import { MineroService } from './mineros/minero.service';
import { EntregasRecibidas } from './entregas-recibidas';
import {
  AcumuladosAcopio,
  CompraAcopio,
  AjusteCompra,
  OperacionesService,
  ReporteEntregasAcopiador,
  TransaccionAcopio,
} from '../../core/api/operaciones.service';

@Component({
  selector: 'app-operaciones-acopio',
  imports: [ReactiveFormsModule, DatePipe, MatButtonModule, EntregasRecibidas],
  templateUrl: './operaciones.html',
  styleUrls: ['./operaciones.css', './operaciones-confirmacion.css', './operaciones-compra.css'],
})
export class OperacionesAcopio implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly servicio = inject(OperacionesService);
  private readonly minerosService = inject(MineroService);
  private readonly http = inject(HttpClient);
  protected readonly solicitudesAceptadas = signal<EntregaMinero[]>([]);
  protected readonly solicitudCompra = signal<EntregaMinero | null>(null);
  protected readonly errorSolicitudesCompra = signal('');
  private cargarSolicitudesCompra(): void {
    this.http.get<EntregaMinero[]>(`${environment.apiBaseUrl}/api/v1/acopio/solicitudes-entrega`).subscribe({
      next: items => { this.solicitudesAceptadas.set(items.filter(s => s.ESTADO === 'ACEPTADA')); this.errorSolicitudesCompra.set(''); },
      error: () => this.errorSolicitudesCompra.set('No se pudieron consultar las partidas solicitadas. Actualiza los datos antes de registrar esta compra.'),
    });
  }
  protected solicitudesDelMinero(): EntregaMinero[] {
    return this.solicitudesAceptadas().filter(s => s.ID_MINERO === this.form.controls.idMinero.value);
  }
  protected seleccionarSolicitud(id: number): void {
    const solicitud = this.solicitudesDelMinero().find(s => s.ID_SOLICITUD === Number(id));
    this.solicitudCompra.set(solicitud ?? null);
    this.partidasCompra.clear();
    if (solicitud) {
      for (const p of solicitud.PARTIDAS) {
        const fila = this.crearPartida();
        fila.patchValue({ tipoOro: p.COLOR as 'ROJO' | 'VERDE', pesoSinFundirG: p.PESO_CRUDO, pesoFundidoNetoG: p.PESO_ESTIMADO });
        this.partidasCompra.push(fila);
      }
    } else this.partidasCompra.push(this.crearPartida());
  }
  private readonly confirmacionEntrega = viewChild.required<ElementRef<HTMLDialogElement>>('confirmacionEntrega');
  private readonly confirmacionCompra = viewChild.required<ElementRef<HTMLDialogElement>>('confirmacionCompra');
  protected readonly seccionActiva = signal<'recepcion' | 'entrega' | 'historial' | 'reporte'>('entrega');
  protected abrirCompraSolicitada(solicitud: EntregaMinero): void {
    if (this.guardando() || this.enviandoMayorista()) return;
    this.solicitudesAceptadas.update(items => [...items.filter(s => s.ID_SOLICITUD !== solicitud.ID_SOLICITUD), solicitud]);
    this.form.controls.idMinero.setValue(solicitud.ID_MINERO);
    this.seleccionarSolicitud(solicitud.ID_SOLICITUD);
    this.seccionActiva.set('entrega');
    this.abrirRegistroDesdeEntrega();
  }
  protected readonly registroDesdeEntrega = signal(false);
  protected abrirRegistroDesdeEntrega(): void {
    if (this.guardando() || this.enviandoMayorista()) return;
    this.registroDesdeEntrega.set(true);
    setTimeout(() => document.getElementById('compact-purchase-title')?.scrollIntoView({ block: 'start', behavior: 'smooth' }));
  }
  protected precioRegistroVigente(tipoOro: string): number | undefined {
    return this.cotizacionesColor().find((precio) => precio.color === tipoOro)?.precioGramoPen;
  }
  protected readonly secciones = [
    { id: 'recepcion', nombre: 'Recepción de mineros' },
    { id: 'entrega', nombre: 'Preparar entrega' },
    { id: 'historial', nombre: 'Historial de compras' },
    { id: 'reporte', nombre: 'Reporte de entregas' },
  ] as const;
  protected readonly mineros = signal<Minero[]>([]);
  protected readonly cargandoMineros = signal(true);
  protected readonly errorMineros = signal('');
  protected readonly operaciones = signal<TransaccionAcopio[]>([]);
  protected readonly comprasActivas = computed(() => this.operaciones().filter((compra) => !compra.anulada));
  protected readonly comprasEliminadas = computed(() => this.operaciones().filter((compra) => compra.anulada));
  protected readonly acumulados = signal<AcumuladosAcopio | null>(null);
  protected readonly cotizacionesColor = signal<{ color: string; precioGramoPen: number; fechaPublicacion: string }[]>([]);
  protected readonly cargando = signal(true);
  protected readonly errorTransacciones = signal('');
  protected readonly guardando = signal(false);
  protected readonly error = signal('');
  protected readonly mensaje = signal('');
  protected readonly comprasRegistradas = signal<CompraAcopio[]>([]);
  protected readonly errorCompras = signal('');
  protected readonly comprasSeleccionadas = signal<number[]>([]);
  protected readonly coloresEnvio = ['ROJO', 'VERDE'] as const;
  protected comprasPorColor(color: 'ROJO' | 'VERDE'): TransaccionAcopio[] {
    return this.comprasActivas().filter((compra) => compra.tipoOro === color);
  }
  protected readonly comprasDisponibles = computed(() =>
    this.comprasActivas().filter((compra) => this.puedeSeleccionarParaMayorista(compra))
  );
  protected seleccionarCompra(compra: TransaccionAcopio, marcada: boolean): void {
    if (this.enviandoMayorista() || this.cargando() || !this.puedeSeleccionarParaMayorista(compra)) return;
    const indice = this.lineasEnvio.controls.findIndex((linea) => linea.value === compra.idTransaccionG2);
    if (!marcada) {
      if (indice >= 0) this.quitarCompraEnvio(indice);
      return;
    }
    if (indice >= 0) return;
    const vacia = this.lineasEnvio.controls.find((linea) => linea.value === 0);
    if (vacia) vacia.setValue(compra.idTransaccionG2);
    else if (this.lineasEnvio.length < 200) {
      this.lineasEnvio.push(this.fb.nonNullable.control(compra.idTransaccionG2, [Validators.required, Validators.min(1)]));
    }
  }
  protected readonly lineasEnvio = new FormArray<FormControl<number>>([this.fb.nonNullable.control(0, [Validators.required, Validators.min(1)])], {
    validators: (control: AbstractControl): ValidationErrors | null => {
      const ids = (control as FormArray).controls.map((linea) => Number(linea.value));
      if (!ids.length || ids.some((id) => id <= 0)) return { coleccionRequerida: true };
      if (ids.length > 200) return { coleccionExcesiva: true };
      return new Set(ids).size === ids.length ? null : { compraDuplicada: true };
    },
  });
  protected quitarCompraEnvio(indice: number): void {
    if (this.enviandoMayorista()) return;
    if (this.lineasEnvio.length === 1) this.lineasEnvio.at(0).setValue(0);
    else this.lineasEnvio.removeAt(indice);
  }
  protected readonly pesoSeleccionado = computed(() => {
    const seleccionadas = new Set(this.comprasSeleccionadas());
    const compras = this.operaciones().filter((compra) => seleccionadas.has(compra.idTransaccionG2));
    const gramos = (tipo: 'ROJO' | 'VERDE') => compras
      .filter((compra) => compra.tipoOro === tipo)
      .reduce((total, compra) => total + Math.round(compra.pesoFundidoNetoG * 1000), 0) / 1000;
    const lineas = compras.map((compra) => ({
      compra,
      mermaG: Math.round((compra.pesoSinFundirG - compra.pesoFundidoNetoG) * 1000) / 1000,
    }));
    const mermaTotal = lineas.reduce((total, linea) => total + linea.mermaG, 0);
    return { lineas, rojo: gramos('ROJO'), verde: gramos('VERDE'), total: gramos('ROJO') + gramos('VERDE'), mermaTotal };
  });
  protected readonly enviandoMayorista = signal(false);
  protected readonly reporteEntregas = signal<ReporteEntregasAcopiador | null>(null);
  protected readonly cargandoReporte = signal(false);
  protected readonly errorReporte = signal('');
  protected readonly ajustes = signal<AjusteCompra[]>([]);
  protected readonly compraAjuste = signal<TransaccionAcopio | null>(null);
  protected readonly tipoAjuste = signal<'EDICION' | 'ANULACION'>('EDICION');
  protected readonly enviandoAjuste = signal(false);
  protected readonly detalleAjuste = signal<AjusteCompra | null>(null);
  protected verDetalleAjuste(ajuste: AjusteCompra): void { this.detalleAjuste.set(ajuste); }
  protected cerrarDetalleAjuste(): void { this.detalleAjuste.set(null); }
  protected readonly formAjuste = this.fb.nonNullable.group({
    motivo: ['', [Validators.required, Validators.minLength(8)]],
    tipoOroNuevo: ['ROJO' as 'ROJO' | 'VERDE', Validators.required],
    pesoSinFundirNuevo: [0, [Validators.required, Validators.min(0.001)]],
    pesoFundidoNuevo: [0, [Validators.required, Validators.min(0.001)]],
    precioNuevo: [0, [Validators.required, Validators.min(0.01)]],
  });
  private crearPartida() {
    return this.fb.nonNullable.group({
      tipoOro: ['ROJO' as 'ROJO' | 'VERDE', Validators.required],
      pesoSinFundirG: [0, [Validators.required, Validators.min(0.001), Validators.max(9999999.999), Validators.pattern(/^\d+(\.\d{1,3})?$/)]],
      pesoFundidoNetoG: [0, [Validators.required, Validators.min(0.001), Validators.max(9999999.999), Validators.pattern(/^\d+(\.\d{1,3})?$/)]],
      aplicarAjuste: [false],
      precioAjustePen: [0],
    }, { validators: (control: AbstractControl): ValidationErrors | null => {
      const precio = control.get('precioAjustePen')?.value;
      return control.get('aplicarAjuste')?.value &&
        (!Number.isFinite(precio) || precio <= 0 || precio > 99999999.99 || !/^\d+(\.\d{1,2})?$/.test(String(precio)))
        ? { precioExcepcionalInvalido: true } : null;
    } });
  }
  protected readonly form = this.fb.nonNullable.group({
    idMinero: [0, [Validators.required, Validators.min(1)]],
    detalles: this.fb.array([this.crearPartida()], [Validators.minLength(1), Validators.maxLength(200)]),
  });
  protected get partidasCompra() { return this.form.controls.detalles; }
  private readonly valoresPartidas = signal(this.partidasCompra.getRawValue());
  protected readonly resumenCompra = computed(() => {
    const lineas = this.valoresPartidas().map((partida) => {
      const precio = partida.aplicarAjuste ? partida.precioAjustePen : this.precioRegistroVigente(partida.tipoOro);
      const importe = precio && precio > 0 && partida.pesoFundidoNetoG > 0
        ? Math.round((partida.pesoFundidoNetoG * precio + Number.EPSILON) * 100) / 100 : 0;
      return { precio, importe, peso: partida.pesoFundidoNetoG };
    });
    return { lineas, total: Math.round(lineas.reduce((sum, linea) => sum + linea.importe, 0) * 100) / 100,
      peso: Math.round(lineas.reduce((sum, linea) => sum + (linea.peso || 0), 0) * 1000) / 1000 };
  });
  protected agregarPartida(): void {
    if (!this.guardando() && this.partidasCompra.length < 200) this.partidasCompra.push(this.crearPartida());
  }
  protected quitarPartida(indice: number): void {
    if (!this.guardando() && this.partidasCompra.length > 1) this.partidasCompra.removeAt(indice);
  }
  protected mineroCompra(): string {
    return this.mineros().find(minero => minero.idMinero === this.form.controls.idMinero.value)?.nombresApellidos ?? '';
  }
  ngOnInit(): void {
    this.form.controls.idMinero.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      const solicitudes = this.solicitudesDelMinero();
      this.seleccionarSolicitud(solicitudes.length === 1 ? solicitudes[0].ID_SOLICITUD : 0);
    });
    this.lineasEnvio.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((ids) => this.comprasSeleccionadas.set(ids.map(Number).filter((id) => id > 0)));
    this.form.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.valoresPartidas.set(this.partidasCompra.getRawValue());
      });
    this.cargar();
    this.minerosService.listar().subscribe({
      next: (items) => {
        this.mineros.set(items);
        this.cargandoMineros.set(false);
        this.errorMineros.set('');
      },
      error: () => {
        this.mineros.set([]);
        this.cargandoMineros.set(false);
        this.errorMineros.set('No se pudo cargar la lista de mineros. Actualiza los datos para intentarlo de nuevo.');
      },
    });
  }
  protected cargar(): void {
    this.cargarSolicitudesCompra();
    this.errorCompras.set('');
    this.servicio.compras().subscribe({
      next: compras => this.comprasRegistradas.set(compras),
      error: () => this.errorCompras.set('No se pudieron cargar las compras con sus partidas. Comprueba que el backend esté actualizado.'),
    });
    this.servicio.cotizacionesColor().subscribe({ next: (precios) => this.cotizacionesColor.set(precios), error: () => this.error.set('No se pudo consultar la cotización del mayorista.') });
    this.cargando.set(true);
    this.errorTransacciones.set('');
    this.error.set('');
    this.servicio.transacciones().subscribe({
      next: (datos) => {
        this.operaciones.set(datos);
        const idsDisponibles = new Set(datos.filter((compra) => this.puedeSeleccionarParaMayorista(compra))
          .map((compra) => compra.idTransaccionG2));
        this.lineasEnvio.controls.forEach((linea) => {
          if (linea.value > 0 && !idsDisponibles.has(linea.value)) linea.setValue(0);
        });
        this.cargando.set(false);
        console.info(`[Acopio] ${datos.length} compra(s) recibida(s).`);
      },
      error: (response: HttpErrorResponse) => {
        this.errorTransacciones.set('No se pudo consultar el historial. Actualiza los datos para volver a cargarlo.');
        this.error.set(
          response.status === 403
            ? 'Tu cuenta no tiene permiso para ver estas compras.'
            : 'No se pudieron cargar las compras.',
        );
        this.cargando.set(false);
        console.error('[Acopio] Error al cargar compras.', response.status);
      },
    });
    this.servicio.acumulados().subscribe({
      next: (datos) => this.acumulados.set(datos),
      error: () => this.error.set('No se pudo cargar el stock disponible por tipo de oro.'),
    });
    this.servicio.ajustesAcopiador().subscribe({
      next: (datos) => this.ajustes.set(datos),
      error: () => this.error.set('No se pudo cargar el historial de ajustes.'),
    });
  }
  protected registrar(): void {
    if (this.guardando()) return;
    if (this.errorSolicitudesCompra() || (this.solicitudesDelMinero().length > 1 && !this.solicitudCompra())) {
      this.error.set(this.errorSolicitudesCompra() || 'Elige la solicitud aceptada que vas a registrar.');
      return;
    }
    this.error.set('');
    this.mensaje.set('');
    if (this.form.invalid || !this.partidasCompra.length) {
      this.form.markAllAsTouched();
      this.error.set('Selecciona un minero y completa los pesos y precios de todas las partidas.');
      return;
    }
    if (this.resumenCompra().lineas.some(linea => !linea.precio || linea.precio <= 0)) {
      this.error.set('Una partida no tiene precio publicado. Ingresa un precio excepcional para esa partida.');
      return;
    }
    this.confirmacionCompra().nativeElement.showModal();
  }
  protected cancelarRegistroCompra(): void { this.confirmacionCompra().nativeElement.close(); }
  protected confirmarRegistroCompra(): void {
    if (this.guardando() || this.form.invalid || !this.partidasCompra.length) return;
    const value = this.form.getRawValue();
    this.confirmacionCompra().nativeElement.close();
    this.guardando.set(true);
    this.servicio
      .registrarCompra({
        idMinero: value.idMinero,
        ...(this.solicitudCompra() ? { idSolicitud: this.solicitudCompra()!.ID_SOLICITUD } : {}),
        detalles: value.detalles.map(({ aplicarAjuste, precioAjustePen, ...partida }) => ({
          ...partida,
          ...(aplicarAjuste ? { precioAplicadoPen: precioAjustePen } : {}),
        })),
      })
      .subscribe({
        next: (resultado) => {
          this.mensaje.set(
            `Compra #${resultado.idCompraG2} registrada con ${resultado.detalles.length} partida(s). Total pagado al minero: ${this.dinero(resultado.totalPagadoPen)}.`,
          );
          this.partidasCompra.clear();
          this.partidasCompra.push(this.crearPartida());
          this.form.reset({ idMinero: 0 });
          this.solicitudCompra.set(null);
          this.guardando.set(false);
          this.registroDesdeEntrega.set(false);
          this.cargar();
        },
        error: (response: HttpErrorResponse) => {
          this.error.set(
            response.error?.detail ??
              response.error?.message ??
              'No se pudo registrar la compra. Revisa los datos e inténtalo de nuevo.',
          );
          this.guardando.set(false);
          console.error('[Acopio] Compra rechazada.', response.status);
        },
      });
  }
  protected actualizarMineros(): void {
    this.cargandoMineros.set(true);
    this.errorMineros.set('');
    this.minerosService.listar().subscribe({
      next: (items) => {
        this.mineros.set(items);
        this.cargandoMineros.set(false);
      },
      error: () => {
        this.mineros.set([]);
        this.cargandoMineros.set(false);
        this.errorMineros.set('No se pudo cargar la lista de mineros. Inténtalo de nuevo.');
      },
    });
  }
  protected puedeSeleccionarParaMayorista(compra: TransaccionAcopio): boolean {
    return !compra.anulada && compra.idRecepcionMayorista === null && compra.idLiquidacionG1 === null;
  }
  protected ajusteDe(compra: TransaccionAcopio): AjusteCompra | undefined {
    return this.ajustes().find((ajuste) => ajuste.idTransaccionG2 === compra.idTransaccionG2);
  }
  protected iniciarAjuste(compra: TransaccionAcopio, tipo: 'EDICION' | 'ANULACION'): void {
    if (compra.anulada || this.guardando() || this.enviandoMayorista() || this.enviandoAjuste()) return;
    this.compraAjuste.set(compra);
    this.tipoAjuste.set(tipo);
    this.error.set('');
    this.formAjuste.reset({
      motivo: '', tipoOroNuevo: compra.tipoOro,
      pesoSinFundirNuevo: compra.pesoSinFundirG,
      pesoFundidoNuevo: compra.pesoFundidoNetoG,
      precioNuevo: compra.precioAplicadoPen,
    });
    setTimeout(() => document.getElementById('adjustment-title')?.scrollIntoView({ block: 'start' }));
  }
  protected cancelarAjuste(): void { this.compraAjuste.set(null); }
  protected solicitarAjuste(): void {
    const compra = this.compraAjuste();
    if (!compra || this.formAjuste.controls.motivo.invalid
      || (this.tipoAjuste() === 'EDICION' && this.formAjuste.invalid)) {
      this.formAjuste.markAllAsTouched();
      return;
    }
    const valores = this.formAjuste.getRawValue();
    this.enviandoAjuste.set(true);
    this.error.set('');
    this.servicio.solicitarAjusteCompra(compra.idTransaccionG2, {
      tipo: this.tipoAjuste(), motivo: valores.motivo,
      ...(this.tipoAjuste() === 'EDICION' ? {
        tipoOroNuevo: valores.tipoOroNuevo,
        pesoSinFundirNuevo: valores.pesoSinFundirNuevo,
        pesoFundidoNuevo: valores.pesoFundidoNuevo,
        precioNuevo: valores.precioNuevo,
      } : {}),
    }).subscribe({
      next: (ajuste) => {
        this.enviandoAjuste.set(false);
        this.compraAjuste.set(null);
        const indiceSeleccion = this.lineasEnvio.controls.findIndex((linea) => Number(linea.value) === compra.idTransaccionG2);
        if (indiceSeleccion >= 0) this.quitarCompraEnvio(indiceSeleccion);
        this.mensaje.set(ajuste.tipo === 'ANULACION'
          ? `Compra anulada del registro activo. La operación original queda en el historial #${ajuste.idAjuste}.`
          : `Corrección #${ajuste.idAjuste} guardada por el acopiador. La compra original queda en el historial.`);
        this.cargar();
      },
      error: (response: HttpErrorResponse) => {
        this.enviandoAjuste.set(false);
        this.error.set(response.error?.detail ?? response.error?.message ?? 'No se pudo solicitar el ajuste.');
      },
    });
  }
  protected enviarAlMayorista(): void {
    const idsComprasAcopiador = this.comprasSeleccionadas();
    if (this.lineasEnvio.invalid || !idsComprasAcopiador.length || this.enviandoMayorista() || this.guardando()) {
      this.lineasEnvio.markAllAsTouched();
      return;
    }
    this.confirmacionEntrega().nativeElement.showModal();
  }
  protected cancelarEnvioMayorista(): void {
    this.confirmacionEntrega().nativeElement.close();
  }
  protected confirmarEnvioMayorista(): void {
    const idsComprasAcopiador = [...this.comprasSeleccionadas()];
    if (this.lineasEnvio.invalid || !idsComprasAcopiador.length || this.enviandoMayorista()
      || this.guardando() || this.enviandoAjuste() || this.cargando()) return;
    this.confirmacionEntrega().nativeElement.close();
    this.error.set('');
    this.mensaje.set('');
    this.enviandoMayorista.set(true);
    this.servicio.enviarComprasMayorista({ idsComprasAcopiador }).subscribe({
      next: (recepcion) => {
        this.lineasEnvio.clear();
        this.enviandoMayorista.set(false);
        this.lineasEnvio.push(this.fb.nonNullable.control(0, [Validators.required, Validators.min(1)]));
        this.mensaje.set(
          `Entrega enviada al mayorista. Rojo: ${this.gramos(recepcion.rojo.pesoSinFundirG ?? 0)} · Verde: ${this.gramos(recepcion.verde.pesoSinFundirG ?? 0)}.`,
        );
        this.cargar();
      },
      error: (response: HttpErrorResponse) => {
        this.enviandoMayorista.set(false);
        this.error.set(this.mensajeErrorEnvio(response));
      },
    });
  }
  private mensajeErrorEnvio(response: HttpErrorResponse): string {
    if (response.status === 400) {
      return 'La selección no es válida. Agrega compras distintas y vuelve a intentarlo.';
    }
    if (response.status === 404) {
      return 'Una compra seleccionada ya no existe. Actualiza el listado antes de enviar.';
    }
    if (response.status === 409) {
      return response.error?.message ?? 'Una compra está anulada, liquidada o ya fue enviada al mayorista.';
    }
    return response.error?.message ?? 'No se pudo enviar la selección. Comprueba tu conexión e inténtalo de nuevo.';
  }
  protected consultarReporte(desde: string, hasta: string): void {
    if (desde && hasta && desde > hasta) {
      this.errorReporte.set('La fecha inicial debe ser anterior o igual a la fecha final.');
      return;
    }
    this.cargandoReporte.set(true);
    this.errorReporte.set('');
    this.servicio.reporteEntregasAcopiador(desde || undefined, hasta || undefined).subscribe({
      next: (reporte) => {
        this.reporteEntregas.set(reporte);
        this.cargandoReporte.set(false);
      },
      error: () => {
        this.errorReporte.set('No se pudo consultar el reporte de entregas. Inténtalo nuevamente.');
        this.cargandoReporte.set(false);
      },
    });
  }
  protected dinero(valor: number): string {
    return new Intl.NumberFormat('es-PE', { useGrouping: false, style: 'currency', currency: 'PEN' }).format(valor);
  }
  protected gramos(valor: number): string {
    return `${new Intl.NumberFormat('en-US', { useGrouping: false, maximumFractionDigits: 3 }).format(valor)} g`;
  }
}
