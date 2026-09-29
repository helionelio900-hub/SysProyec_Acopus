package pe.edu.upeu.ejemplouml;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

public class CompraAcopio {
    private final long idCompra;
    private final BigDecimal pesoSinFundirG;
    private final BigDecimal pesoFundidoNetoG;
    private final TipoOro tipoOro;
    private final BigDecimal precioAplicadoPen;
    private final LocalDateTime fechaCompra;
    private Minero minero;
    private Long idLiquidacion;

    public CompraAcopio(long idCompra, BigDecimal pesoSinFundirG,
                        BigDecimal pesoFundidoNetoG, TipoOro tipoOro,
                        BigDecimal precioAplicadoPen) {
        if (pesoSinFundirG == null || pesoFundidoNetoG == null
                || pesoFundidoNetoG.signum() <= 0
                || pesoFundidoNetoG.compareTo(pesoSinFundirG) > 0) {
            throw new IllegalArgumentException("El peso neto debe ser positivo y no superar el peso sin fundir");
        }
        if (tipoOro == null || precioAplicadoPen == null || precioAplicadoPen.signum() <= 0) {
            throw new IllegalArgumentException("Tipo de oro y precio positivo son obligatorios");
        }
        this.idCompra = idCompra;
        this.pesoSinFundirG = pesoSinFundirG;
        this.pesoFundidoNetoG = pesoFundidoNetoG;
        this.tipoOro = tipoOro;
        this.precioAplicadoPen = precioAplicadoPen;
        this.fechaCompra = LocalDateTime.now();
    }

    void asociarMinero(Minero minero) { this.minero = minero; }

    public BigDecimal calcularTotalPagado() {
        return pesoFundidoNetoG.multiply(precioAplicadoPen).setScale(2, RoundingMode.HALF_UP);
    }

    void asociarLiquidacion(long idLiquidacion) { this.idLiquidacion = idLiquidacion; }

    public long getIdCompra() { return idCompra; }
    public BigDecimal getPesoSinFundirG() { return pesoSinFundirG; }
    public BigDecimal getPesoFundidoNetoG() { return pesoFundidoNetoG; }
    public TipoOro getTipoOro() { return tipoOro; }
    public BigDecimal getPrecioAplicadoPen() { return precioAplicadoPen; }
    public BigDecimal getTotalPagadoPen() { return calcularTotalPagado(); }
    public LocalDateTime getFechaCompra() { return fechaCompra; }
    public Minero getMinero() { return minero; }
    public Long getIdLiquidacion() { return idLiquidacion; }
}
