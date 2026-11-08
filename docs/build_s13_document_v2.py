# -*- coding: utf-8 -*-
"""
Script generador del informe oficial S13 LP2 (Nota 20/20) para Helio Paul Faijo Calisaya.
Estructura según el sílabo oficial S13 (secciones 3.1 a 3.11 y 4.1 a 4.6).
"""
import os
import sys
from pathlib import Path
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

ROOT = Path(r"E:\Cursos_Ciclo_4\Lenguaje de Programación II\Sitra_oro")
DOCS = ROOT / "docs"
OUT = DOCS / "S13_LP2_Equipo05_FaijoCalisayaHelioPaul.docx"
IMG_DIR = DOCS / "img_S13_FaijoCalisaya"

# Paleta institucional
NAVY = "102849"
BODY = "1E2B3C"
GOLD = "C88B00"
GOLD_PALE = "FFF8E9"
BLUE = "2563EB"
MUTED = "64748B"
PALE = "F8FAFC"
RED = "DC2626"
WHITE = "FFFFFF"
BORDER_CLR = "CBD5E1"

doc = Document()

# Configuración de márgenes
sec = doc.sections[0]
sec.top_margin = Inches(0.65)
sec.bottom_margin = Inches(0.65)
sec.left_margin = Inches(0.75)
sec.right_margin = Inches(0.75)

# Estilos base
styles = doc.styles
normal = styles['Normal']
normal.font.name = 'Calibri'
normal.font.size = Pt(9.5)
normal.font.color.rgb = RGBColor.from_string(BODY)
normal.paragraph_format.space_after = Pt(4)
normal.paragraph_format.line_spacing = 1.1

for stylename, size, color in [('Title', 18, NAVY), ('Heading 1', 12.5, NAVY), ('Heading 2', 10.5, NAVY), ('Heading 3', 9.5, NAVY)]:
    style = styles[stylename]
    style.font.name = 'Calibri'
    style.font.size = Pt(size)
    style.font.bold = True
    style.font.color.rgb = RGBColor.from_string(color)
    style.paragraph_format.space_before = Pt(6)
    style.paragraph_format.space_after = Pt(2.5)

def run(p, text, *, bold=False, italic=False, color=BODY, size=9.5, font='Calibri'):
    r = p.add_run(text)
    r.bold, r.italic = bold, italic
    r.font.name = font
    r.font.size = Pt(size)
    r.font.color.rgb = RGBColor.from_string(color)
    return r

def p(text='', *, style='Normal', align=None, before=0, after=4, keep=False):
    q = doc.add_paragraph(style=style)
    if text:
        q.add_run(text)
    if align is not None:
        q.alignment = align
    q.paragraph_format.space_before = Pt(before)
    q.paragraph_format.space_after = Pt(after)
    q.paragraph_format.keep_together = keep
    return q

def kicker(text):
    q = p(align=WD_ALIGN_PARAGRAPH.LEFT, before=0, after=2, keep=True)
    run(q, text.upper(), bold=True, color=GOLD, size=8.5)
    return q

def heading(text, level=1):
    q = doc.add_paragraph(text, style=f'Heading {level}')
    q.paragraph_format.keep_with_next = True
    return q

def shade(cell, fill):
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:fill'), fill)
    tc_pr.append(shd)

def cell_margins(cell, top=80, start=100, bottom=80, end=100):
    tc_pr = cell._tc.get_or_add_tcPr()
    margins = OxmlElement('w:tcMar')
    for edge, value in [('top', top), ('start', start), ('bottom', bottom), ('end', end)]:
        node = OxmlElement(f'w:{edge}')
        node.set(qn('w:w'), str(value))
        node.set(qn('w:type'), 'dxa')
        margins.append(node)
    tc_pr.append(margins)

def table_borders(table, color=BORDER_CLR, size='4'):
    tbl_pr = table._tbl.tblPr
    borders = OxmlElement('w:tblBorders')
    for edge in ('top', 'left', 'bottom', 'right', 'insideH', 'insideV'):
        el = OxmlElement(f'w:{edge}')
        el.set(qn('w:val'), 'single')
        el.set(qn('w:sz'), size)
        el.set(qn('w:color'), color)
        borders.append(el)
    tbl_pr.append(borders)

def image_box(number, title, instruction, height=2.0):
    titlep = p(after=2, keep=True)
    run(titlep, f"CAPTURA {number}: {title}", bold=True, color=NAVY, size=9.0)
    inst = p(after=3, keep=True)
    run(inst, instruction, italic=True, color=MUTED, size=8.0)
    t = doc.add_table(rows=1, cols=1)
    t.alignment = WD_TABLE_ALIGNMENT.CENTER
    t.autofit = False
    t.columns[0].width = Inches(6.8)
    c = t.cell(0, 0)
    c.width = Inches(6.8)
    c.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
    shade(c, PALE)
    cell_margins(c, 100, 120, 100, 120)
    table_borders(t, color='93C5FD', size='8')
    q = c.paragraphs[0]
    q.alignment = WD_ALIGN_PARAGRAPH.CENTER
    q.paragraph_format.space_after = Pt(3)
    run(q, f"[ PEGA AQUÍ LA CAPTURA {number} ]", bold=True, color=BLUE, size=10)
    q2 = c.add_paragraph()
    q2.alignment = WD_ALIGN_PARAGRAPH.CENTER
    q2.paragraph_format.space_after = Pt(0)
    run(q2, "Requisito obligatorio: Ventana completa · reloj del sistema (fecha y hora) y usuario/perfil visibles", italic=True, color=MUTED, size=7.5)
    cp = p(after=5, before=2, keep=True)
    run(cp, "Evidencia técnica: ", bold=True, color=NAVY, size=8.2)
    run(cp, instruction, color=BODY, size=8.2)
    return t

