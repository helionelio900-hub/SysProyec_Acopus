package pe.edu.upeu.sitraoro.seguridad.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Autenticación y Perfil JWT")
public class PerfilUsuarioController {

    public record PerfilJwtResponse(
            String sub,
            String username,
            String email,
            String documentoIdentidad,
            List<String> roles
    ) {}

    @GetMapping("/perfil")
    @Operation(summary = "Obtener perfil del usuario autenticado leyendo directamente los claims del JWT (sin BD)")
    public PerfilJwtResponse obtenerPerfil(@AuthenticationPrincipal Jwt jwt) {
        String sub = jwt.getSubject();
        String username = jwt.getClaimAsString("preferred_username");
        String email = jwt.getClaimAsString("email");
        if (email == null && username != null && username.contains("@")) {
            email = username;
        } else if (email == null) {
            email = (username != null ? username : sub) + "@sitraoro.pe";
        }
        String documento = jwt.getClaimAsString("documentoIdentidad");

        List<String> roles = jwt.getClaimAsStringList("roles");
        if (roles == null || roles.isEmpty()) {
            Object realmAccess = jwt.getClaims().get("realm_access");
            if (realmAccess instanceof Map<?, ?> map && map.get("roles") instanceof Collection<?> lista) {
                roles = lista.stream().map(Object::toString).toList();
            } else {
                roles = Collections.emptyList();
            }
        }

        return new PerfilJwtResponse(sub, username, email, documento, roles);
    }
}
