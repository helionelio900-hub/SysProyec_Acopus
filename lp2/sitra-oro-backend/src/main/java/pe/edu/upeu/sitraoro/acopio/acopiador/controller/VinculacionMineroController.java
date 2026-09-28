package pe.edu.upeu.sitraoro.acopio.acopiador.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import pe.edu.upeu.sitraoro.acopio.acopiador.dto.SolicitudCuentaMineroResponse;
import pe.edu.upeu.sitraoro.seguridad.service.CuentaAccesoService;
import pe.edu.upeu.sitraoro.seguridad.service.SolicitudCuentaMinero;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/acopio/mineros/cuentas-pendientes")
public class VinculacionMineroController {
    private final CuentaAccesoService cuentaAccesoService;

    @GetMapping
    public List<SolicitudCuentaMineroResponse> listar(@AuthenticationPrincipal Jwt jwt) {
        Long centroId = jwt.getClaim("idCentroAcopio");
        if (centroId == null) throw new IllegalArgumentException("La cuenta no tiene un centro de acopio asignado");
        return cuentaAccesoService.listarSolicitudesMinero(centroId).stream()
                .map(VinculacionMineroController::toResponse).toList();
    }

    @PostMapping("/{documentoIdentidad}/aprobar")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void aprobar(@AuthenticationPrincipal Jwt jwt, @PathVariable String documentoIdentidad) {
        Long centroId = jwt.getClaim("idCentroAcopio");
        if (centroId == null) throw new IllegalArgumentException("La cuenta no tiene un centro de acopio asignado");
        cuentaAccesoService.aprobarSolicitudMinero(documentoIdentidad, centroId);
    }

    private static SolicitudCuentaMineroResponse toResponse(SolicitudCuentaMinero solicitud) {
        return new SolicitudCuentaMineroResponse(solicitud.documentoIdentidad(), solicitud.idMinero(),
                solicitud.idCentroAcopioPreferido());
    }
}
