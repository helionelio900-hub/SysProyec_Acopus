import { Component, DestroyRef, OnInit, inject, isDevMode, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, debounceTime, distinctUntilChanged, map, of, switchMap, tap } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { environment } from '../../../../environments/environment';
import { MineroRequest } from './minero';
import { MineroService } from './minero.service';

@Component({
  selector: 'app-minero-form',
  imports: [ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  templateUrl: './minero-form.html',
  styleUrl: './minero-form.css',
})
export class MineroForm implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(MineroService);
  private readonly http = inject(HttpClient);

  readonly id = signal<number | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  protected readonly consultandoDni = signal(false);
  protected readonly estadoDni = signal('');
  private nombreConsultado = '';

  protected readonly form = this.fb.nonNullable.group({
    documentoIdentidad: [
      '',
      [Validators.required, Validators.minLength(8), Validators.maxLength(15)],
    ],
    nombresApellidos: ['', [Validators.required, Validators.maxLength(150)]],
    telefono: ['', [Validators.maxLength(20)]],
    zonaProcedencia: ['', [Validators.maxLength(100)]],
  });

  protected readonly cambiosNombres = this.form.controls.nombresApellidos.valueChanges
    .pipe(debounceTime(350), distinctUntilChanged())
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe(() => {
      if (isDevMode()) console.info('[MineroForm] Se detectó un cambio en el campo de nombre.');
    });

  get editando(): boolean {
    return this.id() !== null;
  }

  ngOnInit(): void {
    // Consulta automática de DNI en RENIEC al ingresar 8 dígitos
    this.form.controls.documentoIdentidad.valueChanges
      .pipe(
        tap(() => {
          if (
            this.nombreConsultado &&
            this.form.controls.nombresApellidos.value === this.nombreConsultado
          ) {
            this.form.controls.nombresApellidos.setValue('');
          }
          this.nombreConsultado = '';
          this.estadoDni.set('');
          this.consultandoDni.set(false);
        }),
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((dni) => {
          const limpio = (dni || '').trim();
          if (!/^\d{8}$/.test(limpio)) return of(null);
          this.consultandoDni.set(true);
          this.estadoDni.set('Consultando DNI en RENIEC...');
          return this.http
            .get<{ nombresApellidos: string }>(
              `${environment.apiBaseUrl}/api/v1/publico/identidad/dni/${limpio}`
            )
            .pipe(
              map((datos) =>
                this.form.controls.documentoIdentidad.value.trim() === limpio ? datos : null
              ),
              catchError(() => {
                if (this.form.controls.documentoIdentidad.value.trim() === limpio) {
                  this.estadoDni.set(
                    'No se pudo consultar el DNI. Puedes escribir los nombres manualmente.'
                  );
                }
                return of(null);
              })
            );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((datos) => {
        this.consultandoDni.set(false);
        if (datos) {
          this.nombreConsultado = datos.nombresApellidos;
          this.form.controls.nombresApellidos.setValue(datos.nombresApellidos);
          this.estadoDni.set('Nombre obtenido por consulta de DNI.');
        }
      });

    const value = this.route.snapshot.paramMap.get('id');
    if (!value) return;
    const id = Number(value);
    if (!Number.isInteger(id) || id < 1) {
      this.error.set('El identificador del minero no es válido.');
      return;
    }
    this.id.set(id);
    this.loading.set(true);
    this.service.obtener(id).subscribe({
      next: (minero) => {
        this.form.patchValue({
          ...minero,
          telefono: minero.telefono ?? '',
          zonaProcedencia: minero.zonaProcedencia ?? '',
        });
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el minero solicitado.');
        this.loading.set(false);
      },
    });
  }

  guardar(): void {
    if (this.loading()) return;
    this.form.controls.documentoIdentidad.setValue(
      this.form.controls.documentoIdentidad.value.trim(),
    );
    this.form.controls.nombresApellidos.setValue(this.form.controls.nombresApellidos.value.trim());
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    const request: MineroRequest = this.form.getRawValue();
    const operation = this.editando
      ? this.service.actualizar(this.id()!, request)
      : this.service.crear(request);
    operation.subscribe({
      next: () => this.router.navigateByUrl('/acopio/mineros'),
      error: (response: HttpErrorResponse) => {
        this.error.set(
          response.error?.message ??
            'No se pudo guardar el minero. Revisa los datos e inténtalo nuevamente.',
        );
        this.loading.set(false);
      },
    });
  }

  cancelar(): void {
    this.router.navigateByUrl('/acopio/mineros');
  }

  mensaje(
    control: 'documentoIdentidad' | 'nombresApellidos' | 'telefono' | 'zonaProcedencia',
  ): string {
    const field = this.form.controls[control];
    if (!field.touched || !field.errors) return '';
    if (field.hasError('required')) return 'Este campo es obligatorio.';
    if (field.hasError('minlength'))
      return `Debe tener al menos ${field.getError('minlength').requiredLength} caracteres.`;
    return `No puede superar ${field.getError('maxlength')?.requiredLength} caracteres.`;
  }
}
