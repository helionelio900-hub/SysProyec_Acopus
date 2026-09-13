package pe.edu.upeu.sitraoro.acopio.mayorista.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Digits;
import java.math.BigDecimal;
import java.util.List;

public record LiquidacionG1Request(
    @NotBlank(message = "El nombre del acopiador G2 es obligatorio")
    @Size(max = 150)
    String nombreAcopiadorG2,

    @NotNull(message = "La cotización de la onza en USD es obligatoria")
    @Positive(message = "La cotización de la onza debe ser mayor a cero")
    @Digits(integer = 8, fraction = 2)
    BigDecimal cotizacionOnzaUsd,

    @NotNull(message = "El tipo de cambio del dólar es obligatorio")
    @Positive(message = "El tipo de cambio debe ser mayor a cero")
    @Digits(integer = 2, fraction = 4)
    BigDecimal tipoCambioUsdPen,

    @NotEmpty(message = "La lista de detalles de liquidación no puede estar vacía")
    @Valid
    @Size(max = 2, message = "El cierre admite un detalle por color: ROJO y VERDE")
    List<@NotNull @Valid DetalleLiquidacionRequest> detalles
) {}
