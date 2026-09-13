package pe.edu.upeu.sitraoro.solid.i.correcto;

// ✅ CORRECTO: Cumple el Principio de Segregación de Interfaces (I)
// Interfaz pequeña y especializada únicamente en operaciones transaccionales de compra y pesaje.
public interface TransaccionalAcopio {
    void registrarCompraOro(double gramos, double precio);
    void registrarPesoBalanza(double pesoBruto);
}
