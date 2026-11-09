package pe.edu.upeu.sitraoro.acopio.mayorista.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.upeu.sitraoro.acopio.mayorista.dto.*;
import pe.edu.upeu.sitraoro.acopio.mayorista.entity.*;
import pe.edu.upeu.sitraoro.acopio.mayorista.repository.*;
import pe.edu.upeu.sitraoro.exception.ConflictException;
import pe.edu.upeu.sitraoro.exception.MayoristaReglaException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

/** Pago en PEN/USD, adelantos a centros de acopio y tablero diario del mayorista. */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class AdelantoMonedaDashboardIntegrationTest {
    private static final LocalDate HOY = LocalDate.now(ZoneId.of("America/Lima"));

    @Autowired RecepcionLeyService ley;
    @Autowired AdelantoService adelantos;
    @Autowired CajaService caja;
    @Autowired DashboardMayoristaService dashboard;
    @Autowired RecepcionMayoristaServiceImpl recepcionesService;
    @Autowired CentroAcopioRepository centros;
    @Autowired RecepcionMayoristaRepository recepciones;
    @Autowired JdbcTemplate jdbc;
    private CentroAcopio centro;

    @BeforeEach
    void preparar() {
        jdbc.execute("CREATE TABLE IF NOT EXISTS RECEPCION_ACUMULADA (ID_ORIGEN BIGINT, ID_ACUMULADA BIGINT)");
        centro = nuevoCentro();
        // Dinero en caja para que los adelantos de las pruebas tengan de dónde salir.
        caja.registrarManual(new CajaDtos.MovimientoManualRequest("INGRESO", "PEN", b("100000"), "Fondo de prueba", HOY, false));
        caja.registrarManual(new CajaDtos.MovimientoManualRequest("INGRESO", "USD", b("100000"), "Fondo de prueba", HOY, false));
    }

    @Test
    void pagoEnDolaresConvierteElNetoConElTipoDeCambioDeLaPartida() {
        var r = ley.guardar(recepcion(), request(0, "0", "USD", null, List.of()));
        assertEquals("USD", r.monedaPago());
        assertEquals(0, b("3.37").compareTo(r.tipoCambioPago()));
        assertEquals(r.total().divide(b("3.37"), 2, RoundingMode.HALF_UP), r.totalPagoMoneda());
    }

    @Test
    void pagoEnSolesEsElValorPorDefecto() {
        var r = ley.guardar(recepcion(), request(0, "0", null, null, List.of()));
        assertEquals("PEN", r.monedaPago());
        assertNull(r.tipoCambioPago());
        assertEquals(0, r.total().compareTo(r.totalPagoMoneda()));
    }

    @Test
    void adelantoEnDolaresSeDescuentaYVuelveAPendienteAlRevalorizar() {
        var adelanto = adelantos.registrar(new AdelantoRequest(centro.getIdCentroAcopio(), HOY, "USD", b("100"), b("3.5"), "Para transporte"));
        assertEquals(0, b("350.00").compareTo(adelanto.montoPen()));
        assertEquals(0, b("350.00").compareTo(adelantos.saldo(centro.getIdCentroAcopio()).saldoPen()));

        Long id = recepcion();
        var pagado = ley.guardar(id, request(0, "350", "PEN", null, List.of(adelanto.idAdelanto())));
        assertEquals(List.of(adelanto.idAdelanto()), pagado.idsAdelantos());
        assertEquals("DESCONTADO", adelantos.listar(centro.getIdCentroAcopio(), null).getFirst().estado());
        assertEquals(0, adelantos.saldo(centro.getIdCentroAcopio()).cantidadPendientes());

        ley.guardar(id, request(1, "0", "PEN", null, List.of()));
        var liberado = adelantos.listar(centro.getIdCentroAcopio(), null).getFirst();
        assertEquals("PENDIENTE", liberado.estado());
        assertNull(liberado.idRecepcion());
    }

    @Test
    void eliminarElLoteDevuelveElAdelantoAPendiente() {
        var adelanto = adelantos.registrar(new AdelantoRequest(centro.getIdCentroAcopio(), HOY, "PEN", b("50"), null, null));
        Long id = recepcion();
        ley.guardar(id, request(0, "50", "PEN", null, List.of(adelanto.idAdelanto())));
        recepcionesService.eliminar(id);
        assertEquals("PENDIENTE", adelantos.listar(centro.getIdCentroAcopio(), null).getFirst().estado());
    }

    @Test
    void rechazaAdelantoQueNoCubreLaSeleccionOQueEsDeOtroCentro() {
        var adelanto = adelantos.registrar(new AdelantoRequest(centro.getIdCentroAcopio(), HOY, "PEN", b("200"), null, null));
        Long id = recepcion();
        assertThrows(MayoristaReglaException.class,
                () -> ley.guardar(id, request(0, "100", "PEN", null, List.of(adelanto.idAdelanto()))));

        CentroAcopio otro = nuevoCentro();
        var ajeno = adelantos.registrar(new AdelantoRequest(otro.getIdCentroAcopio(), HOY, "PEN", b("10"), null, null));
        assertThrows(IllegalArgumentException.class,
                () -> ley.guardar(id, request(0, "10", "PEN", null, List.of(ajeno.idAdelanto()))));
    }

    @Test
    void adelantoEnDolaresExigeTipoDeCambioYSoloSeAnulaPendiente() {
        assertThrows(IllegalArgumentException.class,
                () -> adelantos.registrar(new AdelantoRequest(centro.getIdCentroAcopio(), HOY, "USD", b("10"), null, null)));
        var adelanto = adelantos.registrar(new AdelantoRequest(centro.getIdCentroAcopio(), HOY, "PEN", b("10"), null, null));
        assertEquals("ANULADO", adelantos.anular(adelanto.idAdelanto()).estado());
        assertThrows(ConflictException.class, () -> adelantos.anular(adelanto.idAdelanto()));
    }

    @Test
    void dashboardSumaElDineroQueEntraHoyYLosPagosPorMoneda() {
        var antes = dashboard.generar(null, null);
        var soles = ley.guardar(recepcion(), request(0, "0", "PEN", null, List.of()));
        var dolares = ley.guardar(recepcion(), request(0, "0", "USD", b("3.40"), List.of()));
        adelantos.registrar(new AdelantoRequest(centro.getIdCentroAcopio(), HOY, "PEN", b("25"), null, null));

        var despues = dashboard.generar(null, null);
        assertEquals(30, despues.serieDiaria().size());
        assertEquals(HOY, despues.hasta());
        assertEquals(antes.hoy().operaciones() + 2, despues.hoy().operaciones());
        assertEquals(0, antes.hoy().ingresoPen().add(soles.subtotal()).add(dolares.subtotal())
                .compareTo(despues.hoy().ingresoPen()));
        assertTrue(despues.hoy().ingresoUsd().compareTo(antes.hoy().ingresoUsd()) > 0);
        assertEquals(0, antes.hoy().adelantosEntregadosPen().add(b("25")).compareTo(despues.hoy().adelantosEntregadosPen()));
        assertEquals(0, antes.adelantos().saldoPendientePen().add(b("25")).compareTo(despues.adelantos().saldoPendientePen()));

        var usdAntes = moneda(antes, "USD");
        var usdDespues = moneda(despues, "USD");
        assertEquals(usdAntes.operaciones() + 1, usdDespues.operaciones());
        assertEquals(0, usdAntes.monto().add(dolares.totalPagoMoneda()).compareTo(usdDespues.monto()));
        assertEquals(antes.estados().valorizados() + 2, despues.estados().valorizados());
    }

    @Test
    void dashboardRechazaRangoInvertido() {
        assertThrows(IllegalArgumentException.class, () -> dashboard.generar(HOY, HOY.minusDays(1)));
    }

    private static DashboardMayoristaResponse.Moneda moneda(DashboardMayoristaResponse d, String codigo) {
        return d.pagosPorMoneda().stream().filter(m -> m.moneda().equals(codigo)).findFirst().orElseThrow();
    }

    private CentroAcopio nuevoCentro() {
        return centros.saveAndFlush(CentroAcopio.builder().nombre("Centro " + UUID.randomUUID()).zona("Pruebas")
                .direccion("Dirección de prueba").idCuentaAcopiador(Math.abs(UUID.randomUUID().getMostSignificantBits()))
                .activo(true).build());
    }

    private Long recepcion() {
        return recepciones.saveAndFlush(RecepcionMayorista.builder().fecha(HOY).centroAcopio(centro)
                .nombreAcopiador(centro.getNombre()).rojo(DatosOro.builder().pesoSinFundirG(b("100")).build())
                .verde(DatosOro.builder().build()).build()).getIdRecepcion();
    }

    private static RecepcionLeyRequest request(long revision, String adelanto, String moneda, BigDecimal tipoCambio,
                                               List<Long> idsAdelantos) {
        var partida = new RecepcionLeyRequest.Partida(b("4000"), b("90"), b("7.7"), b("3.37"), b("11"), b("10"));
        return new RecepcionLeyRequest(revision, b(adelanto), List.of(partida), moneda, tipoCambio, idsAdelantos);
    }

    private static BigDecimal b(String valor) { return new BigDecimal(valor); }
}
