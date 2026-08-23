package pe.edu.upeu.bomerp.acopio.acopiador.service;

import pe.edu.upeu.bomerp.acopio.acopiador.dto.AcumuladosG2Response;
import pe.edu.upeu.bomerp.acopio.acopiador.dto.TransaccionG2Request;
import pe.edu.upeu.bomerp.acopio.acopiador.dto.TransaccionG2Response;
import java.util.List;

public interface AcopiadorService {
    TransaccionG2Response registrarCompraDirecta(TransaccionG2Request request);
    List<TransaccionG2Response> listarTransacciones();
    AcumuladosG2Response obtenerAcumuladosSemanalesPorColor();
}
