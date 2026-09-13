package pe.edu.upeu.sitraoro.solid.l.incorrecto;

public class PagoEfectivo implements MetodoPago {

    @Override
    public void procesarPago(double monto) {
        System.out.println("Pago en efectivo de S/ " + monto + " realizado con éxito");
    }
}
