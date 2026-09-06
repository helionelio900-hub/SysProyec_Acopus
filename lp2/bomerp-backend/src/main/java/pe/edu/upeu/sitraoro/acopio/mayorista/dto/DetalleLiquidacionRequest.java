package pe.edu.upeu.sitraoro.acopio.mayorista.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

public record DetalleLiquidacionRequest(
    @NotBlank(message = "El tipo de oro es obligatorio (ROJO o VERDE)")
    String tipoOro,

    @NotNull(message = "El peso en gramos es obligatorio")
    @Positive(message = "El peso en gramos debe ser mayor a cero")
    BigDecimal pesoFundidoG
) {}
