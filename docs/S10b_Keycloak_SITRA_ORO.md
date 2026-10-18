# Integración de Keycloak en SITRA-ORO

## Alcance implementado

La guía del docente se adapta al backend real `lp2/sitra-oro-backend`.
Keycloak autentica; Spring Security valida firma RS256, emisor y vencimiento;
Oracle conserva las compras, recepciones, mineros, centros y relaciones del negocio.
No se copia la entidad Venta ni las reglas de VENDEDOR/SUPERVISOR de BomERP.

| Configuración | SITRA-ORO |
| --- | --- |
| Keycloak | `http://localhost:38081` |
| Realm exacto | `Sitra_oro` |
| Emisor | `http://localhost:38081/realms/Sitra_oro` |
| Cliente de laboratorio | `sitra-oro-prueba` |
| Backend / Swagger | `http://localhost:8081` / `http://localhost:8081/swagger-ui.html` |
| PostgreSQL de Keycloak | Servicio `keycloak-db`, base `sitra_keycloak` |

El perfil `dev,keycloak` reemplaza el login propio durante esta práctica:
no crea `JwtEncoder`, decodificador HS256 ni `TokenService`, y bloquea
`POST /api/v1/seguridad/login`. La aplicación obtiene las claves públicas
del realm a través del descubrimiento OIDC. Se activará con el script de arranque;
el perfil habitual `dev` conserva el acceso local para la SPA actual.

## 1. Configuración que realizarás en Keycloak

Entra a la **consola de administración de localhost:38081**, selecciona `Sitra_oro`
y confirma estos puntos. La URL de token no se abre en el navegador: se llama con POST.

1. **Realm roles:** puedes conservar los nombres de tus capturas. Se traducen así:

   | Rol de Keycloak aceptado | Rol aplicado por SITRA |
   | --- | --- |
   | `Minero` o `MINERO` | `MINERO` |
   | `acopiador` o `G2_ACOPIADOR` | `G2_ACOPIADOR` |
   | `Mayorista` o `G1_MAYORISTA` | `G1_MAYORISTA` |

2. **Clients → sitra-oro-prueba:** Client authentication Off; Direct access grants On
   para esta prueba; Standard flow On. Redirect URIs y post logout redirect URIs:
   `http://localhost:4200/*`; Web origins: `http://localhost:4200`. Guarda.

3. **Realm settings → User profile → Create attribute:** nombre `documentoIdentidad`;
   Display name `Documento de identidad SITRA`.
   En **Who can edit**, activa **Admin** y desactiva **User**.
   El usuario final no debe poder cambiar este vínculo a otra cuenta.
   Puedes permitir su visualización a Admin y User. Usa un valor de texto, no multivalor.

4. **Users:** cuenta habilitada, nombre y apellido completos, contraseña permanente
   (Temporary Off), sin acciones obligatorias para el laboratorio.
   Asigna un realm role de la tabla. En su atributo `documentoIdentidad`, coloca
   el **DNI/documento de su cuenta existente en SITRA**, no el username de demostración.
   Por ejemplo, `acopiador.demo1` es el login de Keycloak; su documento debe corresponder
   a la fila real del acopiador en `CUENTAS_ACCESO`.
   Si el perfil exige email, completa un correo de prueba válido. No necesitas
   modificar las tablas internas de PostgreSQL para configurar usuarios.

5. **Clients → sitra-oro-prueba → Client scopes → sitra-oro-prueba-dedicated →
   Add mapper → By configuration → User Attribute:**
   Name `documento-sitra`; User Attribute `documentoIdentidad`;
   Token Claim Name `documentoIdentidad`; Claim JSON Type `String`;
   Add to access token On; Multivalued Off. Guarda.
   Confirma también que el scope `roles` está asignado al cliente como Default:
   el access token debe contener `realm_access.roles`.

La cuenta local vinculada debe estar activa y tener el mismo rol que Keycloak.
Para el acopiador, SITRA exige su centro previamente asignado.
Puedes consultar los vínculos en Oracle sin mostrar hashes ni contraseñas:

```sql
SELECT DOCUMENTO_IDENTIDAD, ROL, ACTIVO, ID_MINERO, ID_CENTRO_ACOPIO_ASIGNADO
FROM CUENTAS_ACCESO
ORDER BY DOCUMENTO_IDENTIDAD;
```

## 2. Arrancar el backend adaptado

Con Keycloak y Oracle disponibles, abre PowerShell en
`E:\Cursos_Ciclo_4\Lenguaje de Programación II\Sitra_oro\lp2\sitra-oro-backend`:

