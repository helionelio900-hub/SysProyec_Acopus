package pe.edu.upeu.sitraoro.acopio.mayorista.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.util.List;

public record LiquidacionG1Request(
    @NotBlank(message = "El nombre del acopiador G2 es obligatorio")
    String nombreAcopiadorG2,

    @NotNull(message = "La cotización de la onza en USD es obligatoria")
    @Positive(message = "La cotización de la onza debe ser mayor a cero")
    BigDecimal cotizacionOnzaUsd,

    @NotNull(message = "El tipo de cambio del dólar es obligatorio")
    @Positive(message = "El tipo de cambio debe ser mayor a cero")
    BigDecimal tipoCambioUsdPen,

    @NotEmpty(message = "La lista de detalles de liquidación no puede estar vacía")
    @Valid
    List<DetalleLiquidacionRequest> detalles
) {}
