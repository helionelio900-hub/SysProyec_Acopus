package pe.edu.upeu.sitraoro.acopio.mayorista.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.upeu.sitraoro.acopio.mayorista.dto.CajaDtos.*;
import pe.edu.upeu.sitraoro.acopio.mayorista.entity.MovimientoCaja;
import pe.edu.upeu.sitraoro.acopio.mayorista.entity.OrigenMovimientoCaja;
import pe.edu.upeu.sitraoro.acopio.mayorista.entity.TipoMovimientoCaja;
import pe.edu.upeu.sitraoro.acopio.mayorista.repository.MovimientoCajaRepository;
import pe.edu.upeu.sitraoro.auditoria.service.AuditoriaService;
import pe.edu.upeu.sitraoro.exception.ConflictException;
import pe.edu.upeu.sitraoro.exception.MayoristaReglaException;
import pe.edu.upeu.sitraoro.exception.ResourceNotFoundException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.function.Predicate;

/**
 * Caja del mayorista en soles y dólares por separado. Los ingresos del exportador y los movimientos manuales los
 * registra el mayorista; los pagos de lotes y los adelantos se descuentan solos y se corrigen si el lote o el
 * adelanto cambia.
 */
@Service
@RequiredArgsConstructor
public class CajaService {
    private static final ZoneId LIMA = ZoneId.of("America/Lima");

    private final MovimientoCajaRepository repository;
    private final AuditoriaService auditoriaService;

    @Transactional(readOnly = true)
    public ResumenCaja resumen() {
        LocalDate hoy = LocalDate.now(LIMA);
        List<MovimientoCaja> mes = repository.buscar(hoy.withDayOfMonth(1), hoy).stream()
                .filter(m -> !m.isAnulado()).toList();
        List<MovimientoResponse> ultimos = repository.buscar(null, null).stream().limit(15).map(CajaService::respuesta).toList();
        return new ResumenCaja(repository.saldo("PEN"), repository.saldo("USD"),
                totales(mes, "PEN"), totales(mes, "USD"), ultimos);
    }

    @Transactional(readOnly = true)
    public List<MovimientoResponse> listar(LocalDate desde, LocalDate hasta) {
        if (desde != null && hasta != null && desde.isAfter(hasta))
            throw new IllegalArgumentException("La fecha inicial no puede superar la fecha final");
        return repository.buscar(desde, hasta).stream().map(CajaService::respuesta).toList();
    }

    @Transactional
    public MovimientoResponse registrarManual(MovimientoManualRequest request) {
        TipoMovimientoCaja tipo = TipoMovimientoCaja.valueOf(request.tipo());
        if (request.saldoInicial() && tipo != TipoMovimientoCaja.INGRESO)
            throw new IllegalArgumentException("El saldo inicial se registra como ingreso");
        MovimientoCaja guardado = guardar(tipo, request.saldoInicial() ? OrigenMovimientoCaja.SALDO_INICIAL : OrigenMovimientoCaja.MANUAL,
                request.moneda(), request.monto(), request.concepto(), null, request.fecha());
        auditoriaService.registrar(null, "CREAR", "CAJA_MAYORISTA", guardado.getIdMovimiento(),
                tipo + " " + request.moneda() + " " + guardado.getMonto().toPlainString() + " · " + guardado.getConcepto());
        return respuesta(guardado);
    }

    /** Venta al exportador: crea un ingreso por cada moneda informada. */
    @Transactional
    public List<MovimientoResponse> registrarExportador(IngresoExportadorRequest request) {
        if (request.montoUsd() == null && request.montoPen() == null)
            throw new IllegalArgumentException("Ingresa el monto que pagó el exportador en dólares, en soles o en ambas monedas");
        String concepto = request.concepto() == null || request.concepto().isBlank()
                ? "Pago del exportador" + (request.idLoteExportacion() != null ? " · lote de exportación #" + request.idLoteExportacion() : "")
                : request.concepto().trim();
        var creados = new java.util.ArrayList<MovimientoResponse>();
        if (request.montoUsd() != null) creados.add(respuesta(guardar(TipoMovimientoCaja.INGRESO, OrigenMovimientoCaja.EXPORTADOR,
                "USD", request.montoUsd(), concepto, request.idLoteExportacion(), request.fecha())));
        if (request.montoPen() != null) creados.add(respuesta(guardar(TipoMovimientoCaja.INGRESO, OrigenMovimientoCaja.EXPORTADOR,
                "PEN", request.montoPen(), concepto, request.idLoteExportacion(), request.fecha())));
        auditoriaService.registrar(null, "CREAR", "CAJA_MAYORISTA", creados.getFirst().idMovimiento(),
                "Ingreso del exportador USD=" + request.montoUsd() + " PEN=" + request.montoPen());
        return creados;
    }

