package pe.edu.upeu.sitraoro.acopio.acopiador.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record AjusteCompraRequest(
        @NotBlank String tipo,
        @NotBlank @Size(min = 8, max = 500) String motivo,
        String tipoOroNuevo,
        BigDecimal pesoSinFundirNuevo,
        BigDecimal pesoFundidoNuevo,
        BigDecimal precioNuevo
) {}
