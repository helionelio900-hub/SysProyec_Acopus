package pe.edu.upeu.sitraoro.acopio.mayorista.service;

import pe.edu.upeu.sitraoro.acopio.mayorista.dto.RecepcionMayoristaRequest;
import pe.edu.upeu.sitraoro.acopio.mayorista.dto.RecepcionMayoristaResponse;

import java.util.List;

public interface RecepcionMayoristaService {
    List<RecepcionMayoristaResponse> listar(Long idCentroAcopio);
    default List<RecepcionMayoristaResponse> listar() {
        return listar(null);
    }
    RecepcionMayoristaResponse registrar(RecepcionMayoristaRequest request);
    RecepcionMayoristaResponse actualizar(Long id, RecepcionMayoristaRequest request);
    void eliminar(Long id);
}
