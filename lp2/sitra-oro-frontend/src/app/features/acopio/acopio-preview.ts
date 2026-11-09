import { Component, Injectable } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Observable, of } from 'rxjs';
import {
  CompraAcopio,
  CrearMovimientoCaja,
  MovimientoCaja,
  PrestamoMinero,
  ResumenCaja,
  SolicitudMinero,
  TransaccionAcopio,
} from '../../core/api/operaciones.service';
import { EntregaMinero } from '../../core/api/entregas-minero';

const MINEROS = [
  { idMinero: 1, documentoIdentidad: '74057382', nombresApellidos: 'ELOY RUBEN MAMANI ARAPA' },
  { idMinero: 2, documentoIdentidad: '42813377', nombresApellidos: 'JUANA QUISPE CONDORI' },
  { idMinero: 3, documentoIdentidad: '45120988', nombresApellidos: 'PERCY HUANCA MAMANI' },
  { idMinero: 4, documentoIdentidad: '70345612', nombresApellidos: 'ROSA CCALLO TICONA' },
];

function fechaHace(dias: number, hora = 9): string {
  const d = new Date();
  d.setDate(d.getDate() - dias);
  d.setHours(hora, 15 + (dias % 40), 0, 0);
  return d.toISOString();
}

/** Datos ficticios del acopiador: solo para la ruta de desarrollo /vista-previa/acopio. */
@Injectable()
export class AcopioPreviewService {
  private readonly comprasDemo: CompraAcopio[] = [];
  private readonly partidasDemo: TransaccionAcopio[] = [];
  private cajaDemo: MovimientoCaja[] = [];

  constructor() {
    let idCompra = 1;
    let idPartida = 1;
    for (let dia = 29; dia >= 0; dia--) {
      const comprasDelDia = dia % 4 === 3 ? 0 : 1 + ((dia * 7) % 3);
      for (let k = 0; k < comprasDelDia; k++) {
        const minero = MINEROS[(dia + k) % MINEROS.length];
        const color: 'ROJO' | 'VERDE' = (dia + k) % 3 === 0 ? 'VERDE' : 'ROJO';
        const fundido = Math.round((6 + ((dia * 13 + k * 5) % 19)) * 1000) / 1000;
        const precio = color === 'ROJO' ? 362.4 : 331.8;
        const total = Math.round(fundido * precio * 100) / 100;
        const enviada = dia > 6;
        const partida: TransaccionAcopio = {
          idTransaccionG2: idPartida++, idCompraG2: idCompra, minero, pesoSinFundirG: Math.round(fundido * 1.12 * 1000) / 1000,
          pesoFundidoNetoG: fundido, tipoOro: color, precioAplicadoPen: precio, totalPagadoPen: total,
          fechaTransaccion: fechaHace(dia, 8 + k * 2), idRecepcionMayorista: enviada ? 100 + dia : null, idLiquidacionG1: null, anulada: false,
        };
        const descuento = dia === 0 && k === 0 ? 500 : 0;
        this.partidasDemo.push(partida);
        this.comprasDemo.push({ idCompraG2: idCompra++, minero, fechaCompra: partida.fechaTransaccion, totalPagadoPen: total,
          detalles: [partida], descuentoPen: descuento, descuentoManualPen: 0, netoPagadoPen: total - descuento, idsPrestamos: [] });
      }
    }
    this.cajaDemo = [
      ...this.prestamosDemo.map((p, i): MovimientoCaja => ({ idMovimiento: 50 + i, fecha: p.fecha, moneda: 'PEN', tipo: 'EGRESO',
        origen: 'PRESTAMO', monto: p.montoPen, concepto: `Préstamo #${p.idPrestamo} · ${p.minero}`, idReferencia: p.idPrestamo,
        anulado: false, anulable: false })),
      { idMovimiento: 2, fecha: new Date().toISOString().slice(0, 10), moneda: 'PEN', tipo: 'INGRESO', origen: 'MAYORISTA', monto: 42000,
        concepto: 'Pago del mayorista · liquidación de la semana', idReferencia: null, anulado: false, anulable: true },
      { idMovimiento: 1, fecha: fechaHace(29).slice(0, 10), moneda: 'PEN', tipo: 'INGRESO', origen: 'SALDO_INICIAL', monto: 260000,
        concepto: 'Saldo de apertura', idReferencia: null, anulado: false, anulable: true },
    ];
  }

