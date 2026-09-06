# INFORME DE EVIDENCIA DE APRENDIZAJE
## SESIÓN S04: OPERACIÓN CABECERA-DETALLE, TRANSACCIÓN ATÓMICA Y OBSERVABILIDAD

---

### Datos Generales del Estudiante

* **Estudiante:** Jhymel Nelio Figueroa Chambi
* **Equipo de Desarrollo:** Equipo 05 — SITRA-ORO Acopio de Oro (`sitra-oro`)
* **Proyecto de Dominio:** Sistema de Control, Trazabilidad y Liquidación en Acopio de Oro (`sitra-oro`)
* **Curso / Ciclo:** Lenguaje de Programación II (LP2) — Ciclo IV (Semestre 2026-II)
* **Institución:** Universidad Peruana Unión (UPeU) — Campus Juliaca
* **Rol / Aporte realizado:** Construcción de controladores y DTOs compuestos para la operación cabecera-detalle, configuración de pruebas unitarias transaccionales (`@WebMvcTest`), manejo global 409 Conflict, exposición de métricas Prometheus y validación de logs en Loki/Promtail.
* **Repositorio GitHub:** https://github.com/helionelio900-hub/SysProyec_Acopus.git

---

## 1. Evidencia Técnica por Bloques de Evaluación (Rúbrica Oficial S04)

### Bloque 1: Modelo Cabecera-Detalle y Cálculos (25%)

La estructura transaccional modela la cabecera `LiquidacionG1` y su colección embebida `DetalleLiquidacionG1`. Cada detalle almacena de forma autocontenida la cantidad en gramos y el precio por gramo fijado al momento del cierre financiero, evitando inconsistencias históricas si las cotizaciones internacionales cambian a futuro.

* **Fórmula Financiera de Liquidación Mayorista:**
  - $\text{Cotización Gramo USD} = \frac{\text{Cotización Onza USD}}{31.1035}$
  - $\text{Cotización Gramo PEN} = \text{Cotización Gramo USD} \times \text{Tipo de Cambio}$
  - $\text{Subtotal Línea} = \text{Gramos Fundidos} \times \text{Precio Gramo Aplicado}$
  - $\text{Total Liquidación} = \sum \text{Subtotales de los detalles}$

```java
// VentaRequest / LiquidacionG1Request con validación en cascada @Valid @NotEmpty
public record LiquidacionG1Request(
    @NotBlank(message = "El nombre del acopiador G2 es obligatorio")
    String nombreAcopiadorG2,

    @NotNull(message = "La cotización de la onza en USD es obligatoria")
    @Positive(message = "La cotización de la onza debe ser mayor a cero")
    BigDecimal cotizacionOnzaUsd,

    @NotNull(message = "El tipo de cambio del dólar es obligatorio")
    @Positive(message = "El tipo de cambio debe ser mayor a cero")
    BigDecimal tipoCambioUsdPen,

    @NotEmpty(message = "La lista de detalles no puede estar vacía")
    @Valid
    List<DetalleLiquidacionRequest> detalles
) {}
```

> 📷 **[ ESPACIO PARA CAPTURA 1: DTO COMPUESTO LIQUIDACIONG1REQUEST CON @VALID Y @NOTEMPTY ]**  
> *(Captura de VS Code mostrando los DTOs compuestos de entrada y salida con reloj y usuario visible).*

*Explicación técnica 1:* La anotación `@Valid` sobre la colección `List<DetalleLiquidacionRequest>` garantiza que Spring valide cada elemento de la lista de manera recursiva antes de entrar a la lógica del servicio.

---

### Bloque 2: Regla de Negocio Real y Excepción de Conflicto 409 (25%)

El servicio `AcopiadorService` valida si el centro de acopio dispone de suficientes gramos de oro del tipo solicitado (`ROJO` o `VERDE`). Si no hay existencias, interrumpe el flujo arrojando `StockInsuficienteException`, que es capturada por `GlobalExceptionHandler` retornando un código de estado **HTTP 409 Conflict**.

