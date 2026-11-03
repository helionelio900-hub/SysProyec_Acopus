import { chromium } from "file:///C:/Users/Paul/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import path from "node:path";

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  args: ["--use-angle=swiftshader", "--disable-gpu-sandbox"]
});

const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("file:///" + path.resolve("docs/img_S07_CalisayaHelio/captura-05-http-network-traceid.png").replace(/\\/g, "/"));

// Let's take crops across the right side (DevTools):
// 1. Top headers (General)
await page.screenshot({ path: "test_c4_general.png", clip: { x: 700, y: 120, width: 700, height: 160 } });
// 2. Response Headers
await page.screenshot({ path: "test_c4_resp.png", clip: { x: 700, y: 280, width: 700, height: 160 } });
// 3. Request Headers
await page.screenshot({ path: "test_c4_req.png", clip: { x: 700, y: 440, width: 700, height: 260 } });

await browser.close();
console.log("C4 crops dumped");
