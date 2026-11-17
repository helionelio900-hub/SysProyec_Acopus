# -*- coding: utf-8 -*-
"""
Compilador Maestro del Manual de Usuario SITRA-ORO - Formato Humano Editorial
- Separación nítida y visible de columnas (border-right: 1px solid #cbd5e1)
- Cabecera de tabla elegante (fondo #f1f5f9, texto navy #0f2744, Title Case, sin mayúsculas agresivas)
- Nombres de columnas profesionales: 'Elemento en pantalla' | 'Descripción' | 'Indicación de uso'
- Lista de pasos limpia y natural (1., 2., 3.) sin el repetitivo 'Paso 1: Paso 2:'
- Notas técnicas en 2 columnas equilibradas (Control Metrológico / Gestión de Incidencias)
- CERO Emojis de IA (sin 📋, 💡, ❓, 🔗)
- Tipografía oficial Inter corporativa
- 32 Páginas Exactas A4
- Autor Único: Faijo Calisaya Helio Paul
- Docente: Mg. Nélida Huamán Paco
"""
import os
import pypdf
from playwright.sync_api import sync_playwright

workspace_dir = r"E:\Cursos_Ciclo_4\Lenguaje de Programación II\Sitra_oro"
diagrams_dir = os.path.join(workspace_dir, "ads", "diagramas_entrega")
caps_dir = os.path.join(workspace_dir, "ads", "capturas_reales_angular")
downloads_dir = r"C:\Users\Paul\Downloads"
pdf_final = os.path.join(downloads_dir, "SITRA-ORO_Manual_de_Usuario_Profesional.pdf")

git_branch = "feat/s14-mayorista-dashboard-adelantos"
git_caps_base = f"https://github.com/helionelio900-hub/SysProyec_Acopus/blob/{git_branch}/ads/capturas_reales_angular"
git_diags_base = f"https://github.com/helionelio900-hub/SysProyec_Acopus/blob/{git_branch}/ads/diagramas_entrega"

def asset_url(path):
    return f"file:///{path.replace(os.sep, '/')}"

def resolve_fig(filename):
    p_cap = os.path.join(caps_dir, filename)
    p_diag = os.path.join(diagrams_dir, filename)
    if os.path.exists(p_cap):
        url = f"{git_caps_base}/{filename}"
        return asset_url(p_cap), url
    elif os.path.exists(p_diag):
        url = f"{git_diags_base}/{filename}"
        return asset_url(p_diag), url
    else:
        raise FileNotFoundError(f"CRITICAL: Image not found: {filename}")

url_logo_upeu = asset_url(os.path.join(workspace_dir, "docs", "presentacion", "s06", "assets", "upeu.png"))
url_logo_sistemas = asset_url(os.path.join(workspace_dir, "docs", "presentacion", "s06", "assets", "ingenieria-sistemas.png"))
url_emblema = asset_url(os.path.join(workspace_dir, "docs", "presentacion", "s06", "assets", "quilate-bullion-emblema-v2.png"))
url_firma = asset_url(os.path.join(diagrams_dir, "firma_helio_oficial.png"))

# ==============================================================================
# PÁGINA 1: PORTADA OFICIAL CORPORATIVA
# ==============================================================================
html_portada = f"""<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Portada - Manual de Usuario SITRA-ORO</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    @page {{ size: A4 portrait; margin: 0; }}
    body {{
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      margin: 0; padding: 0; background-color: #ffffff; color: #0f172a;
      display: flex; justify-content: center; align-items: center; height: 100vh;
      -webkit-print-color-adjust: exact;
    }}
    .page-border {{
      width: 178mm; height: 265mm; border: 1.5px solid #0f2744; border-radius: 4px;
      padding: 12mm 14mm; box-sizing: border-box; display: flex; flex-direction: column;
      justify-content: space-between; position: relative;
    }}
    .header-logos {{
      display: flex; justify-content: space-between; align-items: center;
      border-bottom: 1.5px solid #0f2744; padding-bottom: 10px;
    }}
    .header-logos img {{ height: 48px; width: auto; object-fit: contain; }}
    .header-title-text {{ text-align: center; flex-grow: 1; padding: 0 10px; }}
    .header-title-text h2 {{ font-size: 11pt; font-weight: 800; color: #0f2744; margin: 0; letter-spacing: 0.5px; line-height: 1.2; }}
    .header-title-text h3 {{ font-size: 8.5pt; font-weight: 600; color: #334155; margin: 2px 0 0 0; }}
    .header-title-text h4 {{ font-size: 8pt; font-weight: 500; color: #0369a1; margin: 2px 0 0 0; }}
    .hero-container {{ text-align: center; margin: 10px 0; }}
    .hero-badge {{
      display: inline-block; background: #f8fafc; border: 1px solid #cbd5e1;
      padding: 3px 12px; border-radius: 3px; font-size: 7.2pt; font-weight: 700;
      letter-spacing: 0.8px; color: #0f2744; text-transform: uppercase; margin-bottom: 10px;
    }}
    .hero-icon {{ width: 130px; height: auto; margin: 0 auto 10px auto; display: block; }}
    .doc-sponsor {{ font-size: 8pt; font-weight: 700; color: #475569; letter-spacing: 0.8px; text-transform: uppercase; margin-bottom: 4px; }}
    .main-title {{ font-size: 26pt; font-weight: 900; color: #0f2744; margin: 0 0 6px 0; letter-spacing: -0.5px; }}
    .main-subtitle {{
      font-size: 8.6pt; font-weight: 500; color: #334155; line-height: 1.4; max-width: 500px;
      margin: 0 auto; border-left: 3px solid #0f2744; padding: 6px 12px; background: #f8fafc; text-align: left;
    }}
    .info-table {{
      width: 100%; border-collapse: collapse; margin-top: 10px; background: #ffffff;
      border: 1px solid #cbd5e1; border-radius: 4px; overflow: hidden;
    }}
    .info-table td {{ padding: 5px 10px; font-size: 7.8pt; border-bottom: 1px solid #f1f5f9; line-height: 1.3; }}
    .info-table tr:last-child td {{ border-bottom: none; }}
    .info-table td.label {{ width: 32%; font-weight: 700; color: #0f2744; background-color: #f8fafc; border-right: 1px solid #e2e8f0; }}
    .info-table td.value {{ width: 68%; color: #1e293b; font-weight: 500; }}
    .doc-footer {{ text-align: center; border-top: 1px solid #cbd5e1; padding-top: 8px; margin-top: 6px; }}
    .doc-footer p {{ margin: 0; font-size: 7pt; color: #64748b; letter-spacing: 0.5px; }}
  </style>
</head>
<body>
  <div class="page-border">
    <div class="header-logos">
      <img src="{url_logo_upeu}" alt="Logo UPeU">
      <div class="header-title-text">
        <h2>UNIVERSIDAD PERUANA UNIÓN</h2>
        <h3>FACULTAD DE INGENIERÍA Y ARQUITECTURA</h3>
        <h4>Escuela Profesional de Ingeniería de Sistemas</h4>
      </div>
      <img src="{url_logo_sistemas}" alt="Logo Ingeniería de Sistemas">
    </div>

    <div class="hero-container">
      <div class="hero-badge">MANUAL DE USUARIO INTEGRAL · GUÍA PRÁCTICA OPERATIVA</div>
      <img src="{url_emblema}" alt="SITRA-ORO Minería" class="hero-icon">
      <div class="doc-sponsor">Quilate Bullion S.A.C. · Comercializadora y Exportadora</div>
      <h1 class="main-title">SITRA-ORO</h1>
      <div class="main-subtitle">
        <b>Manual Operativo y Guía de Procedimientos del Sistema:</b> Instrucciones paso a paso para el Portal Público (Módulo 0), Acopio y Ventanilla en La Rinconada (Módulo 1), Liquidación Mayorista en Juliaca (Módulo 2) y Arquitectura de Contingencia (Módulo 3).
      </div>
    </div>

    <table class="info-table">
      <tr>
        <td class="label">Control Documental:</td>
        <td class="value"><b>Código: MN-SITRA-001 | Revisión: 02 | Versión: 2.0</b></td>
      </tr>
      <tr>
        <td class="label">Asignatura / Ciclo:</td>
        <td class="value">Análisis y Diseño de Sistemas (ADS) · Ciclo IV (2026-II)</td>
      </tr>
      <tr>
        <td class="label">Docente Evaluadora:</td>
        <td class="value"><b>Mg. Nélida Huamán Paco</b></td>
      </tr>
      <tr>
        <td class="label">Autor / Desarrollador:</td>
        <td class="value"><b>Faijo Calisaya Helio Paul</b> (Sustentación Individual Exclusiva)</td>
      </tr>
      <tr>
        <td class="label">Empresa Patrocinadora:</td>
        <td class="value">Quilate Bullion S.A.C. (Juliaca - Puno)</td>
      </tr>
      <tr>
        <td class="label">Evidencia de Software:</td>
        <td class="value"><b>100% Pantallas Reales Capturadas del Frontend Angular en Tiempo de Ejecución</b></td>
      </tr>
    </table>

    <div class="doc-footer">
      <p><b>Juliaca - Puno, Perú · Noviembre 2026</b></p>
      <p>SITRA-ORO · SISTEMA DE TRAZABILIDAD Y LIQUIDACIÓN FINANCIERA AURÍFERA</p>
    </div>
  </div>
</body>
</html>
"""

# ==============================================================================
# CSS DE CONTENIDO EDITORIAL HUMANO CON SEPARACIÓN NÍTIDA DE COLUMNAS
# ==============================================================================
css_contenido = """
  @page {
    size: A4 portrait;
    margin: 7mm 13mm 9mm 13mm;
    @top-center {
      content: "SITRA-ORO · Manual de Usuario (Código: MN-SITRA-001 · Rev: 02) | ADS - UPeU";
      font-size: 7.2pt;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      color: #64748b;
      font-weight: 500;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 2px;
      margin-bottom: 3px;
    }
    @bottom-left {
      content: "Universidad Peruana Unión · Autor: Faijo Calisaya Helio Paul";
      font-size: 7.2pt;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      color: #64748b;
      border-top: 1px solid #e2e8f0;
      padding-top: 2px;
    }
    @bottom-right {
      content: "Página " counter(page) " de " counter(pages);
      font-size: 7.2pt;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      color: #0f2744;
      font-weight: 700;
      border-top: 1px solid #e2e8f0;
      padding-top: 2px;
    }
  }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    font-size: 8.1pt;
    line-height: 1.33;
    color: #334155;
    margin: 0; padding: 0; background: #ffffff;
    -webkit-print-color-adjust: exact;
  }

  .chapter-page {
    page-break-after: always;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    height: 100%;
  }
  .chapter-page:last-child {
    page-break-after: avoid;
  }

  .sec-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    border-bottom: 1.5px solid #0f2744;
    padding-bottom: 2px;
    margin-bottom: 3px;
  }
  .sec-title {
    font-size: 11pt;
    font-weight: 700;
    color: #0f2744;
    margin: 0;
    letter-spacing: -0.2px;
  }
  .sec-meta {
    font-size: 7.2pt;
    font-weight: 600;
    color: #64748b;
    letter-spacing: 0.3px;
  }

  .context-desc {
    font-size: 7.9pt;
    color: #334155;
    margin-bottom: 3px;
    line-height: 1.28;
  }

  .fig-container {
    text-align: center;
    margin: 1px 0 2px 0;
  }
  .fig-image {
    max-width: 100%;
    height: 87mm;
    object-fit: contain;
    border: 1px solid #cbd5e1;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(15,39,68,0.06);
    background: #ffffff;
    display: block;
    margin: 0 auto;
  }
  .fig-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 2px;
    padding: 0 4px;
    font-size: 6.8pt;
  }
  .fig-caption {
    font-weight: 600;
    color: #475569;
  }
  .fig-link {
    color: #0284c7;
    text-decoration: none;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-weight: 500;
  }
  .fig-link:hover { text-decoration: underline; }

  .steps-section {
    margin-top: 2px;
    margin-bottom: 3px;
  }
  .section-heading {
    font-size: 7.5pt;
    font-weight: 700;
    color: #0f2744;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 2px;
  }
  .step-list {
    margin: 0;
    padding-left: 14px;
    font-size: 7.7pt;
    color: #334155;
  }
  .step-list li {
    margin-bottom: 1.2px;
    line-height: 1.22;
  }
  .step-list strong {
    color: #0f2744;
    font-weight: 600;
  }

  /* TABLA EDITORIAL HUMANA CON SEPARADORES VERTICALES NÍTIDOS */
  .data-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 7.5pt;
    margin-top: 1px;
    margin-bottom: 3px;
    border: 1px solid #cbd5e1;
  }
  .data-table th {
    background-color: #f1f5f9;
    color: #0f2744;
    text-align: left;
    padding: 3.5px 7px;
    font-weight: 700;
    font-size: 7.2pt;
    border-bottom: 2px solid #0f2744;
    border-right: 1px solid #cbd5e1;
    letter-spacing: 0.2px;
  }
  .data-table th:last-child {
    border-right: none;
  }
  .data-table td {
    padding: 2.8px 7px;
    border-bottom: 1px solid #e2e8f0;
    border-right: 1px solid #cbd5e1;
    color: #334155;
    line-height: 1.22;
  }
  .data-table td:last-child {
    border-right: none;
  }
  .data-table tr:nth-child(even) { background-color: #f8fafc; }
  .data-table td.col-item {
    font-weight: 600;
    color: #0f2744;
    width: 26%;
  }
  .data-table td.col-desc { width: 42%; }
  .data-table td.col-action { width: 32%; }

  /* NOTAS EDITORIALES EN 2 COLUMNAS EQUILIBRADAS */
  .notes-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
    margin-top: 1px;
  }
  .note-card {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-top: 2.5px solid #0f2744;
    border-radius: 3px;
    padding: 3.5px 7px;
    font-size: 7.3pt;
    line-height: 1.22;
    color: #475569;
  }
  .note-card.alert {
    border-top-color: #d97706;
  }
  .note-tag {
    display: block;
    font-size: 6.5pt;
    font-weight: 700;
    color: #0f2744;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 1.5px;
  }
  .note-card.alert .note-tag {
    color: #b45309;
  }
"""

