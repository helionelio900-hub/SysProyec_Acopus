# LP2 · Producto de Unidad I — Backend REST empresarial SITRA-ORO

> Equipo 05. Dominio: **Sistema de Información, Trazabilidad y Liquidación en Acopio de Oro (SITRA-ORO)**.
> Este documento es la fuente única del producto de U1; la guía de S06 lo reproduce, no lo reemplaza.

Backend REST empresarial con ORM, CRUD, objetos relacionados, operación cabecera–detalle,
consultas, reportes, CORS, logs y pruebas — ensamblado con lo construido en S1–S5.

| Sesión | Qué se produjo | Dónde queda |
|---|---|---|
| S1 | Proyecto backend ejecutable, Oracle `XEPDB1`, Swagger, primer recurso REST | 2.1 / 2.2 |
| S2 | CRUD REST completo de `Minero`, DTO validado, mapeo explícito, errores globales | 2.2 |
| S3 | Objetos relacionados `Minero` ↔ `TransaccionG2` | 2.2 |
| S4 | Operación cabecera-detalle `LiquidacionG1` + `DetalleLiquidacionG1`, cálculo de precio por onza troy, regla de stock de oro, transacción atómica | 2.2 / 2.3 |
| S5 | Filtros combinados, ordenamiento, proyección de resumen, agregación, CORS por propiedad | 2.2 |
| S6 | Ensamblaje y sustentación | Este documento + evidencia de integración |

---

## 2.1 Alcance arquitectónico

```
lp2/bomerp-backend/                 # un solo proyecto Maven, sin reactor multi-módulo
└── src/main/java/pe/edu/upeu/sitraoro/
    ├── SitraOroBackendApplication.java   # único Spring Boot ejecutable
    ├── OpenApiConfig.java                # documentación OpenAPI/Swagger
    ├── CorsConfig.java                   # CORS por propiedad (S5)
    ├── filter/CorrelationIdFilter.java   # traceId por petición (S2)
    ├── exception/                        # manejo global de errores
    └── acopio/                           # módulo de aplicación (Spring Modulith)
        ├── seguridad/     # login (JWT real en U2 / S10)
        ├── cotizador/     # consulta estimativa pública (no transaccional)
        ├── acopiador/     # Transaccional 1: compra directa a minero (G2)
        ├── mayorista/     # Transaccional 2: liquidación cabecera-detalle (G1)
        └── parametros/    # Mineros (CRUD), dashboard consolidado
```

- Un solo proyecto Maven, una sola JVM, un `DataSource` Oracle. Sin Feign ni HTTP interno.
- `acopio` es el módulo de aplicación verificado por **Spring Modulith**. Las áreas que otros
  módulos consumen se publican con `@NamedInterface` (`parametros-service`, `acopiador-dto`, …);
  los repositorios no se comparten.
- Verificación automática: `ModularityTests.verifiesModularStructure()` ejecuta `modules.verify()`.

## 2.2 Contrato REST

| Método | Endpoint | Propósito | Sesión |
|---|---|---|---|
| GET | `/api/v1/acopio/mineros` | Listar mineros | S2 |
| GET | `/api/v1/acopio/mineros/{id}` | Consultar minero | S2 |
| POST | `/api/v1/acopio/mineros` | Registrar minero (DTO validado) | S2 |
| PUT | `/api/v1/acopio/mineros/{id}` | Actualizar minero | S2 |
| DELETE | `/api/v1/acopio/mineros/{id}` | Eliminar minero | S2 |
| GET | `/api/v1/acopio/mineros/{id}/transacciones` | Transacciones de un minero (objeto relacionado) | S3 |
| GET | `/api/v1/cotizador/estimar?pesoBrutoGramos=` | Cotización estimada pública | S1 |
| POST | `/api/v1/acopio/transacciones` | Registrar compra directa G2, descuenta acumulado por color | S4 |
| GET | `/api/v1/acopio/transacciones` | Listar transacciones G2 | S3 |
| GET | `/api/v1/acopio/acumulados-semanales` | Acumulados por color (Rojo / Verde) | S4 |
| POST | `/api/v1/mayorista/liquidaciones` | **Cabecera-detalle**: liquidación semanal G1, descuenta stock de oro, transacción atómica | S4 |
| GET | `/api/v1/mayorista/liquidaciones` | Consultar con filtros combinados (`estado`, `desde`, `hasta`) y orden (`ordenarPor`, `direccion`) | S5 |
| GET | `/api/v1/mayorista/liquidaciones/resumen` | Reporte agregado: conteo, monto total, ticket promedio + detalle resumido | S5 |
| GET | `/api/v1/mayorista/liquidaciones/{id}` | Liquidación por id con sus líneas | S4 |
| GET | `/api/v1/dashboard/consolidado` | Consolidado general de gramos y montos | S5 |

