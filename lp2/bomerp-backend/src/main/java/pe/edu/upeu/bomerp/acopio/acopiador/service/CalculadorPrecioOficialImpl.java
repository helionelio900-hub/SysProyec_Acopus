package pe.edu.upeu.bomerp.acopio.acopiador.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pe.edu.upeu.bomerp.acopio.parametros.entity.ParametrosSistema;
import pe.edu.upeu.bomerp.acopio.parametros.repository.ParametrosSistemaRepository;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class CalculadorPrecioOficialImpl implements CalculadorPrecioOroService {

    private final ParametrosSistemaRepository parametrosSistemaRepository;

    @Override
    public BigDecimal determinarPrecioAplicado(BigDecimal precioSolicitado) {
        if (precioSolicitado != null && precioSolicitado.compareTo(BigDecimal.ZERO) > 0) {
            return precioSolicitado;
        }

        ParametrosSistema params = parametrosSistemaRepository.findFirstByEstadoOrderByFechaDesc("ACTIVO").orElse(null);
        return (params != null && params.getPrecioDiarioGramoPen() != null)
                ? params.getPrecioDiarioGramoPen()
                : new BigDecimal("280.00");
    }
}
