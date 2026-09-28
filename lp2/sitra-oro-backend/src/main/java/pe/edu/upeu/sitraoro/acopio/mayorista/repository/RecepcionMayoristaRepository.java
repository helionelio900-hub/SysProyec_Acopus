package pe.edu.upeu.sitraoro.acopio.mayorista.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.upeu.sitraoro.acopio.mayorista.entity.RecepcionMayorista;

import java.util.List;

public interface RecepcionMayoristaRepository extends JpaRepository<RecepcionMayorista, Long> {
    List<RecepcionMayorista> findAllByOrderByFechaDescIdRecepcionDesc();
}
