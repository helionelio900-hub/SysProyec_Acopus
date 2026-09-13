# LP2 · Producto de Unidad I — SITRA-ORO

Equipo 05 · Backend REST de trazabilidad y liquidación de acopio de oro.
Corte S1–S5, sustentado en S06. Se conserva la estructura 1–7 del docente y se
adapta el dominio a Minero–TransaccionG2–LiquidacionG1–DetalleLiquidacionG1.

## 1. Alcance arquitectónico del corte

Un solo proyecto Maven (`lp2/sitra-oro-backend`), una JVM, un ejecutable
`SitraOroBackendApplication` y un datasource Oracle. No hay reactor multimódulo,
Feign ni HTTP interno. Los módulos funcionales son:

```text
pe.edu.upeu.sitraoro
├── SitraOroBackendApplication
└── acopio
    ├── parametros   maestro Minero, parámetros y contrato de dashboard
    ├── cotizador    estimación sin persistencia
    ├── acopiador    compras G2, asociación con Minero y stock por color
    └── mayorista    liquidación cabecera–detalle
```

Spring Modulith verifica límites con `ApplicationModules.verify()`. Los contratos
compartidos se declaran mediante `@NamedInterface`; los repositorios son internos.
`Minero` se exporta expresamente como modelo para la relación ORM.
Seguridad/JWT, SPA e integración frontend corresponden a U2; no se presentan como
funcionalidades de este corte. El brief funcional está en el informe de ADS,
sección «Corte arquitectónico U1 y trazabilidad LP2–BD2».

## 2. Demo ejecutable

Requiere Java 21 y Oracle XE. Desde `lp2/sitra-oro-backend`, copiar
`application-local.properties.example` a `application-local.properties` y completar
las credenciales locales. El archivo privado está ignorado por Git; también se
admiten `DB_USERNAME`, `DB_PASSWORD` y `DB_URL`.

```powershell
.\mvnw.cmd spring-boot:run
```

