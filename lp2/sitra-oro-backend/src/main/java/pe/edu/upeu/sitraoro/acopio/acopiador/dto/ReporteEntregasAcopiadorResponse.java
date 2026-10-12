package pe.edu.upeu.sitraoro.acopio.acopiador.dto;

import java.math.BigDecimal;
import java.util.List;

public record ReporteEntregasAcopiadorResponse(
        long totalRecepciones,
        BigDecimal pesoRojoFundidoG,
        BigDecimal pesoVerdeFundidoG,
        List<EntregaMayoristaResponse> items
) {}
