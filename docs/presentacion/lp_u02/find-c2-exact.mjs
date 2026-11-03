import { chromium } from "file:///C:/Users/Paul/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import path from "node:path";

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  args: ["--use-angle=swiftshader", "--disable-gpu-sandbox"]
});

const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("file:///" + path.resolve("docs/img_S07_CalisayaHelio/captura-07-crud-crear.png").replace(/\\/g, "/"));

// Let's find the exact bounding boxes of the 4 inputs and the buttons
const inputCoordinates = await page.evaluate(() => {
  const canvas = document.createElement("canvas");
  canvas.width = 1440;
  canvas.height = 900;
  const ctx = canvas.getContext("2d");
  const img = document.querySelector("img");
  ctx.drawImage(img, 0, 0);

  // Scan across x from 200 to 1200 at y=230 (inside Input 1) to find its left and right outline
  let xLeft = 0, xRight = 0;
  for (let x = 200; x < 600; x++) {
    const p = ctx.getImageData(x, 230, 1, 1).data;
    // Input fill is darker or lighter than page background (page bg: [7, 20, 38])
    if (p[0] > 15 || p[1] > 30 || p[2] > 50) {
      xLeft = x;
      break;
    }
  }
  for (let x = 1200; x > 500; x--) {
    const p = ctx.getImageData(x, 230, 1, 1).data;
    if (p[0] > 15 || p[1] > 30 || p[2] > 50) {
      xRight = x;
      break;
    }
  }

  // Scan y values of each field outline:
  // Input 1 DNI: around y=200-260
  // Input 2 Nombres: around y=285-345
  // Input 3 Telefono: around y=370-430
  // Input 4 Zona: around y=455-515
  // Button Guardar: around y=530-580
  return { xLeft, xRight };
});

console.log("Input horizontal bounds:", inputCoordinates);

// Let's verify with test screenshots
await page.screenshot({ path: "test_c2_input1.png", clip: { x: 260, y: 195, width: 560, height: 70 } });
await page.screenshot({ path: "test_c2_input4.png", clip: { x: 260, y: 470, width: 560, height: 70 } });
await page.screenshot({ path: "test_c2_buttons.png", clip: { x: 260, y: 550, width: 300, height: 60 } });

await browser.close();
console.log("C2 verified!");
