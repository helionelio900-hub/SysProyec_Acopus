package pe.edu.upeu.sitraoro.exception;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.Map;

@Schema(name = "ApiErrorResponse", description = "Respuesta uniforme para errores de validación y reglas de negocio")
public record ApiErrorResponse(
        @Schema(example = "87f820db-bcfe-411b-b800-b4a62d4d0666") String traceId,
        @Schema(example = "Bad Request") String error,
        @Schema(example = "Error de validación en los datos enviados") String message,
        @Schema(example = "2026-09-14T09:18:12.123Z") String timestamp,
        @Schema(example = "400") int status,
        @Schema(description = "Errores por campo, cuando corresponda") Map<String, String> campos
) {
}
