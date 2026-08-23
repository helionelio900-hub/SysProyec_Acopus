package pe.edu.upeu.bomerp.acopio.mayorista.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.upeu.bomerp.acopio.mayorista.dto.LiquidacionG1Request;
import pe.edu.upeu.bomerp.acopio.mayorista.dto.LiquidacionG1Response;
import pe.edu.upeu.bomerp.acopio.mayorista.entity.LiquidacionG1;
import pe.edu.upeu.bomerp.acopio.mayorista.repository.LiquidacionG1Repository;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MayoristaServiceImpl implements MayoristaService {

    private static final BigDecimal GRAMOS_POR_ONZA_TROY = new BigDecimal("31.1035");

    private final LiquidacionG1Repository liquidacionG1Repository;

    @Override
    @Transactional
    public LiquidacionG1Response procesarLiquidacionSemanal(LiquidacionG1Request request) {
        String tipoOro = request.tipoOro().trim().toUpperCase();
        if (!"ROJO".equals(tipoOro) && !"VERDE".equals(tipoOro)) {
            throw new IllegalArgumentException("El tipo de oro debe ser 'ROJO' o 'VERDE'");
        }

        // Fórmula Financiera Mayorista (G1):
        // Precio USD por Gramo = Onza USD / 31.1035
        BigDecimal precioUsdPorGramo = request.cotizacionOnzaUsd().divide(GRAMOS_POR_ONZA_TROY, 4, RoundingMode.HALF_UP);

        // Precio PEN por Gramo = Precio USD por Gramo * Tipo de Cambio Dólar
        BigDecimal precioGramoPen = precioUsdPorGramo.multiply(request.tipoCambioUsdPen()).setScale(2, RoundingMode.HALF_UP);

        // Ajuste por pureza de color (ej. Oro Verde 95% vs Oro Rojo 90% de pureza relativa)
        if ("VERDE".equals(tipoOro)) {
            precioGramoPen = precioGramoPen.multiply(new BigDecimal("1.05")).setScale(2, RoundingMode.HALF_UP);
        }

        // Total Pagado a G2 = Peso Total Fundido * Precio Derivado PEN
        BigDecimal totalPagadoG2 = request.pesoTotalFundidoG().multiply(precioGramoPen).setScale(2, RoundingMode.HALF_UP);

        LiquidacionG1 liquidacion = LiquidacionG1.builder()
                .nombreAcopiadorG2(request.nombreAcopiadorG2())
                .pesoTotalFundidoG(request.pesoTotalFundidoG())
                .tipoOro(tipoOro)
                .cotizacionOnzaUsd(request.cotizacionOnzaUsd())
                .tipoCambioUsdPen(request.tipoCambioUsdPen())
                .precioResultanteGramo(precioGramoPen)
                .totalPagadoG2Pen(totalPagadoG2)
                .build();

        LiquidacionG1 saved = liquidacionG1Repository.save(liquidacion);

        return new LiquidacionG1Response(
                saved.getIdLiquidacionG1(),
                saved.getNombreAcopiadorG2(),
                saved.getPesoTotalFundidoG(),
                saved.getTipoOro(),
                saved.getCotizacionOnzaUsd(),
                saved.getTipoCambioUsdPen(),
                saved.getPrecioResultanteGramo(),
                saved.getTotalPagadoG2Pen(),
                saved.getFechaLiquidacion()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<LiquidacionG1Response> listarLiquidaciones() {
        return liquidacionG1Repository.findAll().stream()
                .map(l -> new LiquidacionG1Response(
                        l.getIdLiquidacionG1(),
                        l.getNombreAcopiadorG2(),
                        l.getPesoTotalFundidoG(),
                        l.getTipoOro(),
                        l.getCotizacionOnzaUsd(),
                        l.getTipoCambioUsdPen(),
                        l.getPrecioResultanteGramo(),
                        l.getTotalPagadoG2Pen(),
                        l.getFechaLiquidacion()
                )).toList();
    }
}
