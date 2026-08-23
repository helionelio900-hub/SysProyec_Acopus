# INFORME DE EVIDENCIA INDIVIDUAL - SESIÓN S02
## CURSO: LENGUAJE DE PROGRAMACIÓN II (LP2)

**Nombre del Archivo Entregable:** `S02_LP2_Equipo05_FigueroaJhymel.pdf`

---

## DATOS DEL ESTUDIANTE

* **Nombre del Estudiante:** Jhymel Nelio Figueroa Chambi
* **Compañero de Equipo:** Helio Calisaya
* **Equipo:** Equipo 05 - Proyecto `bomerp-acopio-oro`
* **Sesión:** S02 - CRUD REST Completo de Entidades Principales, Validaciones, Manejo Global de Excepciones y Logs
* **Rol o Aporte Realizado:** Desarrollador Backend & Integración de Servicios, DTOs y Pruebas de API
* **Link de GitHub del Proyecto:** [https://github.com/helionelio900-hub/SysProyec_Acopus](https://github.com/helionelio900-hub/SysProyec_Acopus)

---

## EVIDENCIA TÉCNICA (EVALUADA SOBRE RÚBRICA S02)

### BLOQUE 1: Ejecución, Configuración Reproducible y Logs Estructurados (Peso: 20%)

1. **Ejecución del Backend (Java 21 + Spring Boot 4.0.7):**
   * Ejecutado mediante el Maven Wrapper oficial del proyecto (`.\mvnw.cmd spring-boot:run`).
   * **Compilación:** `BUILD SUCCESS` (0 errores de compilación en 48 archivos fuente Java).
   * **Logs Estructurados:** Se configuró Logback (`logback-spring.xml`) guardando trazas en `logs/bomerp.log` con Correlation ID para trazabilidad HTTP.

2. **Configuración por Ambiente sin Secretos Expuestos:**
   * Archivo de perfil local: `application-dev.yml` con credenciales de desarrollo en laptop (`BOMERP_APP` / `123456`).

---

### BLOQUE 2: CRUD REST Completo & Manejo Global de Excepciones (Peso: 20%)

1. **Controlador Global de Excepciones (`@RestControllerAdvice`):**
   * Se creó `GlobalExceptionHandler.java` para capturar errores de validación `@Valid` y excepciones de recursos no encontrados.

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error -> 
            errors.put(error.getField(), error.getDefaultMessage())
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errors);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgumentException(IllegalArgumentException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", ex.getMessage()));
    }
}
```

---

### BLOQUE 3: Entidades ORM, Repositorios JPA, Servicios y DTOs (`record`) (Peso: 20%)

1. **Entidades Principales Implementadas:**
   * `Minero` (`@Table(name = "MINEROS", schema = "BOM_ACOPIO")`)
   * `TransaccionG2` (`@Table(name = "TRANSACCIONES_G2", schema = "BOM_ACOPIO")`)
   * `LiquidacionG1` (`@Table(name = "LIQUIDACIONES_G1", schema = "BOM_ACOPIO")`)
   * `ParametrosSistema` (`@Table(name = "PARAMETROS_SISTEMA", schema = "BOM_ACOPIO")`)

2. **Tabla de Endpoints CRUD REST del Dominio `bomerp-acopio-oro`:**

| Módulo | Método | Endpoint HTTP | Descripción | DTO Request / Response |
|---|:---:|---|---|---|
| **Seguridad** | `POST` | `/api/v1/auth/login` | Login y emisión de JWT | `AuthRequest` $\rightarrow$ `AuthResponse` |
| **Cotizador** | `GET` | `/api/v1/cotizador/estimar` | Consulta pública estimativa | `pesoBrutoGramos` $\rightarrow$ `CotizacionEstimadaResponse` |
| **Acopiador G2** | `POST` | `/api/v1/acopio/transacciones` | Registro CRUD compra G2 | `TransaccionG2Request` $\rightarrow$ `TransaccionG2Response` |
| **Acopiador G2** | `GET` | `/api/v1/acopio/transacciones` | Listar compras presenciales | List<`TransaccionG2Response`> |
| **Acopiador G2** | `GET` | `/api/v1/acopio/acumulados-semanales` | Acumulados por color | `AcumuladosG2Response` |
| **Mayorista G1** | `POST` | `/api/v1/mayorista/liquidaciones` | Cierre semanal Onza/USD | `LiquidacionG1Request` $\rightarrow$ `LiquidacionG1Response` |
| **Dashboard** | `GET` | `/api/v1/dashboard/consolidado` | Reporte consolidado general | `DashboardResponse` |

---

### BLOQUE 4: Documentación OpenAPI y Versionado (Peso: 20%)

* Documentación OpenAPI navegable mediante Swagger UI en `http://localhost:8080/swagger-ui.html`.
* Todos los controladores CRUD utilizan la ruta base versionada `/api/v1/...`.

