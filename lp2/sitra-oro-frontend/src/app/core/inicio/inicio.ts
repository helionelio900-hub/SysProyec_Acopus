import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';

interface CotizacionEstimada {
  pesoBrutoGramos: number;
  pesoNetoEstimadoGramos: number;
  precioGramoDiaPen: number;
  montoEstimadoTotalPen: number;
  mensaje: string;
}

interface CentroAcopio {
  idCentroAcopio: number;
  nombre: string;
  zona: string;
  direccion: string;
  telefono: string;
  activo: boolean;
}

@Component({
  selector: 'app-inicio',
  imports: [RouterLink, FormsModule, CurrencyPipe, DecimalPipe],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
})
export class Inicio implements OnInit {
  private readonly http = inject(HttpClient);
  protected readonly peso = signal<number | null>(null);
  protected readonly cotizacion = signal<CotizacionEstimada | null>(null);
  protected readonly cotizando = signal(false);
  protected readonly errorCotizacion = signal('');
  protected readonly centros = signal<CentroAcopio[]>([]);
  protected readonly cargandoCentros = signal(true);
  protected readonly errorCentros = signal(false);

  ngOnInit(): void {
    this.cargarCentros();
  }

  protected cargarCentros(): void {
    this.errorCentros.set(false);
    this.cargandoCentros.set(true);
    this.http.get<CentroAcopio[]>(`${environment.apiBaseUrl}/api/v1/publico/centros-acopio`).subscribe({
      next: (centros) => {
        this.centros.set(centros.filter((centro) => centro.activo));
        this.cargandoCentros.set(false);
      },
      error: () => {
        this.errorCentros.set(true);
        this.cargandoCentros.set(false);
      },
    });
  }

  protected consultarPrecio(): void {
    const peso = this.peso();
    if (!peso || peso <= 0) {
      this.errorCotizacion.set('Ingresa un peso mayor que cero para calcular tu estimado.');
      this.cotizacion.set(null);
      return;
    }

    this.cotizando.set(true);
    this.errorCotizacion.set('');
    this.cotizacion.set(null);
    this.http.get<CotizacionEstimada>(`${environment.apiBaseUrl}/api/v1/cotizador/estimar`, {
      params: { pesoBrutoGramos: peso },
    }).subscribe({
      next: (resultado) => {
        this.cotizacion.set(resultado);
        this.cotizando.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.errorCotizacion.set(error.status === 0
          ? 'No pudimos conectar con el servicio de cotización. Intenta de nuevo en un momento.'
          : 'No se pudo calcular el estimado. Revisa el peso e inténtalo nuevamente.');
        this.cotizando.set(false);
      },
    });
  }
}
