package pe.edu.upeu.sitraoro.acopio.mayorista.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

/** Asociación lote recibido-ley con los datos comerciales propios de esa operación. */
@Entity
@Table(name = "RECEPCION_LEYES", uniqueConstraints = @UniqueConstraint(name = "UQ_RECEPCION_LEY", columnNames = {"ID_RECEPCION", "ID_LEY"}))
@Getter @Setter @NoArgsConstructor
public class DetalleRecepcionLey {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_DETALLE") private Long idDetalle;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ID_RECEPCION", nullable = false) private RecepcionMayorista recepcion;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ID_LEY", nullable = false) private LeyOro ley;
    @Column(name = "ONZA_USD", nullable = false, precision = 14, scale = 4) private BigDecimal onza;
    @Column(name = "PORCENTAJE", nullable = false, precision = 7, scale = 4) private BigDecimal porcentaje;
    @Column(name = "TIPO_CAMBIO", nullable = false, precision = 10, scale = 4) private BigDecimal tipoCambio;
    @Column(name = "PESO_SIN_FUNDIR_G", nullable = false, precision = 10, scale = 3) private BigDecimal pesoSinFundirG;
    @Column(name = "PESO_FUNDIDO_G", nullable = false, precision = 10, scale = 3) private BigDecimal pesoFundidoG;
    @Column(name = "PRECIO_USD", nullable = false, precision = 18, scale = 2) private BigDecimal precioUsd;
    @Column(name = "PRECIO_PEN", nullable = false, precision = 18, scale = 2) private BigDecimal precioPen;
    @Column(name = "TOTAL_PEN", nullable = false, precision = 24, scale = 2) private BigDecimal totalPen;
}
