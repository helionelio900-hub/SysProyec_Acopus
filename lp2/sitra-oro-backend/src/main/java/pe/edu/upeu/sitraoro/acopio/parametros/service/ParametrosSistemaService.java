package pe.edu.upeu.sitraoro.acopio.parametros.service;

import java.math.BigDecimal;
import java.util.Optional;
import pe.edu.upeu.sitraoro.acopio.parametros.dto.CotizacionPublicada;
import pe.edu.upeu.sitraoro.acopio.parametros.dto.ParametrosVigentes;

public interface ParametrosSistemaService {

    ParametrosVigentes obtenerVigentes();
    Optional<CotizacionPublicada> obtenerCotizacionPublicada();
    void publicarCotizacion(BigDecimal cotizacionOnzaUsd, BigDecimal tipoCambioUsdPen);
}
