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

const fileUrl = (file) => `file:///${path.resolve("docs/presentacion/lp_u02", file).replace(/\\/g, "/")}`;

console.log("=== 1. Probando 02_arquitectura_bd.html de forma independiente ===");
await page.goto(fileUrl("02_arquitectura_bd.html"), { waitUntil: "networkidle" });
await page.screenshot({ path: "docs/presentacion/lp_u02/02_bd_t1_preview.png" });
console.log("✓ Tab 1 (Esquema Completo 22 Tablas) capturado.");

// Clic en Tab 2 (Dominio Core)
await page.click('button[data-target="t2_core"]');
await page.waitForTimeout(300);
await page.screenshot({ path: "docs/presentacion/lp_u02/02_bd_t2_preview.png" });
console.log("✓ Tab 2 (Núcleo Core) capturado.");

// Clic en Tab 3 (Particionamiento)
await page.click('button[data-target="t3_part"]');
await page.waitForTimeout(300);
await page.screenshot({ path: "docs/presentacion/lp_u02/02_bd_t3_preview.png" });
console.log("✓ Tab 3 (Particionamiento Físico) capturado.");

// Clic en Tab 4 (Integridad ACID)
await page.click('button[data-target="t4_acid"]');
await page.waitForTimeout(300);
await page.screenshot({ path: "docs/presentacion/lp_u02/02_bd_t4_preview.png" });
console.log("✓ Tab 4 (Integridad ACID) capturado.");

// Abrir Modal Fullscreen
await page.click('#viewerImage');
await page.waitForTimeout(300);
await page.screenshot({ path: "docs/presentacion/lp_u02/02_bd_modal_preview.png" });
console.log("✓ Modal Fullscreen capturado.");

console.log("\n=== 2. Probando Mazo Completo (presentacion_lp.html) ===");
await page.goto(fileUrl("presentacion_lp.html#1"), { waitUntil: "networkidle" });
await page.waitForTimeout(400);
console.log("Slide 1 (Portada) URL hash:", page.url());

// Siguiente -> Slide 2 (Arquitectura BD)
await page.click('#nextSlide');
await page.waitForTimeout(400);
console.log("Slide 2 (Arquitectura BD) URL hash:", page.url());
await page.screenshot({ path: "docs/presentacion/lp_u02/deck_slide_2_bd_preview.png" });

// Siguiente -> Slide 3 (Acopiador)
await page.click('#nextSlide');
await page.waitForTimeout(400);
console.log("Slide 3 (Acopiador) URL hash:", page.url());

// Siguiente -> Slide 4 (Mayorista)
await page.click('#nextSlide');
await page.waitForTimeout(400);
console.log("Slide 4 (Mayorista) URL hash:", page.url());

// Siguiente -> Slide 5 (Despedida)
await page.click('#nextSlide');
await page.waitForTimeout(400);
console.log("Slide 5 (Despedida) URL hash:", page.url());
await page.screenshot({ path: "docs/presentacion/lp_u02/deck_slide_5_despedida_preview.png" });

await browser.close();
console.log("\n>>> Todas las pruebas de navegación e interactividad completadas con éxito.");
