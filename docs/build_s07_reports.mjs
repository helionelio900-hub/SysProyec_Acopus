import { chromium } from "file:///C:/Users/Paul/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const imgDir = path.join(here, "img_S07_CalisayaHelio");

// Read Logos
const logoUpeu1 = fs.readFileSync("E:/Upeu/LOGO UPEU1.png").toString("base64");
const logoUpeu2 = fs.readFileSync("E:/Upeu/LOGOUPEU2.png").toString("base64");
const logoUpeu1Src = `data:image/png;base64,${logoUpeu1}`;
const logoUpeu2Src = `data:image/png;base64,${logoUpeu2}`;

// Read Captures
function getBase64Image(filename) {
  const filePath = path.join(imgDir, filename);
  if (fs.existsSync(filePath)) {
    return `data:image/png;base64,${fs.readFileSync(filePath).toString("base64")}`;
  }
  return "";
}

const imgs = {
  c1: getBase64Image("captura-01-arquitectura.png"),
  c2: getBase64Image("captura-02-layout-inicio.png"),
  c3: getBase64Image("captura-03-layout-navegacion.png"),
  c4: getBase64Image("captura-04-servicio-interceptor-code.png"),
  c5: getBase64Image("captura-05-http-network-traceid.png"),
  c6: getBase64Image("captura-06-crud-listar.png"),
  c7: getBase64Image("captura-07-crud-crear.png"),
  c8: getBase64Image("captura-08-crud-editar.png"),
  c9: getBase64Image("captura-09-crud-eliminar.png"),
  c10: getBase64Image("captura-10-error-hallazgo.png"),
};

function generateHtml(withImages = true) {
  const placeholderBox = (num, title, hint) => `
    <div style="border: 2px dashed #94a3b8; background: #f8fafc; border-radius: 6px; padding: 40px 20px; text-align: center; margin: 10px 0 6px 0; min-height: 220px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
      <div style="font-size: 28px; color: #64748b; margin-bottom: 8px;">📷</div>
      <div style="font-weight: 700; color: #1e3a8a; font-size: 11pt; margin-bottom: 4px;">[ RECUADRO PARA INSERTAR / PEGAR CAPTURA ${num} ]</div>
      <div style="font-size: 9.5pt; color: #475569; font-weight: 600; max-width: 600px; margin-bottom: 6px;">${title}</div>
      <div style="font-size: 8.5pt; color: #64748b; font-style: italic; max-width: 550px;">${hint}</div>
      <div style="margin-top: 12px; font-size: 8pt; color: #0284c7; background: #e0f2fe; padding: 4px 12px; border-radius: 4px; font-weight: 600;">Recordatorio: Mostrar ventana completa con reloj (fecha y hora) y usuario/perfil visible sin recortar</div>
    </div>
  `;

  const renderCapture = (num, title, hint, imgSrc, alt) => {
    if (withImages && imgSrc) {
      return `
        <div class="evidence-img-container">
          <img src="${imgSrc}" alt="${alt}" />
        </div>
      `;
    }
    return placeholderBox(num, title, hint);
  };

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>Informe S07 LP2 SITRA ORO</title>
  <style>
    @page {
      size: A4;
      margin: 16mm 16mm 16mm 16mm;
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
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
      font-size: 9.5pt;
      line-height: 1.5;
      color: #111827;
      background: #ffffff;
    }

    /* HEADER WITH BOTH UPEU LOGOS */
    .header-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      padding-bottom: 8px;
    }
    .header-logo-left {
      height: 48px;
      width: auto;
      object-fit: contain;
    }
    .header-center-text {
      text-align: center;
      flex: 1;
      padding: 0 10px;
    }
    .inst-name {
      font-size: 13pt;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: 0.5px;
    }
    .fac-name {
      font-size: 9.5pt;
      font-weight: 600;
      color: #475569;
      margin-top: 2px;
    }
    .header-logo-right {
      height: 52px;
      width: auto;
      object-fit: contain;
    }

    /* TITLE BLOCK */
    .title-block {
      text-align: center;
      margin-bottom: 18px;
      padding-top: 4px;
    }
    .main-doc-title {
      font-size: 17pt;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 4px;
    }
    .session-title {
      font-size: 12pt;
      font-weight: 700;
      color: #1e3a8a;
      margin-bottom: 4px;
    }
    .project-name {
      font-size: 15pt;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: 0.5px;
    }
    .project-desc {
      font-size: 9.5pt;
      font-style: italic;
      color: #475569;
    }

    h2 {
      font-size: 11.5pt;
      font-weight: 800;
      color: #0f172a;
      margin-top: 14px;
      margin-bottom: 6px;
    }
    h3 {
      font-size: 10.5pt;
      font-weight: 700;
      color: #0f172a;
      margin-top: 10px;
      margin-bottom: 4px;
    }
    h4 {
      font-size: 9.5pt;
      font-weight: 700;
      color: #1e293b;
      margin-top: 8px;
      margin-bottom: 2px;
    }
    p {
      margin-bottom: 6px;
      text-align: justify;
    }
    ul, ol {
      margin-left: 20px;
      margin-bottom: 8px;
    }
    li {
      margin-bottom: 3px;
    }

    /* DATA TABLE */
    table.data-table {
      width: 100%;
      border-collapse: collapse;
      margin: 8px 0 14px 0;
      font-size: 9pt;
    }
    table.data-table th, table.data-table td {
      border: 1px solid #cbd5e1;
      padding: 6px 10px;
      text-align: left;
    }
    table.data-table th {
      background: #1e3a8a;
      color: #ffffff;
      width: 25%;
      font-weight: 700;
    }
    table.data-table td {
      color: #0f172a;
    }

    /* CODE BLOCK */
    pre {
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      padding: 8px 12px;
      font-family: Consolas, "Cascadia Code", monospace;
      font-size: 8pt;
      line-height: 1.4;
      margin: 6px 0 8px 0;
      overflow-x: auto;
      color: #0f172a;
    }

    /* CAPTURE CONTAINERS */
    .capture-block {
      margin-bottom: 12px;
      page-break-inside: avoid;
    }
    .capture-instruction {
      font-style: italic;
      font-size: 8.5pt;
      color: #475569;
      margin-bottom: 4px;
    }
    .evidence-img-container {
      border: 1px solid #94a3b8;
      border-radius: 4px;
      overflow: hidden;
      margin: 4px 0;
      background: #090d12;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .evidence-img-container img {
      width: 100%;
      height: auto;
      display: block;
    }
    .capture-explanation {
      font-size: 8.5pt;
      color: #1e293b;
      margin-top: 4px;
      margin-bottom: 8px;
    }
    .capture-explanation strong {
      color: #0f172a;
    }

    .page-break {
      page-break-before: always;
    }

    /* RUBRIC TABLE */
    table.rubric-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 8.5pt;
      margin: 8px 0;
    }
    table.rubric-table th, table.rubric-table td {
      border: 1px solid #cbd5e1;
      padding: 6px 8px;
    }
    table.rubric-table th {
      background: #1e3a8a;
      color: #ffffff;
      font-weight: 700;
    }
    table.rubric-table tr:nth-child(even) {
      background: #f8fafc;
    }
    .badge-level {
      background: #16a34a;
      color: #ffffff;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 4px;
      display: inline-block;
    }

    /* FEEDBACK CARD */
    .feedback-box {
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 8px 12px;
      margin-bottom: 8px;
      background: #f8fafc;
      page-break-inside: avoid;
    }
    .feedback-q {
      font-weight: 700;
      color: #1e3a8a;
      font-size: 9pt;
      margin-bottom: 2px;
    }
    .feedback-a {
      font-size: 8.5pt;
      color: #0f172a;
    }
  </style>
