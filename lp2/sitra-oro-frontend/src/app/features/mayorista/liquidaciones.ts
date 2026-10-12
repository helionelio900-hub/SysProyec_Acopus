import { DatePipe } from '@angular/common';

import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';

import { OperacionesService } from '../../core/api/operaciones.service';


@Component({
  selector: 'app-liquidaciones-mayorista',
  imports: [ReactiveFormsModule, DatePipe, MatButtonModule],
  templateUrl: './liquidaciones.html',
  styleUrl: './liquidaciones.css',
})
export class LiquidacionesMayorista implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(OperacionesService);
  protected readonly preciosColor = signal<{ color: string; precioGramoPen: number; fechaPublicacion: string }[]>([]);
  protected readonly colores = ['ROJO', 'VERDE'] as const;
  protected precioVista(color: 'ROJO' | 'VERDE', moneda: 'USD' | 'PEN'): string {
    const valores = this.form.getRawValue();
    const porcentaje = color === 'ROJO' ? valores.exportacionRojo : valores.exportacionVerde;
    if (this.form.invalid) return '—';
    const ley = color === 'ROJO' ? valores.leyRojo : valores.leyVerde;
    const usd = valores.cotizacionOnzaUsd * (ley / 100)
      * (1 - porcentaje / 100) / 31.0999;
    return moneda === 'USD' ? `USD ${usd.toFixed(2)}` : this.dinero(usd * valores.tipoCambioUsdPen);
  }
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

  ngOnInit(): void {
    this.service.cotizacionesColor().subscribe({ next: (precios) => this.preciosColor.set(precios), error: () => this.errorPrecio.set('No se pudo cargar la cotización vigente.') });

    this.form.valueChanges.subscribe(() => {
      this.consultaPrecioActual++;

      this.calculandoPrecio.set(false);
      this.errorPrecio.set('');
    });
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
