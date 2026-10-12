package pe.edu.upeu.sitraoro.acopio.acopiador.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record PartidaCompraRequest(
    @NotBlank @Pattern(regexp = "ROJO|VERDE") String tipoOro,
    @NotNull @Positive @Digits(integer = 7, fraction = 3) BigDecimal pesoSinFundirG,
    @NotNull @Positive @Digits(integer = 7, fraction = 3) BigDecimal pesoFundidoNetoG,
    @Positive @Digits(integer = 8, fraction = 2) BigDecimal precioAplicadoPen
) {}
