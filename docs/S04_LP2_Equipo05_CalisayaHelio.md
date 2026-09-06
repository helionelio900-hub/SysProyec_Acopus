# INFORME DE EVIDENCIA DE APRENDIZAJE
## SESIÓN S04: OPERACIÓN CABECERA-DETALLE, TRANSACCIÓN ATÓMICA Y OBSERVABILIDAD

---

### Datos Generales del Estudiante

* **Estudiante:** Faijo Calisaya Helio Paul
* **Equipo de Desarrollo:** Equipo 05 — SITRA-ORO Acopio de Oro (`sitra-oro`)
* **Proyecto de Dominio:** Sistema de Control, Trazabilidad y Liquidación en Acopio de Oro (`sitra-oro`)
* **Curso / Ciclo:** Lenguaje de Programación II (LP2) — Ciclo IV (Semestre 2026-II)
* **Institución:** Universidad Peruana Unión (UPeU) — Campus Juliaca
* **Rol / Aporte realizado:** Implementación de la operación Cabecera-Detalle `LiquidacionG1` y `DetalleLiquidacionG1`, transaccionalidad atómica con rollback por regla de negocio de stock, `@NamedInterface` en Spring Modulith y observabilidad integral con Prometheus (3.13) y Loki/Promtail con `traceId` (3.14).
* **Repositorio GitHub:** https://github.com/helionelio900-hub/SysProyec_Acopus.git

---

## 1. Evidencia Técnica por Bloques de Evaluación (Rúbrica Oficial S04)

### Bloque 1: Modelo Cabecera-Detalle y Cálculos (25%)

Se implementó el modelo de datos relacional y orientado a objetos para la operación transaccional de dominio:
* **Cabecera (`LiquidacionG1`):** Agrupa los datos globales de la operación (fecha, estado `REGISTRADA`, cotización internacional de la onza troy en USD, tipo de cambio USD/PEN, peso total fundido y total liquidado). Posee una colección `@OneToMany(mappedBy = "liquidacionG1", cascade = CascadeType.ALL, orphanRemoval = true)` que gestiona el ciclo de vida de sus líneas.
* **Detalle (`DetalleLiquidacionG1`):** Registra cada línea transaccional (tipo de oro ROJO/VERDE, peso neto fundido en gramos, precio por gramo aplicado y subtotal en soles).
* **Cálculos de Dominio en el Service:** 
  1. $\text{Precio Base USD/g} = \frac{\text{Cotización Onza USD}}{31.1035}$
  2. $\text{Precio Base PEN/g} = \text{Precio Base USD/g} \times \text{Tipo Cambio USD/PEN}$
  3. $\text{Precio Oro Verde} = \text{Precio Base PEN/g} \times 1.05$ (Ajuste por pureza)
  4. $\text{Subtotal Línea} = \text{Peso Fundido (g)} \times \text{Precio Gramo Aplicado}$
  5. $\text{Total Liquidación} = \sum \text{Subtotales de cada detalle}$

```java
// LiquidacionG1.java (Cabecera)
@Entity
@Table(name = "LIQUIDACIONES_G1", schema = "BOM_ACOPIO")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LiquidacionG1 {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_LIQUIDACION_G1")
    private Long idLiquidacionG1;

    @Column(name = "NOMBRE_ACOPIADOR_G2", nullable = false, length = 150)
    private String nombreAcopiadorG2;

    @Enumerated(EnumType.STRING)
    @Column(name = "ESTADO", nullable = false, length = 20)
    @Builder.Default
    private EstadoLiquidacion estado = EstadoLiquidacion.REGISTRADA;

    @Column(name = "COTIZACION_ONZA_USD", nullable = false, precision = 10, scale = 2)
    private BigDecimal cotizacionOnzaUsd;

    @Column(name = "TIPO_CAMBIO_USD_PEN", nullable = false, precision = 6, scale = 4)
    private BigDecimal tipoCambioUsdPen;

    @Column(name = "PESO_TOTAL_FUNDIDO_G", nullable = false, precision = 10, scale = 3)
    private BigDecimal pesoTotalFundidoG;

    @Column(name = "TOTAL_PAGADO_G2_PEN", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalPagadoG2Pen;

    @Column(name = "FECHA_LIQUIDACION", nullable = false, updatable = false)
    private LocalDateTime fechaLiquidacion;

    @OneToMany(mappedBy = "liquidacionG1", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<DetalleLiquidacionG1> detalles = new ArrayList<>();
}
```

