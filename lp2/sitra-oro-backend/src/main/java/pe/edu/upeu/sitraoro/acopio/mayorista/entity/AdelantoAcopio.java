package pe.edu.upeu.sitraoro.acopio.mayorista.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Dinero que el mayorista entrega por adelantado a un centro de acopio antes de recibir su oro.
 * Se registra en PEN o USD; MONTO_PEN guarda su equivalente en soles para descontarlo del pago.
 */
@Entity
@Table(name = "MAYORISTA_ADELANTOS")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdelantoAcopio {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_ADELANTO")
    private Long idAdelanto;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ID_CENTRO_ACOPIO", nullable = false)
    private CentroAcopio centroAcopio;

    @Column(name = "FECHA", nullable = false)
    private LocalDate fecha;

    @Column(name = "MONEDA", nullable = false, length = 3)
    private String moneda;

    @Column(name = "MONTO", nullable = false, precision = 14, scale = 2)
    private BigDecimal monto;

    @Column(name = "TIPO_CAMBIO", precision = 10, scale = 4)
    private BigDecimal tipoCambio;

    @Column(name = "MONTO_PEN", nullable = false, precision = 14, scale = 2)
    private BigDecimal montoPen;

    @Column(name = "OBSERVACION", length = 200)
    private String observacion;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(name = "ESTADO", nullable = false, length = 12)
    private EstadoAdelanto estado = EstadoAdelanto.PENDIENTE;

    /** Lote recibido en cuyo pago se descontó el adelanto. */
    @Column(name = "ID_RECEPCION")
    private Long idRecepcion;

    @Column(name = "FECHA_CREACION", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;

    @PrePersist
    void alCrear() {
        if (fechaCreacion == null) fechaCreacion = LocalDateTime.now();
        if (estado == null) estado = EstadoAdelanto.PENDIENTE;
    }
}
