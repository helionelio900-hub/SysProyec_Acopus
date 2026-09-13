package pe.edu.upeu.sitraoro.acopio.mayorista.repository;

import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import pe.edu.upeu.sitraoro.acopio.mayorista.dto.LiquidacionResumen;
import pe.edu.upeu.sitraoro.acopio.mayorista.entity.EstadoLiquidacion;
import pe.edu.upeu.sitraoro.acopio.mayorista.entity.LiquidacionG1;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface LiquidacionG1Repository extends JpaRepository<LiquidacionG1, Long> {

    @Override
    @EntityGraph(attributePaths = "detalles")
    Optional<LiquidacionG1> findById(Long id);

    /**
     * Filtros combinados y opcionales en una sola consulta: cada :param IS NULL
     * anula su propia clausula cuando no se envia. Sort se traduce a ORDER BY
     * sobre los campos de LiquidacionG1 (no de la proyeccion).
     */
    @EntityGraph(attributePaths = "detalles")
    @Query("""
        SELECT l FROM LiquidacionG1 l
        WHERE (:estado IS NULL OR l.estado = :estado)
          AND (:desde IS NULL OR l.fechaLiquidacion >= :desde)
          AND (:hasta IS NULL OR l.fechaLiquidacion <= :hasta)
        """)
    List<LiquidacionG1> buscar(@Param("estado") EstadoLiquidacion estado,
                               @Param("desde") LocalDateTime desde,
                               @Param("hasta") LocalDateTime hasta,
                               Sort sort);

    @Query("""
        SELECT new pe.edu.upeu.sitraoro.acopio.mayorista.dto.LiquidacionResumen(
            l.idLiquidacionG1, l.fechaLiquidacion, l.estado, l.totalPagadoG2Pen, SIZE(l.detalles))
        FROM LiquidacionG1 l
        WHERE (:estado IS NULL OR l.estado = :estado)
          AND (:desde IS NULL OR l.fechaLiquidacion >= :desde)
          AND (:hasta IS NULL OR l.fechaLiquidacion <= :hasta)
        """)
    List<LiquidacionResumen> buscarResumen(@Param("estado") EstadoLiquidacion estado,
                                           @Param("desde") LocalDateTime desde,
                                           @Param("hasta") LocalDateTime hasta,
                                           Sort sort);
}
