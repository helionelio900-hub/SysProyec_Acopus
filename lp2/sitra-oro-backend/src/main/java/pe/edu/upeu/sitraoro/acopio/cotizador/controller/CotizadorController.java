package pe.edu.upeu.sitraoro.acopio.cotizador.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.validation.annotation.Validated;
import pe.edu.upeu.sitraoro.acopio.cotizador.dto.CotizacionEstimadaResponse;
import pe.edu.upeu.sitraoro.acopio.cotizador.service.CotizadorService;
import pe.edu.upeu.sitraoro.exception.ApiErrorResponse;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/v1/cotizador")
@RequiredArgsConstructor
@Validated
@Tag(name = "Módulo 2: Cotizador")
public class CotizadorController {

    private final CotizadorService cotizadorService;
    private final pe.edu.upeu.sitraoro.acopio.parametros.service.CotizacionColorService cotizacionColorService;

    @GetMapping("/colores")
    public java.util.List<pe.edu.upeu.sitraoro.acopio.parametros.service.CotizacionColorService.Precio> colores() {
        return cotizacionColorService.vigentes();
    }

    @GetMapping("/precio-referencial")
    @Operation(summary = "Consultar el precio referencial publicado por el mayorista en soles por gramo")
    public ResponseEntity<BigDecimal> precioReferencial() {
        return ResponseEntity.ok(cotizadorService.precioReferencialPorGramo());
    }

    @GetMapping("/estimar")
    @Operation(summary = "Calcular estimación rápida de valor por peso bruto en gramos")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Cotización estimada",
                    content = @Content(schema = @Schema(implementation = CotizacionEstimadaResponse.class))),
            @ApiResponse(responseCode = "400", description = "Peso bruto inválido",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class)))
    })
    public ResponseEntity<CotizacionEstimadaResponse> estimarCotizacion(
            @RequestParam("pesoBrutoGramos") @Positive BigDecimal pesoBrutoGramos,
            @RequestParam(defaultValue = "ROJO") String color) {
        BigDecimal precio = cotizacionColorService.precio(color.toUpperCase(java.util.Locale.ROOT));
        return ResponseEntity.ok(new CotizacionEstimadaResponse(pesoBrutoGramos, precio,
                pesoBrutoGramos.multiply(precio).setScale(2, java.math.RoundingMode.HALF_UP),
                "Estimado con la cotización vigente. No registra una compra ni congela el precio."));
    }
}
