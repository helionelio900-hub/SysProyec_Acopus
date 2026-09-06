package pe.edu.upeu.sitraoro.acopio.mayorista.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "DETALLE_LIQUIDACIONES_G1")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DetalleLiquidacionG1 {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_DETALLE_LIQUIDACION")
    private Long idDetalleLiquidacion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_LIQUIDACION_G1", nullable = false)
    private LiquidacionG1 liquidacionG1;

    @Column(name = "TIPO_ORO", nullable = false, length = 10)
    private String tipoOro; // "ROJO" o "VERDE"

    @Column(name = "PESO_FUNDIDO_G", nullable = false, precision = 10, scale = 3)
    private BigDecimal pesoFundidoG;

    @Column(name = "PRECIO_GRAMO_PEN", nullable = false, precision = 10, scale = 2)
    private BigDecimal precioGramoPen;

    @Column(name = "SUBTOTAL_PEN", nullable = false, precision = 12, scale = 2)
    private BigDecimal subtotalPen;
}
