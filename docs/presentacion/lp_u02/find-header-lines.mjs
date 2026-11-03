import { chromium } from "file:///C:/Users/Paul/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import path from "node:path";

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  args: ["--use-angle=swiftshader", "--disable-gpu-sandbox"]
});

const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("file:///" + path.resolve("docs/img_S07_CalisayaHelio/captura-05-http-network-traceid.png").replace(/\\/g, "/"));

const reqHeaders = await page.evaluate(() => {
  const canvas = document.createElement("canvas");
  canvas.width = 1440;
  canvas.height = 900;
  const ctx = canvas.getContext("2d");
  const img = document.querySelector("img");
  ctx.drawImage(img, 0, 0);

  // In Chrome DevTools, header keys (like "authorization:", "x-trace-id:") are rendered in purple/pink or reddish-pink
  // or bold white, while values are white/cyan
  // In dark theme, header names are often around [200, 100, 100] or [150, 120, 200]
  // Let's sample colors on column x = 540 to 600 from y = 500 to 850
  const headerLines = [];
  for (let y = 500; y < 850; y += 2) {
    const p = ctx.getImageData(545, y, 1, 1).data;
    // Check if line has text (r > 100 or g > 100 or b > 100)
    if (p[0] > 90 || p[1] > 90 || p[2] > 90) {
      headerLines.push({ y, rgba: Array.from(p) });
    }
  }

  return headerLines;
});

console.log("Total text lines found in DevTools headers:", reqHeaders.length);
// Group by clusters
const clusters = [];
let lastY = 0;
for (const l of reqHeaders) {
  if (l.y - lastY > 10) {
    clusters.push(l.y);
  }
  lastY = l.y;
}
console.log("Clusters of header lines Y:", clusters);
await browser.close();
