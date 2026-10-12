import { NumeroClaroPipe } from '../../core/numero-claro.pipe';

import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject, output, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { environment } from '../../../environments/environment';
import { EntregaMinero } from '../../core/api/entregas-minero';

@Component({
  selector: 'app-entregas-recibidas',
  imports: [NumeroClaroPipe, MatButtonModule],
  template: `
    <section class="requests" aria-labelledby="miner-deliveries-title">
      <header><div><span>SOLICITUDES DE MINEROS</span><h2 id="miner-deliveries-title">Oro por recibir del minero</h2></div>
        <button mat-stroked-button type="button" (click)="cargar()" [disabled]="cargando()">Actualizar solicitudes</button></header>
      <p>Revisa las partidas que te enviaron. El peso crudo y el oro estimado se confirman al recibir la entrega.</p>
      @if (cargando()) { <p role="status">Cargando solicitudes…</p> }
      @if (error()) { <p role="alert" class="error">{{ error() }}</p> }
      @if (mensaje()) { <p role="status">{{ mensaje() }}</p> }
      @if (entregas().length) {
        <div class="table-scroll"><table class="summary-table">
          <thead><tr><th>Solicitud / minero</th><th>Partidas</th><th>Crudo total (g)</th><th>Oro estimado (g)</th><th>Estado</th><th>Acción</th></tr></thead>
          <tbody>
            @for (entrega of entregas(); track entrega.ID_SOLICITUD) {
              <tr>
                <td><strong>{{ entrega.NOMBRES_APELLIDOS }}</strong><small>Solicitud #{{ entrega.ID_SOLICITUD }}</small></td>
                <td>{{ entrega.PARTIDAS.length }}</td>
                <td>{{ totalPeso(entrega, 'PESO_CRUDO') | numeroClaro:'1.0-3' }}</td>
                <td>{{ totalPeso(entrega, 'PESO_ESTIMADO') | numeroClaro:'1.0-3' }}</td>
                <td><span class="status">{{ entrega.ESTADO === 'COMPRA_REGISTRADA' ? 'Compra #' + entrega.ID_COMPRA_G2 : entrega.ESTADO === 'ACEPTADA' ? 'Aceptada' : 'Pendiente' }}</span></td>
                <td>
                  @if (entrega.ESTADO === 'PENDIENTE') {
                    <button mat-stroked-button type="button" [disabled]="aceptando() !== null" (click)="aceptar(entrega)">{{ aceptando() === entrega.ID_SOLICITUD ? 'Aceptando…' : 'Aceptar solicitud' }}</button>
                  } @else if (entrega.ESTADO === 'ACEPTADA') {
                    <button mat-flat-button type="button" (click)="registrarCompra.emit(entrega)">Registrar compra</button>
                  }
                  <button mat-button type="button" [attr.aria-expanded]="detalle() === entrega.ID_SOLICITUD" (click)="detalle.set(detalle() === entrega.ID_SOLICITUD ? null : entrega.ID_SOLICITUD)">{{ detalle() === entrega.ID_SOLICITUD ? 'Ocultar partidas' : 'Ver partidas' }}</button>
                </td>
              </tr>
              @if (detalle() === entrega.ID_SOLICITUD) {
                <tr><td colspan="6" class="detail-cell"><table>
                  <thead><tr><th>Partida</th><th>Color</th><th>Peso crudo (g)</th><th>Oro estimado (g)</th></tr></thead><tbody>
                    @for (partida of entrega.PARTIDAS; track partida.NUMERO) {
                      <tr><td>{{ partida.NUMERO }}</td><td>{{ partida.COLOR }}</td><td>{{ partida.PESO_CRUDO | numeroClaro:'1.0-3' }}</td><td>{{ partida.PESO_ESTIMADO | numeroClaro:'1.0-3' }}</td></tr>
                    }
                  </tbody></table></td></tr>
              }
            }
          </tbody>
        </table></div>
      } @else if (!cargando() && !error()) { <p>No hay solicitudes enviadas a este acopio.</p> }
    </section>`,
  styles: `
    :host { display:block; margin:1.5rem 0; }
    .requests { border:1px solid #d7e2f2; border-radius:12px; padding:1.2rem; background:white; color:#102b49; }
    header { display:flex; align-items:center; justify-content:space-between; gap:1rem; flex-wrap:wrap; }
    header span { font-size:.65rem; font-weight:800; color:#966800; letter-spacing:.1em; }
    h2 { font-size:1.05rem; margin:.4rem 0; } h3 { font-size:.9rem; }
    p { font-size:.8rem; line-height:1.5; } article { padding:1rem; border:1px solid #d7e2f2; border-radius:8px; margin-top:1rem; }
    .table-scroll { overflow-x:auto; } table { width:100%; border-collapse:collapse; font-size:.8rem; margin-bottom:1rem; }
    th,td { padding:.7rem; text-align:left; border-bottom:1px solid #e4ebf4; white-space:nowrap; } .error { color:#b42318; }
    small { display:block; margin-top:.35rem; color:#61738b; }
    .summary-table td:first-child { white-space:normal; min-width:170px; }
    .status { display:inline-block; padding:.35rem .6rem; border-radius:6px; background:#fff4d6; font-weight:650; }
    .detail-cell { background:#f6f8fc; padding:1rem; } .detail-cell table { margin:0; }
  `,
})
export class EntregasRecibidas implements OnInit {
  private readonly http = inject(HttpClient);
  readonly aceptada = output<void>();
  readonly registrarCompra = output<EntregaMinero>();
  protected readonly detalle = signal<number | null>(null);
  protected totalPeso(entrega: EntregaMinero, campo: 'PESO_CRUDO' | 'PESO_ESTIMADO'): number {
    return entrega.PARTIDAS.reduce((total, partida) => total + Math.round(partida[campo] * 1000), 0) / 1000;
  }
  protected readonly entregas = signal<EntregaMinero[]>([]);
  protected readonly cargando = signal(false);
  protected readonly aceptando = signal<number | null>(null);
  protected readonly error = signal('');
  protected readonly mensaje = signal('');
  ngOnInit(): void { this.cargar(); }
  cargar(): void {
    this.cargando.set(true);
    this.error.set('');
    this.http.get<EntregaMinero[]>(`${environment.apiBaseUrl}/api/v1/acopio/solicitudes-entrega`).subscribe({
      next: items => { this.entregas.set(items); this.cargando.set(false); },
      error: () => { this.error.set('No se pudieron consultar las entregas. Pulsa Actualizar solicitudes para reintentar.'); this.cargando.set(false); },
    });
  }
  protected aceptar(entrega: EntregaMinero): void {
    this.aceptando.set(entrega.ID_SOLICITUD);
    this.error.set('');
    this.http.post(`${environment.apiBaseUrl}/api/v1/acopio/solicitudes-entrega/${entrega.ID_SOLICITUD}/aceptar`, {}).subscribe({
      next: () => {
        this.aceptando.set(null);
        this.mensaje.set('Solicitud aceptada. Pulsa Registrar compra para cargar sus partidas y confirmar los pesos reales.');
        this.aceptada.emit();
        this.cargar();
      },
      error: () => { this.error.set('No se pudo aceptar la solicitud. Actualiza la lista e intenta nuevamente.'); this.aceptando.set(null); },
    });
  }
}
