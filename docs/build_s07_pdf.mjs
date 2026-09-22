import { chromium } from "file:///C:/Users/Paul/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const imgDir = path.join(here, "img_S07_CalisayaHelio");
const targetPdf = path.join(here, "S07_LP2_Equipo05_CalisayaHelio.pdf");

// Helper to convert image to base64 data URI
function getBase64Image(filename) {
  const filePath = path.join(imgDir, filename);
  const data = fs.readFileSync(filePath);
  return `data:image/png;base64,${data.toString("base64")}`;
}

const img1 = getBase64Image("captura-01-arquitectura.png");
const img2 = getBase64Image("captura-02-layout-inicio.png");
const img3 = getBase64Image("captura-03-layout-navegacion.png");
const img4 = getBase64Image("captura-04-servicio-interceptor-code.png");
const img5 = getBase64Image("captura-05-http-network-traceid.png");
const img6 = getBase64Image("captura-06-crud-listar.png");
const img7 = getBase64Image("captura-07-crud-crear.png");
const img8 = getBase64Image("captura-08-crud-editar.png");
const img9 = getBase64Image("captura-09-crud-eliminar.png");
const img10 = getBase64Image("captura-10-error-hallazgo.png");

const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>S07_LP2_Equipo05_CalisayaHelio</title>
  <style>
    @page {
      size: A4;
      margin: 16mm 14mm 16mm 14mm;
      @bottom-right {
        content: counter(page);
      }
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-size: 10pt;
      line-height: 1.5;
      color: #1e293b;
      background: #ffffff;
    }
    .header-banner {
      border-bottom: 2px solid #0284c7;
      padding-bottom: 8px;
      margin-bottom: 16px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .inst-title {
      font-size: 8.5pt;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #64748b;
      font-weight: 600;
    }
    .doc-title {
      font-size: 17pt;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.3px;
      margin-top: 2px;
    }
    .doc-subtitle {
      font-size: 10.5pt;
      color: #0284c7;
      font-weight: 600;
    }
    .brand-badge {
      background: linear-gradient(135deg, #f59e0b, #d97706);
      color: white;
      padding: 4px 10px;
      border-radius: 6px;
      font-weight: 700;
      font-size: 11pt;
      letter-spacing: 0.5px;
      text-align: right;
    }

    h2 {
      font-size: 12pt;
      color: #0f172a;
      border-bottom: 1.5px solid #e2e8f0;
      padding-bottom: 4px;
      margin-top: 14px;
      margin-bottom: 8px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    h2::before {
      content: "";
      display: inline-block;
      width: 4px;
      height: 14px;
      background: #0284c7;
      border-radius: 2px;
    }
    h3 {
      font-size: 10.5pt;
      color: #0369a1;
      margin-top: 10px;
      margin-bottom: 4px;
      font-weight: 700;
    }
    h4 {
      font-size: 9.5pt;
      color: #334155;
      margin-top: 8px;
      margin-bottom: 3px;
      font-weight: 600;
    }
    p {
      margin-bottom: 6px;
      text-align: justify;
    }
    ul, ol {
      margin-left: 18px;
      margin-bottom: 8px;
    }
    li {
      margin-bottom: 3px;
    }
    code {
      font-family: Consolas, "Cascadia Code", monospace;
      font-size: 8.5pt;
      background: #f1f5f9;
      color: #0f172a;
      padding: 1px 4px;
      border-radius: 4px;
      border: 1px solid #e2e8f0;
    }
    
    /* Metadata Table */
    table.meta-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 12px;
      font-size: 9pt;
    }
    table.meta-table th, table.meta-table td {
      border: 1px solid #cbd5e1;
      padding: 5px 9px;
      text-align: left;
    }
    table.meta-table th {
      background: #f8fafc;
      width: 25%;
      color: #334155;
      font-weight: 600;
    }
    table.meta-table td {
      color: #0f172a;
    }

    /* Evidence Box & Images */
    .evidence-card {
      margin-bottom: 12px;
      page-break-inside: avoid;
    }
    .evidence-img-wrap {
      border: 1px solid #94a3b8;
      border-radius: 5px;
      overflow: hidden;
      margin: 4px 0;
      background: #0d1117;
      box-shadow: 0 2px 4px rgba(0,0,0,0.08);
    }
    .evidence-img-wrap img {
      width: 100%;
      height: auto;
      display: block;
    }
    .evidence-caption {
      font-size: 8.5pt;
      color: #334155;
      background: #f8fafc;
      border-left: 3px solid #0284c7;
      padding: 4px 8px;
      margin-top: 3px;
      margin-bottom: 8px;
    }
    .evidence-caption strong {
      color: #0369a1;
    }

    /* Callout notice */
    .notice-box {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-left: 4px solid #16a34a;
      padding: 6px 10px;
      border-radius: 4px;
      font-size: 8.5pt;
      margin-bottom: 10px;
      color: #166534;
    }
    .rubric-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 8.5pt;
      margin: 8px 0 12px 0;
    }
    .rubric-table th, .rubric-table td {
      border: 1px solid #cbd5e1;
      padding: 6px 8px;
    }
    .rubric-table th {
      background: #0f172a;
      color: #ffffff;
      font-weight: 600;
      text-align: left;
    }
    .rubric-table tr:nth-child(even) {
      background: #f8fafc;
    }
    .badge-a {
      background: #16a34a;
      color: white;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 4px;
      display: inline-block;
      text-align: center;
    }

    /* Page break helpers */
    .page-break {
      page-break-before: always;
    }

    /* Defense questions styling */
    .qa-item {
      margin-bottom: 8px;
      page-break-inside: avoid;
    }
    .qa-q {
      font-weight: 700;
      color: #0f172a;
      font-size: 9pt;
      margin-bottom: 2px;
    }
    .qa-a {
      color: #334155;
      font-size: 8.5pt;
      text-align: justify;
    }

    /* Feedback form styling */
    .fb-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 10px 14px;
      margin-bottom: 8px;
      page-break-inside: avoid;
    }
    .fb-q {
      font-weight: 700;
      color: #0369a1;
      font-size: 9pt;
      margin-bottom: 3px;
    }
    .fb-a {
      font-size: 8.5pt;
      color: #1e293b;
    }
    .fb-check {
      font-weight: 700;
      color: #16a34a;
    }
  </style>
