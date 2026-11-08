package pe.edu.upeu.sitraoro.acopio.mayorista.dto;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/** Contratos de la caja del mayorista. */
public final class CajaDtos {
    private CajaDtos() {}

    /** Ingreso o egreso manual (incluye el saldo inicial). */
    public record MovimientoManualRequest(
            @NotBlank @Pattern(regexp = "INGRESO|EGRESO", message = "El tipo debe ser INGRESO o EGRESO") String tipo,
            @NotBlank @Pattern(regexp = "PEN|USD", message = "La moneda debe ser PEN o USD") String moneda,
            @NotNull @DecimalMin(value = "0", inclusive = false, message = "El monto debe ser mayor que cero")
            @Digits(integer = 14, fraction = 2) BigDecimal monto,
            @NotBlank(message = "Escribe el concepto del movimiento") @Size(max = 200) String concepto,
            @PastOrPresent(message = "La fecha no puede ser futura") LocalDate fecha,
            boolean saldoInicial
    ) {}

    /** Lo que pagó el exportador: en dólares, en soles o en ambas monedas. */
    public record IngresoExportadorRequest(
            @DecimalMin(value = "0", inclusive = false) @Digits(integer = 14, fraction = 2) BigDecimal montoUsd,
            @DecimalMin(value = "0", inclusive = false) @Digits(integer = 14, fraction = 2) BigDecimal montoPen,
            @Positive Long idLoteExportacion,
            @Size(max = 200) String concepto,
            @PastOrPresent(message = "La fecha no puede ser futura") LocalDate fecha
    ) {}

    public record MovimientoResponse(Long idMovimiento, LocalDate fecha, String moneda, String tipo, String origen,
                                     BigDecimal monto, String concepto, Long idReferencia, boolean anulado,
                                     boolean anulable) {}

    public record Totales(BigDecimal ingresos, BigDecimal egresos) {}

    public record ResumenCaja(BigDecimal saldoPen, BigDecimal saldoUsd,
                              Totales mesPen, Totales mesUsd,
                              List<MovimientoResponse> ultimos) {}
}
