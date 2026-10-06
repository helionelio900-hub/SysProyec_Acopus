package pe.edu.upeu.sitraoro.acopio.acopiador.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import pe.edu.upeu.sitraoro.acopio.acopiador.dto.AjusteCompraRequest;
import pe.edu.upeu.sitraoro.acopio.acopiador.dto.AjusteCompraResponse;
import pe.edu.upeu.sitraoro.acopio.acopiador.service.AjusteCompraService;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class AjusteCompraController {
    private final AjusteCompraService ajustes;

    @PostMapping("/api/v1/acopio/compras/{id}/ajustes")
    @ResponseStatus(HttpStatus.CREATED)
    public AjusteCompraResponse solicitar(@PathVariable Long id, @Valid @RequestBody AjusteCompraRequest request,
                                           @AuthenticationPrincipal Jwt jwt) {
        return ajustes.solicitar(id, centro(jwt), jwt.getSubject(), request);
    }

    @GetMapping("/api/v1/acopio/ajustes")
    public List<AjusteCompraResponse> listarCentro(@AuthenticationPrincipal Jwt jwt) {
        return ajustes.listarCentro(centro(jwt));
    }

    private Long centro(Jwt jwt) {
        if (!(jwt.getClaim("idCentroAcopio") instanceof Number id)) {
            throw new IllegalArgumentException("La cuenta no tiene centro asignado");
        }
        return id.longValue();
    }
}
