package pe.edu.upeu.sitraoro.seguridad.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record LoginRequest(
        @NotBlank @Size(max = 15) String documentoIdentidad,
        @NotBlank @Size(max = 64) String clave
) {}
