package pe.edu.upeu.sitraoro.seguridad.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.upeu.sitraoro.seguridad.entity.CuentaAcceso;
import pe.edu.upeu.sitraoro.seguridad.entity.RolCuenta;

import java.util.Optional;
import java.util.List;

public interface CuentaAccesoRepository extends JpaRepository<CuentaAcceso, Long> {
    Optional<CuentaAcceso> findByDocumentoIdentidad(String documentoIdentidad);
    boolean existsByDocumentoIdentidad(String documentoIdentidad);
    List<CuentaAcceso> findByRolAndActivoFalseAndIdCentroAcopioPreferido(RolCuenta rol, Long idCentroAcopioPreferido);
}
