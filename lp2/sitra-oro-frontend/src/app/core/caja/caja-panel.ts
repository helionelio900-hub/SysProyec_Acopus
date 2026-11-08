import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { Observable } from 'rxjs';
import {
  CrearMovimientoCaja,
  MonedaPago,
  MovimientoCaja,
  OperacionesService,
  ResumenCaja,
} from '../api/operaciones.service';

type Ambito = 'mayorista' | 'acopio';

/**
 * Caja compartida por mayorista y acopiador. Cada uno ve solo su propia caja: el mayorista trabaja en soles y
 * dólares y registra lo que le paga el exportador; el acopiador trabaja solo en soles y registra lo que le paga
 * el mayorista.
 */
@Component({
  selector: 'app-caja-panel',
  imports: [DatePipe, ReactiveFormsModule, MatButtonModule],
  template: `
    <section class="dash-panel caja" [attr.aria-labelledby]="'caja-titulo-' + ambito()">
      <div class="dash-panel-head">
        <div>
          <h2 [id]="'caja-titulo-' + ambito()">Caja</h2>
          <p>{{ textos().descripcion }}</p>
        </div>
      </div>

      <div class="caja-saldos" [class.caja-saldos-uno]="soloSoles()">
        <div class="caja-saldo" [class.caja-negativa]="(caja()?.saldoPen ?? 0) < 0">
          <span>En soles</span>
          <strong>{{ caja() ? dinero(caja()!.saldoPen) : '…' }}</strong>
          <small>Este mes: <b class="caja-mas">+{{ dinero(caja()?.mesPen?.ingresos) }}</b> · <b class="caja-menos">−{{ dinero(caja()?.mesPen?.egresos) }}</b></small>
        </div>
        @if (!soloSoles()) {
          <div class="caja-saldo" [class.caja-negativa]="(caja()?.saldoUsd ?? 0) < 0">
            <span>En dólares</span>
            <strong>{{ caja() ? dinero(caja()!.saldoUsd, 'USD') : '…' }}</strong>
            <small>Este mes: <b class="caja-mas">+{{ dinero(caja()?.mesUsd?.ingresos, 'USD') }}</b> · <b class="caja-menos">−{{ dinero(caja()?.mesUsd?.egresos, 'USD') }}</b></small>
          </div>
        }
      </div>
      @if ((caja()?.saldoPen ?? 0) < 0 || (caja()?.saldoUsd ?? 0) < 0) {
        <p class="liq-alerta" role="alert">La caja quedó en negativo: registra el saldo inicial o el ingreso que falta.</p>
      }

      <div class="caja-modos" role="group" aria-label="Qué quieres registrar">
        <button type="button" [class.activo]="modo() === 'externo'" [attr.aria-pressed]="modo() === 'externo'" (click)="modo.set('externo')">{{ textos().botonExterno }}</button>
        <button type="button" [class.activo]="modo() === 'movimiento'" [attr.aria-pressed]="modo() === 'movimiento'" (click)="modo.set('movimiento')">Otro ingreso o egreso</button>
      </div>

      @if (modo() === 'externo') {
        <form class="dash-form" [formGroup]="formExterno" (ngSubmit)="registrarExterno()">
          @if (!soloSoles()) {
            <label>Recibido en dólares (US$)<input type="number" min="0.01" step="0.01" inputmode="decimal" formControlName="montoUsd" placeholder="0.00" /></label>
          }
          <label>Recibido en soles (S/)<input type="number" min="0.01" step="0.01" inputmode="decimal" formControlName="montoPen" placeholder="0.00" /></label>
          @if (ambito() === 'mayorista') {
            <label>Lote de exportación (opcional)<input type="number" min="1" step="1" formControlName="referencia" placeholder="N.º de lote" /></label>
          }
          <label>Detalle (opcional)<input type="text" maxlength="200" formControlName="concepto" [placeholder]="textos().ejemploDetalle" /></label>
          <button mat-flat-button type="submit" class="button-primary" [disabled]="guardando()">Registrar pago</button>
        </form>
      } @else {
        <form class="dash-form" [formGroup]="formMovimiento" (ngSubmit)="registrarMovimiento()">
          <label>Tipo
            <select formControlName="tipo">
              <option value="INGRESO">Ingreso</option>
              <option value="EGRESO">Egreso</option>
            </select>
          </label>
          @if (!soloSoles()) {
            <label>Moneda
              <select formControlName="moneda">
                <option value="PEN">Soles (S/)</option>
                <option value="USD">Dólares (US$)</option>
              </select>
            </label>
          }
          <label>{{ soloSoles() ? 'Monto (S/)' : 'Monto' }}<input type="number" min="0.01" step="0.01" inputmode="decimal" formControlName="monto" placeholder="0.00" /></label>
          <label>Concepto<input type="text" maxlength="200" formControlName="concepto" placeholder="Ej.: retiro del banco, gastos" /></label>
          <button mat-flat-button type="submit" class="button-primary" [disabled]="guardando()">Registrar</button>
          <label class="caja-check"><input type="checkbox" formControlName="saldoInicial" /> Es el saldo inicial de la caja</label>
        </form>
      }
      @if (error()) { <p class="feedback error" role="alert">{{ error() }}</p> }
      @if (mensaje()) { <p class="feedback" role="status">{{ mensaje() }}</p> }

      @if (caja()?.ultimos?.length) {
        <div class="pro-table-wrapper dash-tabla">
          <table class="terminal-table">
            <thead><tr><th>Fecha</th><th>Concepto</th><th>Origen</th><th class="text-right">Monto</th><th></th></tr></thead>
            <tbody>
              @for (m of caja()!.ultimos; track m.idMovimiento) {
                <tr [class.caja-anulado]="m.anulado">
                  <td class="text-muted">{{ m.fecha | date: 'dd/MM/yyyy' }}</td>
                  <td>{{ m.concepto }}@if (m.anulado) { <small> · anulado</small> }</td>
                  <td class="text-muted">{{ origen(m.origen) }}</td>
                  <td class="text-right font-mono font-bold" [class.caja-mas]="m.tipo === 'INGRESO'" [class.caja-menos]="m.tipo === 'EGRESO'">
                    {{ m.tipo === 'INGRESO' ? '+' : '−' }}{{ dinero(m.monto, m.moneda) }}
                  </td>
                  <td>@if (m.anulable) { <button type="button" class="dash-anular" (click)="anular(m)">Anular</button> }</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      } @else if (caja()) {
        <p class="dash-vacio">Aún no hay movimientos. Empieza registrando el saldo inicial de la caja.</p>
      }
    </section>
  `,
})
export class CajaPanel implements OnInit {
  readonly ambito = input<Ambito>('mayorista');
  private readonly api = inject(OperacionesService);
  private readonly fb = inject(FormBuilder);

