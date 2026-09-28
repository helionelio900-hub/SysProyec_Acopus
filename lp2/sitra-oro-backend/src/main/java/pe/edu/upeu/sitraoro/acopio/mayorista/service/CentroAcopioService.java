package pe.edu.upeu.sitraoro.acopio.mayorista.service;

import pe.edu.upeu.sitraoro.acopio.mayorista.dto.CentroAcopioRequest;
import pe.edu.upeu.sitraoro.acopio.mayorista.dto.CentroAcopioResponse;
import java.util.List;

public interface CentroAcopioService {
    CentroAcopioResponse crear(CentroAcopioRequest request);
    List<CentroAcopioResponse> listarActivos();
    List<CentroAcopioResponse> listarTodos();
    void validarActivo(Long idCentroAcopio);
}
