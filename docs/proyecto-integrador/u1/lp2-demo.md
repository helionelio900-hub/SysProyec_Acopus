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

## 8. Rúbrica de Evaluación

Tabla 4. Rúbrica de evaluación de la Unidad 1

| Criterio | Peso | CE / Nivel | A (20 pts) | B (15 pts) | C (10 pts) | D (5 pts) | Calificación obtenida |
|---|---|---|---|---|---|---|---|
| 1. Crea y configura el proyecto backend con ORM, conexión a la base de datos, recurso REST inicial, DTO y documentación de API | 16% | CE023-N2 (parcial) | Proyecto ejecutable, conectado a Oracle, con contrato y versionado de API documentados y verificables en vivo. | Proyecto ejecutable y conectado, con documentación parcial. | Proyecto ejecutable con conexión o documentación incompleta. | No presenta un proyecto backend ejecutable. | |
| 2. Implementa un CRUD REST completo, con validaciones, excepciones, logs y pruebas transversales | 16% | CE023-N2 (parcial) | CRUD completo con validación, manejo de errores y trazabilidad probados con casos reales. | CRUD completo con validación parcial o trazabilidad incompleta. | CRUD incompleto o sin manejo de errores. | No presenta CRUD funcional. | |
| 3. Gestiona objetos relacionados mediante ORM, DTO y reglas de asociación | 16% | CE023-N2 (parcial) | Asociación entre entidades con DTO relacionado y navegación controlada, verificada en vivo. | Asociación funcional, con detalles menores en la navegación o el DTO. | Asociación incompleta o sin control de referencias. | No implementa objetos relacionados. | |
| 4. Implementa una operación cabecera-detalle con registro atómico, cálculos, estados, consistencia, commit y rollback | 16% | CE023-N2 (parcial) | Operación completa, con caso de éxito y caso de rollback probados y explicados. | Operación completa, con un caso probado. | Operación presente, sin evidencia clara de atomicidad. | No implementa la operación cabecera-detalle. | |
| 5. Implementa consultas, filtros, ordenamiento, agregaciones, reportes y configuración CORS | 16% | CE023-N2 (parcial) | Filtros combinados, reporte agregado y CORS configurado por propiedad, probados en vivo. | La mayoría de estos elementos funciona, con detalles menores. | Consultas o CORS incompletos. | No implementa consultas ni CORS. | |
| 6. Sustentación | 20% | CG | Sustenta con claridad y profesionalismo su aporte individual, respondiendo con precisión las preguntas del jurado. | Sustenta con solvencia, con detalles menores en claridad, orden o precisión. | Sustenta con dificultad; claridad, orden o precisión insuficientes. | No sustenta adecuadamente ni demuestra su aporte individual. | |

Nota final = suma de (Peso × Puntos de la calificación obtenida) / 100 × 20.

CE023-N2 (parcial) = porción de backend REST del Nivel 2 de CE023 (Programación) — la otra porción (frontend SPA, JWT, integración full-stack) se completa en Unidad 2 de LP2. CG = Competencia General "Innovación y solución de problemas" del sílabo de LP2 — no es CE023: los criterios 1-5 ya son la evidencia técnica, incluida su verificación en vivo; el criterio 6 verifica aporte individual y comunicación.

Tabla 5. Subaspectos de la sustentación (Unidad 1)

El criterio 6 se evalúa con los mismos 6 subaspectos de la sustentación integral del Proyecto Integrador (Guía de Sustentación Final) — exigibles desde esta primera sustentación de unidad, no solo en la sustentación final del ciclo (Unidad 3).

| Subaspecto | Qué observa en Unidad 1 |
|---|---|
| 1. Aporte individual | Cada integrante demuestra lo que construyó de su propio backend. |
| 2. Comunicación y orden | Claridad, estructura, tiempo y lenguaje técnico durante la presentación. |
| 3. Presentación personal y actitud | Puntualidad, vestimenta limpia y adecuada, higiene, cabello ordenado, actitud profesional, respeto, honestidad y coherencia con los valores y principios cristianos de la institución. |
| 4. Repositorio y estándares | Topics académicos configurados desde S2, organización, commits y reproducibilidad del backend. |
| 5. MkDocs o equivalente | Documentación de Unidad 1 publicada, navegable y alineada con este documento. |
| 6. Pitch/demo ejecutiva | Introducción breve del backend y su avance, con apoyo visual (.pptx, Canva o equivalente) — no reemplaza la demo técnica, la precede. |

## 9. Trazabilidad y procedencia de la rúbrica

Los primeros cinco criterios son cita literal del resultado de aprendizaje de la Unidad I en el sílabo de LP2; el sexto (Sustentación) corresponde a la sustentación exigida por el mismo sílabo (sesión 6, actividad 2).

Con la malla curricular: los criterios 1-5 corresponden a la porción de backend REST del Nivel 2 de CE023 (Programación) — la otra porción de ese nivel, el frontend SPA, la seguridad JWT y la integración full-stack completa, se completa en la Unidad 2 de LP2, no aquí. El criterio 6 (Sustentación) es transversal y no forma parte de la definición de la competencia.
