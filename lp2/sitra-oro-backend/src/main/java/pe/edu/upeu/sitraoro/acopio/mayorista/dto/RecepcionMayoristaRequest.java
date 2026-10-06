package pe.edu.upeu.sitraoro.acopio.mayorista.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record RecepcionMayoristaRequest(
        @NotNull LocalDate fecha,
        @NotNull @Positive Long idCentroAcopio,
        @NotNull @Valid FilaOro rojo,
        @NotNull @Valid FilaOro verde,
        @Size(max = 100) String descuento,
        @Size(max = 100) String total,
        @NotNull @Size(max = 200) List<@NotNull @Positive Long> idsComprasAcopiador
) {
    public record FilaOro(
            @DecimalMin("0.0") @Digits(integer = 7, fraction = 3) BigDecimal pesoSinFundirG,
            @DecimalMin("0.0") @Digits(integer = 7, fraction = 3) BigDecimal pesoFundidoG,
            @Size(max = 80) String onza,
            @Size(max = 80) String dolar,
            @Size(max = 80) String exportacion,
            @Size(max = 80) String pagoMaterial
    ) {}
}
