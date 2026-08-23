package pe.edu.upeu.bomerp.acopio.mayorista.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import pe.edu.upeu.bomerp.acopio.mayorista.entity.LiquidacionG1;
import java.math.BigDecimal;
import java.util.List;

@Repository
public interface LiquidacionG1Repository extends JpaRepository<LiquidacionG1, Long> {

    List<LiquidacionG1> findByTipoOro(String tipoOro);

    @Query("SELECT COALESCE(SUM(l.totalPagadoG2Pen), 0) FROM LiquidacionG1 l")
    BigDecimal sumTotalPagadoG2();
}
