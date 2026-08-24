# INFORME DE EVIDENCIA INDIVIDUAL - SESIÓN S03 (DOMINIO ACOPIO DE ORO)
## CURSO: LENGUAJE DE PROGRAMACIÓN II (LP2)

**Nombre del Archivo Entregable:** `S03_LP2_Equipo05_CalisayaHelio.pdf`

---

## 1. DATOS DEL ESTUDIANTE

* **Nombre del Estudiante:** Helio Calisaya
* **Compañero de Equipo:** Jhymel Nelio Figueroa Chambi
* **Equipo:** Equipo 05 - Proyecto `bomerp-acopio-oro`
* **Sesión:** S03 - Objetos Relacionados en el Dominio Principal (`TransaccionG2` - `Minero`)
* **Rol o Aporte Realizado:** Desarrollador Backend & Integración de Asociación ORM `@ManyToOne`, DTO Relacionado `MineroResumen`, Validación de Referencia en Acopio, Navegación Controlada y Pruebas `@WebMvcTest`.
* **Link de GitHub del Proyecto:** [https://github.com/helionelio900-hub/SysProyec_Acopus](https://github.com/helionelio900-hub/SysProyec_Acopus)

---

## 2. EVIDENCIA TÉCNICA (EVALUADA SOBRE RÚBRICA S03)

### 2.1 Asociación ORM y DTO Relacionado (`@ManyToOne` y `MineroResumen`)

1. **Asociación ORM Unidireccional en Entidad Principal de Dominio (`TransaccionG2.java`):**
   ```java
   @ManyToOne(fetch = FetchType.LAZY)
   @JoinColumn(name = "ID_MINERO", nullable = false)
   private Minero minero;
   ```
   * Mapeada a la llave foránea física `FK_G2_MINERO` sobre `ID_MINERO` en el esquema Oracle `BOM_ACOPIO`.

2. **DTO Relacionado Embebido (`MineroResumen.java`):**
   ```java
   public record MineroResumen(
       Long idMinero,
       String documentoIdentidad,
       String nombresApellidos
   ) {}
   ```
   * DTO de salida liviano embebido en `TransaccionG2Response` para evitar sobre-exponer datos sensibles o campos innecesarios del cliente minero.

3. **Mapeo Compuesto con MapStruct (`TransaccionG2Mapper.java`):**
   ```java
   @Mapper(componentModel = "spring", uses = MineroMapper.class)
   public interface TransaccionG2Mapper {
       @Mapping(target = "idTransaccionG2", ignore = true)
       @Mapping(target = "fechaTransaccion", ignore = true)
       @Mapping(target = "minero", source = "minero")
       TransaccionG2 toEntity(TransaccionG2Request request, Minero minero);

       TransaccionG2Response toResponse(TransaccionG2 transaccionG2);
   }
   ```

---

### 2.2 Validación de Referencias en Acopio (`idMinero`)

* **Validación Sintáctica en DTO (`TransaccionG2Request.java`):**
  `@NotNull(message = "El ID del minero es obligatorio") Long idMinero;`
* **Validación de Existencia Real en Service (`AcopiadorServiceImpl.java`):**
  ```java
  private Minero buscarMineroOFallar(Long idMinero) {
      return mineroRepository.findById(idMinero)
              .orElseThrow(() -> new ResourceNotFoundException("Minero no encontrado: " + idMinero));
  }
  ```
* **Caso Inválido Probado (HTTP 404 Not Found):**
  * Solicitud `POST /api/v1/acopio/transacciones` enviando `idMinero: 999999` responde `404 Not Found` capturado por `GlobalExceptionHandler`.

---

### 2.3 Navegación Controlada y Prevención de Ciclos de Serialización

1. **Endpoint de Navegación Controlada en `MineroController.java`:**
   ```java
   @Operation(summary = "Lista las transacciones de acopio de un minero (Navegación Controlada)")
   @GetMapping("/{id}/transacciones")
   public ResponseEntity<List<TransaccionG2Response>> listarTransaccionesPorMinero(@PathVariable Long id) {
       return ResponseEntity.ok(acopiadorService.listarPorMinero(id));
   }
   ```
   * Consulta explícita bajo demanda sin cargar colecciones `@OneToMany` automáticas en la entidad `Minero`.

2. **Prevención de Ciclos de Serialización:**
   * La relación se mantiene **unidireccional** (`TransaccionG2` $\rightarrow$ `Minero`), por lo que la entidad `Minero` no contiene ningún campo `List<TransaccionG2>`.
   * Jackson serializa exclusivamente DTOs (`TransaccionG2Response` embebiendo `MineroResumen`), eliminando cualquier riesgo de recursión infinita o `StackOverflowError`.

---

### 2.4 CRUD Completo de la Entidad Relacionada del Dominio (`Minero`)

| Operación | Método HTTP | Endpoint | Código HTTP Esperado | Descripción |
|---|:---:|---|:---:|---|
| **Listar** | `GET` | `/api/v1/acopio/mineros` | `200 OK` | Devuelve lista de mineros registrados |
| **Buscar por ID** | `GET` | `/api/v1/acopio/mineros/{id}` | `200 OK` | Devuelve minero por ID |
| **Crear** | `POST` | `/api/v1/acopio/mineros` | `201 Created` | Registra nuevo minero en acopio |
| **Actualizar** | `PUT` | `/api/v1/acopio/mineros/{id}` | `200 OK` | Actualiza datos del minero |
| **Eliminar** | `DELETE` | `/api/v1/acopio/mineros/{id}` | `204 No Content` | Elimina minero del sistema |
| **Navegación** | `GET` | `/api/v1/acopio/mineros/{id}/transacciones` | `200 OK` / `404` | Lista compras de oro del minero |

---

### 2.5 Cobertura con Pruebas Automatizadas (@WebMvcTest) en Verde

1. **Pruebas en `MineroControllerTest.java`:**
   - `crear_conDatosValidos_respondeCreated` ✅
   - `crear_conDocumentoVacio_respondeBadRequest` ✅
   - `obtener_conIdInexistente_respondeNotFound` ✅
   - `listarTransaccionesPorMinero_conMineroExistente_respondeOkConSusTransacciones` ✅
   - `listarTransaccionesPorMinero_conMineroInexistente_respondeNotFound` ✅

2. **Resultado de Ejecución de Pruebas Automatizadas (Maven):**
   `[INFO] Results: Tests run: 18, Failures: 0, Errors: 0, Skipped: 0` $\rightarrow$ `BUILD SUCCESS`.

---

## 3. ERROR O HALLAZGO TÉCNICO DIAGNOSTICADO

* **Descripción del Problema:** Al mapear la relación entre `TransaccionG2` y `Minero` en `TransaccionG2Mapper`, MapStruct generó un error por ambigüedad de fuentes al intentar resolver atributos compartidos.
* **Causa Raíz:** El mapper de MapStruct al recibir múltiples objetos de entrada requería la calificación explícita del parámetro origen.
* **Solución Aplicada:** Se agregó la anotación `@Mapping(target = "minero", source = "minero")` especificando el parámetro `Minero minero` resuelto previamente en el Service.

---

## 4. REFLEXIÓN TÉCNICA BREVE (5 A 8 LÍNEAS)

Mantener la relación ORM unidireccional entre la transacción de acopio (`TransaccionG2`) y el cliente (`Minero`) evita declarar colecciones `@OneToMany` innecesarias. Esta decisión elimina la posibilidad de ciclos infinitos de serialización JSON y evita cargar listas pesadas de transacciones al consultar datos de un minero. La navegación entre el minero y sus entregas de oro se resuelve mediante un endpoint explícito bajo demanda (`GET /api/v1/acopio/mineros/{id}/transacciones`), manteniendo la API REST modular, limpia y eficiente.

---

## 5. RESPUESTAS A LAS PREGUNTAS DE DEFENSA (SESIÓN S03)

1. **¿Por qué `TransaccionG2Response` embebe un `MineroResumen` y no la entidad `Minero` completa?**
   * Para desacoplar los contratos de la API. `MineroResumen` expone únicamente los datos indispensables del minero (`idMinero`, `documentoIdentidad`, `nombresApellidos`), protegiendo otros campos internos.

2. **¿Qué garantiza que esta sesión nunca produzca un ciclo de serialización?**
   * Que la relación ORM es estrictamente unidireccional y que se serializan únicamente DTOs inmutables (`TransaccionG2Response` y `MineroResumen`), nunca entidades JPA.

3. **¿Por qué el mapper no consulta la base de datos para resolver `idMinero`?**
   * Porque los mappers son clases puras de transformación. La consulta y validación de existencia en la base de datos Oracle es responsabilidad del `AcopiadorServiceImpl`.

4. **¿Qué significa "navegación controlada" y en qué se diferencia de un `@OneToMany` automático?**
   * Significa consultar los datos asociados bajo demanda mediante un endpoint dedicado. Se diferencia en que no carga la lista de transacciones en memoria cada vez que se busca un minero.

5. **¿Por qué `ModularityTests` sigue pasando aunque `minero` y `transaccionG2` se conocen entre sí?**
   * Porque ambas entidades pertenecen al mismo módulo funcional de negocio (`pe.edu.upeu.bomerp.acopio`). Spring Modulith verifica dependencias entre módulos distintos, no dentro de un mismo módulo.

---

## 6. ANEXO: FEEDBACK DE LA SESIÓN S03

1. **Integrantes del Equipo 05:**
   * Helio Calisaya (Presentador de este informe)
   * Jhymel Nelio Figueroa Chambi

2. **¿Cuál es el aprendizaje más importante que te llevas de la clase de hoy?**
   * Aplicar la asociación ORM `@ManyToOne`, DTOs de resumen embebidos y navegación controlada sobre el dominio real de acopio de oro.

3. **¿Qué punto de la clase te resultó más confuso o te dejó con dudas?**
   * La desambiguación en mappers con múltiples parámetros en MapStruct.

4. **¿Tienes alguna pregunta que te gustaría que sea respondida la siguiente clase?**
   * ¿Cómo manejar operaciones transaccionales complejas de cabecera-detalle en S4?

5. **Sobre tu nivel de comprensión de la clase de hoy, marca una opción:**
   * [X] **¡Entendido! - Lo domino y podría explicarlo.**

6. **Pensando en tu participación y esfuerzo en la clase de hoy, ¿cómo te autoevaluarías?:**
   * [X] **Muy Comprometido/a: Me esforcé al máximo.**

7. **Mi satisfacción con la clase fue:**
   * **10** (Muy satisfecho)
