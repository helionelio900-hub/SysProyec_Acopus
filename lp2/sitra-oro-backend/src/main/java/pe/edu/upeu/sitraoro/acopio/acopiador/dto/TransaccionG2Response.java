package pe.edu.upeu.sitraoro.acopio.acopiador.dto;

import pe.edu.upeu.sitraoro.acopio.parametros.dto.MineroResumen;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record TransaccionG2Response(
    Long idTransaccionG2,
    MineroResumen minero,
    BigDecimal pesoSinFundirG,
    BigDecimal pesoFundidoNetoG,
    String tipoOro,
    BigDecimal precioAplicadoPen,
    BigDecimal totalPagadoPen,
    LocalDateTime fechaTransaccion,
    Long idRecepcionMayorista,
    Long idLiquidacionG1,
    boolean anulada
) {
    public TransaccionG2Response(Long idTransaccionG2, MineroResumen minero,
                                 BigDecimal pesoSinFundirG, BigDecimal pesoFundidoNetoG,
                                 String tipoOro, BigDecimal precioAplicadoPen,
                                 BigDecimal totalPagadoPen, LocalDateTime fechaTransaccion,
                                 Long idRecepcionMayorista, Long idLiquidacionG1) {
        this(idTransaccionG2, minero, pesoSinFundirG, pesoFundidoNetoG, tipoOro,
                precioAplicadoPen, totalPagadoPen, fechaTransaccion,
                idRecepcionMayorista, idLiquidacionG1, false);
    }
}
