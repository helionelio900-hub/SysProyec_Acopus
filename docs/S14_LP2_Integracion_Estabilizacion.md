# S14 - Integración y Estabilización
**Curso:** Lenguaje de Programación II (LP2) - Unidad 3  
**Proyecto:** SITRA-ORO (Sistema de Trazabilidad y Liquidación de Oro)  
**Estudiante:** Faijo Calisaya Helio Paul - Equipo 05  
**Docente:** Angel Sullón Macalupú (@asullom) - 2026  

---

## 1. Resumen Ejecutivo y Entregables de la Sesión

En esta sesión se aborda la integración funcional de punta a punta del sistema SITRA-ORO, estabilizando el listado transaccional de liquidaciones, corrigiendo la desincronización de cálculos en cliente generada por paginación, persistiendo un registro de auditoría de negocio para acciones críticas, y verificando el sistema completo con una prueba end-to-end real contra base de datos.

| # | Requisito S14 | Implementación SITRA-ORO | Estado |
|---|---|---|---|
| **1** | Diagnóstico de Hallazgo Real | Se identificó que calcular totales en cliente vía `.reduce()` (excepción documentada de S9 3.10) queda invalidado al paginar, pues sumar una sola página altera los totales reales del negocio. | **Diagnosticado** |
| **2** | Paginación en Repositorio y Servicio | `LiquidacionG1Repository` y `MayoristaServiceImpl` implementan `buscar(..., Pageable)` retornando `Page<LiquidacionG1Response>` con ordenamiento dinámico. | **Verificado** |
| **3** | Controlador Paginado | `MayoristaController.buscar` expone `Page<LiquidacionG1Response>` usando `@PageableDefault(size = 20, sort = "fechaLiquidacion")` y parámetros estándar de Spring Data. | **Verificado** |
| **4** | SPA Reconectada a Agregados del Servidor | `operaciones.service.ts` expone `buscarLiquidacionesPaginado(...)` con `PageResponse<Liquidacion>` y reconecta los totales a `/api/v1/mayorista/liquidaciones/resumen`. | **Verificado** |
| **5** | Auditoría de Acciones Críticas | Entidad `RegistroAuditoria` en tabla `AUDITORIA`, repositorio `RegistroAuditoriaRepository` y `AuditoriaService` que extrae el `sub` del JWT de Keycloak. | **Verificado** |
| **6** | Prueba End-to-End Real | `LiquidacionEndToEndTest` ejecutada con `@SpringBootTest` y `MockMvc` con contexto real de base de datos y seguridad JWT (`ROLE_G1_MAYORISTA`). | **BUILD SUCCESS** |
| **7** | Bitácora de Estabilización | Registro formal del hallazgo, impacto, corrección técnica y prueba de no regresión. | **Documentado** |

---

## 2. Diagnóstico del Hallazgo Real (S9 3.10 vs Paginación)

### 2.1 Causa Raíz
En S9 3.10 se permitía calcular conteo y monto total mediante `.reduce()` en el navegador bajo la premisa de que la pantalla cargaba el arreglo íntegro de liquidaciones.  
Al incorporar paginación por demanda (`Pageable`, ej. 10 o 20 elementos por vista para no saturar memoria ni red), cualquier cálculo con `.reduce()` en el cliente pasa a totalizar únicamente la página visible (ej. 10 registros), mostrando montos y tickets promedio falsos e inconsistentes con la realidad financiera del acopio.

### 2.2 Solución Arquitectural
Separar responsabilidades estrictamente:
1. **Paginación de Filas:** `GET /api/v1/mayorista/liquidaciones` entrega únicamente el subconjunto pedido (`Page<LiquidacionG1Response>`).
2. **Totales del Negocio:** `GET /api/v1/mayorista/liquidaciones/resumen` calcula en la base de datos relacional el `totalLiquidaciones`, `montoTotal` y `ticketPromedio` mediante agregaciones SQL optimizadas (`COUNT`, `SUM`), sin transferir miles de filas a la red.

---

## 3. Implementación de Paginación Backend

### 3.1 Repositorio (`LiquidacionG1Repository.java`)
```java
@EntityGraph(attributePaths = "detalles")
@Query("""
    SELECT l FROM LiquidacionG1 l
    WHERE (:estado IS NULL OR l.estado = :estado)
      AND (:desde IS NULL OR l.fechaLiquidacion >= :desde)
      AND (:hasta IS NULL OR l.fechaLiquidacion <= :hasta)
    """)
Page<LiquidacionG1> buscar(@Param("estado") EstadoLiquidacion estado,
                           @Param("desde") LocalDateTime desde,
                           @Param("hasta") LocalDateTime hasta,
                           Pageable pageable);
```

