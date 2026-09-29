import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  CentroAcopio,
  CrearRecepcionMayorista,
  OperacionesService,
  RecepcionMayorista as Registro,
} from '../../core/api/operaciones.service';
import { MAYORISTA_VISTA_PREVIA } from './mayorista-preview';

type ColorOro = 'rojo' | 'verde';

@Component({
  selector: 'app-recepcion-mayorista',
  imports: [ReactiveFormsModule, MatButtonModule],
  templateUrl: './recepcion-mayorista.html',
  styleUrl: './recepcion-mayorista.css',
})
export class RecepcionMayorista implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly operaciones = inject(OperacionesService);
  protected readonly vistaPrevia = inject(MAYORISTA_VISTA_PREVIA);
  protected readonly mensaje = signal('');
  protected readonly error = signal('');
  protected readonly cargando = signal(false);
  protected readonly guardando = signal(false);
  protected readonly registros = signal<Registro[]>([]);
  protected readonly centros = signal<CentroAcopio[]>([]);
  protected readonly centroFiltrado = signal<number | null>(null);
  protected readonly editandoId = signal<number | null>(null);
  private siguienteId = 1;
  private consultaActual = 0;

  protected readonly form = this.fb.nonNullable.group({
    fecha: [this.fechaLocal(), Validators.required],
    idCentroAcopio: [0, [Validators.required, Validators.min(1)]],
    rojo: this.crearFila(),
    verde: this.crearFila(),
    descuento: [''],
    total: [''],
  });

  ngOnInit(): void {
    if (this.vistaPrevia) {
      this.form.patchValue({
        idCentroAcopio: 1,
        rojo: { pesoSinFundirG: 10.1, pesoFundidoG: 10 },
      });
      return;
    }
    this.cargarCentros();
    this.cargar();
  }

  protected etiquetaCentro(centro: CentroAcopio): string {
    return `${centro.nombre} · ${centro.zona}`;
  }

  protected merma(color: ColorOro): string {
    const fila = this.form.controls[color].getRawValue();
    if (fila.pesoSinFundirG === null || fila.pesoFundidoG === null) return '—';
    return `${(fila.pesoSinFundirG - fila.pesoFundidoG).toFixed(3)} g`;
  }

  protected guardar(): void {
    this.mensaje.set('');
    this.error.set('');
    if (this.form.invalid || !this.pesosValidos()) {
      this.form.markAllAsTouched();
      this.error.set('Selecciona el centro de acopio y completa los pesos. Cada color debe tener ambos pesos o ninguno.');
      return;
    }
    const datos: CrearRecepcionMayorista = this.form.getRawValue();
    const id = this.editandoId();
    this.guardando.set(true);
    if (this.vistaPrevia) {
      const idRecepcion = id ?? this.siguienteId++;
      const item: Registro = {
        ...datos,
        idRecepcion,
        nombreAcopiador: 'Acopiador de ejemplo · Vista de demostración',
      };
      this.registros.update((actuales) =>
        id === null
          ? [...actuales, item]
          : actuales.map((registro) => (registro.idRecepcion === id ? item : registro)),
      );
      this.finalizarGuardado('Ejemplo guardado solo en esta vista de demostración.');
      return;
    }
    const peticion =
      id === null
        ? this.operaciones.registrarRecepcionMayorista(datos)
        : this.operaciones.actualizarRecepcionMayorista(id, datos);
    peticion.subscribe({
      next: () => {
        this.cargar();
        this.finalizarGuardado(
          id === null ? 'Registro guardado correctamente.' : 'Registro actualizado correctamente.',
        );
      },
      error: (response: HttpErrorResponse) => {
        this.guardando.set(false);
        const detalle = String(response.error?.message ?? '').toLowerCase();
        if (response.status === 404 && detalle.includes('centro de acopio')) {
          this.form.controls.idCentroAcopio.setValue(0);
          this.form.controls.idCentroAcopio.markAsTouched();
          this.error.set('El centro seleccionado ya no está disponible. Elige otro de la lista.');
          this.cargarCentros();
          return;
        }
        this.error.set(response.error?.message ?? 'No se pudo guardar el registro. Revisa la conexión con el servidor.');
      },
    });
  }

  protected editar(registro: Registro): void {
    this.form.patchValue({
      fecha: registro.fecha,
      idCentroAcopio: registro.idCentroAcopio,
      rojo: registro.rojo,
      verde: registro.verde,
      descuento: registro.descuento,
      total: registro.total,
    });
    this.editandoId.set(registro.idRecepcion);
    this.mensaje.set('Editando el registro seleccionado.');
    this.error.set('');
  }

  protected eliminar(id: number): void {
    this.mensaje.set('');
    this.error.set('');
    if (this.vistaPrevia) {
      this.registros.update((actuales) => actuales.filter((item) => item.idRecepcion !== id));
      this.mensaje.set('Ejemplo eliminado de esta vista.');
      return;
    }
    if (!window.confirm('¿Eliminar este registro de recepción?')) return;
    this.operaciones.eliminarRecepcionMayorista(id).subscribe({
      next: () => {
        this.cargar();
        if (this.editandoId() === id) this.limpiar();
        this.mensaje.set('Registro eliminado.');
      },
      error: (response: HttpErrorResponse) => {
        this.error.set(response.error?.message ?? 'No se pudo eliminar el registro.');
      },
    });
  }

  protected limpiar(): void {
    this.form.reset();
    this.form.controls.fecha.setValue(this.fechaLocal());
    this.editandoId.set(null);
    this.mensaje.set('');
    this.error.set('');
  }

  protected filtrarPorCentro(valor: string): void {
    this.centroFiltrado.set(valor ? Number(valor) : null);
    this.cargar();
  }

  private cargar(): void {
    const consulta = ++this.consultaActual;
    this.cargando.set(true);
    this.operaciones.recepcionesMayorista(this.centroFiltrado()).subscribe({
      next: (items) => {
        if (consulta !== this.consultaActual) return;
        this.registros.set(items);
        this.cargando.set(false);
      },
      error: (response: HttpErrorResponse) => {
        if (consulta !== this.consultaActual) return;
        this.cargando.set(false);
        this.error.set(
          response.status === 401
            ? 'Tu sesión venció. Vuelve a ingresar para consultar las recepciones.'
            : response.status === 403
              ? 'Tu cuenta no tiene permiso para consultar las recepciones.'
              : response.status === 404
                ? 'El servidor aún no tiene disponible la consulta de recepciones. Reinicia el backend actualizado.'
                : 'No se pudieron cargar las recepciones guardadas. Revisa que el backend esté encendido.',
        );
      },
    });
  }

  private cargarCentros(): void {
    this.operaciones.centros().subscribe({
      next: (centros) => this.centros.set(centros.filter((centro) => centro.activo)),
      error: (response: HttpErrorResponse) => {
        this.error.set(
          response.status === 401
            ? 'Tu sesión venció. Vuelve a ingresar para ver tus acopiadores.'
            : 'No se pudieron cargar los acopiadores. Revisa la conexión con el backend.',
        );
      },
    });
  }

  private finalizarGuardado(texto: string): void {
    this.guardando.set(false);
    this.editandoId.set(null);
    this.limpiar();
    this.mensaje.set(texto);
  }

  private crearFila() {
    return this.fb.nonNullable.group({
      pesoSinFundirG: [null as number | null, Validators.min(0)],
      pesoFundidoG: [null as number | null, Validators.min(0)],
      onza: [''],
      dolar: [''],
      exportacion: [''],
      pagoMaterial: [''],
    });
  }

  private pesosValidos(): boolean {
    const colores = ['rojo', 'verde'] as const;
    const filasValidas = colores.every((color) => {
      const fila = this.form.controls[color].getRawValue();
      return (
        (fila.pesoSinFundirG === null && fila.pesoFundidoG === null) ||
        (fila.pesoSinFundirG !== null &&
          fila.pesoFundidoG !== null &&
          Number.isFinite(fila.pesoSinFundirG) &&
          Number.isFinite(fila.pesoFundidoG) &&
          fila.pesoSinFundirG >= 0 &&
          fila.pesoFundidoG >= 0)
      );
    });
    return (
      filasValidas &&
      colores.some((color) => this.form.controls[color].controls.pesoFundidoG.value !== null)
    );
  }

  private fechaLocal(): string {
    const hoy = new Date();
    return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
  }
}
