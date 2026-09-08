# INFORME DE EVIDENCIA DE APRENDIZAJE — LP2
## Sesión S04: Operación Cabecera-Detalle y Transacción Atómica

---

### Datos del estudiante

* **Nombre:** Faijo Calisaya Helio Paul
* **Equipo:** Equipo 05
* **Sesión:** S04 — Operación Cabecera-Detalle
* **Rol o aporte realizado:** Implementación de la operación cabecera-detalle `LiquidacionG1` / `DetalleLiquidacionG1` (módulo `mayorista`), cálculo de precio por onza troy, regla de negocio de stock de oro por color con `StockInsuficienteException`, transacción atómica con rollback, y comunicación entre sub-dominios vía la interfaz pública `AcopiadorService` (`@NamedInterface`).
* **Link de GitHub:** https://github.com/helionelio900-hub/SysProyec_Acopus

> **Nota de evidencia:** cada captura de este informe muestra, sin recortar, el reloj del sistema (fecha y hora) y el usuario / foto de perfil de Windows / VS Code / navegador.

---

## 1. Evidencia técnica

### Bloque 1 — Modelo cabecera-detalle y cálculos

**Dominio:** una *liquidación semanal mayorista (G1)* paga al acopiador G2 por el oro fundido que entregó durante la semana. Es el equivalente a `Venta / DetalleVenta` del ejemplo del docente:

| Ejemplo docente | SITRA-ORO (mi dominio) |
|---|---|
| `Venta` (cabecera) | `LiquidacionG1` |
| `DetalleVenta` (líneas) | `DetalleLiquidacionG1` |
| `total` | `totalPagadoG2Pen` |
| producto por línea | tipo de oro (`ROJO` / `VERDE`) + peso fundido |

**Cabecera — `LiquidacionG1`** (`lp2/bomerp-backend/.../acopio/mayorista/entity/LiquidacionG1.java`):

```java
@Entity
@Table(name = "LIQUIDACIONES_G1")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LiquidacionG1 {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_LIQUIDACION_G1")
    private Long idLiquidacionG1;

    @Column(name = "NOMBRE_ACOPIADOR_G2", nullable = false, length = 150)
    private String nombreAcopiadorG2;

    @Enumerated(EnumType.STRING)
    @Column(name = "ESTADO", nullable = false, length = 20)
    @Builder.Default
    private EstadoLiquidacion estado = EstadoLiquidacion.REGISTRADA;   // REGISTRADA | ANULADA

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

**Detalle — `DetalleLiquidacionG1`**:

```java
@Entity
@Table(name = "DETALLE_LIQUIDACIONES_G1")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DetalleLiquidacionG1 {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_DETALLE_LIQUIDACION")
    private Long idDetalleLiquidacion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_LIQUIDACION_G1", nullable = false)
    private LiquidacionG1 liquidacionG1;

    @Column(name = "TIPO_ORO", nullable = false, length = 10)
    private String tipoOro;                       // "ROJO" | "VERDE"

    @Column(name = "PESO_FUNDIDO_G", nullable = false, precision = 10, scale = 3)
    private BigDecimal pesoFundidoG;

    @Column(name = "PRECIO_GRAMO_PEN", nullable = false, precision = 10, scale = 2)
    private BigDecimal precioGramoPen;

    @Column(name = "SUBTOTAL_PEN", nullable = false, precision = 12, scale = 2)
    private BigDecimal subtotalPen;
}
```

**Cálculos en `MayoristaServiceImpl.procesarLiquidacionSemanal(...)`:**

```java
private static final BigDecimal GRAMOS_POR_ONZA_TROY = new BigDecimal("31.1035");

// 1. Precio base USD por gramo
BigDecimal precioUsdPorGramo = request.cotizacionOnzaUsd()
        .divide(GRAMOS_POR_ONZA_TROY, 4, RoundingMode.HALF_UP);

// 2. Precio base PEN por gramo
BigDecimal basePrecioGramoPen = precioUsdPorGramo
        .multiply(request.tipoCambioUsdPen())
        .setScale(2, RoundingMode.HALF_UP);

