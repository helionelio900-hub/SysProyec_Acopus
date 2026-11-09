import { Component, OnInit, computed, inject, signal, viewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { HttpErrorResponse } from '@angular/common/http';
import { Adelanto, CentroAcopio, MonedaPago, OperacionesService, ResumenCaja } from '../../core/api/operaciones.service';
import { CajaPanel } from '../../core/caja/caja-panel';

/** Caja del mayorista (soles y dólares) y adelantos a centros de acopio, fuera del resumen para no saturarlo. */
@Component({
  selector: 'app-caja-mayorista',
  imports: [DatePipe, MatButtonModule, ReactiveFormsModule, CajaPanel],
  templateUrl: './caja-mayorista.html',
})
export class CajaMayorista implements OnInit {
  private readonly operaciones = inject(OperacionesService);
  private readonly fb = inject(FormBuilder);

  protected readonly centros = signal<CentroAcopio[]>([]);
  protected readonly centrosActivos = computed(() => this.centros().filter((c) => c.activo));
  protected readonly adelantosPendientes = signal<Adelanto[]>([]);
  protected readonly totalPendientePen = computed(() => this.adelantosPendientes().reduce((s, a) => s + a.montoPen, 0));
  protected readonly guardandoAdelanto = signal(false);
  /** Saldo de la caja (lo avisa el panel de caja), para no entregar más dinero del que hay. */
  protected readonly saldos = signal<ResumenCaja | null>(null);
  private readonly monedaElegida = signal<MonedaPago>('PEN');
  private readonly montoElegido = signal(0);
  protected readonly disponible = computed(() => {
    const s = this.saldos();
    if (!s) return null;
    return this.monedaElegida() === 'USD' ? s.saldoUsd : s.saldoPen;
  });
  protected readonly sinSaldo = computed(() => {
    const d = this.disponible();
    return d !== null && this.montoElegido() > d;
  });
  protected readonly mensajeAdelanto = signal('');
  protected readonly errorAdelanto = signal('');

  /** Panel de caja compartido; se recarga cuando cambian los adelantos. */
  private readonly cajaPanel = viewChild(CajaPanel);

  protected readonly formAdelanto = this.fb.nonNullable.group({
    idCentroAcopio: [0, [Validators.required, Validators.min(1)]],
    moneda: ['PEN' as MonedaPago, Validators.required],
    monto: [0, [Validators.required, Validators.min(0.01)]],
    tipoCambio: [3.75, [Validators.min(0.0001)]],
    observacion: ['', Validators.maxLength(200)],
  });

  constructor() {
    this.formAdelanto.controls.moneda.valueChanges.subscribe((m) => this.monedaElegida.set(m));
    this.formAdelanto.controls.monto.valueChanges.subscribe((v) => this.montoElegido.set(Number(v) || 0));
  }

  ngOnInit(): void {
    this.cargarAdelantos();
    this.operaciones.centros().subscribe({
      next: (datos) => this.centros.set(datos),
      error: () => this.centros.set([]),
    });
  }

  private cargarAdelantos(): void {
    this.operaciones.adelantos(undefined, 'PENDIENTE').subscribe({
      next: (datos) => this.adelantosPendientes.set(datos),
      error: () => this.adelantosPendientes.set([]),
    });
  }

  protected registrarAdelanto(): void {
    this.mensajeAdelanto.set('');
    this.errorAdelanto.set('');
    const v = this.formAdelanto.getRawValue();
    if (this.formAdelanto.invalid || (v.moneda === 'USD' && !(v.tipoCambio > 0))) {
      this.formAdelanto.markAllAsTouched();
      this.errorAdelanto.set('Elige el centro, ingresa un monto mayor que cero y, si es en dólares, el tipo de cambio.');
      return;
    }
    this.guardandoAdelanto.set(true);
    this.operaciones
      .registrarAdelanto({
        idCentroAcopio: Number(v.idCentroAcopio),
        moneda: v.moneda,
        monto: Number(v.monto),
        tipoCambio: v.moneda === 'USD' ? Number(v.tipoCambio) : null,
        observacion: v.observacion.trim() || undefined,
      })
      .subscribe({
        next: (a) => {
          this.guardandoAdelanto.set(false);
          this.mensajeAdelanto.set(
            `Adelanto #${a.idAdelanto} registrado: ${this.dinero(a.monto, a.moneda)} para ${a.nombreCentro}. Se descontará al pagar su próximo lote.`,
          );
          this.formAdelanto.patchValue({ monto: 0, observacion: '' });
          this.formAdelanto.markAsUntouched();
          this.cargarAdelantos();
                this.cajaPanel()?.cargar();
        },
        error: (e: HttpErrorResponse) => {
          this.guardandoAdelanto.set(false);
          this.errorAdelanto.set(e.error?.message ?? 'No se pudo registrar el adelanto.');
        },
      });
  }

  protected anularAdelanto(a: Adelanto): void {
    if (!confirm(`¿Anular el adelanto #${a.idAdelanto} de ${this.dinero(a.monto, a.moneda)}?`)) return;
    this.operaciones.anularAdelanto(a.idAdelanto).subscribe({
      next: () => {
        this.mensajeAdelanto.set(`Adelanto #${a.idAdelanto} anulado.`);
        this.cargarAdelantos();
            this.cajaPanel()?.cargar();
      },
      error: (e: HttpErrorResponse) => this.errorAdelanto.set(e.error?.message ?? 'No se pudo anular el adelanto.'),
    });
  }

  protected dinero(valor: number | null | undefined, moneda: MonedaPago = 'PEN'): string {
    return new Intl.NumberFormat('es-PE', { style: 'currency', currency: moneda }).format(valor ?? 0);
  }
}
