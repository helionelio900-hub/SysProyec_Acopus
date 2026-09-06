package pe.edu.upeu.sitraoro.solid.s.correcto;

// ✅ CORRECTO: Cumple el Principio de Responsabilidad Única (S)
// Esta clase tiene una sola razón para cambiar: la gestión y registro de mineros.
public class MineroService {

    public void registrarMinero(String dni, String nombre) {
        System.out.println("Registrando minero: " + nombre);
    }
}
