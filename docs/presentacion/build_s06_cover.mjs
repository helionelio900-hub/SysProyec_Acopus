import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { Presentation, PresentationFile } from "@oai/artifact-tool";

const {
  SKILL_DIR,
  TMP_DIR,
  WORKSPACE_DIR,
  FINAL_PPTX,
  RUNTIME_PYTHON,
} = process.env;

for (const [name, value] of Object.entries({
  SKILL_DIR,
  TMP_DIR,
  WORKSPACE_DIR,
  FINAL_PPTX,
  RUNTIME_PYTHON,
})) {
  if (!value || !path.isAbsolute(value)) {
    throw new Error(`${name} debe ser una ruta absoluta`);
  }
}

const { resolvePresentationFont, finalizePresentation } = await import(
  pathToFileURL(path.join(SKILL_DIR, "container_tools/artifact_tool_utils.mjs")).href,
);

const fontFamily = resolvePresentationFont({ fontFamily: "Aptos" });
const presentation = Presentation.create({
  slideSize: { width: 1280, height: 720 },
});
const slide = presentation.slides.add();
slide.background.fill = "#071A31";

const imagePath = path.join(
  WORKSPACE_DIR,
  "docs",
  "presentacion",
  "assets",
  "sitra-oro-acopio-cover.png",
);
const imageBytes = await fs.readFile(imagePath);
slide.images.add({
  blob: new Uint8Array(imageBytes),
  contentType: "image/png",
  alt: "Ilustración del pesaje de una pequeña muestra de oro en un centro de acopio andino",
  fit: "cover",
  position: { left: 0, top: 0, width: 1280, height: 720 },
});

function addText(text, position, style = {}) {
  const shape = slide.shapes.add({
    geometry: "textbox",
    position,
    fill: "none",
    line: { fill: "none", width: 0 },
  });
  shape.text = text;
  shape.text.style = {
    typeface: fontFamily,
    fontSize: 20,
    color: "#FFFFFF",
    autoFit: "none",
    wrap: "square",
    verticalAlignment: "middle",
    alignment: "left",
    insets: { left: 0, right: 0, top: 0, bottom: 0 },
    ...style,
  };
  return shape;
}

addText(
  "EQUIPO 05  ·  LP2  ·  UNIDAD I",
  { left: 72, top: 48, width: 500, height: 28 },
  { fontSize: 15, bold: true, color: "#E2B95B" },
);

addText(
  "SITRA-ORO",
  { left: 72, top: 102, width: 610, height: 86 },
  { fontSize: 59, bold: true, color: "#FFFFFF" },
);

const accent = slide.shapes.add({
  geometry: "rect",
  position: { left: 72, top: 195, width: 92, height: 5 },
  fill: "#E2B95B",
  line: { fill: "none", width: 0 },
});
accent.name = "Acento dorado";

addText(
  "Trazabilidad clara.\nLiquidaciones confiables.",
  { left: 72, top: 220, width: 590, height: 92 },
  { fontSize: 31, bold: true, color: "#F4D58D" },
);

addText(
  "Backend REST para registrar compras de oro, controlar el stock por color y liquidar cierres semanales entre el acopiador G2 y el mayorista G1.",
  { left: 72, top: 326, width: 565, height: 78 },
  { fontSize: 19, color: "#E5EDF6" },
);

const capabilities = [
  ["01", "Compras G2"],
  ["02", "Stock rojo / verde"],
  ["03", "Liquidación semanal"],
  ["04", "Filtros y reportes"],
];
const starts = [
  { left: 72, top: 442 },
  { left: 338, top: 442 },
  { left: 72, top: 500 },
  { left: 338, top: 500 },
];

capabilities.forEach(([number, label], index) => {
  const { left, top } = starts[index];
  addText(number, { left, top, width: 34, height: 28 }, {
    fontSize: 14,
    bold: true,
    color: "#E2B95B",
  });
  addText(label, { left: left + 42, top, width: 205, height: 28 }, {
    fontSize: 17,
    bold: true,
    color: "#FFFFFF",
  });
});

const footerRule = slide.shapes.add({
  geometry: "rect",
  position: { left: 72, top: 598, width: 565, height: 1 },
  fill: "#7890AA",
  line: { fill: "none", width: 0 },
});
footerRule.name = "Separador del equipo";

addText(
  "Faijo Calisaya Helio Paul  ·  Figueroa Chambi Jhymel Nelio",
  { left: 72, top: 618, width: 500, height: 46 },
  { fontSize: 14, color: "#C9D6E5" },
);
addText(
  "ALCANCE S1—S5",
  { left: 504, top: 620, width: 133, height: 30 },
  { fontSize: 13, bold: true, color: "#E2B95B", alignment: "right" },
);

slide.speakerNotes.textFrame.setText(
  "Portada de la sustentación S6. Alcance declarado: backend REST de LP2, sesiones S1–S5; no incluye frontend ni seguridad JWT. Las capacidades se verifican en docs/proyecto-integrador/u1/lp2-demo.md. Referencia docente: https://262ciclo4.github.io/bomerp/lp2/sesiones/S06_Evaluacion_Unidad_1/. La fotografía es una ilustración generada para esta portada y no representa un evento real.",
);

await fs.mkdir(TMP_DIR, { recursive: true });
await fs.mkdir(path.dirname(FINAL_PPTX), { recursive: true });

const preview = await presentation.export({ slide, format: "png", scale: 1 });
await fs.writeFile(
  path.join(TMP_DIR, "sitra-oro-s06-cover-preview.png"),
  new Uint8Array(await preview.arrayBuffer()),
);

const layout = await slide.export({ format: "layout" });
await fs.writeFile(
  path.join(TMP_DIR, "sitra-oro-s06-cover.layout.json"),
  await layout.text(),
);

const stagingDir = path.join(WORKSPACE_DIR, ".codex-finalizer-s06");
await fs.mkdir(stagingDir, { recursive: true });
const candidatePath = path.join(stagingDir, "SITRA_ORO_S06_Portada.candidate.pptx");
await (await PresentationFile.exportPptx(presentation)).save(candidatePath);

await finalizePresentation({
  explicitTotalSlideCount: 1,
  requiredNativeTableOwnerSlides: [],
  requiredNativeChartOwnerSlides: [],
  workspaceDir: WORKSPACE_DIR,
  candidatePath,
  finalPath: FINAL_PPTX,
  pythonExecutable: RUNTIME_PYTHON,
  integrityValidatorPath: path.join(
    SKILL_DIR,
    "container_tools/inspect_presentation_package_integrity.py",
  ),
  layoutValidatorPath: path.join(
    SKILL_DIR,
    "container_tools/inspect_presentation_layout_geometry.py",
  ),
  layoutArgs: [
    "--expected-slide-size-emu",
    "12192000,6858000",
    "--validate-bullet-geometry",
    "--validate-heading-fit",
  ],
  fontPolicy: { basis: "design", families: [fontFamily] },
  verifyArtifactToolImport: true,
  receiptPath: path.join(
    stagingDir,
    "SITRA_ORO_S06_Portada.validation.json",
  ),
});

console.log(`Presentación final: ${FINAL_PPTX}`);
