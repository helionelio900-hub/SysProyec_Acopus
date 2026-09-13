# SITRA-ORO — Arranque para el equipo (U1/S06)

Este procedimiento levanta solamente el alcance S1–S5: Oracle y el backend REST.
Se necesitan dos terminales. No incluye JWT, frontend ni observabilidad avanzada.

## 0. Requisitos

| Herramienta | Comprobación |
|---|---|
| Docker Desktop | `docker version` |
| JDK 21 | `java -version` |
| Git | `git --version` |

Maven no se instala globalmente: el proyecto incluye `mvnw.cmd`.

## 1. Base de datos Oracle XE

```powershell
cd lp2\sitra-oro-backend
docker compose -f compose-dev.yml up -d
docker compose -f compose-dev.yml ps
```

Espere hasta que `bomerp-oracle` aparezca como `healthy`. El entorno académico local usa:

- PDB: `XEPDB1`
- usuario: `BOMERP_APP`
- contraseña local: `123456`
- puerto: `1521`

Hibernate usa `ddl-auto: update` y crea/actualiza las cinco tablas del usuario ejecutor a partir
de las entidades. El volumen `oracle-data` conserva los datos.

## 2. Índices y datos iniciales de S5

Después de arrancar el backend una primera vez:

```powershell
docker cp ..\..\bd2\S05_indices.sql bomerp-oracle:/tmp/indices.sql
docker cp ..\..\bd2\S05_seed_demo.sql bomerp-oracle:/tmp/seed.sql
docker exec bomerp-oracle sqlplus -S BOMERP_APP/123456@//localhost:1521/XEPDB1 @/tmp/indices.sql
docker exec bomerp-oracle sqlplus -S BOMERP_APP/123456@//localhost:1521/XEPDB1 @/tmp/seed.sql
```

El seed es idempotente para parámetros y mineros. Las compras y liquidaciones se crean mediante
la API durante la demostración.

## 3. Backend

En la primera terminal:

```powershell
cd lp2\sitra-oro-backend
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=dev"
```

Está listo cuando aparece `Started SitraOroBackendApplication`.

| Recurso | URL |
|---|---|
| API | `http://localhost:8081` |
| Swagger | `http://localhost:8081/swagger-ui.html` |
| Salud | `http://localhost:8081/actuator/health` |

## 4. Pruebas automatizadas

En la segunda terminal:

```powershell
cd lp2\sitra-oro-backend
.\mvnw.cmd test
```

Resultado esperado:

```text
Tests run: 23, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
```

Incluye pruebas web, cálculos, validación, verificación de Spring Modulith y dos pruebas de
integración del servicio cabecera-detalle.

## 5. Secuencia corta para S06

### 5.1 Salud, CRUD y validación

```powershell
Invoke-RestMethod http://localhost:8081/actuator/health
Invoke-RestMethod http://localhost:8081/api/v1/acopio/mineros

$invalido = @{ documentoIdentidad="123"; nombresApellidos="" } | ConvertTo-Json
try {
    Invoke-RestMethod -Method Post http://localhost:8081/api/v1/acopio/mineros -ContentType application/json -Body $invalido
} catch {
    "HTTP " + $_.Exception.Response.StatusCode.value__
}
```

La última petición debe devolver HTTP 400.

### 5.2 Objeto relacionado

```powershell
Invoke-RestMethod http://localhost:8081/api/v1/acopio/mineros/1/transacciones
```

### 5.3 Cabecera-detalle: éxito y rollback

```powershell
.\scripts\probar_exito_201.ps1
.\scripts\probar_rollback_409.ps1
```

Ejecute estos scripts sobre una base de demostración sin stock abierto; ambos abortan antes de
modificar datos si detectan lotes previos. El primero registra compras G2 y crea una liquidación
HTTP 201. El segundo provoca el fallo en el segundo color y comprueba que el primer lote siga sin
liquidar.

### 5.4 Filtros y reporte S5

```powershell
Invoke-RestMethod "http://localhost:8081/api/v1/mayorista/liquidaciones?estado=REGISTRADA&ordenarPor=totalPagadoG2Pen&direccion=ASC"
Invoke-RestMethod http://localhost:8081/api/v1/mayorista/liquidaciones/resumen
```

## 6. Apagar

Detenga el backend con `Ctrl+C` y luego:

```powershell
cd lp2\sitra-oro-backend
docker compose -f compose-dev.yml down
```

`down -v` también elimina el volumen y todos los datos; úselo solo si necesita empezar de cero.

## Problemas comunes

| Síntoma | Solución |
|---|---|
| `ORA-12541` | Oracle aún no está `healthy`; espere y vuelva a iniciar el backend |
| `mvnw.cmd` no reconocido | Entre a `lp2\sitra-oro-backend` |
| Maven usa Java 8/17 | Configure `JAVA_HOME` hacia el JDK 21 y abra otra terminal |
| Puerto 1521 ocupado | Detenga el Oracle local o cambie el mapeo de `compose-dev.yml` |
