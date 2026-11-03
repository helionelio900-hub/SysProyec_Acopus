import { chromium } from "file:///C:/Users/Paul/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import path from "node:path";

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  args: ["--use-angle=swiftshader", "--disable-gpu-sandbox"]
});

const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2
});

const fileUrl = "file:///" + path.resolve("docs/presentacion/lp_u02/07_modulo_acopiador.html").replace(/\\/g, "/");
await page.goto(fileUrl);
await page.waitForTimeout(500);

// 1. Capture initial state (C1)
await page.screenshot({ path: "docs/presentacion/lp_u02/07_interactive_c1_preview.png" });
console.log("C1 preview saved!");

// 2. Click C2
await page.click('button[data-target="c2"]');
await page.waitForTimeout(300);
await page.screenshot({ path: "docs/presentacion/lp_u02/07_interactive_c2_preview.png" });
console.log("C2 preview saved!");

// 3. Click C3 Transaccional
await page.click('button[data-target="c3_trans"]');
await page.waitForTimeout(300);
await page.screenshot({ path: "docs/presentacion/lp_u02/07_interactive_c3_trans_preview.png" });
console.log("C3 Trans preview saved!");

// 4. Click C3 Reportes
await page.click('button[data-target="c3_rep"]');
await page.waitForTimeout(300);
await page.screenshot({ path: "docs/presentacion/lp_u02/07_interactive_c3_rep_preview.png" });
console.log("C3 Rep preview saved!");

// 5. Click C4/C5 Seguridad
await page.click('button[data-target="c4_c5"]');
await page.waitForTimeout(300);
await page.screenshot({ path: "docs/presentacion/lp_u02/07_interactive_c4_preview.png" });
console.log("C4/C5 preview saved!");

// 6. Test Zoom Modal
await page.click("#viewerImage");
await page.waitForTimeout(300);
await page.screenshot({ path: "docs/presentacion/lp_u02/07_modal_zoom_preview.png" });
console.log("Modal zoom preview saved!");

await browser.close();
console.log("All Acopiador slide tests completed successfully!");
