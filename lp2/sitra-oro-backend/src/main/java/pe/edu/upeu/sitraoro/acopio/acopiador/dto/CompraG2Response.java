package pe.edu.upeu.sitraoro.acopio.acopiador.dto;

import pe.edu.upeu.sitraoro.acopio.parametros.dto.MineroResumen;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record CompraG2Response(
    Long idCompraG2, MineroResumen minero, LocalDateTime fechaCompra,
    BigDecimal totalPagadoPen, List<TransaccionG2Response> detalles
) {}
