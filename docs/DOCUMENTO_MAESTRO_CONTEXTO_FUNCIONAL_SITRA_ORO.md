# UNIVERSIDAD PERUANA UNIÓN
## FACULTAD DE INGENIERÍA Y ARQUITECTURA
### ESCUELA PROFESIONAL DE INGENIERÍA DE SISTEMAS

---

# DOCUMENTO MAESTRO DE ESPECIFICACIÓN FUNCIONAL Y ARQUITECTURA DE DOMINIO
## SISTEMA DE TRAZABILIDAD Y LIQUIDACIÓN EN ACOPIO DE ORO (SITRA-ORO)

**Versión:** 2.0 — Auditoría Funcional Oficial de Negocio  
**Curso:** Lenguaje de Programación II / Análisis y Diseño de Sistemas  
**Ciclo Académico:** IV — Semestre 2026-II  
**Estudiante:** Faijo Calisaya Helio Paul  
**Equipo:** Equipo 05  
**Docente:** Ing. Erick David Salazar  
**Repositorio Oficial:** [https://github.com/helionelio900-hub/SysProyec_Acopus](https://github.com/helionelio900-hub/SysProyec_Acopus)  
**Fecha:** Septiembre de 2026  
**Sede:** Juliaca / Lima, Perú  

---

## 1. CONTROL DE CAMBIOS Y AUDITORÍA DEL DOCUMENTO

| Versión | Fecha | Autor / Rol | Descripción de Modificación | Estado |
| :--- | :--- | :--- | :--- | :--- |
| **v1.0** | 10/09/2026 | Equipo 05 (Helio Calisaya) | Especificación preliminar de requerimientos basada en módulos Minero, G2 (Acopiador) y G1 (Mayorista). Supuesto de diferencial fijo de 5% para oro verde. | *Obsoleta* |
| **v2.0** | 24/09/2026 | Faijo Calisaya Helio Paul | **Actualización Oficial Integral**: Reestructuración según la auditoría funcional maestra. Incorporación de ciclo físico completo en Mayorista (fundición, enfriamiento, limpieza, análisis y LEY), nuevo pesaje independiente en Mayorista, CRUD de Consolidación (Peso + Ley), reubicación de `Minero` en `Acopiador`, descarte definitivo del 5% fijo y registro formal de aspectos `[PENDIENTE DE DEFINICIÓN DEL NEGOCIO]`. | **Vigente / Oficial** |

---

## 2. RESUMEN EJECUTIVO Y OBJETIVO DEL SISTEMA

El proyecto **SITRA-ORO (Sistema de Trazabilidad y Liquidación en Acopio de Oro)** es una solución tecnológica empresarial orientada a garantizar la trazabilidad física, química y financiera del ciclo de comercialización de oro aurífero.

El sistema resuelve la vulnerabilidad de las operaciones manuales y no estandarizadas mediante un software monolítico modular de alta confiabilidad que conecta transparentemente a los actores de la cadena de valor:

$$\text{MINERO} \longrightarrow \text{ACOPIADOR} \longrightarrow \text{MAYORISTA} \longrightarrow \text{EXPORTADOR}$$

### Objetivos Clave:
1. **Trazabilidad Ininterrumpida:** Registrar el historial físico (pesajes, fundiciones, mermas), técnico (pureza/ley) y financiero (liquidaciones, divisas, pagos) del oro desde su extracción primaria hasta la preparación de lotes para exportación.
2. **Precisión Financiera:** Separar de forma tajante las compras transaccionales de las estimaciones informativas, garantizando cálculos auditables sin mezclar flujos de caja.
3. **Segregación Estricta de Calidades:** Mantener la separación del mineral en **Oro ROJO** y **Oro VERDE** a lo largo de todo el acopio, pesaje y liquidación.
4. **Desacoplamiento Operativo:** Respetar la independencia operativa y de pesaje entre Acopiador y Mayorista, reconociendo que cada uno realiza sus propios procesos físicos de control.

---

## 3. CADENA PRINCIPAL DEL NEGOCIO Y ACTORES

```
  +-----------------------------------------------------------------------------------+
  |                                CADENA DE VALOR SITRA-ORO                           |
  +-----------------------------------------------------------------------------------+

     [ MINERO ]                 (Posee y vende el mineral aurífero)
         │
         │  (Consulta opcional previa: Módulo Cotizador - No Transaccional)
         │  (Traslado físico del oro hacia el establecimiento de acopio)
         ▼
    [ ACOPIADOR ]               (Compra primaria, funde, clasifica, paga y acumula)
         │
         │  (Entrega periódica / semanal de oro acumulado dividido en ROJO y VERDE)
         ▼
    [ MAYORISTA ]               (Recibe, pesa de nuevo, limpia, analiza LEY, liquida y paga)
         │
         │  (CRUD Consolidación: Selección de lotes previos mediante PESO + LEY)
         ▼
   [ EXPORTADOR ]               (Actor Externo: Destino comercial internacional)
```

### 3.1 Minero
- Persona natural o jurídica que extrae, posee y comercializa el oro bruto.
- **Interacción con el Cotizador:** Puede realizar consultas estimativas previas del valor de su mineral. Esta consulta no genera comprobante fiscal, no reserva inventario ni pacta un precio vinculante.
- **Venta física:** Se apersona al establecimiento del Acopiador con el mineral para someterlo al pesaje y fundición real.
- **Pertenencia de dominio:** **Pertenece funcionalmente al módulo Acopiador**, quien lo registra y administra para conservar la trazabilidad de origen.

### 3.2 Acopiador
- Agente comercial primario que compra directamente a múltiples mineros en la zona de producción.
- Ejecuta el pesaje inicial, el proceso físico de fundición, enfriamiento y el segundo pesaje (peso neto resultante).
- Determina la clasificación cualitativa del oro: **ROJO** o **VERDE**.
- Liquida y desembolsa el pago real al Minero basándose en el precio de Parámetros.
- Realiza el acopio y almacenamiento segregado (**Acumulado ROJO** y **Acumulado VERDE**).
- Traslada el lote acumulado semanalmente hacia el Mayorista.

### 3.3 Mayorista
- Agente comercial consolidado que adquiere el oro acumulado por los acopiadores.
- **Pesaje independiente:** No asume como definitivo el peso registrado por el Acopiador; realiza su propio pesaje riguroso por separado para ROJO y VERDE.
- **Procesamiento integral:** Ejecuta fundición, enfriamiento y una etapa crítica de **limpieza del oro**.
- **Análisis de Ley:** Determina mediante pruebas físico-químicas o instrumentales el título o pureza exacta del metal (**Ley del Oro**).
- **Liquidación económica:** Integra peso verificado, ley, cotización de la onza, tipo de cambio y descuento para emitir la liquidación en Dólares (USD) y Soles (PEN).
- **Pago al Acopiador:** Efectúa el desembolso financiero correspondiente.
- **Consolidación:** Posee la subcapacidad de agrupar lotes liquidados usando **Peso + Ley** para conformar el despacho hacia el exterior.

### 3.4 Exportador
- **Actor Externo**: No forma parte de los módulos de software internos del sistema.
- Representa a los compradores o refinerías en los mercados internacionales.
- Se relaciona comercialmente con la salida consolidada del Mayorista y con las variables globales del mercado (descuentos internacionales).

---

## 4. ESTRUCTURA Y CLASIFICACIÓN DE MÓDULOS DEL SISTEMA

SITRA-ORO está constituido por **cinco módulos internos**, cada uno con responsabilidades estrictamente delimitadas:

```
┌───────────────────────────────────────────────────────────────────────────┐
│                          SITRA-ORO BACKEND MONOLITO                       │
├─────────────────────────────┬─────────────────────────────┬───────────────┤
│    MÓDULOS TRANSACCIONALES  │  MÓDULOS NO TRANSACCIONALES │  TRANSVERSAL  │
├─────────────────────────────┼─────────────────────────────┼───────────────┤
│                             │                             │               │
│  1. ACOPIADOR               │  3. COTIZADOR               │  5. SEGURIDAD │
│     - Registro Mineros      │     - Estimación rápida     │     - Auth    │
│     - Pesajes y Fundición   │     - Consulta informativa  │     - RBAC    │
│     - Pago al Minero        │                             │     - Trazas  │
│     - Acopio Rojo / Verde   │  4. PARÁMETROS              │               │
│                             │     - Precio Oficial Oro    │               │
│  2. MAYORISTA               │     - Cotización Onza USD   │               │
│     - Recepción Segregada   │     - Tipo de Cambio        │               │
│     - Pesaje Propio         │     - Descuento Comercial   │               │
│     - Limpieza y Ley        │                             │               │
│     - Liquidación USD/PEN   │                             │               │
│     - CRUD Consolidación    │                             │               │
│                             │                             │               │
└─────────────────────────────┴─────────────────────────────┴───────────────┘
```

### Elementos que NO son módulos independientes:
1. **Dashboard:** Es una **vista / interfaz de consulta** reactiva. Agrega y visualiza métricas generadas por los módulos transaccionales. No almacena datos maestros propios ni asume lógica de negocio transaccional.
2. **Consolidación:** Es un **CRUD / subcapacidad interna del módulo Mayorista**. Trabaja sobre los registros generados por este módulo.
3. **Exportador:** Es un **actor externo** del ecosistema comercial.

---

## 5. ESPECIFICACIÓN DETALLADA DE MÓDULOS Y OPERACIONES

### 5.1 Módulo Cotizador
- **Naturaleza:** No transaccional / Consultivo.
- **Usuario objetivo:** Minero o público interesado.
- **Entradas:** Peso estimado del mineral y clasificación tentativa (Rojo/Verde).
- **Proceso:** Consulta el precio oficial del gramo en el módulo **Parámetros** y calcula un importe estimativo.
- **Regla Inquebrantable:**
  > Una cotización jamás crea una transacción comercial, no emite comprobantes de pago, no afecta stock y no compromete precios futuros de acopio.

---

### 5.2 Módulo Acopiador
- **Naturaleza:** Transaccional.
- **Usuario objetivo:** Encargado del establecimiento de acopio.
- **Flujo de Operación Primaria:**
  1. **Registro/Identificación del Minero:** Si el minero no está registrado, el Acopiador lo da de alta en el sistema para garantizar la titularidad del lote.
  2. **Primer Pesaje:** Se registra en balanza calibrada el peso inicial del oro bruto recibido ($P_1$).
  3. **Fundición y Enfriamiento:** El mineral se somete a temperatura de fusión para eliminar impurezas groseras y consolidar la barra o botón. Se deja enfriar.
  4. **Segundo Pesaje (Peso Resultante):** Se registra el peso neto obtenido post-fundición ($P_2$).
     * *Trazabilidad de Peso:* El sistema almacena tanto $P_1$ como $P_2$. La variación física se registra con fines de trazabilidad.
     * *Regla de Dominio:* El software **no bloquea automáticamente** una transacción por variaciones entre $P_1$ y $P_2$, al no haber una tolerancia fijada por el negocio.
  5. **Clasificación Cualitativa:** Se clasifica visualmente el mineral como **ROJO** o **VERDE**. No se implementan reglas automatizadas inventadas.
  6. **Cálculo y Pago:** Se aplica el precio oficial vigente (obtenido de Parámetros) y se calcula el total en Soles (PEN).
  7. **Desembolso y Asiento:** Se asienta el pago real efectuado al Minero y se almacena la compra en la base transaccional.
  8. **Acopio Segregado:** Las compras se van acumulando en bóveda en dos partidas separadas: **Stock Acumulado ROJO** y **Stock Acumulado VERDE**.
  9. **Cierre / Despacho Semanal:** Cumplido el periodo de acopio (semanal), el acopiador transporta el acumulado dividido para su entrega al Mayorista.

---

### 5.3 Módulo Mayorista
- **Naturaleza:** Transaccional.
- **Usuario objetivo:** Administrador Mayorista / Gerencia de Planta.
- **Flujo de Operación de Liquidación:**
  1. **Recepción Segregada:** El Mayorista recibe físicamente los paquetes de oro acumulados por el Acopiador, respetando la separación entre ROJO y VERDE.
  2. **Nuevo Pesaje Independiente:** El Mayorista realiza su propio pesaje calibrado de cada paquete:
     $$\text{Peso Mayorista ROJO} \quad \text{y} \quad \text{Peso Mayorista VERDE}$$
     *Regla:* El sistema no sobreescribe ni asume que el peso del Acopiador es el peso final de liquidación.
  3. **Procesamiento Físico:** Fundición secundaria de homogeneización y posterior enfriamiento controlado.
  4. **Limpieza del Oro:** Se remueven escorias residuales superficiales mediante métodos químicos o mecánicos estandarizados.
  5. **Análisis Físico-Químico:** Se extrae una muestra representativa y se analiza mediante espectrometría o copelación para determinar con exactitud la **LEY DEL ORO** (pureza porcentual o milésimas de fino).
  6. **Registro Técnico:** Se almacena formalmente la tupla **PESO + LEY** para la operación.
  7. **Liquidación Financiera Multi-Variable:** El sistema computa la liquidación tomando:
     * Peso final verificado ($g$).
     * Ley obtenida.
     * Cotización internacional de la Onza Troy en USD.
     * Tipo de cambio bancario vigente (USD/PEN).
     * Descuento comercial aplicable.
  8. **Determinación de Resultados:**
     * Subtotal resultante en Dólares Americanos (USD).
     * Conversión y subtotal en Soles Peruanos (PEN).
     * **Pago Total Liquidado** al Acopiador.
  9. **Pago al Acopiador:** Se asienta el desembolso hacia el Acopiador (flujo financiero totalmente independiente del pago a mineros).

---

### 5.4 Consolidación de Lotes (CRUD Interno de Mayorista)
- **Naturaleza:** Capacidad analítica y operativa dentro de Mayorista.
- **Propósito:** Agrupar lotes históricos liquidados para conformar un embarque de exportación de gran volumen.
- **Mecánica Operativa:**
  1. La interfaz permite consultar el historial de operaciones cerradas del Mayorista.
  2. El usuario selecciona dos o más lotes (p. ej., Lote A, Lote B, Lote C).
  3. De cada lote seleccionado, el sistema extrae esencialmente los atributos:
     $$\text{Lote}_i \longrightarrow \{\text{Peso}_i, \, \text{Ley}_i\}$$
  4. Se genera una ficha de lote consolidado con fines de despacho hacia el **Exportador**.
  5. *Aviso de Dominio:* La fórmula algorítmica para determinar la ley equivalente ponderada no se inventará hasta la homologación formal del negocio.

---

### 5.5 Módulo Parámetros
- **Naturaleza:** No transaccional / Catálogo y Configuración.
- **Responsabilidad:** Proveer de forma centralizada las constantes comerciales y económicas a toda la plataforma:
  * Precio oficial del gramo de oro para acopio local (PEN).
  * Cotización de la Onza Troy internacional (USD).
  * Tipo de cambio oficial vigente (PEN/USD).
  * Descuento comercial aplicable a liquidaciones mayoristas.
- **Principio de Aislamiento:** Parámetros no posee entidades de Minero, no realiza movimientos de inventario ni procesa cobros ni pagos.

---

### 5.6 Módulo Seguridad
- **Naturaleza:** Transversal.
- **Responsabilidad:** Gestionar la autenticación (JWT/Sesión), autorización por perfiles y auditoría de accesos.
- **Alcance por fases:** Su arquitectura evoluciona en capas simples, evitando la sobre-ingeniería de permisos granulares prematuros hasta que la universidad y el negocio definan los perfiles finales.

---

## 6. MATRIZ DE TRAZABILIDAD INTEGRAL (END-TO-END)

Para cumplir con las exigencias de auditoría minera y financiera, SITRA-ORO garantiza la reconstrucción histórica paso a paso:

```
  [1. Origen Minero]
         │  Nombre, DNI, Procedencia
         ▼
  [2. Compra Acopiador]
         │  Primer Pesaje (P1) -> Fundición -> Segundo Pesaje (P2)
         ▼
  [3. Clasificación Acopio]
         │  Asignación cualitativa: ROJO o VERDE
         ▼
  [4. Liquidación Acopio]
         │  Precio Gramo (Parámetros) -> Desembolso en Soles (PEN)
         ▼
  [5. Almacén Acopiador]
         │  Acumulado ROJO separado de Acumulado VERDE (Cierre Semanal)
         ▼
  [6. Recepción Mayorista]
         │  Pesaje Mayorista ROJO  |  Pesaje Mayorista VERDE
         ▼
  [7. Beneficio Mayorista]
         │  Fundición -> Enfriamiento -> LIMPIEZA
         ▼
  [8. Análisis de Pureza]
         │  Determinación instrumental de la LEY
         ▼
  [9. Liquidación Mayorista]
         │  Onza USD + Tipo Cambio + Descuento + Ley -> Importe USD & PEN
         ▼
  [10. Pago a Acopiador]
         │  Desembolso final al Acopiador y Registro de Lote
         ▼
  [11. Consolidación Mayorista]
         │  Selección Lotes -> Consolidación (PESO + LEY)
         ▼
  [12. Exportador Externo]
         │  Despacho internacional de lote consolidado
```

---

## 7. DIFERENCIACIONES CONCEPTUALES OBLIGATORIAS (ANTI-PATRONES)

Para evitar errores en modelado de datos, diagramas UML y código fuente, se establecen las siguientes reglas de desambiguación:

| Concepto A | Concepto B | Regla de Separación Absoluta |
| :--- | :--- | :--- |
| **Cotización** | **Compra Real** | La cotización es solo una calculadora de orientación; la compra genera asientos contables, mueve dinero y afecta stocks. |
| **Compra al Minero** | **Entrega al Mayorista** | La compra es minorista y unitaria por minero; la entrega es un envío por mayor de stock acumulado. |
| **Peso Acopiador** | **Peso Mayorista** | Son mediciones físicas independientes en balanzas y momentos distintos; ambos deben preservarse. |
| **Pago al Minero** | **Pago al Acopiador** | El acopiador paga al minero con precios locales en PEN; el mayorista liquida al acopiador considerando Onza internacional, Ley y Descuento. |
| **Acopio** | **Consolidación** | Acopio es almacenamiento físico de compras; Consolidación es una agrupación lógica de lotes basada en Peso y Ley. |
| **Mayorista** | **Exportador** | El Mayorista es un actor y módulo del software; el Exportador es un agente externo destinatario. |
| **Módulo** | **Dashboard** | El Dashboard es solo una vista agregada de visualización, no un módulo del sistema. |
| **Módulo** | **Consolidación** | Consolidación es un CRUD perteneciente a Mayorista, no un módulo independiente. |
| **Parámetros** | **Dueño de Mineros** | Los Mineros son clientes y proveedores del Acopiador; no pertenecen al módulo Parámetros. |

---

## 8. REGISTRO OFICIAL DE REGLAS `[PENDIENTE DE DEFINICIÓN DEL NEGOCIO]`

En estricto cumplimiento de la regla de no inventar requerimientos, las siguientes especificaciones quedan formalmente catalogadas a la espera de validación:

1. **`[PENDIENTE DE DEFINICIÓN DEL NEGOCIO]` Algoritmo exacto de Liquidación Mayorista:** Se conocen los factores (Peso, Ley, Onza Troy, Tipo de Cambio y Descuento), pero la fórmula algebraica oficial debe ser homologada por la gerencia.
2. **`[PENDIENTE DE DEFINICIÓN DEL NEGOCIO]` Algoritmo de Consolidación de Ley:** Procedimiento matemático oficial para calcular la ley equivalente del lote consolidado (evitar suponer promedio simple o ponderado).
3. **`[PENDIENTE DE DEFINICIÓN DEL NEGOCIO]` Criterio de aplicación del Descuento:** Queda descartado el 5% fijo de oro verde; falta precisar la tabla o fórmula que determina la tasa de descuento.
4. **`[PENDIENTE DE DEFINICIÓN DEL NEGOCIO]` Tolerancia de merma en Acopiador:** Margen de pérdida admisible entre pesaje inicial y final en fundición de acopio.
5. **`[PENDIENTE DE DEFINICIÓN DEL NEGOCIO]` Tolerancia de discrepancia entre Acopiador y Mayorista:** Variación porcentual aceptable entre el peso declarado por el acopiador y el verificado en planta mayorista.
6. **`[PENDIENTE DE DEFINICIÓN DEL NEGOCIO]` Criterios objetivos de colorimetría (Rojo vs. Verde):** Parámetros espectrales o químicos objetivos para clasificar el oro más allá de la inspección visual empírica.
7. **`[PENDIENTE DE DEFINICIÓN DEL NEGOCIO]` Validación formal de campos del Minero:** Definición de requisitos fiscales obligatorios (RUC minero, registro REINFO, georreferenciación de labor minera).
8. **`[PENDIENTE DE DEFINICIÓN DEL NEGOCIO]` Matriz RBAC definitiva de Seguridad:** Estructura final de roles, perfiles y políticas de auditoría.
9. **`[PENDIENTE DE DEFINICIÓN DEL NEGOCIO]` Estados y transiciones de Liquidación:** Ciclo de vida estandarizado (Borrador, Verificado, Liquidado, Pagado, Anulado, etc.).

---

## 9. PLAN DE REFACTORIZACIÓN TÉCNICA Y MATRIZ DE IMPACTO

| Componente | Estado Actual (Previo) | Estado Requerido (Auditado) | Acción Técnica |
| :--- | :--- | :--- | :--- |
| **Entidad Minero** | Ubicada erróneamente en `parametros` | Pertenece al módulo `acopiador` | Migrar paquete Java, DTOs y controladores hacia `acopio.acopiador`. |
| **Diferencial Verde** | `MayoristaServiceImpl` aplica `1.05` (+5%) rígido | Regla descartada por el negocio | Eliminar el recargo fijo del 5% y parametrizar según definición formal. |
| **Entidades Mayorista** | Sin campos para Ley, Descuento ni USD | Requiere campos: `ley`, `descuento`, `resultadoUsd`, `resultadoPen` | Actualizar entidades JPA, DTOs y scripts de base de datos (`bd2/`). |
| **Proceso Físico** | Salto directo de pesaje a liquidación | Incluir ciclo: Enfriamiento $\rightarrow$ Limpieza $\rightarrow$ Análisis $\rightarrow$ Ley | Modelar estados de procesamiento físico en el flujo del Mayorista. |
| **Consolidación** | No existe interfaz ni endpoint específico | CRUD interno en Mayorista basado en selección por Peso + Ley | Diseñar entidad `ConsolidacionLote` y endpoints correspondientes dentro de Mayorista. |
| **Dashboard** | Controlador dentro de paquete `parametros` | Vista agrupadora transversal | Desacoplar `DashboardController` fuera del catálogo de parámetros. |

---

## 10. CONCLUSIONES

1. El presente documento establece de manera fidedigna el comportamiento real del negocio de acopio aurífero, desterrando suposiciones técnicas que distorsionaban la operativa comercial.
2. La arquitectura monolítica modular con **Spring Boot** y **Spring Modulith** proporciona el marco ideal para implementar estos límites de contexto (Bounded Contexts) con estricto respeto a las interfaces públicas de comunicación.
3. Se instruye a los equipos de desarrollo (LP2), diseño estructural (ADS) y persistencia (BD2) abstenerse de programar cálculos no confirmados y ceñirse al registro de pendientes hasta su formalización.

---

**Firma del Estudiante:**  
*Faijo Calisaya Helio Paul*  
Código / Equipo: Equipo 05  
Escuela Profesional de Ingeniería de Sistemas  
**Universidad Peruana Unión**  
