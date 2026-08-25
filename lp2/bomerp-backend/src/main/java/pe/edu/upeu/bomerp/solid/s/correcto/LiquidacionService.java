package pe.edu.upeu.bomerp.solid.s.correcto;

// ✅ CORRECTO: Cumple el Principio de Responsabilidad Única (S)
// Esta clase tiene una sola razón para cambiar: el cálculo y cierre de liquidaciones mayoristas.
public class LiquidacionService {

    public void calcularLiquidacionMayorista(double totalGramos) {
        System.out.println("Calculando liquidacion semanal para " + totalGramos + " gramos");
    }
}
