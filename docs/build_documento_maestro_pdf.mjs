import { chromium } from "file:///C:/Users/Paul/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.join(here, "DOCUMENTO_MAESTRO_CONTEXTO_FUNCIONAL_SITRA_ORO.html");
const targetPdf = path.join(here, "DOCUMENTO_MAESTRO_CONTEXTO_FUNCIONAL_SITRA_ORO.pdf");

// Helper to convert image to base64 data URI
function getBase64Image(filePath) {
  const data = fs.readFileSync(filePath);
  const ext = path.extname(filePath).slice(1);
  return `data:image/${ext === "jpg" ? "jpeg" : ext};base64,${data.toString("base64")}`;
}

const logoUpeu = getBase64Image(path.join(here, "presentacion/s06/assets/upeu.png"));
const logoSistemas = getBase64Image(path.join(here, "presentacion/s06/assets/ingenieria-sistemas.png"));
const logoSitraOro = getBase64Image(path.join(here, "presentacion/s06/assets/quilate-bullion-emblema-v2.png"));

const htmlTemplate = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>DOCUMENTO MAESTRO SITRA-ORO — UPEU</title>
  <style>
    @page {
      size: A4;
      margin: 18mm 14mm 18mm 14mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-size: 9.5pt;
      line-height: 1.5;
      color: #1e293b;
      background: #ffffff;
    }

    /* PORTADA */
    .cover-page {
      page-break-after: always;
      height: 100%;
      min-height: 250mm;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      text-align: center;
      padding: 10mm 5mm;
      border: 3px double #d4af37;
      border-radius: 8px;
      position: relative;
    }
    .cover-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #0f2744;
      padding-bottom: 12px;
      margin-bottom: 20px;
    }
    .cover-logo-left img {
      height: 60px;
      width: auto;
      object-fit: contain;
    }
    .cover-logo-right img {
      height: 60px;
      width: auto;
      object-fit: contain;
    }
    .cover-header-text {
      flex: 1;
      padding: 0 15px;
    }
    .cover-inst-name {
      font-size: 13pt;
      font-weight: 800;
      color: #0f2744;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .cover-faculty-name {
      font-size: 10pt;
      font-weight: 700;
      color: #b45309;
      text-transform: uppercase;
      margin-top: 2px;
    }
    .cover-school-name {
      font-size: 9pt;
      font-weight: 600;
      color: #475569;
    }

    .cover-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      margin: 15px 0;
    }
    .cover-emblem-wrap {
      width: 140px;
      height: 140px;
      margin: 0 auto 16px;
      padding: 8px;
      border-radius: 50%;
      background: radial-gradient(circle, #fffbeb 0%, #fef3c7 70%, #fde68a 100%);
      box-shadow: 0 4px 15px rgba(212, 175, 55, 0.35);
      border: 2px solid #d4af37;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .cover-emblem-wrap img {
      width: 120px;
      height: 120px;
      object-fit: contain;
    }
    .cover-project-title {
      font-size: 26pt;
      font-weight: 900;
      color: #0f2744;
      letter-spacing: 1px;
      margin-bottom: 4px;
    }
    .cover-project-subtitle {
      font-size: 11.5pt;
      font-weight: 700;
      color: #b45309;
      margin-bottom: 20px;
    }
    .cover-doc-badge {
      background: #0f2744;
      color: #ffffff;
      padding: 6px 18px;
      border-radius: 20px;
      font-size: 9.5pt;
      font-weight: 700;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      display: inline-block;
      margin-bottom: 12px;
    }
    .cover-doc-title {
      font-size: 13.5pt;
      font-weight: 800;
      color: #1e293b;
      max-width: 500px;
      line-height: 1.35;
      margin-bottom: 10px;
    }
    .cover-version {
      font-size: 9.5pt;
      color: #059669;
      font-weight: 700;
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      padding: 3px 12px;
      border-radius: 12px;
      display: inline-block;
    }

    .cover-footer-box {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 12px 18px;
      text-align: left;
      font-size: 8.5pt;
      color: #334155;
    }
    .cover-meta-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px 20px;
    }
    .cover-meta-item strong {
      color: #0f2744;
    }
    .cover-place-date {
      margin-top: 14px;
      font-size: 8.5pt;
      color: #64748b;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* SECCIONES Y ENCABEZADOS */
    .section-break {
      page-break-before: always;
    }
    h2 {
      font-size: 11.5pt;
      color: #0f2744;
      border-bottom: 2px solid #0284c7;
      padding-bottom: 4px;
      margin-top: 16px;
      margin-bottom: 10px;
      font-weight: 800;
      display: flex;
      align-items: center;
      gap: 6px;
      page-break-after: avoid;
    }
    h2::before {
      content: "";
      display: inline-block;
      width: 4px;
      height: 14px;
      background: #b45309;
      border-radius: 2px;
    }
    h3 {
      font-size: 10pt;
      color: #0369a1;
      margin-top: 12px;
      margin-bottom: 6px;
      font-weight: 700;
      page-break-after: avoid;
    }
    h4 {
      font-size: 9pt;
      color: #334155;
      margin-top: 8px;
      margin-bottom: 4px;
      font-weight: 700;
      page-break-after: avoid;
    }
    p {
      margin-bottom: 7px;
      text-align: justify;
    }
    ul, ol {
      margin-left: 20px;
      margin-bottom: 8px;
    }
    li {
      margin-bottom: 3px;
    }
    code {
      font-family: Consolas, monospace;
      font-size: 8pt;
      background: #f1f5f9;
      color: #0f2744;
      padding: 1px 4px;
      border-radius: 4px;
      border: 1px solid #cbd5e1;
    }

    /* TABLAS */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0 14px;
      font-size: 8.5pt;
      page-break-inside: avoid;
    }
    table th, table td {
      border: 1px solid #cbd5e1;
      padding: 6px 8px;
      text-align: left;
      vertical-align: top;
    }
    table th {
      background: #0f2744;
      color: #ffffff;
      font-weight: 700;
      font-size: 8.5pt;
    }
    table tr:nth-child(even) td {
      background: #f8fafc;
    }

    /* CALLOUTS */
    .callout-box {
      border-left: 4px solid #0284c7;
      background: #f0f9ff;
      border-radius: 0 6px 6px 0;
      padding: 8px 12px;
      margin: 10px 0;
      font-size: 8.8pt;
      color: #0369a1;
      page-break-inside: avoid;
    }
    .callout-box.warning {
      border-left-color: #f59e0b;
      background: #fffbeb;
      color: #b45309;
    }
    .callout-box.danger {
      border-left-color: #ef4444;
      background: #fef2f2;
      color: #b91c1c;
    }
    .callout-box.success {
      border-left-color: #10b981;
      background: #ecfdf5;
      color: #047857;
    }

    /* DIAGRAMA / ASCII FLOW */
    .diagram-card {
      background: #0f172a;
      color: #f8fafc;
      padding: 10px 14px;
      border-radius: 6px;
      font-family: Consolas, monospace;
      font-size: 7.5pt;
      line-height: 1.4;
      margin: 10px 0;
      overflow-x: auto;
      page-break-inside: avoid;
      box-shadow: inset 0 0 10px rgba(0,0,0,0.5);
    }

    .badge-tag {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 7.5pt;
      font-weight: 700;
      text-transform: uppercase;
    }
    .badge-trans {
      background: #e0f2fe;
      color: #0369a1;
      border: 1px solid #bae6fd;
    }
    .badge-notrans {
      background: #fef3c7;
      color: #b45309;
      border: 1px solid #fde68a;
    }
    .badge-transversal {
      background: #f3e8ff;
      color: #7e22ce;
      border: 1px solid #e9d5ff;
    }
    .badge-pending {
      background: #fee2e2;
      color: #dc2626;
      border: 1px solid #fecaca;
    }

    .signature-container {
      margin-top: 24px;
      display: flex;
      justify-content: space-around;
      text-align: center;
      font-size: 8.5pt;
      page-break-inside: avoid;
    }
    .signature-line {
      width: 200px;
      border-top: 1px solid #1e293b;
      margin: 30px auto 4px;
    }
  </style>
