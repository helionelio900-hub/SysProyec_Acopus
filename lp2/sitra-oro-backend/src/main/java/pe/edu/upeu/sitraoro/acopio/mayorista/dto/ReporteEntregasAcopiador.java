package pe.edu.upeu.sitraoro.acopio.mayorista.dto;

import java.math.BigDecimal;
import java.util.List;

public record ReporteEntregasAcopiador(
        long totalRecepciones,
        BigDecimal pesoRojoFundidoG,
        BigDecimal pesoVerdeFundidoG,
        List<RecepcionMayoristaResponse> items
) {}
