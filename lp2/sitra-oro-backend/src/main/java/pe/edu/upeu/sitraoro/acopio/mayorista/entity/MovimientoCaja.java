package pe.edu.upeu.sitraoro.acopio.mayorista.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/** Entrada o salida de dinero de la caja del mayorista, en soles o en dólares (nunca se mezclan). */
@Entity
@Table(name = "MAYORISTA_CAJA_MOVIMIENTOS")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MovimientoCaja {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_MOVIMIENTO")
    private Long idMovimiento;

    @Column(name = "FECHA", nullable = false)
    private LocalDate fecha;

    @Column(name = "MONEDA", nullable = false, length = 3)
    private String moneda;

    @Enumerated(EnumType.STRING)
    @Column(name = "TIPO", nullable = false, length = 8)
    private TipoMovimientoCaja tipo;

    @Enumerated(EnumType.STRING)
    @Column(name = "ORIGEN", nullable = false, length = 15)
    private OrigenMovimientoCaja origen;

    @Column(name = "MONTO", nullable = false, precision = 16, scale = 2)
    private BigDecimal monto;

    @Column(name = "CONCEPTO", nullable = false, length = 200)
    private String concepto;

    /** Lote recibido (PAGO_LOTE), adelanto (ADELANTO) o lote de exportación (EXPORTADOR, opcional). */
    @Column(name = "ID_REFERENCIA")
    private Long idReferencia;

    @Builder.Default
    @Column(name = "ANULADO", nullable = false)
    private boolean anulado = false;

    @Column(name = "FECHA_CREACION", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;

    @PrePersist
    void alCrear() {
        if (fechaCreacion == null) fechaCreacion = LocalDateTime.now();
    }
}
