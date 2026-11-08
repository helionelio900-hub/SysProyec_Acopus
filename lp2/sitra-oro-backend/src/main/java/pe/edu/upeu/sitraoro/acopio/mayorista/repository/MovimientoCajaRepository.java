package pe.edu.upeu.sitraoro.acopio.mayorista.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pe.edu.upeu.sitraoro.acopio.mayorista.entity.MovimientoCaja;
import pe.edu.upeu.sitraoro.acopio.mayorista.entity.OrigenMovimientoCaja;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface MovimientoCajaRepository extends JpaRepository<MovimientoCaja, Long> {

    @Query("""
        SELECT m FROM MovimientoCaja m
        WHERE (:desde IS NULL OR m.fecha >= :desde)
          AND (:hasta IS NULL OR m.fecha <= :hasta)
        ORDER BY m.fecha DESC, m.idMovimiento DESC
        """)
    List<MovimientoCaja> buscar(@Param("desde") LocalDate desde, @Param("hasta") LocalDate hasta);

    /** Saldo de una moneda: ingresos menos egresos, sin contar anulados. */
    @Query("""
        SELECT COALESCE(SUM(CASE WHEN m.tipo = pe.edu.upeu.sitraoro.acopio.mayorista.entity.TipoMovimientoCaja.INGRESO
                                 THEN m.monto ELSE -m.monto END), 0)
        FROM MovimientoCaja m WHERE m.moneda = :moneda AND m.anulado = false
        """)
    BigDecimal saldo(@Param("moneda") String moneda);

    List<MovimientoCaja> findByOrigenAndIdReferenciaAndAnuladoFalse(OrigenMovimientoCaja origen, Long idReferencia);
}
