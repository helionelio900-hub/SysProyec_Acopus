package pe.edu.upeu.sitraoro.solid.i.correcto;

// ✅ CORRECTO: Implementa ÚNICAMENTE los métodos de auditoría y reportería
public class AuditoriaGerencialService implements ReporteAuditoriaAcopio {

    @Override
    public void generarReporteGerencialPDF() {
        System.out.println("Generando informe gerencial de acopio en PDF");
    }

    @Override
    public void exportarBigDataAuditoriaCSV() {
        System.out.println("Exportando historial de compras a CSV para auditoría externa");
    }
}
