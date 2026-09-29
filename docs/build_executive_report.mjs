import { chromium } from "file:///C:/Users/Paul/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));

// Helper to convert image to base64 data URI
function getBase64Image(filePath) {
  const data = fs.readFileSync(filePath);
  const ext = path.extname(filePath).slice(1);
  return `data:image/${ext === "jpg" ? "jpeg" : ext};base64,${data.toString("base64")}`;
}

const logoUpeu = getBase64Image(path.join(here, "presentacion/s06/assets/upeu.png"));
const logoSistemas = getBase64Image(path.join(here, "presentacion/s06/assets/ingenieria-sistemas.png"));
const logoSitraOro = getBase64Image(path.join(here, "presentacion/s06/assets/quilate-bullion-emblema-v2.png"));

// SVG 1: Macroproceso de la Cadena de Valor
const svgMacroCadena = `
<svg viewBox="0 0 720 85" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: auto; margin: 12px 0;">
  <defs>
    <filter id="shadow" x="-5%" y="-10%" width="110%" height="130%">
      <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#0f172a" flood-opacity="0.08"/>
    </filter>
    <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 8 5 L 0 9 z" fill="#0f2942" />
    </marker>
  </defs>

  <!-- Paso 1: Minero -->
  <g filter="url(#shadow)">
    <rect x="5" y="8" width="150" height="68" rx="6" fill="#f8fafc" stroke="#0f2942" stroke-width="1.5"/>
    <rect x="5" y="8" width="150" height="22" rx="6" fill="#0f2942"/>
    <text x="80" y="23" font-family="'Segoe UI', Arial, sans-serif" font-size="10" font-weight="bold" fill="#ffffff" text-anchor="middle">1. MINERO</text>
    <text x="80" y="44" font-family="'Segoe UI', Arial, sans-serif" font-size="8.5" font-weight="600" fill="#1e293b" text-anchor="middle">Productor Aurífero</text>
    <text x="80" y="58" font-family="'Segoe UI', Arial, sans-serif" font-size="7.5" fill="#64748b" text-anchor="middle">Venta presencial y cotización</text>
  </g>

  <line x1="158" y1="42" x2="185" y2="42" stroke="#0f2942" stroke-width="2" marker-end="url(#arrow)" />

  <!-- Paso 2: Acopiador -->
  <g filter="url(#shadow)">
    <rect x="190" y="8" width="150" height="68" rx="6" fill="#f8fafc" stroke="#0f2942" stroke-width="1.5"/>
    <rect x="190" y="8" width="150" height="22" rx="6" fill="#0f2942"/>
    <text x="265" y="23" font-family="'Segoe UI', Arial, sans-serif" font-size="10" font-weight="bold" fill="#ffffff" text-anchor="middle">2. ACOPIADOR</text>
    <text x="265" y="44" font-family="'Segoe UI', Arial, sans-serif" font-size="8.5" font-weight="600" fill="#1e293b" text-anchor="middle">Compra y Acopio</text>
    <text x="265" y="58" font-family="'Segoe UI', Arial, sans-serif" font-size="7.5" fill="#64748b" text-anchor="middle">Funde, pesa y acumula por color</text>
  </g>

  <line x1="343" y1="42" x2="370" y2="42" stroke="#0f2942" stroke-width="2" marker-end="url(#arrow)" />

  <!-- Paso 3: Mayorista -->
  <g filter="url(#shadow)">
    <rect x="375" y="8" width="155" height="68" rx="6" fill="#f8fafc" stroke="#0f2942" stroke-width="1.5"/>
    <rect x="375" y="8" width="155" height="22" rx="6" fill="#0f2942"/>
    <text x="452" y="23" font-family="'Segoe UI', Arial, sans-serif" font-size="10" font-weight="bold" fill="#ffffff" text-anchor="middle">3. MAYORISTA</text>
    <text x="452" y="44" font-family="'Segoe UI', Arial, sans-serif" font-size="8.5" font-weight="600" fill="#1e293b" text-anchor="middle">Proceso Industrial y Ley</text>
    <text x="452" y="58" font-family="'Segoe UI', Arial, sans-serif" font-size="7.5" fill="#64748b" text-anchor="middle">Nuevo pesaje, limpieza y liquidación</text>
  </g>

  <line x1="533" y1="42" x2="560" y2="42" stroke="#0f2942" stroke-width="2" marker-end="url(#arrow)" />

  <!-- Paso 4: Exportador -->
  <g filter="url(#shadow)">
    <rect x="565" y="8" width="150" height="68" rx="6" fill="#f8fafc" stroke="#b45309" stroke-width="1.5" stroke-dasharray="4 2"/>
    <rect x="565" y="8" width="150" height="22" rx="6" fill="#b45309"/>
    <text x="640" y="23" font-family="'Segoe UI', Arial, sans-serif" font-size="10" font-weight="bold" fill="#ffffff" text-anchor="middle">4. EXPORTADOR</text>
    <text x="640" y="44" font-family="'Segoe UI', Arial, sans-serif" font-size="8.5" font-weight="600" fill="#92400e" text-anchor="middle">[Actor Externo]</text>
    <text x="640" y="58" font-family="'Segoe UI', Arial, sans-serif" font-size="7.5" fill="#64748b" text-anchor="middle">Recepción de lote consolidado</text>
  </g>
</svg>
`;

