package pe.edu.upeu.sitraoro.acopio.acopiador.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record AjusteCompraResponse(
        Long idAjuste, Long idTransaccionG2, Long idCentroAcopio, Long idMinero,
        Long idRecepcionMayorista, Long idLiquidacionG1,
        String tipo, String estado, String motivo,
        String tipoOroAnterior, BigDecimal pesoSinFundirAnterior,
        BigDecimal pesoFundidoAnterior, BigDecimal precioAnterior, BigDecimal totalAnterior,
        String tipoOroNuevo, BigDecimal pesoSinFundirNuevo,
        BigDecimal pesoFundidoNuevo, BigDecimal precioNuevo, BigDecimal totalNuevo,
        String solicitadoPor, LocalDateTime fechaSolicitud,
        LocalDateTime fechaDecisionMinero, String decididoPorMinero,
        LocalDateTime fechaDecisionMayorista, String decididoPorMayorista
) {}
