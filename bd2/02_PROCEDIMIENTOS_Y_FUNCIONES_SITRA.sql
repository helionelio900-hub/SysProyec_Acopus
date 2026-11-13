-- =============================================================================
-- UNIVERSIDAD PERUANA UNION - FACULTAD DE INGENIERIA Y ARQUITECTURA
-- CURSO: ADMINISTRACION DE BASE DE DATOS II (CICLO IV - 2026-II)
-- DOCENTE: ING. EDER GUTIERREZ QUISPE
-- PROYECTO: SITRA-ORO (TRAZABILIDAD Y LIQUIDACION EN ACOPIO DE ORO)
-- MODULO: ASPECTO 2 - PROCEDIMIENTOS ALMACENADOS Y FUNCIONES PL/SQL
-- AUTORES: FAIJO CALISAYA HELIO PAUL & FIGUEROA CHAMBI JHYMEL NELIO
-- ARCHIVO: 02_PROCEDIMIENTOS_Y_FUNCIONES_SITRA.sql
-- =============================================================================
-- INSTRUCCION: Ejecutar conectado como usuario SITRA en el PDB (FREEPDB1)
-- =============================================================================

SET SERVEROUTPUT ON SIZE UNLIMITED;
ALTER SESSION SET CURRENT_SCHEMA = SITRA;

PROMPT =============================================================================
PROMPT [1/5] FUNCION 1: CALCULO DE VALOR NETO DE ORO SEGUN LEY Y PRECIO DEL DIA
PROMPT =============================================================================

CREATE OR REPLACE FUNCTION FN_CALCULAR_VALOR_ORO (
    p_peso_bruto        IN NUMBER,
    p_porcentaje_merma  IN NUMBER,
    p_ley_milesimas     IN NUMBER,
    p_precio_gramo_fino IN NUMBER
) RETURN NUMBER
DETERMINISTIC
IS
    v_peso_neto   NUMBER(12, 4);
    v_gramos_fino NUMBER(12, 4);
    v_total_pen   NUMBER(14, 2);
BEGIN
    -- Validaciones de parametros
    IF p_peso_bruto IS NULL OR p_peso_bruto <= 0 THEN
        RAISE_APPLICATION_ERROR(-20001, 'El peso bruto debe ser mayor a cero.');
    END IF;
    
    IF p_ley_milesimas IS NULL OR p_ley_milesimas <= 0 OR p_ley_milesimas > 1000 THEN
        RAISE_APPLICATION_ERROR(-20002, 'La ley debe estar en el rango de 1 a 1000 milesimas.');
    END IF;

    -- 1. Descontar merma fisica estimada
    v_peso_neto := p_peso_bruto * (1 - (NVL(p_porcentaje_merma, 0) / 100));

    -- 2. Calcular gramos de oro puro (ley / 1000)
    v_gramos_fino := v_peso_neto * (p_ley_milesimas / 1000);

    -- 3. Calcular importe monetario en PEN
    v_total_pen := ROUND(v_gramos_fino * p_precio_gramo_fino, 2);

    RETURN v_total_pen;
EXCEPTION
    WHEN OTHERS THEN
        RAISE_APPLICATION_ERROR(-20003, 'Error en FN_CALCULAR_VALOR_ORO: ' || SQLERRM);
END;
/

PROMPT =============================================================================
PROMPT [2/5] FUNCION 2: CALCULO DE LEY PROMEDIO PONDERADA DE UN LOTE DE EXPORTACION
PROMPT =============================================================================

CREATE OR REPLACE FUNCTION FN_OBTENER_LEY_PONDERADA_LOTE (
    p_id_lote IN NUMBER
) RETURN NUMBER
IS
    v_ley_ponderada NUMBER(8, 4) := 0;
    v_peso_total    NUMBER(12, 4) := 0;
    v_fino_total    NUMBER(12, 4) := 0;
BEGIN
    SELECT NVL(SUM(r.PESO_NETO_TOTAL), 0),
           NVL(SUM(r.PESO_NETO_TOTAL * (NVL(r.LEY_ESTIMADA, 850) / 1000)), 0)
      INTO v_peso_total, v_fino_total
      FROM MAYORISTA_RECEPCIONES r
      JOIN LOTE_RECEPCIONES lr ON r.ID_RECEPCION = lr.ID_RECEPCION
     WHERE lr.ID_LOTE = p_id_lote;

    IF v_peso_total > 0 THEN
        v_ley_ponderada := ROUND((v_fino_total / v_peso_total) * 1000, 2);
    ELSE
        v_ley_ponderada := 0;
    END IF;

    RETURN v_ley_ponderada;
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        RETURN 0;
    WHEN OTHERS THEN
        RAISE_APPLICATION_ERROR(-20004, 'Error calculando ley ponderada: ' || SQLERRM);
END;
/

