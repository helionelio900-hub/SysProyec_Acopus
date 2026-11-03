import { CommonModule, DecimalPipe } from '@angular/common';
import { AfterViewInit, Component, ElementRef, ViewChild, inject, signal } from '@angular/core';
import { MercadoLiveService } from '../../core/api/mercado-live.service';

@Component({
  selector: 'app-market-chart',
  imports: [CommonModule, DecimalPipe],
  templateUrl: './market-chart.html',
  styleUrl: './market-chart.css',
})
export class MarketChart implements AfterViewInit {
  protected readonly mercado = inject(MercadoLiveService);

  @ViewChild('contenedorGrafica') private contenedorGrafica?: ElementRef<HTMLDivElement>;

  protected readonly oroMercado = this.mercado.oroMercado;
  protected readonly dolarMercado = this.mercado.dolarMercado;
  protected readonly cargandoMercado = this.mercado.cargandoMercado;
  protected readonly ultimoTickHora = this.mercado.ultimoTickHora;
  protected readonly titilarPrecio = this.mercado.titilarPrecio;

  protected readonly tipoGrafica = signal<'DUAL' | 'ORO' | 'DOLAR'>('DUAL');

  ngAfterViewInit(): void {
    this.renderGrafica();
  }

  protected cambiarGrafica(tipo: 'DUAL' | 'ORO' | 'DOLAR'): void {
    this.tipoGrafica.set(tipo);
    this.renderGrafica();
  }

  protected recargar(): void {
    this.mercado.recargar();
  }

  private renderGrafica(): void {
    if (!this.contenedorGrafica) return;
    const el = this.contenedorGrafica.nativeElement;
    el.innerHTML = '';

    const tipo = this.tipoGrafica();

    if (tipo === 'DUAL') {
      const widgetWrap = document.createElement('div');
      widgetWrap.className = 'tradingview-widget-container';
      widgetWrap.style.height = '420px';
      widgetWrap.style.width = '100%';

      const inner = document.createElement('div');
      inner.className = 'tradingview-widget-container__widget';
      inner.style.height = '100%';
      inner.style.width = '100%';
      widgetWrap.appendChild(inner);

      const s = document.createElement('script');
      s.type = 'text/javascript';
      s.src = 'https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js';
      s.async = true;
      s.text = JSON.stringify({
        symbols: [
          ['Oro Spot Kitco', 'OANDA:XAUUSD|1D'],
          ['Dólar Perú Bloomberg', 'FX_IDC:USDPEN|1D'],
        ],
        chartOnly: false,
        width: '100%',
        height: 420,
        locale: 'es',
        colorTheme: 'dark',
        autosize: true,
        showVolume: false,
        scalePosition: 'right',
        scaleMode: 'Normal',
        fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
        fontSize: '10',
        noTimeScale: false,
        valuesTracking: '1',
        chartType: 'area',
        lineColor: '#d4af37',
        bottomColor: 'rgba(212, 175, 55, 0.05)',
        topColor: 'rgba(212, 175, 55, 0.4)',
      });
      widgetWrap.appendChild(s);
      el.appendChild(widgetWrap);
    } else {
      const symbol = tipo === 'ORO' ? 'OANDA:XAUUSD' : 'FX_IDC:USDPEN';
      const widgetWrap = document.createElement('div');
      widgetWrap.className = 'tradingview-widget-container';
      widgetWrap.style.height = '450px';
      widgetWrap.style.width = '100%';

      const inner = document.createElement('div');
      inner.className = 'tradingview-widget-container__widget';
      inner.style.height = 'calc(100% - 32px)';
      inner.style.width = '100%';
      widgetWrap.appendChild(inner);

      const s = document.createElement('script');
      s.type = 'text/javascript';
      s.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
      s.async = true;
      s.text = JSON.stringify({
        width: '100%',
        height: '450',
        symbol: symbol,
        interval: 'D',
        timezone: 'America/Lima',
        theme: 'dark',
        style: '1',
        locale: 'es',
        allow_symbol_change: true,
        calendar: false,
        support_host: 'https://www.tradingview.com',
      });
      widgetWrap.appendChild(s);
      el.appendChild(widgetWrap);
    }
  }
}
