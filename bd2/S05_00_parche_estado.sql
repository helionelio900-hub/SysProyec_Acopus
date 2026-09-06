-- =============================================================================
-- SITRA-ORO - BD2 S05: Parche de alineacion BD <-> codigo LP2
-- =============================================================================
-- El entity LiquidacionG1 (LP2) declara la columna ESTADO
-- (EstadoLiquidacion: REGISTRADA | ANULADA), pero LIQUIDACIONES_G1 se creo en
-- S01 sin ella. Este parche la agrega en una BD ya existente.
--
-- Idempotente: si la columna / constraint ya existe (p. ej. porque Hibernate
-- ddl-auto=update la creo en el esquema BOMERP_APP), no hace nada.
--
-- Ejecutar conectado como el DUENO del esquema que se quiere alinear:
--   sqlplus BOM_ACOPIO/123456@localhost:1521/XEPDB1  @bd2/S05_00_parche_estado.sql
--   sqlplus BOMERP_APP/123456@localhost:1521/XEPDB1  @bd2/S05_00_parche_estado.sql
-- =============================================================================

SET SERVEROUTPUT ON

-- 1. Columna ESTADO --------------------------------------------------------------
DECLARE
    v_existe NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_existe
      FROM user_tab_columns
     WHERE table_name = 'LIQUIDACIONES_G1'
       AND column_name = 'ESTADO';

    IF v_existe = 0 THEN
        EXECUTE IMMEDIATE q'{
            ALTER TABLE LIQUIDACIONES_G1 ADD (
                ESTADO VARCHAR2(20) DEFAULT 'REGISTRADA' NOT NULL
                CONSTRAINT CK_LIQ_G1_ESTADO CHECK (ESTADO IN ('REGISTRADA','ANULADA'))
            )}';
        DBMS_OUTPUT.PUT_LINE('LIQUIDACIONES_G1.ESTADO agregada.');
    ELSE
        DBMS_OUTPUT.PUT_LINE('LIQUIDACIONES_G1.ESTADO ya existe, sin cambios.');
    END IF;
END;
/

-- 2. TIPO_ORO: el codigo asigna 'CONSOLIDADO' cuando la liquidacion tiene varias
--    lineas y permite NULL; el CHECK de S01 solo aceptaba ROJO|VERDE NOT NULL. ---
DECLARE
    v_check user_constraints.constraint_name%TYPE;
    v_cnt NUMBER;
BEGIN
    -- quita SOLO un CHECK real sobre TIPO_ORO (no toca NOT NULL de sistema)
    BEGIN
        SELECT constraint_name INTO v_check
          FROM user_constraints
         WHERE table_name = 'LIQUIDACIONES_G1'
           AND constraint_type = 'C'
           AND search_condition_vc LIKE '%TIPO_ORO%'
           AND UPPER(search_condition_vc) LIKE '%IN %(%'
           AND ROWNUM = 1;
        EXECUTE IMMEDIATE 'ALTER TABLE LIQUIDACIONES_G1 DROP CONSTRAINT ' || v_check;
    EXCEPTION WHEN NO_DATA_FOUND THEN NULL;
    END;

    -- vuelve NULL-able si estaba NOT NULL (por columna, con MODIFY explicito)
    SELECT COUNT(*) INTO v_cnt
      FROM user_tab_columns
     WHERE table_name = 'LIQUIDACIONES_G1'
       AND column_name = 'TIPO_ORO' AND nullable = 'N';
    IF v_cnt = 1 THEN
        EXECUTE IMMEDIATE 'ALTER TABLE LIQUIDACIONES_G1 MODIFY (TIPO_ORO NULL)';
    END IF;

    -- CHECK correcto, solo si aun no existe
    SELECT COUNT(*) INTO v_cnt
      FROM user_constraints
     WHERE table_name = 'LIQUIDACIONES_G1' AND constraint_name = 'CK_LIQ_G1_TIPO_ORO';
    IF v_cnt = 0 THEN
        EXECUTE IMMEDIATE q'{
            ALTER TABLE LIQUIDACIONES_G1 ADD CONSTRAINT CK_LIQ_G1_TIPO_ORO
            CHECK (TIPO_ORO IN ('ROJO','VERDE','CONSOLIDADO'))}';
        DBMS_OUTPUT.PUT_LINE('CK_LIQ_G1_TIPO_ORO creado (incluye CONSOLIDADO).');
    END IF;
END;
/

-- 3. PRECIO_RESULTANTE_GRAMO: el entity lo permite NULL --------------------------
DECLARE
    v_notnull NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_notnull
      FROM user_tab_columns
     WHERE table_name = 'LIQUIDACIONES_G1'
       AND column_name = 'PRECIO_RESULTANTE_GRAMO'
       AND nullable = 'N';
    IF v_notnull = 1 THEN
        EXECUTE IMMEDIATE 'ALTER TABLE LIQUIDACIONES_G1 MODIFY (PRECIO_RESULTANTE_GRAMO NULL)';
        DBMS_OUTPUT.PUT_LINE('PRECIO_RESULTANTE_GRAMO ahora admite NULL.');
    END IF;
END;
/

COMMIT;
