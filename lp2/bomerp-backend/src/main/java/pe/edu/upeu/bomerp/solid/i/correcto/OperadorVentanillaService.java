package pe.edu.upeu.bomerp.solid.i.correcto;

// ✅ CORRECTO: Implementa ÚNICAMENTE los métodos transaccionales que necesita
public class OperadorVentanillaService implements TransaccionalAcopio {

    @Override
    public void registrarCompraOro(double gramos, double precio) {
        System.out.println("Compra de ventanilla registrada por S/ " + (gramos * precio));
    }

    @Override
    public void registrarPesoBalanza(double pesoBruto) {
        System.out.println("Pesaje en balanza electrónica registrado: " + pesoBruto + " g");
    }
}
