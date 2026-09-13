package pe.edu.upeu.sitraoro.acopio.cotizador.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.validation.annotation.Validated;
import pe.edu.upeu.sitraoro.acopio.cotizador.dto.CotizacionEstimadaResponse;
import pe.edu.upeu.sitraoro.acopio.cotizador.service.CotizadorService;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/v1/cotizador")
@RequiredArgsConstructor
@Validated
@Tag(name = "Módulo 2: Cotizador Minero (No Transaccional 1)", description = "Consulta estimativa pública para mineros antes de acopio presencial")
public class CotizadorController {

    private final CotizadorService cotizadorService;

    @GetMapping("/estimar")
    @Operation(summary = "Calcular estimación rápida de valor por peso bruto en gramos")
    public ResponseEntity<CotizacionEstimadaResponse> estimarCotizacion(
            @RequestParam("pesoBrutoGramos") @Positive BigDecimal pesoBrutoGramos) {
        return ResponseEntity.ok(cotizadorService.calcularCotizacionEstimada(pesoBrutoGramos));
    }
}
