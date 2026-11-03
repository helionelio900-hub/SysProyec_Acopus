import { chromium } from "file:///C:/Users/Paul/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import path from "node:path";

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  args: ["--use-angle=swiftshader", "--disable-gpu-sandbox"]
});

const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("file:///" + path.resolve("docs/img_S07_CalisayaHelio/captura-06-crud-listar.png").replace(/\\/g, "/"));

const boxInfo = await page.evaluate(() => {
  const canvas = document.createElement("canvas");
  canvas.width = 1440;
  canvas.height = 900;
  const ctx = canvas.getContext("2d");
  const img = document.querySelector("img");
  ctx.drawImage(img, 0, 0);

  // Search for the green/teal "Registrar minero" button or borders
  // Also scan for row borders: table background is usually dark #081926 or white #ffffff? Let's check background color at 720, 450
  const centerPix = ctx.getImageData(720, 450, 1, 1).data;
  const topPix = ctx.getImageData(720, 150, 1, 1).data;
  const sidePix = ctx.getImageData(100, 450, 1, 1).data;

  // Let's find table edges by checking horizontal contrast
  let leftEdge = 0, rightEdge = 1440;
  for (let x = 50; x < 700; x++) {
    const p = ctx.getImageData(x, 300, 1, 1).data;
    if (Math.abs(p[0] - sidePix[0]) > 20 || Math.abs(p[1] - sidePix[1]) > 20) {
      leftEdge = x;
      break;
    }
  }
  for (let x = 1400; x > 700; x--) {
    const p = ctx.getImageData(x, 300, 1, 1).data;
    if (Math.abs(p[0] - sidePix[0]) > 20 || Math.abs(p[1] - sidePix[1]) > 20) {
      rightEdge = x;
      break;
    }
  }

  return {
    center: Array.from(centerPix),
    top: Array.from(topPix),
    side: Array.from(sidePix),
    leftEdge,
    rightEdge
  };
});

console.log("Box info 06:", boxInfo);
await browser.close();
