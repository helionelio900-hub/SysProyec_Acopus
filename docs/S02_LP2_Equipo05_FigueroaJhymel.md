# INFORME DE EVIDENCIA INDIVIDUAL — SESIÓN S02

## Datos generales

- **Estudiante:** Jhymel Nelio Figueroa Chambi
- **Equipo:** 05 — SITRA-ORO
- **Curso:** Lenguaje de Programación II
- **Producto S02:** CRUD REST completo de `Minero`
- **Aporte:** persistencia Oracle, respuestas REST, manejo global de errores y verificación

## 1. Adaptación de la sesión al dominio

El ejemplo `Producto` de BOMERP se usó solo como referencia didáctica. El recurso real de
SITRA-ORO es `Minero`, persistido en la tabla `MINEROS` del usuario `BOMERP_APP` en `XEPDB1`.

| Método | Ruta | Caso de uso |
|---|---|---|
| GET | `/api/v1/acopio/mineros` | Listar |
| GET | `/api/v1/acopio/mineros/{id}` | Obtener uno |
| POST | `/api/v1/acopio/mineros` | Crear |
| PUT | `/api/v1/acopio/mineros/{id}` | Actualizar |
| DELETE | `/api/v1/acopio/mineros/{id}` | Eliminar |

## 2. Persistencia y contrato

La entidad usa identidad Oracle para `ID_MINERO`, documento único y fecha automática. El DTO de
entrada exige documento de 8 a 15 caracteres y nombre obligatorio. `MineroResponse` devuelve el
identificador y la fecha generados sin exponer la entidad.

```java
@Mapper(componentModel = "spring")
public interface MineroMapper {
    @Mapping(target = "idMinero", ignore = true)
    @Mapping(target = "fechaRegistro", ignore = true)
    Minero toEntity(MineroRequest request);
    MineroResponse toResponse(Minero minero);
}
```

La arquitectura aplicada es:

```text
HTTP → MineroController → MineroService → MineroRepository → Oracle XEPDB1
                              ↘ MineroMapper
```

## 3. Respuestas y errores

- alta correcta: HTTP 201;
- consulta o actualización correcta: HTTP 200;
- eliminación correcta: HTTP 204;
- JSON inválido: HTTP 400;
- identificador inexistente: HTTP 404;
- documento duplicado o eliminación con relaciones: HTTP 409.

`GlobalExceptionHandler` conserva un formato consistente con `timestamp`, `status`, `error` y
`message`. `CorrelationIdFilter` agrega `X-Trace-ID` para relacionar la petición con el log.

## 4. Evidencia de prueba

```powershell
Invoke-RestMethod http://localhost:8081/api/v1/acopio/mineros
Invoke-RestMethod http://localhost:8081/api/v1/acopio/mineros/1

$mal = @{ documentoIdentidad="1"; nombresApellidos="" } | ConvertTo-Json
try {
  Invoke-RestMethod -Method Post http://localhost:8081/api/v1/acopio/mineros -ContentType application/json -Body $mal
} catch { "HTTP " + $_.Exception.Response.StatusCode.value__ }
```

`MineroControllerTest` verifica las cinco operaciones del CRUD, el rechazo 400 y la respuesta
404. La suite completa actual ejecuta 23 pruebas sin fallos e incluye `ModularityTests`.

## 5. Hallazgo y conclusión

El riesgo inicial era copiar literalmente el CRUD `Producto` del proyecto docente. Eso habría
dejado nombres, campos y reglas ajenos a SITRA-ORO. Se mantuvo el patrón de capas, pero se adaptó
el modelo a `Minero`, su documento único y su rol posterior como cabecera relacionada de las
compras G2. Así S02 queda conectado de forma natural con S03.
