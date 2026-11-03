import { chromium } from "file:///C:/Users/Paul/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import path from "node:path";

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  args: ["--use-angle=swiftshader", "--disable-gpu-sandbox"]
});

const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("file:///" + path.resolve("docs/img_S07_CalisayaHelio/captura-07-crud-crear.png").replace(/\\/g, "/"));

const c2Bounds = await page.evaluate(() => {
  const canvas = document.createElement("canvas");
  canvas.width = 1440;
  canvas.height = 900;
  const ctx = canvas.getContext("2d");
  const img = document.querySelector("img");
  ctx.drawImage(img, 0, 0);

  // Scan input 1 (Documento de Identidad) outline at y=205 to find its left and right boundaries
  // The input outline has color around [60, 90, 130] or similar
  let in1_x1 = 0, in1_x2 = 0;
  for (let x = 240; x < 1200; x++) {
    const p = ctx.getImageData(x, 220, 1, 1).data;
    // Check border pixel
    if (p[0] > 40 && p[1] > 60 && p[2] > 90) {
      if (!in1_x1) in1_x1 = x;
      in1_x2 = x;
    }
  }

  // Scan across y at x=350 to find tops and bottoms of all 4 inputs
  const inputsY = [];
  let currentStart = null;
  for (let y = 180; y < 650; y++) {
    const p = ctx.getImageData(350, y, 1, 1).data;
    const isBorder = (p[0] > 40 && p[1] > 60 && p[2] > 90);
    if (isBorder && currentStart === null) {
      currentStart = y;
    } else if (!isBorder && currentStart !== null && (y - currentStart > 30)) {
      inputsY.push({ top: currentStart, bottom: y, height: y - currentStart });
      currentStart = null;
    }
  }

  return { in1_x1, in1_x2, inputsY };
});

console.log("C2 Exact bounds:", c2Bounds);
await browser.close();
