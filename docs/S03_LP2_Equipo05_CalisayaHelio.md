# INFORME DE EVIDENCIA DE APRENDIZAJE
## SESIÓN S03: ASOCIACIÓN ORM Y DTO RELACIONADO (MINERO — TRANSACCIÓN ACOPIO ORO)

---

### Datos Generales del Estudiante

* **Estudiante:** Faijo Calisaya Helio Paul
* **Equipo de Desarrollo:** Equipo 05 — BomERP Acopio de Oro (`bomerp-acopio-oro`)
* **Proyecto de Dominio:** Sistema de Control y Acopio de Oro (`bomerp-acopio-oro`)
* **Curso / Ciclo:** Lenguaje de Programación II (LP2) — Ciclo IV (Semestre 2026-II)
* **Institución:** Universidad Peruana Unión (UPeU) — Campus Juliaca
* **Rol / Aporte realizado:** Mapeo ORM `@ManyToOne` TransaccionG2-Minero, DTO `MineroResumen`, validación 404, navegación por filtro y CRUD `Minero`.
* **Repositorio GitHub:** https://github.com/helionelio900-hub/SysProyec_Acopus.git

---

## 1. Evidencia Técnica por Bloques de Evaluación

### Bloque 1: Asociación ORM y DTO Relacionado en Dominio Acopio (25%)

En el dominio de Acopio de Oro, la entidad principal `TransaccionG2` (compra presencial de oro fundido) se asoció mediante `@ManyToOne` con carga perezosa (`LAZY`) y `@JoinColumn(name = "ID_MINERO")` hacia la entidad `Minero` (catálogo maestro). En la respuesta JSON, `TransaccionG2Response` embebe el DTO `MineroResumen` (`idMinero`, `documentoIdentidad`, `nombresApellidos`) sin exponer atributos internos ni provocar recursión infinita.

```java
// Entidad TransaccionG2.java
@Entity
@Table(name = "TRANSACCIONES_G2", schema = "BOM_ACOPIO")
public class TransaccionG2 {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_TRANSACCION_G2")
    private Long idTransaccionG2;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_MINERO", nullable = false)
    private Minero minero;

    @Column(name = "PESO_SIN_FUNDIR_G", nullable = false, precision = 10, scale = 3)
    private BigDecimal pesoSinFundirG;

    @Column(name = "PESO_FUNDIDO_NETO_G", nullable = false, precision = 10, scale = 3)
    private BigDecimal pesoFundidoNetoG;

    @Column(name = "TIPO_ORO", nullable = false, length = 10)
    private String tipoOro; // "ROJO" o "VERDE"
    // ...
}
```

> 📷 **[ ESPACIO PARA CAPTURA 1: CÓDIGO DE TRANSACCIONG2.JAVA CON @MANYTOONE Y @JOINCOLUMN ]**  
> *(Pegar captura de VS Code mostrando la entidad `TransaccionG2` y su relación hacia `Minero` con reloj de Windows y usuario visible).*

*Explicación técnica 1:* La entidad `TransaccionG2` mapea la clave foránea `ID_MINERO` de la tabla `BOM_ACOPIO.TRANSACCIONES_G2` mediante `@ManyToOne(fetch = FetchType.LAZY)`, manteniendo la integridad referencial con la tabla `BOM_ACOPIO.MINEROS`.

---

```json
// Respuesta GET /api/v1/acopio/transacciones
[
  {
    "idTransaccionG2": 1,
    "minero": {
      "idMinero": 1,
      "documentoIdentidad": "70123456",
      "nombresApellidos": "Juan Quispe Mamani"
    },
    "pesoSinFundirG": 25.500,
    "pesoFundidoNetoG": 24.200,
    "tipoOro": "ROJO",
    "precioAplicadoPen": 285.50,
    "totalPagadoPen": 6909.10,
    "fechaTransaccion": "2026-08-30T01:43:09.100"
  }
]
```

> 📷 **[ ESPACIO PARA CAPTURA 2: RESPUESTA GET /API/V1/ACOPIO/TRANSACCIONES CON MINERORESUMEN EMBEBIDO ]**  
> *(Pegar captura de consola o cliente REST mostrando el JSON con `minero` anidado con reloj de Windows y usuario visible).*

*Explicación técnica 2:* La consulta de transacciones de compra de oro retorna HTTP 200 OK incluyendo la clasificación de oro (Rojo / Verde), peso neto, total pagado y el DTO anidado `MineroResumen`.

---

### Bloque 2: Validación de Referencias (Respuesta 404 Not Found) (25%)