</head>
<body>

  <!-- ==================== PORTADA INSTITUCIONAL ==================== -->
  <div class="cover-page">
    <div class="cover-header">
      <div class="cover-logo-left">
        <img src="__LOGO_UPEU__" alt="UPeU">
      </div>
      <div class="cover-header-text">
        <div class="cover-inst-name">Universidad Peruana Unión</div>
        <div class="cover-faculty-name">Facultad de Ingeniería y Arquitectura</div>
        <div class="cover-school-name">Escuela Profesional de Ingeniería de Sistemas</div>
      </div>
      <div class="cover-logo-right">
        <img src="__LOGO_SISTEMAS__" alt="Ingeniería de Sistemas">
      </div>
    </div>

    <div class="cover-body">
      <div class="cover-emblem-wrap">
        <img src="__LOGO_SITRA_ORO__" alt="SITRA-ORO Emblema">
      </div>
      <div class="cover-project-title">SITRA-ORO</div>
      <div class="cover-project-subtitle">Sistema de Trazabilidad y Liquidación en Acopio de Oro</div>

      <div class="cover-doc-badge">Documento de Especificación Oficial</div>
      <div class="cover-doc-title">DOCUMENTO MAESTRO DE ESPECIFICACIÓN FUNCIONAL Y ARQUITECTURA DE DOMINIO</div>
      <div class="cover-version">Versión 2.0 — Auditoría Funcional Oficial de Negocio</div>
    </div>

    <div class="cover-footer-box">
      <div class="cover-meta-grid">
        <div class="cover-meta-item"><strong>Asignatura:</strong> Lenguaje de Programación II</div>
        <div class="cover-meta-item"><strong>Docente:</strong> Ing. Erick David Salazar</div>
        <div class="cover-meta-item"><strong>Estudiante:</strong> Faijo Calisaya Helio Paul</div>
        <div class="cover-meta-item"><strong>Equipo:</strong> Equipo 05</div>
        <div class="cover-meta-item"><strong>Ciclo Académico:</strong> IV — Semestre 2026-II</div>
        <div class="cover-meta-item"><strong>Repositorio:</strong> SysProyec_Acopus (GitHub)</div>
      </div>
      <div class="cover-place-date" style="text-align: center;">
        Juliaca / Lima, Perú — Septiembre de 2026
      </div>
    </div>
  </div>

  <!-- ==================== CONTENIDO DEL DOCUMENTO ==================== -->

  <h2>1. CONTROL DE VERSIONES Y AUDITORÍA DEL DOCUMENTO</h2>
  <p>El presente documento constituye la especificación canónica y fuente única de verdad para el diseño de dominio, diagramación UML, esquemas de bases de datos relacionales (Oracle XE) y arquitectura de software (Spring Boot + Modulith y Angular SPA) del proyecto <strong>SITRA-ORO</strong>.</p>

  <table>
    <thead>
      <tr>
        <th style="width: 12%;">Versión</th>
        <th style="width: 15%;">Fecha</th>
        <th style="width: 25%;">Autor / Rol</th>
        <th>Descripción de Modificación y Racional</th>
        <th style="width: 12%;">Estado</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>v1.0</strong></td>
        <td>10/09/2026</td>
        <td>Equipo 05 (Helio Calisaya)</td>
        <td>Modelo preliminar basado en la división de actores Minero, G2 (Acopiador) y G1 (Mayorista). Aplicaba un recargo rígido del 5% al oro verde y consideraba a Minero como parámetro.</td>
        <td><span class="badge-tag" style="background:#fee2e2; color:#991b1b;">Obsoleta</span></td>
      </tr>
      <tr>
        <td><strong>v2.0</strong></td>
        <td>24/09/2026</td>
        <td>Faijo Calisaya Helio Paul (Equipo 05)</td>
        <td><strong>Actualización Oficial Integral:</strong> Incorpora la auditoría de negocio real. Describe el ciclo físico de Mayorista (fundición, enfriamiento, limpieza y LEY), pesaje independiente, CRUD de Consolidación (Peso + Ley), reubica a Minero dentro de Acopiador, descarta el 5% fijo y formaliza puntos pendientes de definición.</td>
        <td><span class="badge-tag" style="background:#dcfce7; color:#166534;">Vigente / Oficial</span></td>
      </tr>
    </tbody>
  </table>

  <h2>2. RESUMEN EJECUTIVO Y OBJETIVO DEL SISTEMA</h2>
  <p><strong>SITRA-ORO (Sistema de Trazabilidad y Liquidación en Acopio de Oro)</strong> es una plataforma de ingeniería de software orientada a digitalizar, transparentar y garantizar la trazabilidad física, cualitativa y financiera del acopio de mineral aurífero. Reemplaza los procesos manuales vulnerables a errores de cálculo, discrepancias de balanza y pérdida de procedencia del mineral.</p>

  <div class="callout-box">
    <strong>Cadena de Valor del Negocio:</strong><br>
    <code>MINERO</code> &nbsp;➔&nbsp; <code>ACOPIADOR</code> &nbsp;➔&nbsp; <code>MAYORISTA</code> &nbsp;➔&nbsp; <code>EXPORTADOR</code> (Actor Externo)
  </div>

  <p>La solución se estructura como un <strong>Monolito Modular</strong> basado en <strong>Spring Boot y Spring Modulith</strong>, donde cada módulo de dominio mantiene límites transaccionales explícitos (Bounded Contexts) comunicándose exclusivamente a través de contratos de servicios públicos, sin acceso directo a repositorios privados.</p>

  <h2>3. ACTORES PRINCIPALES DEL NEGOCIO</h2>
  <table>
    <thead>
      <tr>
        <th style="width: 20%;">Actor</th>
        <th style="width: 25%;">Rol en la Cadena</th>
        <th>Responsabilidades y Límites Funcionales</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Minero</strong></td>
        <td>Poseedor y vendedor primario del oro</td>
        <td>
          • Consulta opcionalmente el módulo <strong>Cotizador</strong> para obtener una estimación previa del importe.<br>
          • Traslada físicamente el mineral al establecimiento del Acopiador para la operación real.<br>
          • Es registrado y administrado por el <strong>Acopiador</strong> (garantizando trazabilidad de origen).<br>
          • <em>Delimitación:</em> No realiza operaciones transaccionales ni accede a la gestión interna.
        </td>
      </tr>
      <tr>
        <td><strong>Acopiador</strong></td>
        <td>Comprador primario en zona de producción</td>
        <td>
          • Registra al Minero y recepciona el mineral bruto.<br>
          • Realiza el <strong>primer pesaje</strong> en balanza calibrada.<br>
          • Procesa físicamente el mineral mediante fundición y deja enfriar.<br>
          • Realiza el <strong>segundo pesaje</strong> (peso resultante) y registra la variación física para trazabilidad.<br>
          • Clasifica visualmente el lote en <strong>ROJO</strong> o <strong>VERDE</strong>.<br>
          • Consulta precios en <strong>Parámetros</strong>, liquida, efectúa el pago real y registra la compra.<br>
          • Acumula el mineral en bóveda segregado en <strong>Acumulado ROJO</strong> y <strong>Acumulado VERDE</strong> (cierre semanal).
        </td>
      </tr>
      <tr>
        <td><strong>Mayorista</strong></td>
        <td>Comprador secundario e industrializador</td>
        <td>
          • Recepciona el oro acumulado semanalmente, manteniendo la separación entre ROJO y VERDE.<br>
          • Realiza su <strong>propio pesaje independiente</strong> (no copia el peso del Acopiador).<br>
          • Procesa: fundición secundaria, enfriamiento y <strong>limpieza rigurosa del oro</strong>.<br>
          • Ejecuta el análisis físico-químico y registra la <strong>LEY DEL ORO</strong>.<br>
          • Liquida financieramente usando Peso, Ley, Onza Troy, Tipo de Cambio y Descuento.<br>
          • Determina resultados en Dólares (USD), Soles (PEN) y realiza el pago al Acopiador.<br>
          • Ejecuta la <strong>Consolidación</strong> de lotes para preparar el despacho hacia exportación.
        </td>
      </tr>
      <tr>
        <td><strong>Exportador</strong></td>
        <td>Destinatario comercial internacional</td>
        <td>
          • <strong>Actor Externo:</strong> No constituye un módulo interno del sistema.<br>
          • Adquiere lotes consolidados de gran volumen preparados por el Mayorista.<br>
          • Se vincula con variables macroeconómicas como el descuento comercial de refinería internacional.
        </td>
      </tr>
    </tbody>
  </table>

  <h2>4. ESTRUCTURA Y CLASIFICACIÓN DE MÓDULOS</h2>
  <p>SITRA-ORO está constituido por cinco módulos de software estrictamente delimitados:</p>

  <table>
    <thead>
      <tr>
        <th>Clasificación</th>
        <th>Módulo</th>
        <th>Paquete Java (Spring Modulith)</th>
        <th>Responsabilidad Arquitectónica</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><span class="badge-tag badge-trans">Transaccional</span></td>
        <td><strong>Acopiador</strong></td>
        <td><code>pe.edu.upeu.sitraoro.acopio.acopiador</code></td>
        <td>Gestión de Mineros, pesajes 1 y 2, fundición, compras reales, desembolsos en PEN y acumulación segregada por color.</td>
      </tr>
      <tr>
        <td><span class="badge-tag badge-trans">Transaccional</span></td>
        <td><strong>Mayorista</strong></td>
        <td><code>pe.edu.upeu.sitraoro.acopio.mayorista</code></td>
        <td>Pesaje propio de ROJO y VERDE, fundición, limpieza, análisis de LEY, liquidación multi-divisa, pago a Acopiador y CRUD Consolidación.</td>
      </tr>
      <tr>
        <td><span class="badge-tag badge-notrans">No Transaccional</span></td>
        <td><strong>Cotizador</strong></td>
        <td><code>pe.edu.upeu.sitraoro.acopio.cotizador</code></td>
        <td>Servicio de cálculo puro referencial para mineros. No muta inventario ni genera transacciones contables.</td>
      </tr>
      <tr>
        <td><span class="badge-tag badge-notrans">No Transaccional</span></td>
        <td><strong>Parámetros</strong></td>
        <td><code>pe.edu.upeu.sitraoro.acopio.parametros</code></td>
        <td>Catálogo centralizado de constantes vigentes: Precio Gramo PEN, Onza USD, Tipo de Cambio y Descuento.</td>
      </tr>
      <tr>
        <td><span class="badge-tag badge-transversal">Transversal</span></td>
        <td><strong>Seguridad</strong></td>
        <td><code>pe.edu.upeu.sitraoro.acopio.seguridad</code></td>
        <td>Autenticación, autorización basada en roles (RBAC) y auditoría transversal del sistema.</td>
      </tr>
    </tbody>
  </table>

  <div class="callout-box warning">
    <strong>Elementos que NO constituyen módulos de software independientes:</strong><br>
    1. <strong>Dashboard:</strong> Es una interfaz de visualización y consulta agregada; consume datos producidos por los módulos propietarios pero no posee base transaccional.<br>
    2. <strong>Consolidación:</strong> Es una funcionalidad / subcapacidad CRUD perteneciente al módulo Mayorista.<br>
    3. <strong>Exportador:</strong> Es un actor comercial externo al sistema monolítico.
  </div>

  <div class="section-break"></div>

  <h2>5. ESPECIFICACIÓN DETALLADA DE PROCESOS DEL DOMINIO</h2>

  <h3>5.1 Flujo Operativo del Módulo Acopiador</h3>
  <div class="diagram-card">
