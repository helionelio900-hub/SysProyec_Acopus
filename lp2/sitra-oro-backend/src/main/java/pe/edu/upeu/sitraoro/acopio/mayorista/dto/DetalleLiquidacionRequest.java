package pe.edu.upeu.sitraoro.acopio.mayorista.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Digits;
import java.math.BigDecimal;

public record DetalleLiquidacionRequest(
    @NotBlank(message = "El tipo de oro es obligatorio (ROJO o VERDE)")
    @Pattern(regexp = "(?i)ROJO|VERDE", message = "El tipo de oro debe ser ROJO o VERDE")
    String tipoOro,

    @NotNull(message = "El peso en gramos es obligatorio")
    @Positive(message = "El peso en gramos debe ser mayor a cero")
    @Digits(integer = 7, fraction = 3)
    BigDecimal pesoFundidoG
) {}
