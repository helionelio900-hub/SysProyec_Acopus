import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EntregaMinero } from './entregas-minero';

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
  idCompraG2?: number | null;
  minero: { idMinero: number; documentoIdentidad: string; nombresApellidos: string };
  pesoSinFundirG: number;
  pesoFundidoNetoG: number;
  tipoOro: 'ROJO' | 'VERDE';
  precioAplicadoPen: number;
  totalPagadoPen: number;
  fechaTransaccion: string;
  idRecepcionMayorista: number | null;
  idLiquidacionG1: number | null;
  anulada: boolean;
}
export interface AjusteCompra {
  idAjuste: number;
  idTransaccionG2: number;
  idCentroAcopio: number;
  idMinero: number;
  idRecepcionMayorista: number | null;
  idLiquidacionG1: number | null;
  tipo: 'EDICION' | 'ANULACION';
  estado: 'PENDIENTE_MINERO' | 'PENDIENTE_MAYORISTA' | 'APROBADO' | 'RECHAZADO_MINERO' | 'RECHAZADO_MAYORISTA';
  motivo: string;
  tipoOroAnterior: 'ROJO' | 'VERDE';
  pesoSinFundirAnterior: number;
  pesoFundidoAnterior: number;
  precioAnterior: number;
  totalAnterior: number;
  tipoOroNuevo: 'ROJO' | 'VERDE' | null;
  pesoSinFundirNuevo: number | null;
  pesoFundidoNuevo: number | null;
  precioNuevo: number | null;
  totalNuevo: number | null;
  solicitadoPor: string;
  fechaSolicitud: string;
  fechaDecisionMinero: string | null;
  decididoPorMinero: string | null;
  fechaDecisionMayorista: string | null;
  decididoPorMayorista: string | null;
}
export interface SolicitarAjusteCompra {
  tipo: 'EDICION' | 'ANULACION';
  motivo: string;
  tipoOroNuevo?: 'ROJO' | 'VERDE';
  pesoSinFundirNuevo?: number;
  pesoFundidoNuevo?: number;
  precioNuevo?: number;
}
export interface CrearTransaccion {
  idMinero: number;
  pesoSinFundirG: number;
  pesoFundidoNetoG: number;
  tipoOro: 'ROJO' | 'VERDE';
  precioAplicadoPen?: number | null;
}
export interface CrearCompraAcopio {
  idSolicitud?: number;
  idMinero: number;
  detalles: Omit<CrearTransaccion, 'idMinero'>[];
  /** Préstamos pendientes del minero que se descuentan en esta compra. */
  idsPrestamos?: number[];
  /** Otro descuento en soles. */
  descuentoManualPen?: number | null;
}
export interface CompraAcopio {
  idCompraG2: number;
  minero: TransaccionAcopio['minero'];
  fechaCompra: string;
  /** Valor del material (suma de partidas). */
  totalPagadoPen: number;
  detalles: TransaccionAcopio[];
  descuentoPen?: number;
  descuentoManualPen?: number;
  /** Lo que se entregó al minero tras descontar préstamos. */
  netoPagadoPen?: number;
  idsPrestamos?: number[];
}
export type EstadoPrestamo = 'PENDIENTE' | 'DESCONTADO' | 'ANULADO';
export interface PrestamoMinero {
  idPrestamo: number;
  idMinero: number;
  minero: string;
  documentoMinero: string;
  fecha: string;
  montoPen: number;
  observacion: string | null;
  estado: EstadoPrestamo;
  idCompraG2: number | null;
}
export interface EnviarComprasMayorista {
  idsComprasAcopiador: number[];
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
export interface ZonaAcopio {
  idZona: number;
  nombre: string;
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
  idsComprasAcopiador: number[];
}
export interface ReporteEntregasAcopiador {
  totalRecepciones: number;
  pesoRojoFundidoG: number;
  pesoVerdeFundidoG: number;
  items: RecepcionMayorista[];
}
export interface PartidaLey {
  tipoOro?: 'ROJO' | 'VERDE' | string;
  onza: number;
  ley: number;
  porcentaje: number;
  tipoCambio: number;
  pesoSinFundirG: number;
  pesoFundidoG: number;
}
export interface DetalleLey extends PartidaLey {
  idLey: number;
  precioUsd: number;
  precioPen: number;
  totalPen: number;
}
export type MonedaPago = 'PEN' | 'USD';
export interface GuardarRecepcionLey {
  revision: number;
  adelanto: number;
  detalles: PartidaLey[];
  monedaPago?: MonedaPago;
  tipoCambioPago?: number | null;
  idsAdelantos?: number[];
}
export interface CalculoLey {
  detalles: DetalleLey[];
  pesoFundidoG: number;
  subtotal: number;
  adelanto: number;
  total: number;
  monedaPago?: MonedaPago;
  tipoCambioPago?: number | null;
  totalPagoMoneda?: number;
}
export interface RecepcionLey {
  idRecepcion: number;
  fecha: string;
  idCentroAcopio: number;
  nombreAcopiador: string;
  revision: number;
  estado: 'PENDIENTE' | 'VALORIZADO' | 'EN_LOTE';
  idLoteExportacion: number | null;
  pesoDeclaradoG: number;
  pesoRojoSinFundirG: number | null;
  pesoVerdeSinFundirG: number | null;
  pesoFundidoG: number;
  subtotal: number | null;
  adelanto: number;
  total: number;
  detalles: DetalleLey[];
  monedaPago?: MonedaPago;
  tipoCambioPago?: number | null;
  totalPagoMoneda?: number;
  idsAdelantos?: number[];
}
export type EstadoAdelanto = 'PENDIENTE' | 'DESCONTADO' | 'ANULADO';
export interface Adelanto {
  idAdelanto: number;
  idCentroAcopio: number;
  nombreCentro: string;
  fecha: string;
  moneda: MonedaPago;
  monto: number;
  tipoCambio: number | null;
  montoPen: number;
  observacion: string | null;
  estado: EstadoAdelanto;
  idRecepcion: number | null;
}
export interface CrearAdelanto {
  idCentroAcopio: number;
  fecha?: string;
  moneda: MonedaPago;
  monto: number;
  tipoCambio?: number | null;
  observacion?: string;
}
export interface SaldoAdelantos {
  idCentroAcopio: number | null;
  cantidadPendientes: number;
  saldoPen: number;
  saldoUsd: number;
  pendientes: Adelanto[];
}
export interface DiaDashboard {
  fecha: string;
  operaciones: number;
  pesoFundidoG: number;
  ingresoPen: number;
  ingresoUsd: number;
  pagadoPen: number;
  adelantosEntregadosPen: number;
}
export interface DashboardMayorista {
  desde: string;
  hasta: string;
  hoy: DiaDashboard;
  periodo: {
    operaciones: number;
    pesoFundidoG: number;
    ingresoPen: number;
    ingresoUsd: number;
    pagadoPen: number;
    ticketPromedioPen: number;
    promedioDiarioPen: number;
    adelantosEntregadosPen: number;
    mejorDia: string | null;
    mejorDiaIngresoPen: number;
  };
  serieDiaria: DiaDashboard[];
  topCentros: { idCentroAcopio: number; nombre: string; operaciones: number; pesoFundidoG: number; ingresoPen: number }[];
  pagosPorMoneda: { moneda: MonedaPago; operaciones: number; monto: number }[];
  adelantos: { pendientes: number; saldoPendientePen: number; entregadosPeriodoPen: number; entregadosPeriodo: number };
  estados: { pendientes: number; valorizados: number; enLote: number };
}
export interface MovimientoCaja {
  idMovimiento: number;
  fecha: string;
  moneda: MonedaPago;
  tipo: 'INGRESO' | 'EGRESO';
  origen: 'SALDO_INICIAL' | 'EXPORTADOR' | 'MAYORISTA' | 'MANUAL' | 'PAGO_LOTE' | 'ADELANTO' | 'PAGO_COMPRA' | 'PRESTAMO';
  monto: number;
  concepto: string;
  idReferencia: number | null;
  anulado: boolean;
  anulable: boolean;
}
export interface ResumenCaja {
  saldoPen: number;
  saldoUsd: number;
  mesPen: { ingresos: number; egresos: number };
  mesUsd: { ingresos: number; egresos: number };
  ultimos: MovimientoCaja[];
}
export interface CrearMovimientoCaja {
  tipo: 'INGRESO' | 'EGRESO';
  moneda: MonedaPago;
  monto: number;
  concepto: string;
  fecha?: string;
  saldoInicial: boolean;
}
export interface IngresoExportador {
  montoUsd?: number | null;
  montoPen?: number | null;
  idLoteExportacion?: number | null;
  concepto?: string;
  fecha?: string;
}
export type CrearRecepcionMayorista = Omit<RecepcionMayorista, 'idRecepcion' | 'nombreAcopiador'>;
export interface Liquidacion {
  idLiquidacionG1: number;
  idCentroAcopio: number;
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
export interface PartidaLoteExportacion {
  idLiquidacionG1: number;
  nombreAcopiadorG2: string;
  pesoFundidoG: number;
  lecturaDecimal: number;
}
export interface LoteExportacion {
  recepciones?: { idRecepcion: number; nombreAcopiador: string; pesoRojoG: number; pesoVerdeG: number; pesoFundidoG: number; leyes: { ley: number; pesoFundidoG: number }[] }[];
  idLote: number;
  fecha: string;
  estado: 'BORRADOR' | 'PREPARADO';
  pesoTotalFundidoG: number;
  fechaPreparacion: string | null;
  partidas: PartidaLoteExportacion[];
}
export interface GuardarLoteExportacion {
  fecha: string;
  partidas: { idLiquidacionG1: number; lecturaDecimal: number }[];
}
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
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
export interface PrecioReferencial {
  cotizacionOnzaUsd: number;
  tipoCambioUsdPen: number;
  precioGramoUsd: number;
  precioGramoPen: number;
}

@Injectable({ providedIn: 'root' })
export class OperacionesService {
  editarRecepcionesExportacion(id: number, fecha: string, ids: number[]): Observable<LoteExportacion> {
    return this.http.put<LoteExportacion>(this.url(`/api/v1/mayorista/lotes-exportacion/${id}/recepciones`), { fecha, ids });
  }
  compraDirectaMayorista(analisis: GuardarRecepcionLey): Observable<RecepcionLey> {
    return this.http.post<RecepcionLey>(this.url('/api/v1/mayorista/compras-directas'), { analisis });
  }
  private readonly http = inject(HttpClient);
  private url(path: string): string {
    return `${environment.apiBaseUrl}${path}`;
  }

