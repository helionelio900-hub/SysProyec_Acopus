# INFORME DE EVIDENCIA INDIVIDUAL — SESIÓN S02

## Datos generales

- **Estudiante:** Helio Paul Calisaya Faijo
- **Equipo:** 05 — SITRA-ORO
- **Curso:** Lenguaje de Programación II
- **Producto S02:** CRUD REST completo de `Minero`
- **Aporte:** DTOs, mapper, servicio, controlador, validaciones y pruebas web

## 1. Recurso principal del dominio

En SITRA-ORO el recurso principal de S02 es `Minero`; no se reutiliza el recurso `Producto` de
BOMERP. La entidad se persiste en `MINEROS` y el contrato REST está versionado en
`/api/v1/acopio/mineros`.

| Método | Ruta | Respuesta esperada |
|---|---|---|
| GET | `/api/v1/acopio/mineros` | 200 y lista |
| GET | `/api/v1/acopio/mineros/{id}` | 200 o 404 |
| POST | `/api/v1/acopio/mineros` | 201 |
| PUT | `/api/v1/acopio/mineros/{id}` | 200 o 404 |
| DELETE | `/api/v1/acopio/mineros/{id}` | 204, 404 o 409 si tiene relaciones |

## 2. DTO y validación

```java
public record MineroRequest(
    @NotBlank
    @Size(min = 8, max = 15)
    String documentoIdentidad,
    @NotBlank
    @Size(max = 150)
    String nombresApellidos,
    @Size(max = 20) String telefono,
    @Size(max = 100) String zonaProcedencia
) {}
```

La API no recibe ni devuelve directamente la entidad JPA. `MineroRequest` controla la entrada,
`MineroResponse` controla la salida y `MineroMapper` realiza la conversión. El identificador y
`fechaRegistro` se ignoran al crear la entidad para que los asigne la persistencia.

## 3. Capas y errores

```text
MineroController → MineroService → MineroRepository → Oracle
                 ↘ MineroMapper
```

El controlador solo atiende HTTP; el servicio contiene los casos de uso y la transacción; el
repositorio encapsula JPA. `ResourceNotFoundException` se traduce a 404, los DTO inválidos a 400
y los conflictos de integridad a 409 mediante `GlobalExceptionHandler`.

## 4. Evidencia reproducible

```powershell
$ok = @{
  documentoIdentidad="45892011"
  nombresApellidos="Juan Pérez"
  telefono="987654321"
  zonaProcedencia="La Rinconada"
} | ConvertTo-Json
Invoke-RestMethod -Method Post http://localhost:8081/api/v1/acopio/mineros -ContentType application/json -Body $ok

$mal = @{ documentoIdentidad="123"; nombresApellidos="" } | ConvertTo-Json
try {
  Invoke-RestMethod -Method Post http://localhost:8081/api/v1/acopio/mineros -ContentType application/json -Body $mal
} catch { "HTTP " + $_.Exception.Response.StatusCode.value__ }
```

Resultado: el primer caso devuelve 201 y el segundo 400. `MineroControllerTest` cubre crear,
listar, actualizar, eliminar, validación y 404. La suite integrada actual termina con 23 pruebas
exitosas.

## 5. Reflexión

Separar entidad, DTO y mapper evita exponer detalles de persistencia y permite evolucionar el
contrato HTTP. Las validaciones de forma se resuelven antes de entrar al servicio, mientras que
la existencia y los conflictos relacionados se resuelven en la capa de negocio/persistencia.
Esta estructura es más verificable y prepara la relación `Minero`–`TransaccionG2` de S03.
