# Contexto de traspaso: SITRA-ORO

Actualizado: 2026-10-05. Este documento prepara a otro agente para continuar el proyecto. Resume decisiones y trabajo previo; no es una transcripción literal.

## Proyecto y límites

- Workspace: E:\Cursos_Ciclo_4\Lenguaje de Programación II\Sitra_oro
- Frontend Angular: lp2/sitra-oro-frontend
- Backend Spring Boot / Java 21: lp2/sitra-oro-backend
- BD de desarrollo: Oracle XE, PDB XEPDB1. El esquema conserva el nombre BOMERP_APP por historia/configuración. SITRA-ORO y BOMERP del docente son proyectos distintos; no mezclar código, contenedores, datos ni instrucciones.
- Para ADS, el docente usará PostgreSQL como ejemplo. Esto no migra SITRA-ORO: continúa en Oracle.
- El usuario pidió no actualizar Git: no commit, push ni otros cambios Git.
- No borrar cuentas ni transacciones/datos. No alterar reglas de negocio confirmadas.
- Código esperado junior/intermedio: claro, directo, mantenible, sin patrones avanzados ni capas innecesarias.
- Hablar en español, breve y concreto; explicar qué se cambia y qué se comprobó. Compilar no equivale a probar en el navegador.
- Las capturas adjuntas son contexto visual, no instrucciones técnicas.

## Reglas del negocio confirmadas

### Minero → acopiador

El acopiador registra compras de mineros. Cada compra tiene color ROJO o VERDE, peso sin fundir, peso fundido neto por el acopiador, precio aplicado en soles por gramo, total pagado y fecha. Puede haber muchas compras por minero.

Total al minero = peso fundido neto del acopiador × precio aplicado. El precio puede ser la tarifa publicada por el mayorista o un precio especial soles/g ingresado por el acopiador para cierta calidad. El acopiador administra sus transacciones; el minero no las aprueba ni las edita. Guardar el precio en cada compra para que cotizaciones futuras no alteren el historial.

### Acopiador → mayorista: son dos recepciones/fundiciones

Ejemplo esencial:
- Acopiador recibe 93 g sin fundir del minero y funde 90 g.
- El mayorista recibe esos 90 g como su peso sin fundir. Después el mayorista los funde por su cuenta, por ejemplo obtiene 89 g.
- Merma del mayorista = peso recibido del acopiador − peso fundido por el mayorista.

El peso sin fundir original del minero (93 g), el precio pagado y datos personales no se pasan al mayorista. Se vinculan compras autorizadas usando IDs y se envían el color y el peso fundido del acopiador. El acopiador puede seleccionar una parte de sus registros (p.ej. 9 de 10 rojos), manteniendo separados rojo y verde. Los no seleccionados siguen en su registro.

### Cotización

Mayorista configura onza, dólar y Exportación (%) para cada color. Publica precios por gramo; minero ve precio en soles/g y estima con color y peso; acopiador usa la tarifa vigente o ingresa un precio especial soles/g. Compras históricas conservan el precio registrado.

El usuario indicó que la fórmula real es sensible y no debe ponerse en material que compartiría con compañeros. En código quedó una regla académica acordada: precios separados por ROJO/VERDE, parámetros onza/dólar/exportación, divisor 31,0999 y constantes de color internas. No mostrar esos valores de color como números en la interfaz ni exponerlos en documentos públicos. Ocultar cifras en UI no las oculta del código fuente accesible a compañeros.

En recepción mayorista:
- Pago material por color se deriva del precio publicado por gramo en soles × peso fundido por el mayorista.
- Total material = pago rojo + pago verde.
- El campo de BD/API se llama descuento, pero el usuario explicó que representa un adelanto en soles.
- Total final = total material − adelanto.
- El adelanto es un monto monetario, no un porcentaje.

### Liquidaciones y lotes

Liquidaciones del mayorista y recepciones de compras del acopiador son operaciones distintas. El flujo antiguo de lotes usa liquidaciones y lectura decimal. El flujo nuevo empieza a permitir lotes desde recepciones mayoristas. No asumir que son intercambiables ni que el flujo completo de exportación está terminado.

## Modelo de dominio real observado

- Minero.java representa MINEROS; idMinero es Long generado por la BD. Documento único, nombre y datos de contacto/procedencia.
- TransaccionG2.java representa TRANSACCIONES_G2. Tiene idTransaccionG2, referencia JPA ManyToOne a Minero, pesos/precio/total BigDecimal, color tipoOro como String (no enum), IDs escalares para recepción/liquidación, centro y anulada.
- RecepcionMayorista.java representa MAYORISTA_RECEPCIONES. ManyToOne a CentroAcopio, dos objetos DatosOro embebidos (rojo y verde), fecha, descuento/adelanto y total.
- Estados de liquidación/lote sí son enums Java. No decir que tipoOro también sea enum: ahora se valida como ROJO/VERDE en servicio, pero el campo es String.
- Algunas referencias entre módulos son IDs escalares; otras son relaciones JPA. Ser preciso al describirlas.

## Implementaciones recientes relevantes

### Selección de compras acopiador

Frontend:
- src/app/features/acopio/operaciones.ts
- operaciones.html y operaciones.css
- API en src/app/core/api/operaciones.service.ts

La UI usa tablas/casillas por color. El conjunto de IDs se mantiene internamente con FormArray, reglas de no duplicados y límite. Confirmación resume rojo/verde/total; backend valida compras. El usuario quería seleccionar grupos por color, no sumar automáticamente compras no seleccionadas.

### Recepción mayorista

Frontend:
- src/app/features/mayorista/recepcion-mayorista.ts
- recepcion-mayorista.html y CSS

