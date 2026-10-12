package pe.edu.upeu.sitraoro.acopio.mayorista.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.List;

public record AnalisisAcumuladoRequest(
        @NotNull @Size(min = 1, max = 200) List<@NotNull @Valid Origen> entregas,
        @NotNull @Valid RecepcionLeyRequest analisis) {
    public record Origen(@NotNull @Positive Long id, @NotNull @PositiveOrZero Long revision) {}
}