```java
// DetalleLiquidacionG1.java (Detalle)
@Entity
@Table(name = "DETALLE_LIQUIDACIONES_G1", schema = "BOM_ACOPIO")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DetalleLiquidacionG1 {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_DETALLE_LIQUIDACION")
    private Long idDetalleLiquidacion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_LIQUIDACION_G1", nullable = false)
    private LiquidacionG1 liquidacionG1;

    @Column(name = "TIPO_ORO", nullable = false, length = 10)
    private String tipoOro; // "ROJO" o "VERDE"

    @Column(name = "PESO_FUNDIDO_G", nullable = false, precision = 10, scale = 3)
    private BigDecimal pesoFundidoG;

    @Column(name = "PRECIO_GRAMO_PEN", nullable = false, precision = 10, scale = 2)
    private BigDecimal precioGramoPen;

    @Column(name = "SUBTOTAL_PEN", nullable = false, precision = 12, scale = 2)
    private BigDecimal subtotalPen;
}
```

> 📷 **[ ESPACIO PARA CAPTURA 1: CÓDIGO DE LAS ENTIDADES LIQUIDACIONG1 Y DETALLELIQUIDACIONG1 CON @ONETOMANY Y CASCADE ]**  
> *(Captura de VS Code mostrando las entidades JPA cabecera-detalle, reloj de Windows y usuario visibles).*

*Explicación técnica 1:* La entidad `LiquidacionG1` mapea la tabla `BOM_ACOPIO.LIQUIDACIONES_G1` y gestiona la persistencia de sus líneas mediante `CascadeType.ALL` y `orphanRemoval = true`, asegurando consistencia referencial con `BOM_ACOPIO.DETALLE_LIQUIDACIONES_G1`.

---

### Bloque 2: Regla de Negocio Real y Excepción de Conflicto 409 (25%)

A diferencia de las validaciones de forma de Bean Validation (`@NotNull`, `@Positive`), la regla de existencia y disponibilidad de stock requiere consultar el estado actual del centro de acopio en tiempo de ejecución. 

Si un acopiador solicita liquidar más gramos de oro rojo o verde de los que realmente existen en acopio, el servicio `AcopiadorService` lanza `StockInsuficienteException` (que extiende de `RuntimeException`). `GlobalExceptionHandler` captura esta excepción y responde con código **HTTP 409 Conflict** indicando claramente la causa del conflicto.

```java
// StockInsuficienteException.java
package pe.edu.upeu.sitraoro.exception;

public class StockInsuficienteException extends RuntimeException {
    public StockInsuficienteException(String mensaje) {
        super(mensaje);
    }
}
```

```java
// GlobalExceptionHandler.java (Manejador HTTP 409 Conflict)
@ExceptionHandler(StockInsuficienteException.class)
public ResponseEntity<Map<String, Object>> handleStockInsuficiente(StockInsuficienteException ex) {
    Map<String, Object> body = new HashMap<>();
    body.put("timestamp", Instant.now().toString());
    body.put("status", HttpStatus.CONFLICT.value());
    body.put("error", "Conflict");
    body.put("message", ex.getMessage());
    return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
}
```

> 📷 **[ ESPACIO PARA CAPTURA 2: CÓDIGO DE STOCKINSUFICIENTEEXCEPTION Y HANDLER 409 CONFLICT ]**  
> *(Captura de VS Code mostrando la excepción de negocio y su tratamiento en GlobalExceptionHandler con reloj y usuario visible).*

