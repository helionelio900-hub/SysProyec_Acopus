package pe.edu.upeu.sitraoro.acopio.mayorista.dto;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.List;

public record RecepcionLeyRequest(
        @NotNull @PositiveOrZero Long revision,
        @NotNull @DecimalMin("0") @Digits(integer = 18, fraction = 2) BigDecimal adelanto,
        @NotNull @Size(min = 1, max = 200) List<@NotNull @Valid Partida> detalles) {
    public record Partida(
            @NotNull @DecimalMin(value = "0", inclusive = false) @Digits(integer = 10, fraction = 4) BigDecimal onza,
            @NotNull @DecimalMin(value = "0", inclusive = false) @DecimalMax("100") @Digits(integer = 3, fraction = 4) BigDecimal ley,
            @NotNull @DecimalMin("0") @DecimalMax(value = "100", inclusive = false) @Digits(integer = 3, fraction = 4) BigDecimal porcentaje,
            @NotNull @DecimalMin(value = "0", inclusive = false) @Digits(integer = 6, fraction = 4) BigDecimal tipoCambio,
            @NotNull @DecimalMin(value = "0", inclusive = false) @Digits(integer = 7, fraction = 3) BigDecimal pesoSinFundirG,
            @NotNull @DecimalMin(value = "0", inclusive = false) @Digits(integer = 7, fraction = 3) BigDecimal pesoFundidoG) {}
}