Al intentar registrar una compra de oro presencial con un `idMinero` que no existe en el sistema, `AcopiadorServiceImpl` valida la referencia mediante `mineroRepository.findById(request.idMinero())`. Al no encontrarlo, lanza `ResourceNotFoundException` y `GlobalExceptionHandler` responde de forma controlada HTTP 404 Not Found sin registrar compras huérfanas.

```java
// AcopiadorServiceImpl.java
private Minero buscarMineroOFallar(Long idMinero) {
    return mineroRepository.findById(idMinero)
            .orElseThrow(() -> new ResourceNotFoundException("Minero no encontrado: " + idMinero));
}
```

> 📷 **[ ESPACIO PARA CAPTURA 3: POST /API/V1/ACOPIO/TRANSACCIONES CON IDMINERO INEXISTENTE (404 NOT FOUND) ]**  
> *(Pegar captura ejecutando compra con `idMinero: 999` recibiendo 404 Not Found con mensaje "Minero no encontrado: 999" con reloj y usuario visible).*

*Explicación técnica 3:* La API rechaza la transacción con HTTP 404 Not Found: `{"error": "Not Found", "message": "Minero no encontrado: 999"}`, impidiendo inconsistencias financieras en el módulo de compras de oro G2.

---

### Bloque 3: Navegación Controlada por Minero (25%)

Se implementó la navegación controlada a través del endpoint `GET /api/v1/acopio/mineros/{id}/transacciones` para listar el historial completo de compras de oro realizadas a un minero específico. Valida la existencia del minero respondiendo 404 si el identificador no existe.

```java
// MineroController.java
@Operation(summary = "Lista las transacciones de acopio de un minero (Navegación Controlada)")
@GetMapping("/{id}/transacciones")
public ResponseEntity<List<TransaccionG2Response>> listarTransaccionesPorMinero(@PathVariable Long id) {
    return ResponseEntity.ok(acopiadorService.listarPorMinero(id));
}
```

> 📷 **[ ESPACIO PARA CAPTURA 4: NAVEGACIÓN CASO VÁLIDO: GET /API/V1/ACOPIO/MINEROS/1/TRANSACCIONES (200 OK) ]**  
> *(Pegar captura mostrando el historial de compras de oro asociadas al minero ID 1 con reloj y usuario visible).*

*Explicación técnica 4:* Petición exitosa que lista las transacciones de oro rojo y verde efectuadas al minero artesanal con ID 1.

---

> 📷 **[ ESPACIO PARA CAPTURA 5: NAVEGACIÓN CASO INVÁLIDO: GET /API/V1/ACOPIO/MINEROS/999/TRANSACCIONES (404 NOT FOUND) ]**  
> *(Pegar captura mostrando la respuesta 404 Not Found al consultar el historial de un minero inexistente con reloj y usuario visible).*

*Explicación técnica 5:* Consulta con minero inexistente (`id=999`) respondiendo 404 Not Found tras la verificación previa en base de datos.

---

### Bloque 4: CRUD de Mineros y Verificación de Límites Modulares (25%)

El módulo de Parámetros/Maestros gestiona el CRUD completo del catálogo de Mineros (`/api/v1/acopio/mineros`: POST, GET, PUT, DELETE) con DTOs inmutables de tipo record, inyección de dependencias por interfaz y separación modular verificada con Spring Modulith.

| Operación | Método HTTP | Endpoint | Código HTTP | Descripción |
|---|:---:|---|:---:|---|
| **Listar** | `GET` | `/api/v1/acopio/mineros` | `200 OK` | Devuelve lista de mineros registrados |
| **Buscar por ID** | `GET` | `/api/v1/acopio/mineros/{id}` | `200 OK` | Devuelve minero por ID |
| **Crear** | `POST` | `/api/v1/acopio/mineros` | `201 Created` | Registra nuevo minero en acopio |
| **Actualizar** | `PUT` | `/api/v1/acopio/mineros/{id}` | `200 OK` | Actualiza datos del minero |
| **Eliminar** | `DELETE` | `/api/v1/acopio/mineros/{id}` | `204 No Content` | Elimina minero del sistema |
| **Navegación** | `GET` | `/api/v1/acopio/mineros/{id}/transacciones` | `200 OK` / `404` | Lista compras de oro del minero |

> 📷 **[ ESPACIO PARA CAPTURA 6: CRUD DE MINERO: REGISTRO (POST) Y LISTADO GENERAL (GET) ]**  
> *(Pegar captura ejecutando POST /api/v1/acopio/mineros (201 Created) y GET /api/v1/acopio/mineros (200 OK) con reloj y usuario visible).*

