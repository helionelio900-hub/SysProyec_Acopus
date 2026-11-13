-- =============================================================================
-- UNIVERSIDAD PERUANA UNION - FACULTAD DE INGENIERIA Y ARQUITECTURA
-- CURSO: ADMINISTRACION DE BASE DE DATOS II (CICLO IV - 2026-II)
-- DOCENTE: ING. EDER GUTIERREZ QUISPE
-- PROYECTO: SITRA-ORO (TRAZABILIDAD Y LIQUIDACION EN ACOPIO DE ORO)
-- MODULO: ASPECTO 3 - GESTION FISICA Y OPTIMIZACION (ORACLE 21c/23ai)
-- AUTORES: FAIJO CALISAYA HELIO PAUL & FIGUEROA CHAMBI JHYMEL NELIO
-- ARCHIVO: 01_TABLESPACE_USUARIO_SITRA.sql
-- =============================================================================
-- INSTRUCCION: Ejecutar conectado como usuario SYSTEM o SYS con rol SYSDBA en el PDB (FREEPDB1 / XEPDB1)
-- =============================================================================

SET SERVEROUTPUT ON SIZE UNLIMITED;

PROMPT =============================================================================
PROMPT [PASO 1/3] VERIFICANDO CONTENEDOR Y PRIVILEGIOS DE ADMINISTRADOR
PROMPT =============================================================================
SELECT SYS_CONTEXT('USERENV', 'CON_NAME') AS CONTENEDOR_ACTUAL, USER AS USUARIO_ACTUAL FROM DUAL;

PROMPT =============================================================================
PROMPT [PASO 2/3] CREANDO TABLESPACES Y DATAFILES DEDICADOS PARA SITRA-ORO
PROMPT (Requisito Docente: No usar tablespace USERS, crear 2 datafiles para datos)
PROMPT =============================================================================

-- 1. Tablespace dedicado para Tablas de SITRA (Con 2 Datafiles para balanceo de E/S)
DECLARE
    v_count NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_count FROM dba_tablespaces WHERE tablespace_name = 'TS_SITRA';
    IF v_count = 0 THEN
        EXECUTE IMMEDIATE '
            CREATE TABLESPACE TS_SITRA
            DATAFILE ''/opt/oracle/oradata/FREE/FREEPDB1/sitra01.dbf'' SIZE 100M AUTOEXTEND ON NEXT 50M MAXSIZE UNLIMITED,
                     ''/opt/oracle/oradata/FREE/FREEPDB1/sitra02.dbf'' SIZE 100M AUTOEXTEND ON NEXT 50M MAXSIZE UNLIMITED
            EXTENT MANAGEMENT LOCAL
            SEGMENT SPACE MANAGEMENT AUTO
        ';
        DBMS_OUTPUT.PUT_LINE('>> Tablespace TS_SITRA creado exitosamente con 2 Datafiles.');
    ELSE
        DBMS_OUTPUT.PUT_LINE('>> El Tablespace TS_SITRA ya existe.');
    END IF;
END;
/

-- 2. Tablespace dedicado para Índices de SITRA (Separación física datos vs índices)
DECLARE
    v_count NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_count FROM dba_tablespaces WHERE tablespace_name = 'TS_SITRA_IDX';
    IF v_count = 0 THEN
        EXECUTE IMMEDIATE '
            CREATE TABLESPACE TS_SITRA_IDX
            DATAFILE ''/opt/oracle/oradata/FREE/FREEPDB1/sitra_idx01.dbf'' SIZE 50M AUTOEXTEND ON NEXT 25M MAXSIZE UNLIMITED
            EXTENT MANAGEMENT LOCAL
            SEGMENT SPACE MANAGEMENT AUTO
        ';
        DBMS_OUTPUT.PUT_LINE('>> Tablespace TS_SITRA_IDX creado exitosamente.');
    ELSE
        DBMS_OUTPUT.PUT_LINE('>> El Tablespace TS_SITRA_IDX ya existe.');
    END IF;
END;
/

PROMPT =============================================================================
PROMPT [PASO 3/3] CREANDO USUARIO OFICIAL SITRA Y ASIGNACION DE PRIVILEGIOS
PROMPT =============================================================================

DECLARE
    v_user_count NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_user_count FROM dba_users WHERE username = 'SITRA';
    IF v_user_count = 0 THEN
        EXECUTE IMMEDIATE '
            CREATE USER SITRA IDENTIFIED BY 123456
            DEFAULT TABLESPACE TS_SITRA
            TEMPORARY TABLESPACE TEMP
            QUOTA UNLIMITED ON TS_SITRA
            QUOTA UNLIMITED ON TS_SITRA_IDX
        ';
        DBMS_OUTPUT.PUT_LINE('>> Usuario SITRA creado con DEFAULT TABLESPACE TS_SITRA.');
    ELSE
        EXECUTE IMMEDIATE '
            ALTER USER SITRA
            DEFAULT TABLESPACE TS_SITRA
            QUOTA UNLIMITED ON TS_SITRA
            QUOTA UNLIMITED ON TS_SITRA_IDX
        ';
        DBMS_OUTPUT.PUT_LINE('>> Usuario SITRA actualizado a DEFAULT TABLESPACE TS_SITRA.');
    END IF;
END;
/

-- Concesión de privilegios
GRANT CONNECT, RESOURCE TO SITRA;
GRANT CREATE VIEW, CREATE PROCEDURE, CREATE SEQUENCE, CREATE TRIGGER, CREATE SYNONYM TO SITRA;
GRANT CREATE MATERIALIZED VIEW, CREATE JOB TO SITRA;
GRANT UNLIMITED TABLESPACE TO SITRA;
GRANT DATAPUMP_EXP_FULL_DATABASE, DATAPUMP_IMP_FULL_DATABASE TO SITRA;

PROMPT =============================================================================
PROMPT VERIFICACION DE GESTION FISICA EN DICCIONARIO DE DATOS
PROMPT =============================================================================

COL TABLESPACE_NAME FORMAT A15
COL FILE_NAME FORMAT A45
COL BYTES_MB FORMAT 999,990.00
COL AUTOEXTENSIBLE FORMAT A5

SELECT tablespace_name, 
       file_name, 
       ROUND(bytes / (1024*1024), 2) AS bytes_mb, 
       autoextensible 
FROM dba_data_files 
WHERE tablespace_name IN ('TS_SITRA', 'TS_SITRA_IDX')
ORDER BY tablespace_name, file_name;

SELECT username, default_tablespace, temporary_tablespace, account_status 
FROM dba_users 
WHERE username = 'SITRA';

PROMPT =============================================================================
PROMPT INSTALACION DE GESTION FISICA COMPLETADA PARA SITRA-ORO
PROMPT =============================================================================
