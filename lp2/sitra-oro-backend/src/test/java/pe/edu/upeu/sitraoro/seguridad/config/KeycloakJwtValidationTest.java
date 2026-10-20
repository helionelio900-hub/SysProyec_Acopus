package pe.edu.upeu.sitraoro.seguridad.config;

import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.RSASSASigner;
import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import com.sun.net.httpserver.HttpServer;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtDecoders;
import org.springframework.security.oauth2.jwt.JwtException;

import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.security.KeyPairGenerator;
import java.security.interfaces.RSAPublicKey;
import java.security.interfaces.RSAPrivateKey;
import java.time.Instant;
import java.util.Date;

import static org.assertj.core.api.Assertions.*;

/** OIDC/JWKS local y claves temporales: no requiere ni modifica el Keycloak del alumno. */
class KeycloakJwtValidationTest {
    private HttpServer realm;
    private RSAKey clave;
    private JwtDecoder decoder;
    private String issuer;

    @BeforeEach void prepararRealmLocal() throws Exception {
        var generator = KeyPairGenerator.getInstance("RSA");
        generator.initialize(2048);
        var pair = generator.generateKeyPair();
        clave = new RSAKey.Builder((RSAPublicKey) pair.getPublic())
                .privateKey((RSAPrivateKey) pair.getPrivate()).keyID("sitra-test").build();
        realm = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        issuer = "http://127.0.0.1:" + realm.getAddress().getPort() + "/realms/Sitra_oro";
        respuesta("/realms/Sitra_oro/.well-known/openid-configuration",
                "{\"issuer\":\"" + issuer + "\",\"jwks_uri\":\"" + issuer + "/certs\"}");
        respuesta("/realms/Sitra_oro/certs", new JWKSet(clave.toPublicJWK()).toString());
        realm.start();
        decoder = JwtDecoders.fromIssuerLocation(issuer);
    }

    private void respuesta(String path, String body) {
        realm.createContext(path, exchange -> {
            byte[] bytes = body.getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().set("Content-Type", "application/json");
            exchange.sendResponseHeaders(200, bytes.length);
            try (var stream = exchange.getResponseBody()) { stream.write(bytes); }
        });
    }

    @AfterEach void cerrarRealm() { if (realm != null) realm.stop(0); }

    private String token(RSAKey key, String emisor, Instant expira) throws Exception {
        var claims = new JWTClaimsSet.Builder().issuer(emisor).subject("uuid-minero")
                .issueTime(Date.from(Instant.now().minusSeconds(180)))
                .expirationTime(Date.from(expira)).build();
        var jwt = new SignedJWT(new JWSHeader.Builder(JWSAlgorithm.RS256).keyID("sitra-test").build(), claims);
        jwt.sign(new RSASSASigner(key));
        return jwt.serialize();
    }

    @Test void descubreClavesPublicasYValidaTokenRs256() throws Exception {
        assertThat(decoder.decode(token(clave, issuer, Instant.now().plusSeconds(300))).getSubject())
                .isEqualTo("uuid-minero");
    }

    @Test void rechazaEmisorDeOtroRealm() throws Exception {
        String jwt = token(clave, issuer.replace("Sitra_oro", "master"), Instant.now().plusSeconds(300));
        assertThatThrownBy(() -> decoder.decode(jwt)).isInstanceOf(JwtException.class);
    }

    @Test void rechazaTokenExpirado() throws Exception {
        String jwt = token(clave, issuer, Instant.now().minusSeconds(120));
        assertThatThrownBy(() -> decoder.decode(jwt)).isInstanceOf(JwtException.class);
    }

    @Test void rechazaFirmaQueNoPerteneceAlRealm() throws Exception {
        var generator = KeyPairGenerator.getInstance("RSA");
        generator.initialize(2048);
        var pair = generator.generateKeyPair();
        RSAKey ajena = new RSAKey.Builder((RSAPublicKey) pair.getPublic())
                .privateKey((RSAPrivateKey) pair.getPrivate()).keyID("sitra-test").build();
        String jwt = token(ajena, issuer, Instant.now().plusSeconds(300));
        assertThatThrownBy(() -> decoder.decode(jwt)).isInstanceOf(JwtException.class);
    }
}
