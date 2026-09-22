import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Minero } from './minero';
import { MineroService } from './minero.service';

@Component({ selector: 'app-minero-list', imports: [RouterLink, DatePipe], templateUrl: './minero-list.html', styleUrl: './minero-list.css' })
export class MineroList implements OnInit {
  private readonly mineroService = inject(MineroService);
  readonly mineros = signal<Minero[]>([]); readonly loading = signal(true); readonly error = signal<string | null>(null);
  ngOnInit(): void { this.cargar(); }
  cargar(): void { this.loading.set(true); this.error.set(null); this.mineroService.listar().subscribe({ next: data => { this.mineros.set(data); this.loading.set(false); }, error: () => { this.error.set('No se pudieron cargar los mineros. Verifica que el backend esté activo en el puerto 8081.'); this.loading.set(false); } }); }
  eliminar(minero: Minero): void { if (!confirm(`¿Eliminar a ${minero.nombresApellidos}?`)) return; this.error.set(null); this.mineroService.eliminar(minero.idMinero).subscribe({ next: () => this.mineros.update(items => items.filter(item => item.idMinero !== minero.idMinero)), error: (error: HttpErrorResponse) => this.error.set(error.error?.message ?? 'No se puede eliminar el minero porque tiene operaciones relacionadas.') }); }
}
