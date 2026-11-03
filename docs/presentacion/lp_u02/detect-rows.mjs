import { chromium } from "file:///C:/Users/Paul/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import path from "node:path";

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  args: ["--use-angle=swiftshader", "--disable-gpu-sandbox"]
});

const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("file:///" + path.resolve("docs/img_S07_CalisayaHelio/captura-06-crud-listar.png").replace(/\\/g, "/"));

const rows = await page.evaluate(() => {
  const canvas = document.createElement("canvas");
  canvas.width = 1440;
  canvas.height = 900;
  const ctx = canvas.getContext("2d");
  const img = document.querySelector("img");
  ctx.drawImage(img, 0, 0);

  // Scan vertical line at x=500 for border lines or row changes
  const lines = [];
  for (let y = 100; y < 850; y++) {
    const p = ctx.getImageData(500, y, 1, 1).data;
    // Check if border color is lighter than bg (e.g. line > 45 in r,g,b)
    if (p[0] > 40 && p[1] > 60 && p[2] > 90) {
      lines.push(y);
    }
  }
  return lines;
});

console.log("Detected border lines in table:", rows);
await browser.close();