  protected readonly caja = signal<ResumenCaja | null>(null);
  protected readonly error = signal('');
  protected readonly mensaje = signal('');
  protected readonly guardando = signal(false);
  protected readonly modo = signal<'externo' | 'movimiento'>('externo');
  /** El acopiador opera solo en soles. */
  protected readonly soloSoles = computed(() => this.ambito() === 'acopio');
  protected readonly textos = computed(() => this.ambito() === 'mayorista'
    ? { descripcion: 'Dinero disponible en planta. Los pagos de lotes y los adelantos se descuentan solos.',
        botonExterno: 'Pago del exportador', ejemploDetalle: 'Ej.: transferencia de la refinería', etiqueta: 'Exportador' }
    : { descripcion: 'Dinero de tu centro de acopio. Lo que pagas a los mineros y los préstamos se descuentan solos.',
        botonExterno: 'Pago del mayorista', ejemploDetalle: 'Ej.: liquidación de la semana', etiqueta: 'Mayorista' });

  protected readonly formExterno = this.fb.nonNullable.group({
    montoUsd: [null as number | null, [Validators.min(0.01)]],
    montoPen: [null as number | null, [Validators.min(0.01)]],
    referencia: [null as number | null, [Validators.min(1)]],
    concepto: ['', Validators.maxLength(200)],
  });
  protected readonly formMovimiento = this.fb.nonNullable.group({
    tipo: ['INGRESO' as 'INGRESO' | 'EGRESO'],
    moneda: ['PEN' as MonedaPago],
    monto: [null as number | null, [Validators.required, Validators.min(0.01)]],
    concepto: ['', [Validators.required, Validators.maxLength(200)]],
    saldoInicial: [false],
  });

  ngOnInit(): void {
    this.cargar();
  }

