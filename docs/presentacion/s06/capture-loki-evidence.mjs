import { chromium } from "file:///C:/Users/Paul/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const target = path.join(here, "assets", "evidencia-loki-stock-insuficiente.png");
const end = BigInt(Date.now()) * 1_000_000n;
const start = end - 15n * 60n * 1_000_000_000n;
const query = '{application="sitra-oro-backend", filename="/var/log/sitra-oro-backend/bomerp.log"} |= "StockInsuficienteException"';
const endpoint = `http://localhost:33100/loki/api/v1/query_range?query=${encodeURIComponent(query)}&start=${start}&end=${end}&limit=1&direction=backward`;

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  args: ["--use-angle=swiftshader", "--disable-gpu-sandbox"],
});

try {
  const page = await browser.newPage({
    viewport: { width: 1360, height: 620 },
    colorScheme: "dark",
    deviceScaleFactor: 1,
  });
  const response = await page.goto(endpoint, { waitUntil: "domcontentloaded" });
  if (!response || response.status() !== 200) {
    throw new Error(`Loki respondió ${response?.status() ?? "sin respuesta"}`);
  }
  await page.evaluate(() => {
    const raw = document.body.innerText;
    const parsed = JSON.parse(raw);
    document.body.textContent = JSON.stringify(parsed, null, 2);
  });
  await page.addStyleTag({
    content: `
      html { background: #090d12; }
      body {
        margin: 0;
        padding: 20px 28px;
        background: #090d12;
        color: #dbe8f6;
        font: 600 14px/1.4 Consolas, "Cascadia Mono", monospace;
        white-space: pre-wrap;
        overflow-wrap: anywhere;
      }
    `,
  });
  await page.screenshot({
    path: target,
    type: "png",
    clip: { x: 0, y: 0, width: 1360, height: 430 },
  });
  console.log(target);
} finally {
  await browser.close();
}