---

### BLOQUE 5: Estructura Modular y ModularityTests en Verde (Peso: 20%)

* Paquetes de negocio agrupados en `pe.edu.upeu.bomerp.acopio` (`seguridad`, `cotizador`, `acopiador`, `mayorista`, `parametros`).
* `ModularityTests` de Spring Modulith ejecutado con resultado **VERDE** (PASS).

---

## RESPUESTAS A LAS PREGUNTAS DE DEFENSA (SESIÓN S02)

1. **¿Qué función cumple `@Valid` en los métodos del controlador REST?**
   * Activa las anotaciones de validación (`@NotNull`, `@Positive`, `@NotBlank`) definidas en el DTO Request antes de ejecutar el código del método. Si falla alguna validación, Spring lanza automáticamente `MethodArgumentNotValidException`.

2. **¿Por qué se utiliza `@RestControllerAdvice` para el manejo de excepciones?**
   * Permite desacoplar el tratamiento de errores de los controladores, capturando excepciones de forma centralizada y devolviendo respuestas JSON estandarizadas con códigos HTTP adecuados (400, 404, 500).

3. **¿Cuál es la ventaja de usar Java `record` para los DTOs?**
   * Los `record` son inmutables, concisos y auto-generan getters, `equals()`, `hashCode()` y `toString()`, lo que evita código redundante y garantiza que los DTOs de salida no sufran modificaciones accidentales.

4. **¿Por qué las entidades JPA llevan `schema = "BOM_ACOPIO"` en `@Table`?**
   * Porque en Oracle los objetos pertenecen a esquemas propietarios por módulo (`BOM_ACOPIO`), y la aplicación se conecta a través del usuario ejecutor `BOMERP_APP`.

5. **¿Cómo se prueban las validaciones del controlador mediante pruebas de API?**
   * Se utiliza `@WebMvcTest` junto con `MockMvc` para simular peticiones HTTP POST enviando JSONs con campos vacíos o inválidos, verificando que la API responda HTTP 400 Bad Request.

6. **¿Qué garantiza el uso de Logback y Correlation ID en las peticiones HTTP?**
   * Permite rastrear una petición desde que entra al controlador hasta que consulta la base de datos mediante un identificador único, facilitando el diagnóstico rápido de errores en entornos distribuidos.

---

## ERROR O HALLAZGO TÉCNICO DIAGNOSTICADO

* **Hallazgo:** Se detectó que si se enviaba un JSON con `tipoOro` en minúsculas o con espacios (`" rojo "`), la consulta SQL en Oracle fallaba al buscar por la clave `ROJO`.
* **Solución:** En `AcopiadorServiceImpl.java` y `MayoristaServiceImpl.java` se implementó la normalización `.trim().toUpperCase()` y se agregó validación explícita para aceptar únicamente los valores `"ROJO"` y `"VERDE"`, respondiendo un mensaje descriptivo de error HTTP 400 en lugar de un fallo en la BD.

---

## REFLEXIÓN TÉCNICA BREVE (5 A 8 LÍNEAS)

La implementación de un CRUD REST profesional exige separar rigurosamente las responsabilidades entre la capa de presentación (controladores y DTOs) y la capa de datos (entidades JPA). El uso de un manejador global de excepciones con `@RestControllerAdvice` junto a la validación explícita con `@Valid` garantiza que la API REST entregue respuestas de error limpias, previsibles y seguras al cliente sin exponer trazas internas del servidor. Adicionalmente, el registro de trazas estructuradas con Logback proporciona la observabilidad necesaria para monitorear el comportamiento del backend durante la ejecución diaria.

---

## ANEXO: FEEDBACK DE LA SESIÓN S02

1. ** Integrantes del Equipo 05:**
   * Jhymel Nelio Figueroa Chambi (Presentador de este informe)
   * Helio Calisaya

2. **¿Cuál es el aprendizaje más importante que te llevas de la clase de hoy?**
   * La estructuración de controladores CRUD REST acoplados a repositorios Spring Data JPA y manejo de DTOs inmutables con `record`.

3. **¿Qué punto de la clase te resultó más confuso o te dejó con dudas?**
   * La configuración de logs estructurados con Logback y Correlation ID.

4. **Nivel de comprensión de la clase de hoy:**
   * [X] **¡Entendido! - Lo domino y podría explicarlo.**

5. **Autoevaluación de participación y esfuerzo:**
   * [X] **Muy Comprometido/a: Me esforcé al máximo.**

6. **Calificación de satisfacción con la clase (1 a 10):**
   * **10**
