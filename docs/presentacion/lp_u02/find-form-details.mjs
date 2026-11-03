import { chromium } from "file:///C:/Users/Paul/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import path from "node:path";

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  args: ["--use-angle=swiftshader", "--disable-gpu-sandbox"]
});

const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("file:///" + path.resolve("docs/img_S07_CalisayaHelio/captura-07-crud-crear.png").replace(/\\/g, "/"));

const formDetails = await page.evaluate(() => {
  const canvas = document.createElement("canvas");
  canvas.width = 1440;
  canvas.height = 900;
  const ctx = canvas.getContext("2d");
  const img = document.querySelector("img");
  ctx.drawImage(img, 0, 0);

  // In Material outline, input borders have distinct line color at x=400
  // Let's find top and bottom lines of each input
  const inputOutlines = [];
  let inBorder = false;
  let startY = 0;
  for (let y = 150; y < 750; y++) {
    const p = ctx.getImageData(400, y, 1, 1).data;
    const isBorder = (p[0] > 40 && p[1] > 60 && p[2] > 90);
    if (isBorder && !inBorder) {
      inBorder = true;
      startY = y;
    } else if (!isBorder && inBorder) {
      inBorder = false;
      inputOutlines.push({ startY, endY: y - 1 });
    }
  }

  // Let's find input left and right edges for first input
  let inputLeft = 0, inputRight = 1440;
  for (let x = 200; x < 600; x++) {
    const p = ctx.getImageData(x, 230, 1, 1).data;
    if (p[0] > 40 && p[1] > 60 && p[2] > 90) {
      inputLeft = x;
      break;
    }
  }
  for (let x = 1200; x > 500; x--) {
    const p = ctx.getImageData(x, 230, 1, 1).data;
    if (p[0] > 40 && p[1] > 60 && p[2] > 90) {
      inputRight = x;
      break;
    }
  }

  // Let's find Guardar button bounds (typically gold/yellow or primary)
  let btnMinX = 1440, btnMaxX = 0, btnMinY = 900, btnMaxY = 0;
  for (let y = 500; y < 700; y++) {
    for (let x = 200; x < 600; x++) {
      const p = ctx.getImageData(x, y, 1, 1).data;
      if (p[0] > 200 && p[1] > 150 && p[2] < 80) {
        if (x < btnMinX) btnMinX = x;
        if (x > btnMaxX) btnMaxX = x;
        if (y < btnMinY) btnMinY = y;
        if (y > btnMaxY) btnMaxY = y;
      }
    }
  }

  return { inputOutlines, inputLeft, inputRight, btn: { btnMinX, btnMaxX, btnMinY, btnMaxY } };
});

console.log("Form details 07:", formDetails);
await browser.close();
