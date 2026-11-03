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

const fileUrl = "file:///" + path.resolve("docs/presentacion/lp_u02/08_despedida.html").replace(/\\/g, "/");
await page.goto(fileUrl);
await page.waitForTimeout(600);

// Screenshot full slide
await page.screenshot({ path: "docs/presentacion/lp_u02/08_despedida_hd_preview.png" });

// Screenshot crop of the team card (autores + docente line)
const card = await page.$(".team-card");
if (card) {
  await card.screenshot({ path: "docs/presentacion/lp_u02/08_team_card_crop.png" });
}

await browser.close();
console.log("Verification screenshots saved!");
