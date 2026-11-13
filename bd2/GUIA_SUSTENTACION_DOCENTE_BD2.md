# GUIA DE SUSTENTACION OFICIAL - BASE DE DATOS II (CICLO IV - 2026-II)
**Docente:** Ing. Eder Gutierrez Quispe  
**Proyecto:** SITRA-ORO (Sistema de Trazabilidad y Liquidación en Acopio de Oro)  
**Estudiantes:** Helio Paul Faijo Calisaya & Jhymel Nelio Figueroa Chambi  
**Base de Datos:** Oracle Database 21c / 23ai (PDB: `FREEPDB1`)

---

## 🎯 RESPUESTAS EXACTAS A LAS 4 PREGUNTAS DEL DOCENTE

### 📌 Pregunta 1: "Muéstrame tu Modelo de Datos"
* **Qué mostrar en pantalla:**
  1. Abrir **Oracle SQL Developer** -> Data Modeler (o esquema `SITRA`).
  2. Mostrar las 23 tablas divididas en 4 módulos lógicos:
     - **Módulo Operativo:** `MINEROS`, `CUENTAS_ACCESO`, `ZONAS_ACOPIO`, `CENTROS_ACOPIO`.
     - **Módulo Transaccional:** `LIQUIDACIONES_G1`, `DETALLE_LIQUIDACIONES_G1`, `COMPRAS_G2`, `TRANSACCIONES_G2`.
     - **Módulo Mayorista y Exportación:** `MAYORISTA_RECEPCIONES`, `LOTES_EXPORTACION`, `LOTE_RECEPCIONES`, `REG_PONDERACION`.
     - **Módulo Parámetros y Auditoría:** `PARAMETROS_SISTEMA`, `COTIZACIONES_COLOR`, `LEYES_ORO`, `AUDITORIA`.
* **Argumento oral para responder:**
  > *"Ingeniero, nuestro modelo implementa la trazabilidad completa desde la recepción del mineral crudo por el minero artesanal en las zonas de La Rinconada y Ananea, la liquidación en base a ley estimada y cotización internacional, hasta la consolidación en lotes de exportación mayorista con registro inmutable de auditoría."*

---

### 📌 Pregunta 2: "¿Qué Procedimientos o Funciones has implementado?"
* **Qué mostrar en pantalla:**
  1. Archivo: [`02_PROCEDIMIENTOS_Y_FUNCIONES_SITRA.sql`](file:///e:/Cursos_Ciclo_4/Lenguaje%20de%20Programaci%C3%B3n%20II/Sitra_oro/bd2/02_PROCEDIMIENTOS_Y_FUNCIONES_SITRA.sql).
  2. En el árbol de objetos de SQL Developer, expandir **Funciones** y **Procedimientos**:
     - `FN_CALCULAR_VALOR_ORO`: Función determinística que deduce el % de merma y calcula el valor neto en PEN según ley en milésimas y precio gramo fino.
     - `FN_OBTENER_LEY_PONDERADA_LOTE`: Calcula el promedio ponderado de ley de mineral de un lote mayorista.
     - `SP_REGISTRAR_LIQUIDACION`: Procedimiento transaccional (`COMMIT`/`ROLLBACK`) que inserta cabecera, detalle y genera log en `AUDITORIA`.
     - `SP_CONSOLIDAR_LOTE_EXPORTACION`: Procedimiento para agrupar recepciones aprobadas y cerrar el lote.
     - `SP_PURGAR_AUDITORIA_RETENCION`: Procedimiento administrativo para depurar auditoría histórica según política de retención.
* **Argumento oral para responder:**
  > *"No manejamos la lógica transaccional crítica en el cliente ni en la app, sino directamente en PL/SQL dentro del motor para garantizar integridad ACID, atomicidad y evitar bloqueos en compras concurrentes."*

---

### 📌 Pregunta 3: "¿Cómo estás optimizando tu Base de Datos?"
* **Qué mostrar en pantalla:**
  1. Archivo: [`01_TABLESPACE_USUARIO_SITRA.sql`](file:///e:/Cursos_Ciclo_4/Lenguaje%20de%20Programaci%C3%B3n%20II/Sitra_oro/bd2/01_TABLESPACE_USUARIO_SITRA.sql).
  2. Ejecutar la consulta en el diccionario:
     ```sql
     SELECT tablespace_name, file_name, ROUND(bytes/(1024*1024),2) AS MB, autoextensible 
     FROM dba_data_files WHERE tablespace_name LIKE 'TS_SITRA%';
     ```
  3. Evidencias obligatorias aplicadas:
     - **No usamos USERS:** Todo reside en `TS_SITRA`.
     - **2 Datafiles:** `sitra01.dbf` y `sitra02.dbf` para balancear lecturas/escrituras en disco.
     - **Separación de Índices:** Creado `TS_SITRA_IDX` (`sitra_idx01.dbf`) para evitar colisiones de E/S entre segmentos de datos e índices.
     - **Particionamiento Nativo de Tablas:**
       - `MINEROS`: Particionado por **HASH** (4 particiones) para distribuir equitativamente el acceso concurrente por ID.
       - `CENTROS_ACOPIO`: Particionado por **LIST** (La Rinconada, Ananea, Lunar de Oro, Otros).
       - `LIQUIDACIONES_G1`: Particionado por **RANGE** de fecha (`FECHA_LIQUIDACION`).
       - `COMPRAS_G2`: Particionado **COMPUESTO (RANGE-HASH)** por fecha de compra y subparticionado por minero.
* **Argumento oral para responder:**
  > *"Optimizamos a nivel físico separando almacenamiento de datos e índices en tablespaces dedicados con datafiles autoextensibles, y a nivel lógico mediante particionamiento Range, List y Hash para permitir Partition Pruning en las consultas analíticas pesadas."*

---

### 📌 Pregunta 4: "¿Para qué sirve Exportar/Importar y cuál es tu política de Backups?"
* **Qué mostrar en pantalla:**
  1. Archivo: [`03_BACKUP_DATAPUMP_Y_CONTINGENCIA.sql`](file:///e:/Cursos_Ciclo_4/Lenguaje%20de%20Programaci%C3%B3n%20II/Sitra_oro/bd2/03_BACKUP_DATAPUMP_Y_CONTINGENCIA.sql).
  2. Explicar los 3 criterios que evaluó el docente:
     - **Frecuencia y Ventana Nocturna:** Backup diario incremental a las 23:00 hrs y Backup Full semanal los domingos a las 00:00 hrs (cuando no hay transacciones en el acopio).
     - **Gestión de Espacio en Disco y Retención (Pregunta trampa del docente):**
       - Si guardamos todos los backups indefinidamente, el disco duro colapsa.
       - Política de retención: Backups diarios se retienen **7 días**; semanales se retienen **4 semanas**; mensuales se retienen **12 meses**.
       - Los dumps comprimidos (`COMPRESSION=ALL`) se rotan y transfieren a almacenamiento secundario frío.
     - **Restauración en Servidor Alterno:**
       - No basta con generar el archivo `.dmp`; se ejecuta un script de restauración (`impdp`) en un servidor alterno/entorno de auditoría (`REMAP_SCHEMA=SITRA:SITRA_REPLICA`) para verificar que el backup no esté corrupto y esté 100% operativo ante un desastre.
* **Monitoreo de Consultas Colgadas:**
  - Mostrar la consulta de `V$SESSION` y `V$SQL` para identificar consultas que consumen memoria excesiva y el comando `ALTER SYSTEM KILL SESSION 'sid,serial#' IMMEDIATE;`.
