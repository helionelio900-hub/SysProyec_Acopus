package pe.edu.upeu.sitraoro.solid.i.correcto;

// ✅ CORRECTO: Cumple el Principio de Segregación de Interfaces (I)
// Interfaz pequeña y especializada únicamente en auditoría y reportería gerencial.
public interface ReporteAuditoriaAcopio {
    void generarReporteGerencialPDF();
    void exportarBigDataAuditoriaCSV();
}
