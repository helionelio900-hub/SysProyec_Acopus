package pe.edu.upeu.sitraoro.acopio.acopiador.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pe.edu.upeu.sitraoro.acopio.acopiador.entity.MovimientoCajaAcopio;
import pe.edu.upeu.sitraoro.acopio.acopiador.entity.OrigenCajaAcopio;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface MovimientoCajaAcopioRepository extends JpaRepository<MovimientoCajaAcopio, Long> {

    @Query("""
        SELECT m FROM MovimientoCajaAcopio m
        WHERE m.idCentroAcopio = :idCentro
          AND (:desde IS NULL OR m.fecha >= :desde)
          AND (:hasta IS NULL OR m.fecha <= :hasta)
        ORDER BY m.fecha DESC, m.idMovimiento DESC
        """)
    List<MovimientoCajaAcopio> buscar(@Param("idCentro") Long idCentro, @Param("desde") LocalDate desde,
                                      @Param("hasta") LocalDate hasta);

    @Query("""
        SELECT COALESCE(SUM(CASE WHEN m.ingreso = true THEN m.monto ELSE -m.monto END), 0)
        FROM MovimientoCajaAcopio m
        WHERE m.idCentroAcopio = :idCentro AND m.moneda = :moneda AND m.anulado = false
        """)
    BigDecimal saldo(@Param("idCentro") Long idCentro, @Param("moneda") String moneda);

    List<MovimientoCajaAcopio> findByOrigenAndIdReferenciaAndAnuladoFalse(OrigenCajaAcopio origen, Long idReferencia);

    Optional<MovimientoCajaAcopio> findByIdMovimientoAndIdCentroAcopio(Long idMovimiento, Long idCentroAcopio);
}
