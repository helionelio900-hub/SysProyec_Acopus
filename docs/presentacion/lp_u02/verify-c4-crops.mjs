import { chromium } from "file:///C:/Users/Paul/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import path from "node:path";

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  args: ["--use-angle=swiftshader", "--disable-gpu-sandbox"]
});

const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("file:///" + path.resolve("docs/img_S07_CalisayaHelio/captura-05-http-network-traceid.png").replace(/\\/g, "/"));

await page.screenshot({ path: "docs/presentacion/lp_u02/assets/crop_c4_verify_general.png", clip: { x: 585, y: 435, width: 810, height: 75 } });
await page.screenshot({ path: "docs/presentacion/lp_u02/assets/crop_c4_verify_req.png", clip: { x: 585, y: 660, width: 810, height: 85 } });

await browser.close();
console.log("C4 verification crops saved!");
