package pe.edu.upeu.sitraoro.acopio.mayorista.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record AdelantoResponse(
        Long idAdelanto,
        Long idCentroAcopio,
        String nombreCentro,
        LocalDate fecha,
        String moneda,
        BigDecimal monto,
        BigDecimal tipoCambio,
        BigDecimal montoPen,
        String observacion,
        String estado,
        Long idRecepcion
) {
    /** Saldo de adelantos pendientes (aún no descontados) de un centro o de toda la red. */
    public record Saldo(Long idCentroAcopio, long cantidadPendientes, BigDecimal saldoPen,
                        BigDecimal saldoUsd, List<AdelantoResponse> pendientes) {}
}
