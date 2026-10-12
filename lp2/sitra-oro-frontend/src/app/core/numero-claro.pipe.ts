import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'numeroClaro', standalone: true })
export class NumeroClaroPipe implements PipeTransform {
  transform(valor: number | string | null | undefined, formato = '1.0-3'): string {
    if (valor === null || valor === undefined || valor === '') return '';
    const numero = Number(valor);
    if (!Number.isFinite(numero)) return '—';
    const partes = /\.(\d+)-(\d+)/.exec(formato);
    const maximo = partes ? Number(partes[2]) : 3;
    // Los importes conservan centimos; pesos y parametros no agregan ceros.
    const minimo = formato === '1.2-2' ? 2 : 0;
    return new Intl.NumberFormat('en-US', {
      useGrouping: false, minimumFractionDigits: minimo, maximumFractionDigits: maximo,
    }).format(numero);
  }
}
