import { chromium } from "file:///C:/Users/Paul/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import path from "node:path";
import fs from "node:fs";

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  args: ["--use-angle=swiftshader", "--disable-gpu-sandbox"]
});

const toDataUri = (relPath) => {
  const buf = fs.readFileSync(path.resolve(relPath));
  return `data:image/png;base64,${buf.toString("base64")}`;
};

const imagesToGrid = [
  { name: "grid_c1", file: "docs/img_S07_CalisayaHelio/captura-06-crud-listar.png", w: 1440, h: 900 },
  { name: "grid_c2", file: "docs/img_S07_CalisayaHelio/captura-07-crud-crear.png", w: 1440, h: 900 },
  { name: "grid_c3_trans", file: "docs/presentacion/s06/imagenes/04_acopio_g2.png", w: 1920, h: 1080 },
  { name: "grid_c3_rep", file: "docs/presentacion/s06/imagenes/07_evidencias.png", w: 1920, h: 1080 },
  { name: "grid_c4", file: "docs/img_S07_CalisayaHelio/captura-05-http-network-traceid.png", w: 1440, h: 900 },
];

for (const item of imagesToGrid) {
  const page = await browser.newPage({ viewport: { width: item.w, height: item.h } });
  const bg = toDataUri(item.file);

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { width: ${item.w}px; height: ${item.h}px; position: relative; overflow: hidden; }
      .bg { width: 100%; height: 100%; position: absolute; top: 0; left: 0; }
      .grid {
        position: absolute; inset: 0; pointer-events: none;
        background-image:
          linear-gradient(to right, rgba(255, 0, 0, 0.4) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(255, 0, 0, 0.4) 1px, transparent 1px),
          linear-gradient(to right, rgba(0, 255, 255, 0.2) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(0, 255, 255, 0.2) 1px, transparent 1px);
        background-size: 100px 100px, 100px 100px, 20px 20px, 20px 20px;
      }
      .labels {
        position: absolute; inset: 0; pointer-events: none; font-family: monospace; font-size: 11px; font-weight: bold; color: yellow;
      }
    </style>
  </head>
  <body>
    <img class="bg" src="${bg}" />
    <div class="grid"></div>
    <svg class="labels" width="${item.w}" height="${item.h}">
      ${Array.from({ length: Math.floor(item.w / 100) + 1 }, (_, i) => `<text x="${i * 100 + 2}" y="15" fill="#00ffff">${i * 100}</text>`).join("")}
      ${Array.from({ length: Math.floor(item.h / 100) + 1 }, (_, i) => `<text x="2" y="${i * 100 + 15}" fill="#ff5555">${i * 100}</text>`).join("")}
    </svg>
  </body>
  </html>
  `;

  await page.setContent(html);
  await page.screenshot({ path: `debug_${item.name}.png` });
  await page.close();
  console.log(`Saved debug_${item.name}.png`);
}

await browser.close();
console.log("All grid images created!");
