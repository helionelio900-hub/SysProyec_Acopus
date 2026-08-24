package pe.edu.upeu.bomerp.acopio.acopiador.dto;

import pe.edu.upeu.bomerp.acopio.parametros.dto.MineroResumen;
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
    LocalDateTime fechaTransaccion
) {}
