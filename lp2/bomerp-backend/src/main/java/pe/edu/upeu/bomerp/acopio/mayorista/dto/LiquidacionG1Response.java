package pe.edu.upeu.bomerp.acopio.mayorista.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record LiquidacionG1Response(
    Long idLiquidacionG1,
    String nombreAcopiadorG2,
    BigDecimal pesoTotalFundidoG,
    String tipoOro,
    BigDecimal cotizacionOnzaUsd,
    BigDecimal tipoCambioUsdPen,
    BigDecimal precioResultanteGramo,
    BigDecimal totalPagadoG2Pen,
    LocalDateTime fechaLiquidacion
) {}
