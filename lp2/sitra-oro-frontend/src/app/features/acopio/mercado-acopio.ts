import { Component, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MarketCotizacionesService } from '../../core/api/market-cotizaciones.service';
import { MarketChart } from './market-chart';

/** Mercado del oro: cotizaciones del día y gráfico histórico, separado del resumen para no saturarlo. */
@Component({
  selector: 'app-mercado-acopio',
  imports: [DecimalPipe, MarketChart],
  template: `
    <section class="terminal-workspace resumen-acopio pagina-acopio">
      <header class="dash-header">
        <div>
          <h1>Mercado del oro</h1>
          <p>Precio internacional del oro y tipo de cambio, como referencia para fijar tus precios de compra.</p>
        </div>
      </header>
      <aside class="market-ticker-tape" aria-label="Cotizaciones de mercado">
        <div class="ticker-badge"><span class="live-dot"></span><span>KITCO & FX SPOT</span></div>
        <div class="ticker-scroll">
          <div class="ticker-track">
            @for (item of market.tickers(); track item.simbolo) {
              <div class="ticker-item">
                <span class="ticker-sym">{{ item.simbolo }}</span>
                <span class="ticker-val">
                  {{ item.moneda === 'USD' ? '$' : 'S/' }} {{ item.valor | number: (item.simbolo === 'USD/PEN' ? '1.3-3' : '1.2-2') }}
                </span>
                <span class="ticker-change" [class.up]="item.variacion24h >= 0" [class.down]="item.variacion24h < 0">
                  {{ item.variacion24h >= 0 ? '▲ +' : '▼ ' }}{{ item.variacion24h }}%
                </span>
                <span class="ticker-name">{{ item.nombre }}</span>
              </div>
            }
          </div>
        </div>
      </aside>
      <app-market-chart />
    </section>
  `,
})
export class MercadoAcopio {
  protected readonly market = inject(MarketCotizacionesService);
}
