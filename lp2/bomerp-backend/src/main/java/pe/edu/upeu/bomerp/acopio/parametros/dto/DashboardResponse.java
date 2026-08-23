package pe.edu.upeu.bomerp.acopio.parametros.dto;

import java.math.BigDecimal;

public record DashboardResponse(
    BigDecimal sumatoriaGramosOroRojo,
    BigDecimal sumatoriaDineroOroRojoPen,
    BigDecimal sumatoriaGramosOroVerde,
    BigDecimal sumatoriaDineroOroVerdePen,
    BigDecimal totalGeneralGramos,
    BigDecimal totalGeneralDineroPen
) {}
