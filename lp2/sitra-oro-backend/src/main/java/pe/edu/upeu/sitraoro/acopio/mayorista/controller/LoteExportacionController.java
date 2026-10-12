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
    public record EditarRecepciones(@jakarta.validation.constraints.NotNull java.time.LocalDate fecha,
      @jakarta.validation.constraints.NotEmpty @jakarta.validation.constraints.Size(max=200) List<@jakarta.validation.constraints.NotNull @jakarta.validation.constraints.Positive Long> ids) {}
    @PutMapping("/{id}/recepciones")
    public LoteExportacionResponse editarRecepciones(@PathVariable Long id,@Valid @RequestBody EditarRecepciones request) {
        return service.editarRecepciones(id,request.fecha(),request.ids());
    }

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
