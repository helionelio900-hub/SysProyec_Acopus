package pe.edu.upeu.sitraoro.acopio.parametros.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<DashboardResponse> obtenerDashboardConsolidado() {
        return ResponseEntity.ok(dashboardAcopioPort.obtenerConsolidado());
    }
}
