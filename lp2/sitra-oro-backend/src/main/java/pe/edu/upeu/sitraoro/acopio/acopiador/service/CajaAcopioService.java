package pe.edu.upeu.sitraoro.acopio.acopiador.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.upeu.sitraoro.acopio.acopiador.dto.CajaAcopioDtos.*;
import pe.edu.upeu.sitraoro.acopio.acopiador.entity.MovimientoCajaAcopio;
import pe.edu.upeu.sitraoro.acopio.acopiador.entity.OrigenCajaAcopio;
import pe.edu.upeu.sitraoro.acopio.acopiador.repository.MovimientoCajaAcopioRepository;
import pe.edu.upeu.sitraoro.exception.ConflictException;
import pe.edu.upeu.sitraoro.exception.ResourceNotFoundException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;

/**
 * Caja de cada centro de acopio, solo en soles (el acopiador no opera en dólares). Los pagos a mineros y los préstamos se descuentan solos;
 * lo que paga el mayorista y los demás movimientos los registra el acopiador. Ningún otro rol ve esta caja.
 */
@Service
@RequiredArgsConstructor
public class CajaAcopioService {
    private static final ZoneId LIMA = ZoneId.of("America/Lima");

    private final MovimientoCajaAcopioRepository repository;

    @Transactional(readOnly = true)
    public ResumenCaja resumen(Long idCentro) {
        LocalDate hoy = LocalDate.now(LIMA);
        List<MovimientoCajaAcopio> mes = repository.buscar(idCentro, hoy.withDayOfMonth(1), hoy).stream()
                .filter(m -> !m.isAnulado()).toList();
        List<MovimientoResponse> ultimos = repository.buscar(idCentro, null, null).stream().limit(15)
                .map(CajaAcopioService::respuesta).toList();
        return new ResumenCaja(repository.saldo(idCentro, "PEN"), repository.saldo(idCentro, "USD"),
                totales(mes, "PEN"), totales(mes, "USD"), ultimos);
    }

    @Transactional(readOnly = true)
    public List<MovimientoResponse> listar(Long idCentro, LocalDate desde, LocalDate hasta) {
        if (desde != null && hasta != null && desde.isAfter(hasta))
            throw new IllegalArgumentException("La fecha inicial no puede superar la fecha final");
        return repository.buscar(idCentro, desde, hasta).stream().map(CajaAcopioService::respuesta).toList();
    }

    @Transactional
    public MovimientoResponse registrarManual(MovimientoManualRequest request, Long idCentro) {
        if (!"PEN".equals(request.moneda())) throw new IllegalArgumentException("La caja del acopiador es solo en soles");
        boolean ingreso = "INGRESO".equals(request.tipo());
        if (request.saldoInicial() && !ingreso) throw new IllegalArgumentException("El saldo inicial se registra como ingreso");
        return respuesta(guardar(idCentro, ingreso, request.saldoInicial() ? OrigenCajaAcopio.SALDO_INICIAL : OrigenCajaAcopio.MANUAL,
                request.moneda(), request.monto(), request.concepto(), null, request.fecha()));
    }

    @Transactional
    public List<MovimientoResponse> registrarPagoMayorista(IngresoMayoristaRequest request, Long idCentro) {
        if (request.montoPen() == null || request.montoPen().signum() <= 0)
            throw new IllegalArgumentException("Ingresa cuánto te pagó el mayorista en soles");
        String concepto = request.concepto() == null || request.concepto().isBlank() ? "Pago del mayorista" : request.concepto().trim();
        return List.of(respuesta(guardar(idCentro, true, OrigenCajaAcopio.MAYORISTA, "PEN",
                request.montoPen(), concepto, null, request.fecha())));
    }

    @Transactional
    public MovimientoResponse anular(Long id, Long idCentro) {
        MovimientoCajaAcopio m = repository.findByIdMovimientoAndIdCentroAcopio(id, idCentro)
                .orElseThrow(() -> new ResourceNotFoundException("Movimiento de caja no encontrado: " + id));
        if (!m.getOrigen().esManual())
            throw new ConflictException("Este movimiento lo genera el sistema; se corrige desde la compra o el préstamo");
        if (m.isAnulado()) throw new ConflictException("El movimiento ya está anulado");
        m.setAnulado(true);
        return respuesta(m);
    }

    // ---- Movimientos automáticos ------------------------------------------------------------

    /** Egreso por lo que se pagó al minero en una compra (neto, en soles). */
    @Transactional
    public void registrarPagoCompra(Long idCentro, Long idCompra, BigDecimal neto, String minero) {
        anularAutomatico(OrigenCajaAcopio.PAGO_COMPRA, idCompra);
        if (neto == null || neto.signum() <= 0) return;
        guardar(idCentro, false, OrigenCajaAcopio.PAGO_COMPRA, "PEN", neto, "Compra #" + idCompra + " · " + minero, idCompra, null);
    }

    /** Egreso por un préstamo entregado al minero (en soles). */
    @Transactional
    public void registrarPrestamo(Long idCentro, Long idPrestamo, BigDecimal monto, String minero, LocalDate fecha) {
        guardar(idCentro, false, OrigenCajaAcopio.PRESTAMO, "PEN", monto, "Préstamo #" + idPrestamo + " · " + minero, idPrestamo, fecha);
    }

    @Transactional
    public void anularAutomatico(OrigenCajaAcopio origen, Long idReferencia) {
        repository.findByOrigenAndIdReferenciaAndAnuladoFalse(origen, idReferencia).forEach(m -> m.setAnulado(true));
    }

    // -----------------------------------------------------------------------------------------

    private MovimientoCajaAcopio guardar(Long idCentro, boolean ingreso, OrigenCajaAcopio origen, String moneda, BigDecimal monto,
                                         String concepto, Long idReferencia, LocalDate fecha) {
        String texto = concepto == null ? "" : concepto.trim();
        return repository.save(MovimientoCajaAcopio.builder()
                .idCentroAcopio(idCentro).fecha(fecha == null ? LocalDate.now(LIMA) : fecha)
                .moneda(moneda).ingreso(ingreso).origen(origen)
                .monto(monto.setScale(2, RoundingMode.HALF_UP))
                .concepto(texto.length() > 200 ? texto.substring(0, 200) : texto)
                .idReferencia(idReferencia).anulado(false).build());
    }

    private static Totales totales(List<MovimientoCajaAcopio> movimientos, String moneda) {
        BigDecimal ingresos = BigDecimal.ZERO;
        BigDecimal egresos = BigDecimal.ZERO;
        for (MovimientoCajaAcopio m : movimientos) {
            if (!moneda.equals(m.getMoneda())) continue;
            if (m.isIngreso()) ingresos = ingresos.add(m.getMonto());
            else egresos = egresos.add(m.getMonto());
        }
        return new Totales(ingresos, egresos);
    }

    static MovimientoResponse respuesta(MovimientoCajaAcopio m) {
        return new MovimientoResponse(m.getIdMovimiento(), m.getFecha(), m.getMoneda(), m.isIngreso() ? "INGRESO" : "EGRESO",
                m.getOrigen().name(), m.getMonto(), m.getConcepto(), m.getIdReferencia(), m.isAnulado(),
                m.getOrigen().esManual() && !m.isAnulado());
    }
}
