package pe.edu.upeu.sitraoro.acopio.acopiador.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pe.edu.upeu.sitraoro.acopio.parametros.dto.ParametrosVigentes;
import pe.edu.upeu.sitraoro.acopio.parametros.service.ParametrosSistemaService;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CalculadorPrecioOficialTest {

    @Mock
    private ParametrosSistemaService parametrosSistemaService;

    @InjectMocks
    private CalculadorPrecioOficialImpl calculadorPrecioOficial;

    @Test
    void determinarPrecioAplicado_conPrecioSolicitadoValido_retornaPrecioSolicitado() {
        BigDecimal resultado = calculadorPrecioOficial.determinarPrecioAplicado(new BigDecimal("300.00"));
        assertEquals(new BigDecimal("300.00"), resultado);
    }

    @Test
    void determinarPrecioAplicado_sinPrecioSolicitado_retornaPrecioDeParametrosSistema() {
        when(parametrosSistemaService.obtenerVigentes())
                .thenReturn(new ParametrosVigentes(new BigDecimal("290.00"), new BigDecimal("5.00")));

        BigDecimal resultado = calculadorPrecioOficial.determinarPrecioAplicado(null);
        assertEquals(new BigDecimal("290.00"), resultado);
    }
}
