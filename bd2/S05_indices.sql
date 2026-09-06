-- =============================================================================
-- SITRA-ORO - BD2 S05: Indices para consultas empresariales y reportes (LP2 S5)
-- =============================================================================
-- LP2 S5 agrego a GET /api/v1/mayorista/liquidaciones filtros combinados por
-- ESTADO y rango de FECHA_LIQUIDACION, con ordenamiento configurable, y el
-- reporte GET /liquidaciones/resumen. Sin estos indices Oracle resuelve cada
-- consulta con FULL TABLE SCAN + SORT.
--
-- Tambien se indexan las columnas FK que Oracle NO indexa por si solo
-- (a diferencia de las PK), usadas por joins y por SIZE(l.detalles).
--
-- Ejecutar conectado como el dueno del esquema:
--   sqlplus BOMERP_APP/123456@localhost:1521/XEPDB1  @bd2/S05_indices.sql
-- Requiere haber corrido antes S05_00_parche_estado.sql (columna ESTADO).
--
-- Si un indice ya existe, Oracle devuelve ORA-00955: puede ignorarse.
-- =============================================================================

-- 1. Filtro + orden de S5 sobre LIQUIDACIONES_G1 -------------------------------
--    Cubre:  WHERE (:estado IS NULL OR estado = :estado)
--              AND fecha_liquidacion BETWEEN :desde AND :hasta
--            ORDER BY fecha_liquidacion
--    Columna mas selectiva primero (ESTADO), luego el rango de fecha.
CREATE INDEX IX_LIQ_G1_ESTADO_FECHA
    ON LIQUIDACIONES_G1 (ESTADO, FECHA_LIQUIDACION);

-- 2. Orden / filtro por fecha sin estado (consulta S5 solo con rango) ----------
CREATE INDEX IX_LIQ_G1_FECHA
    ON LIQUIDACIONES_G1 (FECHA_LIQUIDACION);

-- 3. FK cabecera-detalle: buscarResumen() cuenta SIZE(l.detalles) y el join ----
--    de findById con @EntityGraph recorre esta columna.
CREATE INDEX IX_DET_LIQ_G1_LIQUIDACION
    ON DETALLE_LIQUIDACIONES_G1 (ID_LIQUIDACION_G1);

-- 4. FK TRANSACCIONES_G2 -> MINEROS: GET /mineros/{id}/transacciones -----------
CREATE INDEX IX_G2_MINERO
    ON TRANSACCIONES_G2 (ID_MINERO);

-- 5. FK TRANSACCIONES_G2 -> LIQUIDACIONES_G1 y calculo de stock de oro --------
--    (transacciones con ID_LIQUIDACION_G1 IS NULL = oro aun no liquidado).
CREATE INDEX IX_G2_LIQUIDACION
    ON TRANSACCIONES_G2 (ID_LIQUIDACION_G1);

-- 6. Dashboard consolidado: SUM(...) GROUP BY TIPO_ORO ------------------------
CREATE INDEX IX_G2_TIPO_ORO
    ON TRANSACCIONES_G2 (TIPO_ORO);

-- Estadisticas frescas para que el optimizador use los indices nuevos ---------
BEGIN
    DBMS_STATS.GATHER_SCHEMA_STATS(USER);
END;
/