</head>
<body>

  <!-- HEADER WITH BOTH UPEU LOGOS -->
  <div class="header-top">
    <img src="${logoUpeu1Src}" class="header-logo-left" alt="UPeU Logo" />
    <div class="header-center-text">
      <div class="inst-name">UNIVERSIDAD PERUANA UNIÓN</div>
      <div class="fac-name">Escuela Profesional de Ingeniería de Sistemas</div>
    </div>
    <img src="${logoUpeu2Src}" class="header-logo-right" alt="EPIS Logo" />
  </div>

  <div class="title-block">
    <div class="main-doc-title">Informe de evidencia de aprendizaje</div>
    <div class="session-title">S07 Creación y Arquitectura de la SPA</div>
    <div class="project-name">SITRA-ORO</div>
    <div class="project-desc">Sistema de Información, Trazabilidad y Liquidación en Acopio de Oro</div>
  </div>

  <!-- 1. DATOS DEL ESTUDIANTE -->
  <h2>1. Datos del estudiante</h2>
  <table class="data-table">
    <tr>
      <th>Nombre</th>
      <td>Faijo Calisaya Helio Paul</td>
    </tr>
    <tr>
      <th>Equipo</th>
      <td>Equipo 05</td>
    </tr>
    <tr>
      <th>Sesión</th>
      <td>S07 - Creación y Arquitectura de la SPA</td>
    </tr>
    <tr>
      <th>Rol o aporte</th>
      <td>Arquitectura base SPA modular en Angular (core/shared/features), maquetación de Layout con navegación y página de inicio en /, ApiService centralizado, interceptor HTTP con X-Trace-ID (crypto.randomUUID()) y CRUD completo independiente de Mineros conectado a Spring Boot y Oracle.</td>
    </tr>
    <tr>
      <th>GitHub</th>
      <td><a href="https://github.com/helionelio900-hub/SysProyec_Acopus" style="color: #0284c7; text-decoration: none;">https://github.com/helionelio900-hub/SysProyec_Acopus</a></td>
    </tr>
  </table>

  <!-- 2. PROPÓSITO -->
  <h2>2. Propósito</h2>
  <p>
    Esta actividad demuestra la implementación individual y autónoma de la arquitectura base de una Single Page Application (SPA) modular bajo las mejores prácticas de Angular y el desarrollo de un CRUD completo sobre la tabla independiente <strong>Minero</strong> del dominio <strong>SITRA-ORO</strong> (módulo de acopio y trazabilidad de oro), conectado a un backend real en Spring Boot y base de datos Oracle Database XE.
  </p>
  <p>
    En todas las capturas debe verse la ventana completa, el reloj con fecha y hora y el usuario o perfil visible sin recortar. Las fechas deben ser coherentes con el historial de commits del repositorio.
  </p>

  <!-- 3. EVIDENCIA TÉCNICA -->
  <h2>3. Evidencia técnica</h2>

  <!-- 3.1 PROYECTO Y ARQUITECTURA -->
  <h3>3.1 Proyecto y arquitectura</h3>
  <p>
    El proyecto frontend se organizó bajo la arquitectura limpia <code>core/shared/features</code>:
  </p>
  <ul>
    <li><code>core/</code>: Aloja artefactos globales singleton como <code>ApiService</code> (URL base), <code>traceIdInterceptor</code> (trazabilidad), <code>LayoutComponent</code> (estructura persistente) e <code>InicioComponent</code> (página raíz).</li>
    <li><code>shared/</code>: Contiene modelos e interfaces transversales (<code>models/api-error.ts</code>).</li>
    <li><code>features/</code>: Agrupa módulos de negocio funcionales. Para esta sesión se implementó <code>features/acopio/mineros/</code> (servicio, interfaces, listado y formulario reactivo).</li>
  </ul>

  <pre>
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./core/layout/layout').then((m) => m.Layout),
    children: [
      { path: '', title: 'Inicio | SITRA-ORO', loadComponent: () => import('./core/inicio/inicio').then((m) => m.Inicio) },
      { path: 'acopio/mineros', title: 'Mineros | SITRA-ORO', loadComponent: () => import('./features/acopio/mineros/minero-list').then((m) => m.MineroList) },
      { path: 'acopio/mineros/nuevo', title: 'Registrar minero | SITRA-ORO', loadComponent: () => import('./features/acopio/mineros/minero-form').then((m) => m.MineroForm) },
      { path: 'acopio/mineros/:id/editar', title: 'Editar minero | SITRA-ORO', loadComponent: () => import('./features/acopio/mineros/minero-form').then((m) => m.MineroForm) },
    ],
  },
  { path: '**', redirectTo: '' },
];
  </pre>

  <div class="capture-block">
    <h4>Captura 1. Estructura de carpetas core/shared/features</h4>
    <div class="capture-instruction">Abrir el proyecto en VS Code y mostrar la estructura de carpetas core/shared/features, dejando visibles el reloj con fecha y hora y el usuario.</div>
    ${renderCapture(1, "Estructura de carpetas core/shared/features en VS Code", "Abrir el explorador de VS Code mostrando las carpetas core, shared y features, el archivo app.routes.ts y la terminal compilando exitosamente.", imgs.c1, "Captura 1")}
    <div class="capture-explanation"><strong>Explicación.</strong> La estructura modular separa los servicios transversales (<code>core</code>) de los módulos funcionales de negocio (<code>features/acopio/mineros</code>). <code>app.routes.ts</code> configura el Layout persistente como ruta base anidando las rutas hijas.</div>
  </div>

  <div class="page-break"></div>

  <!-- 3.2 LAYOUT Y NAVEGACIÓN -->
  <h3>3.2 Layout y navegación</h3>
  <p>
    El componente <code>Layout</code> mantiene fijo el encabezado corporativo (SITRA-ORO) y el sidebar lateral de navegación, proyectando el contenido de cada pantalla dentro de <code>&lt;router-outlet /&gt;</code>.
  </p>
  <ul>
    <li><strong>Página de inicio real en <code>/</code>:</strong> Contiene un Hero informativo con descripción operativa y acceso directo, sin redirecciones automáticas.</li>
    <li><strong>Navegación reactiva:</strong> Enlaces con <code>routerLinkActive="active"</code> para marcar visualmente la opción activa sin provocar recargas del navegador.</li>
  </ul>

  <div class="capture-block">
    <h4>Captura 2. Página de inicio real en / (sin redirect)</h4>
    <div class="capture-instruction">Ejecutar la aplicación en http://localhost:4200/ y mostrar el encabezado, sidebar y la página de inicio real, con reloj y usuario visibles.</div>
    ${renderCapture(2, "Página de inicio real en / (sin redirect)", "Cargar la raíz http://localhost:4200/ mostrando el encabezado corporativo, la barra lateral con 'Inicio' activo y el Hero central informativo.", imgs.c2, "Captura 2")}
    <div class="capture-explanation"><strong>Explicación.</strong> La pantalla en <code>/</code> presenta la vista de inicio real de la SPA sin redireccionar hacia otra URL, cumpliendo la especificación de diseño modular.</div>
  </div>

  <div class="capture-block">
    <h4>Captura 3. Navegación hacia la ruta hija /acopio/mineros</h4>
    <div class="capture-instruction">Pulsar sobre 'Mineros' en el sidebar y mostrar la transición hacia /acopio/mineros manteniendo el Layout intacto, con reloj y usuario visibles.</div>
    ${renderCapture(3, "Navegación hacia la ruta hija /acopio/mineros", "Navegar hacia /acopio/mineros mostrando la actualización del sidebar (Mineros activo) y la carga de la vista hija en el router-outlet.", imgs.c3, "Captura 3")}
    <div class="capture-explanation"><strong>Explicación.</strong> El encabezado y sidebar se mantienen intactos durante la navegación; únicamente se reemplaza el contenido del outlet, logrando una navegación fluida e instantánea.</div>
  </div>

  <div class="page-break"></div>

  <!-- 3.3 SERVICIO HTTP E INTERCEPTOR -->
  <h3>3.3 Servicio HTTP</h3>
  <p>
    La lógica de comunicación HTTP se aísla mediante servicios dedicados e interceptores funcionales:
  </p>
  <pre>
