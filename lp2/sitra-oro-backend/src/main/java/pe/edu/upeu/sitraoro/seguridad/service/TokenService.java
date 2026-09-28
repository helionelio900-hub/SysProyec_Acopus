package pe.edu.upeu.sitraoro.seguridad.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;
import pe.edu.upeu.sitraoro.seguridad.dto.TokenResponse;
import pe.edu.upeu.sitraoro.seguridad.entity.RolCuenta;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Service
@RequiredArgsConstructor
public class TokenService {

    private static final long DURACION_MINUTOS = 30;
    private final JwtEncoder jwtEncoder;

    public TokenResponse emitir(CuentaResumen cuenta) {
        Instant ahora = Instant.now();
        Instant vence = ahora.plus(DURACION_MINUTOS, ChronoUnit.MINUTES);
        JwtClaimsSet.Builder claimsBuilder = JwtClaimsSet.builder()
                .issuer("sitra-oro")
                .issuedAt(ahora)
                .expiresAt(vence)
                .subject(cuenta.documentoIdentidad())
                .claim("roles", java.util.List.of(cuenta.rol().name()))
                .claim("accountId", cuenta.idCuenta());
        if (cuenta.idCentroAcopioAsignado() != null) {
            claimsBuilder.claim("idCentroAcopio", cuenta.idCentroAcopioAsignado());
        }
        JwtClaimsSet claims = claimsBuilder.build();
        String token = jwtEncoder.encode(JwtEncoderParameters.from(
                org.springframework.security.oauth2.jwt.JwsHeader.with(MacAlgorithm.HS256).build(), claims)).getTokenValue();
        return new TokenResponse(token, "Bearer", DURACION_MINUTOS * 60);
    }
}
