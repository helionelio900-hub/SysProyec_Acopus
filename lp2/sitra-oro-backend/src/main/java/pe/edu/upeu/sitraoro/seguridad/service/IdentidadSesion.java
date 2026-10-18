package pe.edu.upeu.sitraoro.seguridad.service;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.oauth2.jwt.Jwt;

/** Identidad de negocio: DNI local o atributo administrado de un JWT de Keycloak validado. */
public final class IdentidadSesion {
    private IdentidadSesion() {}

    public static String documento(Jwt jwt) {
        String documento = jwt.getClaimAsString("documentoIdentidad");
        if (documento != null && !documento.isBlank()) return documento;
        if ("sitra-oro".equals(jwt.getClaimAsString("iss")) && jwt.getSubject() != null) {
            return jwt.getSubject();
        }
        throw new AccessDeniedException("La sesión no tiene documento de SITRA-ORO vinculado");
    }
}
