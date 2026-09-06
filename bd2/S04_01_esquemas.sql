-- =============================================================================
-- SITRA-ORO / BOMERP: Esquema BOM_VENTAS (S04)
-- BD2 - Sesion 04: Esquema para el módulo de Ventas y Liquidaciones Cabecera-Detalle
-- =============================================================================

-- Crear esquema BOM_VENTAS si no existe
DECLARE
    v_count NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_count FROM dba_users WHERE username = 'BOM_VENTAS';
    IF v_count = 0 THEN
        EXECUTE IMMEDIATE 'CREATE USER BOM_VENTAS IDENTIFIED BY 123456 DEFAULT TABLESPACE USERS QUOTA UNLIMITED ON USERS';
        EXECUTE IMMEDIATE 'GRANT CREATE SESSION, CREATE TABLE, CREATE VIEW, CREATE SEQUENCE TO BOM_VENTAS';
    END IF;
END;
/
