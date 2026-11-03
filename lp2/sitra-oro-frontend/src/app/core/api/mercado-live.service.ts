import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';

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

@Injectable({
  providedIn: 'root',
})
export class MercadoLiveService {
  private readonly http = inject(HttpClient);

  readonly oroMercado = signal<DatosOroMercado | null>(null);
  readonly dolarMercado = signal<DatosDolarMercado | null>(null);
  readonly ultimoTickHora = signal<string>('');
  readonly titilarPrecio = signal<boolean>(false);
  readonly cargandoMercado = signal<boolean>(false);

  private wsTv?: WebSocket;
  private reconexionWsTimeout?: any;
  private intervaloDolar?: any;
  private titilarTimeout?: any;
  private iniciado = false;

  constructor() {
    this.iniciar();
  }

  iniciar(): void {
    if (this.iniciado) return;
    this.iniciado = true;
    this.cargandoMercado.set(true);

    this.cargarOroHttpFallback();
    this.cargarDolarMercado();
    this.conectarWebSocketTradingView();

    this.intervaloDolar = setInterval(() => {
      this.cargarDolarMercado();
    }, 30000);
  }

  recargar(): void {
    this.cargandoMercado.set(true);
    this.cargarOroHttpFallback();
    this.conectarWebSocketTradingView();
    this.cargarDolarMercado();
  }

  private formatTradingViewMsg(msg: any): string {
    const str = typeof msg === 'string' ? msg : JSON.stringify(msg);
    return `~m~${str.length}~m~${str}`;
  }

  private parseTradingViewPackets(raw: string): string[] {
    const packets: string[] = [];
    let pos = 0;
    while (pos < raw.length) {
      if (raw.slice(pos, pos + 3) === '~m~') {
        const nextDelimiter = raw.indexOf('~m~', pos + 3);
        if (nextDelimiter === -1) break;
        const lenStr = raw.slice(pos + 3, nextDelimiter);
        const len = parseInt(lenStr, 10);
        if (isNaN(len)) break;
        const contentStart = nextDelimiter + 3;
        const content = raw.slice(contentStart, contentStart + len);
        packets.push(content);
        pos = contentStart + len;
      } else {
        pos++;
      }
    }
    return packets;
  }

  private conectarWebSocketTradingView(): void {
    try {
      this.wsTv?.close();
    } catch {}

    try {
      const sessionId = `qs_${Math.random().toString(36).substring(2, 10)}`;
      this.wsTv = new WebSocket('wss://data.tradingview.com/socket.io/websocket?from=unregistered-web%2F');

      this.wsTv.onopen = () => {
        this.cargandoMercado.set(false);
        this.wsTv?.send(this.formatTradingViewMsg({ m: 'set_data_quality', p: ['low'] }));
        this.wsTv?.send(this.formatTradingViewMsg({ m: 'quote_create_session', p: [sessionId] }));
        this.wsTv?.send(
          this.formatTradingViewMsg({
            m: 'quote_set_fields',
            p: [sessionId, 'lp', 'bid', 'ask', 'ch', 'chp', 'high_price', 'low_price'],
          }),
        );
        this.wsTv?.send(
          this.formatTradingViewMsg({
            m: 'quote_add_symbols',
            p: [sessionId, 'OANDA:XAUUSD', 'FX_IDC:USDPEN'],
          }),
        );
      };

      this.wsTv.onmessage = (event) => {
        const raw = String(event.data);
        const packets = this.parseTradingViewPackets(raw);
        for (const pkt of packets) {
          if (pkt.startsWith('~h~')) {
            this.wsTv?.send(this.formatTradingViewMsg(pkt));
            continue;
          }
          try {
            const json = JSON.parse(pkt);
            if (json.m === 'qsd' && json.p && json.p[1]) {
              const sym = json.p[1].n;
              const v = json.p[1].v;
              if (sym === 'OANDA:XAUUSD' && v) {
                const prev = this.oroMercado();
                const ultimo = v.lp !== undefined ? Number(v.lp) : (prev?.ultimo ?? (v.bid ? Number(v.bid) : 3995));
                const bid = v.bid !== undefined ? Number(v.bid) : (v.lp !== undefined ? Number(v.lp) : (prev?.bid ?? ultimo));
                const ask = v.ask !== undefined ? Number(v.ask) : (prev?.ask ?? (bid + 0.4));
                const cambio24h = v.chp !== undefined ? Number(v.chp) : (prev?.cambio24h ?? 0);
                const max24h = v.high_price !== undefined ? Number(v.high_price) : (prev?.max24h ?? ultimo * 1.01);
                const min24h = v.low_price !== undefined ? Number(v.low_price) : (prev?.min24h ?? ultimo * 0.99);

                if (!prev || Math.abs(prev.ultimo - ultimo) > 0.001) {
                  this.titilarPrecio.set(true);
                  clearTimeout(this.titilarTimeout);
                  this.titilarTimeout = setTimeout(() => this.titilarPrecio.set(false), 400);
                }

                this.oroMercado.set({ bid, ask, ultimo, cambio24h, max24h, min24h });
                this.cargandoMercado.set(false);
                this.ultimoTickHora.set(new Date().toLocaleTimeString('es-PE', { hour12: false }));
              } else if (sym === 'FX_IDC:USDPEN' && v) {
                const rate = v.lp !== undefined ? Number(v.lp) : (v.bid !== undefined ? Number(v.bid) : undefined);
                if (rate && rate > 0) {
                  this.dolarMercado.update((prev) => ({
                    interbancario: rate,
                    sunatCompra: prev?.sunatCompra ?? 3.423,
                    sunatVenta: prev?.sunatVenta ?? 3.431,
                  }));
                }
              }
            }
          } catch {}
        }
      };

      this.wsTv.onerror = () => {
        this.cargarOroHttpFallback();
      };

      this.wsTv.onclose = () => {
        clearTimeout(this.reconexionWsTimeout);
        this.reconexionWsTimeout = setTimeout(() => {
          this.conectarWebSocketTradingView();
        }, 3000);
      };
    } catch {
      this.cargarOroHttpFallback();
    }
  }

