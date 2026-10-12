package pe.edu.upeu.sitraoro.acopio.acopiador.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.upeu.sitraoro.acopio.acopiador.dto.*;
import pe.edu.upeu.sitraoro.acopio.acopiador.repository.*;
import pe.edu.upeu.sitraoro.acopio.parametros.entity.Minero;
import pe.edu.upeu.sitraoro.acopio.parametros.repository.MineroRepository;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class CompraG2IntegrationTest {
    @Autowired AcopiadorService servicio;
    @Autowired CompraG2Repository cabeceras;
    @Autowired TransaccionG2Repository partidas;
    @Autowired MineroRepository mineros;
    private Long idMinero;

    @BeforeEach
    void prepararMinero() {
        idMinero = mineros.saveAndFlush(Minero.builder().documentoIdentidad(UUID.randomUUID().toString().substring(0, 12))
                .nombresApellidos("Minero de prueba cabecera detalle").build()).getIdMinero();
    }

    @Test
    void guardaUnaCabeceraConTresPartidasYPreciosIndependientes() {
        var compra = servicio.registrarCompraConDetalles(new CompraG2Request(idMinero, List.of(
                partida("ROJO", "10", "350"), partida("VERDE", "20", "330"), partida("ROJO", "5", "360"))), 987L);
        assertNotNull(compra.idCompraG2());
        assertEquals(3, compra.detalles().size());
        assertEquals(0, new BigDecimal("11900.00").compareTo(compra.totalPagadoPen()));
        assertTrue(compra.detalles().stream().allMatch(p -> compra.idCompraG2().equals(p.idCompraG2())));
        assertEquals(3, cabeceras.findById(compra.idCompraG2()).orElseThrow().getDetalles().size());
        assertEquals(1, servicio.listarComprasConDetalles(987L).size());
        assertTrue(servicio.listarComprasConDetalles(988L).isEmpty());
    }

    @Test
    void permiteUnaSolaPartida() {
        var compra = servicio.registrarCompraConDetalles(new CompraG2Request(idMinero,
                List.of(partida("ROJO", "1.125", "12.50"))), 987L);
        assertEquals(1, compra.detalles().size());
        assertEquals(0, new BigDecimal("14.06").compareTo(compra.totalPagadoPen()));
    }

    @Test
    void unaPartidaInvalidaRechazaLaCompraCompleta() {
        long cabecerasAntes = cabeceras.count();
        long partidasAntes = partidas.count();
        assertThrows(IllegalArgumentException.class, () -> servicio.registrarCompraConDetalles(
                new CompraG2Request(idMinero, List.of(partida("ROJO", "10", "350"), partida("VERDE", "20", "0"))), 987L));
        assertEquals(cabecerasAntes, cabeceras.count());
        assertEquals(partidasAntes, partidas.count());
    }

    private PartidaCompraRequest partida(String grupo, String peso, String precio) {
        return new PartidaCompraRequest(grupo, new BigDecimal(peso), new BigDecimal(peso), new BigDecimal(precio));
    }
}
