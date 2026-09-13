package pe.edu.upeu.sitraoro.acopio.acopiador.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.upeu.sitraoro.acopio.acopiador.dto.AcumuladosG2Response;
import pe.edu.upeu.sitraoro.acopio.acopiador.dto.TransaccionG2Request;
import pe.edu.upeu.sitraoro.acopio.acopiador.dto.TransaccionG2Response;
import pe.edu.upeu.sitraoro.acopio.acopiador.entity.TransaccionG2;
import pe.edu.upeu.sitraoro.acopio.acopiador.mapper.TransaccionG2Mapper;
import pe.edu.upeu.sitraoro.acopio.acopiador.repository.TransaccionG2Repository;
import pe.edu.upeu.sitraoro.acopio.parametros.entity.Minero;
import pe.edu.upeu.sitraoro.acopio.parametros.service.MineroService;

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
    private final MineroService mineroService;
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
        BigDecimal gRojo = transaccionG2Repository.sumStockDisponibleByTipoOro("ROJO");
        BigDecimal dRojo = transaccionG2Repository.sumTotalPagadoDisponibleByTipoOro("ROJO");
        BigDecimal gVerde = transaccionG2Repository.sumStockDisponibleByTipoOro("VERDE");
        BigDecimal dVerde = transaccionG2Repository.sumTotalPagadoDisponibleByTipoOro("VERDE");

        return new AcumuladosG2Response(gRojo, dRojo, gVerde, dVerde);
    }

    @Override
    @Transactional(readOnly = true)
    public BigDecimal obtenerStockDisponibleGramos(String tipoOro) {
        String normalizado = tipoOro.trim().toUpperCase();
        return transaccionG2Repository.sumStockDisponibleByTipoOro(normalizado);
    }

    @Override
    @Transactional
    public void descontarStockOro(String tipoOro, BigDecimal pesoGramos, Long idLiquidacionG1) {
        String normalizado = tipoOro.trim().toUpperCase();
        List<TransaccionG2> lotesDisponibles = transaccionG2Repository
                .findStockDisponibleForUpdate(normalizado);
        BigDecimal disponible = lotesDisponibles.stream()
                .map(TransaccionG2::getPesoFundidoNetoG)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (disponible.compareTo(pesoGramos) != 0) {
            throw new pe.edu.upeu.sitraoro.exception.StockInsuficienteException(
                    "El cierre semanal de oro " + normalizado
                            + " debe coincidir con todo el stock disponible: "
                            + disponible + "g disponibles, " + pesoGramos + "g solicitados"
            );
        }

        lotesDisponibles.forEach(lote -> lote.setIdLiquidacionG1(idLiquidacionG1));
        transaccionG2Repository.saveAll(lotesDisponibles);
    }

    private Minero buscarMineroOFallar(Long idMinero) {
        return mineroService.obtenerEntidad(idMinero);
    }
}
