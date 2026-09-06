package pe.edu.upeu.sitraoro.acopio.cotizador.dto;

import java.math.BigDecimal;

public record CotizacionEstimadaResponse(
    BigDecimal pesoBrutoGramos,
    BigDecimal porcentajeMermaEstimada,
    BigDecimal pesoNetoEstimadoGramos,
    BigDecimal precioGramoDiaPen,
    BigDecimal montoEstimadoTotalPen,
    String mensaje
) {}
