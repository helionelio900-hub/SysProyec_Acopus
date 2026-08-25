package pe.edu.upeu.bomerp.solid.o.correcto;

// ✅ Implementación de Descuento para Cooperativas Mineras (10%)
public class DescuentoCooperativa implements DescuentoAcopio {

    @Override
    public double calcular(double total) {
        return total * 0.10;
    }
}
