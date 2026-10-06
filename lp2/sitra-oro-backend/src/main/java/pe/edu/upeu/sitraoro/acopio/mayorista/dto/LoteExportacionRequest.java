package pe.edu.upeu.sitraoro.acopio.mayorista.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record LoteExportacionRequest(
        @NotNull LocalDate fecha,
        @NotNull @Size(min = 2, message = "Selecciona al menos dos liquidaciones")
        List<@NotNull @Valid Partida> partidas
) {
    public record Partida(
            @NotNull @Positive Long idLiquidacionG1,
            @NotNull @DecimalMin("0.0") @Digits(integer = 6, fraction = 6)
            BigDecimal lecturaDecimal
    ) {}
}
