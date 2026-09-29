# UNIVERSIDAD PERUANA UNIÓN
## FACULTAD DE INGENIERÍA Y ARQUITECTURA
### ESCUELA PROFESIONAL DE INGENIERÍA DE SISTEMAS

---

# INFORME TÉCNICO DE ESPECIFICACIÓN FUNCIONAL, MODELADO DE DOMINIO Y TRAZABILIDAD EMPRESARIAL

## SISTEMA DE TRAZABILIDAD Y LIQUIDACIÓN EN ACOPIO DE ORO (SITRA-ORO)

* **Asignatura:** Lenguaje de Programación II / Análisis y Diseño de Sistemas
* **Docente Titular:** Ing. Erick David Salazar
* **Estudiante:** Faijo Calisaya Helio Paul
* **Equipo de Trabajo:** Equipo 05
* **Ciclo y Semestre Académico:** Ciclo IV — 2026-II
* **Línea de Investigación / Dominio:** Ingeniería de Software y Sistemas de Información Empresarial
* **Repositorio de Código Fuente:** https://github.com/helionelio900-hub/SysProyec_Acopus
* **Fecha de Emisión Oficial:** 24 de Septiembre de 2026
* **Sede:** Juliaca / Lima, Perú

---

## ÍNDICE GENERAL

1. INTRODUCCIÓN Y CONTEXTO DEL NEGOCIO
   1.1 Realidad Operativa del Acopio Aurífero
   1.2 Problemática Identificada
   1.3 Objetivo General y Objetivos Específicos
   1.4 Alcance y Límites del Sistema
2. AUDITORÍA DE DOMINIO Y CONTROL DE EVOLUCIÓN FUNCIONAL
   2.1 Registro de Versiones del Documento
   2.2 Justificación de la Actualización Funcional v2.0
   2.3 Descarte Formal de Premisas Preliminares Incorrectas
   2.4 Marco Metodológico: Domain-Driven Design (DDD) y Rigor en Requerimientos
3. MACROPROCESO DE NEGOCIO Y CADENA DE VALOR
   3.1 Estructura Secuencial de la Cadena de Comercialización
   3.2 Caracterización Detallada de los Actores del Dominio
       3.2.1 Minero (Productor Primario)
       3.2.2 Acopiador (Operador Primario de Compra y Custodia)
       3.2.3 Mayorista (Consolidador Industrial y Operador Financiero)
       3.2.4 Exportador (Comercializador Internacional - Actor Externo)
4. ARQUITECTURA MODULAR Y TAXONOMÍA DEL SISTEMA
   4.1 Principios de Monolito Modular con Spring Boot y Spring Modulith
   4.2 Taxonomía y Clasificación Formal de Módulos
       4.2.1 Módulos Transaccionales
       4.2.2 Módulos No Transaccionales
       4.2.3 Módulo Transversal
   4.3 Delimitación de Elementos que No Constituyen Módulos de Software
       4.3.1 Interfaz Dashboard
       4.3.2 Capacidad de Consolidación
       4.3.3 Entidad Externa Exportador
   4.4 Políticas Canónicas de Comunicación Inter-Módulos
5. ESPECIFICACIÓN FUNCIONAL DETALLADA DE SUBDOMINIOS Y PROCESOS
   5.1 Subdominio Cotizador (No Transaccional)
   5.2 Subdominio Acopiador (Transaccional)
       5.2.1 Administración y Registro de Mineros
       5.2.2 Recepción Física y Pesaje Inicial
       5.2.3 Proceso Térmico de Fundición y Enfriamiento
       5.2.4 Segundo Pesaje (Peso Neto Resultante) y Registro de Variación
       5.2.5 Clasificación Cualitativa: Oro Rojo vs. Oro Verde
       5.2.6 Obtención de Precios Oficiales y Liquidación Local
       5.2.7 Desembolso Monetario y Registro de Compra Transaccional
       5.2.8 Acopio y Almacenamiento Segregado en Bóveda
       5.2.9 Despacho Periódico hacia el Mayorista
   5.3 Subdominio Mayorista (Transaccional)
       5.3.1 Recepción Segregada de Mineral Acumulado
       5.3.2 Nuevo Pesaje Independiente en Balanza Mayorista
       5.3.3 Homogeneización Física y Fundición Secundaria
       5.3.4 Proceso de Enfriamiento y Limpieza Rigurosa del Oro
       5.3.5 Análisis Instrumental y Determinación de la LEY DEL ORO
       5.3.6 Integración de Variables Económicas en la Liquidación
       5.3.7 Liquidación Multi-Divisa (Cálculo en USD y PEN) y Pago Total
       5.3.8 Desembolso Financiero hacia el Acopiador
       5.3.9 Asiento y Custodia de Lotes Históricos
   5.4 Subcapacidad Analítica: CRUD de Consolidación de Lotes
       5.4.1 Naturaleza y Propósito Operativo
       5.4.2 Criterio de Selección de Lotes
       5.4.3 Extracción del Vector Crítico: Peso y Ley
       5.4.4 Preparación de Lote Consolidado para Exportación
   5.5 Subdominio Parámetros (No Transaccional)
   5.6 Subdominio Seguridad (Transversal)
   5.7 Interfaz de Consulta y Proyección Dashboard
6. MATRIZ DE TRAZABILIDAD INTEGRAL Y AUDITORÍA DE CADENA DE CUSTODIA
   6.1 Cadena de Custodia End-to-End
   6.2 Matriz Detallada de Hitos y Atributos de Trazabilidad
7. MATRIZ DE DESAMBIGUACIÓN CONCEPTUAL (ANTI-PATRONES DE DOMINIO)
8. REGISTRO FORMAL DE PENDIENTES DE DEFINICIÓN DE NEGOCIO
9. ANÁLISIS DE BRECHA (GAP ANALYSIS) Y PLAN DE REFACTORIZACIÓN TÉCNICA
   9.1 Diagnóstico de Discrepancias en el Repositorio Actual
   9.2 Plan de Refactorización en Backend (Spring Boot / Java)
   9.3 Plan de Refactorización en Base de Datos (Oracle XE)
   9.4 Plan de Refactorización en Frontend (Angular SPA)
10. CONCLUSIONES Y CONFORMIDAD INSTITUCIONAL

---

## 1. INTRODUCCIÓN Y CONTEXTO DEL NEGOCIO

