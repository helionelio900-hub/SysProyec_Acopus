package pe.edu.upeu.sitraoro.acopio.mayorista.dto;

import java.math.BigDecimal;

/**
 * Agregados del reporte. COALESCE(..., 0) en la consulta evita que
 * montoTotal / ticketPromedio lleguen como null cuando no hay filas
 * que sumar (SUM/AVG de SQL devuelven NULL sobre conjunto vacio).
 */
public record LiquidacionAgregado(
    long totalLiquidaciones,
    BigDecimal montoTotal,
    BigDecimal ticketPromedio
) {}
