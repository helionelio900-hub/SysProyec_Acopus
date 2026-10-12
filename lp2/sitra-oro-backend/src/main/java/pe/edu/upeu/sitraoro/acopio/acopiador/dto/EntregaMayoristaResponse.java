package pe.edu.upeu.sitraoro.acopio.acopiador.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record EntregaMayoristaResponse(
        Long idRecepcion,
        LocalDate fecha,
        Long idCentroAcopio,
        String nombreAcopiador,
        FilaOro rojo,
        FilaOro verde,
        String descuento,
        String total,
        List<Long> idsComprasAcopiador
) {
    public record FilaOro(
            BigDecimal pesoSinFundirG,
            BigDecimal pesoFundidoG,
            String onza,
            String dolar,
            String exportacion,
            String pagoMaterial
    ) {}
}