### 1.1 Realidad Operativa del Acopio Aurífero
La cadena de suministro y comercialización de mineral aurífero proveniente de la minería artesanal y de pequeña escala en el Perú representa un sector de alta sensibilidad económica, regulatoria y operativa. Tradicionalmente, el acopio en boca de mina o en centros urbanos intermedios se ha caracterizado por prácticas empíricas, registros en cuadernos físicos, cálculos manuales susceptibles a sesgos de redondeo y una ausencia crítica de trazabilidad sobre el origen y la pureza del mineral. 

En este escenario, el material extraído por los mineros experimenta diversas transformaciones físicas (pesajes brutos, fundición para eliminación de impurezas superficiales, enfriamiento y pesaje neto) y clasificaciones cualitativas basadas en tonalidades (oro rojo u oro verde). Posteriormente, dicho mineral es acopiado periódicamente para ser trasladado hacia operadores de mayor envergadura comercial (mayoristas), quienes realizan nuevos controles gravimétricos, tratamientos de limpieza química o mecánica y análisis instrumentales de ley antes de proceder a la liquidación financiera y posterior consolidación con fines de exportación.

### 1.2 Problemática Identificada
La falta de un sistema informático especializado genera las siguientes deficiencias en el negocio:
1. **Pérdida de trazabilidad de origen:** Imposibilidad de vincular fehacientemente un lingote o lote final con los mineros individuales que extrajeron el metal, lo cual vulnera las normativas de formalización y debida diligencia.
2. **Discrepancias en mediciones gravimétricas:** Inconsistencia entre los pesos registrados por el acopiador en su balanza local y los pesos obtenidos por el mayorista en planta, generando desconfianza comercial y desajustes contables cuando los sistemas informáticos intentan imponer tolerancias matemáticas arbitrarias o sobreescritura de valores.
3. **Cálculos financieros distorsionados:** Empleo de fórmulas simplistas o coeficientes prefijados sin sustento empírico (como asumir recargos o castigos porcentuales fijos para el oro verde), distorsionando las liquidaciones reales.
4. **Acoplamiento indebido de procesos:** Confusión funcional entre estimaciones informativas de precios, compras transaccionales primarias, liquidaciones semanales y preparación de lotes para exportación, lo cual degrada la integridad de los datos en las aplicaciones de software.

### 1.3 Objetivo General y Objetivos Específicos
* **Objetivo General:** Desarrollar e implementar la especificación funcional, el modelo de dominio y la arquitectura modular para el sistema **SITRA-ORO**, garantizando la trazabilidad estricta, la segregación de calidades, la fidelidad gravimétrica y la transparencia liquidatoria en toda la cadena de acopio.
* **Objetivos Específicos:**
  * Delimitar formalmente los límites transaccionales de los subdominios del sistema bajo el paradigma de Monolito Modular con Spring Modulith.
  * Modelar con precisión la cadena de transformación física y química del mineral: pesaje inicial, fundición, enfriamiento, pesaje resultante, clasificación visual, limpieza, análisis de ley y liquidación multi-divisa.
  * Desacoplar operativamente las compras individuales realizadas al minero respecto a las liquidaciones consolidadas entregadas al mayorista.
  * Formalizar la capacidad de Consolidación de Lotes como una subcapacidad del Mayorista, preservando los datos críticos de Peso y Ley.
  * Catalogar rigurosamente los aspectos pendientes de validación por parte del negocio, prohibiendo la invención de tolerancias, algoritmos o valores fijos.

### 1.4 Alcance y Límites del Sistema
El alcance del sistema SITRA-ORO abarca desde la captura informativa de precios y el registro del minero en la fase de acopio primario, hasta la liquidación formal del acopiador frente al mayorista y la consolidación de lotes para su despacho internacional. El exportador se concibe estrictamente como un actor y destino comercial externo, encontrándose fuera de los módulos de software transaccionales de la plataforma. De igual forma, los tableros analíticos (dashboards) se definen como interfaces de visualización agregada y no como entidades propietarias de información.

---

## 2. AUDITORÍA DE DOMINIO Y CONTROL DE EVOLUCIÓN FUNCIONAL

### 2.1 Registro de Versiones del Documento

| Versión | Fecha | Responsable | Modificaciones y Racional Técnico | Estado |
| :--- | :--- | :--- | :--- | :--- |
| **v1.0** | 10/09/2026 | Equipo 05 (Helio Calisaya) | Especificación preliminar para el cierre de la Unidad 1. Se modelaron tres actores simplificados (Minero, G2, G1). Se asumió un recargo fijo de 5% para oro verde y se ubicó a la entidad Minero dentro del catálogo de parámetros. | *Superada / No Vigente* |
| **v2.0** | 24/09/2026 | Faijo Calisaya Helio Paul | **Auditoría Maestra Oficial:** Reestructuración integral basada en la operación real de planta. Incorporación del nuevo pesaje del mayorista, etapas físicas de enfriamiento y limpieza, análisis instrumental de Ley, CRUD de Consolidación (Peso + Ley), reubicación de Minero en Acopiador, eliminación del 5% rígido y catalogación de reglas pendientes. | **Vigente y Obligatoria** |

### 2.2 Justificación de la Actualización Funcional v2.0
Durante la auditoría técnica de los procesos del negocio se evidenció que la versión 1.0 adolecía de inconsistencias con la práctica real del acopio aurífero. Específicamente, en la versión preliminar se asumía que el mayorista liquidaba el mineral utilizando el mismo peso reportado por el acopiador, ignorando que el mayorista ejecuta su propia recepción con balanza independiente. Asimismo, se omitía la etapa de limpieza de escorias y el análisis instrumental de ley, saltando de manera irreal de un pesaje fundido a una fórmula de conversión onza-gramo directa. La versión 2.0 corrige estas fallas de modelado, estableciendo una arquitectura robusta y alineada con la realidad operativa.

### 2.3 Descarte Formal de Premisas Preliminares Incorrectas
En aplicación estricta de las directrices de auditoría, se declaran formalmente descartadas las siguientes premisas que figuraban en versiones previas del código o de la documentación:
1. **Descarte del recargo fijo del 5% para Oro Verde:** Ningún cálculo de backend, script de base de datos o interfaz de usuario debe multiplicar o dividir importes utilizando un factor predeterminado del 5% (1.05) para mineral clasificado como verde. Cualquier diferencial de precio o descuento debe ser suministrado por las tablas de parámetros vigentes o acordado en la liquidación real.
2. **Descarte de la pertenencia de Minero a Parámetros:** El concepto de Minero no es una tabla de configuración del sistema; es un participante comercial directo de la transacción de acopio. Por tanto, su administración pertenece al módulo Acopiador.
3. **Descarte del Exportador como módulo interno:** No debe construirse ningún paquete Java ni esquema de base de datos denominado `ModuloExportador`. El exportador es un agente externo a la plataforma interna.
4. **Descarte de Consolidación como módulo autónomo:** La consolidación no posee ciclo de vida independiente ni almacén de datos desacoplado del mayorista; es una funcionalidad analítica interna de este último.
5. **Descarte de tolerancias matemáticas automáticas:** El sistema no debe incorporar validaciones que rechacen transacciones por variaciones entre el peso bruto y el peso neto post-fundición, ni entre el pesaje del acopiador y el del mayorista, mientras el negocio no formalice tales márgenes de tolerancia.

