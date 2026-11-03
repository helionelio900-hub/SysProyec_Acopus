import { chromium } from "file:///C:/Users/Paul/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import path from "node:path";

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  args: ["--use-angle=swiftshader", "--disable-gpu-sandbox"]
});

const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("file:///" + path.resolve("docs/img_S07_CalisayaHelio/captura-07-crud-crear.png").replace(/\\/g, "/"));

const formBounds = await page.evaluate(() => {
  const canvas = document.createElement("canvas");
  canvas.width = 1440;
  canvas.height = 900;
  const ctx = canvas.getContext("2d");
  const img = document.querySelector("img");
  ctx.drawImage(img, 0, 0);

  // Scan input outlines at x=400
  const lines = [];
  for (let y = 150; y < 750; y++) {
    const p = ctx.getImageData(400, y, 1, 1).data;
    if (p[0] > 40 && p[1] > 60 && p[2] > 90) {
      lines.push(y);
    }
  }
  return lines;
});

console.log("Form outline lines 07:", formBounds);
await browser.close();
