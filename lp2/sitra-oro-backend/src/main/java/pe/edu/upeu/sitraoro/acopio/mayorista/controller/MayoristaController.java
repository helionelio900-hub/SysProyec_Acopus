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
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Positive;
import org.springframework.validation.annotation.Validated;
import pe.edu.upeu.sitraoro.acopio.mayorista.dto.LiquidacionG1Request;
import pe.edu.upeu.sitraoro.acopio.mayorista.dto.LiquidacionG1Response;
import pe.edu.upeu.sitraoro.acopio.mayorista.dto.LiquidacionReporte;
import pe.edu.upeu.sitraoro.acopio.mayorista.dto.RecepcionMayoristaRequest;
import pe.edu.upeu.sitraoro.acopio.mayorista.dto.RecepcionMayoristaResponse;
import pe.edu.upeu.sitraoro.acopio.mayorista.dto.PrecioReferencialResponse;
import pe.edu.upeu.sitraoro.acopio.mayorista.entity.EstadoLiquidacion;
import pe.edu.upeu.sitraoro.acopio.mayorista.service.MayoristaService;
import pe.edu.upeu.sitraoro.acopio.mayorista.service.RecepcionMayoristaServiceImpl;
import pe.edu.upeu.sitraoro.acopio.mayorista.service.PrecioReferencialService;
import pe.edu.upeu.sitraoro.acopio.parametros.service.ParametrosSistemaService;
import pe.edu.upeu.sitraoro.exception.ApiErrorResponse;

import java.time.LocalDateTime;
import java.math.BigDecimal;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/mayorista")
@RequiredArgsConstructor
@Validated
@Tag(name = "Módulo 4: Mayorista G1")
public class MayoristaController {

    private final MayoristaService mayoristaService;
    private final RecepcionMayoristaServiceImpl recepcionMayoristaService;
    private final PrecioReferencialService precioReferencialService;
    private final ParametrosSistemaService parametrosSistemaService;
    private final pe.edu.upeu.sitraoro.acopio.mayorista.service.LoteExportacionService loteExportacionService;
    @PostMapping("/recepciones/lote-exportacion")
    public pe.edu.upeu.sitraoro.acopio.mayorista.dto.LoteExportacionResponse enviarRecepciones(@RequestBody List<Long> ids) {
        return loteExportacionService.crearDesdeRecepciones(ids);
    }
    private final pe.edu.upeu.sitraoro.acopio.parametros.service.CotizacionColorService cotizacionColorService;

    @PostMapping("/cotizaciones-color")
    public List<pe.edu.upeu.sitraoro.acopio.parametros.service.CotizacionColorService.Precio> publicarColores(
            @RequestParam @Positive @Digits(integer = 10, fraction = 2) BigDecimal onza,
            @RequestParam @Positive @Digits(integer = 6, fraction = 4) BigDecimal dolar,
            @RequestParam @Digits(integer = 3, fraction = 4) BigDecimal exportacionRojo,
            @RequestParam @Digits(integer = 3, fraction = 4) BigDecimal exportacionVerde) {
        return cotizacionColorService.publicar(onza, dolar, exportacionRojo, exportacionVerde);
    }

    @GetMapping("/precio-referencial")
    @Operation(summary = "Calcular precio referencial por gramo sin aplicar ley, descuento ni pago")
    public PrecioReferencialResponse precioReferencial(
            @RequestParam @Positive @Digits(integer = 8, fraction = 2) BigDecimal cotizacionOnzaUsd,
            @RequestParam @Positive @Digits(integer = 2, fraction = 4) BigDecimal tipoCambioUsdPen) {
        return precioReferencialService.calcular(cotizacionOnzaUsd, tipoCambioUsdPen);
    }

    @PostMapping("/precio-referencial")
    @Operation(summary = "Publicar el precio referencial en soles para el cotizador del inicio")
    public PrecioReferencialResponse publicarPrecioReferencial(
            @RequestParam @Positive @Digits(integer = 8, fraction = 2) BigDecimal cotizacionOnzaUsd,
            @RequestParam @Positive @Digits(integer = 2, fraction = 4) BigDecimal tipoCambioUsdPen) {
        PrecioReferencialResponse resultado = precioReferencialService.calcular(cotizacionOnzaUsd, tipoCambioUsdPen);
        parametrosSistemaService.publicarCotizacion(cotizacionOnzaUsd, tipoCambioUsdPen);
        return resultado;
    }

    @GetMapping("/recepciones")
    @Operation(summary = "Listar registros de compra recibidos del acopiador")
    public List<RecepcionMayoristaResponse> listarRecepciones(
            @RequestParam(required = false) Long idCentroAcopio) {
        return recepcionMayoristaService.listar(idCentroAcopio);
    }

    @PutMapping("/recepciones/{id}")
    @Operation(summary = "Actualizar un registro de compra mayorista")
    public RecepcionMayoristaResponse actualizarRecepcion(
            @PathVariable Long id, @Valid @RequestBody RecepcionMayoristaRequest request) {
        return recepcionMayoristaService.actualizar(id, request);
    }

    @DeleteMapping("/recepciones/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Eliminar un registro de compra mayorista")
    public void eliminarRecepcion(@PathVariable Long id) {
        recepcionMayoristaService.eliminar(id);
    }

    @PostMapping("/liquidaciones")
    @Operation(summary = "Liquidación de pago no disponible hasta definir su regla financiera")
    @ApiResponses({
            @ApiResponse(responseCode = "400", description = "Solicitud o detalle inválido",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))),
            @ApiResponse(responseCode = "409", description = "El pago al acopiador aún no tiene una regla definida",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class)))
    })
    public ResponseEntity<LiquidacionG1Response> liquidarSemanal(@Valid @RequestBody LiquidacionG1Request request) {
        return ResponseEntity.ok(mayoristaService.procesarLiquidacionSemanal(request));
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
