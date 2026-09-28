package pe.edu.upeu.sitraoro.acopio.minero.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record RegistroMineroRequest(
        @NotBlank @Size(min = 8, max = 15) String documentoIdentidad,
        @NotBlank @Size(max = 150) String nombresApellidos,
        @NotBlank @Size(max = 20) String telefono,
        @Size(max = 100) String zonaProcedencia,
        @NotBlank @Size(min = 10, max = 64) String clave,
        @NotNull @Positive Long idCentroAcopioPreferido
) {}
