import { chromium } from "file:///C:/Users/Paul/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import path from "node:path";

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  args: ["--use-angle=swiftshader", "--disable-gpu-sandbox"]
});

const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("file:///" + path.resolve("docs/img_S07_CalisayaHelio/captura-06-crud-listar.png").replace(/\\/g, "/"));

const tableDetails = await page.evaluate(() => {
  const canvas = document.createElement("canvas");
  canvas.width = 1440;
  canvas.height = 900;
  const ctx = canvas.getContext("2d");
  const img = document.querySelector("img");
  ctx.drawImage(img, 0, 0);

  // Let's find table horizontal borders between x=300 and x=1350
  // Background of table row is typically dark blue #0b1f38 or alternating
  // Row border is a 1px line of #1b3558 or similar
  const borderY = [];
  for (let y = 240; y < 800; y++) {
    let lineMatches = 0;
    for (let x = 300; x < 1350; x += 50) {
      const p = ctx.getImageData(x, y, 1, 1).data;
      // Border line is noticeably brighter than row background
      if (p[0] > 25 && p[0] < 60 && p[1] > 50 && p[1] < 100 && p[2] > 80 && p[2] < 150) {
        lineMatches++;
      }
    }
    if (lineMatches > 15) {
      borderY.push(y);
    }
  }

  // Also let's check table left and right bounds:
  let tableLeft = 0, tableRight = 1440;
  for (let x = 200; x < 500; x++) {
    const p = ctx.getImageData(x, 300, 1, 1).data;
    if (p[0] > 15 || p[1] > 30 || p[2] > 50) {
      tableLeft = x;
      break;
    }
  }
  for (let x = 1420; x > 1000; x--) {
    const p = ctx.getImageData(x, 300, 1, 1).data;
    if (p[0] > 15 || p[1] > 30 || p[2] > 50) {
      tableRight = x;
      break;
    }
  }

  return { borderY, tableLeft, tableRight };
});

console.log("Table details:", tableDetails);
await browser.close();