*Explicación técnica 6:* Operaciones CRUD en `MineroController` con validación de documento de identidad único y zona de procedencia minera.

---

> 📷 **[ ESPACIO PARA CAPTURA 7: PRUEBAS AUTOMATIZADAS Y MODULARITYTESTS EN VERDE (BUILD SUCCESS) ]**  
> *(Pegar captura de la consola ejecutando mvnw test con todas las pruebas del proyecto bomerp-acopio-oro en verde con reloj y usuario visible).*

*Explicación técnica 7:* Ejecución exitosa de `ModularityTests` y pruebas unitarias confirmando que `AcopiadorService` consume `MineroService` respetando los límites de paquete y las reglas de arquitectura modular.

---

## 2. Error o Hallazgo Técnico Diagnosticado

* **Hallazgo:** En la Asociación `@ManyToOne` entre Módulos y Carga Perezosa (`LazyLoading`).
* **Diagnóstico:** Durante el modelado de la relación entre `TransaccionG2` (módulo acopiador) y `Minero` (módulo parametros), al serializar inicialmente la entidad completa en la respuesta JSON se producía `LazyInitializationException` o serialización de proxies de Hibernate debido a la carga perezosa (`FetchType.LAZY`). 
* **Solución:** Se diagnosticó y resolvió introduciendo el DTO intermedio `MineroResumen` dentro de `TransaccionG2Response` y mapeando los datos explícitamente en `TransaccionG2Mapper`. Esto garantizó que la transacción no exponga detalles innecesarios del minero y desacopló completamente la serialización JSON del ciclo de vida de la sesión JPA.

---

## 3. Reflexión Técnica Breve (5 a 8 líneas)

> **¿Por qué la relación entre TransaccionG2 y Minero es unidireccional, y qué problema evita esa decisión?**
>
> En el sistema `bomerp-acopio-oro`, la relación entre `TransaccionG2` y `Minero` se diseñó de forma estrictamente unidireccional (`@ManyToOne` en `TransaccionG2` sin `@OneToMany` en `Minero`) para evitar la sobrecarga de memoria y el clásico ciclo de serialización recursiva infinita. Un minero en el centro de acopio puede acumular cientos de transacciones a lo largo de los meses; si `Minero` tuviera una colección `@OneToMany` cargada por defecto, consultar un simple dato maestro traería innecesariamente miles de registros financieros a la memoria. Mantener la relación unidireccional y resolver la navegación mediante un endpoint filtrado bajo demanda (`GET /mineros/{id}/transacciones`) asegura alta eficiencia y bajo acoplamiento arquitectónico.

---

## 4. Anexo: Feedback de la Sesión S03

1. **¿Cuál es el aprendizaje más importante que te llevas de la clase de hoy?**  
   Comprender cómo desacoplar el modelo relacional de base de datos de la API REST usando DTOs relacionados (`MineroResumen` embebido en `TransaccionG2Response`) y cómo implementar navegación controlada eficiente.

2. **¿Qué punto de la clase te resultó más confuso o te dejó con dudas?**  
   El impacto del tipo de Fetch (`LAZY` vs `EAGER`) al mapear entidades JPA con MapStruct cuando se cruzan límites de paquetes.

3. **¿Tienes alguna pregunta que te gustaría que sea respondida la siguiente clase?**  
   ¿Cómo se articulan las transacciones atómicas (`@Transactional`) cuando una operación de compra actualiza acumulados y stock en diferentes módulos?

4. **Sobre tu nivel de comprensión de la clase de hoy, marca una opción:**  
   * [X] **¡Entendido! - Lo domino y podría explicarlo.**
   * [ ] Más o menos. - Entendí la idea general, pero tengo dudas.
   * [ ] Necesito ayuda. - Me siento perdido/a con este tema.

5. **¿Cómo puedo ayudarte a comprender mejor el tema?**  
   Continuar mostrando ejemplos prácticos de cómo los principios de diseño de software (bajo acoplamiento y DTOs) evitan problemas de rendimiento en bases de datos reales.

6. **Pensando en tu participación y esfuerzo en la clase de hoy, ¿cómo te autoevaluarías?**  
   * [X] **Muy Comprometido/a: Me esforcé al máximo.**
   * [ ] Comprometido/a: Sé que podría haberme esforzado un poco más.
   * [ ] Poco Comprometido/a: Hoy no di mi mejor esfuerzo.

7. **Mi satisfacción con la clase fue... (califica del 1 al 10):**  
   **10 / 10** — Excelente clase práctica y aplicable a nuestro proyecto integrador.