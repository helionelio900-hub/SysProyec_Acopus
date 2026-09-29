import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface ResumenDashboard {
  sumatoriaGramosOroRojo: number;
  sumatoriaDineroOroRojoPen: number;
  sumatoriaGramosOroVerde: number;
  sumatoriaDineroOroVerdePen: number;
  totalGeneralGramos: number;
  totalGeneralDineroPen: number;
}
export interface TransaccionAcopio {
  idTransaccionG2: number;
  minero: { idMinero: number; documentoIdentidad: string; nombresApellidos: string };
  pesoSinFundirG: number;
  pesoFundidoNetoG: number;
  tipoOro: 'ROJO' | 'VERDE';
  precioAplicadoPen: number;
  totalPagadoPen: number;
  fechaTransaccion: string;
}
export interface CrearTransaccion {
  idMinero: number;
  pesoSinFundirG: number;
  pesoFundidoNetoG: number;
  tipoOro: 'ROJO' | 'VERDE';
  precioAplicadoPen?: number | null;
}
export interface AcumuladosAcopio {
  totalGramosRojo: number;
  totalDineroRojoPen: number;
  totalGramosVerde: number;
  totalDineroVerdePen: number;
}
export interface SolicitudMinero {
  documentoIdentidad: string;
  idMinero: number;
  idCentroAcopioPreferido: number;
}
export interface CentroAcopio {
  idCentroAcopio: number;
  nombre: string;
  zona: string;
  direccion: string;
  telefono?: string | null;
  documentoAcopiador?: string;
  activo: boolean;
}
export interface CrearCentro {
  nombre: string;
  zona: string;
  direccion: string;
  telefono: string;
  documentoAcopiador: string;
  claveInicialAcopiador: string;
}
export interface FilaRecepcionMayorista {
  pesoSinFundirG: number | null;
  pesoFundidoG: number | null;
  onza: string;
  dolar: string;
  exportacion: string;
  pagoMaterial: string;
}
export interface RecepcionMayorista {
  idRecepcion: number;
  fecha: string;
  idCentroAcopio: number;
  nombreAcopiador: string;
  rojo: FilaRecepcionMayorista;
  verde: FilaRecepcionMayorista;
  descuento: string;
  total: string;
}
export type CrearRecepcionMayorista = Omit<RecepcionMayorista, 'idRecepcion' | 'nombreAcopiador'>;
export interface DetalleLiquidacion {
  tipoOro: 'ROJO' | 'VERDE';
  pesoFundidoG: number;
}
export interface Liquidacion {
  idLiquidacionG1: number;
  nombreAcopiadorG2: string;
  estado: string;
  pesoTotalFundidoG: number;
  cotizacionOnzaUsd: number;
  tipoCambioUsdPen: number;
  totalPagadoG2Pen: number;
  fechaLiquidacion: string;
  detalles: {
    idDetalleLiquidacion: number;
    tipoOro: 'ROJO' | 'VERDE';
    pesoFundidoG: number;
    precioGramoPen: number;
    subtotalPen: number;
  }[];
}
export interface ReporteLiquidaciones {
  agregado: { totalLiquidaciones: number; montoTotal: number; ticketPromedio: number };
  liquidaciones: {
    idLiquidacionG1: number;
    fechaLiquidacion: string;
    estado: string;
    totalPagadoG2Pen: number;
    cantidadDetalles: number;
  }[];
}

@Injectable({ providedIn: 'root' })
export class OperacionesService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(ApiService);
  private url(path: string): string {
    return this.api.buildUrl(path);
  }

  dashboard(): Observable<ResumenDashboard> {
    return this.http.get<ResumenDashboard>(this.url('/api/v1/dashboard/consolidado'));
  }
  transacciones(): Observable<TransaccionAcopio[]> {
    return this.http.get<TransaccionAcopio[]>(this.url('/api/v1/acopio/transacciones'));
  }
  registrarTransaccion(request: CrearTransaccion): Observable<TransaccionAcopio> {
    return this.http.post<TransaccionAcopio>(this.url('/api/v1/acopio/transacciones'), request);
  }
  acumulados(): Observable<AcumuladosAcopio> {
    return this.http.get<AcumuladosAcopio>(this.url('/api/v1/acopio/acumulados-semanales'));
  }
  solicitudes(): Observable<SolicitudMinero[]> {
    return this.http.get<SolicitudMinero[]>(this.url('/api/v1/acopio/mineros/cuentas-pendientes'));
  }
  aprobarSolicitud(documento: string): Observable<void> {
    return this.http.post<void>(
      this.url(
        `/api/v1/acopio/mineros/cuentas-pendientes/${encodeURIComponent(documento)}/aprobar`,
      ),
      {},
    );
  }
  centros(): Observable<CentroAcopio[]> {
    return this.http.get<CentroAcopio[]>(this.url('/api/v1/mayorista/centros-acopio'));
  }
  crearCentro(request: CrearCentro): Observable<CentroAcopio> {
    return this.http.post<CentroAcopio>(this.url('/api/v1/mayorista/centros-acopio'), request);
  }
  recepcionesMayorista(idCentroAcopio?: number | null): Observable<RecepcionMayorista[]> {
    const params = idCentroAcopio == null
      ? undefined
      : new HttpParams().set('idCentroAcopio', idCentroAcopio);
    return this.http.get<RecepcionMayorista[]>(this.url('/api/v1/mayorista/recepciones'), { params });
  }
  registrarRecepcionMayorista(request: CrearRecepcionMayorista): Observable<RecepcionMayorista> {
    return this.http.post<RecepcionMayorista>(this.url('/api/v1/mayorista/recepciones'), request);
  }
  actualizarRecepcionMayorista(
    id: number,
    request: CrearRecepcionMayorista,
  ): Observable<RecepcionMayorista> {
    return this.http.put<RecepcionMayorista>(
      this.url(`/api/v1/mayorista/recepciones/${id}`),
      request,
    );
  }
  eliminarRecepcionMayorista(id: number): Observable<void> {
    return this.http.delete<void>(this.url(`/api/v1/mayorista/recepciones/${id}`));
  }
  liquidaciones(estado?: string): Observable<Liquidacion[]> {
    let params = new HttpParams().set('ordenarPor', 'fechaLiquidacion').set('direccion', 'DESC');
    if (estado) params = params.set('estado', estado);
    return this.http.get<Liquidacion[]>(this.url('/api/v1/mayorista/liquidaciones'), { params });
  }
  reporteLiquidaciones(): Observable<ReporteLiquidaciones> {
    return this.http.get<ReporteLiquidaciones>(this.url('/api/v1/mayorista/liquidaciones/resumen'));
  }
  crearLiquidacion(request: {
    nombreAcopiadorG2: string;
    cotizacionOnzaUsd: number;
    tipoCambioUsdPen: number;
    detalles: DetalleLiquidacion[];
  }): Observable<Liquidacion> {
    return this.http.post<Liquidacion>(this.url('/api/v1/mayorista/liquidaciones'), request);
  }
}
