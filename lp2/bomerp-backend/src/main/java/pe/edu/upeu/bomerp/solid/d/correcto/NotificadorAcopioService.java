package pe.edu.upeu.bomerp.solid.d.correcto;

// ✅ CORRECTO: Módulo de alto nivel que depende de una abstracción (Inversión de Dependencias)
public class NotificadorAcopioService {

    // Dependencia de la abstracción, NO de una clase concreta
    private final CanalNotificacion canalNotificacion;

    // Inyección por constructor (Dependency Injection)
    public NotificadorAcopioService(CanalNotificacion canalNotificacion) {
        this.canalNotificacion = canalNotificacion;
    }

    public void notificarLiquidacion(String destinatario, double monto) {
        canalNotificacion.enviarMensaje(destinatario, "Su liquidación por S/ " + monto + " está disponible.");
    }
}