def make_chapter_html(cap_num, title, mod_tag, meta_info, context_p, steps_list, fig_file, fig_cap, rows, tip_title, tip_text, faq_title, faq_text):
    img_url, git_url = resolve_fig(fig_file)
    steps_html = "".join([f"<li>{s}</li>" for s in steps_list])
    rows_html = "".join([
        f"<tr><td class='col-item'>{e}</td><td class='col-desc'>{f}</td><td class='col-action'>{r}</td></tr>"
        for e, f, r in rows
    ])
    return f"""
    <div class="chapter-page">
      <div class="sec-header">
        <h2 class="sec-title">{cap_num}. {title}</h2>
        <span class="sec-meta">{mod_tag} · {meta_info}</span>
      </div>

      <div class="context-desc">
        {context_p}
      </div>

      <div class="fig-container">
        <img src="{img_url}" alt="{fig_cap}" class="fig-image">
        <div class="fig-footer">
          <span class="fig-caption">Figura {int(cap_num)}. {fig_cap}</span>
          <a href="{git_url}" target="_blank" class="fig-link">{fig_file}</a>
        </div>
      </div>

      <div class="steps-section">
        <div class="section-heading">Instrucciones de operación</div>
        <ol class="step-list">{steps_html}</ol>
      </div>

      <table class="data-table">
        <thead>
          <tr>
            <th>Elemento en pantalla</th>
            <th>Descripción</th>
            <th>Indicación de uso</th>
          </tr>
        </thead>
        <tbody>
          {rows_html}
        </tbody>
      </table>

      <div class="notes-grid">
        <div class="note-card">
          <span class="note-tag">{tip_title}</span>
          {tip_text}
        </div>
        <div class="note-card alert">
          <span class="note-tag">{faq_title}</span>
          {faq_text}
        </div>
      </div>
    </div>
    """

# ==============================================================================
# PÁGINA 2: ÍNDICE GENERAL CON FORMATO CORPORATIVO
# ==============================================================================
html_indice = """
<div class="chapter-page">
  <div class="sec-header">
    <h2 class="sec-title">Índice General y Guía de Lectura</h2>
    <span class="sec-meta">Control Documental · DOC-01</span>
  </div>

  <div class="context-desc">
    Manual de usuario y guía de procedimientos operativos para la plataforma SITRA-ORO, estructurado para mineros artesanales, cajeros de ventanilla, liquidadores mayoristas y personal de auditoría conforme a las normas de trazabilidad aurífera.
  </div>

  <table class="data-table" style="font-size:7.4pt; margin-top:2px; margin-bottom:4px;">
    <thead>
      <tr>
        <th style="width:16%;">Módulo</th>
        <th style="width:14%;">Capítulo</th>
        <th style="width:58%;">Contenido Operativo del Sistema</th>
        <th style="width:12%; text-align:center;">Página</th>
      </tr>
    </thead>
    <tbody>
      <tr><td><strong>Módulo 0</strong></td><td>Cap. 01 - 04</td><td>Portal Público, Cotizador de Oro, Sedes de Acopio y Pasos del Proceso</td><td style="text-align:center;">Págs. 3 - 6</td></tr>
      <tr><td><strong>Módulo 0</strong></td><td>Cap. 05 - 07</td><td>Inicio de Sesión, Registro con DNI y Portal Personal del Minero</td><td style="text-align:center;">Págs. 7 - 9</td></tr>
      <tr><td><strong>Módulo 1</strong></td><td>Cap. 08 - 12</td><td>Ventanilla La Rinconada: Resumen, Compras, Solicitudes, Historial y Reporte</td><td style="text-align:center;">Págs. 10 - 14</td></tr>
      <tr><td><strong>Módulo 1</strong></td><td>Cap. 13 - 17</td><td>Ticket Térmico con QR, Caja Chica, Préstamos, Padrón y Alta de Mineros</td><td style="text-align:center;">Págs. 15 - 19</td></tr>
      <tr><td><strong>Módulo 1 y 2</strong></td><td>Cap. 18 - 19</td><td>Monitor de Mercado Spot Internacional y Resumen Ejecutivo Mayorista</td><td style="text-align:center;">Págs. 20 - 21</td></tr>
      <tr><td><strong>Módulo 2</strong></td><td>Cap. 20 - 24</td><td>Recepción en Juliaca: Valijas, Contraste de Peso, Exportación, Leyes y Compras</td><td style="text-align:center;">Págs. 22 - 26</td></tr>
      <tr><td><strong>Módulo 2</strong></td><td>Cap. 25 - 28</td><td>Liquidación al Acopiador, Caja y Adelantos, Barras Doré y Red de Centros</td><td style="text-align:center;">Págs. 27 - 30</td></tr>
      <tr><td><strong>Módulo 3 y Cierre</strong></td><td>Cap. 29 - 30</td><td>Uso sin Internet (Circuit Breaker) y Acta de Conformidad con Firma Oficial</td><td style="text-align:center;">Págs. 31 - 32</td></tr>
    </tbody>
  </table>

  <div class="steps-section">
    <div class="section-heading">Estructura metodológica de cada capítulo</div>
    <ol class="step-list" style="font-size:7.5pt;">
      <li><strong>Captura de pantalla real:</strong> Imagen auténtica obtenida directamente de la interfaz Angular en tiempo de ejecución.</li>
      <li><strong>Instrucciones de operación:</strong> Secuencia numerada de pasos claros en modo imperativo para guiar al usuario.</li>
      <li><strong>Tabla de elementos:</strong> Columnas separadas con descripción e indicación práctica de cada botón y casilla.</li>
      <li><strong>Tarjeta de control:</strong> Regla de campo, seguridad física en bóveda, metrología o cumplimiento tributario.</li>
      <li><strong>Tarjeta de contingencia:</strong> Procedimiento inmediato para resolver fallas de red, balanza o discrepancias de peso.</li>
    </ol>
  </div>

  <div class="notes-grid" style="margin-top:4px;">
    <div class="note-card">
      <span class="note-tag">Repositorio institucional</span>
      Cada figura cuenta con un enlace digital al archivo de alta definición alojado en el repositorio GitHub bajo la rama oficial <code>feat/s14-mayorista-dashboard-adelantos</code>.
    </div>
    <div class="note-card">
      <span class="note-tag">Créditos de autoría y cátedra</span>
      Desarrollado de manera individual por el estudiante <strong>Faijo Calisaya Helio Paul</strong> para <strong>Quilate Bullion S.A.C.</strong> bajo la evaluación de la docente <strong>Mg. Nélida Huamán Paco</strong> (UPeU).
    </div>
  </div>

  <div style="background: linear-gradient(135deg, #0f2744 0%, #1e3a5f 100%); border: 1.5px solid #f59e0b; border-radius: 6px; padding: 5px 12px; margin-top: 4px; color: #ffffff; display: flex; align-items: center; justify-content: space-between;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="background: #f59e0b; color: #0f2744; font-size: 10pt; font-weight: 900; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">▶</span>
      <div>
        <div style="font-size: 7.6pt; font-weight: 800; color: #f59e0b; letter-spacing: 0.2px;">VIDEO PITCH Y RECORRIDO OFICIAL DEL SISTEMA (1080p · 4m 28s)</div>
        <div style="font-size: 6.7pt; color: #cbd5e1;">Recorrido integral por los 15 pasos con voz clonada del autor <strong>Helio Paul Calisaya</strong>. Alojado en <code>docs/video/</code> del repositorio.</div>
      </div>
    </div>
    <span style="background: #f59e0b; color: #0f2744; font-size: 6.8pt; font-weight: 800; padding: 2px 7px; border-radius: 4px; white-space: nowrap;">MP4 Oficial</span>
  </div>
</div>
"""

