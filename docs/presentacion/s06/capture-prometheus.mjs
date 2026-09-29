import { chromium } from "file:///C:/Users/Paul/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const target = path.join(here, "assets", "evidencia-prometheus-endpoint.png");
const endpoint = "http://localhost:8081/actuator/prometheus";

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  args: ["--force-dark-mode", "--use-angle=swiftshader", "--disable-gpu-sandbox"],
});

try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    colorScheme: "dark",
    deviceScaleFactor: 1,
  });
  const response = await page.goto(endpoint, { waitUntil: "networkidle" });
  if (!response || response.status() !== 200) {
    throw new Error(`El endpoint respondió ${response?.status() ?? "sin respuesta"}`);
  }
  await page.addStyleTag({
    content: `
      html { background: #050b12; }
      body {
        margin: 0;
        padding: 30px 34px;
        background: #050b12;
        color: #d8e7f7;
        font: 500 14px/1.46 Consolas, "Cascadia Mono", monospace;
        tab-size: 2;
      }
      pre { margin: 0; white-space: pre-wrap; overflow-wrap: anywhere; }
    `,
  });
  await page.screenshot({ path: target, type: "png" });
  console.log(target);
} finally {
  await browser.close();
}
