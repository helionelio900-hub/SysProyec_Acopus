package pe.edu.upeu.sitraoro.acopio.acopiador.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/** Entrada o salida de dinero de la caja de un centro de acopio, en soles o dólares (no se mezclan). */
@Entity
@Table(name = "ACOPIO_CAJA_MOVIMIENTOS")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MovimientoCajaAcopio {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_MOVIMIENTO")
    private Long idMovimiento;

    @Column(name = "ID_CENTRO_ACOPIO", nullable = false)
    private Long idCentroAcopio;

    @Column(name = "FECHA", nullable = false)
    private LocalDate fecha;

    @Column(name = "MONEDA", nullable = false, length = 3)
    private String moneda;

    /** true = ingreso, false = egreso. */
    @Column(name = "INGRESO", nullable = false)
    private boolean ingreso;

    @Enumerated(EnumType.STRING)
    @Column(name = "ORIGEN", nullable = false, length = 15)
    private OrigenCajaAcopio origen;

    @Column(name = "MONTO", nullable = false, precision = 16, scale = 2)
    private BigDecimal monto;

    @Column(name = "CONCEPTO", nullable = false, length = 200)
    private String concepto;

    /** Compra (PAGO_COMPRA) o préstamo (PRESTAMO) que originó el movimiento. */
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
