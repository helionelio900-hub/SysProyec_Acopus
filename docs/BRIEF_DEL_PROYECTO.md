# BRIEF DEL PROYECTO

**SITRA-ORO — SISTEMA DE INFORMACIÓN, TRAZABILIDAD Y LIQUIDACIÓN EN ACOPIO DE ORO (sitra-oro)**

| **Institución:** Universidad Peruana Unión (UPeU) – Campus Juliaca **Ciclo y Semestre:** Ciclo IV – Semestre Académico 2026-II **Línea Curricular:** ADS (Análisis y Diseño) | BD2 (Base de Datos II) | LP2 (Lenguaje de Programación II) **Equipo de Desarrollo (Equipo 05):** Faijo Calisaya Helio Paul & Figueroa Chambi Jhymel Nelio |

## 1. Descripción General del Proyecto

**SITRA-ORO (Sistema de Información, Trazabilidad y Liquidación en Acopio de Oro)** es una solución empresarial full-stack desarrollada para modernizar, estandarizar y digitalizar las operaciones de compra, fundición, pesaje, cotización y liquidación financiera en centros de acopio de oro artesanal.

El sistema reemplaza los cálculos manuales y cuadernos físicos de apuntes mediante un flujo transaccional seguro y confiable, garantizando la **trazabilidad precisa del mineral** desde su pesaje bruto inicial, pasando por la determinación de la merma tras la fundición física y su separación estricta por calidad (**Oro Rojo** vs. **Oro Verde**), hasta la liquidación final con compradores mayoristas basada en la cotización internacional de la Onza Troy USD y el tipo de cambio oficial.

## 2. Especificación Modular del Sistema

## 2.1 Módulo 1: Seguridad y Control de Acceso (seguridad)

# Tipo: [Transversal / Infraestructura de Acceso]

**Descripción:**Módulo transversal encargado de garantizar la protección del sistema, autenticación de usuarios, gestión de sesiones sin estado mediante tokens JWT y autorización basada en roles (RBAC).

# Requerimientos Funcionales:

- RF-SEG-01:**Registrar usuarios internos con contraseñas encriptadas mediante algoritmo BCrypt. * **RF-SEG-02:**Autenticar usuarios mediante credenciales seguras (usuario/correo y contraseña). * **RF-SEG-03:**Emitir y validar tokens JSON Web Tokens (JWT) para autorizar peticiones en el backend. * **RF-SEG-04:**Restringir el acceso a vistas y endpoints según roles del sistema (ROLE\_G2\_ACOPIADOR, ROLE\_G1\_MAYORISTA). * **RF-SEG-05:**Proveer mecanismo de cierre de sesión e invalidación de contexto seguro.

**Programador Responsable:** **Faijo Calisaya Helio Paul & Figueroa Chambi Jhymel Nelio (Desarrollo colaborativo)**

## 2.2 Módulo 2: Compras y Acopio Presencial (acopiador)

# Tipo: [Transaccional 1 (G2 Compras)]

**Descripción:**Módulo transaccional principal para el puesto de acopio presencial (G2). Gestiona la recepción física del oro entregado por mineros, el pesaje bruto, la fundición real con cálculo de merma, la clasificación por calidad y la emisión del comprobante de pago en efectivo.

# Requerimientos Funcionales:

- RF-ACO-01:**Registrar una nueva transacción de compra presencial vinculando al minero artesanal. * **RF-ACO-02:**Capturar el peso bruto inicial (sin fundir) y el peso neto tras la fundición física. * **RF-ACO-03:**Calcular de forma automática la bajada o merma resultante del proceso de fundición. * **RF-ACO-04:**Clasificar obligatoriamente el lote fundido en Oro Rojo o Oro Verde. * **RF-ACO-05:**Calcular el importe total a liquidar en Soles (PEN) multiplicando gramos fundidos por el precio vigente del día. * **RF-ACO-06:**Consolidar en tiempo real los acumulados del día/semana manteniendo estrictamente separados los totales de Oro Rojo y Oro Verde. * **RF-ACO-07:**Permitir la anulación controlada de una compra con reversión automática de saldos acumulados para auditoría.

# Programador Responsable:** **Faijo Calisaya Helio Paul

## 2.3 Módulo 3: Liquidaciones y Cierres Mayoristas (mayorista)

# Tipo: [Transaccional 2 (G1 Cierres)]

