import { chromium } from "file:///C:/Users/Paul/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import path from "node:path";

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  args: ["--use-angle=swiftshader", "--disable-gpu-sandbox"]
});

const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("file:///" + path.resolve("docs/img_S07_CalisayaHelio/captura-05-http-network-traceid.png").replace(/\\/g, "/"));

// Let's crop vertical slices of headers between y=500 and 850 in 50px chunks:
for (let y = 500; y <= 800; y += 50) {
  await page.screenshot({
    path: `docs/presentacion/lp_u02/assets/h_slice_${y}.png`,
    clip: { x: 520, y, width: 880, height: 50 }
  });
}

await browser.close();
console.log("Header slices dumped");
