package pe.edu.upeu.sitraoro.acopio.mayorista.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.http.MediaType;
import pe.edu.upeu.sitraoro.acopio.mayorista.service.RecepcionLeyService;
import pe.edu.upeu.sitraoro.seguridad.config.SecurityConfig;
import pe.edu.upeu.sitraoro.exception.ConflictException;
import java.util.List;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import org.springframework.test.context.TestPropertySource;
import pe.edu.upeu.sitraoro.exception.GlobalExceptionHandler;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;

@WebMvcTest(controllers = {RecepcionLeyController.class, GlobalExceptionHandler.class})
@Import({SecurityConfig.class, RecepcionLeyControllerTest.SeguridadMvc.class})
@TestPropertySource(properties = "sitraoro.security.jwt.secret=AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=")
class RecepcionLeyControllerTest {
    @TestConfiguration
    @EnableWebSecurity
    static class SeguridadMvc {}

    @Autowired MockMvc mvc;
    @MockitoBean RecepcionLeyService service;

    private static org.springframework.test.web.servlet.request.RequestPostProcessor mayorista() {
        return org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt()
                .authorities(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_G1_MAYORISTA"));
    }

    private static org.springframework.test.web.servlet.request.RequestPostProcessor acopiador() {
        return org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt()
                .authorities(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_G2_ACOPIADOR"));
    }

    @Test void exigeSesion() throws Exception { mvc.perform(get("/api/v1/mayorista/recepciones-ley")).andExpect(status().isUnauthorized()); }

    @Test void rechazaOtroRol() throws Exception {
        mvc.perform(get("/api/v1/mayorista/recepciones-ley").with(acopiador())).andExpect(status().isForbidden());
        verifyNoInteractions(service);
    }

    @Test void permiteConsultarAlMayorista() throws Exception {
        when(service.listar(null)).thenReturn(List.of());
        mvc.perform(get("/api/v1/mayorista/recepciones-ley").with(mayorista())).andExpect(status().isOk()).andExpect(content().json("[]"));
    }

    @Test void rechazaDetalleVacio() throws Exception {
        mvc.perform(put("/api/v1/mayorista/recepciones/1/leyes").with(mayorista()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"revision\":0,\"adelanto\":0,\"detalles\":[]}"))
                .andExpect(status().isBadRequest());
        verifyNoInteractions(service);
    }

    @Test void comunicaConflictoDeVersion() throws Exception {
        when(service.guardar(eq(1L), any())).thenThrow(new ConflictException("Otra operación actualizó este lote"));
        mvc.perform(put("/api/v1/mayorista/recepciones/1/leyes").with(mayorista()).contentType(MediaType.APPLICATION_JSON).content("""
                {"revision":0,"adelanto":0,"detalles":[{"onza":4000,"ley":90,"porcentaje":7.7,"tipoCambio":3.37,"pesoSinFundirG":11,"pesoFundidoG":10}]}
                """)) .andExpect(status().isConflict());
    }
}
