package pe.edu.upeu.sitraoro.acopio.acopiador.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.upeu.sitraoro.acopio.acopiador.dto.CompraG2Request;
import pe.edu.upeu.sitraoro.acopio.acopiador.dto.PartidaCompraRequest;
import pe.edu.upeu.sitraoro.acopio.acopiador.dto.PrestamoDtos.PrestamoRequest;
import pe.edu.upeu.sitraoro.acopio.acopiador.entity.EstadoPrestamo;
import pe.edu.upeu.sitraoro.acopio.parametros.entity.Minero;
import pe.edu.upeu.sitraoro.acopio.parametros.repository.MineroRepository;
import pe.edu.upeu.sitraoro.exception.ConflictException;
import pe.edu.upeu.sitraoro.exception.ResourceNotFoundException;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

/** Préstamos del acopiador al minero y su descuento al pagar la compra. */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class PrestamoMineroIntegrationTest {
    private static final long CENTRO = 987L;

    @Autowired AcopiadorService compras;
    @Autowired PrestamoMineroService prestamos;
    @Autowired MineroRepository mineros;
    private Long idMinero;

    @BeforeEach
    void preparar() {
        idMinero = minero(CENTRO);
    }

    @Test
    void elPrestamoSeDescuentaDelPagoYQuedaDescontado() {
        var prestamo = prestamos.registrar(new PrestamoRequest(idMinero, b("500"), null, "Para víveres"), CENTRO);
        assertEquals("PENDIENTE", prestamo.estado());

        // 10 g × S/ 350 = S/ 3 500; menos S/ 500 de préstamo y S/ 100 de descuento manual.
        var compra = compras.registrarCompraConDetalles(new CompraG2Request(idMinero, List.of(partida("10", "350")),
                null, List.of(prestamo.idPrestamo()), b("100")), CENTRO);
        assertEquals(0, b("3500").compareTo(compra.totalPagadoPen()));
        assertEquals(0, b("600").compareTo(compra.descuentoPen()));
        assertEquals(0, b("100").compareTo(compra.descuentoManualPen()));
        assertEquals(0, b("2900").compareTo(compra.netoPagadoPen()));
        assertEquals(List.of(prestamo.idPrestamo()), compra.idsPrestamos());

        var descontado = prestamos.listar(CENTRO, idMinero, null).getFirst();
        assertEquals("DESCONTADO", descontado.estado());
        assertEquals(compra.idCompraG2(), descontado.idCompraG2());
        assertTrue(prestamos.listar(CENTRO, idMinero, EstadoPrestamo.PENDIENTE).isEmpty());
    }

    @Test
    void sinPrestamosElNetoEsElTotal() {
        var compra = compras.registrarCompraConDetalles(new CompraG2Request(idMinero, List.of(partida("2", "300"))), CENTRO);
        assertEquals(0, compra.totalPagadoPen().compareTo(compra.netoPagadoPen()));
        assertEquals(0, BigDecimal.ZERO.compareTo(compra.descuentoPen()));
    }

    @Test
    void losDescuentosNoPuedenSuperarElValorDelOro() {
        var prestamo = prestamos.registrar(new PrestamoRequest(idMinero, b("5000"), null, null), CENTRO);
        assertThrows(IllegalArgumentException.class, () -> compras.registrarCompraConDetalles(
                new CompraG2Request(idMinero, List.of(partida("1", "300")), null, List.of(prestamo.idPrestamo()), null), CENTRO));
    }

    @Test
    void noSeUsaUnPrestamoDeOtroMineroNiDeOtroCentro() {
        Long otroMinero = minero(CENTRO);
        var ajeno = prestamos.registrar(new PrestamoRequest(otroMinero, b("50"), null, null), CENTRO);
        assertThrows(IllegalArgumentException.class, () -> compras.registrarCompraConDetalles(
                new CompraG2Request(idMinero, List.of(partida("1", "300")), null, List.of(ajeno.idPrestamo()), null), CENTRO));

        assertTrue(prestamos.listar(988L, null, null).isEmpty(), "otro centro no ve los préstamos");
        assertThrows(ResourceNotFoundException.class, () -> prestamos.anular(ajeno.idPrestamo(), 988L));
    }

    @Test
    void soloSeAnulaUnPrestamoPendiente() {
        var prestamo = prestamos.registrar(new PrestamoRequest(idMinero, b("80"), null, null), CENTRO);
        assertEquals("ANULADO", prestamos.anular(prestamo.idPrestamo(), CENTRO).estado());
        assertThrows(ConflictException.class, () -> prestamos.anular(prestamo.idPrestamo(), CENTRO));
    }

    private Long minero(long centro) {
        return mineros.saveAndFlush(Minero.builder().documentoIdentidad(UUID.randomUUID().toString().substring(0, 12))
                .nombresApellidos("Minero de prueba préstamo").idCentroAcopio(centro).build()).getIdMinero();
    }

    private static PartidaCompraRequest partida(String fundido, String precio) {
        return new PartidaCompraRequest("ROJO", b(fundido).add(BigDecimal.ONE), b(fundido), b(precio));
    }

    private static BigDecimal b(String valor) { return new BigDecimal(valor); }
}
