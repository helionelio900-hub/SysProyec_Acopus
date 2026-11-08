package pe.edu.upeu.sitraoro.acopio.mayorista.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import pe.edu.upeu.sitraoro.acopio.mayorista.dto.AdelantoRequest;
import pe.edu.upeu.sitraoro.acopio.mayorista.dto.AdelantoResponse;
import pe.edu.upeu.sitraoro.acopio.mayorista.entity.EstadoAdelanto;
import pe.edu.upeu.sitraoro.acopio.mayorista.service.AdelantoService;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/mayorista/adelantos")
@Tag(name = "Módulo 4: Mayorista G1")
public class AdelantoController {
    private final AdelantoService service;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Registrar un adelanto entregado a un centro de acopio (PEN o USD)")
    public AdelantoResponse registrar(@Valid @RequestBody AdelantoRequest request) {
        return service.registrar(request);
    }

    @GetMapping
    @Operation(summary = "Listar adelantos, opcionalmente por centro y estado")
    public List<AdelantoResponse> listar(@RequestParam(required = false) Long idCentroAcopio,
                                         @RequestParam(required = false) EstadoAdelanto estado) {
        return service.listar(idCentroAcopio, estado);
    }

    @GetMapping("/saldo")
    @Operation(summary = "Saldo de adelantos pendientes de descontar")
    public AdelantoResponse.Saldo saldo(@RequestParam(required = false) Long idCentroAcopio) {
        return service.saldo(idCentroAcopio);
    }

    @PatchMapping("/{id}/anular")
    @Operation(summary = "Anular un adelanto pendiente registrado por error")
    public AdelantoResponse anular(@PathVariable Long id) {
        return service.anular(id);
    }
}
