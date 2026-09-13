package pe.edu.upeu.sitraoro.solid.l.correcto;

// ✅ Implementación de Pago en Efectivo (Sustituye a MetodoPagoAcopio sin romper nada)
public class PagoEfectivo implements MetodoPagoAcopio {

    @Override
    public void procesarPago(double monto) {
        System.out.println("Desembolso en efectivo de S/ " + monto + " entregado al minero.");
    }

    @Override
    public String obtenerTipo() {
        return "EFECTIVO_VENTANILLA";
    }
}
