import { chromium } from "file:///C:/Users/Paul/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import path from "node:path";

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  args: ["--use-angle=swiftshader", "--disable-gpu-sandbox"]
});

const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

// Check C2 field 1
await page.goto("file:///" + path.resolve("debug_grid_c2.png").replace(/\\/g, "/"));
const c2Coords = await page.evaluate(() => {
  const canvas = document.createElement("canvas");
  canvas.width = 1440;
  canvas.height = 900;
  const ctx = canvas.getContext("2d");
  const img = document.querySelector("img");
  ctx.drawImage(img, 0, 0);

  // In crop_c2_field1: find input border corners
  // Scan x from 250 to 800 at y=210
  let f1_x1 = 0, f1_x2 = 0;
  for (let x = 250; x < 900; x++) {
    const p = ctx.getImageData(x, 210, 1, 1).data;
    // Input border line: blue/grey line
    if (p[0] > 40 && p[1] > 60 && p[2] > 90) {
      if (!f1_x1) f1_x1 = x;
      f1_x2 = x;
    }
  }

  // Scan y from 180 to 280 at x=400
  let f1_y1 = 0, f1_y2 = 0;
  for (let y = 180; y < 280; y++) {
    const p = ctx.getImageData(400, y, 1, 1).data;
    if (p[0] > 40 && p[1] > 60 && p[2] > 90) {
      if (!f1_y1) f1_y1 = y;
      f1_y2 = y;
    }
  }

  // Same for Field 4 (Zona) around y=470 to 560
  let f4_y1 = 0, f4_y2 = 0;
  for (let y = 460; y < 560; y++) {
    const p = ctx.getImageData(400, y, 1, 1).data;
    if (p[0] > 40 && p[1] > 60 && p[2] > 90) {
      if (!f4_y1) f4_y1 = y;
      f4_y2 = y;
    }
  }

  // Guardar button around y=550 to 650
  let btn_x1 = 0, btn_x2 = 0, btn_y1 = 0, btn_y2 = 0;
  for (let y = 550; y < 650; y++) {
    for (let x = 250; x < 500; x++) {
      const p = ctx.getImageData(x, y, 1, 1).data;
      if (p[0] > 200 && p[1] > 150 && p[2] < 80) { // Gold/yellow primary button
        if (!btn_x1 || x < btn_x1) btn_x1 = x;
        if (x > btn_x2) btn_x2 = x;
        if (!btn_y1 || y < btn_y1) btn_y1 = y;
        if (y > btn_y2) btn_y2 = y;
      }
    }
  }

  return {
    f1: { x1: f1_x1, x2: f1_x2, y1: f1_y1, y2: f1_y2 },
    f4: { x1: f1_x1, x2: f1_x2, y1: f4_y1, y2: f4_y2 },
    btn: { x1: btn_x1, x2: btn_x2, y1: btn_y1, y2: btn_y2 }
  };
});

console.log("C2 exact coordinates:", c2Coords);

// Now for C4 DevTools
await page.goto("file:///" + path.resolve("debug_grid_c4.png").replace(/\\/g, "/"));
const c4Coords = await page.evaluate(() => {
  const canvas = document.createElement("canvas");
  canvas.width = 1440;
  canvas.height = 900;
  const ctx = canvas.getContext("2d");
  const img = document.querySelector("img");
  ctx.drawImage(img, 0, 0);

  // Scan DevTools right panel for General section
  // In DevTools, headers table starts around x=760 to x=1400
  // General: Request URL, Method, Status Code
  // Response Headers
  // Request Headers: Authorization, x-trace-id
  // Let's sample key y positions
  return {
    sampleX: 760
  };
});

console.log("C4 sample:", c4Coords);
await browser.close();
