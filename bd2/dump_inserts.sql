SET PAGESIZE 0 LINESIZE 3000 LONG 9999999 FEEDBACK OFF TRIMSPOOL ON SERVEROUTPUT ON SIZE UNLIMITED;

DECLARE
  v_sql VARCHAR2(32767);
  v_col_list VARCHAR2(4000);
  v_val_list VARCHAR2(32000);
  v_cur SYS_REFCURSOR;
  v_ins VARCHAR2(32767);
BEGIN
  -- Tables in insertion order
  FOR t IN (
    SELECT column_value AS table_name FROM TABLE(sys.odcivarchar2list(
      'PARAMETROS_SISTEMA', 'ZONAS_ACOPIO', 'MINEROS', 'CUENTAS_ACCESO', 'CENTROS_ACOPIO',
      'LEYES_ORO', 'COTIZACIONES_COLOR', 'LIQUIDACIONES_G1', 'DETALLE_LIQUIDACIONES_G1',
      'MAYORISTA_RECEPCIONES', 'COMPRAS_G2', 'AJUSTES_COMPRA_G2', 'TRANSACCIONES_G2',
      'LOTES_EXPORTACION', 'LOTE_EXPORTACION_PARTIDAS', 'LOTE_RECEPCIONES', 'RECEPCION_ACUMULADA',
      'RECEPCION_LEYES', 'REG_PONDERACION', 'REG_PONDERACION_LEY', 'SOL_ENTREGA_MINERO',
      'SOL_ENTREGA_PARTIDA'
    ))
  ) LOOP
    -- Build columns and values select
    v_col_list := '';
    v_val_list := '';
    FOR c IN (
      SELECT column_name, data_type 
      FROM all_tab_columns 
      WHERE owner = 'BOMERP_APP' AND table_name = t.table_name
      ORDER BY column_id
    ) LOOP
      IF v_col_list IS NOT NULL THEN
        v_col_list := v_col_list || ', ';
        v_val_list := v_val_list || ' || '', '' || ';
      END IF;
      v_col_list := v_col_list || '"' || c.column_name || '"';
      
      IF c.data_type IN ('NUMBER', 'FLOAT') THEN
        v_val_list := v_val_list || 'NVL(TO_CHAR("' || c.column_name || '"), ''NULL'')';
      ELSIF c.data_type = 'DATE' THEN
        v_val_list := v_val_list || 'CASE WHEN "' || c.column_name || '" IS NULL THEN ''NULL'' ELSE ''TO_DATE('''''' || TO_CHAR("' || c.column_name || '", ''YYYY-MM-DD HH24:MI:SS'') || '''''', ''''YYYY-MM-DD HH24:MI:SS'''')'' END';
      ELSIF c.data_type LIKE 'TIMESTAMP%' THEN
        v_val_list := v_val_list || 'CASE WHEN "' || c.column_name || '" IS NULL THEN ''NULL'' ELSE ''TO_TIMESTAMP('''''' || TO_CHAR("' || c.column_name || '", ''YYYY-MM-DD HH24:MI:SS.FF'') || '''''', ''''YYYY-MM-DD HH24:MI:SS.FF'''')'' END';
      ELSE
        v_val_list := v_val_list || 'CASE WHEN "' || c.column_name || '" IS NULL THEN ''NULL'' ELSE '''''''' || REPLACE("' || c.column_name || '", '''''''', '''''''''') || '''''''' END';
      END IF;
    END LOOP;

    DBMS_OUTPUT.PUT_LINE('-- Datos para: ' || t.table_name);
    v_sql := 'SELECT ''INSERT INTO ' || t.table_name || ' (' || v_col_list || ') VALUES ('' || ' || v_val_list || ' || '');'' FROM BOMERP_APP.' || t.table_name;
    OPEN v_cur FOR v_sql;
    LOOP
      FETCH v_cur INTO v_ins;
      EXIT WHEN v_cur%NOTFOUND;
      DBMS_OUTPUT.PUT_LINE(v_ins);
    END LOOP;
    CLOSE v_cur;
    DBMS_OUTPUT.PUT_LINE('');
  END LOOP;
END;
/
