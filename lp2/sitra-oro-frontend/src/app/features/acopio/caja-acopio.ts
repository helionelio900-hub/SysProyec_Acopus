import { Component } from '@angular/core';
import { CajaPanel } from '../../core/caja/caja-panel';

/** Caja del centro de acopio (solo soles): saldo, ingresos del mayorista, gastos y movimientos. */
@Component({
  selector: 'app-caja-acopio',
  imports: [CajaPanel],
  template: `
    <section class="terminal-workspace resumen-acopio pagina-acopio">
      <header class="dash-header">
        <div>
          <h1>Caja del centro</h1>
          <p>Registra lo que te paga el mayorista y tus gastos. Los pagos a mineros y los préstamos se descuentan solos.</p>
        </div>
      </header>
      <app-caja-panel ambito="acopio" />
    </section>
  `,
})
export class CajaAcopio {}
