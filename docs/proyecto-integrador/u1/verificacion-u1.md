# Evidencia de verificación U1

Fecha: 13 de septiembre de 2026. Verificación local del código y del Oracle XE
disponible en el equipo. Esta evidencia técnica no asigna una nota a la exposición.

## Oracle real

Comando desde `lp2/sitra-oro-backend` con Java 21:

```powershell
.\scripts\probar_oracle.ps1
```

Resultado obtenido:

```text
Tests run: 9, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
Oracle + DDL e índices BD2: CRUD, validación, CORS, consultas, commit y rollback verificados.
```

La ejecución usa el driver Oracle y un esquema temporal en XEPDB1. Se instalan S01_03_tablas_bomerp_app.sql y S05_indices.sql de BD2; Hibernate arranca con ddl-auto=validate, sin crear ni alterar tablas. Incluye:

- Alta, lectura, actualización y eliminación persistidas; duplicado 409.
- Asociación minero–compra y protección FK al intentar borrar el minero.
- Errores de entrada, traceId y CORS permitido/rechazado.
- Cabecera con dos detalles, total calculado y lotes vinculados.
- Error en el segundo color: cero cabeceras/detalles persistidos y primer lote libre.
- Filtros combinados, orden, suma, promedio y reporte vacío.

El script elimina su esquema temporal al finalizar. El stock de la aplicación
no se utiliza para estos casos. La prueba por MockMvc recorre controladores,
servicios y repositorios reales; no es una prueba de navegador ni de carga.

## Evidencia en la API activa

Se comprobó `/actuator/health` con base `Oracle` y estado `UP`, OpenAPI con HTTP 200,
consultas y resumen HTTP 200, CORS para `http://localhost:4200` permitido y
`http://localhost:4300` rechazado. Estas consultas no cierran lotes existentes.

## Requisitos que dependen del equipo

- Publicar la documentación y registrar su URL accesible.
- Revisar y registrar los cambios en commits atribuibles a sus autores.
- Completar la tabla de aporte individual y practicar la sustentación.
- Mostrar al docente los resultados actuales al ejecutar los comandos.

La fórmula sobre 20, con pesos porcentuales y A=20/B=15/C=10/D=5, es
`suma(peso × puntos) / 100`. No corresponde multiplicar otra vez por 20.

## Suite completa

Ejecutada con Java 21 mediante `./mvnw.cmd test`:

```text
Tests run: 29, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
```

Incluye los casos H2 y la verificación de Spring Modulith. Las 9 pruebas Oracle
son una ejecución adicional de los casos de integración con otro motor;
no deben presentarse como 38 casos diferentes.

## Documentación y comprobación final

`mkdocs build --strict` terminó correctamente. El sitio está generado en `site/`
y su configuración está en `mkdocs.yml`; no se ha publicado en un remoto.
La API activa devolvió 400 con `traceId=u1-verificacion-final` y el mapa `campos`.
El stock original continuó en 100 g ROJO y 50 g VERDE. La consulta administrativa
confirmó cero usuarios temporales `SITRA_T_*` después de las pruebas.
