package pe.edu.upeu.bomerp.acopio.parametros.service;

import pe.edu.upeu.bomerp.acopio.parametros.dto.MineroRequest;
import pe.edu.upeu.bomerp.acopio.parametros.dto.MineroResponse;
import java.util.List;

public interface MineroService {
    List<MineroResponse> listar();
    MineroResponse obtener(Long idMinero);
    MineroResponse crear(MineroRequest request);
    MineroResponse actualizar(Long idMinero, MineroRequest request);
    void eliminar(Long idMinero);
}
