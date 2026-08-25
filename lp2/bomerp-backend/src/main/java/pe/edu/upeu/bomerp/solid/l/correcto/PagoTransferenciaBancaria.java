package pe.edu.upeu.bomerp.solid.l.correcto;

// ✅ Implementación de Transferencia Bancaria (Sustituye fielmente a MetodoPagoAcopio)
public class PagoTransferenciaBancaria implements MetodoPagoAcopio {

    private final String numeroCuenta;

    public PagoTransferenciaBancaria(String numeroCuenta) {
        this.numeroCuenta = numeroCuenta;
    }

    @Override
    public void procesarPago(double monto) {
        System.out.println("Transferencia de S/ " + monto + " realizada a la cuenta CCI: " + numeroCuenta);
    }

    @Override
    public String obtenerTipo() {
        return "TRANSFERENCIA_CCI";
    }
}
