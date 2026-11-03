import { chromium } from "file:///C:/Users/Paul/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import path from "node:path";

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  args: ["--use-angle=swiftshader", "--disable-gpu-sandbox"]
});

const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("file:///" + path.resolve("debug_grid_c4.png").replace(/\\/g, "/"));

// Let's take fine slices of DevTools:
// y=100-200, y=200-300, y=300-400, y=400-500, y=500-600, y=600-700
for (let y = 100; y <= 600; y += 100) {
  await page.screenshot({
    path: `docs/presentacion/lp_u02/assets/net_slice_y${y}.png`,
    clip: { x: 700, y, width: 720, height: 100 }
  });
}

await browser.close();
console.log("DevTools net slices dumped");
