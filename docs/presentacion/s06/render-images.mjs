import { chromium } from "file:///C:/Users/Paul/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import { mkdir } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const output = path.join(here, "imagenes");
const slideCatalog = [
  ["portada_s6.html", "01_portada.png"],
  ["propuesta_01_contexto.html", "02_alcance_arquitectura.png"],
  ["diapositiva-03-crud-mineros.html", "03_crud_mineros.png"],
  ["diapositiva-04-acopio-g2.html", "04_acopio_g2.png"],
  ["diapositiva-05-cierre-g1.html", "05_cierre_g1.png"],
  ["diapositiva-06-regla-cierre.html", "06_regla_cierre.png"],
  ["diapositiva-07-evidencias.html", "07_evidencias.png"],
  ["diapositiva-08-prometheus.html", "08_prometheus.png"],
  ["diapositiva-09-despedida.html", "09_despedida.png"],
];
const requested = new Set(process.argv.slice(2));
const slides = requested.size === 0
  ? slideCatalog
  : slideCatalog.filter(([, target]) => requested.has(target));

if (slides.length === 0) throw new Error("No se encontró la lámina solicitada.");

await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  args: ["--use-angle=swiftshader", "--disable-gpu-sandbox"],
});
try {
  for (const [source, target] of slides) {
    const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
    const renderUrl = pathToFileURL(path.join(here, source));
    renderUrl.searchParams.set("render", "1");
    await page.goto(renderUrl.href, { waitUntil: "domcontentloaded" });
    await page.evaluate(() => document.fonts?.ready);
    await page.waitForTimeout(250);
    await page.screenshot({ path: path.join(output, target), type: "png" });
    await page.close();
    console.log(target);
  }
} finally {
  await browser.close();
}
