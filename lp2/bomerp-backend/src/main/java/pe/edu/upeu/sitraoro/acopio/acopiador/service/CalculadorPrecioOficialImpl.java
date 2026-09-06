package pe.edu.upeu.sitraoro.acopio.acopiador.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pe.edu.upeu.sitraoro.acopio.parametros.entity.ParametrosSistema;
import pe.edu.upeu.sitraoro.acopio.parametros.repository.ParametrosSistemaRepository;

import java.math.BigDecimal;

/*
 ===================================================================================
 ❌ FORMA INCORRECTA (VIOLACIÓN PRINCIPIO O - ANTES DE OPTIMIZAR):
 -----------------------------------------------------------------------------------
 public class CalculadorPrecioOroService {
     // Violación de O: Usar bloques 'if/else' obliga a modificar esta clase cada vez que nace un nuevo tipo de cotización
     public BigDecimal determinarPrecio(String tipoCotizacion, BigDecimal precioSolicitado) {
         if ("OFICIAL".equals(tipoCotizacion)) { return new BigDecimal("280.00"); }
         if ("INTERNACIONAL".equals(tipoCotizacion)) { return new BigDecimal("285.50"); }
         return new BigDecimal("270.00");
     }
 }
 ===================================================================================
 ✅ FORMA CORRECTA (PATRÓN SOLID O - CÓDIGO REAL EN PRODUCCIÓN):
 ===================================================================================
 Se usa la interfaz CalculadorPrecioOroService (abierta a extensión) y esta clase
 implementa la estrategia oficial sin condicionales rígidos.
*/

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
