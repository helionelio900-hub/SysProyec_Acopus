# SITRA-ORO · Backend

Un proyecto Maven, Java 21, Spring Boot, JPA, Oracle y Spring Modulith.
Módulos: seguridad, minero, parametros, cotizador, acopiador y mayorista.

## Inicio reproducible

1. Configure `JAVA_HOME` hacia su JDK 21. Compruebe `./mvnw.cmd -version`.
2. Copie `application-local.properties.example` como `application-local.properties`
   y complete el usuario y la clave Oracle. Ese archivo está ignorado por Git.
   También puede configurar `DB_USERNAME`, `DB_PASSWORD` y `DB_URL` en el entorno.
3. En una base ya instalada con `../../bd2/S01_03_tablas_bomerp_app.sql`, ejecute una sola vez
   `../../bd2/S07_01_tablas_minero_seguridad.sql` en el mismo usuario Oracle.
4. Si es una instalación nueva, ejecute `../../bd2/S08_01_recepciones_mayorista.sql`.
   Si ya ejecutó la versión anterior de ese script, revise y ejecute
   `../../bd2/S08_02_vincular_recepciones_centro.sql` para agregar la relación con centros existentes.
5. Configure las variables seguras de inicio de sesión indicadas abajo y ejecute
   `./mvnw.cmd spring-boot:run` desde esta carpeta.
6. Abra [Swagger](http://localhost:8081/swagger-ui.html) y
   [salud](http://localhost:8081/actuator/health). La base debe indicar `Oracle` y `UP`.

Oracle XE instalado usa `localhost:1521/XEPDB1`. Como alternativa, Compose usa
`gvenzl/oracle-xe:21-slim` y publica **1522**: configure `DB_URL` o la URL del archivo
local como `jdbc:oracle:thin:@localhost:1522/XEPDB1`. Para iniciar el contenedor,
defina `ORACLE_PASSWORD` y `DB_PASSWORD` en un archivo `.env` ignorado por Git,
y ejecute `docker compose -f compose-dev.yml up -d`. El usuario es `BOMERP_APP`.
Hibernate valida el esquema (`ddl-auto=validate`); las tablas nuevas y sus relaciones
se incorporan mediante los scripts S07 y S08, no con cambios automáticos al arrancar.

Para la primera cuenta mayorista, establezca en la misma sesión de PowerShell antes
de iniciar el backend:

```powershell
$sitraJwtBytes = New-Object byte[] 32
[Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($sitraJwtBytes)
$env:SITRAORO_JWT_SECRET = [Convert]::ToBase64String($sitraJwtBytes)
$env:SITRAORO_BOOTSTRAP_MAYORISTA_DOCUMENTO = 'documento-del-mayorista'
$env:SITRAORO_BOOTSTRAP_MAYORISTA_CLAVE = 'una-clave-larga-y-segura'
```

La cuenta se crea una sola vez si ese documento aún no tiene cuenta. La clave JWT
de desarrollo generada así cambia al cerrar la sesión; para un entorno persistente,
guarde una clave Base64 aleatoria de 32 bytes en el gestor seguro de secretos.

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
- `SITRAORO_JWT_SECRET`: clave Base64 de al menos 32 bytes para firmar tokens fuera de desarrollo.
- `SITRAORO_BOOTSTRAP_MAYORISTA_DOCUMENTO` y `SITRAORO_BOOTSTRAP_MAYORISTA_CLAVE`:
  credenciales iniciales del mayorista; no se guardan en Git.
- `POST /api/v1/seguridad/login`: inicio de sesión con documento y clave.
- `POST /api/v1/mayorista/centros-acopio`: el mayorista crea un centro y la cuenta del acopiador.
- `GET/POST /api/v1/mayorista/recepciones`: consulta y registra pesos separados rojo/verde y datos manuales.
- `PUT/DELETE /api/v1/mayorista/recepciones/{id}`: actualiza o elimina un registro de recepción.
- `GET /api/v1/publico/centros-acopio`: lista pública de centros activos para el registro minero.
- `POST /api/v1/minero/registro`: crea la cuenta y enlaza el centro preferido.
- `GET /api/v1/minero/perfil` y `PATCH /api/v1/minero/perfil/centro-acopio`: requieren token de minero.
- Una cuenta ligada a un minero existente queda pendiente hasta la validación presencial
  en el centro elegido; el acopiador la activa desde `/api/v1/acopio/mineros/cuentas-pendientes`.
- La cotización pública no crea una compra ni reserva el precio; el registro de compra
  permanece en el módulo Acopio.
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