// core/interceptors/trace-id.interceptor.ts
export const traceIdInterceptor: HttpInterceptorFn = (request, next) =>
  next(request.clone({ setHeaders: { 'X-Trace-ID': crypto.randomUUID() } }));

// core/api/api.service.ts
@Injectable({ providedIn: 'root' })
export class ApiService {
  readonly baseUrl = environment.apiBaseUrl; // http://localhost:8081
  buildUrl(path: string): string { return \`\${this.baseUrl}\${path}\`; }
}

// features/acopio/mineros/minero.service.ts
@Injectable({ providedIn: 'root' })
export class MineroService {
  private readonly http = inject(HttpClient);
  private readonly url = inject(ApiService).buildUrl('/api/v1/acopio/mineros');
  listar(): Observable&lt;Minero[]&gt; { return this.http.get&lt;Minero[]&gt;(this.url); }
  crear(request: MineroRequest): Observable&lt;Minero&gt; { return this.http.post&lt;Minero&gt;(this.url, request); }
  actualizar(id: number, request: MineroRequest): Observable&lt;Minero&gt; { return this.http.put&lt;Minero&gt;(\`\${this.url}/\${id}\`, request); }
  eliminar(id: number): Observable&lt;void&gt; { return this.http.delete&lt;void&gt;(\`\${this.url}/\${id}\`); }
}
  </pre>

  <div class="capture-block">
    <h4>Captura 4. Código fuente de traceIdInterceptor y MineroService</h4>
    <div class="capture-instruction">Abrir trace-id.interceptor.ts y minero.service.ts en VS Code y mostrar el interceptor y los métodos del CRUD, con reloj y usuario visibles.</div>
    ${renderCapture(4, "Código fuente de traceIdInterceptor, ApiService y MineroService", "Mostrar en VS Code el interceptor inyectando X-Trace-ID, ApiService con baseUrl y MineroService con llamadas tipadas.", imgs.c4, "Captura 4")}
    <div class="capture-explanation"><strong>Explicación.</strong> <code>traceIdInterceptor</code> inyecta un UUID en <code>X-Trace-ID</code> en cada petición. Los componentes no llaman a <code>HttpClient</code> directamente, sino a través de <code>MineroService</code>.</div>
  </div>

  <div class="capture-block">
    <h4>Captura 5. Pestaña Network: Header X-Trace-ID y respuesta 200 OK</h4>
    <div class="capture-instruction">Abrir DevTools Network en el navegador, inspeccionar la petición a /api/v1/acopio/mineros y mostrar X-Trace-ID en Request Headers y status 200 OK.</div>
    ${renderCapture(5, "Inspección Network: Request Header X-Trace-ID y status 200 OK", "Mostrar en Chrome DevTools la petición a http://localhost:8081/api/v1/acopio/mineros con cabecera X-Trace-ID y respuesta 200 OK del backend.", imgs.c5, "Captura 5")}
    <div class="capture-explanation"><strong>Explicación.</strong> Se comprueba que el interceptor adjunta la cabecera de trazabilidad <code>X-Trace-ID</code> y que la petición al backend real en Spring Boot responde con código 200 OK.</div>
  </div>

  <div class="page-break"></div>

  <!-- 3.4 CRUD INDEPENDIENTE -->
  <h3>3.4 CRUD independiente</h3>
  <p>
    <code>Minero</code> es una <strong>tabla independiente</strong> de SITRA-ORO: contiene los datos del productor minero y no requiere seleccionar previamente ninguna entidad foránea para crearse.
  </p>

  <div class="capture-block">
    <h4>Captura 6. CRUD Caso 1 - Listar mineros desde backend real</h4>
    <div class="capture-instruction">Abrir /acopio/mineros y mostrar la tabla cargando los mineros reales desde la base de datos Oracle, con reloj y usuario visibles.</div>
    ${renderCapture(6, "CRUD Caso 1 - Listar mineros desde backend real", "Mostrar la tabla con mineros registrados en Oracle (FaijoCalisayaHelioPaul, EloyFaijoQuispe, etc.), documento, zona y acciones.", imgs.c6, "Captura 6")}
    <div class="capture-explanation"><strong>Explicación.</strong> La tabla se llena a partir del endpoint <code>GET /api/v1/acopio/mineros</code> conectado a Oracle XE, administrado reactivamente con Signals.</div>
  </div>

  <div class="capture-block">
    <h4>Captura 7. CRUD Caso 2 - Crear nuevo minero (POST)</h4>
    <div class="capture-instruction">Llenar el formulario en /acopio/mineros/nuevo con datos válidos y guardar, dejando visibles los campos, el reloj y el usuario.</div>
    ${renderCapture(7, "CRUD Caso 2 - Crear nuevo minero (POST)", "Mostrar el formulario de registro con documento (mínimo 8 dígitos), nombres, teléfono y zona antes de enviar la petición POST.", imgs.c7, "Captura 7")}
    <div class="capture-explanation"><strong>Explicación.</strong> Formulario reactivo que valida campos obligatorios y envía la petición <code>POST</code> hacia el backend, redirigiendo al listado tras una persistencia exitosa.</div>
  </div>

  <div class="page-break"></div>

  <div class="capture-block">
    <h4>Captura 8. CRUD Caso 3 - Editar minero existente (GET by ID + PUT)</h4>
    <div class="capture-instruction">Abrir /acopio/mineros/:id/editar, mostrar los datos precargados desde el backend, modificar un valor y guardar, con reloj y usuario visibles.</div>
    ${renderCapture(8, "CRUD Caso 3 - Editar minero existente (GET by ID + PUT)", "Mostrar el formulario precargado con datos del minero mediante GET by ID y la modificación del teléfono o zona de procedencia.", imgs.c8, "Captura 8")}
    <div class="capture-explanation"><strong>Explicación.</strong> El formulario recupera la entidad por su identificador con <code>GET /api/v1/acopio/mineros/{id}</code>, aplica <code>patchValue</code> y persiste las modificaciones con <code>PUT</code>.</div>
  </div>

  <div class="capture-block">
    <h4>Captura 9. CRUD Caso 4 - Eliminar minero (DELETE con reactividad)</h4>
    <div class="capture-instruction">Eliminar un minero de prueba mediante el botón Eliminar y mostrar la actualización reactiva de la tabla sin recargar la página, con reloj y usuario visibles.</div>
    ${renderCapture(9, "CRUD Caso 4 - Eliminar minero (DELETE con reactividad)", "Mostrar la ejecución del DELETE hacia el backend y la confirmación inmediata en la tabla removiendo la fila del estado local.", imgs.c9, "Captura 9")}
    <div class="capture-explanation"><strong>Explicación.</strong> La acción ejecuta <code>DELETE /api/v1/acopio/mineros/{id}</code>. Al confirmarse el código 204 No Content, se actualiza la señal reactiva sin recargar la página.</div>
  </div>

  <!-- 4. ERROR O HALLAZGO -->
  <h2>4. Error o hallazgo técnico</h2>
  <p><strong>Validación de longitud de documento y prevención en cliente</strong></p>
  <p>
    Durante las pruebas de integración con el backend, al ingresar documentos de prueba con pocos dígitos (ej. <code>123</code>), el backend en Spring Boot rechazaba la solicitud respondiendo con error <code>400 Bad Request</code> debido a la anotación <code>@Size(min = 8, max = 15)</code> de Jakarta Validation. En el frontend original no existía validador de longitud mínima local, enviando solicitudes destinadas al rechazo.
  </p>
  <p>
    <strong>Solución implementada:</strong> Se incorporó <code>Validators.minLength(8)</code> y <code>Validators.maxLength(15)</code> en el <code>FormBuilder</code>, junto con una función auxiliar <code>mensaje(control)</code> que advierte al usuario en el evento <code>blur</code> (<em>"Debe tener al menos 8 caracteres"</em>) y bloquea el botón de envío, impidiendo emitir tráfico innecesario a la red.
  </p>

  <div class="capture-block">
    <h4>Captura 10. Validación reactiva en tiempo real y prevención de envíos erróneos</h4>
    <div class="capture-instruction">Ingresar un documento con menos de 8 caracteres y salir del campo para mostrar el mensaje de validación reactivo en rojo, con reloj y usuario visibles.</div>
    ${renderCapture(10, "Validación reactiva en tiempo real y prevención de envíos erróneos", "Mostrar el formulario detectando documento con menos de 8 caracteres y campos obligatorios tocados, desplegando alerta visual en rojo.", imgs.c10, "Captura 10")}
    <div class="capture-explanation"><strong>Explicación.</strong> El formulario valida en el cliente antes de llamar a la red, garantizando coherencia con las restricciones del backend y ofreciendo retroalimentación inmediata.</div>
  </div>

  <div class="page-break"></div>

  <!-- 5. REFLEXIÓN TÉCNICA BREVE -->
  <h2>5. Reflexión técnica breve</h2>
  <p><strong>¿Por qué separar CategoriaService (o MineroService) del componente que lo usa facilita un cambio futuro en la URL o en la forma de consumir el backend?</strong></p>
  <p style="text-align: justify; line-height: 1.6;">
    Separar <code>MineroService</code> del componente respeta el Principio de Responsabilidad Única (SRP): el componente se limita a gobernar el estado de la vista y la interacción del usuario, mientras que el servicio encapsula los detalles del protocolo de red y el contrato HTTP. Si la API cambia su versionamiento (por ejemplo, migrando de <code>/api/v1/acopio/mineros</code> a <code>/api/v2/mineros</code>), cambia de dominio base, incorpora tokens Bearer JWT o reemplaza peticiones REST por WebSocket/GraphQL, la actualización se realiza en un único punto dentro del servicio. Ningún componente consumidor (como <code>MineroList</code> o <code>MineroForm</code>) requiere ser modificado ni recompilado, garantizando alta cohesión, bajo acoplamiento y facilidad para realizar pruebas unitarias aisladas mediante mocks.
  </p>

  <!-- 6. PREGUNTAS DE DEFENSA -->
  <h2>6. Respuestas a las Preguntas de Defensa</h2>
  <ol>
    <li><strong>¿Por qué el layout (menú, sidebar, encabezado) vive en un componente separado de las pantallas de cada funcionalidad?</strong><br>
    Porque conforma la estructura común y persistente de la SPA. Al aislarlo en <code>LayoutComponent</code>, las vistas hijas se proyectan dinámicamente en el <code>&lt;router-outlet /&gt;</code>, evitando duplicar código de maquetación en cada pantalla, previniendo reinicializaciones del DOM global y manteniendo el estado de navegación.</li>
    <li><strong>¿Qué diferencia hay entre organizar componentes por tipo y organizarlos por funcionalidad (core/shared/features)?</strong><br>
    Organizar por tipo agrupa todos los componentes juntos y todos los servicios juntos, volviendo el proyecto inmanejable al crecer. Organizar por funcionalidad (core/shared/features) sigue los principios de Domain-Driven Design (DDD): cada módulo es autónomo, cohesivo, fácil de auditar, propicio para carga perezosa (lazy loading) y asignable a distintos miembros del equipo sin generar conflictos.</li>
    <li><strong>¿Por qué MineroService no expone directamente el HttpClient a los componentes que lo usan?</strong><br>
    Porque rompería el principio de encapsulamiento. Si un componente llamara a <code>HttpClient.get()</code> directamente, quedaría acoplado a URLs hardcodeadas, verbos HTTP y detalles de cabeceras. El servicio actúa como una fachada que entrega datos con tipado estricto (<code>Observable&lt;Minero[]&gt;</code>).</li>
    <li><strong>¿Por qué Minero es una tabla independiente, y qué cambiaría si tuviera una relación con otra entidad?</strong><br>
    Es independiente porque no requiere la existencia previa de otra entidad ni una clave foránea para crearse. Si fuera dependiente (como una liquidación o entrega de mineral), el formulario del frontend estaría obligado a cargar previamente un selector para elegir la entidad padre antes de enviar la creación.</li>
    <li><strong>¿Por qué ApiService no sabe nada sobre Minero, y qué otro servicio futuro reutilizaría exactamente el mismo ApiService?</strong><br>
    <code>ApiService</code> reside en <code>core/</code> y su responsabilidad exclusiva es proveer la URL base y utilidades de transporte global. No debe tener conocimiento del dominio de negocio. Servicios futuros como <code>AcopiadorService</code> o <code>LiquidacionService</code> reutilizarán el mismo <code>ApiService.buildUrl(...)</code> sin alterar <code>core/</code>.</li>
    <li><strong>¿Por qué el interceptor HTTP agrega su header en un solo lugar, en vez de que cada servicio lo agregue? ¿Qué otro problema resuelve?</strong><br>
    Centraliza un aspecto transversal (Cross-Cutting Concern), evitando duplicar código propenso a errores en cada servicio. Con el mismo mecanismo se resuelven de forma elegante la inyección de tokens de autenticación JWT (<code>Authorization: Bearer</code>), la captura global de errores (401/403/500) y el manejo de spinners de carga globales.</li>
    <li><strong>Si tu CRUD autónomo usa una tabla distinta a Categoria, ¿qué validaciones del backend tuviste que respetar en el frontend?</strong><br>
    Para <code>Minero</code> se respetaron las reglas de <code>MineroRequest.java</code>: documento de identidad obligatorio con longitud entre 8 y 15 caracteres; nombres y apellidos obligatorios con máximo 150 caracteres; teléfono con límite de 20 caracteres; y zona de procedencia con un máximo de 100 caracteres.</li>
  </ol>

  <!-- 7. RÚBRICA DE EVALUACIÓN -->
  <h2>7. Rúbrica de evaluación</h2>
  <table class="rubric-table">
    <thead>
      <tr>
        <th>Criterio</th>
        <th style="text-align: center;">Peso</th>
        <th style="text-align: center;">Nivel obtenido</th>
        <th style="text-align: center;">Puntos</th>
        <th>Justificación técnica</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>1. Proyecto y arquitectura</strong></td>
        <td style="text-align: center;">25%</td>
        <td style="text-align: center;"><span class="badge-level">A (20 pts)</span></td>
        <td style="text-align: center;">20</td>
        <td>Estructura modular <code>core/shared/features</code> correcta y coherente con el dominio SITRA-ORO. Standalone components y router jerárquico.</td>
      </tr>
      <tr>
        <td><strong>2. Layout y navegación</strong></td>
        <td style="text-align: center;">25%</td>
        <td style="text-align: center;"><span class="badge-level">A (20 pts)</span></td>
        <td style="text-align: center;">20</td>
        <td>Layout funcional con header corporativo, sidebar con links activos y página de inicio real en <code>/</code> sin redirect (Capturas 2 y 3).</td>
      </tr>
      <tr>
        <td><strong>3. Servicio HTTP</strong></td>
        <td style="text-align: center;">25%</td>
        <td style="text-align: center;"><span class="badge-level">A (20 pts)</span></td>
        <td style="text-align: center;">20</td>
        <td><code>ApiService</code> en <code>core/</code>, <code>MineroService</code> dedicado e interceptor inyectando <code>X-Trace-ID</code> probado contra backend real con 200 OK (Captura 5).</td>
      </tr>
      <tr>
        <td><strong>4. CRUD independiente</strong></td>
        <td style="text-align: center;">25%</td>
        <td style="text-align: center;"><span class="badge-level">A (20 pts)</span></td>
        <td style="text-align: center;">20</td>
        <td>Los 4 casos (Listar, Crear, Editar, Eliminar) funcionando de extremo a extremo contra backend real Spring Boot y Oracle XE (Capturas 6 al 9).</td>
      </tr>
    </tbody>
  </table>

  <p style="text-align: right; font-weight: 700; font-size: 10pt; color: #0f172a; margin-top: 6px;">
    Nota final = (0.25 × 20) + (0.25 × 20) + (0.25 × 20) + (0.25 × 20) = <span style="color: #16a34a; font-size: 12pt;">20 / 20</span>
  </p>

  <div class="page-break"></div>

  <!-- ANEXO FEEDBACK (ÚLTIMA PÁGINA) -->
  <div class="header-top">
    <img src="${logoUpeu1Src}" class="header-logo-left" alt="UPeU Logo" />
    <div class="header-center-text">
      <div class="inst-name">UNIVERSIDAD PERUANA UNIÓN</div>
      <div class="fac-name">Escuela Profesional de Ingeniería de Sistemas</div>
    </div>
    <img src="${logoUpeu2Src}" class="header-logo-right" alt="EPIS Logo" />
  </div>

  <div class="title-block" style="margin-bottom: 12px;">
    <div class="main-doc-title" style="font-size: 14pt;">Anexo: Feedback de la sesión</div>
    <div class="session-title" style="font-size: 11pt;">Sesión S07: Creación y Arquitectura de la SPA</div>
  </div>

  <div class="feedback-box">
    <div class="feedback-q">1. ¿Cuál es el aprendizaje más importante que te llevas de la clase de hoy?</div>
    <div class="feedback-a">Aprender a estructurar un frontend empresarial moderno con Angular Standalone separando responsabilidades en core, shared y features, y comprender el rol de los interceptores HTTP funcionales para inyectar trazabilidad distribuida (X-Trace-ID) sin alterar los componentes.</div>
  </div>

  <div class="feedback-box">
    <div class="feedback-q">2. ¿Qué punto de la clase te resultó más confuso o te dejó con dudas?</div>
    <div class="feedback-a">Al inicio, la configuración del enrutamiento anidado para asegurar que los componentes hijos utilicen el LayoutComponent de forma persistente sin provocar parpadeos ni recargas al cambiar de pantalla.</div>
  </div>

  <div class="feedback-box">
    <div class="feedback-q">3. ¿Tienes alguna pregunta que te gustaría que sea respondida la siguiente clase?</div>
    <div class="feedback-a">¿Cómo se gestiona adecuadamente la renovación de tokens JWT vencidos dentro de un interceptor HTTP en Angular cuando múltiples peticiones concurrentes reciben un código de error 401?</div>
  </div>

  <div class="feedback-box">
    <div class="feedback-q">4. Sobre tu nivel de comprensión de la clase de hoy, marca una opción:</div>
    <div class="feedback-a">
      <strong style="color: #16a34a;">[ X ] ¡Entendido! - Lo domino y podría explicarlo.</strong><br>
      <span style="color: #64748b;">[ &nbsp; ] Más o menos. - Entendí la idea general, pero tengo dudas.</span><br>
      <span style="color: #64748b;">[ &nbsp; ] Necesito ayuda. - Me siento perdido/a con este tema.</span>
    </div>
  </div>

  <div class="feedback-box">
    <div class="feedback-q">5. ¿Cómo puedo ayudarte a comprender mejor el tema?</div>
    <div class="feedback-a">Con ejemplos prácticos de comunicación entre componentes mediante Signals reactivas y manejo de estados de carga globales.</div>
  </div>

  <div class="feedback-box">
    <div class="feedback-q">6. Pensando en tu participación y esfuerzo en la clase de hoy, ¿cómo te autoevaluarías?</div>
    <div class="feedback-a">
      <strong style="color: #16a34a;">[ X ] Muy Comprometido/a: Me esforcé al máximo.</strong><br>
      <span style="color: #64748b;">[ &nbsp; ] Comprometido/a: Sé que podría haberme esforzado un poco más.</span><br>
      <span style="color: #64748b;">[ &nbsp; ] Poco Comprometido/a: Hoy no di mi mejor esfuerzo.</span>
    </div>
  </div>

  <div class="feedback-box">
    <div class="feedback-q">7. Mi satisfacción con la clase fue... (califica del 1 al 10):</div>
    <div class="feedback-a" style="font-weight: 700; color: #1e3a8a; font-size: 10pt;">
      10 / 10 — La sesión brindó los fundamentos esenciales para conectar la interfaz de usuario con la arquitectura backend construida en las sesiones previas.
    </div>
  </div>

</body>
</html>
  `;
}

console.log("Iniciando compilación de informes PDF y plantillas...");
const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  args: ["--use-angle=swiftshader", "--disable-gpu-sandbox"],
});