```java
// Fragmento de AcopiadorServiceImpl.java
@Override
@Transactional
public void descontarStockOro(String tipoOro, BigDecimal pesoGramos) {
    String normalizado = tipoOro.trim().toUpperCase();
    BigDecimal disponible = obtenerStockDisponibleGramos(normalizado);
    if (disponible == null || disponible.compareTo(pesoGramos) < 0) {
        BigDecimal disp = (disponible != null) ? disponible : BigDecimal.ZERO;
        throw new StockInsuficienteException(
            "Stock insuficiente para oro " + normalizado + ": disponible " + disp + "g, solicitado " + pesoGramos + "g"
        );
    }
}
```

> 📷 **[ ESPACIO PARA CAPTURA 2: CÓDIGO DE DESCONTARSTOCKORO Y GLOBALEXCEPTIONHANDLER (409) ]**  
> *(Captura de VS Code mostrando la regla de stock y su respuesta 409 Conflict con reloj y usuario visible).*

*Explicación técnica 2:* Validación de negocio ejecutada en la capa Service contra los registros reales de acopio en base de datos, distinguiéndose de validaciones estáticas de formato.

---

### Bloque 3: Transacción Atómica, Commit y Caso de Rollback (25%)

La atomicidad garantizada por `@Transactional` asegura que o se registran todos los cambios (cabecera, detalles y descuento de stock) o no se registra ninguno.

1. **Caso de Éxito (HTTP 201 Created):** Se envían dos líneas con stock suficiente, resultando en la creación de la liquidación ID 1 y sus 2 detalles con subtotales correctos.
2. **Caso de Rollback (HTTP 409 Conflict):** La segunda línea solicita `99999.000g` de oro verde. El método lanza `StockInsuficienteException` y Spring revierte toda la transacción, dejando intacto el stock de oro rojo de la primera línea y no guardando ninguna venta o liquidación en base de datos.

```json
// Respuesta del caso de Rollback (409 Conflict)
{
  "timestamp": "2026-09-05T02:04:48.254Z",
  "status": 409,
  "error": "Conflict",
  "message": "Stock insuficiente para oro VERDE: disponible 15.000g, solicitado 99999.000g"
}
```

> 📷 **[ ESPACIO PARA CAPTURA 3: PETICIÓN EXITOSA (201 CREATED) Y PETICIÓN CON ROLLBACK (409 CONFLICT) ]**  
> *(Captura de cliente REST mostrando las respuestas 201 Created y 409 Conflict con reloj y usuario visible).*

*Explicación técnica 3:* Demostración empírica de rollback atómico: al fallar la línea 2, los cambios previos no confirmados son descartados íntegramente por el proxy transaccional de Spring.

---

### Bloque 4: Límites de Módulo y Observabilidad (Prometheus 3.13 y Loki 3.14) (25%)

#### 1. Verificación Modular con Spring Modulith:
Las dependencias intermodulares se definen mediante `@NamedInterface` en los paquetes de servicio y DTOs (`acopiador-service`, `acopiador-dto`, `producto-service`, `producto-dto`), cumpliendo las directrices de desacoplamiento de la ADR-002 y pasando `ModularityTests` al 100%.

> 📷 **[ ESPACIO PARA CAPTURA 4: RESULTADO DE PRUEBAS AUTOMATIZADAS (20 TESTS PASSING) ]**  
> *(Captura de consola ejecutando ./mvnw test con 20 pruebas exitosas en verde, reloj y usuario visible).*

---

#### 2. Sección 3.13: Métricas del Backend en Prometheus
* Endpoint activo en `http://localhost:8081/actuator/prometheus`.
* Métrica `http_server_requests_seconds_count` evidenciando el tráfico atendido por `POST /api/v1/mayorista/liquidaciones` y `POST /api/v1/ventas`.
* Contenedor de Prometheus configurado en puerto host `39090`.

> 📷 **[ ESPACIO PARA CAPTURA 5: MÉTRICAS EN PROMETHEUS PUERTO 39090 ]**  
> *(Captura de Prometheus en el navegador mostrando el target bomerp-backend en estado UP con reloj y usuario visible).*

---

