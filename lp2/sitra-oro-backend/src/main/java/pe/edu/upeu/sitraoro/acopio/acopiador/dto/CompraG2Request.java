package pe.edu.upeu.sitraoro.acopio.acopiador.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.List;

public record CompraG2Request(
    @NotNull @Positive Long idMinero,
    @NotEmpty @Size(max = 200) List<@NotNull @Valid PartidaCompraRequest> detalles,
    @Positive Long idSolicitud,
    /** Préstamos pendientes del minero que se descuentan en esta compra. */
    @Size(max = 50) List<@NotNull @Positive Long> idsPrestamos,
    /** Otro descuento en soles (por ejemplo, una deuda no registrada como préstamo). */
    @DecimalMin("0") @Digits(integer = 12, fraction = 2) BigDecimal descuentoManualPen
) {
    public CompraG2Request(Long idMinero, List<PartidaCompraRequest> detalles) {
        this(idMinero, detalles, null, null, null);
    }

    public CompraG2Request(Long idMinero, List<PartidaCompraRequest> detalles, Long idSolicitud) {
        this(idMinero, detalles, idSolicitud, null, null);
    }
}
