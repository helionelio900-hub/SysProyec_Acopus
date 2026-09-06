package pe.edu.upeu.sitraoro.acopio.parametros.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pe.edu.upeu.sitraoro.acopio.acopiador.repository.TransaccionG2Repository;
import pe.edu.upeu.sitraoro.acopio.parametros.dto.DashboardResponse;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
@Tag(name = "Módulo 5: Dashboard y Consolidado General (No Transaccional 2)", description = "Reporte consolidado final con sumatorias de gramos (Rojo/Verde) y montos totales desembolsados")
public class DashboardController {

    private final TransaccionG2Repository transaccionG2Repository;

    @GetMapping("/consolidado")
    @Operation(summary = "Obtener el reporte consolidado final de sumatorias de gramos y desembolsos acumulados")
    public ResponseEntity<DashboardResponse> obtenerDashboardConsolidado() {
        BigDecimal gRojo = transaccionG2Repository.sumPesoFundidoByTipoOro("ROJO");
        BigDecimal dRojo = transaccionG2Repository.sumTotalPagadoByTipoOro("ROJO");
        BigDecimal gVerde = transaccionG2Repository.sumPesoFundidoByTipoOro("VERDE");
        BigDecimal dVerde = transaccionG2Repository.sumTotalPagadoByTipoOro("VERDE");

        BigDecimal totalGramos = gRojo.add(gVerde);
        BigDecimal totalDinero = dRojo.add(dVerde);

        return ResponseEntity.ok(new DashboardResponse(gRojo, dRojo, gVerde, dVerde, totalGramos, totalDinero));
    }
}
