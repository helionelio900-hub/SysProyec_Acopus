package pe.edu.upeu.sitraoro.acopio.mayorista.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import pe.edu.upeu.sitraoro.acopio.mayorista.dto.DetalleLiquidacionRequest;
import pe.edu.upeu.sitraoro.acopio.mayorista.dto.DetalleLiquidacionResponse;
import pe.edu.upeu.sitraoro.acopio.mayorista.dto.LiquidacionG1Request;
import pe.edu.upeu.sitraoro.acopio.mayorista.dto.LiquidacionG1Response;
import pe.edu.upeu.sitraoro.acopio.mayorista.service.MayoristaService;
import pe.edu.upeu.sitraoro.exception.GlobalExceptionHandler;
import pe.edu.upeu.sitraoro.exception.StockInsuficienteException;
import tools.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = {MayoristaController.class, GlobalExceptionHandler.class})
class MayoristaControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private MayoristaService mayoristaService;

    @Test
    @DisplayName("POST /api/v1/mayorista/liquidaciones - Caso de Éxito Cabecera-Detalle (201 Created)")
    void liquidarSemanal_Exito_201() throws Exception {
        LiquidacionG1Request request = new LiquidacionG1Request(
                "Acopiador Central Juliaca",
                new BigDecimal("2650.00"),
                new BigDecimal("3.7500"),
                List.of(
                        new DetalleLiquidacionRequest("ROJO", new BigDecimal("50.000")),
                        new DetalleLiquidacionRequest("VERDE", new BigDecimal("30.000"))
                )
        );

        LiquidacionG1Response response = new LiquidacionG1Response(
                1L,
                "Acopiador Central Juliaca",
                "REGISTRADA",
                new BigDecimal("80.000"),
                new BigDecimal("2650.00"),
                new BigDecimal("3.7500"),
                new BigDecimal("26145.50"),
                LocalDateTime.now(),
                List.of(
                        new DetalleLiquidacionResponse(1L, "ROJO", new BigDecimal("50.000"), new BigDecimal("319.50"), new BigDecimal("15975.00")),
                        new DetalleLiquidacionResponse(2L, "VERDE", new BigDecimal("30.000"), new BigDecimal("335.48"), new BigDecimal("10064.40"))
                )
        );

        when(mayoristaService.procesarLiquidacionSemanal(any(LiquidacionG1Request.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/mayorista/liquidaciones")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.idLiquidacionG1").value(1))
                .andExpect(jsonPath("$.estado").value("REGISTRADA"))
                .andExpect(jsonPath("$.pesoTotalFundidoG").value(80.000))
                .andExpect(jsonPath("$.detalles.length()").value(2));
    }

    @Test
    @DisplayName("POST /api/v1/mayorista/liquidaciones - Caso de Rollback por Stock Oro Insuficiente (409 Conflict)")
    void liquidarSemanal_StockInsuficiente_Rollback409() throws Exception {
        LiquidacionG1Request request = new LiquidacionG1Request(
                "Acopiador Central Juliaca",
                new BigDecimal("2650.00"),
                new BigDecimal("3.7500"),
                List.of(
                        new DetalleLiquidacionRequest("ROJO", new BigDecimal("10.000")),
                        new DetalleLiquidacionRequest("VERDE", new BigDecimal("99999.000"))
                )
        );

        when(mayoristaService.procesarLiquidacionSemanal(any(LiquidacionG1Request.class)))
                .thenThrow(new StockInsuficienteException("Stock insuficiente para oro VERDE: disponible 15.000g, solicitado 99999.000g"));

        mockMvc.perform(post("/api/v1/mayorista/liquidaciones")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.error").value("Conflict"))
                .andExpect(jsonPath("$.message").value("Stock insuficiente para oro VERDE: disponible 15.000g, solicitado 99999.000g"));
    }

    @Test
    @DisplayName("GET /api/v1/mayorista/liquidaciones - Consulta con filtros/orden (200 OK)")
    void buscarLiquidaciones_200() throws Exception {
        when(mayoristaService.buscar(any(), any(), any(), any(), any())).thenReturn(List.of());

        mockMvc.perform(get("/api/v1/mayorista/liquidaciones"))
                .andExpect(status().isOk());
    }
}
