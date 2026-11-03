import { chromium } from "file:///C:/Users/Paul/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import path from "node:path";
import fs from "node:fs";

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  args: ["--use-angle=swiftshader", "--disable-gpu-sandbox"]
});

const toDataUri = (relPath) => {
  const buf = fs.readFileSync(path.resolve(relPath));
  return `data:image/png;base64,${buf.toString("base64")}`;
};

// --------------------------------------------------------------------------
// 1. C1 INDEPENDIENTE: Fila 6 exacta (Figueroa Nelio) y Botón Registrar
// Base: docs/img_S07_CalisayaHelio/captura-06-crud-listar.png (1440x900)
// --------------------------------------------------------------------------
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  const bg = toDataUri("docs/img_S07_CalisayaHelio/captura-06-crud-listar.png");

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { width: 1440px; height: 900px; position: relative; font-family: 'Segoe UI', sans-serif; overflow: hidden; background: #071426; }
      .bg { width: 100%; height: 100%; position: absolute; top: 0; left: 0; image-rendering: auto; }

      /* Botón Registrar Minero: EXACT Bounds [left: 1241px, top: 191px, w: 168px, h: 48px] */
      .box-btn-nuevo {
        position: absolute;
        top: 191px; left: 1241px; width: 168px; height: 48px;
        border: 2px solid #38bdf8;
        border-radius: 6px;
        box-shadow: 0 0 14px rgba(56, 189, 248, 0.45);
        pointer-events: none;
      }
      .badge-btn {
        position: absolute;
        top: 154px; left: 1241px;
        background: rgba(8, 22, 43, 0.95);
        border: 1.5px solid #38bdf8;
        color: #7dd3fc;
        padding: 4px 10px;
        border-radius: 6px;
        font-size: 10.5px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        box-shadow: 0 4px 12px rgba(0,0,0,0.6);
      }

      /* Fila 6 (Figueroa Nelio): EXACT Bounds [left: 264px, top: 577px, w: 1145px, h: 53px] */
      .box-row-figueroa {
        position: absolute;
        top: 576px; left: 264px; width: 1145px; height: 55px;
        border: 2px solid #f2b736;
        border-radius: 6px;
        box-shadow: 0 0 18px rgba(242, 183, 54, 0.5);
        pointer-events: none;
      }
      /* Etiqueta situada limpiamente en el margen inferior, SIN tapar la fila 5 ni la fila 7 */
      .badge-row {
        position: absolute;
        top: 642px; left: 264px;
        background: rgba(8, 22, 43, 0.95);
        border: 1.5px solid #f2b736;
        color: #f8cf76;
        padding: 5px 14px;
        border-radius: 6px;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        box-shadow: 0 4px 14px rgba(0,0,0,0.6);
      }

      /* Badge informativo inferior */
      .footer-badge {
        position: absolute;
        bottom: 22px; right: 35px;
        background: rgba(7, 20, 38, 0.95);
        border: 1px solid rgba(139, 178, 225, 0.3);
        border-left: 3px solid #10b981;
        padding: 7px 16px;
        border-radius: 6px;
        color: #dce7f5;
        font-size: 11px;
        font-weight: 600;
        display: flex;
        gap: 12px;
        align-items: center;
        box-shadow: 0 6px 18px rgba(0,0,0,0.5);
      }
      .footer-badge code { color: #f2b736; font-weight: 700; }
    </style>
  </head>
  <body>
    <img class="bg" src="${bg}" />

    <div class="box-btn-nuevo"></div>
    <div class="badge-btn">ALTA DE MINERO ARTESANAL</div>

    <div class="box-row-figueroa"></div>
    <div class="badge-row">FILA REGISTRADA: FIGUEROA NELIO · DNI 77232635 · CERRO LUNAR - LA RINCONADA</div>

    <div class="footer-badge">
      <span>C1 · CRUD INDEPENDIENTE: <code>minero-list.ts</code></span>
      <span>|</span>
      <span>ESTADO: <b style="color:#10b981;">ACTIVO</b></span>
      <span>|</span>
      <span>ENTIDAD MAESTRA PERSISTIDA</span>
    </div>
  </body>
  </html>
  `;

  await page.setContent(html);
  await page.screenshot({ path: "docs/presentacion/lp_u02/assets/evidencia_acopiador_c1_mineros.png" });
  await page.close();
  console.log("Polished evidencia_acopiador_c1_mineros.png");
}

// --------------------------------------------------------------------------
// 2. C2 DEPENDIENTE: Inputs exactos (DNI y Zona) + Botón Guardar
// Base: docs/img_S07_CalisayaHelio/captura-07-crud-crear.png (1440x900)
// --------------------------------------------------------------------------
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  const bg = toDataUri("docs/img_S07_CalisayaHelio/captura-07-crud-crear.png");

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { width: 1440px; height: 900px; position: relative; font-family: 'Segoe UI', sans-serif; overflow: hidden; background: #071426; }
      .bg { width: 100%; height: 100%; position: absolute; top: 0; left: 0; image-rendering: auto; }

      /* Input 1 (DNI): EXACT Bounds [left: 273px, top: 197px, w: 290px, h: 64px] */
      .box-dni {
        position: absolute;
        top: 197px; left: 273px; width: 290px; height: 64px;
        border: 2px solid #38bdf8;
        border-radius: 6px;
        box-shadow: 0 0 14px rgba(56, 189, 248, 0.45);
        pointer-events: none;
      }
      .badge-dni {
        position: absolute;
        top: 207px; left: 585px;
        background: rgba(8, 22, 43, 0.95);
        border: 1.5px solid #38bdf8;
        color: #7dd3fc;
        padding: 6px 14px;
        border-radius: 6px;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        box-shadow: 0 4px 12px rgba(0,0,0,0.6);
      }

      /* Input 4 (Zona): EXACT Bounds [left: 273px, top: 481px, w: 290px, h: 64px] */
      .box-zona {
        position: absolute;
        top: 481px; left: 273px; width: 290px; height: 64px;
        border: 2px solid #f2b736;
        border-radius: 6px;
        box-shadow: 0 0 16px rgba(242, 183, 54, 0.5);
        pointer-events: none;
      }
      .badge-zona {
        position: absolute;
        top: 491px; left: 585px;
        background: rgba(8, 22, 43, 0.95);
        border: 1.5px solid #f2b736;
        color: #f8cf76;
        padding: 6px 14px;
        border-radius: 6px;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        box-shadow: 0 4px 12px rgba(0,0,0,0.6);
      }

      /* Botón Guardar: EXACT Bounds [left: 269px, top: 564px, w: 100px, h: 42px] */
      .box-guardar {
        position: absolute;
        top: 564px; left: 269px; width: 100px; height: 42px;
        border: 2px solid #10b981;
        border-radius: 6px;
        box-shadow: 0 0 14px rgba(16, 185, 129, 0.45);
        pointer-events: none;
      }
      .badge-guardar {
        position: absolute;
        top: 569px; left: 390px;
        background: rgba(8, 22, 43, 0.95);
        border: 1.5px solid #10b981;
        color: #86efac;
        padding: 5px 12px;
        border-radius: 6px;
        font-size: 10.5px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        box-shadow: 0 4px 12px rgba(0,0,0,0.6);
      }

      /* Footer Badge */
      .footer-badge {
        position: absolute;
        bottom: 22px; right: 35px;
        background: rgba(7, 20, 38, 0.95);
        border: 1px solid rgba(139, 178, 225, 0.3);
        border-left: 3px solid #f2b736;
        padding: 7px 16px;
        border-radius: 6px;
        color: #dce7f5;
        font-size: 11px;
        font-weight: 600;
        display: flex;
        gap: 12px;
        align-items: center;
        box-shadow: 0 6px 18px rgba(0,0,0,0.5);
      }
      .footer-badge code { color: #38bdf8; font-weight: 700; }
    </style>
  </head>
  <body>
    <img class="bg" src="${bg}" />

    <div class="box-dni"></div>
    <div class="badge-dni">VALIDACIÓN DNI (8-15) + AUTOCOMPLETADO RENIEC</div>

    <div class="box-zona"></div>
    <div class="badge-zona">INTEGRIDAD REFERENCIAL FK · ZONA: CERRO LUNAR</div>

    <div class="box-guardar"></div>
    <div class="badge-guardar">PERSISTENCIA REACTIVA EN ORACLE</div>

    <div class="footer-badge">
      <span>C2 · CRUD DEPENDIENTE: <code>minero-form.ts</code></span>
      <span>|</span>
      <span>VÍNCULO FORÁNEO: <b>MINERO ↔ ZONA TERRITORIAL</b></span>
    </div>
  </body>
  </html>
  `;

  await page.setContent(html);
  await page.screenshot({ path: "docs/presentacion/lp_u02/assets/evidencia_acopiador_c2_dependiente.png" });
  await page.close();
  console.log("Polished evidencia_acopiador_c2_dependiente.png");
}

// --------------------------------------------------------------------------
// 3. C3 TRANSACCIONAL: Tarjetas Minero, Transacción G2 y Stock
// Base: docs/presentacion/s06/imagenes/04_acopio_g2.png (1920x1080)
// --------------------------------------------------------------------------
{
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 2 });
  const bg = toDataUri("docs/presentacion/s06/imagenes/04_acopio_g2.png");

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { width: 1920px; height: 1080px; position: relative; font-family: 'Segoe UI', sans-serif; overflow: hidden; background: #020b19; }
      .bg { width: 100%; height: 100%; position: absolute; top: 0; left: 0; image-rendering: auto; }

      /* Tarjeta Minero (Origen): EXACT Bounds [left: 824px, top: 267px, w: 252px, h: 145px] */
      .box-minero {
        position: absolute;
        top: 267px; left: 824px; width: 252px; height: 145px;
        border: 2px solid #f2b736;
        border-radius: 12px;
        box-shadow: 0 0 20px rgba(242, 183, 54, 0.45);
        pointer-events: none;
      }
      .badge-minero {
        position: absolute;
        top: 226px; left: 824px;
        background: rgba(8, 22, 43, 0.95);
        border: 1.5px solid #f2b736;
        color: #f8cf76;
        padding: 5px 12px;
        border-radius: 6px;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        box-shadow: 0 4px 12px rgba(0,0,0,0.6);
      }

      /* Tarjeta Transacción G2: EXACT Bounds [left: 1400px, top: 267px, w: 395px, h: 150px] */
      .box-trans {
        position: absolute;
        top: 267px; left: 1400px; width: 395px; height: 150px;
        border: 2px solid #38bdf8;
        border-radius: 12px;
        box-shadow: 0 0 20px rgba(56, 189, 248, 0.45);
        pointer-events: none;
      }
      .badge-trans {
        position: absolute;
        top: 226px; left: 1400px;
        background: rgba(8, 22, 43, 0.95);
        border: 1.5px solid #38bdf8;
        color: #7dd3fc;
        padding: 5px 12px;
        border-radius: 6px;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        box-shadow: 0 4px 12px rgba(0,0,0,0.6);
      }

      /* Stock ROJO & VERDE: EXACT Bounds [left: 824px, top: 589px, w: 972px, h: 282px] */
      .box-stock {
        position: absolute;
        top: 589px; left: 824px; width: 972px; height: 282px;
        border: 2px solid #10b981;
        border-radius: 14px;
        box-shadow: 0 0 22px rgba(16, 185, 129, 0.4);
        pointer-events: none;
      }
      .badge-stock {
        position: absolute;
        top: 548px; left: 824px;
        background: rgba(8, 22, 43, 0.95);
        border: 1.5px solid #10b981;
        color: #86efac;
        padding: 5px 14px;
        border-radius: 6px;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        box-shadow: 0 4px 12px rgba(0,0,0,0.6);
      }

      /* Callout banner en margen superior sin tapar datos */
      .side-badge {
        position: absolute;
        top: 100px; right: 54px;
        background: rgba(7, 20, 38, 0.95);
        border: 1px solid rgba(139, 178, 225, 0.3);
        border-left: 3px solid #f2b736;
        padding: 8px 18px;
        border-radius: 6px;
        color: #dce7f5;
        font-size: 12px;
        font-weight: 600;
        display: flex;
        gap: 12px;
        align-items: center;
        box-shadow: 0 6px 18px rgba(0,0,0,0.5);
      }
      .side-badge code { color: #f2b736; font-weight: 700; }
    </style>
  </head>
  <body>
    <img class="bg" src="${bg}" />

    <div class="side-badge">
      <span>C3 · CABECERA–DETALLE: <code>operaciones.ts</code></span>
      <span>|</span>
      <span>ATOMICIDAD: <b>@Transactional</b></span>
      <span>|</span>
      <span>RELACIÓN: <b>1 : N (MINERO ↔ LOTES)</b></span>
    </div>

    <div class="box-minero"></div>
    <div class="badge-minero">CABECERA · MINERO ARTESANAL (1)</div>

    <div class="box-trans"></div>
    <div class="badge-trans">DETALLE TRANSACCIONAL · LOTES ORO ROJO / VERDE (N)</div>

    <div class="box-stock"></div>
    <div class="badge-stock">ACUMULACIÓN Y CONTROL DE STOCK POR COLOR</div>
  </body>
  </html>
  `;

  await page.setContent(html);
  await page.screenshot({ path: "docs/presentacion/lp_u02/assets/evidencia_acopiador_c3_transaccional.png" });
  await page.close();
  console.log("Polished evidencia_acopiador_c3_transaccional.png");
}

// --------------------------------------------------------------------------
// 4. C3 REPORTES: Métricas Agregadas y Tests Unitarios
// Base: docs/presentacion/s06/imagenes/07_evidencias.png (1920x1080)
// --------------------------------------------------------------------------
{
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 2 });
  const bg = toDataUri("docs/presentacion/s06/imagenes/07_evidencias.png");

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { width: 1920px; height: 1080px; position: relative; font-family: 'Segoe UI', sans-serif; overflow: hidden; background: #020b19; }
      .bg { width: 100%; height: 100%; position: absolute; top: 0; left: 0; image-rendering: auto; }

      /* Tarjetas de Métricas Agregadas: EXACT Bounds [left: 785px, top: 598px, w: 980px, h: 160px] */
      .box-metrics {
        position: absolute;
        top: 598px; left: 785px; width: 980px; height: 160px;
        border: 2px solid #f2b736;
        border-radius: 12px;
        box-shadow: 0 0 20px rgba(242, 183, 54, 0.45);
        pointer-events: none;
      }
      .badge-metrics {
        position: absolute;
        top: 558px; left: 785px;
        background: rgba(8, 22, 43, 0.95);
        border: 1.5px solid #f2b736;
        color: #f8cf76;
        padding: 5px 14px;
        border-radius: 6px;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        box-shadow: 0 4px 12px rgba(0,0,0,0.6);
      }

      /* Comprobaciones Técnicas: EXACT Bounds [left: 785px, top: 768px, w: 980px, h: 140px] */
      .box-checks {
        position: absolute;
        top: 768px; left: 785px; width: 980px; height: 140px;
        border: 2px solid #10b981;
        border-radius: 12px;
        box-shadow: 0 0 18px rgba(16, 185, 129, 0.4);
        pointer-events: none;
      }
      .badge-checks {
        position: absolute;
        top: 776px; right: 170px;
        background: rgba(8, 22, 43, 0.95);
        border: 1.5px solid #10b981;
        color: #86efac;
        padding: 4px 12px;
        border-radius: 6px;
        font-size: 10.5px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        box-shadow: 0 4px 12px rgba(0,0,0,0.6);
      }

      /* Header Badge */
      .header-badge {
        position: absolute;
        top: 100px; right: 54px;
        background: rgba(7, 20, 38, 0.95);
        border: 1px solid rgba(139, 178, 225, 0.3);
        border-left: 3px solid #38bdf8;
        padding: 8px 18px;
        border-radius: 6px;
        color: #dce7f5;
        font-size: 12px;
        font-weight: 600;
        display: flex;
        gap: 12px;
        align-items: center;
        box-shadow: 0 6px 18px rgba(0,0,0,0.5);
      }
      .header-badge code { color: #38bdf8; font-weight: 700; }
    </style>
  </head>
  <body>
    <img class="bg" src="${bg}" />

    <div class="header-badge">
      <span>C3 · REPORTES: <code>entregas-recibidas.ts</code></span>
      <span>|</span>
      <span>FILTROS: <b>ESTADO / FECHAS</b></span>
      <span>|</span>
      <span>BACKEND: <b>ORACLE XE 21</b></span>
    </div>

    <div class="box-metrics"></div>
    <div class="badge-metrics">REPORTE AGREGADO: 4 LIQUIDACIONES · TOTAL S/ 81,313.80 · TICKET S/ 20,328.45</div>

    <div class="box-checks"></div>
    <div class="badge-checks">INTEGRIDAD COMPROBADA: 29 TESTS UNITARIOS MAVEN</div>
  </body>
  </html>
  `;

  await page.setContent(html);
  await page.screenshot({ path: "docs/presentacion/lp_u02/assets/evidencia_acopiador_c3_reportes.png" });
  await page.close();
  console.log("Polished evidencia_acopiador_c3_reportes.png");
}

// --------------------------------------------------------------------------
// 5. C4 & C5 SEGURIDAD: DevTools en Panel Inferior (y: 396 a 900)
// Base: docs/img_S07_CalisayaHelio/captura-05-http-network-traceid.png (1440x900)
// --------------------------------------------------------------------------
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  const bg = toDataUri("docs/img_S07_CalisayaHelio/captura-05-http-network-traceid.png");

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { width: 1440px; height: 900px; position: relative; font-family: 'Segoe UI', sans-serif; overflow: hidden; background: #071426; }
      .bg { width: 100%; height: 100%; position: absolute; top: 0; left: 0; image-rendering: auto; }

      /* Box 1 (General: Request URL + Status 200 OK): EXACT Bounds [left: 585px, top: 440px, w: 810px, h: 68px] */
      .box-endpoint {
        position: absolute;
        top: 440px; left: 585px; width: 810px; height: 68px;
        border: 2px solid #10b981;
        border-radius: 6px;
        box-shadow: 0 0 16px rgba(16, 185, 129, 0.45);
        pointer-events: none;
      }
      .badge-endpoint {
        position: absolute;
        top: 406px; left: 585px;
        background: rgba(8, 22, 43, 0.95);
        border: 1.5px solid #10b981;
        color: #86efac;
        padding: 4px 12px;
        border-radius: 6px;
        font-size: 10.5px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        box-shadow: 0 4px 12px rgba(0,0,0,0.6);
      }

      /* Box 2 (Request Headers: Bearer JWT + X-Trace-ID): EXACT Bounds [left: 585px, top: 660px, w: 810px, h: 75px] */
      .box-headers {
        position: absolute;
        top: 660px; left: 585px; width: 810px; height: 75px;
        border: 2px solid #38bdf8;
        border-radius: 6px;
        box-shadow: 0 0 16px rgba(56, 189, 248, 0.45);
        pointer-events: none;
      }
      .badge-headers {
        position: absolute;
        top: 624px; left: 585px;
        background: rgba(8, 22, 43, 0.95);
        border: 1.5px solid #38bdf8;
        color: #7dd3fc;
        padding: 4px 12px;
        border-radius: 6px;
        font-size: 10.5px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        box-shadow: 0 4px 12px rgba(0,0,0,0.6);
      }

      /* Footer Badge en el margen inferior de DevTools */
      .footer-badge {
        position: absolute;
        bottom: 18px; right: 45px;
        background: rgba(7, 20, 38, 0.95);
        border: 1px solid rgba(139, 178, 225, 0.3);
        border-left: 3px solid #10b981;
        padding: 7px 15px;
        border-radius: 6px;
        color: #dce7f5;
        font-size: 11px;
        font-weight: 600;
        display: flex;
        gap: 12px;
        align-items: center;
        box-shadow: 0 6px 18px rgba(0,0,0,0.5);
      }
      .footer-badge code { color: #10b981; font-weight: 700; }
    </style>
  </head>
  <body>
    <img class="bg" src="${bg}" />

    <div class="box-endpoint"></div>
    <div class="badge-endpoint">PETICIÓN AUTORIZADA · STATUS 200 OK · PORT :8081</div>

    <div class="box-headers"></div>
    <div class="badge-headers">KEYCLOAK 26 JWT BEARER + DISTRIBUTED X-TRACE-ID</div>

    <div class="footer-badge">
      <span>C4/C5 · SEGURIDAD: <code>auth.interceptor.ts · SecurityConfig.java</code></span>
      <span>|</span>
      <span>ROL AUTORIZADO: <b>ACOPIADOR</b></span>
      <span>|</span>
      <span>KEYCLOAK PORT: <b>:38081</b></span>
    </div>
  </body>
  </html>
  `;

  await page.setContent(html);
  await page.screenshot({ path: "docs/presentacion/lp_u02/assets/evidencia_acopiador_c4_c5_seguridad.png" });
  await page.close();
  console.log("Polished evidencia_acopiador_c4_c5_seguridad.png");
}

await browser.close();
console.log("All 5 Acopiador evidence polished with pixel-perfect coordinates!");
