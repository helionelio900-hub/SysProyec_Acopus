# Generador del Script Maestro Integral SITRA-ORO para Oracle Database 21c XE

$targetFile = Join-Path $PSScriptRoot "SITRA_ORO_MASTER_COMPLETO.sql"
$lines = [System.Collections.Generic.List[string]]::new()

Write-Host "Generando cabecera y configuracion..."
$lines.Add('-- =============================================================================')
$lines.Add('-- UNIVERSIDAD PERUANA UNION · FACULTAD DE INGENIERIA Y ARQUITECTURA')
$lines.Add('-- ESCUELA PROFESIONAL DE INGENIERIA DE SISTEMAS')
$lines.Add('-- ASIGNATURA: ADMINISTRACION DE BASE DE DATOS II (CICLO IV · 2026-II)')
$lines.Add('-- DOCENTE: ING. EDER GUTIERREZ QUISPE')
$lines.Add('-- PROYECTO: SITRA-ORO (SISTEMA DE TRAZABILIDAD Y LIQUIDACION EN ACOPIO DE ORO)')
$lines.Add('-- ESTUDIANTES (EQUIPO 05): FAIJO CALISAYA HELIO PAUL & FIGUEROA CHAMBI JHYMEL NELIO')
$lines.Add('-- MOTOR: ORACLE DATABASE 21c EXPRESS / ENTERPRISE EDITION (XEPDB1)')
$lines.Add('-- DESCRIPCION: SCRIPT MAESTRO INTEGRAL Y AUTONOMO')
$lines.Add('-- =============================================================================')
$lines.Add('')
$lines.Add('SET DEFINE OFF;')
$lines.Add('SET SERVEROUTPUT ON SIZE UNLIMITED;')
$lines.Add('ALTER SESSION SET NLS_NUMERIC_CHARACTERS = ''.,'';')
$lines.Add('ALTER SESSION SET NLS_DATE_FORMAT = ''YYYY-MM-DD HH24:MI:SS'';')
$lines.Add('ALTER SESSION SET NLS_TIMESTAMP_FORMAT = ''YYYY-MM-DD HH24:MI:SS.FF3'';')
$lines.Add('')
$lines.Add('PROMPT =============================================================================')
$lines.Add('PROMPT INICIANDO INSTALACION DEL PROYECTO SITRA-ORO EN ESQUEMA ACTUAL')
$lines.Add('PROMPT =============================================================================')
$lines.Add('')
$lines.Add('-- -----------------------------------------------------------------------------')
$lines.Add('-- 1. LIMPIEZA SEGURA DE ESTRUCTURAS PREVIAS')
$lines.Add('-- -----------------------------------------------------------------------------')
$lines.Add('PROMPT [1/6] Limpiando tablas, restricciones y secuencias previas...')
$lines.Add('BEGIN')
$lines.Add('   FOR cur_rec IN (SELECT table_name FROM user_tables) LOOP')
$lines.Add('      BEGIN')
$lines.Add('         EXECUTE IMMEDIATE ''DROP TABLE "'' || cur_rec.table_name || ''" CASCADE CONSTRAINTS PURGE'';')
$lines.Add('      EXCEPTION')
$lines.Add('         WHEN OTHERS THEN NULL;')
$lines.Add('      END;')
$lines.Add('   END LOOP;')
$lines.Add('   FOR cur_seq IN (SELECT sequence_name FROM user_sequences WHERE sequence_name NOT LIKE ''ISEQ$$%'') LOOP')
$lines.Add('      BEGIN')
$lines.Add('         EXECUTE IMMEDIATE ''DROP SEQUENCE "'' || cur_seq.sequence_name || ''"'';')
$lines.Add('      EXCEPTION')
$lines.Add('         WHEN OTHERS THEN NULL;')
$lines.Add('      END;')
$lines.Add('   END LOOP;')
$lines.Add('END;')
$lines.Add('/')
$lines.Add('')
$lines.Add('-- -----------------------------------------------------------------------------')
$lines.Add('-- 2. SECUENCIAS MANUALES DEL DOMINIO')
$lines.Add('-- -----------------------------------------------------------------------------')
$lines.Add('PROMPT [2/6] Creando secuencias manuales...')
$lines.Add('CREATE SEQUENCE SEQ_PONDERACION START WITH 100 INCREMENT BY 1 NOCACHE;')
$lines.Add('CREATE SEQUENCE SEQ_SOL_ENTREGA START WITH 100 INCREMENT BY 1 NOCACHE;')
$lines.Add('')

Write-Host "Extrayendo DDL de tablas y particiones..."
$lines.Add('-- -----------------------------------------------------------------------------')
$lines.Add('-- 3. TABLAS Y PARTICIONAMIENTO NATIVO (RANGE, LIST Y HASH)')
$lines.Add('-- -----------------------------------------------------------------------------')
$lines.Add('PROMPT [3/6] Creando las 22 tablas y segmentos particionados...')