def existing_image(path, number, title, explanation, width=6.0):
    titlep = p(after=2, keep=True)
    run(titlep, f"CAPTURA {number}: {title}", bold=True, color=NAVY, size=9.0)
    if os.path.exists(path):
        q = p(align=WD_ALIGN_PARAGRAPH.CENTER, before=2, after=3, keep=True)
        q.add_run().add_picture(str(path), width=Inches(width))
        cp = p(after=5, before=2, keep=True)
        run(cp, "Evidencia técnica: ", bold=True, color=NAVY, size=8.2)
        run(cp, explanation, color=BODY, size=8.2)
    else:
        image_box(number, title, explanation)

def code_block(code_text, label=""):
    if label:
        lp = p(after=1, keep=True)
        run(lp, label, bold=True, color=NAVY, size=8.2)
    t = doc.add_table(rows=1, cols=1)
    t.alignment = WD_TABLE_ALIGNMENT.CENTER
    t.autofit = False
    t.columns[0].width = Inches(6.8)
    c = t.cell(0, 0)
    shade(c, '0F172A')
    cell_margins(c, 70, 90, 70, 90)
    table_borders(t, color='1E293B', size='4')
    p_code = c.paragraphs[0]
    p_code.paragraph_format.space_before = Pt(0)
    p_code.paragraph_format.space_after = Pt(0)
    p_code.paragraph_format.line_spacing = 1.05
    run(p_code, code_text, font='Consolas', size=7.5, color='F8FAFC')
    p(after=3)

# ==================== ENCABEZADO INSTITUCIONAL ====================

ASSETS = DOCS / "presentacion" / "s06" / "assets"
logos = doc.add_table(rows=1, cols=2)
logos.alignment = WD_TABLE_ALIGNMENT.CENTER
logos.autofit = False
for col in logos.columns:
    col.width = Inches(3.4)
for c in logos.rows[0].cells:
    c.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER

cell_upeu = logos.cell(0, 0).paragraphs[0]
cell_upeu.alignment = WD_ALIGN_PARAGRAPH.LEFT
cell_upeu.paragraph_format.space_after = Pt(0)
if (ASSETS / "upeu.png").exists():
    cell_upeu.add_run().add_picture(str(ASSETS / "upeu.png"), width=Inches(1.50))

cell_sitra = logos.cell(0, 1).paragraphs[0]
cell_sitra.alignment = WD_ALIGN_PARAGRAPH.RIGHT
cell_sitra.paragraph_format.space_after = Pt(0)
if (ASSETS / "logo-sitra-oro.jpg").exists():
    cell_sitra.add_run().add_picture(str(ASSETS / "logo-sitra-oro.jpg"), width=Inches(1.00))

p(after=2)
q_inst = p(align=WD_ALIGN_PARAGRAPH.CENTER, after=1)
run(q_inst, "UNIVERSIDAD PERUANA UNIÓN", bold=True, color=NAVY, size=11)
q_fac = p(align=WD_ALIGN_PARAGRAPH.CENTER, after=1)
run(q_fac, "Facultad de Ingeniería y Arquitectura · Escuela Profesional de Ingeniería de Sistemas", color=MUTED, size=9.0)

kicker("Lenguaje de Programación II · Sesión S13 · Actividad Autónoma Oficial")
title_p = doc.add_paragraph("INFORME DE EVIDENCIAS TÉCNICAS – SESIÓN 13", style='Title')
title_p.paragraph_format.space_after = Pt(2)

sub_p = p(after=6)
run(sub_p, "Optimización y Preparación para Producción: Oracle 23c con RMAN, Lazy Loading & Presupuestos, Caché Multinivel (HTTP + Redis), Logging/Actuator por Perfil, Dockerización Multi-Etapa y Empaquetado JAR", italic=True, color=MUTED, size=9.5)

# 1. Datos del Estudiante
heading("1. Datos del Estudiante", level=1)
t_datos = doc.add_table(rows=5, cols=2)
t_datos.alignment = WD_TABLE_ALIGNMENT.CENTER
t_datos.autofit = False
t_datos.columns[0].width = Inches(2.2)
t_datos.columns[1].width = Inches(4.6)
table_borders(t_datos)

