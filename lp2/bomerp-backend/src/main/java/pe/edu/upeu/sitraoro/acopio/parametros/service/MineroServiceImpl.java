package pe.edu.upeu.sitraoro.acopio.parametros.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.upeu.sitraoro.acopio.parametros.dto.MineroRequest;
import pe.edu.upeu.sitraoro.acopio.parametros.dto.MineroResponse;
import pe.edu.upeu.sitraoro.acopio.parametros.entity.Minero;
import pe.edu.upeu.sitraoro.acopio.parametros.mapper.MineroMapper;
import pe.edu.upeu.sitraoro.acopio.parametros.repository.MineroRepository;
import pe.edu.upeu.sitraoro.exception.ResourceNotFoundException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MineroServiceImpl implements MineroService {

    private final MineroRepository mineroRepository;
    private final MineroMapper mineroMapper;

    @Override
    @Transactional(readOnly = true)
    public List<MineroResponse> listar() {
        return mineroRepository.findAll().stream()
                .map(mineroMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public MineroResponse obtener(Long idMinero) {
        return mineroMapper.toResponse(buscarOFallar(idMinero));
    }

    @Override
    @Transactional
    public MineroResponse crear(MineroRequest request) {
        Minero minero = mineroMapper.toEntity(request);
        return mineroMapper.toResponse(mineroRepository.save(minero));
    }

    @Override
    @Transactional
    public MineroResponse actualizar(Long idMinero, MineroRequest request) {
        Minero minero = buscarOFallar(idMinero);
        minero.setDocumentoIdentidad(request.documentoIdentidad());
        minero.setNombresApellidos(request.nombresApellidos());
        minero.setTelefono(request.telefono());
        minero.setZonaProcedencia(request.zonaProcedencia());
        return mineroMapper.toResponse(mineroRepository.save(minero));
    }

    @Override
    @Transactional
    public void eliminar(Long idMinero) {
        mineroRepository.delete(buscarOFallar(idMinero));
    }

    private Minero buscarOFallar(Long idMinero) {
        return mineroRepository.findById(idMinero)
                .orElseThrow(() -> new ResourceNotFoundException("Minero no encontrado: " + idMinero));
    }
}
