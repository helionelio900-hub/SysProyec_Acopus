package pe.edu.upeu.sitraoro.acopio.parametros.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "MINEROS")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Minero {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_MINERO")
    private Long idMinero;

    @Column(name = "DOCUMENTO_IDENTIDAD", nullable = false, unique = true, length = 15)
    private String documentoIdentidad;

    @Column(name = "NOMBRES_APELLIDOS", nullable = false, length = 150)
    private String nombresApellidos;

    @Column(name = "TELEFONO", length = 20)
    private String telefono;

    @Column(name = "ZONA_PROCEDENCIA", length = 100)
    private String zonaProcedencia;

    @Column(name = "FECHA_REGISTRO", nullable = false, updatable = false)
    private LocalDateTime fechaRegistro;

    @PrePersist
    public void prePersist() {
        if (fechaRegistro == null) {
            fechaRegistro = LocalDateTime.now();
        }
    }
}
