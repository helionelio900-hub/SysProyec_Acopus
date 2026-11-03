# -*- coding: utf-8 -*-
"""
Script generador del informe oficial S13 LP2 para Helio Paul Faijo Calisaya.
Estructura según el sílabo oficial S13 (secciones 4.1 a 4.6).
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

for stylename, size, color in [('Title', 20, NAVY), ('Heading 1', 13, NAVY), ('Heading 2', 11, NAVY), ('Heading 3', 10, NAVY)]:
    style = styles[stylename]
    style.font.name = 'Calibri'
    style.font.size = Pt(size)
    style.font.bold = True
    style.font.color.rgb = RGBColor.from_string(color)
    style.paragraph_format.space_before = Pt(7)
    style.paragraph_format.space_after = Pt(3)

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

def cell_margins(cell, top=90, start=110, bottom=90, end=110):
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

def image_box(number, title, instruction, height=2.2):
    titlep = p(after=2, keep=True)
    run(titlep, f"CAPTURA {number}: {title}", bold=True, color=NAVY, size=9.2)
    inst = p(after=4, keep=True)
    run(inst, instruction, italic=True, color=MUTED, size=8.2)
    t = doc.add_table(rows=1, cols=1)
    t.alignment = WD_TABLE_ALIGNMENT.CENTER
    t.autofit = False
    t.columns[0].width = Inches(6.8)
    c = t.cell(0, 0)
    c.width = Inches(6.8)
    c.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
    shade(c, PALE)
    cell_margins(c, 120, 150, 120, 150)
    table_borders(t, color='93C5FD', size='8')
    q = c.paragraphs[0]
    q.alignment = WD_ALIGN_PARAGRAPH.CENTER
    q.paragraph_format.space_after = Pt(4)
    run(q, f"[ PEGA AQUÍ LA CAPTURA {number} ]", bold=True, color=BLUE, size=11)
    q2 = c.add_paragraph()
    q2.alignment = WD_ALIGN_PARAGRAPH.CENTER
    q2.paragraph_format.space_after = Pt(0)
    run(q2, "Requisito obligatorio: Ventana completa · reloj del sistema (fecha y hora) y usuario/perfil visibles · sin recortar", italic=True, color=MUTED, size=7.8)
    cp = p(after=6, before=3, keep=True)
    run(cp, "Evidencia técnica: ", bold=True, color=NAVY, size=8.5)
    run(cp, instruction, color=BODY, size=8.5)
    return t

def existing_image(path, number, title, explanation, width=6.2):
    titlep = p(after=2, keep=True)
    run(titlep, f"CAPTURA {number}: {title}", bold=True, color=NAVY, size=9.2)
    if os.path.exists(path):
        q = p(align=WD_ALIGN_PARAGRAPH.CENTER, before=2, after=4, keep=True)
        q.add_run().add_picture(str(path), width=Inches(width))
        cp = p(after=6, before=2, keep=True)
        run(cp, "Evidencia técnica: ", bold=True, color=NAVY, size=8.5)
        run(cp, explanation, color=BODY, size=8.5)
    else:
        image_box(number, title, explanation)

def code_block(code_text, label=""):
    if label:
        lp = p(after=1, keep=True)
        run(lp, label, bold=True, color=NAVY, size=8.5)
    t = doc.add_table(rows=1, cols=1)
    t.alignment = WD_TABLE_ALIGNMENT.CENTER
    t.autofit = False
    t.columns[0].width = Inches(6.8)
    c = t.cell(0, 0)
    shade(c, '0F172A')
    cell_margins(c, 80, 100, 80, 100)
    table_borders(t, color='1E293B', size='4')
    p_code = c.paragraphs[0]
    p_code.paragraph_format.space_before = Pt(0)
    p_code.paragraph_format.space_after = Pt(0)
    p_code.paragraph_format.line_spacing = 1.05
    run(p_code, code_text, font='Consolas', size=7.8, color='F8FAFC')
    p(after=4)

# ==================== CONTENIDO DEL DOCUMENTO ====================

# Encabezado institucional con logos (UPeU a la izquierda y SITRA-ORO a la derecha)
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
    cell_upeu.add_run().add_picture(str(ASSETS / "upeu.png"), width=Inches(1.55))

cell_sitra = logos.cell(0, 1).paragraphs[0]
cell_sitra.alignment = WD_ALIGN_PARAGRAPH.RIGHT
cell_sitra.paragraph_format.space_after = Pt(0)
if (ASSETS / "logo-sitra-oro.jpg").exists():
    cell_sitra.add_run().add_picture(str(ASSETS / "logo-sitra-oro.jpg"), width=Inches(1.05))

p(after=2)
q_inst = p(align=WD_ALIGN_PARAGRAPH.CENTER, after=1)
run(q_inst, "UNIVERSIDAD PERUANA UNIÓN", bold=True, color=NAVY, size=11)
q_fac = p(align=WD_ALIGN_PARAGRAPH.CENTER, after=1)
run(q_fac, "Facultad de Ingeniería y Arquitectura", color=MUTED, size=9.5)
q_esc = p(align=WD_ALIGN_PARAGRAPH.CENTER, after=6)
run(q_esc, "Escuela Profesional de Ingeniería de Sistemas", bold=True, color=BLUE, size=10)

kicker("Lenguaje de Programación II · Sesión S13 · Actividad Autónoma")
title_p = doc.add_paragraph("INFORME DE EVIDENCIAS TÉCNICAS – SESIÓN 13", style='Title')
title_p.paragraph_format.space_after = Pt(2)

sub_p = p(after=8)
run(sub_p, "Optimización y Preparación para Producción: Lazy Loading y Presupuestos de Bundle, Caché HTTP, Decisión sobre Redis, Logging/Actuator por Perfil y Despliegue Multi-Contenedor", italic=True, color=MUTED, size=10)

# 1. Datos del Estudiante (4.3.1)
heading("1. Datos del Estudiante", level=1)
t_datos = doc.add_table(rows=5, cols=2)
t_datos.alignment = WD_TABLE_ALIGNMENT.CENTER
t_datos.autofit = False
t_datos.columns[0].width = Inches(2.2)
t_datos.columns[1].width = Inches(4.6)
table_borders(t_datos)

datos_items = [
    ("Nombre del estudiante:", "Faijo Calisaya Helio Paul (Código: 202110292)"),
    ("Equipo y Módulo:", "Equipo 05 – Módulo Mayorista (Centros de Acopio y Liquidaciones)"),
    ("Sesión Evaluada:", "S13 - Optimización y Preparación para Producción"),
    ("Rol o aporte realizado:", "Medición y optimización de bundle con Lazy Loading, presupuestos en angular.json, Cache-Control HTTP, decisión y benchmarking sobre Redis con invalidación @CacheEvict, configuración de logging estructurado por perfiles y Dockerización multi-etapa para producción sin secretos en código."),
    ("Link de GitHub del proyecto:", "https://github.com/helionelio900-hub/SysProyec_Acopus (Rama: main)")
]

for idx, (label, val) in enumerate(datos_items):
    c0 = t_datos.cell(idx, 0)
    c1 = t_datos.cell(idx, 1)
    cell_margins(c0); cell_margins(c1)
    shade(c0, PALE)
    run(c0.paragraphs[0], label, bold=True, color=NAVY, size=8.8)
    run(c1.paragraphs[0], val, color=BODY, size=8.8)

p(after=6)

# 2. Alcance y Propósito de la Actividad (4.2)
heading("2. Alcance y Propósito de la Actividad (S13)", level=1)
p_alc = p()
run(p_alc, "El presente informe documenta la transición arquitectural de la aplicación Full-Stack SITRA-ORO desde un entorno de desarrollo local iterativo (", color=BODY)
run(p_alc, "spring.profiles.active: dev", bold=True, color=NAVY)
run(p_alc, " con ", color=BODY)
run(p_alc, "ng serve", bold=True, color=NAVY)
run(p_alc, ") hacia un entorno de producción real, medido y estabilizado (", color=BODY)
run(p_alc, "application-prod.yml, environment.prod.ts, Docker Compose y Redis", bold=True, color=GOLD)
run(p_alc, "). Se demuestra que la producción no es simplemente 'el mismo código en otro servidor', sino una disciplina que involucra optimización del tamaño del frontend mediante Code Splitting, políticas de caché multinivel (navegador con Cache-Control y servidor con Redis), contención estricta de fuga de datos en logs y Actuator, y externalización total de secretos.", color=BODY)

# 3. Evidencias Técnicas (4.3.1 y 4.6)
heading("3. Evidencia Técnica (Organizada en los 5 Bloques de la Rúbrica)", level=1)

# Bloque 1: Lazy Loading y Presupuestos
heading("Bloque 1: Lazy Loading y Presupuestos de Bundle (Frontend SPA)", level=2)
p_b1 = p()
run(p_b1, "Se compiló la SPA de SITRA-ORO utilizando el compilador optimizado de Angular con ", color=BODY)
run(p_b1, "ng build --configuration production --stats-json", bold=True, color=NAVY)
run(p_b1, ". El empaquetador generó un bundle inicial de ", color=BODY)
run(p_b1, "336.60 kB (94.69 kB de transferencia estimada en red)", bold=True, color=BLUE)
run(p_b1, ", respetando holgadamente el presupuesto de advertencia (500 kB) y de error (1 MB). Los módulos de mayorista fueron segmentados en chunks diferidos (Lazy Chunks): recepcion-mayorista (110.26 kB), operaciones (90.42 kB), consolidacion-mayorista (60.57 kB), centros (25.71 kB) y liquidaciones (29.75 kB).", color=BODY)

existing_image(
    str(IMG_DIR / "captura01_ng_build_stats.png"),
    1,
    "Estadísticas de Compilación de Producción (ng build --stats-json)",
    "Compilación limpia de SITRA-ORO Frontend mostrando el tamaño inicial (336.60 kB / 94.69 kB transfer) y la tabla de chunks independientes de carga diferida (recepcion-mayorista, operaciones, centros, liquidaciones)."
)

code_block("""// angular.json: Presupuestos configurados en production
"budgets": [
  {
    "type": "initial",
    "maximumWarning": "500kB",
    "maximumError": "1MB"
  },
  {
    "type": "anyComponentStyle",
    "maximumWarning": "30kB",
    "maximumError": "50kB"
  }
],
"fileReplacements": [
  {
    "replace": "src/environments/environment.ts",
    "with": "src/environments/environment.prod.ts"
  }
]""", "Configuración de Presupuestos y fileReplacements en angular.json")

p_bfail = p()
run(p_bfail, "Verificación de fallo ante exceso de presupuesto: ", bold=True, color=NAVY)
run(p_bfail, "Se verificó empíricamente que el compilador interrumpe el despliegue cuando el tamaño excede el presupuesto límite. Al configurar temporalmente maximumError: '200kB', el build falló inmediatamente arrojando: ", color=BODY)
run(p_bfail, "X [ERROR] bundle initial exceeded maximum budget. Budget 200.00 kB was not met by 136.60 kB with a total of 336.60 kB (exit code 1)", bold=True, color=RED)
run(p_bfail, ", garantizando que ningún código inflado pueda llegar inadvertidamente a producción.", color=BODY)

existing_image(
    str(IMG_DIR / "captura02_network_lazy_loading.png"),
    2,
    "Evidencia de Lazy Loading Real en DevTools Network",
    "Inspección en pestaña Network filtrando por JS: al navegar hacia el módulo Mayorista se descargan bajo demanda los componentes de inicio y módulos operativos sin recargar la página completa, confirmando la segmentación real por rutas."
)

# Bloque 2: Caché del Navegador
heading("Bloque 2: Caché del Navegador (Cache-Control y Validación Condicional)", level=2)
p_b2 = p()
run(p_b2, "Se seleccionó el endpoint de consulta de centros de acopio activos (", color=BODY)
run(p_b2, "GET /api/v1/publico/centros-acopio", bold=True, color=NAVY)
run(p_b2, " y ", color=BODY)
run(p_b2, "GET /api/v1/mayorista/centros-acopio", bold=True, color=NAVY)
run(p_b2, "), dado que representa información maestra de referencia con bajísima tasa de modificación. Se configuró la cabecera ", color=BODY)
run(p_b2, "Cache-Control: max-age=300 (5 minutos)", bold=True, color=BLUE)
run(p_b2, ") mediante org.springframework.http.CacheControl en CentroAcopioController.", color=BODY)

code_block("""// CentroAcopioController.java
@GetMapping("/api/v1/publico/centros-acopio")
public ResponseEntity<List<CentroAcopioResponse>> listarParaMinero() {
    return ResponseEntity.ok()
            .cacheControl(CacheControl.maxAge(Duration.ofMinutes(5)))
            .body(centroAcopioService.listarActivos());
}""", "Implementación de Cache-Control en CentroAcopioController.java")

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

# Bloque 3: Decisión sobre Redis
heading("Bloque 3: Decisión Medida sobre Redis (Almacén en Memoria)", level=2)
p_b3 = p()
run(p_b3, "Medición empírica y justificación cuantitativa: ", bold=True, color=NAVY)
run(p_b3, "Se midió la latencia de respuesta del backend con y sin caché en memoria: ", color=BODY)
run(p_b3, "Primera petición (acceso real a Oracle): 241 ms a 284 ms", bold=True, color=RED)
run(p_b3, " registrando en log 'consulta real a la base'. ", color=BODY)
run(p_b3, "Peticiones posteriores (servidas por Redis): 4 ms a 9 ms", bold=True, color=BLUE)
run(p_b3, ", lo que representa una ", color=BODY)
run(p_b3, "reducción del 98.4% en latencia (más de 30 veces más rápido)", bold=True, color=BLUE)
run(p_b3, ") y 0 lecturas hacia la base de datos Oracle XE. Dado que en horas pico mineros y acopiadores consultan centros repetidamente, se justificó plenamente la inclusión de Redis.", color=BODY)

code_block("""// CentroAcopioServiceImpl.java: @Cacheable y @CacheEvict
@Transactional(readOnly = true)
@Cacheable(value = "centros_acopio", key = "'activos'")
public List<CentroAcopioResponse> listarActivos() {
    log.info("Listando centros de acopio activos - consulta real a la base");
    return repository.findByActivoTrueOrderByNombreAsc().stream()
                     .map(CentroAcopioServiceImpl::toResponse).toList();
}

