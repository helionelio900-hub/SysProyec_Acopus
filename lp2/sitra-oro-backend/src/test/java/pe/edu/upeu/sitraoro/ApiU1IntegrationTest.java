package pe.edu.upeu.sitraoro;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.ObjectMapper;
import org.springframework.jdbc.core.JdbcTemplate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/** Recorre HTTP, validación, servicios, mapper y persistencia sin mocks. */
@SpringBootTest
@AutoConfigureMockMvc
class ApiU1IntegrationTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @Autowired JdbcTemplate jdbc;

    @Test
    void relacionMineroCompraSeSerializaYProtegeReferencias() throws Exception {
        String creado = mvc.perform(post("/api/v1/acopio/mineros").contentType("application/json")
                        .content("{\"documentoIdentidad\":\"U1REL00001\",\"nombresApellidos\":\"Minero relación\"}"))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        long id = json.readTree(creado).get("idMinero").asLong();
        try {
            mvc.perform(post("/api/v1/acopio/transacciones").contentType("application/json").content("""
                    {"idMinero":%d,"pesoSinFundirG":11,"pesoFundidoNetoG":10,"tipoOro":"ROJO","precioAplicadoPen":280}
                    """.formatted(id)))
                    .andExpect(status().isCreated()).andExpect(jsonPath("$.minero.idMinero").value(id))
                    .andExpect(jsonPath("$.totalPagadoPen").value(2800));
            mvc.perform(get("/api/v1/acopio/mineros/{id}/transacciones", id))
                    .andExpect(status().isOk()).andExpect(jsonPath("$[0].minero.idMinero").value(id))
                    .andExpect(jsonPath("$[0].minero.transacciones").doesNotExist());
            mvc.perform(delete("/api/v1/acopio/mineros/{id}", id)).andExpect(status().isConflict());
        } finally {
            // Solo los datos creados por este caso en la base aislada de pruebas.
            jdbc.update("delete from TRANSACCIONES_G2 where ID_MINERO = ?", id);
            jdbc.update("delete from MINEROS where ID_MINERO = ?", id);
        }
    }

    @Test
    void crudPersisteYEliminaConTraceId() throws Exception {
        String body = """
                {"documentoIdentidad":"U1CRUD0001","nombresApellidos":"Minero integración","zonaProcedencia":"Puno"}
                """;
        String creado = mvc.perform(post("/api/v1/acopio/mineros").contentType("application/json")
                        .header("X-Trace-ID", "u1-crud").content(body))
                .andExpect(status().isCreated()).andExpect(header().string("X-Trace-ID", "u1-crud"))
                .andReturn().getResponse().getContentAsString();
        long id = json.readTree(creado).get("idMinero").asLong();
        try {
            mvc.perform(get("/api/v1/acopio/mineros/{id}", id))
                    .andExpect(status().isOk()).andExpect(jsonPath("$.zonaProcedencia").value("Puno"));
            mvc.perform(put("/api/v1/acopio/mineros/{id}", id).contentType("application/json")
                            .content(body.replace("Puno", "Juliaca")))
                    .andExpect(status().isOk());
            mvc.perform(get("/api/v1/acopio/mineros/{id}", id))
                    .andExpect(jsonPath("$.zonaProcedencia").value("Juliaca"));
            mvc.perform(post("/api/v1/acopio/mineros").contentType("application/json").content(body)
                            .header("X-Trace-ID", "u1-duplicado"))
                    .andExpect(status().isConflict()).andExpect(jsonPath("$.traceId").value("u1-duplicado"));
        } finally {
            mvc.perform(delete("/api/v1/acopio/mineros/{id}", id)).andExpect(status().isNoContent());
        }
        mvc.perform(get("/api/v1/acopio/mineros/{id}", id)).andExpect(status().isNotFound());
    }

    @Test
    void erroresDeEntradaTienenDetalleYCorrelacion() throws Exception {
        mvc.perform(post("/api/v1/acopio/mineros").contentType("application/json")
                        .header("X-Trace-ID", "u1-validacion").content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos.documentoIdentidad").exists())
                .andExpect(jsonPath("$.traceId").value("u1-validacion"));
        mvc.perform(post("/api/v1/acopio/mineros").contentType("application/json").content("{"))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.traceId").isNotEmpty());
        mvc.perform(get("/api/v1/mayorista/liquidaciones").param("estado", "INVENTADO"))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.status").value(400));
    }

    @Test
    void detalleNuloYPesoCeroSeRechazanAntesDePersistir() throws Exception {
        String plantilla = """
                {"nombreAcopiadorG2":"Prueba","cotizacionOnzaUsd":2650,"tipoCambioUsdPen":3.75,"detalles":[%s]}
                """;
        for (String detalle : new String[]{"null", "{\"tipoOro\":\"ROJO\",\"pesoFundidoG\":0}"}) {
            mvc.perform(post("/api/v1/mayorista/liquidaciones").contentType("application/json")
                            .content(plantilla.formatted(detalle)))
                    .andExpect(status().isBadRequest()).andExpect(jsonPath("$.campos").isNotEmpty());
        }
    }

    @Test
    void corsPermiteOrigenConfiguradoYExponeTraceId() throws Exception {
        mvc.perform(options("/api/v1/acopio/mineros").header("Origin", "http://localhost:4200")
                        .header("Access-Control-Request-Method", "POST")
                        .header("Access-Control-Request-Headers", "content-type,x-trace-id"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:4200"));
        mvc.perform(get("/api/v1/acopio/mineros").header("Origin", "http://localhost:4200"))
                .andExpect(header().string("Access-Control-Expose-Headers", "X-Trace-ID"));
        mvc.perform(options("/api/v1/acopio/mineros").header("Origin", "http://localhost:4300")
                        .header("Access-Control-Request-Method", "POST"))
                .andExpect(status().isForbidden());
    }
}
