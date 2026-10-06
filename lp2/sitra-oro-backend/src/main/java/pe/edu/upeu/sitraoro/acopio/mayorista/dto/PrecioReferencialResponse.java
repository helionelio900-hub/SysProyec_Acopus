package pe.edu.upeu.sitraoro.acopio.mayorista.dto;

import java.math.BigDecimal;

public record PrecioReferencialResponse(
        BigDecimal cotizacionOnzaUsd,
        BigDecimal tipoCambioUsdPen,
        BigDecimal precioGramoUsd,
        BigDecimal precioGramoPen
) {}
