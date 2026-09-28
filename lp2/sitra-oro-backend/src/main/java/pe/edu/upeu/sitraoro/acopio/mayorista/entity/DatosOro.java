package pe.edu.upeu.sitraoro.acopio.mayorista.entity;

import jakarta.persistence.Embeddable;
import lombok.*;

import java.math.BigDecimal;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DatosOro {
    private BigDecimal pesoSinFundirG;
    private BigDecimal pesoFundidoG;
    private String onza;
    private String dolar;
    private String exportacion;
    private String pagoMaterial;
}
