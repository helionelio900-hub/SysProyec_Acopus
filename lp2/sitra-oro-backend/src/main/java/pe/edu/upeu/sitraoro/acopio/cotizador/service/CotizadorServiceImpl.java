package pe.edu.upeu.sitraoro.acopio.cotizador.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.upeu.sitraoro.acopio.cotizador.dto.CotizacionEstimadaResponse;
import pe.edu.upeu.sitraoro.acopio.parametros.dto.CotizacionPublicada;
import pe.edu.upeu.sitraoro.acopio.parametros.service.ParametrosSistemaService;
import pe.edu.upeu.sitraoro.exception.ResourceNotFoundException;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
@RequiredArgsConstructor
public class CotizadorServiceImpl implements CotizadorService {
    private static final BigDecimal GRAMOS_POR_ONZA_TROY = new BigDecimal("31.1035");

    private final ParametrosSistemaService parametrosSistemaService;

    @Override
    @Transactional(readOnly = true)
    public BigDecimal precioReferencialPorGramo() {
        CotizacionPublicada cotizacion = parametrosSistemaService.obtenerCotizacionPublicada()
                .orElseThrow(() -> new ResourceNotFoundException(
                        "El mayorista aún no publicó un precio referencial"));
        return cotizacion.cotizacionOnzaUsd().multiply(cotizacion.tipoCambioUsdPen())
                .divide(GRAMOS_POR_ONZA_TROY, 2, RoundingMode.HALF_UP);
    }

    @Override
    @Transactional(readOnly = true)
    public CotizacionEstimadaResponse calcularCotizacionEstimada(BigDecimal pesoBrutoGramos) {
        BigDecimal precioGramo = precioReferencialPorGramo();
        BigDecimal montoTotalEst = pesoBrutoGramos.multiply(precioGramo).setScale(2, RoundingMode.HALF_UP);

        return new CotizacionEstimadaResponse(
            pesoBrutoGramos,
            precioGramo,
            montoTotalEst,
            "Estimado con el precio referencial publicado por el mayorista. No es el pago final ni registra una venta."
        );
    }
}