### 2.4 Marco Metodológico: Domain-Driven Design (DDD) y Rigor en Requerimientos
El desarrollo del proyecto adopta los principios de Diseño Guiado por el Dominio (DDD), reconociendo que el software empresarial debe reflejar con máxima fidelidad el modelo mental y los flujos del negocio real. Bajo este marco:
* Cada concepto relevante se clasifica rigurosamente distinguiendo entre Entidades (con identidad y ciclo de vida persistente), Objetos de Valor (inmutables y definidos por sus atributos) y Agregados (raíces de consistencia transaccional).
* Se aplica la **Prueba de Tres Partes** (Ciclo de Vida, Cardinalidad e Invariante de Negocio Compartido) antes de agrupar entidades dentro de un mismo agregado o definir claves foráneas de base de datos.
* Se establece la regla inquebrantable de **No Invención:** cualquier vacío conceptual en fórmulas, porcentajes, mermas o tolerancias se etiqueta formalmente como `[PENDIENTE DE DEFINICIÓN DEL NEGOCIO]`, prohibiendo la inserción de supuestos técnicos que desvirtúen la auditoría.

---

## 3. MACROPROCESO DE NEGOCIO Y CADENA DE VALOR

### 3.1 Estructura Secuencial de la Cadena de Comercialización
El flujo físico y comercial del mineral se desarrolla a través de cuatro eslabones secuenciales clearly delimitados:

$$\mathbf{MINERO} \xrightarrow[\text{Venta Presencial}]{\text{Mineral Bruto}} \mathbf{ACOPIADOR} \xrightarrow[\text{Entrega Periódica}]{\text{Mineral Fundido Segregado}} \mathbf{MAYORISTA} \xrightarrow[\text{Despacho Consolidado}]{\text{Lotes Homogeneizados}} \mathbf{EXPORTADOR}$$

1. **Eslabón 1: Producción y Venta Primaria (Minero $\rightarrow$ Acopiador):** El minero puede efectuar previamente una simulación orientativa en el módulo Cotizador. Posteriormente, se presenta de manera física con su mineral en el establecimiento del acopiador. Allí se verifica su identidad, se efectúa el pesaje inicial en balanza, se ejecuta la fundición primaria para purificar la muestra, se deja enfriar y se registra el peso neto resultante. El acopiador clasifica visualmente el metal en Rojo o Verde, consulta la cotización oficial en el módulo Parámetros, calcula el importe en moneda nacional (PEN), liquida en efectivo o transferencia bancaria y registra la compra. El oro se almacena en bóveda de forma segregada.
2. **Eslabón 2: Custodia y Acumulación de Acopio:** El acopiador no realiza despachos unitarios por cada compra. Por el contrario, consolida físicamente el mineral en dos inventarios independientes: Acumulado Rojo y Acumulado Verde, acumulando volumen durante periodos regulares (típicamente semanales).
3. **Eslabón 3: Recepción Industrial y Liquidación Mayorista (Acopiador $\rightarrow$ Mayorista):** El acopiador traslada el mineral acumulado hacia las instalaciones del mayorista, entregándolo en partidas separadas. El mayorista no convalida a ciegas el peso declarado; somete cada lote a un pesaje independiente con balanzas de alta precisión. A continuación, procesa el metal mediante fundición de homogeneización, enfriamiento y una fase crítica de limpieza química y mecánica para despojar escorias. Posteriormente, extrae muestras representativas y determina instrumentalmente la LEY DEL ORO (título de pureza). Con el peso verificado, la ley, la cotización internacional de la Onza Troy en USD, el tipo de cambio bancario y el descuento comercial aplicable, emite la liquidación financiera con desglose en USD y PEN, efectuando el pago directo al acopiador.
4. **Eslabón 4: Consolidación y Comercialización Internacional (Mayorista $\rightarrow$ Exportador):** Dentro de su operativa, el mayorista evalúa múltiples lotes liquidados en el tiempo y selecciona registros específicos para conformar un lote de gran escala basado exclusivamente en el Peso acumulado y la Ley. Este resultado consolidado se destina al Exportador internacional.

### 3.2 Caracterización Detallada de los Actores del Dominio

#### 3.2.1 Minero (Productor Primario)
* **Perfil:** Persona natural o representante de una pequeña labor minera que extrae el mineral aurífero.
* **Capacidades en el Sistema:**
  * Uso optativo del módulo Cotizador (interfaz pública de simulación económica).
  * No posee credenciales operativas para registrar compras ni alterar inventarios.
* **Vínculo con el Sistema:** Es dado de alta y administrado directamente por el módulo Acopiador en el momento de la atención en ventanilla, garantizando que cada gramo comprado quede asociado a un titular identificado para fines de trazabilidad de procedencia.

#### 3.2.2 Acopiador (Operador Primario de Compra y Custodia)
* **Perfil:** Operador de ventanilla o titular de un centro de acopio autorizado en la zona minera.
* **Responsabilidades Operativas:**
  * Identificar y mantener el padrón de mineros proveedores.
  * Realizar el pesaje inicial del mineral en bruto ($P_1$).
  * Dirigir el proceso físico de fundición y posterior enfriamiento.
  * Registrar el pesaje neto resultante ($P_2$), consignando la variación gravimétrica en el sistema.
  * Determinar por inspección organoléptica la categoría cualitativa del mineral (Rojo o Verde).
  * Consumir las tarifas vigentes del módulo Parámetros y liquidar el pago en Soles (PEN).
  * Asentar la transacción transaccional y custodiar el mineral en bóveda segregado por color hasta el corte de despacho semanal.

