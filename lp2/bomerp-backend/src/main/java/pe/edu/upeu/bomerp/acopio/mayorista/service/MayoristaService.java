package pe.edu.upeu.bomerp.acopio.mayorista.service;

import pe.edu.upeu.bomerp.acopio.mayorista.dto.LiquidacionG1Request;
import pe.edu.upeu.bomerp.acopio.mayorista.dto.LiquidacionG1Response;
import java.util.List;

public interface MayoristaService {
    LiquidacionG1Response procesarLiquidacionSemanal(LiquidacionG1Request request);
    List<LiquidacionG1Response> listarLiquidaciones();
}
