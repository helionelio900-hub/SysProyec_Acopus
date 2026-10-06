package pe.edu.upeu.sitraoro.acopio.minero.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.upeu.sitraoro.acopio.mayorista.service.CentroAcopioServiceImpl;
import pe.edu.upeu.sitraoro.acopio.parametros.dto.MineroRequest;
import pe.edu.upeu.sitraoro.acopio.parametros.entity.Minero;
import pe.edu.upeu.sitraoro.acopio.parametros.service.MineroService;
import pe.edu.upeu.sitraoro.exception.ConflictException;
import pe.edu.upeu.sitraoro.seguridad.entity.RolCuenta;
import pe.edu.upeu.sitraoro.seguridad.service.CuentaAccesoService;
import pe.edu.upeu.sitraoro.seguridad.service.CuentaResumen;
import pe.edu.upeu.sitraoro.acopio.minero.dto.*;

@Service
@RequiredArgsConstructor
public class MineroPortalServiceImpl implements MineroPortalService {
    private final MineroService mineroService;
    private final CuentaAccesoService cuentaAccesoService;
    private final CentroAcopioServiceImpl centroAcopioService;

    @Override @Transactional
    public RegistroMineroResponse registrar(RegistroMineroRequest request) {
        if (request.clave().getBytes(java.nio.charset.StandardCharsets.UTF_8).length > 72)
            throw new IllegalArgumentException("La clave no puede superar 72 bytes UTF-8");
        centroAcopioService.validarActivo(request.idCentroAcopioPreferido());
        if (cuentaAccesoService.existeCuenta(request.documentoIdentidad()))
            throw new ConflictException("Ya existe una cuenta con ese documento");

        var registroExistente = mineroService.obtenerEntidadPorDocumento(request.documentoIdentidad());
        Minero minero;
        boolean requiereValidacionPresencial = registroExistente.isPresent();
        if (requiereValidacionPresencial) {
            minero = registroExistente.get();
        } else {
            var creado = mineroService.crear(new MineroRequest(request.documentoIdentidad(),
                    request.nombresApellidos(), request.telefono(), request.zonaProcedencia()));
            minero = mineroService.obtenerEntidad(creado.getIdMinero());
        }

        CuentaResumen cuenta = cuentaAccesoService.crearCuenta(request.documentoIdentidad(), request.clave(),
                RolCuenta.MINERO, minero.getIdMinero(), request.idCentroAcopioPreferido(), !requiereValidacionPresencial);
        return new RegistroMineroResponse(minero.getIdMinero(), cuenta.documentoIdentidad(),
                cuenta.activo() ? "ACTIVA" : "PENDIENTE_VALIDACION",
                cuenta.activo() ? "Cuenta creada. La cotización es referencial y el precio final se define en el acopio al registrar la entrega."
                        : "Tu registro ya existía en el sistema. Acércate con tu documento al centro elegido para validar tu identidad y activar la cuenta.");
    }

    @Override @Transactional(readOnly = true)
    public PerfilMineroResponse obtenerPerfil(String documento) {
        CuentaResumen cuenta = cuentaAccesoService.obtenerPorDocumento(documento);
        if (cuenta.rol() != RolCuenta.MINERO || !cuenta.activo() || cuenta.idMinero() == null)
            throw new IllegalArgumentException("La cuenta no tiene un perfil de minero activo");
        Minero minero = mineroService.obtenerEntidad(cuenta.idMinero());
        return perfil(minero, cuenta.idCentroAcopioPreferido());
    }

    @Override @Transactional
    public PerfilMineroResponse cambiarCentro(String documento, CambiarCentroRequest request) {
        centroAcopioService.validarActivo(request.idCentroAcopio());
        cuentaAccesoService.actualizarCentroPreferido(documento, request.idCentroAcopio());
        CuentaResumen cuenta = cuentaAccesoService.obtenerPorDocumento(documento);
        return perfil(mineroService.obtenerEntidad(cuenta.idMinero()), cuenta.idCentroAcopioPreferido());
    }

    private static PerfilMineroResponse perfil(Minero minero, Long idCentro) {
        return new PerfilMineroResponse(minero.getIdMinero(), minero.getDocumentoIdentidad(),
                minero.getNombresApellidos(), minero.getTelefono(), minero.getZonaProcedencia(), idCentro);
    }
}