*Explicación técnica 2:* La API responde de forma semántica con HTTP 409 Conflict ante discrepancias entre la solicitud de liquidación y el inventario disponible en el centro de acopio.

---

### Bloque 3: Transacción Atómica, Commit y Caso de Rollback (25%)

La operación `procesarLiquidacionSemanal` está anotada con `@Transactional`. Si todas las líneas poseen existencias suficientes, se confirma el registro completo (**COMMIT**): cabecera, colección de detalles y actualización de existencias. 

Si alguna de las líneas falla (por ejemplo, la línea 2 supera el stock disponible), Spring intercepta la `StockInsuficienteException` no capturada y ejecuta un **ROLLBACK total**: la cabecera no se guarda, ningún detalle se guarda y el descuento previo aplicado en la línea 1 es revertido de inmediato en la sesión JPA.

```json
// Petición POST /api/v1/mayorista/liquidaciones (Caso Éxito)
{
  "nombreAcopiadorG2": "Acopiador Central Juliaca",
  "cotizacionOnzaUsd": 2650.00,
  "tipoCambioUsdPen": 3.7500,
  "detalles": [
    { "tipoOro": "ROJO", "pesoFundidoG": 50.000 },
    { "tipoOro": "VERDE", "pesoFundidoG": 30.000 }
  ]
}
```

```json
// Respuesta HTTP 201 Created (Éxito con Cálculos Automáticos)
{
  "idLiquidacionG1": 1,
  "nombreAcopiadorG2": "Acopiador Central Juliaca",
  "estado": "REGISTRADA",
  "pesoTotalFundidoG": 80.000,
  "cotizacionOnzaUsd": 2650.00,
  "tipoCambioUsdPen": 3.7500,
  "totalPagadoG2Pen": 26039.40,
  "fechaLiquidacion": "2026-09-05T02:00:00",
  "detalles": [
    { "idDetalleLiquidacion": 1, "tipoOro": "ROJO", "pesoFundidoG": 50.000, "precioGramoPen": 319.50, "subtotalPen": 15975.00 },
    { "idDetalleLiquidacion": 2, "tipoOro": "VERDE", "pesoFundidoG": 30.000, "precioGramoPen": 335.48, "subtotalPen": 10064.40 }
  ]
}
```

> 📷 **[ ESPACIO PARA CAPTURA 3: PETICIÓN EXITOSA (HTTP 201 CREATED) CON TOTAL Y SUBTOTAES CALCULADOS ]**  
> *(Captura de Postman / Thunder Client / PowerShell ejecutando POST exitoso con reloj y usuario visible).*

---

```json
// Petición POST /api/v1/mayorista/liquidaciones (Caso Rollback)
{
  "nombreAcopiadorG2": "Acopiador Central Juliaca",
  "cotizacionOnzaUsd": 2650.00,
  "tipoCambioUsdPen": 3.7500,
  "detalles": [
    { "tipoOro": "ROJO", "pesoFundidoG": 10.000 },
    { "tipoOro": "VERDE", "pesoFundidoG": 99999.000 }
  ]
}
```

```json
// Respuesta HTTP 409 Conflict (Activación de Rollback)
{
  "timestamp": "2026-09-05T02:04:48.254Z",
  "status": 409,
  "error": "Conflict",
  "message": "Stock insuficiente para oro VERDE: disponible 15.000g, solicitado 99999.000g"
}
```

> 📷 **[ ESPACIO PARA CAPTURA 4: CASO DE ROLLBACK (HTTP 409 CONFLICT) POR STOCK INSUFICIENTE ]**  
> *(Captura ejecutando la venta/liquidación con cantidad excedida recibiendo 409 Conflict, reloj y usuario visible).*

