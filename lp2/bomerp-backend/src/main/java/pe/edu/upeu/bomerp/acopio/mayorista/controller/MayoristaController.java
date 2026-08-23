package pe.edu.upeu.bomerp.acopio.mayorista.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pe.edu.upeu.bomerp.acopio.mayorista.dto.LiquidacionG1Request;
import pe.edu.upeu.bomerp.acopio.mayorista.dto.LiquidacionG1Response;
import pe.edu.upeu.bomerp.acopio.mayorista.service.MayoristaService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/mayorista")
@RequiredArgsConstructor
@Tag(name = "Módulo 4: Liquidaciones Mayoristas G1 (Transaccional 2)", description = "Cierre semanal G2-G1 en base a cotización Onza USD y Tipo Cambio Dólar")
public class MayoristaController {

    private final MayoristaService mayoristaService;

    @PostMapping("/liquidaciones")
    @Operation(summary = "Registrar cierre semanal y desembolso a acopiador G2 en base a precio Onza/USD")
    public ResponseEntity<LiquidacionG1Response> liquidarSemanal(@Valid @RequestBody LiquidacionG1Request request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(mayoristaService.procesarLiquidacionSemanal(request));
    }

    @GetMapping("/liquidaciones")
    @Operation(summary = "Listar el historial de liquidaciones semanales de G1")
    public ResponseEntity<List<LiquidacionG1Response>> listarLiquidaciones() {
        return ResponseEntity.ok(mayoristaService.listarLiquidaciones());
    }
}
