package pe.edu.upeu.sitraoro.acopio.acopiador.dto;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;

/** Préstamos del acopiador a sus mineros (solo soles). */
public final class PrestamoDtos {
    private PrestamoDtos() {}

    public record PrestamoRequest(
            @NotNull(message = "Elige el minero") @Positive Long idMinero,
            @NotNull @DecimalMin(value = "0", inclusive = false, message = "El monto debe ser mayor que cero")
            @Digits(integer = 12, fraction = 2) BigDecimal montoPen,
            @PastOrPresent(message = "La fecha no puede ser futura") LocalDate fecha,
            @Size(max = 200) String observacion
    ) {}

    public record PrestamoResponse(Long idPrestamo, Long idMinero, String minero, String documentoMinero,
                                   LocalDate fecha, BigDecimal montoPen, String observacion, String estado,
                                   Long idCompraG2) {}
}
