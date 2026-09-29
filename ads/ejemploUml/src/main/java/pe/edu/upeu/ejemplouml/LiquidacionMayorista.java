package pe.edu.upeu.ejemplouml;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;

public class LiquidacionMayorista {
    private final long idLiquidacion;
    private final String nombreAcopiador;
    private final BigDecimal cotizacionOnzaUsd;
    private final BigDecimal tipoCambioUsdPen;
    private final LocalDateTime fechaLiquidacion;
    private final List<DetalleLiquidacion> detalles = new ArrayList<>();
    private EstadoLiquidacion estado = EstadoLiquidacion.REGISTRADA;

    public LiquidacionMayorista(long idLiquidacion, String nombreAcopiador,
                                BigDecimal cotizacionOnzaUsd, BigDecimal tipoCambioUsdPen) {
        this.idLiquidacion = idLiquidacion;
        this.nombreAcopiador = nombreAcopiador;
        this.cotizacionOnzaUsd = cotizacionOnzaUsd;
        this.tipoCambioUsdPen = tipoCambioUsdPen;
        this.fechaLiquidacion = LocalDateTime.now();
    }

    public void agregarDetalle(DetalleLiquidacion detalle) {
        if (detalle == null) throw new IllegalArgumentException("El detalle es obligatorio");
        if (detalles.size() >= 2) throw new IllegalStateException("El cierre admite hasta dos tipos de oro");
        boolean tipoYaIncluido = detalles.stream()
                .anyMatch(actual -> actual.getTipoOro() == detalle.getTipoOro());
        if (tipoYaIncluido) throw new IllegalArgumentException("El tipo de oro ya está incluido");
        detalles.add(detalle);
    }

    public BigDecimal calcularTotalPagado() {
        return detalles.stream().map(DetalleLiquidacion::calcularSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public BigDecimal calcularPesoTotalFundidoG() {
        return detalles.stream().map(DetalleLiquidacion::getPesoFundidoG)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public void asociarCompra(CompraAcopio compra) {
        compra.asociarLiquidacion(idLiquidacion);
    }

    public void anular() { estado = EstadoLiquidacion.ANULADA; }

    public Set<TipoOro> getTiposIncluidos() {
        Set<TipoOro> tipos = EnumSet.noneOf(TipoOro.class);
        detalles.forEach(detalle -> tipos.add(detalle.getTipoOro()));
        return Collections.unmodifiableSet(tipos);
    }

    public long getIdLiquidacion() { return idLiquidacion; }
    public String getNombreAcopiador() { return nombreAcopiador; }
    public EstadoLiquidacion getEstado() { return estado; }
    public BigDecimal getCotizacionOnzaUsd() { return cotizacionOnzaUsd; }
    public BigDecimal getTipoCambioUsdPen() { return tipoCambioUsdPen; }
    public LocalDateTime getFechaLiquidacion() { return fechaLiquidacion; }
    public List<DetalleLiquidacion> getDetalles() { return Collections.unmodifiableList(detalles); }
}
