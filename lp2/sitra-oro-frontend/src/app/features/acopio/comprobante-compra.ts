import { DatePipe } from '@angular/common';
import { Component, ElementRef, effect, input, output, signal, viewChild } from '@angular/core';
import { CompraAcopio } from '../../core/api/operaciones.service';

/**
 * Comprobante digital de una compra al minero. El acopio no tiene ticketera: el comprobante se muestra en
 * pantalla y se comparte como imagen (WhatsApp u otra app) o se descarga.
 */
@Component({
  selector: 'app-comprobante-compra',
  imports: [DatePipe],
  template: `
    <dialog #dialogo class="comprobante-dialogo" (close)="cerrado.emit()" (cancel)="cerrado.emit()" aria-labelledby="comprobante-titulo">
      @if (compra(); as c) {
        <article class="comprobante">
          <header class="comprobante-cabecera">
            <img src="/images/logo-sitra-oro.jpg" alt="" width="44" height="44" />
            <div>
              <h2 id="comprobante-titulo">Comprobante de compra</h2>
              <p>SITRA-ORO · {{ centro() || 'Centro de acopio' }}</p>
            </div>
            <span class="comprobante-numero">N.º {{ c.idCompraG2 }}</span>
          </header>

          <dl class="comprobante-datos">
            <div><dt>Minero</dt><dd>{{ c.minero.nombresApellidos }}</dd></div>
            <div><dt>DNI</dt><dd>{{ c.minero.documentoIdentidad }}</dd></div>
            <div><dt>Fecha</dt><dd>{{ c.fechaCompra | date: 'dd/MM/yyyy · HH:mm' }}</dd></div>
          </dl>

          <table class="comprobante-tabla">
            <thead><tr><th>Oro</th><th class="num">Recibido</th><th class="num">Fundido</th><th class="num">Precio / g</th><th class="num">Importe</th></tr></thead>
            <tbody>
              @for (p of partidasVigentes(); track p.idTransaccionG2) {
                <tr>
                  <td><i class="punto-oro" [class.punto-rojo]="p.tipoOro === 'ROJO'" [class.punto-verde]="p.tipoOro === 'VERDE'" aria-hidden="true"></i>{{ p.tipoOro === 'ROJO' ? 'Rojo' : 'Verde' }}</td>
                  <td class="num">{{ gramos(p.pesoSinFundirG) }}</td>
                  <td class="num">{{ gramos(p.pesoFundidoNetoG) }}</td>
                  <td class="num">{{ dinero(p.precioAplicadoPen) }}</td>
                  <td class="num">{{ dinero(p.totalPagadoPen) }}</td>
                </tr>
              }
            </tbody>
          </table>

          @if (descuento() > 0) {
            <dl class="comprobante-descuentos">
              <div><dt>Valor del oro</dt><dd>{{ dinero(c.totalPagadoPen) }}</dd></div>
              <div><dt>Préstamos y descuentos</dt><dd>− {{ dinero(descuento()) }}</dd></div>
            </dl>
          }
          <div class="comprobante-total"><span>Total pagado al minero</span><strong>{{ dinero(neto()) }}</strong></div>
          <p class="comprobante-nota">Pago en efectivo en soles. Guarda esta imagen como constancia de tu venta.</p>

          <div class="comprobante-acciones">
            <button type="button" class="comprobante-principal" (click)="compartir()" [disabled]="trabajando()">{{ puedeCompartir ? 'Compartir imagen' : 'Descargar imagen' }}</button>
            <a class="comprobante-secundario" [href]="enlaceWhatsapp()" target="_blank" rel="noopener">Enviar por WhatsApp</a>
            <button type="button" class="comprobante-secundario" (click)="dialogo.close()">Cerrar</button>
          </div>
          @if (aviso()) { <p class="comprobante-aviso" role="status">{{ aviso() }}</p> }
        </article>
      }
    </dialog>
  `,
})
export class ComprobanteCompra {
  readonly compra = input<CompraAcopio | null>(null);
  readonly centro = input<string>('');
  readonly cerrado = output<void>();
  private readonly dialogo = viewChild.required<ElementRef<HTMLDialogElement>>('dialogo');
  protected readonly trabajando = signal(false);
  protected readonly aviso = signal('');
  protected readonly puedeCompartir = typeof navigator !== 'undefined' && 'share' in navigator && 'canShare' in navigator;

  constructor() {
    effect(() => {
      const c = this.compra();
      const d = this.dialogo().nativeElement;
      this.aviso.set('');
      if (c && !d.open) d.showModal();
      if (!c && d.open) d.close();
    });
  }

