package pe.edu.upeu.sitraoro.acopio.mayorista.repository;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pe.edu.upeu.sitraoro.acopio.mayorista.entity.LoteExportacion;

import java.util.List;
import java.util.Optional;

public interface LoteExportacionRepository extends JpaRepository<LoteExportacion, Long> {
    @EntityGraph(attributePaths = {"partidas", "partidas.liquidacion"})
    List<LoteExportacion> findAllByOrderByFechaDescIdLoteDesc();

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT l FROM LoteExportacion l WHERE l.idLote = :id")
    Optional<LoteExportacion> bloquearPorId(@Param("id") Long id);
}