#### 3.2.3 Mayorista (Consolidador Industrial y Operador Financiero)
* **Perfil:** Empresa compradora mayorista, refinería intermedia o planta de beneficio que adquiere los acumulados de diversos centros de acopio.
* **Responsabilidades Operativas:**
  * Recepcionar los acumulados de oro rojo y verde sin permitir su mezcla física en la balanza.
  * Ejecutar el pesaje propio de entrada, generando un registro gravimétrico independiente del acopiador.
  * Realizar la fundición secundaria, el enfriamiento y la limpieza física de residuos.
  * Analizar la pureza mediante espectrometría o copelación para determinar la LEY exacta del mineral.
  * Integrar las cotizaciones de la Onza Troy (USD), el Tipo de Cambio (USD/PEN) y la tasa de descuento.
  * Calcular y liquidar el importe final en dólares y soles, efectuando el pago al acopiador.
  * Operar la funcionalidad de Consolidación de Lotes seleccionando partidas previas mediante Peso + Ley para preparar despachos de exportación.

#### 3.2.4 Exportador (Comercializador Internacional - Actor Externo)
* **Perfil:** Casa comercial internacional, refinería extranjera o corporación de comercio exterior.
* **Rol:** Destinatario final de los despachos mayoristas. Participa en la fijación de las condiciones de descuento internacional del mineral fino, pero no opera como usuario ni entidad interna dentro del software SITRA-ORO.

---

## 4. ARQUITECTURA MODULAR Y TAXONOMÍA DEL SISTEMA

### 4.1 Principios de Monolito Modular con Spring Boot y Spring Modulith
El sistema SITRA-ORO se implementa como un **Monolito Modular** de acuerdo con los estándares de la arquitectura de software moderna. Esta decisión técnica responde a la necesidad de mantener un despliegue unificado, de bajo costo operativo y alta cohesión lógica, garantizando al mismo tiempo fronteras de módulo infranqueables que prevengan el deterioro de la arquitectura.

Mediante el soporte de **Spring Modulith**, cada módulo funcional se aísla en su propio paquete base dentro del espacio de nombres `pe.edu.upeu.sitraoro.acopio`. Los límites de visibilidad garantizan que los componentes de persistencia (repositorios JPA) y las entidades internas no puedan ser importados directamente por otros módulos, canalizando toda interacción inter-modular a través de interfaces públicas formalmente expuestas (`@NamedInterface` o servicios de contrato público).

### 4.2 Taxonomía y Clasificación Formal de Módulos

```
                                  SITRA-ORO
                          (Arquitectura de Dominio)
                                      │
       ┌──────────────────────────────┼──────────────────────────────┐
       ▼                              ▼                              ▼
MÓDULOS TRANSACCIONALES    MÓDULOS NO TRANSACCIONALES        MÓDULO TRANSVERSAL
(Mutan estado e inventario) (Cálculo puro y catálogos)       (Seguridad global)
       │                              │                              │
 1. Acopiador                   3. Cotizador                   5. Seguridad
 2. Mayorista                   4. Parámetros
```

#### 4.2.1 Módulos Transaccionales
1. **Módulo Acopiador (`pe.edu.upeu.sitraoro.acopio.acopiador`):**
   * Gestiona el registro de mineros, la captura de pesajes primarios, la clasificación cualitativa, la liquidación en Soles y el almacenamiento segregado de mineral.
   * Su base transaccional asienta compras reales con impacto en caja y acumulación de inventario.
2. **Módulo Mayorista (`pe.edu.upeu.sitraoro.acopio.mayorista`):**
   * Gestiona la recepción de lotes de acopio, el pesaje independiente, el control físico de limpieza, el análisis instrumental de Ley, la liquidación financiera multi-divisa y el pago al acopiador.
   * Alberga la capacidad analítica interna de Consolidación de Lotes.

#### 4.2.2 Módulos No Transaccionales
1. **Módulo Cotizador (`pe.edu.upeu.sitraoro.acopio.cotizador`):**
   * Implementa una calculadora de orientación económica para el minero.
   * No persiste registros en tablas transaccionales, no reserva stock ni emite compromisos financieros vinculantes.
2. **Módulo Parámetros (`pe.edu.upeu.sitraoro.acopio.parametros`):**
   * Mantiene los valores vigentes del mercado: precio oficial del gramo en moneda nacional, cotización de la onza troy en moneda extranjera, tipo de cambio interbancario y parámetros de descuento comercial.
   * No es propietario de datos de mineros ni ejecuta transacciones de pago.

#### 4.2.3 Módulo Transversal
1. **Módulo Seguridad (`pe.edu.upeu.sitraoro.acopio.seguridad`):**
   * Diseñado como un componente ortogonal a los dominios de negocio.
   * Provee autenticación, autorización basada en roles (RBAC) y trazabilidad de identidad para los operadores de los módulos transaccionales.

### 4.3 Delimitación de Elementos que No Constituyen Módulos de Software
Para evitar la proliferación artificial de componentes arquitectónicos no justificados por el dominio, se delimitan estrictamente los siguientes tres elementos:
1. **La Interfaz Dashboard:** No constituye un módulo de negocio. Es una vista agregadora o proyección de sólo lectura que consume datos generados por Acopiador y Mayorista para presentarlos en pantallas de monitoreo gerencial. No posee modelos transaccionales propios.
2. **La Consolidación:** No es un módulo independiente. Es una subcapacidad operativa y funcional estructurada como un CRUD interno dentro del módulo Mayorista, operando sobre los lotes previamente liquidados por este.
3. **El Exportador:** No es un módulo de software. Es una entidad y actor económico externo situado más allá de las fronteras del sistema monolítico.

### 4.4 Políticas Canónicas de Comunicación Inter-Módulos
La interacción entre los módulos de SITRA-ORO se somete a las siguientes reglas de gobierno arquitectónico:
* **Prohibición de acceso a Repositorios ajenos:** Ninguna clase perteneciente a un módulo (por ejemplo, `CotizadorServiceImpl`) puede inyectar o acceder a un repositorio privado de otro módulo (como `ParametroRepository`).
* **Comunicación mediante Contratos Públicos:** Toda consulta de información debe realizarse mediante interfaces de servicio expuestas en los paquetes de API pública del módulo proveedor (ejemplo: `ParametrosSistemaService.obtenerVigentes()`).
* **Desacoplamiento de Eventos de Negocio:** Las notificaciones asíncronas entre módulos se articulan mediante el bus de eventos de Spring Modulith, asegurando transacciones desacopladas y consistencia eventual cuando la operativa lo amerite.

---

## 5. ESPECIFICACIÓN DETALLADA DE SUBDOMINIOS Y PROCESOS

### 5.1 Subdominio Cotizador (No Transaccional)
* **Objetivo:** Brindar al minero una estimación matemática rápida del valor de su mineral antes de efectuar un traslado presencial.
* **Parámetros de Entrada:**
  * Peso estimado del mineral bruto (gramos).
  * Tipo de oro estimado (ROJO o VERDE).
