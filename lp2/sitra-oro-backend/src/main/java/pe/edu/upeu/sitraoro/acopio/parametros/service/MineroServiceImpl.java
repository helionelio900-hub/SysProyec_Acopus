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
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MineroServiceImpl implements MineroService {

    private final MineroRepository mineroRepository;
    private final MineroMapper mineroMapper;
    private final pe.edu.upeu.sitraoro.seguridad.repository.CuentaAccesoRepository cuentas;

    @Override
    @Transactional(readOnly = true)
    public List<MineroResponse> listar() {
        Long centro = centroActual();
        return (centro == null ? mineroRepository.findAll() : mineroRepository.vinculados(centro)).stream()
                .filter(m -> centro == null || cuentaHabilitada(m))
                .map(mineroMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public MineroResponse obtener(Long idMinero) {
        return mineroMapper.toResponse(buscarOFallar(idMinero));
    }

    @Override
    @Transactional(readOnly = true)
    public Minero obtenerEntidad(Long idMinero) {
        return buscarOFallar(idMinero);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Minero> obtenerEntidadPorDocumento(String documentoIdentidad) {
        return mineroRepository.findByDocumentoIdentidad(documentoIdentidad.trim());
    }

    @Override
    @Transactional
    public MineroResponse crear(MineroRequest request) {
        return crearEnCentro(request, centroActual());
    }

    @Override
    @Transactional
    public MineroResponse crearEnCentro(MineroRequest request, Long idCentro) {
        Minero minero = mineroMapper.toEntity(request);
        Long actual = centroActual();
        if (actual != null && !actual.equals(idCentro)) throw new org.springframework.security.access.AccessDeniedException("Centro de acopio no autorizado");
        minero.setIdCentroAcopio(idCentro);
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
        Minero minero = mineroRepository.findById(idMinero)
                .orElseThrow(() -> new ResourceNotFoundException("Minero no encontrado: " + idMinero));
        Long centro = centroActual();
        if (centro != null && !centro.equals(minero.getIdCentroAcopio()) && mineroRepository.entregasAceptadas(idMinero,centro)==0)
            throw new ResourceNotFoundException("Minero no encontrado en tu centro de acopio");
        if (centro != null && !cuentaHabilitada(minero))
            throw new ResourceNotFoundException("El minero está pendiente de aprobación");
        return minero;
    }

    private boolean cuentaHabilitada(Minero minero) {
        return cuentas.findByDocumentoIdentidad(minero.getDocumentoIdentidad())
                .map(c -> c.isActivo()).orElse(true);
    }

    private Long centroActual() {
        var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getAuthorities().stream().noneMatch(a -> "ROLE_G2_ACOPIADOR".equals(a.getAuthority()))) return null;
        if (!(auth.getPrincipal() instanceof org.springframework.security.oauth2.jwt.Jwt jwt)
                || !(jwt.getClaim("idCentroAcopio") instanceof Number id))
            throw new org.springframework.security.access.AccessDeniedException("La cuenta no tiene centro de acopio asignado");
        return id.longValue();
    }
}
