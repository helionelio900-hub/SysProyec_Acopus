import { chromium } from "file:///C:/Users/Paul/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import path from "node:path";

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  args: ["--use-angle=swiftshader", "--disable-gpu-sandbox"]
});

const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("file:///" + path.resolve("docs/img_S07_CalisayaHelio/captura-06-crud-listar.png").replace(/\\/g, "/"));

const analysis = await page.evaluate(() => {
  const canvas = document.createElement("canvas");
  canvas.width = 1440;
  canvas.height = 900;
  const ctx = canvas.getContext("2d");
  const img = document.querySelector("img");
  ctx.drawImage(img, 0, 0);

  // Find where the button is: usually button has a distinct background color (e.g., green/teal or yellow or blue or dark with border)
  // Let's search around y from 100 to 220, x from 800 to 1400
  const buttonCandidates = [];
  for (let y = 100; y < 220; y += 5) {
    for (let x = 800; x < 1400; x += 10) {
      const p = ctx.getImageData(x, y, 1, 1).data;
      // Look for gold or teal or blue or green
      // gold: r > 180, g > 130, b < 100
      // green: r < 100, g > 150, b < 150
      // blue/teal: r < 100, g > 120, b > 150
      if ((p[0] > 180 && p[1] > 130 && p[2] < 100) ||
          (p[0] < 100 && p[1] > 150 && p[2] < 150) ||
          (p[0] < 100 && p[1] > 120 && p[2] > 150)) {
        buttonCandidates.push({ x, y, r: p[0], g: p[1], b: p[2] });
      }
    }
  }

  // Find table boundaries:
  // Let's scan y from 200 to 700 at x = 300, 400, 600, 800, 1000, 1200
  // And let's find row heights and text bounding boxes
  return {
    buttonCount: buttonCandidates.length,
    sampleButtons: buttonCandidates.slice(0, 10)
  };
});

console.log("Button analysis:", analysis);
await browser.close();
