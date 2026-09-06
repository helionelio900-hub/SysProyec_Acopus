# SITRA-ORO — Arranque para el equipo

Todo es **copiar y pegar** en **PowerShell** (Windows). En orden.
Necesitas 3 terminales abiertas al final (Oracle+obs, backend, verificaciones).

---

## 0. Instalar una sola vez

| Herramienta | Link | Comprobar |
|---|---|---|
| Docker Desktop (con WSL2) | https://www.docker.com/products/docker-desktop | `docker version` |
| JDK 21 (Temurin) | https://adoptium.net/temurin/releases/?version=21 | `java -version` → 21 |
| Git | https://git-scm.com/download/win | `git --version` |

No hace falta instalar Maven (viene `mvnw.cmd`) ni Oracle (corre en Docker).

---

## 1. Clonar

```powershell
git clone https://github.com/helionelio900-hub/SysProyec_Acopus.git
cd SysProyec_Acopus
```

---

## 2. Base de datos — Oracle XE en Docker

```powershell
cd lp2\bomerp-backend
docker compose -f compose-dev.yml up -d
```

La primera vez baja ~2 GB y tarda 2-4 min. Espera a que diga **(healthy)**:

```powershell
docker compose -f compose-dev.yml ps
```

### Cómo se "replica" la base de datos

No se restaura ningún dump. El contenedor `gvenzl/oracle-xe:21-slim` levanta
**Oracle XE 21c** con:

- PDB **`XEPDB1`** (lo que espera `application-dev.yml`)
- usuario **`BOMERP_APP`** / contraseña `123456`

Las **5 tablas se crean solas** cuando arranca el backend (paso 4): Hibernate
está en modo `ddl-auto: update` y genera el esquema a partir de las entidades
Java. El volumen `oracle-data` conserva los datos entre reinicios del contenedor.
Para empezar de cero: `docker compose -f compose-dev.yml down -v`.

---

## 3. Observabilidad — Prometheus + Loki + Promtail

```powershell
cd ..\obs
docker compose -f compose-dev.yml up -d
docker compose -f compose-dev.yml ps
```

| Servicio | URL |
|---|---|
| Prometheus | http://localhost:39090 |
| Loki (API) | http://localhost:33100 |

---

## 4. Backend  (deja ESTA terminal abierta corriendo)

```powershell
cd ..\bomerp-backend
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=dev"
```

Listo cuando imprime **`Started SitraOroBackendApplication`**.

| | |
|---|---|
| API | http://localhost:8081 |
| Swagger | http://localhost:8081/swagger-ui.html |

---

## 5. Datos de demo  (opcional — OTRA terminal, en la raíz del repo)

```powershell
docker cp bd2\S05_indices.sql   bomerp-oracle:/tmp/ix.sql
docker cp bd2\S05_seed_demo.sql bomerp-oracle:/tmp/seed.sql
docker exec bomerp-oracle sqlplus -S BOMERP_APP/123456@//localhost:1521/XEPDB1 "@/tmp/ix.sql"
docker exec bomerp-oracle sqlplus -S BOMERP_APP/123456@//localhost:1521/XEPDB1 "@/tmp/seed.sql"
```

`S05_indices.sql` crea los índices de los filtros de S5; `S05_seed_demo.sql`
carga un parámetro del sistema y 2 mineros. Las transacciones y liquidaciones
se generan en la demo con la API (paso 6.3).

---

## 6. Verificaciones  (OTRA terminal)

### 6.1 Pruebas — 16 tests, incluye `ModularityTests`

```powershell
cd lp2\bomerp-backend
.\mvnw.cmd test
```

Esperado: `Tests run: 16, Failures: 0, Errors: 0`.

### 6.2 Endpoints

```powershell
Invoke-RestMethod http://localhost:8081/actuator/health
Invoke-RestMethod http://localhost:8081/api/v1/acopio/mineros
Invoke-RestMethod "http://localhost:8081/api/v1/cotizador/estimar?pesoBrutoGramos=100"
Invoke-RestMethod http://localhost:8081/api/v1/mayorista/liquidaciones
Invoke-RestMethod http://localhost:8081/api/v1/mayorista/liquidaciones/resumen
```

### 6.3 Cabecera-detalle + rollback (comunicación Mayorista → Acopiador)

```powershell
$rollback = @{ nombreAcopiadorG2="Demo"; cotizacionOnzaUsd=2650; tipoCambioUsdPen=3.75
              detalles=@(@{tipoOro="VERDE"; pesoFundidoG=999999}) } | ConvertTo-Json -Depth 5
try { Invoke-RestMethod -Method Post http://localhost:8081/api/v1/mayorista/liquidaciones -ContentType application/json -Body $rollback }
catch { "HTTP " + $_.Exception.Response.StatusCode.value__ }
```

Esperado: `HTTP 409` y **ninguna** fila guardada (rollback de cabecera + detalle).

### 6.4 Prometheus

Navegador: http://localhost:39090/targets → `host.docker.internal:8081` debe estar **UP**.
(`:8080` sale DOWN — es normal, solo corre 1 instancia.)

```powershell
Invoke-RestMethod "http://localhost:39090/api/v1/query?query=up{job=`"bomerp-backend`"}"
```

### 6.5 Loki (logs)

```powershell
$loki = "http://localhost:33100/loki/api/v1/query_range"
$q = '{application="bomerp-backend"} |= "Started SitraOroBackendApplication"'
Invoke-RestMethod -Uri $loki -Body @{ query = $q; limit = 5 } | ConvertTo-Json -Depth 8
```

Esperado: `"status": "success"` con la línea de arranque del backend.

---

## 7. Apagar todo

```powershell
# Ctrl+C en la terminal del backend, luego:
cd lp2\obs           ; docker compose -f compose-dev.yml down
cd ..\bomerp-backend ; docker compose -f compose-dev.yml down
```

Para borrar también la base de datos: agrega `-v` al último comando.

---

## Puertos

| Servicio | Puerto |
|---|---|
| Backend | 8081 |
| Oracle XE | 1521 (PDB `XEPDB1`) |
| Prometheus | 39090 |
| Loki | 33100 |
| Promtail | 9080 |

## Problemas comunes

| Síntoma | Causa / arreglo |
|---|---|
| Backend: `ORA-12541` / `Connection refused` | Oracle todavía no está `(healthy)`. Espera y reintenta el paso 4. |
| Prometheus `:8081` DOWN | El backend no está corriendo, o Docker no resuelve `host.docker.internal` (Docker Desktop lo trae por defecto). |
| `mvnw.cmd` no reconocido | Estás fuera de `lp2\bomerp-backend`. |
| Puerto 1521 ocupado | Tienes otro Oracle local. Deténlo o cambia el mapeo de puerto en `compose-dev.yml`. |
