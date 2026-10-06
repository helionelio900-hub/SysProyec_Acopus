package pe.edu.upeu.sitraoro.acopio.mayorista.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "LOTE_EXPORTACION_PARTIDAS", uniqueConstraints =
        @UniqueConstraint(name = "UQ_LOTE_PART_LIQ", columnNames = "ID_LIQUIDACION_G1"))
@Getter
@Setter
public class PartidaLoteExportacion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_PARTIDA")
    private Long idPartida;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ID_LOTE", nullable = false)
    private LoteExportacion lote;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ID_LIQUIDACION_G1", nullable = false)
    private LiquidacionG1 liquidacion;

    @Column(name = "LECTURA_DECIMAL", nullable = false, precision = 12, scale = 6)
    private BigDecimal lecturaDecimal;
}
