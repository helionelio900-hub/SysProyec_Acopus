-- =============================================================================
-- SITRA-ORO - Datos de demo (opcional)
-- =============================================================================
-- Se corre DESPUES de que el backend arrancó al menos una vez (Hibernate
-- ddl-auto=update ya creó las 5 tablas en el esquema BOMERP_APP).
--
--   sqlplus BOMERP_APP/123456@localhost:1521/XEPDB1  @bd2/S05_seed_demo.sql
--
-- Idempotente: si ya hay datos, no vuelve a insertar (MERGE por clave natural).
-- Las transacciones y liquidaciones se generan por la API REST en la demo,
-- no aquí, para que se vea el flujo cabecera-detalle en vivo.
-- =============================================================================

-- Parámetro del sistema vigente (precio del día y % de merma para el Cotizador)
MERGE INTO PARAMETROS_SISTEMA d
USING (SELECT 285.50 precio, 5.00 merma, 2650.00 onza, 3.7500 tc FROM dual) s
ON (d.estado = 'ACTIVO')
WHEN NOT MATCHED THEN
  INSERT (FECHA, PRECIO_DIARIO_GRAMO_PEN, PORCENTAJE_MERMA_EST, COTIZACION_ONZA_USD, TIPO_CAMBIO_USD_PEN, ESTADO)
  VALUES (SYSDATE, s.precio, s.merma, s.onza, s.tc, 'ACTIVO');

-- Mineros de ejemplo
MERGE INTO MINEROS d
USING (SELECT '44556677' doc, 'Juan Quispe Mamani' nom, '987654321' tel, 'La Rinconada - Puno' zona FROM dual) s
ON (d.documento_identidad = s.doc)
WHEN NOT MATCHED THEN
  INSERT (DOCUMENTO_IDENTIDAD, NOMBRES_APELLIDOS, TELEFONO, ZONA_PROCEDENCIA)
  VALUES (s.doc, s.nom, s.tel, s.zona);

MERGE INTO MINEROS d
USING (SELECT '55667788' doc, 'Maria Condori Apaza' nom, '912345678' tel, 'Ananea - Puno' zona FROM dual) s
ON (d.documento_identidad = s.doc)
WHEN NOT MATCHED THEN
  INSERT (DOCUMENTO_IDENTIDAD, NOMBRES_APELLIDOS, TELEFONO, ZONA_PROCEDENCIA)
  VALUES (s.doc, s.nom, s.tel, s.zona);

COMMIT;

PROMPT Datos de demo cargados.
SELECT 'PARAMETROS_SISTEMA' t, COUNT(*) n FROM PARAMETROS_SISTEMA
UNION ALL SELECT 'MINEROS', COUNT(*) FROM MINEROS;
