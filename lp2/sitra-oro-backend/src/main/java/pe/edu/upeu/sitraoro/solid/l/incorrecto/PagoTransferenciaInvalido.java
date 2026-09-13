package pe.edu.upeu.sitraoro.solid.l.incorrecto;

// ❌ INCORRECTO: Viola el Principio de Sustitución de Liskov (L)
// Esta clase hija no puede sustituir libremente a MetodoPago porque lanza una excepción no esperada
// que rompe la ejecución del sistema de pagos cuando se intenta usar.
public class PagoTransferenciaInvalido implements MetodoPago {

    @Override
    public void procesarPago(double monto) {
        // Violación de Liskov: Rompe el contrato de la interfaz lanzando excepción
        throw new UnsupportedOperationException("Error: Minero no cuenta con cuenta bancaria registrada");
    }
}
