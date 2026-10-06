package pe.edu.upeu.sitraoro.acopio.cotizador.dto;

import java.math.BigDecimal;

public record CotizacionEstimadaResponse(
    BigDecimal pesoBrutoGramos,
    BigDecimal precioGramoReferencialPen,
    BigDecimal montoEstimadoTotalPen,
    String mensaje
) {}
