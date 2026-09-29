import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const templateDocxPath = path.join(here, "S05_LP2_Equipo05_CalisayaHelio_TemaOscuro.docx");
const imgDir = path.join(here, "img_S07_CalisayaHelio");

// Import JSZip from codex runtimes
const jszipModule = await import("file:///C:/Users/Paul/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/jszip/lib/index.js");
const JSZip = jszipModule.default || jszipModule;

const logo1Buffer = fs.readFileSync("E:/Upeu/LOGO UPEU1.png");
const logo2Buffer = fs.readFileSync("E:/Upeu/LOGOUPEU2.png");

// Read capture buffers
const captureBuffers = [];
for (let i = 1; i <= 10; i++) {
  const pad = i < 10 ? `0${i}` : `${i}`;
  const files = fs.readdirSync(imgDir).filter(f => f.startsWith(`captura-${pad}`));
  if (files.length > 0) {
    captureBuffers.push(fs.readFileSync(path.join(imgDir, files[0])));
  } else {
    captureBuffers.push(null);
  }
}

function buildDocumentXml(mode = "plantilla") {
  // Helper for text runs
  const r = (text, opts = {}) => {
    const { b = false, i = false, color = null, size = 20, font = "Arial" } = opts;
    let rPr = `<w:rPr><w:rFonts w:ascii="${font}" w:hAnsi="${font}"/><w:sz w:val="${size}"/>`;
    if (b) rPr += `<w:b/>`;
    if (i) rPr += `<w:i/>`;
    if (color) rPr += `<w:color w:val="${color}"/>`;
    rPr += `</w:rPr>`;
    return `<w:r>${rPr}<w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r>`;
  };

  const p = (content, opts = {}) => {
    const { jc = "left", pb = false, spaceBefore = 0, spaceAfter = 120 } = opts;
    let pPr = `<w:pPr><w:jc w:val="${jc}"/><w:spacing w:before="${spaceBefore}" w:after="${spaceAfter}"/>`;
    if (pb) pPr += `<w:pageBreakBefore/>`;
    pPr += `</w:pPr>`;
    return `<w:p>${pPr}${content}</w:p>`;
  };

  const escapeXml = (unsafe) => {
    return (unsafe || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  };

  // Helper for drawing image
  const drawing = (rId, cx, cy, id, name) => `
    <w:r>
      <w:rPr><w:noProof/></w:rPr>
      <w:drawing>
        <wp:inline distT="0" distB="0" distL="0" distR="0">
          <wp:extent cx="${cx}" cy="${cy}"/>
          <wp:effectExtent l="0" t="0" r="0" b="0"/>
          <wp:docPr id="${id}" name="${name}"/>
          <wp:cNvGraphicFramePr><a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/></wp:cNvGraphicFramePr>
          <a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
            <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
              <pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
                <pic:nvPicPr>
                  <pic:cNvPr id="${id}" name="${name}"/>
                  <pic:cNvPicPr/>
                </pic:nvPicPr>
                <pic:blipFill>
                  <a:blip r:embed="${rId}"/>
                  <a:stretch><a:fillRect/></a:stretch>
                </pic:blipFill>
                <pic:spPr>
                  <a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm>
                  <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
                </pic:spPr>
              </pic:pic>
            </a:graphicData>
          </a:graphic>
        </wp:inline>
      </w:drawing>
    </w:r>
  `;

  // Capture Box or Image
  const captureBlock = (num, title, hint, explanation, rId) => {
    let mediaXml = "";
    if (mode === "completo" && rId) {
      // 16:9 ratio, width 5580000 EMUs (15.5 cm), height 3140000 EMUs (8.7 cm)
      mediaXml = p(drawing(rId, 5580000, 3140000, 100 + num, `Captura_${num}`), { jc: "center", spaceAfter: 80 });
    } else {
      // Editable Word placeholder box table
      mediaXml = `
        <w:tbl>
          <w:tblPr>
            <w:tblW w:w="9500" w:type="dxa"/>
            <w:tblBorders>
              <w:top w:val="dashed" w:sz="12" w:space="0" w:color="0284C7"/>
              <w:left w:val="dashed" w:sz="12" w:space="0" w:color="0284C7"/>
              <w:bottom w:val="dashed" w:sz="12" w:space="0" w:color="0284C7"/>
              <w:right w:val="dashed" w:sz="12" w:space="0" w:color="0284C7"/>
            </w:tblBorders>
            <w:tblCellMar>
              <w:top w:w="300" w:type="dxa"/>
              <w:left w:w="300" w:type="dxa"/>
              <w:bottom w:w="300" w:type="dxa"/>
              <w:right w:w="300" w:type="dxa"/>
            </w:tblCellMar>
          </w:tblPr>
          <w:tblGrid><w:gridCol w:w="9500"/></w:tblGrid>
          <w:tr>
            <w:tc>
              <w:tcPr>
                <w:tcW w:w="9500" w:type="dxa"/>
                <w:shd w:val="clear" w:color="auto" w:fill="F8FAFC"/>
                <w:vAlign w:val="center"/>
              </w:tcPr>
              ${p(r(`📷 [ CLIC AQUÍ Y PEGAR CAPTURA ${num} (Ctrl + V) ]`, { b: true, size: 22, color: "0284C7" }), { jc: "center", spaceAfter: 40 })}
              ${p(r(title, { b: true, size: 19, color: "1E293B" }), { jc: "center", spaceAfter: 40 })}
              ${p(r(hint, { i: true, size: 17, color: "64748B" }), { jc: "center", spaceAfter: 40 })}
              ${p(r("⚠️ Verificación: La captura debe mostrar la ventana completa con reloj del sistema (22/09/2026) y usuario visible sin recortar", { b: true, size: 16, color: "16A34A" }), { jc: "center", spaceAfter: 0 })}
            </w:tc>
          </w:tr>
        </w:tbl>
      `;
    }

    return `
      ${p(r(`Captura ${num}. ${title}`, { b: true, size: 21, color: "0F172A" }), { spaceBefore: 140, spaceAfter: 40 })}
      ${p(r(hint, { i: true, size: 18, color: "475569" }), { spaceAfter: 80 })}
      ${mediaXml}
      ${p(r("Explicación. ", { b: true, size: 18, color: "0F172A" }) + r(explanation, { size: 18, color: "1E293B" }), { spaceBefore: 60, spaceAfter: 160 })}
    `;
  };

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas" xmlns:cx="http://schemas.microsoft.com/office/drawing/2014/chartex" xmlns:cx1="http://schemas.microsoft.com/office/drawing/2015/9/8/chartex" xmlns:cx2="http://schemas.microsoft.com/office/drawing/2015/10/21/chartex" xmlns:cx3="http://schemas.microsoft.com/office/drawing/2016/5/9/chartex" xmlns:cx4="http://schemas.microsoft.com/office/drawing/2016/5/10/chartex" xmlns:cx5="http://schemas.microsoft.com/office/drawing/2016/5/11/chartex" xmlns:cx6="http://schemas.microsoft.com/office/drawing/2016/5/12/chartex" xmlns:cx7="http://schemas.microsoft.com/office/drawing/2016/5/13/chartex" xmlns:cx8="http://schemas.microsoft.com/office/drawing/2016/5/14/chartex" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" xmlns:aink="http://schemas.microsoft.com/office/drawing/2016/ink" xmlns:am3d="http://schemas.microsoft.com/office/drawing/2017/model3d" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:oel="http://schemas.microsoft.com/office/2019/extlst" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:wp14="http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:w10="urn:schemas-microsoft-com:office:word" xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml" xmlns:w15="http://schemas.microsoft.com/office/word/2012/wordml" xmlns:w16cex="http://schemas.microsoft.com/office/word/2018/wordml/cex" xmlns:w16cid="http://schemas.microsoft.com/office/word/2016/wordml/cid" xmlns:w16="http://schemas.microsoft.com/office/word/2018/wordml" xmlns:w16du="http://schemas.microsoft.com/office/word/2023/wordml/word16du" xmlns:w16sdtdh="http://schemas.microsoft.com/office/word/2020/wordml/sdtdatahash" xmlns:w16sdtfl="http://schemas.microsoft.com/office/word/2024/wordml/sdtformatlock" xmlns:w16se="http://schemas.microsoft.com/office/word/2015/wordml/symex" xmlns:wpg="http://schemas.microsoft.com/office/word/2010/wordprocessingGroup" xmlns:wpi="http://schemas.microsoft.com/office/word/2010/wordprocessingInk" xmlns:wne="http://schemas.microsoft.com/office/word/2006/wordml" xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape" mc:Ignorable="w14 w15 w16se w16cid w16 w16cex w16sdtdh w16sdtfl w16du wp14">
<w:body>

  <!-- TOP HEADER TABLE WITH BOTH UPEU LOGOS (LEFT & RIGHT) -->
  <w:tbl>
    <w:tblPr>
      <w:tblW w:w="9500" w:type="dxa"/>
      <w:tblBorders>
        <w:top w:val="none"/><w:left w:val="none"/><w:bottom w:val="single" w:sz="12" w:space="0" w:color="0284C7"/><w:right w:val="none"/>
      </w:tblBorders>
      <w:tblCellMar><w:top w:w="80" w:type="dxa"/><w:left w:w="60" w:type="dxa"/><w:bottom w:w="120" w:type="dxa"/><w:right w:w="60" w:type="dxa"/></w:tblCellMar>
    </w:tblPr>
    <w:tblGrid>
      <w:gridCol w:w="2200"/>
      <w:gridCol w:w="5700"/>
      <w:gridCol w:w="1600"/>
    </w:tblGrid>
    <w:tr>
      <!-- LOGO 1: UPeU Institucional (Izquierda) -->
      <w:tc>
        <w:tcPr><w:tcW w:w="2200" w:type="dxa"/><w:vAlign w:val="center"/></w:tcPr>
        ${p(drawing("rIdLogo1", 1850000, 610000, 1, "LogoUPEU1"), { jc: "left", spaceAfter: 0 })}
      </w:tc>
      <!-- TEXTO INSTITUCIONAL CENTRAL -->
      <w:tc>
        <w:tcPr><w:tcW w:w="5700" w:type="dxa"/><w:vAlign w:val="center"/></w:tcPr>
        ${p(r("UNIVERSIDAD PERUANA UNIÓN", { b: true, size: 24, color: "0F172A" }), { jc: "center", spaceAfter: 30 })}
        ${p(r("Escuela Profesional de Ingeniería de Sistemas", { b: true, size: 19, color: "475569" }), { jc: "center", spaceAfter: 0 })}
      </w:tc>
      <!-- LOGO 2: EPIS Emblema (Derecha) -->
      <w:tc>
        <w:tcPr><w:tcW w:w="1600" w:type="dxa"/><w:vAlign w:val="center"/></w:tcPr>
        ${p(drawing("rIdLogo2", 850000, 850000, 2, "LogoUPEU2"), { jc: "right", spaceAfter: 0 })}
      </w:tc>
    </w:tr>
  </w:tbl>

  <!-- TITLE BLOCK -->
  ${p(r("Informe de evidencia de aprendizaje", { b: true, size: 34, color: "0F172A" }), { jc: "center", spaceBefore: 200, spaceAfter: 60 })}
  ${p(r("S07 Creación y Arquitectura de la SPA", { b: true, size: 26, color: "1E3A8A" }), { jc: "center", spaceAfter: 60 })}
  ${p(r("SITRA-ORO", { b: true, size: 28, color: "0F172A" }), { jc: "center", spaceAfter: 40 })}
  ${p(r("Sistema de Información, Trazabilidad y Liquidación en Acopio de Oro", { i: true, size: 20, color: "475569" }), { jc: "center", spaceAfter: 200 })}

  <!-- 1. DATOS DEL ESTUDIANTE -->
  ${p(r("1. Datos del estudiante", { b: true, size: 24, color: "0F172A" }), { spaceBefore: 120, spaceAfter: 80 })}

  <w:tbl>
    <w:tblPr>
      <w:tblW w:w="9500" w:type="dxa"/>
      <w:tblLayout w:type="fixed"/>
      <w:tblBorders>
        <w:top w:val="single" w:sz="6" w:space="0" w:color="CBD5E1"/>
        <w:left w:val="single" w:sz="6" w:space="0" w:color="CBD5E1"/>
        <w:bottom w:val="single" w:sz="6" w:space="0" w:color="CBD5E1"/>
        <w:right w:val="single" w:sz="6" w:space="0" w:color="CBD5E1"/>
        <w:insideH w:val="single" w:sz="6" w:space="0" w:color="CBD5E1"/>
        <w:insideV w:val="single" w:sz="6" w:space="0" w:color="CBD5E1"/>
      </w:tblBorders>
      <w:tblCellMar><w:top w:w="120" w:type="dxa"/><w:left w:w="160" w:type="dxa"/><w:bottom w:w="120" w:type="dxa"/><w:right w:w="160" w:type="dxa"/></w:tblCellMar>
    </w:tblPr>
    <w:tblGrid><w:gridCol w:w="2400"/><w:gridCol w:w="7100"/></w:tblGrid>
    <!-- Row 1: Nombre -->
    <w:tr>
      <w:tc><w:tcPr><w:tcW w:w="2400" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="1E3A8A"/><w:vAlign w:val="center"/></w:tcPr>${p(r("Nombre", { b: true, color: "FFFFFF", size: 19 }), { spaceAfter: 0 })}</w:tc>
      <w:tc><w:tcPr><w:tcW w:w="7100" w:type="dxa"/><w:vAlign w:val="center"/></w:tcPr>${p(r("Faijo Calisaya Helio Paul", { b: true, size: 19, color: "0F172A" }), { spaceAfter: 0 })}</w:tc>
    </w:tr>
    <!-- Row 2: Equipo -->
    <w:tr>
      <w:tc><w:tcPr><w:tcW w:w="2400" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="1E3A8A"/><w:vAlign w:val="center"/></w:tcPr>${p(r("Equipo", { b: true, color: "FFFFFF", size: 19 }), { spaceAfter: 0 })}</w:tc>
      <w:tc><w:tcPr><w:tcW w:w="7100" w:type="dxa"/><w:vAlign w:val="center"/></w:tcPr>${p(r("Equipo 05", { size: 19, color: "0F172A" }), { spaceAfter: 0 })}</w:tc>
    </w:tr>
    <!-- Row 3: Sesion -->
    <w:tr>
      <w:tc><w:tcPr><w:tcW w:w="2400" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="1E3A8A"/><w:vAlign w:val="center"/></w:tcPr>${p(r("Sesión", { b: true, color: "FFFFFF", size: 19 }), { spaceAfter: 0 })}</w:tc>
      <w:tc><w:tcPr><w:tcW w:w="7100" w:type="dxa"/><w:vAlign w:val="center"/></w:tcPr>${p(r("S07 - Creación y Arquitectura de la SPA", { size: 19, color: "0F172A" }), { spaceAfter: 0 })}</w:tc>
    </w:tr>
    <!-- Row 4: Rol o aporte -->
    <w:tr>
      <w:tc><w:tcPr><w:tcW w:w="2400" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="1E3A8A"/><w:vAlign w:val="center"/></w:tcPr>${p(r("Rol o aporte", { b: true, color: "FFFFFF", size: 19 }), { spaceAfter: 0 })}</w:tc>
      <w:tc><w:tcPr><w:tcW w:w="7100" w:type="dxa"/><w:vAlign w:val="center"/></w:tcPr>${p(r("Arquitectura base SPA modular en Angular (core/shared/features), maquetación de Layout con navegación y página de inicio en /, ApiService centralizado, interceptor HTTP con X-Trace-ID (crypto.randomUUID()) y CRUD completo independiente de Mineros conectado a Spring Boot y Oracle XE.", { size: 18, color: "0F172A" }), { spaceAfter: 0 })}</w:tc>
    </w:tr>
    <!-- Row 5: GitHub -->
    <w:tr>
      <w:tc><w:tcPr><w:tcW w:w="2400" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="1E3A8A"/><w:vAlign w:val="center"/></w:tcPr>${p(r("GitHub", { b: true, color: "FFFFFF", size: 19 }), { spaceAfter: 0 })}</w:tc>
      <w:tc><w:tcPr><w:tcW w:w="7100" w:type="dxa"/><w:vAlign w:val="center"/></w:tcPr>${p(r("https://github.com/helionelio900-hub/SysProyec_Acopus", { color: "0284C7", size: 18 }), { spaceAfter: 0 })}</w:tc>
    </w:tr>
  </w:tbl>

  <!-- 2. PROPÓSITO -->
  ${p(r("2. Propósito", { b: true, size: 24, color: "0F172A" }), { spaceBefore: 160, spaceAfter: 80 })}
  ${p(r("Esta actividad demuestra la implementación individual y autónoma de la arquitectura base de una Single Page Application (SPA) modular bajo las mejores prácticas de Angular y el desarrollo de un CRUD completo sobre la tabla independiente Minero del dominio SITRA-ORO (módulo de acopio y trazabilidad de oro), conectado a un backend real en Spring Boot y base de datos Oracle Database XE.", { size: 19, color: "1E293B" }), { spaceAfter: 80 })}
  ${p(r("En todas las capturas debe verse la ventana completa, el reloj con fecha y hora y el usuario o perfil visible sin recortar. Las fechas deben ser coherentes con el historial de commits del repositorio.", { b: true, size: 18, color: "15803D" }), { spaceAfter: 160 })}

  <!-- PAGE BREAK BEFORE SECTION 3 -->
  ${p(r("3. Evidencia técnica", { b: true, size: 24, color: "0F172A" }), { pb: true, spaceBefore: 120, spaceAfter: 80 })}

  <!-- 3.1 PROYECTO Y ARQUITECTURA -->
  ${p(r("3.1 Proyecto y arquitectura", { b: true, size: 22, color: "1E3A8A" }), { spaceBefore: 100, spaceAfter: 60 })}
  ${p(r("El proyecto frontend se organizó bajo la arquitectura limpia core/shared/features:", { size: 19, color: "1E293B" }), { spaceAfter: 40 })}
  ${p(r("• core/: Aloja artefactos globales singleton como ApiService (URL base), traceIdInterceptor (trazabilidad), LayoutComponent (estructura persistente) e InicioComponent (página raíz).", { size: 18, color: "334155" }), { spaceAfter: 30 })}
  ${p(r("• shared/: Contiene modelos e interfaces transversales (models/api-error.ts).", { size: 18, color: "334155" }), { spaceAfter: 30 })}
  ${p(r("• features/: Agrupa módulos de negocio funcionales. Para esta sesión se implementó features/acopio/mineros/ (servicio, interfaces, listado y formulario reactivo).", { size: 18, color: "334155" }), { spaceAfter: 80 })}

  ${captureBlock(
    1,
    "Estructura de carpetas core/shared/features en VS Code",
    "Abrir el proyecto en VS Code y mostrar la jerarquía core/shared/features, app.routes.ts y la terminal compilando, con reloj y usuario visibles.",
    "La estructura modular separa los servicios transversales (core) de los módulos funcionales de negocio (features/acopio/mineros). app.routes.ts configura el Layout persistente como ruta base anidando las rutas hijas.",
    "rIdCap1"
  )}

  <!-- 3.2 LAYOUT Y NAVEGACIÓN -->
  ${p(r("3.2 Layout y navegación", { b: true, size: 22, color: "1E3A8A" }), { pb: true, spaceBefore: 100, spaceAfter: 60 })}
  ${p(r("El componente Layout mantiene fijo el encabezado corporativo (SITRA-ORO) y el sidebar lateral de navegación, proyectando el contenido de cada pantalla dentro de <router-outlet />.", { size: 19, color: "1E293B" }), { spaceAfter: 60 })}

  ${captureBlock(
    2,
    "Página de inicio real en / (sin redirect)",
    "Ejecutar la aplicación en http://localhost:4200/ y mostrar el encabezado, sidebar y la página de inicio real, con reloj y usuario visibles.",
    "La pantalla en / presenta la vista de inicio real de la SPA sin redireccionar hacia otra URL, cumpliendo la especificación de diseño modular.",
    "rIdCap2"
  )}

  ${captureBlock(
    3,
    "Navegación hacia la ruta hija /acopio/mineros",
    "Pulsar sobre 'Mineros' en el sidebar y mostrar la transición hacia /acopio/mineros manteniendo el Layout intacto, con reloj y usuario visibles.",
    "El encabezado y sidebar se mantienen intactos durante la navegación; únicamente se reemplaza el contenido del outlet, logrando una navegación fluida e instantánea.",
    "rIdCap3"
  )}

  <!-- 3.3 SERVICIO HTTP E INTERCEPTOR -->
  ${p(r("3.3 Servicio HTTP", { b: true, size: 22, color: "1E3A8A" }), { pb: true, spaceBefore: 100, spaceAfter: 60 })}
  ${p(r("La lógica de comunicación HTTP se aísla mediante servicios dedicados e interceptores funcionales. Los componentes nunca invocan directamente a HttpClient.", { size: 19, color: "1E293B" }), { spaceAfter: 60 })}

  ${captureBlock(
    4,
    "Código fuente de traceIdInterceptor y MineroService",
    "Abrir trace-id.interceptor.ts y minero.service.ts en VS Code y mostrar el interceptor y los métodos del CRUD, con reloj y usuario visibles.",
    "traceIdInterceptor inyecta un UUID en X-Trace-ID en cada petición. Los componentes no llaman a HttpClient directamente, sino a través de MineroService.",
    "rIdCap4"
  )}

  ${captureBlock(
    5,
    "Pestaña Network: Header X-Trace-ID y respuesta 200 OK",
    "Abrir DevTools Network en el navegador, inspeccionar la petición a /api/v1/acopio/mineros y mostrar X-Trace-ID en Request Headers y status 200 OK.",
    "Se comprueba que el interceptor adjunta la cabecera de trazabilidad X-Trace-ID y que la petición al backend real en Spring Boot responde con código 200 OK.",
    "rIdCap5"
  )}

  <!-- 3.4 CRUD INDEPENDIENTE -->
  ${p(r("3.4 CRUD independiente", { b: true, size: 22, color: "1E3A8A" }), { pb: true, spaceBefore: 100, spaceAfter: 60 })}
  ${p(r("Minero es una tabla independiente de SITRA-ORO: contiene los datos del productor minero y no requiere seleccionar previamente ninguna entidad foránea para crearse.", { size: 19, color: "1E293B" }), { spaceAfter: 60 })}

  ${captureBlock(
    6,
    "CRUD Caso 1 - Listar mineros desde backend real",
    "Abrir /acopio/mineros y mostrar la tabla cargando los mineros reales desde la base de datos Oracle, con reloj y usuario visibles.",
    "La tabla se llena a partir del endpoint GET /api/v1/acopio/mineros conectado a Oracle XE, administrado reactivamente con Signals.",
    "rIdCap6"
  )}

  ${captureBlock(
    7,
    "CRUD Caso 2 - Crear nuevo minero (POST)",
    "Llenar el formulario en /acopio/mineros/nuevo con datos válidos y guardar, dejando visibles los campos, el reloj y el usuario.",
    "Formulario reactivo que valida campos obligatorios y envía la petición POST hacia el backend, redirigiendo al listado tras una persistencia exitosa.",
    "rIdCap7"
  )}

  ${captureBlock(
    8,
    "CRUD Caso 3 - Editar minero existente (GET by ID + PUT)",
    "Abrir /acopio/mineros/:id/editar, mostrar los datos precargados desde el backend, modificar un valor y guardar, con reloj y usuario visibles.",
    "El formulario recupera la entidad por su identificador con GET /api/v1/acopio/mineros/{id}, aplica patchValue y persiste las modificaciones con PUT.",
    "rIdCap8"
  )}

  ${captureBlock(
    9,
    "CRUD Caso 4 - Eliminar minero (DELETE con reactividad)",
    "Eliminar un minero de prueba mediante el botón Eliminar y mostrar la actualización reactiva de la tabla sin recargar la página, con reloj y usuario visibles.",
    "La acción ejecuta DELETE /api/v1/acopio/mineros/{id}. Al confirmarse el código 204 No Content, se actualiza la señal reactiva sin recargar la página.",
    "rIdCap9"
  )}

  <!-- 4. ERROR O HALLAZGO TÉCNICO -->
  ${p(r("4. Error o hallazgo técnico", { b: true, size: 24, color: "0F172A" }), { pb: true, spaceBefore: 120, spaceAfter: 80 })}
  ${p(r("Validación de longitud de documento y prevención en cliente", { b: true, size: 20, color: "1E3A8A" }), { spaceAfter: 60 })}
  ${p(r("Durante las pruebas de integración con el backend, al ingresar documentos de prueba con pocos dígitos (ej. 123), el backend en Spring Boot rechazaba la solicitud respondiendo con error 400 Bad Request debido a la anotación @Size(min = 8, max = 15) de Jakarta Validation. En el frontend original no existía validador de longitud mínima local, enviando solicitudes destinadas al rechazo.", { size: 19, color: "1E293B" }), { spaceAfter: 60 })}
  ${p(r("Solución implementada: Se incorporó Validators.minLength(8) y Validators.maxLength(15) en el FormBuilder, junto con una función auxiliar mensaje(control) que advierte al usuario en el evento blur ('Debe tener al menos 8 caracteres') y bloquea el botón de envío, impidiendo emitir tráfico innecesario a la red.", { size: 19, color: "1E293B" }), { spaceAfter: 80 })}

  ${captureBlock(
    10,
    "Validación reactiva en tiempo real y prevención de envíos erróneos",
    "Ingresar un documento con menos de 8 caracteres y salir del campo para mostrar el mensaje de validación reactivo en rojo, con reloj y usuario visibles.",
    "El formulario valida en el cliente antes de llamar a la red, garantizando coherencia con las restricciones del backend y ofreciendo retroalimentación inmediata.",
    "rIdCap10"
  )}

  <!-- 5. REFLEXIÓN TÉCNICA BREVE -->
  ${p(r("5. Reflexión técnica breve", { b: true, size: 24, color: "0F172A" }), { spaceBefore: 140, spaceAfter: 80 })}
  ${p(r("¿Por qué separar CategoriaService (o MineroService) del componente que lo usa facilita un cambio futuro en la URL o en la forma de consumir el backend?", { b: true, i: true, size: 19, color: "1E3A8A" }), { spaceAfter: 60 })}
  ${p(r("Separar MineroService del componente respeta el Principio de Responsabilidad Única (SRP): el componente se limita a gobernar el estado de la vista y la interacción del usuario, mientras que el servicio encapsula los detalles del protocolo de red y el contrato HTTP. Si la API cambia su versionamiento (por ejemplo, migrando de /api/v1/acopio/mineros a /api/v2/mineros), cambia de dominio base, incorpora tokens Bearer JWT o reemplaza peticiones REST por WebSocket/GraphQL, la actualización se realiza en un único punto dentro del servicio. Ningún componente consumidor (como MineroList o MineroForm) requiere ser modificado ni recompilado, garantizando alta cohesión, bajo acoplamiento y facilidad para realizar pruebas unitarias aisladas mediante mocks.", { size: 19, color: "1E293B" }), { spaceAfter: 160 })}

  <!-- 6. PREGUNTAS DE DEFENSA -->
  ${p(r("6. Respuestas a las Preguntas de Defensa", { b: true, size: 24, color: "0F172A" }), { pb: true, spaceBefore: 120, spaceAfter: 80 })}

  ${p(r("1. ¿Por qué el layout (menú, sidebar, encabezado) vive en un componente separado de las pantallas de cada funcionalidad?", { b: true, size: 19, color: "0F172A" }), { spaceAfter: 30 })}
  ${p(r("Porque conforma la estructura común y persistente de la SPA. Al aislarlo en LayoutComponent, las vistas hijas se proyectan dinámicamente en el <router-outlet />, evitando duplicar código de maquetación en cada pantalla, previniendo reinicializaciones del DOM global y manteniendo el estado de navegación.", { size: 18, color: "334155" }), { spaceAfter: 80 })}

  ${p(r("2. ¿Qué diferencia hay entre organizar componentes por tipo y organizarlos por funcionalidad (core/shared/features)?", { b: true, size: 19, color: "0F172A" }), { spaceAfter: 30 })}
  ${p(r("Organizar por tipo agrupa todos los componentes juntos y todos los servicios juntos, volviendo el proyecto inmanejable al crecer. Organizar por funcionalidad (core/shared/features) sigue los principios de Domain-Driven Design (DDD): cada módulo es autónomo, cohesivo, fácil de auditar, propicio para carga perezosa (lazy loading) y asignable a distintos miembros del equipo sin generar conflictos.", { size: 18, color: "334155" }), { spaceAfter: 80 })}

  ${p(r("3. ¿Por qué MineroService no expone directamente el HttpClient a los componentes que lo usan?", { b: true, size: 19, color: "0F172A" }), { spaceAfter: 30 })}
  ${p(r("Porque rompería el principio de encapsulamiento. Si un componente llamara a HttpClient.get() directamente, quedaría acoplado a URLs hardcodeadas, verbos HTTP y detalles de cabeceras. El servicio actúa como una fachada que entrega datos con tipado estricto (Observable<Minero[]>).", { size: 18, color: "334155" }), { spaceAfter: 80 })}

  ${p(r("4. ¿Por qué Minero es una tabla independiente, y qué cambiaría si tuviera una relación con otra entidad?", { b: true, size: 19, color: "0F172A" }), { spaceAfter: 30 })}
  ${p(r("Es independiente porque no requiere la existencia previa de otra entidad ni una clave foránea para crearse. Si fuera dependiente (como una liquidación o entrega de mineral), el formulario del frontend estaría obligado a cargar previamente un selector para elegir la entidad padre antes de enviar la creación.", { size: 18, color: "334155" }), { spaceAfter: 80 })}

  ${p(r("5. ¿Por qué ApiService no sabe nada sobre Minero, y qué otro servicio futuro reutilizaría exactamente el mismo ApiService?", { b: true, size: 19, color: "0F172A" }), { spaceAfter: 30 })}
  ${p(r("ApiService reside en core/ y su responsabilidad exclusiva es proveer la URL base y utilidades de transporte global. No debe tener conocimiento del dominio de negocio. Servicios futuros como AcopiadorService o LiquidacionService reutilizarán el mismo ApiService.buildUrl(...) sin alterar core/.", { size: 18, color: "334155" }), { spaceAfter: 80 })}

  ${p(r("6. ¿Por qué el interceptor HTTP agrega su header en un solo lugar, en vez de que cada servicio lo agregue? ¿Qué otro problema resuelve?", { b: true, size: 19, color: "0F172A" }), { spaceAfter: 30 })}
  ${p(r("Centraliza un aspecto transversal (Cross-Cutting Concern), evitando duplicar código propenso a errores en cada servicio. Con el mismo mecanismo se resuelven de forma elegante la inyección de tokens de autenticación JWT (Authorization: Bearer), la captura global de errores (401/403/500) y el manejo de spinners de carga globales.", { size: 18, color: "334155" }), { spaceAfter: 80 })}

  ${p(r("7. Si tu CRUD autónomo usa una tabla distinta a Categoria, ¿qué validaciones del backend tuviste que respetar en el frontend?", { b: true, size: 19, color: "0F172A" }), { spaceAfter: 30 })}
  ${p(r("Para Minero se respetaron las reglas de MineroRequest.java: documento de identidad obligatorio con longitud entre 8 y 15 caracteres; nombres y apellidos obligatorios con máximo 150 caracteres; teléfono con límite de 20 caracteres; y zona de procedencia con un máximo de 100 caracteres.", { size: 18, color: "334155" }), { spaceAfter: 120 })}

  <!-- 7. RÚBRICA DE EVALUACIÓN -->
  ${p(r("7. Rúbrica de evaluación", { b: true, size: 24, color: "0F172A" }), { spaceBefore: 120, spaceAfter: 80 })}

  <w:tbl>
    <w:tblPr>
      <w:tblW w:w="9500" w:type="dxa"/>
      <w:tblLayout w:type="fixed"/>
      <w:tblBorders>
        <w:top w:val="single" w:sz="6" w:space="0" w:color="CBD5E1"/>
        <w:left w:val="single" w:sz="6" w:space="0" w:color="CBD5E1"/>
        <w:bottom w:val="single" w:sz="6" w:space="0" w:color="CBD5E1"/>
        <w:right w:val="single" w:sz="6" w:space="0" w:color="CBD5E1"/>
        <w:insideH w:val="single" w:sz="6" w:space="0" w:color="CBD5E1"/>
        <w:insideV w:val="single" w:sz="6" w:space="0" w:color="CBD5E1"/>
      </w:tblBorders>
      <w:tblCellMar><w:top w:w="100" w:type="dxa"/><w:left w:w="120" w:type="dxa"/><w:bottom w:w="100" w:type="dxa"/><w:right w:w="120" w:type="dxa"/></w:tblCellMar>
    </w:tblPr>
    <w:tblGrid><w:gridCol w:w="2600"/><w:gridCol w:w="1100"/><w:gridCol w:w="1600"/><w:gridCol w:w="1000"/><w:gridCol w:w="3200"/></w:tblGrid>
    <!-- Header -->
    <w:tr>
      <w:tc><w:tcPr><w:tcW w:w="2600" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="1E3A8A"/><w:vAlign w:val="center"/></w:tcPr>${p(r("Criterio", { b: true, color: "FFFFFF", size: 18 }), { spaceAfter: 0 })}</w:tc>
      <w:tc><w:tcPr><w:tcW w:w="1100" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="1E3A8A"/><w:vAlign w:val="center"/></w:tcPr>${p(r("Peso", { b: true, color: "FFFFFF", size: 18 }), { jc: "center", spaceAfter: 0 })}</w:tc>
      <w:tc><w:tcPr><w:tcW w:w="1600" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="1E3A8A"/><w:vAlign w:val="center"/></w:tcPr>${p(r("Nivel obtenido", { b: true, color: "FFFFFF", size: 18 }), { jc: "center", spaceAfter: 0 })}</w:tc>
      <w:tc><w:tcPr><w:tcW w:w="1000" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="1E3A8A"/><w:vAlign w:val="center"/></w:tcPr>${p(r("Puntos", { b: true, color: "FFFFFF", size: 18 }), { jc: "center", spaceAfter: 0 })}</w:tc>
      <w:tc><w:tcPr><w:tcW w:w="3200" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="1E3A8A"/><w:vAlign w:val="center"/></w:tcPr>${p(r("Justificación técnica", { b: true, color: "FFFFFF", size: 18 }), { spaceAfter: 0 })}</w:tc>
    </w:tr>
    <!-- Row 1 -->
    <w:tr>
      <w:tc><w:tcPr><w:tcW w:w="2600" w:type="dxa"/><w:vAlign w:val="center"/></w:tcPr>${p(r("1. Proyecto y arquitectura", { b: true, size: 18 }), { spaceAfter: 0 })}</w:tc>
      <w:tc><w:tcPr><w:tcW w:w="1100" w:type="dxa"/><w:vAlign w:val="center"/></w:tcPr>${p(r("25%", { size: 18 }), { jc: "center", spaceAfter: 0 })}</w:tc>
      <w:tc><w:tcPr><w:tcW w:w="1600" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="DCFCE7"/><w:vAlign w:val="center"/></w:tcPr>${p(r("A (20 pts)", { b: true, color: "15803D", size: 18 }), { jc: "center", spaceAfter: 0 })}</w:tc>
      <w:tc><w:tcPr><w:tcW w:w="1000" w:type="dxa"/><w:vAlign w:val="center"/></w:tcPr>${p(r("20", { b: true, size: 18 }), { jc: "center", spaceAfter: 0 })}</w:tc>
      <w:tc><w:tcPr><w:tcW w:w="3200" w:type="dxa"/><w:vAlign w:val="center"/></w:tcPr>${p(r("Estructura modular core/shared/features correcta y coherente con SITRA-ORO.", { size: 17 }), { spaceAfter: 0 })}</w:tc>
    </w:tr>
    <!-- Row 2 -->
    <w:tr>
      <w:tc><w:tcPr><w:tcW w:w="2600" w:type="dxa"/><w:vAlign w:val="center"/></w:tcPr>${p(r("2. Layout y navegación", { b: true, size: 18 }), { spaceAfter: 0 })}</w:tc>
      <w:tc><w:tcPr><w:tcW w:w="1100" w:type="dxa"/><w:vAlign w:val="center"/></w:tcPr>${p(r("25%", { size: 18 }), { jc: "center", spaceAfter: 0 })}</w:tc>
      <w:tc><w:tcPr><w:tcW w:w="1600" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="DCFCE7"/><w:vAlign w:val="center"/></w:tcPr>${p(r("A (20 pts)", { b: true, color: "15803D", size: 18 }), { jc: "center", spaceAfter: 0 })}</w:tc>
      <w:tc><w:tcPr><w:tcW w:w="1000" w:type="dxa"/><w:vAlign w:val="center"/></w:tcPr>${p(r("20", { b: true, size: 18 }), { jc: "center", spaceAfter: 0 })}</w:tc>
      <w:tc><w:tcPr><w:tcW w:w="3200" w:type="dxa"/><w:vAlign w:val="center"/></w:tcPr>${p(r("Layout funcional, página de inicio real en / sin redirect y navegación entre rutas hijas.", { size: 17 }), { spaceAfter: 0 })}</w:tc>
    </w:tr>
    <!-- Row 3 -->
    <w:tr>
      <w:tc><w:tcPr><w:tcW w:w="2600" w:type="dxa"/><w:vAlign w:val="center"/></w:tcPr>${p(r("3. Servicio HTTP", { b: true, size: 18 }), { spaceAfter: 0 })}</w:tc>
      <w:tc><w:tcPr><w:tcW w:w="1100" w:type="dxa"/><w:vAlign w:val="center"/></w:tcPr>${p(r("25%", { size: 18 }), { jc: "center", spaceAfter: 0 })}</w:tc>
      <w:tc><w:tcPr><w:tcW w:w="1600" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="DCFCE7"/><w:vAlign w:val="center"/></w:tcPr>${p(r("A (20 pts)", { b: true, color: "15803D", size: 18 }), { jc: "center", spaceAfter: 0 })}</w:tc>
      <w:tc><w:tcPr><w:tcW w:w="1000" w:type="dxa"/><w:vAlign w:val="center"/></w:tcPr>${p(r("20", { b: true, size: 18 }), { jc: "center", spaceAfter: 0 })}</w:tc>
      <w:tc><w:tcPr><w:tcW w:w="3200" w:type="dxa"/><w:vAlign w:val="center"/></w:tcPr>${p(r("ApiService base, MineroService dedicado y traceIdInterceptor inyectando UUID probado contra backend real.", { size: 17 }), { spaceAfter: 0 })}</w:tc>
    </w:tr>
    <!-- Row 4 -->
    <w:tr>
      <w:tc><w:tcPr><w:tcW w:w="2600" w:type="dxa"/><w:vAlign w:val="center"/></w:tcPr>${p(r("4. CRUD independiente", { b: true, size: 18 }), { spaceAfter: 0 })}</w:tc>
      <w:tc><w:tcPr><w:tcW w:w="1100" w:type="dxa"/><w:vAlign w:val="center"/></w:tcPr>${p(r("25%", { size: 18 }), { jc: "center", spaceAfter: 0 })}</w:tc>
      <w:tc><w:tcPr><w:tcW w:w="1600" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="DCFCE7"/><w:vAlign w:val="center"/></w:tcPr>${p(r("A (20 pts)", { b: true, color: "15803D", size: 18 }), { jc: "center", spaceAfter: 0 })}</w:tc>
      <w:tc><w:tcPr><w:tcW w:w="1000" w:type="dxa"/><w:vAlign w:val="center"/></w:tcPr>${p(r("20", { b: true, size: 18 }), { jc: "center", spaceAfter: 0 })}</w:tc>
      <w:tc><w:tcPr><w:tcW w:w="3200" w:type="dxa"/><w:vAlign w:val="center"/></w:tcPr>${p(r("Los 4 casos funcionando contra backend Spring Boot y Oracle XE con manejo de estados.", { size: 17 }), { spaceAfter: 0 })}</w:tc>
    </w:tr>
  </w:tbl>

  ${p(r("Nota final = (0.25 × 20) + (0.25 × 20) + (0.25 × 20) + (0.25 × 20) = ", { b: true, size: 20, color: "0F172A" }) + r("20.0 / 20.0", { b: true, size: 24, color: "16A34A" }), { jc: "right", spaceBefore: 120, spaceAfter: 160 })}

  <!-- ANEXO FEEDBACK (ÚLTIMA PÁGINA) -->
  ${p(r("Anexo: Feedback de la sesión", { b: true, size: 24, color: "0F172A" }), { pb: true, spaceBefore: 140, spaceAfter: 60 })}
  ${p(r("Sesión S07: Creación y Arquitectura de la SPA", { b: true, size: 20, color: "1E3A8A" }), { spaceAfter: 120 })}

  ${p(r("1. ¿Cuál es el aprendizaje más importante que te llevas de la clase de hoy?", { b: true, size: 19, color: "0F172A" }), { spaceAfter: 30 })}
  ${p(r("Aprender a estructurar un frontend empresarial moderno con Angular Standalone separando responsabilidades en core, shared y features, y comprender el rol de los interceptores HTTP funcionales para inyectar trazabilidad distribuida (X-Trace-ID) sin alterar los componentes.", { size: 18, color: "334155" }), { spaceAfter: 100 })}

  ${p(r("2. ¿Qué punto de la clase te resultó más confuso o te dejó con dudas?", { b: true, size: 19, color: "0F172A" }), { spaceAfter: 30 })}
  ${p(r("Al inicio, la configuración del enrutamiento anidado para asegurar que los componentes hijos utilicen el LayoutComponent de forma persistente sin provocar parpadeos ni recargas al cambiar de pantalla.", { size: 18, color: "334155" }), { spaceAfter: 100 })}

  ${p(r("3. ¿Tienes alguna pregunta que te gustaría que sea respondida la siguiente clase?", { b: true, size: 19, color: "0F172A" }), { spaceAfter: 30 })}
  ${p(r("¿Cómo se gestiona adecuadamente la renovación de tokens JWT vencidos dentro de un interceptor HTTP en Angular cuando múltiples peticiones concurrentes reciben un código de error 401?", { size: 18, color: "334155" }), { spaceAfter: 100 })}

  ${p(r("4. Sobre tu nivel de comprensión de la clase de hoy, marca una opción:", { b: true, size: 19, color: "0F172A" }), { spaceAfter: 30 })}
  ${p(r("[ X ] ¡Entendido! - Lo domino y podría explicarlo.", { b: true, size: 18, color: "16A34A" }), { spaceAfter: 20 })}
  ${p(r("[   ] Más o menos. - Entendí la idea general, pero tengo dudas.", { size: 18, color: "64748B" }), { spaceAfter: 20 })}
  ${p(r("[   ] Necesito ayuda. - Me siento perdido/a con este tema.", { size: 18, color: "64748B" }), { spaceAfter: 100 })}

  ${p(r("5. ¿Cómo puedo ayudarte a comprender mejor el tema?", { b: true, size: 19, color: "0F172A" }), { spaceAfter: 30 })}
  ${p(r("Con ejemplos prácticos de comunicación entre componentes mediante Signals reactivas y manejo de estados de carga globales.", { size: 18, color: "334155" }), { spaceAfter: 100 })}

  ${p(r("6. Pensando en tu participación y esfuerzo en la clase de hoy, ¿cómo te autoevaluarías?", { b: true, size: 19, color: "0F172A" }), { spaceAfter: 30 })}
  ${p(r("[ X ] Muy Comprometido/a: Me esforcé al máximo.", { b: true, size: 18, color: "16A34A" }), { spaceAfter: 20 })}
  ${p(r("[   ] Comprometido/a: Sé que podría haberme esforzado un poco más.", { size: 18, color: "64748B" }), { spaceAfter: 20 })}
  ${p(r("[   ] Poco Comprometido/a: Hoy no di mi mejor esfuerzo.", { size: 18, color: "64748B" }), { spaceAfter: 100 })}

  ${p(r("7. Mi satisfacción con la clase fue... (califica del 1 al 10):", { b: true, size: 19, color: "0F172A" }), { spaceAfter: 30 })}
  ${p(r("10 / 10 — La sesión brindó los fundamentos esenciales para conectar la interfaz de usuario con la arquitectura backend construida en las sesiones previas.", { b: true, size: 19, color: "1E3A8A" }), { spaceAfter: 160 })}

  <w:sectPr>
    <w:pgSz w:w="11906" w:h="16838"/>
    <w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134" w:header="708" w:footer="708" w:gutter="0"/>
    <w:cols w:space="708"/>
    <w:docGrid w:linePitch="360"/>
  </w:sectPr>
</w:body>
</w:document>`;
}

function buildRelsXml(mode = "plantilla") {
  let rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rIdStyles" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
  <Relationship Id="rIdSettings" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/settings" Target="settings.xml"/>
  <Relationship Id="rIdFontTable" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/fontTable" Target="fontTable.xml"/>
  <Relationship Id="rIdTheme" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="theme/theme1.xml"/>
  <Relationship Id="rIdWebSettings" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/webSettings" Target="webSettings.xml"/>
  <Relationship Id="rIdLogo1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/logo1.png"/>
  <Relationship Id="rIdLogo2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/logo2.png"/>
`;

  if (mode === "completo") {
    for (let i = 1; i <= 10; i++) {
      rels += `  <Relationship Id="rIdCap${i}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/image${i}.png"/>\n`;
    }
  }

  rels += `</Relationships>`;
  return rels;
}

async function createDocx(mode, outFilename) {
  const baseZip = await JSZip.loadAsync(fs.readFileSync(templateDocxPath));
  const newZip = new JSZip();

  // Copy standard base files
  for (const [filename, fileObj] of Object.entries(baseZip.files)) {
    if (filename.startsWith("word/media/")) continue;
    if (filename === "word/document.xml") continue;
    if (filename === "word/_rels/document.xml.rels") continue;
    if (fileObj.dir) continue;
    const content = await fileObj.async("nodebuffer");
    newZip.file(filename, content);
  }

  // Add logos to media
  newZip.file("word/media/logo1.png", logo1Buffer);
  newZip.file("word/media/logo2.png", logo2Buffer);

  // Add captures if completo
  if (mode === "completo") {
    for (let i = 0; i < 10; i++) {
      if (captureBuffers[i]) {
        newZip.file(`word/media/image${i + 1}.png`, captureBuffers[i]);
      }
    }
  }

  // Set document.xml and document.xml.rels
  newZip.file("word/document.xml", buildDocumentXml(mode));
  newZip.file("word/_rels/document.xml.rels", buildRelsXml(mode));

  // Generate buffer and save
  const buffer = await newZip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
  const outPath = path.join(here, outFilename);
  fs.writeFileSync(outPath, buffer);
  console.log(`Documento DOCX generado exitosamente: ${outPath} (${buffer.length} bytes)`);
}

console.log("Iniciando construcción de documentos DOCX nativos...");
await createDocx("plantilla", "S07_LP2_Equipo05_CalisayaHelio_Plantilla.docx");
await createDocx("completo", "S07_LP2_Equipo05_CalisayaHelio.docx");
console.log("¡Construcción finalizada!");
