package pe.edu.upeu.sitraoro.acopio.mayorista.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record LiquidacionG1Response(
    Long idLiquidacionG1,
    String nombreAcopiadorG2,
    String estado,
    BigDecimal pesoTotalFundidoG,
    BigDecimal cotizacionOnzaUsd,
    BigDecimal tipoCambioUsdPen,
    BigDecimal totalPagadoG2Pen,
    LocalDateTime fechaLiquidacion,
    List<DetalleLiquidacionResponse> detalles
) {}
