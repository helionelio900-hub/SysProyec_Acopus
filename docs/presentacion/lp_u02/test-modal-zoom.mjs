import { chromium } from "file:///C:/Users/Paul/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import { pathToFileURL } from "node:url";
import path from "node:path";

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  args: ["--use-angle=swiftshader", "--disable-gpu-sandbox"]
});

const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
const fileUrl = pathToFileURL(path.resolve("docs/presentacion/lp_u02/06_modulo_mayorista.html")).href;

await page.goto(fileUrl, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(400);

// Click on the image to open the modal
await page.click("#viewerImage");
await page.waitForTimeout(400);

// Capture modal zoomed screenshot
await page.screenshot({ path: "docs/presentacion/lp_u02/06_modal_zoom_preview.png" });

await browser.close();
console.log("Modal zoom preview captured successfully.");
