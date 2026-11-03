import { chromium } from "file:///C:/Users/Paul/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import path from "node:path";
import fs from "node:fs";

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  args: ["--use-angle=swiftshader", "--disable-gpu-sandbox"]
});

const page = await browser.newPage({ viewport: { width: 1024, height: 594 }, deviceScaleFactor: 2 });

const baseImgBuffer = fs.readFileSync(path.resolve("docs/presentacion/lp_u02/assets/evidencia_c1_centros_faijo.png"));
const baseImgUrl = `data:image/png;base64,${baseImgBuffer.toString("base64")}`;

// --------------------------------------------------------------------------
// 1. C1 IMAGE (CRUD Independiente: FaijoCorporacion S.A.C + Alta)
// --------------------------------------------------------------------------
const htmlC1 = `
<!DOCTYPE html>
<html>
<head>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { width: 1024px; height: 594px; position: relative; font-family: 'Segoe UI', sans-serif; overflow: hidden; background: #ffffff; }
    .bg {
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
      /* Suavizado bicúbico natural sin pixelación forzada */
      image-rendering: auto;
    }
    
    /* Highlight Alert: Se creó FaijoCorporacion S.A.C. */
    .box-alert {
      position: absolute;
      top: 136px; left: 64px; width: 932px; height: 38px;
      border: 2px solid #f2b736;
      border-radius: 6px;
      box-shadow: 0 0 12px rgba(242, 183, 54, 0.45);
      pointer-events: none;
    }
    .badge-alert {
      position: absolute;
      top: 7px; right: 12px;
      background: #f2b736; color: #020b19;
      font-weight: 800; font-size: 10.5px; padding: 2.5px 8px; border-radius: 4px;
      letter-spacing: .05em; text-transform: uppercase;
      box-shadow: 0 2px 6px rgba(0,0,0,0.15);
    }

    /* Highlight Row: FaijoCorporacion S.A.C. Activo */
    .box-row {
      position: absolute;
      top: 524px; left: 64px; width: 932px; height: 33px;
      border: 2px solid #10b981;
      border-radius: 6px;
      box-shadow: 0 0 12px rgba(16, 185, 129, 0.5);
      pointer-events: none;
    }
    .badge-row {
      position: absolute;
      bottom: -21px; left: 12px;
      background: #10b981; color: #020b19;
      font-weight: 800; font-size: 10px; padding: 2px 8px; border-radius: 4px;
      letter-spacing: .05em; text-transform: uppercase;
      box-shadow: 0 2px 6px rgba(0,0,0,0.15);
    }
  </style>
</head>
<body>
  <img class="bg" src="${baseImgUrl}">

  <div class="box-alert">
    <span class="badge-alert">C1 &middot; ALTA CONFIRMADA</span>
  </div>
  <div class="box-row">
    <span class="badge-row">C1 &middot; FAIJOCORPORACION S.A.C. REGISTRADA (ACTIVO)</span>
  </div>
</body>
</html>
`;

await page.setContent(htmlC1);
await page.waitForTimeout(300);
await page.screenshot({ path: "docs/presentacion/lp_u02/assets/evidencia_c1_independiente.png" });

// --------------------------------------------------------------------------
// 2. C2 IMAGE (CRUD Dependiente: Zona La Rinconada + Cuenta Acopiador)
// --------------------------------------------------------------------------
const htmlC2 = `
<!DOCTYPE html>
<html>
<head>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { width: 1024px; height: 594px; position: relative; font-family: 'Segoe UI', sans-serif; overflow: hidden; background: #ffffff; }
    .bg {
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
      image-rendering: auto;
    }
    
    /* Highlight Columna ZONA */
    .box-zona {
      position: absolute;
      top: 366px; left: 342px; width: 118px; height: 195px;
      border: 2px solid #38bdf8;
      border-radius: 8px;
      box-shadow: 0 0 12px rgba(56, 189, 248, 0.45);
      pointer-events: none;
    }
    .badge-zona {
      position: absolute;
      bottom: -22px; left: 50%; transform: translateX(-50%);
      background: #38bdf8; color: #020b19;
      font-weight: 800; font-size: 10px; padding: 2px 7px; border-radius: 4px;
      letter-spacing: .05em; text-transform: uppercase;
      box-shadow: 0 2px 6px rgba(0,0,0,0.15);
      white-space: nowrap;
    }

    /* Highlight Columna ACOPIADOR CUENTA */
    .box-cuenta {
      position: absolute;
      top: 366px; left: 476px; width: 154px; height: 195px;
      border: 2px solid #f2b736;
      border-radius: 8px;
      box-shadow: 0 0 12px rgba(242, 183, 54, 0.45);
      pointer-events: none;
    }
    .badge-cuenta {
      position: absolute;
      bottom: -22px; left: 50%; transform: translateX(-50%);
      background: #f2b736; color: #020b19;
      font-weight: 800; font-size: 10px; padding: 2px 7px; border-radius: 4px;
      letter-spacing: .05em; text-transform: uppercase;
      box-shadow: 0 2px 6px rgba(0,0,0,0.15);
      white-space: nowrap;
    }
  </style>
</head>
<body>
  <img class="bg" src="${baseImgUrl}">

  <div class="box-zona">
    <span class="badge-zona">C2 &middot; FK: ZONA</span>
  </div>
  <div class="box-cuenta">
    <span class="badge-cuenta">C2 &middot; FK: CUENTA VINCULADA</span>
  </div>
</body>
</html>
`;

await page.setContent(htmlC2);
await page.waitForTimeout(300);
await page.screenshot({ path: "docs/presentacion/lp_u02/assets/evidencia_c2_dependiente.png" });

await browser.close();
console.log("Smooth C1 and C2 regenerated.");
