-- SITRA-ORO S08 upgrade for databases where the previous S08_01 script was run.
-- Existing labels were stored as a center name, or as "nombre · zona".
-- Backfill only a unique structural match; never guess when ambiguous.
WHENEVER SQLERROR EXIT SQL.SQLCODE

ALTER TABLE MAYORISTA_RECEPCIONES ADD (ID_CENTRO_ACOPIO NUMBER);

UPDATE MAYORISTA_RECEPCIONES r
   SET ID_CENTRO_ACOPIO = (
       SELECT MIN(c.ID_CENTRO_ACOPIO)
         FROM CENTROS_ACOPIO c
        WHERE r.NOMBRE_ACOPIADOR = c.NOMBRE
           OR (SUBSTR(r.NOMBRE_ACOPIADOR, 1, LENGTH(c.NOMBRE)) = c.NOMBRE
               AND LENGTH(r.NOMBRE_ACOPIADOR) = LENGTH(c.NOMBRE) + 3 + LENGTH(c.ZONA)
               AND SUBSTR(r.NOMBRE_ACOPIADOR, LENGTH(c.NOMBRE) + 4) = c.ZONA)
   )
 WHERE (SELECT COUNT(*)
          FROM CENTROS_ACOPIO c
         WHERE r.NOMBRE_ACOPIADOR = c.NOMBRE
            OR (SUBSTR(r.NOMBRE_ACOPIADOR, 1, LENGTH(c.NOMBRE)) = c.NOMBRE
                AND LENGTH(r.NOMBRE_ACOPIADOR) = LENGTH(c.NOMBRE) + 3 + LENGTH(c.ZONA)
                AND SUBSTR(r.NOMBRE_ACOPIADOR, LENGTH(c.NOMBRE) + 4) = c.ZONA)) = 1;

DECLARE
    v_sin_centro NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_sin_centro
      FROM MAYORISTA_RECEPCIONES
     WHERE ID_CENTRO_ACOPIO IS NULL;

    IF v_sin_centro > 0 THEN
        RAISE_APPLICATION_ERROR(-20081,
            'Hay ' || v_sin_centro || ' recepciones sin centro asociado. '
            || 'Asigna ID_CENTRO_ACOPIO manualmente usando los registros verificados; '
            || 'luego ejecuta los pasos de cierre indicados en los comentarios de este script.');
    END IF;
END;
/

-- Si el bloque anterior se detuvo, primero revisa y completa las asociaciones:
-- SELECT ID_RECEPCION, NOMBRE_ACOPIADOR FROM MAYORISTA_RECEPCIONES WHERE ID_CENTRO_ACOPIO IS NULL;
-- UPDATE MAYORISTA_RECEPCIONES SET ID_CENTRO_ACOPIO = <ID_VERIFICADO> WHERE ID_RECEPCION = <ID>;
-- Repite el bloque de verificación; después ejecuta manualmente las sentencias ALTER/CREATE de cierre.

ALTER TABLE MAYORISTA_RECEPCIONES MODIFY (ID_CENTRO_ACOPIO NOT NULL);
ALTER TABLE MAYORISTA_RECEPCIONES MODIFY (NOMBRE_ACOPIADOR VARCHAR2(223 CHAR));
ALTER TABLE MAYORISTA_RECEPCIONES ADD CONSTRAINT FK_MAY_REC_CENTRO
    FOREIGN KEY (ID_CENTRO_ACOPIO) REFERENCES CENTROS_ACOPIO (ID_CENTRO_ACOPIO);
CREATE INDEX IX_MAY_REC_CENTRO ON MAYORISTA_RECEPCIONES (ID_CENTRO_ACOPIO);
