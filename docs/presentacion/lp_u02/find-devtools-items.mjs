import { chromium } from "file:///C:/Users/Paul/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import path from "node:path";

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  args: ["--use-angle=swiftshader", "--disable-gpu-sandbox"]
});

const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("file:///" + path.resolve("docs/img_S07_CalisayaHelio/captura-05-http-network-traceid.png").replace(/\\/g, "/"));

const findings = await page.evaluate(() => {
  const canvas = document.createElement("canvas");
  canvas.width = 1440;
  canvas.height = 900;
  const ctx = canvas.getContext("2d");
  const img = document.querySelector("img");
  ctx.drawImage(img, 0, 0);

  // Look for green pixel of "200 OK" status indicator:
  // In Chrome DevTools, Status Code has a small green circle next to "200 OK"
  // or green text: color is around [26, 179, 148] or [35, 134, 54] or [92, 184, 92]
  let statusGreen = [];
  for (let y = 430; y < 850; y++) {
    for (let x = 500; x < 900; x++) {
      const p = ctx.getImageData(x, y, 1, 1).data;
      if (p[1] > 140 && p[0] < 80 && p[2] < 120) {
        statusGreen.push({ x, y, r: p[0], g: p[1], b: p[2] });
      }
    }
  }

  // Look for blue link of Request URL:
  // e.g. http://localhost:8081/api/v1/acopio/mineros is rendered in blue text [107, 182, 255] or [129, 162, 190]
  let urlBlue = [];
  for (let y = 430; y < 850; y++) {
    for (let x = 600; x < 1200; x += 5) {
      const p = ctx.getImageData(x, y, 1, 1).data;
      if (p[2] > 180 && p[0] < 120 && p[1] > 120) {
        urlBlue.push({ x, y, r: p[0], g: p[1], b: p[2] });
      }
    }
  }

  return { statusGreen: statusGreen.slice(0, 5), urlBlue: urlBlue.slice(0, 5) };
});

console.log("DevTools findings:", findings);
await browser.close();
