package pe.edu.upeu.sitraoro.seguridad.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;
import pe.edu.upeu.sitraoro.seguridad.service.CuentaAccesoService;
import pe.edu.upeu.sitraoro.seguridad.service.CuentaResumen;

import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/** Se ejecuta después de validar la firma, el emisor y la vigencia del JWT. */
@Component
@Profile("keycloak")
@RequiredArgsConstructor
public class KeycloakAuthenticationConverter implements Converter<Jwt, AbstractAuthenticationToken> {
    private static final Map<String, String> ROLES = Map.of(
            "MINERO", "MINERO", "Minero", "MINERO",
            "G2_ACOPIADOR", "G2_ACOPIADOR", "acopiador", "G2_ACOPIADOR",
            "G1_MAYORISTA", "G1_MAYORISTA", "Mayorista", "G1_MAYORISTA");

    private final CuentaAccesoService cuentas;

    @Override
    public AbstractAuthenticationToken convert(Jwt jwt) {
        if (jwt.getSubject() == null || jwt.getSubject().isBlank()) {
            throw tokenInvalido("El token de Keycloak no tiene identidad sub");
        }
        Object documento = jwt.getClaims().get("documentoIdentidad");
        if (!(documento instanceof String dni) || dni.isBlank() || dni.length() > 15) {
            throw tokenInvalido("Falta el atributo administrado documentoIdentidad de SITRA-ORO");
        }
        CuentaResumen cuenta;
        try {
            cuenta = cuentas.obtenerPorDocumento(dni);
        } catch (IllegalArgumentException ex) {
            throw tokenInvalido("El usuario no está vinculado a una cuenta de SITRA-ORO");
        }
        Object realmAccess = jwt.getClaims().get("realm_access");
        Object roles = realmAccess instanceof Map<?, ?> access ? access.get("roles") : null;
        boolean rolAsignado = roles instanceof Collection<?> lista
                && lista.stream().anyMatch(rol -> rol instanceof String nombre
                        && cuenta.rol().name().equals(ROLES.get(nombre)));
        if (!cuenta.activo() || !rolAsignado) {
            throw tokenInvalido("Cuenta inactiva o rol de Keycloak incompatible con la cuenta de SITRA-ORO");
        }

        // Mantener sub=UUID. Los permisos y el centro operativo se obtienen de Oracle.
        Map<String, Object> claims = new HashMap<>(jwt.getClaims());
        claims.put("documentoIdentidad", cuenta.documentoIdentidad());
        claims.put("roles", List.of(cuenta.rol().name()));
        claims.put("accountId", cuenta.idCuenta());
        claims.remove("idCentroAcopio");
        if (cuenta.idCentroAcopioAsignado() != null) {
            claims.put("idCentroAcopio", cuenta.idCentroAcopioAsignado());
        }
        Jwt principal = new Jwt(jwt.getTokenValue(), jwt.getIssuedAt(), jwt.getExpiresAt(), jwt.getHeaders(), claims);
        return new JwtAuthenticationToken(principal,
                List.of(new SimpleGrantedAuthority("ROLE_" + cuenta.rol().name())), jwt.getSubject());
    }

    private static OAuth2AuthenticationException tokenInvalido(String mensaje) {
        return new OAuth2AuthenticationException(new OAuth2Error("invalid_token", mensaje, null));
    }
}
