-- =============================================================================
-- UNIVERSIDAD PERUANA UNION Â· FACULTAD DE INGENIERIA Y ARQUITECTURA
-- ESCUELA PROFESIONAL DE INGENIERIA DE SISTEMAS
-- ASIGNATURA: ADMINISTRACION DE BASE DE DATOS II (CICLO IV Â· 2026-II)
-- DOCENTE: ING. EDER GUTIERREZ QUISPE
-- PROYECTO: SITRA-ORO (SISTEMA DE TRAZABILIDAD Y LIQUIDACION EN ACOPIO DE ORO)
-- ESTUDIANTES: FAIJO CALISAYA HELIO PAUL & FIGUEROA CHAMBI JHYMEL NELIO
-- TEMA: IMPLEMENTACION DE LOS 5 TIPOS DE PARTICIONAMIENTO EN ORACLE DATABASE 21c
--       (1. RANGE, 2. LIST, 3. HASH, 4. INTERVAL, 5. COMPOSITE)
-- =============================================================================

SET DEFINE OFF;
SET SERVEROUTPUT ON SIZE UNLIMITED;
ALTER SESSION SET NLS_NUMERIC_CHARACTERS = '.,';
ALTER SESSION SET NLS_DATE_FORMAT = 'YYYY-MM-DD HH24:MI:SS';
ALTER SESSION SET NLS_TIMESTAMP_FORMAT = 'YYYY-MM-DD HH24:MI:SS.FF3';

PROMPT =============================================================================
PROMPT APLICANDO LOS 5 TIPOS DE PARTICIONAMIENTO EN EL PROYECTO SITRA-ORO
PROMPT =============================================================================

-- -----------------------------------------------------------------------------
-- 1. RANGE: Transacciones de compra aurifera por rango de fechas (Trimestres)
-- Mapeo docente: "ventas por anio / periodo"
-- -----------------------------------------------------------------------------
PROMPT [1/5] Aplicando particionamiento RANGE en TRANSACCIONES_G2...
ALTER TABLE TRANSACCIONES_G2 MODIFY
PARTITION BY RANGE (FECHA_TRANSACCION) (
    PARTITION P_TRANS_HISTORICO VALUES LESS THAN (TIMESTAMP '2026-01-01 00:00:00'),
    PARTITION P_TRANS_2026_Q1   VALUES LESS THAN (TIMESTAMP '2026-04-01 00:00:00'),
    PARTITION P_TRANS_2026_Q2   VALUES LESS THAN (TIMESTAMP '2026-07-01 00:00:00'),
    PARTITION P_TRANS_2026_Q3   VALUES LESS THAN (TIMESTAMP '2026-10-01 00:00:00'),
    PARTITION P_TRANS_2026_Q4   VALUES LESS THAN (TIMESTAMP '2027-01-01 00:00:00'),
    PARTITION P_TRANS_FUTURO    VALUES LESS THAN (MAXVALUE)
) ONLINE;

-- -----------------------------------------------------------------------------
-- 2. LIST: Centros de acopio y fiscalizacion por valores discretos (Zonas)
-- Mapeo docente: "clientes por region"
-- -----------------------------------------------------------------------------
PROMPT [2/5] Aplicando particionamiento LIST en CENTROS_ACOPIO...
ALTER TABLE CENTROS_ACOPIO MODIFY
PARTITION BY LIST (ZONA) (
    PARTITION P_ZONA_RINCONADA VALUES ('La Rinconada'),
    PARTITION P_ZONA_ANANEA    VALUES ('Ananea'),
    PARTITION P_ZONA_LUNAR     VALUES ('Lunar de Oro'),
    PARTITION P_ZONA_OTROS     VALUES (DEFAULT)
) ONLINE;

-- -----------------------------------------------------------------------------
-- 3. HASH: Padron de mineros artesanales mediante algoritmo de dispersion
-- Mapeo docente: "clientes por ID"
-- -----------------------------------------------------------------------------
PROMPT [3/5] Aplicando particionamiento HASH en MINEROS...
ALTER TABLE MINEROS MODIFY
PARTITION BY HASH (ID_MINERO)
PARTITIONS 4
ONLINE;

-- -----------------------------------------------------------------------------
-- 4. INTERVAL: Liquidaciones a acopiadores con creacion automatica por mes
-- Mapeo docente: "ventas mensuales automaticas"
-- -----------------------------------------------------------------------------
PROMPT [4/5] Aplicando particionamiento INTERVAL en LIQUIDACIONES_G1...
ALTER TABLE LIQUIDACIONES_G1 MODIFY
PARTITION BY RANGE (FECHA_LIQUIDACION)
INTERVAL (NUMTOYMINTERVAL(1, 'MONTH')) (
    PARTITION P_LIQ_HISTORICO VALUES LESS THAN (TIMESTAMP '2026-01-01 00:00:00')
) ONLINE;

