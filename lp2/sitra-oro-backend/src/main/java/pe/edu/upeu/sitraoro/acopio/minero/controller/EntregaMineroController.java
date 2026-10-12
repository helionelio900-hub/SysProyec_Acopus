package pe.edu.upeu.sitraoro.acopio.minero.controller;
import java.util.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.access.AccessDeniedException;
import pe.edu.upeu.sitraoro.acopio.minero.service.EntregaMineroService;
@RestController @RequiredArgsConstructor
public class EntregaMineroController {
 private final EntregaMineroService service;
 @PostMapping("/api/v1/minero/entregas") @ResponseStatus(HttpStatus.CREATED)
 public Map<String,Long> enviar(@AuthenticationPrincipal Jwt jwt,@Valid @RequestBody EntregaMineroService.Solicitud solicitud) {
   return Map.of("idSolicitud",service.enviar(jwt.getSubject(),solicitud));
 }
 @GetMapping("/api/v1/minero/entregas")
 public List<Map<String,Object>> propias(@AuthenticationPrincipal Jwt jwt){return service.delMinero(jwt.getSubject());}
 @GetMapping("/api/v1/acopio/solicitudes-entrega")
 public List<Map<String,Object>> recibidas(@AuthenticationPrincipal Jwt jwt){return service.delCentro(centro(jwt));}
 @PostMapping("/api/v1/acopio/solicitudes-entrega/{id}/aceptar")
 public void aceptar(@AuthenticationPrincipal Jwt jwt,@PathVariable Long id){service.aceptar(centro(jwt),id);}
 private Long centro(Jwt jwt) {
   if(!(jwt.getClaim("idCentroAcopio") instanceof Number n)) throw new AccessDeniedException("Centro no asignado");
   return n.longValue();
 }
}
