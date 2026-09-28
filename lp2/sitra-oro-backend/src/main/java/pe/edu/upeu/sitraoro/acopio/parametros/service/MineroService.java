package pe.edu.upeu.sitraoro.acopio.parametros.service;

import pe.edu.upeu.sitraoro.acopio.parametros.dto.MineroRequest;
import pe.edu.upeu.sitraoro.acopio.parametros.dto.MineroResponse;
import pe.edu.upeu.sitraoro.acopio.parametros.entity.Minero;
import java.util.List;
import java.util.Optional;

public interface MineroService {
    List<MineroResponse> listar();
    MineroResponse obtener(Long idMinero);
    Minero obtenerEntidad(Long idMinero);
    Optional<Minero> obtenerEntidadPorDocumento(String documentoIdentidad);
    MineroResponse crear(MineroRequest request);
    MineroResponse actualizar(Long idMinero, MineroRequest request);
    void eliminar(Long idMinero);
}
