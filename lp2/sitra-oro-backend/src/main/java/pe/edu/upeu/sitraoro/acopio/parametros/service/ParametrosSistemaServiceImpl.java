package pe.edu.upeu.sitraoro.acopio.parametros.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.upeu.sitraoro.acopio.parametros.dto.CotizacionPublicada;
import pe.edu.upeu.sitraoro.acopio.parametros.dto.ParametrosVigentes;
import pe.edu.upeu.sitraoro.acopio.parametros.entity.ParametrosSistema;
import pe.edu.upeu.sitraoro.acopio.parametros.repository.ParametrosSistemaRepository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ParametrosSistemaServiceImpl implements ParametrosSistemaService {

    private static final BigDecimal PRECIO_REFERENCIAL = new BigDecimal("280.00");
    private static final BigDecimal MERMA_REFERENCIAL = new BigDecimal("5.00");

    private final ParametrosSistemaRepository parametrosSistemaRepository;

    @Override
    @Transactional(readOnly = true)
    public ParametrosVigentes obtenerVigentes() {
        ParametrosSistema parametros = parametrosSistemaRepository
                .findFirstByEstadoOrderByFechaDescIdParametroDesc("ACTIVO")
                .orElse(null);

        if (parametros == null) {
            return new ParametrosVigentes(PRECIO_REFERENCIAL, MERMA_REFERENCIAL);
        }

        BigDecimal precio = parametros.getPrecioDiarioGramoPen() != null
                ? parametros.getPrecioDiarioGramoPen()
                : PRECIO_REFERENCIAL;
        BigDecimal merma = parametros.getPorcentajeMermaEst() != null
                ? parametros.getPorcentajeMermaEst()
                : MERMA_REFERENCIAL;
        return new ParametrosVigentes(precio, merma);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<CotizacionPublicada> obtenerCotizacionPublicada() {
        return parametrosSistemaRepository.findFirstByEstadoOrderByFechaDescIdParametroDesc("ACTIVO")
                .filter(parametros -> parametros.getCotizacionOnzaUsd() != null
                        && parametros.getTipoCambioUsdPen() != null)
                .map(parametros -> new CotizacionPublicada(
                        parametros.getCotizacionOnzaUsd(), parametros.getTipoCambioUsdPen()));
    }

    @Override
    @Transactional
    public void publicarCotizacion(BigDecimal cotizacionOnzaUsd, BigDecimal tipoCambioUsdPen) {
        ParametrosSistema parametros = parametrosSistemaRepository
                .findFirstByEstadoOrderByFechaDescIdParametroDesc("ACTIVO")
                .orElseGet(() -> ParametrosSistema.builder()
                        .precioDiarioGramoPen(PRECIO_REFERENCIAL)
                        .porcentajeMermaEst(MERMA_REFERENCIAL)
                        .estado("ACTIVO")
                        .build());
        parametros.setFecha(LocalDate.now(ZoneId.of("America/Lima")));
        parametros.setCotizacionOnzaUsd(cotizacionOnzaUsd);
        parametros.setTipoCambioUsdPen(tipoCambioUsdPen);
        parametrosSistemaRepository.save(parametros);
    }
}
