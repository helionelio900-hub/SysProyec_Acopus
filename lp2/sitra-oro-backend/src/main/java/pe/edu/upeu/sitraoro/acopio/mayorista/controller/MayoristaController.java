package pe.edu.upeu.sitraoro.acopio.mayorista.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pe.edu.upeu.sitraoro.acopio.mayorista.dto.LiquidacionG1Request;
import pe.edu.upeu.sitraoro.acopio.mayorista.dto.LiquidacionG1Response;
import pe.edu.upeu.sitraoro.acopio.mayorista.dto.LiquidacionReporte;
import pe.edu.upeu.sitraoro.acopio.mayorista.entity.EstadoLiquidacion;
import pe.edu.upeu.sitraoro.acopio.mayorista.service.MayoristaService;
import pe.edu.upeu.sitraoro.exception.ApiErrorResponse;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/mayorista")
@RequiredArgsConstructor
@Tag(name = "Módulo 4: Mayorista G1")
public class MayoristaController {

    private final MayoristaService mayoristaService;

    @PostMapping("/liquidaciones")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Registrar liquidación cabecera-detalle con descuento de stock acumulado")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Liquidación semanal registrada",
                    content = @Content(schema = @Schema(implementation = LiquidacionG1Response.class))),
            @ApiResponse(responseCode = "400", description = "Solicitud o detalle inválido",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))),
            @ApiResponse(responseCode = "409", description = "El detalle no coincide exactamente con el stock pendiente",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class)))
    })
    public ResponseEntity<LiquidacionG1Response> liquidarSemanal(@Valid @RequestBody LiquidacionG1Request request) {
        log.info("Iniciando procesamiento de liquidación cabecera-detalle para acopiador: {}", request.nombreAcopiadorG2());
        LiquidacionG1Response response = mayoristaService.procesarLiquidacionSemanal(request);
        log.info("Liquidación registrada exitosamente con ID: {}, total: S/ {}", response.idLiquidacionG1(), response.totalPagadoG2Pen());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/liquidaciones")
    @Operation(summary = "Consulta liquidaciones con filtros combinados y ordenamiento opcionales")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Liquidaciones encontradas",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = LiquidacionG1Response.class)))),
            @ApiResponse(responseCode = "400", description = "Filtro u ordenamiento inválido",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class)))
    })
    public ResponseEntity<List<LiquidacionG1Response>> buscar(
            @RequestParam(required = false) EstadoLiquidacion estado,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime hasta,
            @RequestParam(defaultValue = "fechaLiquidacion") String ordenarPor,
            @RequestParam(defaultValue = "DESC") String direccion) {
        log.info("Consultando liquidaciones estado={} desde={} hasta={} ordenarPor={} direccion={}",
                estado, desde, hasta, ordenarPor, direccion);
        return ResponseEntity.ok(mayoristaService.buscar(estado, desde, hasta, ordenarPor, direccion));
    }

    @GetMapping("/liquidaciones/resumen")
    @Operation(summary = "Reporte de liquidaciones: agregados (conteo, monto total, ticket promedio) y detalle resumido")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Resumen calculado",
                    content = @Content(schema = @Schema(implementation = LiquidacionReporte.class))),
            @ApiResponse(responseCode = "400", description = "Filtro inválido",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class)))
    })
    public ResponseEntity<LiquidacionReporte> resumen(
            @RequestParam(required = false) EstadoLiquidacion estado,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime hasta) {
        return ResponseEntity.ok(mayoristaService.reporte(estado, desde, hasta));
    }

    @GetMapping("/liquidaciones/{id}")
    @Operation(summary = "Consultar liquidación por ID con sus líneas de detalle")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Liquidación encontrada",
                    content = @Content(schema = @Schema(implementation = LiquidacionG1Response.class))),
            @ApiResponse(responseCode = "404", description = "Liquidación no encontrada",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class)))
    })
    public ResponseEntity<LiquidacionG1Response> obtenerPorId(@PathVariable Long id) {
        log.info("Consultando detalle de liquidación con ID: {}", id);
        return ResponseEntity.ok(mayoristaService.obtenerPorId(id));
    }
}
