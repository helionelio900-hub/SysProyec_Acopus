package pe.edu.upeu.sitraoro.acopio.mayorista.service;

import pe.edu.upeu.sitraoro.acopio.mayorista.dto.LiquidacionG1Request;
import pe.edu.upeu.sitraoro.acopio.mayorista.dto.LiquidacionG1Response;
import pe.edu.upeu.sitraoro.acopio.mayorista.dto.LiquidacionReporte;
import pe.edu.upeu.sitraoro.acopio.mayorista.entity.EstadoLiquidacion;

import java.time.LocalDateTime;
import java.util.List;

public interface MayoristaService {
    LiquidacionG1Response procesarLiquidacionSemanal(LiquidacionG1Request request);

    List<LiquidacionG1Response> buscar(EstadoLiquidacion estado, LocalDateTime desde, LocalDateTime hasta,
                                       String ordenarPor, String direccion);

    LiquidacionReporte reporte(EstadoLiquidacion estado, LocalDateTime desde, LocalDateTime hasta);

    LiquidacionG1Response obtenerPorId(Long id);
}
