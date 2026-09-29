package pe.edu.upeu.ejemplouml;

import java.math.BigDecimal;
import java.math.RoundingMode;

public class DetalleLiquidacion {
    private final TipoOro tipoOro;
    private final BigDecimal pesoFundidoG;
    private final BigDecimal precioGramoPen;

    public DetalleLiquidacion(TipoOro tipoOro, BigDecimal pesoFundidoG,
                              BigDecimal precioGramoPen) {
        if (tipoOro == null || pesoFundidoG == null || pesoFundidoG.signum() <= 0
                || precioGramoPen == null || precioGramoPen.signum() <= 0) {
            throw new IllegalArgumentException("Tipo, peso y precio deben ser válidos");
        }
        this.tipoOro = tipoOro;
        this.pesoFundidoG = pesoFundidoG;
        this.precioGramoPen = precioGramoPen;
    }

    public BigDecimal calcularSubtotal() {
        return pesoFundidoG.multiply(precioGramoPen).setScale(2, RoundingMode.HALF_UP);
    }

    public TipoOro getTipoOro() { return tipoOro; }
    public BigDecimal getPesoFundidoG() { return pesoFundidoG; }
    public BigDecimal getPrecioGramoPen() { return precioGramoPen; }
}
