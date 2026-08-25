package pe.edu.upeu.bomerp.solid.l.correcto;

// ✅ CORRECTO: Cumple el Principio de Sustitución de Liskov (L)
// Cualquier clase que implemente esta interfaz debe poder sustituirla sin romper el flujo del cliente.
public interface MetodoPagoAcopio {
    void procesarPago(double monto);
    String obtenerTipo();
}
