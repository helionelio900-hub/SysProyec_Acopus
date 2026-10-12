package pe.edu.upeu.sitraoro.acopio.mayorista.controller;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import pe.edu.upeu.sitraoro.acopio.mayorista.dto.*;
import pe.edu.upeu.sitraoro.acopio.mayorista.service.RecepcionLeyService;
import java.util.List;

@RestController @RequiredArgsConstructor
@RequestMapping("/api/v1/mayorista")
public class RecepcionLeyController {
    private final RecepcionLeyService service;
    @GetMapping("/recepciones-ley/resumen")
    public RecepcionLeyService.ReporteCompras reporte(
      @RequestParam(required=false) @org.springframework.format.annotation.DateTimeFormat(iso=org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate desde,
      @RequestParam(required=false) @org.springframework.format.annotation.DateTimeFormat(iso=org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate hasta) {
        return service.reporte(desde,hasta);
    }
    @PostMapping("/recepciones-ley/acumulado")
    public RecepcionLeyResponse guardarAcumulado(@Valid @RequestBody AnalisisAcumuladoRequest request) {
        return service.guardarAcumulado(request);
    }
    @GetMapping("/recepciones-ley")
    public List<RecepcionLeyResponse> listar(@RequestParam(required = false) Long idCentroAcopio) { return service.listar(idCentroAcopio); }
    @PostMapping("/recepciones-ley/calcular")
    public RecepcionLeyResponse.Calculo calcular(@Valid @RequestBody RecepcionLeyRequest request) { return service.calcular(request); }
    @PutMapping("/recepciones/{id}/leyes")
    public RecepcionLeyResponse guardar(@PathVariable Long id, @Valid @RequestBody RecepcionLeyRequest request) { return service.guardar(id, request); }
}
