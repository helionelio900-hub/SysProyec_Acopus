import { chromium } from "file:///C:/Users/Paul/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import path from "node:path";

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  args: ["--use-angle=swiftshader", "--disable-gpu-sandbox"]
});

const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
await page.goto("file:///" + path.resolve("docs/presentacion/s06/imagenes/04_acopio_g2.png").replace(/\\/g, "/"));

// Slices of 04_acopio_g2
await page.screenshot({ path: "docs/presentacion/lp_u02/assets/check_04_left.png", clip: { x: 50, y: 150, width: 700, height: 800 } });
await page.screenshot({ path: "docs/presentacion/lp_u02/assets/check_04_diagram_top.png", clip: { x: 750, y: 150, width: 1100, height: 450 } });
await page.screenshot({ path: "docs/presentacion/lp_u02/assets/check_04_diagram_bottom.png", clip: { x: 750, y: 600, width: 1100, height: 450 } });

await browser.close();
console.log("04 slices generated!");
