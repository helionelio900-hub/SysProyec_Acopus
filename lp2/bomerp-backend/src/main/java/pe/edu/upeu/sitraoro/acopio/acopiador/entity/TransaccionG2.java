package pe.edu.upeu.sitraoro.acopio.acopiador.entity;

import jakarta.persistence.*;
import lombok.*;
import pe.edu.upeu.sitraoro.acopio.parametros.entity.Minero;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "TRANSACCIONES_G2", schema = "BOM_ACOPIO")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransaccionG2 {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_TRANSACCION_G2")
    private Long idTransaccionG2;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_MINERO", nullable = false)
    private Minero minero;

    @Column(name = "PESO_SIN_FUNDIR_G", nullable = false, precision = 10, scale = 3)
    private BigDecimal pesoSinFundirG;

    @Column(name = "PESO_FUNDIDO_NETO_G", nullable = false, precision = 10, scale = 3)
    private BigDecimal pesoFundidoNetoG;

    @Column(name = "TIPO_ORO", nullable = false, length = 10)
    private String tipoOro; // "ROJO" o "VERDE"

    @Column(name = "PRECIO_APLICADO_PEN", nullable = false, precision = 10, scale = 2)
    private BigDecimal precioAplicadoPen;

    @Column(name = "TOTAL_PAGADO_PEN", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalPagadoPen;

    @Column(name = "FECHA_TRANSACCION", nullable = false, updatable = false)
    private LocalDateTime fechaTransaccion;

    @Column(name = "ID_LIQUIDACION_G1")
    private Long idLiquidacionG1;

    @PrePersist
    public void prePersist() {
        if (fechaTransaccion == null) {
            fechaTransaccion = LocalDateTime.now();
        }
    }
}