PROMPT =============================================================================
PROMPT [3/5] PROCEDIMIENTO 1: REGISTRAR LIQUIDACION TRANSACCIONAL CON AUDITORIA
PROMPT =============================================================================

CREATE OR REPLACE PROCEDURE SP_REGISTRAR_LIQUIDACION (
    p_id_minero         IN  NUMBER,
    p_id_centro         IN  NUMBER,
    p_peso_bruto        IN  NUMBER,
    p_ley_milesimas     IN  NUMBER,
    p_observacion       IN  VARCHAR2,
    p_usuario           IN  VARCHAR2,
    o_id_liquidacion    OUT NUMBER,
    o_total_pagar       OUT NUMBER
)
IS
    v_precio_diario   NUMBER(10, 2);
    v_merma_pct       NUMBER(5, 2);
    v_peso_neto       NUMBER(10, 3);
    v_total_calculado NUMBER(14, 2);
    v_id_parametro    NUMBER;
    v_cod_minero      VARCHAR2(50);
BEGIN
    -- Verificar existencia y estado del minero
    SELECT CODIGO_MINERO INTO v_cod_minero 
      FROM MINEROS 
     WHERE ID_MINERO = p_id_minero AND ESTADO_REGISTRO = 'Activo';

    -- Obtener parametros de cotizacion vigente
    BEGIN
        SELECT ID_PARAMETRO, PRECIO_DIARIO_GRAMO_PEN, PORCENTAJE_MERMA_EST
          INTO v_id_parametro, v_precio_diario, v_merma_pct
          FROM (SELECT ID_PARAMETRO, PRECIO_DIARIO_GRAMO_PEN, PORCENTAJE_MERMA_EST
                  FROM PARAMETROS_SISTEMA 
                 ORDER BY FECHA DESC)
         WHERE ROWNUM = 1;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            v_precio_diario := 285.50; -- Precio base de contingencia PEN/g
            v_merma_pct := 5.00;
    END;

    -- Calculo transaccional
    v_peso_neto := p_peso_bruto * (1 - (v_merma_pct / 100));
    v_total_calculado := FN_CALCULAR_VALOR_ORO(p_peso_bruto, v_merma_pct, p_ley_milesimas, v_precio_diario);

    -- Insertar Cabecera de Liquidacion (Tabla particionada por Range de Fecha)
    INSERT INTO LIQUIDACIONES_G1 (
        ID_MINERO, ID_CENTRO, FECHA_LIQUIDACION, TOTAL_LIQUIDADO, 
        ESTADO, TIPO_LIQUIDACION, OBSERVACIONES
    ) VALUES (
        p_id_minero, p_id_centro, SYSTIMESTAMP, v_total_calculado,
        'Aprobado', 'Compra Directa', p_observacion
    ) RETURNING ID_LIQUIDACION INTO o_id_liquidacion;

    -- Insertar Detalle de Liquidacion
    INSERT INTO DETALLE_LIQUIDACIONES_G1 (
        ID_LIQUIDACION, PESO_BRUTO_GRAMOS, LEY_DECLARADA, 
        PRECIO_APLICADO_GRAMO, SUB_TOTAL
    ) VALUES (
        o_id_liquidacion, p_peso_bruto, p_ley_milesimas,
        v_precio_diario, v_total_calculado
    );

    -- Registrar evento en Auditoria
    INSERT INTO AUDITORIA (
        TABLA_AFECTADA, OPERACION, USUARIO_BD, 
        FECHA_OPERACION, DETALLE_CAMBIO
    ) VALUES (
        'LIQUIDACIONES_G1', 'INSERT', NVL(p_usuario, USER),
        SYSTIMESTAMP, 'Liquidacion ID: ' || o_id_liquidacion || ' generada para Minero: ' || v_cod_minero || ' por S/. ' || v_total_calculado
    );

    o_total_pagar := v_total_calculado;
    COMMIT;
    DBMS_OUTPUT.PUT_LINE('>> Liquidacion #' || o_id_liquidacion || ' generada exitosamente por S/. ' || o_total_pagar);

EXCEPTION
    WHEN NO_DATA_FOUND THEN
        ROLLBACK;
        RAISE_APPLICATION_ERROR(-20010, 'El minero no existe o no se encuentra activo.');
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE_APPLICATION_ERROR(-20011, 'Error en transaccion SP_REGISTRAR_LIQUIDACION: ' || SQLERRM);
END;
/

PROMPT =============================================================================
PROMPT [4/5] PROCEDIMIENTO 2: CONSOLIDAR LOTE DE EXPORTACION Y CALCULAR LEY FINAL
PROMPT =============================================================================

CREATE OR REPLACE PROCEDURE SP_CONSOLIDAR_LOTE_EXPORTACION (
    p_codigo_lote      IN  VARCHAR2,
    p_descripcion      IN  VARCHAR2,
    p_usuario          IN  VARCHAR2,
    o_id_lote          OUT NUMBER,
    o_peso_total       OUT NUMBER,
    o_ley_ponderada    OUT NUMBER
)
IS
    v_cant_recepciones NUMBER := 0;
