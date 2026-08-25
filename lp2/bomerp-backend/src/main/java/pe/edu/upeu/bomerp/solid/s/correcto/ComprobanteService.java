package pe.edu.upeu.bomerp.solid.s.correcto;

// ✅ CORRECTO: Cumple el Principio de Responsabilidad Única (S)
// Esta clase tiene una sola razón para cambiar: el formato y generación de comprobantes.
public class ComprobanteService {

    public void generarComprobante() {
        System.out.println("Generando comprobante de pago");
    }
}
