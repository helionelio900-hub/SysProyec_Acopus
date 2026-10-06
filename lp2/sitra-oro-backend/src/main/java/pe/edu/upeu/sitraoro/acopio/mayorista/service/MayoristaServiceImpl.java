package pe.edu.upeu.sitraoro.acopio.mayorista.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.upeu.sitraoro.acopio.mayorista.dto.DetalleLiquidacionResponse;
import pe.edu.upeu.sitraoro.acopio.mayorista.dto.LiquidacionAgregado;
import pe.edu.upeu.sitraoro.acopio.mayorista.dto.LiquidacionG1Request;
import pe.edu.upeu.sitraoro.acopio.mayorista.dto.LiquidacionG1Response;
import pe.edu.upeu.sitraoro.acopio.mayorista.dto.LiquidacionReporte;
import pe.edu.upeu.sitraoro.acopio.mayorista.dto.LiquidacionResumen;
import pe.edu.upeu.sitraoro.acopio.mayorista.entity.EstadoLiquidacion;
import pe.edu.upeu.sitraoro.acopio.mayorista.entity.LiquidacionG1;
import pe.edu.upeu.sitraoro.acopio.mayorista.repository.LiquidacionG1Repository;
import pe.edu.upeu.sitraoro.exception.ConflictException;
import pe.edu.upeu.sitraoro.exception.ResourceNotFoundException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class MayoristaServiceImpl implements MayoristaService {

    private static final Set<String> CAMPOS_ORDENABLES = Set.of(
            "idLiquidacionG1", "nombreAcopiadorG2", "estado", "pesoTotalFundidoG",
            "cotizacionOnzaUsd", "tipoCambioUsdPen", "totalPagadoG2Pen", "fechaLiquidacion"
    );

    private final LiquidacionG1Repository liquidacionG1Repository;

    @Override
    public LiquidacionG1Response procesarLiquidacionSemanal(LiquidacionG1Request request) {
        throw new ConflictException(
                "El cálculo del pago al acopiador no está definido. Usa el precio referencial solo para consulta.");
    }

    @Override
    @Transactional(readOnly = true)
    public List<LiquidacionG1Response> buscar(EstadoLiquidacion estado, LocalDateTime desde, LocalDateTime hasta,
                                              String ordenarPor, String direccion) {
        validarRango(desde, hasta);
        if (!CAMPOS_ORDENABLES.contains(ordenarPor)) {
            throw new IllegalArgumentException("Campo de ordenamiento no permitido: " + ordenarPor);
        }
        if (!"ASC".equalsIgnoreCase(direccion) && !"DESC".equalsIgnoreCase(direccion)) {
            throw new IllegalArgumentException("La dirección debe ser ASC o DESC");
        }
        Sort.Direction dir = "ASC".equalsIgnoreCase(direccion) ? Sort.Direction.ASC : Sort.Direction.DESC;
        Sort sort = Sort.by(dir, ordenarPor);
        return liquidacionG1Repository.buscar(estado, desde, hasta, sort).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public LiquidacionReporte reporte(EstadoLiquidacion estado, LocalDateTime desde, LocalDateTime hasta) {
        validarRango(desde, hasta);
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
                l.getIdCentroAcopio(),
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

    private void validarRango(LocalDateTime desde, LocalDateTime hasta) {
        if (desde != null && hasta != null && desde.isAfter(hasta)) {
            throw new IllegalArgumentException("La fecha 'desde' no puede ser posterior a 'hasta'");
        }
    }
}