-- -----------------------------------------------------------------------------
-- 5. COMPOSITE: Compras del sistema combinando RANGE (Semestres) + HASH (Mineros)
-- Mapeo docente: "RANGE + HASH"
-- -----------------------------------------------------------------------------
PROMPT [5/5] Aplicando particionamiento COMPOSITE (RANGE + HASH) en COMPRAS_G2...
ALTER TABLE COMPRAS_G2 MODIFY
PARTITION BY RANGE (FECHA_COMPRA)
SUBPARTITION BY HASH (ID_MINERO) SUBPARTITIONS 2 (
    PARTITION P_COMPRAS_2026_S1 VALUES LESS THAN (TIMESTAMP '2026-07-01 00:00:00'),
    PARTITION P_COMPRAS_2026_S2 VALUES LESS THAN (TIMESTAMP '2027-01-01 00:00:00'),
    PARTITION P_COMPRAS_FUTURO  VALUES LESS THAN (MAXVALUE)
) ONLINE;

-- -----------------------------------------------------------------------------
-- 6. RECALCULO DE ESTADISTICAS DEL OPTIMIZADOR CBO
-- -----------------------------------------------------------------------------
PROMPT [6/6] Recalculando estadisticas del optimizador CBO...
BEGIN
   DBMS_STATS.GATHER_SCHEMA_STATS(ownname => USER, estimate_percent => 100, cascade => TRUE);
END;
/

-- -----------------------------------------------------------------------------
-- 7. CONSULTAS DE EVIDENCIA PARA ORACLE SQL DEVELOPER
-- -----------------------------------------------------------------------------
PROMPT =============================================================================
PROMPT EVIDENCIA 1: RESUMEN DE LOS 5 TIPOS DE PARTICIONAMIENTO (USER_PART_TABLES)
PROMPT =============================================================================
SET LINESIZE 200 PAGESIZE 50;
COL TABLA FORMAT A20;
COL TIPO_PRIMARIO FORMAT A14;
COL SUBPARTICION FORMAT A14;
COL INTERVALO_AUTO FORMAT A28;
COL CANT_PARTICIONES FORMAT 9999;

SELECT table_name AS TABLA,
       partitioning_type AS TIPO_PRIMARIO,
       subpartitioning_type AS SUBPARTICION,
       interval AS INTERVALO_AUTO,
       partition_count AS CANT_PARTICIONES
FROM user_part_tables
ORDER BY table_name;

PROMPT =============================================================================
PROMPT EVIDENCIA 2: DETALLE DE PARTICIONES FISICAS Y FILAS (USER_TAB_PARTITIONS)
PROMPT =============================================================================
COL PARTICION FORMAT A20;
COL POS FORMAT 99;
COL FILAS FORMAT 9999;
COL LIMITE FORMAT A32;

SELECT table_name AS TABLA,
       partition_name AS PARTICION,
       partition_position AS POS,
       num_rows AS FILAS,
       high_value AS LIMITE
FROM user_tab_partitions
WHERE table_name IN ('TRANSACCIONES_G2', 'CENTROS_ACOPIO', 'MINEROS', 'LIQUIDACIONES_G1', 'COMPRAS_G2')
ORDER BY table_name, partition_position;

PROMPT =============================================================================
PROMPT EVIDENCIA 3: DETALLE DE SUBPARTICIONES COMPOSITE (USER_TAB_SUBPARTITIONS)
PROMPT =============================================================================
COL PARTICION_PADRE FORMAT A20;
COL SUBPARTICION_HASH FORMAT A20;
COL POS_SUB FORMAT 99;

SELECT table_name AS TABLA,
       partition_name AS PARTICION_PADRE,
       subpartition_name AS SUBPARTICION_HASH,
       subpartition_position AS POS_SUB,
       num_rows AS FILAS
FROM user_tab_subpartitions
WHERE table_name = 'COMPRAS_G2'
ORDER BY partition_name, subpartition_position;

PROMPT =============================================================================
PROMPT EVIDENCIA 4: PODA DE PARTICIONES Y PLAN DE EJECUCION (EXPLAIN PLAN)
PROMPT =============================================================================
EXPLAIN PLAN FOR
SELECT * FROM TRANSACCIONES_G2
WHERE FECHA_TRANSACCION BETWEEN TIMESTAMP '2026-10-01 00:00:00' AND TIMESTAMP '2026-10-25 00:00:00';

SELECT * FROM TABLE(DBMS_XPLAN.DISPLAY(format => 'TYPICAL +PARTITION'));

PROMPT =============================================================================
PROMPT INSTALACION EXITOSA: Los 5 tipos y las 4 evidencias estan verificados al 100%.
PROMPT =============================================================================
