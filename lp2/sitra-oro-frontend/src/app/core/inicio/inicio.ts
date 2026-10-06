import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';

interface CotizacionEstimada {
  pesoBrutoGramos: number;
  precioGramoReferencialPen: number;
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
  protected readonly color = signal('ROJO');
  protected readonly preciosColor = signal<{ color: string; precioGramoPen: number; fechaPublicacion: string }[]>([]);
  protected cambiarColor(color: string): void {
    this.color.set(color);
    this.cotizacion.set(null);
    this.cargarPrecio();
  }
  protected readonly precioReferencialPen = signal<number | null>(null);
  protected readonly cargandoPrecio = signal(true);
  protected readonly errorPrecio = signal('');
  protected readonly cotizacion = signal<CotizacionEstimada | null>(null);
  protected readonly cotizando = signal(false);
  protected readonly errorCotizacion = signal('');
  protected readonly centros = signal<CentroAcopio[]>([]);
  protected readonly cargandoCentros = signal(true);
  protected readonly errorCentros = signal(false);

  ngOnInit(): void {
    this.cargarPrecio();
    this.cargarCentros();
  }

  protected cargarPrecio(): void {
    this.cargandoPrecio.set(true);
    this.errorPrecio.set('');
    this.http.get<{ color: string; precioGramoPen: number; fechaPublicacion: string }[]>(`${environment.apiBaseUrl}/api/v1/cotizador/colores`).subscribe({
      next: (precios) => {
        this.preciosColor.set(precios);
        this.precioReferencialPen.set(precios.find((precio) => precio.color === this.color())?.precioGramoPen ?? null);
        if (!precios.length) this.errorPrecio.set('El mayorista aún no publicó la cotización.');
        this.cargandoPrecio.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.precioReferencialPen.set(null);
        this.errorPrecio.set(error.status === 404
          ? 'El mayorista aún no publicó el precio referencial.'
          : 'No se pudo consultar el precio referencial.');
        this.cargandoPrecio.set(false);
      },
    });
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
    if (this.precioReferencialPen() === null) {
      this.errorCotizacion.set('Espera a que el mayorista publique el precio referencial.');
      return;
    }

    this.cotizando.set(true);
    this.errorCotizacion.set('');
    this.cotizacion.set(null);
    this.http.get<CotizacionEstimada>(`${environment.apiBaseUrl}/api/v1/cotizador/estimar`, {
      params: { pesoBrutoGramos: peso, color: this.color() },
    }).subscribe({
      next: (resultado) => {
        this.cotizacion.set(resultado);
        this.precioReferencialPen.set(resultado.precioGramoReferencialPen);
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
