package pe.edu.upeu.sitraoro.acopio.mayorista.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "CENTROS_ACOPIO", uniqueConstraints = @UniqueConstraint(
        name = "UK_CENTRO_NOMBRE_ZONA", columnNames = {"NOMBRE", "ZONA"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CentroAcopio {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_CENTRO_ACOPIO")
    private Long idCentroAcopio;
    @Column(name = "NOMBRE", nullable = false, length = 120)
    private String nombre;
    @Column(name = "ZONA", nullable = false, length = 100)
    private String zona;
    @Column(name = "DIRECCION", nullable = false, length = 200)
    private String direccion;
    @Column(name = "TELEFONO", length = 20)
    private String telefono;
    @Column(name = "ID_CUENTA_ACOPIADOR", nullable = false, unique = true)
    private Long idCuentaAcopiador;
    @Column(name = "ACTIVO", nullable = false)
    private boolean activo;
}
