package pe.edu.upeu.sitraoro.acopio.acopiador.entity;

import jakarta.persistence.*;
import lombok.*;
import pe.edu.upeu.sitraoro.acopio.parametros.entity.Minero;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/** Dinero que el acopiador presta o adelanta a un minero, en soles; se descuenta al pagarle su oro. */
@Entity
@Table(name = "ACOPIO_PRESTAMOS_MINERO")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PrestamoMinero {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_PRESTAMO")
    private Long idPrestamo;

    @Column(name = "ID_CENTRO_ACOPIO", nullable = false)
    private Long idCentroAcopio;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ID_MINERO", nullable = false)
    private Minero minero;

    @Column(name = "FECHA", nullable = false)
    private LocalDate fecha;

    @Column(name = "MONTO_PEN", nullable = false, precision = 14, scale = 2)
    private BigDecimal montoPen;

    @Column(name = "OBSERVACION", length = 200)
    private String observacion;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(name = "ESTADO", nullable = false, length = 12)
    private EstadoPrestamo estado = EstadoPrestamo.PENDIENTE;

    /** Compra en la que se descontó. */
    @Column(name = "ID_COMPRA_G2")
    private Long idCompraG2;

    @Column(name = "FECHA_CREACION", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;

    @PrePersist
    void alCrear() {
        if (fechaCreacion == null) fechaCreacion = LocalDateTime.now();
        if (estado == null) estado = EstadoPrestamo.PENDIENTE;
    }
}
