package pe.edu.upeu.sitraoro.acopio.acopiador.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import pe.edu.upeu.sitraoro.acopio.acopiador.entity.TransaccionG2;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import jakarta.persistence.LockModeType;

@Repository
public interface TransaccionG2Repository extends JpaRepository<TransaccionG2, Long> {

    List<TransaccionG2> findByTipoOro(String tipoOro);

    List<TransaccionG2> findByIdRecepcionMayoristaOrderByIdTransaccionG2(Long idRecepcionMayorista);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT t FROM TransaccionG2 t WHERE t.idTransaccionG2 IN :ids ORDER BY t.idTransaccionG2")
    List<TransaccionG2> bloquearPorIds(@Param("ids") List<Long> ids);
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT t FROM TransaccionG2 t WHERE t.idTransaccionG2 = :id")
    Optional<TransaccionG2> bloquearPorId(@Param("id") Long id);
    List<TransaccionG2> findByIdCentroAcopioOrderByFechaTransaccionDesc(Long idCentroAcopio);
    List<TransaccionG2> findByIdCentroAcopioAndMineroIdMinero(Long idCentroAcopio, Long idMinero);

    @Query("SELECT COALESCE(SUM(t.pesoFundidoNetoG), 0) FROM TransaccionG2 t WHERE t.tipoOro = :tipoOro AND t.anulada = false")
    BigDecimal sumPesoFundidoByTipoOro(@Param("tipoOro") String tipoOro);

    @Query("SELECT COALESCE(SUM(t.pesoFundidoNetoG), 0) FROM TransaccionG2 t WHERE t.idCentroAcopio = :centroId AND t.tipoOro = :tipoOro AND t.anulada = false")
    BigDecimal sumPesoFundidoByCentroAndTipoOro(@Param("centroId") Long centroId, @Param("tipoOro") String tipoOro);

    @Query("SELECT COALESCE(SUM(t.totalPagadoPen), 0) FROM TransaccionG2 t WHERE t.tipoOro = :tipoOro AND t.anulada = false")
    BigDecimal sumTotalPagadoByTipoOro(@Param("tipoOro") String tipoOro);

    @Query("SELECT COALESCE(SUM(t.totalPagadoPen), 0) FROM TransaccionG2 t WHERE t.idCentroAcopio = :centroId AND t.tipoOro = :tipoOro AND t.anulada = false")
    BigDecimal sumTotalPagadoByCentroAndTipoOro(@Param("centroId") Long centroId, @Param("tipoOro") String tipoOro);

    @Query("SELECT COALESCE(SUM(t.pesoFundidoNetoG), 0) FROM TransaccionG2 t WHERE t.tipoOro = :tipoOro AND t.idLiquidacionG1 IS NULL AND t.idRecepcionMayorista IS NULL AND t.anulada = false")
    BigDecimal sumStockDisponibleByTipoOro(@Param("tipoOro") String tipoOro);

    @Query("SELECT COALESCE(SUM(t.pesoFundidoNetoG), 0) FROM TransaccionG2 t WHERE t.idCentroAcopio = :centroId AND t.tipoOro = :tipoOro AND t.idLiquidacionG1 IS NULL AND t.idRecepcionMayorista IS NULL AND t.anulada = false")
    BigDecimal sumStockDisponibleByCentroAndTipoOro(@Param("centroId") Long centroId, @Param("tipoOro") String tipoOro);

    @Query("SELECT COALESCE(SUM(t.totalPagadoPen), 0) FROM TransaccionG2 t WHERE t.tipoOro = :tipoOro AND t.idLiquidacionG1 IS NULL AND t.idRecepcionMayorista IS NULL AND t.anulada = false")
    BigDecimal sumTotalPagadoDisponibleByTipoOro(@Param("tipoOro") String tipoOro);

    @Query("SELECT COALESCE(SUM(t.totalPagadoPen), 0) FROM TransaccionG2 t WHERE t.idCentroAcopio = :centroId AND t.tipoOro = :tipoOro AND t.idLiquidacionG1 IS NULL AND t.idRecepcionMayorista IS NULL AND t.anulada = false")
    BigDecimal sumTotalPagadoDisponibleByCentroAndTipoOro(@Param("centroId") Long centroId, @Param("tipoOro") String tipoOro);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        SELECT t FROM TransaccionG2 t
        WHERE t.idCentroAcopio = :centroId AND t.tipoOro = :tipoOro AND t.idLiquidacionG1 IS NULL AND t.idRecepcionMayorista IS NULL AND t.anulada = false
        ORDER BY t.fechaTransaccion, t.idTransaccionG2
        """)
    List<TransaccionG2> findStockDisponibleForUpdate(@Param("centroId") Long centroId, @Param("tipoOro") String tipoOro);
}