// SVG 2: Flujo Operativo del Módulo Acopiador (8 estaciones secuenciales limpias)
const svgFlujoAcopiador = `
<svg viewBox="0 0 720 185" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: auto; margin: 12px 0;">
  <defs>
    <filter id="sh-card" x="-5%" y="-10%" width="110%" height="130%">
      <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" flood-color="#0f172a" flood-opacity="0.08"/>
    </filter>
    <marker id="ar" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
      <path d="M 0 1 L 8 5 L 0 9 z" fill="#0f2942" />
    </marker>
  </defs>

  <!-- FILA 1: Estaciones 1 a 4 -->
  <!-- Estación 1 -->
  <g filter="url(#sh-card)">
    <rect x="5" y="10" width="155" height="65" rx="5" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.2"/>
    <rect x="5" y="10" width="28" height="65" rx="5" fill="#0f2942"/>
    <text x="19" y="48" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="bold" fill="#ffffff" text-anchor="middle">1</text>
    <text x="42" y="32" font-family="'Segoe UI', Arial, sans-serif" font-size="9" font-weight="bold" fill="#0f2942">Registro Minero</text>
    <text x="42" y="48" font-family="'Segoe UI', Arial, sans-serif" font-size="7.5" fill="#475569">Alta de identidad</text>
    <text x="42" y="62" font-family="'Segoe UI', Arial, sans-serif" font-size="7" fill="#64748b">Trazabilidad de origen</text>
  </g>
  <line x1="163" y1="42" x2="187" y2="42" stroke="#0f2942" stroke-width="1.5" marker-end="url(#ar)" />

  <!-- Estación 2 -->
  <g filter="url(#sh-card)">
    <rect x="190" y="10" width="155" height="65" rx="5" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.2"/>
    <rect x="190" y="10" width="28" height="65" rx="5" fill="#0f2942"/>
    <text x="204" y="48" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="bold" fill="#ffffff" text-anchor="middle">2</text>
    <text x="227" y="32" font-family="'Segoe UI', Arial, sans-serif" font-size="9" font-weight="bold" fill="#0f2942">Pesaje Inicial (P1)</text>
    <text x="227" y="48" font-family="'Segoe UI', Arial, sans-serif" font-size="7.5" fill="#475569">Balanza de precisión</text>
    <text x="227" y="62" font-family="'Segoe UI', Arial, sans-serif" font-size="7" fill="#64748b">Peso bruto en gramos (3 dec)</text>
  </g>
  <line x1="348" y1="42" x2="372" y2="42" stroke="#0f2942" stroke-width="1.5" marker-end="url(#ar)" />

  <!-- Estación 3 -->
  <g filter="url(#sh-card)">
    <rect x="375" y="10" width="155" height="65" rx="5" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.2"/>
    <rect x="375" y="10" width="28" height="65" rx="5" fill="#0f2942"/>
    <text x="389" y="48" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="bold" fill="#ffffff" text-anchor="middle">3</text>
    <text x="412" y="32" font-family="'Segoe UI', Arial, sans-serif" font-size="9" font-weight="bold" fill="#0f2942">Fundición Térmica</text>
    <text x="412" y="48" font-family="'Segoe UI', Arial, sans-serif" font-size="7.5" fill="#475569">Crisol con soplete</text>
    <text x="412" y="62" font-family="'Segoe UI', Arial, sans-serif" font-size="7" fill="#64748b">Expulsión de impurezas</text>
  </g>
  <line x1="533" y1="42" x2="557" y2="42" stroke="#0f2942" stroke-width="1.5" marker-end="url(#ar)" />

  <!-- Estación 4 -->
  <g filter="url(#sh-card)">
    <rect x="560" y="10" width="155" height="65" rx="5" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.2"/>
    <rect x="560" y="10" width="28" height="65" rx="5" fill="#0f2942"/>
    <text x="574" y="48" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="bold" fill="#ffffff" text-anchor="middle">4</text>
    <text x="597" y="32" font-family="'Segoe UI', Arial, sans-serif" font-size="9" font-weight="bold" fill="#0f2942">Enfriamiento</text>
    <text x="597" y="48" font-family="'Segoe UI', Arial, sans-serif" font-size="7.5" fill="#475569">Inmersión en agua</text>
    <text x="597" y="62" font-family="'Segoe UI', Arial, sans-serif" font-size="7" fill="#64748b">Estabilización de masa</text>
  </g>

  <!-- Flecha curva de bajada de fila 1 a fila 2 -->
  <path d="M 640 78 L 640 102 L 640 108" fill="none" stroke="#0f2942" stroke-width="1.5" marker-end="url(#ar)"/>

  <!-- FILA 2: Estaciones 5 a 8 -->
  <!-- Estación 5 -->
  <g filter="url(#sh-card)">
    <rect x="560" y="112" width="155" height="65" rx="5" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.2"/>
    <rect x="560" y="112" width="28" height="65" rx="5" fill="#0f2942"/>
    <text x="574" y="150" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="bold" fill="#ffffff" text-anchor="middle">5</text>
    <text x="597" y="132" font-family="'Segoe UI', Arial, sans-serif" font-size="9" font-weight="bold" fill="#0f2942">Segundo Pesaje (P2)</text>
    <text x="597" y="148" font-family="'Segoe UI', Arial, sans-serif" font-size="7.5" fill="#475569">Peso neto resultante</text>
    <text x="597" y="162" font-family="'Segoe UI', Arial, sans-serif" font-size="7" fill="#64748b">Asiento de variación (sin bloqueo)</text>
  </g>
  <line x1="557" y1="144" x2="533" y2="144" stroke="#0f2942" stroke-width="1.5" marker-end="url(#ar)" />

  <!-- Estación 6 -->
  <g filter="url(#sh-card)">
    <rect x="375" y="112" width="155" height="65" rx="5" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.2"/>
    <rect x="375" y="112" width="28" height="65" rx="5" fill="#0f2942"/>
    <text x="389" y="150" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="bold" fill="#ffffff" text-anchor="middle">6</text>
    <text x="412" y="132" font-family="'Segoe UI', Arial, sans-serif" font-size="9" font-weight="bold" fill="#0f2942">Clasificación Color</text>
    <text x="412" y="148" font-family="'Segoe UI', Arial, sans-serif" font-size="7.5" font-weight="bold" fill="#b91c1c">ROJO <tspan fill="#15803d">/ VERDE</tspan></text>
    <text x="412" y="162" font-family="'Segoe UI', Arial, sans-serif" font-size="7" fill="#64748b">Inspección visual directa</text>
  </g>
  <line x1="372" y1="144" x2="348" y2="144" stroke="#0f2942" stroke-width="1.5" marker-end="url(#ar)" />

  <!-- Estación 7 -->
  <g filter="url(#sh-card)">
    <rect x="190" y="112" width="155" height="65" rx="5" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.2"/>
    <rect x="190" y="112" width="28" height="65" rx="5" fill="#0f2942"/>
    <text x="204" y="150" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="bold" fill="#ffffff" text-anchor="middle">7</text>
    <text x="227" y="132" font-family="'Segoe UI', Arial, sans-serif" font-size="9" font-weight="bold" fill="#0f2942">Liquidación y Pago</text>
    <text x="227" y="148" font-family="'Segoe UI', Arial, sans-serif" font-size="7.5" fill="#475569">Precio oficial Parámetros</text>
    <text x="227" y="162" font-family="'Segoe UI', Arial, sans-serif" font-size="7" fill="#64748b">Desembolso en Soles (PEN)</text>
  </g>
  <line x1="187" y1="144" x2="163" y2="144" stroke="#0f2942" stroke-width="1.5" marker-end="url(#ar)" />

  <!-- Estación 8 -->
  <g filter="url(#sh-card)">
    <rect x="5" y="112" width="155" height="65" rx="5" fill="#ffffff" stroke="#047857" stroke-width="1.2"/>
    <rect x="5" y="112" width="28" height="65" rx="5" fill="#047857"/>
    <text x="19" y="150" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="bold" fill="#ffffff" text-anchor="middle">8</text>
    <text x="42" y="132" font-family="'Segoe UI', Arial, sans-serif" font-size="9" font-weight="bold" fill="#047857">Acopio en Bóveda</text>
    <text x="42" y="148" font-family="'Segoe UI', Arial, sans-serif" font-size="7.5" fill="#475569">Segregación física por color</text>
    <text x="42" y="162" font-family="'Segoe UI', Arial, sans-serif" font-size="7" fill="#64748b">Cierre semanal hacia Mayorista</text>
  </g>
</svg>
`;

