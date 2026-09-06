package pe.edu.upeu.sitraoro.acopio.parametros.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pe.edu.upeu.sitraoro.acopio.acopiador.dto.TransaccionG2Response;
import pe.edu.upeu.sitraoro.acopio.acopiador.service.AcopiadorService;
import pe.edu.upeu.sitraoro.acopio.parametros.dto.MineroRequest;
import pe.edu.upeu.sitraoro.acopio.parametros.dto.MineroResponse;
import pe.edu.upeu.sitraoro.acopio.parametros.service.MineroService;

import java.util.List;

/*
 ===================================================================================
 ❌ FORMA INCORRECTA (VIOLACIÓN PRINCIPIOS S Y D - ANTES DE OPTIMIZAR):
 -----------------------------------------------------------------------------------
 @RestController
 public class MineroController {
     // Violación de D: Dependencia directa de la clase concreta e instanciación con 'new'
     private MineroServiceImpl mineroService = new MineroServiceImpl();

     // Violación de S: El controlador ejecutaba lógica de acceso a datos directamente
     @PostMapping("/mineros")
     public Minero crearMinero(@RequestBody Minero minero) {
         return mineroRepository.save(minero); // Guardaba directamente en BD sin Service ni DTOs
     }
 }
 ===================================================================================
 ✅ FORMA CORRECTA (PATRÓN SOLID S Y D - CÓDIGO REAL EN PRODUCCIÓN):
 ===================================================================================
*/

@Tag(name = "Mineros")
@RestController
@RequestMapping("/api/v1/acopio/mineros")
@RequiredArgsConstructor
public class MineroController {

    private final MineroService mineroService; // Cumple D: Inyección de la Interfaz
    private final AcopiadorService acopiadorService; // Cumple D: Inyección de la Interfaz

    @Operation(summary = "Lista todos los mineros de acopio")
    @GetMapping
    public ResponseEntity<List<MineroResponse>> listar() {
        return ResponseEntity.ok(mineroService.listar());
    }

    @Operation(summary = "Consulta un minero por id")
    @GetMapping("/{id}")
    public ResponseEntity<MineroResponse> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(mineroService.obtener(id));
    }

    @Operation(summary = "Registra un minero nuevo")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MineroResponse crear(@Valid @RequestBody MineroRequest request) {
        return mineroService.crear(request);
    }

    @Operation(summary = "Actualiza datos de un minero existente")
    @PutMapping("/{id}")
    public ResponseEntity<MineroResponse> actualizar(@PathVariable Long id, @Valid @RequestBody MineroRequest request) {
        return ResponseEntity.ok(mineroService.actualizar(id, request));
    }

    @Operation(summary = "Elimina un minero")
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Long id) {
        mineroService.eliminar(id);
    }

    @Operation(summary = "Lista las transacciones de acopio de un minero (Navegación Controlada)")
    @GetMapping("/{id}/transacciones")
    public ResponseEntity<List<TransaccionG2Response>> listarTransaccionesPorMinero(@PathVariable Long id) {
        return ResponseEntity.ok(acopiadorService.listarPorMinero(id));
    }
}
