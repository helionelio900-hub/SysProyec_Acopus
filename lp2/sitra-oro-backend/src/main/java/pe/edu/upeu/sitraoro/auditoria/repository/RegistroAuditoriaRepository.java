package pe.edu.upeu.sitraoro.auditoria.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pe.edu.upeu.sitraoro.auditoria.entity.RegistroAuditoria;
import java.util.List;

@Repository
public interface RegistroAuditoriaRepository extends JpaRepository<RegistroAuditoria, Long> {
    List<RegistroAuditoria> findByEntidadAndEntidadIdOrderByFechaDesc(String entidad, Long entidadId);
    List<RegistroAuditoria> findByAccionOrderByFechaDesc(String accion);
}
