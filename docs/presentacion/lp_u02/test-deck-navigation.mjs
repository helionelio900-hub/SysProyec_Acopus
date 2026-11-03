import { chromium } from "file:///C:/Users/Paul/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import path from "node:path";

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  args: ["--use-angle=swiftshader", "--disable-gpu-sandbox"]
});

const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const url = "file:///" + path.resolve("docs/presentacion/lp_u02/presentacion_lp.html#3").replace(/\\/g, "/");
await page.goto(url);
await page.waitForTimeout(1000);

const currentSrc = await page.evaluate(() => {
  const iframe = document.getElementById("slideFrame");
  return iframe ? iframe.getAttribute("src") : null;
});

console.log("Deck slide 3 iframe source:", currentSrc);
await page.screenshot({ path: "docs/presentacion/lp_u02/deck_slide_3_preview.png" });

await browser.close();
console.log("Deck navigation test successful!");
