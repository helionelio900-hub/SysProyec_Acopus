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

const uri05 = toDataUri("docs/img_S07_CalisayaHelio/captura-05-http-network-traceid.png");
await page.setContent(`
  <html>
    <body style="margin:0; background:#000;">
      <img src="${uri05}" style="width:1440px; height:900px; display:block;" />
    </body>
  </html>
`);

await page.screenshot({ path: "docs/presentacion/lp_u02/assets/crop_05_network.png", clip: { x: 300, y: 100, width: 1100, height: 750 } });
await browser.close();
console.log("Network crop generated!");
