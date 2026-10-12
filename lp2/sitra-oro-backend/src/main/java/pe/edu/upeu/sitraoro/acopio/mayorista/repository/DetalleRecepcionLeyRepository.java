package pe.edu.upeu.sitraoro.acopio.mayorista.repository;
import org.springframework.data.jpa.repository.*;
import pe.edu.upeu.sitraoro.acopio.mayorista.entity.DetalleRecepcionLey;
import java.util.List;
public interface DetalleRecepcionLeyRepository extends JpaRepository<DetalleRecepcionLey, Long> {
    @EntityGraph(attributePaths = {"ley"})
    List<DetalleRecepcionLey> findByRecepcion_IdRecepcionOrderByIdDetalle(Long id);
    boolean existsByRecepcion_IdRecepcion(Long id);
}
