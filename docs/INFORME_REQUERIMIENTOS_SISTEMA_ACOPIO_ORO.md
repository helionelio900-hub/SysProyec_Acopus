# INFORME DE INGENIERÍA DE REQUERIMIENTOS

# SISTEMA DE CONTROL Y ACOPIO DE ORO (MÓDULOS: MINERO | G2 | G1)

## 1. INTRODUCCIÓN Y OBJETIVO GENERAL

El presente documento establece la especificación formal de requerimientos para el desarrollo del Sistema Automatizado de Acopio y Liquidación de Oro. El objetivo principal es reemplazar las operaciones y cálculos manuales por un flujo digital estandarizado, garantizando trazabilidad, precisión en las liquidaciones financieras y un control claro entre los tres actores principales de la cadena: **Minero, Acopiador (G2) y Administrador Mayorista (G1).**

## 2. ESTRUCTURA MODULAR DEL SISTEMA

## 2.1 Módulo 1: Minero (Cotizador Estimativo / Consulta Rápida)

| **📌 RESUMEN DEL MÓDULO MINERO** • Propósito: Brindar al minero una estimación previa y transparente del valor de su mineral antes de acudir al acopio. • Entradas del Usuario: Peso del oro bruto (sin fundir) en gramos. • Datos del Sistema: Precio predeterminado del gramo de oro del día (fijado por el sistema). • Cálculo Automático: Estimación de la bajada/merma por fundición (ej. 20g bruto ➔ 19g neto estimado). • Fórmula: Monto Estimado = (Peso Neto Estimado) x (Precio Predeterminado del Día). • Delimitación: La sesión concluye inmediatamente tras mostrar la cotización en pantalla. |

## 2.2 Módulo 2: G2 (Acopiador Directo / Operación y Control Semanal)

El módulo G2 gestiona la recepción física del oro bruto, la fundición real, el pago directo al minero y la consolidación semanal de las compras realizadas.

| **Componente / Etapa** | **Detalle Operativo** | | 1. Atención Presencial al Minero | Fundición física real, pesaje del oro fundido (neto) y clasificación por tipo/color (Rojo o Verde). Liquidación: (Oro Fundido) x (Precio Actual del Día). | | 2. Registro de Transacción | Registro obligatorio de: Nombre del Minero, Peso Sin Fundir, Peso Fundido, Color (Rojo/Verde), Precio Actual aplicado y Pago Total. | | 3. Panel Inferior de Totales | Cálculo y muestra de sumatorias acumuladas estrictamente separadas: 🔴 Oro Rojo: Total Gramos Fundidos + Total Soles Pagados 🟢 Oro Verde: Total Gramos Fundidos + Total Soles Pagados | | 4. Cierre Semanal hacia G1 | Entrega semanal del oro fundido acumulado (separado en Rojo y Verde) a G1 para solicitar liquidación semanal. |

## 2.3 Módulo 3: G1 (Administrador Mayorista / Consolidación Final)

El módulo G1 se encarga de recepcionar semanalmente el oro procesado por G2, aplicar las cotizaciones internacionales del mercado (Onza y Dólar) y consolidar el control financiero general del negocio.

| **Fase de Gestión G1** | **Descripción y Fórmulas** | | 1. Liquidación Presencial a G2 | G1 recibe presencialmente el oro fundido (Rojo/Verde). Ingresa la cotización de la Onza y el Tipo de Cambio (Dólar). Deriva el precio unitario por gramo segun color y liquida el pago a G2. | | 2. Registro de Transacción G1 | Almacena: Nombre de G2, Peso de Oro Fundido, Color (Rojo/Verde), Tipo de Cambio Dólar, Precio de la Onza, Precio derivado y Pago Total a G2. | | 3. Registro Consolidado Final | Genera el resumen consolidado general: 🔴 Sumatoria Total Oro Fundido Rojo 🟢 Sumatoria Total Oro Fundido Verde 💰 Sumatoria Total de Pagos Desembolsados por G1 |

