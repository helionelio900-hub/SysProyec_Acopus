package pe.edu.upeu.sitraoro.acopio.parametros.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record MineroRequest(
    @NotBlank(message = "El documento de identidad es obligatorio")
    @Size(min = 8, max = 15, message = "El documento de identidad debe tener entre 8 y 15 caracteres")
    String documentoIdentidad,

    @NotBlank(message = "El nombre y apellidos son obligatorios")
    @Size(max = 150, message = "El nombre no puede superar los 150 caracteres")
    String nombresApellidos,

    @Size(max = 20, message = "El teléfono no puede superar los 20 caracteres")
    String telefono,

    @Size(max = 100, message = "La zona de procedencia no puede superar los 100 caracteres")
    String zonaProcedencia
) {}
