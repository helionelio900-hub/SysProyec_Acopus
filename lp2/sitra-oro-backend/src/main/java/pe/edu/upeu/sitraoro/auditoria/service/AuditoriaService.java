package pe.edu.upeu.sitraoro.auditoria.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.upeu.sitraoro.auditoria.entity.RegistroAuditoria;
import pe.edu.upeu.sitraoro.auditoria.repository.RegistroAuditoriaRepository;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuditoriaService {

    private final RegistroAuditoriaRepository repository;

    @Transactional(propagation = Propagation.REQUIRED)
    public RegistroAuditoria registrar(String actor, String accion, String entidad, Long entidadId, String detalle) {
        String actorResuelto = actor;
        if (actorResuelto == null || actorResuelto.isBlank()) {
            actorResuelto = resolverActorActual();
        }

        RegistroAuditoria registro = RegistroAuditoria.builder()
                .actor(actorResuelto)
                .accion(accion)
                .entidad(entidad)
                .entidadId(entidadId)
                .fecha(LocalDateTime.now())
                .detalle(detalle)
                .build();

        RegistroAuditoria guardado = repository.save(registro);
        log.info("Auditoría registrada: id={} actor={} accion={} entidad={}:{}",
                guardado.getId(), actorResuelto, accion, entidad, entidadId);
        return guardado;
    }

    public String resolverActorActual() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null) {
                if (auth.getPrincipal() instanceof Jwt jwt) {
                    return jwt.getSubject();
                }
                if (auth.getName() != null && !auth.getName().isBlank()) {
                    return auth.getName();
                }
            }
        } catch (Exception e) {
            log.debug("No se pudo obtener el actor del contexto de seguridad: {}", e.getMessage());
        }
        return "SISTEMA";
    }
}
