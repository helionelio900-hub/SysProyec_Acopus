package pe.edu.upeu.bomerp.acopio.seguridad.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pe.edu.upeu.bomerp.acopio.seguridad.dto.AuthRequest;
import pe.edu.upeu.bomerp.acopio.seguridad.dto.AuthResponse;

import java.util.List;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Módulo 1: Seguridad & Autenticación (Auth / JWT)", description = "Autenticación de usuarios, emisión de JWT y control de roles RBAC")
public class AuthController {

    @PostMapping("/login")
    @Operation(summary = "Autenticar usuario y obtener Token JWT con roles RBAC")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        // Mock Token JWT para la estructura inicial de LP2
        List<String> roles;
        if ("mayorista".equalsIgnoreCase(request.username())) {
            roles = List.of("ROLE_G1_MAYORISTA");
        } else if ("acopiador".equalsIgnoreCase(request.username())) {
            roles = List.of("ROLE_G2_ACOPIADOR");
        } else {
            roles = List.of("ROLE_MINERO");
        }

        String tokenSimulado = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI" + request.username() + "\",\"roles\":" + roles.toString() + "}";
        return ResponseEntity.ok(new AuthResponse(tokenSimulado, "Bearer", request.username(), roles));
    }
}
