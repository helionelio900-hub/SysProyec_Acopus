# S13 - Optimización y Preparación para Producción
**Curso:** Lenguaje de Programación II (LP2) - Unidad 3  
**Proyecto:** SITRA-ORO (Sistema de Trazabilidad y Liquidación de Oro)  
**Estudiante:** Faijo Calisaya Helio Paul - Equipo 05  
**Docente:** Angel Sullón Macalupú (@asullom) - 2026  

---

## 1. Resumen Ejecutivo y Entregables de la Sesión

En esta sesión se realiza la transición arquitectural del ambiente de desarrollo local (`dev` con `ng serve` y `mvnw`) a una infraestructura lista y optimizada para producción (`prod` con bundle minificado, caché multinivel, observabilidad restringida y contenedores Docker independientes).

| # | Requisito S13 | Implementación SITRA-ORO | Estado |
|---|---|---|---|
| **1** | Lazy Loading & Code Splitting | `loadComponent: () => import(...)` en todas las rutas; build con `--stats-json` genera chunks individuales para `recepcion-mayorista` (110 kB), `operaciones` (90 kB), `consolidacion-mayorista` (60 kB), etc. | **Verificado** |
| **2** | Presupuestos de Bundle | `angular.json` con `initial` (warning 500kB, error 1MB), `anyComponentStyle` (warning 30kB, error 50kB), y `fileReplacements` hacia `environment.prod.ts`. | **Verificado** |
| **3** | Caché HTTP (Cache-Control) | `CentroAcopioController` (`/api/v1/publico/centros-acopio` y `/api/v1/mayorista/centros-acopio`) con `CacheControl.maxAge(Duration.ofMinutes(5))` (300 segundos). | **Verificado con Test** |
| **4** | Caché Redis & Invalidez | `spring-boot-starter-data-redis` + `spring-boot-starter-cache`. `CentroAcopioServiceImpl` con `@Cacheable("centros_acopio")` y `@CacheEvict(allEntries=true)`. `CentroAcopioResponse implements Serializable`. | **Verificado** |
| **5** | Logging por Perfil | `logback-spring.xml` con `<springProfile name="dev">` (DEBUG en `pe.edu.upeu.sitraoro`) y `<springProfile name="prod">` (INFO en paquete propio, WARN para librerías externas). | **Verificado** |
| **6** | Actuator Seguro | `application-dev.yml` con `include: "*"`; `application-prod.yml` con `include: health,info`. Sin secretos expuestos. | **Verificado** |
| **7** | Stack Completo de Producción | `Dockerfile` multi-etapa (Maven 3.9 + Eclipse Temurin 21 JRE Alpine) y `compose.yml` con puertos aislados de producción (Oracle 41521, Keycloak 48080, Redis 46379, Backend 48088, Frontend 4300). | **Verificado** |

---

## 2. Medición de Bundle y Lazy Loading (Frontend)

### 2.1 Estadísticas del Build de Producción (`ng build --configuration production --stats-json`)

```text
Initial chunk files | Names                   |  Raw size | Estimated transfer size
chunk-7Z77XAXC.js   | -                       | 211.82 kB |                61.38 kB
chunk-52YCSUBV.js   | -                       |  76.03 kB |                18.93 kB
chunk-2WEYJMSZ.js   | -                       |  11.74 kB |                 3.72 kB
chunk-XGVPUSLB.js   | -                       |  10.31 kB |                 3.21 kB
styles-24G2P5CR.css | styles                  |  10.16 kB |                 2.17 kB
main-QRAZ7C7Q.js    | main                    |   6.14 kB |                 1.73 kB
chunk-TA3EMUI4.js   | -                       |   5.12 kB |                 1.91 kB
chunk-5KEMQ26N.js   | -                       |   4.48 kB |                 1.08 kB
chunk-LGVILZAV.js   | -                       | 454 bytes |               454 bytes
                    | Initial total           | 336.28 kB |                94.59 kB

Lazy chunk files    | Names                   |  Raw size | Estimated transfer size
chunk-CT7UCLSY.js   | recepcion-mayorista     | 110.26 kB |                22.94 kB
chunk-FI2X3ILT.js   | operaciones             |  90.42 kB |                18.84 kB
chunk-5NAGJHVQ.js   | -                       |  62.85 kB |                12.26 kB
chunk-OKVFTMWP.js   | consolidacion-mayorista |  60.57 kB |                13.53 kB
chunk-HVADP4FO.js   | -                       |  59.75 kB |                 9.70 kB
chunk-VTM3JD5L.js   | -                       |  50.81 kB |                 9.82 kB
chunk-NBZNGE3L.js   | inicio                  |  35.50 kB |                 8.55 kB
chunk-455CFPTK.js   | inicio-acopio           |  30.58 kB |                 7.55 kB
chunk-RCVFS5XU.js   | liquidaciones           |  29.75 kB |                 7.53 kB
chunk-PUMFVXSF.js   | inicio-mayorista        |  26.16 kB |                 6.71 kB
chunk-SLI53ZMQ.js   | centros                 |  25.71 kB |                 6.43 kB
chunk-ST2DCQUQ.js   | perfil-minero           |  21.13 kB |                 5.58 kB
chunk-L56WFZ7K.js   | minero-form             |  18.14 kB |                 5.46 kB
chunk-2CLIZAWB.js   | cuenta-minero           |  16.63 kB |                 4.71 kB
chunk-DVQMT6Q6.js   | solicitudes             |  14.64 kB |                 4.24 kB
```

**Conclusión:** El bundle inicial suma **336.28 kB** (transferencia de apenas **94.59 kB** en red), respetando ampliamente el límite de advertencia de 500 kB y el límite de error de 1 MB. Las operaciones de mayorista (`recepcion-mayorista`, `operaciones`, `consolidacion-mayorista`) se descargan exclusivamente bajo demanda.

