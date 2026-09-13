package pe.edu.upeu.sitraoro.solid.i.incorrecto;

// ❌ INCORRECTO: Viola el Principio de Segregación de Interfaces (I)
// Es una interfaz gigante 'gorda' que mezcla transacciones de ventanilla con reportes gerenciales y big data.
public interface OperacionesAcopioTotal {
    void registrarCompraOro(double gramos, double precio);
    void registrarPesoBalanza(double pesoBruto);
    void generarReporteGerencialPDF();
    void exportarBigDataAuditoriaCSV();
    void sincronizarCotizacionBolsaLondres();
}
