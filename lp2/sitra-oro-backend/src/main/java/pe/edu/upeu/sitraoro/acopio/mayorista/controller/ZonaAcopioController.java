package pe.edu.upeu.sitraoro.acopio.mayorista.controller;

import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import pe.edu.upeu.sitraoro.acopio.mayorista.dto.ZonaAcopioRequest;
import pe.edu.upeu.sitraoro.acopio.mayorista.dto.ZonaAcopioResponse;
import pe.edu.upeu.sitraoro.acopio.mayorista.service.ZonaAcopioService;

@RestController @RequiredArgsConstructor
@RequestMapping("/api/v1/mayorista/zonas-acopio")
public class ZonaAcopioController {
    private final ZonaAcopioService service;

    @GetMapping
    public List<ZonaAcopioResponse> listar() { return service.listar(); }

    @PostMapping @ResponseStatus(HttpStatus.CREATED)
    public ZonaAcopioResponse crear(@Valid @RequestBody ZonaAcopioRequest request) {
        return service.crear(request.nombre());
    }

    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Long id) { service.eliminar(id); }
}