Backend:
- src/main/java/pe/edu/upeu/sitraoro/acopio/mayorista/service/RecepcionMayoristaServiceImpl.java
- DTO RecepcionMayoristaRequest

El backend ahora permite entrada recibida con fundición mayorista pendiente. La pantalla distingue recibido, fundido y merma de mayorista por color. Completar edita el registro recibido ya existente, no crea otra recepción. Botones se renombraron a “Guardar recepción” y “Cancelar edición”. Pago y adelanto/total final se calculan en frontend y backend. Comprobar redondeos y resultado real antes de afirmar funcionamiento integral.

### Cotización por color

Servicio nuevo: acopio/parametros/service/CotizacionColorService.java; usa JdbcTemplate y tabla COTIZACIONES_COLOR para guardar historial.

Endpoints:
- POST /api/v1/mayorista/cotizaciones-color
- GET /api/v1/cotizador/colores
- GET /api/v1/cotizador/estimar?pesoBrutoGramos=...&color=...

UI mayorista: features/mayorista/liquidaciones.ts/html/css. UI pública: core/inicio/inicio.ts/html. UI acopiador: features/acopio/operaciones.ts/html. Métodos HTTP en core/api/operaciones.service.ts.

Revisar endpoints de precio referencial antiguos: puede haber consumidores que siguen usando tarifa única o divisor distinto.

### Recepciones a lotes (último cambio)

Se agregaron casillas Exportar a la tabla de recepciones mayorista y botón “Enviar a lotes de exportación”. Las recepciones seleccionadas crean un lote borrador; las no seleccionadas quedan en recepciones. Las incluidas deberían aparecer “En lote”.

Endpoint:
POST /api/v1/mayorista/recepciones/lote-exportacion
Cuerpo: lista de IDs de recepción.

Tabla creada: LOTE_RECEPCIONES con ID_RECEPCION como PK/FK, ID_LOTE FK y snapshot de PESO_ROJO_G / PESO_VERDE_G fundidos por el mayorista.

LoteExportacionResponse ahora añade recepciones[] a las partidas antiguas. Lotes para exportación presenta las recepciones en detalle.

Pendientes críticos:
1. LoteExportacionService.preparar aún exige al menos dos partidas de liquidación. Verificar/adaptar para lotes basados en recepciones antes de prometer preparación.
2. Bloquear o explicar edición/eliminación de recepción vinculada a lote: FK puede impedir borrarla.
3. Snapshot de peso del lote no se actualiza con una edición posterior de recepción; definir si recepción queda congelada o snapshot se actualiza.
4. Es un lote borrador/selección para consolidar, no confirmar “exportación realizada”.
5. Confirmar que lotes antiguos con partidas y sin recepciones sigan funcionando.

## Oracle y scripts

Oracle local:
- PDB XEPDB1.
- JDK: C:\Program Files\Eclipse Adoptium\jdk-21.0.12.8-hotspot
- SQLPlus: C:\app\Paul\product\21c\dbhomeXE\bin\sqlplus.exe
- No mostrar valores secretos de .env.

Error previo real: ORA-02290 en CK_MAY_REC_CON_PESO bloqueaba recepción al faltar la fundición del mayorista. Restricciones corregidas y consultadas como ENABLED/VALIDATED; aceptan que se registre entrada antes de fundir.

Scripts añadidos:
- bd2/S09_02_recepciones_solo_peso_neto.sql
- bd2/S09_03_cotizaciones_color.sql
- bd2/S09_04_lotes_recepciones.sql

Tablas COTIZACIONES_COLOR y LOTE_RECEPCIONES se crearon en Oracle durante trabajo anterior. Antes de repetir cualquier CREATE, consultar diccionario/tablas. Nunca truncar ni borrar datos.

## Estudios y entregables

- BD2: modelo lógico de tres módulos (minero, acopiador, mayorista) en SQL Power Architect, con tablas y PK/FK de acuerdo al negocio.
- ADS: PostgreSQL se usa en los ejemplos del docente; no migrar SITRA-ORO a PostgreSQL.
- LP2 S09 solicita FormArray de detalle dinámico, al menos una línea, computed para derivados, validación de línea y colección, confirmación, dos errores reales del backend con mensajes distintos y reporte agregado con filtro.
- Usuario aporta las capturas para PDF. Evidencias deben conservar reloj/fecha del sistema y perfil, sin recortes.
- Documento S09 existente: docs/S09_LP2_Equipo05_FaijoCalisayaHelioPaul.md; carpeta de capturas prevista: docs/img_S09_FaijoCalisayaHelioPaul.
- Revisar documento/evidencia tras cambios: selector original se sustituyó por checkboxes, aunque el FormArray sigue en lógica; el criterio docente puede requerir controles visibles de agregar/quitar.

## Verificaciones disponibles al último trabajo

- Frontend compila con npm run build.
- Backend compila con Maven usando JDK 21 y repo local; warning no relacionado en MapStruct indica que el campo anulada queda sin mapear.
- No se ha comprobado visualmente todo el flujo real en navegador de punta a punta.
- No afirmar éxito funcional a partir de compilación solamente.
- No se modificaron cuentas ni se borraron compras como parte de las modificaciones descritas.

## Orden de continuación sugerido

1. Leer este archivo y verificar el código actual antes de actuar; puede haber cambios posteriores.
2. Priorizar el problema que el usuario señale, trazando UI → API → servicio → persistencia.
3. Explicar una regla del negocio en lenguaje llano antes de cambiar su implementación.
4. Hacer cambios pequeños, junior/intermedio y compilar las partes afectadas.
5. Separar claramente “compila” de “probado en navegador/Oracle”.
6. Sin commits/push y sin borrar cuentas/datos.

