package pe.edu.upeu.sitraoro.acopio.acopiador.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import pe.edu.upeu.sitraoro.acopio.acopiador.dto.PrestamoDtos.PrestamoRequest;
import pe.edu.upeu.sitraoro.acopio.acopiador.dto.PrestamoDtos.PrestamoResponse;
import pe.edu.upeu.sitraoro.acopio.acopiador.entity.EstadoPrestamo;
import pe.edu.upeu.sitraoro.acopio.acopiador.service.PrestamoMineroService;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/acopio/prestamos")
@Tag(name = "Módulo 2: Acopiador G2")
public class PrestamoMineroController {
    private final PrestamoMineroService service;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Registrar un préstamo en soles a un minero del centro")
    public PrestamoResponse registrar(@Valid @RequestBody PrestamoRequest request, @AuthenticationPrincipal Jwt jwt) {
        return service.registrar(request, centroId(jwt));
    }

    @GetMapping
    @Operation(summary = "Préstamos del centro, opcionalmente por minero y estado")
    public List<PrestamoResponse> listar(@RequestParam(required = false) Long idMinero,
                                         @RequestParam(required = false) EstadoPrestamo estado,
                                         @AuthenticationPrincipal Jwt jwt) {
        return service.listar(centroId(jwt), idMinero, estado);
    }

    @PatchMapping("/{id}/anular")
    @Operation(summary = "Anular un préstamo pendiente registrado por error")
    public PrestamoResponse anular(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        return service.anular(id, centroId(jwt));
    }

    private static Long centroId(Jwt jwt) {
        if (jwt == null || !(jwt.getClaim("idCentroAcopio") instanceof Number id)) {
            throw new IllegalArgumentException("La cuenta de acopiador no tiene centro asignado");
        }
        return id.longValue();
    }
}
