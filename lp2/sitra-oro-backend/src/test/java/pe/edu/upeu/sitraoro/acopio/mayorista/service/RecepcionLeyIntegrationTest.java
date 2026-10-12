package pe.edu.upeu.sitraoro.acopio.mayorista.service;

import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.jdbc.core.JdbcTemplate;
import pe.edu.upeu.sitraoro.acopio.mayorista.dto.*;
import pe.edu.upeu.sitraoro.acopio.mayorista.entity.*;
import pe.edu.upeu.sitraoro.acopio.mayorista.repository.*;
import pe.edu.upeu.sitraoro.exception.ConflictException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest @ActiveProfiles("test") @Transactional
class RecepcionLeyIntegrationTest {
    @Autowired RecepcionLeyService service;
    @Autowired RecepcionMayoristaServiceImpl historico;
    @Autowired LoteExportacionService exportacion;
    @Autowired CentroAcopioRepository centros;
    @Autowired RecepcionMayoristaRepository recepciones;
    @Autowired DetalleRecepcionLeyRepository detalles;
    @Autowired LeyOroRepository leyes;
    @Autowired LoteExportacionRepository lotes;
    @Autowired JdbcTemplate jdbc;
    private CentroAcopio centro;

    @BeforeEach void preparar() {
        jdbc.execute("CREATE TABLE IF NOT EXISTS LOTE_RECEPCIONES (ID_RECEPCION BIGINT PRIMARY KEY REFERENCES MAYORISTA_RECEPCIONES(ID_RECEPCION), ID_LOTE BIGINT NOT NULL REFERENCES LOTES_EXPORTACION(ID_LOTE) ON DELETE CASCADE, PESO_ROJO_G DECIMAL(10,3) NOT NULL, PESO_VERDE_G DECIMAL(10,3) NOT NULL, PESO_FUNDIDO_G DECIMAL(14,3))");
        centro = centros.saveAndFlush(CentroAcopio.builder().nombre("Centro " + UUID.randomUUID()).zona("Pruebas")
                .direccion("Dirección de prueba").idCuentaAcopiador(Math.abs(UUID.randomUUID().getMostSignificantBits())).activo(true).build());
    }
    @Test void dosLotesCompartenLeyesYConservanPreciosIndependientes() {
        var a = service.guardar(recepcion(), request(0, "0", fila("90", "10"), fila("85", "20")));
        var b = service.guardar(recepcion(), request(0, "10", fila("90.0000", "5"), fila("80", "10")));
        assertEquals(a.detalles().getFirst().idLey(), b.detalles().getFirst().idLey());
        assertEquals(3, leyes.count());
        assertEquals(4, detalles.count());
        assertEquals(0, new BigDecimal("360.06").compareTo(a.detalles().getFirst().precioPen()));
        assertEquals(0, new BigDecimal("3600.60").compareTo(a.detalles().getFirst().totalPen()));
        assertEquals(0, b.subtotal().subtract(new BigDecimal("10")).compareTo(b.total()));
        var preciosAntes = b.detalles();
        service.guardar(a.idRecepcion(), request(1, "0", fila("90", "1")));
        assertEquals(preciosAntes, service.listar(centro.getIdCentroAcopio()).stream().filter(r -> r.idRecepcion().equals(b.idRecepcion())).findFirst().orElseThrow().detalles());
    }
    @Test void registraUnaLeyYDetectaEdicionObsoleta() {
        Long id = recepcion();
        var r = service.guardar(id, request(0, "0", fila("90", "10")));
        assertEquals(1, r.detalles().size()); assertEquals(1L, r.revision());
        assertThrows(ConflictException.class, () -> service.guardar(id, request(0, "0", fila("85", "1"))));
    }
    @Test void rechazaDetalleInvalidoSinReemplazarElRegistroAnterior() {
        Long id = recepcion();
        service.guardar(id, request(0, "0", fila("90", "10")));
        assertThrows(IllegalArgumentException.class, () -> service.guardar(id, request(1, "0", fila("85", "2"), fila("85.0", "3"))));
        assertThrows(IllegalArgumentException.class, () -> service.guardar(id, request(1, "999999", fila("85", "2"))));
        var malPeso = new RecepcionLeyRequest.Partida(b("4000"), b("90"), b("7.7"), b("3.37"), b("1"), b("2"));
        assertThrows(IllegalArgumentException.class, () -> service.guardar(id, request(1, "0", malPeso)));
        assertEquals(1, detalles.findByRecepcion_IdRecepcionOrderByIdDetalle(id).size());
        assertEquals(1L, recepciones.findById(id).orElseThrow().getRevisionLey());
    }
    @Test void rechazaValoresFueraDeRangoYPartidasVacias() {
        assertThrows(IllegalArgumentException.class, () -> service.calcular(request(0, "0")));
        assertThrows(IllegalArgumentException.class, () -> service.calcular(request(0, "0", fila("100.1", "2"))));
        assertThrows(IllegalArgumentException.class, () -> service.calcular(request(0, "0", fila("0", "2"))));
        var porcentaje = new RecepcionLeyRequest.Partida(b("4000"), b("90"), b("100"), b("3.37"), b("2"), b("1"));
        assertThrows(IllegalArgumentException.class, () -> service.calcular(request(0, "0", porcentaje)));
    }
    @Test void exportaPesosPorLeyYPermitePrepararElBorrador() {
        Long id = recepcion();
        service.guardar(id, request(0, "0", fila("90", "10"), fila("85", "20")));
        var lote = exportacion.crearDesdeRecepciones(List.of(id));
        assertEquals(0, b("30").compareTo(lote.pesoTotalFundidoG()));
        assertEquals(2, lote.recepciones().getFirst().leyes().size());
        assertThrows(ConflictException.class, () -> service.guardar(id, request(1, "0", fila("90", "1"))));
        assertThrows(ConflictException.class, () -> historico.eliminar(id));
        var preparado = exportacion.preparar(lote.idLote());
        assertEquals("PREPARADO", preparado.estado());
        assertThrows(ConflictException.class, () -> exportacion.eliminar(lote.idLote()));
    }
    @Test void conservaRecepcionesAnterioresSinInventarLeyes() {
        Long id = recepcion();
        var r = service.listar(centro.getIdCentroAcopio()).getFirst();
        assertEquals(id, r.idRecepcion()); assertTrue(r.detalles().isEmpty());
        assertEquals("PENDIENTE", r.estado());
        assertThrows(IllegalArgumentException.class, () -> exportacion.crearDesdeRecepciones(List.of(id)));
    }
    @Test @Transactional(propagation = org.springframework.transaction.annotation.Propagation.NOT_SUPPORTED)
    void revierteCabeceraYVinculosSiFallaLaSegundaRecepcion() {
        Long valido = recepcion();
        Long pendiente = recepcion();
        try {
            service.guardar(valido, request(0, "0", fila("90", "10")));
            long antes = lotes.count();
            assertThrows(IllegalArgumentException.class, () -> exportacion.crearDesdeRecepciones(List.of(valido, pendiente)));
            assertEquals(antes, lotes.count());
            assertEquals(0, jdbc.queryForObject("SELECT COUNT(*) FROM LOTE_RECEPCIONES WHERE ID_RECEPCION = ?", Integer.class, valido));
            assertEquals("VALORIZADO", service.listar(centro.getIdCentroAcopio()).stream().filter(r -> r.idRecepcion().equals(valido)).findFirst().orElseThrow().estado());
        } finally {
            jdbc.update("DELETE FROM RECEPCION_LEYES WHERE ID_RECEPCION IN (?, ?)", valido, pendiente);
            recepciones.deleteById(valido); recepciones.deleteById(pendiente);
            centros.deleteById(centro.getIdCentroAcopio());
            jdbc.update("DELETE FROM LEYES_ORO WHERE ID_LEY = 900000 AND NOT EXISTS (SELECT 1 FROM RECEPCION_LEYES WHERE ID_LEY = 900000)");
        }
    }
    private Long recepcion() {
        return recepciones.saveAndFlush(RecepcionMayorista.builder().fecha(LocalDate.now()).centroAcopio(centro)
                .nombreAcopiador(centro.getNombre()).rojo(DatosOro.builder().pesoSinFundirG(b("100")).build())
                .verde(DatosOro.builder().build()).build()).getIdRecepcion();
    }
    private static RecepcionLeyRequest request(long revision, String adelanto, RecepcionLeyRequest.Partida... filas) {
        return new RecepcionLeyRequest(revision, b(adelanto), List.of(filas));
    }
    private static RecepcionLeyRequest.Partida fila(String ley, String peso) {
        return new RecepcionLeyRequest.Partida(b("4000"), b(ley), b("7.7"), b("3.37"), b(peso).add(BigDecimal.ONE), b(peso));
    }
    private static BigDecimal b(String valor) { return new BigDecimal(valor); }
}
