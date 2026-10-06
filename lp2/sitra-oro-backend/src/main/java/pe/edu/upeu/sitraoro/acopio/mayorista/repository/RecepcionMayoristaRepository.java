package pe.edu.upeu.sitraoro.acopio.mayorista.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;
import java.util.Optional;
import pe.edu.upeu.sitraoro.acopio.mayorista.entity.RecepcionMayorista;

import java.util.List;

public interface RecepcionMayoristaRepository extends JpaRepository<RecepcionMayorista, Long> {
    List<RecepcionMayorista> findAllByOrderByFechaDescIdRecepcionDesc();
    List<RecepcionMayorista> findByCentroAcopio_IdCentroAcopioOrderByFechaDescIdRecepcionDesc(Long idCentroAcopio);
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT r FROM RecepcionMayorista r WHERE r.idRecepcion = :id")
    Optional<RecepcionMayorista> bloquearPorId(@Param("id") Long id);
}
