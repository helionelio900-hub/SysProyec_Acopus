# SITRA-ORO · Backend Unidad I

Un proyecto Maven, Java 21, Spring Boot, JPA, Oracle y Spring Modulith.
Módulos: parametros, cotizador, acopiador y mayorista. JWT corresponde a U2/S10.

## Inicio reproducible

1. Configure `JAVA_HOME` hacia su JDK 21. Compruebe `./mvnw.cmd -version`.
2. Copie `application-local.properties.example` como `application-local.properties`
   y complete el usuario y la clave Oracle. Ese archivo está ignorado por Git.
   También puede configurar `DB_USERNAME`, `DB_PASSWORD` y `DB_URL` en el entorno.
3. Ejecute `./mvnw.cmd spring-boot:run` desde esta carpeta.
4. Abra [Swagger](http://localhost:8081/swagger-ui.html) y
   [salud](http://localhost:8081/actuator/health). La base debe indicar `Oracle` y `UP`.

Oracle XE instalado usa `localhost:1521/XEPDB1`. Como alternativa, Compose usa
`gvenzl/oracle-xe:21-slim` y publica **1522**: configure `DB_URL` o la URL del archivo
local como `jdbc:oracle:thin:@localhost:1522/XEPDB1`. Para iniciar el contenedor,
defina `ORACLE_PASSWORD` y `DB_PASSWORD` en un archivo `.env` ignorado por Git,
y ejecute `docker compose -f compose-dev.yml up -d`. El usuario es `BOMERP_APP`.
La creación de tablas para desarrollo usa `ddl-auto=update`; no es una estrategia
para migrar una base de producción.

## Pruebas

```powershell
.\mvnw.cmd test
# Oracle XE instalado localmente; requiere sqlplus y acceso OS / as sysdba:
.\scripts\probar_oracle.ps1
```

La primera suite usa H2 e incluye límites Modulith. La segunda crea un usuario
`SITRA_T_<identificador>` temporal en XEPDB1, ejecuta los casos de integración
con el driver Oracle y elimina exclusivamente ese usuario al terminar.
No configura `create-drop` en el esquema habitual de la aplicación.

Las pruebas verifican CRUD persistido, duplicados, asociación y FK, errores 400/404/409,
traceId, CORS, filtros combinados, orden, agregados vacíos y no vacíos, cálculos,
commit de cabecera/detalles y rollback después del primer descuento.

## Configuración y trazabilidad

- `CORS_ALLOWED_ORIGIN`: origen permitido (por defecto `http://localhost:4200`).
- `X-Trace-ID`: se devuelve en la respuesta y aparece en los logs de cada petición.
- Los errores incluyen `timestamp`, `status`, `error`, `message` y `traceId`;
  los errores de validación incluyen `campos`.
- Se aceptan identificadores de correlación de 1–64 caracteres alfanuméricos,
  punto, guion y guion bajo; los demás se reemplazan por un UUID.
- `application-local.properties` conserva valores privados locales. Si usa
  variables de entorno, retire de ese archivo las propiedades que quiere sustituir.

## Sustentación

Consulte [producto U1](../../docs/proyecto-integrador/u1/lp2-demo.md) y
[verificación U1](../../docs/proyecto-integrador/u1/verificacion-u1.md).
Los scripts `probar_exito_201.ps1` y `probar_rollback_409.ps1` son demostraciones
sobre la API activa: requieren stock abierto en cero y se detienen si hay lotes previos.
El rollback deja sus lotes de demostración abiertos; no lo repita sobre datos ajenos.
