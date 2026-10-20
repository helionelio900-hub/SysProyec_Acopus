package pe.edu.upeu.sitraoro.seguridad.config;

import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.jwt.Jwt;
import pe.edu.upeu.sitraoro.seguridad.entity.RolCuenta;
import pe.edu.upeu.sitraoro.seguridad.service.CuentaAccesoService;
import pe.edu.upeu.sitraoro.seguridad.service.CuentaResumen;
import pe.edu.upeu.sitraoro.seguridad.service.IdentidadSesion;

import java.time.Instant;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

class KeycloakAuthenticationConverterTest {
    private final CuentaAccesoService cuentas = mock(CuentaAccesoService.class);
    private final KeycloakAuthenticationConverter converter = new KeycloakAuthenticationConverter(cuentas);

    private Jwt token(String rol, boolean documento) {
        var builder = Jwt.withTokenValue("test-token").header("alg", "RS256")
                .issuer("http://localhost:38081/realms/Sitra_oro")
                .subject("0ec1c218-1e46-47ff-94c9-a175e02a92f9")
                .issuedAt(Instant.now()).expiresAt(Instant.now().plusSeconds(300))
                .claim("realm_access", Map.of("roles", List.of("offline_access", "uma_authorization", rol)))
                .claim("roles", List.of("G1_MAYORISTA"))
                .claim("idCentroAcopio", 999L);
        if (documento) builder.claim("documentoIdentidad", "90000001");
        return builder.build();
    }

    private void cuenta(RolCuenta rol, boolean activa, Long centro) {
        when(cuentas.obtenerPorDocumento("90000001"))
                .thenReturn(new CuentaResumen(1L, "90000001", rol, null, null, centro, activa));
    }

    @Test void conservaUuidYUsaCentroDeOracleEnLugarDelToken() {
        cuenta(RolCuenta.G2_ACOPIADOR, true, 7L);
        var authentication = converter.convert(token("acopiador", true));
        Jwt principal = (Jwt) authentication.getPrincipal();
        assertThat(principal.getSubject()).isEqualTo("0ec1c218-1e46-47ff-94c9-a175e02a92f9");
        assertThat(IdentidadSesion.documento(principal)).isEqualTo("90000001");
        assertThat(principal.<Long>getClaim("idCentroAcopio")).isEqualTo(7L);
        assertThat(principal.getClaimAsStringList("roles")).containsExactly("G2_ACOPIADOR");
        assertThat(authentication.getAuthorities()).extracting("authority").containsExactly("ROLE_G2_ACOPIADOR");
    }

    @Test void aceptaRolCanonicoDeMayoristaSinConcederRolesAuxiliares() {
        cuenta(RolCuenta.G1_MAYORISTA, true, null);
        var authentication = converter.convert(token("G1_MAYORISTA", true));
        assertThat(authentication.getAuthorities()).extracting("authority").containsExactly("ROLE_G1_MAYORISTA");
        assertThat(((Jwt) authentication.getPrincipal()).hasClaim("idCentroAcopio")).isFalse();
    }

    @Test void aceptaLosNombresActualesDeMineroYMayorista() {
        cuenta(RolCuenta.MINERO, true, null);
        assertThat(converter.convert(token("Minero", true)).getAuthorities())
                .extracting("authority").containsExactly("ROLE_MINERO");
        cuenta(RolCuenta.G1_MAYORISTA, true, null);
        assertThat(converter.convert(token("Mayorista", true)).getAuthorities())
                .extracting("authority").containsExactly("ROLE_G1_MAYORISTA");
    }

    @Test void rechazaDocumentoAusenteSinConsultarOracle() {
        assertThatThrownBy(() -> converter.convert(token("acopiador", false)))
                .isInstanceOf(OAuth2AuthenticationException.class);
        verifyNoInteractions(cuentas);
    }

    @Test void rechazaCuentaPendienteDeAprobacion() {
        cuenta(RolCuenta.MINERO, false, null);
        assertThatThrownBy(() -> converter.convert(token("Minero", true)))
                .isInstanceOf(OAuth2AuthenticationException.class);
    }

    @Test void rechazaRolElevadoAunqueElTokenLoDeclare() {
        cuenta(RolCuenta.G2_ACOPIADOR, true, 7L);
        assertThatThrownBy(() -> converter.convert(token("Mayorista", true)))
                .isInstanceOf(OAuth2AuthenticationException.class);
    }

    @Test void rechazaUsuarioSinVinculoConSitra() {
        when(cuentas.obtenerPorDocumento("90000001")).thenThrow(new IllegalArgumentException("Cuenta no encontrada"));
        assertThatThrownBy(() -> converter.convert(token("acopiador", true)))
                .isInstanceOf(OAuth2AuthenticationException.class);
    }

    @Test void noUsaElUuidComoDniSiFaltaElAtributo() {
        assertThatThrownBy(() -> IdentidadSesion.documento(token("Minero", false)))
                .isInstanceOf(org.springframework.security.access.AccessDeniedException.class);
    }

    @Test void conservaCompatibilidadConDniDelLoginLocal() {
        Jwt local = Jwt.withTokenValue("test-local").header("alg", "HS256")
                .issuer("sitra-oro").subject("90000001").build();
        assertThat(IdentidadSesion.documento(local)).isEqualTo("90000001");
    }
}
