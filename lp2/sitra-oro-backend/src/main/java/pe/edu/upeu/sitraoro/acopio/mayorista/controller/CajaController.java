package pe.edu.upeu.sitraoro.acopio.mayorista.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pe.edu.upeu.sitraoro.acopio.mayorista.dto.CajaDtos.*;
import pe.edu.upeu.sitraoro.acopio.mayorista.service.CajaService;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/mayorista/caja")
@Tag(name = "Módulo 4: Mayorista G1")
public class CajaController {
    private final CajaService service;

    @GetMapping
    @Operation(summary = "Saldo de caja en soles y dólares, totales del mes y últimos movimientos")
    public ResponseEntity<ResumenCaja> resumen() {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(service.resumen());
    }

    @GetMapping("/movimientos")
    @Operation(summary = "Movimientos de caja por rango de fechas")
    public List<MovimientoResponse> movimientos(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {
        return service.listar(desde, hasta);
    }

    @PostMapping("/movimientos")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Registrar un ingreso o egreso manual, o el saldo inicial")
    public MovimientoResponse registrar(@Valid @RequestBody MovimientoManualRequest request) {
        return service.registrarManual(request);
    }

    @PostMapping("/exportador")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Registrar lo que pagó el exportador en dólares y/o soles")
    public List<MovimientoResponse> exportador(@Valid @RequestBody IngresoExportadorRequest request) {
        return service.registrarExportador(request);
    }

    @PatchMapping("/movimientos/{id}/anular")
    @Operation(summary = "Anular un movimiento manual registrado por error")
    public MovimientoResponse anular(@PathVariable Long id) {
        return service.anular(id);
    }
}
