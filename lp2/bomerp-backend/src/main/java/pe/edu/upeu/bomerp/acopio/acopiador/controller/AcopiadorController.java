package pe.edu.upeu.bomerp.acopio.acopiador.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pe.edu.upeu.bomerp.acopio.acopiador.dto.AcumuladosG2Response;
import pe.edu.upeu.bomerp.acopio.acopiador.dto.TransaccionG2Request;
import pe.edu.upeu.bomerp.acopio.acopiador.dto.TransaccionG2Response;
import pe.edu.upeu.bomerp.acopio.acopiador.service.AcopiadorService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/acopio")
@RequiredArgsConstructor
@Tag(name = "Módulo 3: Acopio G2 (Transaccional 1)", description = "Registro de fundición real, compras presenciales y acumulados por color (Rojo / Verde)")
public class AcopiadorController {

    private final AcopiadorService acopiadorService;

    @PostMapping("/transacciones")
    @Operation(summary = "Registrar nueva compra presencial de oro fundido con clasificación por color")
    public ResponseEntity<TransaccionG2Response> registrarCompra(@Valid @RequestBody TransaccionG2Request request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(acopiadorService.registrarCompraDirecta(request));
    }

    @GetMapping("/transacciones")
    @Operation(summary = "Listar todas las transacciones de compra de G2")
    public ResponseEntity<List<TransaccionG2Response>> listarTransacciones() {
        return ResponseEntity.ok(acopiadorService.listarTransacciones());
    }

    @GetMapping("/acumulados-semanales")
    @Operation(summary = "Obtener acumulados de gramos y dinero pagado separados estrictamente por color (Rojo / Verde)")
    public ResponseEntity<AcumuladosG2Response> obtenerAcumuladosSemanales() {
        return ResponseEntity.ok(acopiadorService.obtenerAcumuladosSemanalesPorColor());
    }
}
