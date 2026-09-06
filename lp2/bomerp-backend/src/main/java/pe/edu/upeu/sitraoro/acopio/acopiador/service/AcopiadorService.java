package pe.edu.upeu.sitraoro.acopio.acopiador.service;

import pe.edu.upeu.sitraoro.acopio.acopiador.dto.AcumuladosG2Response;
import pe.edu.upeu.sitraoro.acopio.acopiador.dto.TransaccionG2Request;
import pe.edu.upeu.sitraoro.acopio.acopiador.dto.TransaccionG2Response;

import java.math.BigDecimal;
import java.util.List;

public interface AcopiadorService {
    TransaccionG2Response registrarCompraDirecta(TransaccionG2Request request);
    List<TransaccionG2Response> listarTransacciones();
    List<TransaccionG2Response> listarPorMinero(Long idMinero);
    AcumuladosG2Response obtenerAcumuladosSemanalesPorColor();
    BigDecimal obtenerStockDisponibleGramos(String tipoOro);
    void descontarStockOro(String tipoOro, BigDecimal pesoGramos);
}
