import { chromium } from "file:///C:/Users/Paul/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import path from "node:path";

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  args: ["--use-angle=swiftshader", "--disable-gpu-sandbox"]
});

const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

// Inspect debug_grid_c1
await page.goto("file:///" + path.resolve("debug_grid_c1.png").replace(/\\/g, "/"));
await page.screenshot({ path: "docs/presentacion/lp_u02/assets/grid_c1_table.png", clip: { x: 230, y: 150, width: 1190, height: 600 } });

// Inspect debug_grid_c2
await page.goto("file:///" + path.resolve("debug_grid_c2.png").replace(/\\/g, "/"));
await page.screenshot({ path: "docs/presentacion/lp_u02/assets/grid_c2_form.png", clip: { x: 230, y: 150, width: 1190, height: 550 } });

// Inspect debug_grid_c4
await page.goto("file:///" + path.resolve("debug_grid_c4.png").replace(/\\/g, "/"));
await page.screenshot({ path: "docs/presentacion/lp_u02/assets/grid_c4_devtools.png", clip: { x: 600, y: 80, width: 830, height: 750 } });

// Inspect debug_grid_c3_trans
const pageHD = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
await pageHD.goto("file:///" + path.resolve("debug_grid_c3_trans.png").replace(/\\/g, "/"));
await pageHD.screenshot({ path: "docs/presentacion/lp_u02/assets/grid_c3_trans.png", clip: { x: 700, y: 150, width: 1180, height: 850 } });

// Inspect debug_grid_c3_rep
await pageHD.goto("file:///" + path.resolve("debug_grid_c3_rep.png").replace(/\\/g, "/"));
await pageHD.screenshot({ path: "docs/presentacion/lp_u02/assets/grid_c3_rep.png", clip: { x: 700, y: 150, width: 1180, height: 850 } });

await browser.close();
console.log("All grid crops generated!");
