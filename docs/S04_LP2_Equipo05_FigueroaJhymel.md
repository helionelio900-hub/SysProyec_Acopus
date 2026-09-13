# INFORME DE EVIDENCIA DE APRENDIZAJE
## SESIÓN S04: OPERACIÓN CABECERA-DETALLE Y TRANSACCIÓN ATÓMICA

---

### Datos Generales del Estudiante

* **Estudiante:** Jhymel Nelio Figueroa Chambi
* **Equipo de Desarrollo:** Equipo 05 — SITRA-ORO Acopio de Oro (`sitra-oro`)
* **Proyecto de Dominio:** Sistema de Control, Trazabilidad y Liquidación en Acopio de Oro (`sitra-oro`)
* **Curso / Ciclo:** Lenguaje de Programación II (LP2) — Ciclo IV (Semestre 2026-II)
* **Institución:** Universidad Peruana Unión (UPeU) — Campus Juliaca
* **Rol / Aporte realizado:** Construcción de controladores y DTOs compuestos para la operación cabecera-detalle, pruebas web y de integración, manejo global 409 Conflict y trazabilidad mediante `traceId` en logs locales.
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
public void descontarStockOro(String tipoOro, BigDecimal pesoGramos, Long idLiquidacionG1) {
    String normalizado = tipoOro.trim().toUpperCase();
    List<TransaccionG2> lotes = transaccionG2Repository.findStockDisponibleForUpdate(normalizado);
    BigDecimal disponible = lotes.stream()
        .map(TransaccionG2::getPesoFundidoNetoG)
        .reduce(BigDecimal.ZERO, BigDecimal::add);
    if (disponible.compareTo(pesoGramos) != 0) {
        throw new StockInsuficienteException(
            "El cierre semanal debe coincidir con todo el stock disponible"
        );
    }
    lotes.forEach(lote -> lote.setIdLiquidacionG1(idLiquidacionG1));
}
```

> 📷 **[ ESPACIO PARA CAPTURA 2: CÓDIGO DE DESCONTARSTOCKORO Y GLOBALEXCEPTIONHANDLER (409) ]**  
> *(Captura de VS Code mostrando la regla de stock y su respuesta 409 Conflict con reloj y usuario visible).*

*Explicación técnica 2:* Validación de negocio ejecutada en la capa Service contra los registros reales de acopio en base de datos, distinguiéndose de validaciones estáticas de formato.

---

### Bloque 3: Transacción Atómica, Commit y Caso de Rollback (25%)

La atomicidad garantizada por `@Transactional` asegura que o se registran todos los cambios (cabecera, detalles y descuento de stock) o no se registra ninguno.

1. **Caso de Éxito (HTTP 201 Created):** Se envían dos líneas con stock suficiente, resultando en la creación de la liquidación ID 1 y sus 2 detalles con subtotales correctos.
2. **Caso de Rollback (HTTP 409 Conflict):** La regla no es "no exceder el stock": el cierre semanal debe coincidir EXACTAMENTE con todo el lote pendiente de cada color. La segunda línea solicita `4.000g` de oro verde cuando hay `5.000g` disponibles (deja 1g sin cerrar). El método lanza `StockInsuficienteException` y Spring revierte toda la transacción, dejando intacto el stock de oro rojo de la primera línea y no guardando ninguna venta o liquidación en base de datos.

```json
// Respuesta del caso de Rollback (409 Conflict)
{
  "timestamp": "2026-09-05T02:04:48.254Z",
  "status": 409,
  "error": "Conflict",
  "message": "El cierre semanal de oro VERDE debe coincidir con todo el stock disponible: 5.000g disponibles, 4.000g solicitados"
}
```

> 📷 **[ ESPACIO PARA CAPTURA 3: PETICIÓN EXITOSA (201 CREATED) Y PETICIÓN CON ROLLBACK (409 CONFLICT) ]**  
> *(Captura de cliente REST mostrando las respuestas 201 Created y 409 Conflict con reloj y usuario visible).*

*Explicación técnica 3:* Demostración empírica de rollback atómico: al fallar la línea 2, los cambios previos no confirmados son descartados íntegramente por el proxy transaccional de Spring.

---

### Bloque 4: Límites de Módulo, logs y pruebas (25%)

#### 1. Verificación Modular con Spring Modulith:
Las dependencias intermodulares se definen mediante `@ApplicationModule` y `@NamedInterface` en los paquetes públicos. Mayorista consume `AcopiadorService`, no su repositorio, y `ModularityTests` verifica cuatro módulos funcionales de U1.

> 📷 **[ ESPACIO PARA CAPTURA 4: RESULTADO DE PRUEBAS AUTOMATIZADAS (23 TESTS PASSING) ]**
> *(Captura de consola ejecutando ./mvnw test con 23 pruebas exitosas en verde, reloj y usuario visible).*

#### 2. Trazabilidad local y rollback probado

`CorrelationIdFilter` asigna un `traceId` por petición y lo devuelve en `X-Trace-ID`. Los eventos se
consultan en `logs/bomerp.log`. La suite ejecuta 23 pruebas; las dos pruebas de integración de
`MayoristaServiceIntegrationTest` comprueban persistencia exitosa y rollback del segundo detalle.

Prometheus, Loki y Promtail no se incluyen porque pertenecen a sesiones posteriores al corte U1.

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
   Aprender a implementar transacciones atómicas complejas con persistencia en cascada (`CascadeType.ALL`) y trazabilidad de peticiones con `traceId` en los logs (`CorrelationIdFilter`).

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
