import { chromium } from "file:///C:/Users/Paul/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import path from "node:path";
import fs from "node:fs";

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  args: ["--use-angle=swiftshader", "--disable-gpu-sandbox"]
});

const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const uri06 = "file:///" + path.resolve("docs/img_S07_CalisayaHelio/captura-06-crud-listar.png").replace(/\\/g, "/");
await page.goto(uri06);

// Let's sample pixel colors across vertical lines in the table to locate exact bounds
const tableData = await page.evaluate(() => {
  const canvas = document.createElement("canvas");
  canvas.width = 1440;
  canvas.height = 900;
  const ctx = canvas.getContext("2d");
  const img = document.querySelector("img");
  ctx.drawImage(img, 0, 0);

  // Let's find table margins and row boundaries
  // Check horizontal line around x=300 from y=100 to y=800
  const findings = [];
  for (let y = 100; y < 850; y += 10) {
    const p = ctx.getImageData(300, y, 1, 1).data;
    findings.push({ y, r: p[0], g: p[1], b: p[2] });
  }
  return findings;
});

// Let's also check captura-07
const uri07 = "file:///" + path.resolve("docs/img_S07_CalisayaHelio/captura-07-crud-crear.png").replace(/\\/g, "/");
await page.goto(uri07);
const formData = await page.evaluate(() => {
  const canvas = document.createElement("canvas");
  canvas.width = 1440;
  canvas.height = 900;
  const ctx = canvas.getContext("2d");
  const img = document.querySelector("img");
  ctx.drawImage(img, 0, 0);

  const findings = [];
  for (let y = 100; y < 850; y += 10) {
    const p = ctx.getImageData(300, y, 1, 1).data;
    findings.push({ y, r: p[0], g: p[1], b: p[2] });
  }
  return findings;
});

await browser.close();
console.log("Samples extracted successfully");