    @Transactional
    public MovimientoResponse anular(Long id) {
        MovimientoCaja movimiento = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Movimiento de caja no encontrado: " + id));
        if (!movimiento.getOrigen().esManual())
            throw new ConflictException("Este movimiento lo genera el sistema; se corrige editando el lote o el adelanto");
        if (movimiento.isAnulado()) throw new ConflictException("El movimiento ya está anulado");
        movimiento.setAnulado(true);
        auditoriaService.registrar(null, "ANULAR", "CAJA_MAYORISTA", id, "Anulación de movimiento de caja id=" + id);
        return respuesta(movimiento);
    }

    // ---- Movimientos automáticos -------------------------------------------------------------

    /** Egreso por el pago neto de un lote valorizado. Reemplaza el egreso anterior del mismo lote. */
    @Transactional
    public void registrarPagoLote(Long idRecepcion, String moneda, BigDecimal monto, String acopiador) {
        anularAutomatico(OrigenMovimientoCaja.PAGO_LOTE, idRecepcion);
        if (monto == null || monto.signum() <= 0) return;
        guardar(TipoMovimientoCaja.EGRESO, OrigenMovimientoCaja.PAGO_LOTE, moneda, monto,
                "Pago del lote #" + idRecepcion + " · " + acopiador, idRecepcion, null);
    }

    /**
     * Egreso por un adelanto entregado a un centro de acopio, en la moneda en que se entregó. No se puede
     * entregar más dinero del que hay en caja en esa moneda: la caja nunca queda en negativo por un adelanto.
     */
    @Transactional
    public void registrarAdelanto(Long idAdelanto, String moneda, BigDecimal monto, String centro, LocalDate fecha) {
        BigDecimal disponible = repository.saldo(moneda);
        if (disponible == null) disponible = BigDecimal.ZERO;
        if (disponible.compareTo(monto) < 0) {
            String simbolo = "USD".equals(moneda) ? "US$ " : "S/ ";
            throw new MayoristaReglaException("SALDO_INSUFICIENTE",
                    "No hay suficiente dinero en caja en " + ("USD".equals(moneda) ? "dólares" : "soles")
                            + ": tienes " + simbolo + disponible.setScale(2, RoundingMode.HALF_UP).toPlainString()
                            + " y el adelanto es de " + simbolo + monto.setScale(2, RoundingMode.HALF_UP).toPlainString()
                            + ". Registra primero el ingreso en la caja.");
        }
        guardar(TipoMovimientoCaja.EGRESO, OrigenMovimientoCaja.ADELANTO, moneda, monto,
                "Adelanto #" + idAdelanto + " · " + centro, idAdelanto, fecha);
    }

    @Transactional
    public void anularAutomatico(OrigenMovimientoCaja origen, Long idReferencia) {
        repository.findByOrigenAndIdReferenciaAndAnuladoFalse(origen, idReferencia).forEach(m -> m.setAnulado(true));
    }

    // ------------------------------------------------------------------------------------------

    private MovimientoCaja guardar(TipoMovimientoCaja tipo, OrigenMovimientoCaja origen, String moneda, BigDecimal monto,
                                   String concepto, Long idReferencia, LocalDate fecha) {
        String texto = concepto == null ? "" : concepto.trim();
        return repository.save(MovimientoCaja.builder()
                .fecha(fecha == null ? LocalDate.now(LIMA) : fecha)
                .moneda(moneda)
                .tipo(tipo)
                .origen(origen)
                .monto(monto.setScale(2, RoundingMode.HALF_UP))
                .concepto(texto.length() > 200 ? texto.substring(0, 200) : texto)
                .idReferencia(idReferencia)
                .anulado(false)
                .build());
    }

    private static Totales totales(List<MovimientoCaja> movimientos, String moneda) {
        Predicate<MovimientoCaja> deMoneda = m -> moneda.equals(m.getMoneda());
        BigDecimal ingresos = movimientos.stream().filter(deMoneda.and(m -> m.getTipo() == TipoMovimientoCaja.INGRESO))
                .map(MovimientoCaja::getMonto).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal egresos = movimientos.stream().filter(deMoneda.and(m -> m.getTipo() == TipoMovimientoCaja.EGRESO))
                .map(MovimientoCaja::getMonto).reduce(BigDecimal.ZERO, BigDecimal::add);
        return new Totales(ingresos, egresos);
    }

    static MovimientoResponse respuesta(MovimientoCaja m) {
        return new MovimientoResponse(m.getIdMovimiento(), m.getFecha(), m.getMoneda(), m.getTipo().name(),
                m.getOrigen().name(), m.getMonto(), m.getConcepto(), m.getIdReferencia(), m.isAnulado(),
                m.getOrigen().esManual() && !m.isAnulado());
    }
}
