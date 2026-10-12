import { Component, Injectable, InjectionToken } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Observable, of, throwError, map } from 'rxjs';
import {
  CentroAcopio,
  CrearCentro,
  ZonaAcopio,
  Liquidacion,
  ReporteLiquidaciones,
  PrecioReferencial,
  RecepcionLey, GuardarRecepcionLey, CalculoLey, LoteExportacion,
} from '../../core/api/operaciones.service';

export const MAYORISTA_VISTA_PREVIA = new InjectionToken<boolean>('Mayorista vista previa', {
  providedIn: 'root',
  factory: () => false,
});

/** Datos ficticios y aislados: solo se usan en la ruta de desarrollo. */
@Injectable()
export class MayoristaPreviewService {
  private recepcionesLeyDemo: RecepcionLey[] = [901, 902].map((id, i) => ({
    idRecepcion: id, fecha: '2026-10-10', idCentroAcopio: id,
    nombreAcopiador: i ? 'Centro de ejemplo · Ananea' : 'Centro de ejemplo · Rinconada',
    revision: 0, estado: 'PENDIENTE', idLoteExportacion: null,
    pesoDeclaradoG: i ? 50 : 120, pesoRojoSinFundirG: i ? 30 : 70, pesoVerdeSinFundirG: i ? 20 : 50,
    pesoFundidoG: 0, subtotal: null, adelanto: 0, total: 0, detalles: [],
  }));
  private lotesLeyDemo: LoteExportacion[] = [];
  recepcionesPorLey(): Observable<RecepcionLey[]> { return of(structuredClone(this.recepcionesLeyDemo)); }
  calcularRecepcionLey(request: GuardarRecepcionLey): Observable<CalculoLey> {
    const ids = new Set(request.detalles.map(p => p.ley));
    if (ids.size !== request.detalles.length || request.detalles.some(p => p.pesoFundidoG > p.pesoSinFundirG))
      return throwError(() => ({ error: { message: 'Revisa las leyes repetidas y los pesos fundidos.' } }));
    // Simulación local exclusiva de la vista de demostración; el guardado real calcula en Java.
    const detalles = request.detalles.map(p => {
      const exacto = p.onza * (p.ley / 100) * (1 - p.porcentaje / 100) / 31.0999;
      const precioUsd = Number(exacto.toFixed(2));
      const precioPen = Number((exacto * p.tipoCambio).toFixed(2));
      return { ...p, idLey: Math.round(p.ley * 10000), precioUsd, precioPen, totalPen: Number((precioPen * p.pesoFundidoG).toFixed(2)) };
    });
    const subtotal = detalles.reduce((s, p) => s + p.totalPen, 0);
    if (request.adelanto > subtotal) return throwError(() => ({ error: { message: 'El adelanto no puede superar el total de material.' } }));
    return of({ detalles, pesoFundidoG: detalles.reduce((s, p) => s + p.pesoFundidoG, 0), subtotal, adelanto: request.adelanto, total: subtotal - request.adelanto });
  }
  guardarRecepcionLey(id: number, request: GuardarRecepcionLey): Observable<RecepcionLey> {
    return this.calcularRecepcionLey(request).pipe(map(calculo => {
      const anterior = this.recepcionesLeyDemo.find(r => r.idRecepcion === id)!;
      const nuevo: RecepcionLey = { ...anterior, ...calculo, revision: anterior.revision + 1, estado: 'VALORIZADO' };
      this.recepcionesLeyDemo = this.recepcionesLeyDemo.map(r => r.idRecepcion === id ? nuevo : r);
      return structuredClone(nuevo);
    }));
  }
  guardarAnalisisAcumulado(entregas: { id: number; revision: number }[], analisis: GuardarRecepcionLey): Observable<RecepcionLey> {
    const origenes = this.recepcionesLeyDemo.filter(r => entregas.some(o => o.id === r.idRecepcion));
    if (origenes.length !== entregas.length || origenes.some(r => r.estado !== 'PENDIENTE'))
      return throwError(() => ({ error: { message: 'Actualiza las entregas pendientes.' } }));
    return this.calcularRecepcionLey(analisis).pipe(map(calculo => {
      const rojo = origenes.reduce((s, r) => s + (r.pesoRojoSinFundirG ?? 0), 0);
      const verde = origenes.reduce((s, r) => s + (r.pesoVerdeSinFundirG ?? 0), 0);
      const nuevo: RecepcionLey = { ...origenes[0], ...calculo,
        idRecepcion: Math.max(...this.recepcionesLeyDemo.map(r => r.idRecepcion)) + 1,
        pesoRojoSinFundirG: rojo, pesoVerdeSinFundirG: verde, pesoDeclaradoG: rojo + verde,
        revision: 1, estado: 'VALORIZADO' };
      this.recepcionesLeyDemo = [...this.recepcionesLeyDemo.filter(r => !origenes.includes(r)), nuevo];
      return structuredClone(nuevo);
    }));
  }
  lotesExportacion(): Observable<LoteExportacion[]> { return of(structuredClone(this.lotesLeyDemo)); }
  enviarRecepcionesALote(ids: number[]): Observable<LoteExportacion> {
    const recibidas = this.recepcionesLeyDemo.filter(r => ids.includes(r.idRecepcion));
    const lote: LoteExportacion = {
      idLote: 950 + this.lotesLeyDemo.length, fecha: '2026-10-10', estado: 'BORRADOR', fechaPreparacion: null,
      pesoTotalFundidoG: recibidas.reduce((s, r) => s + r.pesoFundidoG, 0), partidas: [],
      recepciones: recibidas.map(r => ({ idRecepcion: r.idRecepcion, nombreAcopiador: r.nombreAcopiador,
        pesoRojoG: 0, pesoVerdeG: 0, pesoFundidoG: r.pesoFundidoG, leyes: r.detalles.map(p => ({ ley: p.ley, pesoFundidoG: p.pesoFundidoG })) })),
    };
    recibidas.forEach(r => { r.estado = 'EN_LOTE'; r.idLoteExportacion = lote.idLote; });
    this.lotesLeyDemo.push(lote);
    return of(structuredClone(lote));
  }
  private zonasDemo: ZonaAcopio[] = [
    { idZona: 901, nombre: 'La Rinconada' },
    { idZona: 902, nombre: 'Ananea' },
    { idZona: 903, nombre: 'Lunar de Oro' },
  ];
  private siguienteZonaId = 904;
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
      nombre: 'Centro de ejemplo · Lunar de Oro',
      zona: 'Lunar de Oro',
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
      idCentroAcopio: 901,
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
      idCentroAcopio: 902,
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

  precioReferencial(cotizacionOnzaUsd: number, tipoCambioUsdPen: number): Observable<PrecioReferencial> {
    return of({
      cotizacionOnzaUsd,
      tipoCambioUsdPen,
      precioGramoUsd: Math.round((cotizacionOnzaUsd / 31.1035) * 10000) / 10000,
      precioGramoPen: Math.round((cotizacionOnzaUsd * tipoCambioUsdPen / 31.1035) * 100) / 100,
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
  zonasAcopio(): Observable<ZonaAcopio[]> {
    return of(this.zonasDemo.map((zona) => ({ ...zona })));
  }
  crearZonaAcopio(nombre: string): Observable<ZonaAcopio> {
    const zona = { idZona: this.siguienteZonaId++, nombre };
    this.zonasDemo.push(zona);
    return of({ ...zona });
  }
  eliminarZonaAcopio(id: number): Observable<void> {
    this.zonasDemo = this.zonasDemo.filter((zona) => zona.idZona !== id);
    return of(void 0);
  }
}

@Component({
  selector: 'app-mayorista-preview',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './mayorista-preview.html',
  styleUrl: './mayorista-preview.css',
})
export class MayoristaPreview {}
