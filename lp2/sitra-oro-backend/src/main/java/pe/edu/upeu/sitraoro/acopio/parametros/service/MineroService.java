package pe.edu.upeu.sitraoro.acopio.parametros.service;

import pe.edu.upeu.sitraoro.acopio.parametros.dto.MineroRequest;
import pe.edu.upeu.sitraoro.acopio.parametros.dto.MineroResponse;
import pe.edu.upeu.sitraoro.acopio.parametros.entity.Minero;
import java.util.List;

public interface MineroService {
    List<MineroResponse> listar();
    MineroResponse obtener(Long idMinero);
    Minero obtenerEntidad(Long idMinero);
    MineroResponse crear(MineroRequest request);
    MineroResponse actualizar(Long idMinero, MineroRequest request);
    void eliminar(Long idMinero);
}