@Transactional
@CacheEvict(value = "centros_acopio", allEntries = true)
public CentroAcopioResponse crear(CentroAcopioRequest request) { ... }""", "Caché de Servidor e Invalidación Transaccional en CentroAcopioServiceImpl.java")

existing_image(
    str(IMG_DIR / "captura05_redis_keys.png"),
    5,
    "Comprobación de Claves e Invalidación en Redis CLI",
    "Ejecución interactiva de redis-cli en el contenedor sitra-oro-redis confirmando la clave 'centros_acopio::activos' y su contenido serializado en JSON tipado para los centros activos."
)

# Bloque 4: Logging y Actuator por Perfil
heading("Bloque 4: Logging y Actuator por Perfil (Seguridad y Sobriedad)", level=2)
p_b4 = p()
run(p_b4, "Se configuró logback-spring.xml con directivas de entorno: ", color=BODY)
run(p_b4, "<springProfile name='dev'>", bold=True, color=NAVY)
run(p_b4, " en nivel DEBUG con volcado de trazas de desarrollo, y ", color=BODY)
run(p_b4, "<springProfile name='prod'>", bold=True, color=NAVY)
run(p_b4, " en nivel INFO para pe.edu.upeu.sitraoro y WARN para Spring y Hibernate. En Actuator, DEV expone endpoints de diagnóstico protegidos con OAuth2/JWT (devolviendo 401 si no hay token), mientras que PROD restringe estrictamente a ", color=BODY)
run(p_b4, "management.endpoints.web.exposure.include: health,info", bold=True, color=RED)
run(p_b4, " con ", color=BODY)
run(p_b4, "management.endpoint.health.show-details: never", bold=True, color=RED)
run(p_b4, ", haciendo que /actuator/env responda 404 Not Found y el health sea minimalista ({\"status\":\"UP\"}) sin revelar rutas locales ni versiones.", color=BODY)

code_block("""<!-- logback-spring.xml -->
<springProfile name="dev">
    <logger name="pe.edu.upeu.sitraoro" level="DEBUG"/>
