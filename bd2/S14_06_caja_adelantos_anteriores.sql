-- =====================================================================================
-- S14_06 · Adelantos registrados antes de que existiera la caja del mayorista
-- Los adelantos vigentes (PENDIENTE o DESCONTADO) que no tienen su egreso en la caja se
-- descuentan ahora, en la moneda en que se entregaron. Se puede ejecutar varias veces:
-- solo agrega lo que falta.
-- =====================================================================================
INSERT INTO MAYORISTA_CAJA_MOVIMIENTOS (FECHA, MONEDA, TIPO, ORIGEN, MONTO, CONCEPTO, ID_REFERENCIA, ANULADO, FECHA_CREACION)
SELECT a.FECHA,
       a.MONEDA,
       'EGRESO',
       'ADELANTO',
       a.MONTO,
       SUBSTR('Adelanto #' || a.ID_ADELANTO || ' · ' || c.NOMBRE || ' · ' || c.ZONA, 1, 200),
       a.ID_ADELANTO,
       FALSE,
       SYSTIMESTAMP
  FROM MAYORISTA_ADELANTOS a
  JOIN CENTROS_ACOPIO c ON c.ID_CENTRO_ACOPIO = a.ID_CENTRO_ACOPIO
 WHERE a.ESTADO IN ('PENDIENTE', 'DESCONTADO')
   AND NOT EXISTS (SELECT 1
                     FROM MAYORISTA_CAJA_MOVIMIENTOS m
                    WHERE m.ORIGEN = 'ADELANTO'
                      AND m.ID_REFERENCIA = a.ID_ADELANTO
                      AND m.ANULADO = FALSE);

COMMIT;
