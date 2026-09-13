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

## 5. Corte arquitectónico U1 y trazabilidad LP2–BD2

Este documento es la referencia de alcance del proyecto (brief funcional). En U1
hay cuatro módulos implementados: parametros, cotizador, acopiador y mayorista.
Seguridad y la matriz RBAC de la sección 4 son diseño previsto para U2/S10;
no describen permisos ya aplicados por el backend actual.

La vista de componentes C3 del monolito es:

```text
Cliente REST / Swagger
        |
        v
SitraOroBackendApplication (una JVM, un proyecto Maven)
  parametros: MineroController -> MineroService -> MineroRepository
  cotizador:  CotizadorController -> CotizadorService
  acopiador:  AcopiadorController -> AcopiadorService -> TransaccionG2Repository
  mayorista:  MayoristaController -> MayoristaService -> LiquidacionG1Repository
        |
        v
Un DataSource -> Oracle XEPDB1
```

Dependencias entre módulos: cotizador y acopiador consumen contratos públicos de
parametros; mayorista consume AcopiadorService. Los repositorios no cruzan módulos.
El puerto DashboardAcopioPort se define en parametros y lo implementa acopiador.
La relación ORM usa Minero, exportado por parametros-model.

La liquidación contiene `LiquidacionG1` y `DetalleLiquidacionG1`; por ello, el modelo
actual tiene cinco tablas, incluyendo DETALLE_LIQUIDACIONES_G1 además de las cuatro
listadas en el diseño inicial de la sección 3. Cada color aparece una vez por cierre.
Un cierre válido incluye todo el stock pendiente del color y registra estado REGISTRADA.
El precio usa 31.1035 g/onza y un diferencial de 5 % para VERDE. El cierre es atómico:
si falla un detalle, no se conservan cabecera, detalles ni descuentos parciales.

Para la ejecución LP2 actual se usa `bd2/S01_03_tablas_bomerp_app.sql`, que crea
las cinco tablas en el usuario conectado, seguido de `bd2/S05_indices.sql`.
Las entidades JPA no fijan schema. El esquema BOM_ACOPIO de los scripts S01_02 y
S04_02 es una alternativa de propiedad física documentada para BD2, no una segunda
base que se deba mezclar con las tablas del usuario ejecutor. El monolito mantiene
propiedad funcional por módulo aunque use un solo esquema físico.

Las reglas de cálculo y stock se implementan en los servicios Java; BD2 aporta
PK, FK, unicidad, CHECK de tipos/estado e índices. No se atribuyen a procedimientos
PL/SQL de negocio inexistentes. La verificación Oracle instala el DDL de BD2 y
arranca Hibernate en modo validate antes de probar commit, rollback y consultas.
