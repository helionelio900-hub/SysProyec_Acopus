package pe.edu.upeu.sitraoro.acopio.mayorista.service;

import org.springframework.stereotype.Service;
import pe.edu.upeu.sitraoro.acopio.mayorista.dto.PrecioReferencialResponse;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
public class PrecioReferencialService {
    private static final BigDecimal GRAMOS_POR_ONZA_TROY = new BigDecimal("31.1035");

    public PrecioReferencialResponse calcular(BigDecimal cotizacionOnzaUsd, BigDecimal tipoCambioUsdPen) {
        if (cotizacionOnzaUsd == null || tipoCambioUsdPen == null
                || cotizacionOnzaUsd.signum() <= 0 || tipoCambioUsdPen.signum() <= 0) {
            throw new IllegalArgumentException("La cotización y el tipo de cambio deben ser mayores que cero");
        }
        BigDecimal precioGramoUsd = cotizacionOnzaUsd.divide(GRAMOS_POR_ONZA_TROY, 4, RoundingMode.HALF_UP);
        BigDecimal precioGramoPen = cotizacionOnzaUsd.multiply(tipoCambioUsdPen)
                .divide(GRAMOS_POR_ONZA_TROY, 2, RoundingMode.HALF_UP);
        return new PrecioReferencialResponse(cotizacionOnzaUsd, tipoCambioUsdPen,
                precioGramoUsd, precioGramoPen);
    }
}
