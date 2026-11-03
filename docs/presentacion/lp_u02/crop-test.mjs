import { chromium } from "file:///C:/Users/Paul/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import path from "node:path";
import fs from "node:fs";

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  args: ["--use-angle=swiftshader", "--disable-gpu-sandbox"]
});

const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const toDataUri = (relPath) => {
  const buf = fs.readFileSync(path.resolve(relPath));
  return `data:image/png;base64,${buf.toString("base64")}`;
};

// Test crops in captura-06
const uri06 = toDataUri("docs/img_S07_CalisayaHelio/captura-06-crud-listar.png");
await page.setContent(`
  <html>
    <body style="margin:0; background:#000;">
      <img src="${uri06}" style="width:1440px; height:900px; display:block;" />
    </body>
  </html>
`);

// Let's crop header, table title, and the rows
await page.screenshot({ path: "docs/presentacion/lp_u02/assets/crop_06_header.png", clip: { x: 0, y: 0, width: 1440, height: 180 } });
await page.screenshot({ path: "docs/presentacion/lp_u02/assets/crop_06_table_top.png", clip: { x: 200, y: 150, width: 1040, height: 250 } });
await page.screenshot({ path: "docs/presentacion/lp_u02/assets/crop_06_table_mid.png", clip: { x: 200, y: 350, width: 1040, height: 350 } });

// Test crops in captura-07
const uri07 = toDataUri("docs/img_S07_CalisayaHelio/captura-07-crud-crear.png");
await page.setContent(`
  <html>
    <body style="margin:0; background:#000;">
      <img src="${uri07}" style="width:1440px; height:900px; display:block;" />
    </body>
  </html>
`);
await page.screenshot({ path: "docs/presentacion/lp_u02/assets/crop_07_form.png", clip: { x: 200, y: 150, width: 1040, height: 600 } });

await browser.close();
console.log("Crops generated!");
