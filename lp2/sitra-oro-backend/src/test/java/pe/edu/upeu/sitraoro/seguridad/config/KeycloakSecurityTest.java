package pe.edu.upeu.sitraoro.seguridad.config;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import pe.edu.upeu.sitraoro.seguridad.entity.RolCuenta;
import pe.edu.upeu.sitraoro.seguridad.service.CuentaAccesoService;
import pe.edu.upeu.sitraoro.seguridad.service.CuentaResumen;

import java.time.Instant;
import java.util.List;
import java.util.Map;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(KeycloakSecurityTest.ProbeController.class)
@Import({SecurityConfig.class, KeycloakAuthenticationConverter.class, KeycloakSecurityTest.ProbeController.class})
@ActiveProfiles("keycloak")
class KeycloakSecurityTest {
    @Autowired MockMvc mvc;
    @MockitoBean JwtDecoder decoder;
    @MockitoBean CuentaAccesoService cuentas;

    @BeforeEach void preparar() {
        Jwt jwt = Jwt.withTokenValue("acopiador-token").header("alg", "RS256")
                .issuer("http://localhost:38081/realms/Sitra_oro").subject("uuid-acopiador")
                .issuedAt(Instant.now()).expiresAt(Instant.now().plusSeconds(300))
                .claim("documentoIdentidad", "90000001")
                .claim("realm_access", Map.of("roles", List.of("acopiador", "offline_access"))).build();
        when(decoder.decode("acopiador-token")).thenReturn(jwt);
        when(cuentas.obtenerPorDocumento("90000001"))
                .thenReturn(new CuentaResumen(1L, "90000001", RolCuenta.G2_ACOPIADOR, null, null, 7L, true));
    }

    @Test void sinTokenRecibe401() throws Exception {
        mvc.perform(get("/api/v1/acopio/prueba-keycloak")).andExpect(status().isUnauthorized());
    }

    @Test void acopiadorPuedeAccederASuModulo() throws Exception {
        mvc.perform(get("/api/v1/acopio/prueba-keycloak").header("Authorization", "Bearer acopiador-token"))
                .andExpect(status().isOk());
    }

    @Test void acopiadorNoPuedeEntrarAMayorista() throws Exception {
        mvc.perform(get("/api/v1/mayorista/prueba-keycloak").header("Authorization", "Bearer acopiador-token"))
                .andExpect(status().isForbidden());
    }

    @Test void cuentaInactivaRecibe401() throws Exception {
        when(cuentas.obtenerPorDocumento("90000001"))
                .thenReturn(new CuentaResumen(1L, "90000001", RolCuenta.G2_ACOPIADOR, null, null, 7L, false));
        mvc.perform(get("/api/v1/acopio/prueba-keycloak").header("Authorization", "Bearer acopiador-token"))
                .andExpect(status().isUnauthorized());
    }

    @Test void loginPropioQuedaCerradoEnPerfilKeycloak() throws Exception {
        mvc.perform(post("/api/v1/seguridad/login").header("Authorization", "Bearer acopiador-token"))
                .andExpect(status().isForbidden());
    }

    @RestController
    static class ProbeController {
        @GetMapping({"/api/v1/acopio/prueba-keycloak", "/api/v1/mayorista/prueba-keycloak"})
        String prueba() { return "ok"; }
    }
}
