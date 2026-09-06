package pe.edu.upeu.sitraoro.solid.o.correcto;

// ✅ CORRECTO: Cumple el Principio de Abierto/Cerrado (O)
// Esta interfaz define el contrato. El sistema queda abierto para extenderse con nuevas clases sin modificar código existente.
public interface DescuentoAcopio {
    double calcular(double total);
}
