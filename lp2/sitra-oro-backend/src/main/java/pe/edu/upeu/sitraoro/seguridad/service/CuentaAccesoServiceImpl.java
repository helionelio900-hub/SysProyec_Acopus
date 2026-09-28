package pe.edu.upeu.sitraoro.seguridad.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.upeu.sitraoro.seguridad.entity.CuentaAcceso;
import pe.edu.upeu.sitraoro.seguridad.entity.RolCuenta;
import pe.edu.upeu.sitraoro.seguridad.repository.CuentaAccesoRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CuentaAccesoServiceImpl implements CuentaAccesoService {

    private final CuentaAccesoRepository repository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public CuentaResumen crearCuenta(String documento, String clave, RolCuenta rol,
                                     Long idMinero, Long idCentroAcopioPreferido, boolean activo) {
        String documentoNormalizado = documento.trim();
        if (clave.getBytes(java.nio.charset.StandardCharsets.UTF_8).length > 72) {
            throw new IllegalArgumentException("La clave no puede superar 72 bytes UTF-8");
        }
        if (repository.existsByDocumentoIdentidad(documentoNormalizado)) {
            throw new pe.edu.upeu.sitraoro.exception.ConflictException("Ya existe una cuenta con ese documento");
        }
        CuentaAcceso cuenta = repository.save(CuentaAcceso.builder()
                .documentoIdentidad(documentoNormalizado)
                .claveHash(passwordEncoder.encode(clave))
                .rol(rol)
                .idMinero(idMinero)
                .idCentroAcopioPreferido(idCentroAcopioPreferido)
                .activo(activo)
                .build());
        return resumen(cuenta);
    }

    @Override
    @Transactional(readOnly = true)
    public CuentaResumen obtenerPorDocumento(String documento) {
        return repository.findByDocumentoIdentidad(documento.trim())
                .map(CuentaAccesoServiceImpl::resumen)
                .orElseThrow(() -> new IllegalArgumentException("Cuenta no encontrada"));
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existeCuenta(String documento) {
        return repository.existsByDocumentoIdentidad(documento.trim());
    }

    @Override
    @Transactional(readOnly = true)
    public CuentaResumen autenticar(String documento, String clave) {
        CuentaAcceso cuenta = repository.findByDocumentoIdentidad(documento.trim())
                .orElseThrow(() -> new BadCredentialsException("Documento o clave incorrectos"));
        if (!cuenta.isActivo()) {
            throw new BadCredentialsException("La cuenta está pendiente de validación presencial en el centro de acopio elegido");
        }
        if (!passwordEncoder.matches(clave, cuenta.getClaveHash())) {
            throw new BadCredentialsException("Documento o clave incorrectos");
        }
        return resumen(cuenta);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SolicitudCuentaMinero> listarSolicitudesMinero(Long idCentroAcopio) {
        return repository.findByRolAndActivoFalseAndIdCentroAcopioPreferido(RolCuenta.MINERO, idCentroAcopio)
                .stream().map(cuenta -> new SolicitudCuentaMinero(cuenta.getDocumentoIdentidad(),
                        cuenta.getIdMinero(), cuenta.getIdCentroAcopioPreferido())).toList();
    }

    @Override
    @Transactional
    public void aprobarSolicitudMinero(String documentoIdentidad, Long idCentroAcopio) {
        CuentaAcceso cuenta = repository.findByDocumentoIdentidad(documentoIdentidad.trim())
                .orElseThrow(() -> new IllegalArgumentException("Solicitud no encontrada"));
        if (cuenta.getRol() != RolCuenta.MINERO || cuenta.isActivo()
                || !idCentroAcopio.equals(cuenta.getIdCentroAcopioPreferido())) {
            throw new IllegalArgumentException("La solicitud no está pendiente para este centro de acopio");
        }
        cuenta.setActivo(true);
    }

    @Override
    @Transactional
    public void actualizarCentroPreferido(String documentoIdentidad, Long idCentroAcopio) {
        CuentaAcceso cuenta = repository.findByDocumentoIdentidad(documentoIdentidad.trim())
                .orElseThrow(() -> new IllegalArgumentException("Cuenta no encontrada"));
        if (cuenta.getRol() != RolCuenta.MINERO || !cuenta.isActivo()) {
            throw new IllegalArgumentException("Solo una cuenta activa de minero puede cambiar su centro preferido");
        }
        cuenta.setIdCentroAcopioPreferido(idCentroAcopio);
    }

    @Override
    @Transactional
    public void asignarCentroAcopiador(Long idCuenta, Long idCentroAcopio) {
        CuentaAcceso cuenta = repository.findById(idCuenta)
                .orElseThrow(() -> new IllegalArgumentException("Cuenta de acopiador no encontrada"));
        if (cuenta.getRol() != RolCuenta.G2_ACOPIADOR) {
            throw new IllegalArgumentException("La cuenta indicada no pertenece a un acopiador");
        }
        cuenta.setIdCentroAcopioAsignado(idCentroAcopio);
    }

    private static CuentaResumen resumen(CuentaAcceso cuenta) {
        return new CuentaResumen(cuenta.getIdCuenta(), cuenta.getDocumentoIdentidad(), cuenta.getRol(),
                cuenta.getIdMinero(), cuenta.getIdCentroAcopioPreferido(),
                cuenta.getIdCentroAcopioAsignado(), cuenta.isActivo());
    }
}