// SVG 3: Flujo Operativo del Módulo Mayorista
const svgFlujoMayorista = `
<svg viewBox="0 0 720 185" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: auto; margin: 12px 0;">
  <defs>
    <filter id="sh-card-m" x="-5%" y="-10%" width="110%" height="130%">
      <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" flood-color="#0f172a" flood-opacity="0.08"/>
    </filter>
  </defs>

  <!-- FILA 1: Estaciones 1 a 4 -->
  <!-- Estación 1 -->
  <g filter="url(#sh-card-m)">
    <rect x="5" y="10" width="155" height="65" rx="5" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.2"/>
    <rect x="5" y="10" width="28" height="65" rx="5" fill="#0f2942"/>
    <text x="19" y="48" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="bold" fill="#ffffff" text-anchor="middle">1</text>
    <text x="42" y="32" font-family="'Segoe UI', Arial, sans-serif" font-size="9" font-weight="bold" fill="#0f2942">Recepción Dividida</text>
    <text x="42" y="48" font-family="'Segoe UI', Arial, sans-serif" font-size="7.5" fill="#475569">Oro acumulado del Acopiador</text>
    <text x="42" y="62" font-family="'Segoe UI', Arial, sans-serif" font-size="7" fill="#64748b">Separación estricta Rojo / Verde</text>
  </g>
  <line x1="163" y1="42" x2="187" y2="42" stroke="#0f2942" stroke-width="1.5" marker-end="url(#ar)" />

  <!-- Estación 2 -->
  <g filter="url(#sh-card-m)">
    <rect x="190" y="10" width="155" height="65" rx="5" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.2"/>
    <rect x="190" y="10" width="28" height="65" rx="5" fill="#0f2942"/>
    <text x="204" y="48" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="bold" fill="#ffffff" text-anchor="middle">2</text>
    <text x="227" y="32" font-family="'Segoe UI', Arial, sans-serif" font-size="9" font-weight="bold" fill="#0f2942">Nuevo Pesaje Propio</text>
    <text x="227" y="48" font-family="'Segoe UI', Arial, sans-serif" font-size="7.5" fill="#475569">Balanza de planta industrial</text>
    <text x="227" y="62" font-family="'Segoe UI', Arial, sans-serif" font-size="7" fill="#64748b">Pesa Rojo y Verde por separado</text>
  </g>
  <line x1="348" y1="42" x2="372" y2="42" stroke="#0f2942" stroke-width="1.5" marker-end="url(#ar)" />

  <!-- Estación 3 -->
  <g filter="url(#sh-card-m)">
    <rect x="375" y="10" width="155" height="65" rx="5" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.2"/>
    <rect x="375" y="10" width="28" height="65" rx="5" fill="#0f2942"/>
    <text x="389" y="48" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="bold" fill="#ffffff" text-anchor="middle">3</text>
    <text x="412" y="32" font-family="'Segoe UI', Arial, sans-serif" font-size="9" font-weight="bold" fill="#0f2942">Homogeneización</text>
    <text x="412" y="48" font-family="'Segoe UI', Arial, sans-serif" font-size="7.5" fill="#475569">Fundición secundaria</text>
    <text x="412" y="62" font-family="'Segoe UI', Arial, sans-serif" font-size="7" fill="#64748b">Preparación de muestra</text>
  </g>
  <line x1="533" y1="42" x2="557" y2="42" stroke="#0f2942" stroke-width="1.5" marker-end="url(#ar)" />

  <!-- Estación 4 -->
  <g filter="url(#sh-card-m)">
    <rect x="560" y="10" width="155" height="65" rx="5" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.2"/>
    <rect x="560" y="10" width="28" height="65" rx="5" fill="#0f2942"/>
    <text x="574" y="48" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="bold" fill="#ffffff" text-anchor="middle">4</text>
    <text x="597" y="32" font-family="'Segoe UI', Arial, sans-serif" font-size="9" font-weight="bold" fill="#0f2942">Enfriado y Limpieza</text>
    <text x="597" y="48" font-family="'Segoe UI', Arial, sans-serif" font-size="7.5" fill="#475569">Decapado y desescoriado</text>
    <text x="597" y="62" font-family="'Segoe UI', Arial, sans-serif" font-size="7" fill="#64748b">Remoción física de impurezas</text>
  </g>

  <!-- Flecha de bajada -->
  <path d="M 640 78 L 640 102 L 640 108" fill="none" stroke="#0f2942" stroke-width="1.5" marker-end="url(#ar)"/>

  <!-- FILA 2: Estaciones 5 a 8 -->
  <!-- Estación 5 -->
  <g filter="url(#sh-card-m)">
    <rect x="560" y="112" width="155" height="65" rx="5" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.2"/>
    <rect x="560" y="112" width="28" height="65" rx="5" fill="#0f2942"/>
    <text x="574" y="150" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="bold" fill="#ffffff" text-anchor="middle">5</text>
    <text x="597" y="132" font-family="'Segoe UI', Arial, sans-serif" font-size="9" font-weight="bold" fill="#0f2942">Análisis de Pureza</text>
    <text x="597" y="148" font-family="'Segoe UI', Arial, sans-serif" font-size="7.5" font-weight="bold" fill="#854d0e">OBTENCIÓN DE LEY</text>
    <text x="597" y="162" font-family="'Segoe UI', Arial, sans-serif" font-size="7" fill="#64748b">Registro técnico: PESO + LEY</text>
  </g>
  <line x1="557" y1="144" x2="533" y2="144" stroke="#0f2942" stroke-width="1.5" marker-end="url(#ar)" />

  <!-- Estación 6 -->
  <g filter="url(#sh-card-m)">
    <rect x="375" y="112" width="155" height="65" rx="5" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.2"/>
    <rect x="375" y="112" width="28" height="65" rx="5" fill="#0f2942"/>
    <text x="389" y="150" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="bold" fill="#ffffff" text-anchor="middle">6</text>
    <text x="412" y="132" font-family="'Segoe UI', Arial, sans-serif" font-size="9" font-weight="bold" fill="#0f2942">Liquidación Multi-Divisa</text>
    <text x="412" y="148" font-family="'Segoe UI', Arial, sans-serif" font-size="7.5" fill="#475569">Onza USD + TC + Descuento</text>
    <text x="412" y="162" font-family="'Segoe UI', Arial, sans-serif" font-size="7" fill="#64748b">Desglose: Dólares y Soles</text>
  </g>
  <line x1="372" y1="144" x2="348" y2="144" stroke="#0f2942" stroke-width="1.5" marker-end="url(#ar)" />

  <!-- Estación 7 -->
  <g filter="url(#sh-card-m)">
    <rect x="190" y="112" width="155" height="65" rx="5" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.2"/>
    <rect x="190" y="112" width="28" height="65" rx="5" fill="#0f2942"/>
    <text x="204" y="150" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="bold" fill="#ffffff" text-anchor="middle">7</text>
    <text x="227" y="132" font-family="'Segoe UI', Arial, sans-serif" font-size="9" font-weight="bold" fill="#0f2942">Pago al Acopiador</text>
    <text x="227" y="148" font-family="'Segoe UI', Arial, sans-serif" font-size="7.5" fill="#475569">Cierre financiero de entrega</text>
    <text x="227" y="162" font-family="'Segoe UI', Arial, sans-serif" font-size="7" fill="#64748b">Generación de lote histórico</text>
  </g>
  <line x1="187" y1="144" x2="163" y2="144" stroke="#0f2942" stroke-width="1.5" marker-end="url(#ar)" />

  <!-- Estación 8 -->
  <g filter="url(#sh-card-m)">
    <rect x="5" y="112" width="155" height="65" rx="5" fill="#ffffff" stroke="#047857" stroke-width="1.2"/>
    <rect x="5" y="112" width="28" height="65" rx="5" fill="#047857"/>
    <text x="19" y="150" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="bold" fill="#ffffff" text-anchor="middle">8</text>
    <text x="42" y="132" font-family="'Segoe UI', Arial, sans-serif" font-size="9" font-weight="bold" fill="#047857">CRUD Consolidación</text>
    <text x="42" y="148" font-family="'Segoe UI', Arial, sans-serif" font-size="7.5" fill="#475569">Selecciona lotes: Peso + Ley</text>
    <text x="42" y="162" font-family="'Segoe UI', Arial, sans-serif" font-size="7" fill="#64748b">Preparación hacia Exportador</text>
  </g>
</svg>
`;