---

## 3. Caché HTTP del Navegador (Cache-Control)

### 3.1 Endpoint Seleccionado
`GET /api/v1/publico/centros-acopio` y `GET /api/v1/mayorista/centros-acopio`.
Los centros de acopio son datos referenciales y de catálogo que cambian con muy baja frecuencia (solo cuando la administración registra un nuevo centro).

### 3.2 Código Implementado en `CentroAcopioController.java`
```java
@GetMapping("/api/v1/publico/centros-acopio")
public ResponseEntity<List<CentroAcopioResponse>> listarParaMinero() {
    return ResponseEntity.ok()
            .cacheControl(CacheControl.maxAge(Duration.ofMinutes(5)))
            .body(centroAcopioService.listarActivos());
}
```

### 3.3 Verificación de Cabecera (Prueba Automatizada `CentroAcopioCacheTest`)
```text
[INFO] Running pe.edu.upeu.sitraoro.acopio.mayorista.controller.CentroAcopioCacheTest
2026-11-03 13:08:50.680 INFO p.e.u.s.filter.CorrelationIdFilter - HTTP GET /api/v1/publico/centros-acopio status=200 duracionMs=228
2026-11-03 13:08:50.740 INFO p.e.u.s.filter.CorrelationIdFilter - HTTP GET /api/v1/mayorista/centros-acopio status=200 duracionMs=3
[INFO] Tests run: 2, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 6.431 s
[INFO] BUILD SUCCESS
```

---

## 4. Caché en Servidor con Redis y Decisión Medida

### 4.1 Justificación Técnica
En SITRA-ORO, la consulta de centros de acopio activos se ejecuta repetidamente por cada minero que entra a registrarse o verificar puntos de entrega, y por cada acopiador que inicia sesión.
- **Transaccional (Ventas/Liquidaciones):** NO se cachea (`no-store`), ya que cambiaría el saldo de stock y generaría inconsistencias de balance.
- **Referencial (Centros de Acopio):** SÍ se cachea en Redis bajo la clave `centros_acopio::activos`. Al registrar un nuevo centro (`crear`), se dispara `@CacheEvict(value = "centros_acopio", allEntries = true)`.

### 4.2 Configuración y Serialización
`CentroAcopioResponse` implementa `Serializable`:
```java
public record CentroAcopioResponse(Long idCentroAcopio, String nombre, String zona,
                                   String direccion, String telefono, boolean activo) implements Serializable {}
```
Y en `CentroAcopioServiceImpl.java`:
```java
@Transactional(readOnly = true)
@Cacheable(value = "centros_acopio", key = "'activos'")
public List<CentroAcopioResponse> listarActivos() {
    log.info("Listando centros de acopio activos - consulta real a la base");
    return repository.findByActivoTrueOrderByNombreAsc().stream().map(CentroAcopioServiceImpl::toResponse).toList();
}
```

---

## 5. Logging y Actuator por Perfil

### 5.1 Niveles de Log (`logback-spring.xml`)
```xml
<springProfile name="dev">
    <logger name="pe.edu.upeu.sitraoro" level="DEBUG"/>
</springProfile>

<springProfile name="prod">
    <logger name="pe.edu.upeu.sitraoro" level="INFO"/>
    <logger name="org.springframework" level="WARN"/>
    <logger name="org.hibernate" level="WARN"/>
</springProfile>
```

### 5.2 Exposición de Actuator
- **DEV (`application-dev.yml`):** `management.endpoints.web.exposure.include: "*"`
- **PROD (`application-prod.yml`):** `management.endpoints.web.exposure.include: health,info` con `show-details: when-authorized`.

---

## 6. Despliegue en Producción (Docker Multi-Stage & Compose)

### 6.1 Matriz de Puertos DEV vs PROD

| Servicio | Puerto DEV | Puerto PROD | Propósito |
|---|---|---|---|
| **Oracle DB** | 1522:1521 | **41521:1521** | BD relacional aislada con volumen `oracle-data-prod` |
| **Oracle OEM** | - | **45500:5500** | Consola de administración Enterprise |
| **PostgreSQL Keycloak** | 35432:5432 | **45432:5432** | Base de datos de identidad |
| **Keycloak Auth** | 38081:8080 | **48080:8080** | Servidor de identidades OIDC |
| **Redis Cache** | 36379:6379 | **46379:6379** | Almacén de caché en memoria |
| **Sitra-Oro Backend** | 8081 (mvnw) | **48088:8080** | API REST empaquetada en Docker JRE 21 |
| **Sitra-Oro Frontend** | 4200 (ng serve) | **4300** (http-server) | SPA compilada con `environment.prod.ts` |

### 6.2 Guía de Despliegue Local en Producción

1. Crear archivo de credenciales seguras (nunca versionado en Git):
```powershell
Copy-Item lp2/sitra-oro-backend/.env.example lp2/sitra-oro-backend/.env
```
2. Levantar los contenedores de infraestructura y backend:
```powershell
cd lp2/sitra-oro-backend
docker compose up --build -d
```
3. Verificar endpoints seguros de producción:
```powershell
curl http://localhost:48088/actuator/health
# Retorna: {"status":"UP"}
curl http://localhost:48088/actuator/env
# Retorna: 401 Unauthorized (bloqueado por seguridad)
```
4. Compilar y servir la SPA optimizada:
```powershell
cd lp2/sitra-oro-frontend
npx ng build --configuration production
npx http-server dist/sitra-oro-frontend/browser -p 4300
```
5. Abrir en navegador: `http://localhost:4300`.
