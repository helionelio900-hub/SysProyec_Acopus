package pe.edu.upeu.sitraoro.seguridad.config;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.ApplicationContext;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.upeu.sitraoro.acopio.parametros.entity.Minero;
import pe.edu.upeu.sitraoro.acopio.parametros.repository.MineroRepository;
import pe.edu.upeu.sitraoro.seguridad.controller.AuthController;
import pe.edu.upeu.sitraoro.seguridad.entity.RolCuenta;
import pe.edu.upeu.sitraoro.seguridad.service.CuentaAccesoService;
import pe.edu.upeu.sitraoro.seguridad.service.TokenService;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("keycloak")
class KeycloakProfileIntegrationTest {
    @Autowired ApplicationContext context;
    @Autowired MockMvc mvc;
    @Autowired MineroRepository mineros;
    @Autowired CuentaAccesoService cuentas;
    @MockitoBean JwtDecoder decoder;

    @Test void perfilNoCargaFirmanteNiLoginLocal() {
        assertThat(context.getBeansOfType(JwtEncoder.class)).isEmpty();
        assertThat(context.getBeansOfType(SecretKey.class)).isEmpty();
        assertThat(context.getBeansOfType(TokenService.class)).isEmpty();
        assertThat(context.getBeansOfType(AuthController.class)).isEmpty();
    }

    @Test @Transactional void uuidDeKeycloakConservaElPerfilExistentePorDni() throws Exception {
        Minero minero = mineros.saveAndFlush(Minero.builder().documentoIdentidad("93000001")
                .nombresApellidos("Minero de prueba Keycloak").build());
        cuentas.crearCuenta("93000001", "ClavePruebaKeycloak2026!", RolCuenta.MINERO, minero.getIdMinero(), null, true);
        Jwt jwt = Jwt.withTokenValue("perfil-test").header("alg", "RS256")
                .issuer("http://localhost:38081/realms/Sitra_oro").subject("uuid-keycloak-distinto-del-dni")
                .issuedAt(Instant.now()).expiresAt(Instant.now().plusSeconds(300))
                .claim("documentoIdentidad", "93000001")
                .claim("realm_access", Map.of("roles", List.of("Minero", "offline_access"))).build();
        when(decoder.decode("perfil-test")).thenReturn(jwt);
        mvc.perform(get("/api/v1/minero/perfil").header("Authorization", "Bearer perfil-test"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.documentoIdentidad").value("93000001"))
                .andExpect(jsonPath("$.idMinero").value(minero.getIdMinero()));
    }
}