  dashboardMayorista(desde?: string, hasta?: string): Observable<DashboardMayorista> {
    let params = new HttpParams();
    if (desde) params = params.set('desde', desde);
    if (hasta) params = params.set('hasta', hasta);
    return this.http.get<DashboardMayorista>(this.url('/api/v1/mayorista/dashboard'), { params });
  }
  adelantos(idCentroAcopio?: number, estado?: EstadoAdelanto): Observable<Adelanto[]> {
    let params = new HttpParams();
    if (idCentroAcopio) params = params.set('idCentroAcopio', idCentroAcopio);
    if (estado) params = params.set('estado', estado);
    return this.http.get<Adelanto[]>(this.url('/api/v1/mayorista/adelantos'), { params });
  }
  saldoAdelantos(idCentroAcopio?: number): Observable<SaldoAdelantos> {
    let params = new HttpParams();
    if (idCentroAcopio) params = params.set('idCentroAcopio', idCentroAcopio);
    return this.http.get<SaldoAdelantos>(this.url('/api/v1/mayorista/adelantos/saldo'), { params });
  }
  registrarAdelanto(request: CrearAdelanto): Observable<Adelanto> {
    return this.http.post<Adelanto>(this.url('/api/v1/mayorista/adelantos'), request);
  }
  anularAdelanto(id: number): Observable<Adelanto> {
    return this.http.patch<Adelanto>(this.url(`/api/v1/mayorista/adelantos/${id}/anular`), {});
  }
  prestamos(idMinero?: number, estado?: EstadoPrestamo): Observable<PrestamoMinero[]> {
    let params = new HttpParams();
    if (idMinero) params = params.set('idMinero', idMinero);
    if (estado) params = params.set('estado', estado);
    return this.http.get<PrestamoMinero[]>(this.url('/api/v1/acopio/prestamos'), { params });
  }
  registrarPrestamo(request: { idMinero: number; montoPen: number; observacion?: string }): Observable<PrestamoMinero> {
    return this.http.post<PrestamoMinero>(this.url('/api/v1/acopio/prestamos'), request);
  }
  anularPrestamo(id: number): Observable<PrestamoMinero> {
    return this.http.patch<PrestamoMinero>(this.url(`/api/v1/acopio/prestamos/${id}/anular`), {});
  }
  cajaAcopio(): Observable<ResumenCaja> {
    return this.http.get<ResumenCaja>(this.url('/api/v1/acopio/caja'));
  }
  registrarMovimientoCajaAcopio(request: CrearMovimientoCaja): Observable<MovimientoCaja> {
    return this.http.post<MovimientoCaja>(this.url('/api/v1/acopio/caja/movimientos'), request);
  }
  /** El acopiador recibe y registra solo soles. */
  registrarPagoMayoristaAcopio(request: { montoPen: number; concepto?: string }): Observable<MovimientoCaja[]> {
    return this.http.post<MovimientoCaja[]>(this.url('/api/v1/acopio/caja/mayorista'), request);
  }
  anularMovimientoCajaAcopio(id: number): Observable<MovimientoCaja> {
    return this.http.patch<MovimientoCaja>(this.url(`/api/v1/acopio/caja/movimientos/${id}/anular`), {});
  }
  caja(): Observable<ResumenCaja> {
    return this.http.get<ResumenCaja>(this.url('/api/v1/mayorista/caja'));
  }
  registrarMovimientoCaja(request: CrearMovimientoCaja): Observable<MovimientoCaja> {
    return this.http.post<MovimientoCaja>(this.url('/api/v1/mayorista/caja/movimientos'), request);
  }
  registrarIngresoExportador(request: IngresoExportador): Observable<MovimientoCaja[]> {
    return this.http.post<MovimientoCaja[]>(this.url('/api/v1/mayorista/caja/exportador'), request);
  }
  anularMovimientoCaja(id: number): Observable<MovimientoCaja> {
    return this.http.patch<MovimientoCaja>(this.url(`/api/v1/mayorista/caja/movimientos/${id}/anular`), {});
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
  registrarCompra(request: CrearCompraAcopio): Observable<CompraAcopio> {
    return this.http.post<CompraAcopio>(this.url('/api/v1/acopio/compras'), request);
  }
  compras(): Observable<CompraAcopio[]> {
    return this.http.get<CompraAcopio[]>(this.url('/api/v1/acopio/compras'));
  }
  acumulados(): Observable<AcumuladosAcopio> {
    return this.http.get<AcumuladosAcopio>(this.url('/api/v1/acopio/acumulados-semanales'));
  }
  /** Solicitudes de entrega de oro que los mineros enviaron al centro. */
  solicitudesEntrega(): Observable<EntregaMinero[]> {
    return this.http.get<EntregaMinero[]>(this.url('/api/v1/acopio/solicitudes-entrega'));
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
  zonasAcopio(): Observable<ZonaAcopio[]> {
    return this.http.get<ZonaAcopio[]>(this.url('/api/v1/mayorista/zonas-acopio'));
  }
  crearZonaAcopio(nombre: string): Observable<ZonaAcopio> {
    return this.http.post<ZonaAcopio>(this.url('/api/v1/mayorista/zonas-acopio'), { nombre });
  }
  eliminarZonaAcopio(id: number): Observable<void> {
    return this.http.delete<void>(this.url(`/api/v1/mayorista/zonas-acopio/${id}`));
  }
  recepcionesMayorista(idCentroAcopio?: number | null): Observable<RecepcionMayorista[]> {
    const params = idCentroAcopio == null
      ? undefined
      : new HttpParams().set('idCentroAcopio', idCentroAcopio);
    return this.http.get<RecepcionMayorista[]>(this.url('/api/v1/mayorista/recepciones'), { params });
  }
  recepcionesPorLey(idCentroAcopio?: number | null): Observable<RecepcionLey[]> {
    const params = idCentroAcopio ? new HttpParams().set('idCentroAcopio', idCentroAcopio) : new HttpParams();
    return this.http.get<RecepcionLey[]>(this.url('/api/v1/mayorista/recepciones-ley'), { params });
  }
  calcularRecepcionLey(request: GuardarRecepcionLey): Observable<CalculoLey> {
    return this.http.post<CalculoLey>(this.url('/api/v1/mayorista/recepciones-ley/calcular'), request);
  }
  guardarRecepcionLey(id: number, request: GuardarRecepcionLey): Observable<RecepcionLey> {
    return this.http.put<RecepcionLey>(this.url(`/api/v1/mayorista/recepciones/${id}/leyes`), request);
  }
  guardarAnalisisAcumulado(entregas: { id: number; revision: number }[], analisis: GuardarRecepcionLey): Observable<RecepcionLey> {
    return this.http.post<RecepcionLey>(this.url('/api/v1/mayorista/recepciones-ley/acumulado'), { entregas, analisis });
  }
  enviarComprasMayorista(request: EnviarComprasMayorista): Observable<RecepcionMayorista> {
    return this.http.post<RecepcionMayorista>(this.url('/api/v1/acopio/entregas-mayorista'), request);
  }
  reporteEntregasAcopiador(desde?: string, hasta?: string): Observable<ReporteEntregasAcopiador> {
    let params = new HttpParams();
    if (desde) params = params.set('desde', desde);
    if (hasta) params = params.set('hasta', hasta);
    return this.http.get<ReporteEntregasAcopiador>(
      this.url('/api/v1/acopio/entregas-mayorista/resumen'), { params },
    );
  }
  ajustesAcopiador(): Observable<AjusteCompra[]> {
    return this.http.get<AjusteCompra[]>(this.url('/api/v1/acopio/ajustes'));
  }
  solicitarAjusteCompra(id: number, request: SolicitarAjusteCompra): Observable<AjusteCompra> {
    return this.http.post<AjusteCompra>(this.url(`/api/v1/acopio/compras/${id}/ajustes`), request);
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
  buscarLiquidacionesPaginado(
    estado?: string,
    desde?: string,
    hasta?: string,
    page = 0,
    size = 20,
    sort = 'fechaLiquidacion,desc',
  ): Observable<PageResponse<Liquidacion>> {
    let params = new HttpParams().set('page', page).set('size', size).set('sort', sort);
    if (estado) params = params.set('estado', estado);
    if (desde) params = params.set('desde', desde);
    if (hasta) params = params.set('hasta', hasta);
    return this.http.get<PageResponse<Liquidacion>>(this.url('/api/v1/mayorista/liquidaciones'), { params });
  }

  liquidaciones(estado?: string, desde?: string, hasta?: string): Observable<Liquidacion[]> {
    return this.buscarLiquidacionesPaginado(estado, desde, hasta, 0, 50).pipe(
      map(res => res.content)
    );
  }
  reporteLiquidaciones(estado?: string, desde?: string, hasta?: string): Observable<ReporteLiquidaciones> {
    let params = new HttpParams();
    if (estado) params = params.set('estado', estado);
    if (desde) params = params.set('desde', desde);
    if (hasta) params = params.set('hasta', hasta);
    return this.http.get<ReporteLiquidaciones>(this.url('/api/v1/mayorista/liquidaciones/resumen'), { params });
  }
  cotizacionesColor(): Observable<{ color: string; precioGramoPen: number; fechaPublicacion: string }[]> {
    return this.http.get<{ color: string; precioGramoPen: number; fechaPublicacion: string }[]>(this.url('/api/v1/cotizador/colores'));
  }
  publicarColores(onza: number, dolar: number, exportacionRojo: number, exportacionVerde: number, leyRojo = 90, leyVerde = 80) {
    return this.http.post<{ color: string; precioGramoPen: number; fechaPublicacion: string }[]>(this.url('/api/v1/mayorista/cotizaciones-color'), {}, {
      params: { onza, dolar, exportacionRojo, exportacionVerde, leyRojo, leyVerde },
    });
  }
  precioReferencial(cotizacionOnzaUsd: number, tipoCambioUsdPen: number): Observable<PrecioReferencial> {
    const params = new HttpParams()
      .set('cotizacionOnzaUsd', cotizacionOnzaUsd)
      .set('tipoCambioUsdPen', tipoCambioUsdPen);
    return this.http.post<PrecioReferencial>(this.url('/api/v1/mayorista/precio-referencial'), {}, { params });
  }
  lotesExportacion(): Observable<LoteExportacion[]> {
    return this.http.get<LoteExportacion[]>(this.url('/api/v1/mayorista/lotes-exportacion'));
  }
  enviarRecepcionesALote(ids: number[]): Observable<LoteExportacion> {
    return this.http.post<LoteExportacion>(this.url('/api/v1/mayorista/recepciones/lote-exportacion'), ids);
  }
  crearLoteExportacion(request: GuardarLoteExportacion): Observable<LoteExportacion> {
    return this.http.post<LoteExportacion>(this.url('/api/v1/mayorista/lotes-exportacion'), request);
  }
  actualizarLoteExportacion(id: number, request: GuardarLoteExportacion): Observable<LoteExportacion> {
    return this.http.put<LoteExportacion>(this.url(`/api/v1/mayorista/lotes-exportacion/${id}`), request);
  }
  eliminarLoteExportacion(id: number): Observable<void> {
    return this.http.delete<void>(this.url(`/api/v1/mayorista/lotes-exportacion/${id}`));
  }
  prepararLoteExportacion(id: number): Observable<LoteExportacion> {
    return this.http.post<LoteExportacion>(this.url(`/api/v1/mayorista/lotes-exportacion/${id}/preparar`), {});
  }
}
