import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { Minero } from './mineros/minero';
import { MineroService } from './mineros/minero.service';
import {
  AcumuladosAcopio,
  OperacionesService,
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
  protected readonly acumulados = signal<AcumuladosAcopio | null>(null);
  protected readonly cargando = signal(true);
  protected readonly guardando = signal(false);
  protected readonly error = signal('');
  protected readonly mensaje = signal('');
  protected readonly ultimoResultado = signal<TransaccionAcopio | null>(null);
  protected readonly form = this.fb.nonNullable.group({
    idMinero: [0, [Validators.required, Validators.min(1)]],
    pesoSinFundirG: [0, [Validators.required, Validators.min(0.001)]],
    pesoFundidoNetoG: [0, [Validators.required, Validators.min(0.001)]],
    tipoOro: ['ROJO' as 'ROJO' | 'VERDE', Validators.required],
    aplicarAjuste: [false],
    precioAjustePen: [0],
  });
  ngOnInit(): void {
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
  }
  protected registrar(): void {
    this.error.set('');
    this.mensaje.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    if (value.pesoFundidoNetoG > value.pesoSinFundirG) {
      this.error.set('El peso fundido neto no puede superar el peso sin fundir.');
      return;
    }
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
  protected dinero(valor: number): string {
    return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(valor);
  }
  protected gramos(valor: number): string {
    return `${new Intl.NumberFormat('es-PE', { maximumFractionDigits: 3 }).format(valor)} g`;
  }
}
