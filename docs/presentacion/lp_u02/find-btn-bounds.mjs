import { chromium } from "file:///C:/Users/Paul/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import path from "node:path";

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  args: ["--use-angle=swiftshader", "--disable-gpu-sandbox"]
});

const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("file:///" + path.resolve("docs/img_S07_CalisayaHelio/captura-06-crud-listar.png").replace(/\\/g, "/"));

const bounds = await page.evaluate(() => {
  const canvas = document.createElement("canvas");
  canvas.width = 1440;
  canvas.height = 900;
  const ctx = canvas.getContext("2d");
  const img = document.querySelector("img");
  ctx.drawImage(img, 0, 0);

  // Exact button bounding box (gold color: r: 242, g: 183, b: 54)
  let minX = 1440, maxX = 0, minY = 900, maxY = 0;
  for (let y = 150; y < 250; y++) {
    for (let x = 1100; x < 1440; x++) {
      const p = ctx.getImageData(x, y, 1, 1).data;
      if (p[0] > 200 && p[1] > 150 && p[2] < 80) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  return {
    btn: { minX, maxX, minY, maxY, w: maxX - minX, h: maxY - minY }
  };
});

console.log("Button exact bounds:", bounds);
await browser.close();
