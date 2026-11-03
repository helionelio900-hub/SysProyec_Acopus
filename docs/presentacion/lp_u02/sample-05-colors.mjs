import { chromium } from "file:///C:/Users/Paul/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import path from "node:path";

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  args: ["--use-angle=swiftshader", "--disable-gpu-sandbox"]
});

const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("file:///" + path.resolve("docs/img_S07_CalisayaHelio/captura-05-http-network-traceid.png").replace(/\\/g, "/"));

const points = await page.evaluate(() => {
  const canvas = document.createElement("canvas");
  canvas.width = 1440;
  canvas.height = 900;
  const ctx = canvas.getContext("2d");
  const img = document.querySelector("img");
  ctx.drawImage(img, 0, 0);

  const samples = [];
  [
    { x: 100, y: 100 }, { x: 500, y: 200 }, { x: 800, y: 200 },
    { x: 1000, y: 300 }, { x: 1200, y: 500 }, { x: 800, y: 600 }
  ].forEach(pt => {
    const p = ctx.getImageData(pt.x, pt.y, 1, 1).data;
    samples.push({ pt, rgba: Array.from(p) });
  });

  return samples;
});

console.log("Color samples 05:", points);
await browser.close();
