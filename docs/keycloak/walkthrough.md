# Verificación de la integración Keycloak de SITRA-ORO

Fecha: 13 de octubre de 2026. Runtime: Java 21.0.12, Maven Wrapper.

## Resultado

La ejecución enfocada `mvnw.cmd -Dtest=Keycloak*Test test` terminó con
**BUILD SUCCESS: 20 pruebas, 0 fallos, 0 errores**.

| Comprobación | Resultado |
| --- | --- |
| Vínculo con cuentas activas, roles y centro de Oracle | 9 pruebas aprobadas |
| Descubrimiento OIDC y verificación real RS256, firma ajena, emisor y expiración | 4 pruebas aprobadas |
| Filtro HTTP: 200, 401, 403 y cierre del login propio | 5 pruebas aprobadas |
| Contexto completo con perfil keycloak: sin firmante/login local y perfil minero existente por DNI | 2 pruebas aprobadas |
| Sintaxis de ambos scripts PowerShell | 0 errores |

Se leyó el documento público del Keycloak existente en `localhost:38081`:
issuer `http://localhost:38081/realms/Sitra_oro`;
JWKS `http://localhost:38081/realms/Sitra_oro/protocol/openid-connect/certs`.
Esta lectura no modificó la configuración de Keycloak.

## Comparación con el código anterior

Se ejecutó también la suite completa y una copia temporal de HEAD anterior a los
cambios de integración. La copia se aisló de la carpeta del backend de trabajo.

| Ejecución | Pruebas | Fallos de aserción | Errores de ejecución |
| --- | --- | --- | --- |
| Código anterior | 52 | 2 | 11 |
| Código con integración, antes de agregar las 2 pruebas finales de contexto | 70 | 2 | 11 |

Los 13 casos fallidos coinciden por clase y método; no hubo casos fallidos adicionales.
Los problemas anteriores incluyen tablas ausentes en H2 (`SOL_ENTREGA_MINERO`,
`RECEPCION_ACUMULADA`), la expectativa de activación inmediata en una prueba minero
y violaciones de límites/ciclos Modulith. La suite general no está completamente aprobada.
Las 2 pruebas finales de contexto se incluyeron en la ejecución enfocada aprobada de 20.

## Revisión de seguridad

Se aplicó la revisión propuesta por los skills de verificación de seguridad.
El escáner automático SecureCoder no estaba disponible: no existía su archivo
`api.json` ni la variable de puerto. No se afirma que se ejecutó un escaneo automático.

En la revisión manual se comprobó que los tokens de Keycloak pasan primero por
validación criptográfica y del emisor; el conversor requiere el documento firmado,
una cuenta activa y un rol coincidente. El centro y los permisos internos se obtienen
de Oracle, sin aceptar la asignación de centro enviada por el token.
Los scripts solicitan la contraseña de forma oculta y no guardan contraseñas/tokens
en archivos. Las claves privadas de las pruebas se generan temporalmente en memoria.

El vínculo `documentoIdentidad` debe tener permisos de edición **solo Admin** en
Keycloak. Esa configuración externa es necesaria para impedir que el usuario final
cambie su vínculo a otra cuenta; está detallada en la guía de instalación.

## Pendiente del entorno real

La emisión con los usuarios reales, su mapper de documento y las consultas Oracle
de punta a punta se comprobarán cuando termines tu configuración en Keycloak.
Las pruebas de cuentas/HTTP usaron H2 o servicios simulados; las de firma usaron un
realm OIDC temporal. No sustituyen la comprobación con tus credenciales y datos reales.
El login Angular por Authorization Code + PKCE corresponde a S11 en la guía recibida.
