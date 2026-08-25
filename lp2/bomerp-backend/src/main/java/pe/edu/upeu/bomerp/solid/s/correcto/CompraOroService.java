package pe.edu.upeu.bomerp.solid.s.correcto;

// ✅ CORRECTO: Cumple el Principio de Responsabilidad Única (S)
// Esta clase tiene una sola razón para cambiar: la transacción de compra de oro directo.
public class CompraOroService {

    public void registrarCompraOro(double gramos, double precioGramo) {
        double total = gramos * precioGramo;
        System.out.println("Registrando compra de oro: S/ " + total);
    }
}
