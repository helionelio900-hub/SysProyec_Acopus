import { chromium } from "file:///C:/Users/Paul/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import { pathToFileURL } from "node:url";
import path from "node:path";

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  args: ["--use-angle=swiftshader", "--disable-gpu-sandbox"]
});

const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
const fileUrl = pathToFileURL(path.resolve("docs/presentacion/lp_u02/06_modulo_mayorista.html")).href;

await page.goto(fileUrl, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(400);

// 1. Initial / C1
await page.screenshot({ path: "docs/presentacion/lp_u02/06_interactive_c1_preview.png" });

// 2. Click C2
await page.click('button[data-target="c2"]');
await page.waitForTimeout(400);
await page.screenshot({ path: "docs/presentacion/lp_u02/06_interactive_c2_preview.png" });

// 3. Click C3 transaccional
await page.click('button[data-target="c3_trans"]');
await page.waitForTimeout(400);
await page.screenshot({ path: "docs/presentacion/lp_u02/06_interactive_c3_trans_preview.png" });

// 4. Click C3 reportes
await page.click('button[data-target="c3_rep"]');
await page.waitForTimeout(400);
await page.screenshot({ path: "docs/presentacion/lp_u02/06_interactive_c3_rep_preview.png" });

// 5. Click C4/C5 seguridad
await page.click('button[data-target="c4_c5"]');
await page.waitForTimeout(400);
await page.screenshot({ path: "docs/presentacion/lp_u02/06_interactive_c4_preview.png" });

await browser.close();
console.log("All 5 interactive screenshots captured successfully");
