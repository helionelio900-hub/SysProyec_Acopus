package pe.edu.upeu.bomerp.acopio.acopiador.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

public record TransaccionG2Request(
    @NotNull(message = "El ID del minero es obligatorio")
    Long idMinero,

    @NotNull(message = "El peso sin fundir es obligatorio")
    @Positive(message = "El peso sin fundir debe ser mayor a cero")
    BigDecimal pesoSinFundirG,

    @NotNull(message = "El peso fundido neto es obligatorio")
    @Positive(message = "El peso fundido neto debe ser mayor a cero")
    BigDecimal pesoFundidoNetoG,

    @NotNull(message = "El tipo de oro es obligatorio (ROJO o VERDE)")
    String tipoOro,

    BigDecimal precioAplicadoPen
) {}