MINERO LLEGA CON ORO BRUTO
   │
   ├── 1. Registro / Identificación del Minero (en Acopiador)
   ├── 2. Primer Pesaje en balanza calibrada (P1)
   ├── 3. Proceso de Fundición térmica
   ├── 4. Enfriamiento controlado
   ├── 5. Segundo Pesaje (Peso Neto Resultante P2)
   │      └── Variación registrada para trazabilidad (sin bloqueos arbitrarios)
   ├── 6. Clasificación cualitativa: ROJO o VERDE
   ├── 7. Consulta de precio oficial vigente desde Parámetros
   ├── 8. Liquidación económica en Soles (PEN)
   ├── 9. Pago efectivo al MINERO
   ├── 10. Registro oficial de la Compra Transaccional
   └── 11. Almacenamiento segregado en bóveda:
          ├── Acumulado ORO ROJO
          └── Acumulado ORO VERDE
               │
               └── Cierre periódico / semanal hacia el MAYORISTA
  </div>

  <p><strong>Reglas de Dominio de Acopio:</strong></p>
  <ul>
    <li><strong>Registro de Mineros:</strong> Los mineros son gestionados por el módulo Acopiador como parte de su operativa comercial. No pertenecen a Parámetros.</li>
    <li><strong>Tolerancia de Pesajes:</strong> La merma física entre P1 y P2 es inherente al proceso de fundición. El sistema registra ambos valores para auditoría y no bloquea transacciones arbitrariamente al no existir una regla matemática prefijada.</li>
    <li><strong>Clasificación Rojo/Verde:</strong> Es una determinación visual del acopiador; no debe implementarse ninguna fórmula algorítmica artificial.</li>
  </ul>

  <h3>5.2 Flujo Operativo del Módulo Mayorista</h3>
  <div class="diagram-card">
