import { Injectable, effect, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { MercadoLiveService } from './mercado-live.service';

export interface CotizacionMarket {
  simbolo: string;
  nombre: string;
  valor: number;
  moneda: string;
  variacion24h: number;
  unidad: string;
}

export interface SparklinePoint {
  dia: string;
  precioPen: number;
  precioUsd: number;
}

@Injectable({
  providedIn: 'root',
})
export class MarketCotizacionesService {
  private readonly http = inject(HttpClient);
  private readonly mercadoLive = inject(MercadoLiveService);

  // Ticker items
  readonly tickers = signal<CotizacionMarket[]>([
    {
      simbolo: 'XAU/USD',
      nombre: 'Kitco Gold Spot',
      valor: 2684.50,
      moneda: 'USD',
      variacion24h: +0.68,
      unidad: 'oz troy',
    },
    {
      simbolo: 'USD/PEN',
      nombre: 'Dólar Interbancario',
      valor: 3.765,
      moneda: 'PEN',
      variacion24h: -0.15,
      unidad: 'tipo cambio',
    },
    {
      simbolo: 'XAU/PEN',
      nombre: 'Onza Troy Perú',
      valor: 10107.14,
      moneda: 'PEN',
      variacion24h: +0.53,
      unidad: 'oz troy',
    },
    {
      simbolo: 'ORO 24K',
      nombre: 'Gramo Fino 99.9%',
      valor: 324.95,
      moneda: 'PEN',
      variacion24h: +0.53,
      unidad: 'gramo',
    },
    {
      simbolo: 'ORO ROJO',
      nombre: 'Convencional Balanza',
      valor: 275.50,
      moneda: 'PEN',
      variacion24h: +0.42,
      unidad: 'gramo',
    },
    {
      simbolo: 'ORO VERDE',
      nombre: 'Ecológico Sin Mercurio',
      valor: 295.00,
      moneda: 'PEN',
      variacion24h: +0.85,
      unidad: 'gramo',
    },
  ]);

  // Historial de 7 días para el sparkline SVG (Precios en PEN por gramo)
  readonly historialSemanal = signal<SparklinePoint[]>([
    { dia: 'Lun', precioPen: 318.20, precioUsd: 2635.0 },
    { dia: 'Mar', precioPen: 319.80, precioUsd: 2642.5 },
    { dia: 'Mié', precioPen: 322.40, precioUsd: 2660.0 },
    { dia: 'Jue', precioPen: 321.10, precioUsd: 2652.8 },
    { dia: 'Vie', precioPen: 323.50, precioUsd: 2671.2 },
    { dia: 'Sáb', precioPen: 324.10, precioUsd: 2678.0 },
    { dia: 'Hoy', precioPen: 324.95, precioUsd: 2684.5 },
  ]);

  constructor() {
    this.sincronizarConBackend();
    this.sincronizarConMercadoLive();
  }

  private sincronizarConMercadoLive(): void {
    effect(() => {
      const oro = this.mercadoLive.oroMercado();
      const dolar = this.mercadoLive.dolarMercado();

      if (!oro && !dolar) return;

      const oroVal = oro?.ultimo || oro?.bid;
      const dolarVal = dolar?.sunatVenta || dolar?.interbancario;
      const cambioOro = oro?.cambio24h ?? 0;

      this.tickers.update((items) =>
        items.map((item) => {
          if (item.simbolo === 'XAU/USD' && oroVal) {
            return { ...item, valor: oroVal, variacion24h: Number(cambioOro.toFixed(2)) };
          }
          if (item.simbolo === 'USD/PEN' && dolarVal) {
            return { ...item, valor: Number(dolarVal.toFixed(3)) };
          }
          if (item.simbolo === 'XAU/PEN' && oroVal && dolarVal) {
            return {
              ...item,
              valor: Number((oroVal * dolarVal).toFixed(2)),
              variacion24h: Number(cambioOro.toFixed(2)),
            };
          }
          if (item.simbolo === 'ORO 24K' && oroVal && dolarVal) {
            const gramo24k = (oroVal * dolarVal) / 31.1035;
            return {
              ...item,
              valor: Number(gramo24k.toFixed(2)),
              variacion24h: Number(cambioOro.toFixed(2)),
            };
          }
          return item;
        }),
      );

      if (oroVal && dolarVal) {
        const gramoHoy = (oroVal * dolarVal) / 31.1035;
        this.historialSemanal.update((pts) => {
          const nuevos = [...pts];
          if (nuevos.length > 0) {
            nuevos[nuevos.length - 1] = {
              dia: 'Hoy',
              precioPen: Number(gramoHoy.toFixed(2)),
              precioUsd: Number(oroVal.toFixed(2)),
            };
          }
          return nuevos;
        });
      }
    });
  }

  sincronizarConBackend(): void {
    this.http
      .get<{ color: string; precioGramoPen: number; fechaPublicacion: string }[]>(
        `${environment.apiBaseUrl}/api/v1/cotizador/colores`,
      )
      .subscribe({
        next: (precios) => {
          if (!precios || !precios.length) return;
          const rojo = precios.find((p) => p.color === 'ROJO');
          const verde = precios.find((p) => p.color === 'VERDE');

          this.tickers.update((items) =>
            items.map((item) => {
              if (item.simbolo === 'ORO ROJO' && rojo) {
                return { ...item, valor: rojo.precioGramoPen };
              }
              if (item.simbolo === 'ORO VERDE' && verde) {
                return { ...item, valor: verde.precioGramoPen };
              }
              return item;
            }),
          );
        },
        error: () => {
          // Si el endpoint no responde, se mantienen las cotizaciones de referencia
        },
      });
  }
}
