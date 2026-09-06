package pe.edu.upeu.sitraoro.solid.d.correcto;

// ✅ Implementación concreta que depende de la abstracción CanalNotificacion
public class NotificacionWhatsApp implements CanalNotificacion {

    @Override
    public void enviarMensaje(String destinatario, String mensaje) {
        System.out.println("Enviando mensaje WhatsApp a " + destinatario + ": " + mensaje);
    }
}