  /** Vuelve a leer la caja (por ejemplo, después de registrar un adelanto o una compra). */
  cargar(): void {
    const peticion: Observable<ResumenCaja> = this.ambito() === 'mayorista' ? this.api.caja() : this.api.cajaAcopio();
    peticion.subscribe({
      next: (datos) => { this.caja.set(datos); this.error.set(''); },
      error: (e: HttpErrorResponse) => this.error.set(e.status === 403 ? 'Tu cuenta no tiene permiso para ver la caja.' : 'No se pudo cargar la caja.'),
    });
  }

  protected registrarExterno(): void {
    const v = this.formExterno.getRawValue();
    this.mensaje.set(''); this.error.set('');
    const sinMonto = this.soloSoles() ? !v.montoPen : !v.montoUsd && !v.montoPen;
    if (this.formExterno.invalid || sinMonto) {
      this.error.set(this.soloSoles() ? 'Ingresa cuánto te pagó el mayorista en soles.'
        : 'Ingresa el monto recibido en dólares, en soles o en ambas monedas.');
      return;
    }
    this.guardando.set(true);
    const concepto = v.concepto.trim() || undefined;
    const peticion = this.ambito() === 'mayorista'
      ? this.api.registrarIngresoExportador({ montoUsd: v.montoUsd || null, montoPen: v.montoPen || null,
          idLoteExportacion: v.referencia || null, concepto })
      : this.api.registrarPagoMayoristaAcopio({ montoPen: Number(v.montoPen), concepto });
    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.mensaje.set(`${this.textos().botonExterno} registrado en caja.`);
        this.formExterno.reset();
        this.cargar();
      },
      error: (e: HttpErrorResponse) => { this.guardando.set(false); this.error.set(e.error?.message ?? 'No se pudo registrar el pago.'); },
    });
  }

  protected registrarMovimiento(): void {
    const v = this.formMovimiento.getRawValue();
    this.mensaje.set(''); this.error.set('');
    if (this.formMovimiento.invalid || !v.monto) {
      this.formMovimiento.markAllAsTouched();
      this.error.set('Completa el monto y el concepto del movimiento.');
      return;
    }
    this.guardando.set(true);
    const datos: CrearMovimientoCaja = { tipo: v.saldoInicial ? 'INGRESO' : v.tipo, moneda: this.soloSoles() ? 'PEN' : v.moneda, monto: Number(v.monto),
      concepto: v.concepto.trim(), saldoInicial: v.saldoInicial };
    const peticion = this.ambito() === 'mayorista' ? this.api.registrarMovimientoCaja(datos) : this.api.registrarMovimientoCajaAcopio(datos);
    peticion.subscribe({
      next: (m) => {
        this.guardando.set(false);
        this.mensaje.set(`${m.tipo === 'INGRESO' ? 'Ingreso' : 'Egreso'} de ${this.dinero(m.monto, m.moneda)} registrado.`);
        this.formMovimiento.reset();
        this.cargar();
      },
      error: (e: HttpErrorResponse) => { this.guardando.set(false); this.error.set(e.error?.message ?? 'No se pudo registrar el movimiento.'); },
    });
  }

  protected anular(m: MovimientoCaja): void {
    if (!confirm(`¿Anular "${m.concepto}" por ${this.dinero(m.monto, m.moneda)}?`)) return;
    const peticion = this.ambito() === 'mayorista' ? this.api.anularMovimientoCaja(m.idMovimiento) : this.api.anularMovimientoCajaAcopio(m.idMovimiento);
    peticion.subscribe({
      next: () => { this.mensaje.set('Movimiento anulado.'); this.cargar(); },
      error: (e: HttpErrorResponse) => this.error.set(e.error?.message ?? 'No se pudo anular el movimiento.'),
    });
  }

  protected origen(origen: string): string {
    const nombres: Record<string, string> = {
      SALDO_INICIAL: 'Saldo inicial', EXPORTADOR: 'Exportador', MAYORISTA: 'Mayorista', MANUAL: 'Manual',
      PAGO_LOTE: 'Pago de lote', ADELANTO: 'Adelanto', PAGO_COMPRA: 'Pago a minero', PRESTAMO: 'Préstamo',
    };
    return nombres[origen] ?? origen;
  }

  protected dinero(valor: number | null | undefined, moneda: MonedaPago = 'PEN'): string {
    return new Intl.NumberFormat('es-PE', { style: 'currency', currency: moneda }).format(valor ?? 0);
  }
}
