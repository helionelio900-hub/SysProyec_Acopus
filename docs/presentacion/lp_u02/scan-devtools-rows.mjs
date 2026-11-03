import { chromium } from "file:///C:/Users/Paul/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import path from "node:path";

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  args: ["--use-angle=swiftshader", "--disable-gpu-sandbox"]
});

const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("file:///" + path.resolve("docs/img_S07_CalisayaHelio/captura-05-http-network-traceid.png").replace(/\\/g, "/"));

const headerScan = await page.evaluate(() => {
  const canvas = document.createElement("canvas");
  canvas.width = 1440;
  canvas.height = 900;
  const ctx = canvas.getContext("2d");
  const img = document.querySelector("img");
  ctx.drawImage(img, 0, 0);

  // Scan across a box (x: 580 to 1350, y: 400 to 880) to find bounding boxes of all text rows
  const rowBounds = [];
  let inRow = false;
  let startY = 0;
  for (let y = 410; y < 880; y++) {
    let hasText = false;
    for (let x = 600; x < 1200; x += 15) {
      const p = ctx.getImageData(x, y, 1, 1).data;
      if (p[0] > 70 && p[1] > 70 && p[2] > 70) {
        hasText = true;
        break;
      }
    }
    if (hasText && !inRow) {
      inRow = true;
      startY = y;
    } else if (!hasText && inRow) {
      inRow = false;
      rowBounds.push({ startY, endY: y, height: y - startY });
    }
  }

  return rowBounds;
});

console.log("DevTools Header text rows:", headerScan);
await browser.close();
