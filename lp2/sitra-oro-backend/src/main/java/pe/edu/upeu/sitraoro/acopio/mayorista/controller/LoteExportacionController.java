package pe.edu.upeu.sitraoro.acopio.mayorista.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import pe.edu.upeu.sitraoro.acopio.mayorista.dto.LoteExportacionRequest;
import pe.edu.upeu.sitraoro.acopio.mayorista.dto.LoteExportacionResponse;
import pe.edu.upeu.sitraoro.acopio.mayorista.service.LoteExportacionService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/mayorista/lotes-exportacion")
@RequiredArgsConstructor
public class LoteExportacionController {
    private final LoteExportacionService service;

    @GetMapping
    public List<LoteExportacionResponse> listar() {
        return service.listar();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public LoteExportacionResponse crear(@Valid @RequestBody LoteExportacionRequest request) {
        return service.crear(request);
    }

    @PutMapping("/{id}")
    public LoteExportacionResponse actualizar(@PathVariable Long id, @Valid @RequestBody LoteExportacionRequest request) {
        return service.actualizar(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Long id) {
        service.eliminar(id);
    }

    @PostMapping("/{id}/preparar")
    public LoteExportacionResponse preparar(@PathVariable Long id) {
        return service.preparar(id);
    }
}
