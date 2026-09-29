package pe.edu.upeu.sitraoro.acopio.mayorista.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "MAYORISTA_RECEPCIONES")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecepcionMayorista {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_RECEPCION")
    private Long idRecepcion;

    @Column(name = "FECHA", nullable = false)
    private LocalDate fecha;

    @Column(name = "NOMBRE_ACOPIADOR", nullable = false, length = 223)
    private String nombreAcopiador;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ID_CENTRO_ACOPIO", nullable = false)
    private CentroAcopio centroAcopio;

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "pesoSinFundirG", column = @Column(name = "ROJO_PESO_SIN_FUNDIR_G", precision = 10, scale = 3)),
            @AttributeOverride(name = "pesoFundidoG", column = @Column(name = "ROJO_PESO_FUNDIDO_G", precision = 10, scale = 3)),
            @AttributeOverride(name = "onza", column = @Column(name = "ROJO_ONZA", length = 80)),
            @AttributeOverride(name = "dolar", column = @Column(name = "ROJO_DOLAR", length = 80)),
            @AttributeOverride(name = "exportacion", column = @Column(name = "ROJO_EXPORTACION", length = 80)),
            @AttributeOverride(name = "pagoMaterial", column = @Column(name = "ROJO_PAGO_MATERIAL", length = 80))
    })
    private DatosOro rojo;

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "pesoSinFundirG", column = @Column(name = "VERDE_PESO_SIN_FUNDIR_G", precision = 10, scale = 3)),
            @AttributeOverride(name = "pesoFundidoG", column = @Column(name = "VERDE_PESO_FUNDIDO_G", precision = 10, scale = 3)),
            @AttributeOverride(name = "onza", column = @Column(name = "VERDE_ONZA", length = 80)),
            @AttributeOverride(name = "dolar", column = @Column(name = "VERDE_DOLAR", length = 80)),
            @AttributeOverride(name = "exportacion", column = @Column(name = "VERDE_EXPORTACION", length = 80)),
            @AttributeOverride(name = "pagoMaterial", column = @Column(name = "VERDE_PAGO_MATERIAL", length = 80))
    })
    private DatosOro verde;

    @Column(name = "DESCUENTO", length = 100)
    private String descuento;

    @Column(name = "TOTAL", length = 100)
    private String total;

    @Column(name = "FECHA_CREACION", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;

    @PrePersist
    void alCrear() {
        if (fechaCreacion == null) fechaCreacion = LocalDateTime.now();
    }
}
