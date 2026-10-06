package pe.edu.upeu.sitraoro.acopio.acopiador.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.upeu.sitraoro.acopio.acopiador.dto.AcumuladosG2Response;
import pe.edu.upeu.sitraoro.acopio.acopiador.dto.TransaccionG2Request;
import pe.edu.upeu.sitraoro.acopio.acopiador.dto.TransaccionG2Response;
import pe.edu.upeu.sitraoro.acopio.acopiador.dto.ResumenPesoRecepcion;
import pe.edu.upeu.sitraoro.acopio.acopiador.entity.TransaccionG2;
import pe.edu.upeu.sitraoro.acopio.acopiador.mapper.TransaccionG2Mapper;
import pe.edu.upeu.sitraoro.acopio.acopiador.repository.TransaccionG2Repository;
import pe.edu.upeu.sitraoro.acopio.parametros.entity.Minero;
import pe.edu.upeu.sitraoro.acopio.parametros.service.MineroService;
import pe.edu.upeu.sitraoro.exception.ConflictException;
import pe.edu.upeu.sitraoro.exception.ResourceNotFoundException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AcopiadorServiceImpl implements AcopiadorService {

    private final TransaccionG2Repository transaccionG2Repository;
    private final MineroService mineroService;
    private final CalculadorPrecioOroService calculadorPrecioOroService;
    private final pe.edu.upeu.sitraoro.acopio.parametros.service.CotizacionColorService cotizacionColorService;
    private final TransaccionG2Mapper transaccionG2Mapper;

    @Override
    @Transactional
    public TransaccionG2Response registrarCompraDirecta(TransaccionG2Request request, Long idCentroAcopio) {
        Minero minero = buscarMineroOFallar(request.idMinero());

        BigDecimal precioAplicado = request.precioAplicadoPen() != null && request.precioAplicadoPen().signum() > 0
                ? request.precioAplicadoPen()
                : cotizacionColorService.precio(request.tipoOro().trim().toUpperCase(java.util.Locale.ROOT));

        BigDecimal totalPagado = request.pesoFundidoNetoG().multiply(precioAplicado).setScale(2, RoundingMode.HALF_UP);

        String tipoOroNormalizado = request.tipoOro().trim().toUpperCase();
        if (!"ROJO".equals(tipoOroNormalizado) && !"VERDE".equals(tipoOroNormalizado)) {
            throw new IllegalArgumentException("El tipo de oro debe ser 'ROJO' o 'VERDE'");
        }

        TransaccionG2 tx = transaccionG2Mapper.toEntity(request, minero);
        tx.setTipoOro(tipoOroNormalizado);
        tx.setPrecioAplicadoPen(precioAplicado);
        tx.setTotalPagadoPen(totalPagado);
        tx.setIdCentroAcopio(idCentroAcopio);

        TransaccionG2 saved = transaccionG2Repository.save(tx);
        return transaccionG2Mapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TransaccionG2Response> listarTransacciones(Long idCentroAcopio) {
        return transaccionG2Repository.findByIdCentroAcopioOrderByFechaTransaccionDesc(idCentroAcopio).stream()
                .map(transaccionG2Mapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<TransaccionG2Response> listarPorMinero(Long idMinero, Long idCentroAcopio) {
        buscarMineroOFallar(idMinero);
        return transaccionG2Repository.findByIdCentroAcopioAndMineroIdMinero(idCentroAcopio, idMinero).stream()
                .map(transaccionG2Mapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Long> idsComprasRecepcion(Long idRecepcionMayorista) {
        return transaccionG2Repository.findByIdRecepcionMayoristaOrderByIdTransaccionG2(idRecepcionMayorista)
                .stream().map(TransaccionG2::getIdTransaccionG2).toList();
    }

    @Override
    @Transactional
    public ResumenPesoRecepcion vincularComprasRecepcion(Long idRecepcionMayorista, Long idCentroAcopio, List<Long> idsCompras) {
        if (idsCompras == null || idsCompras.isEmpty() || idsCompras.size() > 200) {
            throw new IllegalArgumentException("Selecciona entre 1 y 200 compras del acopiador");
        }
        Set<Long> solicitadas = new HashSet<>(idsCompras);
        if (solicitadas.size() != idsCompras.size()) {
            throw new IllegalArgumentException("Una compra no puede repetirse en la recepción");
        }
        Set<Long> involucradas = new HashSet<>(solicitadas);
        involucradas.addAll(idsComprasRecepcion(idRecepcionMayorista));
        List<Long> ordenadas = new ArrayList<>(involucradas);
        ordenadas.sort(Long::compareTo);
        List<TransaccionG2> compras = transaccionG2Repository.bloquearPorIds(ordenadas);
        if (compras.size() != ordenadas.size()) {
            throw new ResourceNotFoundException("Una de las compras seleccionadas ya no existe");
        }
        BigDecimal rojoFundido = BigDecimal.ZERO;
        BigDecimal verdeFundido = BigDecimal.ZERO;
        boolean hayRojo = false;
        boolean hayVerde = false;
        for (TransaccionG2 compra : compras) {
            boolean seleccionada = solicitadas.contains(compra.getIdTransaccionG2());
            Long vinculada = compra.getIdRecepcionMayorista();
            if (seleccionada && !idCentroAcopio.equals(compra.getIdCentroAcopio())) {
                throw new ConflictException("La compra " + compra.getIdTransaccionG2() + " pertenece a otro centro");
            }
            if (vinculada != null && !vinculada.equals(idRecepcionMayorista)) {
                throw new ConflictException("La compra " + compra.getIdTransaccionG2() + " ya pertenece a otra recepción");
            }
            if (compra.getIdLiquidacionG1() != null) {
                throw new ConflictException("La compra " + compra.getIdTransaccionG2() + " ya está liquidada y no puede cambiarse");
            }
            if (seleccionada && compra.isAnulada()) {
                throw new ConflictException("La compra " + compra.getIdTransaccionG2() + " está anulada");
            }
            if (seleccionada && "ROJO".equals(compra.getTipoOro())) {
                rojoFundido = rojoFundido.add(compra.getPesoFundidoNetoG());
                hayRojo = true;
            } else if (seleccionada && "VERDE".equals(compra.getTipoOro())) {
                verdeFundido = verdeFundido.add(compra.getPesoFundidoNetoG());
                hayVerde = true;
            }
            compra.setIdRecepcionMayorista(seleccionada ? idRecepcionMayorista : null);
        }
        transaccionG2Repository.saveAll(compras);
        return new ResumenPesoRecepcion(
                hayRojo ? rojoFundido : null,
                hayVerde ? verdeFundido : null);
    }

    @Override
    @Transactional
    public void desvincularComprasRecepcion(Long idRecepcionMayorista) {
        List<Long> ids = idsComprasRecepcion(idRecepcionMayorista);
        if (ids.isEmpty()) return;
        List<TransaccionG2> compras = transaccionG2Repository.bloquearPorIds(ids);
        for (TransaccionG2 compra : compras) {
            if (compra.getIdLiquidacionG1() != null) {
                throw new ConflictException("La recepción contiene compras liquidadas y no puede eliminarse");
            }
            compra.setIdRecepcionMayorista(null);
        }
        transaccionG2Repository.saveAll(compras);
    }

    @Override
    @Transactional(readOnly = true)
    public AcumuladosG2Response obtenerAcumuladosSemanalesPorColor(Long idCentroAcopio) {
        BigDecimal gRojo = transaccionG2Repository.sumStockDisponibleByCentroAndTipoOro(idCentroAcopio, "ROJO");
        BigDecimal dRojo = transaccionG2Repository.sumTotalPagadoDisponibleByCentroAndTipoOro(idCentroAcopio, "ROJO");
        BigDecimal gVerde = transaccionG2Repository.sumStockDisponibleByCentroAndTipoOro(idCentroAcopio, "VERDE");
        BigDecimal dVerde = transaccionG2Repository.sumTotalPagadoDisponibleByCentroAndTipoOro(idCentroAcopio, "VERDE");

        return new AcumuladosG2Response(gRojo, dRojo, gVerde, dVerde);
    }

    @Override
    @Transactional(readOnly = true)
    public BigDecimal obtenerStockDisponibleGramos(String tipoOro, Long idCentroAcopio) {
        String normalizado = tipoOro.trim().toUpperCase();
        return transaccionG2Repository.sumStockDisponibleByCentroAndTipoOro(idCentroAcopio, normalizado);
    }

    @Override
    @Transactional
    public void descontarStockOro(String tipoOro, BigDecimal pesoGramos, Long idLiquidacionG1, Long idCentroAcopio) {
        String normalizado = tipoOro.trim().toUpperCase();
        List<TransaccionG2> lotesDisponibles = transaccionG2Repository
                .findStockDisponibleForUpdate(idCentroAcopio, normalizado);
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
