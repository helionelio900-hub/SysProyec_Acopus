import { chromium } from "file:///C:/Users/Paul/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import path from "node:path";

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  args: ["--use-angle=swiftshader", "--disable-gpu-sandbox"]
});

const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("file:///" + path.resolve("docs/img_S07_CalisayaHelio/captura-05-http-network-traceid.png").replace(/\\/g, "/"));

// Let's crop the bottom half in 3 sections:
// 1. Left list of requests (x: 0 to 500, y: 396 to 900)
await page.screenshot({ path: "docs/presentacion/lp_u02/assets/net_left_requests.png", clip: { x: 0, y: 396, width: 500, height: 500 } });
// 2. Center/Right headers top (x: 500 to 1440, y: 396 to 650)
await page.screenshot({ path: "docs/presentacion/lp_u02/assets/net_right_top.png", clip: { x: 500, y: 396, width: 940, height: 260 } });
// 3. Center/Right headers bottom (x: 500 to 1440, y: 650 to 900)
await page.screenshot({ path: "docs/presentacion/lp_u02/assets/net_right_bottom.png", clip: { x: 500, y: 650, width: 940, height: 250 } });

await browser.close();
console.log("DevTools bottom crops dumped");