* **Mecanismo Operativo:** El servicio del Cotizador consume la tarifa diaria vigente desde el contrato público de Parámetros y realiza una multiplicación lineal informativa.
* **Regla Inquebrantable de Negocio:**
  Una cotización no genera compras, no emite comprobantes, no modifica inventarios ni garantiza el precio al momento de la llegada física del minero al acopio.

### 5.2 Subdominio Acopiador (Transaccional)

#### 5.2.1 Administración y Registro de Mineros
El módulo Acopiador asume la propiedad funcional del catálogo de mineros. Durante la atención presencial, el operador verifica la identidad del minero. Si se trata de un nuevo proveedor, se capturan sus datos identificativos para habilitar la trazabilidad de procedencia del lote.

#### 5.2.2 Recepción Física y Pesaje Inicial
El mineral bruto entregado por el minero se coloca en la balanza de precisión calibrada de la ventanilla de acopio. El sistema asienta el **Primer Pesaje ($P_1$)** con una exactitud de tres decimales en gramos.

#### 5.2.3 Proceso Térmico de Fundición y Enfriamiento
El lote se somete a fundición en crisol con soplete para aglomerar el metal y expulsar impurezas volátiles o escorias superficiales. Posteriormente, la barra o botón de oro resultante se somete a enfriamiento controlado en agua para estabilizar su estructura y masa.

#### 5.2.4 Segundo Pesaje (Peso Neto Resultante) y Registro de Variación
Una vez frío y seco, el mineral se vuelve a colocar en la balanza para registrar el **Segundo Pesaje ($P_2$)**, correspondiente al peso neto resultante.
* **Gestión de la Merma:** La diferencia gravimétrica $\Delta P = P_1 - P_2$ representa la merma física de fundición. Esta variación se conserva íntegramente en la base de datos con fines de trazabilidad.
* **Regla de No Bloqueo:** El sistema no detiene ni rechaza transacciones debido a la magnitud de $\Delta P$, dado que no existe una tolerancia matemática formalmente aprobada por el negocio.

#### 5.2.5 Clasificación Cualitativa: Oro Rojo vs. Oro Verde
El operador de acopio inspecciona visualmente el botón de oro y asigna la clasificación correspondiente:
* **Oro ROJO:** Presenta tonalidades cobrizas o rojizas derivadas de su contenido natural de cobre u otros metales base.
* **Oro VERDE:** Presenta tonalidades amarillentas verdosas asociadas a una mayor presencia de plata o aleaciones específicas de yacimiento.
* **Regla de Clasificación:** La categoría se registra de forma visual y directa. Queda prohibida la implementación de algoritmos o fórmulas matemáticas automáticas para deducir el color del mineral.

#### 5.2.6 Obtención de Precios Oficiales y Liquidación Local
El acopiador consulta el precio oficial del gramo en Soles (PEN) vigente en el módulo Parámetros. El sistema computa el importe a pagar multiplicando el peso resultante fundido ($P_2$) por dicho precio oficial.

#### 5.2.7 Desembolso Monetario y Registro de Compra Transaccional
Una vez conforme el minero, el acopiador ejecuta el desembolso financiero y asienta formalmente la compra transaccional en el sistema, registrando la fecha, minero, $P_1$, $P_2$, color, precio unitario y total pagado.

#### 5.2.8 Acopio y Almacenamiento Segregado en Bóveda
El mineral comprado ingresa a la caja fuerte o bóveda del establecimiento, manteniéndose en contenedores físicamente separados:
* **Bóveda / Partida Acumulada ORO ROJO**
* **Bóveda / Partida Acumulada ORO VERDE**
El sistema mantiene el saldo acumulado en gramos para cada color de manera independiente.

#### 5.2.9 Despacho Periódico hacia el Mayorista
Al término del ciclo de acopio (habitualmente cada siete días), el acopiador genera el corte de su inventario y transporta las barras acumuladas de ambos colores hacia las instalaciones del mayorista.

### 5.3 Subdominio Mayorista (Transaccional)

#### 5.3.1 Recepción Segregada de Mineral Acumulado
El mayorista recepciona presencialmente los paquetes provenientes del acopiador, verificando que los lotes de oro rojo y verde se mantengan en recipientes claramente etiquetados y sin contacto entre sí.

#### 5.3.2 Nuevo Pesaje Independiente en Balanza Mayorista
El mayorista coloca cada partida en su propia balanza analítica industrial de alta calibración, registrando de forma autónoma:
* **Peso Mayorista ORO ROJO ($g$)**
* **Peso Mayorista ORO VERDE ($g$)**
* **Principio de Independencia:** El sistema bajo ninguna circunstancia sobreescribe el pesaje del acopiador ni asume que el peso declarado es idéntico al peso de planta. Ambos valores gravimétricos coexisten para fines de control y auditoría.

#### 5.3.3 Homogeneización Física y Fundición Secundaria
Las barras recibidas se someten a una fundición secundaria de consolidación a fin de homogenizar la masa del mineral para que las tomas de muestra analítica resulten uniformes y representativas.

#### 5.3.4 Proceso de Enfriamiento y Limpieza Rigurosa del Oro
Tras el enfriamiento de la barra fundida, se ejecuta la **limpieza rigurosa del oro** mediante desincrustación mecánica y baños ácidos controlados (decapado) para eliminar óxidos superficiales y restos de fundentes (bórax/sílice). Esta etapa es indispensable para evitar lecturas distorsionadas en los equipos de análisis.

#### 5.3.5 Análisis Instrumental y Determinación de la LEY DEL ORO
Mediante copelación al fuego o espectrometría de fluorescencia de rayos X (XRF), el laboratorio del mayorista analiza la pureza del metal y emite el valor certificado de la **LEY DEL ORO** (expresada habitualmente en milésimas de fino o porcentaje de contenido aurífero puro). La Ley certificada se asienta obligatoriamente en el sistema.

#### 5.3.6 Integración de Variables Económicas en la Liquidación
La liquidación formal del mayorista hacia el acopiador consolida los siguientes factores económicos:
1. Peso verificado en planta mayorista ($g$).
2. Ley de pureza obtenida del análisis.
3. Cotización internacional de la Onza Troy en Dólares Americanos (USD).
4. Tipo de cambio interbancario oficial (USD/PEN).
5. Tasa o factor de descuento comercial acordado.

#### 5.3.7 Liquidación Multi-Divisa (Cálculo en USD y PEN) y Pago Total
A partir de los factores anteriores, el sistema emite el comprobante de liquidación detallando:
* Resultado económico expresado en Dólares Americanos (USD).
* Resultado económico convertido a Soles Peruanos (PEN).
* **Pago Total Liquidado del Oro**, garantizando que el acopiador conozca exactamente el desglose de su retribución.