ACOPIADOR LLEGA CON ORO ACUMULADO (SEPARADO EN ROJO Y VERDE)
   │
   ├── 1. Recepción física de ambos paquetes segregados
   ├── 2. NUEVO PESAJE INDEPENDIENTE de ORO ROJO y ORO VERDE
   │      └── Se asientan pesos propios del Mayorista (no copia al Acopiador)
   ├── 3. Procesamiento y fundición secundaria de homogeneización
   ├── 4. Enfriamiento
   ├── 5. LIMPIEZA RIGUROSA DEL ORO (remoción de escorias residuales)
   ├── 6. Análisis instrumental / espectrometría
   ├── 7. Obtención y registro oficial de la LEY DEL ORO
   ├── 8. Registro de la tupla técnica: PESO + LEY
   ├── 9. Integración de variables económicas:
   │      ├── Cotización Onza Troy en USD (Parámetros)
   │      ├── Tipo de Cambio oficial USD/PEN (Parámetros)
   │      └── Descuento comercial + Ley
   ├── 10. Determinación de la LIQUIDACIÓN FINANCIERA:
   │      ├── Subtotal resultante en DÓLARES (USD)
   │      ├── Conversión y subtotal en SOLES (PEN)
   │      └── PAGO TOTAL DEL ORO
   ├── 11. Desembolso y Pago del MAYORISTA al ACOPIADOR
   └── 12. Asiento del Registro / Lote Mayorista (fuente para Consolidación)
  </div>

  <p><strong>Reglas de Dominio Mayorista:</strong></p>
  <ul>
    <li><strong>Independencia de Balanza:</strong> El peso reportado por el Acopiador sirve como referencia de trazabilidad, pero la liquidación del Mayorista se rige exclusivamente por el pesaje propio verificado en planta.</li>
    <li><strong>Etapa de Limpieza y Ley:</strong> La pureza del metal no se presume. Se extrae muestra tras la limpieza física y se asienta la LEY analizada.</li>
    <li><strong>Descarte del 5% fijo:</strong> Queda absolutamente descartada la regla que sumaba o restaba un 5% automático para oro verde.</li>
  </ul>

  <h3>5.3 CRUD de Consolidación (Subcapacidad de Mayorista)</h3>
  <p>La Consolidación es un componente analítico dentro del módulo Mayorista diseñado para preparar embarques hacia el Exportador:</p>
  <ul>
    <li>Permite al usuario listar y seleccionar múltiples operaciones o lotes previamente liquidados (Lote A, Lote B, Lote C, etc.).</li>
    <li>Aunque los lotes históricos contienen desglose completo de divisas y precios, la consolidación extrae primordialmente la tupla técnica:
      <strong>Lote_i &rarr; {Peso_i, Ley_i}</strong>
    </li>
    <li>Conforma un paquete consolidado listo para la siguiente etapa de comercialización externa.</li>
    <li><em>Restricción:</em> La fórmula de combinación de leyes (promedio ponderado o equivalente) no se implementa hasta su homologación formal.</li>
  </ul>

  <h2>6. MATRIZ DE TRAZABILIDAD INTEGRAL (END-TO-END)</h2>
  <table>
    <thead>
      <tr>
        <th style="width: 25%;">Hito de Trazabilidad</th>
        <th style="width: 20%;">Actor / Módulo</th>
        <th>Evidencia y Atributos Almacenados</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>1. Origen del Mineral</strong></td>
        <td>Minero / Acopiador</td>
        <td>Identificación del Minero, zona geográfica de procedencia, fecha y hora.</td>
      </tr>
      <tr>
        <td><strong>2. Recepción y Pesaje 1</strong></td>
        <td>Acopiador</td>
        <td>Peso en bruto sin fundir (P1) en gramos con 3 decimales.</td>
      </tr>
      <tr>
        <td><strong>3. Fundición Primaria</strong></td>
        <td>Acopiador</td>
        <td>Peso fundido neto resultante (P2), diferencial de peso registrado.</td>
      </tr>
      <tr>
        <td><strong>4. Calidad y Pago Local</strong></td>
        <td>Acopiador</td>
        <td>Clasificación (ROJO / VERDE), precio aplicado (PEN) y total pagado al Minero.</td>
      </tr>
      <tr>
        <td><strong>5. Stock Acumulado</strong></td>
        <td>Acopiador</td>
        <td>Saldo acumulado segregado en bóveda por color para entrega semanal.</td>
      </tr>
      <tr>
        <td><strong>6. Nuevo Pesaje Planta</strong></td>
        <td>Mayorista</td>
        <td>Pesaje independiente verificado para ROJO y VERDE en recepción.</td>
      </tr>
      <tr>
        <td><strong>7. Limpieza y Análisis</strong></td>
        <td>Mayorista</td>
        <td>Evidencia de proceso físico de limpieza y valor de LEY certificada.</td>
      </tr>
      <tr>
        <td><strong>8. Liquidación Financiera</strong></td>
        <td>Mayorista</td>
        <td>Onza USD, Tipo de Cambio, Descuento, Subtotal USD, Subtotal PEN y Pago Total.</td>
      </tr>
      <tr>
        <td><strong>9. Pago al Acopiador</strong></td>
        <td>Mayorista</td>
        <td>Asiento del desembolso económico efectuado al Acopiador.</td>
      </tr>
      <tr>
        <td><strong>10. Lote Consolidado</strong></td>
        <td>Mayorista (CRUD)</td>
        <td>Agrupación de lotes seleccionados mediante Peso y Ley para exportación.</td>
      </tr>
    </tbody>
  </table>

  <div class="section-break"></div>

  <h2>7. DIFERENCIACIONES CONCEPTUALES OBLIGATORIAS (ANTI-PATRONES)</h2>
  <table>
    <thead>
      <tr>
        <th style="width: 22%;">Término A</th>
        <th style="width: 22%;">Término B</th>
        <th>Criterio de Separación Canónica</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Cotización</strong></td>
        <td><strong>Compra Real</strong></td>
        <td>La cotización es un cálculo meramente informativo; no genera asientos contables, no desembolsa efectivo ni altera inventario.</td>
      </tr>
      <tr>
        <td><strong>Compra al Minero</strong></td>
        <td><strong>Entrega al Mayorista</strong></td>
        <td>La compra es unitaria y minorista en zona de acopio; la entrega es un envío por mayor del inventario acumulado semanal.</td>
      </tr>
      <tr>
        <td><strong>Peso del Acopiador</strong></td>
        <td><strong>Peso del Mayorista</strong></td>
        <td>Son mediciones físicas independientes en balanzas y momentos diferentes; el sistema conserva ambas sin sobreescrituras.</td>
      </tr>
      <tr>
        <td><strong>Pago al Minero</strong></td>
        <td><strong>Pago al Acopiador</strong></td>
        <td>El acopiador paga al minero en soles con precio de acopio local; el mayorista liquida al acopiador considerando Onza, Ley y Descuento.</td>
      </tr>
      <tr>
        <td><strong>Acopio</strong></td>
        <td><strong>Consolidación</strong></td>
        <td>El acopio es acumulación física en bóveda; la consolidación es una agrupación lógica de lotes por Peso + Ley.</td>
      </tr>
      <tr>
        <td><strong>Mayorista</strong></td>
        <td><strong>Exportador</strong></td>
        <td>El Mayorista es el módulo y actor transaccional interno; el Exportador es un agente externo receptor en el comercio global.</td>
      </tr>
      <tr>
        <td><strong>Módulo</strong></td>
        <td><strong>Dashboard</strong></td>
        <td>El Dashboard es una vista reactiva de consulta agregada, no un módulo propietario de datos.</td>
      </tr>
      <tr>
        <td><strong>Módulo</strong></td>
        <td><strong>Consolidación</strong></td>
        <td>La Consolidación es un CRUD interno perteneciente a Mayorista, no un módulo independiente.</td>
      </tr>
      <tr>
        <td><strong>Parámetros</strong></td>
        <td><strong>Dueño de Mineros</strong></td>
        <td>Los Mineros pertenecen funcionalmente a Acopiador; Parámetros solo administra variables económicas.</td>
      </tr>
    </tbody>
  </table>

  <h2>8. REGISTRO OFICIAL DE REGLAS PENDIENTES DE DEFINICIÓN DEL NEGOCIO</h2>
  <div class="callout-box danger">
    <strong>PRINCIPIO FUNDAMENTAL:</strong> Queda terminantemente prohibido implementar supuestos técnicos o fórmulas inventadas. Todo vacío de negocio debe catalogarse como pendiente hasta su confirmación por la contraparte real.
  </div>

  <table>
    <thead>
      <tr>
        <th style="width: 8%;">N°</th>
        <th style="width: 32%;">Regla / Aspecto Funcional</th>
        <th>Estado y Detalle Técnico Requerido</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>1</td>
        <td><strong>Fórmula exacta de Liquidación Mayorista</strong></td>
        <td><span class="badge-tag badge-pending">Pendiente</span> Se conocen las variables (Peso, Onza, Ley, Tipo Cambio, Descuento), pero falta confirmar la ecuación algebraica exacta.</td>
      </tr>
      <tr>
        <td>2</td>
        <td><strong>Fórmula de Consolidación de Leyes</strong></td>
        <td><span class="badge-tag badge-pending">Pendiente</span> Procedimiento matemático para calcular la ley equivalente del lote consolidado (evitar suponer promedio simple o ponderado).</td>
      </tr>
      <tr>
        <td>3</td>
        <td><strong>Regla y valor del Descuento Comercial</strong></td>
        <td><span class="badge-tag badge-pending">Pendiente</span> Descartado el 5% fijo de oro verde; falta precisar la regla de origen del descuento (acuerdo con exportador).</td>
      </tr>
      <tr>
        <td>4</td>
        <td><strong>Tolerancia de merma en Fundición Acopio</strong></td>
        <td><span class="badge-tag badge-pending">Pendiente</span> Rango aceptable de diferencia entre P1 y P2 antes de requerir autorización de supervisión.</td>
      </tr>
      <tr>
        <td>5</td>
        <td><strong>Tolerancia de discrepancia Acopiador / Mayorista</strong></td>
        <td><span class="badge-tag badge-pending">Pendiente</span> Umbral de variación admisible entre el peso entregado por el acopiador y el verificado en planta mayorista.</td>
      </tr>
      <tr>
        <td>6</td>
        <td><strong>Regla objetiva de clasificación Rojo vs. Verde</strong></td>
        <td><span class="badge-tag badge-pending">Pendiente</span> Criterios estandarizados más allá de la inspección visual empírica del operario de acopio.</td>
      </tr>
      <tr>
        <td>7</td>
        <td><strong>Campos obligatorios del Minero</strong></td>
        <td><span class="badge-tag badge-pending">Pendiente</span> Validación formal de identidad (DNI, RUC, carné REINFO, coordenadas de labor minera).</td>
      </tr>
      <tr>
        <td>8</td>
        <td><strong>Matriz RBAC definitiva de Seguridad</strong></td>
        <td><span class="badge-tag badge-pending">Pendiente</span> Estructura final de roles, perfiles y políticas de auditoría para despliegue productivo.</td>
      </tr>
      <tr>
        <td>9</td>
        <td><strong>Máquina de Estados de Transacciones y Liquidaciones</strong></td>
        <td><span class="badge-tag badge-pending">Pendiente</span> Ciclo de vida estandarizado (Borrador, Verificado, Liquidado, Pagado, Anulado, etc.).</td>
      </tr>
    </tbody>
  </table>

  <h2>9. PLAN DE REFACTORIZACIÓN TÉCNICA Y MATRIZ DE IMPACTO</h2>
  <table>
    <thead>
      <tr>
        <th style="width: 20%;">Área Técnica</th>
        <th style="width: 25%;">Situación Previa (Discrepante)</th>
        <th style="width: 25%;">Situación Auditada (Meta)</th>
        <th>Acción Concreta en el Código</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Backend: Minero</strong></td>
        <td>Minero alojado en paquete <code>parametros</code></td>
        <td>Minero pertenece al módulo <code>acopiador</code></td>
        <td>Mover entidad, repositorio, servicio y controlador a <code>pe.edu.upeu.sitraoro.acopio.acopiador</code>.</td>
      </tr>
      <tr>
        <td><strong>Backend: Mayorista</strong></td>
        <td>Aplica recargo rígido del 5% a oro verde</td>
        <td>Regla del 5% descartada</td>
        <td>Remover cálculo rígido de 1.05 en <code>MayoristaServiceImpl</code>.</td>
      </tr>
      <tr>
        <td><strong>Backend: Entidades</strong></td>
        <td><code>LiquidacionG1</code> sin Ley ni Descuento</td>
        <td>Debe incluir Ley, Descuento, USD y PEN</td>
        <td>Añadir campos y DTOs correspondientes en <code>Mayorista</code> respetando la auditoría.</td>
      </tr>
      <tr>
        <td><strong>Backend: Consolidación</strong></td>
        <td>Inexistente (solo flag textual)</td>
        <td>CRUD formal de selección por Peso + Ley</td>
        <td>Diseñar componente y endpoints de consolidación dentro del módulo Mayorista.</td>
      </tr>
      <tr>
        <td><strong>Base de Datos (BD2)</strong></td>
        <td>FK directa <code>ID_LIQUIDACION_G1</code> en compras</td>
        <td>Compras desacopladas de la entrega acumulada</td>
        <td>Reestructurar relación para reflejar entrega de lotes acumulados y no compras individuales.</td>
      </tr>
      <tr>
        <td><strong>Backend: Dashboard</strong></td>
        <td>Controlador dentro de paquete <code>parametros</code></td>
        <td>Vista agregada transversal</td>
        <td>Desacoplar <code>DashboardController</code> fuera del catálogo de parámetros.</td>
      </tr>
    </tbody>
  </table>

  <h2>10. CONCLUSIONES Y CONFORMIDAD INSTITUCIONAL</h2>
  <p>1. La especificación funcional v2.0 alinea de forma transparente el software <strong>SITRA-ORO</strong> con la realidad física, técnica y comercial del negocio de acopio de oro, protegiendo al proyecto de inconsistencias de dominio.</p>
  <p>2. La arquitectura monolítica modular garantiza una clara delimitación entre los cinco módulos internos, protegiendo las fronteras de los módulos transaccionales mediante contratos de servicios explícitos.</p>
  <p>3. Se establece el compromiso académico de implementar las refactorizaciones priorizadas en estricto cumplimiento de las rúbricas de evaluación de Lenguaje de Programación II, Análisis y Diseño de Sistemas y Base de Datos II.</p>

  <div class="signature-container">
    <div>
      <div class="signature-line"></div>
      <strong>Faijo Calisaya Helio Paul</strong><br>
      Estudiante — Equipo 05<br>
      EP Ingeniería de Sistemas — UPeU
    </div>
    <div>
      <div class="signature-line"></div>
      <strong>Ing. Erick David Salazar</strong><br>
      Docente de Asignatura<br>
      Universidad Peruana Unión
    </div>
  </div>

