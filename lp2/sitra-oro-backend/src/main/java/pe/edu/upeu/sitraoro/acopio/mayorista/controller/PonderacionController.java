package pe.edu.upeu.sitraoro.acopio.mayorista.controller;
import java.math.*;
import java.util.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;

@RestController @RequiredArgsConstructor @RequestMapping("/api/v1/mayorista/ponderaciones")
public class PonderacionController {
 private final JdbcTemplate jdbc;
 public record Fila(@NotNull @Positive @Digits(integer=7,fraction=3) BigDecimal peso,
   @NotNull @Positive @DecimalMax("100") @Digits(integer=3,fraction=4) BigDecimal ley) {}
 public record Registro(@NotEmpty @Size(max=200) List<@NotNull @Valid Fila> filas,
   @PositiveOrZero @Digits(integer=15,fraction=3) BigDecimal fundido) {}
 @PostMapping @ResponseStatus(HttpStatus.CREATED) @Transactional
 public Map<String,Object> guardar(@Valid @RequestBody Registro registro) {
   return persistir(null,registro);
 }
 @PutMapping("/{id}") @Transactional
 public Map<String,Object> editar(@PathVariable Long id,@Valid @RequestBody Registro registro) {
   bloquear(id);
   return persistir(id,registro);
 }
 @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) @Transactional
 public void eliminar(@PathVariable Long id) {
   bloquear(id);
   jdbc.update("DELETE FROM REG_PONDERACION_LEY WHERE ID_REGISTRO=?",id);
   jdbc.update("DELETE FROM REG_PONDERACION WHERE ID_REGISTRO=?",id);
 }
 private void bloquear(Long id) {
   if(jdbc.queryForList("SELECT ID_REGISTRO FROM REG_PONDERACION WHERE ID_REGISTRO=? FOR UPDATE",id).isEmpty())
     throw new pe.edu.upeu.sitraoro.exception.ResourceNotFoundException("Registro de ponderación no encontrado");
 }
 private Map<String,Object> persistir(Long id,Registro registro) {
   BigDecimal total=BigDecimal.ZERO, producto=BigDecimal.ZERO;
   for(var f:registro.filas()) {total=total.add(f.peso()); producto=producto.add(f.peso().multiply(f.ley().movePointLeft(2)));}
   if(registro.fundido()!=null && registro.fundido().compareTo(total)>0) throw new IllegalArgumentException("El fundido no puede superar el peso total");
   BigDecimal lectura=producto.divide(total,7,RoundingMode.HALF_UP);
   if(id==null) {
     id=jdbc.queryForObject("SELECT SEQ_PONDERACION.NEXTVAL FROM DUAL",Long.class);
     jdbc.update("INSERT INTO REG_PONDERACION(ID_REGISTRO,PESO_TOTAL,LECTURA,FUNDIDO) VALUES(?,?,?,?)",id,total,lectura,registro.fundido());
   } else {
     jdbc.update("UPDATE REG_PONDERACION SET PESO_TOTAL=?,LECTURA=?,FUNDIDO=? WHERE ID_REGISTRO=?",total,lectura,registro.fundido(),id);
     jdbc.update("DELETE FROM REG_PONDERACION_LEY WHERE ID_REGISTRO=?",id);
   }
   int numero=0;
   for(var f:registro.filas()) {
     Long ley=f.ley().movePointRight(4).longValueExact();
     jdbc.update("MERGE INTO LEYES_ORO d USING (SELECT ? ID_LEY, ? VALOR FROM DUAL) s ON (d.ID_LEY=s.ID_LEY) WHEN NOT MATCHED THEN INSERT(ID_LEY,VALOR) VALUES(s.ID_LEY,s.VALOR)",ley,f.ley());
     jdbc.update("INSERT INTO REG_PONDERACION_LEY VALUES(?,?,?,?)",id,++numero,ley,f.peso());
   }
   return obtener(id);
 }
 @GetMapping @Transactional(readOnly=true)
 public List<Map<String,Object>> listar() {
   return jdbc.queryForList("SELECT ID_REGISTRO FROM REG_PONDERACION ORDER BY ID_REGISTRO DESC").stream().map(r -> obtener(((Number)r.get("ID_REGISTRO")).longValue())).toList();
 }
 private Map<String,Object> obtener(Long id) {
   var registro=jdbc.queryForMap("SELECT ID_REGISTRO,TO_CHAR(FECHA,'YYYY-MM-DD') FECHA,PESO_TOTAL,LECTURA,FUNDIDO FROM REG_PONDERACION WHERE ID_REGISTRO=?",id);
   registro.put("FILAS",jdbc.queryForList("SELECT p.NUMERO,p.PESO,l.VALOR LEY FROM REG_PONDERACION_LEY p JOIN LEYES_ORO l ON l.ID_LEY=p.ID_LEY WHERE p.ID_REGISTRO=? ORDER BY p.NUMERO",id));
   return registro;
 }
}
