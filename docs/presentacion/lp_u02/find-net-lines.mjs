import { chromium } from "file:///C:/Users/Paul/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import path from "node:path";

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  args: ["--use-angle=swiftshader", "--disable-gpu-sandbox"]
});

const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("file:///" + path.resolve("docs/img_S07_CalisayaHelio/captura-05-http-network-traceid.png").replace(/\\/g, "/"));

const netAnalysis = await page.evaluate(() => {
  const canvas = document.createElement("canvas");
  canvas.width = 1440;
  canvas.height = 900;
  const ctx = canvas.getContext("2d");
  const img = document.querySelector("img");
  ctx.drawImage(img, 0, 0);

  // In Chrome DevTools, the Headers tab has collapsible section headers:
  // "General", "Response Headers", "Request Headers"
  // Each section header has a slightly darker or distinct background
  // Let's scan y at x=780 for section dividers or line items
  // Text in DevTools is light gray #c7c7c7 or white
  const brightY = [];
  for (let y = 100; y < 800; y += 4) {
    let count = 0;
    for (let x = 750; x < 1350; x += 10) {
      const p = ctx.getImageData(x, y, 1, 1).data;
      if (p[0] > 180 && p[1] > 180 && p[2] > 180) count++;
    }
    if (count > 8) brightY.push(y);
  }

  // Scan where Request URL starts:
  // DevTools panels:
  // Left side: Network request list (e.g. mineros, auth, etc.)
  // Right side: Headers panel (Request URL, Status Code, etc.)
  let devToolsLeft = 0;
  for (let x = 400; x < 900; x++) {
    const p = ctx.getImageData(x, 200, 1, 1).data;
    // Look for DevTools background (around [36, 36, 36] or [40, 40, 40])
    if (Math.abs(p[0] - p[1]) < 5 && Math.abs(p[1] - p[2]) < 5 && p[0] > 25 && p[0] < 55) {
      devToolsLeft = x;
      break;
    }
  }

  return { devToolsLeft, brightYCount: brightY.length, sampleBrightY: brightY.slice(0, 25) };
});

console.log("Net analysis:", netAnalysis);
await browser.close();