#### 5.3.8 Desembolso Financiero hacia el Acopiador
El mayorista transfiere o desembolsa los fondos correspondientes al acopiador, asentando el cierre financiero de la entrega. Este pago es jurídicamente independiente de los desembolsos minoristas previos realizados por el acopiador a los mineros.

#### 5.3.9 Asiento y Custodia de Lotes Históricos
Cada operación mayorista finalizada genera un registro histórico inmutable que resguarda la información de Peso, Ley, Onza, Tipo de Cambio, Descuento, importes USD/PEN y fecha de liquidación. Estos registros forman la base transaccional sobre la cual operará la capacidad de consolidación.

### 5.4 Subcapacidad Analítica: CRUD de Consolidación de Lotes

#### 5.4.1 Naturaleza y Propósito Operativo
La Consolidación es un componente de gestión analítica alojado estrictamente dentro del módulo Mayorista. Su objetivo es permitir al administrador agrupar lotes históricos previamente liquidados para armar despachos de volumen significativo con destino a la refinería o comprador internacional (Exportador).

#### 5.4.2 Criterio de Selección de Lotes
A través de la interfaz de consolidación, el operador visualiza el listado de liquidaciones mayoristas registradas y selecciona aquellas partidas que formarán parte del lote de despacho (por ejemplo, seleccionando la Liquidación 101, la 104 y la 108).

#### 5.4.3 Extracción del Vector Crítico: Peso y Ley
Aunque cada liquidación histórica contiene múltiples datos contables (descuento, tipo de cambio, pago en soles), la consolidación extrae como atributos primarios y determinantes de cada registro seleccionado:

$$\text{Operación Seleccionada}_k \Longrightarrow \big\{\mathbf{Peso}_k, \, \mathbf{Ley}_k\big\}$$

Estos atributos representan la masa física y el tenor de pureza real que se amalgamará en el lote final.

#### 5.4.4 Preparación de Lote Consolidado para Exportación
El sistema genera la ficha de consolidación que agrupa los pesos y proyecta el contenido fino del lote para su entrega al Exportador.
* **Restricción de Algoritmo:** La fórmula matemática para determinar la ley compuesta final no se asume como un promedio simple ni ponderado en el software hasta que sea ratificada por la gerencia del negocio.

### 5.5 Subdominio Parámetros (No Transaccional)
Centraliza la administración de los valores de referencia del negocio:
* Precio oficial de compra por gramo para acopio en moneda nacional (PEN/g).
* Cotización de la Onza Troy en moneda extranjera (USD/oz).
* Tipo de cambio oficial vigente (USD a PEN).
* Coeficiente o tabla de descuento comercial.
* **Límite:** No almacena usuarios, no almacena mineros ni realiza pagos.

### 5.6 Subdominio Seguridad (Transversal)
Gestiona la infraestructura de autenticación y autorización del sistema mediante tokens criptográficos JWT y control de acceso basado en roles (RBAC). Su implementación se mantiene limpia y desacoplada de la lógica de dominio de acopio.

### 5.7 Interfaz de Consulta y Proyección Dashboard
Componente de presentación gráfica que recopila datos en tiempo real de los módulos Acopiador y Mayorista para mostrar:
* Volumen total de mineral acopiado segregado por Rojo y Verde.
* Sumatoria de pagos efectuados a mineros en Soles.
* Volumen total recibido y liquidado por el mayorista.
* Indicadores clave de rendimiento (KPIs) de mermas y leyes promedio sin alterar las entidades de dominio.

---

## 6. MATRIZ DE TRAZABILIDAD INTEGRAL Y AUDITORÍA DE CADENA DE CUSTODIA

### 6.1 Cadena de Custodia End-to-End
La arquitectura de SITRA-ORO garantiza la reconstrucción histórica ininterrumpida de cualquier gramo de oro a través de la siguiente cadena de eventos auditables:

$$\begin{aligned}
\text{[1. Minero Identificado]} &\longrightarrow \text{[2. Pesaje Inicial Bruto]} \longrightarrow \text{[3. Fundición Térmica]} \\
&\longrightarrow \text{[4. Pesaje Neto Resultante]} \longrightarrow \text{[5. Clasificación Rojo/Verde]} \\
&\longrightarrow \text{[6. Liquidación y Pago al Minero]} \longrightarrow \text{[7. Acumulación Segregada]} \\
&\longrightarrow \text{[8. Recepción Mayorista y Nuevo Pesaje]} \longrightarrow \text{[9. Limpieza de Escorias]} \\
&\longrightarrow \text{[10. Análisis Instrumental de LEY]} \longrightarrow \text{[11. Liquidación USD / PEN]} \\
&\longrightarrow \text{[12. Pago a Acopiador]} \longrightarrow \text{[13. Consolidación Peso + Ley]} \\
&\longrightarrow \text{[14. Entrega a Exportador Externo]}
\end{aligned}$$

### 6.2 Matriz Detallada de Hitos y Atributos de Trazabilidad

| Hito | Fase de la Cadena | Actor Responsable | Módulo Propietario | Datos Críticos Resguardados |
| :---: | :--- | :--- | :--- | :--- |
| **01** | Identificación de Origen | Minero / Operador | Acopiador | Identidad del Minero (DNI/RUC), procedencia geográfica, marca temporal de atención. |
| **02** | Recepción Gravimétrica 1 | Operador de Balanza | Acopiador | Peso bruto sin fundir ($P_1$) en gramos con 3 decimales, identificador de balanza. |
| **03** | Tratamiento Físico 1 | Fundidor de Acopio | Acopiador | Registro del proceso térmico de fundición y enfriamiento en agua. |
| **04** | Recepción Gravimétrica 2 | Operador de Balanza | Acopiador | Peso neto post-fundición ($P_2$), merma gravimétrica calculada $\Delta P = P_1 - P_2$. |
| **05** | Clasificación Organoléptica | Operador de Ventanilla | Acopiador | Tonalidad cualitativa asignada: ROJO o VERDE. |
| **06** | Liquidación Primaria | Administrador Acopio | Acopiador | Tarifa oficial de Parámetros aplicada (PEN/g), importe liquidado y constancia de pago al minero. |
| **07** | Custodia de Inventario | Almacenero de Bóveda | Acopiador | Saldo acumulado en bóveda segregado: Stock Acumulado Rojo y Stock Acumulado Verde. |
| **08** | Despacho Periódico | Acopiador | Acopiador | Manifiesto de entrega semanal por color hacia planta mayorista. |
| **09** | Nuevo Pesaje de Planta | Operador Mayorista | Mayorista | Pesaje independiente de recepción: Peso Mayorista Rojo y Peso Mayorista Verde. |
| **10** | Acondicionamiento Físico 2 | Técnico Metalurgista | Mayorista | Fundición secundaria de homogeneización, enfriamiento y remoción de escorias (Limpieza). |
| **11** | Certificación de Pureza | Analista de Laboratorio | Mayorista | Determinación analítica de la LEY DEL ORO (fino certificado en milésimas/porcentaje). |
| **12** | Liquidación Financiera | Gerencia Mayorista | Mayorista | Factores aplicados: Onza Troy USD, Tipo Cambio USD/PEN, Tasa de Descuento, Subtotal USD, Subtotal PEN, Total Pagado. |
| **13** | Cierre Financiero Mayorista | Tesorería Mayorista | Mayorista | Constancia de desembolso bancario/efectivo liquidado a favor del acopiador. |
| **14** | Consolidación de Exportación | Analista de Comercio | Mayorista | Ficha de consolidación agrupando lotes históricos mediante tuplas $\{\text{Peso}_k, \text{Ley}_k\}$. |
| **15** | Despacho Exterior | Agente de Aduanas | Externo (Exportador) | Envío comercial del lote consolidado hacia mercados internacionales. |

