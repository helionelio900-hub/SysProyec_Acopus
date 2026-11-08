package pe.edu.upeu.sitraoro.acopio.mayorista.dto;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.List;

/**
 * Valorización de un lote recibido.
 * monedaPago: PEN (por defecto) o USD. tipoCambioPago: opcional; si se paga en USD y no se envía,
 * se usa el tipo de cambio de la primera partida. idsAdelantos: adelantos pendientes del centro
 * que se descuentan en este pago (el campo adelanto debe cubrir al menos su suma en soles).
 */
public record RecepcionLeyRequest(
        @NotNull @PositiveOrZero Long revision,
        @NotNull @DecimalMin("0") @Digits(integer = 18, fraction = 2) BigDecimal adelanto,
        @NotNull @Size(min = 1, max = 200) List<@NotNull @Valid Partida> detalles,
        @Pattern(regexp = "PEN|USD", message = "La moneda de pago debe ser PEN o USD") String monedaPago,
        @DecimalMin(value = "0", inclusive = false) @Digits(integer = 6, fraction = 4) BigDecimal tipoCambioPago,
        @Size(max = 50) List<@NotNull @Positive Long> idsAdelantos) {

    public RecepcionLeyRequest(Long revision, BigDecimal adelanto, List<Partida> detalles) {
        this(revision, adelanto, detalles, null, null, null);
    }

    /** Misma valorización con otra revisión (usada por compras directas y análisis acumulado). */
    public RecepcionLeyRequest conRevision(long nuevaRevision) {
        return new RecepcionLeyRequest(nuevaRevision, adelanto, detalles, monedaPago, tipoCambioPago, idsAdelantos);
    }

    public String monedaEfectiva() {
        return monedaPago == null || monedaPago.isBlank() ? "PEN" : monedaPago;
    }

    public List<Long> adelantosSeleccionados() {
        return idsAdelantos == null ? List.of() : idsAdelantos;
    }

    public record Partida(
            @NotNull @DecimalMin(value = "0", inclusive = false) @Digits(integer = 10, fraction = 4) BigDecimal onza,
            @NotNull @DecimalMin(value = "0", inclusive = false) @DecimalMax("100") @Digits(integer = 3, fraction = 4) BigDecimal ley,
            @NotNull @DecimalMin("0") @DecimalMax(value = "100", inclusive = false) @Digits(integer = 3, fraction = 4) BigDecimal porcentaje,
            @NotNull @DecimalMin(value = "0", inclusive = false) @Digits(integer = 6, fraction = 4) BigDecimal tipoCambio,
            @NotNull @DecimalMin(value = "0", inclusive = false) @Digits(integer = 7, fraction = 3) BigDecimal pesoSinFundirG,
            @NotNull @DecimalMin(value = "0", inclusive = false) @Digits(integer = 7, fraction = 3) BigDecimal pesoFundidoG) {}
}
