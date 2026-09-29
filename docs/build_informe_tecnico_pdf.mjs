import { chromium } from "file:///C:/Users/Paul/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.join(here, "INFORME_TECNICO_ESPECIFICACION_DOMINIO_SITRA_ORO.html");
const targetPdf = path.join(here, "INFORME_TECNICO_ESPECIFICACION_DOMINIO_SITRA_ORO.pdf");

// Helper to convert image to base64 data URI
function getBase64Image(filePath) {
  const data = fs.readFileSync(filePath);
  const ext = path.extname(filePath).slice(1);
  return `data:image/${ext === "jpg" ? "jpeg" : ext};base64,${data.toString("base64")}`;
}

const logoUpeu = getBase64Image(path.join(here, "presentacion/s06/assets/upeu.png"));
const logoSistemas = getBase64Image(path.join(here, "presentacion/s06/assets/ingenieria-sistemas.png"));
const logoSitraOro = getBase64Image(path.join(here, "presentacion/s06/assets/quilate-bullion-emblema-v2.png"));

const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>INFORME TÉCNICO SITRA-ORO — UPEU</title>
  <style>
    @page {
      size: A4;
      margin: 22mm 18mm 22mm 18mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: "Times New Roman", Times, Georgia, serif;
      font-size: 10.5pt;
      line-height: 1.5;
      color: #111827;
      background: #ffffff;
      text-align: justify;
    }

    /* PORTADA FORMAL UNIVERSITARIA */
    .cover-page {
      page-break-after: always;
      height: 100%;
      min-height: 250mm;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      text-align: center;
      padding: 5mm 0;
    }
    .cover-header-logos {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 25px;
    }
    .cover-header-logos img.logo-left {
      height: 65px;
      width: auto;
    }
    .cover-header-logos img.logo-right {
      height: 65px;
      width: auto;
    }
    .cover-institution-block {
      margin-bottom: 25px;
    }
    .inst-univ {
      font-size: 16pt;
      font-weight: bold;
      color: #00204a;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    .inst-fac {
      font-size: 12pt;
      font-weight: bold;
      color: #374151;
      text-transform: uppercase;
      margin-bottom: 2px;
    }
    .inst-esc {
      font-size: 11pt;
      font-weight: bold;
      color: #4b5563;
      text-transform: uppercase;
    }
    .cover-emblem-container {
      margin: 15px auto;
    }
    .cover-emblem-container img {
      width: 130px;
      height: auto;
    }
    .cover-title-block {
      margin: 15px 0 25px;
    }
    .doc-main-title {
      font-size: 15pt;
      font-weight: bold;
      color: #00204a;
      line-height: 1.35;
      text-transform: uppercase;
      margin-bottom: 12px;
    }
    .doc-project-title {
      font-size: 13pt;
      font-weight: bold;
      color: #854d0e;
      margin-bottom: 6px;
    }
    .doc-project-subtitle {
      font-size: 11pt;
      font-style: italic;
      color: #4b5563;
      margin-bottom: 12px;
    }
    .doc-version-tag {
      font-size: 10pt;
      font-weight: bold;
      color: #065f46;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .cover-meta-table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0 10px;
      font-size: 10pt;
      text-align: left;
    }
    .cover-meta-table td {
      padding: 5px 8px;
      vertical-align: top;
      border: none;
    }
    .cover-meta-table td.meta-label {
      font-weight: bold;
      color: #00204a;
      width: 32%;
    }
    .cover-meta-table td.meta-val {
      color: #1f2937;
    }
    .cover-date-place {
      margin-top: 20px;
      font-size: 10pt;
      font-weight: bold;
      color: #374151;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* ENCABEZADOS Y SECCIONES FORMALES */
    h2 {
      font-size: 12pt;
      font-weight: bold;
      color: #00204a;
      text-transform: uppercase;
      border-bottom: 1.5px solid #00204a;
      padding-bottom: 4px;
      margin-top: 22px;
      margin-bottom: 10px;
      page-break-after: avoid;
    }
    h3 {
      font-size: 11pt;
      font-weight: bold;
      color: #00204a;
      margin-top: 14px;
      margin-bottom: 6px;
      page-break-after: avoid;
    }
    h4 {
      font-size: 10.5pt;
      font-weight: bold;
      font-style: italic;
      color: #1f2937;
      margin-top: 10px;
      margin-bottom: 4px;
      page-break-after: avoid;
    }
    p {
      margin-bottom: 8px;
      text-indent: 0;
    }
    ul, ol {
      margin-left: 25px;
      margin-bottom: 10px;
    }
    li {
      margin-bottom: 4px;
    }

    /* FORMULAS MATEMATICAS Y CITAS */
    .formula-block {
      text-align: center;
      margin: 12px 0;
      font-style: italic;
      font-weight: bold;
      color: #00204a;
      font-size: 11pt;
    }
    .formal-quote {
      margin: 10px 25px;
      padding: 6px 12px;
      font-style: italic;
      border-left: 2.5px solid #00204a;
      color: #374151;
    }

    /* TABLAS FORMALES ESTILO APA / ACADÉMICO */
    table.academic-table {
      width: 100%;
      border-collapse: collapse;
      margin: 12px 0 16px;
      font-size: 9.5pt;
      page-break-inside: avoid;
    }
    table.academic-table th {
      border-top: 2px solid #00204a;
      border-bottom: 1.5px solid #00204a;
      background-color: #f8fafc;
      color: #00204a;
      font-weight: bold;
      padding: 6px 8px;
      text-align: left;
    }
    table.academic-table td {
      border-bottom: 1px solid #e2e8f0;
      padding: 5px 8px;
      vertical-align: top;
      text-align: left;
    }
    table.academic-table tr:last-child td {
      border-bottom: 2px solid #00204a;
    }

    /* FIRMAS FORMALES */
    .signatures-block {
      margin-top: 35px;
      display: flex;
      justify-content: space-around;
      text-align: center;
      font-size: 9.5pt;
      page-break-inside: avoid;
    }
    .signature-item {
      width: 220px;
    }
    .signature-line {
      border-top: 1px solid #111827;
      margin: 45px auto 6px;
    }

    .page-break {
      page-break-before: always;
    }
  </style>
</head>
<body>

  <!-- ==================== PORTADA ==================== -->
  <div class="cover-page">
    <div class="cover-header-logos">
      <img src="${logoUpeu}" class="logo-left" alt="Universidad Peruana Unión">
      <img src="${logoSistemas}" class="logo-right" alt="Escuela Profesional de Ingeniería de Sistemas">
    </div>

    <div class="cover-institution-block">
      <div class="inst-univ">Universidad Peruana Unión</div>
      <div class="inst-fac">Facultad de Ingeniería y Arquitectura</div>
      <div class="inst-esc">Escuela Profesional de Ingeniería de Sistemas</div>
    </div>

    <div class="cover-emblem-container">
      <img src="${logoSitraOro}" alt="SITRA-ORO Emblema Oficial">
    </div>

    <div class="cover-title-block">
      <div class="doc-main-title">Informe Técnico de Especificación Funcional, Modelado de Dominio y Trazabilidad Empresarial</div>
      <div class="doc-project-title">PROYECTO: SITRA-ORO</div>
      <div class="doc-project-subtitle">Sistema de Trazabilidad y Liquidación en Acopio de Oro</div>
      <div class="doc-version-tag">Versión 2.0 — Auditoría Funcional Oficial de Negocio</div>
    </div>

    <table class="cover-meta-table">
      <tr>
        <td class="meta-label">Asignatura:</td>
        <td class="meta-val">Lenguaje de Programación II / Análisis y Diseño de Sistemas</td>
      </tr>
      <tr>
        <td class="meta-label">Docente Titular:</td>
        <td class="meta-val">Ing. Erick David Salazar</td>
      </tr>
      <tr>
        <td class="meta-label">Estudiante:</td>
        <td class="meta-val">Faijo Calisaya Helio Paul</td>
      </tr>
      <tr>
        <td class="meta-label">Equipo de Trabajo:</td>
        <td class="meta-val">Equipo 05</td>
      </tr>
      <tr>
        <td class="meta-label">Ciclo y Semestre:</td>
        <td class="meta-val">Ciclo IV — Semestre Académico 2026-II</td>
      </tr>
      <tr>
        <td class="meta-label">Repositorio Oficial:</td>
        <td class="meta-val">https://github.com/helionelio900-hub/SysProyec_Acopus</td>
      </tr>
    </table>

    <div class="cover-date-place">
      Juliaca / Lima, Perú — Septiembre de 2026
    </div>
  </div>

  <!-- ==================== ÍNDICE GENERAL ==================== -->
  <h2>Índice General</h2>
  <ol style="line-height: 1.6; font-size: 10pt;">
    <li><strong>Introducción y Contexto del Negocio</strong>
      <ul>
        <li>1.1 Realidad Operativa del Acopio Aurífero</li>
        <li>1.2 Problemática Identificada</li>
        <li>1.3 Objetivo General y Objetivos Específicos</li>
        <li>1.4 Alcance y Límites del Sistema</li>
      </ul>
    </li>
    <li><strong>Auditoría de Dominio y Control de Evolución Funcional</strong>
      <ul>
        <li>2.1 Registro de Versiones del Documento</li>
        <li>2.2 Justificación de la Actualización Funcional v2.0</li>
        <li>2.3 Descarte Formal de Premisas Preliminares Incorrectas</li>
        <li>2.4 Marco Metodológico: Domain-Driven Design (DDD) y Rigor en Requerimientos</li>
      </ul>
    </li>
    <li><strong>Macroproceso de Negocio y Cadena de Valor</strong>
      <ul>
        <li>3.1 Estructura Secuencial de la Cadena de Comercialización</li>
        <li>3.2 Caracterización Detallada de los Actores del Dominio</li>
      </ul>
    </li>
    <li><strong>Arquitectura Modular y Taxonomía del Sistema</strong>
      <ul>
        <li>4.1 Principios de Monolito Modular con Spring Boot y Spring Modulith</li>
        <li>4.2 Taxonomía y Clasificación Formal de Módulos</li>
        <li>4.3 Delimitación de Elementos que No Constituyen Módulos de Software</li>
        <li>4.4 Políticas Canónicas de Comunicación Inter-Módulos</li>
      </ul>
    </li>
    <li><strong>Especificación Funcional Detallada de Subdominios y Procesos</strong>
      <ul>
        <li>5.1 Subdominio Cotizador (No Transaccional)</li>
        <li>5.2 Subdominio Acopiador (Transaccional)</li>
        <li>5.3 Subdominio Mayorista (Transaccional)</li>
        <li>5.4 Subcapacidad Analítica: CRUD de Consolidación de Lotes</li>
        <li>5.5 Subdominio Parámetros (No Transaccional)</li>
        <li>5.6 Subdominio Seguridad (Transversal)</li>
        <li>5.7 Interfaz de Consulta y Proyección Dashboard</li>
      </ul>
    </li>
    <li><strong>Matriz de Trazabilidad Integral y Auditoría de Cadena de Custodia</strong></li>
    <li><strong>Matriz de Desambiguación Conceptual (Anti-Patrones de Dominio)</strong></li>
    <li><strong>Registro Formal de Pendientes de Definición de Negocio</strong></li>
    <li><strong>Análisis de Brecha (Gap Analysis) y Plan de Refactorización Técnica</strong></li>
    <li><strong>Conclusiones y Conformidad Institucional</strong></li>
  </ol>

  <div class="page-break"></div>

  <!-- ==================== SECCIÓN 1 ==================== -->
  <h2>1. Introducción y Contexto del Negocio</h2>

  <h3>1.1 Realidad Operativa del Acopio Aurífero</h3>
  <p>La comercialización de mineral aurífero proveniente de la minería artesanal y de pequeña escala en el Perú constituye un sector neurálgico de la economía nacional, caracterizado por una alta complejidad operativa y estrictas exigencias de debida diligencia. Tradicionalmente, la recepción del mineral en centros de acopio se ha realizado mediante registros manuales en cuadernos o libretas de campo, cálculos aritméticos propensos a fallas humanas y una carencia crítica de trazabilidad sobre el origen, la merma física y el tenor de pureza del oro.</p>
  <p>En el proceso físico real, el mineral entregado por los mineros experimenta diversas transformaciones físicas: pesajes brutos, fundición térmica primaria para compactar la masa y expulsar impurezas, enfriamiento, pesaje neto resultante y clasificación organoléptica en tonalidades rojas o verdes. Con posterioridad, el mineral acumulado es trasladado hacia operadores de mayor envergadura comercial (mayoristas), quienes efectúan nuevos pesajes independientes en balanza de planta, tratamientos de desescoriado y limpieza rigurosa, y determinaciones instrumentales de ley antes de emitir liquidaciones multi-divisa y consolidar partidas de gran escala con fines de exportación.</p>

  <h3>1.2 Problemática Identificada</h3>
  <p>La ausencia de un sistema informático estructurado ha originado diversas dificultades operativas y de ingeniería:</p>
  <ul>
    <li><strong>Pérdida de la cadena de custodia:</strong> Dificultad para asociar de manera verificable un lingote de mineral con los mineros individuales que extrajeron el metal.</li>
    <li><strong>Discrepancias en mediciones gravimétricas:</strong> Desajustes entre los pesos registrados por el acopiador en su balanza local y los pesos verificados por el mayorista en planta, generados por pretender imponer tolerancias matemáticas arbitrarias o sobreescritura de valores en bases de datos.</li>
    <li><strong>Distorsiones en liquidaciones financieras:</strong> Aplicación de coeficientes rígidos no autorizados por el negocio (por ejemplo, recargos o castigos porcentuales fijos para el oro verde), distorsionando los márgenes de compra y venta.</li>
    <li><strong>Acoplamiento indebido de procesos:</strong> Confusión entre estimaciones informativas de precios, compras transaccionales primarias, liquidaciones semanales y preparación de lotes para exportación, comprometiendo la integridad de la arquitectura de software.</li>
  </ul>

  <h3>1.3 Objetivo General y Objetivos Específicos</h3>
  <p><strong>Objetivo General:</strong> Formalizar la especificación funcional, el modelo de dominio y la arquitectura de software del sistema <strong>SITRA-ORO</strong>, garantizando trazabilidad integral, segregación estricta de calidades y transparencia en las liquidaciones financieras de acopio.</p>
  <p><strong>Objetivos Específicos:</strong></p>
  <ul>
    <li>Delimitar formalmente las fronteras de los subdominios bajo el enfoque de Monolito Modular con Spring Modulith.</li>
    <li>Modelar con fidelidad el ciclo físico-químico del mineral: pesajes 1 y 2, fundición, enfriamiento, clasificación rojo/verde, limpieza, análisis instrumental de Ley y liquidación multi-divisa (USD y PEN).</li>
    <li>Desacoplar funcionalmente las compras unitarias a mineros respecto a los despachos acumulados entregados al mayorista.</li>
    <li>Integrar el CRUD de Consolidación como subcapacidad interna de Mayorista basada en el vector crítico Peso + Ley.</li>
    <li>Registrar formalmente los requerimientos pendientes de definición por parte del negocio, prohibiendo la invención de tolerancias o fórmulas.</li>
  </ul>

  <h3>1.4 Alcance y Límites del Sistema</h3>
  <p>El sistema SITRA-ORO abarca desde la consulta referencial de cotizaciones y el alta del minero en ventanilla de acopio, hasta la liquidación mayorista y la consolidación de lotes. Se establece formalmente que el <strong>Exportador</strong> actúa como un agente externo receptor en el comercio internacional, encontrándose fuera del software. Asimismo, el <strong>Dashboard</strong> se define como una vista agregadora de consulta y no como un módulo transaccional con persistencia propia.</p>

  <!-- ==================== SECCIÓN 2 ==================== -->
  <h2>2. Auditoría de Dominio y Control de Evolución Funcional</h2>

  <h3>2.1 Registro de Versiones del Documento</h3>
  <table class="academic-table">
    <thead>
      <tr>
        <th style="width: 12%;">Versión</th>
        <th style="width: 15%;">Fecha</th>
        <th style="width: 25%;">Responsable</th>
        <th>Descripción y Racional Técnico</th>
        <th style="width: 14%;">Estado</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>v1.0</strong></td>
        <td>10/09/2026</td>
        <td>Equipo 05 (Helio Calisaya)</td>
        <td>Diseño preliminar basado en tres actores genéricos. Asumía un recargo rígido del 5% al oro verde y ubicaba a Minero como catálogo de Parámetros.</td>
        <td>Superada</td>
      </tr>
      <tr>
        <td><strong>v2.0</strong></td>
        <td>24/09/2026</td>
        <td>Faijo Calisaya Helio Paul</td>
        <td>Auditoría Maestra Oficial: Incorpora ciclo físico de Mayorista (limpieza, análisis y Ley), nuevo pesaje independiente, CRUD Consolidación (Peso + Ley), reubica Minero en Acopiador y cataloga reglas pendientes.</td>
        <td>Vigente / Oficial</td>
      </tr>
    </tbody>
  </table>

  <h3>2.2 Justificación de la Actualización Funcional v2.0</h3>
  <p>Durante la auditoría de procesos se constató que la versión preliminar incurría en simplificaciones técnicas incompatibles con la práctica de planta. En particular, se asumía de forma incorrecta que el mayorista liquidaba utilizando el mismo peso reportado por el acopiador, ignorando que el mayorista dispone de balanzas analíticas propias e independientes. De igual modo, se omitía el desescoriado (limpieza) y el ensayo instrumental de ley, pasando directamente de un pesaje en gramos a una conversión onza-dólar. La versión 2.0 formaliza estas fases físicas esenciales.</p>

  <h3>2.3 Descarte Formal de Premisas Preliminares Incorrectas</h3>
  <p>Quedan oficialmente descartadas y prohibidas las siguientes premisas que figuraban en versiones previas:</p>
  <ul>
    <li><strong>Descarte del 5% fijo para Oro Verde:</strong> Queda terminantemente prohibido incorporar factores rígidos como <code>precio * 1.05</code> en los servicios o entidades. El descuento o diferencial de precio debe provenir de los parámetros vigentes o de la negociación de planta.</li>
    <li><strong>Descarte de Minero en Parámetros:</strong> El Minero es un actor comercial de la compra de acopio; su gestión pertenece al módulo Acopiador.</li>
    <li><strong>Descarte del Exportador como módulo interno:</strong> El exportador no es un módulo Java ni una tabla de base de datos; es un destino externo.</li>
    <li><strong>Descarte de Consolidación como módulo autónomo:</strong> La consolidación es una funcionalidad interna del módulo Mayorista.</li>
    <li><strong>Descarte de tolerancias matemáticas automáticas:</strong> El sistema no debe bloquear operaciones por diferencias de peso entre balanzas o fundiciones sin una regla formal de negocio.</li>
  </ul>

  <h3>2.4 Marco Metodológico: Domain-Driven Design (DDD)</h3>
  <p>El desarrollo se fundamenta en el Diseño Guiado por el Dominio (DDD), garantizando que los límites del software coincidan con los Bounded Contexts del negocio. Se aplica rigurosamente la <strong>Prueba de Tres Partes</strong> (Ciclo de Vida, Cardinalidad e Invariante de Negocio) para clasificar Agregados, Entidades y Objetos de Valor. Asimismo, se consagra el principio de no invención: todo vacío procedimental se declara como <code>[PENDIENTE DE DEFINICIÓN DEL NEGOCIO]</code>.</p>

  <!-- ==================== SECCIÓN 3 ==================== -->
  <h2>3. Macroproceso de Negocio y Cadena de Valor</h2>

  <h3>3.1 Estructura Secuencial de la Cadena de Comercialización</h3>
  <div class="formula-block">
    MINERO (Venta Primaria) &nbsp;&longrightarrow;&nbsp; ACOPIADOR (Acopio y Bóveda) &nbsp;&longrightarrow;&nbsp; MAYORISTA (Planta y Ley) &nbsp;&longrightarrow;&nbsp; EXPORTADOR (Comercio Exterior)
  </div>
  <p>La cadena de valor inicia con el minero, quien puede consultar el Cotizador de manera opcional. Tras ello, acude presencialmente al Acopiador, quien realiza el pesaje inicial, la fundición, el enfriamiento y el segundo pesaje. Tras clasificar el lote en Rojo o Verde, liquida en Soles, efectúa el pago real y acumula el metal en bóveda. De manera periódica (semanal), el mineral acumulado segregado se entrega al Mayorista, quien ejecuta un nuevo pesaje de entrada, fundición secundaria, limpieza de escorias, ensayo instrumental de Ley, liquidación en USD/PEN y pago al acopiador. Finalmente, mediante la Consolidación, se agrupan lotes por Peso y Ley para el Exportador.</p>

  <h3>3.2 Caracterización Detallada de los Actores del Dominio</h3>
  <ul>
    <li><strong>Minero:</strong> Poseedor y vendedor del oro bruto. Puede utilizar el Cotizador únicamente como consulta orientativa. Es registrado por el Acopiador para resguardar la trazabilidad de procedencia.</li>
    <li><strong>Acopiador:</strong> Comprador primario en zona de acopio. Pesa, funde, enfría, registra el peso resultante, clasifica en Rojo/Verde, liquida con precios de Parámetros, desembolsa fondos reales al minero y custodia el mineral acumulado en bóveda segregado por color.</li>
    <li><strong>Mayorista:</strong> Operador industrial y comercializador secundario. Recibe el mineral segregado, ejecuta su propio pesaje independiente, homogeniza mediante fundición, enfría, limpia el metal de escorias, determina la LEY instrumental, liquida en Dólares y Soles integrando Onza, Tipo de Cambio y Descuento, paga al acopiador y opera la consolidación.</li>
    <li><strong>Exportador:</strong> Destinatario comercial internacional (Actor Externo) que adquiere los lotes consolidados del mayorista.</li>
  </ul>

  <!-- ==================== SECCIÓN 4 ==================== -->
  <h2>4. Arquitectura Modular y Taxonomía del Sistema</h2>

  <h3>4.1 Principios de Monolito Modular con Spring Boot y Spring Modulith</h3>
  <p>SITRA-ORO se diseña bajo el patrón de Monolito Modular empleando Spring Boot y Spring Modulith. Cada subdominio reside en su propio paquete base dentro de <code>pe.edu.upeu.sitraoro.acopio</code>, resguardando su encapsulamiento interno. Se prohíbe terminantemente la inyección de repositorios JPA de un módulo dentro de los servicios de otro módulo, canalizando toda comunicación a través de interfaces públicas formalizadas.</p>

  <h3>4.2 Taxonomía y Clasificación Formal de Módulos</h3>
  <table class="academic-table">
    <thead>
      <tr>
        <th style="width: 20%;">Clasificación</th>
        <th style="width: 18%;">Módulo</th>
        <th style="width: 35%;">Paquete Base</th>
        <th>Responsabilidad Arquitectónica</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Transaccional</strong></td>
        <td>Acopiador</td>
        <td><code>pe.edu.upeu.sitraoro.acopio.acopiador</code></td>
        <td>Gestión de Mineros, pesajes 1 y 2, fundición, compras reales, pagos en PEN y acumulación en bóveda por color.</td>
      </tr>
      <tr>
        <td><strong>Transaccional</strong></td>
        <td>Mayorista</td>
        <td><code>pe.edu.upeu.sitraoro.acopio.mayorista</code></td>
        <td>Pesaje independiente de recepción, limpieza, análisis de Ley, liquidación USD/PEN, pagos a acopiadores y CRUD Consolidación.</td>
      </tr>
      <tr>
        <td><strong>No Transaccional</strong></td>
        <td>Cotizador</td>
        <td><code>pe.edu.upeu.sitraoro.acopio.cotizador</code></td>
        <td>Cálculo puro estimativo para mineros. No muta estado, no persiste compras ni afecta stock.</td>
      </tr>
      <tr>
        <td><strong>No Transaccional</strong></td>
        <td>Parámetros</td>
        <td><code>pe.edu.upeu.sitraoro.acopio.parametros</code></td>
        <td>Catálogo centralizado de tarifas: precio gramo PEN, onza USD, tipo de cambio y descuento.</td>
      </tr>
      <tr>
        <td><strong>Transversal</strong></td>
        <td>Seguridad</td>
        <td><code>pe.edu.upeu.sitraoro.acopio.seguridad</code></td>
        <td>Autenticación, autorización basada en roles (RBAC) y auditoría transversal del sistema.</td>
      </tr>
    </tbody>
  </table>

  <h3>4.3 Delimitación de Elementos que No Constituyen Módulos</h3>
  <ul>
    <li><strong>Dashboard:</strong> Es una interfaz gráfica de consulta agregada; proyecta información producida por Acopiador y Mayorista sin poseer lógica transaccional propia.</li>
    <li><strong>Consolidación:</strong> Es una subcapacidad operativa y funcional materializada como un CRUD interno del módulo Mayorista.</li>
    <li><strong>Exportador:</strong> Es un actor comercial externo al sistema monolítico.</li>
  </ul>

  <!-- ==================== SECCIÓN 5 ==================== -->
  <h2>5. Especificación Funcional Detallada de Subdominios y Procesos</h2>

  <h3>5.1 Subdominio Cotizador (No Transaccional)</h3>
  <p>Permite al minero estimar el valor aproximado de su oro ingresando el peso bruto y la clasificación presunta (Rojo/Verde). El servicio consulta la tarifa del día en Parámetros y efectúa una proyección económica.</p>
  <div class="formal-quote">
    Regla canónica: Una cotización es estrictamente informativa. No genera órdenes de compra, no reserva stock, no efectúa cobros ni desembolsos y no compromete el precio definitivo de la operación presencial.
  </div>

  <h3>5.2 Subdominio Acopiador (Transaccional)</h3>
  <p>Representa la primera operación de compra formal del sistema. Su ciclo de vida operativo comprende:</p>
  <ul>
    <li><strong>5.2.1 Registro de Mineros:</strong> El acopiador captura los datos identificativos del minero en ventanilla para garantizar la trazabilidad de procedencia. Minero pertenece funcionalmente a este módulo.</li>
    <li><strong>5.2.2 Primer Pesaje (P1):</strong> Pesaje inicial en balanza calibrada del mineral en bruto, registrado en gramos con tres decimales.</li>
    <li><strong>5.2.3 Fundición y Enfriamiento:</strong> Tratamiento térmico en crisol para eliminar impurezas groseras y enfriamiento controlado en agua para estabilizar la masa del metal.</li>
    <li><strong>5.2.4 Segundo Pesaje (P2) y Variación:</strong> Pesaje neto post-fundición. La merma gravimétrica $\Delta P = P_1 - P_2$ se asienta para fines de auditoría. El sistema no bloquea la operación por variaciones al no existir una tolerancia fija aprobada.</li>
    <li><strong>5.2.5 Clasificación Cualitativa:</strong> Inspección visual directa determinando si el mineral es ROJO o VERDE. Se prohíbe implementar algoritmos matemáticos para deducir el color.</li>
    <li><strong>5.2.6 Liquidación y Pago:</strong> Aplicación del precio oficial de Parámetros sobre el peso neto $P_2$, efectuando el pago en Soles (PEN) al minero y asentando la compra transaccional.</li>
    <li><strong>5.2.7 Acopio Segregado y Cierre Semanal:</strong> El mineral comprado se almacena en bóveda dividido en Acumulado Rojo y Acumulado Verde, consolidando volumen para su entrega periódica al mayorista.</li>
  </ul>

  <h3>5.3 Subdominio Mayorista (Transaccional)</h3>
  <p>Gestiona la adquisición secundaria del mineral acumulado por los acopiadores y su certificación de pureza:</p>
  <ul>
    <li><strong>5.3.1 Recepción Segregada:</strong> Recepción física manteniendo la división estricta entre oro rojo y verde.</li>
    <li><strong>5.3.2 Nuevo Pesaje Independiente:</strong> Pesaje propio ejecutado en balanza de planta mayorista tanto para rojo como para verde. El sistema no sobreescribe ni asume como definitivo el peso declarado por el acopiador.</li>
    <li><strong>5.3.3 Homogeneización Física:</strong> Fundición secundaria para unificar la masa antes de la toma de muestras.</li>
    <li><strong>5.3.4 Limpieza Rigurosa del Oro:</strong> Decapado y remoción de escorias e impurezas superficiales. Esta etapa física es obligatoria para garantizar la validez del análisis.</li>
    <li><strong>5.3.5 Análisis y Determinación de la LEY:</strong> Determinación analítica del título de pureza del oro mediante copelación o espectrometría. Se asienta la tupla técnica oficial: PESO + LEY.</li>
    <li><strong>5.3.6 Integración de Variables Económicas:</strong> La liquidación integra Peso, Ley, Onza Troy USD, Tipo de Cambio USD/PEN y Descuento comercial.</li>
    <li><strong>5.3.7 Liquidación Multi-Divisa y Pago:</strong> Computa el desglose en Dólares (USD), Soles (PEN) y Pago Total Liquidado, asentando el desembolso a favor del acopiador.</li>
  </ul>

  <h3>5.4 Subcapacidad Analítica: CRUD de Consolidación de Lotes</h3>
  <p>Funcionalidad analítica alojada exclusivamente dentro del módulo Mayorista. Permite al operador consultar las liquidaciones históricas previas y seleccionar registros individuales (Lote A, Lote B, Lote C). La consolidación extrae primordialmente la masa física (Peso) y la pureza (Ley) de cada partida seleccionada, conformando un lote consolidado para su comercialización al Exportador. La fórmula de cálculo de la ley resultante queda formalmente catalogada como pendiente hasta su confirmación por el negocio.</p>

  <!-- ==================== SECCIÓN 6 ==================== -->
  <h2>6. Matriz de Trazabilidad Integral y Auditoría de Cadena de Custodia</h2>
  <table class="academic-table">
    <thead>
      <tr>
        <th style="width: 8%;">Hito</th>
        <th style="width: 25%;">Etapa Operativa</th>
        <th style="width: 22%;">Actor / Módulo</th>
        <th>Evidencia y Atributos Almacenados</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>01</strong></td>
        <td>Identificación de Origen</td>
        <td>Minero / Acopiador</td>
        <td>Identidad del minero (DNI/RUC), zona de procedencia, fecha y hora de atención.</td>
      </tr>
      <tr>
        <td><strong>02</strong></td>
        <td>Recepción Gravimétrica 1</td>
        <td>Operador de Acopio</td>
        <td>Peso en bruto sin fundir (P1) en gramos con tres decimales.</td>
      </tr>
      <tr>
        <td><strong>03</strong></td>
        <td>Tratamiento Térmico</td>
        <td>Fundidor de Acopio</td>
        <td>Proceso físico de fundición y enfriamiento controlado en agua.</td>
      </tr>
      <tr>
        <td><strong>04</strong></td>
        <td>Recepción Gravimétrica 2</td>
        <td>Operador de Acopio</td>
        <td>Peso neto resultante post-fundición (P2), variación gravimétrica registrada.</td>
      </tr>
      <tr>
        <td><strong>05</strong></td>
        <td>Clasificación Visual</td>
        <td>Operador de Acopio</td>
        <td>Asignación organoléptica de calidad: ROJO o VERDE.</td>
      </tr>
      <tr>
        <td><strong>06</strong></td>
        <td>Liquidación Primaria</td>
        <td>Acopiador</td>
        <td>Tarifa oficial de Parámetros (PEN/g), importe liquidado y pago real al minero.</td>
      </tr>
      <tr>
        <td><strong>07</strong></td>
        <td>Custodia en Bóveda</td>
        <td>Acopiador</td>
        <td>Saldo acumulado segregado: Stock Acumulado Rojo y Stock Acumulado Verde.</td>
      </tr>
      <tr>
        <td><strong>08</strong></td>
        <td>Nuevo Pesaje de Planta</td>
        <td>Mayorista</td>
        <td>Pesaje independiente de recepción: Peso Mayorista Rojo y Peso Mayorista Verde.</td>
      </tr>
      <tr>
        <td><strong>09</strong></td>
        <td>Limpieza y Decapado</td>
        <td>Mayorista</td>
        <td>Remoción física y química de escorias residuales post-fundición secundaria.</td>
      </tr>
      <tr>
        <td><strong>10</strong></td>
        <td>Certificación de Pureza</td>
        <td>Laboratorio Mayorista</td>
        <td>Ensayo instrumental determinando y registrando formalmente la LEY DEL ORO.</td>
      </tr>
      <tr>
        <td><strong>11</strong></td>
        <td>Liquidación Financiera</td>
        <td>Mayorista</td>
        <td>Onza USD, Tipo de Cambio, Descuento, Subtotal USD, Subtotal PEN y Pago Total.</td>
      </tr>
      <tr>
        <td><strong>12</strong></td>
        <td>Consolidación</td>
        <td>Mayorista (CRUD)</td>
        <td>Selección de lotes históricos extrayendo el vector crítico: Peso + Ley.</td>
      </tr>
      <tr>
        <td><strong>13</strong></td>
        <td>Despacho Internacional</td>
        <td>Exportador (Externo)</td>
        <td>Comercialización exterior del lote consolidado preparado por el mayorista.</td>
      </tr>
    </tbody>
  </table>

  <!-- ==================== SECCIÓN 7 ==================== -->
  <h2>7. Matriz de Desambiguación Conceptual (Anti-Patrones de Dominio)</h2>
  <table class="academic-table">
    <thead>
      <tr>
        <th style="width: 25%;">Concepto A</th>
        <th style="width: 25%;">Concepto B</th>
        <th>Criterio Canónico de Separación y Regla de Dominio</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Cotización</strong></td>
        <td><strong>Compra Real</strong></td>
        <td>La cotización es una consulta informativa sin efectos transaccionales. La compra es transaccional, genera asientos contables y desembolsa dinero real.</td>
      </tr>
      <tr>
        <td><strong>Compra al Minero</strong></td>
        <td><strong>Entrega al Mayorista</strong></td>
        <td>La compra al minero es un acto minorista e individual en zona de acopio. La entrega al mayorista es un despacho al por mayor de stock acumulado semanal.</td>
      </tr>
      <tr>
        <td><strong>Peso del Acopiador</strong></td>
        <td><strong>Peso del Mayorista</strong></td>
        <td>Son mediciones físicas independientes en balanzas y momentos distintos. El sistema resguarda ambas de forma autónoma sin sobreescrituras.</td>
      </tr>
      <tr>
        <td><strong>Pago al Minero</strong></td>
        <td><strong>Pago al Acopiador</strong></td>
        <td>El acopiador paga al minero en soles con precio de acopio local. El mayorista liquida al acopiador computando Onza en USD, Ley, Tipo de Cambio y Descuento.</td>
      </tr>
      <tr>
        <td><strong>Acopio en Bóveda</strong></td>
        <td><strong>Consolidación</strong></td>
        <td>Acopio es custodia física y acumulación de inventario en bóveda. Consolidación es un agrupamiento analítico de lotes históricos por Peso + Ley.</td>
      </tr>
      <tr>
        <td><strong>Mayorista</strong></td>
        <td><strong>Exportador</strong></td>
        <td>El Mayorista es un actor transaccional con módulo interno propio. El Exportador es un agente mercantil externo del comercio exterior.</td>
      </tr>
      <tr>
        <td><strong>Módulo de Software</strong></td>
        <td><strong>Dashboard</strong></td>
        <td>Los módulos administran reglas transaccionales y persistencia propia. El Dashboard es solo una vista agregadora de consulta.</td>
      </tr>
      <tr>
        <td><strong>Módulo de Software</strong></td>
        <td><strong>Consolidación</strong></td>
        <td>Consolidación no posee base de datos ni límites aislados; es un CRUD perteneciente a la estructura interna del Mayorista.</td>
      </tr>
      <tr>
        <td><strong>Módulo Parámetros</strong></td>
        <td><strong>Dueño de Mineros</strong></td>
        <td>Parámetros solo mantiene constantes de mercado. La administración de Mineros pertenece de manera obligatoria al módulo Acopiador.</td>
      </tr>
    </tbody>
  </table>

  <!-- ==================== SECCIÓN 8 ==================== -->
  <h2>8. Registro Formal de Pendientes de Definición de Negocio</h2>
  <table class="academic-table">
    <thead>
      <tr>
        <th style="width: 10%;">Código</th>
        <th style="width: 35%;">Aspecto Funcional</th>
        <th style="width: 18%;">Estado Formal</th>
        <th>Justificación Técnica de la Espera</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>PDN-01</strong></td>
        <td>Fórmula Exacta de Liquidación Mayorista</td>
        <td>Pendiente</td>
        <td>Se conocen las variables (Peso, Onza, Ley, Tipo Cambio, Descuento), pero falta formalizar la ecuación exacta para evitar sesgos financieros.</td>
      </tr>
      <tr>
        <td><strong>PDN-02</strong></td>
        <td>Algoritmo de Consolidación de Leyes</td>
        <td>Pendiente</td>
        <td>Falta definir si la ley compuesta se obtiene mediante promedio ponderado gravimétrico u otro método metalúrgico validado.</td>
      </tr>
      <tr>
        <td><strong>PDN-03</strong></td>
        <td>Regla y Tasa de Descuento Comercial</td>
        <td>Pendiente</td>
        <td>Descartado el 5% fijo de oro verde, se requiere la regla formal que determina la tasa de descuento aplicable por el mayorista.</td>
      </tr>
      <tr>
        <td><strong>PDN-04</strong></td>
        <td>Umbral de Merma en Fundición de Acopio</td>
        <td>Pendiente</td>
        <td>Margen admisible de diferencia entre P1 y P2 antes de requerir autorización por merma excesiva.</td>
      </tr>
      <tr>
        <td><strong>PDN-05</strong></td>
        <td>Tolerancia de Discrepancia entre Balanzas</td>
        <td>Pendiente</td>
        <td>Variación máxima admisible entre el peso declarado por el acopiador y el verificado en planta mayorista.</td>
      </tr>
      <tr>
        <td><strong>PDN-06</strong></td>
        <td>Parámetros Objetivos de Colorimetría</td>
        <td>Pendiente</td>
        <td>Criterios físicos estandarizados para clasificar en Rojo o Verde más allá de la inspección visual empírica.</td>
      </tr>
      <tr>
        <td><strong>PDN-07</strong></td>
        <td>Campos Legales Obligatorios del Minero</td>
        <td>Pendiente</td>
        <td>Validación de requisitos normativos (carné REINFO, número de concesión, RUC y coordenadas de procedencia).</td>
      </tr>
      <tr>
        <td><strong>PDN-08</strong></td>
        <td>Matriz Definitiva de Seguridad RBAC</td>
        <td>Pendiente</td>
        <td>Estructura final de roles y permisos para el pase a producción de Seguridad.</td>
      </tr>
      <tr>
        <td><strong>PDN-09</strong></td>
        <td>Máquina de Estados de Transacciones</td>
        <td>Pendiente</td>
        <td>Catálogo formal de estados del ciclo de vida (Iniciada, Pesada, Fundida, Liquidada, Pagada, Anulada).</td>
      </tr>
    </tbody>
  </table>

  <!-- ==================== SECCIÓN 9 ==================== -->
  <h2>9. Análisis de Brecha (Gap Analysis) y Plan de Refactorización Técnica</h2>
  <table class="academic-table">
    <thead>
      <tr>
        <th style="width: 18%;">Componente</th>
        <th style="width: 25%;">Situación Previa (Discrepante)</th>
        <th style="width: 25%;">Situación Meta (Auditada)</th>
        <th>Acción Técnica Concreta</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Backend: Minero</strong></td>
        <td>Ubicado en paquete <code>parametros</code></td>
        <td>Pertenece al módulo <code>acopiador</code></td>
        <td>Mover entidad, repositorio, servicio y controlador al paquete <code>acopio.acopiador</code>.</td>
      </tr>
      <tr>
        <td><strong>Backend: Mayorista</strong></td>
        <td>Multiplica por 1.05 fijo en oro verde</td>
        <td>Regla del 5% descartada</td>
        <td>Remover cálculo rígido en <code>MayoristaServiceImpl</code> y adaptar consumo de parámetros.</td>
      </tr>
      <tr>
        <td><strong>Backend: Entidades</strong></td>
        <td>Liquidación sin Ley, Descuento ni USD</td>
        <td>Debe incluir Ley, Descuento, USD y PEN</td>
        <td>Refactorizar entidades JPA, DTOs y validaciones en el módulo Mayorista.</td>
      </tr>
      <tr>
        <td><strong>Backend: Consolidación</strong></td>
        <td>Inexistente (solo flag textual)</td>
        <td>CRUD formal de selección por Peso + Ley</td>
        <td>Crear entidad, repositorio y endpoints de consolidación en Mayorista.</td>
      </tr>
      <tr>
        <td><strong>Base de Datos (BD2)</strong></td>
        <td>FK directa <code>ID_LIQUIDACION_G1</code> en compras</td>
        <td>Compras desacopladas de la liquidación</td>
        <td>Reestructurar relación para reflejar liquidación de lotes acumulados y no compras unitarias.</td>
      </tr>
      <tr>
        <td><strong>Backend: Dashboard</strong></td>
        <td>Controlador dentro de <code>parametros</code></td>
        <td>Vista transversal desacoplada</td>
        <td>Mover <code>DashboardController</code> fuera del catálogo de parámetros.</td>
      </tr>
    </tbody>
  </table>

  <!-- ==================== SECCIÓN 10 ==================== -->
  <h2>10. Conclusiones y Conformidad Institucional</h2>
  <p>1. El presente informe técnico formaliza la especificación funcional canónica del sistema <strong>SITRA-ORO</strong>, erradicando supuestos que distorsionaban la operativa real del acopio aurífero.</p>
  <p>2. La arquitectura monolítica modular garantiza una rigurosa separación de responsabilidades entre los cinco módulos del sistema mediante el uso de contratos públicos en Spring Modulith.</p>
  <p>3. Se ratifica la estricta prohibición de implementar cálculos inventados, manteniendo catalogados como pendientes aquellos aspectos que requieren ratificación de la gerencia del negocio.</p>
  <p>4. El plan de refactorización técnica suministra una guía estructurada para la evolución del backend Spring Boot, los scripts de base de datos Oracle y la interfaz de usuario en Angular SPA.</p>

  <div class="signatures-block">
    <div class="signature-item">
      <div class="signature-line"></div>
      <strong>Faijo Calisaya Helio Paul</strong><br>
      Estudiante Investigador — Equipo 05<br>
      Escuela Profesional de Ingeniería de Sistemas<br>
      <strong>Universidad Peruana Unión (UPeU)</strong>
    </div>
    <div class="signature-item">
      <div class="signature-line"></div>
      <strong>Ing. Erick David Salazar</strong><br>
      Docente de Asignatura<br>
      Facultad de Ingeniería y Arquitectura<br>
      <strong>Universidad Peruana Unión (UPeU)</strong>
    </div>
  </div>

</body>
</html>
`;

// Save standalone HTML file
fs.writeFileSync(htmlPath, htmlContent, "utf8");
console.log("Archivo HTML profesional generado en:", htmlPath);

console.log("Compilando Informe Técnico Oficial en PDF con Playwright...");

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  args: ["--use-angle=swiftshader", "--disable-gpu-sandbox"],
});

try {
  const page = await browser.newPage({
    viewport: { width: 1200, height: 1600 },
  });

  await page.setContent(htmlContent, { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  await page.pdf({
    path: targetPdf,
    format: "A4",
    printBackground: true,
    margin: {
      top: "18mm",
      bottom: "18mm",
      left: "16mm",
      right: "16mm",
    },
    displayHeaderFooter: true,
    headerTemplate: '<div style="font-size: 8pt; color: #4b5563; font-family: \'Times New Roman\', serif; width: 100%; padding: 0 16mm; display: flex; justify-content: space-between; border-bottom: 1px solid #94a3b8; padding-bottom: 2px;"><span>UNIVERSIDAD PERUANA UNIÓN · EP INGENIERÍA DE SISTEMAS</span><span>SITRA-ORO — Informe Técnico v2.0</span></div>',
    footerTemplate: '<div style="font-size: 8pt; color: #4b5563; font-family: \'Times New Roman\', serif; width: 100%; padding: 0 16mm; display: flex; justify-content: space-between; border-top: 1px solid #94a3b8; padding-top: 2px;"><span>Faijo Calisaya Helio Paul (Equipo 05)</span><span>Página <span class="pageNumber"></span> de <span class="totalPages"></span></span></div>',
  });

  console.log("PDF oficial generado exitosamente en:", targetPdf);
} finally {
  await browser.close();
}
