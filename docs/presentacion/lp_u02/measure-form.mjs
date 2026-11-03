import { chromium } from "file:///C:/Users/Paul/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import path from "node:path";

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  args: ["--use-angle=swiftshader", "--disable-gpu-sandbox"]
});

const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("file:///" + path.resolve("debug_grid_c2.png").replace(/\\/g, "/"));

// Let's sample pixel colors across a vertical slice through the form at x=500
const samples = await page.evaluate(() => {
  const canvas = document.createElement("canvas");
  canvas.width = 1440;
  canvas.height = 900;
  const ctx = canvas.getContext("2d");
  const img = document.querySelector("img");
  ctx.drawImage(img, 0, 0);

  // Let's find the left edge and right edge of input at y=230
  // Background of form card is around x=260 to x=1000
  let left = 0, right = 0;
  for (let x = 200; x < 500; x++) {
    const p = ctx.getImageData(x, 220, 1, 1).data;
    if (p[0] > 30 || p[1] > 50 || p[2] > 70) {
      left = x;
      break;
    }
  }
  for (let x = 1200; x > 500; x--) {
    const p = ctx.getImageData(x, 220, 1, 1).data;
    if (p[0] > 30 || p[1] > 50 || p[2] > 70) {
      right = x;
      break;
    }
  }

  // Find exact tops and bottoms of the 4 inputs:
  // Material outline has top border at y=199, bottom at y=256
  // Input 1: DNI
  // Input 2: Nombres
  // Input 3: Telefono
  // Input 4: Zona
  // Buttons
  return { left, right };
});

console.log("Form card left/right:", samples);
await browser.close();