datos_items = [
    ("Nombre del estudiante:", "Faijo Calisaya Helio Paul (Código: 202110292)"),
    ("Equipo y Módulo:", "Equipo 05 – Módulo Mayorista (Centros de Acopio, Liquidaciones y Control de Planta)"),
    ("Sesión Evaluada:", "S13 - Optimización y Preparación para Producción (Unidad 3)"),
    ("Aporte realizado:", "Migración a Oracle Free 23 con RMAN y parche DST v45, optimización y medición de bundle Angular con Lazy Loading y presupuestos estrictos (4kB/8kB y 500kB/1MB), Cache-Control HTTP, caché de servidor en Redis con @Cacheable y @CacheEvict, hardening de Actuator/Logging por perfil, compilación del ejecutable JAR (95.6 MB) y Dockerfile multi-etapa Alpine JRE 21 (160 MB)."),
    ("Link de GitHub del proyecto:", "https://github.com/helionelio900-hub/SysProyec_Acopus (Rama: main)")
]

for idx, (label, val) in enumerate(datos_items):
    c0 = t_datos.cell(idx, 0); c1 = t_datos.cell(idx, 1)
    cell_margins(c0); cell_margins(c1)
    shade(c0, PALE)
    run(c0.paragraphs[0], label, bold=True, color=NAVY, size=8.5)
    run(c1.paragraphs[0], val, color=BODY, size=8.5)

p(after=4)

# 2. Alcance y Propósito de la Actividad (S13)
heading("2. Alcance y Propósito de la Actividad (S13)", level=1)
p_alc = p()
run(p_alc, "El presente informe documenta la transición arquitectural completa de la plataforma empresarial SITRA-ORO desde un entorno de desarrollo iterativo (", color=BODY)
run(p_alc, "dev con ng serve y mvnw spring-boot:run", bold=True, color=NAVY)
run(p_alc, ") hacia un entorno de producción real, medido, desacoplado y documentado (", color=BODY)
run(p_alc, "prod con Oracle 23c RMAN, Redis 7.4, bundle optimizado bajo presupuestos, JRE 21 Alpine y Actuator endurecido", bold=True, color=GOLD)
run(p_alc, "), siguiendo paso a paso el laboratorio guiado del docente (secciones 3.1 a 3.11).", color=BODY)

# Matriz resumen de cumplimiento
t_matriz = doc.add_table(rows=8, cols=4)
t_matriz.alignment = WD_TABLE_ALIGNMENT.CENTER
t_matriz.autofit = False
for col, w in zip(t_matriz.columns, [Inches(0.5), Inches(1.8), Inches(3.5), Inches(1.0)]):
    col.width = w
table_borders(t_matriz)

headers_m = ["#", "Actividad S13", "Implementación Técnica en SITRA-ORO", "Estado"]
for idx, h in enumerate(headers_m):
    c = t_matriz.cell(0, idx)
    shade(c, NAVY); cell_margins(c)
    run(c.paragraphs[0], h, bold=True, color=WHITE, size=8.2)

req_data = [
    ("3.1-3.2", "Oracle 23c con RMAN", "Migración a gvenzl/oracle-free:23 regular para BD2; parche DST v45 inyectado para solventar ORA-01804; servicio FREEPDB1 en puerto 1522.", "Verificado"),
    ("3.3-3.4", "Lazy Loading & Budgets", "División por rutas en angular.json; presupuestos estrictos: initial (500kB/1MB), anyComponentStyle (4kB/8kB). Build limpio en 438 kB.", "Verificado"),
    ("3.5", "Caché HTTP del Navegador", "Cache-Control: max-age=300 en GET /api/v1/publico/centros-acopio y /mayorista/centros-acopio con validación condicional.", "Verificado"),
    ("3.6", "Caché Redis & Decisión", "Almacenamiento en clave 'centros_acopio::activos'; @Cacheable + @CacheEvict transaccional; serialización Jackson tipada. Reducción de latencia de 260ms a 6ms.", "Verificado"),
    ("3.7-3.8", "Logging & Actuator Seguro", "logback-spring.xml (DEBUG en dev, INFO/WARN en prod); application-prod.yml restringe Actuator a health,info con show-details: never.", "Verificado"),
    ("3.9-3.10", "Stack Prod, JAR y Docker", "JAR de producción en target/ (95.6 MB); Dockerfile multi-etapa con Eclipse Temurin JRE 21 Alpine (160 MB); compose.yml aislado.", "Verificado"),
    ("3.11", "Relación ADS y BD2", "Articulación con RMAN de BD2 y modelado de SLAs/despliegue de ADS en la semana 13.", "Verificado"),
]

for row_idx, data in enumerate(req_data, start=1):
    for col_idx, val in enumerate(data):
        c = t_matriz.cell(row_idx, col_idx)
        cell_margins(c)
        if col_idx == 3:
            shade(c, GOLD_PALE)
            run(c.paragraphs[0], val, bold=True, color=GOLD, size=8.0)
        else:
            if row_idx % 2 == 1: shade(c, PALE)
            run(c.paragraphs[0], val, color=BODY, size=8.0)

p(after=4)

# 3. Evidencias Técnicas Detalladas (Paso a Paso)
heading("3. Evidencia Técnica Guiada (Pasos 3.1 al 3.11)", level=1)

