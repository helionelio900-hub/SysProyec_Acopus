-- =============================================================================
-- BOM ERP: bomerp-acopio-oro
-- BD2 - Sesion 01: Creación de Esquemas (Siguiendo patrón de arquitectura de la clase)
-- =============================================================================

-- 1. Esquema Propietario del Dominio de Acopio de Oro
CREATE USER BOM_ACOPIO IDENTIFIED BY "123456" QUOTA UNLIMITED ON USERS;

-- 2. Usuario de Ejecución de la Aplicación Backend (Spring Boot LP2)
CREATE USER BOMERP_APP IDENTIFIED BY "123456";

-- 3. Permisos
GRANT CREATE SESSION, CREATE TABLE, CREATE VIEW, CREATE PROCEDURE, CREATE TRIGGER TO BOM_ACOPIO;
GRANT CREATE SESSION TO BOMERP_APP;
