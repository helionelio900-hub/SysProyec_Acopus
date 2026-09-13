package pe.edu.upeu.sitraoro.acopio.parametros.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import pe.edu.upeu.sitraoro.acopio.parametros.dto.MineroRequest;
import pe.edu.upeu.sitraoro.acopio.parametros.dto.MineroResponse;
import pe.edu.upeu.sitraoro.acopio.parametros.service.MineroService;
import pe.edu.upeu.sitraoro.exception.ResourceNotFoundException;
import tools.jackson.databind.ObjectMapper;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
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
    void listar_respondeColeccion() throws Exception {
        when(mineroService.listar()).thenReturn(List.of(
                MineroResponse.builder().idMinero(1L).documentoIdentidad("45892011")
                        .nombresApellidos("Juan Pérez").build()
        ));

        mockMvc.perform(get("/api/v1/acopio/mineros"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].idMinero").value(1));
    }

    @Test
    void actualizar_conDatosValidos_respondeOk() throws Exception {
        MineroRequest request = new MineroRequest("45892011", "Juan Pérez Actualizado", "987654321", "Ananea");
        when(mineroService.actualizar(any(), any())).thenReturn(
                MineroResponse.builder().idMinero(1L).documentoIdentidad("45892011")
                        .nombresApellidos("Juan Pérez Actualizado").zonaProcedencia("Ananea").build()
        );

        mockMvc.perform(put("/api/v1/acopio/mineros/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nombresApellidos").value("Juan Pérez Actualizado"));
    }

    @Test
    void eliminar_respondeNoContent() throws Exception {
        mockMvc.perform(delete("/api/v1/acopio/mineros/1"))
                .andExpect(status().isNoContent());

        verify(mineroService).eliminar(1L);
    }

}