## 3. DIAGRAMAS DE FLUJO Y PROCESOS DEL SISTEMA

## 3.1 Diagrama de Flujo - Módulo Minero

| **Paso 1: Inicio** | Minero accede a la pantalla de Cotización Rápida | | Paso 2: Entrada | Ingresa el peso de Oro Bruto (sin fundir) en gramos | | Paso 3: Consulta | Sistema obtiene automáticamente el Precio Predeterminado del día | | Paso 4: Procesamiento | Sistema calcula la reducción/merma estimada de fundición | | Paso 5: Cálculo | Monto Estimado = (Peso Neto Estimado) x (Precio Predeterminado) | | **Paso 6: Fin** | Muestra resultado final estimado en pantalla al Minero |

## 3.2 Diagrama de Flujo - Módulo G2 (Acopiador)

| **1. Recepción & Fundición** | Minero entrega oro bruto. G2 realiza fundición física, pesa oro fundido y clasifica en Rojo o Verde. | | **2. Liquidación a Minero** | Calcula Pago = (Oro Fundido) x (Precio Actual). Entrega dinero al Minero (Fin de atención). | | **3. Registro en Sistema** | Registra: Nombre Minero, Peso Sin Fundir, Peso Fundido, Color (Rojo/Verde), Precio Actual y Total Pagado. | | **4. Totales Separados** | Panel inferior calcula sumatorias independientes para 🔴 Oro Rojo y 🟢 Oro Verde. | | **5. Cierre Semanal** | G2 lleva físicamente el lote acumulado de oro fundido a G1 para liquidación semanal. |

## 3.3 Diagrama de Flujo - Módulo G1 (Administrador Mayorista)

| **1. Recepción de G2** | G1 recibe el oro fundido presencialmente. Ingresa valores de mercado (Onza y Dólar). | | **2. Liquidación a G2** | Calcula precio derivado por gramo según color (Rojo/Verde) y paga el monto total a G2. | | **3. Registro G1** | Registra: Nombre de G2, Oro Fundido, Color, Tipo de Cambio Dólar, Onza, Precio derivado y Total. | | **4. Consolidado Final** | Panel de control general consolida sumatorias de Oro Rojo, Oro Verde y Total Dinero desembolsado. |

## 3.4 Diagrama Integrado del Sistema (Flujo Completo End-to-End)

| **🔄 FLUJO INTEGRADO DE OPERACIÓN** 1. MINERO (Cotizador) ➔ Ingresa oro bruto ➔ Ve estimación de bajada/cotización en pantalla (Finaliza consulta). 2. G2 (Acopiador) ➔ Recibe oro bruto ➔ Funde de verdad ➔ Pesa oro fundido ➔ Separa Rojo/Verde ➔ Paga al minero ➔ Registra compra ➔ Suma acumulados por color (Panel inferior) ➔ Cierre semanal. 3. G1 (Administrador) ➔ Recibe oro fundido de G2 semanalmente ➔ Ingresa Onza y Dólar ➔ Deriva precio por gramo ➔ Paga a G2 ➔ Registra compra ➔ Visualiza Consolidado General de oro y dinero. |

## 4. REQUERIMIENTOS NO FUNCIONALES Y REGLAS DE SEGURIDAD

**• Separación de Categorías:** El Oro Rojo y el Oro Verde bajo ninguna circunstancia deben mezclarse en los totales de los módulos G2 y G1 due a sus diferencias de pureza y cotización.

**• Seguridad y Control de Acceso (RBAC):** El Módulo Minero cuenta con acceso libre consultativo. Los Módulos G2 y G1 requieren autenticación obligatoria con usuario y contraseña segura.

**• Integridad y Tiempo Real:** Toda transacción registrada en G2 o G1 debe recalcular instantáneamente los totales acumulados y consolidados.

**• Usabilidad y Movilidad:** La interfaz debe ser altamente intuitiva, responsiva y adaptable para operar con facilidad en tablets, laptops o celulares en zonas de acopio.
