package pe.edu.upeu.sitraoro.acopio.mayorista.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Tablero del mayorista. "Ingreso" es el valor del oro que entra al sistema (total de material
 * valorizado por ley) en el día de recepción del lote; "pagado" es el neto a pagar tras adelantos.
 */
public record DashboardMayoristaResponse(
        LocalDate desde,
        LocalDate hasta,
        Dia hoy,
        Totales periodo,
        List<Dia> serieDiaria,
        List<Centro> topCentros,
        List<Moneda> pagosPorMoneda,
        Adelantos adelantos,
        Estados estados
) {
    public record Dia(LocalDate fecha, long operaciones, BigDecimal pesoFundidoG, BigDecimal ingresoPen,
                      BigDecimal ingresoUsd, BigDecimal pagadoPen, BigDecimal adelantosEntregadosPen) {}

    public record Totales(long operaciones, BigDecimal pesoFundidoG, BigDecimal ingresoPen, BigDecimal ingresoUsd,
                          BigDecimal pagadoPen, BigDecimal ticketPromedioPen, BigDecimal promedioDiarioPen,
                          BigDecimal adelantosEntregadosPen, LocalDate mejorDia, BigDecimal mejorDiaIngresoPen) {}

    public record Centro(Long idCentroAcopio, String nombre, long operaciones, BigDecimal pesoFundidoG,
                         BigDecimal ingresoPen) {}

    /** monto está expresado en la propia moneda (PEN en soles, USD en dólares). */
    public record Moneda(String moneda, long operaciones, BigDecimal monto) {}

    public record Adelantos(long pendientes, BigDecimal saldoPendientePen, BigDecimal entregadosPeriodoPen,
                            long entregadosPeriodo) {}

    public record Estados(long pendientes, long valorizados, long enLote) {}
}
