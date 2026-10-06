package pe.edu.upeu.sitraoro.acopio.mayorista.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "ZONAS_ACOPIO")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class ZonaAcopio {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_ZONA")
    private Long idZona;

    @Column(name = "NOMBRE", nullable = false, length = 100, unique = true)
    private String nombre;
}
