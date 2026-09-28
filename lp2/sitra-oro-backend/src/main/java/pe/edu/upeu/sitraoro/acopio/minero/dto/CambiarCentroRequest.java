package pe.edu.upeu.sitraoro.acopio.minero.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record CambiarCentroRequest(@NotNull @Positive Long idCentroAcopio) {}
