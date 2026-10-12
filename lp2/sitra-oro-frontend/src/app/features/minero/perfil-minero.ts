import { NumeroClaroPipe } from '../../core/numero-claro.pipe';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';
import { SesionService } from '../../core/auth/sesion.service';
import { EntregaMinero } from '../../core/api/entregas-minero';

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
interface EstimadoOro {
  pesoBrutoGramos: number;
  precioGramoReferencialPen: number;
  montoEstimadoTotalPen: number;
}

@Component({
  selector: 'app-perfil-minero',
  imports: [ReactiveFormsModule, RouterLink, NumeroClaroPipe],
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
  protected readonly consultaOro = this.fb.nonNullable.group({
    color: ['ROJO', Validators.required],
    peso: [0, [Validators.required, Validators.min(0.001)]],
  });
  protected readonly estimado = signal<EstimadoOro | null>(null);
  protected readonly consultando = signal(false);
  protected readonly entregas = signal<EntregaMinero[]>([]);
  protected readonly enviando = signal(false);
  protected readonly entregaMensaje = signal('');
  private nuevaPartida() {
    return this.fb.nonNullable.group({
      color: ['ROJO', Validators.required],
      pesoCrudo: [0, [Validators.required, Validators.min(0.001)]],
      pesoEstimado: [0, [Validators.required, Validators.min(0.001)]],
    });
  }
  protected readonly entregaForm = this.fb.nonNullable.group({
    idCentroAcopio: [0, [Validators.required, Validators.min(1)]],
    partidas: this.fb.array([this.nuevaPartida()]),
  });
  protected agregarPartida(): void {
    if (this.entregaForm.controls.partidas.length < 200) this.entregaForm.controls.partidas.push(this.nuevaPartida());
  }
  protected quitarPartida(i: number): void {
    if (this.entregaForm.controls.partidas.length > 1) this.entregaForm.controls.partidas.removeAt(i);
  }
  private cargarEntregas(): void {
    this.http.get<EntregaMinero[]>(`${environment.apiBaseUrl}/api/v1/minero/entregas`).subscribe({
      next: items => this.entregas.set(items),
      error: () => this.entregaMensaje.set('No pudimos cargar tus solicitudes. Actualiza la página.'),
    });
  }
  protected enviarEntrega(): void {
    const datos = this.entregaForm.getRawValue();
    if (this.entregaForm.invalid || datos.partidas.some(p => p.pesoEstimado > p.pesoCrudo)) {
      this.entregaMensaje.set('Elige un acopio y completa los pesos. El peso estimado debe ser mayor que cero y no superar el crudo.');
      return;
    }
    this.enviando.set(true);
    this.entregaMensaje.set('');
    this.http.post(`${environment.apiBaseUrl}/api/v1/minero/entregas`, datos).subscribe({
      next: () => {
        this.entregaMensaje.set('Solicitud enviada al acopio. Los pesos quedan pendientes de confirmación presencial.');
        this.entregaForm.controls.partidas.clear();
        this.agregarPartida();
        this.enviando.set(false);
        this.cargarEntregas();
      },
      error: () => { this.enviando.set(false); this.entregaMensaje.set('No se pudo enviar la solicitud. Intenta nuevamente.'); },
    });
  }
  protected readonly errorCotizacion = signal('');

  protected consultarOro(): void {
    this.estimado.set(null);
    this.errorCotizacion.set('');
    if (this.consultaOro.invalid) {
      this.consultaOro.markAllAsTouched();
      this.errorCotizacion.set('Ingresa un peso mayor que cero.');
      return;
    }
    const { color, peso } = this.consultaOro.getRawValue();
    this.consultando.set(true);
    this.http.get<EstimadoOro>(`${environment.apiBaseUrl}/api/v1/cotizador/estimar`, {
      params: { color, pesoBrutoGramos: peso },
    }).subscribe({
      next: (resultado) => {
        const actual = this.consultaOro.getRawValue();
        if (actual.color === color && actual.peso === peso) {
          this.estimado.set(resultado);
        }
        this.consultando.set(false);
      },
      error: () => {
        this.errorCotizacion.set('No pudimos consultar la cotización. Intenta nuevamente.');
        this.consultando.set(false);
      },
    });
  }

  ngOnInit(): void {
    if (!sessionStorage.getItem('sitraoro.accessToken')) {
      void this.router.navigateByUrl('/ingresar');
      return;
    }
    this.http.get<Perfil>(`${environment.apiBaseUrl}/api/v1/minero/perfil`).subscribe({
      next: (perfil) => {
        this.perfil.set(perfil);
        this.form.controls.idCentroAcopio.setValue(perfil.idCentroAcopioPreferido ?? 0);
        this.entregaForm.controls.idCentroAcopio.setValue(perfil.idCentroAcopioPreferido ?? 0);
        this.cargarEntregas();
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
