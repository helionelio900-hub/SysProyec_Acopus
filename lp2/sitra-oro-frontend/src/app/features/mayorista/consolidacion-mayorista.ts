import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAYORISTA_VISTA_PREVIA } from './mayorista-preview';

interface LoteExportacion {
  id: number;
  numero: string;
  pesoFundidoG: number | null;
  lecturaDecimal: string;
  editando: boolean;
}

@Component({
  selector: 'app-consolidacion-mayorista',
  imports: [MatButtonModule],
  templateUrl: './consolidacion-mayorista.html',
  styleUrl: './consolidacion-mayorista.css',
})
export class ConsolidacionMayorista {
  protected readonly vistaPrevia = inject(MAYORISTA_VISTA_PREVIA);
  protected readonly fecha = signal(this.fechaLocal());
  protected readonly lotes = signal<LoteExportacion[]>([]);
  protected readonly mensaje = signal('');
  protected readonly pesoBruto = computed(() =>
    this.lotes().reduce(
      (total, lote) =>
        total + (lote.pesoFundidoG !== null && lote.pesoFundidoG > 0 ? lote.pesoFundidoG : 0),
      0,
    ),
  );
  protected readonly puedePrepararEnvio = computed(
    () =>
      this.vistaPrevia &&
      this.lotes().length > 0 &&
      this.lotes().every(
        (lote) =>
          lote.pesoFundidoG !== null &&
          Number.isFinite(lote.pesoFundidoG) &&
          lote.pesoFundidoG > 0 &&
          lote.lecturaDecimal.trim() !== '' &&
          Number.isFinite(Number(lote.lecturaDecimal)) &&
          Number(lote.lecturaDecimal) >= 0,
      ),
  );

  private siguienteId = 1;

  constructor() {
    if (this.vistaPrevia) {
      this.lotes.set([
        this.nuevoLote('Lote 001'),
        this.nuevoLote('Lote 002'),
        this.nuevoLote('Lote 003'),
      ]);
    }
  }

  protected agregarLote(): void {
    if (!this.vistaPrevia) return;
    const numero = `Lote ${String(this.siguienteId).padStart(3, '0')}`;
    this.lotes.update((actuales) => [...actuales, this.nuevoLote(numero, true)]);
  }

  protected cambiarEdicion(id: number): void {
    this.lotes.update((actuales) =>
      actuales.map((lote) => (lote.id === id ? { ...lote, editando: !lote.editando } : lote)),
    );
  }

  protected eliminarLote(id: number): void {
    if (!this.vistaPrevia) return;
    this.lotes.update((actuales) => actuales.filter((lote) => lote.id !== id));
  }

  protected cambiarPeso(id: number, event: Event): void {
    const valor = (event.target as HTMLInputElement).value;
    const peso = valor === '' ? null : Number(valor);
    this.lotes.update((actuales) =>
      actuales.map((lote) => (lote.id === id ? { ...lote, pesoFundidoG: peso } : lote)),
    );
  }

  protected cambiarLectura(id: number, event: Event): void {
    const lecturaDecimal = (event.target as HTMLInputElement).value;
    this.lotes.update((actuales) =>
      actuales.map((lote) => (lote.id === id ? { ...lote, lecturaDecimal } : lote)),
    );
  }

  protected cambiarFecha(event: Event): void {
    this.fecha.set((event.target as HTMLInputElement).value);
  }

  protected prepararEnvio(): void {
    if (!this.vistaPrevia || !this.puedePrepararEnvio()) return;
    this.mensaje.set(
      'Vista de demostración: los lotes están completos, pero no se guardaron ni enviaron al exportador.',
    );
  }

  protected gramos(valor: number): string {
    return new Intl.NumberFormat('es-PE', {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    }).format(valor);
  }

  private nuevoLote(numero: string, editando = false): LoteExportacion {
    return {
      id: this.siguienteId++,
      numero,
      pesoFundidoG: null,
      lecturaDecimal: '',
      editando,
    };
  }

  private fechaLocal(): string {
    const ahora = new Date();
    const mes = String(ahora.getMonth() + 1).padStart(2, '0');
    const dia = String(ahora.getDate()).padStart(2, '0');
    return `${ahora.getFullYear()}-${mes}-${dia}`;
  }
}
