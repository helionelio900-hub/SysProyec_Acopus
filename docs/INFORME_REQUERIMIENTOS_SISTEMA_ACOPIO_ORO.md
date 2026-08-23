# INFORME DE INGENIERÍA DE REQUERIMIENTOS
## SISTEMA DE CONTROL Y ACOPIO DE ORO (MÓDULOS: MINERO | G2 | G1)

---

## 1. INTRODUCCIÓN Y OBJETIVO GENERAL

El presente documento establece la especificación formal de requerimientos para el desarrollo del **Sistema Automatizado de Acopio y Liquidación de Oro**. El objetivo principal del sistema es reemplazar los cálculos manuales y desorganizados por un flujo digital estandarizado, garantizando trazabilidad, precisión en las liquidaciones financieras y un control claro entre los tres actores principales de la cadena: **Minero**, **Acopiador (G2)** y **Administrador Mayorista (G1)**.

---

## 2. ESTRUCTURA MODULAR DEL SISTEMA

### 2.1 Módulo 1: Minero (Cotizador Estimativo / Consulta Rápida)
* **Propósito:** Brindar al minero una estimación previa y transparente del valor de su mineral antes de acudir presencialmente al acopio.
* **Entradas del Usuario:**
  * Peso del oro bruto (sin fundir) en gramos.
* **Datos del Sistema:**
  * Precio predeterminado del gramo de oro del día (fijado por el sistema).
* **Procesamiento y Fórmulas:**
  1. **Estimación de Fundición / Merma:** El sistema calcula la reducción estimada que tendrá el mineral al quemarse (ejemplo: reducción de 20g bruto a 19g neto estimado).
  2. **Cálculo de Cotización:**
     $$\text{Monto Estimado} = \text{Peso Neto Estimado (g)} \times \text{Precio Predeterminado del Día (S/.)}$$
* **Salida:** Muestra en pantalla el monto total estimado que recibiría el minero.
* **Delimitación:** La sesión e interacción del módulo Minero **concluye inmediatamente** al mostrar esta cotización.

---

### 2.2 Módulo 2: G2 (Acopiador Directo / Operación y Control Semanal)
* **Propósito:** Gestionar la recepción física del oro bruto, realizar la fundición real, liquidar el pago directo al minero y consolidar los acumulados semanales.

#### A. Flujo de Atención y Pago al Minero (Presencial)
1. **Fundición Real:** G2 recibe el oro bruto sin fundir y realiza la fundición física.
2. **Pesaje y Clasificación:** Se obtiene el peso real del oro fundido (neto) y se clasifica según su tipo/color:
   * 🔴 **Oro Rojo**
   * 🟢 **Oro Verde**
3. **Liquidación y Pago:** 
   $$\text{Pago al Minero} = \text{Peso Oro Fundido Real (g)} \times \text{Precio del Oro Actual (S/.)}$$
4. **Fin de Atención:** G2 entrega el dinero al minero. Aquí termina la interacción presencial con el minero.

#### B. Registro de Transacción en Sistema G2
Para cada compra realizada, G2 registra los siguientes campos obligatorios:
* Nombre del Minero.
* Peso del Oro Sin Fundir (bruto inicial).
* Peso del Oro Fundido (neto real).
* Tipo / Color de Oro (🔴 Rojo o 🟢 Verde).
* Precio del Oro Actual aplicado.
* Pago Total realizado.

#### C. Consolidación de Totales (Panel Inferior G2)
En la parte inferior de la pantalla de G2, el sistema calcula de forma automática y muestra las sumatorias acumuladas, **estrictamente separadas por tipo de oro**:
* 🔴 **Resumen Oro Rojo:** Suma total de gramos fundidos rojos + Suma total de dinero pagado.
* 🟢 **Resumen Oro Verde:** Suma total de gramos fundidos verdes + Suma total de dinero pagado.

#### D. Cierre Semanal
Al término de la semana, G2 acude presencialmente donde G1 con el lote de oro fundido (separado por colores) para solicitar la liquidación semanal. Aquí concluye el módulo G2.

---

### 2.3 Módulo 3: G1 (Administrador Mayorista / Consolidación Final)
* **Propósito:** Liquidar semanalmente el oro procesado entregado por G2, registrando las cotizaciones del mercado internacional y consolidando las cuentas generales del negocio.

#### A. Recepción Presencial y Cálculo de Pago a G2
1. G1 recibe presencialmente el oro fundido entregado por G2 (clasificado por color).
2. G1 ingresa los datos actuales del mercado:
   * **Cotización de la Onza de Oro**.
   * **Tipo de Cambio (Dólar)**.
3. El sistema determina el precio unitario por gramo resultante entre la Onza y el Dólar, diferenciado según el tipo/color de oro (🔴 Rojo / 🟢 Verde).
4. G1 efectúa el pago a G2 según los gramos netos entregados y el precio derivado.
5. **Fin de Interacción:** Con el pago a G2 concluye la transacción presencial.

#### B. Registro de Transacción en Sistema G1
G1 almacena en su módulo:
* Nombre del G2 (proveedor/acopiador).
* Peso del Oro Fundido entregado.
* Color del Oro (🔴 Rojo / 🟢 Verde de forma separada).
* Tipo de Cambio del Dólar aplicado.
* Valor de la Onza de Oro.
* Precio por gramo resultante (Onza / Dólar).
* Resultado de Compra y **Pago Total realizado a G2**.

#### C. Registro Consolidado Final (G1)
El sistema genera un panel de control consolidado para G1 que muestra:
* 🔴 Sumatoria total acumulada de Oro Fundido Rojo.
* 🟢 Sumatoria total acumulada de Oro Fundido Verde.
* 💰 Sumatoria total acumulada de dinero desembolsado por G1.

