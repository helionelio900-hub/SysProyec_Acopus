# LP2 - Lenguaje de Programación II (`sitra-oro`)

Carpeta del curso **Lenguaje de Programación II** para la implementación del backend y frontend de **SITRA-ORO** (*Sistema de Información, Trazabilidad y Liquidación en Acopio de Oro*).

## Alcance del Backend: 5 Módulos (`sitra-oro`)

El backend está desarrollado en **Java 21 + Spring Boot 4 + Spring Modulith**, conectándose a la base de datos Oracle (`SITRA_ACOPIO` / `BOM_ACOPIO`). Se organiza en **1 Módulo de Seguridad, 2 Módulos Transaccionales y 2 Módulos No Transaccionales**:

### 🔐 1. Módulo de Seguridad (1 Módulo)
1. **`seguridad` (Auth & RBAC):**
   * Autenticación con JWT (JSON Web Token) y BCrypt.
   * Control de acceso basado en roles (`ROLE_MINERO`, `ROLE_G2_ACOPIADOR`, `ROLE_G1_MAYORISTA`).

### 🔄 2. Módulos Transaccionales (2 Módulos)
2. **`acopiador` (Módulo Transaccional 1 - G2):**
   * Registro presencial de compras de oro bruto y fundición real a mineros.
   * Clasificación obligatoria por tipo/color (`ROJO` / `VERDE`).
   * Desembolso inmediato de dinero y acumulación semanal.
3. **`mayorista` (Módulo Transaccional 2 - G1):**
   * Cierre semanal a G2 basado en Cotización Internacional (Onza USD) y Tipo de Cambio USD/PEN.
   * Pago consolidado a G2 y registro de liquidaciones.

### ℹ️ 3. Módulos No Transaccionales (2 Módulos)
4. **`cotizador` (Módulo No Transaccional 1 - Minero):**
   * Endpoint público de consulta estimativa para el Minero (sin login).
   * Cálculo automático de bajada/merma y cotización previa sin guardar registros de compra.
5. **`parametros` (Módulo No Transaccional 2 - Maestros & Analítica):**
   * Registro y mantenimiento de catálogo de Mineros.
   * Actualización del precio diario del gramo y porcentaje de merma.
   * Dashboard informativo con reporte acumulado consolidado por color.
