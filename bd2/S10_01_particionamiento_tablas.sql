-- ==============================================================================
-- BD2 - SESIÓN: PARTICIONAMIENTO DE TABLAS EN ORACLE (SITRA-ORO)
-- Esquema objetivo: BOMERP_APP en Oracle XE / Oracle Developer
-- Tipos implementados según la sesión:
--   1. RANGE (Rango)   : TRANSACCIONES_G2 por FECHA_TRANSACCION (periodo/trimestre)
--   2. LIST  (Lista)   : CENTROS_ACOPIO por ZONA (regiones geográficas de Puno)
--   3. HASH  (Hash)    : MINEROS por ID_MINERO (distribución balanceada por ID)
-- ==============================================================================

SET SERVEROUTPUT ON;

-- ------------------------------------------------------------------------------
-- 1. PARTICIONAMIENTO POR RANGO (RANGE)
-- Concepto: Divide filas según un rango continuo de valores (fechas de transacción).
-- Ejemplo diapositiva: "Ventas por año" -> SITRA-ORO: Transacciones de compra por trimestre/año.
-- ------------------------------------------------------------------------------
PROMPT === 1. APLICANDO PARTICIONAMIENTO RANGE EN TRANSACCIONES_G2 ===;

ALTER TABLE TRANSACCIONES_G2 MODIFY
PARTITION BY RANGE (FECHA_TRANSACCION) (
    PARTITION P_TRANS_HISTORICO VALUES LESS THAN (TIMESTAMP '2026-01-01 00:00:00'),
    PARTITION P_TRANS_2026_Q1   VALUES LESS THAN (TIMESTAMP '2026-04-01 00:00:00'),
    PARTITION P_TRANS_2026_Q2   VALUES LESS THAN (TIMESTAMP '2026-07-01 00:00:00'),
    PARTITION P_TRANS_2026_Q3   VALUES LESS THAN (TIMESTAMP '2026-10-01 00:00:00'),
    PARTITION P_TRANS_2026_Q4   VALUES LESS THAN (TIMESTAMP '2027-01-01 00:00:00'),
    PARTITION P_TRANS_FUTURO    VALUES LESS THAN (MAXVALUE)
) ONLINE;

-- Recalcular estadísticas del optimizador de Oracle
EXEC DBMS_STATS.GATHER_TABLE_STATS(ownname => USER, tabname => 'TRANSACCIONES_G2');

-- ------------------------------------------------------------------------------
-- 2. PARTICIONAMIENTO POR LISTA (LIST)
-- Concepto: Asigna filas a particiones basándose en valores discretos conocidos.
-- Ejemplo diapositiva: "Clientes por región" -> SITRA-ORO: Centros de acopio por ZONA geográfica.
-- ------------------------------------------------------------------------------
PROMPT === 2. APLICANDO PARTICIONAMIENTO LIST EN CENTROS_ACOPIO ===;

ALTER TABLE CENTROS_ACOPIO MODIFY
PARTITION BY LIST (ZONA) (
    PARTITION P_ZONA_RINCONADA VALUES ('La Rinconada'),
    PARTITION P_ZONA_ANANEA    VALUES ('Ananea'),
    PARTITION P_ZONA_LUNAR     VALUES ('Lunar de Oro'),
    PARTITION P_ZONA_OTROS     VALUES (DEFAULT)
) ONLINE;

EXEC DBMS_STATS.GATHER_TABLE_STATS(ownname => USER, tabname => 'CENTROS_ACOPIO');

-- ------------------------------------------------------------------------------
-- 3. PARTICIONAMIENTO POR HASH (HASH)
-- Concepto: Distribuye las filas equitativamente usando un algoritmo hash sobre una clave.
-- Ejemplo diapositiva: "Clientes por ID" -> SITRA-ORO: Mineros registrados por ID_MINERO.
-- ------------------------------------------------------------------------------
PROMPT === 3. APLICANDO PARTICIONAMIENTO HASH EN MINEROS ===;

ALTER TABLE MINEROS MODIFY
PARTITION BY HASH (ID_MINERO)
PARTITIONS 4
ONLINE;

EXEC DBMS_STATS.GATHER_TABLE_STATS(ownname => USER, tabname => 'MINEROS');

-- ==============================================================================
-- CONSULTAS DE VERIFICACIÓN Y EVIDENCIA PARA ORACLE SQL DEVELOPER
-- ==============================================================================
PROMPT === CONSULTA 1: LISTADO DE PARTICIONES EN EL DICCIONARIO DE DATOS ===;
SELECT 
    table_name        AS TABLA,
    partition_name    AS PARTICION,
    partition_position AS POSICION,
    num_rows          AS FILAS,
    high_value        AS VALOR_LIMITE
FROM user_tab_partitions
WHERE table_name IN ('TRANSACCIONES_G2', 'CENTROS_ACOPIO', 'MINEROS')
ORDER BY table_name, partition_position;

PROMPT === CONSULTA 2: LECTURA DIRECTA POR PARTICIÓN ESPECÍFICA ===;
-- Consulta directa a la partición RANGE del Q4 2026:
SELECT COUNT(*) AS total_q4_2026 
FROM TRANSACCIONES_G2 PARTITION (P_TRANS_2026_Q4);

-- Consulta directa a la partición LIST de la zona La Rinconada:
SELECT id_centro_acopio, nombre, zona 
FROM CENTROS_ACOPIO PARTITION (P_ZONA_RINCONADA);

-- Consulta de particiones HASH de MINEROS:
SELECT COUNT(*) AS total_mineros FROM MINEROS;
