import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Minero } from './minero';
import { MineroService } from './minero.service';

@Component({ selector: 'app-minero-list', imports: [RouterLink, DatePipe], templateUrl: './minero-list.html', styleUrl: './minero-list.css' })
export class MineroList implements OnInit {
  private readonly mineroService = inject(MineroService);
  readonly mineros = signal<Minero[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.loading.set(true);
    this.error.set(null);
    console.info('[MineroList] Consultando mineros en el backend...');

    this.mineroService.listar().subscribe({
      next: data => {
        console.info(`[MineroList] ${data.length} minero(s) recibido(s).`, data);
        this.mineros.set(data);
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        console.error('[MineroList] Error al consultar mineros.', error);
        this.error.set('No se pudieron cargar los mineros. Verifica que el backend esté activo en el puerto 8081.');
        this.loading.set(false);
      }
    });
  }

  eliminar(minero: Minero): void {
    if (!confirm(`¿Eliminar a ${minero.nombresApellidos}?`)) return;
    this.error.set(null);
    console.info(`[MineroList] Eliminando minero #${minero.idMinero}...`);

    this.mineroService.eliminar(minero.idMinero).subscribe({
      next: () => {
        console.info(`[MineroList] Minero #${minero.idMinero} eliminado correctamente.`);
        this.mineros.update(items => items.filter(item => item.idMinero !== minero.idMinero));
      },
      error: (error: HttpErrorResponse) => {
        console.error(`[MineroList] No se pudo eliminar el minero #${minero.idMinero}.`, error);
        this.error.set(error.error?.message ?? 'No se puede eliminar el minero porque tiene operaciones relacionadas.');
      }
    });
  }
}
