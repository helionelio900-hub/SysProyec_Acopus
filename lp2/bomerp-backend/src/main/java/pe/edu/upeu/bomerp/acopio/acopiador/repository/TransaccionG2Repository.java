package pe.edu.upeu.bomerp.acopio.acopiador.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import pe.edu.upeu.bomerp.acopio.acopiador.entity.TransaccionG2;
import java.math.BigDecimal;
import java.util.List;

@Repository
public interface TransaccionG2Repository extends JpaRepository<TransaccionG2, Long> {

    List<TransaccionG2> findByTipoOro(String tipoOro);

    @Query("SELECT COALESCE(SUM(t.pesoFundidoNetoG), 0) FROM TransaccionG2 t WHERE t.tipoOro = :tipoOro")
    BigDecimal sumPesoFundidoByTipoOro(@Param("tipoOro") String tipoOro);

    @Query("SELECT COALESCE(SUM(t.totalPagadoPen), 0) FROM TransaccionG2 t WHERE t.tipoOro = :tipoOro")
    BigDecimal sumTotalPagadoByTipoOro(@Param("tipoOro") String tipoOro);
}
