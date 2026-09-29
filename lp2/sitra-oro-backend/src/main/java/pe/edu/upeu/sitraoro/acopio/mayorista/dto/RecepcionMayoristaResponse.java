package pe.edu.upeu.sitraoro.acopio.mayorista.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record RecepcionMayoristaResponse(
        Long idRecepcion,
        LocalDate fecha,
        Long idCentroAcopio,
        String nombreAcopiador,
        FilaOro rojo,
        FilaOro verde,
        String descuento,
        String total
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
