package pe.edu.upeu.sitraoro.acopio.mayorista.dto;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record RecepcionLeyResponse(Long idRecepcion, LocalDate fecha, Long idCentroAcopio,
        String nombreAcopiador, long revision, String estado, Long idLoteExportacion,
        BigDecimal pesoDeclaradoG, BigDecimal pesoRojoSinFundirG, BigDecimal pesoVerdeSinFundirG,
        BigDecimal pesoFundidoG, BigDecimal subtotal,
        BigDecimal adelanto, BigDecimal total, List<Detalle> detalles) {
    public record Detalle(Long idLey, BigDecimal onza, BigDecimal ley, BigDecimal porcentaje,
            BigDecimal tipoCambio, BigDecimal pesoSinFundirG, BigDecimal pesoFundidoG,
            BigDecimal precioUsd, BigDecimal precioPen, BigDecimal totalPen) {}
    public record Calculo(List<Detalle> detalles, BigDecimal pesoFundidoG, BigDecimal subtotal,
            BigDecimal adelanto, BigDecimal total) {}
}