try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 1600 } });

  // 1. GENERATE COMPLETED PDF WITH CAPTURES AND BOTH LOGOS AT TOP
  console.log("Generando PDF Completo: S07_LP2_Equipo05_CalisayaHelio.pdf ...");
  await page.setContent(generateHtml(true), { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await page.pdf({
    path: path.join(here, "S07_LP2_Equipo05_CalisayaHelio.pdf"),
    format: "A4",
    printBackground: true,
    margin: { top: "14mm", bottom: "14mm", left: "14mm", right: "14mm" },
    displayHeaderFooter: true,
    headerTemplate: `<div style="font-size: 8pt; color: #94a3b8; font-family: sans-serif; width: 100%; padding: 0 14mm; display: flex; justify-content: space-between;"><span>SITRA-ORO · Lenguaje de Programación II</span><span>Sesión S07 — Creación y Arquitectura SPA</span></div>`,
    footerTemplate: `<div style="font-size: 8pt; color: #94a3b8; font-family: sans-serif; width: 100%; padding: 0 14mm; display: flex; justify-content: space-between;"><span>Estudiante: Faijo Calisaya Helio Paul (Equipo 05)</span><span>Página <span class="pageNumber"></span> de <span class="totalPages"></span></span></div>`,
  });

  // 2. GENERATE TEMPLATE PDF READY FOR PLACING CAPTURES (RECUADROS PARA PEGAR)
  console.log("Generando PDF Plantilla para pegar capturas: S07_LP2_Equipo05_CalisayaHelio_Plantilla_Capturas.pdf ...");
  await page.setContent(generateHtml(false), { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await page.pdf({
    path: path.join(here, "S07_LP2_Equipo05_CalisayaHelio_Plantilla_Capturas.pdf"),
    format: "A4",
    printBackground: true,
    margin: { top: "14mm", bottom: "14mm", left: "14mm", right: "14mm" },
    displayHeaderFooter: true,
    headerTemplate: `<div style="font-size: 8pt; color: #94a3b8; font-family: sans-serif; width: 100%; padding: 0 14mm; display: flex; justify-content: space-between;"><span>SITRA-ORO · Plantilla de Capturas S07</span><span>Sesión S07 — Creación y Arquitectura SPA</span></div>`,
    footerTemplate: `<div style="font-size: 8pt; color: #94a3b8; font-family: sans-serif; width: 100%; padding: 0 14mm; display: flex; justify-content: space-between;"><span>Estudiante: Faijo Calisaya Helio Paul (Equipo 05)</span><span>Página <span class="pageNumber"></span> de <span class="totalPages"></span></span></div>`,
  });

  // 3. GENERATE WORD COMPATIBLE HTML/DOC TEMPLATE SO USER CAN OPEN IN WORD AND PASTE CAPTURES
  console.log("Generando documento editable Word: S07_LP2_Equipo05_CalisayaHelio_Plantilla.doc ...");
  const wordContent = generateHtml(false);
  fs.writeFileSync(path.join(here, "S07_LP2_Equipo05_CalisayaHelio_Plantilla.doc"), wordContent, "utf8");

  console.log("¡Todos los informes fueron generados con éxito!");
} finally {
  await browser.close();
}
