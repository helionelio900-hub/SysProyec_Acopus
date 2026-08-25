package pe.edu.upeu.bomerp.solid.o.incorrecto;

// ❌ INCORRECTO: Viola el Principio de Abierto/Cerrado (O)
// Usar cadenas de 'if/else' obliga a MODIFICAR esta clase cada vez que nace un nuevo tipo de minero o tarifa de descuento.
public class DescuentoAcopioService {

    public double calcularDescuento(String tipoMinero, double total) {
        if (tipoMinero.equals("ARTESANAL")) {
            return total * 0.05;
        }
        if (tipoMinero.equals("COOPERATIVA")) {
            return total * 0.10;
        }
        if (tipoMinero.equals("EMPRESA_MINERA")) {
            return total * 0.20;
        }
        return 0;
    }
}
