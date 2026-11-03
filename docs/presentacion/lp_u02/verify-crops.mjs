import { chromium } from "file:///C:/Users/Paul/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import path from "node:path";

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  args: ["--use-angle=swiftshader", "--disable-gpu-sandbox"]
});

const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

// Inspect C2 form fields
await page.goto("file:///" + path.resolve("debug_grid_c2.png").replace(/\\/g, "/"));
// Field 1 (DNI): y ~ 180 to 270
await page.screenshot({ path: "docs/presentacion/lp_u02/assets/crop_c2_field1.png", clip: { x: 250, y: 180, width: 600, height: 100 } });
// Field 4 (Zona): y ~ 460 to 560
await page.screenshot({ path: "docs/presentacion/lp_u02/assets/crop_c2_field4.png", clip: { x: 250, y: 460, width: 600, height: 100 } });
// Buttons: y ~ 550 to 650
await page.screenshot({ path: "docs/presentacion/lp_u02/assets/crop_c2_btn.png", clip: { x: 250, y: 550, width: 400, height: 100 } });

// Inspect C4 DevTools
await page.goto("file:///" + path.resolve("debug_grid_c4.png").replace(/\\/g, "/"));
// Request header URL & Status: y ~ 120 to 220
await page.screenshot({ path: "docs/presentacion/lp_u02/assets/crop_c4_top.png", clip: { x: 750, y: 120, width: 650, height: 120 } });
// Request Headers (authorization & x-trace-id): y ~ 400 to 650
await page.screenshot({ path: "docs/presentacion/lp_u02/assets/crop_c4_headers.png", clip: { x: 750, y: 400, width: 650, height: 250 } });

await browser.close();
console.log("Crops taken for verification");