---

## 3. DIAGRAMAS DE FLUJO Y PROCESOS

### 3.1 Diagrama del Módulo Minero
```mermaid
flowchart TD
    A([Inicio: Cotizador Minero]) --> B[Ingresa Peso de Oro Bruto]
    B --> C[Sistema obtiene Precio Predeterminado del día]
    C --> D[Sistema calcula Bajada/Merma estimada por fundición]
    D --> E["Cálculo: Monto = Peso Neto Estimado x Precio Predeterminado"]
    E --> F[Muestra Resultado Estimado en Pantalla al Minero]
    F --> G([Fin del Módulo Minero])
```

---

### 3.2 Diagrama del Módulo G2
```mermaid
flowchart TD
    subgraph ATENCION ["1. Atención Presencial"]
        A([Minero entrega Oro bruto a G2]) --> B[G2 realiza Fundición Física real]
        B --> C[G2 pesa Oro Fundido y clasifica: Rojo o Verde]
        C --> D["Calcula Pago = Oro Fundido x Precio Actual"]
        D --> E[G2 entrega dinero al Minero]
        E --> F([Fin de atención al Minero])
    end

    subgraph REGISTRO ["2. Registro en Sistema G2"]
        F --> G["G2 registra compra en Sistema:<br/>• Nombre del Minero<br/>• Peso Sin Fundir<br/>• Peso Fundido<br/>• Color (Rojo / Verde)<br/>• Precio Actual<br/>• Total Pagado"]
    end

    subgraph ACUMULADOS ["3. Totales Inferiores (Separados)"]
        G --> H["🔴 TOTAL ORO ROJO: Gramos Totales + Soles Pagados"]
        G --> I["🟢 TOTAL ORO VERDE: Gramos Totales + Soles Pagados"]
    end

    subgraph CIERRE ["4. Cierre Semanal"]
        H --> J([G2 lleva físicamente el Oro Fundido a G1])
        I --> J
    end
```

---

### 3.3 Diagrama del Módulo G1
```mermaid
flowchart TD
    subgraph RECEPCION ["1. Liquidación Presencial a G2"]
        A([G2 entrega Oro Fundido a G1]) --> B["G1 ingresa Mercado: Cotización Onza + Tipo de Cambio Dólar"]
        B --> C["Cálculo de Precio derivado por gramo (Onza/Dólar) según color"]
        C --> D[G1 realiza Pago Total a G2]
        D --> E([Fin de interacción G1 ↔ G2])
    end

    subgraph REGISTRO_G1 ["2. Registro en Sistema G1"]
        E --> F["G1 registra la compra:<br/>• Nombre de G2<br/>• Oro Fundido<br/>• Color (Rojo / Verde)<br/>• Tipo Cambio (Dólar)<br/>• Cotización Onza<br/>• Precio Resultante<br/>• Pago Total a G2"]
    end

    subgraph CONSOLIDADO ["3. Registro Consolidado G1"]
        F --> G["Panel de Consolidación G1:<br/>🔴 Sumatoria Oro Fundido Rojo<br/>🟢 Sumatoria Oro Fundido Verde<br/>💰 Sumatoria Pago Total Acumulado"]
    end
```

---

### 3.4 Diagrama Integral End-to-End (Sistema Completo)
```mermaid
flowchart TD
    subgraph MINERO ["1. MÓDULO MINERO"]
        M1([Minero ingresa al Cotizador]) --> M2[Ingresa Peso Oro Bruto]
        M2 --> M3[Cálculo automático de Bajada estimada y Cotización]
        M3 --> M4([Muestra Monto Estimado - Fin Minero])
    end

    subgraph G2 ["2. MÓDULO G2 (Acopiador / Semanal)"]
        G2_1([Minero entrega Oro bruto a G2 presencialmente]) --> G2_2[Fundición física real y pesaje de Oro Fundido]
        G2_2 --> G2_3[Clasificación: Rojo o Verde]
        G2_3 --> G2_4[Pago al Minero]
        G2_4 --> G2_5[Registro: Minero, Peso Bruto, Peso Fundido, Color, Precio, Total]
        G2_5 --> G2_6[Panel Inferior G2: Sumatorias acumuladas separadas por Rojo y Verde]
        G2_6 --> G2_7([Entrega Semanal de Oro Fundido a G1])
    end

    subgraph G1 ["3. MÓDULO G1 (Administrador / Mayorista)"]
        G1_1([G1 recibe Oro Fundido de G2]) --> G1_2[Ingreso de Onza y Tipo de Cambio Dólar]
        G1_2 --> G1_3[Cálculo de precio por gramo y Pago a G2]
        G1_3 --> G1_4[Registro: G2, Oro Fundido, Color, Onza, Dólar, Precio, Total]
        G1_4 --> G1_5["Consolidado Final G1: Total Gramos (Rojo/Verde) + Total Pago Acumulado"]
    end

    MINERO -. Consultativo .-> G2
    G2 --> G1
```

---

## 4. REQUERIMIENTOS NO FUNCIONALES Y REGLAS DE SEGURIDAD

1. **Separación Estricta de Categorías:** En los módulos G2 y G1, el Oro Rojo y el Oro Verde **jamás deben mezclarse en los totales**, debido a sus diferencias de valorización y pureza.
2. **Seguridad y Control de Acceso (RBAC):**
   * **Minero:** Acceso libre de consulta sin credenciales complejas.
   * **G2 y G1:** Acceso restringido mediante usuario y contraseña segura por manejar registros financieros.
3. **Consistencia de Datos:** Toda liquidación debe actualizar automáticamente las sumatorias acumuladas en tiempo real.
4. **Usabilidad:** Interfaz clara y legible para operar fácilmente desde dispositivos móviles o laptops en zonas de acopio.