# ==============================================================================
# DEFINICIÓN EDITORIAL DE LOS 29 CAPÍTULOS
# ==============================================================================
chapters = [
    # Cap 01: 01_landing_hero.png
    ("01", "Portal Público y Monitoreo Climático", "Módulo 0", "Acceso Libre · Web",
     "Portal web institucional que permite al minero artesanal consultar las condiciones climáticas de La Rinconada y conocer los servicios de acopio de Quilate Bullion antes de movilizar su mineral.",
     ["Verifica en la pastilla superior izquierda la temperatura y estado del clima en La Rinconada (-5 °C, Nieve o Llovizna).",
      "Si te encuentras en otra localidad de Puno, presiona el botón <strong>Usar mi ubicación</strong> para sincronizar tu clima vía GPS.",
      "Para calcular el valor estimado de tu mineral en soles, presiona el botón <strong>Consultar mi estimado</strong>.",
      "Si deseas conocer el flujo de compra formal, presiona el botón <strong>Conoce cómo funciona</strong>.",
      "Para acceder a tu panel de usuario o crear una cuenta nueva, utiliza los accesos <strong>Ingresar</strong> o <strong>Crear cuenta</strong>."],
     "01_landing_hero.png", "Portada del portal público con monitoreo del clima en tiempo real de La Rinconada.",
     [("Pastilla de clima", "Sensor meteorológico en tiempo real de La Rinconada.", "Muestra temperatura y estado para prevenir traslados con carreteras congeladas."),
      ("Usar mi ubicación", "Geolocalización satelital del productor.", "Actualiza la temperatura y condiciones según la posición GPS actual."),
      ("Consultar mi estimado", "Desplazamiento automático al cotizador en soles.", "Calcula el importe antes de salir de la zona de explotación."),
      ("Crear cuenta", "Apertura del formulario de empadronamiento minero.", "Permite crear una cuenta personal con DNI sin costo alguno."),
      ("Ingresar", "Acceso al módulo de autenticación para mineros.", "Redirige a la pantalla segura de ingreso al sistema.")],
     "Alerta meteorológica",
     "En La Rinconada las heladas nocturnas alcanzan los -15 °C congelando plantas de relave y accesos viales. El transportista y productor deben consultar el estado meteorológico antes de emprender viaje hacia Ananea para evitar bloqueos por nevada.",
     "Falla en la carga meteorológica",
     "Si el indicador meteorológico no actualiza o muestra fallo de red, presiona 'Usar mi ubicación' o actualiza el navegador con F5. Si persiste corte de telecomunicaciones en la cordillera, el sistema mantendrá la última temperatura confirmada en memoria caché."),

    # Cap 02: 02_landing_cotizador.png
    ("02", "Cotizador Referencial Spot en Soles", "Módulo 0", "Consulta Libre · Web",
     "Calculadora referencial abierta que permite estimar el importe exacto en soles que el minero recibirá en ventanilla en función de los gramos de mineral y su procedencia.",
     ["Ingresa el peso estimado en gramos en la casilla <strong>Gramos de mineral</strong>.",
      "Selecciona el origen geológico del lote: <strong>Oro rojo</strong> (veta/socavón) u <strong>Oro verde</strong> (aluvial/río).",
      "Examina el panel de resultado donde se proyecta el importe total en moneda nacional (S/).",
      "Verifica la cotización unitaria garantizada por gramo para comprobar la paridad de mercado.",
      "Si la cotización es conforme, acércate a la agencia oficial más cercana para el pesaje en balanza."],
     "02_landing_cotizador.png", "Calculadora interactiva en soles para cotizar el valor del oro antes de vender.",
     [("Gramos de mineral", "Campo de entrada numérica para el peso del lote.", "Admite enteros y decimales con punto (ejemplo: 15.50)."),
      ("Selector Oro rojo / verde", "Tipificación del yacimiento aurífero.", "Oro rojo proviene de veta subterránea; oro verde de lavado aluvial."),
      ("Monto estimado en soles", "Importe proyectado a desembolsar en caja.", "Calculado en paridad con la cotización internacional spot de Londres."),
      ("Precio por gramo garantizado", "Tarifa oficial por gramo fino fijada por gerencia.", "Garantiza un precio transparente sin deducciones imprevistas."),
      ("Aviso de pesaje en balanza", "Condición técnica de liquidación definitiva.", "El importe final se ratifica tras el refogado y eliminación de humedad.")],
     "Diferencial según origen geológico",
     "El mineral extraído de veta subterránea ('Oro rojo') registra generalmente mayor ley que el oro aluvial ('Oro verde'), pero exige refogado para evaporar residuos de mercurio. El precio por gramo se actualiza diariamente según la bolsa LBMA.",
     "Variación entre cotización y ventanilla",
     "El cotizador público asume una merma técnica estándar del 3%. En ventanilla, el mineral se somete a secado térmico con soplete y pesaje neto analítico, lo que ajusta el pago al peso neto exacto libre de impurezas."),

    # Cap 03: 03_landing_centros.png
    ("03", "Directorio de Centros de Acopio", "Módulo 0", "Directorio Oficial · Web",
     "Directorio oficial de ventanillas autorizadas de Quilate Bullion en la región Puno, detallando direcciones, horarios de atención, teléfonos de guardia y estado operativo.",
     ["Revisa la lista de agencias autorizadas: La Rinconada, Ananea y Sede Central Juliaca.",
      "Verifica que la sede de destino cuente con la etiqueta de estado <strong>Abierto hoy</strong>.",
      "Toma nota del horario de atención y del número de contacto del jefe de agencia.",
      "Comprueba la dirección física para planificar la ruta de entrega del mineral.",
      "En entregas mayores a 500 gramos, realiza una llamada previa para coordinar el arqueo de bóveda."],
     "03_landing_centros.png", "Directorio oficial de agencias y ventanillas de compra autorizadas.",
     [("Sede La Rinconada", "Ventanilla principal en el nevado Ananea (5,100 msnm).", "Atiende compras directas en efectivo y adelantos de campo."),
      ("Sede Ananea", "Agencia en el valle minero para productores locales.", "Ventanilla de pesaje y recepción de muestras."),
      ("Sede Central Juliaca", "Oficina central y planta de refinación mayorista.", "Aquí se liquidan valijas grandes y transferencias bancarias."),
      ("Etiqueta Abierto hoy", "Estado operativo en tiempo real de la sucursal.", "Verde: personal en ventanilla / Gris: fuera de turno."),
      ("Teléfono de contacto", "Contacto directo con el custodio de agencia.", "Permite coordinar entregas extraordinarias fuera de horario comercial.")],
     "Entregas de alto volumen",
     "Para entregas de mineral superiores a 500 gramos, el productor debe comunicarse con la agencia de destino con dos horas de anticipación. Esto asegura la disponibilidad de liquidez en bóveda y activa el protocolo de vigilancia blindada.",
     "Cierre preventivo de ventanilla",
     "Si una sucursal figura en estado 'Cerrado temporalmente' por paro de transporte o tormenta eléctrica severa en el nevado, la atención se traslada a la ventanilla de guardia interna previa comunicación telefónica confirmada."),

    # Cap 04: 04_landing_pasos.png
    ("04", "Flujo del Proceso 'Cómo Funciona'", "Módulo 0", "Normativa Comercial · Web",
     "Guía didáctica del proceso formal de comercialización de oro, explicando las fases de cotización previa, doble pesaje con campana cerrada y liquidación con comprobante QR.",
     ["Analiza el Paso 1: Verificación de la cotización spot internacional del día en la web.",
      "Analiza el Paso 2: Presentación del mineral en ventanilla para pesaje bruto y secado térmico.",
      "Analiza el Paso 3: Determinación del peso neto, liquidación en caja y emisión del ticket con QR.",
      "Asegúrate de exigir la campana de vidrio cerrada durante el pesaje en la balanza analítica.",
      "Conserva tu comprobante impreso para amparar el origen de los fondos ante retenes policiales."],
     "04_landing_pasos.png", "Los 3 pasos del proceso de atención y venta explicados para el minero.",
     [("Paso 1 · Consulta previa", "Conocimiento transparente del precio por gramo.", "Previene el pago subvaluado ejercido por intermediarios informales."),
      ("Paso 2 · Doble pesaje", "Pesaje de mineral crudo (P1) y refogado libre de mercurio (P2).", "El productor observa el registro digital de la balanza en todo momento."),
      ("Paso 3 · Liquidación y ticket", "Desembolso del efectivo y entrega de comprobante tributario.", "Documento formal válido para justificación patrimonial ante SUNAT."),
      ("Balanza con campana", "Aislamiento contra corrientes de aire de altura.", "Evita variaciones de peso por vientos cordilleranos."),
      ("Comprobante con código QR", "Firma electrónica y hash SHA-256 de la operación.", "Permite verificar la autenticidad del pago desde cualquier smartphone.")],
     "Metrología en ventanilla",
     "El pesaje debe efectuarse obligatoriamente a la vista del productor y con la compuerta de vidrio de la balanza cerrada para impedir que las corrientes de aire de altura generen variaciones artificiales en las centésimas de gramo.",
     "Falta de documento de identidad",
     "La ventanilla tiene prohibido realizar compras a personas indocumentadas conforme a las directivas de la UIF y SUNAT. En caso de no portar el DNI físico, se admite el Certificado C4 de RENIEC con fotografía o el carnet del REINFO vigente."),

    # Cap 05: 05_auth_login.png
    ("05", "Acceso y Autenticación de Usuarios", "Módulo 0", "Autenticación Segura · SSO",
     "Formulario seguro de inicio de sesión para productores y personal de la empresa mediante documento nacional de identidad y contraseña encriptada.",
     ["En el campo <strong>Documento de identidad</strong>, digita tu número de DNI (8 dígitos numéricos).",
      "En el campo <strong>Clave</strong>, escribe tu contraseña confidencial de acceso.",
      "Si requieres validar los caracteres ingresados, haz clic en el enlace <strong>Mostrar</strong>.",
      "Presiona el botón negro <strong>Iniciar sesión</strong> para ingresar a tu espacio de trabajo.",
      "Si eres un minero nuevo sin cuenta, haz clic en el enlace <strong>Crear cuenta de minero</strong>."],
     "05_auth_login.png", "Pantalla de acceso al sistema con documento de identidad y clave secreta.",
     [("Documento de identidad", "Identificador único de usuario en la base de datos.", "Debe contener exactamente 8 números sin letras ni símbolos."),
      ("Clave", "Contraseña protegida mediante máscara de asteriscos.", "Cadena secreta con longitud mínima de 8 caracteres alfanuméricos."),
      ("Opción Mostrar", "Alternador de visibilidad del campo de clave.", "Permite confirmar los caracteres digitados antes de enviar."),
      ("Iniciar sesión", "Disparador de validación de credenciales.", "Verifica la sesión y abre el módulo correspondiente al rol asignado."),
      ("Crear cuenta de minero", "Derivador al flujo de afiliación de productores.", "Permite el registro inmediato de nuevos mineros en el padrón.")],
     "Seguridad en cabinas públicas",
     "Bajo ninguna circunstancia se debe divulgar la contraseña ni dejarla memorizada en navegadores de cabinas públicas en La Rinconada. Al concluir la jornada, el usuario debe cerrar su sesión de manera explícita para evitar suplantaciones.",
     "Bloqueo por clave errónea",
     "Si el sistema rechaza el ingreso con el mensaje 'Credenciales incorrectas', pulsa 'Mostrar' para verificar mayúsculas. Si la clave fue olvidada, el titular debe presentarse con su DNI físico en ventanilla para que el administrador restablezca su acceso."),

    # Cap 06: 06_auth_registro.png
    ("06", "Registro de Nuevos Mineros con DNI", "Módulo 0", "Validación RENIEC · Web",
     "Formulario de empadronamiento digital para mineros artesanales, permitiendo el alta en la base de datos de Quilate Bullion y la vinculación a su centro de acopio habitual.",
     ["Digita el número de DNI en <strong>Documento de identidad</strong> para iniciar la consulta.",
      "Completa tus <strong>Nombres y apellidos</strong> conforme figuran en tu documento físico.",
      "Registra tu número de <strong>Teléfono</strong> celular para la notificación de pagos y remesas.",
      "Indica tu <strong>Zona de procedencia</strong> o sector minero (ejemplo: Lunar de Oro o Riticucho).",
      "Establece una <strong>Clave</strong> de seguridad y selecciona tu <strong>Centro de acopio preferido</strong>.",
      "Presiona <strong>Crear mi cuenta</strong> para confirmar la inscripción en el padrón."],
     "06_auth_registro.png", "Formulario de inscripción para mineros artesanales con datos de contacto.",
     [("Documento de identidad", "DNI del titular para validación tributaria y de identidad.", "8 dígitos válidos contrastados contra el registro de RENIEC."),
      ("Nombres y apellidos", "Nombre completo del titular de la cuenta corriente.", "Titular formal al que se extenderán las liquidaciones bancarias."),
      ("Teléfono móvil", "Línea celular para mensajes de liquidación y transferencias.", "De preferencia con cobertura activa en la cordillera de Ananea."),
      ("Zona de procedencia", "Labor o concesión minera de origen del mineral.", "Permite la trazabilidad geológica del lote según directiva MINEM."),
      ("Centro preferido", "Ventanilla donde el productor suele entregar mineral.", "Asigna la cuenta a la memoria local de la agencia de acopio.")],
     "Trazabilidad de procedencia",
     "Todo productor registrado debe declarar su zona de extracción real. La información de procedencia es remitida a la Dirección Regional de Energía y Minas (DREM Puno) para garantizar que el mineral no proceda de zonas protegidas o ilegales.",
     "Documento duplicado",
     "Si el sistema emite el aviso 'El documento ya se encuentra registrado', significa que el titular ya posee una ficha activa. No debe crearse un registro duplicado; use 'Iniciar sesión' o solicite al operador la actualización de su teléfono."),

    # Cap 07: 07_minero_perfil.png
    ("07", "Portal Móvil del Minero Artesanal", "Módulo 0", "Espacio Personal · Móvil",
     "Tablero personal del minero artesanal donde visualiza su información de identidad, actualiza su sede de entrega habitual y cotiza lotes con condiciones preferenciales.",
     ["Verifica el saludo institucional: 'Hola, Faijo.' que valida la sesión activa.",
      "Examina la tarjeta <strong>Tu información</strong> con tu número de DNI y teléfono registrados.",
      "En el panel <strong>Elige tu acopio</strong>, selecciona la sede en la lista y presiona <strong>Guardar mi preferencia</strong>.",
      "En la sección <strong>Consulta cuánto vale tu oro</strong>, escribe los gramos de tu lote para ver el valor del día.",
      "Al finalizar tus consultas, presiona <strong>Cerrar sesión</strong> en la esquina superior derecha."],
     "07_minero_perfil.png", "Panel privado del minero con sus datos personales y cotizador en vivo.",
     [("Tarjeta Tu información", "Resumen de datos patronímicos y documento del minero.", "Acredita el estado formal y activo del cliente ante la empresa."),
      ("Selector Elige tu acopio", "Menú desplegable con las agencias autorizadas en Puno.", "Permite elegir Sede La Rinconada, Ananea o Central Juliaca."),
      ("Guardar preferencia", "Actualizador del centro de atención habitual.", "Descarga la ficha del cliente en el servidor de la sede seleccionada."),
      ("Cotizador personalizado", "Calculadora ajustada al perfil del productor.", "Aplica tarifas de fidelización si el cliente es proveedor recurrente."),
      ("Cerrar sesión", "Enlace de finalización segura de sesión web.", "Cierra la sesión y destruye el token de autenticación en el terminal.")],
     "Actualización de teléfono",
     "El productor debe mantener actualizado su número telefónico y sede de preferencia. Cuando una valija llega a la planta de Juliaca, el sistema envía notificaciones de liquidación al teléfono registrado para coordinar los abonos bancarios.",
     "Observación de REINFO",
     "Si la tarjeta de información muestra el estado 'Observado ante MINEM', el titular debe regularizar su constancia de REINFO. La empresa mantiene habilitada la recepción pero retiene la liquidación final hasta levantar la observación."),

    # Cap 08: 08_acopio_resumen.png
    ("08", "Tablero de Control en La Rinconada", "Módulo 1", "Ventanilla de Campo · Terminal",
     "Tablero de mando de la agencia La Rinconada que reporta en tiempo real la disponibilidad de efectivo en caja (S/ 59,623.80), los gramos de oro en custodia y el gráfico diario de acopio.",
     ["Monitorea la tarjeta <strong>Dinero en caja</strong> para verificar el efectivo disponible para pagos.",
      "Inspecciona la tarjeta <strong>Oro por enviar</strong> con los 194.0 g de mineral custodiados en bóveda.",
      "Evalúa el gráfico de barras <strong>Oro comprado por día</strong> para revisar el rendimiento de acopio.",
      "Aplica los filtros temporales <strong>7 días</strong>, <strong>30 días</strong> o <strong>90 días</strong> para auditar periodos específicos.",
      "Examina la barra de composición para verificar la relación entre oro rojo (143 g) y oro verde (51 g)."],
     "08_acopio_resumen.png", "Tablero de control de ventanilla con saldo en soles, gramos en custodia y gráfico diario.",
     [("Dinero en caja", "Efectivo físico auditado en la ventanilla de pago.", "S/ 59,623.80. Si desciende de S/ 15,000, solicitar reposición de fondos."),
      ("Oro por enviar", "Volumen consolidado listo para embalaje en valija.", "194.0 gramos valorizados en S/ 68,745.00 a precio de mercado."),
      ("Oro comprado por día", "Histograma cronológico de compras realizadas.", "Permite identificar picos de acopio (ejemplo: 57.0 g el 11/11)."),
      ("Filtros 7 / 30 / 90 días", "Selectores de rango para análisis de compras.", "Actualizan los totales de peso e inversión del periodo seleccionado."),
      ("Barra de composición", "Desglose por tipología geológica de mineral.", "Informa existencias de oro de veta (rojo) y aluvial (verde).")],
     "Alerta de liquidez en ventanilla",
     "Cuando el saldo de la gaveta descienda de S/ 15,000.00, el cajero debe emitir una orden de reposición de remesa hacia la Tesorería de Juliaca. Esto garantiza la continuidad operativa y evita desatención en horas de alta concurrencia.",
     "Desincronización de gráfico diario",
     "Si las barras del gráfico no reflejan las compras recientes, alterna entre los filtros '30 días' y '7 días' para refrescar el componente. Si persiste, verifica que el servicio local de PostgreSQL/Oracle no presente bloqueo por corte eléctrico."),

    # Cap 09: 09_acopio_operaciones_registro.png
    ("09", "Ventanilla de Compra: Preparar Entrega", "Módulo 1", "Operación de Campo · Balanza",
     "Panel operativo donde el acopiador revisa las compras individuales efectuadas, selecciona los lotes que integrarán la valija de seguridad y despacha la remesa blindada.",
     ["Examina la pestaña activa <strong>Preparar entrega</strong> y revisa el listado 'Compras disponibles · 12'.",
      "Verifica en cada fila el código de compra, nombre del minero, peso fundido y monto pagado.",
      "Marca la casilla <strong>ENVIAR</strong> en los lotes que serán empacados en la valija blindada.",
      "Si ingresa un nuevo productor a la agencia, presiona el botón amarillo <strong>Agregar compra</strong>.",
      "Comprueba la suma acumulada de gramos netos antes de emitir la orden de precintado."],
     "09_acopio_operaciones_registro.png", "Lista de compras disponibles listas para seleccionar y enviar al mayorista.",
     [("Pestaña Preparar entrega", "Módulo de consolidación y empaque de valijas.", "Permite segregar compras del día para su transporte a planta."),
      ("Compras disponibles", "Registro cronológico de transacciones en ventanilla.", "Muestra código correlativo, productor, gramos netos e importe."),
      ("Casilla ENVIAR", "Selector individual para inclusión en la saca blindada.", "Al activarlo, transfiere el peso del lote a la remesa en preparación."),
      ("Agregar compra", "Disparador del formulario de pesaje y liquidación.", "Abre la interfaz de registro de mineral con balanza analítica."),
      ("Peso fundido", "Gramos netos confirmados tras el refogado térmico.", "Peso legal transferido en custodia a la empresa de caudales.")],
     "Empaque hermético individual",
     "Cada compra individual debe empacarse en una bolsa ziploc con su etiqueta de código de barras y su duplicado de ticket térmico grapado antes de ser introducida a la saca de seguridad. No se admiten muestras sueltas en la valija.",
     "Inclusión accidental en valija",
     "Si se marcó una casilla por error, desmárquela antes de emitir el cierre de lote. Si la remesa ya fue cerrada en el sistema, ingrese a 'Historial', solicite la anulación del despacho y emita una nueva hoja de ruta con el visto bueno del supervisor."),

    # Cap 10: 10_acopio_operaciones_recepcion.png
    ("10", "Recepción de Solicitudes de Mineros", "Módulo 1", "Recepción Móvil · Ventanilla",
     "Bandeja de entrada donde se visualizan las intenciones de entrega enviadas por los productores desde su aplicativo móvil, agilizando la atención en el módulo de balanza.",
     ["Haz clic en la pestaña <strong>Recepción de mineros</strong> en el menú de operaciones.",
      "Examina la lista de solicitudes con código de pedido, nombre del minero y fecha.",
      "Verifica los gramos estimados registrados previamente por el minero.",
      "Haz clic sobre la solicitud para transferir los datos patronímicos a la balanza.",
      "Si un cliente en ventanilla acaba de emitir su orden, pulsa <strong>Actualizar datos</strong>."],
     "10_acopio_operaciones_recepcion.png", "Pestaña de recepción con pedidos enviados por los mineros desde la aplicación móvil.",
     [("Recepción de mineros", "Bandeja de pre-registro de entregas móviles.", "Organiza el orden de llegada de los productores en la agencia."),
      ("Fila de solicitud", "Datos patronímicos, mineral y cooperativa minera.", "Carga automática de identidad para evitar errores de tipeo manual."),
      ("Actualizar datos", "Refresco forzado de la bandeja de recepción.", "Sincroniza nuevos pedidos móviles en tiempo real."),
      ("Fecha y hora de registro", "Registro cronológico de la emisión del pedido.", "Determina la prioridad de atención en la ventanilla de pesaje."),
      ("Estado de solicitud", "Condición operativa previa al pesaje analítico.", "Cambia a 'Procesado' al confirmar la compra en balanza.")],
     "Validación fisonómica de identidad",
     "Antes de proceder al pesaje, el operador debe constatar que la persona física presente en ventanilla sea el titular registrado en la solicitud electrónica, cotejando sus rasgos fisonómicos contra el DNI físico original.",
     "Solicitud móvil no visible",
     "Si el minero envió la solicitud pero no figura en la lista, presiona 'Actualizar datos'. Si la anomalía continúa, constata que el minero no haya seleccionado por equivocación la Sede Ananea o Juliaca en su teléfono móvil."),

    # Cap 11: 11_acopio_operaciones_historial.png
    ("11", "Historial de Compras y Control de Tickets", "Módulo 1", "Auditoría de Compras · Archivo",
     "Archivo digital exhaustivo de todas las operaciones de compra ejecutadas en la agencia, detallando número correlativo de ticket, fecha, hora, gramos e importes cancelados.",
     ["Selecciona la pestaña <strong>Historial de compras</strong> en la barra de operaciones.",
      "Revisa la tabla ordenada cronológicamente con cada transacción procesada.",
      "Si se presenta un reclamo de cliente, ubica el número de comprobante en la lista.",
      "Comprueba los gramos netos pesados y el importe desembolsado en caja.",
      "Utiliza los filtros de fecha para auditar jornadas comerciales anteriores."],
     "11_acopio_operaciones_historial.png", "Historial de compras realizadas en la agencia con número de comprobante.",
     [("Pestaña Historial", "Repositorio de auditoría de compras pasadas.", "Permite la fiscalización de cualquier operación del periodo."),
      ("Comprobante fiscal", "Número correlativo fiscal impreso en el ticket térmico.", "Acredita la unicidad de cada acto de compraventa."),
      ("Importe pagado", "Monto cancelado al minero en billetes en mano.", "Debe coincidir con las salidas registradas en el libro de caja chica."),
      ("Gramos netos", "Peso final libre de humedad e impurezas.", "Base técnica sobre la cual se calculó la liquidación."),
      ("Estado del lote", "Indicador de custodia ('Pagado' o 'En Valija').", "Informa la ubicación física del mineral en el circuito de transporte.")],
     "Arqueo físico de cierre",
     "Al término de la jornada a las 18:00 horas, el cajero debe emitir el reporte del historial y cotejar la sumatoria de importes contra el arqueo físico de billetes y monedas de la gaveta de seguridad. No se admiten descuadres.",
     "Reimpresión de ticket ilegible",
     "Si un ticket térmico sale borroso por agotamiento de cinta o papel, ubica la fila correspondiente en el historial, abre el comprobante y emite una segunda copia consignando manualmente el sello de 'DUPLICADO DE CONTROL'."),

    # Cap 12: 12_acopio_operaciones_reporte.png
    ("12", "Reporte de Entregas y Despacho de Valija", "Módulo 1", "Despacho Blindado · Custodia",
     "Informe consolidado de cierre de despacho que certifica la masa neta total de oro rojo y verde enviada en la saca blindada, código de precinto y custodia del transporte de valores.",
     ["Haz clic en la pestaña <strong>Reporte de entregas</strong> para consolidar la remesa del día.",
      "Verifica los totales de masa: gramos netos de oro rojo y de oro verde embalados.",
      "Comprueba el número total de compras individuales amparadas en la entrega.",
      "Imprime la Hoja de Custodia y Despacho en tres ejemplares oficiales.",
      "Registra la firma del comandante de la escolta de caudales antes de la salida."],
     "12_acopio_operaciones_reporte.png", "Reporte consolidado de entrega de mineral para despacho hacia la sede Juliaca.",
     [("Reporte de entregas", "Consolidado técnico de despacho de remesas.", "Documento legal de transferencia de custodia hacia Juliaca."),
      ("Total oro rojo", "Masa neta de mineral de veta amparada en la saca.", "Se empaca en bolsas rotuladas con franja roja de seguridad."),
      ("Total oro verde", "Masa neta de mineral aluvial empacada en la valija.", "Se empaca por separado para su análisis de ley en planta."),
      ("Código de valija", "Identificador alfanumérico para seguimiento satelital.", "Ejemplo: VAL-RIN-2026-089 rastreable por GPS en carretera."),
      ("Firmas de custodia", "Espacio formal para rúbricas de entrega y recepción.", "Formaliza la responsabilidad civil y penal de la custodia.")],
     "Protocolo de custodia triplicada",
     "El reporte de despacho debe firmarse en triplicado: el original viaja en el bolsillo transparente exterior de la valija, la primera copia se entrega al custodio de la empresa de valores y la segunda queda en archivo pasivo de la agencia.",
     "Discrepancia en sumatoria de masa",
     "Si la suma de lotes individuales difiere del consolidado, revise los registros de merma en el historial. El sistema bloquea la emisión de la hoja de despacho hasta que el operador ratifique los pesos en el módulo de balanza."),

    # Cap 13: comprobante-sitra-oro-2.png
    ("13", "Comprobante Térmico con Código QR", "Módulo 1", "Emisión Local · Impresora 80mm",
     "Comprobante fiscal físico emitido en papel térmico de 80 mm al confirmar la compraventa, incorporando datos tributarios, pesos analíticos y código QR con hash SHA-256.",
     ["Al presionar <strong>Confirmar Compra</strong>, la impresora térmica genera el ticket de 80 mm.",
      "Verifica el encabezado con el RUC de Quilate Bullion y el correlativo fiscal.",
      "Constata los datos patronímicos del minero y su número de DNI.",
      "Revisa la discriminación de pesos: Peso Bruto (P1), Peso Neto (P2) y monto pagado.",
      "Entrega el original al cliente y archiva la copia firmada en la carpeta del día."],
     "comprobante-sitra-oro-2.png", "Ticket de compra oficial impreso en papel térmico con código QR tributario.",
     [("Encabezado comercial", "Razón social, RUC y domicilio fiscal de Quilate Bullion.", "Acredita la formalidad tributaria de la operación ante SUNAT."),
      ("Detalle de pesos P1 / P2", "Peso bruto antes de secado y peso neto refogado.", "Demuestra técnicamente la merma deducida por impurezas."),
      ("Código QR tributario", "Código bidimensional con enlace y hash criptográfico.", "Permite verificar la autenticidad del documento desde cualquier smartphone."),
      ("Importe en soles", "Monto total desembolsado en efectivo.", "Expresado en cifras y texto para evitar adulteraciones."),
      ("Rúbrica de conformidad", "Línea para firma manuscrita del productor.", "Valida la recepción conforme del dinero en efectivo.")],
     "Preservación de papel térmico",
     "El comprobante térmico es sensible al calor y a la radiación solar directa. Se recomienda al productor guardarlo en funda plástica protegida para evitar la degradación del texto en retenes de control de la Policía Nacional del Perú.",
     "Falla de lectura del QR",
     "Si la cámara no decodifica el código QR, alise el ticket sobre una superficie plana con luz homogénea. El QR contiene la URL oficial que valida el hash de la transacción directamente contra el servidor central de SITRA-ORO."),

    # Cap 14: 14_acopio_caja_movimientos.png
    ("14", "Caja Chica y Movimientos en Efectivo", "Módulo 1", "Tesorería Local · Arqueo",
     "Módulo de tesorería local para el control riguroso de ingresos y egresos de efectivo: reposiciones de fondos de Juliaca, pagos de mineral y adelantos concedidos.",
     ["Examina el saldo disponible en soles en el encabezado de la pantalla.",
      "Cada compra efectuada genera un débito automático en el libro de caja.",
      "Al cierre de turno, realiza el recuento físico de billetes y coteja con la cifra de pantalla.",
      "Revisa el detalle de movimientos para constatar hora, concepto y responsable.",
      "Pulsa <strong>Actualizar datos</strong> tras recibir remesas de reposición de fondos."],
     "14_acopio_caja_movimientos.png", "Control de ingresos y egresos de efectivo en la caja chica de La Rinconada.",
     [("Saldo disponible PEN", "Efectivo auditado existente en la gaveta blindada.", "Debe coincidir billete por billete con el arqueo físico diario."),
      ("Tabla de movimientos", "Libro de caja con registro de entradas y salidas.", "Consigna fecha, hora, tipo de comprobante, concepto y monto."),
      ("Actualizar datos", "Recarga inmediata del saldo de tesorería.", "Refleja transferencias y pagos sin demora."),
      ("Tipo de movimiento", "Clasificación de la operación (Ingreso o Egreso).", "Permite la conciliación rápida del flujo de caja."),
      ("Responsable de caja", "Identificador del cajero que operó la transacción.", "Establece la responsabilidad personal sobre el fondo monetario.")],
     "Sustento de egresos operativos",
     "Todo egreso de caja chica no vinculado a compra de mineral (combustible para generador, útiles) debe contar con comprobante de pago autorizado por la administración. No se admiten vales provisionales sin firma de autorización.",
     "Descuadre en recuento de gaveta",
     "Si el efectivo físico no concuerda con el saldo del sistema, revise si existen adelantos no registrados o compras en efectivo que no se confirmaron. Realice una conciliación cruzada con el historial de compras de la jornada."),

    # Cap 15: 15_acopio_caja_adelantos.png
    ("15", "Registro de Adelantos a Mineros", "Módulo 1", "Gestión Crediticia · Anticipos",
     "Formulario para la concesión de anticipos financieros a productores mineros formalizados, registrando el préstamo para su deducción automática en la siguiente entrega de mineral.",
     ["En la sección 'Adelantos a mineros', selecciona al titular en la lista desplegable.",
      "En el campo <strong>Monto</strong>, escribe la cantidad en soles a entregar en efectivo.",
      "En el campo <strong>Detalle o motivo</strong>, consigna el destino operativo del préstamo.",
      "Presiona <strong>Registrar adelanto</strong> para descontar el fondo de caja y gravar la cuenta del minero.",
      "Emite el vale de anticipo para la firma de conformidad del productor."],
     "15_acopio_caja_adelantos.png", "Formulario para otorgar préstamos o adelantos en efectivo a mineros.",
     [("Selector de minero", "Directorio de productores empadronados habilitados.", "Filtra únicamente clientes activos con historial crediticio favorable."),
      ("Monto en soles", "Importe en soles entregado al minero en ventanilla.", "Se debita inmediatamente del saldo de caja de la agencia."),
      ("Detalle del motivo", "Justificación del financiamiento operativo.", "Consigna adquisición de explosivos, combustible o mantenimiento."),
      ("Registrar adelanto", "Ejecutor del débito y actualización contable.", "Genera la obligación financiera en el perfil del cliente."),
      ("Límite de crédito", "Tope de préstamo determinado por entregas pasadas.", "Impide sobreendeudar al minero por encima de su capacidad de extracción.")],
     "Condición de otorgamiento",
     "Los adelantos solo se conceden a mineros que registren al menos tres entregas de mineral en los últimos 30 días. El monto no debe superar el 40% del promedio de compras mensuales del productor, previa aprobación del jefe de agencia.",
     "Bloqueo por deuda pendiente",
     "El sistema bloquea la entrega de nuevos préstamos a mineros con anticipos pendientes no amortizados. Para habilitar una nueva operación, el cliente debe liquidar su saldo deudor mediante entrega de mineral o depósito en cuenta."),

    # Cap 16: 16_acopio_mineros_lista.png
    ("16", "Padrón Oficial de Mineros y Acciones", "Módulo 1", "Directorio Minero · Padrón",
     "Padrón general de productores auríferos empadronados en la agencia, detallando número de documento, nombres, teléfono, labor minera y herramientas de edición de datos.",
     ["Examina la tabla con los mineros registrados (ejemplo: ELOY RUBEN MAMANI ARAPA).",
      "Para actualizar teléfono o zona de labor, haz clic en el enlace <strong>Editar</strong> de la fila.",
      "Si un registro contiene errores de alta, el supervisor puede presionar <strong>Eliminar</strong>.",
      "Para dar de alta a un nuevo productor, presiona el botón <strong>Registrar minero</strong>.",
      "Emplea el paginador inferior para navegar entre los distintos registros."],
     "16_acopio_mineros_lista.png", "Directorio de mineros artesanales con opciones de edición y búsqueda.",
     [("Documento DNI", "Número de DNI de 8 dígitos del titular minero.", "Clave primaria de búsqueda e identificación en ventanilla."),
      ("Nombre completo", "Nombres y apellidos conforme a registro oficial.", "Se cargan automáticamente en las liquidaciones fiscales."),
      ("Zona minera", "Labor o bocamina de trabajo en el nevado.", "Establece el origen físico del mineral comercializado."),
      ("Enlace Editar", "Enlace de actualización de datos patronímicos.", "Permite corregir números telefónicos o dirección de contacto."),
      ("Registrar minero", "Disparador de la ficha de alta patronímica.", "Abre el formulario de registro con verificación RENIEC.")],
     "Fiscalización de estado REINFO",
     "El departamento de cumplimiento debe contrastar mensualmente el padrón de mineros contra la base de datos pública del MINEM. Los mineros cuyo registro figure en estado 'Cancelado' o 'Suspendido' son inhabilitados para venta.",
     "Preservación de registros históricos",
     "Por disposiciones de trazabilidad financiera (PLAFT), el botón 'Eliminar' no destruye el registro de la base de datos Oracle; desactiva el estado del minero a 'Inactivo' para preservar el historial de compras para auditorías tributarias."),

    # Cap 17: 17_acopio_mineros_nuevo.png
    ("17", "Formulario de Alta y Registro de Minero", "Módulo 1", "Interconexión RENIEC · Registro",
     "Formulario de inscripción de nuevos proveedores auríferos con autocompletado de identidad mediante interoperabilidad con los servicios de RENIEC.",
     ["Ingresa el número de DNI en la casilla <strong>Documento de identidad</strong>.",
      "Observa el mensaje del sistema: los nombres se completan automáticamente desde RENIEC.",
      "Verifica en <strong>Nombres y apellidos</strong> la correspondencia con el documento físico.",
      "Digita en <strong>Teléfono</strong> la línea celular del productor para el envío de alertas.",
      "Presiona <strong>Guardar</strong> para asentar la inscripción en el padrón de la empresa."],
     "17_acopio_mineros_nuevo.png", "Formulario de alta con validación de DNI y autocompletado de identidad.",
     [("Documento de identidad", "Campo obligatorio de entrada de DNI.", "Realiza la consulta automatizada a la base de identidad nacional."),
      ("Nombres y apellidos", "Campo poblado automáticamente por el servicio web.", "Previene errores ortográficos en las declaraciones juradas."),
      ("Teléfono de contacto", "Línea de comunicación para avisos bancarios.", "Canal de contacto ante discrepancias en la refinación en Juliaca."),
      ("Zona de labor", "Sector de extracción en la cordillera.", "Categoriza la procedencia geográfica del mineral."),
      ("Botón Guardar", "Confirmador de almacenamiento en base de datos.", "Habilita la ventanilla para efectuar compras al titular de inmediato.")],
     "Copia de seguridad física",
     "Si la plataforma de RENIEC no responde por indisponibilidad del enlace estatal, el operador debe solicitar copia física del DNI, corroborar visualmente el holograma de votación y fecha de vencimiento, y autorizar el registro manual.",
     "Validación de caracteres especiales",
     "SITRA-ORO admite caracteres estándar del alfabeto español. Si el sistema emite rechazo por tildes o caracteres especiales en apellidos compuestos, ingrese los nombres exactamente como figuran en el padrón electoral."),

    # Cap 18: 18_acopio_mercado_spot.png
    ("18", "Monitor de Mercado Spot Internacional", "Módulo 1 y 2", "Cotización Bursátil · Finanzas",
     "Monitor financiero que presenta la cotización del oro en la bolsa de metales de Londres (LBMA), el tipo de cambio oficial del dólar y el precio de compra sugerido por gramo en soles.",
     ["Evalúa la curva gráfica para analizar la tendencia del oro en las últimas 24 horas.",
      "Verifica la cotización de la onza troy fina expresada en dólares estadounidenses (USD).",
      "Comprueba el precio oficial fijado por gramo en moneda nacional (PEN).",
      "Presiona <strong>Actualizar cotización</strong> para consultar las tarifas bursátiles en tiempo real.",
      "Examina el tipo de cambio aplicado para la conversión de divisas."],
     "18_acopio_mercado_spot.png", "Monitor de cotización internacional del oro LBMA y tipo de cambio en tiempo real.",
     [("Precio onza troy USD", "Cotización bursátil en el mercado de metales de Londres.", "Referencia mundial para la valorización de activos auríferos."),
      ("Tipo de cambio PEN/USD", "Paridad cambiaria bancaria interbancaria.", "Convierte la cotización en dólares a moneda nacional."),
      ("Precio por gramo PEN", "Tarifa técnica de compra sugerida en ventanilla.", "Asegura el margen comercial y de refinación de la empresa."),
      ("Curva de fluctuación", "Representación lineal de variaciones intradía.", "Permite anticipar correcciones bajistas en el mercado internacional."),
      ("Actualizar cotización", "Consulta a los servicios financieros de mercado.", "Garantiza operar con información económica actualizada.")],
     "Ventana de cotización diaria",
     "La cotización internacional fluctúa activamente en horario matutino. Se establece como norma fijar la tarifa de compra a las 09:00 horas y mantenerla hasta las 13:00 horas para dar certidumbre a los mineros en ventanilla.",
     "Cierre preventivo de cotización",
     "Si la API financiera externa no responde, el sistema adopta automáticamente la cotización de cierre del día hábil anterior reportada por la SBS, añadiendo un margen preventivo de cobertura por volatilidad de mercado."),

    # Cap 19: 19_mayorista_resumen.png
    ("19", "Tablero Ejecutivo Mayorista en Juliaca", "Módulo 2", "Control Gerencial · Planta",
     "Centro de control gerencial de la planta central en Juliaca, integrando el flujo de compras de todas las agencias, las remesas en tránsito por carretera y el balance de tesorería.",
     ["Utiliza los botones <strong>7 días</strong>, <strong>30 días</strong> o <strong>90 días</strong> para auditar periodos ejecutivos.",
      "Supervisa el panel <strong>Dinero que entra hoy</strong> para constatar cobranzas de refinerías.",
      "Verifica la cantidad de valijas blindadas en tránsito procedentes de La Rinconada.",
      "Presiona <strong>Actualizar</strong> para recargar los datos emitidos por las agencias de campo.",
      "Navega en el menú lateral para ingresar a fundición, liquidaciones y aduanas."],
     "19_mayorista_resumen.png", "Tablero de mando mayorista con balance de compras, valijas y caja de planta central.",
     [("Filtros de periodo", "Selectores de rango temporal del consolidado ejecutivo.", "Muestran volumen acopiado e inversión en semanas o meses."),
      ("Botón Actualizar", "Recarga síncrona de los indicadores gerenciales.", "Integra los despachos recién cerrados en los centros de acopio."),
      ("Menú lateral", "Acceso directo a los submódulos de planta central.", "Navega a Recepción, Caja, Exportación, Centros y Mercado."),
      ("Valijas en tránsito", "Contador de sacas de seguridad en tránsito terrestre.", "Permite prever la carga de trabajo en el laboratorio de fundición."),
      ("Balance corporativo", "Flujo neto consolidado en soles y dólares.", "Visión integral de la posición de liquidez de Quilate Bullion.")],
     "Programación de hornos",
     "A primera hora, la gerencia de planta debe revisar el consolidado de valijas en ruta para programar los hornos de inducción, crisoles de grafito y turnos de químicos analistas según la masa total esperada.",
     "Demora en transporte de caudales",
     "Si una valija supera las 6 horas de traslado entre La Rinconada y Juliaca, el indicador pasa a estado crítico (ámbar). El jefe de seguridad debe contactar de inmediato a la escolta y verificar la telemetría satelital."),

    # Cap 20: 20_mayorista_recepcion_lotes.png
    ("20", "Recepción y Control de Lotes Recibidos", "Módulo 2", "Control de Bóveda · Planta",
     "Bandeja de recepción técnica en la planta central donde se registran los lotes llegados en valijas blindadas, clasificados por agencia de procedencia y listos para contraste y fundición.",
     ["Revisa las cuatro pestañas: 'Lotes recibidos', 'Preparar exportación', 'Historial por ley' y 'Reporte'.",
      "En la pestaña activa, analiza la tarjeta 'Entregas por acopiador' con los lotes recibidos.",
      "Verifica en la tabla inferior la clasificación del mineral ('ORO ROJO' con masa de 70 g).",
      "Utiliza el buscador <strong>Buscar lote o acopiador</strong> para localizar valijas específicas.",
      "Presiona <strong>Agregar compra Nueva</strong> para registrar una valija blindada recién arribada."],
     "20_mayorista_recepcion_lotes.png", "Pestaña de lotes recibidos mostrando 70 gramos de oro rojo de la sede Rinconada.",
     [("Lotes recibidos", "Control de ingresos físicos a bóveda de planta.", "Identifica los lotes en espera de análisis metrológico."),
      ("Buscador de valijas", "Filtro rápido por código o nombre de acopiador.", "Localiza valijas y precintos en el archivo activo."),
      ("Tabla de lotes", "Discriminación de mineral por tipología y masa.", "Ejemplo: ORO ROJO con 70 g de peso bruto sin fundir."),
      ("Agregar compra Nueva", "Disparador del acta de recepción y apertura de saca.", "Permite contrastar pesos y verificar sellos de seguridad."),
      ("Entregas por acopiador", "Estadística de envíos por cada agencia de campo.", "Permite el cotejo contra las guías de remisión del remitente.")],
     "Inspección de precintos UV",
     "Antes de cortar el precinto de la saca, el perito debe examinar bajo luz ultravioleta que el sello plástico no exhiba huellas de soldadura térmica, cortes clandestinos o alteración en la numeración correlativa grabada.",
     "Lotes con calidades mixtas",
     "Si una valija contiene oro rojo y verde en bolsas separadas, deben registrarse como sub-lotes independientes. Está prohibido unificar mineral de socavón y aluvial antes del análisis de ley espectrométrica."),

    # Cap 21: 21_mayorista_recepcion_form.png
    ("21", "Recepción y Contraste de Peso", "Módulo 2", "Balanza Analítica · Laboratorio",
     "Formulario de laboratorio para registrar el código de precinto de la valija blindada y contrastar el peso del mineral recibido contra el pesaje de origen de La Rinconada.",
     ["Inspecciona el precinto de seguridad antes de abrir la valija y verifica el número de serie.",
      "Coloca el mineral en la balanza de precisión de Juliaca y anota el peso en gramos.",
      "Comprueba que la variación de peso no supere la tolerancia máxima permitida (0.05%).",
      "Presiona el botón <strong>Guardar recepción</strong> para habilitar el lote hacia fundición.",
      "Imprime el acta de recepción firmada por el perito y el custodio de valores."],
     "21_mayorista_recepcion_form.png", "Formulario de verificación de precinto y contraste de peso de valija.",
     [("Número de precinto", "Código alfanumérico grabado en el sello de la saca.", "Verifica que no presente cortes ni soldadura térmica."),
      ("Peso de llegada", "Lectura en gramos obtenida en la planta central.", "Se compara automáticamente contra el peso de despacho."),
      ("Observaciones de empaque", "Anotaciones de auditoría sobre el estado del bulto.", "Consigna roturas de bolsa o precintos flojos."),
      ("Guardar recepción", "Botón que confirma el ingreso formal del lote.", "Genera el acta de recepción oficial en el sistema."),
      ("Enlace de balanza RS-232", "Lectura directa del peso por cable serial.", "Elimina el error de digitación manual de decimales.")],
     "Control metrológico",
     "La balanza analítica se calibra semanalmente con masa patrón de 500 g certificada por INACAL. Todo pesaje se realiza bajo registro continuo de circuito cerrado de televisión (CCTV).",
     "Discrepancia de peso",
     "Si la diferencia de peso supera el 0.05%, el sistema detiene el ingreso y emite un acta de observación metrológica con notificación inmediata a gerencia de operaciones."),

    # Cap 22: 22_mayorista_recepcion_exportacion.png
    ("22", "Preparación de Lotes para Exportación", "Módulo 2", "Horno de Inducción · Fundición",
     "Pestaña operativa para seleccionar y agrupar compras auríferas con ensayo de pureza aprobado, conformando el lote maestro que entrará al crisol de fundición para barras de exportación.",
     ["Accede a la pestaña <strong>2. Preparar exportación</strong> en el módulo de recepción mayorista.",
      "Revisa la lista de lotes individuales que cuentan con análisis espectrométrico aprobado.",
      "Marca las casillas correspondientes a los lotes que integrarán la colada de fundición.",
      "Examina la sumatoria de gramos netos calculada automáticamente por el sistema.",
      "Presiona <strong>Crear lote de exportación</strong> para generar la orden oficial de fundición."],
     "22_mayorista_recepcion_exportacion.png", "Pestaña de agrupación de compras para fundir barras de exportación.",
     [("Pestaña Preparar exportación", "Agrupador de lotes para fundición de barras.", "Consolida compras de varias agencias en un solo lingote exportable."),
      ("Lotes aprobados", "Lotes que superaron el ensayo de pureza en laboratorio.", "Garantiza que solo se fundan lotes con ley fina certificada."),
      ("Casilla de selección", "Selector para inclusión en la colada del crisol.", "Suma de forma automática los pesos brutos y calculados."),
      ("Suma de gramos netos", "Masa proyectada del lingote doré resultante.", "Informa el rendimiento teórico antes de ingresar al horno."),
      ("Crear lote de exportación", "Generador de la orden de trabajo de fundición.", "Asigna un código de barra maestro y transfiere el lote a hornos.")],
     "Homogeneización en crisol",
     "Al agrupar lotes para fundición, se debe procurar juntar compras con purezas similares para facilitar la homogeneización térmica y evitar segregación de metales base (plata y cobre) durante el vaciado en la lingotera.",
     "Revocación de orden de fundición",
     "El sistema permite revocar la orden de fundición antes de iniciar el calentamiento del horno, devolviendo los lotes individuales al inventario disponible sin alterar los registros contables ni las liquidaciones a los productores."),

    # Cap 23: 23_mayorista_recepcion_historial.png
    ("23", "Historial por Ley y Ensayos de Laboratorio", "Módulo 2", "Espectrometría XRF · Laboratorio",
     "Repositorio histórico de análisis de pureza ejecutados mediante espectrometría de fluorescencia de rayos X (XRF), certificando las milésimas de fino de cada lote ingresado.",
     ["Haz clic en la pestaña <strong>Historial por ley</strong> en la sección de control mayorista.",
      "Inspecciona el listado con código de ensayo, acopiador de procedencia y milésimas.",
      "Verifica la pureza en milésimas de oro fino (ejemplo: 910 milésimas = 91.0% de pureza).",
      "Utiliza el buscador para auditar análisis históricos ante eventuales reclamos de clientes.",
      "Descarga el Certificado de Ley Oficial en PDF para anexar al expediente aduanero."],
     "23_mayorista_recepcion_historial.png", "Historial de análisis espectrométricos de pureza del oro por lote.",
     [("Historial por ley", "Archivo de ensayos químicos y espectrométricos.", "Garantiza la trazabilidad analítica de la calidad del mineral."),
      ("Ley en milésimas", "Pureza en partes de oro fino por mil.", "Parámetro fundamental para el cálculo de liquidación financiera."),
      ("Acopiador de procedencia", "Centro o sucursal que acopió el mineral en campo.", "Permite mapear la calidad del oro según la cuenca minera."),
      ("Fecha de ensayo", "Día y hora de la lectura espectrométrica.", "Registro temporal inalterable para auditorías de refinería."),
      ("Certificado en PDF", "Descarga del informe analítico con firma digital.", "Documento exigido por los compradores internacionales.")],
     "Disparo XRF en tres puntos",
     "El ensayo de fluorescencia de rayos X (XRF) debe ejecutarse obligatoriamente en tres sectores distintos de la barra de oro (cabeza, sección media y base), obteniendo un promedio aritmético ponderado que previene distorsiones por sedimentación.",
     "Ensayo dirimente de copelación",
     "Si el acopiador o productor discrepa con la ley reportada por rayos X, se activa el ensayo dirimente por copelación al fuego (ensayo químico estándar ASTM E1335) sobre una muestra testigo de 0.5 g, cuyo dictamen se asume definitivo."),

    # Cap 24: 24_mayorista_recepcion_reporte.png
    ("24", "Reporte Consolidado de Compras Mayorista", "Módulo 2", "Consolidado Contable · Gerencia",
     "Informe contable y tributario que resume el volumen global de mineral acopiado en el mes, la inversión financiera desembolsada en soles y dólares, y la ley promedio obtenida.",
     ["Selecciona la pestaña <strong>Reporte de compras</strong> en el módulo mayorista.",
      "Examina el cuadro consolidado de compras agrupadas por fecha y centro de acopio.",
      "Verifica los totales acumulados de gramos finos y desembolsos monetarios.",
      "Descarga la información en formato Excel o CSV para declaraciones tributarias.",
      "Aplica filtros por sede para comparar el rendimiento de La Rinconada frente a Ananea."],
     "24_mayorista_recepcion_reporte.png", "Reporte contable consolidado de compras auríferas e inversión financiera.",
     [("Reporte de compras", "Consolidado económico de compras de la empresa.", "Base documental para la formulación del PDT 0617 ante SUNAT."),
      ("Total gramos acopiados", "Volumen total acumulado en el periodo comercial.", "Métrica de producción para el balance mensual de operaciones."),
      ("Desembolso en soles/USD", "Flujo de fondos canalizado a través de bancos y caja.", "Permite la conciliación con las cuentas corrientes corporativas."),
      ("Promedio de ley", "Pureza media global del inventario aurífero.", "Indicador de calidad comercial para contratos de venta al exterior."),
      ("Exportar Excel / CSV", "Exportador estructurado de datos contables.", "Permite el cruce de datos con el software ERP contable de la empresa.")],
     "Sustento de retenciones PDT 0617",
     "La información de este reporte sustenta la declaración mensual de retenciones del impuesto a la renta de minería artesanal. Los datos de DNI y liquidaciones deben coincidir con los asientos bancarios de abono.",
     "Diferencias con extractos bancarios",
     "Si el monto consolidado presenta diferencias con los saldos bancarios de fin de mes, revise transferencias interbancarias emitidas en el último día que quedaron pendientes de acreditación bancaria (clearing diferido)."),

    # Cap 25: 25_mayorista_liquidaciones.png
    ("25", "Liquidación al Acopiador y Cotizaciones", "Módulo 2", "Liquidación Spot · Finanzas",
     "Panel financiero para liquidar los saldos a cada centro de acopio, actualizando las cotizaciones internacionales, convirtiendo gramos a onzas troy finas (31.1035 g) y emitiendo las órdenes de abono bancario.",
     ["Examina el panel <strong>Cotizaciones Internacionales y Tipo de Cambio</strong> con el spot y divisa.",
      "Presiona <strong>Recargar cotización</strong> si requieres refrescar los precios internacionales.",
      "Para fijar las condiciones económicas en las liquidaciones, pulsa <strong>Aplicar ambos</strong>.",
      "Revisa la tabla de liquidaciones: comprueba las onzas troy calculadas y el importe final.",
      "Autoriza la orden de abono bancario para la transferencia a la cuenta del acopiador."],
     "25_mayorista_liquidaciones.png", "Módulo de liquidación financiera aplicando cotización internacional spot y onza troy.",
     [("Panel de cotizaciones", "Visor de cotizaciones spot y tipo de cambio comercial.", "Sincronizado con bolsas internacionales y el Banco Central de Reserva."),
      ("Recargar cotización", "Consulta a las APIs financieras del mercado bursátil.", "Evita liquidar lotes con parámetros desfasados."),
      ("Aplicar ambos", "Asignador de precios a las órdenes de liquidación.", "Calcula el importe neto a liquidar en moneda nacional y extranjera."),
      ("Factor onza troy", "Constante de conversión metrológica internacional (31.1035 g).", "Convierte gramos analíticos a onzas troy finas de exportación."),
      ("Importe a transferir", "Monto neto desembolsable tras deducciones de ley.", "Importe acreditado en la cuenta corriente del centro de acopio.")],
     "Deducciones de refinación y renta",
     "La liquidación final debe detallar con absoluta claridad las deducciones aplicadas: porcentaje de ley fina confirmada, costo técnico de refinación y la retención legal de impuesto a la renta de tercera categoría (1.5% o 2.5%).",
     "Liquidación en días no laborables",
     "Si la fecha de liquidación coincide con un feriado bancario o fin de semana y la SBS no publica tarifa nueva, el sistema mantiene la tasa de cierre del Banco Central de Reserva (BCRP) del último día hábil confirmado."),

    # Cap 26: 26_mayorista_caja_central.png
    ("26", "Caja y Adelantos Mayorista", "Módulo 2", "Gestión Multidivisa · Tesorería",
     "Panel de tesorería central multidivisa para la gestión de fondos disponibles en soles (S/ 180,000.00) y dólares (USD 48,200.00), recepción de pagos de refinerías y entrega de adelantos a sucursales.",
     ["Monitorea los saldos corporativos: S/ 180,000.00 en moneda nacional y USD 48,200.00 en divisas.",
      "En el formulario <strong>Pago del exportador</strong>, escribe el importe ingresado en dólares o soles.",
      "Si el pago ampara una venta específica, consigna el código en <strong>Lote de exportación (opcional)</strong>.",
      "Presiona el botón amarillo <strong>Registrar pago</strong> para ingresar el abono a la caja central.",
      "Inspecciona la tabla de movimientos y utiliza <strong>Anular</strong> si se requiere corregir un asiento."],
     "26_mayorista_caja_central.png", "Gestión de caja central en soles y dólares con registro de pagos y movimientos.",
     [("Tarjeta En soles", "Disponibilidad líquida en moneda nacional.", "S/ 180,000.00 destinados a fondeo de ventanillas y pagos locales."),
      ("Tarjeta En dólares", "Disponibilidad líquida en moneda extranjera.", "USD 48,200.00 generados por ventas y exportaciones internacionales."),
      ("Pago del exportador", "Formulario para el registro de transferencias del comprador.", "Permite asentar ingresos en cuentas de dólares o soles."),
      ("Recibido en US$ / S/", "Campos numéricos de registro del importe percibido.", "Admiten cifras exactas con decimales bancarios."),
      ("Registrar pago", "Asentador de ingresos en la tesorería corporativa.", "Actualiza el balance financiero de la empresa al instante."),
      ("Botón Anular", "Revocador de asientos erróneos con trazabilidad.", "Registra la anulación sin eliminar el historial de auditoría.")],
     "Control PLAFT sobre USD 10,000",
     "Todo abono o transferencia mayor a USD 10,000 debe contar con el comprobante de transferencia bancaria Swift o número de operación interbancaria archivado. Los movimientos anulados quedan grabados en la base de datos Oracle con el usuario responsable para auditorías de SUNAT y la UIF.",
     "Error de digitación en monedas",
     "Si al presionar 'Registrar pago' el sistema no reacciona, verifique que los campos de moneda no contengan caracteres alfabéticos o comas en lugar de puntos. Si el abono del exportador fue en dólares pero liquidado en soles por el banco receptor, regístrelo en soles para mantener la exactitud del arqueo."),

    # Cap 27: 27_mayorista_consolidacion.png
    ("27", "Lotes y Consolidación para Exportación", "Módulo 2", "Bóveda Acreditada · Aduanas",
     "Módulo de consolidación y empaque de lingotes bullion y barras doré procedentes de fundición, administrando ponderaciones de ley, números seriales y precintos aduaneros de exportación.",
     ["Revisa la sección 'Lotes para exportación' con los lotes y ponderaciones consolidados.",
      "Emplea los filtros <strong>Todos</strong>, <strong>Por centro</strong> o <strong>Por fecha</strong> para auditar lingotes en bóveda.",
      "Examina en la tabla el código de cada barra, su peso en gramos y la ley final ensayada.",
      "Verifica el estado físico y cuño de cada lingote antes de solicitar el precinto aduanero.",
      "Genera la Declaración Única de Aduanas (DUA) y la orden de custodia aeroportuaria."],
     "27_mayorista_consolidacion.png", "Panel de consolidación de lingotes bullion y barras doré para exportación.",
     [("Lotes consolidados", "Inventario de barras bullion listas para embarque aéreo.", "Agrupa lingotes afinados procedentes de las distintas agencias."),
      ("Filtro Todos", "Selector del inventario general en bóveda de seguridad.", "Facilita auditorías físicas de existencias metálicas."),
      ("Ponderación de ley", "Cálculo matemático de pureza de la colada fundida.", "Determina el valor FOB de la exportación ante aduanas."),
      ("Código serial", "Identificador grabado físicamente en la barra.", "Permite el rastreo del metal en refinerías de destino."),
      ("Masa fina neta", "Contenido real de oro al 99.99% en gramos.", "Métrica oficial para el contrato de liquidación internacional.")],
     "Grabado de cuño metálico indeleble",
     "Cada lingote exportable debe grabarse mediante cuño metálico indeleble con el serial de SITRA-ORO, la marca de Quilate Bullion y el peso en gramos antes de ingresar a la caja blindada de transporte aéreo internacional con destino a Suiza o India.",
     "Trazabilidad documental ante SUNAT",
     "Si la autoridad aduanera solicita sustentar el origen de un lingote, ingrese el código serial en el buscador y presione 'Descargar Hoja de Trazabilidad'. El sistema genera la genealogía completa con los DNI y lotes de los mineros aportantes."),

    # Cap 28: 28_mayorista_centros.png
    ("28", "Centros y Cuentas de Acopiador", "Módulo 2", "Red de Sedes · Corporativo",
     "Administración de la red física de agencias autorizadas de Quilate Bullion, permitiendo la apertura de nuevas sucursales, activación operativa y gestión de cuentas corrientes interbancarias.",
     ["Examina el directorio de agencias: La Rinconada, Ananea y Sandia con sus direcciones.",
      "Verifica que las agencias activas cuenten con la etiqueta de estado <strong>Activo</strong> en verde.",
      "Para incorporar una nueva sede minera a la red, pulsa <strong>Nuevo centro de acopio</strong>.",
      "Revisa las cuentas bancarias asociadas para transferencias de fondos de compra.",
      "Modifica los límites operativos de caja asignados a cada administrador de sede."],
     "28_mayorista_centros.png", "Directorio y administración de centros de acopio autorizados y sus cuentas.",
     [("Tabla de centros", "Inventario de agencias autorizadas de la corporación.", "Detalla razón social de la agencia, zona geográfica y dirección."),
      ("Estado Activo", "Indicador de habilitación legal para compra de oro.", "Verde: autorizada para acopio / Gris: suspendida preventivamente."),
      ("Nuevo centro de acopio", "Disparador de la ficha de alta de nueva sucursal.", "Permite registrar una nueva ventanilla en zonas mineras."),
      ("Cuenta bancaria CCI", "Código de Cuenta Interbancario de 20 dígitos.", "Cuenta bancaria corporativa para desembolso de remesas."),
      ("Responsable de sede", "Jefe de agencia formalmente designado.", "Custodio legal de los fondos y del mineral acopiado.")],
     "Habilitación formal de locales",
     "Antes de autorizar una nueva sucursal en el sistema, la administración debe verificar que el local cuente con licencia municipal de funcionamiento, póliza de seguro contra asalto armada, bóveda ignífuga y registro formal de comercializador ante el MINEM.",
     "Actualización de cuentas de abono",
     "Para actualizar la cuenta bancaria de un centro de acopio, haga clic en 'Editar', digite el nuevo CCI de 20 dígitos y adjunte la constancia bancaria oficial, requiriendo la aprobación digital del apoderado legal de Quilate Bullion."),

    # Cap 29: 19_Miro_S06_Circuit_Breaker.png
    ("29", "Uso sin Internet (Circuit Breaker)", "Módulo 3", "Modo Autónomo · Contingencia",
     "Mecanismo de tolerancia a fallos arquitectural (Circuit Breaker) que permite a las ventanillas de La Rinconada continuar operando pesajes y emitiendo comprobantes ante caídas de enlace por nevadas.",
     ["Si la pantalla exhibe la alerta de 'Sin Conexión a Internet', mantenga la calma y continúe operando.",
      "Ejecuta el pesaje en la balanza normalmente: los datos se resguardan en la base de datos local.",
      "La ticketera térmica imprimirá el comprobante de compra con código QR de contingencia.",
      "Al restablecerse el enlace satelital o celular, el sistema iniciará la sincronización automática.",
      "Verifica que el semáforo de red retorne a color verde confirmando el volcado hacia Juliaca."],
     "19_Miro_S06_Circuit_Breaker.png", "Diagrama del sistema de contingencia Circuit Breaker para seguir trabajando sin internet.",
     [("Modo fuera de línea", "Estado operativo automático ante pérdida de enlace.", "Mantiene activas las interfaces de pesaje y emisión de tickets."),
      ("Memoria local protegida", "Almacenamiento transaccional en disco sólido local.", "Impide la pérdida de compras ante apagones o reinicios del equipo."),
      ("Sincronización automática", "Volcado inteligente de compras hacia la sede central.", "Actualiza balances y stock en Juliaca sin intervención humana."),
      ("Semáforo de red", "Indicador visual en el encabezado de la aplicación.", "Ámbar: Operación en modo local / Verde: Conexión central activa."),
      ("Cola de mensajes cifrados", "Buffer seguro con encriptación y sellado SHA-256.", "Garantiza la inalterabilidad de los pesos registrados offline.")],
     "Autonomía energética de contingencia",
     "Ante un corte de internet por temporal de nieve, no desconecte la computadora ni apague el sistema local. La plataforma almacena de forma segura hasta 500 transacciones offline en la base de datos local respaldada por el sistema ininterrumpido de energía (UPS).",
     "Confirmación de sincronización total",
     "Para verificar que las operaciones offline se hayan transmitido a la sede Juliaca tras el restablecimiento del enlace, constate que el indicador cambie a 'Sincronizado 100% (Verde)'. No apague el equipo hasta que el indicador confirme la sincronización completa."),
]

