package pe.edu.upeu.bomerp.solid.l.correcto;

import java.util.List;

// ✅ Servicio Cliente: Demuestra que cualquier MetodoPagoAcopio sustituye a la interfaz sin romper el bucle ni lanzar excepciones
public class CajaAcopioService {

    public void liquidarPagos(List<MetodoPagoAcopio> metodosPago, double montoPorLiquidacion) {
        for (MetodoPagoAcopio metodo : metodosPago) {
            // Cumple Liskov: Se puede usar cualquier hijo indistintamente sin verificar 'instanceof' y sin que lance excepciones ilegales
            metodo.procesarPago(montoPorLiquidacion);
            System.out.println("Pago procesado correctamente vía: " + metodo.obtenerTipo());
        }
    }
}
