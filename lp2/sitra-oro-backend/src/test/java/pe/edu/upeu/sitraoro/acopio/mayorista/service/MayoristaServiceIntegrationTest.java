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
import pe.edu.upeu.sitraoro.acopio.mayorista.dto.RecepcionMayoristaRequest;
import pe.edu.upeu.sitraoro.acopio.mayorista.entity.CentroAcopio;
import pe.edu.upeu.sitraoro.acopio.mayorista.repository.CentroAcopioRepository;
import pe.edu.upeu.sitraoro.acopio.mayorista.repository.LiquidacionG1Repository;
import pe.edu.upeu.sitraoro.acopio.mayorista.repository.RecepcionMayoristaRepository;
import pe.edu.upeu.sitraoro.acopio.mayorista.service.RecepcionMayoristaServiceImpl;
import pe.edu.upeu.sitraoro.acopio.parametros.entity.Minero;
import pe.edu.upeu.sitraoro.acopio.parametros.repository.MineroRepository;
import pe.edu.upeu.sitraoro.exception.ResourceNotFoundException;
import pe.edu.upeu.sitraoro.exception.StockInsuficienteException;
import pe.edu.upeu.sitraoro.exception.ConflictException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.time.LocalDateTime;
import pe.edu.upeu.sitraoro.acopio.mayorista.entity.LiquidacionG1;
import pe.edu.upeu.sitraoro.acopio.mayorista.entity.EstadoLiquidacion;
import org.springframework.jdbc.core.JdbcTemplate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

@SpringBootTest
class MayoristaServiceIntegrationTest {

    private Long centroId;
    private List<Long> comprasRecepcionIds;

    @Autowired
    private MayoristaService mayoristaService;

    @Autowired
    private LiquidacionG1Repository liquidacionG1Repository;

    @Autowired
    private RecepcionMayoristaRepository recepcionMayoristaRepository;

    @Autowired
    private CentroAcopioRepository centroAcopioRepository;

    @Autowired
    private RecepcionMayoristaServiceImpl recepcionMayoristaService;

    @Autowired
    private TransaccionG2Repository transaccionG2Repository;

    @Autowired
    private MineroRepository mineroRepository;

    @Autowired
    private EntityManager entityManager;

    @Autowired
    private JdbcTemplate jdbc;

    @BeforeEach
    void limpiarBase() {
        transaccionG2Repository.deleteAll();
        recepcionMayoristaRepository.deleteAll();
        liquidacionG1Repository.deleteAll();
        mineroRepository.deleteAll();
        centroId = centroAcopioRepository.save(CentroAcopio.builder()
                .nombre("Centro liquidación " + UUID.randomUUID())
                .zona("Zona de prueba")
                .direccion("Dirección de prueba")
                .idCuentaAcopiador(1_000_000_000_000L + Math.abs(System.nanoTime() % 1_000_000_000L))
                .activo(true).build()).getIdCentroAcopio();
    }

    @Test
    void recepcionCrud_conservaCentroYRechazaCentroInactivo() {
        CentroAcopio centro = centroAcopioRepository.saveAndFlush(CentroAcopio.builder()
                .nombre("Centro S8 " + UUID.randomUUID())
                .zona("Zona de prueba")
                .direccion("Dirección de prueba")
                .idCuentaAcopiador(1_000_000_000_000L + Math.abs(System.nanoTime() % 1_000_000_000L))
                .activo(true)
                .build());
        centroId = centro.getIdCentroAcopio();
        Minero minero = guardarMinero("70000009");
        TransaccionG2 rojo = guardarLote(minero, "ROJO", "1.000");
        TransaccionG2 verde = guardarLote(minero, "VERDE", "5.000");
        TransaccionG2 noEntregada = guardarLote(minero, "ROJO", "4.000");
        comprasRecepcionIds = List.of(rojo.getIdTransaccionG2(), verde.getIdTransaccionG2());

        var creado = recepcionMayoristaService.registrar(
                solicitudRecepcion(centro.getIdCentroAcopio(), LocalDate.now()));
        assertNotNull(creado.idRecepcion());
        assertEquals(centro.getIdCentroAcopio(), creado.idCentroAcopio());
        assertEquals(centro.getNombre() + " · " + centro.getZona(), creado.nombreAcopiador());
        assertEquals(0, new BigDecimal("2.000").compareTo(creado.rojo().pesoSinFundirG()));
        assertEquals(0, new BigDecimal("1.000").compareTo(creado.rojo().pesoFundidoG()));
        assertEquals(0, new BigDecimal("6.000").compareTo(creado.verde().pesoSinFundirG()));
        assertEquals(0, new BigDecimal("5.000").compareTo(creado.verde().pesoFundidoG()));
        assertNull(transaccionG2Repository.findById(noEntregada.getIdTransaccionG2()).orElseThrow()
                .getIdRecepcionMayorista());
        assertEquals(1, recepcionMayoristaService.listar(null).size());

        LocalDate fechaActualizada = LocalDate.now().minusDays(1);
        var actualizado = recepcionMayoristaService.actualizar(
                creado.idRecepcion(), solicitudRecepcion(centro.getIdCentroAcopio(), fechaActualizada));
        assertEquals(fechaActualizada, actualizado.fecha());
        assertEquals(centro.getIdCentroAcopio(), actualizado.idCentroAcopio());
        assertEquals(0, new BigDecimal("1.000").compareTo(actualizado.rojo().pesoFundidoG()));
        assertEquals(0, new BigDecimal("5.000").compareTo(actualizado.verde().pesoFundidoG()));

        recepcionMayoristaService.eliminar(creado.idRecepcion());
        assertEquals(0, recepcionMayoristaService.listar(null).size());

        centro.setActivo(false);
        centroAcopioRepository.saveAndFlush(centro);
        assertThrows(ResourceNotFoundException.class,
                () -> recepcionMayoristaService.registrar(
                        solicitudRecepcion(centro.getIdCentroAcopio(), LocalDate.now())));
        assertThrows(ResourceNotFoundException.class,
                () -> recepcionMayoristaService.registrar(solicitudRecepcion(Long.MAX_VALUE, LocalDate.now())));
    }