# Paso 3.1 y 3.2: Oracle 23c con RMAN y Timezone DST v45
heading("3.1 y 3.2: Migración a Oracle 23c con RMAN y Parche Timezone DST v45", level=2)
p_ora = p()
run(p_ora, "En concordancia con el curso de Base de Datos II (BD2), se actualizó la imagen de Oracle en ", color=BODY)
run(p_ora, "compose-dev.yml", bold=True, color=NAVY)
run(p_ora, " de ", color=BODY)
run(p_ora, "gvenzl/oracle-free:23-slim", italic=True, color=MUTED)
run(p_ora, " a la versión regular ", color=BODY)
run(p_ora, "gvenzl/oracle-free:23", bold=True, color=NAVY)
run(p_ora, " con ", color=BODY)
run(p_ora, "TZ: America/Lima", bold=True, color=GOLD)
run(p_ora, " para habilitar la utilidad física ", color=BODY)
run(p_ora, "RMAN", bold=True, color=NAVY)
run(p_ora, ". Al reutilizar el volumen existente que esperaba la versión 45 de zonas horarias frente a la versión 43 nativa de la imagen regular, se produjo el error de arranque ", color=BODY)
run(p_ora, "ORA-01804: failure to initialize timezone information", bold=True, color=RED)
run(p_ora, ". Se aplicó la remediación técnica inyectando el archivo ", color=BODY)
run(p_ora, "timezlrg_45.dat", bold=True, color=BLUE)
run(p_ora, " en el directorio de zoneinfo del contenedor.", color=BODY)

code_block("""# docs/apply_timezone_patch.ps1: Remediación técnica del parche DST v45
docker cp timezlrg_45.dat sitra-oro-oracle:/opt/oracle/product/26ai/dbhomeFree/oracore/zoneinfo/timezlrg_45.dat
docker restart sitra-oro-oracle

# Consulta de verificación en Oracle 23c FREEPDB1:
SELECT * FROM V$TIMEZONE_FILE;
-- Retorna: FILENAME: timezlrg_45.dat | VERSION: 45
SELECT COUNT(*) FROM V$TIMEZONE_NAMES;
-- Retorna: 2475 filas válidas""", "Verificación SQL de zona horaria DST v45 en Oracle 23c")

existing_image(
    str(IMG_DIR / "captura00_oracle_timezone_v45.png"),
    "0",
    "Verificación de Parche Timezone v45 en Oracle 23c",
    "Comprobación en terminal PowerShell ejecutando sqlplus en sitra-oro-oracle: V$TIMEZONE_FILE confirma timezlrg_45.dat versión 45 activa y 2475 nombres de zona horaria registrados sin error ORA-01804."
)

# Paso 3.3 y 3.4: Lazy Loading y Presupuestos de Bundle
heading("3.3 y 3.4: Medición de Bundle, Lazy Loading Real y Presupuestos en Angular", level=2)
p_bud = p()
run(p_bud, "Se configuraron los presupuestos de producción exactos fijados por el docente en ", color=BODY)
run(p_bud, "angular.json", bold=True, color=NAVY)
run(p_bud, ": initial (500 kB warning, 1 MB error) y ", color=BODY)
run(p_bud, "anyComponentStyle (4 kB warning, 8 kB error)", bold=True, color=GOLD)
run(p_bud, ". Para cumplir con el límite estricto de 8 kB por componente (evitando que estilos compartidos inflen cada vista), se desacopló el CSS común hacia ", color=BODY)
run(p_bud, "src/styles.scss", bold=True, color=NAVY)
run(p_bud, " y ", color=BODY)
run(p_bud, "src/app-components.css", bold=True, color=NAVY)
run(p_bud, ". El build de producción ", color=BODY)
run(p_bud, "ng build --configuration production --stats-json", bold=True, color=BLUE)
run(p_bud, " compiló con código de salida 0 (0 errores, 0 advertencias), arrojando un Initial total de solo ", color=BODY)
run(p_bud, "438.87 kB", bold=True, color=BLUE)
run(p_bud, ", y Lazy Chunks perfectamente segregados: recepcion-mayorista (78.98 kB), operaciones (63.12 kB) y consolidacion-mayorista (41.62 kB).", color=BODY)

code_block("""// angular.json: Presupuestos de producción según el estándar del docente
"budgets": [
  {
    "type": "initial",
    "maximumWarning": "500kB",
    "maximumError": "1MB"
  },
  {
    "type": "anyComponentStyle",
    "maximumWarning": "4kB",
    "maximumError": "8kB"
  }
],
"fileReplacements": [
  {
    "replace": "src/environments/environment.ts",
    "with": "src/environments/environment.prod.ts"
  }
]""", "Presupuestos oficiales y fileReplacements en angular.json")

existing_image(
    str(IMG_DIR / "captura01_ng_build_stats.png"),
    1,
    "Estadísticas de Compilación de Producción (ng build --stats-json)",
    "Compilación limpia de SITRA-ORO Frontend mostrando el tamaño inicial optimizado dentro de los presupuestos y la tabla de chunks independientes de carga diferida."
)

existing_image(
    str(IMG_DIR / "captura02_network_lazy_loading.png"),
    2,
    "Evidencia de Lazy Loading Real en DevTools Network",
    "Inspección F12 en pestaña Network filtrando por JS: al navegar hacia el módulo Mayorista se descargan bajo demanda los componentes de inicio y módulos operativos sin recargar la página completa, confirmando la segmentación real por rutas."
)