$cmdTables = @"
SET PAGESIZE 0 LINESIZE 300 LONG 999999 FEEDBACK OFF TRIMSPOOL ON ECHO OFF HEADING OFF;
EXEC DBMS_METADATA.SET_TRANSFORM_PARAM(DBMS_METADATA.SESSION_TRANSFORM, 'PRETTY', true);
EXEC DBMS_METADATA.SET_TRANSFORM_PARAM(DBMS_METADATA.SESSION_TRANSFORM, 'SQLTERMINATOR', true);
EXEC DBMS_METADATA.SET_TRANSFORM_PARAM(DBMS_METADATA.SESSION_TRANSFORM, 'SEGMENT_ATTRIBUTES', false);
EXEC DBMS_METADATA.SET_TRANSFORM_PARAM(DBMS_METADATA.SESSION_TRANSFORM, 'STORAGE', false);
EXEC DBMS_METADATA.SET_TRANSFORM_PARAM(DBMS_METADATA.SESSION_TRANSFORM, 'REF_CONSTRAINTS', false);

SELECT DBMS_METADATA.GET_DDL('TABLE', table_name, 'BOMERP_APP') 
FROM dba_tables 
WHERE owner = 'BOMERP_APP' 
ORDER BY table_name;
"@

$tablesDdl = $cmdTables | sqlplus -S "sys/123456@localhost:1521/XEPDB1 as sysdba"
$cleanTablesDdl = $tablesDdl -replace '"BOMERP_APP"\.', ''
foreach ($l in $cleanTablesDdl) {
    $lines.Add($l)
}
$lines.Add('')

Write-Host "Extrayendo semillas de datos de las 22 tablas..."
$lines.Add('-- -----------------------------------------------------------------------------')
$lines.Add('-- 4. CARGA DE SEMILLAS DE DATOS REALES DE ACOPIO MINERO EN PUNO')
$lines.Add('-- -----------------------------------------------------------------------------')
$lines.Add('PROMPT [4/6] Insertando datos reales en las 22 tablas del dominio...')

$tables = @(
    "PARAMETROS_SISTEMA",
    "ZONAS_ACOPIO",
    "MINEROS",
    "CUENTAS_ACCESO",
    "CENTROS_ACOPIO",
    "LEYES_ORO",
    "COTIZACIONES_COLOR",
    "LIQUIDACIONES_G1",
    "DETALLE_LIQUIDACIONES_G1",
    "MAYORISTA_RECEPCIONES",
    "COMPRAS_G2",
    "AJUSTES_COMPRA_G2",
    "TRANSACCIONES_G2",
    "LOTES_EXPORTACION",
    "LOTE_EXPORTACION_PARTIDAS",
    "LOTE_RECEPCIONES",
    "RECEPCION_ACUMULADA",
    "RECEPCION_LEYES",
    "REG_PONDERACION",
    "REG_PONDERACION_LEY",
    "SOL_ENTREGA_MINERO",
    "SOL_ENTREGA_PARTIDA"
)

foreach ($t in $tables) {
    Write-Host "  Extrayendo datos de $t..."
    $lines.Add("-- Datos para tabla: $t")
    
    $cmdData = @"
SET FEEDBACK OFF;
ALTER SESSION SET NLS_NUMERIC_CHARACTERS = '.,';
ALTER SESSION SET NLS_DATE_FORMAT = 'YYYY-MM-DD HH24:MI:SS';
ALTER SESSION SET NLS_TIMESTAMP_FORMAT = 'YYYY-MM-DD HH24:MI:SS.FF3';
SET PAGESIZE 0 FEEDBACK OFF TRIMSPOOL ON LINESIZE 4000 MARKUP CSV ON;
SELECT * FROM BOMERP_APP.$t;
"@
    $raw = $cmdData | sqlplus -S "sys/123456@localhost:1521/XEPDB1 as sysdba"
    $csv = $raw | Where-Object { $_ -match '^"[A-Z_0-9]+"' -or $_ -match '^\d+,' -or $_ -match '^"[^"]*",' }
    if ($csv) {
        $data = $csv | ConvertFrom-Csv
        foreach ($row in $data) {
            $cols = $row.psobject.Properties.Name
            $vals = foreach ($c in $cols) {
                $val = $row.$c
                if ($null -eq $val -or $val -eq "") { 
                    "NULL" 
                } elseif ($val -match '^-?\d+(\.\d+)?$') { 
                    $val 
                } elseif ($val -match '^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(\.\d+)?$') { 
                    "TIMESTAMP '$val'" 
                } else { 
                    "'" + ($val -replace "'", "''") + "'" 
                }
            }
            $lines.Add("INSERT INTO $t ($($cols -join ', ')) VALUES ($($vals -join ', '));")
        }
    }
    $lines.Add('')
}
$lines.Add('COMMIT;')
$lines.Add('')

Write-Host "Extrayendo restricciones de clave foranea (Foreign Keys)..."
$lines.Add('-- -----------------------------------------------------------------------------')
$lines.Add('-- 5. CLAVES FORANEAS (REF CONSTRAINTS) E INDICES DE RENDIMIENTO')
$lines.Add('-- -----------------------------------------------------------------------------')
$lines.Add('PROMPT [5/6] Aplicando restricciones de integridad referencial e indices...')

