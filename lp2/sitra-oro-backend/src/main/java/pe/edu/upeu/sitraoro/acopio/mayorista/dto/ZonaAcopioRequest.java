package pe.edu.upeu.sitraoro.acopio.mayorista.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ZonaAcopioRequest(@NotBlank @Size(max = 100) String nombre) {}
