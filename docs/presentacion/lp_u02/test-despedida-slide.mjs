import { chromium } from "file:///C:/Users/Paul/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import path from "node:path";

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  args: ["--use-angle=swiftshader", "--disable-gpu-sandbox"]
});

const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2
});

// Test standalone 08_despedida.html
const fileUrl = "file:///" + path.resolve("docs/presentacion/lp_u02/08_despedida.html").replace(/\\/g, "/");
await page.goto(fileUrl);
await page.waitForTimeout(800);
await page.screenshot({ path: "docs/presentacion/lp_u02/08_despedida_preview.png" });
console.log("08_despedida_preview.png saved!");

// Test deck presentation on #4
const deckUrl = "file:///" + path.resolve("docs/presentacion/lp_u02/presentacion_lp.html#4").replace(/\\/g, "/");
await page.goto(deckUrl);
await page.waitForTimeout(1000);

const currentSrc = await page.evaluate(() => {
  const iframe = document.getElementById("slideFrame");
  return iframe ? iframe.getAttribute("src") : null;
});

console.log("Deck slide 4 iframe src:", currentSrc);
await page.screenshot({ path: "docs/presentacion/lp_u02/deck_slide_4_preview.png" });

await browser.close();
console.log("Despedida slide verification completed successfully!");
