package pe.edu.upeu.sitraoro.acopio.mayorista.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
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

@Slf4j
@Service
@RequiredArgsConstructor
public class CentroAcopioServiceImpl {
    private final CentroAcopioRepository repository;
    private final CuentaAccesoService cuentaAccesoService;
    private final ZonaAcopioService zonaAcopioService;

    @jakarta.annotation.PostConstruct
    @Transactional
    public void seedInitial() {
        try {
            if (repository.count() == 0) {
                CuentaResumen c1 = cuentaAccesoService.existeCuenta("71234567")
                        ? cuentaAccesoService.obtenerPorDocumento("71234567")
                        : cuentaAccesoService.crearCuenta("71234567", "AcopiadorPass123*", RolCuenta.G2_ACOPIADOR, null, null, true);

                CentroAcopio centro1 = repository.save(CentroAcopio.builder()
                        .nombre("Acopio Maria")
                        .zona("La Rinconada")
                        .direccion("Av. Principal 102")
                        .telefono("951234567")
                        .idCuentaAcopiador(c1.idCuenta())
                        .activo(true)
                        .build());
                cuentaAccesoService.asignarCentroAcopiador(c1.idCuenta(), centro1.getIdCentroAcopio());

                CuentaResumen c2 = cuentaAccesoService.existeCuenta("71234568")
                        ? cuentaAccesoService.obtenerPorDocumento("71234568")
                        : cuentaAccesoService.crearCuenta("71234568", "AcopiadorPass123*", RolCuenta.G2_ACOPIADOR, null, null, true);

                CentroAcopio centro2 = repository.save(CentroAcopio.builder()
                        .nombre("Acopio Central San Antonio")
                        .zona("Ananea")
                        .direccion("Jr. Minería 405")
                        .telefono("952345678")
                        .idCuentaAcopiador(c2.idCuenta())
                        .activo(true)
                        .build());
                cuentaAccesoService.asignarCentroAcopiador(c2.idCuenta(), centro2.getIdCentroAcopio());
                log.info("Semilla inicial de Centros de Acopio registrada con éxito");
            }
        } catch (Exception e) {
            log.warn("No se pudo sembrar centros iniciales: {}", e.getMessage());
        }
    }

    @Transactional
    @CacheEvict(value = "centros_acopio", allEntries = true)
    public CentroAcopioResponse crear(CentroAcopioRequest request) {
        String zona = zonaAcopioService.exigirZona(request.zona());
        if (repository.existsByNombreIgnoreCaseAndZonaIgnoreCase(request.nombre().trim(), zona))
            throw new ConflictException("Ya existe un centro con ese nombre en la zona indicada");
        CuentaResumen cuenta = cuentaAccesoService.crearCuenta(request.documentoAcopiador(),
                request.claveInicialAcopiador(), RolCuenta.G2_ACOPIADOR, null, null, true);
        CentroAcopio centro = repository.save(CentroAcopio.builder()
                .nombre(request.nombre().trim()).zona(zona).direccion(request.direccion().trim())
                .telefono(request.telefono() == null ? null : request.telefono().trim())
                .idCuentaAcopiador(cuenta.idCuenta()).activo(true).build());
        cuentaAccesoService.asignarCentroAcopiador(cuenta.idCuenta(), centro.getIdCentroAcopio());
        return toResponse(centro);
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "centros_acopio", key = "'activos'")
    public List<CentroAcopioResponse> listarActivos() {
        log.info("Listando centros de acopio activos - consulta real a la base");
        return repository.findByActivoTrueOrderByNombreAsc().stream().map(CentroAcopioServiceImpl::toResponse).toList();
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "centros_acopio", key = "'todos'")
    public List<CentroAcopioResponse> listarTodos() {
        log.info("Listando todos los centros de acopio - consulta real a la base");
        return repository.findAll().stream().map(CentroAcopioServiceImpl::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public void validarActivo(Long id) {
        repository.findById(id).filter(CentroAcopio::isActivo)
                .orElseThrow(() -> new ResourceNotFoundException("Centro de acopio no encontrado o inactivo"));
    }

    private static CentroAcopioResponse toResponse(CentroAcopio centro) {
        return new CentroAcopioResponse(centro.getIdCentroAcopio(), centro.getNombre(), centro.getZona(),
                centro.getDireccion(), centro.getTelefono(), centro.isActivo());
    }
}
