# INFORME DE INGENIERÍA DE REQUERIMIENTOS Y ARQUITECTURA DE SOFTWARE
## PROYECTO: SITRA-ORO - SISTEMA DE INFORMACIÓN, TRAZABILIDAD Y LIQUIDACIÓN EN ACOPIO DE ORO (`sitra-oro`)

---

## 1. RESUMEN EJECUTIVO

El proyecto **`sitra-oro`** (**SITRA-ORO**) es un sistema automatizado empresarial desarrollado para digitalizar, controlar, garantizar la trazabilidad y liquidar financieramente el acopio de oro artesanal. El sistema reemplaza los cálculos manuales por un flujo digital transparente y trazable entre los tres actores principales de la cadena: **Minero**, **Acopiador (G2)** y **Administrador Mayorista (G1)**.

---

## 2. ESTRUCTURA FORMAL DE 5 MÓDULOS DEL SISTEMA

El sistema se divide en **1 Módulo de Seguridad, 2 Módulos Transaccionales y 2 Módulos No Transaccionales**:

| # | Nombre del Módulo | Tipo de Módulo | Descripción y Alcance |
|---|---|---|---|
| **1** | **`seguridad`** | **Módulo de Seguridad** | Autenticación con JWT (JSON Web Token), BCrypt y control de acceso RBAC (`ROLE_MINERO`, `ROLE_G2_ACOPIADOR`, `ROLE_G1_MAYORISTA`). |
| **2** | **`acopiador`** | **Transaccional 1** | Registro de fundición real de oro bruto, pesaje neto, clasificación en 🔴 **Oro Rojo** / 🟢 **Oro Verde**, pago directo y registro en `TRANSACCIONES_G2`. |
| **3** | **`mayorista`** | **Transaccional 2** | Cierre semanal presencial G2-G1, ingreso de Cotización Onza USD y Tipo Cambio Dólar, liquidación financiera y registro en `LIQUIDACIONES_G1`. |
| **4** | **`cotizador`** | **No Transaccional 1** | Consulta rápida y estimativa para mineros (sin login), calculando la bajada/merma estimativa y monto aproximado sin persistir compras. |
| **5** | **`parametros`** | **No Transaccional 2** | Registro del catálogo de mineros, configuración de precios del día, tasa de merma estándar y Dashboard Consolidado con sumatorias por color. |

---

## 3. ESQUEMA DE BASE DE DATOS Y TABLAS (ORACLE - BD2)

El esquema de base de datos implementa las siguientes tablas en Oracle:

1. **`PARAMETROS_SISTEMA`:** Mantiene la cotización del día, porcentaje de merma estimado, precio Onza USD y Tipo de Cambio.
2. **`MINEROS`:** Catálogo maestro de mineros registrados.
3. **`TRANSACCIONES_G2`:** Almacena las compras individuales de G2 con peso bruto, peso fundido, tipo de oro (`ROJO` o `VERDE`), precio y total pagado.
4. **`LIQUIDACIONES_G1`:** Almacena las liquidaciones semanales efectuadas por G1 a G2.

---

## 4. MATRIZ DE SEGURIDAD Y PERMISOS (RBAC)

| Módulo / Funcionalidad | Público (`ROLE_MINERO`) | Acopiador (`ROLE_G2_ACOPIADOR`) | Mayorista (`ROLE_G1_MAYORISTA`) |
|---|:---:|:---:|:---:|
| **Cotizador Estimativo** | ✔️ | ✔️ | ✔️ |
| **Registrar Compra / Fundición G2** | ❌ | ✔️ | ❌ |
| **Sumatorias Acumuladas G2** | ❌ | ✔️ | ❌ |
| **Ingresar Onza USD / Tipo Cambio** | ❌ | ❌ | ✔️ |
| **Liquidación Semanal G1** | ❌ | ❌ | ✔️ |
| **Dashboard Consolidado General** | ❌ | ❌ | ✔️ |
