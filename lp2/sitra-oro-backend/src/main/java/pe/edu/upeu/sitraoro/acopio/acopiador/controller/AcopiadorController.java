package pe.edu.upeu.sitraoro.acopio.acopiador.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import pe.edu.upeu.sitraoro.acopio.acopiador.dto.AcumuladosG2Response;
import pe.edu.upeu.sitraoro.acopio.acopiador.dto.TransaccionG2Request;
import pe.edu.upeu.sitraoro.acopio.acopiador.dto.TransaccionG2Response;
import pe.edu.upeu.sitraoro.acopio.acopiador.dto.EntregaMayoristaRequest;
import pe.edu.upeu.sitraoro.acopio.acopiador.service.AcopiadorService;
import pe.edu.upeu.sitraoro.acopio.mayorista.dto.RecepcionMayoristaResponse;
import pe.edu.upeu.sitraoro.acopio.mayorista.dto.ReporteEntregasAcopiador;
import pe.edu.upeu.sitraoro.acopio.mayorista.service.RecepcionMayoristaServiceImpl;
import pe.edu.upeu.sitraoro.exception.ApiErrorResponse;

import java.util.List;
import java.time.LocalDate;
import org.springframework.format.annotation.DateTimeFormat;

@RestController
@RequestMapping("/api/v1/acopio")
@RequiredArgsConstructor
@Tag(name = "Módulo 3: Acopio G2")
public class AcopiadorController {

    private final AcopiadorService acopiadorService;
    private final RecepcionMayoristaServiceImpl recepcionMayoristaService;

    @PostMapping("/entregas-mayorista")
    @Operation(summary = "Enviar al mayorista las compras seleccionadas por el acopiador")
    public ResponseEntity<RecepcionMayoristaResponse> enviarAlMayorista(
            @Valid @RequestBody EntregaMayoristaRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                recepcionMayoristaService.registrarDesdeAcopiador(centroId(jwt), request.idsComprasAcopiador()));
    }

    @GetMapping("/entregas-mayorista/resumen")
    @Operation(summary = "Consultar entregas del centro autenticado con agregados por color y filtro de fechas")
    public ResponseEntity<ReporteEntregasAcopiador> reporteEntregas(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta,
            @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(recepcionMayoristaService.reporteAcopiador(centroId(jwt), desde, hasta));
    }

    @PostMapping("/transacciones")
    @Operation(summary = "Registrar nueva compra presencial de oro fundido con clasificación por color")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Compra registrada",
                    content = @Content(schema = @Schema(implementation = TransaccionG2Response.class))),
            @ApiResponse(responseCode = "400", description = "Datos de compra inválidos",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Minero no encontrado",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))),
            @ApiResponse(responseCode = "409", description = "Conflicto con datos existentes",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class)))
    })
    public ResponseEntity<TransaccionG2Response> registrarCompra(@Valid @RequestBody TransaccionG2Request request,
                                                                  @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.status(HttpStatus.CREATED).body(acopiadorService.registrarCompraDirecta(request, centroId(jwt)));
    }

    @GetMapping("/transacciones")
    @Operation(summary = "Listar todas las transacciones de compra de G2")
    public ResponseEntity<List<TransaccionG2Response>> listarTransacciones(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(acopiadorService.listarTransacciones(centroId(jwt)));
    }

    @GetMapping("/mineros/{id}/transacciones")
    @Operation(summary = "Listar las transacciones relacionadas con un minero")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Transacciones encontradas",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = TransaccionG2Response.class)))),
            @ApiResponse(responseCode = "404", description = "Minero no encontrado",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class)))
    })
    public ResponseEntity<List<TransaccionG2Response>> listarTransaccionesPorMinero(@PathVariable Long id,
                                                                                     @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(acopiadorService.listarPorMinero(id, centroId(jwt)));
    }

    @GetMapping("/acumulados-semanales")
    @Operation(summary = "Obtener acumulados de gramos y dinero pagado separados estrictamente por color (Rojo / Verde)")
    public ResponseEntity<AcumuladosG2Response> obtenerAcumuladosSemanales(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(acopiadorService.obtenerAcumuladosSemanalesPorColor(centroId(jwt)));
    }

    private static Long centroId(Jwt jwt) {
        if (jwt == null || !(jwt.getClaim("idCentroAcopio") instanceof Number id)) {
            throw new IllegalArgumentException("La cuenta de acopiador no tiene centro asignado");
        }
        return id.longValue();
    }
}
