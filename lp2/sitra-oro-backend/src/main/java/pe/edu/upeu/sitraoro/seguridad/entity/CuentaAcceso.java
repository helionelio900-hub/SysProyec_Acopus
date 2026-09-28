package pe.edu.upeu.sitraoro.seguridad.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "CUENTAS_ACCESO")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CuentaAcceso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_CUENTA")
    private Long idCuenta;

    @Column(name = "DOCUMENTO_IDENTIDAD", nullable = false, unique = true, length = 15)
    private String documentoIdentidad;

    @Column(name = "CLAVE_HASH", nullable = false, length = 100)
    private String claveHash;

    @Enumerated(EnumType.STRING)
    @Column(name = "ROL", nullable = false, length = 20)
    private RolCuenta rol;

    @Column(name = "ID_MINERO")
    private Long idMinero;

    @Column(name = "ID_CENTRO_ACOPIO_PREFERIDO")
    private Long idCentroAcopioPreferido;

    @Column(name = "ID_CENTRO_ACOPIO_ASIGNADO")
    private Long idCentroAcopioAsignado;

    @Column(name = "ACTIVO", nullable = false)
    private boolean activo;

    @Column(name = "FECHA_CREACION", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;

    @PrePersist
    void prePersist() {
        if (fechaCreacion == null) fechaCreacion = LocalDateTime.now();
    }
}
