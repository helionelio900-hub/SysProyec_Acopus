import { chromium } from "file:///C:/Users/Paul/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import path from "node:path";
import fs from "node:fs";

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  args: ["--use-angle=swiftshader", "--disable-gpu-sandbox"]
});

const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });

const toDataUri = (relPath) => {
  const buf = fs.readFileSync(path.resolve(relPath));
  return `data:image/jpeg;base64,${buf.toString("base64")}`;
};

const bg = toDataUri("docs/presentacion/lp_u02/assets/rinconada_minero_despedida.jpg");

// Option A: Left-aligned content, miner on the right completely clear
const htmlA = `
<!doctype html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>SITRA-ORO · Despedida</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --navy: #020b19;
      --gold: #f2b736;
      --gold-soft: #f8cf76;
      --text: #f7f9fc;
      --dim: #a8b8cf;
      --line: rgba(139, 178, 225, .20);
      --font-mono: 'JetBrains Mono', Consolas, monospace;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { width: 100%; height: 100%; overflow: hidden; background: var(--navy); color: var(--text); font-family: 'Plus Jakarta Sans', sans-serif; }
    .slide { position: relative; width: 100vw; height: 100vh; overflow: hidden; }

    .cbg { position: absolute; inset: 0; z-index: 0; }
    .cbg img { width: 100%; height: 100%; object-fit: cover; object-position: 75% center; }
    .cbg::after {
      content: ""; position: absolute; inset: 0;
      background:
        linear-gradient(90deg, rgba(2, 11, 25, .96) 0%, rgba(2, 11, 25, .88) 38%, rgba(2, 11, 25, .45) 62%, rgba(2, 11, 25, .08) 100%),
        linear-gradient(180deg, rgba(2, 11, 25, .75) 0%, transparent 25%, transparent 75%, rgba(2, 11, 25, .88) 100%);
    }

    header {
      position: absolute; z-index: 5; top: 0; left: 0; right: 0; height: 74px; padding: 0 48px;
      display: flex; align-items: center; justify-content: space-between;
      background: rgba(2, 11, 25, .78); border-bottom: 1px solid rgba(139, 178, 225, .14); backdrop-filter: blur(10px);
    }
    .upeu { height: 42px; filter: brightness(0) invert(1); }
    .career { display: flex; align-items: center; gap: 12px; }
    .career img { width: 40px; height: 40px; object-fit: contain; }
    .career small { display: block; color: #bdcbe0; font: 600 10px/1 'Plus Jakarta Sans', sans-serif; letter-spacing: .12em; text-transform: uppercase; }
    .career b { display: block; margin-top: 4px; font-size: 13.5px; letter-spacing: -.02em; }

    .wrap {
      position: relative; z-index: 2; height: calc(100% - 124px); margin-top: 74px;
      display: flex; flex-direction: column; justify-content: center;
      padding: 0 6vw; max-width: 820px;
    }

    .eyebrow {
      display: inline-flex; align-items: center; gap: 12px; color: var(--gold);
      font: 700 12px/1 var(--font-mono); letter-spacing: .22em; text-transform: uppercase; margin-bottom: 14px;
    }
    .eyebrow::before { content: ""; width: 36px; height: 2px; border-radius: 4px; background: var(--gold); }

    h1 {
      font-size: clamp(54px, 5.5vw, 84px); font-weight: 800; line-height: 1; letter-spacing: -.035em; text-transform: uppercase; margin-bottom: 16px;
    }
    h1 .w { color: #ffffff; }
    h1 .g { color: var(--gold); text-shadow: 0 0 35px rgba(242, 183, 54, .55); }

    .verse {
      font-size: clamp(16px, 1.45vw, 20px); font-weight: 400; font-style: italic; line-height: 1.5; color: #e2e8f0;
      max-width: 48ch; text-shadow: 0 2px 10px rgba(0, 0, 0, .8); margin-bottom: 12px;
    }

    .ref {
      display: inline-block; align-self: flex-start; padding: 5px 16px;
      background: rgba(7, 20, 38, .85); border: 1px solid rgba(242, 183, 54, .45); border-radius: 20px;
      font-family: var(--font-mono); font-size: 11px; font-weight: 700; letter-spacing: .2em; text-transform: uppercase;
      color: var(--gold-soft); backdrop-filter: blur(8px); margin-bottom: 24px;
    }

    .team-card {
      background: rgba(8, 22, 43, 0.85); border: 1px solid var(--line); border-left: 3px solid var(--gold);
      border-radius: 10px; padding: 14px 20px; backdrop-filter: blur(10px); display: inline-flex; flex-direction: column; gap: 8px;
    }
    .team-names {
      font-size: 16.5px; font-weight: 700; color: #ffffff; display: flex; align-items: center; gap: 12px;
    }
    .team-names i { font-style: normal; color: var(--gold); font-size: 12px; }
    .team-meta {
      font-size: 12px; font-weight: 500; color: #cbd5e1; display: flex; align-items: center; gap: 10px; font-family: var(--font-mono);
    }
    .team-meta .lb { color: var(--gold); font-weight: 700; text-transform: uppercase; font-size: 10px; letter-spacing: .1em; margin-right: 3px; }
    .team-meta b { color: #f8fafc; font-weight: 600; }
    .team-meta .sep { color: rgba(139, 178, 225, .5); }

    .location-tag {
      position: absolute; right: 48px; bottom: 68px; z-index: 3;
      background: rgba(7, 20, 38, 0.88); border: 1px solid rgba(242, 183, 54, 0.35); border-radius: 6px;
      padding: 8px 14px; font-size: 11px; font-family: var(--font-mono); color: #dce7f5; backdrop-filter: blur(8px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.6); display: flex; align-items: center; gap: 8px;
    }
    .location-tag i { color: var(--gold); font-style: normal; }

    footer {
      position: absolute; z-index: 5; left: 0; right: 0; bottom: 0; height: 50px; padding: 0 48px;
      display: grid; grid-template-columns: 1fr auto 1fr; align-items: center;
      border-top: 1px solid rgba(139, 178, 225, .14); background: rgba(2, 11, 25, .86); backdrop-filter: blur(8px);
    }
    .count { display: flex; align-items: center; gap: 14px; color: #dce7f5; font: 600 11px/1 var(--font-mono); letter-spacing: .14em; }
    .count::before { content: ""; width: 36px; height: 3px; border-radius: 4px; background: linear-gradient(90deg, var(--gold), rgba(242, 183, 54, .08)); }
    .dots { display: flex; gap: 8px; }
    .dots i { width: 8px; height: 8px; border-radius: 50%; border: 1px solid rgba(139, 178, 225, .45); }
    .dots i.on { width: 24px; border-radius: 8px; border-color: var(--gold); background: var(--gold); }
    .brand { justify-self: end; color: #b8c6dc; font: 600 11px/1 var(--font-mono); letter-spacing: .18em; text-transform: uppercase; }
  </style>
</head>
<body>
<section class="slide">
  <div class="cbg"><img src="${bg}" /></div>
  <header>
    <img class="upeu" src="file:///${path.resolve("docs/presentacion/lp_u02/assets/upeu.png").replace(/\\/g, "/")}" />
    <div class="career">
      <img src="file:///${path.resolve("docs/presentacion/lp_u02/assets/ingenieria-sistemas.png").replace(/\\/g, "/")}" />
      <div><small>Escuela Profesional de</small><b>Ingeniería de Sistemas</b></div>
    </div>
  </header>

  <div class="wrap">
    <div class="eyebrow">SITRA-ORO · EQUIPO 05</div>
    <h1><span class="w">MUCHAS </span><span class="g">GRACIAS</span></h1>
    <p class="verse">&ldquo;Y todo lo que hac&eacute;is, hacedlo de coraz&oacute;n, como para el Se&ntilde;or y no para los hombres.&rdquo;</p>
    <span class="ref">Colosenses 3:23</span>
    
    <div class="team-card">
      <div class="team-names">
        <span>Faijo Calisaya Helio Paul</span>
        <i>●</i>
        <span>Figueroa Chambi Jhymel Nelio</span>
      </div>
      <div class="team-meta">
        <span><span class="lb">Docente</span><b>Ing. Abel Angel Sull&oacute;n Macalup&uacute;</b></span>
        <span class="sep">●</span>
        <span><span class="lb">UPeU</span><b>Campus Juliaca</b></span>
        <span class="sep">●</span>
        <b>LP2 2026</b>
      </div>
    </div>
  </div>

  <div class="location-tag">
    <i>🏔️</i> <span>LA RINCONADA · 5,100 M.S.N.M. · PUNO, PERÚ</span>
  </div>

  <footer>
    <div class="count">08 / 08</div>
    <div class="dots"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i class="on"></i></div>
    <span class="brand">SITRA-ORO · UPEU JULIACA</span>
  </footer>
</section>
</body>
</html>
`;

await page.setContent(htmlA);
await page.screenshot({ path: "docs/presentacion/lp_u02/test_despedida_miner.png" });
await browser.close();
console.log("Saved test_despedida_miner.png");