- [Abrir Swagger en el equipo local](http://localhost:8081/swagger-ui.html).
- [Comprobar salud y Oracle en el equipo local](http://localhost:8081/actuator/health).
- [Consultar OpenAPI en el equipo local](http://localhost:8081/v3/api-docs).

Los enlaces localhost requieren el backend en el equipo del visitante. La página
publicada es documentación estática y no expone la base de datos ni aloja Spring Boot.
Oracle XE instalado usa 1521/XEPDB1; la alternativa Compose del repositorio publica
1522/XEPDB1 y exige ajustar DB_URL. El README del backend documenta ambos entornos.

Para demostrar sin consumir lotes existentes:

```powershell
.\mvnw.cmd test
.\scripts\probar_oracle.ps1
```

El segundo comando necesita SQL*Plus y acceso OS SYSDBA a Oracle XE local. Crea un
esquema temporal, instala los scripts BD2, valida el mapeo JPA, ejecuta pruebas y
elimina solo ese esquema. Los scripts de demo 201/409 sobre la API activa requieren
stock inicial cero; no deben cerrar stock ajeno.

## 3. Contrato REST

| Método | Endpoint | Propósito | Sesión |
|---|---|---|---|
| GET/POST | `/api/v1/acopio/mineros` | Listado y alta del maestro | S2 |
| GET/PUT/DELETE | `/api/v1/acopio/mineros/{id}` | Consulta, edición y eliminación | S2 |
| GET | `/api/v1/acopio/mineros/{id}/transacciones` | Navegación de asociación | S3 |
| POST/GET | `/api/v1/acopio/transacciones` | Registrar y consultar compras G2 | S3 |
| GET | `/api/v1/cotizador/estimar?pesoBrutoGramos=100` | Cotización sin persistencia | S1–S3 |
| GET | `/api/v1/acopio/acumulados-semanales` | Stock pendiente por color | S4 |
| POST | `/api/v1/mayorista/liquidaciones` | Registrar cabecera y detalles | S4 |
| GET | `/api/v1/mayorista/liquidaciones/{id}` | Cabecera con sus detalles | S4 |
| GET | `/api/v1/mayorista/liquidaciones` | Filtros combinados y orden | S5 |
| GET | `/api/v1/mayorista/liquidaciones/resumen` | Proyección y agregados | S5 |
| GET | `/api/v1/dashboard/consolidado` | Totales históricos por color | S5 |

Consultas: `estado`, `desde` y `hasta` opcionales; fechas inclusivas. El listado
acepta `ordenarPor` de una lista permitida y `direccion=ASC|DESC`. Se rechazan
rangos invertidos y parámetros inválidos con 400. El reporte suma en Java los
montos de la proyección JPQL y calcula el promedio; si no hay filas, devuelve cero.

## 4. DTO principales

Solicitud de minero:

```json
{"documentoIdentidad":"12345678","nombresApellidos":"Minero de demostración","telefono":"900000000","zonaProcedencia":"Puno"}
```

Solicitud de liquidación:

```json
{"nombreAcopiadorG2":"Acopiador U1","cotizacionOnzaUsd":2650.00,"tipoCambioUsdPen":3.7500,"detalles":[{"tipoOro":"ROJO","pesoFundidoG":10.000},{"tipoOro":"VERDE","pesoFundidoG":5.000}]}
```

Respuesta de ejemplo: ID y fecha ilustrativos, requiere ese stock disponible.

```json
{"idLiquidacionG1":1,"nombreAcopiadorG2":"Acopiador U1","estado":"REGISTRADA","pesoTotalFundidoG":15.000,"cotizacionOnzaUsd":2650.00,"tipoCambioUsdPen":3.7500,"totalPagadoG2Pen":4872.40,"fechaLiquidacion":"2026-09-13T10:00:00","detalles":[{"idDetalleLiquidacion":1,"tipoOro":"ROJO","pesoFundidoG":10.000,"precioGramoPen":319.50,"subtotalPen":3195.00},{"idDetalleLiquidacion":2,"tipoOro":"VERDE","pesoFundidoG":5.000,"precioGramoPen":335.48,"subtotalPen":1677.40}]}
```

El backend calcula total y estado. La validación rechaza detalles nulos, pesos
cero, listas vacías y precisión no admitida. Los errores incluyen timestamp,
status, error, message y traceId; la validación agrega campos. X-Trace-ID relaciona
la respuesta con los logs de la petición y CORS permite leer esa cabecera.

HTTP: 200 consulta/edición, 201 creación, 204 eliminación; 400 entrada incorrecta,
404 recurso inexistente, 409 duplicado/referencia/stock en conflicto.

## 5. Arquitectura backend U1

```text
Cliente REST / Swagger
        |
Controllers de cada módulo
        |
Servicios transaccionales / casos de uso
        |                         |
Repositorios internos        Interfaces públicas entre módulos
        |
JPA -> un DataSource -> Oracle XEPDB1
```

La propiedad funcional es: parametros → MINEROS/PARAMETROS_SISTEMA;
acopiador → TRANSACCIONES_G2; mayorista → LIQUIDACIONES_G1/DETALLE_LIQUIDACIONES_G1.
Cotizador no persiste. Los módulos usan un mismo esquema físico en el corte LP2.

`MayoristaServiceImpl.procesarLiquidacionSemanal()` abre la transacción, calcula
el precio (onza / 31.1035 × cambio; VERDE aplica 5 %), guarda cabecera y detalles
con saveAndFlush y llama al contrato AcopiadorService. Este bloquea lotes con
PESSIMISTIC_WRITE y vincula la liquidación. Cada color aparece una sola vez y
su peso coincide con todo su stock pendiente. Si el segundo color falla, la
excepción revierte cabecera, detalles y el primer descuento. Flush no es commit.

[Detalle de comunicación entre módulos](lp2-comunicacion-modulos.md).

## 6. Casos de prueba

| Caso | Evidencia | Resultado esperado |
|---|---|---|
| Backend y Oracle | `/actuator/health` | Oracle y estado UP |
| Límites | `ModularityTests` | Sin violaciones |
| CRUD persistido | `ApiU1IntegrationTest` | Alta, lectura, edición persistida, eliminación y 404 |
| Asociación ORM | `relacionMineroCompraSeSerializaYProtegeReferencias` | DTO relacionado sin ciclos; FK impide borrar un minero con compras |
| Entrada y trazabilidad | `erroresDeEntradaTienenDetalleYCorrelacion` | 400, campos y traceId; formatos inválidos controlados |
| Detalles inválidos | `detalleNuloYPesoCeroSeRechazanAntesDePersistir` | 400 sin escritura |
| Liquidación válida | `liquidacionExitosa_persisteCabeceraDetallesYMarcaLotes` | Dos detalles, REGISTRADA, total 4872.40 y lotes vinculados |
| Rollback real | `errorEnSegundoDetalle_revierteCabeceraDetallesYPrimerDescuento` | Cero cabeceras/detalles; primer lote libre |
| Consultas | `filtrosCombinadosOrdenYAgregadosUsanDatosPersistidos` | Filtros, orden 300/100, total 400, promedio 200; vacío en cero |
| CORS por propiedad | `corsPermiteOrigenConfiguradoYExponeTraceId` | Permite 4200, rechaza 4300; expone X-Trace-ID |

Suite: 29 pruebas aprobadas. Los 9 casos de integración se ejecutan adicionalmente
contra Oracle; no son 38 casos distintos. [Resultados de verificación](verificacion-u1.md).

## 7. Trazabilidad con ADS y BD2

| Elemento LP2 | Evidencia ADS | Evidencia BD2 | Comprobación |
|---|---|---|---|
| Alcance y un ejecutable | `ads/S01_Informe_Requerimientos.md`, sección 5: corte U1 y vista C3 | Un usuario ejecutor y datasource | Contexto Spring y salud Oracle |
| Límites de módulos | `ads/S03_Diseño_Estructural_Principios_SOLID.md`, secciones 2–3 | Propiedad funcional definida por tabla | Modulith e interfaces nombradas |
| Maestro y asociación | ADS S01, módulos parametros/acopiador | `bd2/S01_03_tablas_bomerp_app.sql`: PK MINEROS, documento único y FK_G2_MINERO | CRUD y relación probados en Oracle |
| Cabecera–detalle | ADS S01, módulo mayorista y reglas de cierre | Mismo DDL: cinco tablas, FK_DET_LIQ_G1_CAB, UQ_DET_LIQ_G1_COLOR, FK_G2_LIQUIDACION_G1 | Commit y rollback reales |
| Total, estado y stock | ADS S01 sección 5: reglas de cálculo y atomicidad | CHECK de estado/tipos y FK; cálculos y stock en servicios Java | Total 4872.40 y reversión de cambios |
| Filtros y reporte | Vista C3, consultas de mayorista | `bd2/S05_indices.sql`: IX_LIQ_G1_ESTADO_FECHA, IX_LIQ_G1_FECHA e índices FK | Filtros y agregados con datos persistidos |
| Entorno reproducible | Configuración externa del ejecutable | Script Oracle instala DDL e índices BD2 en esquema aislado | Hibernate validate y suite de integración |

**Alineación de esquemas:** el DDL ejecutable U1 es S01_03, sin esquema fijo;
S01_02 + S04_02 documentan la alternativa BOM_ACOPIO y no se ejecutan encima de
S01_03. El parche S05_00 es para bases anteriores, no necesario sobre el DDL
actual. Los índices ofrecen rutas al optimizador; no se afirma que siempre se usen
ni se inventan planes de ejecución. No existen procedimientos PL/SQL de negocio
para los cálculos de LP2: esa regla reside en los servicios Java.
