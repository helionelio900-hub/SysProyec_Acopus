package pe.edu.upeu.sitraoro.acopio.acopiador.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
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

    @NotBlank(message = "El tipo de oro es obligatorio (ROJO o VERDE)")
    @Pattern(regexp = "(?i)ROJO|VERDE", message = "El tipo de oro debe ser ROJO o VERDE")
    String tipoOro,

    @Positive(message = "El precio aplicado debe ser mayor a cero")
    BigDecimal precioAplicadoPen
) {
    @AssertTrue(message = "El peso fundido no puede superar el peso sin fundir")
    public boolean isPesoFundidoValido() {
        return pesoSinFundirG == null || pesoFundidoNetoG == null
                || pesoFundidoNetoG.compareTo(pesoSinFundirG) <= 0;
    }
}
