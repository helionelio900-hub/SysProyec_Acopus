package pe.edu.upeu.sitraoro.acopio.minero.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/v1/publico/identidad")
public class ConsultaDniController {
    private final RestClient cliente;
    private final String token;
    private final ConcurrentHashMap<String, Ventana> limites = new ConcurrentHashMap<>();
    private record Ventana(long inicio, int consultas) {}
    public record Resultado(String nombresApellidos) {}

    public ConsultaDniController(@Value("${sitra.identidad.codart-token:}") String token) {
        this.token = token;
        var factory = new org.springframework.http.client.JdkClientHttpRequestFactory(
                java.net.http.HttpClient.newBuilder().connectTimeout(java.time.Duration.ofSeconds(5)).build());
        factory.setReadTimeout(java.time.Duration.ofSeconds(10));
        cliente = RestClient.builder().requestFactory(factory).baseUrl("https://api-codart.cgrt.org").build();
    }

    @GetMapping("/dni/{dni}")
    public Resultado consultar(@PathVariable String dni, jakarta.servlet.http.HttpServletRequest request) {
        if (!dni.matches("\\d{8}")) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ingresa un DNI de 8 dígitos");
        if (token.isBlank()) throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Consulta de DNI no configurada");
        long ahora = System.currentTimeMillis();
        limites.entrySet().removeIf(e -> ahora - e.getValue().inicio() >= 60_000);
        Ventana ventana = limites.compute(request.getRemoteAddr(), (ip, anterior) ->
                anterior == null ? new Ventana(ahora, 1) : new Ventana(anterior.inicio(), anterior.consultas() + 1));
        if (ventana.consultas() > 5) throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "Espera un minuto antes de volver a consultar");
        try {
            Map<?, ?> respuesta = cliente.get().uri("/api/v1/consultas/reniec/dni/{dni}", dni)
                    .headers(h -> { h.setBearerAuth(token); h.setContentType(org.springframework.http.MediaType.APPLICATION_JSON); })
                    .retrieve().body(Map.class);
            if (respuesta == null || !Boolean.TRUE.equals(respuesta.get("success"))) throw new IllegalStateException();
            if (!(respuesta.get("result") instanceof Map<?, ?> datos)) throw new IllegalStateException();
            String nombre = String.join(" ", campo(datos, "first_name"),
                    campo(datos, "apellidoPaterno", "apellido_paterno", "first_last_name"),
                    campo(datos, "apellidoMaterno", "apellido_materno", "second_last_name")).trim().replaceAll("\\s+", " ");
            if (nombre.isBlank()) nombre = campo(datos, "full_name");
            if (nombre.isBlank()) throw new IllegalStateException();
            return new Resultado(nombre);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "No se pudo consultar el DNI. Ingresa tus nombres manualmente");
        }
    }
    private static String campo(Map<?, ?> datos, String... claves) {
        for (String clave : claves) if (datos.get(clave) instanceof String valor && !valor.isBlank()) return valor.trim();
        return "";
    }
}