---

## 7. MATRIZ DE DESAMBIGUACIÓN CONCEPTUAL (ANTI-PATRONES DE DOMINIO)

Con el fin de erradicar interpretaciones erróneas en el modelado UML, en el código backend de Spring Boot y en la base de datos Oracle, se establece la siguiente matriz de demarcación:

| Concepto Primario | Concepto Antagónico | Criterio de Demarcación y Regla Arquitectónica Inviolable |
| :--- | :--- | :--- |
| **Cotización** | **Compra Real** | Una cotización es una operación no transaccional de consulta orientativa; no afecta inventarios, no mueve dinero ni emite comprobantes. La compra es transaccional, genera asientos contables y compromete caja. |
| **Compra al Minero** | **Entrega al Mayorista** | La compra al minero es un acto minorista e individual en zona de extracción; la entrega al mayorista es un despacho al por mayor de mineral acumulado durante una semana. Son operaciones y entidades desacopladas. |
| **Peso del Acopiador** | **Peso del Mayorista** | Mediciones físicas separadas en el tiempo y en balanzas distintas. El sistema resguarda ambas mediciones de forma independiente y prohíbe la sobreescritura de valores. |
| **Pago al Minero** | **Pago al Acopiador** | El acopiador paga al minero en moneda nacional con tarifas de acopio local; el mayorista liquida al acopiador computando cotizaciones de Onza Troy en USD, Tipo de Cambio, Ley certificada y Descuentos. |
| **Acopio en Bóveda** | **Consolidación** | Acopio es la custodia física y acumulación de inventario en bóveda por color; Consolidación es un agrupamiento lógico-analítico de lotes históricos basados en Peso + Ley para fines de exportación. |
| **Mayorista** | **Exportador** | El Mayorista es un actor interno con módulo de software transaccional propio; el Exportador es un agente mercantil externo receptor en el comercio internacional. |
| **Módulo de Software** | **Dashboard** | Los módulos encapsulan reglas de negocio y repositorios transaccionales; el Dashboard es una simple vista agregadora de consulta para soporte visual. |
| **Módulo de Software** | **Consolidación** | Consolidación no posee base de datos ni ciclo de vida aislado; es un CRUD perteneciente a la estructura interna del módulo Mayorista. |
| **Módulo Parámetros** | **Dueño de Mineros** | Parámetros administra exclusivamente constantes de mercado; los Mineros son actores comerciales gestionados por el módulo Acopiador. |

---

## 8. REGISTRO FORMAL DE PENDIENTES DE DEFINICIÓN DE NEGOCIO

En estricto cumplimiento del principio de rigor profesional y no invención de requisitos, se catalogan formalmente los aspectos cuya definición matemática o procedimental debe ser ratificada por la contraparte del negocio:

| Código | Aspecto Funcional | Estado Formal | Justificación Técnica de la Espera |
| :---: | :--- | :---: | :--- |
| **PDN-01** | Fórmula Exacta de Liquidación Mayorista | `[PENDIENTE DE DEFINICIÓN DEL NEGOCIO]` | Se conocen los factores (Peso, Ley, Onza USD, Tipo de Cambio y Descuento), pero la ecuación algebraica exacta debe ser formalizada por la gerencia para evitar divergencias financieras. |
| **PDN-02** | Algoritmo de Consolidación de Leyes | `[PENDIENTE DE DEFINICIÓN DEL NEGOCIO]` | El procedimiento para determinar la ley compuesta de múltiples lotes (promedio ponderado gravimétrico u otro método metalúrgico) debe ser validado por laboratorio. |
| **PDN-03** | Criterio y Tasa de Descuento Comercial | `[PENDIENTE DE DEFINICIÓN DEL NEGOCIO]` | Descartado el 5% rígido de oro verde, se requiere la regla formal que determina el origen y cálculo del porcentaje de descuento aplicable por el mayorista. |
| **PDN-04** | Umbral de Merma en Fundición de Acopio | `[PENDIENTE DE DEFINICIÓN DEL NEGOCIO]` | Rango de tolerancia admisible entre el peso bruto ($P_1$) y neto ($P_2$) antes de requerir autorización por merma excesiva. |
| **PDN-05** | Tolerancia de Discrepancia entre Balanzas | `[PENDIENTE DE DEFINICIÓN DEL NEGOCIO]` | Porcentaje de diferencia permitido entre el peso registrado por el acopiador y el verificado en planta mayorista antes de emitir una alerta de auditoría. |
| **PDN-06** | Parámetros Objetivos de Color (Rojo / Verde) | `[PENDIENTE DE DEFINICIÓN DEL NEGOCIO]` | Especificación técnica objetiva de colorimetría para estandarizar la clasificación más allá de la apreciación visual del operario. |
| **PDN-07** | Requisitos Documentales Obligatorios del Minero | `[PENDIENTE DE DEFINICIÓN DEL NEGOCIO]` | Definición de los identificadores legales obligatorios para formalización minera (carné REINFO, número de concesión, RUC, coordenadas UTM). |
| **PDN-08** | Matriz de Perfiles y Políticas de Acceso (RBAC) | `[PENDIENTE DE DEFINICIÓN DEL NEGOCIO]` | Matriz definitiva de privilegios para la fase de producción de Seguridad. |
| **PDN-09** | Máquina de Estados de Transacciones y Cierres | `[PENDIENTE DE DEFINICIÓN DEL NEGOCIO]` | Catálogo exhaustivo de estados del ciclo de vida (Iniciada, Pesada, Fundida, Liquidada, Pagada, Anulada). |

