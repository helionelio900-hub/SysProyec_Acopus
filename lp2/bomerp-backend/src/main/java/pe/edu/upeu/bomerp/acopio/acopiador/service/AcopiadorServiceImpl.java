package pe.edu.upeu.bomerp.acopio.acopiador.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.upeu.bomerp.acopio.acopiador.dto.AcumuladosG2Response;
import pe.edu.upeu.bomerp.acopio.acopiador.dto.TransaccionG2Request;
import pe.edu.upeu.bomerp.acopio.acopiador.dto.TransaccionG2Response;
import pe.edu.upeu.bomerp.acopio.acopiador.entity.TransaccionG2;
import pe.edu.upeu.bomerp.acopio.acopiador.mapper.TransaccionG2Mapper;
import pe.edu.upeu.bomerp.acopio.acopiador.repository.TransaccionG2Repository;
import pe.edu.upeu.bomerp.acopio.parametros.entity.Minero;
import pe.edu.upeu.bomerp.acopio.parametros.repository.MineroRepository;
import pe.edu.upeu.bomerp.exception.ResourceNotFoundException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

/*
 ===================================================================================
 ❌ FORMA INCORRECTA (VIOLACIÓN PRINCIPIOS S Y D - ANTES DE OPTIMIZAR):
 -----------------------------------------------------------------------------------
 public class AcopiadorServiceImpl {
     // Violación D: Instanciación directa con 'new' de una clase concreta
     private CalculadorPrecioOficialImpl calculador = new CalculadorPrecioOficialImpl();

     // Violación S: Mezclaba la lógica de obtención de precios dentro del registro
     public TransaccionG2Response registrarCompraDirecta(TransaccionG2Request request) {
         BigDecimal precio = (request.precioAplicadoPen() != null) ? request.precioAplicadoPen() : new BigDecimal("280.00");
         ...
     }
 }
 ===================================================================================
 ✅ FORMA CORRECTA (PATRÓN SOLID S Y D - CÓDIGO REAL EN PRODUCCIÓN):
 ===================================================================================
*/

@Service
@RequiredArgsConstructor
public class AcopiadorServiceImpl implements AcopiadorService {

    private final TransaccionG2Repository transaccionG2Repository;
    private final MineroRepository mineroRepository;
    private final CalculadorPrecioOroService calculadorPrecioOroService; // Cumple D: Inyección de la Interfaz
    private final TransaccionG2Mapper transaccionG2Mapper;

    @Override
    @Transactional
    public TransaccionG2Response registrarCompraDirecta(TransaccionG2Request request) {
        Minero minero = buscarMineroOFallar(request.idMinero());

        // Cumple S y O: Delega la determinación de precios a la estrategia del servicio
        BigDecimal precioAplicado = calculadorPrecioOroService.determinarPrecioAplicado(request.precioAplicadoPen());

        BigDecimal totalPagado = request.pesoFundidoNetoG().multiply(precioAplicado).setScale(2, RoundingMode.HALF_UP);

        String tipoOroNormalizado = request.tipoOro().trim().toUpperCase();
        if (!"ROJO".equals(tipoOroNormalizado) && !"VERDE".equals(tipoOroNormalizado)) {
            throw new IllegalArgumentException("El tipo de oro debe ser 'ROJO' o 'VERDE'");
        }

        TransaccionG2 tx = transaccionG2Mapper.toEntity(request, minero);
        tx.setTipoOro(tipoOroNormalizado);
        tx.setPrecioAplicadoPen(precioAplicado);
        tx.setTotalPagadoPen(totalPagado);

        TransaccionG2 saved = transaccionG2Repository.save(tx);
        return transaccionG2Mapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TransaccionG2Response> listarTransacciones() {
        return transaccionG2Repository.findAll().stream()
                .map(transaccionG2Mapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<TransaccionG2Response> listarPorMinero(Long idMinero) {
        buscarMineroOFallar(idMinero);
        return transaccionG2Repository.findByMineroIdMinero(idMinero).stream()
                .map(transaccionG2Mapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public AcumuladosG2Response obtenerAcumuladosSemanalesPorColor() {
        BigDecimal gRojo = transaccionG2Repository.sumPesoFundidoByTipoOro("ROJO");
        BigDecimal dRojo = transaccionG2Repository.sumTotalPagadoByTipoOro("ROJO");
        BigDecimal gVerde = transaccionG2Repository.sumPesoFundidoByTipoOro("VERDE");
        BigDecimal dVerde = transaccionG2Repository.sumTotalPagadoByTipoOro("VERDE");

        return new AcumuladosG2Response(gRojo, dRojo, gVerde, dVerde);
    }

    private Minero buscarMineroOFallar(Long idMinero) {
        return mineroRepository.findById(idMinero)
                .orElseThrow(() -> new ResourceNotFoundException("Minero no encontrado: " + idMinero));
    }
}
