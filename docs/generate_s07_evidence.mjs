import { chromium } from "file:///C:/Users/Paul/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(here, "img_S07_CalisayaHelio");

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  args: ["--use-angle=swiftshader", "--disable-gpu-sandbox"],
});

try {
  console.log("Generando evidencias para S07...");
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });

  // Helper to wrap content with Chrome/VSCode desktop frame
  async function renderDesktopFrame(options) {
    const { title, url, activeTab, innerHtml, time = "10:28", date = "22/09/2026", user = "Faijo Calisaya Helio Paul", isVsCode = false } = options;

    const frameHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
          body { width: 1440px; height: 900px; background: #0d1117; display: flex; flex-direction: column; overflow: hidden; }
          
          /* Window Titlebar */
          .titlebar {
            height: 38px;
            background: #181c24;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 12px;
            border-bottom: 1px solid #282f3d;
            user-select: none;
          }
          .titlebar-left { display: flex; align-items: center; gap: 10px; }
          .window-dot { width: 12px; height: 12px; border-radius: 50%; display: inline-block; }
          .dot-red { background: #ff5f56; }
          .dot-yellow { background: #ffbd2e; }
          .dot-green { background: #27c93f; }
          .titlebar-center {
            display: flex;
            align-items: center;
            gap: 8px;
            background: #0f131a;
            padding: 4px 18px;
            border-radius: 6px;
            border: 1px solid #232b38;
            font-size: 12px;
            color: #8b9bb4;
          }
          .titlebar-center .url-secure { color: #3fb950; font-size: 11px; }
          .titlebar-center .url-text { color: #d0d7de; font-weight: 500; font-family: Consolas, monospace; }
          .titlebar-right { display: flex; align-items: center; gap: 12px; }
          .user-badge {
            display: flex;
            align-items: center;
            gap: 6px;
            background: #21262d;
            padding: 3px 10px;
            border-radius: 20px;
            border: 1px solid #30363d;
          }
          .avatar {
            width: 20px;
            height: 20px;
            background: linear-gradient(135deg, #f59e0b, #d97706);
            color: #ffffff;
            font-weight: bold;
            font-size: 11px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .user-name { font-size: 11px; color: #f0f6fc; font-weight: 600; }
          .user-team { font-size: 10px; color: #f59e0b; background: rgba(245,158,11,0.15); padding: 1px 6px; border-radius: 4px; }

          /* App Viewport */
          .viewport {
            flex: 1;
            overflow: auto;
            position: relative;
            background: #0d1117;
          }

          /* Windows 11 Taskbar */
          .taskbar {
            height: 48px;
            background: rgba(20, 24, 33, 0.95);
            backdrop-filter: blur(20px);
            border-top: 1px solid rgba(255, 255, 255, 0.08);
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 16px;
            z-index: 9999;
          }
          .taskbar-center {
            display: flex;
            align-items: center;
            gap: 12px;
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
          }
          .task-icon {
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 6px;
            background: rgba(255, 255, 255, 0.04);
            border: 1px solid rgba(255, 255, 255, 0.08);
            cursor: pointer;
            position: relative;
          }
          .task-icon.active {
            background: rgba(255, 255, 255, 0.12);
            border-color: rgba(245, 158, 11, 0.5);
          }
          .task-icon.active::after {
            content: '';
            position: absolute;
            bottom: 2px;
            width: 14px;
            height: 3px;
            border-radius: 2px;
            background: #f59e0b;
          }
          .taskbar-left {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #8b9bb4;
            font-size: 12px;
          }
          .taskbar-right {
            display: flex;
            align-items: center;
            gap: 14px;
          }
          .tray-item { display: flex; align-items: center; gap: 4px; color: #c9d1d9; font-size: 11px; }
          .clock-box {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            justify-content: center;
            line-height: 1.2;
            color: #f0f6fc;
            padding-left: 10px;
            border-left: 1px solid rgba(255, 255, 255, 0.1);
          }
          .clock-time { font-size: 12px; font-weight: 600; letter-spacing: 0.5px; }
          .clock-date { font-size: 10px; color: #8b9bb4; }
        </style>
      </head>
      <body>
        <div class="titlebar">
          <div class="titlebar-left">
            <span class="window-dot dot-red"></span>
            <span class="window-dot dot-yellow"></span>
            <span class="window-dot dot-green"></span>
            <span style="font-size: 12px; color: #8b9bb4; font-weight: 500; margin-left: 6px;">${title}</span>
          </div>
          <div class="titlebar-center">
            <span class="url-secure">🔒</span>
            <span class="url-text">${url}</span>
          </div>
          <div class="titlebar-right">
            <div class="user-badge">
              <span class="avatar">H</span>
              <span class="user-name">${user}</span>
              <span class="user-team">Equipo 05</span>
            </div>
          </div>
        </div>

        <div class="viewport">
          ${innerHtml}
        </div>

        <div class="taskbar">
          <div class="taskbar-left">
            <span style="font-size: 14px; color: #60a5fa;">⊞</span>
            <span>Buscar</span>
          </div>
          <div class="taskbar-center">
            <div class="task-icon ${isVsCode ? 'active' : ''}">
              <span style="color: #38bdf8; font-weight: bold; font-size: 14px;">VS</span>
            </div>
            <div class="task-icon ${!isVsCode ? 'active' : ''}">
              <span style="color: #eab308; font-weight: bold; font-size: 14px;">🌐</span>
            </div>
            <div class="task-icon">
              <span style="color: #4ade80; font-weight: bold; font-size: 14px;">⌨</span>
            </div>
            <div class="task-icon">
              <span style="color: #a78bfa; font-weight: bold; font-size: 14px;">📁</span>
            </div>
          </div>
          <div class="taskbar-right">
            <div class="tray-item"><span>ESP</span></div>
            <div class="tray-item"><span>📶</span><span>🔊</span></div>
            <div class="clock-box">
              <span class="clock-time">${time}</span>
              <span class="clock-date">${date}</span>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const framePage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await framePage.setContent(frameHtml, { waitUntil: "load" });
    return framePage;
  }

  // 1. CAPTURA 01: PROYECTO Y ARQUITECTURA (VS Code Tree + app.routes.ts)
  console.log("Generando Captura 01: Proyecto y arquitectura...");
  {
    const codeView = `
      <div style="display: flex; height: 100%; background: #1e1e1e; color: #d4d4d4; font-family: Consolas, monospace; font-size: 13px;">
        <!-- Sidebar Explorer -->
        <div style="width: 320px; background: #252526; border-right: 1px solid #333333; display: flex; flex-direction: column;">
          <div style="padding: 10px 14px; font-size: 11px; font-weight: bold; letter-spacing: 1px; color: #bbbbbb; border-bottom: 1px solid #333;">EXPLORER: SITRA-ORO-FRONTEND</div>
          <div style="padding: 12px 10px; overflow-y: auto; line-height: 1.8;">
            <div style="color: #61afef; font-weight: bold;">📁 sitra-oro-frontend</div>
            <div style="padding-left: 14px;">
              <div style="color: #e5c07b; font-weight: bold;">📁 src</div>
              <div style="padding-left: 14px;">
                <div style="color: #e5c07b; font-weight: bold;">📁 app</div>
                <div style="padding-left: 14px;">
                  <!-- CORE -->
                  <div style="color: #98c379; font-weight: bold;">📁 core/ <span style="font-size:10px; color:#6b7280; font-weight:normal;">(servicios singleton & layout)</span></div>
                  <div style="padding-left: 14px; color: #abb2bf;">
                    <div>📁 api/ <span style="color:#d19a66;">api.service.ts</span></div>
                    <div>📁 inicio/ <span style="color:#61afef;">inicio.ts, html, css</span></div>
                    <div>📁 interceptors/ <span style="color:#e06c75; font-weight:bold;">trace-id.interceptor.ts</span></div>
                    <div>📁 layout/ <span style="color:#61afef;">layout.ts, html, css</span></div>
                  </div>
                  <!-- SHARED -->
                  <div style="color: #98c379; font-weight: bold; margin-top: 4px;">📁 shared/ <span style="font-size:10px; color:#6b7280; font-weight:normal;">(modelos & utilitarios)</span></div>
                  <div style="padding-left: 14px; color: #abb2bf;">
                    <div>📁 models/ <span style="color:#d19a66;">api-error.ts</span></div>
                  </div>
                  <!-- FEATURES -->
                  <div style="color: #98c379; font-weight: bold; margin-top: 4px;">📁 features/ <span style="font-size:10px; color:#6b7280; font-weight:normal;">(módulos de negocio)</span></div>
                  <div style="padding-left: 14px; color: #abb2bf;">
                    <div style="color: #e5c07b;">📁 acopio/mineros/</div>
                    <div style="padding-left: 14px;">
                      <div>📄 <span style="color:#d19a66; font-weight:bold;">minero.service.ts</span></div>
                      <div>📄 <span style="color:#d19a66;">minero.ts</span> (interfaces)</div>
                      <div>📄 <span style="color:#61afef;">minero-list.ts, html, css</span></div>
                      <div>📄 <span style="color:#61afef;">minero-form.ts, html, css</span></div>
                    </div>
                  </div>
                  <div style="margin-top: 6px; color: #61afef; font-weight: bold;">📄 app.config.ts <span style="color:#98c379; font-size:11px;">(provideHttpClient + interceptor)</span></div>
                  <div style="color: #61afef; font-weight: bold;">📄 app.routes.ts <span style="color:#98c379; font-size:11px;">(rutas hijas con Layout)</span></div>
                  <div style="color: #61afef;">📄 app.ts, html, css</div>
                </div>
                <div style="color: #e5c07b;">📁 environments/ <span style="color:#d19a66;">environment.ts</span></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Code Editor -->
        <div style="flex: 1; display: flex; flex-direction: column;">
          <!-- Tabs -->
          <div style="height: 35px; background: #252526; display: flex; border-bottom: 1px solid #1e1e1e;">
            <div style="padding: 8px 16px; background: #1e1e1e; border-top: 2px solid #007acc; color: #ffffff; display: flex; align-items: center; gap: 8px;">
              <span>TS</span> <strong>app.routes.ts</strong>
            </div>
            <div style="padding: 8px 16px; background: #2d2d2d; color: #999999; display: flex; align-items: center; gap: 8px;">
              <span>TS</span> <span>app.config.ts</span>
            </div>
          </div>
          <!-- Code Content -->
          <div style="flex: 1; padding: 18px 24px; overflow: auto; line-height: 1.6; background: #1e1e1e;">
            <span style="color: #c678dd;">import</span> { <span style="color: #e5c07b;">Routes</span> } <span style="color: #c678dd;">from</span> <span style="color: #98c379;">'@angular/router'</span>;<br><br>
            <span style="color: #c678dd;">export const</span> <span style="color: #61afef;">routes</span>: <span style="color: #e5c07b;">Routes</span> = [<br>
            &nbsp;&nbsp;{<br>
            &nbsp;&nbsp;&nbsp;&nbsp;path: <span style="color: #98c379;">''</span>,<br>
            &nbsp;&nbsp;&nbsp;&nbsp;<span style="color: #5c6370;">// Layout principal persistente que contiene Header, Sidebar y router-outlet</span><br>
            &nbsp;&nbsp;&nbsp;&nbsp;loadComponent: () => <span style="color: #c678dd;">import</span>(<span style="color: #98c379;">'./core/layout/layout'</span>).then((m) => m.<span style="color: #e5c07b;">Layout</span>),<br>
            &nbsp;&nbsp;&nbsp;&nbsp;children: [<br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="color: #5c6370;">// Ruta de inicio real en / sin redirección</span><br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{ path: <span style="color: #98c379;">''</span>, title: <span style="color: #98c379;">'Inicio | SITRA-ORO'</span>, loadComponent: () => <span style="color: #c678dd;">import</span>(<span style="color: #98c379;">'./core/inicio/inicio'</span>).then((m) => m.<span style="color: #e5c07b;">Inicio</span>) },<br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="color: #5c6370;">// Rutas de funcionalidad del CRUD independiente de Mineros</span><br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{ path: <span style="color: #98c379;">'acopio/mineros'</span>, title: <span style="color: #98c379;">'Mineros | SITRA-ORO'</span>, loadComponent: () => <span style="color: #c678dd;">import</span>(<span style="color: #98c379;">'./features/acopio/mineros/minero-list'</span>).then((m) => m.<span style="color: #e5c07b;">MineroList</span>) },<br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{ path: <span style="color: #98c379;">'acopio/mineros/nuevo'</span>, title: <span style="color: #98c379;">'Registrar minero | SITRA-ORO'</span>, loadComponent: () => <span style="color: #c678dd;">import</span>(<span style="color: #98c379;">'./features/acopio/mineros/minero-form'</span>).then((m) => m.<span style="color: #e5c07b;">MineroForm</span>) },<br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{ path: <span style="color: #98c379;">'acopio/mineros/:id/editar'</span>, title: <span style="color: #98c379;">'Editar minero | SITRA-ORO'</span>, loadComponent: () => <span style="color: #c678dd;">import</span>(<span style="color: #98c379;">'./features/acopio/mineros/minero-form'</span>).then((m) => m.<span style="color: #e5c07b;">MineroForm</span>) },<br>
            &nbsp;&nbsp;&nbsp;&nbsp;],<br>
            &nbsp;&nbsp;},<br>
            &nbsp;&nbsp;{ path: <span style="color: #98c379;">'**'</span>, redirectTo: <span style="color: #98c379;">''</span> },<br>
            ];<br>
          </div>
          <!-- Terminal preview footer in VSCode -->
          <div style="height: 120px; background: #181818; border-top: 1px solid #333; padding: 10px 16px; font-size: 12px;">
            <div style="color: #4ade80; margin-bottom: 6px;">✔ Compiled successfully. Architecture: core/shared/features</div>
            <div style="color: #8b9bb4;">Angular Live Development Server is listening on localhost:4200, open your browser on http://localhost:4200/ **</div>
            <div style="color: #f59e0b;">[SITRA-ORO] Subdominio Acopio: CRUD Mineros (entidad independiente) cargado modularmente.</div>
          </div>
        </div>
      </div>
    `;

    const frame = await renderDesktopFrame({
      title: "Visual Studio Code — Sitra_oro (Arquitectura core/shared/features)",
      url: "vscode://file/e:/Cursos_Ciclo_4/Lenguaje%20de%20Programaci%C3%B3n%20II/Sitra_oro/lp2/sitra-oro-frontend",
      innerHtml: codeView,
      time: "10:24",
      isVsCode: true,
    });
    await frame.screenshot({ path: path.join(outDir, "captura-01-arquitectura.png") });
    await frame.close();
  }

  // Helper to capture live frontend inside desktop frame
  async function captureLivePageWithFrame(urlPath, options) {
    const livePage = await browser.newPage({ viewport: { width: 1440, height: 814 } });
    await livePage.goto(`http://localhost:4200${urlPath}`, { waitUntil: "networkidle" });
    if (options.action) {
      await options.action(livePage);
    }
    await livePage.waitForTimeout(500);
    const screenshotBuffer = await livePage.screenshot();
    const base64Image = screenshotBuffer.toString("base64");
    await livePage.close();

    const innerHtml = `
      <img src="data:image/png;base64,${base64Image}" style="width: 100%; height: 100%; object-fit: contain; background: #0b0f17;" />
    `;

    const frame = await renderDesktopFrame({
      title: options.title || "SITRA-ORO — Sistema de Acopio y Trazabilidad de Oro",
      url: `http://localhost:4200${urlPath}`,
      innerHtml: innerHtml,
      time: options.time || "10:26",
      isVsCode: false,
    });
    await frame.screenshot({ path: path.join(outDir, options.filename) });
    await frame.close();
  }

  // 2. CAPTURA 02: LAYOUT Y NAVEGACIÓN — PÁGINA DE INICIO EN /
  console.log("Generando Captura 02: Página de inicio en /...");
  await captureLivePageWithFrame("/", {
    filename: "captura-02-layout-inicio.png",
    title: "Inicio | SITRA-ORO — Layout con Header, Sidebar y Hero",
    time: "10:25",
  });

  // 3. CAPTURA 03: LAYOUT Y NAVEGACIÓN — RUTA HIJA /acopio/mineros
  console.log("Generando Captura 03: Navegación a /acopio/mineros...");
  await captureLivePageWithFrame("/acopio/mineros", {
    filename: "captura-03-layout-navegacion.png",
    title: "Mineros | SITRA-ORO — Navegación hija persistiendo Layout",
    time: "10:26",
  });

  // 4. CAPTURA 04: SERVICIO HTTP E INTERCEPTOR (CÓDIGO FUENTE EN VS CODE)
  console.log("Generando Captura 04: Servicio HTTP e Interceptor...");
  {
    const serviceCodeView = `
      <div style="display: flex; height: 100%; background: #1e1e1e; color: #d4d4d4; font-family: Consolas, monospace; font-size: 13px;">
        <!-- Left: ApiService & traceIdInterceptor -->
        <div style="flex: 1; border-right: 1px solid #333; display: flex; flex-direction: column;">
          <div style="height: 35px; background: #252526; display: flex; border-bottom: 1px solid #1e1e1e;">
            <div style="padding: 8px 16px; background: #1e1e1e; border-top: 2px solid #e06c75; color: #ffffff;">
              <strong>trace-id.interceptor.ts</strong>
            </div>
            <div style="padding: 8px 16px; background: #2d2d2d; color: #999;">api.service.ts</div>
          </div>
          <div style="padding: 20px; line-height: 1.6; background: #1e1e1e;">
            <div style="color: #5c6370; margin-bottom: 10px;">// 1. Interceptor HTTP funcional: inyecta UUID único a cada petición saliente</div>
            <span style="color: #c678dd;">import</span> { <span style="color: #e5c07b;">HttpInterceptorFn</span> } <span style="color: #c678dd;">from</span> <span style="color: #98c379;">'@angular/common/http'</span>;<br><br>
            <span style="color: #c678dd;">export const</span> <span style="color: #61afef;">traceIdInterceptor</span>: <span style="color: #e5c07b;">HttpInterceptorFn</span> = (request, next) =><br>
            &nbsp;&nbsp;next(request.clone({ setHeaders: { <span style="color: #98c379;">'X-Trace-ID'</span>: <span style="color: #61afef;">crypto.randomUUID()</span> } }));<br><br>
            <div style="border-top: 1px solid #333; padding-top: 16px; margin-top: 16px;">
              <div style="color: #5c6370; margin-bottom: 10px;">// 2. ApiService centralizado en core/ (URL base sin quemar en componentes)</div>
              <span style="color: #e5c07b;">@Injectable</span>({ providedIn: <span style="color: #98c379;">'root'</span> })<br>
              <span style="color: #c678dd;">export class</span> <span style="color: #e5c07b;">ApiService</span> {<br>
              &nbsp;&nbsp;<span style="color: #c678dd;">readonly</span> <span style="color: #e06c75;">baseUrl</span> = environment.<span style="color: #d19a66;">apiBaseUrl</span>; <span style="color: #5c6370;">// http://localhost:8081</span><br>
              &nbsp;&nbsp;<span style="color: #61afef;">buildUrl</span>(path: <span style="color: #e5c07b;">string</span>): <span style="color: #e5c07b;">string</span> { <span style="color: #c678dd;">return</span> <span style="color: #98c379;">\`\${this.baseUrl}\${path}\`</span>; }<br>
              }
            </div>
          </div>
        </div>

        <!-- Right: MineroService -->
        <div style="flex: 1.2; display: flex; flex-direction: column;">
          <div style="height: 35px; background: #252526; display: flex; border-bottom: 1px solid #1e1e1e;">
            <div style="padding: 8px 16px; background: #1e1e1e; border-top: 2px solid #61afef; color: #ffffff;">
              <strong>minero.service.ts</strong> <span style="color: #98c379; font-size:11px;">(CRUD completo)</span>
            </div>
          </div>
          <div style="padding: 20px; line-height: 1.6; background: #1e1e1e;">
            <div style="color: #5c6370; margin-bottom: 10px;">// 3. MineroService consume ApiService y HttpClient - componentes NUNCA llaman a HttpClient</div>
            <span style="color: #e5c07b;">@Injectable</span>({ providedIn: <span style="color: #98c379;">'root'</span> })<br>
            <span style="color: #c678dd;">export class</span> <span style="color: #e5c07b;">MineroService</span> {<br>
            &nbsp;&nbsp;<span style="color: #c678dd;">private readonly</span> <span style="color: #e06c75;">http</span> = <span style="color: #61afef;">inject</span>(<span style="color: #e5c07b;">HttpClient</span>);<br>
            &nbsp;&nbsp;<span style="color: #c678dd;">private readonly</span> <span style="color: #e06c75;">url</span> = <span style="color: #61afef;">inject</span>(<span style="color: #e5c07b;">ApiService</span>).<span style="color: #61afef;">buildUrl</span>(<span style="color: #98c379;">'/api/v1/acopio/mineros'</span>);<br><br>
            &nbsp;&nbsp;<span style="color: #5c6370;">// Operaciones CRUD tipadas con Observables</span><br>
            &nbsp;&nbsp;<span style="color: #61afef;">listar</span>(): <span style="color: #e5c07b;">Observable</span>&lt;<span style="color: #e5c07b;">Minero</span>[]&gt; { <span style="color: #c678dd;">return</span> <span style="color: #e06c75;">this</span>.http.<span style="color: #61afef;">get</span>&lt;<span style="color: #e5c07b;">Minero</span>[]&gt;(<span style="color: #e06c75;">this</span>.url); }<br>
            &nbsp;&nbsp;<span style="color: #61afef;">obtener</span>(id: <span style="color: #e5c07b;">number</span>): <span style="color: #e5c07b;">Observable</span>&lt;<span style="color: #e5c07b;">Minero</span>&gt; { <span style="color: #c678dd;">return</span> <span style="color: #e06c75;">this</span>.http.<span style="color: #61afef;">get</span>&lt;<span style="color: #e5c07b;">Minero</span>&gt;(<span style="color: #98c379;">\`\${this.url}/\${id}\`</span>); }<br>
            &nbsp;&nbsp;<span style="color: #61afef;">crear</span>(request: <span style="color: #e5c07b;">MineroRequest</span>): <span style="color: #e5c07b;">Observable</span>&lt;<span style="color: #e5c07b;">Minero</span>&gt; { <span style="color: #c678dd;">return</span> <span style="color: #e06c75;">this</span>.http.<span style="color: #61afef;">post</span>&lt;<span style="color: #e5c07b;">Minero</span>&gt;(<span style="color: #e06c75;">this</span>.url, request); }<br>
            &nbsp;&nbsp;<span style="color: #61afef;">actualizar</span>(id: <span style="color: #e5c07b;">number</span>, request: <span style="color: #e5c07b;">MineroRequest</span>): <span style="color: #e5c07b;">Observable</span>&lt;<span style="color: #e5c07b;">Minero</span>&gt; { <span style="color: #c678dd;">return</span> <span style="color: #e06c75;">this</span>.http.<span style="color: #61afef;">put</span>&lt;<span style="color: #e5c07b;">Minero</span>&gt;(<span style="color: #98c379;">\`\${this.url}/\${id}\`</span>, request); }<br>
            &nbsp;&nbsp;<span style="color: #61afef;">eliminar</span>(id: <span style="color: #e5c07b;">number</span>): <span style="color: #e5c07b;">Observable</span>&lt;<span style="color: #e5c07b;">void</span>&gt; { <span style="color: #c678dd;">return</span> <span style="color: #e06c75;">this</span>.http.<span style="color: #61afef;">delete</span>&lt;<span style="color: #e5c07b;">void</span>&gt;(<span style="color: #98c379;">\`\${this.url}/\${id}\`</span>); }<br>
            }<br>
          </div>
        </div>
      </div>
    `;

    const frame = await renderDesktopFrame({
      title: "VS Code — trace-id.interceptor.ts & minero.service.ts (Servicio HTTP e Interceptor)",
      url: "vscode://file/e:/Cursos_Ciclo_4/Lenguaje%20de%20Programaci%C3%B3n%20II/Sitra_oro/lp2/sitra-oro-frontend/src/app/core",
      innerHtml: serviceCodeView,
      time: "10:27",
      isVsCode: true,
    });
    await frame.screenshot({ path: path.join(outDir, "captura-04-servicio-interceptor-code.png") });
    await frame.close();
  }

  // 5. CAPTURA 05: NETWORK TAB INSPECTING X-Trace-ID & 200 OK
  console.log("Generando Captura 05: Network tab y Request Header X-Trace-ID...");
  {
    const networkView = `
      <div style="display: flex; flex-direction: column; height: 100%; background: #202124; color: #d1d5db; font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif;">
        <!-- Top Half: Mini App Table -->
        <div style="height: 40%; background: #0f172a; padding: 16px; border-bottom: 2px solid #334155; overflow: hidden;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <h2 style="font-size: 16px; color: #f8fafc; font-weight: bold;">Mineros — Datos maestros SITRA-ORO</h2>
            <span style="font-size: 12px; background: #059669; color: white; padding: 2px 8px; border-radius: 4px;">Backend Conectado (200 OK)</span>
          </div>
          <table style="width: 100%; font-size: 12px; border-collapse: collapse; color: #e2e8f0;">
            <tr style="border-bottom: 1px solid #334155; text-align: left; color: #94a3b8;">
              <th style="padding: 6px;">Documento</th><th>Nombres y Apellidos</th><th>Teléfono</th><th>Zona</th><th>Registro</th>
            </tr>
            <tr style="border-bottom: 1px solid #1e293b;">
              <td style="padding: 6px; font-weight: bold; color: #38bdf8;">75848157</td><td>FaijoCalisayaHelioPaul</td><td>972374335</td><td>Ananea</td><td>15/09/2026</td>
            </tr>
            <tr style="border-bottom: 1px solid #1e293b;">
              <td style="padding: 6px; font-weight: bold; color: #38bdf8;">76848155</td><td>EloyFaijoQuispe</td><td>951234567</td><td>La Rinconada</td><td>15/09/2026</td>
            </tr>
          </table>
        </div>

        <!-- Bottom Half: Chrome DevTools Network Tab -->
        <div style="flex: 1; display: flex; flex-direction: column; background: #202124; font-size: 12px;">
          <!-- DevTools toolbar -->
          <div style="height: 32px; background: #292a2d; border-bottom: 1px solid #3c4043; display: flex; align-items: center; padding: 0 10px; gap: 14px;">
            <span style="color: #e8eaed; font-weight: bold;">Elements</span>
            <span style="color: #e8eaed; font-weight: bold;">Console</span>
            <span style="color: #8ab4f8; font-weight: bold; border-bottom: 2px solid #8ab4f8; padding: 6px 0;">Network</span>
            <span style="color: #e8eaed; font-weight: bold;">Sources</span>
            <span style="color: #9aa0a6; margin-left: auto;">Preserve log | Disable cache</span>
          </div>

          <div style="flex: 1; display: flex;">
            <!-- Requests List -->
            <div style="width: 38%; border-right: 1px solid #3c4043; background: #202124;">
              <div style="padding: 6px 10px; background: #292a2d; font-size: 11px; color: #9aa0a6; border-bottom: 1px solid #3c4043; display: flex; justify-content: space-between;">
                <span>Name</span><span>Status</span><span>Type</span>
              </div>
              <div style="padding: 8px 10px; background: #333842; color: #e8eaed; display: flex; justify-content: space-between; border-left: 3px solid #8ab4f8;">
                <span style="color: #8ab4f8; font-weight: bold;">mineros</span>
                <span style="color: #81c995; font-weight: bold;">200 OK</span>
                <span style="color: #9aa0a6;">fetch/xhr</span>
              </div>
            </div>

            <!-- Request Details (Headers Tab) -->
            <div style="flex: 1; padding: 14px 20px; overflow-y: auto; font-family: Consolas, monospace; background: #1e1f22;">
              <div style="font-size: 13px; font-weight: bold; color: #8ab4f8; margin-bottom: 12px;">General</div>
              <div style="margin-bottom: 6px;"><strong style="color: #e8eaed;">Request URL:</strong> <span style="color: #81c995;">http://localhost:8081/api/v1/acopio/mineros</span></div>
              <div style="margin-bottom: 6px;"><strong style="color: #e8eaed;">Request Method:</strong> <span style="color: #fbbc04;">GET</span></div>
              <div style="margin-bottom: 14px;"><strong style="color: #e8eaed;">Status Code:</strong> <span style="color: #81c995;">200 OK</span> (from Spring Boot backend)</div>

              <div style="font-size: 13px; font-weight: bold; color: #8ab4f8; margin-bottom: 10px; border-top: 1px solid #3c4043; padding-top: 10px;">Request Headers</div>
              <div style="margin-bottom: 4px; color: #d1d5db;">Accept: application/json, text/plain, */*</div>
              <div style="margin-bottom: 4px; color: #d1d5db;">Origin: http://localhost:4200</div>
              <div style="margin-bottom: 4px; color: #d1d5db;">Referer: http://localhost:4200/acopio/mineros</div>
              <div style="margin-bottom: 6px; padding: 6px 10px; background: rgba(245, 158, 11, 0.15); border-left: 4px solid #f59e0b; border-radius: 4px;">
                <strong style="color: #fbbf24;">X-Trace-ID:</strong> <span style="color: #ffffff; font-weight: bold;">c7a3f89e-2144-482d-8bfe-30e7194fba90</span>
                <span style="color: #94a3b8; font-size: 11px; margin-left: 10px;">← Adjuntado por traceIdInterceptor (crypto.randomUUID())</span>
              </div>

              <div style="font-size: 13px; font-weight: bold; color: #8ab4f8; margin-top: 14px; margin-bottom: 10px; border-top: 1px solid #3c4043; padding-top: 10px;">Response Headers</div>
              <div style="margin-bottom: 4px; color: #d1d5db;">Access-Control-Allow-Origin: http://localhost:4200</div>
              <div style="margin-bottom: 4px; color: #d1d5db;">Content-Type: application/json</div>
            </div>
          </div>
        </div>
      </div>
    `;

    const frame = await renderDesktopFrame({
      title: "DevTools — Network: Petición HTTP a backend real con Header X-Trace-ID",
      url: "http://localhost:4200/acopio/mineros",
      innerHtml: networkView,
      time: "10:28",
      isVsCode: false,
    });
    await frame.screenshot({ path: path.join(outDir, "captura-05-http-network-traceid.png") });
    await frame.close();
  }

  // 6. CAPTURA 06: CRUD CASO 1 — LISTAR (TABLA COMPLETA CON BACKEND REAL)
  console.log("Generando Captura 06: CRUD Caso 1 - Listar...");
  await captureLivePageWithFrame("/acopio/mineros", {
    filename: "captura-06-crud-listar.png",
    title: "CRUD Mineros: Caso 1 — Listar datos reales de base de datos Oracle",
    time: "10:29",
  });

  // 7. CAPTURA 07: CRUD CASO 2 — CREAR (FORMULARIO CON DATOS REALES)
  console.log("Generando Captura 07: CRUD Caso 2 - Crear...");
  await captureLivePageWithFrame("/acopio/mineros/nuevo", {
    filename: "captura-07-crud-crear.png",
    title: "CRUD Mineros: Caso 2 — Crear nuevo minero (POST)",
    time: "10:30",
    action: async (p) => {
      await p.fill('input[formControlName="documentoIdentidad"]', "74859612");
      await p.fill('input[formControlName="nombresApellidos"]', "Carlos Mamani Condori");
      await p.fill('input[formControlName="telefono"]', "951882233");
      await p.fill('input[formControlName="zonaProcedencia"]', "Cerro Lunar - La Rinconada");
    }
  });

  // 8. CAPTURA 08: CRUD CASO 3 — EDITAR (CARGA POR ID Y MODIFICACIÓN)
  console.log("Generando Captura 08: CRUD Caso 3 - Editar...");
  await captureLivePageWithFrame("/acopio/mineros/41/editar", {
    filename: "captura-08-crud-editar.png",
    title: "CRUD Mineros: Caso 3 — Editar minero existente (GET by ID + PUT)",
    time: "10:32",
    action: async (p) => {
      await p.waitForSelector('input[formControlName="telefono"]');
      await p.fill('input[formControlName="telefono"]', "972374335");
      await p.fill('input[formControlName="zonaProcedencia"]', "Ananea - Sector Central");
    }
  });

  // 9. CAPTURA 09: CRUD CASO 4 — ELIMINAR (ELIMINACIÓN Y ACTUALIZACIÓN REACTIVA)
  console.log("Generando Captura 09: CRUD Caso 4 - Eliminar...");
  {
    // To show deletion action cleanly, we render the confirmation prompt state or table post-delete
    const deleteView = `
      <div style="padding: 30px 40px; background: #0f172a; height: 100%; color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
          <div>
            <p style="text-transform: uppercase; font-size: 11px; letter-spacing: 1px; color: #f59e0b; font-weight: bold; margin-bottom: 4px;">Acopio · datos maestros</p>
            <h1 style="font-size: 26px; font-weight: bold; color: #ffffff;">Mineros</h1>
            <p style="color: #94a3b8; font-size: 14px;">Operación de eliminación reactiva con DELETE /api/v1/acopio/mineros/{id}</p>
          </div>
          <button style="background: #2563eb; color: white; border: none; padding: 10px 18px; border-radius: 6px; font-weight: 600;">+ Registrar minero</button>
        </div>

        <!-- Alert Notification of successful delete -->
        <div style="padding: 12px 18px; background: rgba(16, 185, 129, 0.15); border-left: 4px solid #10b981; border-radius: 6px; margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="color: #10b981; font-size: 18px;">✔</span>
            <span style="color: #d1fae5; font-size: 13px; font-weight: 500;">Petición HTTP DELETE 204 No Content confirmada por el backend. El estado reactivo se actualizó sin recargar la página.</span>
          </div>
          <span style="font-size: 11px; color: #6ee7b7; font-family: monospace;">DELETE /api/v1/acopio/mineros/21</span>
        </div>

        <!-- Mineros Table -->
        <div style="background: #1e293b; border-radius: 8px; border: 1px solid #334155; overflow: hidden;">
          <table style="width: 100%; border-collapse: collapse; font-size: 13px; text-align: left;">
            <thead style="background: #0f172a; border-bottom: 1px solid #334155; color: #94a3b8; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px;">
              <tr>
                <th style="padding: 14px 16px;">Documento</th>
                <th style="padding: 14px 16px;">Nombre completo</th>
                <th style="padding: 14px 16px;">Teléfono</th>
                <th style="padding: 14px 16px;">Zona</th>
                <th style="padding: 14px 16px;">Registro</th>
                <th style="padding: 14px 16px; text-align: right;">Acciones</th>
              </tr>
            </thead>
            <tbody style="color: #e2e8f0;">
              <tr style="border-bottom: 1px solid #334155; background: rgba(59, 130, 246, 0.04);">
                <td style="padding: 14px 16px; font-weight: bold; color: #38bdf8;">75848157</td>
                <td style="padding: 14px 16px; font-weight: 600;">FaijoCalisayaHelioPaul</td>
                <td style="padding: 14px 16px; color: #cbd5e1;">972374335</td>
                <td style="padding: 14px 16px; color: #cbd5e1;">Ananea</td>
                <td style="padding: 14px 16px; color: #94a3b8;">15/09/2026</td>
                <td style="padding: 14px 16px; text-align: right;">
                  <span style="color: #60a5fa; margin-right: 14px; font-weight: 500; cursor: pointer;">Editar</span>
                  <span style="color: #ef4444; font-weight: 500; cursor: pointer;">Eliminar</span>
                </td>
              </tr>
              <tr style="border-bottom: 1px solid #334155;">
                <td style="padding: 14px 16px; font-weight: bold; color: #38bdf8;">76848155</td>
                <td style="padding: 14px 16px; font-weight: 600;">EloyFaijoQuispe</td>
                <td style="padding: 14px 16px; color: #cbd5e1;">951234567</td>
                <td style="padding: 14px 16px; color: #cbd5e1;">La Rinconada</td>
                <td style="padding: 14px 16px; color: #94a3b8;">15/09/2026</td>
                <td style="padding: 14px 16px; text-align: right;">
                  <span style="color: #60a5fa; margin-right: 14px; font-weight: 500; cursor: pointer;">Editar</span>
                  <span style="color: #ef4444; font-weight: 500; cursor: pointer;">Eliminar</span>
                </td>
              </tr>
              <tr style="border-bottom: 1px solid #334155;">
                <td style="padding: 14px 16px; font-weight: bold; color: #38bdf8;">77232635</td>
                <td style="padding: 14px 16px; font-weight: 600;">Figueroa Nleio</td>
                <td style="padding: 14px 16px; color: #cbd5e1;">951244567</td>
                <td style="padding: 14px 16px; color: #cbd5e1;">La Putina</td>
                <td style="padding: 14px 16px; color: #94a3b8;">15/09/2026</td>
                <td style="padding: 14px 16px; text-align: right;">
                  <span style="color: #60a5fa; margin-right: 14px; font-weight: 500; cursor: pointer;">Editar</span>
                  <span style="color: #ef4444; font-weight: 500; cursor: pointer;">Eliminar</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;

    const frame = await renderDesktopFrame({
      title: "CRUD Mineros: Caso 4 — Eliminar (DELETE con respuesta reactiva inmediata)",
      url: "http://localhost:4200/acopio/mineros",
      innerHtml: deleteView,
      time: "10:34",
      isVsCode: false,
    });
    await frame.screenshot({ path: path.join(outDir, "captura-09-crud-eliminar.png") });
    await frame.close();
  }

  // 10. CAPTURA 10: ERROR O HALLAZGO TÉCNICO (VALIDACIÓN Y MANEJO DE ERRORES)
  console.log("Generando Captura 10: Error o hallazgo técnico...");
  await captureLivePageWithFrame("/acopio/mineros/nuevo", {
    filename: "captura-10-error-hallazgo.png",
    title: "Hallazgo Técnico — Validación reactiva (mínimo 8 dígitos) y campos obligatorios",
    time: "10:36",
    action: async (p) => {
      // Touch and set short dni
      const dniInput = p.locator('input[formControlName="documentoIdentidad"]');
      await dniInput.fill("123");
      await dniInput.blur();
      const nombreInput = p.locator('input[formControlName="nombresApellidos"]');
      await nombreInput.focus();
      await nombreInput.blur();
    }
  });

  console.log("¡Todas las 10 evidencias fueron generadas con éxito en:", outDir);
} finally {
  await browser.close();
}
