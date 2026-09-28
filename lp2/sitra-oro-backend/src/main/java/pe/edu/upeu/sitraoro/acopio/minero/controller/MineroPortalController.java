package pe.edu.upeu.sitraoro.acopio.minero.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import pe.edu.upeu.sitraoro.acopio.minero.dto.*;
import pe.edu.upeu.sitraoro.acopio.minero.service.MineroPortalService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/minero")
public class MineroPortalController {
    private final MineroPortalService mineroPortalService;

    @PostMapping("/registro") @ResponseStatus(HttpStatus.CREATED)
    public RegistroMineroResponse registrar(@Valid @RequestBody RegistroMineroRequest request) {
        return mineroPortalService.registrar(request);
    }

    @GetMapping("/perfil")
    public PerfilMineroResponse perfil(@AuthenticationPrincipal Jwt jwt) {
        return mineroPortalService.obtenerPerfil(jwt.getSubject());
    }

    @PatchMapping("/perfil/centro-acopio")
    public PerfilMineroResponse cambiarCentro(@AuthenticationPrincipal Jwt jwt,
                                             @Valid @RequestBody CambiarCentroRequest request) {
        return mineroPortalService.cambiarCentro(jwt.getSubject(), request);
    }
}