```powershell
.\scripts\iniciar_keycloak.ps1
```

El script selecciona Java 21 y ejecuta Maven con los perfiles `dev,keycloak`.
Usa la conexión Oracle que ya tienes en `application-local.properties` o las
variables `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`.
Si otro backend está en 8081, detenlo desde su terminal antes de ejecutar este script.
No requiere editar Java ni YAML a mano.

Para otro servidor de Keycloak, configura `KEYCLOAK_ISSUER_URI` antes de arrancar.
El valor debe coincidir exactamente con el claim `iss` del token.

## 3. Probar con tu usuario de Keycloak

En otra terminal, desde esa misma carpeta:

```powershell
# El script solicita usuario y contraseña; no muestra el token.
.\scripts\probar_keycloak.ps1 -Rol G2_ACOPIADOR
# Para el módulo asignado Mayorista:
.\scripts\probar_keycloak.ps1 -Rol G1_MAYORISTA
```

Cada ejecución verifica emisión del token y una consulta real del rol seleccionado.
El resultado esperado es HTTP 200. Para MINERO usa `-Rol MINERO`.
Si quieres verificar otra ruta desde Swagger, pulsa **Authorize**, pega el token
de Keycloak sin el prefijo Bearer y ejecuta la consulta.

| Caso | Resultado esperado |
| --- | --- |
| Ruta protegida sin token | 401 |
| Acopiador activo en su módulo | 200, con su centro de Oracle |
| Acopiador en una ruta de Mayorista | 403 |
| Cuenta pendiente/inactiva, documento ausente o rol incompatible | 401 |
| Token expirado, firma ajena o emisor incorrecto | 401 |

`invalid_client` viene de Keycloak: revisa el cliente en ese realm.
`Invalid user credentials` viene de Keycloak: revisa cuenta/contraseña en esa instancia.
`Account is not fully set up` viene de Keycloak: revisa el perfil, email requerido,
acciones obligatorias y contraseña temporal.
Un 401 del backend con `invalid_token` puede indicar que falta el mapper del documento,
la cuenta de SITRA no existe, está pendiente o su rol no coincide.
Un 403 indica que el token fue autenticado pero esa ruta no permite su rol.

## 4. Datos e identidad

El `sub` de Keycloak permanece como UUID. Las consultas de perfil/entregas y los
ajustes de compra siguen usando `documentoIdentidad`, obtenido del vínculo validado.
No se sustituyen DNIs por UUIDs ni se reescribe el historial existente.

`roles`, `accountId` e `idCentroAcopio` del principal interno se calculan desde
la cuenta de Oracle. Se descarta un centro enviado en el JWT: no modifica el ámbito
del acopiador. Los roles auxiliares `offline_access` y `uma_authorization`
no conceden permisos de negocio.

No se borra el paquete seguridad ni `CUENTAS_ACCESO`: el código real también los usa
para aprobación presencial, relación con mineros y asignación de centros.
Las contraseñas/hash históricos no se consultan para autenticar en el perfil keycloak.
No existe una segunda BD Postgres de seguridad de SITRA que deba retirarse.

## 5. Alcance de Angular

Esta guía del docente termina en el backend y reserva el login SPA para S11.
El formulario Angular actual usa el login propio y no funciona contra el backend
arrancado con `keycloak`. Para esta práctica se usan PowerShell/Swagger.
La siguiente integración del frontend deberá redirigir a Keycloak mediante
Authorization Code + PKCE y desactivar Direct access grants en el cliente SPA.
El script de laboratorio no representa ese login final.

Para ejecutar el sistema actual con su login local, detén el proceso anterior y usa:

```powershell
.\mvnw.cmd spring-boot:run '-Dspring-boot.run.profiles=dev'
```

## Referencias

La integración cuenta con **20 pruebas de Keycloak aprobadas**.
El [detalle de verificación](keycloak/walkthrough.md) registra las comprobaciones,
los errores existentes de la suite general y lo pendiente de tu configuración real.

- [Guía del docente](https://262ciclo4.github.io/bomerp/lp2/sesiones/S10b_Seguridad_Backend_Keycloak/).
- [Spring Security: validación de JWT y descubrimiento del emisor](https://docs.spring.io/spring-security/reference/servlet/oauth2/resource-server/jwt.html).
- [Keycloak: perfiles de usuario y permisos de atributos](https://www.keycloak.org/docs/26.8.1/server_admin/).