#### 3. Sección 3.14: Centralización de Logs con Promtail y Loki
* **Trace ID en MDC:** La clase `CorrelationIdFilter` inyecta un UUID en `[%X{traceId}]` en cada registro de log y lo devuelve en la cabecera `X-Trace-ID`.
* **Configuración Promtail:** Lee `/var/log/bomerp-backend/*.log` mapeado desde `logs/bomerp.log`.
* **Consultas Loki en Puerto 33100:**
  1. `{application="bomerp-backend"} |= "Started SitraOroBackendApplication"`
  2. `{application="bomerp-backend"} |= "HikariPool"`
  3. `{application="bomerp-backend"} |= "StockInsuficienteException"`
  4. `{application="bomerp-backend"} |= "<traceId>"`

> 📷 **[ ESPACIO PARA CAPTURA 6: CONSULTAS EN LOKI EN PUERTO 33100 Y RASTREO POR TRACEID ]**  
> *(Captura de consulta Loki mostrando los logs estructurados con traceId de las peticiones cabecera-detalle, reloj y usuario visible).*

---

## 2. Error o Hallazgo Técnico Diagnosticado

* **Hallazgo:** Validación Incompleta de Colecciones Anidadas en DTOs.
* **Diagnóstico:** Si se anota la lista de detalles únicamente con `@NotEmpty` pero se omite `@Valid`, Spring valida que la colección no esté vacía pero **no inspecciona las anotaciones de validación dentro de cada objeto de detalle**, permitiendo que viajen cantidades negativas o valores nulos sin ser detectados.
* **Solución:** Se colocaron ambas anotaciones `@NotEmpty` y `@Valid` sobre `List<DetalleLiquidacionRequest> detalles`, garantizando que cada línea individual sea evaluada rigurosamente antes de su procesamiento.

---

## 3. Reflexión Técnica Breve (5 a 8 líneas)

> **¿Por qué una regla como "hay stock suficiente" no se puede expresar con Bean Validation, y qué capa sí puede validarla?**
>
> Las validaciones de Bean Validation (`@NotNull`, `@Size`, `@Positive`) operan sobre la sintaxis y los tipos de datos del objeto recibido en memoria de forma estática, sin acceso al estado dinámico de la base de datos. La regla "hay stock suficiente" depende directamente de los registros persistidos y del balance disponible en el momento exacto de la transacción. Por consiguiente, solo la capa de Servicio (`@Service`) puede ejecutar esta validación mediante consultas en tiempo de ejecución, asegurando la atomicidad dentro de la transacción `@Transactional` y disparando excepciones de negocio semánticas.

---

## 4. Anexo: Feedback de la Sesión S04

1. **¿Cuál es el aprendizaje más importante que te llevas de la clase de hoy?**  
   Aprender a implementar transacciones atómicas complejas con persistencia en cascada (`CascadeType.ALL`) y observabilidad integral con correlación de trazas (`traceId`) entre logs y métricas.

2. **¿Qué punto de la clase te resultó más confuso o te dejó con dudas?**  
   El ciclo de vida del Rollback automático cuando intervienen múltiples servicios en una misma transacción compartida (`Propagation.REQUIRED`).

3. **¿Tienes alguna pregunta que te gustaría que sea respondida la siguiente clase?**  
   ¿Cómo optimizar consultas de solo lectura con `@Transactional(readOnly = true)` en reportes que combinan miles de detalles históricos?

4. **Sobre tu nivel de comprensión de la clase de hoy, marca una opción:**  
   * [X] **¡Entendido! - Lo domino y podría explicarlo.**
   * [ ] Más o menos. - Entendí la idea general, pero tengo dudas.
   * [ ] Necesito ayuda. - Me siento perdido/a con este tema.

5. **¿Cómo puedo ayudarte a comprender mejor el tema?**  
   Continuar proporcionando guías prácticas que relacionen directamente la arquitectura de software con casos de uso de negocio reales.

6. **Pensando en tu participación y esfuerzo en la clase de hoy, ¿cómo te autoevaluarías?**  
   * [X] **Muy Comprometido/a: Me esforcé al máximo.**
   * [ ] Comprometido/a: Sé que podría haberme esforzado un poco más.
   * [ ] Poco Comprometido/a: Hoy no di mi mejor esfuerzo.

7. **Mi satisfacción con la clase fue... (califica del 1 al 10):**  
   **10 / 10** — Excelente integración entre desarrollo backend modular, integridad transaccional y monitoreo moderno.
