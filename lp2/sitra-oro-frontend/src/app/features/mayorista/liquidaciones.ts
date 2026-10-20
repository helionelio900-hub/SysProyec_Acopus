import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { OperacionesService } from '../../core/api/operaciones.service';

export interface DatosOroMercado {
  bid: number;
  ask: number;
  ultimo: number;
  cambio24h: number;
  max24h: number;
  min24h: number;
}

export interface DatosDolarMercado {
  interbancario: number;
  sunatCompra?: number;
  sunatVenta?: number;
}

@Component({
  selector: 'app-liquidaciones-mayorista',
  imports: [ReactiveFormsModule, DatePipe, DecimalPipe, CommonModule, MatButtonModule],
  templateUrl: './liquidaciones.html',
  styleUrl: './liquidaciones.css',
})
export class LiquidacionesMayorista implements OnInit, AfterViewInit {
  private readonly fb = inject(FormBuilder);
  private readonly http = inject(HttpClient);
  private readonly service = inject(OperacionesService);

  @ViewChild('contenedorGrafica') private contenedorGrafica?: ElementRef<HTMLDivElement>;

  protected readonly preciosColor = signal<{ color: string; precioGramoPen: number; fechaPublicacion: string }[]>([]);
  protected readonly colores = ['ROJO', 'VERDE'] as const;

  // Monitoreo en vivo de mercado
  protected readonly oroMercado = signal<DatosOroMercado | null>(null);
  protected readonly dolarMercado = signal<DatosDolarMercado | null>(null);
  protected readonly cargandoMercado = signal(false);
  protected readonly tipoGrafica = signal<'DUAL' | 'ORO' | 'DOLAR'>('DUAL');

  protected readonly calculandoPrecio = signal(false);
  protected readonly errorPrecio = signal('');
  private consultaPrecioActual = 0;

  protected readonly form = this.fb.nonNullable.group({
    cotizacionOnzaUsd: [0, [Validators.required, Validators.min(0.01)]],
    tipoCambioUsdPen: [0, [Validators.required, Validators.min(0.0001)]],
    exportacionRojo: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
    exportacionVerde: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
    leyRojo: [90, [Validators.required, Validators.min(0.0001), Validators.max(100)]],
    leyVerde: [80, [Validators.required, Validators.min(0.0001), Validators.max(100)]],
  });

  protected precioVista(color: 'ROJO' | 'VERDE', moneda: 'USD' | 'PEN'): string {
    const valores = this.form.getRawValue();
    const porcentaje = color === 'ROJO' ? valores.exportacionRojo : valores.exportacionVerde;
    if (this.form.invalid) return '—';
    const ley = color === 'ROJO' ? valores.leyRojo : valores.leyVerde;
    const usd = valores.cotizacionOnzaUsd * (ley / 100)
      * (1 - porcentaje / 100) / 31.0999;
    return moneda === 'USD' ? `USD ${usd.toFixed(2)}` : this.dinero(usd * valores.tipoCambioUsdPen);
  }

  ngOnInit(): void {
    this.service.cotizacionesColor().subscribe({
      next: (precios) => this.preciosColor.set(precios),
      error: () => this.errorPrecio.set('No se pudo cargar la cotización vigente.'),
    });

    this.form.valueChanges.subscribe(() => {
      this.consultaPrecioActual++;
      this.calculandoPrecio.set(false);
      this.errorPrecio.set('');
    });

    this.cargarMercado();
  }

  ngAfterViewInit(): void {
    this.renderGrafica();
  }

  protected cargarMercado(): void {
    this.cargandoMercado.set(true);

    // 1. Oro Spot (Kitco / PAXG respaldo 1:1 onza Troy física LBMA)
    this.http.get<any>('https://api.binance.com/api/v3/ticker/24hr?symbol=PAXGUSDT').subscribe({
      next: (data) => {
        this.oroMercado.set({
          bid: Number(data.bidPrice),
          ask: Number(data.askPrice),
          ultimo: Number(data.lastPrice),
          cambio24h: Number(data.priceChangePercent),
          max24h: Number(data.highPrice),
          min24h: Number(data.lowPrice),
        });
        this.cargandoMercado.set(false);
      },
      error: () => {
        // Fallback referencial
        this.oroMercado.set({
          bid: 4174.70,
          ask: 4176.70,
          ultimo: 4175.33,
          cambio24h: 0.25,
          max24h: 4190.70,
          min24h: 4156.70,
        });
        this.cargandoMercado.set(false);
      },
    });

    // 2. Dólar Perú (USD/PEN)
    this.http.get<any>('https://open.er-api.com/v6/latest/USD').subscribe({
      next: (data) => {
        const pen = data?.rates?.PEN ?? 3.4365;
        this.dolarMercado.update((prev) => ({
          interbancario: pen,
          sunatCompra: prev?.sunatCompra ?? 3.423,
          sunatVenta: prev?.sunatVenta ?? 3.431,
        }));
      },
      error: () => {
        this.dolarMercado.set({
          interbancario: 3.4365,
          sunatCompra: 3.423,
          sunatVenta: 3.431,
        });
      },
    });

    // 3. SUNAT oficial (Perú)
    this.http.get<any>('https://api.apis.net.pe/v1/tipo-cambio-sunat').subscribe({
      next: (data) => {
        if (data?.compra && data?.venta) {
          this.dolarMercado.update((prev) => ({
            interbancario: prev?.interbancario ?? Number(data.venta),
            sunatCompra: Number(data.compra),
            sunatVenta: Number(data.venta),
          }));
        }
      },
      error: () => {},
    });
  }

  protected aplicarOro(): void {
    const oro = this.oroMercado();
    if (!oro) return;
    this.form.patchValue({ cotizacionOnzaUsd: Number(oro.bid.toFixed(2)) });
  }

  protected aplicarDolar(): void {
    const dolar = this.dolarMercado();
    if (!dolar) return;
    const valor = dolar.sunatVenta ?? dolar.interbancario;
    this.form.patchValue({ tipoCambioUsdPen: Number(valor.toFixed(4)) });
  }

  protected aplicarAmbos(): void {
    this.aplicarOro();
    this.aplicarDolar();
  }

  protected cambiarGrafica(tipo: 'DUAL' | 'ORO' | 'DOLAR'): void {
    this.tipoGrafica.set(tipo);
    this.renderGrafica();
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

  protected calcularPrecio(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorPrecio.set('Ingresa una cotización y un tipo de cambio mayores que cero.');
      return;
    }
    this.errorPrecio.set('');
    this.calculandoPrecio.set(true);
    const consulta = ++this.consultaPrecioActual;
    const { cotizacionOnzaUsd, tipoCambioUsdPen, exportacionRojo, exportacionVerde, leyRojo, leyVerde } = this.form.getRawValue();
    this.service.publicarColores(cotizacionOnzaUsd, tipoCambioUsdPen, exportacionRojo, exportacionVerde, leyRojo, leyVerde).subscribe({
      next: (resultado) => {
        if (consulta !== this.consultaPrecioActual) return;
        this.preciosColor.set(resultado);
        this.calculandoPrecio.set(false);
      },
      error: () => {
        if (consulta !== this.consultaPrecioActual) return;
        this.errorPrecio.set('No se pudo calcular el precio. Revisa los datos y la conexión con el backend.');
        this.calculandoPrecio.set(false);
      },
    });
  }

  protected dinero(valor: number): string {
    return new Intl.NumberFormat('es-PE', { useGrouping: false, style: 'currency', currency: 'PEN' }).format(valor);
  }
}
