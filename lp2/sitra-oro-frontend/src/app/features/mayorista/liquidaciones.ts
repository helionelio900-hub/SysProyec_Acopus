import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { Liquidacion, OperacionesService } from '../../core/api/operaciones.service';
import { MAYORISTA_VISTA_PREVIA } from './mayorista-preview';

@Component({
  selector: 'app-liquidaciones-mayorista',
  imports: [ReactiveFormsModule, DatePipe, MatButtonModule, RouterLink],
  templateUrl: './liquidaciones.html',
  styleUrl: './liquidaciones.css',
})
export class LiquidacionesMayorista implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(OperacionesService);
  protected readonly vistaPrevia = inject(MAYORISTA_VISTA_PREVIA);
  protected readonly liquidaciones = signal<Liquidacion[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal('');
  protected readonly form = this.fb.nonNullable.group({
    cotizacionOnzaUsd: [0, [Validators.required, Validators.min(0.01)]],
    tipoCambioUsdPen: [0, [Validators.required, Validators.min(0.0001)]],
  });

  ngOnInit(): void {
    this.cargar();
  }

  protected cargar(): void {
    this.cargando.set(true);
    this.error.set('');
    this.service.liquidaciones().subscribe({
      next: (items) => {
        this.liquidaciones.set(items);
        this.cargando.set(false);
        console.info(`[Mayorista] ${items.length} liquidación(es) consultada(s).`);
      },
      error: (response: HttpErrorResponse) => {
        this.error.set(
          response.status === 403
            ? 'Tu cuenta no tiene permiso para consultar liquidaciones.'
            : 'No se pudieron consultar las liquidaciones.',
        );
        this.cargando.set(false);
        console.error('[Mayorista] Error al consultar liquidaciones.', response.status);
      },
    });
  }

  protected dinero(valor: number): string {
    return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(valor);
  }

  protected gramos(valor: number): string {
    return `${new Intl.NumberFormat('es-PE', { maximumFractionDigits: 3 }).format(valor)} g`;
  }
}
