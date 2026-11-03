import { chromium } from "file:///C:/Users/Paul/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import path from "node:path";

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  args: ["--use-angle=swiftshader", "--disable-gpu-sandbox"]
});

const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

// Check 04_acopio_g2.png
await page.goto("file:///" + path.resolve("docs/presentacion/s06/imagenes/04_acopio_g2.png").replace(/\\/g, "/"));
const c3TransBoxes = await page.evaluate(() => {
  const canvas = document.createElement("canvas");
  canvas.width = 1920;
  canvas.height = 1080;
  const ctx = canvas.getContext("2d");
  const img = document.querySelector("img");
  ctx.drawImage(img, 0, 0);

  // Look for gold top border of Minero card (r > 200, g > 150, b < 100) around y = 200 to 400
  let mineroX1 = 1920, mineroX2 = 0, mineroY1 = 1080, mineroY2 = 0;
  for (let y = 180; y < 500; y++) {
    for (let x = 600; x < 1100; x++) {
      const p = ctx.getImageData(x, y, 1, 1).data;
      if (p[0] > 200 && p[1] > 150 && p[2] < 80) {
        if (x < mineroX1) mineroX1 = x;
        if (x > mineroX2) mineroX2 = x;
        if (y < mineroY1) mineroY1 = y;
        if (y > mineroY2) mineroY2 = y;
      }
    }
  }

  // Look for blue top border of Transaccion card (r < 100, g > 140, b > 200)
  let transX1 = 1920, transX2 = 0, transY1 = 1080, transY2 = 0;
  for (let y = 180; y < 500; y++) {
    for (let x = 1100; x < 1850; x++) {
      const p = ctx.getImageData(x, y, 1, 1).data;
      if (p[2] > 200 && p[1] > 130 && p[0] < 120) {
        if (x < transX1) transX1 = x;
        if (x > transX2) transX2 = x;
        if (y < transY1) transY1 = y;
        if (y > transY2) transY2 = y;
      }
    }
  }

  // Look for red and green stock cards in the bottom half
  let redX1 = 1920, redX2 = 0, redY1 = 1080, redY2 = 0;
  for (let y = 500; y < 1000; y++) {
    for (let x = 600; x < 1300; x++) {
      const p = ctx.getImageData(x, y, 1, 1).data;
      if (p[0] > 200 && p[1] < 100 && p[2] < 100) {
        if (x < redX1) redX1 = x;
        if (x > redX2) redX2 = x;
        if (y < redY1) redY1 = y;
        if (y > redY2) redY2 = y;
      }
    }
  }

  let greenX1 = 1920, greenX2 = 0, greenY1 = 1080, greenY2 = 0;
  for (let y = 500; y < 1000; y++) {
    for (let x = 1200; x < 1850; x++) {
      const p = ctx.getImageData(x, y, 1, 1).data;
      if (p[1] > 180 && p[0] < 100 && p[2] < 150) {
        if (x < greenX1) greenX1 = x;
        if (x > greenX2) greenX2 = x;
        if (y < greenY1) greenY1 = y;
        if (y > greenY2) greenY2 = y;
      }
    }
  }

  return {
    minero: { x1: mineroX1, x2: mineroX2, y1: mineroY1, y2: mineroY2 },
    trans: { x1: transX1, x2: transX2, y1: transY1, y2: transY2 },
    red: { x1: redX1, x2: redX2, y1: redY1, y2: redY2 },
    green: { x1: greenX1, x2: greenX2, y1: greenY1, y2: greenY2 }
  };
});

console.log("C3 Trans exact cards in 04_acopio_g2:", c3TransBoxes);

// Check 07_evidencias.png
await page.goto("file:///" + path.resolve("docs/presentacion/s06/imagenes/07_evidencias.png").replace(/\\/g, "/"));
const c3RepBoxes = await page.evaluate(() => {
  const canvas = document.createElement("canvas");
  canvas.width = 1920;
  canvas.height = 1080;
  const ctx = canvas.getContext("2d");
  const img = document.querySelector("img");
  ctx.drawImage(img, 0, 0);

  // Look for the gold border of metric card in the middle row (y ~ 600 to 800)
  let goldX1 = 1920, goldX2 = 0, goldY1 = 1080, goldY2 = 0;
  for (let y = 600; y < 850; y++) {
    for (let x = 700; x < 1850; x++) {
      const p = ctx.getImageData(x, y, 1, 1).data;
      if (p[0] > 220 && p[1] > 160 && p[2] < 80) {
        if (x < goldX1) goldX1 = x;
        if (x > goldX2) goldX2 = x;
        if (y < goldY1) goldY1 = y;
        if (y > goldY2) goldY2 = y;
      }
    }
  }

  return { metricGold: { x1: goldX1, x2: goldX2, y1: goldY1, y2: goldY2 } };
});

console.log("C3 Rep exact cards in 07_evidencias:", c3RepBoxes);
await browser.close();
