import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormArray, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { Minero } from './mineros/minero';
import { MineroService } from './mineros/minero.service';
import {
  AcumuladosAcopio,
  AjusteCompra,
  OperacionesService,
  ReporteEntregasAcopiador,
  TransaccionAcopio,
} from '../../core/api/operaciones.service';

@Component({
  selector: 'app-operaciones-acopio',
  imports: [ReactiveFormsModule, DatePipe, MatButtonModule],
  templateUrl: './operaciones.html',
  styleUrl: './operaciones.css',
})
export class OperacionesAcopio implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly servicio = inject(OperacionesService);
  private readonly minerosService = inject(MineroService);
  protected readonly mineros = signal<Minero[]>([]);
  protected readonly cargandoMineros = signal(true);
  protected readonly errorMineros = signal('');
  protected readonly operaciones = signal<TransaccionAcopio[]>([]);
  protected readonly comprasActivas = computed(() => this.operaciones().filter((compra) => !compra.anulada));
  protected readonly comprasEliminadas = computed(() => this.operaciones().filter((compra) => compra.anulada));
  protected readonly acumulados = signal<AcumuladosAcopio | null>(null);
  protected readonly cotizacionesColor = signal<{ color: string; precioGramoPen: number; fechaPublicacion: string }[]>([]);
  protected readonly cargando = signal(true);
  protected readonly guardando = signal(false);
  protected readonly error = signal('');
  protected readonly mensaje = signal('');
  protected readonly ultimoResultado = signal<TransaccionAcopio | null>(null);
  protected readonly comprasSeleccionadas = signal<number[]>([]);
  protected readonly coloresEnvio = ['ROJO', 'VERDE'] as const;
  protected comprasPorColor(color: 'ROJO' | 'VERDE'): TransaccionAcopio[] {
    return this.comprasActivas().filter((compra) => compra.tipoOro === color);
  }
  protected seleccionarCompra(compra: TransaccionAcopio, marcada: boolean): void {
    if (this.enviandoMayorista() || !this.puedeSeleccionarParaMayorista(compra)) return;
    const indice = this.lineasEnvio.controls.findIndex((linea) => Number(linea.value) === compra.idTransaccionG2);
    if (!marcada) {
      if (indice >= 0) this.quitarLineaEnvio(indice);
      return;
    }
    if (indice >= 0 || this.comprasSeleccionadas().length >= 200) return;
    const vacia = this.lineasEnvio.controls.find((linea) => Number(linea.value) === 0);
    if (vacia) vacia.setValue(compra.idTransaccionG2);
    else this.lineasEnvio.push(this.fb.nonNullable.control(compra.idTransaccionG2, [Validators.required, Validators.min(1)]));
  }
  protected readonly lineasEnvio = new FormArray([this.fb.nonNullable.control(0, [Validators.required, Validators.min(1)])], {
    validators: (control: AbstractControl): ValidationErrors | null => {
      const ids = (control as FormArray).controls.map((linea) => Number(linea.value));
      if (!ids.length || ids.some((id) => id <= 0)) return { lineaRequerida: true };
      return new Set(ids).size === ids.length ? null : { compraDuplicada: true };
    },
  });
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
  protected readonly formAjuste = this.fb.nonNullable.group({
    motivo: ['', [Validators.required, Validators.minLength(8)]],
    tipoOroNuevo: ['ROJO' as 'ROJO' | 'VERDE', Validators.required],
    pesoSinFundirNuevo: [0, [Validators.required, Validators.min(0.001)]],
    pesoFundidoNuevo: [0, [Validators.required, Validators.min(0.001)]],
    precioNuevo: [0, [Validators.required, Validators.min(0.01)]],
  });
  protected readonly form = this.fb.nonNullable.group({
    idMinero: [0, [Validators.required, Validators.min(1)]],
    pesoSinFundirG: [0, [Validators.required, Validators.min(0.001)]],
    pesoFundidoNetoG: [0, [Validators.required, Validators.min(0.001)]],
    tipoOro: ['ROJO' as 'ROJO' | 'VERDE', Validators.required],
    aplicarAjuste: [false],
    precioAjustePen: [0],
  });
  ngOnInit(): void {
    this.lineasEnvio.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((ids) => this.comprasSeleccionadas.set(ids.map(Number).filter((id) => id > 0)));
    this.form.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.ultimoResultado.set(null));
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
    this.servicio.cotizacionesColor().subscribe({ next: (precios) => this.cotizacionesColor.set(precios), error: () => this.error.set('No se pudo consultar la cotización del mayorista.') });
    this.cargando.set(true);
    this.error.set('');
    this.servicio.transacciones().subscribe({
      next: (datos) => {
        this.operaciones.set(datos);
        this.cargando.set(false);
        console.info(`[Acopio] ${datos.length} compra(s) recibida(s).`);
      },
      error: (response: HttpErrorResponse) => {
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
    this.error.set('');
    this.mensaje.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    if (value.aplicarAjuste && value.precioAjustePen <= 0) {
      this.form.controls.precioAjustePen.markAsTouched();
      this.error.set(
        'Ingresa un precio por gramo mayor que cero para aplicar el ajuste excepcional.',
      );
      return;
    }
    this.guardando.set(true);
    const { aplicarAjuste, precioAjustePen, ...datosCompra } = value;
    this.servicio
      .registrarTransaccion({
        ...datosCompra,
        ...(aplicarAjuste ? { precioAplicadoPen: precioAjustePen } : {}),
      })
      .subscribe({
        next: (resultado) => {
          this.mensaje.set(
            `Compra ${resultado.idTransaccionG2} registrada. Precio aplicado: ${this.dinero(resultado.precioAplicadoPen)} por gramo. Total pagado al minero: ${this.dinero(resultado.totalPagadoPen)}.`,
          );
          this.form.reset({
            idMinero: 0,
            pesoSinFundirG: 0,
            pesoFundidoNetoG: 0,
            tipoOro: 'ROJO',
            aplicarAjuste: false,
            precioAjustePen: 0,
          });
          this.ultimoResultado.set(resultado);
          this.guardando.set(false);
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
    if (compra.anulada) return;
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
        this.comprasSeleccionadas.update((ids) => ids.filter((id) => id !== compra.idTransaccionG2));
        this.mensaje.set(ajuste.tipo === 'ANULACION'
          ? `Compra eliminada del registro activo. La operación original queda en el historial #${ajuste.idAjuste}.`
          : `Corrección #${ajuste.idAjuste} guardada por el acopiador. La compra original queda en el historial.`);
        this.cargar();
      },
      error: (response: HttpErrorResponse) => {
        this.enviandoAjuste.set(false);
        this.error.set(response.error?.detail ?? response.error?.message ?? 'No se pudo solicitar el ajuste.');
      },
    });
  }
  protected agregarLineaEnvio(): void {
    if (this.lineasEnvio.length >= 200) return;
    this.lineasEnvio.push(this.fb.nonNullable.control(0, [Validators.required, Validators.min(1)]));
  }
  protected quitarLineaEnvio(indice: number): void {
    if (this.lineasEnvio.length <= 1) {
      this.lineasEnvio.at(0).setValue(0);
      return;
    }
    this.lineasEnvio.removeAt(indice);
  }
  protected enviarAlMayorista(): void {
    const idsComprasAcopiador = this.comprasSeleccionadas();
    if (this.lineasEnvio.invalid || !idsComprasAcopiador.length || this.enviandoMayorista()) {
      this.lineasEnvio.markAllAsTouched();
      return;
    }
    const resumenActual = this.pesoSeleccionado();
    const resumen = [
      `Vas a enviar ${idsComprasAcopiador.length} compra(s) al mayorista.`,
      `Oro rojo: ${this.gramos(resumenActual.rojo)}.`,
      `Oro verde: ${this.gramos(resumenActual.verde)}.`,
      `Peso total: ${this.gramos(resumenActual.total)}.`,
      '¿Confirmas el envío de esta selección?',
    ].join('\n');
    if (!window.confirm(resumen)) return;
    this.error.set('');
    this.mensaje.set('');
    this.enviandoMayorista.set(true);
    this.servicio.enviarComprasMayorista({ idsComprasAcopiador }).subscribe({
      next: (recepcion) => {
        this.lineasEnvio.clear();
        this.agregarLineaEnvio();
        this.enviandoMayorista.set(false);
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
    return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(valor);
  }
  protected gramos(valor: number): string {
    return `${new Intl.NumberFormat('es-PE', { maximumFractionDigits: 3 }).format(valor)} g`;
  }
}