  /** Préstamos y descuentos restados al pagar (0 en compras sin descuento). */
  protected descuento(): number {
    return this.compra()?.descuentoPen ?? 0;
  }

  /** Lo que realmente recibió el minero. */
  protected neto(): number {
    const c = this.compra();
    return c?.netoPagadoPen ?? c?.totalPagadoPen ?? 0;
  }

  protected partidasVigentes() {
    return (this.compra()?.detalles ?? []).filter((p) => !p.anulada);
  }

  protected dinero(valor: number | null | undefined): string {
    return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(valor ?? 0);
  }

  protected gramos(valor: number | null | undefined): string {
    return `${new Intl.NumberFormat('es-PE', { minimumFractionDigits: 3, maximumFractionDigits: 3 }).format(valor ?? 0)} g`;
  }

  protected enlaceWhatsapp(): string {
    return `https://wa.me/?text=${encodeURIComponent(this.texto())}`;
  }

  private texto(): string {
    const c = this.compra();
    if (!c) return '';
    const lineas = this.partidasVigentes().map((p) =>
      `• Oro ${p.tipoOro === 'ROJO' ? 'rojo' : 'verde'}: ${this.gramos(p.pesoFundidoNetoG)} × ${this.dinero(p.precioAplicadoPen)} = ${this.dinero(p.totalPagadoPen)}`);
    return [`*SITRA-ORO · Comprobante de compra N.º ${c.idCompraG2}*`, this.centro() || 'Centro de acopio',
      `Minero: ${c.minero.nombresApellidos} (DNI ${c.minero.documentoIdentidad})`,
      `Fecha: ${new Date(c.fechaCompra).toLocaleString('es-PE')}`, ...lineas,
      ...(this.descuento() > 0 ? [`Valor del oro: ${this.dinero(c.totalPagadoPen)}`, `Préstamos y descuentos: −${this.dinero(this.descuento())}`] : []),
      `*Total pagado: ${this.dinero(this.neto())}*`].join('\n');
  }

  /** Comparte la imagen del comprobante con las apps del celular; en computadora la descarga. */
  protected async compartir(): Promise<void> {
    const c = this.compra();
    if (!c) return;
    this.trabajando.set(true);
    this.aviso.set('');
    try {
      const blob = await this.dibujar(c);
      const archivo = new File([blob], `comprobante-sitra-oro-${c.idCompraG2}.png`, { type: 'image/png' });
      if (this.puedeCompartir && navigator.canShare({ files: [archivo] })) {
        await navigator.share({ files: [archivo], title: `Comprobante N.º ${c.idCompraG2}`, text: this.texto() });
      } else {
        const url = URL.createObjectURL(blob);
        const a = Object.assign(document.createElement('a'), { href: url, download: archivo.name });
        a.click();
        URL.revokeObjectURL(url);
        this.aviso.set('Imagen descargada. Puedes enviarla por WhatsApp o imprimirla cuando tengas impresora.');
      }
    } catch (e) {
      if ((e as DOMException)?.name !== 'AbortError') this.aviso.set('No se pudo generar la imagen. Usa "Enviar por WhatsApp".');
    } finally {
      this.trabajando.set(false);
    }
  }

  /** Fecha como en pantalla: 08/11/2026 · 05:55. */
  private fechaCorta(fecha: string): string {
    const d = new Date(fecha);
    const dos = (n: number) => String(n).padStart(2, '0');
    return `${dos(d.getDate())}/${dos(d.getMonth() + 1)}/${d.getFullYear()} · ${dos(d.getHours())}:${dos(d.getMinutes())}`;
  }

