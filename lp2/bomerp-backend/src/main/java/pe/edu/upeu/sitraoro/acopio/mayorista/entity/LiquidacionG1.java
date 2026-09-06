package pe.edu.upeu.sitraoro.acopio.mayorista.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "LIQUIDACIONES_G1")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LiquidacionG1 {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_LIQUIDACION_G1")
    private Long idLiquidacionG1;

    @Column(name = "NOMBRE_ACOPIADOR_G2", nullable = false, length = 150)
    private String nombreAcopiadorG2;

    @Enumerated(EnumType.STRING)
    @Column(name = "ESTADO", nullable = false, length = 20)
    @Builder.Default
    private EstadoLiquidacion estado = EstadoLiquidacion.REGISTRADA;

    @Column(name = "PESO_TOTAL_FUNDIDO_G", nullable = false, precision = 10, scale = 3)
    private BigDecimal pesoTotalFundidoG;

    @Column(name = "TIPO_ORO", length = 10)
    private String tipoOro; // "ROJO", "VERDE" o "CONSOLIDADO"

    @Column(name = "COTIZACION_ONZA_USD", nullable = false, precision = 10, scale = 2)
    private BigDecimal cotizacionOnzaUsd;

    @Column(name = "TIPO_CAMBIO_USD_PEN", nullable = false, precision = 6, scale = 4)
    private BigDecimal tipoCambioUsdPen;

    @Column(name = "PRECIO_RESULTANTE_GRAMO", precision = 10, scale = 2)
    private BigDecimal precioResultanteGramo;

    @Column(name = "TOTAL_PAGADO_G2_PEN", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalPagadoG2Pen;

    @Column(name = "FECHA_LIQUIDACION", nullable = false, updatable = false)
    private LocalDateTime fechaLiquidacion;

    @OneToMany(mappedBy = "liquidacionG1", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<DetalleLiquidacionG1> detalles = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        if (fechaLiquidacion == null) {
            fechaLiquidacion = LocalDateTime.now();
        }
        if (estado == null) {
            estado = EstadoLiquidacion.REGISTRADA;
        }
    }
}
