package pe.edu.upeu.sitraoro.acopio.mayorista.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.upeu.sitraoro.acopio.mayorista.entity.CentroAcopio;
import java.util.List;
import java.util.Optional;

public interface CentroAcopioRepository extends JpaRepository<CentroAcopio, Long> {
    List<CentroAcopio> findByActivoTrueOrderByNombreAsc();
    Optional<CentroAcopio> findByIdCuentaAcopiador(Long idCuentaAcopiador);
    boolean existsByNombreIgnoreCaseAndZonaIgnoreCase(String nombre, String zona);
}
