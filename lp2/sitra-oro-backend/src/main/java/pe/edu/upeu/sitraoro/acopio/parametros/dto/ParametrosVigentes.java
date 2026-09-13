package pe.edu.upeu.sitraoro.acopio.parametros.dto;

import java.math.BigDecimal;

public record ParametrosVigentes(
        BigDecimal precioDiarioGramoPen,
        BigDecimal porcentajeMermaEst
) {
}