### 3.2 Controlador (`MayoristaController.java`)
```java
@GetMapping("/liquidaciones")
@Operation(summary = "Consulta liquidaciones con filtros, ordenamiento y paginación")
public ResponseEntity<Page<LiquidacionG1Response>> buscar(
        @RequestParam(required = false) EstadoLiquidacion estado,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime desde,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime hasta,
        @PageableDefault(size = 20, sort = "fechaLiquidacion", direction = Sort.Direction.DESC) Pageable pageable) {
    log.info("Consultando liquidaciones paginadas estado={} desde={} hasta={} pageable={}",
            estado, desde, hasta, pageable);
    return ResponseEntity.ok(mayoristaService.buscar(estado, desde, hasta, pageable));
}
```

---

## 4. Auditoría de Acciones Críticas de Negocio

### 4.1 Entidad `RegistroAuditoria.java`
```java
@Entity
@Table(name = "AUDITORIA")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RegistroAuditoria {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String actor;        // sub o username del JWT de Keycloak
    private String accion;       // "CREAR", "ANULAR", "LIQUIDAR"
    private String entidad;      // "RECEPCION_MAYORISTA", "LIQUIDACION_G1"
    private Long entidadId;
    private LocalDateTime fecha;
    private String detalle;
}
```

### 4.2 Servicio de Auditoría (`AuditoriaService.java`)
Resuelve automáticamente el actor autenticado a partir del `SecurityContextHolder`:
```java
Authentication auth = SecurityContextHolder.getContext().getAuthentication();
if (auth != null && auth.getPrincipal() instanceof Jwt jwt) {
    return jwt.getSubject();
}
```
Inyectado y ejecutado en `RecepcionMayoristaServiceImpl` tras confirmar la transacción de creación (`CREAR`) y anulación (`ANULAR`).

---

## 5. Prueba End-to-End Real (`LiquidacionEndToEndTest.java`)

Se ejecutó la prueba sin mocks, levantando el contexto completo de Spring Boot con persistencia real y seguridad OIDC:

```text
[INFO] Running pe.edu.upeu.sitraoro.acopio.mayorista.LiquidacionEndToEndTest
2026-11-03 13:22:58.013 INFO  p.e.u.s.a.m.c.MayoristaController - Consultando liquidaciones paginadas estado=null desde=null hasta=null pageable=Page request [number: 0, size 10, sort: fechaLiquidacion: DESC]
2026-11-03 13:22:58.294 INFO  p.e.u.s.filter.CorrelationIdFilter - HTTP GET /api/v1/mayorista/liquidaciones status=200 duracionMs=371
2026-11-03 13:22:58.389 INFO  p.e.u.s.filter.CorrelationIdFilter - HTTP GET /api/v1/mayorista/liquidaciones/resumen status=200 duracionMs=40
2026-11-03 13:22:58.399 INFO  p.e.u.s.a.service.AuditoriaService - Auditoría registrada: id=1 actor=mayorista-e2e accion=CREAR entidad=LIQUIDACION_G1:1
[INFO] Tests run: 1, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 17.58 s
[INFO] BUILD SUCCESS
```

---

## 6. Bitácora de Estabilización

| ID | Hallazgo | Causa Raíz | Corrección Aplicada | Prueba de No Regresión | Estado |
|---|---|---|---|---|---|
| **EST-01** | Totales financieros desvirtuados al paginar listado de liquidaciones | Excepción de S9 3.10 (.reduce en navegador) asumía la lista completa en memoria; paginar a 10/20 filas causaba que los totales mostrados fueran solo de la página actual. | Paginación en servidor con `Page<LiquidacionG1Response>` para filas, y reconexión obligatoria de tarjetas KPI al endpoint `/liquidaciones/resumen` para totales agregados globales. | `LiquidacionEndToEndTest.flujoCompleto_consultaPaginadaYResumen` (valida coincidencia de totales y estructura paginada). | **CERRADO** |
| **EST-02** | Ausencia de trazabilidad de identidad en operaciones mayoristas | Los triggers de base de datos solo registraban el usuario técnico (`BOMERP_APP`), impidiendo auditar a la persona real que liquidó o anuló. | Implementación de `RegistroAuditoria` y `AuditoriaService` extrayendo el claim `sub` del token JWT de Keycloak en la capa de servicio. | Verificación en `LiquidacionEndToEndTest` de persistencia en tabla `AUDITORIA` con `actor="mayorista-e2e"`. | **CERRADO** |