**Descripción:**Módulo transaccional de consolidación para el comprador mayorista (G1). Procesa el cierre y compra del lote semanal acumulado por el acopiador (G2), aplicando la Cotización internacional de la Onza Troy en USD y el Tipo de Cambio oficial a Soles.

# Requerimientos Funcionales:

- RF-MAY-01:**Consolidar el lote total de gramos acumulados por el acopiador G2 al término del periodo semanal. * **RF-MAY-02:**Registrar los parámetros del mercado internacional: valor de la Onza Troy USD y Tipo de Cambio oficial (USD a PEN). * **RF-MAY-03:**Determinar el precio resultante por gramo en Soles diferenciado según el tipo de oro (Rojo o Verde). * **RF-MAY-04:**Liquidar la transacción semanal emitiendo comprobante y marcando lotes como cerrados/transferidos. * **RF-MAY-05:**Registrar el desembolso financiero total realizado por G1 hacia el acopiador G2. * **RF-MAY-06:**Consultar el histórico detallado de cierres semanales y comprobantes de liquidación.

# Programador Responsable:** **Figueroa Chambi Jhymel Nelio

## 2.4 Módulo 4: Cotizador y Simulación Pública (cotizador)

# Tipo: [No Transaccional 1 (Simulador Minero)]

**Descripción:**Módulo informativo y consultivo de acceso público abierto en la web/móvil para los mineros artesanales. Permite simular el valor económico aproximado de su mineral antes de viajar al centro de acopio físico, sin necesidad de iniciar sesión.

# Requerimientos Funcionales:

- RF-COT-01:**Permitir al minero ingresar la cantidad de gramos de oro bruto estimado a consultar. * **RF-COT-02:**Calcular una merma/bajada proyectada basada en promedios referenciales de fundición. * **RF-COT-03:**Calcular y mostrar en pantalla el importe estimado en Soles (PEN) que recibiría según la tarifa oficial del día. * **RF-COT-04:**Mostrar una tabla referencial con rangos de peso y valores estimados para orientación del minero. * **RF-COT-05:**Garantizar que la consulta sea volátil (en memoria), sin persistir transacciones en base de datos ni requerir login.

# Programador Responsable:** **Faijo Calisaya Helio Paul

## 2.5 Módulo 5: Parámetros Maestros y Dashboard (parametros)

# Tipo: [No Transaccional 2 (Configuración y Analítica)]

**Descripción:**Módulo administrativo y de soporte para la gestión de parámetros globales de negocio, tarifas base, catálogo de mineros y visualización de indicadores clave (KPIs) en el Dashboard general.

# Requerimientos Funcionales:

- RF-PAR-01:**Consultar el precio oficial vigente del gramo de oro del día. * **RF-PAR-02:**Permitir la actualización del precio diario del gramo de oro (restringido al rol ROLE\_G1\_MAYORISTA). * **RF-PAR-03:**Administrar el catálogo maestro de mineros recurrentes (nombres, DNI, procedencia/zona minera). * **RF-PAR-04:**Mostrar el histórico cronológico de variación de los precios del oro. * **RF-PAR-05:**Generar y presentar el Dashboard Consolidado con métricas de gramos acopiados (Rojo vs. Verde), total desembolsado y cantidad de operaciones.

# Programador Responsable:** **Figueroa Chambi Jhymel Nelio

## 3. Resumen y Asignación de Responsabilidades

| **N°** | **Nombre del Módulo** | **Tipo Arquitectónico** | **Programador Responsable** | **Aporte en Línea Curricular** | | **1** | **Seguridad (seguridad)** | Transversal | Faijo Calisaya Helio Paul & Figueroa Chambi Jhymel Nelio | JWT, BCrypt, Security Filters, UserDetails | | **2** | **Acopiador (acopiador)** | Transaccional 1 | Faijo Calisaya Helio Paul | Compras G2, Fundición Real, Oro Rojo/Verde | | **3** | **Mayorista (mayorista)** | Transaccional 2 | Figueroa Chambi Jhymel Nelio | Cierres G1, Onza Troy USD, Tipo de Cambio | | **4** | **Cotizador (cotizador)** | No Transaccional 1 | Faijo Calisaya Helio Paul | Simulador Minero, Merma, Cálculo en Memoria | | **5** | **Parámetros (parametros)** | No Transaccional 2 | Figueroa Chambi Jhymel Nelio | Precios Diarios, Mineros, Dashboard KPIs |

*Proyecto Integrador Ciclo IV – SITRA-ORO Acopio de Oro – 2026 UPeU Campus Juliaca*
