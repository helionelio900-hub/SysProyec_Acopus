package pe.edu.upeu.sitraoro.acopio.acopiador.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.upeu.sitraoro.acopio.acopiador.dto.AjusteCompraRequest;
import pe.edu.upeu.sitraoro.acopio.acopiador.dto.AjusteCompraResponse;
import pe.edu.upeu.sitraoro.acopio.acopiador.entity.AjusteCompraG2;
import pe.edu.upeu.sitraoro.acopio.acopiador.entity.TransaccionG2;
import pe.edu.upeu.sitraoro.acopio.acopiador.repository.AjusteCompraG2Repository;
import pe.edu.upeu.sitraoro.acopio.acopiador.repository.TransaccionG2Repository;
import pe.edu.upeu.sitraoro.exception.ConflictException;
import pe.edu.upeu.sitraoro.exception.ResourceNotFoundException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AjusteCompraService {
    private final AjusteCompraG2Repository ajustes;
    private final TransaccionG2Repository compras;

    @Transactional
    public AjusteCompraResponse solicitar(Long idCompra, Long idCentro, String documentoAcopiador,
                                           AjusteCompraRequest request) {
        TransaccionG2 compra = compras.bloquearPorId(idCompra)
                .orElseThrow(() -> new ResourceNotFoundException("Compra no encontrada: " + idCompra));
        if (!idCentro.equals(compra.getIdCentroAcopio())) {
            throw new ResourceNotFoundException("Compra no encontrada: " + idCompra);
        }
        if (compra.isAnulada()) throw new ConflictException("La compra ya fue anulada");
        String tipo = request.tipo().trim().toUpperCase();
        if (!tipo.equals("EDICION") && !tipo.equals("ANULACION")) {
            throw new IllegalArgumentException("El tipo debe ser EDICION o ANULACION");
        }
        if (request.motivo().trim().length() < 8) {
            throw new IllegalArgumentException("Explica el motivo con al menos 8 caracteres");
        }
        AjusteCompraG2 ajuste = new AjusteCompraG2();
        ajuste.setIdTransaccionG2(idCompra);
        ajuste.setIdCentroAcopio(idCentro);
        ajuste.setIdMinero(compra.getMinero().getIdMinero());
        ajuste.setIdRecepcionMayorista(compra.getIdRecepcionMayorista());
        ajuste.setIdLiquidacionG1(compra.getIdLiquidacionG1());
        ajuste.setTipo(tipo);
        ajuste.setEstado("APROBADO");
        ajuste.setMotivo(request.motivo().trim());
        ajuste.setSolicitadoPor(documentoAcopiador);
        ajuste.setTipoOroAnterior(compra.getTipoOro());
        ajuste.setPesoSinFundirAnterior(compra.getPesoSinFundirG());
        ajuste.setPesoFundidoAnterior(compra.getPesoFundidoNetoG());
        ajuste.setPrecioAnterior(compra.getPrecioAplicadoPen());
        ajuste.setTotalAnterior(compra.getTotalPagadoPen());
        if (tipo.equals("EDICION")) {
            validarEdicion(request);
            ajuste.setTipoOroNuevo(request.tipoOroNuevo().trim().toUpperCase());
            ajuste.setPesoSinFundirNuevo(request.pesoSinFundirNuevo());
            ajuste.setPesoFundidoNuevo(request.pesoFundidoNuevo());
            ajuste.setPrecioNuevo(request.precioNuevo());
            BigDecimal totalNuevo = request.pesoFundidoNuevo().multiply(request.precioNuevo())
                    .setScale(2, RoundingMode.HALF_UP);
            if (totalNuevo.precision() > 12) {
                throw new IllegalArgumentException("El total corregido excede el límite permitido");
            }
            ajuste.setTotalNuevo(totalNuevo);
        }
        if (tipo.equals("ANULACION")) {
            compra.setAnulada(true);
        } else {
            compra.setTipoOro(ajuste.getTipoOroNuevo());
            compra.setPesoSinFundirG(ajuste.getPesoSinFundirNuevo());
            compra.setPesoFundidoNetoG(ajuste.getPesoFundidoNuevo());
            compra.setPrecioAplicadoPen(ajuste.getPrecioNuevo());
            compra.setTotalPagadoPen(ajuste.getTotalNuevo());
        }
        compras.save(compra);
        return respuesta(ajustes.save(ajuste));
    }

    @Transactional(readOnly = true)
    public List<AjusteCompraResponse> listarCentro(Long idCentro) {
        return ajustes.findByIdCentroAcopioOrderByFechaSolicitudDesc(idCentro).stream().map(this::respuesta).toList();
    }

    private void validarEdicion(AjusteCompraRequest request) {
        String oro = request.tipoOroNuevo() == null ? "" : request.tipoOroNuevo().trim().toUpperCase();
        if (!oro.equals("ROJO") && !oro.equals("VERDE")) {
            throw new IllegalArgumentException("Selecciona oro ROJO o VERDE");
        }
        if (!positivo(request.pesoSinFundirNuevo(), 10, 3)
                || !positivo(request.pesoFundidoNuevo(), 10, 3)
                || !positivo(request.precioNuevo(), 10, 2)) {
            throw new IllegalArgumentException("Los pesos y el precio deben ser positivos y tener hasta 3 y 2 decimales");
        }
    }

    private boolean positivo(BigDecimal valor, int precision, int escala) {
        return valor != null && valor.signum() > 0
                && valor.precision() <= precision && valor.scale() <= escala;
    }

    private AjusteCompraResponse respuesta(AjusteCompraG2 a) {
        return new AjusteCompraResponse(a.getIdAjuste(), a.getIdTransaccionG2(), a.getIdCentroAcopio(),
                a.getIdMinero(), a.getIdRecepcionMayorista(), a.getIdLiquidacionG1(),
                a.getTipo(), a.getEstado(), a.getMotivo(), a.getTipoOroAnterior(),
                a.getPesoSinFundirAnterior(), a.getPesoFundidoAnterior(), a.getPrecioAnterior(),
                a.getTotalAnterior(), a.getTipoOroNuevo(), a.getPesoSinFundirNuevo(),
                a.getPesoFundidoNuevo(), a.getPrecioNuevo(), a.getTotalNuevo(),
                a.getSolicitadoPor(), a.getFechaSolicitud(), a.getFechaDecisionMinero(),
                a.getDecididoPorMinero(), a.getFechaDecisionMayorista(),
                a.getDecididoPorMayorista());
    }
}
