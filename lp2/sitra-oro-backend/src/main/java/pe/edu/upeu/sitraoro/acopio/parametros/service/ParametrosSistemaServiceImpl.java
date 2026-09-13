package pe.edu.upeu.sitraoro.acopio.parametros.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.upeu.sitraoro.acopio.parametros.dto.ParametrosVigentes;
import pe.edu.upeu.sitraoro.acopio.parametros.entity.ParametrosSistema;
import pe.edu.upeu.sitraoro.acopio.parametros.repository.ParametrosSistemaRepository;

import java.math.BigDecimal;

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
                .findFirstByEstadoOrderByFechaDesc("ACTIVO")
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
}