    @Test
    void envioAcopiador_soloComparteSeleccionYCalculaPesosSeparadosPorColor() {
        Minero minero = guardarMinero("70000019");
        TransaccionG2 rojo = guardarLote(minero, "ROJO", "2.000");
        TransaccionG2 verde = guardarLote(minero, "VERDE", "3.000");
        TransaccionG2 reservado = guardarLote(minero, "ROJO", "7.000");

        var entrega = recepcionMayoristaService.registrarDesdeAcopiador(
                centroId, List.of(rojo.getIdTransaccionG2(), verde.getIdTransaccionG2()));

        assertEquals(List.of(rojo.getIdTransaccionG2(), verde.getIdTransaccionG2()), entrega.idsComprasAcopiador());
        assertEquals(0, new BigDecimal("2.000").compareTo(entrega.rojo().pesoFundidoG()));
        assertEquals(0, new BigDecimal("3.000").compareTo(entrega.rojo().pesoSinFundirG()));
        assertEquals(0, new BigDecimal("3.000").compareTo(entrega.verde().pesoFundidoG()));
        assertEquals(0, new BigDecimal("4.000").compareTo(entrega.verde().pesoSinFundirG()));
        assertNull(transaccionG2Repository.findById(reservado.getIdTransaccionG2()).orElseThrow()
                .getIdRecepcionMayorista());
    }

    private RecepcionMayoristaRequest solicitudRecepcion(Long idCentro, LocalDate fecha) {
        return new RecepcionMayoristaRequest(
                fecha,
                idCentro,
                new RecepcionMayoristaRequest.FilaOro(
                        new BigDecimal("99.000"), new BigDecimal("88.000"), "", "", "", ""),
                new RecepcionMayoristaRequest.FilaOro(null, null, "", "", "", ""),
                "",
                "",
                comprasRecepcionIds);
    }

    @Test
    void liquidacionSinReglaNoPersisteCabeceraNiMarcaLotes() {
        Minero minero = guardarMinero("70000001");
        TransaccionG2 rojo = guardarLote(minero, "ROJO", "10.000");
        TransaccionG2 verde = guardarLote(minero, "VERDE", "5.000");

        assertThrows(ConflictException.class, () -> mayoristaService.procesarLiquidacionSemanal(
                solicitud(
                        new DetalleLiquidacionRequest("ROJO", new BigDecimal("10.000")),
                        new DetalleLiquidacionRequest("VERDE", new BigDecimal("5.000"))
                )
        ));

        assertEquals(0, jdbc.queryForObject("select count(*) from DETALLE_LIQUIDACIONES_G1", Integer.class));
        assertEquals(0, liquidacionG1Repository.count());
        assertNull(transaccionG2Repository.findById(rojo.getIdTransaccionG2()).orElseThrow().getIdLiquidacionG1());
        assertNull(transaccionG2Repository.findById(verde.getIdTransaccionG2()).orElseThrow().getIdLiquidacionG1());
    }

