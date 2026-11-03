import { chromium } from "file:///C:/Users/Paul/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import path from "node:path";
import fs from "node:fs";

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  args: ["--use-angle=swiftshader", "--disable-gpu-sandbox"]
});

const toDataUri = (relPath) => {
  const buf = fs.readFileSync(path.resolve(relPath));
  return `data:image/png;base64,${buf.toString("base64")}`;
};

const page = await browser.newPage({ viewport: { width: 1024, height: 594 }, deviceScaleFactor: 2 });
const bg = toDataUri("docs/presentacion/lp_u02/assets/evidencia_c1_centros_faijo.png");

const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { width: 1024px; height: 594px; position: relative; font-family: 'Segoe UI', sans-serif; overflow: hidden; background: #020b19; }
    svg { position: absolute; width: 0; height: 0; }
    .bg {
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
      image-rendering: -webkit-optimize-contrast;
      filter: url(#sharpen) contrast(1.05) brightness(1.01);
    }
  </style>
</head>
<body>
  <svg>
    <filter id="sharpen">
      <feConvolveMatrix order="3" preserveAlpha="true" kernelMatrix="
         0   -0.2   0
        -0.2  1.8 -0.2
         0   -0.2   0" />
    </filter>
  </svg>
  <img class="bg" src="${bg}" />
</body>
</html>
`;

await page.setContent(html);
await page.screenshot({ path: "docs/presentacion/lp_u02/assets/test_comparison_sharpened.png" });
await browser.close();
console.log("Generated test_comparison_sharpened.png");
