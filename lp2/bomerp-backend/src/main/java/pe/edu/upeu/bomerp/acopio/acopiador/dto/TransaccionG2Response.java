package pe.edu.upeu.bomerp.acopio.acopiador.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record TransaccionG2Response(
    Long idTransaccionG2,
    Long idMinero,
    BigDecimal pesoSinFundirG,
    BigDecimal pesoFundidoNetoG,
    String tipoOro,
    BigDecimal precioAplicadoPen,
    BigDecimal totalPagadoPen,
    LocalDateTime fechaTransaccion
) {}