</body>
</html>
`;

// Replace image placeholders
const renderedHtml = htmlTemplate
  .replace("__LOGO_UPEU__", logoUpeu)
  .replace("__LOGO_SISTEMAS__", logoSistemas)
  .replace("__LOGO_SITRA_ORO__", logoSitraOro);

// Save standalone HTML file
fs.writeFileSync(htmlPath, renderedHtml, "utf8");
console.log("Archivo HTML generado exitosamente en:", htmlPath);

console.log("Compilando Documento Maestro en PDF con Playwright...");

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  args: ["--use-angle=swiftshader", "--disable-gpu-sandbox"],
});

try {
  const page = await browser.newPage({
    viewport: { width: 1200, height: 1600 },
  });

  await page.setContent(renderedHtml, { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  await page.pdf({
    path: targetPdf,
    format: "A4",
    printBackground: true,
    margin: {
      top: "16mm",
      bottom: "16mm",
      left: "14mm",
      right: "14mm",
    },
    displayHeaderFooter: true,
    headerTemplate: '<div style="font-size: 7.5pt; color: #64748b; font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, sans-serif; width: 100%; padding: 0 14mm; display: flex; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px;"><span>UNIVERSIDAD PERUANA UNIÓN · EP INGENIERÍA DE SISTEMAS</span><span>SITRA-ORO — Documento Maestro v2.0</span></div>',
    footerTemplate: '<div style="font-size: 7.5pt; color: #64748b; font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, sans-serif; width: 100%; padding: 0 14mm; display: flex; justify-content: space-between; border-top: 1px solid #e2e8f0; padding-top: 3px;"><span>Faijo Calisaya Helio Paul (Equipo 05)</span><span>Página <span class="pageNumber"></span> de <span class="totalPages"></span></span></div>',
  });

  console.log("PDF generado exitosamente en:", targetPdf);
} finally {
  await browser.close();
}
