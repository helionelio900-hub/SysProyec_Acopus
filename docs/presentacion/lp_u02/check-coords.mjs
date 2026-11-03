import { chromium } from "file:///C:/Users/Paul/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import path from "node:path";
import fs from "node:fs";

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  args: ["--use-angle=swiftshader", "--disable-gpu-sandbox"]
});

const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

// Let's inspect coordinates of table header, row 6 (Figueroa Nelio), and action button in captura-06
const uri06 = "file:///" + path.resolve("docs/img_S07_CalisayaHelio/captura-06-crud-listar.png").replace(/\\/g, "/");
await page.goto(uri06);

// We can take crops of various vertical sections of captura-06 to locate rows accurately
const slices = [
  { name: "title_slice", y: 80, h: 100 },
  { name: "table_head_slice", y: 180, h: 80 },
  { name: "table_rows_1_3", y: 260, h: 150 },
  { name: "table_rows_4_6", y: 410, h: 160 },
  { name: "table_bottom", y: 570, h: 160 }
];

for (const s of slices) {
  await page.screenshot({
    path: `docs/presentacion/lp_u02/assets/check_06_${s.name}.png`,
    clip: { x: 100, y: s.y, width: 1240, height: s.h }
  });
}

// In captura-07: form fields
const uri07 = "file:///" + path.resolve("docs/img_S07_CalisayaHelio/captura-07-crud-crear.png").replace(/\\/g, "/");
await page.goto(uri07);

const formSlices = [
  { name: "form_head", y: 80, h: 120 },
  { name: "field_dni", y: 200, h: 100 },
  { name: "field_name", y: 300, h: 100 },
  { name: "field_zone", y: 400, h: 120 },
  { name: "form_buttons", y: 520, h: 100 }
];

for (const s of formSlices) {
  await page.screenshot({
    path: `docs/presentacion/lp_u02/assets/check_07_${s.name}.png`,
    clip: { x: 100, y: s.y, width: 1240, height: s.h }
  });
}

await browser.close();
console.log("Coordinate check slices generated!");
