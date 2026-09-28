package pe.edu.upeu.sitraoro.seguridad.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pe.edu.upeu.sitraoro.seguridad.dto.LoginRequest;
import pe.edu.upeu.sitraoro.seguridad.dto.TokenResponse;
import pe.edu.upeu.sitraoro.seguridad.service.CuentaAccesoService;
import pe.edu.upeu.sitraoro.seguridad.service.TokenService;

@RestController
@RequestMapping("/api/v1/seguridad")
@RequiredArgsConstructor
public class AuthController {

    private final CuentaAccesoService cuentaAccesoService;
    private final TokenService tokenService;

    @PostMapping("/login")
    public ResponseEntity<TokenResponse> iniciarSesion(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(tokenService.emitir(
                cuentaAccesoService.autenticar(request.documentoIdentidad(), request.clave())));
    }
}
