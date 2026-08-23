package pe.edu.upeu.bomerp.acopio.cotizador.service;

import pe.edu.upeu.bomerp.acopio.cotizador.dto.CotizacionEstimadaResponse;
import java.math.BigDecimal;

public interface CotizadorService {
    CotizacionEstimadaResponse calcularCotizacionEstimada(BigDecimal pesoBrutoGramos);
}
