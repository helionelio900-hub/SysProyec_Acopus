package pe.edu.upeu.bomerp.solid.s.incorrecto;

// ❌ INCORRECTO: Viola el Principio de Responsabilidad Única (S)
// Esta clase tiene múltiples razones para cambiar: gestión de mineros, compra de oro, facturación y liquidación.
public class AcopioService {

    public void registrarMinero(String dni, String nombre) {
        System.out.println("Registrando minero en BD: " + nombre);
    }

    public void registrarCompraOro(double gramos, double precioGramo) {
        double total = gramos * precioGramo;
        System.out.println("Compra de oro registrada por total: " + total);
    }

    public void generarComprobante() {
        System.out.println("Generando comprobante de pago en PDF");
    }

    public void calcularLiquidacionMayorista(double totalGramos) {
        System.out.println("Calculando liquidacion mayorista para " + totalGramos + " gramos");
    }
}