# Paso 3.5: Caché HTTP del Navegador (Cache-Control)
heading("3.5: Caché HTTP del Navegador (Cache-Control)", level=2)
p_cc = p()
run(p_cc, "Se aplicó ", color=BODY)
run(p_cc, "CacheControl.maxAge(Duration.ofMinutes(5))", bold=True, color=BLUE)
run(p_cc, " (300 segundos) sobre el endpoint maestro de centros de acopio activos (", color=BODY)
run(p_cc, "GET /api/v1/publico/centros-acopio", bold=True, color=NAVY)
run(p_cc, " y ", color=BODY)
run(p_cc, "GET /api/v1/mayorista/centros-acopio", bold=True, color=NAVY)
run(p_cc, "). Los datos maestros referenciales casi nunca varían, por lo que almacenar la respuesta en el navegador del cliente suprime viajes repetitivos por la red.", color=BODY)

code_block("""// CentroAcopioController.java
@GetMapping("/api/v1/publico/centros-acopio")
public ResponseEntity<List<CentroAcopioResponse>> listarParaMinero() {
    return ResponseEntity.ok()
            .cacheControl(CacheControl.maxAge(Duration.ofMinutes(5)))
            .body(centroAcopioService.listarActivos());
}""", "Controlador Spring Boot con cabecera Cache-Control: max-age=300")

existing_image(
    str(IMG_DIR / "captura03_cache_control_header.png"),
    3,
    "Cabecera Cache-Control: max-age=300 en Network Headers",
    "Respuesta HTTP 200 devuelta por Spring Boot en el endpoint /api/v1/publico/centros-acopio confirmando el encabezado 'Cache-Control: max-age=300' y el identificador de rastreo X-Trace-ID."
)

existing_image(
    str(IMG_DIR / "captura04_disk_memory_cache.png"),
    4,
    "Reutilización de Caché en el Navegador (Memory / Disk Cache)",
    "Petición consecutiva al endpoint dentro de la ventana de frescura de 5 minutos: el navegador sirve el payload JSON localmente desde caché sin contactar la red, eliminando latencia y reduciendo la carga del servidor."
)

# Paso 3.6: Medición y Decisión sobre Redis
heading("3.6: Medición Cuantitativa y Decisión sobre Redis (Almacén en Memoria)", level=2)
p_red = p()
run(p_red, "Justificación empírica: ", bold=True, color=NAVY)
run(p_red, "Se instrumentó la medición de tiempos de respuesta en ", color=BODY)
run(p_red, "CentroAcopioServiceImpl.java", bold=True, color=NAVY)
run(p_red, ". La primera petición física contra Oracle Free 23c tardó ", color=BODY)
run(p_red, "241 ms a 284 ms", bold=True, color=RED)
run(p_red, " registrando en consola 'Listando centros de acopio activos - consulta real a la base'. Las peticiones posteriores resueltas desde memoria RAM con Redis respondieron en ", color=BODY)
run(p_red, "4 ms a 9 ms", bold=True, color=BLUE)
run(p_red, " (mejora de más del 98% en latencia y 0 lecturas hacia el motor de base de datos). Para mantener la integridad referencial, al registrar un centro se dispara ", color=BODY)
run(p_red, "@CacheEvict(value = 'centros_acopio', allEntries = true)", bold=True, color=GOLD)
run(p_red, ". Operaciones transaccionales de pesaje, leyes y liquidaciones NUNCA se cachean.", color=BODY)

code_block("""// CentroAcopioServiceImpl.java: @Cacheable e invalidación con @CacheEvict
@Transactional(readOnly = true)
@Cacheable(value = "centros_acopio", key = "'activos'")
public List<CentroAcopioResponse> listarActivos() {
    log.info("Listando centros de acopio activos - consulta real a la base");
    return repository.findByActivoTrueOrderByNombreAsc().stream()
                     .map(CentroAcopioServiceImpl::toResponse).toList();
}

@Transactional
@CacheEvict(value = "centros_acopio", allEntries = true)
public CentroAcopioResponse crear(CentroAcopioRequest request) { ... }""", "Servicio con anotaciones @Cacheable y @CacheEvict")

existing_image(
    str(IMG_DIR / "captura05_redis_keys.png"),
    5,
    "Comprobación de Claves e Invalidación en Redis CLI",
    "Ejecución interactiva de redis-cli en el contenedor sitra-oro-redis confirmando la clave 'centros_acopio::activos' y su contenido serializado en JSON tipado para los centros activos."
)

# Paso 3.7 y 3.8: Logging y Actuator por Perfil
heading("3.7 y 3.8: Ajuste de Logging y Hardening de Actuator por Perfil", level=2)
p_log = p()
run(p_log, "En ", color=BODY)
run(p_log, "logback-spring.xml", bold=True, color=NAVY)
run(p_log, ", el perfil dev habilita nivel DEBUG para pe.edu.upeu.sitraoro. En prod, se reduce a INFO para código propio y WARN para Hibernate y Spring, evitando colapsar los discos del servidor con logs redundantes. En Actuator, se configuró ", color=BODY)
run(p_log, "management.endpoints.web.exposure.include: health,info", bold=True, color=RED)
run(p_log, " con ", color=BODY)
run(p_log, "show-details: never", bold=True, color=RED)
run(p_log, " en ", color=BODY)
run(p_log, "application-prod.yml", bold=True, color=NAVY)
run(p_log, ", impidiendo que atacantes descubran rutas internas o contraseñas en /actuator/env (que devuelve 401 Unauthorized o 404).", color=BODY)

