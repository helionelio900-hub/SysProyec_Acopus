package pe.edu.upeu.sitraoro.acopio.acopiador.service;

import pe.edu.upeu.sitraoro.acopio.acopiador.dto.AcumuladosG2Response;
import pe.edu.upeu.sitraoro.acopio.acopiador.dto.TransaccionG2Request;
import pe.edu.upeu.sitraoro.acopio.acopiador.dto.TransaccionG2Response;
import pe.edu.upeu.sitraoro.acopio.acopiador.dto.ResumenPesoRecepcion;
import pe.edu.upeu.sitraoro.acopio.acopiador.dto.CompraG2Request;
import pe.edu.upeu.sitraoro.acopio.acopiador.dto.CompraG2Response;

import java.math.BigDecimal;
import java.util.List;

public interface AcopiadorService {
    CompraG2Response registrarCompraConDetalles(CompraG2Request request, Long idCentroAcopio);
    List<CompraG2Response> listarComprasConDetalles(Long idCentroAcopio);
    TransaccionG2Response registrarCompraDirecta(TransaccionG2Request request, Long idCentroAcopio);
    List<TransaccionG2Response> listarTransacciones(Long idCentroAcopio);
    List<TransaccionG2Response> listarPorMinero(Long idMinero, Long idCentroAcopio);
    List<Long> idsComprasRecepcion(Long idRecepcionMayorista);
    ResumenPesoRecepcion vincularComprasRecepcion(Long idRecepcionMayorista, Long idCentroAcopio, List<Long> idsCompras);
    void desvincularComprasRecepcion(Long idRecepcionMayorista);
    AcumuladosG2Response obtenerAcumuladosSemanalesPorColor(Long idCentroAcopio);
    BigDecimal obtenerStockDisponibleGramos(String tipoOro, Long idCentroAcopio);
    void descontarStockOro(String tipoOro, BigDecimal pesoGramos, Long idLiquidacionG1, Long idCentroAcopio);
}
