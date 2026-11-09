-- =====================================================================================
-- S14_07 · Motivo del descuento manual en la compra al minero
-- Cuando el acopiador descuenta algo que no es un préstamo registrado (una deuda de víveres,
-- herramientas, etc.) debe decir por qué. El motivo se imprime en el comprobante.
-- =====================================================================================
ALTER TABLE COMPRAS_G2 ADD (DESCUENTO_MOTIVO VARCHAR2(200));

COMMENT ON COLUMN COMPRAS_G2.DESCUENTO_MOTIVO IS 'Motivo del descuento manual aplicado al pagar la compra';
