package pe.edu.upeu.sitraoro.acopio.parametros.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import pe.edu.upeu.sitraoro.acopio.parametros.dto.DashboardResponse;
import pe.edu.upeu.sitraoro.acopio.parametros.service.DashboardAcopioPort;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
@Tag(name = "Módulo 5: Parámetros y Dashboard")
public class DashboardController {

    private final DashboardAcopioPort dashboardAcopioPort;

    @GetMapping("/consolidado")
    @Operation(summary = "Obtener el reporte consolidado final de sumatorias de gramos y desembolsos acumulados")
    public ResponseEntity<DashboardResponse> obtenerDashboardConsolidado(@AuthenticationPrincipal Jwt jwt) {
        if (jwt.getClaimAsStringList("roles").contains("G1_MAYORISTA")) {
            return ResponseEntity.ok(dashboardAcopioPort.obtenerConsolidado(null));
        }
        if (jwt.getClaimAsStringList("roles").contains("G2_ACOPIADOR")
                && jwt.getClaim("idCentroAcopio") instanceof Number centroId) {
            return ResponseEntity.ok(dashboardAcopioPort.obtenerConsolidado(centroId.longValue()));
        }
        throw new org.springframework.security.access.AccessDeniedException("No tienes acceso a este resumen");
    }
}
