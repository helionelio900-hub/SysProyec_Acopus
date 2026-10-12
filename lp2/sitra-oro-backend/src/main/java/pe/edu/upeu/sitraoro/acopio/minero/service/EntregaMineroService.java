package pe.edu.upeu.sitraoro.acopio.minero.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.access.AccessDeniedException;
import pe.edu.upeu.sitraoro.acopio.mayorista.service.CentroAcopioServiceImpl;
import pe.edu.upeu.sitraoro.seguridad.service.CuentaAccesoService;
import pe.edu.upeu.sitraoro.seguridad.entity.RolCuenta;

@Service @RequiredArgsConstructor
public class EntregaMineroService {
 private final JdbcTemplate jdbc;
 private final CuentaAccesoService cuentas;
 private final CentroAcopioServiceImpl centros;
 public record Partida(@Pattern(regexp="ROJO|VERDE") @NotNull String color,
   @NotNull @Positive @Digits(integer=12,fraction=3) BigDecimal pesoCrudo,
   @NotNull @Positive @Digits(integer=12,fraction=3) BigDecimal pesoEstimado) {}
 public record Solicitud(@NotNull @Positive Long idCentroAcopio,
   @NotEmpty @Size(max=200) List<@Valid Partida> partidas) {}
 private Long minero(String documento) {
   var cuenta=cuentas.obtenerPorDocumento(documento);
   if(cuenta.rol()!=RolCuenta.MINERO || !cuenta.activo() || cuenta.idMinero()==null)
     throw new AccessDeniedException("Cuenta de minero no habilitada");
   return cuenta.idMinero();
 }
 @Transactional
 public Long enviar(String documento,Solicitud solicitud) {
   Long idMinero=minero(documento);
   centros.validarActivo(solicitud.idCentroAcopio());
   for(var p:solicitud.partidas()) if(p.pesoEstimado().compareTo(p.pesoCrudo())>0)
     throw new IllegalArgumentException("El peso estimado no puede superar el peso crudo");
   Long id=jdbc.queryForObject("SELECT SEQ_SOL_ENTREGA.NEXTVAL FROM DUAL",Long.class);
   jdbc.update("INSERT INTO SOL_ENTREGA_MINERO(ID_SOLICITUD,ID_MINERO,ID_CENTRO_ACOPIO) VALUES(?,?,?)",id,idMinero,solicitud.idCentroAcopio());
   int numero=0;
   for(var p:solicitud.partidas()) jdbc.update("INSERT INTO SOL_ENTREGA_PARTIDA VALUES(?,?,?,?,?)",id,++numero,p.color(),p.pesoCrudo(),p.pesoEstimado());
   return id;
 }
 @Transactional(readOnly=true)
 public List<Map<String,Object>> delMinero(String documento) {return listar("s.ID_MINERO",minero(documento));}
 @Transactional(readOnly=true)
 public List<Map<String,Object>> delCentro(Long centro) {return listar("s.ID_CENTRO_ACOPIO",centro);}
 private List<Map<String,Object>> listar(String filtro,Long id) {
   var filas=jdbc.queryForList("SELECT s.ID_SOLICITUD, s.ID_MINERO, s.ID_COMPRA_G2, s.ESTADO, s.ID_CENTRO_ACOPIO, m.NOMBRES_APELLIDOS, c.NOMBRE CENTRO FROM SOL_ENTREGA_MINERO s JOIN MINEROS m ON m.ID_MINERO=s.ID_MINERO JOIN CENTROS_ACOPIO c ON c.ID_CENTRO_ACOPIO=s.ID_CENTRO_ACOPIO WHERE "+filtro+"=? ORDER BY s.ID_SOLICITUD DESC",id);
   for(var fila:filas) fila.put("PARTIDAS",jdbc.queryForList("SELECT NUMERO,COLOR,PESO_CRUDO,PESO_ESTIMADO FROM SOL_ENTREGA_PARTIDA WHERE ID_SOLICITUD=? ORDER BY NUMERO",fila.get("ID_SOLICITUD")));
   return filas;
 }
 @Transactional
 public void aceptar(Long centro,Long id) {
   if(jdbc.update("UPDATE SOL_ENTREGA_MINERO SET ESTADO='ACEPTADA' WHERE ID_SOLICITUD=? AND ID_CENTRO_ACOPIO=? AND ESTADO='PENDIENTE'",id,centro)!=1)
     throw new IllegalArgumentException("La solicitud no está pendiente en este centro");
 }
 public void reservarCompra(Long id, Long centro, Long minero) {
   var filas=jdbc.queryForList("SELECT ESTADO,ID_MINERO,ID_CENTRO_ACOPIO FROM SOL_ENTREGA_MINERO WHERE ID_SOLICITUD=? FOR UPDATE",id);
   if(filas.size()!=1 || !"ACEPTADA".equals(filas.getFirst().get("ESTADO"))
     || ((Number)filas.getFirst().get("ID_MINERO")).longValue()!=minero
     || ((Number)filas.getFirst().get("ID_CENTRO_ACOPIO")).longValue()!=centro)
     throw new IllegalArgumentException("La solicitud no está aceptada para este minero y acopio, o ya tiene compra registrada");
 }
 public void vincularCompra(Long id,Long compra) {
   jdbc.update("UPDATE SOL_ENTREGA_MINERO SET ESTADO='COMPRA_REGISTRADA',ID_COMPRA_G2=? WHERE ID_SOLICITUD=?",compra,id);
 }
}
