package pe.edu.upeu.sitraoro.acopio.acopiador.repository;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pe.edu.upeu.sitraoro.acopio.acopiador.entity.EstadoPrestamo;
import pe.edu.upeu.sitraoro.acopio.acopiador.entity.PrestamoMinero;

import java.util.Collection;
import java.util.List;

public interface PrestamoMineroRepository extends JpaRepository<PrestamoMinero, Long> {

    @EntityGraph(attributePaths = "minero")
    @Query("""
        SELECT p FROM PrestamoMinero p
        WHERE p.idCentroAcopio = :idCentro
          AND (:idMinero IS NULL OR p.minero.idMinero = :idMinero)
          AND (:estado IS NULL OR p.estado = :estado)
        ORDER BY p.fecha DESC, p.idPrestamo DESC
        """)
    List<PrestamoMinero> buscar(@Param("idCentro") Long idCentro, @Param("idMinero") Long idMinero,
                                @Param("estado") EstadoPrestamo estado);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM PrestamoMinero p WHERE p.idPrestamo IN :ids")
    List<PrestamoMinero> bloquear(@Param("ids") Collection<Long> ids);

    List<PrestamoMinero> findByIdCompraG2(Long idCompraG2);
}