# ==============================================================================
# PÁGINA 32: FICHA TÉCNICA Y ACTA CON FIRMA OFICIAL
# ==============================================================================
html_acta = f"""
<div class="chapter-page">
  <div class="sec-header">
    <h2 class="sec-title">30. Ficha Técnica y Acta de Conformidad</h2>
    <span class="sec-meta">Control de Cátedra · ACTA-01</span>
  </div>

  <div class="context-desc">
    Resumen de las tecnologías utilizadas en el desarrollo de SITRA-ORO, validación de calidad y declaración jurada de autoría individual para el curso de Análisis y Diseño de Sistemas (ADS).
  </div>

  <table class="data-table" style="font-size:7.4pt; margin-top:2px; margin-bottom:4px;">
    <thead>
      <tr>
        <th style="width:25%;">Capa del software</th>
        <th style="width:35%;">Tecnología / Framework</th>
        <th style="width:40%;">Métrica de calidad y rendimiento</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="col-item">Frontend Web</td>
        <td>Angular 18 · TypeScript · Componentes Modulares</td>
        <td>Carga menor a 1.2s, 100% responsivo para celulares y PCs.</td>
      </tr>
      <tr>
        <td class="col-item">Backend Core</td>
        <td>Spring Boot 3 · Java 21 · Clean Architecture</td>
        <td>Arquitectura limpia, servicios desacoplados y transacciones seguras.</td>
      </tr>
      <tr>
        <td class="col-item">Base de Datos</td>
        <td>Oracle Database Enterprise Edition</td>
        <td>Auditoría estricta de cambios, bloqueos seguros y disparadores.</td>
      </tr>
      <tr>
        <td class="col-item">Seguridad y Sesión</td>
        <td>Spring Security · OAuth2 / JWT</td>
        <td>Sesiones encriptadas con expiración a 8h en ventanillas de campo.</td>
      </tr>
      <tr>
        <td class="col-item">Evidencia Visual</td>
        <td>Playwright 1.65 · Headless Chromium</td>
        <td>27 capturas reales tomadas del sistema Angular funcionando en vivo.</td>
      </tr>
    </tbody>
  </table>

  <div class="notes-grid">
    <div class="note-card">
      <span class="note-tag">Entregable final de ADS</span>
      El presente manual constituye el entregable final de la asignatura de Análisis y Diseño de Sistemas (ADS), acreditando el cumplimiento total de los requisitos de diseño y desarrollo de software para el acopio minero en la región Puno.
    </div>
    <div class="note-card">
      <span class="note-tag">Declaración jurada de autoría</span>
      El suscrito certifica que el sistema <strong>SITRA-ORO</strong> ha sido diseñado, desarrollado y probado íntegramente de manera individual, demostrando la operatividad real de sus módulos mediante las capturas de pantalla auténticas presentadas en este manual.
    </div>
  </div>

  <!-- BLOQUE DE FIRMA OFICIAL -->
  <div style="margin-top:14px; display:flex; justify-content:space-around; align-items:flex-end;">
    <!-- Firma Estudiante -->
    <div style="text-align:center; width:220px;">
      <div style="height:55px; display:flex; align-items:center; justify-content:center; margin-bottom:2px;">
        <img src="{url_firma}" alt="Firma Helio Paul" style="height:48px; width:auto; display:block;">
      </div>
      <div style="border-top:1.5px solid #0f2744; padding-top:3px;">
        <div style="font-size:8.5pt; font-weight:800; color:#0f2744;">FAIJO CALISAYA HELIO PAUL</div>
        <div style="font-size:7pt; color:#475569; font-weight:600;">Estudiante · Autor Único y Desarrollador</div>
        <div style="font-size:6.5pt; color:#64748b;">Escuela Profesional de Ingeniería de Sistemas</div>
        <div style="font-size:6.5pt; color:#0369a1; font-weight:700; margin-top:1px;">Sustentación Individual · Ciclo IV</div>
      </div>
    </div>

    <!-- Firma Docente -->
    <div style="text-align:center; width:220px;">
      <div style="height:55px; display:flex; align-items:center; justify-content:center; margin-bottom:2px;">
        <div style="color:#94a3b8; font-size:7pt; font-style:italic;">(Sello y Firma de Conformidad)</div>
      </div>
      <div style="border-top:1.5px solid #0f2744; padding-top:3px;">
        <div style="font-size:8.5pt; font-weight:800; color:#0f2744;">MG. NÉLIDA HUAMÁN PACO</div>
        <div style="font-size:7pt; color:#475569; font-weight:600;">Docente Evaluadora de Cátedra</div>
        <div style="font-size:6.5pt; color:#64748b;">Análisis y Diseño de Sistemas (ADS)</div>
        <div style="font-size:6.5pt; color:#0f2744; font-weight:700; margin-top:1px;">Universidad Peruana Unión</div>
      </div>
    </div>
  </div>
</div>
"""