---

## 9. ANÁLISIS DE BRECHA (GAP ANALYSIS) Y PLAN DE REFACTORIZACIÓN TÉCNICA

### 9.1 Diagnóstico de Discrepancias en el Repositorio Actual
La inspección de los artefactos existentes en el repositorio (`lp2/sitra-oro-backend`, `bd2/`, `ads/` y `docs/`) revela las siguientes brechas respecto a la auditoría oficial v2.0:
1. **Ubicación errónea de Minero:** En el backend, las clases `Minero.java`, `MineroRepository.java`, `MineroService.java` y `MineroController.java` se ubican en `pe.edu.upeu.sitraoro.acopio.parametros`.
2. **Cálculo residual con 5% rígido:** En `MayoristaServiceImpl.java` (línea 79), se encuentra codificado el recargo del 5% (`new BigDecimal("1.05")`) para mineral verde.
3. **Omisión de Ley, Descuento y Limpieza:** La entidad `LiquidacionG1.java` y la tabla `LIQUIDACIONES_G1` carecen de campos para almacenar la Ley certificada, el Descuento, el desglose en USD y los pesajes de balanza independientes.
4. **Acoplamiento físico indebido en Base de Datos:** La tabla `TRANSACCIONES_G2` mantiene una columna foránea `ID_LIQUIDACION_G1`, forzando un enlace uno a muchos directo entre compras individuales y cierres mayoristas.
5. **Inexistencia del CRUD de Consolidación:** La consolidación solo existe como una etiqueta textual `"CONSOLIDADO"` en la cabecera de liquidación cuando se envían detalles mixtos.
6. **Dashboard ubicado en Parámetros:** La clase `DashboardController.java` reside incorrectamente en el paquete `parametros`.

### 9.2 Plan de Refactorización en Backend (Spring Boot / Java)
* **Fase B1 — Migración de Minero:** Trasladar los componentes de `Minero` al paquete `pe.edu.upeu.sitraoro.acopio.acopiador`. Exponer la interfaz pública correspondiente para consultas externas.
* **Fase B2 — Limpieza de la Regla del 5%:** Eliminar de `MayoristaServiceImpl` todo factor condicional rígido sobre el oro verde. El cálculo de liquidación se adaptará para consumir los parámetros vigentes sin recargos inventados.
* **Fase B3 — Enriquecimiento de Entidades Mayorista:** Refactorizar `LiquidacionG1` y `DetalleLiquidacionG1` para incluir: `pesoMayoristaRojo`, `pesoMayoristaVerde`, `leyCertificada`, `descuentoAplicado`, `subtotalUsd`, `subtotalPen` y `pagoTotal`.
* **Fase B4 — Implementación del CRUD Consolidación:** Diseñar el controlador, servicio, repositorio y entidad `ConsolidacionLote` dentro del paquete `pe.edu.upeu.sitraoro.acopio.mayorista`, permitiendo la selección de lotes históricos mediante Peso y Ley.
* **Fase B5 — Desacoplamiento del Dashboard:** Mover `DashboardController` a un paquete de vistas de agregación transversal fuera de `parametros`.

### 9.3 Plan de Refactorización en Base de Datos (Oracle XE)
* **Fase D1 — Esquema Acopiador y Mineros:** Mover formalmente la tabla `MINEROS` al subdominio transaccional de acopio.
* **Fase D2 — Desacoplamiento de Transacciones:** Reestructurar la relación entre `TRANSACCIONES_G2` y `LIQUIDACIONES_G1`, permitiendo que el acopio liquide lotes acumulados periódicos sin requerir una clave foránea unitaria en cada compra menor.
* **Fase D3 — Nuevas Columnas en Liquidaciones:** Ejecutar script DDL `ALTER TABLE LIQUIDACIONES_G1` para adicionar `LEY_ORO`, `DESCUENTO_PCT`, `TOTAL_USD`, `TOTAL_PEN` y columnas gravimétricas independientes para rojo y verde.
* **Fase D4 — Creación de Tablas de Consolidación:** Crear las tablas `CONSOLIDACIONES_LOTES` y `DETALLE_CONSOLIDACION_LOTES` para persistir la agrupación de lotes seleccionados mediante Peso y Ley.

### 9.4 Plan de Refactorización en Frontend (Angular SPA)
* **Fase F1 — Reubicación de Rutas y Navegación:** Mover el módulo de Mineros dentro de la sección de navegación de Acopiador.
* **Fase F2 — Actualización del Formulario de Liquidación Mayorista:** Modificar la vista de liquidación para capturar el pesaje independiente de planta, la tasa de descuento y la Ley de pureza obtenida del laboratorio.
* **Fase F3 — Módulo de Consolidación:** Construir la pantalla de Consolidación de Lotes en Angular, permitiendo seleccionar registros históricos mediante casillas de verificación (checkboxes) y visualizando la sumatoria de Peso y Ley resultante.

---

## 10. CONCLUSIONES Y CONFORMIDAD INSTITUCIONAL

1. El presente informe técnico formaliza la especificación canónica del sistema **SITRA-ORO**, dotando al proyecto de un marco de ingeniería riguroso, trazable y adaptado a las dinámicas reales del acopio de mineral aurífero.
2. Se ha garantizado la delimitación transaccional entre los cinco módulos del sistema bajo el patrón Monolito Modular con Spring Modulith, erradicando vicios de acoplamiento prematuro y dependencias cíclicas.
3. Se ratifica la política institucional de no invención de requisitos, manteniendo catalogados como pendientes de definición del negocio aquellos algoritmos y tolerancias que requieren validación gerencial.
4. El plan de refactorización técnica trazado proporciona una ruta de ejecución ordenada y verificable para las asignaturas de Lenguaje de Programación II, Análisis y Diseño de Sistemas y Base de Datos II.

---

**Constancia de Conformidad y Emisión Oficial:**

\
\
__________________________________  
**Faijo Calisaya Helio Paul**  
Estudiante Investigador — Equipo 05  
Escuela Profesional de Ingeniería de Sistemas  
Facultad de Ingeniería y Arquitectura  
**Universidad Peruana Unión (UPeU)**  

\
\
__________________________________  
**Ing. Erick David Salazar**  
Docente de Asignatura  
Escuela Profesional de Ingeniería de Sistemas  
**Universidad Peruana Unión (UPeU)**  
