-- =============================================================================
-- UNIVERSIDAD PERUANA UNION - FACULTAD DE INGENIERIA Y ARQUITECTURA
-- CURSO: ADMINISTRACION DE BASE DE DATOS II (CICLO IV - 2026-II)
-- DOCENTE: ING. EDER GUTIERREZ QUISPE
-- PROYECTO: SITRA-ORO (TRAZABILIDAD Y LIQUIDACION EN ACOPIO DE ORO)
-- MODULO: ASPECTO 4 - CONTINUIDAD DE NEGOCIO, BACKUPS Y MONITOREO DBA
-- AUTORES: FAIJO CALISAYA HELIO PAUL & FIGUEROA CHAMBI JHYMEL NELIO
-- ARCHIVO: 03_BACKUP_DATAPUMP_Y_CONTINGENCIA.sql
-- =============================================================================
-- INSTRUCCION: Ejecutar bloques SQL como SYSTEM y comandos EXPDP/IMPDP en CMD/PowerShell
-- =============================================================================

SET SERVEROUTPUT ON SIZE UNLIMITED;

PROMPT =============================================================================
PROMPT [PARTE 1/4] CREACION DEL DIRECTORIO FISICO DE DATA PUMP EN ORACLE
PROMPT =============================================================================

-- 1. Crear directorio logico apuntando a la ruta interna de backups del contenedor/servidor
CREATE OR REPLACE DIRECTORY DIR_SITRA_BACKUP AS '/opt/oracle/oradata/backups';

-- 2. Conceder privilegios de lectura y escritura al usuario del esquema
GRANT READ, WRITE ON DIRECTORY DIR_SITRA_BACKUP TO SITRA;
GRANT READ, WRITE ON DIRECTORY DIR_SITRA_BACKUP TO SYSTEM;

PROMPT Directorio DIR_SITRA_BACKUP configurado exitosamente.

PROMPT =============================================================================
PROMPT [PARTE 2/4] COMANDOS DE EXPORTACION E IMPORTACION (DATA PUMP EXPDP / IMPDP)
PROMPT (Copiar y ejecutar en la consola de comandos de Windows / Linux)
PROMPT =============================================================================

/*
-- -----------------------------------------------------------------------------
-- COMANDO 1: BACKUP FULL DEL ESQUEMA SITRA (Con compresion y estimacion de bloques)
-- Ventana de ejecucion: Nocturna (23:00 hrs) - Frecuencia diaria
-- -----------------------------------------------------------------------------
expdp SITRA/123456@localhost:1522/FREEPDB1 ^
  DIRECTORY=DIR_SITRA_BACKUP ^
  DUMPFILE=SITRA_BACKUP_FULL_%U.dmp ^
  LOGFILE=SITRA_BACKUP_FULL.log ^
  SCHEMAS=SITRA ^
  COMPRESSION=ALL ^
  CONTENT=ALL ^
  JOB_NAME=JOB_EXP_SITRA

-- -----------------------------------------------------------------------------
-- COMANDO 2: RESTAURACION EN SERVIDOR ALTERNO / CONTINGENCIA / AUDITORIA
-- (Sustentacion docente: restauracion inmediata para comprobar integridad)
-- -----------------------------------------------------------------------------
impdp SYSTEM/123456@localhost:1522/FREEPDB1 ^
  DIRECTORY=DIR_SITRA_BACKUP ^
  DUMPFILE=SITRA_BACKUP_FULL_%U.dmp ^
  LOGFILE=SITRA_RESTORE_AUDIT.log ^
  REMAP_SCHEMA=SITRA:SITRA_REPLICA ^
  REMAP_TABLESPACE=TS_SITRA:TS_SITRA_REPLICA ^
  TABLE_EXISTS_ACTION=REPLACE
*/

PROMPT =============================================================================
PROMPT [PARTE 3/4] CONSULTAS DBA DE MONITOREO DE RENDIMIENTO Y CONSULTAS COLGADAS
PROMPT (Requisito Docente: Detectar procedimientos/consultas colgadas y liberar memoria)
PROMPT =============================================================================

-- Consulta para identificar sesiones activas, consumo de CPU/memoria y SQL en ejecucion
SELECT s.sid,
       s.serial#,
       s.username,
       s.status,
       s.osuser,
       s.machine,
       s.program,
       ROUND(s.last_call_et / 60, 2) AS minutos_bloqueado,
       q.sql_text
  FROM v$session s
  LEFT JOIN v$sql q ON s.sql_id = q.sql_id
 WHERE s.type != 'BACKGROUND'
   AND s.username IS NOT NULL
 ORDER BY s.last_call_et DESC;

-- Sentencia DBA para matar la sesion colgada (reemplazar SID y SERIAL# segun consulta):
-- ALTER SYSTEM KILL SESSION '<SID>,<SERIAL#>' IMMEDIATE;

PROMPT =============================================================================
PROMPT [PARTE 4/4] VERIFICACION DE ESTADO DEL DICCIONARIO PARA DATA PUMP
PROMPT =============================================================================

SELECT directory_name, directory_path FROM dba_directories WHERE directory_name = 'DIR_SITRA_BACKUP';
SELECT * FROM dba_tab_privs WHERE table_name = 'DIR_SITRA_BACKUP';

PROMPT =============================================================================
PROMPT GUIA DE BACKUPS Y CONTINUIDAD DE NEGOCIO CONFIGURADA PARA SITRA-ORO
PROMPT =============================================================================
