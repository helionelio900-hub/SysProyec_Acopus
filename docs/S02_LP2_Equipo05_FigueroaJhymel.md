# INFORME DE EVIDENCIA INDIVIDUAL - SESIÓN S02
## CURSO: LENGUAJE DE PROGRAMACIÓN II (LP2)

**Nombre del Archivo Entregable:** `S02_LP2_Equipo05_FigueroaJhymel.pdf`

---

## 1. DATOS DEL ESTUDIANTE

* **Nombre del Estudiante:** Jhymel Nelio Figueroa Chambi
* **Compañero de Equipo:** Helio Calisaya
* **Equipo:** Equipo 05 - Proyecto `sitra-oro`
* **Sesión:** S02 - CRUD REST Completo de Producto / Entidad Principal de Dominio
* **Rol o Aporte Realizado:** Desarrollador Backend & Integración de Servicios, DTOs, Mappers, Validaciones, Pruebas `@WebMvcTest` y Conexión Oracle 21c XE.
* **Link de GitHub del Proyecto:** [https://github.com/helionelio900-hub/SysProyec_Acopus](https://github.com/helionelio900-hub/SysProyec_Acopus)

---

## 2. EVIDENCIA TÉCNICA (EVALUADA SOBRE RÚBRICA S02)

### 2.1 DTO, Mapeo y Validación (`ProductoRequest` / `ProductoResponse` y `ProductoMapper`)

1. **DTO de Entrada (`ProductoRequest.java`):**
   Valida dos o más reglas de forma explícitas mediante `@NotBlank`, `@Size`, `@NotNull` y `@Positive`:

   ```java
   public record ProductoRequest(
       @NotBlank(message = "El nombre del producto no puede estar vacío")
       @Size(min = 2, max = 120, message = "El nombre debe tener entre 2 y 120 caracteres")
       String nombre,

       @NotNull(message = "El precio es obligatorio")
       @Positive(message = "El precio debe ser un valor positivo mayor a cero")
       BigDecimal precio,

       @NotNull(message = "El stock es obligatorio")
       @Min(value = 0, message = "El stock no puede ser negativo")
       Integer stock
   ) {}
   ```

2. **DTO de Salida (`ProductoResponse.java`):**
   ```java
   public class ProductoResponse {
       private Long id;
       private String nombre;
       private BigDecimal precio;
       private Integer stock;
       // Getters, Setters y Constructores
   }
   ```

3. **Mapper Dedicado (`ProductoMapper.java`):**
   Separación limpia de mapeo entre Entidad JPA (`Producto`) y DTOs:

   ```java
   @Component
   public class ProductoMapper {
       public Producto toEntity(ProductoRequest request) {
           Producto entity = new Producto();
           entity.setNombre(request.nombre().trim());
           entity.setPrecio(request.precio());
           entity.setStock(request.stock());
           return entity;
       }

       public ProductoResponse toResponse(Producto entity) {
           ProductoResponse response = new ProductoResponse();
           response.setId(entity.getId());
           response.setNombre(entity.getNombre());
           response.setPrecio(entity.getPrecio());
           response.setStock(entity.getStock());
           return response;
       }
   }
   ```

4. **Evidencia de Caso Inválido (HTTP 400 Bad Request):**
   * **Petición POST:** `http://localhost:8081/api/v1/productos` enviando JSON inválido `{"nombre":"","precio":-10,"stock":-5}`.
   * **Respuesta HTTP:** `400 Bad Request` capturada por `GlobalExceptionHandler`.

---

### 2.2 Operaciones CRUD Funcionales y Pruebas Automatizadas (@WebMvcTest) en Verde

1. **Tabla de Operaciones CRUD en `ProductoController.java`:**

| Operación | Método HTTP | Endpoint | Código HTTP Esperado | Descripción |
|---|:---:|---|:---:|---|
| **Crear** | `POST` | `/api/v1/productos` | `201 Created` | Registra nuevo producto en catálogo |
| **Buscar por ID** | `GET` | `/api/v1/productos/{id}` | `200 OK` | Devuelve producto por su identificador |
| **Actualizar** | `PUT` | `/api/v1/productos/{id}` | `200 OK` | Actualiza atributos del producto |
| **Eliminar** | `DELETE` | `/api/v1/productos/{id}` | `204 No Content` | Elimina producto del sistema |

2. **Prueba Automatizada del Controller (`@WebMvcTest`) en Verde:**
   * Archivo de Prueba: `ProductoControllerTest.java`
   * Resultado de Maven (`.\mvnw.cmd test`):

   ```text
   [INFO] Running pe.edu.upeu.sitraoro.catalogo.producto.controller.ProductoControllerTest
   [INFO] Tests run: 4, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 1.837 s -- in pe.edu.upeu.sitraoro.catalogo.producto.controller.ProductoControllerTest
   [INFO] Results:
   [INFO] Tests run: 7, Failures: 0, Errors: 0, Skipped: 0
   [INFO] BUILD SUCCESS
   ```

---

### 2.3 Manejo de Errores y Trazabilidad

1. **Caso de ID Inexistente (HTTP 404 Not Found):**
   * **Petición GET:** `http://localhost:8081/api/v1/productos/999999`
   * **Respuesta HTTP:** `404 Not Found` lanzado vía `ResourceNotFoundException("Producto no encontrado con el ID: 999999")` y capturado en `GlobalExceptionHandler`.

2. **Log de Petición con Trazabilidad (Correlation ID / Trace ID):**
   * Implementado mediante `CorrelationIdFilter.java` y configurado en `logback-spring.xml`.
   * **Registro en Log (`logs/bomerp.log`):**
     `2026-08-23 21:59:52.610 [traceId=req-4a8b-9f12] DEBUG p.e.u.b.filter.CorrelationIdFilter - Filter 'correlationIdFilter' configured for use`

3. **Conexión a Base de Datos Oracle Nativa Integrada:**
   * Instancia: **Oracle 21c XE**
   - URL JDBC: `jdbc:oracle:thin:@localhost:1521/XEPDB1`
   - Esquemas Creados: `BOM_CATALOGO`, `BOM_ACOPIO` y `BOMERP_APP`.
   - Servidor HTTP Backend: Ejecutándose en puerto `8081` de Tomcat.

---

### 2.4 Separación de Responsabilidades (Estructura de Paquetes)

La arquitectura sigue una separación estricta en capas dentro del módulo de catálogo:

```text
pe.edu.upeu.sitraoro.catalogo.producto/
├── controller/
│   └── ProductoController.java      <-- Exposición de Endpoints REST
├── dto/
│   ├── ProductoRequest.java          <-- DTO de Entrada con Validaciones
│   └── ProductoResponse.java         <-- DTO de Salida
├── entity/
│   └── Producto.java                 <-- Entidad JPA (@Table(schema = "BOM_CATALOGO"))
├── mapper/
│   └── ProductoMapper.java           <-- Mapeo Entidad <-> DTO
├── repository/
│   └── ProductoRepository.java       <-- Interfaz JPA Repository
└── service/
    ├── ProductoService.java          <-- Interfaz de Servicio
    └── ProductoServiceImpl.java      <-- Lógica de Negocio CRUD
```

---

## 3. ERROR O HALLAZGO TÉCNICO DIAGNOSTICADO

* **Descripción del Problema:** Al ejecutar el test automatizado `mvnw test` e iniciar la aplicación en el perfil `dev`, se presentó la excepción `org.h2.jdbc.JdbcSQLSyntaxErrorException: Schema "BOM_CATALOGO" no encontrado` y posteriormente en Oracle `ORA-01950: no existen privilegios en tablespace 'USERS'`.
* **Causa Raíz:** La entidad `Producto` especifica `@Table(name = "PRODUCTO", schema = "BOM_CATALOGO")`. En la base de datos Oracle nativa (`XEPDB1`), la tabla debía existir en el esquema propietario `BOM_CATALOGO` y el usuario ejecutor `BOMERP_APP` requería cuota de almacenamiento (`QUOTA UNLIMITED ON USERS`) y permisos DML.
* **Solución Aplicada:** Se creó el script SQL [S01_04_catalogo.sql](file:///e:/Cursos_Ciclo_4/Lenguaje%20de%20Programaci%C3%B3n%20II/sitra-oro/bd2/S01_04_catalogo.sql), se otorgaron privilegios de tablespace a `BOMERP_APP` y se crearon las tablas correspondientes en `XEPDB1`, logrando que la suite completa de 7 pruebas en Maven pasara a estado **BUILD SUCCESS**.

---

## 4. REFLEXIÓN TÉCNICA BREVE (5 A 8 LÍNEAS)

Separar el mapeo entre entidad JPA y DTOs en una clase Mapper dedicada (`ProductoMapper`) es fundamental para mantener el principio de responsabilidad única (SRP). Al desacoplar la conversión de datos del controlador y del servicio, evitamos la duplicación de código de transformación y protegemos las entidades de persistencia frente a cambios en la interfaz de la API. Además, esta separación facilita la construcción de pruebas unitarias aisladas tanto para los servicios como para el controlador mediante `@WebMvcTest`. Por último, permite evolucionar los contratos DTOs sin alterar la estructura interna de la base de datos.

---

## 5. RESPUESTAS A LAS PREGUNTAS DE DEFENSA (SESIÓN S02)

1. **¿Por qué `ProductoResponse` pasó de record a clase en esta sesión?**
   * Para permitir mayor flexibilidad en la serialización/deserialización de librerías como Jackson o MapStruct en respuestas complejas que requieran herencia o referencias cíclicas gestionadas con setters.

2. **¿Qué diferencia hay entre la validación de forma (`@Valid`) y una regla de negocio?**
   * La validación de forma (`@Valid`) comprueba restricciones sintácticas o de formato en el DTO (ej. campos no nulos, tamaños de cadena), mientras que una regla de negocio valida condiciones lógicas avanzadas en el Service (ej. verificar que un producto tenga stock disponible antes de vender).

3. **¿Qué código HTTP corresponde a "recurso no encontrado" y quién lo genera en tu backend?**
   * Corresponde el código `404 Not Found`. En nuestro backend lo genera `GlobalExceptionHandler` al capturar `ResourceNotFoundException`, la cual es lanzada por el `ProductoServiceImpl` cuando `repository.findById(id)` retorna `Optional.empty()`.

4. **¿Qué pasaría si el controller construyera la entidad directamente, sin pasar por el Mapper?**
   * Se violaría la separación de capas, acoplando fuertemente el controlador HTTP a los detalles internos de persistencia JPA. Esto provocaría duplicación de código en múltiples endpoints y expondría atributos sensibles o internos de la base de datos al cliente.

5. **¿Por qué tu prueba de controller usa `@WebMvcTest` y no `@SpringBootTest`?**
   * Porque `@WebMvcTest` carga únicamente la capa Web (controlador, filtros, mappers, manejo de excepciones), ofreciendo pruebas unitarias ultra rápidas y enfocadas sin necesidad de inicializar todo el contexto de Spring Data JPA ni levantar la base de datos real.

---

## 6. ANEXO: FEEDBACK DE LA SESIÓN S02

1. **Integrantes del Equipo 05:**
   * Jhymel Nelio Figueroa Chambi (Presentador de este informe)
   * Helio Calisaya

2. **¿Cuál es el aprendizaje más importante que te llevas de la clase de hoy?**
   * La estructuración de controladores CRUD REST acoplados a repositorios Spring Data JPA y el manejo de DTOs con validaciones explícitas (`@Valid`).

3. **¿Qué punto de la clase te resultó más confuso o te dejó con dudas?**
   * Las diferencias de ejecución entre pruebas `@WebMvcTest` de la capa controller y pruebas `@SpringBootTest` con contexto completo.

4. **¿Tienes alguna pregunta que te gustaría que sea respondida la siguiente clase?**
   * ¿Cómo manejar relaciones de entidades M:N eficientemente mediante DTOs sin causar peticiones N+1 en Hibernate?

5. **Sobre tu nivel de comprensión de la clase de hoy, marca una opción:**
   * [X] **¡Entendido! - Lo domino y podría explicarlo.**

6. **Pensando en tu participación y esfuerzo en la clase de hoy, ¿cómo te autoevaluarías?:**
   * [X] **Muy Comprometido/a: Me esforcé al máximo.**

7. **Mi satisfacción con la clase fue:**
   * **10** (Muy satisfecho)