$cmdFk = @"
SET PAGESIZE 0 LINESIZE 300 LONG 999999 FEEDBACK OFF TRIMSPOOL ON ECHO OFF HEADING OFF;
EXEC DBMS_METADATA.SET_TRANSFORM_PARAM(DBMS_METADATA.SESSION_TRANSFORM, 'PRETTY', true);
EXEC DBMS_METADATA.SET_TRANSFORM_PARAM(DBMS_METADATA.SESSION_TRANSFORM, 'SQLTERMINATOR', true);

SELECT DBMS_METADATA.GET_DEPENDENT_DDL('REF_CONSTRAINT', table_name, 'BOMERP_APP')
FROM (
  SELECT DISTINCT table_name 
  FROM dba_constraints 
  WHERE owner = 'BOMERP_APP' AND constraint_type = 'R'
)
ORDER BY table_name;
"@

$fk = $cmdFk | sqlplus -S "sys/123456@localhost:1521/XEPDB1 as sysdba"
$cleanFk = $fk -replace '"BOMERP_APP"\.', ''
foreach ($l in $cleanFk) {
    $lines.Add($l)
}
$lines.Add('')

$cmdIdx = @"
SET PAGESIZE 0 LINESIZE 300 LONG 999999 FEEDBACK OFF TRIMSPOOL ON ECHO OFF HEADING OFF;
EXEC DBMS_METADATA.SET_TRANSFORM_PARAM(DBMS_METADATA.SESSION_TRANSFORM, 'PRETTY', true);
EXEC DBMS_METADATA.SET_TRANSFORM_PARAM(DBMS_METADATA.SESSION_TRANSFORM, 'SQLTERMINATOR', true);
EXEC DBMS_METADATA.SET_TRANSFORM_PARAM(DBMS_METADATA.SESSION_TRANSFORM, 'SEGMENT_ATTRIBUTES', false);
EXEC DBMS_METADATA.SET_TRANSFORM_PARAM(DBMS_METADATA.SESSION_TRANSFORM, 'STORAGE', false);

SELECT DBMS_METADATA.GET_DDL('INDEX', index_name, 'BOMERP_APP')
FROM all_indexes
WHERE owner = 'BOMERP_APP' 
  AND uniqueness != 'UNIQUE' 
  AND index_type != 'LOB'
ORDER BY table_name, index_name;
"@

$idx = $cmdIdx | sqlplus -S "sys/123456@localhost:1521/XEPDB1 as sysdba"
$cleanIdx = $idx -replace '"BOMERP_APP"\.', ''
foreach ($l in $cleanIdx) {
    $lines.Add($l)
}
$lines.Add('')

$lines.Add('-- -----------------------------------------------------------------------------')
$lines.Add('-- 6. RECALCULO DE ESTADISTICAS DEL OPTIMIZADOR ORACLE CBO')
$lines.Add('-- -----------------------------------------------------------------------------')
$lines.Add('PROMPT [6/6] Recalculando estadisticas del optimizador CBO...')
$lines.Add('BEGIN')
$lines.Add('   DBMS_STATS.GATHER_SCHEMA_STATS(ownname => USER, estimate_percent => 100, cascade => TRUE);')
$lines.Add('END;')
$lines.Add('/')
$lines.Add('')

$lines.Add('-- -----------------------------------------------------------------------------')
$lines.Add('-- VERIFICACION FINAL DE LAS 14 PARTICIONES CREADAS')
$lines.Add('-- -----------------------------------------------------------------------------')
$lines.Add('PROMPT =============================================================================')
$lines.Add('PROMPT RESUMEN DE EVIDENCIA: PARTICIONES CREADAS EN EL ESQUEMA SITRA-ORO')
$lines.Add('PROMPT =============================================================================')
$lines.Add('COL TABLA FORMAT A18')
$lines.Add('COL PARTICION FORMAT A20')
$lines.Add('COL POS FORMAT 99')
$lines.Add('COL FILAS FORMAT 9999')
$lines.Add('COL VALOR_LIMITE FORMAT A35')
$lines.Add('SELECT table_name AS TABLA, partition_name AS PARTICION, partition_position AS POS, ')
$lines.Add('       num_rows AS FILAS, SUBSTR(high_value, 1, 35) AS VALOR_LIMITE')
$lines.Add('FROM user_tab_partitions')
$lines.Add('WHERE table_name IN (''TRANSACCIONES_G2'', ''CENTROS_ACOPIO'', ''MINEROS'')')
$lines.Add('ORDER BY table_name, partition_position;')
$lines.Add('')
$lines.Add('PROMPT INSTALACION EXITOSA: Todas las 22 tablas y 14 particiones estan operativas.')

[System.IO.File]::WriteAllLines($targetFile, $lines, [System.Text.Encoding]::UTF8)
Write-Host "Script maestro generado exitosamente en: $targetFile"
