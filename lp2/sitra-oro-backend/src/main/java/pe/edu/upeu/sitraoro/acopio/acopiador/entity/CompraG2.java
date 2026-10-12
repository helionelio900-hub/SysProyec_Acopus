package pe.edu.upeu.sitraoro.acopio.acopiador.entity;

import jakarta.persistence.*;
import lombok.*;
import pe.edu.upeu.sitraoro.acopio.parametros.entity.Minero;
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

    @OneToMany(mappedBy = "compra", cascade = CascadeType.PERSIST)
    @OrderBy("idTransaccionG2 ASC")
    private List<TransaccionG2> detalles = new ArrayList<>();

    public void agregarPartida(TransaccionG2 partida) {
        partida.setCompra(this);
        detalles.add(partida);
    }
}
