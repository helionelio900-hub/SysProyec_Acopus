package pe.edu.upeu.sitraoro.acopio.minero;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import pe.edu.upeu.sitraoro.acopio.parametros.dto.MineroRequest;
import pe.edu.upeu.sitraoro.acopio.parametros.service.MineroService;
import pe.edu.upeu.sitraoro.seguridad.entity.RolCuenta;
import pe.edu.upeu.sitraoro.seguridad.service.CuentaAccesoService;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class MineroModuleIntegrationTest {

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @Autowired CuentaAccesoService cuentaAccesoService;
    @Autowired MineroService mineroService;

    @Test
    void mayoristaCreaCentroYMineroConRegistroPrevioActivaCuentaEnAcopio() throws Exception {
        String claveMayorista = "ClaveMayorista2026!";
        cuentaAccesoService.crearCuenta("90000001", claveMayorista, RolCuenta.G1_MAYORISTA,
                null, null, true);
        String tokenMayorista = iniciarSesion("90000001", claveMayorista);

        String centroJson = mvc.perform(post("/api/v1/mayorista/centros-acopio")
                        .header("Authorization", "Bearer " + tokenMayorista)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"nombre":"Centro Integración","zona":"La Rinconada","direccion":"Av. Minería 123",
                                 "telefono":"987654321","documentoAcopiador":"90000002","claveInicialAcopiador":"ClaveAcopio2026!"}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.idCentroAcopio").isNumber())
                .andReturn().getResponse().getContentAsString();
        long idCentro = json.readTree(centroJson).get("idCentroAcopio").asLong();
        String segundoCentroJson = mvc.perform(post("/api/v1/mayorista/centros-acopio")
                        .header("Authorization", "Bearer " + tokenMayorista)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"nombre":"Centro Secundario","zona":"Ananea","direccion":"Jr. Oro 45",
                                 "telefono":"987000111","documentoAcopiador":"90000005","claveInicialAcopiador":"ClaveAcopio2026!"}
                                """))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        long idSegundoCentro = json.readTree(segundoCentroJson).get("idCentroAcopio").asLong();

        mvc.perform(get("/api/v1/publico/centros-acopio"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.idCentroAcopio == " + idCentro + ")]").isNotEmpty());

        // Perfil creado anteriormente por el personal de acopio: no se vincula sin revisión presencial.
        mineroService.crear(new MineroRequest("90000003", "Minero Preexistente", "900111222", "Ananea"));
        mvc.perform(post("/api/v1/minero/registro").contentType(MediaType.APPLICATION_JSON).content("""
                        {"documentoIdentidad":"90000003","nombresApellidos":"Minero Preexistente",
                         "telefono":"900111222","zonaProcedencia":"Ananea","clave":"ClaveMinero2026!",
                         "idCentroAcopioPreferido":%d}
                        """.formatted(idCentro)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.estadoCuenta").value("PENDIENTE_VALIDACION"));

        mvc.perform(post("/api/v1/seguridad/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"documentoIdentidad\":\"90000003\",\"clave\":\"ClaveMinero2026!\"}"))
                .andExpect(status().isUnauthorized());

        String tokenAcopiador = iniciarSesion("90000002", "ClaveAcopio2026!");
        mvc.perform(post("/api/v1/acopio/mineros/cuentas-pendientes/90000003/aprobar")
                        .header("Authorization", "Bearer " + tokenAcopiador))
                .andExpect(status().isNoContent());

        String tokenMinero = iniciarSesion("90000003", "ClaveMinero2026!");
        mvc.perform(get("/api/v1/minero/perfil").header("Authorization", "Bearer " + tokenMinero))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.documentoIdentidad").value("90000003"))
                .andExpect(jsonPath("$.idCentroAcopioPreferido").value(idCentro));

        mvc.perform(patch("/api/v1/minero/perfil/centro-acopio")
                        .header("Authorization", "Bearer " + tokenMinero)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"idCentroAcopio\":" + idSegundoCentro + "}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.idCentroAcopioPreferido").value(idSegundoCentro));

        mvc.perform(post("/api/v1/minero/registro").contentType(MediaType.APPLICATION_JSON).content("""
                        {"documentoIdentidad":"90000004","nombresApellidos":"Minero Nuevo",
                         "telefono":"900111223","zonaProcedencia":"La Rinconada","clave":"ClaveMinero2026!",
                         "idCentroAcopioPreferido":%d}
                        """.formatted(idCentro)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.estadoCuenta").value("ACTIVA"));

        mvc.perform(post("/api/v1/seguridad/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"documentoIdentidad\":\"90000004\",\"clave\":\"ClaveMinero2026!\"}"))
                .andExpect(status().isOk());

        mvc.perform(get("/api/v1/acopio/mineros").header("Authorization", "Bearer " + tokenMinero))
                .andExpect(status().isForbidden());
    }

    private String iniciarSesion(String documento, String clave) throws Exception {
        String response = mvc.perform(post("/api/v1/seguridad/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(new Login(documento, clave))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andReturn().getResponse().getContentAsString();
        JsonNode token = json.readTree(response);
        return token.get("accessToken").asString();
    }

    private record Login(String documentoIdentidad, String clave) {}
}
