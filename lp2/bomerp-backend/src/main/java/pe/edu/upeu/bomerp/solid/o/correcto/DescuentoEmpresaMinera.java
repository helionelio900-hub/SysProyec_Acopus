package pe.edu.upeu.bomerp.solid.o.correcto;

// ✅ Implementación de Descuento para Empresas Mineras (20%)
public class DescuentoEmpresaMinera implements DescuentoAcopio {

    @Override
    public double calcular(double total) {
        return total * 0.20;
    }
}
