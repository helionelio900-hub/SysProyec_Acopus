package pe.edu.upeu.sitraoro.acopio.mayorista.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.upeu.sitraoro.acopio.mayorista.entity.ZonaAcopio;

public interface ZonaAcopioRepository extends JpaRepository<ZonaAcopio, Long> {
    List<ZonaAcopio> findAllByOrderByNombreAsc();
    Optional<ZonaAcopio> findByNombreIgnoreCase(String nombre);
}
