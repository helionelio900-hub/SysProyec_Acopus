# BRIEF DEL PROYECTO

---

### Datos Generales del Proyecto

* **Nombre del proyecto:** `SITRA-ORO - Sistema de Información, Trazabilidad y Liquidación en Acopio de Oro (sitra-oro)`
* **Institución:** Universidad Peruana Unión (UPeU) - Campus Juliaca
* **Ciclo / Semestre:** Ciclo IV - Semestre 2026-II
* **Cursos articulados:** 
  * Análisis y Diseño de Sistemas de Información (ADS)
  * Administración de Base de Datos II (BD2)
  * Lenguaje de Programación II (LP2)
* **Equipo de Desarrollo (Equipo 05):**
  * Faijo Calisaya Helio Paul
  * Figueroa Chambi Jhymel Nelio

---

### Descripción General del Proyecto

**SITRA-ORO** es una solución empresarial full-stack desarrollada para modernizar, estandarizar y digitalizar las operaciones de compra, fundición, pesaje, cotización, trazabilidad y liquidación financiera en centros de acopio de oro artesanal. 

El sistema reemplaza los cálculos manuales y cuadernos físicos de apuntes mediante un flujo transaccional seguro y confiable, garantizando la trazabilidad precisa del mineral desde su pesaje bruto inicial, pasando por la merma tras la fundición física y su separación estricta por color/calidad (**Oro Rojo** vs. **Oro Verde**), hasta la liquidación final con compradores mayoristas basada en precios internacionales (Onza Troy USD) y tipo de cambio.

---

## Especificación Modular del Sistema

El sistema está compuesto por **5 módulos arquitectónicos** estructurados bajo el estándar de monolito modular con límites explícitos de dominio:

```text
pe.edu.upeu.sitraoro.acopio/
├── 🔐 seguridad/    (Módulo Transversal: Autenticación, JWT, Encriptación BCrypt, Roles RBAC)
├── 🔄 acopiador/    (Módulo Transaccional 1: Compras G2, Fundición real, Separación Rojo/Verde)
├── 🔄 mayorista/    (Módulo Transaccional 2: Liquidaciones G1, Cierres Semanales, Onza Troy/USD)
├── ℹ️ cotizador/    (Módulo No Transaccional 1: Simulador público para Mineros, Merma/Bajada)
└── ℹ️ parametros/   (Módulo No Transaccional 2: Precios diarios, Catálogo Mineros, Dashboard)
```

---

### 1. Módulo: `seguridad` (Transversal)

* **Tipo:** Módulo Transversal / Infraestructura de Acceso.
* **Descripción:**  
  Módulo encargado de garantizar la protección del sistema, el control de acceso autenticado, la gestión de sesiones sin estado mediante tokens criptográficos y la autorización basada en roles para salvaguardar las transacciones financieras.

* **Requerimientos Funcionales:**
  * **RF-SEG-01:** Permitir el registro de usuarios internos con contraseñas encriptadas mediante BCrypt.
  * **RF-SEG-02:** Autenticar usuarios en el sistema mediante credenciales válidas (usuario/correo y contraseña).
  * **RF-SEG-03:** Emitir y validar tokens JSON Web Tokens (JWT) para autorizar peticiones en el backend.
  * **RF-SEG-04:** Controlar el acceso a los endpoints y vistas según los roles del sistema (`ROLE_G2_ACOPIADOR`, `ROLE_G1_MAYORISTA`).
  * **RF-SEG-05:** Proveer el mecanismo de cierre de sesión e invalidación de contexto seguro.

* **Programadores Responsables:**  
  `Faijo Calisaya Helio Paul` y `Figueroa Chambi Jhymel Nelio` *(Desarrollo colaborativo)*

---

### 2. Módulo: `acopiador` (Transaccional 1 — G2 Compras)

* **Tipo:** **Módulo Transaccional 1**
* **Descripción:**  
  Módulo transaccional núcleo para el puesto de acopio presencial (G2). Gestiona la recepción física del oro entregado por mineros, el pesaje bruto, la fundición real con cálculo de merma, la clasificación estricta por calidad de oro y la emisión del comprobante de pago en efectivo.

* **Requerimientos Funcionales:**
  * **RF-ACO-01:** Registrar una nueva transacción de compra presencial vinculando al minero artesanal.
  * **RF-ACO-02:** Capturar el peso bruto inicial (sin fundir) y el peso neto tras el proceso de fundición física.
  * **RF-ACO-03:** Calcular de forma automática la bajada o merma resultante de la fundición.
  * **RF-ACO-04:** Clasificar obligatoriamente el lote fundido en **Oro Rojo** o **Oro Verde**.
  * **RF-ACO-05:** Calcular el importe total a liquidar al minero en Soles (PEN) multiplicando los gramos fundidos reales por el precio vigente del día.
  * **RF-ACO-06:** Consolidar en tiempo real los acumulados de gramos y desembolsos del día/semana, **manteniendo estrictamente separados los totales de Oro Rojo y Oro Verde**.
  * **RF-ACO-07:** Permitir la anulación controlada de una compra con reversión automática de saldos acumulados para auditoría.

* **Programador Responsable:**  
  `Faijo Calisaya Helio Paul`

---

### 3. Módulo: `mayorista` (Transaccional 2 — G1 Cierres y Liquidaciones)

