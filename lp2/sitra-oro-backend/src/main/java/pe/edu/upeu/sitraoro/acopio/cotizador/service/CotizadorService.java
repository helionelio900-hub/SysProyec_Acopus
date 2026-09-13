package pe.edu.upeu.sitraoro.acopio.cotizador.service;

import pe.edu.upeu.sitraoro.acopio.cotizador.dto.CotizacionEstimadaResponse;
import java.math.BigDecimal;

public interface CotizadorService {
    CotizacionEstimadaResponse calcularCotizacionEstimada(BigDecimal pesoBrutoGramos);
}