Documentación viva: `http://localhost:8081/swagger-ui.html`.

## 2.3 DTO principales — operación cabecera-detalle (S4 + S5)

**Entrada** — `POST /api/v1/mayorista/liquidaciones` (`LiquidacionG1Request`):

```json
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

Validación: `nombreAcopiadorG2` `@NotBlank`; `cotizacionOnzaUsd` y `tipoCambioUsdPen` `@NotNull @Positive`;
`detalles` `@NotEmpty @Valid`; cada `pesoFundidoG` `@NotNull @Positive`.

**Salida** — `LiquidacionG1Response`:

```json
{
  "idLiquidacionG1": 1,
  "nombreAcopiadorG2": "Acopiador Central Juliaca",
  "estado": "REGISTRADA",
  "pesoTotalFundidoG": 80.000,
  "cotizacionOnzaUsd": 2650.00,
  "tipoCambioUsdPen": 3.7500,
  "totalPagadoG2Pen": 26145.50,
  "fechaLiquidacion": "2026-09-01T10:15:00",
  "detalles": [
    { "idDetalleLiquidacion": 1, "tipoOro": "ROJO", "pesoFundidoG": 50.000, "precioGramoPen": 319.50, "subtotalPen": 15975.00 },
    { "idDetalleLiquidacion": 2, "tipoOro": "VERDE", "pesoFundidoG": 30.000, "precioGramoPen": 335.48, "subtotalPen": 10064.40 }
  ]
}
```

**Reporte agregado** — `GET /api/v1/mayorista/liquidaciones/resumen` (`LiquidacionReporte`):

```json
{
  "agregado": { "totalLiquidaciones": 4, "montoTotal": 104582.00, "ticketPromedio": 26145.50 },
  "liquidaciones": [
    { "idLiquidacionG1": 4, "fechaLiquidacion": "2026-09-05T15:20:00", "estado": "REGISTRADA", "totalPagadoG2Pen": 26145.50, "cantidadDetalles": 2 }
  ]
}
```

Sobre un rango sin datos, `montoTotal` y `ticketPromedio` devuelven **`0`, no `null`**
(`BigDecimal.ZERO` explícito en el servicio).

## 2.4 Reglas de negocio y atomicidad

- **Precio base**: `Onza USD / 31.1035 (gramos por onza troy) × tipo de cambio`, redondeo `HALF_UP` a 2 decimales.
  El oro VERDE aplica un factor de pureza de 1.05 sobre el precio base.
- **Regla de integridad**: cada línea descuenta stock de oro por color en el módulo `acopiador`
  (`AcopiadorService.descontarStockOro`). Si el stock no alcanza, se lanza
  `StockInsuficienteException` y **la transacción completa hace ROLLBACK** — no solo la última línea.
- La atomicidad la garantiza `@Transactional` sobre `procesarLiquidacionSemanal(...)`.
- Comunicación entre módulos: solo por la interfaz pública `AcopiadorService` (ADR-002), nunca por repositorio ajeno.

---

## 3. Evidencia de ejecución (demo en vivo)

Backend en `http://localhost:8081` (perfil `dev`), Oracle `XEPDB1` esquema `BOMERP_APP`.