BEGIN
    -- 1. Crear cabecera del lote
    INSERT INTO LOTES_EXPORTACION (
        CODIGO_LOTE, DESCRIPCION, ESTADO, FECHA_CREACION, 
        PESO_BRUTO_TOTAL, LEY_PROMEDIO_PONDERADA
    ) VALUES (
        p_codigo_lote, p_descripcion, 'En Proceso', SYSTIMESTAMP, 
        0, 0
    ) RETURNING ID_LOTE INTO o_id_lote;

    -- 2. Asociar recepciones pendientes al lote
    FOR rec IN (
        SELECT ID_RECEPCION, PESO_NETO_TOTAL 
          FROM MAYORISTA_RECEPCIONES 
         WHERE ESTADO = 'Aprobado' 
           AND ID_RECEPCION NOT IN (SELECT ID_RECEPCION FROM LOTE_RECEPCIONES)
           AND ROWNUM <= 10
    ) LOOP
        INSERT INTO LOTE_RECEPCIONES (ID_LOTE, ID_RECEPCION)
        VALUES (o_id_lote, rec.ID_RECEPCION);
        v_cant_recepciones := v_cant_recepciones + 1;
    END LOOP;

    -- 3. Si hay recepciones agrupadas, calcular totales y actualizar
    IF v_cant_recepciones > 0 THEN
        SELECT SUM(r.PESO_NETO_TOTAL)
          INTO o_peso_total
          FROM MAYORISTA_RECEPCIONES r
          JOIN LOTE_RECEPCIONES lr ON r.ID_RECEPCION = lr.ID_RECEPCION
         WHERE lr.ID_LOTE = o_id_lote;

        o_ley_ponderada := FN_OBTENER_LEY_PONDERADA_LOTE(o_id_lote);

        UPDATE LOTES_EXPORTACION 
           SET PESO_BRUTO_TOTAL = o_peso_total,
               LEY_PROMEDIO_PONDERADA = o_ley_ponderada,
               ESTADO = 'Consolidado'
         WHERE ID_LOTE = o_id_lote;
    ELSE
        o_peso_total := 0;
        o_ley_ponderada := 0;
    END IF;

    -- 4. Registrar Auditoria
    INSERT INTO AUDITORIA (
        TABLA_AFECTADA, OPERACION, USUARIO_BD, 
        FECHA_OPERACION, DETALLE_CAMBIO
    ) VALUES (
        'LOTES_EXPORTACION', 'INSERT', NVL(p_usuario, USER),
        SYSTIMESTAMP, 'Lote #' || p_codigo_lote || ' consolidado con ' || v_cant_recepciones || ' recepciones. Peso: ' || o_peso_total || 'g'
    );

    COMMIT;
    DBMS_OUTPUT.PUT_LINE('>> Lote ' || p_codigo_lote || ' consolidado con exito.');
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE_APPLICATION_ERROR(-20020, 'Error consolidando lote de exportacion: ' || SQLERRM);
END;
/

PROMPT =============================================================================
PROMPT [5/5] PROCEDIMIENTO 3: PURGA DE AUDITORIA POR POLITICA DE RETENCION (DBA)
PROMPT =============================================================================

CREATE OR REPLACE PROCEDURE SP_PURGAR_AUDITORIA_RETENCION (
    p_dias_retencion IN  NUMBER DEFAULT 90,
    o_filas_purgadas OUT NUMBER
)
IS
    v_fecha_limite TIMESTAMP;
BEGIN
    v_fecha_limite := SYSTIMESTAMP - NUMTODSINTERVAL(p_dias_retencion, 'DAY');

    DELETE FROM AUDITORIA 
     WHERE FECHA_OPERACION < v_fecha_limite;
    
    o_filas_purgadas := SQL%ROWCOUNT;
    
    -- Registrar en log la ejecucion de la purga
    INSERT INTO AUDITORIA (
        TABLA_AFECTADA, OPERACION, USUARIO_BD, 
        FECHA_OPERACION, DETALLE_CAMBIO
    ) VALUES (
        'AUDITORIA', 'PURGE', USER,
        SYSTIMESTAMP, 'Purga ejecutada: ' || o_filas_purgadas || ' registros eliminados anteriores a ' || TO_CHAR(v_fecha_limite, 'YYYY-MM-DD HH24:MI:SS')
    );

    COMMIT;
    DBMS_OUTPUT.PUT_LINE('>> Purga completada: ' || o_filas_purgadas || ' registros depurados.');
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE_APPLICATION_ERROR(-20030, 'Error en purga de auditoria: ' || SQLERRM);
END;
/

PROMPT =============================================================================
PROMPT PROCEDIMIENTOS Y FUNCIONES PL/SQL COMPILADOS SATISFACTORIAMENTE
PROMPT =============================================================================
