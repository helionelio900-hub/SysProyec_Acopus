package pe.edu.upeu.sitraoro.acopio.acopiador.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "AJUSTES_COMPRA_G2")
@Getter
@Setter
public class AjusteCompraG2 {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_AJUSTE")
    private Long idAjuste;

    @Column(name = "ID_TRANSACCION_G2", nullable = false)
    private Long idTransaccionG2;
    @Column(name = "ID_CENTRO_ACOPIO", nullable = false)
    private Long idCentroAcopio;
    @Column(name = "ID_MINERO", nullable = false)
    private Long idMinero;
    @Column(name = "ID_RECEPCION_MAYORISTA")
    private Long idRecepcionMayorista;
    @Column(name = "ID_LIQUIDACION_G1")
    private Long idLiquidacionG1;
    @Column(name = "TIPO", nullable = false, length = 12)
    private String tipo;
    @Column(name = "ESTADO", nullable = false, length = 24)
    private String estado;
    @Column(name = "MOTIVO", nullable = false, length = 500)
    private String motivo;
    @Column(name = "TIPO_ORO_ANTERIOR", nullable = false, length = 10)
    private String tipoOroAnterior;
    @Column(name = "PESO_SIN_FUNDIR_ANTERIOR", nullable = false, precision = 10, scale = 3)
    private BigDecimal pesoSinFundirAnterior;
    @Column(name = "PESO_FUNDIDO_ANTERIOR", nullable = false, precision = 10, scale = 3)
    private BigDecimal pesoFundidoAnterior;
    @Column(name = "PRECIO_ANTERIOR", nullable = false, precision = 10, scale = 2)
    private BigDecimal precioAnterior;
    @Column(name = "TOTAL_ANTERIOR", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAnterior;
    @Column(name = "TIPO_ORO_NUEVO", length = 10)
    private String tipoOroNuevo;
    @Column(name = "PESO_SIN_FUNDIR_NUEVO", precision = 10, scale = 3)
    private BigDecimal pesoSinFundirNuevo;
    @Column(name = "PESO_FUNDIDO_NUEVO", precision = 10, scale = 3)
    private BigDecimal pesoFundidoNuevo;
    @Column(name = "PRECIO_NUEVO", precision = 10, scale = 2)
    private BigDecimal precioNuevo;
    @Column(name = "TOTAL_NUEVO", precision = 12, scale = 2)
    private BigDecimal totalNuevo;
    @Column(name = "SOLICITADO_POR", nullable = false, length = 40)
    private String solicitadoPor;
    @Column(name = "FECHA_SOLICITUD", nullable = false, updatable = false)
    private LocalDateTime fechaSolicitud;
    @Column(name = "FECHA_DECISION_MINERO")
    private LocalDateTime fechaDecisionMinero;
    @Column(name = "DECIDIDO_POR_MINERO", length = 40)
    private String decididoPorMinero;
    @Column(name = "FECHA_DECISION_MAYORISTA")
    private LocalDateTime fechaDecisionMayorista;
    @Column(name = "DECIDIDO_POR_MAYORISTA", length = 40)
    private String decididoPorMayorista;

    @PrePersist
    void alCrear() {
        if (fechaSolicitud == null) fechaSolicitud = LocalDateTime.now();
    }
}