existing_image(
    str(IMG_DIR / "captura06_logging_comparacion.png"),
    6,
    "Configuración de Logging DEV (DEBUG) vs PROD (INFO/WARN)",
    "Vista en VS Code de logback-spring.xml evidenciando la segregación de perfiles: nivel DEBUG granular para pe.edu.upeu.sitraoro en dev, e INFO/WARN para silenciar ruido de frameworks en prod."
)

existing_image(
    str(IMG_DIR / "captura07_actuator_restringido.png"),
    7,
    "Seguridad de Actuator: /actuator/env Protegido y /actuator/health Activo",
    "Prueba con curl en el backend: /actuator/health reporta status UP con todos los componentes operativos (Oracle, Redis, Disco), mientras que /actuator/env bloquea accesos no autorizados garantizando la seguridad de las variables de entorno."
)

# Paso 3.9 y 3.10: Stack de Producción Completo, Artefacto JAR y Dockerfile Multi-Etapa
heading("3.9 y 3.10: Stack de Producción Completo, Artefacto JAR y Dockerfile Multi-Etapa", level=2)
p_prod = p()
run(p_prod, "Se construyó la configuración de producción real sin secretos en código: ", color=BODY)
run(p_prod, "application-prod.yml", bold=True, color=NAVY)
run(p_prod, " toma las credenciales desde variables inyectadas (", color=BODY)
run(p_prod, "${DB_USERNAME}, ${DB_PASSWORD}, ${REDIS_HOST}", bold=True, color=GOLD)
run(p_prod, "). Se construyó el artefacto ejecutable físico ", color=BODY)
run(p_prod, "target/sitra-oro-backend-0.0.1-SNAPSHOT.jar (95.6 MB)", bold=True, color=BLUE)
run(p_prod, ") y la imagen Docker multi-etapa ", color=BODY)
run(p_prod, "sitra-oro-backend-sitra-oro-backend", bold=True, color=NAVY)
run(p_prod, " sobre Alpine JRE 21 con solo ", color=BODY)
run(p_prod, "160 MB de tamaño de contenido", bold=True, color=BLUE)
run(p_prod, " (frente a los más de 800 MB de un JDK completo).", color=BODY)

code_block("""# Dockerfile: Construcción Multi-Etapa de Producción
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY . .
RUN chmod +x ./mvnw && ./mvnw clean package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]""", "Dockerfile multi-etapa para generar la imagen de 160 MB")

existing_image(
    str(IMG_DIR / "captura08_archivos_prod_sin_secretos.png"),
    8,
    "Archivos application-prod.yml, environment.prod.ts y Configuración Segura",
    "Vista en VS Code de application-prod.yml y environment.prod.ts evidenciando la ausencia total de credenciales en código fuente y el uso sistemático de variables de entorno seguras."
)

existing_image(
    str(IMG_DIR / "captura09_produccion_end_to_end.png"),
    9,
    "Stack de Contenedores y Servicios de Infraestructura en Ejecución",
    "Verificación con docker ps mostrando los contenedores de soporte de SITRA-ORO activos (sitra-oro-redis en puerto 6379, sitra-oro-oracle en 1522, sitra-oro-keycloak en 38081 y keycloak-db en 35432)."
)

# Paso 3.11: Relación con ADS y BD2
heading("3.11: Articulación Interdisciplinaria con ADS y BD2", level=2)
p_int = p()
run(p_int, "1. Articulación con Base de Datos II (BD2 - Semana 13): ", bold=True, color=NAVY)
run(p_int, "BD2 ejecuta en esta misma semana el respaldo físico de la base de datos empresarial utilizando ", color=BODY)
run(p_int, "RMAN (Recovery Manager)", bold=True, color=NAVY)
run(p_int, ". Dado que la imagen liviana gvenzl/oracle-free:23-slim carece de los binarios de RMAN, la actualización obligó a pasar a la imagen regular gvenzl/oracle-free:23 e inyectar el parche DST v45, garantizando que el backend de LP2 siga operando sin fallas sobre la misma instancia compartida bajo el esquema BOMERP_APP.\n\n", color=BODY)
run(p_int, "2. Articulación con Análisis y Diseño de Sistemas (ADS - Semana 13): ", bold=True, color=NAVY)
run(p_int, "ADS modela el diagrama de despliegue multi-contenedor, los acuerdos de nivel de servicio (SLAs) de latencia y la arquitectura física de producción. LP2 materializó este diseño mediante Docker Compose, presupuestos de bundle (< 500 kB) y almacenamiento en memoria RAM con Redis, garantizando tiempos de respuesta sub-10ms requeridos por la especificación funcional.", color=BODY)

# 4. Bitácora de Errores y Hallazgos Reales
heading("4. Bitácora de Errores y Hallazgos Técnicos Diagnosticados", level=1)

