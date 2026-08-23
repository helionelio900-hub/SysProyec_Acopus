package pe.edu.upeu.bomerp.acopio.acopiador.dto;

import java.math.BigDecimal;

public record AcumuladosG2Response(
    BigDecimal totalGramosRojo,
    BigDecimal totalDineroRojoPen,
    BigDecimal totalGramosVerde,
    BigDecimal totalDineroVerdePen
) {}