    @Test
    void errorEnSegundoDetalle_revierteCabeceraDetallesYPrimerDescuento() {
        Minero minero = guardarMinero("70000002");
        TransaccionG2 rojo = guardarLote(minero, "ROJO", "10.000");
        guardarLote(minero, "VERDE", "5.000");

        // El cierre debe coincidir EXACTAMENTE con el stock disponible: cerrar menos
        // (4.000 de 5.000 VERDE) tambien es invalido, no solo pedir de mas. Este caso
        // aisla esa regla estricta, distinta de "no exceder el stock disponible".
        assertThrows(ConflictException.class, () ->
                mayoristaService.procesarLiquidacionSemanal(
                        solicitud(
                                new DetalleLiquidacionRequest("ROJO", new BigDecimal("10.000")),
                                new DetalleLiquidacionRequest("VERDE", new BigDecimal("4.000"))
                        )
                )
        );

        entityManager.clear();
        assertEquals(0, liquidacionG1Repository.count());
        assertEquals(0, jdbc.queryForObject("select count(*) from DETALLE_LIQUIDACIONES_G1", Integer.class));
        assertNull(transaccionG2Repository.findById(rojo.getIdTransaccionG2()).orElseThrow().getIdLiquidacionG1());
    }

    @Test
    void ordenamientoNoPermitido_seRechazaAntesDeConsultar() {
        IllegalArgumentException error = assertThrows(IllegalArgumentException.class,
                () -> mayoristaService.buscar(null, null, null, "campoInventado", "ASC"));

        assertEquals("Campo de ordenamiento no permitido: campoInventado", error.getMessage());
    }

    @Test
    void filtrosCombinadosOrdenYAgregadosUsanDatosPersistidos() {
        guardarLiquidacion("2026-09-01T10:00:00", EstadoLiquidacion.REGISTRADA, "100.00");
        guardarLiquidacion("2026-09-02T10:00:00", EstadoLiquidacion.REGISTRADA, "300.00");
        guardarLiquidacion("2026-09-02T10:00:00", EstadoLiquidacion.ANULADA, "900.00");
        guardarLiquidacion("2026-08-01T10:00:00", EstadoLiquidacion.REGISTRADA, "800.00");
        LocalDateTime desde = LocalDateTime.parse("2026-09-01T10:00:00");
        LocalDateTime hasta = LocalDateTime.parse("2026-09-02T10:00:00");
        var filas = mayoristaService.buscar(EstadoLiquidacion.REGISTRADA, desde, hasta, "totalPagadoG2Pen", "DESC");
        assertEquals(2, filas.size());
        assertEquals(0, new BigDecimal("300.00").compareTo(filas.get(0).totalPagadoG2Pen()));
        assertEquals(0, new BigDecimal("100.00").compareTo(filas.get(1).totalPagadoG2Pen()));
        var reporte = mayoristaService.reporte(EstadoLiquidacion.REGISTRADA, desde, hasta);
        assertEquals(2, reporte.agregado().totalLiquidaciones());
        assertEquals(0, new BigDecimal("400.00").compareTo(reporte.agregado().montoTotal()));
        assertEquals(0, new BigDecimal("200.00").compareTo(reporte.agregado().ticketPromedio()));
        var vacio = mayoristaService.reporte(null, hasta.plusYears(1), null);
        assertEquals(0, vacio.agregado().totalLiquidaciones());
        assertEquals(0, vacio.agregado().montoTotal().signum());
        assertEquals(0, vacio.agregado().ticketPromedio().signum());
        assertThrows(IllegalArgumentException.class, () -> mayoristaService.reporte(null, hasta, desde));
        assertThrows(IllegalArgumentException.class, () -> mayoristaService.buscar(null, null, null, "fechaLiquidacion", "INVALIDO"));
    }

    private void guardarLiquidacion(String fecha, EstadoLiquidacion estado, String monto) {
        liquidacionG1Repository.saveAndFlush(LiquidacionG1.builder()
                .idCentroAcopio(centroId)
                .nombreAcopiadorG2("Consulta U1").fechaLiquidacion(LocalDateTime.parse(fecha))
                .estado(estado).pesoTotalFundidoG(BigDecimal.ONE)
                .cotizacionOnzaUsd(new BigDecimal("2650.00")).tipoCambioUsdPen(new BigDecimal("3.7500"))
                .totalPagadoG2Pen(new BigDecimal(monto)).build());
    }

    private LiquidacionG1Request solicitud(DetalleLiquidacionRequest... detalles) {
        return new LiquidacionG1Request(
                centroId,
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
                .idCentroAcopio(centroId)
                .minero(minero)
                .pesoSinFundirG(gramos.add(BigDecimal.ONE))
                .pesoFundidoNetoG(gramos)
                .tipoOro(tipoOro)
                .precioAplicadoPen(new BigDecimal("280.00"))
                .totalPagadoPen(gramos.multiply(new BigDecimal("280.00")))
                .build());
    }
}