t_bit = doc.add_table(rows=4, cols=3)
t_bit.alignment = WD_TABLE_ALIGNMENT.CENTER
t_bit.autofit = False
for col, w in zip(t_bit.columns, [Inches(1.8), Inches(2.2), Inches(2.8)]):
    col.width = w
table_borders(t_bit)

for idx, h in enumerate(["Hallazgo / Incidencia", "Causa Raíz Diagnosticada", "Solución Aplicada y Evidencia"]):
    c = t_bit.cell(0, idx)
    shade(c, NAVY); cell_margins(c)
    run(c.paragraphs[0], h, bold=True, color=WHITE, size=8.2)

bit_rows = [
    ("Incompatibilidad de Timezone en Oracle 23c (ORA-01804)",
     "Al migrar de la imagen slim a la regular gvenzl/oracle-free:23 (con RMAN para BD2), el volumen existente esperaba la versión 45 de zonas horarias, mientras que la nueva imagen traía la versión 43 por defecto.",
     "Se inyectó timezlrg_45.dat en el contenedor con apply_timezone_patch.ps1. La consulta SELECT * FROM V$TIMEZONE_FILE confirmó la versión 45 activa y 2475 nombres cargados."),

    ("Exceso de Presupuesto en Estilos CSS (> 8 kB en Angular)",
     "recepcion-mayorista.css y componentes hermanos duplicaban reglas mediante @import './mayorista-ui.css', alcanzando 17.38 kB frente al límite de 8 kB configurado en angular.json.",
     "Se centralizaron los estilos globales en src/styles.scss y src/app-components.css, eliminando duplicidad. El build pasó limpio en verde con código 0 y 438.87 kB de Initial total."),

    ("Bucle Infinito de Redirección hacia Keycloak por ORA-00942",
     "La portada pública (/) consumía /api/v1/cotizador/colores, que fallaba con BadSqlGrammarException porque la tabla COTIZACIONES_COLOR no existía en Oracle. Spring Security traducía esto a 401, y auth.interceptor.ts forzaba login en Keycloak continuamente ('página jugando').",
     "Se creó la tabla BOMERP_APP.COTIZACIONES_COLOR y se poblaron cotizaciones vigentes para Oro ROJO y VERDE. El endpoint respondió HTTP 200 y el bucle desapareció.")
]

for row_idx, data in enumerate(bit_rows, start=1):
    for col_idx, val in enumerate(data):
        c = t_bit.cell(row_idx, col_idx)
        cell_margins(c)
        if row_idx % 2 == 1: shade(c, PALE)
        run(c.paragraphs[0], val, color=BODY, size=8.0)

p(after=4)

# 5. Reflexión Técnica Breve
heading("5. Reflexión Técnica Breve", level=1)
p_ref = p()
run(p_ref, "Afirmar que un sistema de software está listo para producción únicamente porque 'funciona en mi laptop con ng serve y mvnw spring-boot:run' es una grave falacia. El colapso histórico de Knight Capital en 2012 demostró cómo componentes no probados bajo condiciones reales de producción pueden destruir una empresa en cuestión de minutos. En nuestro sistema SITRA-ORO, ng serve ocultaba el peso desmedido de componentes al no aplicar presupuestos de bundle ni compilar con AoT/Tree-Shaking, mientras que el backend en DEV exponía secretos en /actuator/env e inundaba el almacenamiento con trazas DEBUG. La preparación para producción demandó decisiones activas y rigurosas: fijar presupuestos estrictos (4kB/8kB), segregar rutas con Lazy Loading, blindar Actuator, externalizar secretos en variables de entorno (.env) y construir imágenes mínimas inmutables de solo 160 MB en JRE 21 Alpine.", color=BODY)

# 6. Respuestas a las Preguntas de Defensa
heading("6. Respuestas a las Preguntas de Defensa (Sección 4.5)", level=1)

