package pe.edu.upeu.ejemplouml;

import java.math.BigDecimal;

public class App {
    public static void main(String[] args) {
        Minero minero = new Minero(1L, "76543210", "Juan Pérez Quispe");
        CompraAcopio compra = new CompraAcopio(
                101L,
                new BigDecimal("12.500"),
                new BigDecimal("10.250"),
                TipoOro.ROJO,
                new BigDecimal("280.00")
        );
        minero.registrarCompra(compra);

        LiquidacionMayorista liquidacion = new LiquidacionMayorista(
                501L,
                "María Ramos (Acopiadora)",
                new BigDecimal("2350.00"),
                new BigDecimal("3.75")
        );
        liquidacion.agregarDetalle(new DetalleLiquidacion(
                TipoOro.ROJO,
                compra.getPesoFundidoNetoG(),
                new BigDecimal("282.50")
        ));
        liquidacion.asociarCompra(compra);

        System.out.println("Minero: " + minero.getNombresApellidos());
        System.out.println("Compras del minero: " + minero.getCompras().size());
        System.out.println("Tipo de oro: " + compra.getTipoOro());
        System.out.println("Pago al minero: S/ " + compra.getTotalPagadoPen());
        System.out.println("Estado de liquidación: " + liquidacion.getEstado());
        System.out.println("Total liquidado: S/ " + liquidacion.calcularTotalPagado());
        System.out.println("Compra asociada al cierre: " + compra.getIdLiquidacion());
    }
}
