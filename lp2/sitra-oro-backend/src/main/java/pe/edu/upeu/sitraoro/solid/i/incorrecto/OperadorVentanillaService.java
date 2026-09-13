package pe.edu.upeu.sitraoro.solid.i.incorrecto;

// ❌ INCORRECTO: Obligado a implementar métodos que NO utiliza
public class OperadorVentanillaService implements OperacionesAcopioTotal {

    @Override
    public void registrarCompraOro(double gramos, double precio) {
        System.out.println("Compra de ventanilla registrada");
    }

    @Override
    public void registrarPesoBalanza(double pesoBruto) {
        System.out.println("Peso de balanza registrado: " + pesoBruto);
    }

    // ❌ Métodos forzados que el operador de ventanilla no usa:
    @Override
    public void generarReporteGerencialPDF() {
        // Violación I: Método vacío forzado
    }

    @Override
    public void exportarBigDataAuditoriaCSV() {
        // Violación I: Método vacío forzado
    }

    @Override
    public void sincronizarCotizacionBolsaLondres() {
        // Violación I: Método vacío forzado
    }
}
