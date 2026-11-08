package pe.edu.upeu.sitraoro.acopio.mayorista.repository;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pe.edu.upeu.sitraoro.acopio.mayorista.entity.AdelantoAcopio;
import pe.edu.upeu.sitraoro.acopio.mayorista.entity.EstadoAdelanto;

import java.util.Collection;
import java.util.List;

public interface AdelantoAcopioRepository extends JpaRepository<AdelantoAcopio, Long> {

    @EntityGraph(attributePaths = "centroAcopio")
    @Query("""
        SELECT a FROM AdelantoAcopio a
        WHERE (:idCentro IS NULL OR a.centroAcopio.idCentroAcopio = :idCentro)
          AND (:estado IS NULL OR a.estado = :estado)
        ORDER BY a.fecha DESC, a.idAdelanto DESC
        """)
    List<AdelantoAcopio> buscar(@Param("idCentro") Long idCentro, @Param("estado") EstadoAdelanto estado);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT a FROM AdelantoAcopio a WHERE a.idAdelanto IN :ids")
    List<AdelantoAcopio> bloquear(@Param("ids") Collection<Long> ids);

    List<AdelantoAcopio> findByIdRecepcion(Long idRecepcion);

    List<AdelantoAcopio> findByIdRecepcionIn(Collection<Long> idsRecepcion);
}