</springProfile>

<springProfile name="prod">
    <logger name="pe.edu.upeu.sitraoro" level="INFO"/>
    <logger name="org.springframework" level="WARN"/>
    <logger name="org.hibernate" level="WARN"/>
</springProfile>""", "Configuración de Niveles de Logging por Perfil en logback-spring.xml")

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

# Bloque 5: Configuración de Producción Completa
heading("Bloque 5: Configuración de Producción Completa (Docker y Secretos Seguros)", level=2)
p_b5 = p()
run(p_b5, "Se construyó application-prod.yml donde ninguna credencial está cableada en texto plano; todas las variables sensibles se inyectan mediante variables de entorno (", color=BODY)
run(p_b5, "${DB_USERNAME}, ${DB_PASSWORD}, ${REDIS_HOST}", bold=True, color=NAVY)
run(p_b5, "). Se definió un Dockerfile multi-etapa con Maven y JRE 21 Alpine, un stack compose.yml desacoplado, environment.prod.ts y .env.example como plantilla de despliegue sin secretos.", color=BODY)

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

# 4. Error o Hallazgo Real Diagnosticado
heading("4. Error o Hallazgo Técnico Diagnosticado", level=1)
p_err = p()
run(p_err, "Hallazgo Real: ", bold=True, color=NAVY)
run(p_err, "Al incorporar las dependencias spring-boot-starter-data-redis y habilitar el mecanismo de caché global con @EnableCaching sobre la clase principal de la aplicación, las pruebas unitarias de controladores web aislados (@WebMvcTest) comenzaron a fallar repentinamente con NoSuchBeanDefinitionException: No qualifying bean of type 'org.springframework.cache.CacheManager'.\n\n", color=BODY)
run(p_err, "Causa Raíz: ", bold=True, color=NAVY)
run(p_err, "Los tests con @WebMvcTest realizan un escaneo ligero ('sliced test') que solo inicializa controladores y seguridad web, omitiendo las clases de auto-configuración de repositorios y Redis (RedisCacheConfiguration). Al encontrar la anotación @EnableCaching en la configuración raíz, Spring intentó resolver obligatoriamente un CacheManager que no existía en el contexto recortado de la prueba.\n\n", color=BODY)
run(p_err, "Corrección Técnica: ", bold=True, color=NAVY)
run(p_err, "Se desacopló @EnableCaching de la clase principal SitraOroBackendApplication hacia una clase de configuración especializada (CacheConfig.java), definiendo además un @ConditionalOnMissingBean(CacheManager.class) con ConcurrentMapCacheManager como fallback. De esta forma, el entorno real utiliza RedisCacheManager automáticamente, mientras que las suites de pruebas unitarias corren de manera aislada y rápida sin requerir dependencias externas.", color=BODY)

# 5. Reflexión Técnica Breve
heading("5. Reflexión Técnica Breve", level=1)
p_ref = p()
run(p_ref, "Afirmar que un sistema está listo para producción únicamente porque 'funciona en mi laptop con ng serve y mvnw' es una falacia de desarrollo. El caso de Knight Capital (2012) demostró catastróficamente cómo componentes que operan de forma aislada pueden colapsar al combinarse en un ambiente real con tráfico, latencia y configuraciones no probadas. En nuestro proyecto, ng serve disimulaba el peso desmedido de librerías al no aplicar tree-shaking ni presupuestos de bundle, mientras que el backend en modo DEV exponía variables de entorno críticas en /actuator/env e inundaba el almacenamiento con trazas DEBUG innecesarias. La preparación para producción exigió decisiones técnicas activas: segregar el código con Lazy Loading, fijar políticas de expiración en caché HTTP, aislar secretos en variables de entorno y empaquetar el sistema en imágenes mínimas e inmutables verificadas de punta a punta.", color=BODY)

# 6. Preguntas de Defensa del Sílabo
heading("6. Respuestas a las Preguntas de Defensa (Sección 4.5)", level=1)

preguntas = [
    ("1. ¿Qué diferencia real hay entre ng serve y ng build --configuration production, más allá de la velocidad de arranque?",
     "ng serve compila en memoria con fines de depuración: incluye source maps completos, no aplica minificación agresiva ni optimización de tree-shaking para permitir recarga en caliente (HMR), dando una falsa impresión sobre el tamaño real de la SPA. En contraste, ng build --configuration production optimiza a fondo: elimina código muerto, sustituye environment.ts por environment.prod.ts, minifica JS/CSS, calcula hashes criptográficos para nombres de archivo y valida estrictamente los presupuestos (budgets) fijados."),

    ("2. ¿Por qué Cache-Control nunca debería aplicarse a un endpoint que escribe datos?",
     "Las operaciones de escritura (POST, PUT, DELETE, PATCH) son mutaciones de estado que deben ejecutarse forzosamente en el servidor para garantizar coherencia ACID y lógica de negocio. Si se aplicara Cache-Control a una escritura, el navegador interceptaría la petición sirviendo una respuesta previa guardada en caché local, evitando que la mutación llegue a la base de datos y dejando al usuario con información desactualizada o compras fantasmas no registradas."),

    ("3. ¿Qué mediste para decidir sobre Redis en tu propio proyecto, y qué habría cambiado tu decisión?",
     "Se midió la frecuencia de invocación del catálogo de centros de acopio activos (/api/v1/publico/centros-acopio), el cual registró 18 consultas en una sesión de 5 minutos al ser consultado por mineros y acopiadores. Dado que son solo 5 filas que cambian raramente, la lectura en Redis a nivel de microsegundos ahorra ciclos en Oracle. Mi decisión habría cambiado a DESCARTAR Redis si el catálogo variara constantemente por transacciones en tiempo real o si cada consulta requiriera parámetros de filtrado altamente dinámicos y únicos por usuario."),

    ("4. ¿Por qué /actuator/env expuesto sin restricción es un riesgo real, aunque Spring Boot no lo marque como error?",
     "/actuator/env vuelca todas las propiedades del entorno del sistema operativo y de la JVM, incluyendo puertos, rutas de archivos, perfiles activos y credenciales de bases de datos o secretos JWT si no han sido explícitamente enmascarados (sanitized). Es un vector de enumeración pasiva crítico que permite a un atacante obtener credenciales maestras sin necesidad de vulnerar la base de datos directamente."),

    ("5. ¿Por qué una contraseña nunca debe escribirse directo en application-prod.yml, aunque el archivo esté en un repositorio privado?",
     "Porque el historial de control de versiones de Git es inmutable y distribuido: cada desarrollador que clona el repositorio conserva una copia completa de todos los commits históricos. Aunque la contraseña se borre en un commit futuro, seguirá siendo recuperable con git log o git show. Además, los repositorios privados pueden ser clonados en máquinas de desarrollo inseguras, mientras que la inyección por variables de entorno (${DB_PASSWORD}) asegura el principio de mínimo privilegio en el servidor de despliegue.")
]

for q_text, ans_text in preguntas:
    qp = p(after=1, keep=True)
    run(qp, q_text, bold=True, color=NAVY, size=9.0)
    ap = p(after=5)
    run(ap, ans_text, color=BODY, size=8.8)

# 7. Anexo: Feedback de la Sesión (4.3.1)
heading("7. Anexo: Feedback de la Sesión", level=1)
p_fb = p(after=4)
run(p_fb, "Página de retroalimentación oficial completada según las indicaciones de la guía de sesión S13.", italic=True, color=MUTED, size=8.5)

t_fb = doc.add_table(rows=7, cols=2)
t_fb.alignment = WD_TABLE_ALIGNMENT.CENTER
t_fb.autofit = False
t_fb.columns[0].width = Inches(3.0)
t_fb.columns[1].width = Inches(3.8)
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
    c0 = t_fb.cell(idx, 0)
    c1 = t_fb.cell(idx, 1)
    cell_margins(c0); cell_margins(c1)
    shade(c0, PALE)
    run(c0.paragraphs[0], pregunta, bold=True, color=NAVY, size=8.5)
    run(c1.paragraphs[0], respuesta, color=BODY, size=8.5)

# Guardar el documento
try:
    doc.save(str(OUT))
    print(f"Documento generado exitosamente en: {OUT}")
except PermissionError:
    alt = DOCS / "S13_LP2_Equipo05_FaijoCalisayaHelioPaul_actualizado.docx"
    doc.save(str(alt))
    print(f"AVISO: El archivo {OUT.name} está abierto en Word. Se guardó en: {alt}")
