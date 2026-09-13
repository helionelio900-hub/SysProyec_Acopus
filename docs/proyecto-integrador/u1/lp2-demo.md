# LP2 · Producto de Unidad I — Backend REST SITRA-ORO

> Equipo 05. Sistema de Información, Trazabilidad y Liquidación en Acopio de Oro.
> Alcance congelado para la evaluación S06: solamente lo construido en S1–S5.

S06 no agrega funcionalidades. Evalúa que el backend de las cinco sesiones funcione integrado,
sea explicable y tenga evidencia reproducible.

| Sesión | Evidencia implementada |
|---|---|
| S1 | Spring Boot ejecutable con Java 21, Oracle `XEPDB1`, API `/api/v1` y Swagger |
| S2 | CRUD completo de `Minero`, DTO de entrada/salida, mapper, validación, errores y `traceId` |
| S3 | Relación JPA `TransaccionG2` → `Minero` y respuesta relacionada sin ciclos JSON |
| S4 | Operación real `LiquidacionG1` + detalles, cálculos, stock y rollback transaccional |
| S5 | Filtros combinados, ordenamiento controlado, proyección, agregados, índices y CORS |

## 1. Arquitectura que se sustenta

Es un monolito modular: un solo proyecto Maven, una JVM y un `DataSource`. Spring Modulith
reconoce y verifica cuatro módulos funcionales presentes en U1:

```text
pe.edu.upeu.sitraoro.acopio
├── parametros     CRUD de mineros, parámetros vigentes y contrato del dashboard
├── cotizador      simulación en memoria; no persiste
├── acopiador      compras G2, relación con minero y stock por color
└── mayorista      cierre semanal cabecera-detalle
```

Cada paquete tiene `@ApplicationModule`. Los servicios y DTO compartidos se exponen mediante
`@NamedInterface`; ningún módulo usa el repositorio interno de otro. `ModularityTests` ejecuta
`ApplicationModules.verify()` y genera documentación en `target/spring-modulith-docs`.

El módulo conceptual **Seguridad** del brief no se implementa en U1: JWT corresponde a S10.
Tampoco forman parte de este corte la SPA, paginación, Redis, Prometheus, Loki ni despliegue.

## 2. Contrato REST demostrable

| Método | Endpoint | Evidencia |
|---|---|---|
| GET/POST | `/api/v1/acopio/mineros` | Listado y alta del CRUD S2 |
| GET/PUT/DELETE | `/api/v1/acopio/mineros/{id}` | Consulta, actualización y eliminación S2 |
| GET | `/api/v1/acopio/mineros/{id}/transacciones` | Objeto relacionado S3 |
| GET | `/api/v1/cotizador/estimar?pesoBrutoGramos=100` | Cotización no persistente |
| POST/GET | `/api/v1/acopio/transacciones` | Registrar y listar compras G2 |
| GET | `/api/v1/acopio/acumulados-semanales` | Stock no liquidado por color |
| POST | `/api/v1/mayorista/liquidaciones` | Operación cabecera-detalle S4 |
| GET | `/api/v1/mayorista/liquidaciones/{id}` | Cabecera con sus detalles |
| GET | `/api/v1/mayorista/liquidaciones` | Filtros y ordenamiento S5 |
| GET | `/api/v1/mayorista/liquidaciones/resumen` | Proyección y agregados S5 |
| GET | `/api/v1/dashboard/consolidado` | Totales históricos por color |

Swagger: `http://localhost:8081/swagger-ui.html`.

## 3. Regla de negocio y transacción atómica

El precio base se calcula así:

```text
precio PEN/g = (cotización onza USD / 31.1035) × tipo de cambio
```

El oro `VERDE` aplica el diferencial de 5 % definido para U1. Cada color puede aparecer una sola
vez en el cierre y su peso debe coincidir con **todo el stock sin liquidar de ese color**.

`MayoristaServiceImpl.procesarLiquidacionSemanal()` tiene `@Transactional`:

1. calcula y guarda cabecera + detalles;
2. llama a la interfaz pública `AcopiadorService`;
3. bloquea los lotes disponibles con `PESSIMISTIC_WRITE`;
4. asigna `ID_LIQUIDACION_G1` a cada `TransaccionG2` incluida;
5. si un color no coincide con el stock, lanza `StockInsuficienteException` y revierte todo.

La prueba de integración provoca el error en el segundo detalle y verifica que no quede la
cabecera y que el primer color tampoco quede marcado. Esa es evidencia de rollback real, no un
mock del controlador.

## 4. Consultas empresariales S5

Ejemplo:

```text
GET /api/v1/mayorista/liquidaciones
    ?estado=REGISTRADA
    &desde=2026-09-01T00:00:00
    &hasta=2026-09-30T23:59:59
    &ordenarPor=totalPagadoG2Pen
    &direccion=ASC
```

Los filtros son opcionales y combinables. El servicio rechaza rangos invertidos, direcciones
distintas de `ASC`/`DESC` y campos de orden ajenos a la lista permitida. No hay paginación porque
eso está fuera del alcance de S5. El reporte usa `LiquidacionResumen` y devuelve monto y promedio
en cero cuando no existen filas.

## 5. Demostración S06

Preparación:

```powershell
cd lp2\sitra-oro-backend
docker compose -f compose-dev.yml up -d
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=dev"
```

En otra terminal se ejecutan las pruebas y los dos casos de negocio:

```powershell
cd lp2\sitra-oro-backend
.\mvnw.cmd test
.\scripts\probar_exito_201.ps1
.\scripts\probar_rollback_409.ps1
```

Los scripts requieren una base de demostración sin stock abierto y abortan sin modificar datos si
encuentran lotes previos. Crean las compras G2 mediante la API; el de éxito cierra el stock creado
y el de rollback comprueba los conteos y que el primer lote continúa sin liquidar.

Resultado automatizado actual:

```text
Tests run: 23, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
```

La suite incluye controladores, validación, cálculos, `ModularityTests` y
`MayoristaServiceIntegrationTest` con éxito y rollback sobre H2. En la sustentación, los scripts
aportan la evidencia adicional contra Oracle real.

## 6. Trazabilidad con ADS y BD2

| LP2 | ADS | BD2 |
|---|---|---|
| Monolito modular y contratos públicos | Límites de componentes y dependencias | Esquemas funcionales y usuario ejecutor |
| Entidades y relación Minero–Transacción | Modelo de dominio | PK, FK y restricciones |
| Liquidación cabecera-detalle atómica | Flujo de cierre semanal | Cabecera, detalle y FK de trazabilidad |
| Filtros por estado/fecha y reporte | Atributo de rendimiento | Índices de S5 |

Orden recomendado de sustentación: arquitectura → CRUD válido y 400 → objeto relacionado →
cabecera-detalle 201 → rollback 409 → filtros/reporte → pruebas/Modulith → tablas Oracle.