*Explicación técnica 4:* Al fallar la segunda línea, Spring efectúa el Rollback integral: no se inserta ninguna fila en `LIQUIDACIONES_G1` ni en `DETALLE_LIQUIDACIONES_G1`, y el inventario del oro rojo de la primera línea permanece exactamente en su valor original.

---

### Bloque 4: Límites de Módulo y Observabilidad (Prometheus 3.13 y Loki 3.14) (25%)

#### 1. Comunicación entre Módulos y Spring Modulith (`@NamedInterface`):
El módulo `mayorista` y el módulo `ventas` se comunican con `acopiador` y `catalogo` exclusivamente a través de sus interfaces públicas de servicio (`AcopiadorService`, `ProductoService`) y DTOs expuestos. La regla arquitectónica está protegida con `@NamedInterface` y verificada en verde con `ModularityTests`.

```java
// acopiador/service/package-info.java
@org.springframework.modulith.NamedInterface("acopiador-service")
package pe.edu.upeu.sitraoro.acopio.acopiador.service;
```

```java
// exception/package-info.java (Módulo abierto para todo el sistema)
@org.springframework.modulith.ApplicationModule(type = org.springframework.modulith.ApplicationModule.Type.OPEN)
package pe.edu.upeu.sitraoro.exception;
```

> 📷 **[ ESPACIO PARA CAPTURA 5: EJECUCIÓN DE MODULARITYTESTS EN VERDE (BUILD SUCCESS) ]**  
> *(Captura de consola ejecutando ./mvnw test -Dtest=ModularityTests con 0 fallos, reloj y usuario visible).*

---

#### 2. Sección 3.13: Exposición de Métricas para Prometheus
Se configuró Micrometer Prometheus en `bomerp-backend` exponiendo `/actuator/prometheus` en el puerto `8081` y el contenedor Prometheus en el puerto `39090` (`lp2/obs/compose-dev.yml`).

```yaml
# lp2/obs/prometheus/prometheus-dev.yml
global:
  scrape_interval: 15s
scrape_configs:
  - job_name: "bomerp-backend"
    static_configs:
      - targets: ["host.docker.internal:8081", "host.docker.internal:8080"]
    metrics_path: "/actuator/prometheus"
```

