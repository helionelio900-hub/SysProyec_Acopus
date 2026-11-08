package pe.edu.upeu.sitraoro.acopio.acopiador.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import pe.edu.upeu.sitraoro.acopio.acopiador.dto.CajaAcopioDtos.*;
import pe.edu.upeu.sitraoro.acopio.acopiador.service.CajaAcopioService;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/acopio/caja")
@Tag(name = "Módulo 2: Acopiador G2")
public class CajaAcopioController {
    private final CajaAcopioService service;

    @GetMapping
    @Operation(summary = "Saldo de caja del centro en soles y dólares, totales del mes y últimos movimientos")
    public ResponseEntity<ResumenCaja> resumen(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(service.resumen(centroId(jwt)));
    }

    @GetMapping("/movimientos")
    public List<MovimientoResponse> movimientos(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta,
            @AuthenticationPrincipal Jwt jwt) {
        return service.listar(centroId(jwt), desde, hasta);
    }

    @PostMapping("/movimientos")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Registrar un ingreso o egreso manual, o el saldo inicial")
    public MovimientoResponse registrar(@Valid @RequestBody MovimientoManualRequest request, @AuthenticationPrincipal Jwt jwt) {
        return service.registrarManual(request, centroId(jwt));
    }

    @PostMapping("/mayorista")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Registrar lo que pagó el mayorista en dólares y/o soles")
    public List<MovimientoResponse> pagoMayorista(@Valid @RequestBody IngresoMayoristaRequest request, @AuthenticationPrincipal Jwt jwt) {
        return service.registrarPagoMayorista(request, centroId(jwt));
    }

    @PatchMapping("/movimientos/{id}/anular")
    @Operation(summary = "Anular un movimiento manual registrado por error")
    public MovimientoResponse anular(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        return service.anular(id, centroId(jwt));
    }

    private static Long centroId(Jwt jwt) {
        if (jwt == null || !(jwt.getClaim("idCentroAcopio") instanceof Number id)) {
            throw new IllegalArgumentException("La cuenta de acopiador no tiene centro asignado");
        }
        return id.longValue();
    }
}
