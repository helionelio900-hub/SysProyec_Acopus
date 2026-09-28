import { Component, Injectable, InjectionToken } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Observable, of } from 'rxjs';
import {
  CentroAcopio,
  CrearCentro,
  Liquidacion,
  ReporteLiquidaciones,
} from '../../core/api/operaciones.service';

export const MAYORISTA_VISTA_PREVIA = new InjectionToken<boolean>('Mayorista vista previa', {
  providedIn: 'root',
  factory: () => false,
});

/** Datos ficticios y aislados: solo se usan en la ruta de desarrollo. */
@Injectable()
export class MayoristaPreviewService {
  private readonly centrosDemo: CentroAcopio[] = [
    {
      idCentroAcopio: 901,
      nombre: 'Centro de ejemplo · Rinconada',
      zona: 'La Rinconada',
      direccion: 'Dirección ficticia 01',
      telefono: null,
      documentoAcopiador: '90000001',
      activo: true,
    },
    {
      idCentroAcopio: 902,
      nombre: 'Centro de ejemplo · Ananea',
      zona: 'Ananea',
      direccion: 'Dirección ficticia 02',
      telefono: null,
      documentoAcopiador: '90000002',
      activo: true,
    },
    {
      idCentroAcopio: 903,
      nombre: 'Centro de ejemplo · Juliaca',
      zona: 'Juliaca',
      direccion: 'Dirección ficticia 03',
      telefono: null,
      documentoAcopiador: '90000003',
      activo: false,
    },
  ];
  private siguienteCentroId = 904;

  private readonly liquidacionesDemo: Liquidacion[] = [
    {
      idLiquidacionG1: 9001,
      nombreAcopiadorG2: 'Acopiador de ejemplo A',
      estado: 'DEMO',
      pesoTotalFundidoG: 85.4,
      cotizacionOnzaUsd: 0,
      tipoCambioUsdPen: 0,
      totalPagadoG2Pen: 1200,
      fechaLiquidacion: '2026-09-20T10:30:00',
      detalles: [],
    },
    {
      idLiquidacionG1: 9002,
      nombreAcopiadorG2: 'Acopiador de ejemplo B',
      estado: 'DEMO',
      pesoTotalFundidoG: 62.8,
      cotizacionOnzaUsd: 0,
      tipoCambioUsdPen: 0,
      totalPagadoG2Pen: 800,
      fechaLiquidacion: '2026-09-18T15:00:00',
      detalles: [],
    },
  ];

  centros(): Observable<CentroAcopio[]> {
    return of(this.centrosDemo.map((centro) => ({ ...centro })));
  }

  reporteLiquidaciones(): Observable<ReporteLiquidaciones> {
    return of({
      agregado: { totalLiquidaciones: 2, montoTotal: 2000, ticketPromedio: 1000 },
      liquidaciones: this.liquidacionesDemo.map((item) => ({
        idLiquidacionG1: item.idLiquidacionG1,
        fechaLiquidacion: item.fechaLiquidacion,
        estado: item.estado,
        totalPagadoG2Pen: item.totalPagadoG2Pen,
        cantidadDetalles: item.detalles.length,
      })),
    });
  }

  liquidaciones(): Observable<Liquidacion[]> {
    return of(this.liquidacionesDemo.map((item) => ({ ...item, detalles: [...item.detalles] })));
  }

  crearCentro(request: CrearCentro): Observable<CentroAcopio> {
    const centro: CentroAcopio = {
      idCentroAcopio: this.siguienteCentroId++,
      nombre: request.nombre,
      zona: request.zona,
      direccion: request.direccion,
      telefono: request.telefono,
      documentoAcopiador: request.documentoAcopiador,
      activo: true,
    };
    this.centrosDemo.push(centro);
    return of({ ...centro });
  }
}

@Component({
  selector: 'app-mayorista-preview',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './mayorista-preview.html',
  styleUrl: './mayorista-preview.css',
})
export class MayoristaPreview {}