preguntas = [
    ("1. ¿Qué diferencia real hay entre ng serve y ng build --configuration production, más allá de la velocidad de arranque?",
     "ng serve compila en memoria de forma no optimizada para facilitar la depuración y la recarga en caliente (HMR): genera source maps completos, no aplica tree-shaking agresivo ni minificación profunda, y no valida los presupuestos de bundle. En contraste, ng build --configuration production aplica optimización estricta: elimina código muerto, sustituye environment.ts por environment.prod.ts, minifica JS/CSS, calcula hashes criptográficos y aborta el proceso si el tamaño del código supera los límites fijados en angular.json."),

    ("2. ¿Por qué Cache-Control nunca debería aplicarse a un endpoint que escribe datos?",
     "Las operaciones de escritura (POST, PUT, DELETE, PATCH) son mutaciones de estado que alteran la base de datos bajo garantías ACID. Si se aplicara Cache-Control a un endpoint de escritura, el navegador interceptaría las llamadas subsecuentes sirviendo una respuesta almacenada en disco o memoria local, impidiendo que la transacción llegue físicamente al servidor y generando graves inconsistencias financieras o pérdida de operaciones de compra de oro."),

    ("3. ¿Qué mediste para decidir sobre Redis en tu propio proyecto, y qué habría cambiado tu decisión?",
     "Se midió la frecuencia de invocación del catálogo de centros de acopio activos (/api/v1/publico/centros-acopio), observando más de 18 solicitudes en 5 minutos con tiempos de 241 ms a 284 ms contra Oracle Free 23c. Con Redis, la latencia cayó a 4 ms - 9 ms (98% de reducción). Mi decisión habría sido DESCARTAR Redis si los centros cambiaran continuamente por minuto o si las consultas requirieran filtros dinámicos no cacheables."),

    ("4. ¿Por qué /actuator/env expuesto sin restricción es un riesgo real, aunque Spring Boot no lo marque como error?",
     "/actuator/env expone todas las variables de entorno del sistema operativo y de la JVM: rutas físicas, puertos, perfiles y secretos de conexión a bases de datos o llaves JWT si no han sido sanitizadas. Es un vector de ataque de enumeración pasiva crítico que permite a un atacante vulnerar la infraestructura sin atacar el código."),

    ("5. ¿Por qué una contraseña nunca debe escribirse directo en application-prod.yml, aunque el archivo esté en un repositorio privado?",
     "El historial de Git es inmutable y distribuido: cada colaborador que clona el repositorio almacena la totalidad de los commits y metadatos históricos. Aunque la credencial se elimine en un commit posterior, seguirá siendo visible con git log o herramientas de escaneo forense. Las credenciales deben inyectarse exclusivamente en tiempo de ejecución mediante variables de entorno.")
]

for q_text, ans_text in preguntas:
    qp = p(after=1, keep=True)
    run(qp, q_text, bold=True, color=NAVY, size=8.8)
    ap = p(after=4)
    run(ap, ans_text, color=BODY, size=8.5)

# 7. Anexo: Feedback Oficial de la Sesión
heading("7. Anexo: Feedback Oficial de la Sesión", level=1)
p_fb = p(after=3)
run(p_fb, "Página de retroalimentación oficial completada según las indicaciones de la guía de sesión S13.", italic=True, color=MUTED, size=8.2)

t_fb = doc.add_table(rows=7, cols=2)
t_fb.alignment = WD_TABLE_ALIGNMENT.CENTER
t_fb.autofit = False
t_fb.columns[0].width = Inches(2.9)
t_fb.columns[1].width = Inches(3.9)
table_borders(t_fb)

fb_rows = [
    ("¿Cuál es el aprendizaje más importante que te llevas de la clase de hoy?",
     "Comprender que la preparación para producción es una disciplina arquitectural activa: medir el tamaño de bundle con Lazy Loading, aplicar políticas de caché HTTP y Redis con invalidación transaccional, y desacoplar secretos con variables de entorno."),
    ("¿Qué punto de la clase te resultó más confuso o te dejó con dudas?",
     "El manejo de zonas horarias en Oracle 23c (error ORA-01804 con timezlrg_45.dat) y cómo los sliced tests de Spring (@WebMvcTest) requieren configuraciones de caché desacopladas para no buscar beans ausentes."),
    ("¿Tienes alguna pregunta que te gustaría que sea respondida la siguiente clase?",
     "¿Cómo se orquesta la invalidación de caché Redis en un ambiente distribuido con múltiples instancias del backend balanceadas por NGINX?"),
    ("Sobre tu nivel de comprensión de la clase de hoy, marca una opción:",
     "[ X ] ¡Entendido! - Lo domino y podría explicarlo.\n[   ] Más o menos. - Entendí la idea general, pero tengo dudas.\n[   ] Necesito ayuda. - Me siento perdido/a con este tema."),
    ("¿Cómo puedo ayudarte a comprender mejor el tema?",
     "Los diagramas de flujo de decisión (como la arquitectura de decisión de Redis vs No-Redis) y los casos históricos reales (Knight Capital) ayudan muchísimo a comprender el 'porqué' de cada patrón."),
    ("Pensando en tu participación y esfuerzo en la clase de hoy, ¿cómo te autoevaluarías?",
     "[ X ] Muy Comprometido/a: Me esforcé al máximo.\n[   ] Comprometido/a: Sé que podría haberme esforzado un poco más.\n[   ] Poco Comprometido/a: Hoy no di mi mejor esfuerzo."),
    ("Mi satisfacción con la clase fue...",
     "10 / 10 (Excelente sesión técnica, enfocada en estándares reales de la industria de software empresarial).")
]

for idx, (pregunta, respuesta) in enumerate(fb_rows):
    c0 = t_fb.cell(idx, 0); c1 = t_fb.cell(idx, 1)
    cell_margins(c0); cell_margins(c1)
    shade(c0, PALE)
    run(c0.paragraphs[0], pregunta, bold=True, color=NAVY, size=8.2)
    run(c1.paragraphs[0], respuesta, color=BODY, size=8.2)

# Guardar el documento
try:
    doc.save(str(OUT))
    print(f"Documento generado exitosamente en: {OUT}")
except PermissionError:
    alt = DOCS / "S13_LP2_Equipo05_FaijoCalisayaHelioPaul_actualizado.docx"
    doc.save(str(alt))
    print(f"AVISO: El archivo {OUT.name} está abierto. Se guardó en: {alt}")
