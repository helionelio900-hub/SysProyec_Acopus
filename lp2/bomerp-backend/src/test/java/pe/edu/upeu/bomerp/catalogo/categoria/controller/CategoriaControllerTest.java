package pe.edu.upeu.bomerp.catalogo.categoria.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import pe.edu.upeu.bomerp.catalogo.categoria.dto.CategoriaRequest;
import pe.edu.upeu.bomerp.catalogo.categoria.dto.CategoriaResponse;
import pe.edu.upeu.bomerp.catalogo.categoria.dto.CategoriaResumen;
import pe.edu.upeu.bomerp.catalogo.categoria.service.CategoriaService;
import pe.edu.upeu.bomerp.catalogo.producto.dto.ProductoResponse;
import pe.edu.upeu.bomerp.catalogo.producto.service.ProductoService;
import pe.edu.upeu.bomerp.exception.ResourceNotFoundException;
import tools.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(CategoriaController.class)
class CategoriaControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private CategoriaService categoriaService;

    @MockitoBean
    private ProductoService productoService;

    @Test
    void crear_conDatosValidos_respondeCreated() throws Exception {
        CategoriaRequest request = new CategoriaRequest();
        request.setNombre("Electrodomésticos");
        request.setDescripcion("Línea blanca y pequeños electrodomésticos");

        when(categoriaService.crear(any())).thenReturn(
                CategoriaResponse.builder()
                        .id(1L)
                        .nombre("Electrodomésticos")
                        .descripcion("Línea blanca y pequeños electrodomésticos")
                        .build()
        );

        mockMvc.perform(post("/api/v1/categorias")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    void crear_conNombreVacio_respondeBadRequest() throws Exception {
        CategoriaRequest request = new CategoriaRequest();
        request.setNombre("");

        mockMvc.perform(post("/api/v1/categorias")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void obtener_conIdInexistente_respondeNotFound() throws Exception {
        when(categoriaService.obtener(999L)).thenThrow(new ResourceNotFoundException("Categoria no encontrada: 999"));

        mockMvc.perform(get("/api/v1/categorias/999"))
                .andExpect(status().isNotFound());
    }

    @Test
    void listarProductos_conCategoriaExistente_respondeOkConSusProductos() throws Exception {
        when(productoService.listarPorCategoria(1L)).thenReturn(List.of(
                ProductoResponse.builder()
                        .id(10L)
                        .nombre("Teclado mecánico")
                        .precio(new BigDecimal("180.50"))
                        .stock(25)
                        .categoria(new CategoriaResumen(1L, "Periféricos"))
                        .build()
        ));

        mockMvc.perform(get("/api/v1/categorias/1/productos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(10));
    }

    @Test
    void listarProductos_conCategoriaInexistente_respondeNotFound() throws Exception {
        when(productoService.listarPorCategoria(999L)).thenThrow(new ResourceNotFoundException("Categoria no encontrada: 999"));

        mockMvc.perform(get("/api/v1/categorias/999/productos"))
                .andExpect(status().isNotFound());
    }
}