const htmlTemplate = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>SITRA-ORO — Documento Maestro de Especificación Funcional</title>
  <style>
    @page {
      size: A4;
      margin: 22mm 18mm 22mm 18mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-size: 9.5pt;
      line-height: 1.55;
      color: #1e293b;
      background: #ffffff;
      text-align: justify;
    }

    /* PORTADA OFICIAL */
    .cover-page {
      page-break-after: always;
      height: 100%;
      min-height: 250mm;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      text-align: center;
      padding: 5mm 0;
    }
    .cover-top-logos {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #0f2744;
      padding-bottom: 15px;
      margin-bottom: 20px;
    }
    .cover-top-logos img.logo-left {
      height: 65px;
      width: auto;
      object-fit: contain;
    }
    .cover-top-logos img.logo-right {
      height: 65px;
      width: auto;
      object-fit: contain;
    }
    .cover-inst-text {
      flex: 1;
      padding: 0 15px;
    }
    .inst-name {
      font-size: 14pt;
      font-weight: 800;
      color: #0f2744;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      margin-bottom: 3px;
    }
    .fac-name {
      font-size: 10.5pt;
      font-weight: 700;
      color: #854d0e;
      text-transform: uppercase;
      margin-bottom: 2px;
    }
    .esc-name {
      font-size: 9.5pt;
      font-weight: 600;
      color: #475569;
      text-transform: uppercase;
    }

    .cover-emblem-wrap {
      margin: 15px auto;
      width: 140px;
      height: 140px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .cover-emblem-wrap img {
      width: 125px;
      height: auto;
      object-fit: contain;
    }

    .cover-title-group {
      margin: 10px 0 20px;
    }
    .project-name {
      font-size: 26pt;
      font-weight: 900;
      color: #0f2744;
      letter-spacing: 1.5px;
      margin-bottom: 4px;
    }
    .project-desc {
      font-size: 11pt;
      font-weight: 700;
      color: #854d0e;
      margin-bottom: 16px;
    }
    .doc-main-type {
      font-size: 13.5pt;
      font-weight: 800;
      color: #0f2744;
      line-height: 1.35;
      text-transform: uppercase;
      max-width: 550px;
      margin: 0 auto 10px;
    }
    .doc-version-status {
      font-size: 9.5pt;
      font-weight: 700;
      color: #047857;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .cover-meta-card {
      border: 1.5px solid #cbd5e1;
      border-radius: 6px;
      background: #f8fafc;
      padding: 14px 20px;
      margin: 15px 0 10px;
      font-size: 9pt;
      text-align: left;
    }
    .meta-card-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px 24px;
    }
    .meta-card-grid div strong {
      color: #0f2744;
    }
    .cover-city-date {
      margin-top: 15px;
      font-size: 9pt;
      font-weight: 700;
      color: #475569;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* ENCABEZADOS Y SECCIONES */
    h2 {
      font-size: 11.5pt;
      font-weight: 800;
      color: #0f2744;
      text-transform: uppercase;
      border-bottom: 1.5px solid #0f2744;
      padding-bottom: 4px;
      margin-top: 22px;
      margin-bottom: 10px;
      page-break-after: avoid;
    }
    h3 {
      font-size: 10.5pt;
      font-weight: 700;
      color: #0f2744;
      margin-top: 14px;
      margin-bottom: 6px;
      page-break-after: avoid;
    }
    h4 {
      font-size: 9.5pt;
      font-weight: 700;
      color: #334155;
      margin-top: 10px;
      margin-bottom: 4px;
      page-break-after: avoid;
    }
    p {
      margin-bottom: 8px;
    }
    ul, ol {
      margin-left: 20px;
      margin-bottom: 8px;
    }
    li {
      margin-bottom: 3px;
    }

    /* TABLAS ESTILO ACADÉMICO FORMAL */
    table.formal-table {
      width: 100%;
      border-collapse: collapse;
      margin: 12px 0 16px;
      font-size: 8.8pt;
      page-break-inside: avoid;
    }
    table.formal-table th {
      border-top: 2px solid #0f2744;
      border-bottom: 1.5px solid #0f2744;
      background-color: #f1f5f9;
      color: #0f2744;
      font-weight: 700;
      padding: 6px 8px;
      text-align: left;
    }
    table.formal-table td {
      border-bottom: 1px solid #cbd5e1;
      padding: 5px 8px;
      vertical-align: top;
      text-align: left;
    }
    table.formal-table tr:nth-child(even) td {
      background-color: #f8fafc;
    }
    table.formal-table tr:last-child td {
      border-bottom: 2px solid #0f2744;
    }

    .notice-block {
      border-left: 3px solid #0f2744;
      padding: 6px 12px;
      margin: 10px 0;
      background-color: #f8fafc;
      font-size: 9pt;
      font-style: italic;
      color: #334155;
    }

    .page-break {
      page-break-before: always;
    }

    .signatures-block {
      margin-top: 35px;
      display: flex;
      justify-content: space-around;
      text-align: center;
      font-size: 9pt;
      page-break-inside: avoid;
    }
    .signature-item {
      width: 220px;
    }
    .signature-line {
      border-top: 1px solid #1e293b;
      margin: 40px auto 5px;
    }
  </style>
</head>
<body>

  <!-- ==================== PORTADA OFICIAL ==================== -->
  <div class="cover-page">
    <div class="cover-top-logos">
      <img src="${logoUpeu}" class="logo-left" alt="Universidad Peruana Unión">
      <div class="cover-inst-text">
        <div class="inst-name">Universidad Peruana Unión</div>
        <div class="fac-name">Facultad de Ingeniería y Arquitectura</div>
        <div class="esc-name">Escuela Profesional de Ingeniería de Sistemas</div>
      </div>
      <img src="${logoSistemas}" class="logo-right" alt="Escuela Profesional de Ingeniería de Sistemas">
    </div>

    <div class="cover-emblem-wrap">
      <img src="${logoSitraOro}" alt="SITRA-ORO Emblema">
    </div>

    <div class="cover-title-group">
      <div class="project-name">SITRA-ORO</div>
      <div class="project-desc">Sistema de Trazabilidad y Liquidación en Acopio de Oro</div>
      <div class="doc-main-type">Informe Técnico de Especificación Funcional, Modelo de Dominio y Cadena de Custodia</div>
      <div class="doc-version-status">Versión 2.0 — Auditoría Funcional Oficial de Negocio</div>
    </div>

    <div class="cover-meta-card">
      <div class="meta-card-grid">
        <div><strong>Asignatura:</strong> Lenguaje de Programación II</div>
        <div><strong>Docente Titular:</strong> Ing. Erick David Salazar</div>
        <div><strong>Estudiante:</strong> Faijo Calisaya Helio Paul</div>
        <div><strong>Equipo de Trabajo:</strong> Equipo 05</div>
        <div><strong>Ciclo Académico:</strong> Ciclo IV — Semestre 2026-II</div>
        <div><strong>Repositorio Oficial:</strong> SysProyec_Acopus (GitHub)</div>
      </div>
    </div>

    <div class="cover-city-date">
      Juliaca / Lima, Perú — Septiembre de 2026
    </div>
  </div>

  <!-- ==================== CONTENIDO ==================== -->

  <h2>1. Control de Versiones y Auditoría de Dominio</h2>
  <p>El presente documento constituye la especificación canónica y fuente oficial de verdad para el diseño arquitectónico, modelado de dominio (DDD), diagramas de clases UML, esquemas de bases de datos relacionales (Oracle XE) y desarrollo en Spring Boot y Angular del proyecto <strong>SITRA-ORO</strong>.</p>

  <table class="formal-table">
    <thead>
      <tr>
        <th style="width: 12%;">Versión</th>
        <th style="width: 15%;">Fecha</th>
        <th style="width: 25%;">Responsable</th>
        <th>Descripción y Racional Técnico</th>
        <th style="width: 14%;">Estado</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>v1.0</strong></td>
        <td>10/09/2026</td>
        <td>Equipo 05 (Helio Calisaya)</td>
        <td>Diseño preliminar basado en tres actores genéricos. Asumía un recargo rígido del 5% al oro verde y ubicaba a Minero como catálogo de Parámetros.</td>
        <td>Superada</td>
      </tr>
      <tr>
        <td><strong>v2.0</strong></td>
        <td>24/09/2026</td>
        <td>Faijo Calisaya Helio Paul</td>
        <td>Auditoría Maestra Oficial: Incorpora ciclo físico de Mayorista (limpieza, análisis y Ley), nuevo pesaje independiente, CRUD Consolidación (Peso + Ley), reubica Minero en Acopiador y cataloga reglas pendientes.</td>
        <td>Vigente / Oficial</td>
      </tr>
    </tbody>
  </table>

  <h2>2. Macroproceso de Negocio y Cadena de Valor</h2>
  <p>La cadena de comercialización y acopio de mineral aurífero se articula a través de cuatro eslabones secuenciales clearly delimitados:</p>

  ${svgMacroCadena}

  <p>La cadena inicia con el <strong>Minero</strong>, quien puede consultar previamente el Cotizador para conocer un valor referencial. Luego se presenta físicamente en las instalaciones del <strong>Acopiador</strong>, quien ejecuta el pesaje inicial, la fundición, el enfriamiento y el segundo pesaje. Tras clasificar el lote en Rojo o Verde, liquida en Soles, efectúa el desembolso real y almacena el mineral de forma segregada. Periódicamente (habitualmente de manera semanal), el Acopiador traslada el mineral acumulado hacia el <strong>Mayorista</strong>, quien ejecuta un nuevo pesaje de entrada, fundición secundaria, desescoriado y limpieza rigurosa, determinación instrumental de la Ley, liquidación multi-divisa (USD y PEN) y pago. Finalmente, mediante la funcionalidad de <strong>Consolidación</strong>, se seleccionan lotes históricos por Peso y Ley con destino al <strong>Exportador</strong>.</p>

  <h2>3. Clasificación y Delimitación de Módulos</h2>
  <table class="formal-table">
    <thead>
      <tr>
        <th style="width: 20%;">Clasificación</th>
        <th style="width: 18%;">Módulo</th>
        <th style="width: 32%;">Paquete Base (Spring Modulith)</th>
        <th>Responsabilidad Arquitectónica</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Transaccional</strong></td>
        <td>Acopiador</td>
        <td><code>pe.edu.upeu.sitraoro.acopio.acopiador</code></td>
        <td>Gestión de Mineros, pesajes 1 y 2, fundición, compras reales, pagos en PEN y acumulación en bóveda por color.</td>
      </tr>
      <tr>
        <td><strong>Transaccional</strong></td>
        <td>Mayorista</td>
        <td><code>pe.edu.upeu.sitraoro.acopio.mayorista</code></td>
        <td>Pesaje independiente de recepción, limpieza, análisis de Ley, liquidación USD/PEN, pagos a acopiadores y CRUD Consolidación.</td>
      </tr>
      <tr>
        <td><strong>No Transaccional</strong></td>
        <td>Cotizador</td>
        <td><code>pe.edu.upeu.sitraoro.acopio.cotizador</code></td>
        <td>Cálculo puro estimativo para mineros. No muta estado, no persiste compras ni afecta stock.</td>
      </tr>
      <tr>
        <td><strong>No Transaccional</strong></td>
        <td>Parámetros</td>
        <td><code>pe.edu.upeu.sitraoro.acopio.parametros</code></td>
        <td>Catálogo centralizado de tarifas: precio gramo PEN, onza USD, tipo de cambio y descuento.</td>
      </tr>
      <tr>
        <td><strong>Transversal</strong></td>
        <td>Seguridad</td>
        <td><code>pe.edu.upeu.sitraoro.acopio.seguridad</code></td>
        <td>Autenticación, autorización basada en roles (RBAC) y auditoría transversal del sistema.</td>
      </tr>
    </tbody>
  </table>

  <div class="notice-block">
    <strong>Delimitación de elementos no modulares:</strong><br>
    • <strong>Dashboard:</strong> Es una interfaz gráfica de consulta agregada; consume información de los módulos propietarios sin poseer entidades transaccionales.<br>
    • <strong>Consolidación:</strong> Es una subcapacidad interna estructurada como CRUD dentro del módulo Mayorista.<br>
    • <strong>Exportador:</strong> Es un actor comercial externo al sistema monolítico.
  </div>

  <div class="page-break"></div>

  <h2>4. Especificación Detallada de Procesos del Dominio</h2>

  <h3>4.1 Flujo Operativo del Módulo Acopiador</h3>
  <p>El módulo Acopiador representa la primera transacción económica real de mineral en el sistema. Su flujo secuencial se ilustra a continuación:</p>

  ${svgFlujoAcopiador}

  <table class="formal-table">
    <thead>
      <tr>
        <th style="width: 8%;">Paso</th>
        <th style="width: 25%;">Actividad Operativa</th>
        <th style="width: 22%;">Actor Responsable</th>
        <th>Control Físico y Regla de Negocio</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>01</strong></td>
        <td>Identificación y Registro</td>
        <td>Acopiador</td>
        <td>Alta en padrón de mineros para preservar la trazabilidad de procedencia.</td>
      </tr>
      <tr>
        <td><strong>02</strong></td>
        <td>Primer Pesaje (P1)</td>
        <td>Operador de Acopio</td>
        <td>Pesaje de mineral en bruto en balanza de precisión calibrada (gramos, 3 decimales).</td>
      </tr>
      <tr>
        <td><strong>03</strong></td>
        <td>Fundición Primaria</td>
        <td>Fundidor de Acopio</td>
        <td>Tratamiento térmico en crisol para eliminar impurezas superficiales.</td>
      </tr>
      <tr>
        <td><strong>04</strong></td>
        <td>Enfriamiento</td>
        <td>Fundidor de Acopio</td>
        <td>Inmersión controlada en agua para estabilizar la estructura física y masa.</td>
      </tr>
      <tr>
        <td><strong>05</strong></td>
        <td>Segundo Pesaje (P2)</td>
        <td>Operador de Acopio</td>
        <td>Registro del peso neto post-fundición. La merma física se registra para auditoría sin bloqueos automáticos.</td>
      </tr>
      <tr>
        <td><strong>06</strong></td>
        <td>Clasificación Visual</td>
        <td>Acopiador</td>
        <td>Asignación organoléptica directa en ROJO o VERDE. Se prohíben fórmulas automatizadas.</td>
      </tr>
      <tr>
        <td><strong>07</strong></td>
        <td>Liquidación y Desembolso</td>
        <td>Acopiador</td>
        <td>Consulta de tarifa oficial en Parámetros, cálculo en Soles (PEN) y pago real al minero.</td>
      </tr>
      <tr>
        <td><strong>08</strong></td>
        <td>Almacenamiento Segregado</td>
        <td>Almacenero de Bóveda</td>
        <td>Acumulación física en bóveda separada por color para despacho semanal hacia el mayorista.</td>
      </tr>
    </tbody>
  </table>

  <h3>4.2 Flujo Operativo del Módulo Mayorista</h3>
  <p>El módulo Mayorista adquiere el mineral acumulado por los acopiadores y ejecuta la certificación de pureza:</p>

  ${svgFlujoMayorista}

  <table class="formal-table">
    <thead>
      <tr>
        <th style="width: 8%;">Paso</th>
        <th style="width: 25%;">Actividad Operativa</th>
        <th style="width: 22%;">Actor Responsable</th>
        <th>Control Físico y Regla de Negocio</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>01</strong></td>
        <td>Recepción Segregada</td>
        <td>Mayorista</td>
        <td>Recepción física de los paquetes del acopiador manteniendo la separación Rojo / Verde.</td>
      </tr>
      <tr>
        <td><strong>02</strong></td>
        <td>Nuevo Pesaje Independiente</td>
        <td>Operador Mayorista</td>
        <td>Pesaje en balanza de planta industrial. El sistema preserva ambos pesos (acopiador vs. mayorista).</td>
      </tr>
      <tr>
        <td><strong>03</strong></td>
        <td>Homogeneización</td>
        <td>Técnico de Planta</td>
        <td>Fundición secundaria para unificar la masa antes de la toma de muestras de análisis.</td>
      </tr>
      <tr>
        <td><strong>04</strong></td>
        <td>Enfriamiento y Limpieza</td>
        <td>Técnico Metalurgista</td>
        <td>Desescoriado y decapado químico de óxidos superficiales. Etapa obligatoria antes del ensayo.</td>
      </tr>
      <tr>
        <td><strong>05</strong></td>
        <td>Análisis Instrumental de LEY</td>
        <td>Laboratorio Químico</td>
        <td>Certificación analítica de pureza (fino en milésimas). Se asienta la tupla técnica: PESO + LEY.</td>
      </tr>
      <tr>
        <td><strong>06</strong></td>
        <td>Liquidación Multi-Divisa</td>
        <td>Gerencia Mayorista</td>
        <td>Cálculo integrando Onza Troy USD, Tipo de Cambio USD/PEN y Descuento. Desglose en USD y PEN.</td>
      </tr>
      <tr>
        <td><strong>07</strong></td>
        <td>Pago al Acopiador</td>
        <td>Tesorería Mayorista</td>
        <td>Desembolso financiero al acopiador y asentamiento del lote histórico inmutable.</td>
      </tr>
      <tr>
        <td><strong>08</strong></td>
        <td>CRUD Consolidación</td>
        <td>Analista Comercial</td>
        <td>Selección de lotes históricos extrayendo Peso + Ley para preparar el despacho hacia Exportación.</td>
      </tr>
    </tbody>
  </table>

  <div class="page-break"></div>

  <h2>5. Matriz de Trazabilidad Integral End-to-End</h2>
  <table class="formal-table">
    <thead>
      <tr>
        <th style="width: 8%;">Hito</th>
        <th style="width: 25%;">Etapa Operativa</th>
        <th style="width: 22%;">Actor / Módulo</th>
        <th>Evidencia y Atributos Almacenados</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>01</strong></td>
        <td>Identificación de Origen</td>
        <td>Minero / Acopiador</td>
        <td>Identidad del minero (DNI/RUC), zona de procedencia, fecha y hora de atención.</td>
      </tr>
      <tr>
        <td><strong>02</strong></td>
        <td>Recepción Gravimétrica 1</td>
        <td>Operador de Acopio</td>
        <td>Peso en bruto sin fundir (P1) en gramos con tres decimales.</td>
      </tr>
      <tr>
        <td><strong>03</strong></td>
        <td>Tratamiento Térmico</td>
        <td>Fundidor de Acopio</td>
        <td>Proceso físico de fundición y enfriamiento controlado en agua.</td>
      </tr>
      <tr>
        <td><strong>04</strong></td>
        <td>Recepción Gravimétrica 2</td>
        <td>Operador de Acopio</td>
        <td>Peso neto resultante post-fundición (P2), variación gravimétrica registrada.</td>
      </tr>
      <tr>
        <td><strong>05</strong></td>
        <td>Clasificación Visual</td>
        <td>Operador de Acopio</td>
        <td>Asignación organoléptica de calidad: ROJO o VERDE.</td>
      </tr>
      <tr>
        <td><strong>06</strong></td>
        <td>Liquidación Primaria</td>
        <td>Acopiador</td>
        <td>Tarifa oficial de Parámetros (PEN/g), importe liquidado y pago real al minero.</td>
      </tr>
      <tr>
        <td><strong>07</strong></td>
        <td>Custodia en Bóveda</td>
        <td>Acopiador</td>
        <td>Saldo acumulado segregado: Stock Acumulado Rojo y Stock Acumulado Verde.</td>
      </tr>
      <tr>
        <td><strong>08</strong></td>
        <td>Nuevo Pesaje de Planta</td>
        <td>Mayorista</td>
        <td>Pesaje independiente de recepción: Peso Mayorista Rojo y Peso Mayorista Verde.</td>
      </tr>
      <tr>
        <td><strong>09</strong></td>
        <td>Limpieza y Decapado</td>
        <td>Mayorista</td>
        <td>Remoción física y química de escorias residuales post-fundición secundaria.</td>
      </tr>
      <tr>
        <td><strong>10</strong></td>
        <td>Certificación de Pureza</td>
        <td>Laboratorio Mayorista</td>
        <td>Ensayo instrumental determinando y registrando formalmente la LEY DEL ORO.</td>
      </tr>
      <tr>
        <td><strong>11</strong></td>
        <td>Liquidación Financiera</td>
        <td>Mayorista</td>
        <td>Onza USD, Tipo de Cambio, Descuento, Subtotal USD, Subtotal PEN y Pago Total.</td>
      </tr>
      <tr>
        <td><strong>12</strong></td>
        <td>Consolidación</td>
        <td>Mayorista (CRUD)</td>
        <td>Selección de lotes históricos extrayendo el vector crítico: Peso + Ley.</td>
      </tr>
      <tr>
        <td><strong>13</strong></td>
        <td>Despacho Internacional</td>
        <td>Exportador (Externo)</td>
        <td>Comercialización exterior del lote consolidado preparado por el mayorista.</td>
      </tr>
    </tbody>
  </table>

  <h2>6. Matriz de Desambiguación Conceptual (Anti-Patrones)</h2>
  <table class="formal-table">
    <thead>
      <tr>
        <th style="width: 25%;">Concepto A</th>
        <th style="width: 25%;">Concepto B</th>
        <th>Criterio Canónico de Separación y Regla de Dominio</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Cotización</strong></td>
        <td><strong>Compra Real</strong></td>
        <td>La cotización es una consulta informativa sin efectos transaccionales. La compra es transaccional, genera asientos contables y desembolsa dinero real.</td>
      </tr>
      <tr>
        <td><strong>Compra al Minero</strong></td>
        <td><strong>Entrega al Mayorista</strong></td>
        <td>La compra al minero es un acto minorista e individual en zona de acopio. La entrega al mayorista es un despacho al por mayor de stock acumulado semanal.</td>
      </tr>
      <tr>
        <td><strong>Peso del Acopiador</strong></td>
        <td><strong>Peso del Mayorista</strong></td>
        <td>Son mediciones físicas independientes en balanzas y momentos distintos. El sistema resguarda ambas de forma autónoma sin sobreescrituras.</td>
      </tr>
      <tr>
        <td><strong>Pago al Minero</strong></td>
        <td><strong>Pago al Acopiador</strong></td>
        <td>El acopiador paga al minero en soles con precio de acopio local. El mayorista liquida al acopiador computando Onza en USD, Ley, Tipo de Cambio y Descuento.</td>
      </tr>
      <tr>
        <td><strong>Acopio en Bóveda</strong></td>
        <td><strong>Consolidación</strong></td>
        <td>Acopio es custodia física y acumulación de inventario en bóveda. Consolidación es un agrupamiento analítico de lotes históricos por Peso + Ley.</td>
      </tr>
      <tr>
        <td><strong>Mayorista</strong></td>
        <td><strong>Exportador</strong></td>
        <td>El Mayorista es un actor transaccional con módulo interno propio. El Exportador es un agente mercantil externo del comercio exterior.</td>
      </tr>
      <tr>
        <td><strong>Módulo de Software</strong></td>
        <td><strong>Dashboard</strong></td>
        <td>Los módulos administran reglas transaccionales y persistencia propia. El Dashboard es solo una vista agregadora de consulta.</td>
      </tr>
      <tr>
        <td><strong>Módulo de Software</strong></td>
        <td><strong>Consolidación</strong></td>
        <td>Consolidación no posee base de datos ni límites aislados; es un CRUD perteneciente a la estructura interna del Mayorista.</td>
      </tr>
      <tr>
        <td><strong>Módulo Parámetros</strong></td>
        <td><strong>Dueño de Mineros</strong></td>
        <td>Parámetros solo mantiene constantes de mercado. La administración de Mineros pertenece de manera obligatoria al módulo Acopiador.</td>
      </tr>
    </tbody>
  </table>

  <h2>7. Registro Formal de Pendientes de Definición de Negocio</h2>
  <table class="formal-table">
    <thead>
      <tr>
        <th style="width: 10%;">Código</th>
        <th style="width: 35%;">Aspecto Funcional</th>
        <th style="width: 18%;">Estado Formal</th>
        <th>Justificación Técnica de la Espera</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>PDN-01</strong></td>
        <td>Fórmula Exacta de Liquidación Mayorista</td>
        <td>Pendiente</td>
        <td>Se conocen las variables (Peso, Onza, Ley, Tipo Cambio, Descuento), pero falta formalizar la ecuación exacta para evitar sesgos financieros.</td>
      </tr>
      <tr>
        <td><strong>PDN-02</strong></td>
        <td>Algoritmo de Consolidación de Leyes</td>
        <td>Pendiente</td>
        <td>Falta definir si la ley compuesta se obtiene mediante promedio ponderado gravimétrico u otro método metalúrgico validado.</td>
      </tr>
      <tr>
        <td><strong>PDN-03</strong></td>
        <td>Regla y Tasa de Descuento Comercial</td>
        <td>Pendiente</td>
        <td>Descartado el 5% fijo de oro verde, se requiere la regla formal que determina la tasa de descuento aplicable por el mayorista.</td>
      </tr>
      <tr>
        <td><strong>PDN-04</strong></td>
        <td>Umbral de Merma en Fundición de Acopio</td>
        <td>Pendiente</td>
        <td>Margen admisible de diferencia entre P1 y P2 antes de requerir autorización por merma excesiva.</td>
      </tr>
      <tr>
        <td><strong>PDN-05</strong></td>
        <td>Tolerancia de Discrepancia entre Balanzas</td>
        <td>Pendiente</td>
        <td>Variación máxima admisible entre el peso declarado por el acopiador y el verificado en planta mayorista.</td>
      </tr>
      <tr>
        <td><strong>PDN-06</strong></td>
        <td>Parámetros Objetivos de Colorimetría</td>
        <td>Pendiente</td>
        <td>Criterios físicos estandarizados para clasificar en Rojo o Verde más allá de la inspección visual empírica.</td>
      </tr>
      <tr>
        <td><strong>PDN-07</strong></td>
        <td>Campos Legales Obligatorios del Minero</td>
        <td>Pendiente</td>
        <td>Validación de requisitos normativos (carné REINFO, número de concesión, RUC y coordenadas de procedencia).</td>
      </tr>
      <tr>
        <td><strong>PDN-08</strong></td>
        <td>Matriz Definitiva de Seguridad RBAC</td>
        <td>Pendiente</td>
        <td>Estructura final de roles y permisos para el pase a producción de Seguridad.</td>
      </tr>
      <tr>
        <td><strong>PDN-09</strong></td>
        <td>Máquina de Estados de Transacciones</td>
        <td>Pendiente</td>
        <td>Catálogo formal de estados del ciclo de vida (Iniciada, Pesada, Fundida, Liquidada, Pagada, Anulada).</td>
      </tr>
    </tbody>
  </table>

  <h2>8. Análisis de Brecha (Gap Analysis) y Plan de Refactorización Técnica</h2>
  <table class="formal-table">
    <thead>
      <tr>
        <th style="width: 18%;">Componente</th>
        <th style="width: 25%;">Situación Previa (Discrepante)</th>
        <th style="width: 25%;">Situación Meta (Auditada)</th>
        <th>Acción Técnica Concreta</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Backend: Minero</strong></td>
        <td>Ubicado en paquete <code>parametros</code></td>
        <td>Pertenece al módulo <code>acopiador</code></td>
        <td>Mover entidad, repositorio, servicio y controlador al paquete <code>acopio.acopiador</code>.</td>
      </tr>
      <tr>
        <td><strong>Backend: Mayorista</strong></td>
        <td>Multiplica por 1.05 fijo en oro verde</td>
        <td>Regla del 5% descartada</td>
        <td>Remover cálculo rígido en <code>MayoristaServiceImpl</code> y adaptar consumo de parámetros.</td>
      </tr>
      <tr>
        <td><strong>Backend: Entidades</strong></td>
        <td>Liquidación sin Ley, Descuento ni USD</td>
        <td>Debe incluir Ley, Descuento, USD y PEN</td>
        <td>Refactorizar entidades JPA, DTOs y validaciones en el módulo Mayorista.</td>
      </tr>
      <tr>
        <td><strong>Backend: Consolidación</strong></td>
        <td>Inexistente (solo flag textual)</td>
        <td>CRUD formal de selección por Peso + Ley</td>
        <td>Crear entidad, repositorio y endpoints de consolidación en Mayorista.</td>
      </tr>
      <tr>
        <td><strong>Base de Datos (BD2)</strong></td>
        <td>FK directa <code>ID_LIQUIDACION_G1</code> en compras</td>
        <td>Compras desacopladas de la liquidación</td>
        <td>Reestructurar relación para reflejar liquidación de lotes acumulados y no compras unitarias.</td>
      </tr>
      <tr>
        <td><strong>Backend: Dashboard</strong></td>
        <td>Controlador dentro de <code>parametros</code></td>
        <td>Vista transversal desacoplada</td>
        <td>Mover <code>DashboardController</code> fuera del catálogo de parámetros.</td>
      </tr>
    </tbody>
  </table>

  <h2>9. Conclusiones y Conformidad Institucional</h2>
  <p>1. El presente informe técnico formaliza la especificación funcional canónica del sistema <strong>SITRA-ORO</strong>, erradicando supuestos que distorsionaban la operativa real del acopio aurífero.</p>
  <p>2. La arquitectura monolítica modular garantiza una rigurosa separación de responsabilidades entre los cinco módulos del sistema mediante el uso de contratos públicos en Spring Modulith.</p>
  <p>3. Se ratifica la estricta prohibición de implementar cálculos inventados, manteniendo catalogados como pendientes aquellos aspectos que requieren ratificación de la gerencia del negocio.</p>
  <p>4. El plan de refactorización técnica suministra una guía estructurada para la evolución del backend Spring Boot, los scripts de base de datos Oracle y la interfaz de usuario en Angular SPA.</p>

  <div class="signatures-block">
    <div class="signature-item">
      <div class="signature-line"></div>
      <strong>Faijo Calisaya Helio Paul</strong><br>
      Estudiante Investigador — Equipo 05<br>
      Escuela Profesional de Ingeniería de Sistemas<br>
      <strong>Universidad Peruana Unión (UPeU)</strong>
    </div>
    <div class="signature-item">
      <div class="signature-line"></div>
      <strong>Ing. Erick David Salazar</strong><br>
      Docente de Asignatura<br>
      Facultad de Ingeniería y Arquitectura<br>
      <strong>Universidad Peruana Unión (UPeU)</strong>
    </div>
  </div>

</body>
</html>
`;

// Paths to update
const filesToGenerate = [
  {
    html: path.join(here, "DOCUMENTO_MAESTRO_CONTEXTO_FUNCIONAL_SITRA_ORO.html"),
    pdf: path.join(here, "DOCUMENTO_MAESTRO_CONTEXTO_FUNCIONAL_SITRA_ORO.pdf")
  },
  {
    html: path.join(here, "INFORME_TECNICO_ESPECIFICACION_DOMINIO_SITRA_ORO.html"),
    pdf: path.join(here, "INFORME_TECNICO_ESPECIFICACION_DOMINIO_SITRA_ORO.pdf")
  }
];

// Write HTML files
for (const f of filesToGenerate) {
  fs.writeFileSync(f.html, htmlTemplate, "utf8");
  console.log("Archivo HTML guardado en:", f.html);
}

console.log("Compilando PDFs oficiales con Playwright...");

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  args: ["--use-angle=swiftshader", "--disable-gpu-sandbox"],
});

try {
  const page = await browser.newPage({
    viewport: { width: 1200, height: 1600 },
  });

  await page.setContent(htmlTemplate, { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  for (const f of filesToGenerate) {
    await page.pdf({
      path: f.pdf,
      format: "A4",
      printBackground: true,
      margin: {
        top: "18mm",
        bottom: "18mm",
        left: "16mm",
        right: "16mm",
      },
      displayHeaderFooter: true,
      headerTemplate: '<div style="font-size: 7.5pt; color: #64748b; font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, sans-serif; width: 100%; padding: 0 16mm; display: flex; justify-content: space-between; border-bottom: 1px solid #cbd5e1; padding-bottom: 2px;"><span>UNIVERSIDAD PERUANA UNIÓN · EP INGENIERÍA DE SISTEMAS</span><span>SITRA-ORO — Documento Maestro v2.0</span></div>',
      footerTemplate: '<div style="font-size: 7.5pt; color: #64748b; font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, sans-serif; width: 100%; padding: 0 16mm; display: flex; justify-content: space-between; border-top: 1px solid #cbd5e1; padding-top: 2px;"><span>Faijo Calisaya Helio Paul (Equipo 05)</span><span>Página <span class="pageNumber"></span> de <span class="totalPages"></span></span></div>',
    });
    console.log("PDF generado exitosamente en:", f.pdf);
  }
} finally {
  await browser.close();
}
