package pe.edu.upeu.sitraoro.acopio.acopiador.dto;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Contratos de la caja del acopiador. El acopiador trabaja solo en soles: la moneda siempre es PEN
 * (se conserva el campo para usar la misma pantalla que la caja del mayorista).
 */
public final class CajaAcopioDtos {
    private CajaAcopioDtos() {}

    public record MovimientoManualRequest(
            @NotBlank @Pattern(regexp = "INGRESO|EGRESO", message = "El tipo debe ser INGRESO o EGRESO") String tipo,
            @NotBlank @Pattern(regexp = "PEN", message = "La caja del acopiador es solo en soles") String moneda,
            @NotNull @DecimalMin(value = "0", inclusive = false, message = "El monto debe ser mayor que cero")
            @Digits(integer = 14, fraction = 2) BigDecimal monto,
            @NotBlank(message = "Escribe el concepto del movimiento") @Size(max = 200) String concepto,
            @PastOrPresent(message = "La fecha no puede ser futura") LocalDate fecha,
            boolean saldoInicial
    ) {}

    /** Lo que pagó el mayorista al acopiador, en soles. */
    public record IngresoMayoristaRequest(
            @NotNull(message = "Ingresa cuánto te pagó el mayorista en soles")
            @DecimalMin(value = "0", inclusive = false, message = "El monto debe ser mayor que cero")
            @Digits(integer = 14, fraction = 2) BigDecimal montoPen,
            @Size(max = 200) String concepto,
            @PastOrPresent(message = "La fecha no puede ser futura") LocalDate fecha
    ) {}

    public record MovimientoResponse(Long idMovimiento, LocalDate fecha, String moneda, String tipo, String origen,
                                     BigDecimal monto, String concepto, Long idReferencia, boolean anulado,
                                     boolean anulable) {}

    public record Totales(BigDecimal ingresos, BigDecimal egresos) {}

    public record ResumenCaja(BigDecimal saldoPen, BigDecimal saldoUsd, Totales mesPen, Totales mesUsd,
                              List<MovimientoResponse> ultimos) {}
}