> 📷 **[ ESPACIO PARA CAPTURA 6: ENDPOINT /ACTUATOR/PROMETHEUS RESPONDIENDO MÉTRICAS DEL BACKEND ]**  
> *(Captura de navegador o curl en http://localhost:8081/actuator/prometheus con reloj y usuario visible).*

---

#### 3. Sección 3.14: Centralización de Logs en Loki y Promtail con Trazabilidad `traceId`
Esta sección implementa la observabilidad basada en logs distribuidos:
* **Logback (`logback-spring.xml`):** Genera logs continuos en `logs/bomerp.log` con formato estructurado `%d{yyyy-MM-dd HH:mm:ss.SSS} [%X{traceId}] %-5level %logger{36} - %msg%n`.
* **Filtro de Correlación (`CorrelationIdFilter`):** Asigna un UUID único a cada petición HTTP en el MDC y en el header de respuesta `X-Trace-ID`.
* **Promtail y Loki (`lp2/obs/compose-dev.yml`):** Promtail lee `/var/log/bomerp-backend/*.log` y lo envía a Loki en el puerto `33100`.

**Consultas Verificadas en Loki:**
1. `{application="bomerp-backend"} |= "Started SitraOroBackendApplication"` — Verificación del arranque del servicio.
2. `{application="bomerp-backend"} |= "HikariPool"` — Verificación del pool de conexiones Oracle.
3. `{application="bomerp-backend"} |= "StockInsuficienteException"` — Diagnóstico de rollbacks ocurridos.
4. `{application="bomerp-backend"} |= "<traceId>"` — Rastrear una transacción cabecera-detalle específica a partir del header `X-Trace-ID`.

> 📷 **[ ESPACIO PARA CAPTURA 7: LOGS ESTRUCTURADOS CON [traceId] Y CONSULTA EN LOKI EN PUERTO 33100 ]**  
> *(Captura de logs/bomerp.log o consulta Loki mostrando el identificador de traza y el log de VentaController/MayoristaController, reloj y usuario visible).*

---

## 2. Error o Hallazgo Técnico Diagnosticado

* **Hallazgo:** Conflicto de Tipo de Excepción en la Propagación Transaccional de Spring `@Transactional`.
* **Diagnóstico:** Si la excepción de regla de negocio (`StockInsuficienteException`) hubiese extendido de `Exception` (checked exception) en lugar de `RuntimeException` (unchecked exception), el proxy transaccional de Spring por defecto **no habría ejecutado el rollback**, realizando commit de las operaciones previas a pesar del fallo.
* **Solución:** Se diagnosticó y aseguró que `StockInsuficienteException extends RuntimeException`, garantizando que cualquier excepción no capturada active el mecanismo de rollback automático de Spring sin requerir configuración manual compleja de transacciones.

---

## 3. Reflexión Técnica Breve (5 a 8 líneas)

> **¿Por qué una regla como "hay stock suficiente" no se puede expresar con Bean Validation, y qué capa sí puede validarla?**
>
> Una regla como "hay stock suficiente" no se puede validar con Bean Validation (como `@NotNull` o `@Positive`) porque Bean Validation únicamente inspecciona la forma sintáctica y la estructura intrínseca del DTO recibido en memoria de manera estática y aislada. La disponibilidad de inventario o stock no depende del formato del dato, sino del estado actual y concurrente del almacenamiento en base de datos. Por este motivo, la única capa competente para validar esta regla es la capa de Servicio (`@Service`), la cual interactúa con el repositorio, evalúa las existencias en tiempo de ejecución bajo una transacción `@Transactional` y lanza excepciones de negocio controladas.

---

## 4. Anexo: Feedback de la Sesión S04

1. **¿Cuál es el aprendizaje más importante que te llevas de la clase de hoy?**  
   Comprender cómo diseñar operaciones cabecera-detalle con colecciones mapeadas mediante `@OneToMany` y asegurar la atomicidad total de la transacción con rollback automático ante reglas de negocio de stock.

2. **¿Qué punto de la clase te resultó más confuso o te dejó con dudas?**  
   La configuración precisa de Promtail leyendo archivos montados de logs locales para la ingesta en Loki y cómo se propaga el contexto MDC (`traceId`).

3. **¿Tienes alguna pregunta que te gustaría que sea respondida la siguiente clase?**  
   ¿Cómo se implementan consultas de reportería y agregación complejas (proyecciones DTO con JPQL/SQL nativo) sobre relaciones cabecera-detalle?

4. **Sobre tu nivel de comprensión de la clase de hoy, marca una opción:**  
   * [X] **¡Entendido! - Lo domino y podría explicarlo.**
   * [ ] Más o menos. - Entendí la idea general, pero tengo dudas.
   * [ ] Necesito ayuda. - Me siento perdido/a con este tema.

5. **¿Cómo puedo ayudarte a comprender mejor el tema?**  
   Continuar incluyendo ejemplos de observabilidad práctica (métricas en Prometheus y trazabilidad distribuida con Loki) en aplicaciones reales.

6. **Pensando en tu participación y esfuerzo en la clase de hoy, ¿cómo te autoevaluarías?**  
   * [X] **Muy Comprometido/a: Me esforcé al máximo.**
   * [ ] Comprometido/a: Sé que podría haberme esforzado un poco más.
   * [ ] Poco Comprometido/a: Hoy no di mi mejor esfuerzo.

7. **Mi satisfacción con la clase fue... (califica del 1 al 10):**  
   **10 / 10** — Sesión fundamental para garantizar integridad transaccional ACID y observabilidad profesional.
