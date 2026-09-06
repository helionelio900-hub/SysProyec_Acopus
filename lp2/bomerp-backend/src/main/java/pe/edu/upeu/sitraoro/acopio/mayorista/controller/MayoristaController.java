package pe.edu.upeu.sitraoro.acopio.mayorista.controller;

import io.swagger.v3.oas.annotations.Operation;
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

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@RestController
@RequestMapping({"/api/v1/mayorista", "/api/v1/acopio/liquidaciones"})
@RequiredArgsConstructor
@Tag(name = "Módulo 4: Liquidaciones Mayoristas G1 (Transaccional 2)", description = "Operación Cabecera-Detalle de Cierre semanal y Venta Mayorista en base a Onza USD")
public class MayoristaController {

    private final MayoristaService mayoristaService;

    @PostMapping({"/liquidaciones", ""})
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Registrar liquidación cabecera-detalle con descuento de stock acumulado")
    public ResponseEntity<LiquidacionG1Response> liquidarSemanal(@Valid @RequestBody LiquidacionG1Request request) {
        log.info("Iniciando procesamiento de liquidación cabecera-detalle para acopiador: {}", request.nombreAcopiadorG2());
        LiquidacionG1Response response = mayoristaService.procesarLiquidacionSemanal(request);
        log.info("Liquidación registrada exitosamente con ID: {}, total: S/ {}", response.idLiquidacionG1(), response.totalPagadoG2Pen());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping({"/liquidaciones", ""})
    @Operation(summary = "Consulta liquidaciones con filtros combinados y ordenamiento opcionales")
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
    public ResponseEntity<LiquidacionReporte> resumen(
            @RequestParam(required = false) EstadoLiquidacion estado,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime hasta) {
        return ResponseEntity.ok(mayoristaService.reporte(estado, desde, hasta));
    }

    @GetMapping({"/liquidaciones/{id}", "/{id}"})
    @Operation(summary = "Consultar liquidación por ID con sus líneas de detalle")
    public ResponseEntity<LiquidacionG1Response> obtenerPorId(@PathVariable Long id) {
        log.info("Consultando detalle de liquidación con ID: {}", id);
        return ResponseEntity.ok(mayoristaService.obtenerPorId(id));
    }
}
