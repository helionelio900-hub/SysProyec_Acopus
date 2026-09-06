package pe.edu.upeu.sitraoro.acopio.parametros.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "PARAMETROS_SISTEMA", schema = "BOM_ACOPIO")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ParametrosSistema {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_PARAMETRO")
    private Long idParametro;

    @Column(name = "FECHA", nullable = false)
    private LocalDate fecha;

    @Column(name = "PRECIO_DIARIO_GRAMO_PEN", nullable = false, precision = 10, scale = 2)
    private BigDecimal precioDiarioGramoPen;

    @Column(name = "PORCENTAJE_MERMA_EST", nullable = false, precision = 5, scale = 2)
    private BigDecimal porcentajeMermaEst;

    @Column(name = "COTIZACION_ONZA_USD", precision = 10, scale = 2)
    private BigDecimal cotizacionOnzaUsd;

    @Column(name = "TIPO_CAMBIO_USD_PEN", precision = 6, scale = 4)
    private BigDecimal tipoCambioUsdPen;

    @Column(name = "ESTADO", length = 10)
    private String estado;
}
