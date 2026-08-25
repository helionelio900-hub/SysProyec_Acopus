package pe.edu.upeu.bomerp.solid.d.incorrecto;

// Clase concreta de bajo nivel
public class ServicioSmsEntelPeru {

    public void enviarSms(String celular, String mensaje) {
        System.out.println("Enviando SMS vía Entel Perú a " + celular + ": " + mensaje);
    }
}
