import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';
import { SesionService } from '../../core/auth/sesion.service';

interface CentroAcopio {
  idCentroAcopio: number;
  nombre: string;
  zona: string;
  direccion: string;
  activo: boolean;
}
interface RespuestaRegistro {
  estadoCuenta: string;
  mensaje: string;
}
interface TokenResponse {
  accessToken: string;
  tokenType: string;
  expiresInSeconds: number;
}

@Component({
  selector: 'app-cuenta-minero',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './cuenta-minero.html',
  styleUrl: './cuenta-minero.css',
})
export class CuentaMinero implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly sesion = inject(SesionService);
  private readonly host = inject(ElementRef<HTMLElement>);
  protected readonly modo = this.route.snapshot.data['modo'] as 'registro' | 'ingreso';
  protected readonly centros = signal<CentroAcopio[]>([]);
  protected readonly cargandoCentros = signal(false);
  protected readonly enviando = signal(false);
  protected readonly error = signal('');
  protected readonly resultado = signal('');
  protected readonly mostrarClave = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    documentoIdentidad: [
      '',
      [Validators.required, Validators.minLength(8), Validators.maxLength(15)],
    ],
    nombresApellidos: ['', [Validators.required, Validators.maxLength(150)]],
    telefono: ['', [Validators.required, Validators.maxLength(20)]],
    zonaProcedencia: ['', Validators.maxLength(100)],
    clave: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(64)]],
    idCentroAcopioPreferido: ['', Validators.required],
  });

  ngOnInit(): void {
    if (this.modo === 'registro') {
      this.cargarCentros();
    } else {
      this.form.controls.clave.setValidators([Validators.required, Validators.maxLength(64)]);
      this.form.controls.clave.updateValueAndValidity();
      this.form.controls.nombresApellidos.clearValidators();
      this.form.controls.telefono.clearValidators();
      this.form.controls.zonaProcedencia.clearValidators();
      this.form.controls.idCentroAcopioPreferido.clearValidators();
      this.form.controls.nombresApellidos.updateValueAndValidity();
      this.form.controls.telefono.updateValueAndValidity();
      this.form.controls.zonaProcedencia.updateValueAndValidity();
      this.form.controls.idCentroAcopioPreferido.updateValueAndValidity();
    }
  }

  protected enviar(): void {
    this.error.set('');
    this.resultado.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      (this.host.nativeElement as HTMLElement)
        .querySelector<HTMLElement>('[aria-invalid="true"]')
        ?.focus();
      return;
    }
    this.enviando.set(true);

    if (this.modo === 'registro') {
      const value = this.form.getRawValue();
      this.http
        .post<RespuestaRegistro>(`${environment.apiBaseUrl}/api/v1/minero/registro`, {
          ...value,
          idCentroAcopioPreferido: Number(value.idCentroAcopioPreferido),
        })
        .subscribe({
          next: (respuesta) => {
            this.resultado.set(respuesta.mensaje);
            this.enviando.set(false);
          },
          error: (error) => {
            this.error.set(
              error.error?.detail ||
                error.error?.message ||
                'No se pudo crear la cuenta. Revisa tus datos e inténtalo nuevamente.',
            );
            this.enviando.set(false);
          },
        });
      return;
    }

    const { documentoIdentidad, clave } = this.form.getRawValue();
    this.http
      .post<TokenResponse>(`${environment.apiBaseUrl}/api/v1/seguridad/login`, {
        documentoIdentidad,
        clave,
      })
      .subscribe({
        next: (token) => {
          this.sesion.guardar(token.accessToken);
          const destino =
            this.sesion.rol() === 'G2_ACOPIADOR'
              ? '/acopio'
              : this.sesion.rol() === 'G1_MAYORISTA'
                ? '/mayorista'
                : '/minero/cuenta';
          void this.router.navigateByUrl(destino);
        },
        error: (error) => {
          this.error.set(
            error.error?.detail ||
              error.error?.message ||
              'No pudimos iniciar sesión. Verifica tu documento y clave.',
          );
          this.enviando.set(false);
        },
      });
  }

  protected cargarCentros(): void {
    this.error.set('');
    this.cargandoCentros.set(true);
    this.http
      .get<CentroAcopio[]>(`${environment.apiBaseUrl}/api/v1/publico/centros-acopio`)
      .subscribe({
        next: (centros) => {
          this.centros.set(centros.filter((centro) => centro.activo));
          this.cargandoCentros.set(false);
        },
        error: () => {
          this.error.set('No pudimos cargar los centros de acopio. Intenta de nuevo más tarde.');
          this.cargandoCentros.set(false);
        },
      });
  }
}