for (DetalleLiquidacionRequest detReq : request.detalles()) {
    // 3. Ajuste por pureza: el oro VERDE paga 5 % más
    BigDecimal precioLinea = "VERDE".equals(tipoOro)
        ? basePrecioGramoPen.multiply(new BigDecimal("1.05")).setScale(2, RoundingMode.HALF_UP)
        : basePrecioGramoPen;

    // 4. Subtotal de la línea
    BigDecimal subtotalLinea = detReq.pesoFundidoG().multiply(precioLinea).setScale(2, RoundingMode.HALF_UP);

    acumuladoPeso  = acumuladoPeso.add(detReq.pesoFundidoG());
    acumuladoTotal = acumuladoTotal.add(subtotalLinea);   // 5. Total = Σ subtotales
}
liquidacion.setPesoTotalFundidoG(acumuladoPeso);
liquidacion.setTotalPagadoG2Pen(acumuladoTotal);
```

> 📷 **CAPTURA 1 — VS Code:** las dos entidades (`LiquidacionG1` con `@OneToMany ... cascade=ALL, orphanRemoval=true` y `DetalleLiquidacionG1` con `@ManyToOne`) y el bloque de cálculos del service, con reloj y usuario visibles.

*Explicación:* La cabecera controla el ciclo de vida de sus líneas con `cascade=ALL` + `orphanRemoval=true`; el total no se recibe del cliente, se calcula sumando los subtotales de cada línea, y cada subtotal usa el precio por gramo derivado de la onza troy (31.1035 g) y el tipo de cambio.

---

### Bloque 2 — Regla de negocio real

**Regla:** *"no se puede liquidar más gramos de oro (por color) de los que el acopiador realmente tiene en stock sin liquidar."* No es una regla de forma: no depende del formato del JSON, sino del estado actual del inventario en la base de datos.

Por cada línea del detalle, el service del módulo `mayorista` llama al módulo `acopiador`:

```java
// MayoristaServiceImpl
acopiadorService.descontarStockOro(tipoOro, detReq.pesoFundidoG());
```

```java
// AcopiadorServiceImpl  (módulo acopiador)
@Override
@Transactional
public void descontarStockOro(String tipoOro, BigDecimal pesoGramos) {
    BigDecimal disponible = obtenerStockDisponibleGramos(tipoOro);   // SUM de TransaccionG2 no liquidadas
    if (disponible == null || disponible.compareTo(pesoGramos) < 0) {
        BigDecimal disp = (disponible != null) ? disponible : BigDecimal.ZERO;
        throw new StockInsuficienteException(
            "Stock insuficiente para oro " + tipoOro + ": disponible " + disp + "g, solicitado " + pesoGramos + "g");
    }
}
```

```java
// StockInsuficienteException.java  — excepción propia del dominio
public class StockInsuficienteException extends RuntimeException {
    public StockInsuficienteException(String mensaje) { super(mensaje); }
}
```

```java
// GlobalExceptionHandler.java  — traducción a HTTP 409
@ExceptionHandler(StockInsuficienteException.class)
public ResponseEntity<Map<String, Object>> handleStockInsuficiente(StockInsuficienteException ex) {
    log.warn("StockInsuficienteException provocando Rollback (409 Conflict): {}", ex.getMessage());
    Map<String, Object> body = new HashMap<>();
    body.put("timestamp", Instant.now().toString());
    body.put("status", HttpStatus.CONFLICT.value());
    body.put("error", "Conflict");
    body.put("message", ex.getMessage());
    return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
}
```

> 📷 **CAPTURA 2 — VS Code:** `StockInsuficienteException`, el `descontarStockOro(...)` que la lanza y el `@ExceptionHandler` que responde 409, con reloj y usuario visibles.

*Explicación:* La excepción extiende `RuntimeException` (unchecked) para que el proxy `@Transactional` de Spring dispare el rollback automáticamente. `GlobalExceptionHandler` la convierte en una respuesta semántica **409 Conflict** con el mensaje del conflicto.

---

### Bloque 3 — Transacción atómica (caso de éxito y caso de rollback)

`procesarLiquidacionSemanal(...)` está anotado `@Transactional`. Todo lo que hace —insertar cabecera, insertar N detalles, descontar stock en cada línea— ocurre en **una sola transacción**.

#### Estado de los datos ANTES (consola Oracle, otra terminal)

```sql
SELECT COUNT(*) FROM LIQUIDACIONES_G1;        -- p. ej. 0
SELECT COUNT(*) FROM DETALLE_LIQUIDACIONES_G1;-- p. ej. 0
```

#### Caso de ÉXITO — `POST /api/v1/mayorista/liquidaciones`

```json
{
  "nombreAcopiadorG2": "Acopiador Central Juliaca",
  "cotizacionOnzaUsd": 2650.00,
  "tipoCambioUsdPen": 3.7500,
  "detalles": [
    { "tipoOro": "ROJO",  "pesoFundidoG": 50.000 },
    { "tipoOro": "VERDE", "pesoFundidoG": 30.000 }
  ]
}
```

Respuesta **HTTP 201 Created** — total y subtotales calculados por el servidor:

```json
{
  "idLiquidacionG1": 1,
  "estado": "REGISTRADA",
  "pesoTotalFundidoG": 80.000,
  "totalPagadoG2Pen": 26039.40,
  "detalles": [
    { "idDetalleLiquidacion": 1, "tipoOro": "ROJO",  "pesoFundidoG": 50.000, "precioGramoPen": 319.50, "subtotalPen": 15975.00 },
    { "idDetalleLiquidacion": 2, "tipoOro": "VERDE", "pesoFundidoG": 30.000, "precioGramoPen": 335.48, "subtotalPen": 10064.40 }
  ]
}
```

#### Estado de los datos DESPUÉS del éxito

```sql
SELECT COUNT(*) FROM LIQUIDACIONES_G1;         -- 1   (se insertó la cabecera)
SELECT COUNT(*) FROM DETALLE_LIQUIDACIONES_G1; -- 2   (se insertaron las 2 líneas)
```

> 📷 **CAPTURA 3 — PowerShell / Thunder Client:** el POST exitoso con respuesta 201 y `totalPagadoG2Pen`, junto a los `COUNT(*)` antes (0/0) y después (1/2). Reloj y usuario visibles.

#### Caso de ROLLBACK — `POST` con la 2.ª línea excedida

```json
{
  "nombreAcopiadorG2": "Acopiador Central Juliaca",
  "cotizacionOnzaUsd": 2650.00,
  "tipoCambioUsdPen": 3.7500,
  "detalles": [
    { "tipoOro": "ROJO",  "pesoFundidoG": 10.000 },
    { "tipoOro": "VERDE", "pesoFundidoG": 999999.000 }
  ]
}
```

Respuesta **HTTP 409 Conflict**:

```json
{
  "timestamp": "2026-09-08T...Z",
  "status": 409,
  "error": "Conflict",
  "message": "Stock insuficiente para oro VERDE: disponible 0g, solicitado 999999.000g"
}
```

#### Estado de los datos DESPUÉS del rollback

```sql
SELECT COUNT(*) FROM LIQUIDACIONES_G1;         -- SIGUE en 1  (no se insertó la cabecera fallida)
SELECT COUNT(*) FROM DETALLE_LIQUIDACIONES_G1; -- SIGUE en 2  (no se insertó ninguna línea nueva)
```

> 📷 **CAPTURA 4 — PowerShell / Thunder Client:** el POST que devuelve 409, y los `COUNT(*)` idénticos a antes del intento. Reloj y usuario visibles.

*Explicación:* La primera línea (ROJO 10 g) alcanzó a validarse, pero la segunda (VERDE 999999 g) lanzó `StockInsuficienteException`. Spring revierte **toda** la transacción: no queda ninguna fila de la liquidación fallida ni de sus detalles.

---

### Bloque 4 — Límites de módulo

La operación **cruza dos sub-dominios**: `mayorista` (la liquidación) llama a `acopiador` (el stock de oro). Esa comunicación es **solo por la interfaz pública**, nunca por el repositorio del otro:

```java
// acopio/acopiador/service/package-info.java
@org.springframework.modulith.NamedInterface("acopiador-service")
package pe.edu.upeu.sitraoro.acopio.acopiador.service;
```

```java
// MayoristaServiceImpl.java
import pe.edu.upeu.sitraoro.acopio.acopiador.service.AcopiadorService;   // solo la interfaz
...
private final AcopiadorService acopiadorService;   // inyección por interfaz (D de SOLID)
```

`ModularityTests` (`modules.verify()`) verifica en cada build que ningún módulo acceda a un paquete interno de otro:

```java
class ModularityTests {
    ApplicationModules modules = ApplicationModules.of(SitraOroBackendApplication.class);
    @Test void verifiesModularStructure() { modules.verify(); }
}
```

> 📷 **CAPTURA 5 — consola:** `./mvnw.cmd test` → `Tests run: 16, Failures: 0, Errors: 0` con `ModularityTests` incluido. Reloj y usuario visibles.

**Aclaración honesta sobre el conteo de módulos:** Spring Modulith detecta `acopio` como **un** módulo de aplicación; `mayorista`, `acopiador`, `cotizador`, `parametros` y `seguridad` son sus sub-dominios, publicados con `@NamedInterface`. La operación no cruza dos *módulos raíz* de Modulith, pero sí cruza dos sub-dominios y **usa la interfaz `@NamedInterface` + `ModularityTests` en verde**, que es la evidencia que pide la rúbrica.

---

## 2. Error o hallazgo técnico diagnosticado

### Hallazgo principal — esquema hardcodeado que rompía la reproducibilidad

Tres entidades (`Minero`, `ParametrosSistema`, `TransaccionG2`) tenían `@Table(name = "...", schema = "BOM_ACOPIO")`, mientras que `LiquidacionG1` y `DetalleLiquidacionG1` **no** llevaban `schema`.

* **Síntoma:** al inspeccionar la BD encontré las mismas tablas duplicadas en tres esquemas (`BOM_ACOPIO`, `BOMERP_APP`, `SYS`). Un compañero que clonara el repo y usara un Oracle sin el usuario `BOM_ACOPIO` no podría arrancar el backend: Hibernate intentaría `CREATE TABLE BOM_ACOPIO.MINEROS` contra un esquema inexistente.
* **Diagnóstico:** el nombre del esquema no debe vivir en la entidad; debe venir de la conexión (`application-dev.yml`). Mezclar entidades con y sin `schema` produjo tablas repartidas.
* **Solución:** quité `schema = "BOM_ACOPIO"` de las tres entidades. Ahora las 5 tablas resuelven al esquema del usuario conectado (`BOMERP_APP`), de forma consistente. Verificado con los 16 tests en verde. Commit `04df46c`.

### Hallazgo secundario — checked vs unchecked y el rollback

Si `StockInsuficienteException` hubiese extendido `Exception` (checked) en vez de `RuntimeException`, el proxy `@Transactional` de Spring **no** habría hecho rollback por defecto: habría confirmado la cabecera y el descuento parcial de la línea 1. Se aseguró que extiende `RuntimeException`.

---

## 3. Reflexión técnica breve

> **¿Por qué una regla como "hay stock suficiente" no se puede expresar con Bean Validation, y qué capa sí puede validarla?**

Bean Validation (`@NotNull`, `@Positive`, `@Size`) solo inspecciona la **forma** del DTO: mira el objeto recibido, aislado y en memoria, sin consultar nada externo. "Hay stock suficiente" no es una propiedad del dato enviado —un peso de 999999 g está perfectamente bien formado— sino del **estado actual y compartido** del inventario en la base de datos, que además cambia con cada liquidación. Validarla exige leer ese estado en tiempo de ejecución. La capa competente es la **de servicio** (`@Service`, dentro de `@Transactional`): consulta el repositorio, compara lo solicitado contra lo disponible y lanza una excepción de negocio propia (`StockInsuficienteException`) que el `GlobalExceptionHandler` traduce a HTTP 409. El controlador solo valida forma; el servicio valida negocio.

---

## 4. Anexo: Feedback de la sesión S04

1. **¿Cuál es el aprendizaje más importante que te llevas de la clase de hoy?**
   Diseñar una operación cabecera-detalle con `@OneToMany` y garantizar que toda la operación (cabecera + líneas + regla de negocio) sea atómica: si una línea falla, `@Transactional` revierte todo, sin código manual de rollback.

2. **¿Qué punto de la clase te resultó más confuso o te dejó con dudas?**
   Al principio no tenía claro por qué la regla de stock no podía ir como una anotación de validación en el DTO, y en qué se diferencia de `@Positive`.

3. **¿Tienes alguna pregunta que te gustaría que sea respondida la siguiente clase?**
   ¿Cómo se hace que dos sub-dominios que se necesitan mutuamente (mi `parametros` y `acopiador`) queden como módulos realmente independientes en Spring Modulith sin romper la relación JPA?

4. **Nivel de comprensión de la clase de hoy:**
   * [X] ¡Entendido! — Lo domino y podría explicarlo.
   * [ ] Más o menos. — Entendí la idea general, pero tengo dudas.
   * [ ] Necesito ayuda. — Me siento perdido/a con este tema.

5. **¿Cómo puedo ayudarte a comprender mejor el tema?**
   Con más ejemplos de operaciones cabecera-detalle de dominios distintos, para ver el patrón repetirse.

6. **Autoevaluación de participación y esfuerzo:**
   * [X] Muy Comprometido/a: Me esforcé al máximo.
   * [ ] Comprometido/a: Sé que podría haberme esforzado un poco más.
   * [ ] Poco Comprometido/a: Hoy no di mi mejor esfuerzo.

7. **Mi satisfacción con la clase fue (1 a 10):** 9 / 10.
