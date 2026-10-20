import { Component, computed, inject } from '@angular/core';
import { MarketCotizacionesService } from '../../core/api/market-cotizaciones.service';

@Component({
  selector: 'app-market-chart',
  templateUrl: './market-chart.html',
  styleUrl: './market-chart.css',
})

export class MarketChart {
  protected readonly market = inject(MarketCotizacionesService);

  protected readonly sparklineData = computed(() => {
    const pts = this.market.historialSemanal();
    if (!pts.length) return { line: '', area: '', min: 0, max: 0, points: [] };

    const width = 320;
    const height = 70;
    const padding = 8;

    const values = pts.map((p) => p.precioPen);
    const min = Math.min(...values) - 1;
    const max = Math.max(...values) + 1;
    const range = max - min || 1;

    const stepX = (width - padding * 2) / (pts.length - 1);

    const coords = pts.map((p, i) => {
      const x = padding + i * stepX;
      const y = height - padding - ((p.precioPen - min) / range) * (height - padding * 2);
      return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
    });

    const linePath = coords.map((c, i) => (i === 0 ? `M ${c.x},${c.y}` : `L ${c.x},${c.y}`)).join(' ');
    const last = coords[coords.length - 1];
    const first = coords[0];
    const areaPath = `${linePath} L ${last.x},${height} L ${first.x},${height} Z`;

    return { line: linePath, area: areaPath, min, max, points: coords };
  });
}
