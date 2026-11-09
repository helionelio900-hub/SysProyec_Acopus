import { Component, OnInit, computed, inject, signal, viewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { OperacionesService, PrestamoMinero, ResumenCaja } from '../../core/api/operaciones.service';
import { CajaPanel } from '../../core/caja/caja-panel';
import { MineroService } from './mineros/minero.service';
import { Minero } from './mineros/minero';

/**
 * Caja del centro de acopio (solo soles) y adelantos a mineros, igual que "Caja y adelantos" del mayorista.
 * Un adelanto sale de la caja al entregarlo y se descuenta solo cuando se le compra el oro al minero.
 */
@Component({
  selector: 'app-caja-acopio',
  imports: [DatePipe, MatButtonModule, ReactiveFormsModule, CajaPanel],
  templateUrl: './caja-acopio.html',
})
export class CajaAcopio implements OnInit {
  private readonly servicio = inject(OperacionesService);
  private readonly minerosService = inject(MineroService);
  private readonly fb = inject(FormBuilder);
  private readonly cajaPanel = viewChild(CajaPanel);

  protected readonly mineros = signal<Minero[]>([]);
  protected readonly adelantos = signal<PrestamoMinero[]>([]);
  protected readonly totalPorCobrar = computed(() => this.adelantos().reduce((s, a) => s + a.montoPen, 0));
  protected readonly guardando = signal(false);
  protected readonly mensaje = signal('');
  protected readonly error = signal('');

  /** Saldo de la caja (lo avisa el panel de caja), para no adelantar más dinero del que hay. */
  protected readonly caja = signal<ResumenCaja | null>(null);
  private readonly monto = signal(0);
  protected readonly sinSaldo = computed(() => {
    const c = this.caja();
    return c !== null && this.monto() > c.saldoPen;
  });

  protected readonly form = this.fb.nonNullable.group({
    idMinero: [0, [Validators.required, Validators.min(1)]],
    montoPen: [null as number | null, [Validators.required, Validators.min(0.01), Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
    observacion: ['', Validators.maxLength(200)],
  });

  constructor() {
    this.form.controls.montoPen.valueChanges.subscribe((v) => this.monto.set(Number(v) || 0));
  }

  ngOnInit(): void {
    this.cargarAdelantos();
    this.minerosService.listar().subscribe({
      next: (lista) => this.mineros.set(lista),
      error: () => this.mineros.set([]),
    });
  }

  private cargarAdelantos(): void {
    this.servicio.prestamos(undefined, 'PENDIENTE').subscribe({
      next: (lista) => this.adelantos.set(lista),
      error: () => this.error.set('No se pudieron cargar los adelantos.'),
    });
  }

  protected registrar(): void {
    this.mensaje.set('');
    this.error.set('');
    const v = this.form.getRawValue();
    if (this.form.invalid || !v.montoPen) {
      this.form.markAllAsTouched();
      this.error.set('Elige el minero y escribe un monto mayor que cero.');
      return;
    }
    if (this.sinSaldo()) return;
    this.guardando.set(true);
    this.servicio.registrarPrestamo({ idMinero: Number(v.idMinero), montoPen: Number(v.montoPen), observacion: v.observacion.trim() || undefined })
      .subscribe({
        next: (a) => {
          this.guardando.set(false);
          this.mensaje.set(`Adelanto #${a.idPrestamo} de ${this.dinero(a.montoPen)} a ${a.minero}. Se descontará al pagarle su próxima compra.`);
          this.form.reset({ idMinero: 0, montoPen: null, observacion: '' });
          this.cargarAdelantos();
          this.cajaPanel()?.cargar();
        },
        error: (e: HttpErrorResponse) => {
          this.guardando.set(false);
          this.error.set(e.error?.message ?? 'No se pudo registrar el adelanto.');
        },
      });
  }

  protected anular(a: PrestamoMinero): void {
    if (!confirm(`¿Anular el adelanto #${a.idPrestamo} de ${this.dinero(a.montoPen)} a ${a.minero}? El dinero vuelve a la caja.`)) return;
    this.servicio.anularPrestamo(a.idPrestamo).subscribe({
      next: () => {
        this.mensaje.set(`Adelanto #${a.idPrestamo} anulado. El dinero volvió a la caja.`);
        this.cargarAdelantos();
        this.cajaPanel()?.cargar();
      },
      error: (e: HttpErrorResponse) => this.error.set(e.error?.message ?? 'No se pudo anular el adelanto.'),
    });
  }

  protected dinero(valor: number | null | undefined): string {
    return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(valor ?? 0);
  }
}
