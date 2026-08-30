package pe.edu.upeu.bomerp.acopio.acopiador.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import pe.edu.upeu.bomerp.acopio.acopiador.dto.AcumuladosG2Response;
import pe.edu.upeu.bomerp.acopio.acopiador.dto.TransaccionG2Request;
import pe.edu.upeu.bomerp.acopio.acopiador.dto.TransaccionG2Response;
import pe.edu.upeu.bomerp.acopio.acopiador.service.AcopiadorService;
import pe.edu.upeu.bomerp.acopio.parametros.dto.MineroResumen;
import tools.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AcopiadorController.class)
class AcopiadorControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private AcopiadorService acopiadorService;

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
                LocalDateTime.now()
        );

        when(acopiadorService.registrarCompraDirecta(any())).thenReturn(response);

        mockMvc.perform(post("/api/v1/acopio/transacciones")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.idTransaccionG2").value(1))
                .andExpect(jsonPath("$.tipoOro").value("ROJO"))
                .andExpect(jsonPath("$.totalPagadoPen").value(4144.00));
    }

    @Test
    void listarTransacciones_respondeOk() throws Exception {
        when(acopiadorService.listarTransacciones()).thenReturn(List.of(
                new TransaccionG2Response(
                        1L,
                        new MineroResumen(1L, "45892011", "Juan Pérez"),
                        new BigDecimal("15.500"),
                        new BigDecimal("14.800"),
                        "ROJO",
                        new BigDecimal("280.00"),
                        new BigDecimal("4144.00"),
                        LocalDateTime.now()
                )
        ));

        mockMvc.perform(get("/api/v1/acopio/transacciones"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].idTransaccionG2").value(1))
                .andExpect(jsonPath("$[0].tipoOro").value("ROJO"));
    }

    @Test
    void obtenerAcumuladosSemanales_respondeOk() throws Exception {
        AcumuladosG2Response acumulados = new AcumuladosG2Response(
                new BigDecimal("50.500"),
                new BigDecimal("14140.00"),
                new BigDecimal("30.200"),
                new BigDecimal("8456.00")
        );

        when(acopiadorService.obtenerAcumuladosSemanalesPorColor()).thenReturn(acumulados);

        mockMvc.perform(get("/api/v1/acopio/acumulados-semanales"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalGramosRojo").value(50.500))
                .andExpect(jsonPath("$.totalDineroRojoPen").value(14140.00))
                .andExpect(jsonPath("$.totalGramosVerde").value(30.200))
                .andExpect(jsonPath("$.totalDineroVerdePen").value(8456.00));
    }
}
