package pe.edu.upeu.sitraoro.acopio.mayorista.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "LOTES_EXPORTACION")
@Getter
@Setter
public class LoteExportacion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_LOTE")
    private Long idLote;

    @Column(name = "FECHA", nullable = false)
    private LocalDate fecha;

    @Enumerated(EnumType.STRING)
    @Column(name = "ESTADO", nullable = false, length = 20)
    private EstadoLoteExportacion estado = EstadoLoteExportacion.BORRADOR;

    @Column(name = "FECHA_CREACION", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;

    @Column(name = "FECHA_PREPARACION")
    private LocalDateTime fechaPreparacion;

    @OneToMany(mappedBy = "lote", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("idPartida ASC")
    private List<PartidaLoteExportacion> partidas = new ArrayList<>();

    @PrePersist
    void alCrear() {
        if (fechaCreacion == null) fechaCreacion = LocalDateTime.now();
    }
}
