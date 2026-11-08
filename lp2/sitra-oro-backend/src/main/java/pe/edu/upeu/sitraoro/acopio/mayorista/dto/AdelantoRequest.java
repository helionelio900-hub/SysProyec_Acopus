package pe.edu.upeu.sitraoro.acopio.mayorista.dto;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;

/** Registro de un adelanto entregado a un centro de acopio. tipoCambio es obligatorio cuando moneda = USD. */
public record AdelantoRequest(
        @NotNull(message = "El centro de acopio es obligatorio") @Positive Long idCentroAcopio,
        @PastOrPresent(message = "La fecha del adelanto no puede ser futura") LocalDate fecha,
        @NotBlank @Pattern(regexp = "PEN|USD", message = "La moneda debe ser PEN o USD") String moneda,
        @NotNull @DecimalMin(value = "0", inclusive = false, message = "El monto debe ser mayor que cero")
        @Digits(integer = 12, fraction = 2) BigDecimal monto,
        @DecimalMin(value = "0", inclusive = false) @Digits(integer = 6, fraction = 4) BigDecimal tipoCambio,
        @Size(max = 200) String observacion
) {}