  compras(): Observable<CompraAcopio[]> { return of(structuredClone(this.comprasDemo)); }
  transacciones(): Observable<TransaccionAcopio[]> { return of(structuredClone(this.partidasDemo)); }
  prestamos(): Observable<PrestamoMinero[]> {
    return of(structuredClone(this.prestamosDemo));
  }
  private prestamosDemo: PrestamoMinero[] = [
      { idPrestamo: 4, idMinero: 2, minero: MINEROS[1].nombresApellidos, documentoMinero: MINEROS[1].documentoIdentidad,
        fecha: fechaHace(2).slice(0, 10), montoPen: 800, observacion: 'Para víveres', estado: 'PENDIENTE', idCompraG2: null },
      { idPrestamo: 5, idMinero: 3, minero: MINEROS[2].nombresApellidos, documentoMinero: MINEROS[2].documentoIdentidad,
        fecha: fechaHace(1).slice(0, 10), montoPen: 350, observacion: 'Pasaje a Juliaca', estado: 'PENDIENTE', idCompraG2: null },
  ];
  solicitudes(): Observable<SolicitudMinero[]> {
    return of([{ documentoIdentidad: '71880213', idMinero: 9, idCentroAcopioPreferido: 21 }]);
  }
  solicitudesEntrega(): Observable<EntregaMinero[]> {
    return of([{ ID_SOLICITUD: 7, ID_MINERO: 4, ID_COMPRA_G2: null, ESTADO: 'PENDIENTE', CENTRO: 'Acopio Demo',
      NOMBRES_APELLIDOS: MINEROS[3].nombresApellidos, PARTIDAS: [] }]);
  }
  cajaAcopio(): Observable<ResumenCaja> {
    const vivos = this.cajaDemo.filter((m) => !m.anulado);
    const pagos = this.comprasDemo.reduce((s, c) => s + (c.netoPagadoPen ?? c.totalPagadoPen), 0);
    const prestado = vivos.filter((m) => m.origen === 'PRESTAMO').reduce((s, m) => s + m.monto, 0);
    const saldo = vivos.reduce((s, m) => s + (m.tipo === 'INGRESO' ? m.monto : -m.monto), 0) - pagos;
    return of({ saldoPen: saldo, saldoUsd: 0, mesPen: { ingresos: 302000, egresos: pagos + prestado }, mesUsd: { ingresos: 0, egresos: 0 },
      ultimos: [...this.cajaDemo, ...this.comprasDemo.slice(-4).reverse().map((c, i) => ({
        idMovimiento: 100 + i, fecha: c.fechaCompra.slice(0, 10), moneda: 'PEN' as const, tipo: 'EGRESO' as const, origen: 'PAGO_COMPRA' as const,
        monto: c.netoPagadoPen ?? c.totalPagadoPen, concepto: `Compra #${c.idCompraG2} · ${c.minero.nombresApellidos}`,
        idReferencia: c.idCompraG2, anulado: false, anulable: false }))] });
  }
  registrarMovimientoCajaAcopio(r: CrearMovimientoCaja): Observable<MovimientoCaja> {
    const nuevo: MovimientoCaja = { idMovimiento: this.cajaDemo.length + 1, fecha: new Date().toISOString().slice(0, 10), moneda: 'PEN',
      tipo: r.tipo, origen: r.saldoInicial ? 'SALDO_INICIAL' : 'MANUAL', monto: r.monto, concepto: r.concepto,
      idReferencia: null, anulado: false, anulable: true };
    this.cajaDemo = [nuevo, ...this.cajaDemo];
    return of({ ...nuevo });
  }
  registrarPagoMayoristaAcopio(r: { montoPen: number; concepto?: string }): Observable<MovimientoCaja[]> {
    const nuevo: MovimientoCaja = { idMovimiento: this.cajaDemo.length + 1, fecha: new Date().toISOString().slice(0, 10), moneda: 'PEN',
      tipo: 'INGRESO', origen: 'MAYORISTA', monto: r.montoPen, concepto: r.concepto || 'Pago del mayorista',
      idReferencia: null, anulado: false, anulable: true };
    this.cajaDemo = [nuevo, ...this.cajaDemo];
    return of([{ ...nuevo }]);
  }
  registrarPrestamo(r: { idMinero: number; montoPen: number; observacion?: string }): Observable<PrestamoMinero> {
    const m = MINEROS.find((x) => x.idMinero === r.idMinero) ?? MINEROS[0];
    const nuevo: PrestamoMinero = { idPrestamo: 100 + this.prestamosDemo.length, idMinero: m.idMinero, minero: m.nombresApellidos,
      documentoMinero: m.documentoIdentidad, fecha: new Date().toISOString().slice(0, 10), montoPen: r.montoPen,
      observacion: r.observacion ?? null, estado: 'PENDIENTE', idCompraG2: null };
    this.prestamosDemo = [nuevo, ...this.prestamosDemo];
    this.cajaDemo = [{ idMovimiento: 900 + this.prestamosDemo.length, fecha: nuevo.fecha, moneda: 'PEN', tipo: 'EGRESO', origen: 'PRESTAMO',
      monto: r.montoPen, concepto: `Préstamo #${nuevo.idPrestamo} · ${m.nombresApellidos}`, idReferencia: nuevo.idPrestamo, anulado: false, anulable: false }, ...this.cajaDemo];
    return of({ ...nuevo });
  }
  anularPrestamo(id: number): Observable<PrestamoMinero> {
    const p = this.prestamosDemo.find((x) => x.idPrestamo === id)!;
    this.prestamosDemo = this.prestamosDemo.filter((x) => x.idPrestamo !== id);
    this.cajaDemo = this.cajaDemo.map((m) => (m.origen === 'PRESTAMO' && m.idReferencia === id ? { ...m, anulado: true } : m));
    return of({ ...p, estado: 'ANULADO' });
  }
  anularMovimientoCajaAcopio(id: number): Observable<MovimientoCaja> {
    this.cajaDemo = this.cajaDemo.map((m) => (m.idMovimiento === id ? { ...m, anulado: true, anulable: false } : m));
    return of({ ...this.cajaDemo.find((m) => m.idMovimiento === id)! });
  }
}

