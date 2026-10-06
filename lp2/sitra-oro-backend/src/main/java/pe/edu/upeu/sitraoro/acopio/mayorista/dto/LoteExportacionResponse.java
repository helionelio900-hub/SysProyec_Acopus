package pe.edu.upeu.sitraoro.acopio.mayorista.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record LoteExportacionResponse(
        Long idLote,
        LocalDate fecha,
        String estado,
        BigDecimal pesoTotalFundidoG,
        LocalDateTime fechaPreparacion,
        List<Partida> partidas,
        List<Recepcion> recepciones
) {
    public record Recepcion(Long idRecepcion, String nombreAcopiador, BigDecimal pesoRojoG, BigDecimal pesoVerdeG) {}
    public record Partida(
            Long idLiquidacionG1,
            String nombreAcopiadorG2,
            BigDecimal pesoFundidoG,
            BigDecimal lecturaDecimal
    ) {}
}
