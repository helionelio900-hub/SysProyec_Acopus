package pe.edu.upeu.sitraoro.acopio.acopiador.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.upeu.sitraoro.acopio.acopiador.entity.AjusteCompraG2;
import java.util.List;

public interface AjusteCompraG2Repository extends JpaRepository<AjusteCompraG2, Long> {
    List<AjusteCompraG2> findByIdCentroAcopioOrderByFechaSolicitudDesc(Long idCentroAcopio);
}