/** Mineros ficticios para la vista previa (sustituye al servicio real de mineros). */
@Injectable()
export class MinerosPreviewService {
  listar(): Observable<{ idMinero: number; documentoIdentidad: string; nombresApellidos: string; fechaRegistro: string }[]> {
    return of(MINEROS.map((m) => ({ ...m, fechaRegistro: fechaHace(60) })));
  }
}

/** Marco de la vista previa del acopiador (mismo diseño que la del mayorista). */
@Component({
  selector: 'app-acopio-preview',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  styleUrl: '../mayorista/mayorista-preview.css',
  template: `
    <div class="shell preview-shell">
      <header class="header">
        <a routerLink="/" class="brand"><img src="/images/logo-sitra-oro.jpg" alt="" width="38" height="38" /><span>SITRA<span>-ORO</span></span></a>
        <div class="account"><span class="role">Vista previa · Acopiador</span><a class="exit-preview" routerLink="/">Volver al inicio</a></div>
      </header>
      <aside class="sidebar" aria-label="Navegación de la vista previa">
        <p class="section">Espacio de trabajo</p>
        <a routerLink="/vista-previa/acopio" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Resumen</a>
        <a routerLink="/vista-previa/acopio/caja" routerLinkActive="active">Caja y adelantos</a>
        <a routerLink="/vista-previa/acopio/mercado" routerLinkActive="active">Mercado del oro</a>
      </aside>
      <main class="content" id="main-content">
        <p class="preview-banner" role="status">Vista previa de desarrollo · Datos ficticios de demostración, no operaciones reales</p>
        <router-outlet />
      </main>
    </div>
  `,
})
export class AcopioPreview {}
