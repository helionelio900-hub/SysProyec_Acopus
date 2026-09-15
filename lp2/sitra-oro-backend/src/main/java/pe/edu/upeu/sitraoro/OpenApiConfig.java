package pe.edu.upeu.sitraoro;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.tags.Tag;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    OpenAPI sitraOroOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("SITRA-ORO API")
                        .version("v1")
                        .description("SITRA-ORO - Sistema de Información, Trazabilidad y Liquidación en Acopio de Oro"))
                .tags(List.of(
                        new Tag()
                                .name("Módulo 2: Cotizador")
                                .description("Consulta estimativa pública para el minero antes del acopio presencial"),
                        new Tag()
                                .name("Módulo 3: Acopio G2")
                                .description("Registro de compras, fundición real y acumulados separados por color"),
                        new Tag()
                                .name("Módulo 4: Mayorista G1")
                                .description("Cierre semanal cabecera-detalle y liquidación del stock pendiente"),
                        new Tag()
                                .name("Módulo 5: Parámetros y Dashboard")
                                .description("Catálogo de mineros y reporte consolidado de la operación")
                ));
    }
}
