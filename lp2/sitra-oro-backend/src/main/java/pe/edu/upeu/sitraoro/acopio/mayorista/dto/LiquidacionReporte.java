package pe.edu.upeu.sitraoro.acopio.mayorista.dto;

import java.util.List;

/** Respuesta final de GET /api/v1/mayorista/liquidaciones/resumen. */
public record LiquidacionReporte(
    LiquidacionAgregado agregado,
    List<LiquidacionResumen> liquidaciones
) {}
