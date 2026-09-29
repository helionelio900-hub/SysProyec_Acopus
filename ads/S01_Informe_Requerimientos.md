# INFORME DE INGENIERÍA DE REQUERIMIENTOS Y ARQUITECTURA DE SOFTWARE
## PROYECTO: SITRA-ORO - SISTEMA DE INFORMACIÓN, TRAZABILIDAD Y LIQUIDACIÓN EN ACOPIO DE ORO (`sitra-oro`)

---

## 1. RESUMEN EJECUTIVO

El proyecto **`sitra-oro`** (**SITRA-ORO**) es un sistema automatizado empresarial desarrollado para digitalizar, controlar, garantizar la trazabilidad y liquidar financieramente el acopio de oro artesanal. El sistema reemplaza los cálculos manuales por un flujo digital transparente y trazable entre los tres actores principales de la cadena: **Minero**, **Acopiador (G2)** y **Administrador Mayorista (G1)**.

---

## 2. ESTRUCTURA FUNCIONAL DEL SISTEMA

El sistema comprende **1 módulo de seguridad, 2 módulos transaccionales y 3 módulos no transaccionales**:

| # | Nombre del Módulo | Tipo de Módulo | Descripción y Alcance |
|---|---|---|---|
| **1** | **`seguridad`** | **Módulo de Seguridad** | Autenticación con JWT (JSON Web Token), BCrypt y control de acceso RBAC (`ROLE_MINERO`, `ROLE_G2_ACOPIADOR`, `ROLE_G1_MAYORISTA`). |
| **2** | **`minero`** | **Portal de autoservicio** | Registro e inicio de sesión del minero, elección de centro preferido y consulta/actualización de su propio perfil. Reutiliza el catálogo maestro `MINEROS`. |
| **3** | **`acopiador`** | **Transaccional 1** | Registro de fundición real de oro bruto, pesaje neto, clasificación en 🔴 **Oro Rojo** / 🟢 **Oro Verde**, pago directo y registro en `TRANSACCIONES_G2`. Incluye validación presencial de cuentas mineras pendientes. |
| **4** | **`mayorista`** | **Transaccional 2 / administración de centros** | Cierre semanal presencial G2-G1, ingreso de Cotización Onza USD y Tipo Cambio Dólar, liquidación financiera y registro en `LIQUIDACIONES_G1`. Administra centros de acopio y crea sus cuentas G2. |
| **5** | **`cotizador`** | **No Transaccional 1** | Consulta rápida y estimativa para visitantes y mineros (sin login), calculando la bajada/merma estimativa y monto aproximado sin persistir compras ni reservar precio. |
| **6** | **`parametros`** | **No Transaccional 2** | Registro del catálogo maestro de mineros, configuración de precios del día, tasa de merma estándar y Dashboard Consolidado con sumatorias por color. |

---

## 3. ESQUEMA DE BASE DE DATOS Y TABLAS (ORACLE - BD2)

El esquema de base de datos implementa las siguientes tablas en Oracle:

1. **`PARAMETROS_SISTEMA`:** Mantiene la cotización del día, porcentaje de merma estimado, precio Onza USD y Tipo de Cambio.
2. **`MINEROS`:** Catálogo maestro de mineros registrados.
3. **`TRANSACCIONES_G2`:** Almacena las compras individuales de G2 con peso bruto, peso fundido, tipo de oro (`ROJO` o `VERDE`), precio y total pagado.
4. **`LIQUIDACIONES_G1`:** Almacena las liquidaciones semanales efectuadas por G1 a G2.
5. **`DETALLE_LIQUIDACIONES_G1`:** Detalles de cada cierre semanal por tipo de oro.
6. **`CUENTAS_ACCESO`:** Documento de acceso, hash BCrypt, rol, estado y vínculos al minero o centro asignado; nunca almacena claves en texto plano.
7. **`CENTROS_ACOPIO`:** Centros creados por el mayorista, con datos de atención y la cuenta de su acopiador.

---

## 4. MATRIZ DE SEGURIDAD Y PERMISOS (RBAC)

| Módulo / Funcionalidad | Visitante / Minero | Acopiador (`ROLE_G2_ACOPIADOR`) | Mayorista (`ROLE_G1_MAYORISTA`) |
|---|:---:|:---:|:---:|
| **Cotizador Estimativo** | ✔️ | ✔️ | ✔️ |
| **Consultar centros y registrarse** | ✔️ | ❌ | ❌ |
| **Consultar/actualizar perfil propio y centro preferido** | ✔️ | ❌ | ❌ |
| **Validar en persona una cuenta minera pendiente** | ❌ | ✔️ | ❌ |
| **Registrar Compra / Fundición G2** | ❌ | ✔️ | ❌ |
| **Sumatorias Acumuladas G2** | ❌ | ✔️ | ❌ |
| **Ingresar Onza USD / Tipo Cambio** | ❌ | ❌ | ✔️ |
| **Liquidación Semanal G1** | ❌ | ❌ | ✔️ |
| **Crear centros y cuentas de acopio** | ❌ | ❌ | ✔️ |
| **Dashboard Consolidado General** | ❌ | ❌ | ✔️ |

## 5. Corte arquitectónico U1 y trazabilidad LP2–BD2

Este apartado conserva la línea base funcional U1. La evolución del módulo Minero
y la activación de seguridad/RBAC se documentan en la sección 6.

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

## 6. Evolución S07: módulo Minero y acceso por roles

El backend incorpora un portal minero separado del CRUD de catálogo usado por
Acopio. La entidad `MINEROS` se conserva porque las compras existentes la referencian;
`CUENTAS_ACCESO` contiene las credenciales y enlaza el usuario autenticado con el
registro maestro. La contraseña se almacena con BCrypt y los endpoints internos
usan JWT de acceso temporal y roles.

Recorrido implementado:

1. El mayorista crea un centro y una cuenta `ROLE_ACOPIADOR` desde
   `POST /api/v1/mayorista/centros-acopio`.
2. El visitante consulta centros activos en `GET /api/v1/publico/centros-acopio` y
   puede registrarse sin que se cree una transacción de compra.
3. Si el documento ya tiene registro histórico en `MINEROS`, la cuenta queda
   pendiente y el acopiador del centro elegido valida presencialmente el documento
   antes de activarla. Las cuentas nuevas de minero se crean junto con el registro
   maestro, sin duplicar documentos.
4. El minero ingresa desde cualquier dispositivo con documento y clave, consulta su
   perfil y puede cambiar su centro preferido. Su token no autoriza consultas sobre
   otros mineros ni operaciones de Acopio.
5. La cotización pública sigue siendo estimativa y no reserva precio. El precio y
   pago de una compra se registran cuando Acopio procesa la entrega.

La seguridad es stateless. El JWT se firma con `SITRAORO_JWT_SECRET`; para el primer
mayorista se usan las variables `SITRAORO_BOOTSTRAP_MAYORISTA_DOCUMENTO` y
`SITRAORO_BOOTSTRAP_MAYORISTA_CLAVE`. En desarrollo, sin una clave definida se genera
una clave temporal en memoria. En los esquemas Oracle existentes se debe ejecutar
`bd2/S07_01_tablas_minero_seguridad.sql` una vez antes de arrancar con Hibernate en
modo validate.
