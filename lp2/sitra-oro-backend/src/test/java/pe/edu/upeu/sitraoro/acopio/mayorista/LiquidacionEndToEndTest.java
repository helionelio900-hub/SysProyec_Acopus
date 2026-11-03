package pe.edu.upeu.sitraoro.acopio.mayorista;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;
import pe.edu.upeu.sitraoro.acopio.mayorista.entity.CentroAcopio;
import pe.edu.upeu.sitraoro.acopio.mayorista.entity.EstadoLiquidacion;
import pe.edu.upeu.sitraoro.acopio.mayorista.entity.LiquidacionG1;
import pe.edu.upeu.sitraoro.acopio.mayorista.repository.CentroAcopioRepository;
import pe.edu.upeu.sitraoro.acopio.mayorista.repository.LiquidacionG1Repository;
import pe.edu.upeu.sitraoro.auditoria.entity.RegistroAuditoria;
import pe.edu.upeu.sitraoro.auditoria.repository.RegistroAuditoriaRepository;
import pe.edu.upeu.sitraoro.auditoria.service.AuditoriaService;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
class LiquidacionEndToEndTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private LiquidacionG1Repository liquidacionRepository;

    @Autowired
    private CentroAcopioRepository centroRepository;

    @Autowired
    private AuditoriaService auditoriaService;

    @Autowired
    private RegistroAuditoriaRepository auditoriaRepository;

    @Test
    @DisplayName("E2E: Consulta paginada + Resumen de liquidaciones contra base de datos real")
    void flujoCompleto_consultaPaginadaYResumen() throws Exception {
        CentroAcopio centro = centroRepository.save(CentroAcopio.builder()
                .nombre("Centro E2E " + System.currentTimeMillis())
                .zona("Zona E2E")
                .direccion("Av. Central 789")
                .idCuentaAcopiador(9999L)
                .activo(true)
                .build());

        LiquidacionG1 liq1 = liquidacionRepository.save(LiquidacionG1.builder()
                .idCentroAcopio(centro.getIdCentroAcopio())
                .nombreAcopiadorG2("Acopiador E2E")
                .fechaLiquidacion(LocalDateTime.now().minusHours(2))
                .estado(EstadoLiquidacion.REGISTRADA)
                .pesoTotalFundidoG(new BigDecimal("15.500"))
                .cotizacionOnzaUsd(new BigDecimal("2700.00"))
                .tipoCambioUsdPen(new BigDecimal("3.7500"))
                .totalPagadoG2Pen(new BigDecimal("3500.00"))
                .build());

        LiquidacionG1 liq2 = liquidacionRepository.save(LiquidacionG1.builder()
                .idCentroAcopio(centro.getIdCentroAcopio())
                .nombreAcopiadorG2("Acopiador E2E 2")
                .fechaLiquidacion(LocalDateTime.now().minusHours(1))
                .estado(EstadoLiquidacion.REGISTRADA)
                .pesoTotalFundidoG(new BigDecimal("10.000"))
                .cotizacionOnzaUsd(new BigDecimal("2700.00"))
                .tipoCambioUsdPen(new BigDecimal("3.7500"))
                .totalPagadoG2Pen(new BigDecimal("2500.00"))
                .build());

        // 1. Verificar listado paginado con JWT válido (Page<LiquidacionG1Response>)
        mockMvc.perform(get("/api/v1/mayorista/liquidaciones?page=0&size=10")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_G1_MAYORISTA"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.totalElements").isNumber())
                .andExpect(jsonPath("$.totalPages").isNumber())
                .andExpect(jsonPath("$.size").value(10));

        // 2. Verificar agregado del servidor (/resumen)
        mockMvc.perform(get("/api/v1/mayorista/liquidaciones/resumen")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_G1_MAYORISTA"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.agregado.totalLiquidaciones").isNumber())
                .andExpect(jsonPath("$.agregado.montoTotal").isNumber())
                .andExpect(jsonPath("$.agregado.ticketPromedio").isNumber());

        // 3. Registrar y verificar auditoría real persistida
        RegistroAuditoria audit = auditoriaService.registrar("mayorista-e2e", "CREAR", "LIQUIDACION_G1",
                liq1.getIdLiquidacionG1(), "Liquidacion procesada totalPagadoPen=3500.00");

        var registros = auditoriaRepository.findByEntidadAndEntidadIdOrderByFechaDesc(
                "LIQUIDACION_G1", liq1.getIdLiquidacionG1());
        assertFalse(registros.isEmpty());
        assertEquals("CREAR", registros.get(0).getAccion());
        assertEquals("mayorista-e2e", registros.get(0).getActor());
    }
}
