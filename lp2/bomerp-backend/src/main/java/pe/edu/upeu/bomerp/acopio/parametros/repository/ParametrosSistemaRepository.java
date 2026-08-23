package pe.edu.upeu.bomerp.acopio.parametros.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pe.edu.upeu.bomerp.acopio.parametros.entity.ParametrosSistema;
import java.util.Optional;

@Repository
public interface ParametrosSistemaRepository extends JpaRepository<ParametrosSistema, Long> {
    Optional<ParametrosSistema> findFirstByEstadoOrderByFechaDesc(String estado);
}
