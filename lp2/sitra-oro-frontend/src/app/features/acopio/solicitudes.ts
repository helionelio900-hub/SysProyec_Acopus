import { NumeroClaroPipe } from '../../core/numero-claro.pipe';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { environment } from '../../../environments/environment';
import { EntregaMinero } from '../../core/api/entregas-minero';
import { Component, OnInit, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { OperacionesService, SolicitudMinero } from '../../core/api/operaciones.service';

@Component({
  selector: 'app-solicitudes-acopio',
  imports: [MatButtonModule, NumeroClaroPipe],
  templateUrl: './solicitudes.html',
  styleUrl: './solicitudes.css',
})
export class SolicitudesAcopio implements OnInit {
  private readonly service = inject(OperacionesService);
  private readonly http = inject(HttpClient);
  protected readonly entregas = signal<EntregaMinero[]>([]);
  protected readonly aceptando = signal<number | null>(null);
  protected aceptarEntrega(entrega: EntregaMinero): void {
    this.aceptando.set(entrega.ID_SOLICITUD);
    this.http.post(`${environment.apiBaseUrl}/api/v1/acopio/solicitudes-entrega/${entrega.ID_SOLICITUD}/aceptar`, {}).subscribe({
      next: () => {
        this.aceptando.set(null);
        this.mensaje.set('Solicitud aceptada. Ya puedes seleccionar al minero en Compras de oro y confirmar los pesos reales.');
        this.cargar();
      },
      error: () => { this.aceptando.set(null); this.error.set('No se pudo aceptar la entrega. Actualiza e intenta nuevamente.'); },
    });
  }
  protected readonly solicitudes = signal<SolicitudMinero[]>([]);
  protected readonly cargando = signal(true);
  protected readonly aprobando = signal<string | null>(null);
  protected readonly error = signal('');
  protected readonly mensaje = signal('');
  ngOnInit(): void {
    this.cargar();
  }
  protected cargar(): void {
    this.http.get<EntregaMinero[]>(`${environment.apiBaseUrl}/api/v1/acopio/solicitudes-entrega`).subscribe({
      next: items => this.entregas.set(items),
      error: () => this.error.set('No se pudieron cargar las solicitudes de entrega.'),
    });
    this.cargando.set(true);
    this.error.set('');
    this.service.solicitudes().subscribe({
      next: (items) => {
        this.solicitudes.set(items);
        this.cargando.set(false);
        console.info(`[Acopio] ${items.length} solicitud(es) pendiente(s).`);
      },
      error: (response: HttpErrorResponse) => {
        this.error.set(
          response.status === 403
            ? 'Tu cuenta no tiene permiso para gestionar estas solicitudes.'
            : (response.error?.message ?? 'No se pudieron consultar las solicitudes.'),
        );
        this.cargando.set(false);
        console.error('[Acopio] Error al cargar solicitudes.', response.status);
      },
    });
  }
  protected aprobar(solicitud: SolicitudMinero): void {
    if (
      !window.confirm(
        `¿Aprobar la cuenta del minero con documento ${solicitud.documentoIdentidad}?`,
      )
    )
      return;
    this.aprobando.set(solicitud.documentoIdentidad);
    this.error.set('');
    this.mensaje.set('');
    this.service.aprobarSolicitud(solicitud.documentoIdentidad).subscribe({
      next: () => {
        this.solicitudes.update((items) =>
          items.filter((item) => item.documentoIdentidad !== solicitud.documentoIdentidad),
        );
        this.mensaje.set(
          `La cuenta ${solicitud.documentoIdentidad} quedó aprobada para este centro.`,
        );
        this.aprobando.set(null);
        console.info('[Acopio] Solicitud aprobada.');
      },
      error: (response: HttpErrorResponse) => {
        this.error.set(
          response.error?.message ??
            'No se pudo aprobar la solicitud. Actualiza la lista e inténtalo nuevamente.',
        );
        this.aprobando.set(null);
        console.error('[Acopio] No se pudo aprobar la solicitud.', response.status);
      },
    });
  }
}
