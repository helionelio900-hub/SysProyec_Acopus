import { chromium } from "file:///C:/Users/Paul/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import path from "node:path";
import fs from "node:fs";

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  args: ["--use-angle=swiftshader", "--disable-gpu-sandbox"]
});

const page = await browser.newPage({ viewport: { width: 2048, height: 1152 } });
const toDataUri = (relPath) => {
  const buf = fs.readFileSync(path.resolve(relPath));
  return `data:image/jpeg;base64,${buf.toString("base64")}`;
};

const srcUri = toDataUri("docs/presentacion/lp_u02/assets/rinconada_minero_despedida.jpg");

const html = `
<!DOCTYPE html>
<html>
<body style="margin:0; background:#000; overflow:hidden;">
  <canvas id="c" width="2048" height="1152"></canvas>
  <script>
    const img = new Image();
    img.onload = () => {
      const c = document.getElementById('c');
      const ctx = c.getContext('2d');

      // 1. High quality bicubic scaling to 2048x1152
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, 2048, 1152);

      // 2. Extract image data for selective sharpening & contrast
      const imgData = ctx.getImageData(0, 0, 2048, 1152);
      const data = imgData.data;
      const copy = new Uint8ClampedArray(data);

      const w = 2048;
      const h = 1152;

      // Sharpening kernel: [0, -0.35, 0, -0.35, 2.4, -0.35, 0, -0.35, 0]
      // Apply only to areas with texture (avoid smooth sky)
      for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
          const idx = (y * w + x) * 4;
          
          // Check local variance to protect smooth sky from noise
          const top = ((y - 1) * w + x) * 4;
          const bottom = ((y + 1) * w + x) * 4;
          const left = (y * w + (x - 1)) * 4;
          const right = (y * w + (x + 1)) * 4;

          const diff = Math.abs(copy[idx] - copy[left]) + Math.abs(copy[idx] - copy[right]) +
                       Math.abs(copy[idx] - copy[top]) + Math.abs(copy[idx] - copy[bottom]);

          // If there is texture (rocks, clothing, snow edges, mountain)
          if (diff > 12) {
            for (let c = 0; c < 3; c++) {
              const val = copy[idx + c] * 2.3
                        - (copy[top + c] + copy[bottom + c] + copy[left + c] + copy[right + c]) * 0.325;
              data[idx + c] = Math.min(255, Math.max(0, val));
            }
          }

          // Subtle S-curve contrast boost (+6%)
          for (let c = 0; c < 3; c++) {
            let v = data[idx + c] / 255;
            v = v < 0.5 ? 2 * v * v : 1 - 2 * (1 - v) * (1 - v); // soft S-curve
            data[idx + c] = Math.min(255, Math.max(0, data[idx + c] * 0.85 + v * 255 * 0.15));
          }
        }
      }

      ctx.putImageData(imgData, 0, 0);
      window.__done = true;
    };
    img.src = "${srcUri}";
  </script>
</body>
</html>
`;

await page.setContent(html);
await page.waitForFunction(() => window.__done === true, { timeout: 10000 });

// Save enhanced image as PNG
const buffer = await page.evaluate(() => {
  const c = document.getElementById('c');
  return c.toDataURL('image/png').split(',')[1];
});

fs.writeFileSync(path.resolve("docs/presentacion/lp_u02/assets/rinconada_minero_hd.png"), Buffer.from(buffer, 'base64'));
await browser.close();
console.log("Enhanced 2048x1152 rinconada_minero_hd.png created successfully!");
