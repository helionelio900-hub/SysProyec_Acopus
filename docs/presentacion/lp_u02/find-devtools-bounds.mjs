import { chromium } from "file:///C:/Users/Paul/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import path from "node:path";

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  args: ["--use-angle=swiftshader", "--disable-gpu-sandbox"]
});

const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("file:///" + path.resolve("docs/img_S07_CalisayaHelio/captura-05-http-network-traceid.png").replace(/\\/g, "/"));

const netBounds = await page.evaluate(() => {
  const canvas = document.createElement("canvas");
  canvas.width = 1440;
  canvas.height = 900;
  const ctx = canvas.getContext("2d");
  const img = document.querySelector("img");
  ctx.drawImage(img, 0, 0);

  // In Chrome DevTools, Status 200 OK has a green dot or text
  // Green color: r < 50, g > 150, b < 100
  const greenMatches = [];
  for (let y = 100; y < 300; y++) {
    for (let x = 700; x < 1100; x++) {
      const p = ctx.getImageData(x, y, 1, 1).data;
      if (p[0] < 60 && p[1] > 160 && p[2] < 100) {
        greenMatches.push({ x, y });
      }
    }
  }

  // Find DevTools left divider line: usually around x=650 to x=750
  let splitX = 0;
  for (let x = 600; x < 800; x++) {
    const p = ctx.getImageData(x, 400, 1, 1).data;
    // DevTools dark bg: ~30-40 in rgb, angular app bg is [10, 27, 49]
    if (p[0] > 20 && p[1] > 20 && p[2] > 20 && Math.abs(p[0] - p[2]) < 10) {
      splitX = x;
      break;
    }
  }

  return { greenMatches: greenMatches.slice(0, 10), splitX };
});

console.log("DevTools net bounds:", netBounds);
await browser.close();
