package pe.edu.upeu.bomerp.solid.d.correcto;

// ✅ CORRECTO: Cumple el Principio de Inversión de Dependencias (D)
// Abstracción que desacopla el módulo de alto nivel de las implementaciones concretas.
public interface CanalNotificacion {
    void enviarMensaje(String destinatario, String mensaje);
}