* **Tipo:** **Módulo Transaccional 2**
* **Descripción:**  
  Módulo transaccional de consolidación comercial para el comprador mayorista (G1). Procesa el cierre y compra del lote semanal acumulado por el acopiador (G2), aplicando las fórmulas del mercado financiero internacional (Cotización Onza Troy en USD y Tipo de Cambio a Soles).

* **Requerimientos Funcionales:**
  * **RF-MAY-01:** Consolidar el lote total de gramos acumulados por el acopiador G2 al término del periodo semanal.
  * **RF-MAY-02:** Registrar los parámetros del mercado internacional: valor de la Onza Troy de Oro en Dólares (USD) y Tipo de Cambio oficial (USD a PEN).
  * **RF-MAY-03:** Determinar el precio resultante por gramo en Soles diferenciado según el tipo de oro (**Rojo** o **Verde**).
  * **RF-MAY-04:** Liquidar la transacción semanal emitiendo el comprobante de liquidación y marcando los lotes como cerrados/transferidos.
  * **RF-MAY-05:** Registrar el desembolso total de dinero realizado por G1 hacia el acopiador G2.
  * **RF-MAY-06:** Consultar el histórico detallado de cierres semanales y comprobantes de liquidación para balances contables.

* **Programador Responsable:**  
  `Figueroa Chambi Jhymel Nelio`

---

### 4. Módulo: `cotizador` (No Transaccional 1 — Simulación Minero)

* **Tipo:** **Módulo No Transaccional 1**
* **Descripción:**  
  Módulo informativo y consultivo de acceso público abierto en la web/móvil para los mineros artesanales. Permite simular el valor económico aproximado de su mineral antes de viajar al centro de acopio físico, sin necesidad de iniciar sesión.

* **Requerimientos Funcionales:**
  * **RF-COT-01:** Permitir al minero ingresar la cantidad de gramos de oro bruto estimado a consultar.
  * **RF-COT-02:** Calcular una merma/bajada proyectada basada en promedios referenciales de fundición.
  * **RF-COT-03:** Calcular y mostrar en pantalla el importe estimado en Soles (PEN) que recibiría según la tarifa oficial del día.
  * **RF-COT-04:** Mostrar una tabla referencial con rangos de peso y valores estimados para orientación del minero.
  * **RF-COT-05:** Garantizar que la consulta sea volátil (en memoria), sin persistir transacciones en base de datos ni requerir autenticación.

* **Programador Responsable:**  
  `Faijo Calisaya Helio Paul`

---

### 5. Módulo: `parametros` (No Transaccional 2 — Configuración y Analítica)

* **Tipo:** **Módulo No Transaccional 2**
* **Descripción:**  
  Módulo administrativo y de soporte para la gestión de parámetros globales de negocio, tarifas base, catálogo de mineros y visualización de indicadores clave (KPIs) en el Dashboard general.

* **Requerimientos Funcionales:**
  * **RF-PAR-01:** Consultar el precio oficial vigente del gramo de oro del día.
  * **RF-PAR-02:** Permitir la actualización del precio diario del gramo de oro (restringido al rol `ROLE_G1_MAYORISTA`).
  * **RF-PAR-03:** Administrar el catálogo maestro de mineros recurrentes (nombres, DNI, procedencia/zona minera).
  * **RF-PAR-04:** Mostrar el histórico cronológico de variación de los precios del oro.
  * **RF-PAR-05:** Generar y presentar el **Dashboard Consolidado** con métricas gráficas: total de gramos acopiados (Rojo vs. Verde), total de dinero desembolsado y número de operaciones realizadas.

* **Programador Responsable:**  
  `Figueroa Chambi Jhymel Nelio`

---

## Resumen y Asignación de Responsabilidades

| N° | Nombre del Módulo | Tipo Arquitectónico | Programador Responsable | Aporte en Línea Curricular |
| :---: | :--- | :--- | :--- | :--- |
| **1** | **Seguridad** (`seguridad`) | **Transversal** | **Faijo Calisaya Helio Paul** & **Figueroa Chambi Jhymel Nelio** | JWT, BCrypt, Filtros, UserDetails |
| **2** | **Acopiador** (`acopiador`) | **Transaccional 1** | **Faijo Calisaya Helio Paul** | Compras G2, Fundición, Rojo/Verde |
| **3** | **Mayorista** (`mayorista`) | **Transaccional 2** | **Figueroa Chambi Jhymel Nelio** | Cierres G1, Onza USD, Tipo Cambio |
| **4** | **Cotizador** (`cotizador`) | **No Transaccional 1** | **Faijo Calisaya Helio Paul** | Simulador Minero, Cálculo Merma |
| **5** | **Parámetros** (`parametros`) | **No Transaccional 2** | **Figueroa Chambi Jhymel Nelio** | Precios diarios, Mineros, Dashboard |

---

### Criterios de Aceptación y Alcance Técnico

1. **Límites de Dominio Explícitos:** Ningún módulo accederá a los repositorios o tablas internas de otro módulo directamente; toda comunicación intermodular se realizará a través de contratos de servicio o eventos de dominio (Spring Modulith).
2. **Separación de Calidades:** En las entidades, tablas y reportes de base de datos, el **Oro Rojo** y el **Oro Verde** nunca se mezclan ni consolidan juntos, preservando la trazabilidad de pureza y margen financiero.
3. **Persistencia Empresarial:** Base de datos Oracle con esquemas modulares, procedimientos PL/SQL, triggers de auditoría y claves foráneas bien delimitadas.