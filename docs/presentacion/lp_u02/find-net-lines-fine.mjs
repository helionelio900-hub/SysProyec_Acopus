import { chromium } from "file:///C:/Users/Paul/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import path from "node:path";

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  args: ["--use-angle=swiftshader", "--disable-gpu-sandbox"]
});

const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("file:///" + path.resolve("docs/img_S07_CalisayaHelio/captura-05-http-network-traceid.png").replace(/\\/g, "/"));

// Let's take 10 slices of 40px each from y=430 to 830 on x: 500 to 1400
for (let y = 430, i = 0; y < 830; y += 40, i++) {
  await page.screenshot({
    path: `docs/presentacion/lp_u02/assets/net_h_${i}_y${y}.png`,
    clip: { x: 500, y, width: 920, height: 40 }
  });
}

await browser.close();
console.log("Fine network slices dumped");
