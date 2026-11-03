import { chromium } from "file:///C:/Users/Paul/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import path from "node:path";

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  args: ["--use-angle=swiftshader", "--disable-gpu-sandbox"]
});

const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("file:///" + path.resolve("debug_grid_c1.png").replace(/\\/g, "/"));

// Let's crop:
// 1. Where is the title and button?
await page.screenshot({ path: "crop_grid_c1_top.png", clip: { x: 200, y: 50, width: 1200, height: 180 } });
// 2. Where is the table header?
await page.screenshot({ path: "crop_grid_c1_th.png", clip: { x: 200, y: 200, width: 1200, height: 120 } });
// 3. Where are the rows?
await page.screenshot({ path: "crop_grid_c1_rows.png", clip: { x: 200, y: 300, width: 1200, height: 400 } });

await page.goto("file:///" + path.resolve("debug_grid_c2.png").replace(/\\/g, "/"));
await page.screenshot({ path: "crop_grid_c2_form.png", clip: { x: 200, y: 100, width: 1000, height: 700 } });

await page.goto("file:///" + path.resolve("debug_grid_c4.png").replace(/\\/g, "/"));
await page.screenshot({ path: "crop_grid_c4_net.png", clip: { x: 500, y: 50, width: 900, height: 800 } });

await browser.close();
console.log("Crops taken");
