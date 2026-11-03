package pe.edu.upeu.sitraoro.acopio.mayorista.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import pe.edu.upeu.sitraoro.acopio.mayorista.dto.CentroAcopioResponse;
import pe.edu.upeu.sitraoro.acopio.mayorista.service.CentroAcopioServiceImpl;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = CentroAcopioController.class)
@WithMockUser(roles = "G1_MAYORISTA")
class CentroAcopioCacheTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CentroAcopioServiceImpl centroAcopioService;

    @Test
    @DisplayName("GET /api/v1/publico/centros-acopio devuelve cabecera Cache-Control max-age=300 (5 min)")
    void listarParaMinero_devuelveCacheControl() throws Exception {
        when(centroAcopioService.listarActivos()).thenReturn(List.of(
                new CentroAcopioResponse(1L, "Centro Juliaca", "Zona Sur", "Av. Principal 123", "951000111", true)
        ));

        mockMvc.perform(get("/api/v1/publico/centros-acopio"))
                .andExpect(status().isOk())
                .andExpect(header().string("Cache-Control", "max-age=300"));
    }

    @Test
    @DisplayName("GET /api/v1/mayorista/centros-acopio devuelve cabecera Cache-Control max-age=300 (5 min)")
    void listarParaMayorista_devuelveCacheControl() throws Exception {
        when(centroAcopioService.listarTodos()).thenReturn(List.of(
                new CentroAcopioResponse(1L, "Centro Juliaca", "Zona Sur", "Av. Principal 123", "951000111", true)
        ));

        mockMvc.perform(get("/api/v1/mayorista/centros-acopio"))
                .andExpect(status().isOk())
                .andExpect(header().string("Cache-Control", "max-age=300"));
    }
}
