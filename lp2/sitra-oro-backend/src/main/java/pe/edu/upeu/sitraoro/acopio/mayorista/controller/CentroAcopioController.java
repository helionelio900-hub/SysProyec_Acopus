package pe.edu.upeu.sitraoro.acopio.mayorista.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pe.edu.upeu.sitraoro.acopio.mayorista.dto.CentroAcopioRequest;
import pe.edu.upeu.sitraoro.acopio.mayorista.dto.CentroAcopioResponse;
import pe.edu.upeu.sitraoro.acopio.mayorista.service.CentroAcopioServiceImpl;

import java.time.Duration;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class CentroAcopioController {
    private final CentroAcopioServiceImpl centroAcopioService;

    @PostMapping("/api/v1/mayorista/centros-acopio")
    @ResponseStatus(HttpStatus.CREATED)
    public CentroAcopioResponse crear(@Valid @RequestBody CentroAcopioRequest request) {
        return centroAcopioService.crear(request);
    }

    @GetMapping("/api/v1/mayorista/centros-acopio")
    public ResponseEntity<List<CentroAcopioResponse>> listarParaMayorista() {
        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(Duration.ofMinutes(5)))
                .body(centroAcopioService.listarTodos());
    }

    @GetMapping("/api/v1/publico/centros-acopio")
    public ResponseEntity<List<CentroAcopioResponse>> listarParaMinero() {
        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(Duration.ofMinutes(5)))
                .body(centroAcopioService.listarActivos());
    }
}
