package pe.edu.upeu.sitraoro.acopio.mayorista.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.upeu.sitraoro.acopio.mayorista.dto.AdelantoRequest;
import pe.edu.upeu.sitraoro.acopio.mayorista.dto.CajaDtos.*;
import pe.edu.upeu.sitraoro.acopio.mayorista.dto.RecepcionLeyRequest;
import pe.edu.upeu.sitraoro.acopio.mayorista.entity.CentroAcopio;
import pe.edu.upeu.sitraoro.acopio.mayorista.entity.DatosOro;
import pe.edu.upeu.sitraoro.acopio.mayorista.entity.RecepcionMayorista;
import pe.edu.upeu.sitraoro.acopio.mayorista.repository.CentroAcopioRepository;
import pe.edu.upeu.sitraoro.acopio.mayorista.repository.RecepcionMayoristaRepository;
import pe.edu.upeu.sitraoro.exception.ConflictException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

/** Caja del mayorista: saldos separados por moneda y descuentos automáticos de pagos y adelantos. */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class CajaIntegrationTest {
    private static final LocalDate HOY = LocalDate.now(ZoneId.of("America/Lima"));

    @Autowired CajaService caja;
    @Autowired AdelantoService adelantos;
    @Autowired RecepcionLeyService ley;
    @Autowired RecepcionMayoristaServiceImpl recepcionesService;
    @Autowired CentroAcopioRepository centros;
    @Autowired RecepcionMayoristaRepository recepciones;
    @Autowired JdbcTemplate jdbc;
    private CentroAcopio centro;

    @BeforeEach
    void preparar() {
        jdbc.execute("CREATE TABLE IF NOT EXISTS RECEPCION_ACUMULADA (ID_ORIGEN BIGINT, ID_ACUMULADA BIGINT)");
        centro = centros.saveAndFlush(CentroAcopio.builder().nombre("Centro " + UUID.randomUUID()).zona("Pruebas")
                .direccion("Dirección").idCuentaAcopiador(Math.abs(UUID.randomUUID().getMostSignificantBits())).activo(true).build());
    }

    @Test
    void saldosEnSolesYDolaresNoSeMezclan() {
        var antes = caja.resumen();
        caja.registrarManual(new MovimientoManualRequest("INGRESO", "PEN", b("50000"), "Saldo de apertura", HOY, true));
        caja.registrarExportador(new IngresoExportadorRequest(b("12000"), b("3000"), null, null, HOY));
        caja.registrarManual(new MovimientoManualRequest("EGRESO", "PEN", b("500"), "Gastos de planta", HOY, false));

        var despues = caja.resumen();
        assertEquals(0, antes.saldoPen().add(b("52500")).compareTo(despues.saldoPen()));
        assertEquals(0, antes.saldoUsd().add(b("12000")).compareTo(despues.saldoUsd()));
    }

    @Test
    void exportadorExigeAlMenosUnMonto() {
        assertThrows(IllegalArgumentException.class,
                () -> caja.registrarExportador(new IngresoExportadorRequest(null, null, null, null, HOY)));
    }

    @Test
    void elAdelantoSaleDeLaCajaYVuelveSiSeAnula() {
        BigDecimal usd = caja.resumen().saldoUsd();
        var adelanto = adelantos.registrar(new AdelantoRequest(centro.getIdCentroAcopio(), HOY, "USD", b("200"), b("3.5"), null));
        assertEquals(0, usd.subtract(b("200")).compareTo(caja.resumen().saldoUsd()));
        adelantos.anular(adelanto.idAdelanto());
        assertEquals(0, usd.compareTo(caja.resumen().saldoUsd()));
    }

    @Test
    void elPagoDelLoteSeDescuentaUnaVezAunqueSeRevalorice() {
        BigDecimal pen = caja.resumen().saldoPen();
        BigDecimal usd = caja.resumen().saldoUsd();
        Long id = recepcion();
        var primero = ley.guardar(id, request(0, "PEN"));
        assertEquals(0, pen.subtract(primero.total()).compareTo(caja.resumen().saldoPen()));

        var segundo = ley.guardar(id, request(1, "USD"));
        assertEquals(0, pen.compareTo(caja.resumen().saldoPen()), "el pago en soles anterior debe anularse");
        assertEquals(0, usd.subtract(segundo.totalPagoMoneda()).compareTo(caja.resumen().saldoUsd()));

        recepcionesService.eliminar(id);
        assertEquals(0, usd.compareTo(caja.resumen().saldoUsd()), "al eliminar el lote su pago vuelve a la caja");
    }

    @Test
    void soloSeAnulanMovimientosManuales() {
        var manual = caja.registrarManual(new MovimientoManualRequest("INGRESO", "PEN", b("10"), "Prueba", HOY, false));
        assertTrue(manual.anulable());
        caja.anular(manual.idMovimiento());
        assertThrows(ConflictException.class, () -> caja.anular(manual.idMovimiento()));

        adelantos.registrar(new AdelantoRequest(centro.getIdCentroAcopio(), HOY, "PEN", b("30"), null, null));
        var automatico = caja.listar(null, null).stream().filter(m -> m.origen().equals("ADELANTO")).findFirst().orElseThrow();
        assertFalse(automatico.anulable());
        assertThrows(ConflictException.class, () -> caja.anular(automatico.idMovimiento()));
    }

    private Long recepcion() {
        return recepciones.saveAndFlush(RecepcionMayorista.builder().fecha(HOY).centroAcopio(centro)
                .nombreAcopiador(centro.getNombre()).rojo(DatosOro.builder().pesoSinFundirG(b("100")).build())
                .verde(DatosOro.builder().build()).build()).getIdRecepcion();
    }

    private static RecepcionLeyRequest request(long revision, String moneda) {
        var partida = new RecepcionLeyRequest.Partida(b("4000"), b("90"), b("7.7"), b("3.37"), b("11"), b("10"));
        return new RecepcionLeyRequest(revision, BigDecimal.ZERO, List.of(partida), moneda, null, List.of());
    }

    private static BigDecimal b(String valor) { return new BigDecimal(valor); }
}
