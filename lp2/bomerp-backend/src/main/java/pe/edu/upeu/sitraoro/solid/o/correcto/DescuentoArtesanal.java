package pe.edu.upeu.sitraoro.solid.o.correcto;

// ✅ Implementación de Descuento para Mineros Artesanales (5%)
public class DescuentoArtesanal implements DescuentoAcopio {

    @Override
    public double calcular(double total) {
        return total * 0.05;
    }
}