# ==============================================================================
# ENSAMBLAJE DE CONTENIDO
# ==============================================================================
print("Ensamblando HTML editorial humano con separación nítida de columnas...")
html_capitulos_body = html_indice
for cap in chapters:
    cap_num, title, mod_tag, meta_info, ctx, steps, fig, cap_text, rows, tip_title, tip_text, faq_title, faq_text = cap
    html_capitulos_body += make_chapter_html(
        cap_num, title, mod_tag, meta_info, ctx, steps, fig, cap_text, rows, tip_title, tip_text, faq_title, faq_text
    )

html_capitulos_body += html_acta

html_contenido = f"""<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Contenido - Manual de Usuario SITRA-ORO</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>{css_contenido}</style>
</head>
<body>
  {html_capitulos_body}
</body>
</html>
"""

temp_portada_html = os.path.join(workspace_dir, "manual_portada_humana_32p.html")
temp_contenido_html = os.path.join(workspace_dir, "manual_contenido_humana_32p.html")

with open(temp_portada_html, "w", encoding="utf-8") as f:
    f.write(html_portada)

with open(temp_contenido_html, "w", encoding="utf-8") as f:
    f.write(html_contenido)

print("HTMLs escritos. Compilando PDF con Playwright...")

temp_portada_pdf = os.path.join(workspace_dir, "temp_portada_humana_32p.pdf")
temp_contenido_pdf = os.path.join(workspace_dir, "temp_contenido_humana_32p.pdf")

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()

    # Portada
    page.goto(asset_url(temp_portada_html), wait_until="networkidle")
    page.pdf(
        path=temp_portada_pdf,
        format="A4",
        print_background=True,
        margin={"top": "0", "bottom": "0", "left": "0", "right": "0"}
    )
    print("  -> Portada renderizada OK.")

    # Contenido (Páginas 2 a 32)
    page.goto(asset_url(temp_contenido_html), wait_until="networkidle")
    page.pdf(
        path=temp_contenido_pdf,
        format="A4",
        print_background=True,
        prefer_css_page_size=True
    )
    print("  -> Contenido renderizado OK.")

    browser.close()

# Unir con PyPDF
print("Uniendo Portada + Contenido con pypdf...")
writer = pypdf.PdfWriter()

reader_p = pypdf.PdfReader(temp_portada_pdf)
for page in reader_p.pages:
    writer.add_page(page)

reader_c = pypdf.PdfReader(temp_contenido_pdf)
for page in reader_c.pages:
    writer.add_page(page)

with open(pdf_final, "wb") as f_out:
    writer.write(f_out)

print(f"\n¡MANUAL HUMANO EDITORIAL CON SEPARADORES DE COLUMNA GENERADO!")
print(f"Ruta: {pdf_final}")
print(f"Tamaño: {os.path.getsize(pdf_final)} bytes")
print(f"Total páginas: {len(writer.pages)}")
