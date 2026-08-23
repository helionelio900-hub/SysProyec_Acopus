package pe.edu.upeu.bomerp.acopio.parametros.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pe.edu.upeu.bomerp.acopio.parametros.entity.Minero;
import java.util.Optional;

@Repository
public interface MineroRepository extends JpaRepository<Minero, Long> {
    Optional<Minero> findByDocumentoIdentidad(String documentoIdentidad);
}
