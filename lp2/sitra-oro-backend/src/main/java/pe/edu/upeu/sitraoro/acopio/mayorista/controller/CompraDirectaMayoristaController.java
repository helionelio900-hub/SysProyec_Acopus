package pe.edu.upeu.sitraoro.acopio.mayorista.controller;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.upeu.sitraoro.acopio.mayorista.dto.*;
import pe.edu.upeu.sitraoro.acopio.mayorista.entity.RecepcionMayorista;
import pe.edu.upeu.sitraoro.acopio.mayorista.repository.RecepcionMayoristaRepository;
import pe.edu.upeu.sitraoro.acopio.mayorista.service.RecepcionLeyService;

@RestController @RequiredArgsConstructor
public class CompraDirectaMayoristaController {
 private final RecepcionMayoristaRepository recepciones;
 private final RecepcionLeyService analisis;
 public record Compra(@NotNull @Valid RecepcionLeyRequest analisis) {}
 @PostMapping("/api/v1/mayorista/compras-directas") @ResponseStatus(HttpStatus.CREATED) @Transactional
 public RecepcionLeyResponse crear(@Valid @RequestBody Compra request) {
   analisis.calcular(request.analisis());
   var recepcion=new RecepcionMayorista();
   recepcion.setFecha(java.time.LocalDate.now(java.time.ZoneId.of("America/Lima")));
   recepcion.setCompraDirecta(true);
   recepcion.setNombreAcopiador("Compra directa");
   recepciones.saveAndFlush(recepcion);
   recepcion.setNombreAcopiador("Compra directa · Registro #"+recepcion.getIdRecepcion());
   return analisis.guardar(recepcion.getIdRecepcion(),new RecepcionLeyRequest(0L,request.analisis().adelanto(),request.analisis().detalles()));
 }
}
