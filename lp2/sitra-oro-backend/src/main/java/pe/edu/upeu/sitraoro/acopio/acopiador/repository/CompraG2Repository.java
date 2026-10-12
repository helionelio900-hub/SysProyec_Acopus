package pe.edu.upeu.sitraoro.acopio.acopiador.repository;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.upeu.sitraoro.acopio.acopiador.entity.CompraG2;
import java.util.List;

public interface CompraG2Repository extends JpaRepository<CompraG2, Long> {
    @EntityGraph(attributePaths = {"minero", "detalles"})
    List<CompraG2> findByIdCentroAcopioOrderByFechaCompraDescIdCompraG2Desc(Long idCentroAcopio);
}
