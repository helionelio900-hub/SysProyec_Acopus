package pe.edu.upeu.sitraoro.acopio.acopiador.dto;

import pe.edu.upeu.sitraoro.acopio.parametros.dto.MineroResumen;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record CompraG2Response(
    Long idCompraG2, MineroResumen minero, LocalDateTime fechaCompra,
    /** Valor del material (suma de partidas vigentes). */
    BigDecimal totalPagadoPen, List<TransaccionG2Response> detalles,
    /** Préstamos y descuento manual restados al pagar. */
    BigDecimal descuentoPen, BigDecimal descuentoManualPen,
    /** Lo que efectivamente se entregó al minero. */
    BigDecimal netoPagadoPen, List<Long> idsPrestamos
) {
    /** Compra sin préstamos ni descuentos: el neto es el total del material. */
    public CompraG2Response(Long idCompraG2, MineroResumen minero, LocalDateTime fechaCompra,
                            BigDecimal totalPagadoPen, List<TransaccionG2Response> detalles) {
        this(idCompraG2, minero, fechaCompra, totalPagadoPen, detalles, BigDecimal.ZERO, BigDecimal.ZERO,
                totalPagadoPen, List.of());
    }
}
