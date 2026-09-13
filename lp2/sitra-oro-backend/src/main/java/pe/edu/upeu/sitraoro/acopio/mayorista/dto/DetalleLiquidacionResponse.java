package pe.edu.upeu.sitraoro.acopio.mayorista.dto;

import java.math.BigDecimal;

public record DetalleLiquidacionResponse(
    Long idDetalleLiquidacion,
    String tipoOro,
    BigDecimal pesoFundidoG,
    BigDecimal precioGramoPen,
    BigDecimal subtotalPen
) {}