  private cargarOroHttpFallback(): void {
    const payload = JSON.stringify({
      symbols: { tickers: ['OANDA:XAUUSD'] },
      columns: ['close', 'bid', 'ask', 'change', 'high', 'low'],
    });

    fetch('https://scanner.tradingview.com/cfd/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: payload,
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((res) => {
        const item = res?.data?.[0];
        if (item && item.d && item.d.length >= 6) {
          const [close, rawBid, rawAsk, change, high, low] = item.d;
          const ultimo = Number(close);
          const bid = Number(rawBid || close);
          const ask = Number(rawAsk || (bid + 0.4));
          const prev = this.oroMercado();

          if (!prev || Math.abs(prev.ultimo - ultimo) > 0.001) {
            this.titilarPrecio.set(true);
            clearTimeout(this.titilarTimeout);
            this.titilarTimeout = setTimeout(() => this.titilarPrecio.set(false), 400);
          }

          this.oroMercado.set({
            bid,
            ask,
            ultimo,
            cambio24h: Number(change ?? 0),
            max24h: Number(high ?? ultimo * 1.01),
            min24h: Number(low ?? ultimo * 0.99),
          });
          this.cargandoMercado.set(false);
          this.ultimoTickHora.set(new Date().toLocaleTimeString('es-PE', { hour12: false }));
        }
      })
      .catch(() => {
        this.cargandoMercado.set(false);
      });
  }

  private cargarDolarMercado(): void {
    // 1. Dólar Interbancario FX_IDC:USDPEN en vivo (TradingView)
    const payload = JSON.stringify({
      symbols: { tickers: ['FX_IDC:USDPEN'] },
      columns: ['close', 'bid', 'ask', 'change', 'high', 'low'],
    });

    fetch('https://scanner.tradingview.com/forex/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: payload,
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((res) => {
        const item = res?.data?.[0];
        if (item && item.d && item.d.length >= 1) {
          const rate = Number(item.d[0]);
          if (rate > 0) {
            this.dolarMercado.update((prev) => ({
              interbancario: rate,
              sunatCompra: prev?.sunatCompra ?? 3.423,
              sunatVenta: prev?.sunatVenta ?? 3.431,
            }));
          }
        }
      })
      .catch(() => {});

    // 2. SUNAT oficial (Perú)
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

    // 3. Respaldo adicional open.er-api.com si aún no hay tipo de cambio
    this.http.get<any>('https://open.er-api.com/v6/latest/USD').subscribe({
      next: (data) => {
        const pen = data?.rates?.PEN;
        if (pen && (!this.dolarMercado() || !this.dolarMercado()?.interbancario)) {
          this.dolarMercado.update((prev) => ({
            interbancario: prev?.interbancario ?? pen,
            sunatCompra: prev?.sunatCompra ?? 3.423,
            sunatVenta: prev?.sunatVenta ?? 3.431,
          }));
        }
      },
      error: () => {},
    });
  }
}
