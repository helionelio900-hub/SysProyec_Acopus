package pe.edu.upeu.bomerp.acopio.acopiador.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pe.edu.upeu.bomerp.acopio.parametros.entity.ParametrosSistema;
import pe.edu.upeu.bomerp.acopio.parametros.repository.ParametrosSistemaRepository;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CalculadorPrecioOficialTest {

    @Mock
    private ParametrosSistemaRepository parametrosSistemaRepository;

    @InjectMocks
    private CalculadorPrecioOficialImpl calculadorPrecioOficial;

    @Test
    void determinarPrecioAplicado_conPrecioSolicitadoValido_retornaPrecioSolicitado() {
        BigDecimal resultado = calculadorPrecioOficial.determinarPrecioAplicado(new BigDecimal("300.00"));
        assertEquals(new BigDecimal("300.00"), resultado);
    }

    @Test
    void determinarPrecioAplicado_sinPrecioSolicitado_retornaPrecioDeParametrosSistema() {
        ParametrosSistema params = ParametrosSistema.builder()
                .precioDiarioGramoPen(new BigDecimal("290.00"))
                .build();
        when(parametrosSistemaRepository.findFirstByEstadoOrderByFechaDesc("ACTIVO"))
                .thenReturn(Optional.of(params));

        BigDecimal resultado = calculadorPrecioOficial.determinarPrecioAplicado(null);
        assertEquals(new BigDecimal("290.00"), resultado);
    }
}
