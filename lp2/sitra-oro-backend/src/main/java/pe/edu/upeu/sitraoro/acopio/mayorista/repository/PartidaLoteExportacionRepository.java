package pe.edu.upeu.sitraoro.acopio.mayorista.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.upeu.sitraoro.acopio.mayorista.entity.PartidaLoteExportacion;

import java.util.Optional;

public interface PartidaLoteExportacionRepository extends JpaRepository<PartidaLoteExportacion, Long> {
    Optional<PartidaLoteExportacion> findByLiquidacion_IdLiquidacionG1(Long idLiquidacionG1);
}