```powershell
# --- CRUD (S2): éxito + inválido ---
Invoke-RestMethod "http://localhost:8081/api/v1/acopio/mineros"
# POST con documentoIdentidad de 3 caracteres -> 400 Bad Request

# --- Objeto relacionado (S3) ---
Invoke-RestMethod "http://localhost:8081/api/v1/acopio/mineros/1/transacciones"

# --- Cabecera-detalle (S4): éxito + rollback ---
$ok = @{ nombreAcopiadorG2="Demo S06"; cotizacionOnzaUsd=2650; tipoCambioUsdPen=3.75
        detalles=@(@{tipoOro="ROJO"; pesoFundidoG=10}) } | ConvertTo-Json -Depth 5
Invoke-RestMethod -Method Post "http://localhost:8081/api/v1/mayorista/liquidaciones" -ContentType application/json -Body $ok
# -> 201 Created

$rollback = @{ nombreAcopiadorG2="Demo S06"; cotizacionOnzaUsd=2650; tipoCambioUsdPen=3.75
              detalles=@(@{tipoOro="VERDE"; pesoFundidoG=999999}) } | ConvertTo-Json -Depth 5
try { Invoke-RestMethod -Method Post "http://localhost:8081/api/v1/mayorista/liquidaciones" -ContentType application/json -Body $rollback }
catch { "HTTP " + $_.Exception.Response.StatusCode.value__ }   # -> HTTP 409, sin fila persistida

# --- Consultas y reporte (S5) ---
Invoke-RestMethod "http://localhost:8081/api/v1/mayorista/liquidaciones?estado=REGISTRADA&ordenarPor=totalPagadoG2Pen&direccion=ASC"
Invoke-RestMethod "http://localhost:8081/api/v1/mayorista/liquidaciones/resumen"
Invoke-RestMethod "http://localhost:8081/api/v1/mayorista/liquidaciones/resumen?desde=2020-01-01T00:00:00&hasta=2020-01-02T00:00:00"
# -> montoTotal: 0, ticketPromedio: 0  (no null)
```

**Logs**: cada petición lleva `traceId` (`CorrelationIdFilter`); los rollback quedan como
`WARN ... StockInsuficienteException provocando Rollback (409 Conflict)` en `logs/bomerp.log`,
recogidos por Promtail → Loki (stack `lp2/obs`).

**Pruebas**: `mvn test` → `Tests run: 16, Failures: 0, Errors: 0`, incluye:

| Test | Verifica |
|---|---|
| `ModularityTests` | Estructura modular Spring Modulith |
| `MayoristaControllerTest.liquidarSemanal_Exito_201` | Cabecera-detalle OK |
| `MayoristaControllerTest.liquidarSemanal_StockInsuficiente_Rollback409` | Rollback por stock |
| `MayoristaControllerTest.buscarLiquidaciones_200` | Consulta con filtros (S5) |
| `MineroControllerTest` (×5) | CRUD + validación |
| `AcopiadorControllerTest` (×3) | Transaccional 1 |
| `CalculadorPrecioOficialTest` (×2) | Cálculo de precio |

---

## 4. Evidencia de integración con ADS y BD2

| Elemento LP2 | ADS | BD2 |
|---|---|---|
| Configuración por ambientes (`application-dev.yml`, `sitraoro.cors.allowed-origin`) | Ejecutable desplegable + configuración externa | Conexión Oracle sin credenciales versionadas (`.gitignore`) |
| Monolito modular `acopio` con `@NamedInterface` | Vista C3, límites y dependencias | Esquemas `BOM_ACOPIO` / `BOMERP_APP` con propiedad funcional |
| Validación de total y stock de oro en `procesarLiquidacionSemanal` | Regla de integridad | Restricciones y excepciones PL/SQL |
| Filtro por `fechaLiquidacion` en `GET /mayorista/liquidaciones` | Atributo de rendimiento | Índice sobre `LIQUIDACIONES_G1(ESTADO, FECHA_LIQUIDACION)` |

Secuencia de sustentación: 2.1 → 2.2 → CRUD (éxito + 400) → cabecera-detalle (éxito + rollback)
→ consulta con filtros + `/resumen` → `ModularityTests` en verde → esquemas Oracle reales de BD2
→ cierre con la tabla de integración.
