package pe.edu.upeu.sitraoro.acopio.mayorista.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.upeu.sitraoro.acopio.acopiador.service.AcopiadorService;
import pe.edu.upeu.sitraoro.acopio.mayorista.dto.DetalleLiquidacionRequest;
import pe.edu.upeu.sitraoro.acopio.mayorista.dto.DetalleLiquidacionResponse;
import pe.edu.upeu.sitraoro.acopio.mayorista.dto.LiquidacionAgregado;
import pe.edu.upeu.sitraoro.acopio.mayorista.dto.LiquidacionG1Request;
import pe.edu.upeu.sitraoro.acopio.mayorista.dto.LiquidacionG1Response;
import pe.edu.upeu.sitraoro.acopio.mayorista.dto.LiquidacionReporte;
import pe.edu.upeu.sitraoro.acopio.mayorista.dto.LiquidacionResumen;
import pe.edu.upeu.sitraoro.acopio.mayorista.entity.DetalleLiquidacionG1;
import pe.edu.upeu.sitraoro.acopio.mayorista.entity.EstadoLiquidacion;
import pe.edu.upeu.sitraoro.acopio.mayorista.entity.LiquidacionG1;
import pe.edu.upeu.sitraoro.acopio.mayorista.repository.LiquidacionG1Repository;
import pe.edu.upeu.sitraoro.exception.ResourceNotFoundException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MayoristaServiceImpl implements MayoristaService {

    private static final BigDecimal GRAMOS_POR_ONZA_TROY = new BigDecimal("31.1035");

    private final LiquidacionG1Repository liquidacionG1Repository;
    private final AcopiadorService acopiadorService; // Comunicación entre módulos mediante interfaz pública (ADR-002)

    @Override
    @Transactional
    public LiquidacionG1Response procesarLiquidacionSemanal(LiquidacionG1Request request) {
        // 1. Precio base USD por Gramo = Onza USD / 31.1035
        BigDecimal precioUsdPorGramo = request.cotizacionOnzaUsd()
                .divide(GRAMOS_POR_ONZA_TROY, 4, RoundingMode.HALF_UP);

        // 2. Precio base PEN por Gramo = Precio USD por Gramo * Tipo de Cambio
        BigDecimal basePrecioGramoPen = precioUsdPorGramo
                .multiply(request.tipoCambioUsdPen())
                .setScale(2, RoundingMode.HALF_UP);

        LiquidacionG1 liquidacion = LiquidacionG1.builder()
                .nombreAcopiadorG2(request.nombreAcopiadorG2())
                .estado(EstadoLiquidacion.REGISTRADA)
                .cotizacionOnzaUsd(request.cotizacionOnzaUsd())
                .tipoCambioUsdPen(request.tipoCambioUsdPen())
                .fechaLiquidacion(LocalDateTime.now())
                .detalles(new ArrayList<>())
                .build();

        BigDecimal acumuladoPeso = BigDecimal.ZERO;
        BigDecimal acumuladoTotal = BigDecimal.ZERO;

        for (DetalleLiquidacionRequest detReq : request.detalles()) {
            String tipoOro = detReq.tipoOro().trim().toUpperCase();
            if (!"ROJO".equals(tipoOro) && !"VERDE".equals(tipoOro)) {
                throw new IllegalArgumentException("El tipo de oro en detalle debe ser 'ROJO' o 'VERDE'");
            }

            // Regla de negocio y Transacción Atómica:
            // Descuenta stock en módulo acopiador. Si no alcanza, lanza StockInsuficienteException y ejecuta ROLLBACK.
            acopiadorService.descontarStockOro(tipoOro, detReq.pesoFundidoG());

            // Factor de pureza por tipo de oro (Verde 95% vs Rojo 90%)
            BigDecimal precioLinea = basePrecioGramoPen;
            if ("VERDE".equals(tipoOro)) {
                precioLinea = basePrecioGramoPen.multiply(new BigDecimal("1.05")).setScale(2, RoundingMode.HALF_UP);
            }

            BigDecimal subtotalLinea = detReq.pesoFundidoG().multiply(precioLinea).setScale(2, RoundingMode.HALF_UP);

            DetalleLiquidacionG1 detalle = DetalleLiquidacionG1.builder()
                    .liquidacionG1(liquidacion)
                    .tipoOro(tipoOro)
                    .pesoFundidoG(detReq.pesoFundidoG())
                    .precioGramoPen(precioLinea)
                    .subtotalPen(subtotalLinea)
                    .build();

            liquidacion.getDetalles().add(detalle);
            acumuladoPeso = acumuladoPeso.add(detReq.pesoFundidoG());
            acumuladoTotal = acumuladoTotal.add(subtotalLinea);
        }

        liquidacion.setPesoTotalFundidoG(acumuladoPeso);
        liquidacion.setTotalPagadoG2Pen(acumuladoTotal);
        liquidacion.setTipoOro(request.detalles().size() == 1 ? request.detalles().get(0).tipoOro().trim().toUpperCase() : "CONSOLIDADO");
        liquidacion.setPrecioResultanteGramo(acumuladoPeso.compareTo(BigDecimal.ZERO) > 0
                ? acumuladoTotal.divide(acumuladoPeso, 2, RoundingMode.HALF_UP)
                : basePrecioGramoPen);

        LiquidacionG1 saved = liquidacionG1Repository.save(liquidacion);
        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LiquidacionG1Response> buscar(EstadoLiquidacion estado, LocalDateTime desde, LocalDateTime hasta,
                                              String ordenarPor, String direccion) {
        Sort.Direction dir = "ASC".equalsIgnoreCase(direccion) ? Sort.Direction.ASC : Sort.Direction.DESC;
        Sort sort = Sort.by(dir, ordenarPor);
        return liquidacionG1Repository.buscar(estado, desde, hasta, sort).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public LiquidacionReporte reporte(EstadoLiquidacion estado, LocalDateTime desde, LocalDateTime hasta) {
        Sort sort = Sort.by(Sort.Direction.DESC, "fechaLiquidacion");
        List<LiquidacionResumen> liquidaciones = liquidacionG1Repository.buscarResumen(estado, desde, hasta, sort);

        // Agregados sobre la proyeccion ya cargada: monto y ticket son 0 (no null)
        // cuando no hay filas, sin depender de que SUM/AVG devuelvan NULL.
        long total = liquidaciones.size();
        BigDecimal montoTotal = liquidaciones.stream()
                .map(LiquidacionResumen::totalPagadoG2Pen)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal ticketPromedio = total == 0
                ? BigDecimal.ZERO
                : montoTotal.divide(BigDecimal.valueOf(total), 2, RoundingMode.HALF_UP);

        return new LiquidacionReporte(new LiquidacionAgregado(total, montoTotal, ticketPromedio), liquidaciones);
    }

    @Override
    @Transactional(readOnly = true)
    public LiquidacionG1Response obtenerPorId(Long id) {
        LiquidacionG1 liquidacion = liquidacionG1Repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Liquidación no encontrada: " + id));
        return mapToResponse(liquidacion);
    }

    private LiquidacionG1Response mapToResponse(LiquidacionG1 l) {
        List<DetalleLiquidacionResponse> detalles = (l.getDetalles() != null)
                ? l.getDetalles().stream()
                .map(d -> new DetalleLiquidacionResponse(
                        d.getIdDetalleLiquidacion(),
                        d.getTipoOro(),
                        d.getPesoFundidoG(),
                        d.getPrecioGramoPen(),
                        d.getSubtotalPen()
                )).toList()
                : List.of();

        return new LiquidacionG1Response(
                l.getIdLiquidacionG1(),
                l.getNombreAcopiadorG2(),
                (l.getEstado() != null) ? l.getEstado().name() : EstadoLiquidacion.REGISTRADA.name(),
                l.getPesoTotalFundidoG(),
                l.getCotizacionOnzaUsd(),
                l.getTipoCambioUsdPen(),
                l.getTotalPagadoG2Pen(),
                l.getFechaLiquidacion(),
                detalles
        );
    }
}
