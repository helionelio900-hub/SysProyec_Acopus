package pe.edu.upeu.sitraoro.acopio.acopiador.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.context.annotation.Import;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import pe.edu.upeu.sitraoro.seguridad.config.SecurityConfig;
import pe.edu.upeu.sitraoro.acopio.acopiador.dto.CompraG2Response;
import pe.edu.upeu.sitraoro.acopio.acopiador.dto.AcumuladosG2Response;
import pe.edu.upeu.sitraoro.acopio.acopiador.dto.EntregaMayoristaResponse;
import pe.edu.upeu.sitraoro.acopio.acopiador.dto.TransaccionG2Request;
import pe.edu.upeu.sitraoro.acopio.acopiador.dto.TransaccionG2Response;
import pe.edu.upeu.sitraoro.acopio.acopiador.service.AcopiadorService;
import pe.edu.upeu.sitraoro.acopio.acopiador.service.EntregaMayoristaPort;
import pe.edu.upeu.sitraoro.acopio.parametros.dto.MineroResumen;
import pe.edu.upeu.sitraoro.exception.ResourceNotFoundException;
import tools.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AcopiadorController.class)
@Import({SecurityConfig.class, AcopiadorControllerTest.SeguridadMvc.class})
@WithMockUser(roles = "G2_ACOPIADOR")
class AcopiadorControllerTest {
    @TestConfiguration
    @EnableWebSecurity
    static class SeguridadMvc {}

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private AcopiadorService acopiadorService;

    @MockitoBean
    private EntregaMayoristaPort entregaMayoristaPort;

    @Test
    void registrarCompraConDetalles_recibeUnaCabeceraYVariasPartidas() throws Exception {
        var minero = new MineroResumen(1L, "45892011", "Juan Pérez");
        var fecha = LocalDateTime.now();
        when(acopiadorService.registrarCompraConDetalles(any(), eq(1L))).thenReturn(new CompraG2Response(
                7L, minero, fecha, new BigDecimal("10100.00"), List.of(
                new TransaccionG2Response(20L, minero, new BigDecimal("10"), new BigDecimal("10"), "ROJO",
                        new BigDecimal("350"), new BigDecimal("3500"), fecha, null, null, false, 7L),
                new TransaccionG2Response(21L, minero, new BigDecimal("20"), new BigDecimal("20"), "VERDE",
                        new BigDecimal("330"), new BigDecimal("6600"), fecha, null, null, false, 7L))));
        mockMvc.perform(post("/api/v1/acopio/compras")
                .with(jwt().jwt(token -> token.claim("idCentroAcopio", 1L))
                        .authorities(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_G2_ACOPIADOR")))
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"idMinero":1,"detalles":[
                      {"tipoOro":"ROJO","pesoSinFundirG":10,"pesoFundidoNetoG":10,"precioAplicadoPen":350},
                      {"tipoOro":"VERDE","pesoSinFundirG":20,"pesoFundidoNetoG":20,"precioAplicadoPen":330}
                    ]}
                    """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.idCompraG2").value(7))
                .andExpect(jsonPath("$.detalles.length()").value(2))
                .andExpect(jsonPath("$.detalles[1].idCompraG2").value(7))
                .andExpect(jsonPath("$.totalPagadoPen").value(10100));
    }

    @Test
    void compraSinPartidas_esRechazadaAntesDelServicio() throws Exception {
        mockMvc.perform(post("/api/v1/acopio/compras")
                .with(jwt().jwt(token -> token.claim("idCentroAcopio", 1L))
                        .authorities(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_G2_ACOPIADOR")))
                .contentType(MediaType.APPLICATION_JSON).content("{\"idMinero\":1,\"detalles\":[]}"))
                .andExpect(status().isBadRequest());
        verify(acopiadorService, org.mockito.Mockito.never()).registrarCompraConDetalles(any(), any());
    }

    @Test
    void compraConPesoInvalido_esRechazadaAntesDelServicio() throws Exception {
        mockMvc.perform(post("/api/v1/acopio/compras")
                .with(jwt().jwt(token -> token.claim("idCentroAcopio", 1L))
                        .authorities(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_G2_ACOPIADOR")))
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"idMinero":1,"detalles":[{"tipoOro":"ROJO","pesoSinFundirG":1.0001,"pesoFundidoNetoG":0,"precioAplicadoPen":10}]}
                    """))
                .andExpect(status().isBadRequest());
        verify(acopiadorService, org.mockito.Mockito.never()).registrarCompraConDetalles(any(), any());
    }

