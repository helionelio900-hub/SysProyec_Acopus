import { chromium } from "file:///C:/Users/Paul/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const target = path.join(here, "assets", "evidencia-prometheus-target-up.png");
const endpoint = "http://localhost:39090/targets";

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  args: ["--use-angle=swiftshader", "--disable-gpu-sandbox"],
});

try {
  const page = await browser.newPage({
    viewport: { width: 1360, height: 760 },
    colorScheme: "dark",
    deviceScaleFactor: 1,
  });

  const response = await page.goto(endpoint, { waitUntil: "domcontentloaded" });
  if (!response || response.status() !== 200) {
    throw new Error(`Prometheus respondió ${response?.status() ?? "sin respuesta"}`);
  }
  await page.waitForTimeout(5000);
  await page.screenshot({
    path: target,
    type: "png",
    clip: { x: 0, y: 0, width: 1360, height: 330 },
  });
  console.log(target);
} finally {
  await browser.close();
}
