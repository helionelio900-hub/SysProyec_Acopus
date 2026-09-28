package pe.edu.upeu.sitraoro.acopio.mayorista.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CentroAcopioRequest(
        @NotBlank @Size(max = 120) String nombre,
        @NotBlank @Size(max = 100) String zona,
        @NotBlank @Size(max = 200) String direccion,
        @Size(max = 20) String telefono,
        @NotBlank @Size(min = 8, max = 15) String documentoAcopiador,
        @NotBlank @Size(min = 10, max = 64) String claveInicialAcopiador
) {}
