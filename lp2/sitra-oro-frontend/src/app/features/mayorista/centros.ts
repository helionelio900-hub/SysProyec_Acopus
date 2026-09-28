import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { CentroAcopio, OperacionesService } from '../../core/api/operaciones.service';
import { MAYORISTA_VISTA_PREVIA } from './mayorista-preview';

@Component({
  selector: 'app-centros-mayorista',
  imports: [ReactiveFormsModule, MatButtonModule],
  templateUrl: './centros.html',
  styleUrl: './centros.css',
})
export class CentrosMayorista implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(OperacionesService);
  protected readonly vistaPrevia = inject(MAYORISTA_VISTA_PREVIA);
  protected readonly centros = signal<CentroAcopio[]>([]);
  protected readonly cargando = signal(true);
  protected readonly guardando = signal(false);
  protected readonly error = signal('');
  protected readonly mensaje = signal('');
  protected readonly mostrarFormulario = signal(this.vistaPrevia);
  protected readonly form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(120)]],
    zona: ['', [Validators.required, Validators.maxLength(100)]],
    direccion: ['', [Validators.required, Validators.maxLength(200)]],
    telefono: ['', Validators.maxLength(20)],
    documentoAcopiador: [
      '',
      [Validators.required, Validators.minLength(8), Validators.maxLength(15)],
    ],
    claveInicialAcopiador: [
      '',
      [Validators.required, Validators.minLength(10), Validators.maxLength(64)],
    ],
  });
  ngOnInit(): void {
    this.cargar();
  }
  protected cargar(): void {
    this.cargando.set(true);
    this.service.centros().subscribe({
      next: (items) => {
        this.centros.set(items);
        this.cargando.set(false);
        console.info(`[Mayorista] ${items.length} centro(s) de acopio cargado(s).`);
      },
      error: (response: HttpErrorResponse) => {
        this.error.set(
          response.status === 403
            ? 'Tu cuenta no tiene permiso para gestionar centros.'
            : 'No se pudieron cargar los centros de acopio.',
        );
        this.cargando.set(false);
        console.error('[Mayorista] Error al consultar centros.', response.status);
      },
    });
  }
  protected crear(): void {
    this.mensaje.set('');
    this.error.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const datos = this.form.getRawValue();
    this.guardando.set(true);
    this.service
      .crearCentro({
        ...datos,
        nombre: datos.nombre.trim(),
        zona: datos.zona.trim(),
        direccion: datos.direccion.trim(),
        documentoAcopiador: datos.documentoAcopiador.trim(),
        claveInicialAcopiador: datos.claveInicialAcopiador,
      })
      .subscribe({
        next: (centro) => {
          this.mensaje.set(
            this.vistaPrevia
              ? `Ejemplo creado: ${centro.nombre}. No se guardó en el servidor ni se creó una cuenta real.`
              : `Se creó ${centro.nombre}. El acopiador puede ingresar con el documento y la clave inicial que definiste.`,
          );
          this.form.reset();
          this.mostrarFormulario.set(false);
          this.guardando.set(false);
          this.cargar();
          console.info('[Mayorista] Centro de acopio creado.', centro.idCentroAcopio);
        },
        error: (response: HttpErrorResponse) => {
          this.error.set(
            response.error?.detail ??
              response.error?.message ??
              'No se pudo crear el centro. Revisa los datos e inténtalo otra vez.',
          );
          this.guardando.set(false);
          console.error('[Mayorista] Error al crear centro.', response.status);
        },
      });
  }
}
