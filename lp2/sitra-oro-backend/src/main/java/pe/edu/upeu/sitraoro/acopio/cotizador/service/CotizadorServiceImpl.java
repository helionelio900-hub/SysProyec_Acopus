package pe.edu.upeu.sitraoro.acopio.cotizador.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.upeu.sitraoro.acopio.cotizador.dto.CotizacionEstimadaResponse;
import pe.edu.upeu.sitraoro.acopio.parametros.dto.ParametrosVigentes;
import pe.edu.upeu.sitraoro.acopio.parametros.service.ParametrosSistemaService;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
@RequiredArgsConstructor
public class CotizadorServiceImpl implements CotizadorService {

    private final ParametrosSistemaService parametrosSistemaService;

    @Override
    @Transactional(readOnly = true)
    public CotizacionEstimadaResponse calcularCotizacionEstimada(BigDecimal pesoBrutoGramos) {
        ParametrosVigentes parametros = parametrosSistemaService.obtenerVigentes();
        BigDecimal porcentajeMerma = parametros.porcentajeMermaEst();
        BigDecimal precioDia = parametros.precioDiarioGramoPen();

        // Fórmula: Peso Neto Estimado = Peso Bruto * (1 - %Merma / 100)
        BigDecimal factorMerma = BigDecimal.ONE.subtract(porcentajeMerma.divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP));
        BigDecimal pesoNetoEst = pesoBrutoGramos.multiply(factorMerma).setScale(3, RoundingMode.HALF_UP);

        // Monto Estimado = Peso Neto Estimado * Precio Diario
        BigDecimal montoTotalEst = pesoNetoEst.multiply(precioDia).setScale(2, RoundingMode.HALF_UP);

        return new CotizacionEstimadaResponse(
            pesoBrutoGramos,
            porcentajeMerma,
            pesoNetoEst,
            precioDia,
            montoTotalEst,
            "Cotización estimativa rápida. Esta sesión concluye al mostrar el resultado (no persiste transacción en BD)."
        );
    }
}
