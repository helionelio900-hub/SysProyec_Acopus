import { chromium } from "file:///C:/Users/Paul/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import path from "node:path";

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  args: ["--use-angle=swiftshader", "--disable-gpu-sandbox"]
});

const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("file:///" + path.resolve("docs/img_S07_CalisayaHelio/captura-06-crud-listar.png").replace(/\\/g, "/"));

// Let's crop individual rows from y=250 to 800 with 50px increments to see exactly where each row is
const rowTops = [260, 310, 360, 410, 460, 510, 560, 610, 660, 710];
for (let i = 0; i < rowTops.length; i++) {
  const y = rowTops[i];
  await page.screenshot({
    path: `docs/presentacion/lp_u02/assets/test_row_${i}_y${y}.png`,
    clip: { x: 260, y: y, width: 1150, height: 50 }
  });
}

await browser.close();
console.log("Row slices dumped");
