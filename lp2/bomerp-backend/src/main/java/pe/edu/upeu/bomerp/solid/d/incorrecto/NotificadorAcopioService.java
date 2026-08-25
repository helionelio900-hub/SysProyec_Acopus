package pe.edu.upeu.bomerp.solid.d.incorrecto;

// ❌ INCORRECTO: Viola el Principio de Inversión de Dependencias (D)
// Esta clase de alto nivel depende directamente de una clase concreta de bajo nivel e instancializa con 'new'
public class NotificadorAcopioService {

    // Violación D: Dependencia directa y creación rígida con 'new'
    private ServicioSmsEntelPeru servicioSms = new ServicioSmsEntelPeru();

    public void notificarLiquidacion(String celular, double monto) {
        servicioSms.enviarSms(celular, "Su liquidación por S/ " + monto + " está disponible.");
    }
}
