package pe.edu.upeu.sitraoro.acopio.acopiador.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.upeu.sitraoro.acopio.acopiador.dto.CajaAcopioDtos.IngresoMayoristaRequest;
import pe.edu.upeu.sitraoro.acopio.acopiador.dto.CajaAcopioDtos.MovimientoManualRequest;
import pe.edu.upeu.sitraoro.acopio.acopiador.dto.CompraG2Request;
import pe.edu.upeu.sitraoro.acopio.acopiador.dto.PartidaCompraRequest;
import pe.edu.upeu.sitraoro.acopio.acopiador.dto.PrestamoDtos.PrestamoRequest;
import pe.edu.upeu.sitraoro.acopio.parametros.entity.Minero;
import pe.edu.upeu.sitraoro.acopio.parametros.repository.MineroRepository;
import pe.edu.upeu.sitraoro.exception.ConflictException;
import pe.edu.upeu.sitraoro.exception.ResourceNotFoundException;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

/** Caja del acopiador: pagos a mineros y préstamos salen solos; cada centro ve solo su caja. */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class CajaAcopioIntegrationTest {
    private static final long CENTRO = 987L;

    @Autowired CajaAcopioService caja;
    @Autowired AcopiadorService compras;
    @Autowired PrestamoMineroService prestamos;
    @Autowired MineroRepository mineros;
    private Long idMinero;

    @BeforeEach
    void preparar() {
        idMinero = mineros.saveAndFlush(Minero.builder().documentoIdentidad(UUID.randomUUID().toString().substring(0, 12))
                .nombresApellidos("Minero caja").idCentroAcopio(CENTRO).build()).getIdMinero();
    }

    @Test
    void elPrestamoYElPagoNetoSalenDeLaCaja() {
        caja.registrarManual(new MovimientoManualRequest("INGRESO", "PEN", b("10000"), "Apertura", null, true), CENTRO);
        var prestamo = prestamos.registrar(new PrestamoRequest(idMinero, b("500"), null, null), CENTRO);
        assertEquals(0, b("9500").compareTo(caja.resumen(CENTRO).saldoPen()));

        // 10 g × S/ 350 = S/ 3 500; se descuenta el préstamo y al minero se le entregan S/ 3 000.
        compras.registrarCompraConDetalles(new CompraG2Request(idMinero,
                List.of(new PartidaCompraRequest("ROJO", b("11"), b("10"), b("350"))), null,
                List.of(prestamo.idPrestamo()), null), CENTRO);
        assertEquals(0, b("6500").compareTo(caja.resumen(CENTRO).saldoPen()),
                "10 000 − 500 de préstamo − 3 000 de pago neto");
    }

    @Test
    void anularUnPrestamoDevuelveElDinero() {
        var prestamo = prestamos.registrar(new PrestamoRequest(idMinero, b("200"), null, null), CENTRO);
        assertEquals(0, b("-200").compareTo(caja.resumen(CENTRO).saldoPen()));
        prestamos.anular(prestamo.idPrestamo(), CENTRO);
        assertEquals(0, BigDecimal.ZERO.compareTo(caja.resumen(CENTRO).saldoPen()));
    }

    @Test
    void elPagoDelMayoristaEntraEnSolesYCadaCentroVeSoloSuCaja() {
        caja.registrarPagoMayorista(new IngresoMayoristaRequest(b("800"), null, null), CENTRO);
        var resumen = caja.resumen(CENTRO);
        assertEquals(0, b("800").compareTo(resumen.saldoPen()));
        assertEquals(0, BigDecimal.ZERO.compareTo(resumen.saldoUsd()));
        assertEquals(0, BigDecimal.ZERO.compareTo(caja.resumen(988L).saldoPen()));
        assertTrue(caja.listar(988L, null, null).isEmpty());

        var movimiento = resumen.ultimos().getFirst();
        assertThrows(ResourceNotFoundException.class, () -> caja.anular(movimiento.idMovimiento(), 988L));
    }

    @Test
    void laCajaDelAcopiadorNoAceptaDolares() {
        assertThrows(IllegalArgumentException.class, () -> caja.registrarManual(
                new MovimientoManualRequest("INGRESO", "USD", b("100"), "Dólares", null, false), CENTRO));
    }

    @Test
    void losMovimientosAutomaticosNoSeAnulanAMano() {
        prestamos.registrar(new PrestamoRequest(idMinero, b("50"), null, null), CENTRO);
        var automatico = caja.listar(CENTRO, null, null).getFirst();
        assertEquals("PRESTAMO", automatico.origen());
        assertFalse(automatico.anulable());
        assertThrows(ConflictException.class, () -> caja.anular(automatico.idMovimiento(), CENTRO));
    }

    private static BigDecimal b(String valor) { return new BigDecimal(valor); }
}
