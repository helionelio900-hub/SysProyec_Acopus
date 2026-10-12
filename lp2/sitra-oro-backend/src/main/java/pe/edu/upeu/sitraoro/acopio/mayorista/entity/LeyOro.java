package pe.edu.upeu.sitraoro.acopio.mayorista.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

/** Catálogo compartido: la misma ley puede participar en muchos lotes recibidos. */
@Entity
@Table(name = "LEYES_ORO", uniqueConstraints = @UniqueConstraint(name = "UQ_LEY_VALOR", columnNames = "VALOR"))
@Getter @Setter @NoArgsConstructor
public class LeyOro {
    @Id @Column(name = "ID_LEY")
    private Long idLey;
    @Column(name = "VALOR", nullable = false, precision = 7, scale = 4)
    private BigDecimal valor;
}
