package pe.edu.upeu.sitraoro.auditoria.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "AUDITORIA")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegistroAuditoria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Long id;

    @Column(name = "ACTOR", length = 100)
    private String actor;

    @Column(name = "ACCION", nullable = false, length = 50)
    private String accion;

    @Column(name = "ENTIDAD", nullable = false, length = 50)
    private String entidad;

    @Column(name = "ENTIDAD_ID")
    private Long entidadId;

    @Column(name = "FECHA", nullable = false)
    private LocalDateTime fecha;

    @Column(name = "DETALLE", length = 500)
    private String detalle;
}
