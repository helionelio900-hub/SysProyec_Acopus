package pe.edu.upeu.sitraoro;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * CORS para el futuro frontend (S7). El origen permitido se configura por
 * ambiente en application-*.yml, no fijo aqui. Nunca "*": es incompatible
 * con credenciales cuando entre JWT (S10).
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Value("${sitraoro.cors.allowed-origin:http://localhost:4200}")
    private String allowedOrigin;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(allowedOrigin)
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE")
                .allowedHeaders("*");
    }
}
