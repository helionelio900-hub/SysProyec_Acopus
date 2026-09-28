package pe.edu.upeu.sitraoro.acopio.mayorista.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.upeu.sitraoro.acopio.mayorista.dto.CentroAcopioRequest;
import pe.edu.upeu.sitraoro.acopio.mayorista.dto.CentroAcopioResponse;
import pe.edu.upeu.sitraoro.acopio.mayorista.entity.CentroAcopio;
import pe.edu.upeu.sitraoro.acopio.mayorista.repository.CentroAcopioRepository;
import pe.edu.upeu.sitraoro.exception.ConflictException;
import pe.edu.upeu.sitraoro.exception.ResourceNotFoundException;
import pe.edu.upeu.sitraoro.seguridad.entity.RolCuenta;
import pe.edu.upeu.sitraoro.seguridad.service.CuentaAccesoService;
import pe.edu.upeu.sitraoro.seguridad.service.CuentaResumen;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CentroAcopioServiceImpl implements CentroAcopioService {
    private final CentroAcopioRepository repository;
    private final CuentaAccesoService cuentaAccesoService;

    @Override @Transactional
    public CentroAcopioResponse crear(CentroAcopioRequest request) {
        if (repository.existsByNombreIgnoreCaseAndZonaIgnoreCase(request.nombre().trim(), request.zona().trim()))
            throw new ConflictException("Ya existe un centro con ese nombre en la zona indicada");
        CuentaResumen cuenta = cuentaAccesoService.crearCuenta(request.documentoAcopiador(),
                request.claveInicialAcopiador(), RolCuenta.G2_ACOPIADOR, null, null, true);
        CentroAcopio centro = repository.save(CentroAcopio.builder()
                .nombre(request.nombre().trim()).zona(request.zona().trim()).direccion(request.direccion().trim())
                .telefono(request.telefono() == null ? null : request.telefono().trim())
                .idCuentaAcopiador(cuenta.idCuenta()).activo(true).build());
        cuentaAccesoService.asignarCentroAcopiador(cuenta.idCuenta(), centro.getIdCentroAcopio());
        return toResponse(centro);
    }

    @Override @Transactional(readOnly = true)
    public List<CentroAcopioResponse> listarActivos() {
        return repository.findByActivoTrueOrderByNombreAsc().stream().map(CentroAcopioServiceImpl::toResponse).toList();
    }
    @Override @Transactional(readOnly = true)
    public List<CentroAcopioResponse> listarTodos() {
        return repository.findAll().stream().map(CentroAcopioServiceImpl::toResponse).toList();
    }
    @Override @Transactional(readOnly = true)
    public void validarActivo(Long id) {
        repository.findById(id).filter(CentroAcopio::isActivo)
                .orElseThrow(() -> new ResourceNotFoundException("Centro de acopio no encontrado o inactivo"));
    }
    private static CentroAcopioResponse toResponse(CentroAcopio centro) {
        return new CentroAcopioResponse(centro.getIdCentroAcopio(), centro.getNombre(), centro.getZona(),
                centro.getDireccion(), centro.getTelefono(), centro.isActivo());
    }
}
