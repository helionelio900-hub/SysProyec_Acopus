package pe.edu.upeu.sitraoro.acopio.mayorista.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import pe.edu.upeu.sitraoro.acopio.mayorista.dto.DashboardMayoristaResponse;
import pe.edu.upeu.sitraoro.acopio.mayorista.service.DashboardMayoristaService;

import java.time.LocalDate;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/mayorista/dashboard")
@Tag(name = "Módulo 4: Mayorista G1")
public class DashboardMayoristaController {
    private final DashboardMayoristaService service;

    @GetMapping
    @Operation(summary = "Tablero mayorista: dinero que entra por día, pagos por moneda, adelantos y estados de lotes")
    public ResponseEntity<DashboardMayoristaResponse> dashboard(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {
        // Datos financieros en vivo: no se guardan en la caché del navegador.
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(service.generar(desde, hasta));
    }
}