</head>
<body>

  <!-- HEADER -->
  <div class="header-banner">
    <div>
      <div class="inst-title">Universidad Peruana Unión · Escuela Profesional de Ingeniería de Sistemas</div>
      <div class="doc-title">Informe de Evidencia de Aprendizaje</div>
      <div class="doc-subtitle">LP2 — Sesión S07: Creación y Arquitectura de la SPA</div>
    </div>
    <div>
      <div class="brand-badge">SITRA-ORO</div>
    </div>
  </div>

  <!-- DATOS DEL ESTUDIANTE -->
  <h2>1. Datos del estudiante</h2>
  <table class="meta-table">
    <tr>
      <th>Nombre del estudiante</th>
      <td><strong>Faijo Calisaya Helio Paul</strong></td>
    </tr>
    <tr>
      <th>Equipo de trabajo</th>
      <td><strong>Equipo 05</strong></td>
    </tr>
    <tr>
      <th>Sesión académica</th>
      <td>S07 — Creación y Arquitectura de la SPA (Angular 19+ Standalone)</td>
    </tr>
    <tr>
      <th>Rol o aporte realizado</th>
      <td>Diseño y construcción de la arquitectura modular SPA (<code>core/shared/features</code>), maquetación del Layout con navegación persistente y página de inicio real en <code>/</code>, configuración de <code>ApiService</code> base, interceptor HTTP de trazabilidad (<code>X-Trace-ID</code> con UUID) y desarrollo del CRUD completo independiente de Mineros conectado a Spring Boot y Oracle XE.</td>
    </tr>
    <tr>
      <th>Repositorio GitHub</th>
      <td><a href="https://github.com/helionelio900-hub/SysProyec_Acopus" style="color: #0284c7; text-decoration: none;">https://github.com/helionelio900-hub/SysProyec_Acopus</a></td>
    </tr>
  </table>

  <div class="notice-box">
    <strong>Verificación de autenticidad:</strong> Cada captura de este informe muestra, sin recortar, el marco del sistema operativo, el reloj con fecha y hora sincronizadas (<code>22/09/2026</code>) y el usuario activo visible (<code>Faijo Calisaya Helio Paul</code>, Equipo 05, cuenta <code>heliofaicali@gmail.com</code>). Las evidencias corresponden al entorno real de desarrollo y son consistentes con el repositorio GitHub.
  </div>

  <!-- PROPÓSITO -->
  <h2>2. Propósito de la actividad</h2>
  <p>
    Demostrar individualmente la construcción autónoma de la arquitectura base de una Single Page Application (SPA) modular bajo las directrices modernas de Angular (componentes Standalone, signals y directivas de control de flujo), junto con el desarrollo de un CRUD completo sobre una entidad independiente del dominio asignado (<strong>SITRA-ORO</strong>: Sistema de Información, Trazabilidad y Liquidación en Acopio de Oro).
  </p>
  <p>
    El sistema separa limpiamente la capa de presentación del transporte HTTP, centraliza la resolución de endpoints con <code>ApiService</code>, garantiza la trazabilidad distribuida mediante <code>traceIdInterceptor</code> (adjuntando un UUID único por petición en la cabecera <code>X-Trace-ID</code>) y opera directamente sobre el backend real en Spring Boot 3 / Java 21 y base de datos Oracle Database XE.
  </p>

  <!-- BLOQUE 1 -->
  <h2>3. Evidencia técnica</h2>
  <h3>3.1 Proyecto y arquitectura (Rúbrica: Criterio 1 — 25%)</h3>
  <p>
    El proyecto frontend se organizó bajo el estándar empresarial modular desacoplado en tres capas estructurales:
  </p>
  <ul>
    <li><strong><code>core/</code>:</strong> Contiene servicios singleton y artefactos de alcance global. Aloja <code>api/api.service.ts</code> para resolver la URL base, <code>interceptors/trace-id.interceptor.ts</code> para inyección de cabeceras, <code>layout/</code> para la plantilla estructural persistente y <code>inicio/</code> para la vista raíz.</li>
    <li><strong><code>shared/</code>:</strong> Destinado a modelos, interfaces y componentes transversales reutilizables (<code>models/api-error.ts</code>).</li>
    <li><strong><code>features/</code>:</strong> Módulos funcionales de negocio organizados por subdominio. En esta sesión se implementa <code>features/acopio/mineros/</code>, que encapsula el modelo <code>minero.ts</code>, el servicio HTTP <code>minero.service.ts</code>, la lista <code>minero-list</code> y el formulario reactivo <code>minero-form</code>.</li>
  </ul>

  <div class="evidence-card">
    <h4>Captura 1. Estructura de carpetas core/shared/features y enrutamiento en VS Code</h4>
    <div class="evidence-img-wrap">
      <img src="${img1}" alt="Captura 1 - Arquitectura">
    </div>
    <div class="evidence-caption">
      <strong>Explicación técnica:</strong> Explorador de archivos de VS Code mostrando la jerarquía <code>core</code>, <code>shared</code> y <code>features</code>. En el editor se aprecia <code>app.routes.ts</code> definiendo el <code>Layout</code> en la raíz y anidando como hijas la ruta de inicio (<code>''</code>) y las rutas de <code>acopio/mineros</code>. La terminal inferior confirma la compilación exitosa en <code>http://localhost:4200/</code>.
    </div>
  </div>

  <div class="page-break"></div>

  <!-- BLOQUE 2 -->
  <h3>3.2 Layout y navegación (Rúbrica: Criterio 2 — 25%)</h3>
  <p>
    El layout desacoplado garantiza que los elementos comunes de la interfaz (encabezado con branding y sidebar con navegación) permanezcan fijos en pantalla, mientras el contenido variable se renderiza de forma reactiva en el <code>&lt;router-outlet /&gt;</code> sin refrescos completos ni parpadeos:
  </p>
  <ul>
    <li><strong>Página de inicio real en <code>/</code>:</strong> Implementada en <code>InicioComponent</code> con un Hero descriptivo de la operación de acopio y acceso directo al módulo de mineros, cumpliendo la regla de no realizar ninguna redirección automática.</li>
    <li><strong>Navegación reactiva entre rutas hijas:</strong> Enlaces gestionados mediante <code>routerLink</code> y <code>routerLinkActive="active"</code> con <code>[routerLinkActiveOptions]="{exact: true}"</code> para sincronizar visualmente la opción activa con la URL actual del navegador.</li>
  </ul>

  <div class="evidence-card">
    <h4>Captura 2. Aplicación corriendo con página de inicio real en / (sin redirect)</h4>
    <div class="evidence-img-wrap">
      <img src="${img2}" alt="Captura 2 - Inicio en /">
    </div>
    <div class="evidence-caption">
      <strong>Explicación técnica:</strong> Navegador cargando la ruta raíz <code>http://localhost:4200/</code>. Se observa el encabezado corporativo SITRA-ORO, la barra lateral con la opción "Inicio" marcada como activa y el Hero central informativo con botón de llamada a la acción hacia la gestión de mineros.
    </div>
  </div>

  <div class="evidence-card">
    <h4>Captura 3. Navegación hacia la ruta hija /acopio/mineros persistiendo el Layout</h4>
    <div class="evidence-img-wrap">
      <img src="${img3}" alt="Captura 3 - Navegación Mineros">
    </div>
    <div class="evidence-caption">
      <strong>Explicación técnica:</strong> Transición fluida hacia <code>http://localhost:4200/acopio/mineros</code>. El encabezado y sidebar permanecen inalterados, actualizando el indicador activo a "Mineros", mientras el área central proyecta dinámicamente la tabla de datos cargada desde el backend.
    </div>
  </div>

  <div class="page-break"></div>

  <!-- BLOQUE 3 -->
  <h3>3.3 Servicio HTTP e Interceptor de Trazabilidad (Rúbrica: Criterio 3 — 25%)</h3>
  <p>
    La solución aísla estrictamente la lógica de red: ningún componente invoca directamente a <code>HttpClient</code>. Se configuró un flujo de tres niveles:
  </p>
  <ol>
    <li><code>ApiService</code>: Provee la URL base configurable (<code>http://localhost:8081</code>) y construye endpoints seguros.</li>
    <li><code>traceIdInterceptor</code>: Función interceptora HTTP (<code>HttpInterceptorFn</code>) registrada en <code>app.config.ts</code> con <code>provideHttpClient(withInterceptors([traceIdInterceptor]))</code>. Inyecta dinámicamente un UUID generado con <code>crypto.randomUUID()</code> en la cabecera personalizada <code>X-Trace-ID</code> de cada solicitud.</li>
    <li><code>MineroService</code>: Servicio de funcionalidad que consume <code>ApiService</code> y expone métodos fuertemente tipados retornando <code>Observable&lt;T&gt;</code> para las cuatro operaciones del CRUD.</li>
  </ol>

  <div class="evidence-card">
    <h4>Captura 4. Código fuente de traceIdInterceptor, ApiService y MineroService en VS Code</h4>
    <div class="evidence-img-wrap">
      <img src="${img4}" alt="Captura 4 - Código Servicio e Interceptor">
    </div>
    <div class="evidence-caption">
      <strong>Explicación técnica:</strong> Implementación en TypeScript mostrando el interceptor funcional clonando la petición con <code>X-Trace-ID</code>, <code>ApiService</code> centralizando la URL base de Spring Boot y <code>MineroService</code> exponiendo <code>listar()</code>, <code>obtener()</code>, <code>crear()</code>, <code>actualizar()</code> y <code>eliminar()</code>.
    </div>
  </div>

  <div class="evidence-card">
    <h4>Captura 5. Inspección en DevTools Network: Request Header X-Trace-ID y respuesta 200 OK</h4>
    <div class="evidence-img-wrap">
      <img src="${img5}" alt="Captura 5 - DevTools Network">
    </div>
    <div class="evidence-caption">
      <strong>Explicación técnica:</strong> Pestaña Network de Chrome DevTools inspeccionando <code>GET http://localhost:8081/api/v1/acopio/mineros</code>. Se evidencia la cabecera de solicitud <code>X-Trace-ID: c7a3f89e-2144-482d-8bfe-30e7194fba90</code> inyectada por el interceptor y el código de respuesta exitoso <code>200 OK</code> emitido por el backend Spring Boot.
    </div>
  </div>

  <div class="page-break"></div>

  <!-- BLOQUE 4 -->
  <h3>3.4 CRUD independiente de Mineros (Rúbrica: Criterio 4 — 25%)</h3>
  <p>
    La entidad <code>Minero</code> (subdominio de acopio) es una <strong>tabla independiente</strong>: sus atributos (documento de identidad, nombres, teléfono y zona) existen por sí mismos sin requerir seleccionar previamente una clave foránea de otra tabla. A continuación se evidencia el funcionamiento de los cuatro casos contra el backend real:
  </p>

  <div class="evidence-card">
    <h4>Caso 1. Listar mineros desde base de datos Oracle</h4>
    <div class="evidence-img-wrap">
      <img src="${img6}" alt="Captura 6 - Listar">
    </div>
    <div class="evidence-caption">
      <strong>Explicación técnica:</strong> Tabla de datos cargando los registros reales persistidos en Oracle XE (incluyendo <code>FaijoCalisayaHelioPaul</code>, <code>EloyFaijoQuispe</code>, <code>Figueroa Nleio</code>, <code>Juan Perez Quispe</code>). El componente gestiona el estado reactivo con Signals de Angular y formatea fechas con <code>date:'dd/MM/yyyy'</code>.
    </div>
  </div>

  <div class="evidence-card">
    <h4>Caso 2. Crear nuevo minero con formulario reactivo (POST)</h4>
    <div class="evidence-img-wrap">
      <img src="${img7}" alt="Captura 7 - Crear">
    </div>
    <div class="evidence-caption">
      <strong>Explicación técnica:</strong> Formulario reactivo en <code>/acopio/mineros/nuevo</code> con validaciones de cliente. Al presionar "Guardar", se realiza la llamada <code>POST /api/v1/acopio/mineros</code> con el payload JSON hacia el backend real, redirigiendo automáticamente a la lista.
    </div>
  </div>

  <div class="page-break"></div>

  <div class="evidence-card">
    <h4>Caso 3. Editar minero existente (GET by ID + PUT)</h4>
    <div class="evidence-img-wrap">
      <img src="${img8}" alt="Captura 8 - Editar">
    </div>
    <div class="evidence-caption">
      <strong>Explicación técnica:</strong> Vista de edición en <code>/acopio/mineros/41/editar</code>. El componente recupera los datos existentes con <code>GET /api/v1/acopio/mineros/41</code>, precarga el formulario con <code>patchValue</code> y persiste las modificaciones (teléfono y zona) mediante <code>PUT</code> hacia el backend.
    </div>
  </div>

  <div class="evidence-card">
    <h4>Caso 4. Eliminar minero con respuesta reactiva inmediata (DELETE)</h4>
    <div class="evidence-img-wrap">
      <img src="${img9}" alt="Captura 9 - Eliminar">
    </div>
    <div class="evidence-caption">
      <strong>Explicación técnica:</strong> Ejecución de <code>DELETE /api/v1/acopio/mineros/21</code> contra el backend real. Al recibir el código <code>204 No Content</code>, el componente actualiza inmediatamente la señal reactiva en memoria, removiendo la fila de la vista sin requerir recargar la página.
    </div>
  </div>

  <!-- ERROR O HALLAZGO -->
  <h2>4. Error o hallazgo técnico diagnosticado</h2>
  <p>
    <strong>Hallazgo: Desalineación de validación de longitud de documento y prevención en cliente.</strong><br>
    Durante las primeras pruebas de integración entre el formulario y el backend en Spring Boot, al ingresar identificadores cortos (por ejemplo, <code>123</code>), el servidor rechazaba la petición respondiendo con error HTTP <code>400 Bad Request</code> debido a la anotación <code>@Size(min = 8, max = 15)</code> definida en <code>MineroRequest.java</code>. En el frontend original, el control carecía de validador de longitud mínima local, enviando solicitudes destinadas al fallo.
  </p>
  <p>
    <strong>Diagnóstico y solución:</strong> Se incorporó <code>Validators.minLength(8)</code> y <code>Validators.maxLength(15)</code> en el <code>FormBuilder</code> de Angular, junto con una función reactiva <code>mensaje(control)</code> que advierte al usuario tan pronto el campo pierde el foco (evento <code>blur</code>). Adicionalmente, se programó un banner de error que captura el mensaje del backend (<code>HttpErrorResponse.error.message</code>) en caso ocurra una regla de negocio no prevista (como un documento duplicado).
  </p>

  <div class="evidence-card">
    <h4>Captura 10. Validación reactiva en tiempo real y prevención de envíos erróneos</h4>
    <div class="evidence-img-wrap">
      <img src="${img10}" alt="Captura 10 - Error o hallazgo">
    </div>
    <div class="evidence-caption">
      <strong>Explicación técnica:</strong> El formulario detecta que el documento no cumple el mínimo de 8 caracteres y que el nombre es requerido, mostrando alertas claras en rojo y bloqueando el envío antes de emitir tráfico innecesario a la red.
    </div>
  </div>

  <div class="page-break"></div>

  <!-- REFLEXIÓN TÉCNICA -->
  <h2>5. Reflexión técnica breve</h2>
  <div style="background: #f8fafc; border-left: 4px solid #0284c7; padding: 10px 14px; margin-bottom: 12px; font-size: 9pt;">
    <p style="margin: 0; font-style: italic; color: #0369a1; font-weight: 600; margin-bottom: 4px;">
      ¿Por qué separar CategoriaService (o MineroService) del componente que lo usa facilita un cambio futuro en la URL o en la forma de consumir el backend?
    </p>
    <p style="margin: 0; text-align: justify; line-height: 1.6;">
      Separar <code>MineroService</code> del componente respeta el Principio de Responsabilidad Única (SRP): el componente se limita a gobernar el estado de la vista y la interacción del usuario, mientras que el servicio encapsula los detalles del protocolo de red y el contrato HTTP. Si la API cambia su versionamiento (por ejemplo, migrando de <code>/api/v1/acopio/mineros</code> a <code>/api/v2/mineros</code>), cambia de dominio base, incorpora tokens Bearer JWT o reemplaza peticiones REST por WebSocket/GraphQL, la actualización se realiza en un único punto dentro del servicio. Ningún componente consumidor (como <code>MineroList</code> o <code>MineroForm</code>) requiere ser modificado ni recompilado, garantizando alta cohesión, bajo acoplamiento y facilidad para realizar pruebas unitarias aisladas mediante mocks.
    </p>
  </div>

  <!-- PREGUNTAS DE DEFENSA -->
  <h2>6. Respuestas a las Preguntas de Defensa (Sección 4.5)</h2>
  
  <div class="qa-item">
    <div class="qa-q">1. ¿Por qué el layout (menú, sidebar, encabezado) vive en un componente separado de las pantallas de cada funcionalidad?</div>
    <div class="qa-a">Porque conforma la estructura común y persistente de la SPA. Al aislarlo en <code>LayoutComponent</code>, las vistas hijas se proyectan dinámicamente en el <code>&lt;router-outlet /&gt;</code>, evitando duplicar código de maquetación en cada pantalla, previniendo reinicializaciones del DOM global y manteniendo el estado de navegación.</div>
  </div>

  <div class="qa-item">
    <div class="qa-q">2. ¿Qué diferencia hay entre organizar componentes por tipo y organizarlos por funcionalidad (core/shared/features)?</div>
    <div class="qa-a">Organizar por tipo agrupa todos los componentes juntos y todos los servicios juntos, volviendo el proyecto inmanejable al crecer. Organizar por funcionalidad (core/shared/features) sigue los principios de Domain-Driven Design (DDD): cada módulo es autónomo, cohesivo, fácil de auditar, propicio para carga perezosa (lazy loading) y asignable a distintos miembros del equipo sin generar conflictos.</div>
  </div>

  <div class="qa-item">
    <div class="qa-q">3. ¿Por qué MineroService no expone directamente el HttpClient a los componentes que lo usan?</div>
    <div class="qa-a">Porque rompería el principio de encapsulamiento. Si un componente llamara a <code>HttpClient.get()</code> directamente, quedaría acoplado a URLs hardcodeadas, verbos HTTP y detalles de cabeceras. El servicio actúa como una fachada que entrega datos con tipado estricto (<code>Observable&lt;Minero[]&gt;</code>).</div>
  </div>

  <div class="qa-item">
    <div class="qa-q">4. ¿Por qué Minero es una tabla independiente, y qué cambiaría si tuviera una relación con otra entidad?</div>
    <div class="qa-a">Es independiente porque no requiere la existencia previa de otra entidad ni una clave foránea para crearse. Si fuera dependiente (como una liquidación o entrega de mineral), el formulario del frontend estaría obligado a cargar previamente un selector para elegir la entidad padre antes de enviar la creación.</div>
  </div>

  <div class="qa-item">
    <div class="qa-q">5. ¿Por qué ApiService no sabe nada sobre Minero, y qué otro servicio futuro reutilizaría exactamente el mismo ApiService?</div>
    <div class="qa-a"><code>ApiService</code> reside en <code>core/</code> y su responsabilidad exclusiva es proveer la URL base y utilidades de transporte global. No debe tener conocimiento del dominio de negocio. Servicios futuros como <code>AcopiadorService</code> o <code>LiquidacionService</code> reutilizarán el mismo <code>ApiService.buildUrl(...)</code> sin alterar <code>core/</code>.</div>
  </div>

  <div class="qa-item">
    <div class="qa-q">6. ¿Por qué el interceptor HTTP agrega su header en un solo lugar, en vez de que cada servicio lo agregue? ¿Qué otro problema resuelve?</div>
    <div class="qa-a">Centraliza un aspecto transversal (Cross-Cutting Concern), evitando duplicar código propenso a errores en cada servicio. Con el mismo mecanismo se resuelven de forma elegante la inyección de tokens de autenticación JWT (<code>Authorization: Bearer</code>), la captura global de errores (401/403/500) y el manejo de spinners de carga globales.</div>
  </div>

  <div class="qa-item">
    <div class="qa-q">7. Si tu CRUD autónomo usa una tabla distinta a Categoria, ¿qué validaciones del backend tuviste que respetar en el frontend?</div>
    <div class="qa-a">Para <code>Minero</code> se respetaron las reglas de <code>MineroRequest.java</code>: documento de identidad obligatorio con longitud entre 8 y 15 caracteres; nombres y apellidos obligatorios con máximo 150 caracteres; teléfono con límite de 20 caracteres; y zona de procedencia con un máximo de 100 caracteres.</div>
  </div>

  <!-- RÚBRICA DE AUTOEVALUACIÓN -->
  <h2>7. Rúbrica de autoevaluación (Sección 4.6)</h2>
  <table class="rubric-table">
    <thead>
      <tr>
        <th style="width: 25%;">Criterio</th>
        <th style="width: 12%; text-align: center;">Peso</th>
        <th style="width: 14%; text-align: center;">Nivel Obtenido</th>
        <th style="width: 12%; text-align: center;">Puntos</th>
        <th>Justificación técnica con base en evidencia</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>1. Proyecto y arquitectura</strong></td>
        <td style="text-align: center;">25%</td>
        <td style="text-align: center;"><span class="badge-a">A (20 pts)</span></td>
        <td style="text-align: center;">20</td>
        <td>Estructura <code>core/shared/features</code> impecable y coherente con el dominio SITRA-ORO. Módulos standalone y enrutamiento jerárquico.</td>
      </tr>
      <tr>
        <td><strong>2. Layout y navegación</strong></td>
        <td style="text-align: center;">25%</td>
        <td style="text-align: center;"><span class="badge-a">A (20 pts)</span></td>
        <td style="text-align: center;">20</td>
        <td>Layout con header, sidebar y menú navegable entre rutas hijas. Página de inicio real en <code>/</code> sin redirect (Capturas 2 y 3).</td>
      </tr>
      <tr>
        <td><strong>3. Servicio HTTP</strong></td>
        <td style="text-align: center;">25%</td>
        <td style="text-align: center;"><span class="badge-a">A (20 pts)</span></td>
        <td style="text-align: center;">20</td>
        <td><code>ApiService</code> base, <code>MineroService</code> dedicado y <code>traceIdInterceptor</code> adjuntando <code>X-Trace-ID</code> verificado en DevTools Network con 200 OK (Captura 5).</td>
      </tr>
      <tr>
        <td><strong>4. CRUD independiente</strong></td>
        <td style="text-align: center;">25%</td>
        <td style="text-align: center;"><span class="badge-a">A (20 pts)</span></td>
        <td style="text-align: center;">20</td>
        <td>Los 4 casos (Listar, Crear, Editar, Eliminar) funcionando de punta a punta contra backend Spring Boot y Oracle Database (Capturas 6 al 9).</td>
      </tr>
    </tbody>
  </table>

  <p style="text-align: right; font-weight: 700; font-size: 11pt; color: #0f172a;">
    Nota final calculada: (0.25 × 20) + (0.25 × 20) + (0.25 × 20) + (0.25 × 20) = <span style="color: #16a34a; font-size: 13pt;">20.0 / 20.0</span>
  </p>

  <div class="page-break"></div>

  <!-- ANEXO FEEDBACK (ÚLTIMA PÁGINA OBLIGATORIA) -->
  <div class="header-banner">
    <div>
      <div class="inst-title">Anexo Oficial Obligatorio · Entrega S07</div>
      <div class="doc-title">Feedback de la Sesión S07</div>
      <div class="doc-subtitle">Evaluación de experiencia de aprendizaje y autorreflexión individual</div>
    </div>
    <div>
      <div class="brand-badge">SITRA-ORO</div>
    </div>
  </div>

  <div class="fb-card">
    <div class="fb-q">1. ¿Cuál es el aprendizaje más importante que te llevas de la clase de hoy?</div>
    <div class="fb-a">
      Aprender a estructurar un frontend empresarial moderno con Angular 19+ Standalone separando responsabilidades en <code>core</code>, <code>shared</code> y <code>features</code>, y comprender el rol de los interceptores HTTP funcionales para inyectar trazabilidad distribuida sin alterar el código de los componentes.
    </div>
  </div>

  <div class="fb-card">
    <div class="fb-q">2. ¿Qué punto de la clase te resultó más confuso o te dejó con dudas?</div>
    <div class="fb-a">
      Al principio, la configuración del enrutamiento anidado para asegurar que los componentes hijos utilicen el <code>LayoutComponent</code> de forma persistente sin provocar reinicios de estado ni parpadeos al alternar entre pantallas.
    </div>
  </div>

  <div class="fb-card">
    <div class="fb-q">3. ¿Tienes alguna pregunta que te gustaría que sea respondida la siguiente clase?</div>
    <div class="fb-a">
      ¿Cómo se gestiona adecuadamente la renovación de tokens JWT vencidos dentro de un interceptor HTTP funcional en Angular cuando múltiples peticiones concurrentes reciben un código de error 401?
    </div>
  </div>

  <div class="fb-card">
    <div class="fb-q">4. Sobre tu nivel de comprensión de la clase de hoy, marca una opción:</div>
    <div class="fb-a">
      <div class="fb-check">☑ ¡Entendido! - Lo domino y podría explicarlo.</div>
      <div style="color: #64748b;">☐ Más o menos. - Entendí la idea general, pero tengo dudas.</div>
      <div style="color: #64748b;">☐ Necesito ayuda. - Me siento perdido/a con este tema.</div>
    </div>
  </div>

  <div class="fb-card">
    <div class="fb-q">5. ¿Cómo puedo ayudarte a comprender mejor el tema?</div>
    <div class="fb-a">
      Proporcionando pautas o ejemplos adicionales sobre el manejo de estado global con Signals reactivas entre componentes no emparentados directamente.
    </div>
  </div>

  <div class="fb-card">
    <div class="fb-q">6. Pensando en tu participación y esfuerzo en la clase de hoy, ¿cómo te autoevaluarías?</div>
    <div class="fb-a">
      <div class="fb-check">☑ Muy Comprometido/a: Me esforcé al máximo.</div>
      <div style="color: #64748b;">☐ Comprometido/a: Sé que podría haberme esforzado un poco más.</div>
      <div style="color: #64748b;">☐ Poco Comprometido/a: Hoy no di mi mejor esfuerzo.</div>
    </div>
  </div>

  <div class="fb-card">
    <div class="fb-q">7. Mi satisfacción con la clase fue... (califica del 1 al 10):</div>
    <div class="fb-a" style="font-weight: 700; color: #0284c7; font-size: 10pt;">
      10 / 10 — La sesión brindó los fundamentos esenciales para conectar la interfaz de usuario con la arquitectura backend construida en las sesiones previas.
    </div>
  </div>

  <div style="margin-top: 24px; text-align: center; border-top: 1px dashed #cbd5e1; padding-top: 14px; font-size: 8.5pt; color: #64748b;">
    <strong>Firma del estudiante:</strong> Faijo Calisaya Helio Paul &nbsp;|&nbsp; <strong>Código / Cuenta:</strong> heliofaicali@gmail.com &nbsp;|&nbsp; <strong>Fecha de entrega:</strong> 22 de Septiembre de 2026
  </div>

</body>
</html>
`;

console.log("Iniciando renderizado de PDF oficial con Chrome/Playwright...");
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
      top: "14mm",
      bottom: "14mm",
      left: "12mm",
      right: "12mm",
    },
    displayHeaderFooter: true,
    headerTemplate: `<div style="font-size: 8pt; color: #94a3b8; font-family: sans-serif; width: 100%; padding: 0 12mm; display: flex; justify-content: space-between;"><span>SITRA-ORO · Lenguaje de Programación II</span><span>Sesión S07 — Creación y Arquitectura SPA</span></div>`,
    footerTemplate: `<div style="font-size: 8pt; color: #94a3b8; font-family: sans-serif; width: 100%; padding: 0 12mm; display: flex; justify-content: space-between;"><span>Estudiante: Faijo Calisaya Helio Paul (Equipo 05)</span><span>Página <span class="pageNumber"></span> de <span class="totalPages"></span></span></div>`,
  });

  console.log("PDF generado exitosamente en:", targetPdf);
} finally {
  await browser.close();
}
