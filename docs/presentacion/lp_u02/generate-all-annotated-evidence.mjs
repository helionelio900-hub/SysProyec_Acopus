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
// 1. C3 TRANSACCIONAL: Cabecera - Detalle (Ley 95.5%, Merma, S/ 3742.40)
// --------------------------------------------------------------------------
{
  const page = await browser.newPage({ viewport: { width: 1024, height: 481 }, deviceScaleFactor: 2 });
  const bg = toDataUri("docs/presentacion/lp_u02/assets/evidencia_c3_recepcion_ley.png");

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { width: 1024px; height: 481px; position: relative; font-family: 'Segoe UI', sans-serif; overflow: hidden; background: #ffffff; }
      .bg {
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
        image-rendering: auto;
      }

      /* 1. Cabecera Box */
      .box-head {
        position: absolute;
        top: 86px; left: 24px; width: 330px; height: 52px;
        border: 2px solid #38bdf8;
        border-radius: 6px;
        box-shadow: 0 0 12px rgba(56, 189, 248, 0.4);
        pointer-events: none;
      }
      .badge-head {
        position: absolute;
        top: 88px; left: 365px;
        background: #38bdf8; color: #020b19;
        font-weight: 800; font-size: 10px; padding: 3px 8px; border-radius: 4px;
        letter-spacing: .05em; text-transform: uppercase;
        box-shadow: 0 2px 6px rgba(0,0,0,0.15);
      }

      /* 2. Detalle Box */
      .box-detail {
        position: absolute;
        top: 226px; left: 24px; width: 974px; height: 46px;
        border: 2px solid #f2b736;
        border-radius: 6px;
        box-shadow: 0 0 12px rgba(242, 183, 54, 0.4);
        pointer-events: none;
      }
      .badge-detail {
        position: absolute;
        top: 286px; left: 172px;
        background: #f2b736; color: #020b19;
        font-weight: 800; font-size: 10.5px; padding: 3px 10px; border-radius: 4px;
        letter-spacing: .05em; text-transform: uppercase;
        box-shadow: 0 2px 6px rgba(0,0,0,0.15);
      }

      /* 3. Total Liquidado Box */
      .box-total {
        position: absolute;
        top: 338px; left: 624px; width: 366px; height: 76px;
        border: 2px solid #10b981;
        border-radius: 8px;
        box-shadow: 0 0 12px rgba(16, 185, 129, 0.4);
        pointer-events: none;
      }
      .badge-total {
        position: absolute;
        bottom: -11px; right: 16px;
        background: #10b981; color: #020b19;
        font-weight: 800; font-size: 10px; padding: 2px 8px; border-radius: 4px;
        letter-spacing: .05em; text-transform: uppercase;
        box-shadow: 0 2px 6px rgba(0,0,0,0.15);
      }
    </style>
  </head>
  <body>
    <img class="bg" src="${bg}" />

    <!-- 1. Cabecera -->
    <div class="box-head"></div>
    <span class="badge-head">1. CABECERA &middot; COMPRA DIRECTA</span>

    <!-- 2. Detalle -->
    <div class="box-detail"></div>
    <span class="badge-detail">2. DETALLE &middot; 10.5g BRUTO &rarr; 10.0g NETO &middot; LEY 95.5%</span>

    <!-- 3. Total -->
    <div class="box-total">
      <span class="badge-total">3. TOTAL CALCULADO &middot; S/ 3,742.40</span>
    </div>
  </body>
  </html>
  `;

  await page.setContent(html);
  await page.waitForTimeout(300);
  await page.screenshot({ path: "docs/presentacion/lp_u02/assets/evidencia_c3_transaccional_annotated.png" });
  console.log("Smooth C3 Transaccional regenerated.");
  await page.close();
}

// --------------------------------------------------------------------------
// 2. C3 REPORTES: Resumen y Comprobante Fiscal #161
// --------------------------------------------------------------------------
{
  const page = await browser.newPage({ viewport: { width: 1024, height: 401 }, deviceScaleFactor: 2 });
  const bg = toDataUri("docs/presentacion/lp_u02/assets/evidencia_c3_reporte_161.png");

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { width: 1024px; height: 401px; position: relative; font-family: 'Segoe UI', sans-serif; overflow: hidden; background: #ffffff; }
      .bg {
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
        image-rendering: auto;
      }

      /* KPI Metrics Box */
      .box-metrics {
        position: absolute;
        top: 230px; left: 32px; width: 960px; height: 96px;
        border: 2px solid #38bdf8;
        border-radius: 8px;
        box-shadow: 0 0 12px rgba(56, 189, 248, 0.4);
        pointer-events: none;
      }
      .badge-metrics {
        position: absolute;
        top: 206px; right: 36px;
        background: #38bdf8; color: #020b19;
        font-weight: 800; font-size: 10px; padding: 3px 8px; border-radius: 4px;
        letter-spacing: .05em; text-transform: uppercase;
        box-shadow: 0 2px 6px rgba(0,0,0,0.15);
      }

      /* Row Operación #161 */
      .box-op {
        position: absolute;
        top: 364px; left: 32px; width: 960px; height: 32px;
        border: 2px solid #10b981;
        border-radius: 6px;
        box-shadow: 0 0 12px rgba(16, 185, 129, 0.4);
        pointer-events: none;
      }
      .badge-op {
        position: absolute;
        top: 340px; right: 36px;
        background: #10b981; color: #020b19;
        font-weight: 800; font-size: 10px; padding: 3px 8px; border-radius: 4px;
        letter-spacing: .05em; text-transform: uppercase;
        box-shadow: 0 2px 6px rgba(0,0,0,0.15);
      }
    </style>
  </head>
  <body>
    <img class="bg" src="${bg}" />

    <!-- Indicadores -->
    <div class="box-metrics"></div>
    <span class="badge-metrics">TOTALES ACUMULADOS &middot; LIBRO MAYOR</span>

    <!-- Operación 161 -->
    <div class="box-op"></div>
    <span class="badge-op">OPERACIÓN #161 FISCALIZADA &middot; S/ 3,742.40</span>
  </body>
  </html>
  `;

  await page.setContent(html);
  await page.waitForTimeout(300);
  await page.screenshot({ path: "docs/presentacion/lp_u02/assets/evidencia_c3_reporte_annotated.png" });
  console.log("Smooth C3 Reporte regenerated.");
  await page.close();
}

// --------------------------------------------------------------------------
// 3. C4 & C5 SEGURIDAD: Spring Boot :8081 + Keycloak :38081 PKCE
// --------------------------------------------------------------------------
{
  const page = await browser.newPage({ viewport: { width: 1024, height: 578 }, deviceScaleFactor: 2 });
  const bg = toDataUri("docs/img_S11_FaijoCalisaya/fig2_interceptor_centros_200.png");

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { width: 1024px; height: 578px; position: relative; font-family: 'Segoe UI', sans-serif; overflow: hidden; background: #020b19; }
      .bg {
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
        image-rendering: auto;
      }

      /* Line Spring Boot 8081 */
      .box-backend {
        position: absolute;
        top: 485px; left: 2px; width: 630px; height: 18px;
        border: 1.5px solid #10b981;
        border-radius: 3px;
        box-shadow: 0 0 10px rgba(16, 185, 129, 0.4);
        pointer-events: none;
      }

      /* Line Keycloak 38081 token */
      .box-keycloak {
        position: absolute;
        top: 535px; left: 2px; width: 630px; height: 18px;
        border: 1.5px solid #f2b736;
        border-radius: 3px;
        box-shadow: 0 0 10px rgba(242, 183, 54, 0.4);
        pointer-events: none;
      }

      /* Panel derecho Headers */
      .box-headers {
        position: absolute;
        top: 472px; left: 654px; width: 360px; height: 95px;
        border: 2px solid #10b981;
        border-radius: 6px;
        box-shadow: 0 0 12px rgba(16, 185, 129, 0.4);
        pointer-events: none;
      }
      .badge-headers {
        position: absolute;
        top: 448px; left: 654px;
        background: #10b981; color: #020b19;
        font-weight: 800; font-size: 10px; padding: 2px 7px; border-radius: 4px;
        letter-spacing: .05em; text-transform: uppercase;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      }
      .badge-top-net {
        position: absolute;
        top: 456px; left: 180px;
        background: rgba(2, 11, 25, 0.9);
        border: 1px solid rgba(56, 189, 248, 0.4);
        color: #38bdf8;
        font-weight: 700; font-size: 10px; padding: 2px 8px; border-radius: 4px;
      }
    </style>
  </head>
  <body>
    <img class="bg" src="${bg}" />

    <!-- Backend 8081 -->
    <div class="box-backend"></div>

    <!-- Keycloak 38081 -->
    <div class="box-keycloak"></div>
    <span class="badge-top-net">TRAZA RED: :8081 CENTROS (200 OK) + :38081 TOKEN JWT</span>

    <!-- Headers Panel -->
    <div class="box-headers"></div>
    <span class="badge-headers">AUTORIZADO &middot; STATUS 200 OK</span>
  </body>
  </html>
  `;

  await page.setContent(html);
  await page.waitForTimeout(300);
  await page.screenshot({ path: "docs/presentacion/lp_u02/assets/evidencia_c4_c5_seguridad_annotated.png" });
  console.log("Smooth C4/C5 Seguridad regenerated.");
  await page.close();
}

await browser.close();
console.log("All evidence cleanly and smoothly regenerated!");
