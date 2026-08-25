package pe.edu.upeu.bomerp.solid.l.correcto;

// ✅ Implementación de Pago por Billetera Digital (Yape / Plin)
public class PagoBilleteraDigital implements MetodoPagoAcopio {

    private final String numeroCelular;

    public PagoBilleteraDigital(String numeroCelular) {
        this.numeroCelular = numeroCelular;
    }

    @Override
    public void procesarPago(double monto) {
        System.out.println("Pago móvil de S/ " + monto + " enviado al celular: " + numeroCelular);
    }

    @Override
    public String obtenerTipo() {
        return "BILLETERA_MOVIL";
    }
}
