package pe.edu.upeu.bomerp.acopio.parametros.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import pe.edu.upeu.bomerp.acopio.acopiador.dto.TransaccionG2Response;
import pe.edu.upeu.bomerp.acopio.acopiador.service.AcopiadorService;
import pe.edu.upeu.bomerp.acopio.parametros.dto.MineroRequest;
import pe.edu.upeu.bomerp.acopio.parametros.dto.MineroResponse;
import pe.edu.upeu.bomerp.acopio.parametros.dto.MineroResumen;
import pe.edu.upeu.bomerp.acopio.parametros.service.MineroService;
import pe.edu.upeu.bomerp.exception.ResourceNotFoundException;
import tools.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(MineroController.class)
class MineroControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private MineroService mineroService;

    @MockitoBean
    private AcopiadorService acopiadorService;

    @Test
    void crear_conDatosValidos_respondeCreated() throws Exception {
        MineroRequest request = new MineroRequest("45892011", "Juan Pérez", "987654321", "La Rinconada");

        when(mineroService.crear(any())).thenReturn(
                MineroResponse.builder()
                        .idMinero(1L)
                        .documentoIdentidad("45892011")
                        .nombresApellidos("Juan Pérez")
                        .telefono("987654321")
                        .zonaProcedencia("La Rinconada")
                        .build()
        );

        mockMvc.perform(post("/api/v1/acopio/mineros")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.idMinero").value(1))
                .andExpect(jsonPath("$.nombresApellidos").value("Juan Pérez"));
    }

    @Test
    void crear_conDocumentoVacio_respondeBadRequest() throws Exception {
        MineroRequest request = new MineroRequest("", "Juan Pérez", "987654321", "La Rinconada");

        mockMvc.perform(post("/api/v1/acopio/mineros")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void obtener_conIdInexistente_respondeNotFound() throws Exception {
        when(mineroService.obtener(999L)).thenThrow(new ResourceNotFoundException("Minero no encontrado: 999"));

        mockMvc.perform(get("/api/v1/acopio/mineros/999"))
                .andExpect(status().isNotFound());
    }

    @Test
    void listarTransaccionesPorMinero_conMineroExistente_respondeOkConSusTransacciones() throws Exception {
        when(acopiadorService.listarPorMinero(1L)).thenReturn(List.of(
                new TransaccionG2Response(
                        10L,
                        new MineroResumen(1L, "45892011", "Juan Pérez"),
                        new BigDecimal("15.500"),
                        new BigDecimal("14.800"),
                        "ROJO",
                        new BigDecimal("280.00"),
                        new BigDecimal("4144.00"),
                        LocalDateTime.now()
                )
        ));

        mockMvc.perform(get("/api/v1/acopio/mineros/1/transacciones"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].idTransaccionG2").value(10))
                .andExpect(jsonPath("$[0].minero.nombresApellidos").value("Juan Pérez"));
    }

    @Test
    void listarTransaccionesPorMinero_conMineroInexistente_respondeNotFound() throws Exception {
        when(acopiadorService.listarPorMinero(999L)).thenThrow(new ResourceNotFoundException("Minero no encontrado: 999"));

        mockMvc.perform(get("/api/v1/acopio/mineros/999/transacciones"))
                .andExpect(status().isNotFound());
    }
}
