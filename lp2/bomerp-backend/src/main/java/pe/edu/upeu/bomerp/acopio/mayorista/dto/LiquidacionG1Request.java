package pe.edu.upeu.bomerp.acopio.mayorista.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

public record LiquidacionG1Request(
    @NotBlank(message = "El nombre del acopiador G2 es obligatorio")
    String nombreAcopiadorG2,

    @NotNull(message = "El peso total fundido es obligatorio")
    @Positive(message = "El peso debe ser mayor a cero")
    BigDecimal pesoTotalFundidoG,

    @NotBlank(message = "El tipo de oro es obligatorio (ROJO o VERDE)")
    String tipoOro,

    @NotNull(message = "La cotización de la onza en USD es obligatoria")
    @Positive(message = "La cotización de la onza debe ser mayor a cero")
    BigDecimal cotizacionOnzaUsd,

    @NotNull(message = "El tipo de cambio del dólar es obligatorio")
    @Positive(message = "El tipo de cambio debe ser mayor a cero")
    BigDecimal tipoCambioUsdPen
) {}