  private cargarLogo(): Promise<HTMLImageElement | null> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = '/images/logo-sitra-oro.jpg';
    });
  }

  /** Dibuja la imagen con el mismo diseño del comprobante en pantalla (sin librerías externas). */
  private async dibujar(c: CompraAcopio): Promise<Blob> {
    const partidas = this.partidasVigentes();
    const logo = await this.cargarLogo();
    const escala = 2;
    const ancho = 720;
    const margen = 36;
    const derecha = ancho - margen;
    const conDescuento = this.descuento() > 0;
    const alto = 402 + partidas.length * 48 + (conDescuento ? 64 : 0);
    const canvas = document.createElement('canvas');
    canvas.width = ancho * escala;
    canvas.height = alto * escala;
    const ctx = canvas.getContext('2d')!;
    ctx.scale(escala, escala);
    const fuente = 'Inter, "Segoe UI", system-ui, sans-serif';
    const texto = (t: string, x: number, y: number, estilo: string, color: string, alinear: CanvasTextAlign = 'left') => {
      ctx.font = `${estilo} ${fuente}`; ctx.fillStyle = color; ctx.textAlign = alinear; ctx.fillText(t, x, y);
    };
    const linea = (y: number, color: string, grosor = 1) => {
      ctx.strokeStyle = color; ctx.lineWidth = grosor; ctx.beginPath(); ctx.moveTo(margen, y); ctx.lineTo(derecha, y); ctx.stroke();
    };

    // Fondo y cabecera
    ctx.fillStyle = '#fbfaf7'; ctx.fillRect(0, 0, ancho, alto);
    ctx.fillStyle = '#0d171f'; ctx.fillRect(0, 0, ancho, 100);
    if (logo) {
      ctx.save();
      ctx.beginPath(); ctx.roundRect(margen, 24, 52, 52, 8); ctx.clip();
      ctx.fillStyle = '#030405'; ctx.fillRect(margen, 24, 52, 52);
      ctx.drawImage(logo, margen, 24, 52, 52);
      ctx.restore();
    }
    const xTitulo = logo ? margen + 68 : margen;
    texto('Comprobante de compra', xTitulo, 50, '700 22px', '#efb735');
    texto(`SITRA-ORO · ${this.centro() || 'Centro de acopio'}`, xTitulo, 76, '500 15px', '#d2d9dc');
    texto(`N.º ${c.idCompraG2}`, derecha, 58, '800 20px', '#ffffff', 'right');

    // Datos del minero
    let y = 140;
    for (const [etiqueta, valor] of [['Minero', c.minero.nombresApellidos], ['DNI', c.minero.documentoIdentidad],
      ['Fecha', this.fechaCorta(c.fechaCompra)]]) {
      texto(etiqueta, margen, y, '500 16px', '#6e7880');
      texto(valor, derecha, y, '700 16px', '#101923', 'right');
      y += 30;
    }

    // Tabla de partidas
    y += 16;
    const columnas: [string, number, CanvasTextAlign][] = [
      ['ORO', margen, 'left'], ['RECIBIDO', 300, 'right'], ['FUNDIDO', 420, 'right'], ['PRECIO / G', 560, 'right'], ['IMPORTE', derecha, 'right'],
    ];
    for (const [titulo, x, alinear] of columnas) texto(titulo, x, y, '700 12px', '#6e7880', alinear);
    y += 14; linea(y, '#e7e4dc');
    for (const p of partidas) {
      y += 30;
      ctx.fillStyle = p.tipoOro === 'ROJO' ? '#c2410c' : '#4d7c0f';
      ctx.beginPath(); ctx.arc(margen + 6, y - 5, 6, 0, Math.PI * 2); ctx.fill();
      texto(p.tipoOro === 'ROJO' ? 'Rojo' : 'Verde', margen + 18, y, '500 15px', '#101923');
      texto(this.gramos(p.pesoSinFundirG), 300, y, '500 15px', '#101923', 'right');
      texto(this.gramos(p.pesoFundidoNetoG), 420, y, '500 15px', '#101923', 'right');
      texto(this.dinero(p.precioAplicadoPen), 560, y, '500 15px', '#101923', 'right');
      texto(this.dinero(p.totalPagadoPen), derecha, y, '600 15px', '#101923', 'right');
      y += 18; linea(y, '#efece5');
    }

    // Descuentos (préstamos) y total
    if (conDescuento) {
      y += 30;
      texto('Valor del oro', margen, y, '500 15px', '#6e7880');
      texto(this.dinero(c.totalPagadoPen), derecha, y, '600 15px', '#101923', 'right');
      y += 28;
      texto('Préstamos y descuentos', margen, y, '500 15px', '#6e7880');
      texto(`− ${this.dinero(this.descuento())}`, derecha, y, '600 15px', '#b42318', 'right');
    }
    y += 26; linea(y, '#101923', 2);
    y += 42;
    texto('Total pagado al minero', margen, y, '800 18px', '#101923');
    texto(this.dinero(this.neto()), derecha, y + 4, '800 30px', '#92630a', 'right');
    y += 40;
    texto('Pago en efectivo en soles. Guarda esta imagen como constancia de tu venta.', margen, y, '500 13px', '#6e7880');
    ctx.textAlign = 'left';
    return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('sin imagen'))), 'image/png'));
  }
}
