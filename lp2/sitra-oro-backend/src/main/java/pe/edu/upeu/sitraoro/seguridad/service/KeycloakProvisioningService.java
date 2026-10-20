package pe.edu.upeu.sitraoro.seguridad.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import pe.edu.upeu.sitraoro.seguridad.entity.RolCuenta;

import java.net.URI;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class KeycloakProvisioningService {

    @Value("${sitra.keycloak.server-url:http://localhost:38081}")
    private String serverUrl;

    @Value("${sitra.keycloak.realm:Sitra_oro}")
    private String realm;

    @Value("${sitra.keycloak.admin-username:admin}")
    private String adminUsername;

    @Value("${sitra.keycloak.admin-password:sitraAdminDev2026}")
    private String adminPassword;

    private final RestClient restClient = RestClient.create();

    public void provisionarUsuario(String documento, String clave, RolCuenta rol, String nombreCompleto) {
        try {
            String adminToken = obtenerTokenAdmin();
            if (adminToken == null) {
                log.warn("[Keycloak] No se pudo obtener token admin, se omite aprovisionamiento para DNI {}", documento);
                return;
            }

            String userId = crearOActualizarUsuario(adminToken, documento, clave, nombreCompleto);
            if (userId != null) {
                asignarRol(adminToken, userId, rol);
                log.info("[Keycloak] Usuario {} aprovisionado exitosamente con rol {}", documento, rol);
            }
        } catch (Exception ex) {
            log.warn("[Keycloak] Error al aprovisionar usuario {} en Keycloak: {}", documento, ex.getMessage());
        }
    }

    private String obtenerTokenAdmin() {
        try {
            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("grant_type", "password");
            body.add("client_id", "admin-cli");
            body.add("username", adminUsername);
            body.add("password", adminPassword);

            Map<?, ?> resp = restClient.post()
                    .uri(serverUrl + "/realms/master/protocol/openid-connect/token")
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body(body)
                    .retrieve()
                    .body(Map.class);

            return resp != null ? (String) resp.get("access_token") : null;
        } catch (Exception ex) {
            log.debug("[Keycloak] Servidor Keycloak no disponible en {}: {}", serverUrl, ex.getMessage());
            return null;
        }
    }

    private String crearOActualizarUsuario(String token, String documento, String clave, String nombreCompleto) {
        List<?> existentes = restClient.get()
                .uri(serverUrl + "/admin/realms/" + realm + "/users?username=" + documento)
                .header("Authorization", "Bearer " + token)
                .retrieve()
                .body(List.class);

        if (existentes != null && !existentes.isEmpty()) {
            Map<?, ?> u = (Map<?, ?>) existentes.get(0);
            return (String) u.get("id");
        }

        String primerNombre = "Acopiador";
        String apellido = documento;
        if (nombreCompleto != null && !nombreCompleto.isBlank()) {
            String[] partes = nombreCompleto.trim().split("\\s+", 2);
            primerNombre = partes[0];
            apellido = partes.length > 1 ? partes[1] : documento;
        }

        Map<String, Object> payload = Map.of(
                "username", documento,
                "enabled", true,
                "firstName", primerNombre,
                "lastName", apellido,
                "email", documento + "@sitraoro.pe",
                "emailVerified", true,
                "attributes", Map.of("documentoIdentidad", List.of(documento)),
                "credentials", List.of(Map.of(
                        "type", "password",
                        "value", clave,
                        "temporary", false
                ))
        );

        ResponseEntity<Void> response = restClient.post()
                .uri(serverUrl + "/admin/realms/" + realm + "/users")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .body(payload)
                .retrieve()
                .toBodilessEntity();

        URI location = response.getHeaders().getLocation();
        if (location != null) {
            String path = location.getPath();
            return path.substring(path.lastIndexOf('/') + 1);
        }

        List<?> buscado = restClient.get()
                .uri(serverUrl + "/admin/realms/" + realm + "/users?username=" + documento)
                .header("Authorization", "Bearer " + token)
                .retrieve()
                .body(List.class);
        if (buscado != null && !buscado.isEmpty()) {
            Map<?, ?> u = (Map<?, ?>) buscado.get(0);
            return (String) u.get("id");
        }
        return null;
    }

    private void asignarRol(String token, String userId, RolCuenta rol) {
        String roleName = switch (rol) {
            case G2_ACOPIADOR -> "acopiador";
            case G1_MAYORISTA -> "Mayorista";
            case MINERO -> "Minero";
        };

        try {
            Map<?, ?> roleRepresentation = restClient.get()
                    .uri(serverUrl + "/admin/realms/" + realm + "/roles/" + roleName)
                    .header("Authorization", "Bearer " + token)
                    .retrieve()
                    .body(Map.class);

            if (roleRepresentation != null) {
                restClient.post()
                        .uri(serverUrl + "/admin/realms/" + realm + "/users/" + userId + "/role-mappings/realm")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(List.of(roleRepresentation))
                        .retrieve()
                        .toBodilessEntity();
            }
        } catch (Exception ex) {
            log.warn("[Keycloak] No se pudo mapear rol {}: {}", roleName, ex.getMessage());
        }
    }
}
