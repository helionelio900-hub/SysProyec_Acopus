import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';
import { SesionService } from '../../core/auth/sesion.service';

interface Perfil {
  idMinero: number;
  documentoIdentidad: string;
  nombresApellidos: string;
  telefono: string;
  zonaProcedencia: string;
  idCentroAcopioPreferido: number | null;
}
interface Centro {
  idCentroAcopio: number;
  nombre: string;
  zona: string;
  direccion: string;
  activo: boolean;
}

@Component({
  selector: 'app-perfil-minero',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './perfil-minero.html',
  styleUrl: './perfil-minero.css',
})
export class PerfilMinero implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly sesion = inject(SesionService);
  protected readonly perfil = signal<Perfil | null>(null);
  protected readonly centros = signal<Centro[]>([]);
  protected readonly form = this.fb.nonNullable.group({
    idCentroAcopio: [0, [Validators.required, Validators.min(1)]],
  });
  protected readonly cargando = signal(true);
  protected readonly guardando = signal(false);
  protected readonly mensaje = signal('');
  protected readonly error = signal('');

  ngOnInit(): void {
    if (!sessionStorage.getItem('sitraoro.accessToken')) {
      void this.router.navigateByUrl('/ingresar');
      return;
    }
    this.http.get<Perfil>(`${environment.apiBaseUrl}/api/v1/minero/perfil`).subscribe({
      next: (perfil) => {
        this.perfil.set(perfil);
        this.form.controls.idCentroAcopio.setValue(perfil.idCentroAcopioPreferido ?? 0);
        this.cargando.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.error.set(
          error.status === 401 || error.status === 403
            ? 'Tu sesión venció. Inicia sesión nuevamente.'
            : 'No pudimos cargar tus datos. Intenta nuevamente.',
        );
        this.cargando.set(false);
      },
    });
    this.http.get<Centro[]>(`${environment.apiBaseUrl}/api/v1/publico/centros-acopio`).subscribe({
      next: (centros) => this.centros.set(centros.filter((centro) => centro.activo)),
      error: () => this.error.set('No pudimos cargar los centros disponibles.'),
    });
  }

  protected guardarCentro(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error.set('Elige un centro de acopio primero.');
      return;
    }
    const { idCentroAcopio } = this.form.getRawValue();
    this.guardando.set(true);
    this.error.set('');
    this.mensaje.set('');
    this.http
      .patch<Perfil>(`${environment.apiBaseUrl}/api/v1/minero/perfil/centro-acopio`, {
        idCentroAcopio,
      })
      .subscribe({
        next: (perfil) => {
          this.perfil.set(perfil);
          this.form.controls.idCentroAcopio.setValue(perfil.idCentroAcopioPreferido ?? 0);
          this.mensaje.set('Guardamos tu centro preferido. Esta elección no registra una entrega.');
          this.guardando.set(false);
        },
        error: () => {
          this.error.set('No se pudo guardar el centro. Verifica tu sesión e inténtalo otra vez.');
          this.guardando.set(false);
        },
      });
  }

  protected cerrarSesion(): void {
    this.sesion.cerrar();
  }
}