    @Test
    void mineroNoPuedeConsultarComprasDelAcopiador() throws Exception {
        mockMvc.perform(get("/api/v1/acopio/compras")
                .with(jwt().authorities(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_MINERO"))))
                .andExpect(status().isForbidden());
    }

    @Test
    void enviarComprasSeleccionadas_creaEntregaParaCentroDeLaSesion() throws Exception {
        when(entregaMayoristaPort.registrarDesdeAcopiador(1L, List.of(10L, 12L)))
                .thenReturn(new EntregaMayoristaResponse(5L, LocalDate.now(), 1L, "Centro · Ananea",
                        new EntregaMayoristaResponse.FilaOro(new BigDecimal("2.000"), new BigDecimal("1.800"), "", "", "", ""),
                        new EntregaMayoristaResponse.FilaOro(null, null, "", "", "", ""), "", "", List.of(10L, 12L)));

        mockMvc.perform(post("/api/v1/acopio/entregas-mayorista")
                        .with(jwt().jwt(token -> token.claim("idCentroAcopio", 1L))
                                .authorities(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_G2_ACOPIADOR")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"idsComprasAcopiador\":[10,12]}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.idRecepcion").value(5))
                .andExpect(jsonPath("$.rojo.pesoFundidoG").value(1.8));

        verify(entregaMayoristaPort).registrarDesdeAcopiador(1L, List.of(10L, 12L));
    }

    @Test
    void registrarCompra_conDatosValidos_respondeCreated() throws Exception {
        TransaccionG2Request request = new TransaccionG2Request(
                1L,
                new BigDecimal("15.500"),
                new BigDecimal("14.800"),
                "ROJO",
                new BigDecimal("280.00")
        );

        TransaccionG2Response response = new TransaccionG2Response(
                1L,
                new MineroResumen(1L, "45892011", "Juan Pérez"),
                new BigDecimal("15.500"),
                new BigDecimal("14.800"),
                "ROJO",
                new BigDecimal("280.00"),
                new BigDecimal("4144.00"),
                LocalDateTime.now(), null, null
        );

        when(acopiadorService.registrarCompraDirecta(any(), eq(1L))).thenReturn(response);

        mockMvc.perform(post("/api/v1/acopio/transacciones")
                        .with(jwt().jwt(token -> token.claim("idCentroAcopio", 1L))
                                .authorities(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_G2_ACOPIADOR")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.idTransaccionG2").value(1))
                .andExpect(jsonPath("$.tipoOro").value("ROJO"))
                .andExpect(jsonPath("$.totalPagadoPen").value(4144.00));
    }

    @Test
    void listarTransacciones_respondeOk() throws Exception {
        when(acopiadorService.listarTransacciones(1L)).thenReturn(List.of(
                new TransaccionG2Response(
                        1L,
                        new MineroResumen(1L, "45892011", "Juan Pérez"),
                        new BigDecimal("15.500"),
                        new BigDecimal("14.800"),
                        "ROJO",
                        new BigDecimal("280.00"),
                        new BigDecimal("4144.00"),
                        LocalDateTime.now(), null, null
                )
        ));

        mockMvc.perform(get("/api/v1/acopio/transacciones")
                        .with(jwt().jwt(token -> token.claim("idCentroAcopio", 1L))
                                .authorities(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_G2_ACOPIADOR"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].idTransaccionG2").value(1))
                .andExpect(jsonPath("$[0].tipoOro").value("ROJO"));
    }

    @Test
    void listarTransaccionesPorMinero_conMineroExistente_respondeOk() throws Exception {
        when(acopiadorService.listarPorMinero(1L, 1L)).thenReturn(List.of(
                new TransaccionG2Response(
                        10L,
                        new MineroResumen(1L, "45892011", "Juan Pérez"),
                        new BigDecimal("15.500"),
                        new BigDecimal("14.800"),
                        "ROJO",
                        new BigDecimal("280.00"),
                        new BigDecimal("4144.00"),
                        LocalDateTime.now(), null, null
                )
        ));

        mockMvc.perform(get("/api/v1/acopio/mineros/1/transacciones")
                        .with(jwt().jwt(token -> token.claim("idCentroAcopio", 1L))
                                .authorities(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_G2_ACOPIADOR"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].idTransaccionG2").value(10));
    }

    @Test
    void listarTransaccionesPorMinero_conMineroInexistente_respondeNotFound() throws Exception {
        when(acopiadorService.listarPorMinero(999L, 1L))
                .thenThrow(new ResourceNotFoundException("Minero no encontrado: 999"));

        mockMvc.perform(get("/api/v1/acopio/mineros/999/transacciones")
                        .with(jwt().jwt(token -> token.claim("idCentroAcopio", 1L))
                                .authorities(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_G2_ACOPIADOR"))))
                .andExpect(status().isNotFound());
    }

    @Test
    void obtenerAcumuladosSemanales_respondeOk() throws Exception {
        AcumuladosG2Response acumulados = new AcumuladosG2Response(
                new BigDecimal("50.500"),
                new BigDecimal("14140.00"),
                new BigDecimal("30.200"),
                new BigDecimal("8456.00")
        );

        when(acopiadorService.obtenerAcumuladosSemanalesPorColor(1L)).thenReturn(acumulados);

        mockMvc.perform(get("/api/v1/acopio/acumulados-semanales")
                        .with(jwt().jwt(token -> token.claim("idCentroAcopio", 1L))
                                .authorities(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_G2_ACOPIADOR"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalGramosRojo").value(50.500))
                .andExpect(jsonPath("$.totalDineroRojoPen").value(14140.00))
                .andExpect(jsonPath("$.totalGramosVerde").value(30.200))
                .andExpect(jsonPath("$.totalDineroVerdePen").value(8456.00));
    }
}
