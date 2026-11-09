package pe.edu.upeu.sitraoro.acopio.acopiador.entity;

import jakarta.persistence.*;
import lombok.*;
import pe.edu.upeu.sitraoro.acopio.parametros.entity.Minero;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/** Cabecera de la compra. Las transacciones existentes representan sus partidas. */
@Entity
@Table(name = "COMPRAS_G2")
@Getter @Setter @NoArgsConstructor
public class CompraG2 {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_COMPRA_G2")
    private Long idCompraG2;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_MINERO", nullable = false)
    private Minero minero;

    @Column(name = "ID_CENTRO_ACOPIO", nullable = false)
    private Long idCentroAcopio;

    @Column(name = "FECHA_COMPRA", nullable = false, updatable = false)
    private LocalDateTime fechaCompra;

    /** Préstamos descontados más el descuento manual, en soles. */
    @Column(name = "DESCUENTO_PEN", nullable = false, precision = 14, scale = 2)
    private BigDecimal descuentoPen = BigDecimal.ZERO;

    /** Descuento escrito a mano (lo que no proviene de préstamos registrados). */
    @Column(name = "DESCUENTO_MANUAL_PEN", nullable = false, precision = 14, scale = 2)
    private BigDecimal descuentoManualPen = BigDecimal.ZERO;

    /** Por qué se hizo el descuento manual (se imprime en el comprobante). */
    @Column(name = "DESCUENTO_MOTIVO", length = 200)
    private String descuentoMotivo;

    @OneToMany(mappedBy = "compra", cascade = CascadeType.PERSIST)
    @OrderBy("idTransaccionG2 ASC")
    private List<TransaccionG2> detalles = new ArrayList<>();

    public void agregarPartida(TransaccionG2 partida) {
        partida.setCompra(this);
        detalles.add(partida);
    }
}
