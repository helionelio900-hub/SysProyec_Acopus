package pe.edu.upeu.sitraoro.acopio.mayorista.dto;

import pe.edu.upeu.sitraoro.acopio.mayorista.entity.EstadoLiquidacion;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Proyeccion ligera para reporte: se arma directo desde la consulta JPQL
 * (SELECT new ...), sin cargar la coleccion detalles en memoria.
 * cantidadDetalles viene de SIZE(l.detalles), contado en la base de datos.
 */
public record LiquidacionResumen(
    Long idLiquidacionG1,
    LocalDateTime fechaLiquidacion,
    EstadoLiquidacion estado,
    BigDecimal totalPagadoG2Pen,
    int cantidadDetalles
) {}
