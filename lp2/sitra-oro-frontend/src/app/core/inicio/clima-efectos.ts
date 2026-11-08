import { AfterViewInit, Component, ElementRef, OnDestroy, effect, input, viewChild } from '@angular/core';
import { TipoClima } from '../api/clima.service';

interface Particula { x: number; y: number; r: number; v: number; deriva: number; fase: number; alfa: number; }

/** Ajustes por fenómeno: cantidad por cada 10 000 px², velocidad y forma. */
const AJUSTES: Partial<Record<TipoClima, { densidad: number; vMin: number; vMax: number; rMin: number; rMax: number; forma: 'copo' | 'gota' | 'grano' }>> = {
  nieve: { densidad: 1.1, vMin: 0.35, vMax: 1.25, rMin: 0.9, rMax: 3.1, forma: 'copo' },
  llovizna: { densidad: 0.9, vMin: 6, vMax: 9, rMin: 0.5, rMax: 0.9, forma: 'gota' },
  lluvia: { densidad: 1.4, vMin: 9, vMax: 14, rMin: 0.6, rMax: 1.1, forma: 'gota' },
  tormenta: { densidad: 1.6, vMin: 11, vMax: 16, rMin: 0.7, rMax: 1.2, forma: 'gota' },
  granizo: { densidad: 0.8, vMin: 7, vMax: 11, rMin: 1.2, rMax: 2.2, forma: 'grano' },
};

/** Capa decorativa sobre la foto del inicio: dibuja el clima real con un canvas. */
@Component({
  selector: 'app-clima-efectos',
  template: `<canvas #lienzo aria-hidden="true"></canvas>`,
  styles: `:host { position: absolute; inset: 0; z-index: -1; pointer-events: none; }
    canvas { width: 100%; height: 100%; display: block; }`,
})
export class ClimaEfectos implements AfterViewInit, OnDestroy {
  readonly tipo = input<TipoClima | null>(null);
  private readonly lienzo = viewChild.required<ElementRef<HTMLCanvasElement>>('lienzo');
  private particulas: Particula[] = [];
  private cuadro = 0;
  private ancho = 0;
  private alto = 0;
  private listo = false;
  private readonly sinMovimiento = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  private observador?: ResizeObserver;
  private readonly alCambiarVisibilidad = () => (document.hidden ? this.parar() : this.arrancar());

  constructor() {
    effect(() => {
      this.tipo();
      if (this.listo) this.reiniciar();
    });
  }

  ngAfterViewInit(): void {
    this.listo = true;
    this.observador = new ResizeObserver(() => this.reiniciar());
    this.observador.observe(this.lienzo().nativeElement);
    document.addEventListener('visibilitychange', this.alCambiarVisibilidad);
    this.reiniciar();
  }

  ngOnDestroy(): void {
    this.parar();
    this.observador?.disconnect();
    document.removeEventListener('visibilitychange', this.alCambiarVisibilidad);
  }

  private reiniciar(): void {
    const canvas = this.lienzo().nativeElement;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.ancho = canvas.clientWidth;
    this.alto = canvas.clientHeight;
    canvas.width = Math.round(this.ancho * dpr);
    canvas.height = Math.round(this.alto * dpr);
    canvas.getContext('2d')?.setTransform(dpr, 0, 0, dpr, 0, 0);
    const ajuste = this.ajuste();
    this.particulas = [];
    if (ajuste) {
      const total = Math.min(260, Math.round((this.ancho * this.alto) / 10000 * ajuste.densidad));
      for (let i = 0; i < total; i++) this.particulas.push(this.nueva(true));
    }
    this.parar();
    this.dibujar();
    if (!this.sinMovimiento) this.arrancar();
  }

  private ajuste() {
    const tipo = this.tipo();
    return tipo ? AJUSTES[tipo] : undefined;
  }

  private nueva(enCualquierAltura: boolean): Particula {
    const a = this.ajuste()!;
    const r = a.rMin + Math.random() * (a.rMax - a.rMin);
    // Los copos grandes caen más rápido: da sensación de profundidad.
    const avance = (r - a.rMin) / Math.max(a.rMax - a.rMin, 0.01);
    return {
      x: Math.random() * this.ancho,
      y: enCualquierAltura ? Math.random() * this.alto : -10,
      r,
      v: a.vMin + avance * (a.vMax - a.vMin) * (0.75 + Math.random() * 0.5),
      deriva: (Math.random() - 0.5) * 0.6,
      fase: Math.random() * Math.PI * 2,
      alfa: 0.45 + avance * 0.5,
    };
  }

  private arrancar(): void {
    if (this.cuadro || !this.particulas.length || this.sinMovimiento || document.hidden) return;
    const paso = () => {
      this.mover();
      this.dibujar();
      this.cuadro = requestAnimationFrame(paso);
    };
    this.cuadro = requestAnimationFrame(paso);
  }

  private parar(): void {
    if (this.cuadro) cancelAnimationFrame(this.cuadro);
    this.cuadro = 0;
  }

  private mover(): void {
    const forma = this.ajuste()?.forma;
    for (const p of this.particulas) {
      p.y += p.v;
      if (forma === 'copo') {
        p.fase += 0.012;
        p.x += Math.sin(p.fase) * 0.45 + p.deriva;
      } else {
        p.x += forma === 'gota' ? -p.v * 0.18 : p.deriva;
      }
      if (p.y > this.alto + 12 || p.x < -20 || p.x > this.ancho + 20) Object.assign(p, this.nueva(false));
    }
  }

  private dibujar(): void {
    const ctx = this.lienzo().nativeElement.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, this.ancho, this.alto);
    const forma = this.ajuste()?.forma;
    if (!forma) return;
    for (const p of this.particulas) {
      if (forma === 'gota') {
        ctx.strokeStyle = `rgba(206, 224, 255, ${p.alfa * 0.55})`;
        ctx.lineWidth = p.r;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + p.v * 0.18, p.y - p.v * 1.4);
        ctx.stroke();
      } else {
        ctx.fillStyle = forma === 'grano' ? `rgba(235, 242, 255, ${p.alfa})` : `rgba(255, 255, 255, ${p.alfa})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}
