package pe.edu.upeu.sitraoro.acopio.mayorista.service;

import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import pe.edu.upeu.sitraoro.acopio.acopiador.entity.TransaccionG2;
import pe.edu.upeu.sitraoro.acopio.acopiador.repository.TransaccionG2Repository;
import pe.edu.upeu.sitraoro.acopio.mayorista.dto.DetalleLiquidacionRequest;
import pe.edu.upeu.sitraoro.acopio.mayorista.dto.LiquidacionG1Request;
import pe.edu.upeu.sitraoro.acopio.mayorista.dto.LiquidacionG1Response;
import pe.edu.upeu.sitraoro.acopio.mayorista.repository.LiquidacionG1Repository;
import pe.edu.upeu.sitraoro.acopio.parametros.entity.Minero;
import pe.edu.upeu.sitraoro.acopio.parametros.repository.MineroRepository;
import pe.edu.upeu.sitraoro.exception.StockInsuficienteException;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

@SpringBootTest
class MayoristaServiceIntegrationTest {

    @Autowired
    private MayoristaService mayoristaService;

    @Autowired
    private LiquidacionG1Repository liquidacionG1Repository;

    @Autowired
    private TransaccionG2Repository transaccionG2Repository;

    @Autowired
    private MineroRepository mineroRepository;

    @Autowired
    private EntityManager entityManager;

    @BeforeEach
    void limpiarBase() {
        liquidacionG1Repository.deleteAll();
        transaccionG2Repository.deleteAll();
        mineroRepository.deleteAll();
    }

    @Test
    void liquidacionExitosa_persisteCabeceraDetallesYMarcaLotes() {
        Minero minero = guardarMinero("70000001");
        TransaccionG2 rojo = guardarLote(minero, "ROJO", "10.000");
        TransaccionG2 verde = guardarLote(minero, "VERDE", "5.000");

        LiquidacionG1Response response = mayoristaService.procesarLiquidacionSemanal(
                solicitud(
                        new DetalleLiquidacionRequest("ROJO", new BigDecimal("10.000")),
                        new DetalleLiquidacionRequest("VERDE", new BigDecimal("5.000"))
                )
        );

        assertNotNull(response.idLiquidacionG1());
        assertEquals(2, response.detalles().size());
        assertEquals(1, liquidacionG1Repository.count());
        assertEquals(response.idLiquidacionG1(),
                transaccionG2Repository.findById(rojo.getIdTransaccionG2()).orElseThrow().getIdLiquidacionG1());
        assertEquals(response.idLiquidacionG1(),
                transaccionG2Repository.findById(verde.getIdTransaccionG2()).orElseThrow().getIdLiquidacionG1());
    }

    @Test
    void errorEnSegundoDetalle_revierteCabeceraDetallesYPrimerDescuento() {
        Minero minero = guardarMinero("70000002");
        TransaccionG2 rojo = guardarLote(minero, "ROJO", "10.000");
        guardarLote(minero, "VERDE", "5.000");

        // El cierre debe coincidir EXACTAMENTE con el stock disponible: cerrar menos
        // (4.000 de 5.000 VERDE) tambien es invalido, no solo pedir de mas. Este caso
        // aisla esa regla estricta, distinta de "no exceder el stock disponible".
        assertThrows(StockInsuficienteException.class, () ->
                mayoristaService.procesarLiquidacionSemanal(
                        solicitud(
                                new DetalleLiquidacionRequest("ROJO", new BigDecimal("10.000")),
                                new DetalleLiquidacionRequest("VERDE", new BigDecimal("4.000"))
                        )
                )
        );

        entityManager.clear();
        assertEquals(0, liquidacionG1Repository.count());
        assertNull(transaccionG2Repository.findById(rojo.getIdTransaccionG2()).orElseThrow().getIdLiquidacionG1());
    }

    @Test
    void ordenamientoNoPermitido_seRechazaAntesDeConsultar() {
        IllegalArgumentException error = assertThrows(IllegalArgumentException.class,
                () -> mayoristaService.buscar(null, null, null, "campoInventado", "ASC"));

        assertEquals("Campo de ordenamiento no permitido: campoInventado", error.getMessage());
    }

    private LiquidacionG1Request solicitud(DetalleLiquidacionRequest... detalles) {
        return new LiquidacionG1Request(
                "Acopiador G2 U1",
                new BigDecimal("2650.00"),
                new BigDecimal("3.7500"),
                List.of(detalles)
        );
    }

    private Minero guardarMinero(String documento) {
        return mineroRepository.save(Minero.builder()
                .documentoIdentidad(documento)
                .nombresApellidos("Minero de prueba")
                .zonaProcedencia("Puno")
                .build());
    }

    private TransaccionG2 guardarLote(Minero minero, String tipoOro, String peso) {
        BigDecimal gramos = new BigDecimal(peso);
        return transaccionG2Repository.save(TransaccionG2.builder()
                .minero(minero)
                .pesoSinFundirG(gramos.add(BigDecimal.ONE))
                .pesoFundidoNetoG(gramos)
                .tipoOro(tipoOro)
                .precioAplicadoPen(new BigDecimal("280.00"))
                .totalPagadoPen(gramos.multiply(new BigDecimal("280.00")))
                .build());
    }
}
