# -*- coding: utf-8 -*-
"""
Script generador del informe oficial S11 LP2 para Helio Paul Faijo Calisaya.
Estructura según el sílabo oficial S11 (4.3.1 y 4.4).
"""
import sys
import os
from pathlib import Path
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

ROOT = Path(r"E:\Cursos_Ciclo_4\Lenguaje de Programación II\Sitra_oro")
DOCS = ROOT / "docs"
OUT = DOCS / "S11_LP2_Equipo05_FaijoCalisayaHelioPaul.docx"
IMG_DIR = DOCS / "img_S11_FaijoCalisaya"

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
    else:
        image_box(number, title, explanation)
        return
    cp = p(after=6, before=2, keep=True)
    run(cp, "Evidencia técnica: ", bold=True, color=NAVY, size=8.5)
    run(cp, explanation, color=BODY, size=8.5)

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

kicker("Lenguaje de Programación II · Sesión S11 · Actividad Autónoma")
title_p = doc.add_paragraph("INFORME DE EVIDENCIAS TÉCNICAS — SESIÓN 11", style='Title')
title_p.paragraph_format.space_after = Pt(2)

sub_p = p(after=8)
run(sub_p, "Seguridad Frontend SPA: Autenticación con Keycloak OIDC (Authorization Code + PKCE), Guards RBAC e Interceptor con Refresco", italic=True, color=MUTED, size=10)

# Tabla de Datos del Estudiante (Requerimiento 4.3.1)
heading("1. Datos del Estudiante", level=1)
t_datos = doc.add_table(rows=5, cols=2)
t_datos.alignment = WD_TABLE_ALIGNMENT.CENTER
t_datos.autofit = False
t_datos.columns[0].width = Inches(2.2)
t_datos.columns[1].width = Inches(4.6)
table_borders(t_datos)

datos_items = [
    ("Nombre del estudiante:", "Faijo Calisaya Helio Paul (Código: 202110292)"),
    ("Equipo y Módulo:", "Equipo 05 — Módulo Mayorista (Centros de Acopio y Liquidaciones)"),
    ("Sesión Evaluada:", "S11 - Seguridad Frontend: Autenticación con Keycloak y Rutas Protegidas"),
    ("Rol o aporte realizado:", "Implementación integral del flujo Authorization Code + PKCE en Angular 19, AuthService con tokens en memoria, interceptor HTTP con refresco transparente ante 401 y guards de navegación RBAC."),
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

# Sección 2: Alcance y Propósito
heading("2. Alcance y Propósito de la Actividad (S11)", level=1)
p_alc = p()
run(p_alc, "El presente informe demuestra la integración de la Single Page Application (SPA) SITRA-ORO (desarrollada con Angular 19 Standalone) contra un Identity Provider (IdP) OpenID Connect real — ", color=BODY)
run(p_alc, "Keycloak 26", bold=True, color=NAVY)
run(p_alc, " en el Realm propio ", color=BODY)
run(p_alc, "Sitra_oro", bold=True, color=GOLD)
run(p_alc, " (puerto 38081). Se implementó el estándar de seguridad industrial ", color=BODY)
run(p_alc, "Authorization Code Flow con PKCE obligatorio (RFC 7636)", bold=True, color=NAVY)
run(p_alc, ", descartando el intercambio de credenciales directas (ROPC) y asegurando que las credenciales criptográficas (accessToken y refreshToken) ", color=BODY)
run(p_alc, "residan en memoria volátil de Angular Signals, sin persistirse en localStorage", bold=True, color=RED)
run(p_alc, ", mitigando de raíz vectores de robo de tokens tipo Magecart/XSS.", color=BODY)

# Sección 3: Evidencias Técnicas (Los 5 bloques de la rúbrica 4.3.1 y 4.6)
heading("3. Evidencia Técnica (Bloques de la Rúbrica de Evaluación)", level=1)

# Bloque 1: Login con Authorization Code + PKCE
heading("Bloque 1: Login con Authorization Code + PKCE (Keycloak Real)", level=2)
p_b1 = p()
run(p_b1, "El cliente público ", color=BODY)
run(p_b1, "sitra-oro-frontend", bold=True, color=NAVY)
run(p_b1, " fue configurado en Keycloak con Client Authentication desactivado (cliente público para SPA), ", color=BODY)
run(p_b1, "Direct Access Grants DESACTIVADO", bold=True, color=RED)
run(p_b1, " y ", color=BODY)
run(p_b1, "Proof Key for Code Exchange (PKCE) establecido obligatoriamente en S256", bold=True, color=NAVY)
run(p_b1, ". El flujo inicia en la SPA generando en tiempo de ejecución un code_verifier criptográfico y su hash SHA-256 (code_challenge), redirigiendo a Keycloak. Tras la autenticación, Keycloak redirige a /auth/callback retornando el code y state, donde la SPA efectúa el intercambio por tokens en memoria.", color=BODY)

existing_image(
    str(IMG_DIR / "fig1_keycloak_pkce_client.png"),
    1,
    "Configuración del Cliente en Keycloak (PKCE S256 Obligatorio y Direct Access Grants OFF)",
    "Consola de administración de Keycloak (puerto 38081) -> Realm Sitra_oro -> Clients -> sitra-oro-frontend -> Pestaña Capability config: Standard Flow activo, Direct Access Grants desactivado, y Proof Key for Code Exchange (PKCE) en S256 obligatorio (reloj y usuario visibles)."
)

existing_image(
    str(IMG_DIR / "fig2_login_pkce_completado.png"),
    2,
    "Login Real Completado de Punta a Punta con Redirección OIDC y PKCE",
    "Flujo de autenticación completado desde http://localhost:4200/ingresar hacia Keycloak y retorno exitoso mediante Authorization Code + PKCE. La SPA decodifica el token en memoria, reconoce la autoridad de rol G1_MAYORISTA y proyecta el panel de Supervisión Mayorista y Planta en /mayorista (reloj y usuario visibles)."
)

# Bloque 2: Guards de autenticación y rol
heading("Bloque 2: Guards de Autenticación y Rol (rolGuard)", level=2)
p_b2 = p()
run(p_b2, "El guard funcional ", color=BODY)
run(p_b2, "rolGuard (CanActivateFn)", bold=True, color=NAVY)
run(p_b2, " intercepta cada transición de ruta. Se verificaron los dos comportamientos de seguridad perimetral exigidos: (1) Intento de navegación sin sesión hacia una ruta privada redirige de inmediato al login de Keycloak preservando el destino original; y (2) Intento de acceso con rol insuficiente (ej. usuario Acopiador intentando acceder a /mayorista) es bloqueado y redirigido a la vista formal ", color=BODY)
run(p_b2, "/sin-acceso (HTTP 403 Forbidden)", bold=True, color=RED)
run(p_b2, ", evitando bloqueos en silencio o navegación rota.", color=BODY)

existing_image(
    str(IMG_DIR / "fig3_guard_sin_sesion_login.png"),
    3,
    "Intento de Acceso a Ruta Protegida sin Sesión: Redirección Automática a Keycloak",
    "Intento de navegación directa hacia http://localhost:4200/mayorista sin token en memoria. El guard funcional rolGuard intercepta la ruta protegida y redirige automáticamente hacia el endpoint de autorización de Keycloak (/protocol/openid-connect/auth) con PKCE, impidiendo el renderizado no autorizado (reloj y usuario visibles)."
)

existing_image(
    str(IMG_DIR / "fig4_guard_sin_acceso_403.png"),
    4,
    "Violación RBAC Detectada: Redirección Controlada a /sin-acceso (403)",
    "Usuario autenticado con rol G2_ACOPIADOR intentando forzar el ingreso por URL a la ruta de mayorista. rolGuard evalúa route.data['roles'], detecta la discrepancia de privilegios y redirige de inmediato a /sin-acceso con aviso formal en pantalla (reloj y usuario visibles)."
)

# Bloque 3: Interceptor: token y refresco
heading("Bloque 3: Interceptor HTTP — Inyección Bearer y Refresco ante 401", level=2)
p_b3 = p()
run(p_b3, "El interceptor funcional ", color=BODY)
run(p_b3, "authInterceptor", bold=True, color=NAVY)
run(p_b3, " añade automáticamente la cabecera ", color=BODY)
run(p_b3, "Authorization: Bearer <accessToken>", bold=True, color=NAVY)
run(p_b3, " a cada petición dirigida al Resource Server Spring Boot (http://localhost:8081). Omite URLs externas y llamadas a Keycloak para evitar preflights CORS innecesarios. Ante una respuesta HTTP 401 (token expirado), el interceptor captura el error, suspende la cola de peticiones y dispara de forma transparente una petición POST a Keycloak con ", color=BODY)
run(p_b3, "grant_type=refresh_token", bold=True, color=GOLD)
run(p_b3, ", reintentando la petición original con el nuevo token emitido sin obligar al usuario a iniciar sesión de nuevo.", color=BODY)

existing_image(
    str(IMG_DIR / "fig2_interceptor_centros_200.png"),
    5,
    "Consumo de Recurso Protegido con Cabecera Authorization: Bearer (HTTP 200 OK)",
    "Pestaña Network de DevTools al cargar /mayorista/centros. Se constata la cabecera 'Authorization: Bearer eyJhbGci...' inyectada automáticamente en la petición GET /api/v1/mayorista/centros-acopio, retornando HTTP 200 OK y desplegando los centros activos (reloj y usuario visibles)."
)

existing_image(
    str(IMG_DIR / "fig6_interceptor_refresco_401.png"),
    6,
    "Interceptor HTTP: Detección de 401 Unauthorized y Refresco Automático Transparente",
    "Pestaña Network (Filtro XHR) de DevTools. Se constatan las peticiones iniciales rechazadas con HTTP 401 Unauthorized (token expirado a los 30 s), el subsecuente disparo automático de peticiones POST a http://localhost:38081/realms/Sitra_oro/protocol/openid-connect/token con 'grant_type=refresh_token' (HTTP 200 OK), y el reintento exitoso inmediato de las consultas a centros-acopio y colores con HTTP 200 OK sin intervención del usuario (reloj y usuario visibles)."
)

# Bloque 4: Menú por rol
heading("Bloque 4: Menú Dinámico y Navegación Adaptativa por Rol", level=2)
p_b4 = p()
run(p_b4, "El componente ", color=BODY)
run(p_b4, "Layout", bold=True, color=NAVY)
run(p_b4, " consume el signal reactivo ", color=BODY)
run(p_b4, "authService.rol()", bold=True, color=BLUE)
run(p_b4, " derivado de ", color=BODY)
run(p_b4, "realm_access.roles", bold=True, color=NAVY)
run(p_b4, ". La barra de navegación lateral proyecta únicamente las opciones operativas asignadas al perfil activo: el Acopiador visualiza exclusivamente compras, recepción y mineros; mientras que el Mayorista accede a control de planta, liquidaciones y consolidación de exportación.", color=BODY)

existing_image(
    str(IMG_DIR / "fig3_menu_rol_acopiador.png"),
    7,
    "Menú Adaptado al Rol Operativo Acopiador (G2_ACOPIADOR)",
    "Barra de navegación de la SPA mostrando únicamente los enlaces autorizados para acopiador.demo1 (Resumen, Compras de oro, Mineros y Cuentas por aprobar), ocultando completamente los módulos estratégicos del Mayorista bajo el principio de mínimo privilegio (reloj y usuario visibles)."
)

# Bloque 5: Matriz de accesos
heading("Bloque 5: Matriz de Control de Acceso Frontend (Verificada)", level=2)
p_mat = p()
run(p_mat, "Matriz consolidada de rutas frontend en Angular 19, especificando el rol asignado, guard activo, comportamiento autorizado y respuesta ante accesos indebidos:", color=BODY)

headers = ["Ruta Frontend", "Rol Permitido", "Guard Activo", "Comportamiento Autorizado", "Respuesta No Autorizada"]
rows = [
    ["/auth/callback", "Público", "Ninguno", "Intercambia code por token y redirige a panel.", "Muestra badge de error si falta el code."],
    ["/ingresar", "Público", "Ninguno", "Redirige automáticamente a Keycloak OIDC.", "N/A (Público)"],
    ["/mayorista", "G1_MAYORISTA", "rolGuard", "Abre dashboard de control de planta y compras.", "401 -> Keycloak / 403 -> /sin-acceso"],
    ["/mayorista/centros", "G1_MAYORISTA", "rolGuard", "Despliega tabla de centros de acopio y cuentas.", "Redirige a /sin-acceso si rol != MAYORISTA"],
    ["/mayorista/liquidaciones", "G1_MAYORISTA", "rolGuard", "Emite liquidaciones formales de compra de oro.", "Redirige a /sin-acceso si no es mayorista"],
    ["/acopio", "G2_ACOPIADOR", "rolGuard", "Abre panel operativo de pesaje y compras.", "401 -> Keycloak / 403 -> /sin-acceso"],
    ["/acopio/mineros", "G2_ACOPIADOR", "rolGuard", "Gestión de empadronamiento de mineros.", "Redirige a /sin-acceso si intenta Mayorista"],
    ["/acopio/mineros/nuevo", "G2_ACOPIADOR", "rolGuard (Escritura)", "Formulario de alta de minero artesanal.", "Redirige a /sin-acceso si no tiene rol G2"],
    ["/sin-acceso", "Cualquiera", "Ninguno", "Proyecta alerta de violación de privilegios RBAC.", "Ofrece botón de retorno / autenticación"]
]

t_mat = doc.add_table(rows=1, cols=len(headers))
t_mat.alignment = WD_TABLE_ALIGNMENT.CENTER
t_mat.autofit = False
widths = [1.3, 1.1, 1.2, 1.7, 1.5]
for col, w in zip(t_mat.columns, widths): col.width = Inches(w)
table_borders(t_mat)

for i, h in enumerate(headers):
    c = t_mat.rows[0].cells[i]
    shade(c, NAVY); cell_margins(c, 70, 80, 70, 80)
    run(c.paragraphs[0], h, bold=True, color=WHITE, size=8.0)

for ri, r_data in enumerate(rows):
    cells = t_mat.add_row().cells
    for i, val in enumerate(r_data):
        c = cells[i]; cell_margins(c, 60, 80, 60, 80)
        if ri % 2 == 1: shade(c, 'F8FAFC')
        c.text = ''
        run(c.paragraphs[0], val, color=BODY, size=8.0)

p(after=8)

# Sección 4: Implementación Técnica en Código Fuente
heading("4. Implementación Técnica en Código Fuente (Angular 19)", level=1)
p_cod = p()
run(p_cod, "A continuación se presentan los artefactos centrales construidos en la arquitectura Angular 19 Standalone:", color=BODY)

# 4.1 PKCE
heading("4.1 Generación Criptográfica de PKCE y State (pkce.ts)", level=2)
code_pkce = """export interface PkcePair {
  codeVerifier: string;
  codeChallenge: string;
  state: string;
}

export async function generarPkce(): Promise<PkcePair> {
  const verifierBytes = new Uint8Array(32);
  crypto.getRandomValues(verifierBytes);
  const codeVerifier = base64UrlEncode(verifierBytes.buffer);

  const encoder = new TextEncoder();
  const verifierBuffer = encoder.encode(codeVerifier);
  const hash = await crypto.subtle.digest('SHA-256', verifierBuffer);
  const codeChallenge = base64UrlEncode(hash);

  const stateBytes = new Uint8Array(16);
  crypto.getRandomValues(stateBytes);
  const state = base64UrlEncode(stateBytes.buffer);

  return { codeVerifier, codeChallenge, state };
}"""
code_block(code_pkce, "src/app/core/auth/pkce.ts — Generación de code_verifier, code_challenge (SHA-256) y state")

# 4.2 AuthService
heading("4.2 Servicio de Autenticación con Tokens en Memoria y Refresco Único (auth.service.ts)", level=2)
code_auth = """@Injectable({ providedIn: 'root' })
export class AuthService {
  // Tokens viven ÚNICAMENTE en memoria volátil de Signals (Cero almacenamiento en disco)
  readonly token = signal<string | null>(null);
  readonly refreshToken = signal<string | null>(null);
  private promesaRefrescoEnCurso: Promise<string | null> | null = null;

  readonly usuario = computed(() => decodificarJwtPayload(this.token()));
  readonly rol = computed(() => this.usuario()?.rolSitra);
  readonly autenticado = computed(() => !!this.token() && typeof this.usuario()?.exp === 'number' && this.usuario()!.exp * 1000 > Date.now());

  async iniciarLogin(destino?: string): Promise<void> {
    const { codeVerifier, codeChallenge, state } = await generarPkce();
    sessionStorage.setItem('sitraoro.pkce_verifier', codeVerifier);
    sessionStorage.setItem('sitraoro.oauth_state', state);
    if (destino) sessionStorage.setItem('sitraoro.destino_pendiente', destino);

    const params = new URLSearchParams({
      client_id: environment.keycloak.clientId,
      response_type: 'code',
      redirect_uri: environment.keycloak.redirectUri,
      scope: environment.keycloak.scope,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      state: state
    });
    window.location.href = `${environment.keycloak.issuer}/protocol/openid-connect/auth?${params}`;
  }

  async completarLogin(code: string, state?: string | null): Promise<string> {
    const stateEsperado = sessionStorage.getItem('sitraoro.oauth_state');
    sessionStorage.removeItem('sitraoro.oauth_state');
    if (!stateEsperado || !state || stateEsperado !== state) {
      this.limpiar();
      throw new Error('Estado OAuth2 inválido o posible intento de CSRF: state no coincide o ausente');
    }
    const codeVerifier = sessionStorage.getItem('sitraoro.pkce_verifier');
    sessionStorage.removeItem('sitraoro.pkce_verifier');
    if (!codeVerifier) {
      this.limpiar();
      throw new Error('Código verifier de PKCE no encontrado en el contexto de sesión');
    }

    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: environment.keycloak.clientId,
      redirect_uri: environment.keycloak.redirectUri,
      code,
      code_verifier: codeVerifier
    });
    const resp = await fetch(`${environment.keycloak.issuer}/protocol/openid-connect/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString()
    });
    if (!resp.ok) {
      this.limpiar();
      let detalle = `${resp.status} ${resp.statusText}`;
      try { const err = await resp.json(); detalle = err.error_description || err.error || detalle; } catch {}
      throw new Error(`Keycloak rechazó el intercambio de código PKCE: ${detalle}`);
    }
    const data = await resp.json();
    this.guardarTokens(data.access_token, data.refresh_token);
    return sessionStorage.getItem('sitraoro.destino_pendiente') || this.rutaPorDefectoSegunRol();
  }

  async refrescar(destino?: string): Promise<string | null> {
    const refresh = this.refreshToken();
    if (!refresh) { this.limpiar(); return null; }
    if (this.promesaRefrescoEnCurso) return this.promesaRefrescoEnCurso;

    this.promesaRefrescoEnCurso = (async () => {
      try {
        const body = new URLSearchParams({ grant_type: 'refresh_token', client_id: environment.keycloak.clientId, refresh_token: refresh });
        const resp = await fetch(`${environment.keycloak.issuer}/protocol/openid-connect/token`, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body.toString() });
        if (!resp.ok) { this.limpiar(); if (destino) void this.iniciarLogin(destino); return null; }
        const data = await resp.json();
        this.guardarTokens(data.access_token, data.refresh_token ?? refresh);
        return data.access_token as string;
      } catch { this.limpiar(); if (destino) void this.iniciarLogin(destino); return null; }
      finally { this.promesaRefrescoEnCurso = null; }
    })();
    return this.promesaRefrescoEnCurso;
  }
}"""
code_block(code_auth, "src/app/core/auth/auth.service.ts — PKCE, estado estricto, tokens en memoria y refresco compartido")

# 4.3 Guard de Rol
heading("4.3 Guard Funcional de Rutas RBAC y Redirección Cliente (rol.guard.ts)", level=2)
code_guard = """export const rolGuard: CanActivateFn = async (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // 1. Sin sesión: intenta refrescar o redirige al login de Keycloak preservando URL de destino
  if (!auth.autenticado()) {
    if (auth.refreshToken()) {
      const refreshed = await auth.refrescar(state.url);
      if (!refreshed) { await auth.iniciarLogin(state.url); return false; }
    } else {
      await auth.iniciarLogin(state.url); return false;
    }
  }

  // 2. Con sesión y rol autorizado: permite navegación
  const rolesRequeridos = (route.data?.['roles'] as RolSitra[] | undefined) ?? [];
  if (rolesRequeridos.length === 0 || auth.puedeEntrar(rolesRequeridos)) {
    return true;
  }

  // 3. Con sesión pero rol insuficiente: redirección cliente controlada hacia /sin-acceso
  return router.parseUrl('/sin-acceso');
};"""
code_block(code_guard, "src/app/core/auth/guards/rol.guard.ts — Control perimetral RBAC con preservación de destino")

# 4.4 Interceptor con Refresco
heading("4.4 Interceptor HTTP con Reintento Único y Control de Bucles (auth.interceptor.ts)", level=2)
code_interceptor = """export const YA_REINTENTADO = new HttpContextToken<boolean>(() => false);

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);

  // Omitir Keycloak y APIs externas (Bloomberg, RENIEC)
  if (request.url.includes('/protocol/openid-connect') || request.url.includes(':38081')) return next(request);
  const esResourceServer = request.url.startsWith('/') || request.url.startsWith(environment.apiBaseUrl);
  if (!esResourceServer) return next(request);

  const token = auth.token();
  const reqConToken = token ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : request;

  return next(reqConToken).pipe(
    catchError((error: unknown) => {
      // 403 Forbidden NUNCA refresca (es una denegación RBAC del servidor, no de vigencia de token)
      if (error instanceof HttpErrorResponse && error.status === 401) {
        if (request.context.get(YA_REINTENTADO)) {
          void auth.iniciarLogin(window.location.pathname);
          return throwError(() => error);
        }
        return from(auth.refrescar(window.location.pathname)).pipe(
          switchMap((nuevoToken) => {
            if (nuevoToken) {
              const retryReq = request.clone({
                context: request.context.set(YA_REINTENTADO, true),
                setHeaders: { Authorization: `Bearer ${nuevoToken}` }
              });
              return next(retryReq);
            }
            void auth.iniciarLogin(window.location.pathname);
            return throwError(() => error);
          }),
          catchError((err) => { void auth.iniciarLogin(window.location.pathname); return throwError(() => err); })
        );
      }
      return throwError(() => error);
    })
  );
};"""
code_block(code_interceptor, "src/app/core/auth/interceptors/auth.interceptor.ts — Inyección Bearer, HttpContextToken y auto-refresco")

# 4.5 Layout
heading("4.5 Layout Dinámico con Reloj en Vivo y Menú Derivado de rol() (layout.ts)", level=2)
code_layout = """export class Layout implements OnInit, OnDestroy {
  private readonly auth = inject(AuthService);
  protected readonly fechaHora = signal<string>(this.obtenerFechaHora());
  private relojTimer: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    this.relojTimer = setInterval(() => this.fechaHora.set(this.obtenerFechaHora()), 1000);
  }
  ngOnDestroy(): void { if (this.relojTimer) clearInterval(this.relojTimer); }

  private obtenerFechaHora(): string {
    return new Date().toLocaleString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  }

  protected readonly navegacion = computed(() => {
    const rol = this.auth.rol();
    if (rol === 'G2_ACOPIADOR') return [
      { ruta: '/acopio', texto: 'Resumen' }, { ruta: '/acopio/operaciones', texto: 'Compras de oro' },
      { ruta: '/acopio/mineros', texto: 'Mineros' }, { ruta: '/acopio/solicitudes', texto: 'Cuentas por aprobar' }
    ];
    if (rol === 'G1_MAYORISTA') return [
      { ruta: '/mayorista', texto: 'Resumen' }, { ruta: '/mayorista/recepcion', texto: 'Compra al acopiador' },
      { ruta: '/mayorista/liquidaciones', texto: 'Liquidaciones' }, { ruta: '/mayorista/consolidacion', texto: 'Lotes para exportación' },
      { ruta: '/mayorista/centros', texto: 'Centros y cuentas' }
    ];
    return [];
  });
}"""
code_block(code_layout, "src/app/core/layout/layout.ts — Proyección estricta de navegación por rol y reloj de sistema en vivo")

# 4.6 Pruebas Unitarias
heading("4.6 Pruebas Unitarias Automatizadas (Vitest — 10/10 Pasadas en 34 ms)", level=2)
code_tests = """✓ src/app/core/auth/auth.spec.ts (10 tests) 34ms
  ✓ 1. Pruebas Unitarias - generarPkce (RFC 7636) (2)
    ✓ debe generar un par PKCE válido con codeVerifier, codeChallenge y state
    ✓ debe generar valores criptográficamente distintos en cada invocación
  ✓ 2. Pruebas Unitarias - rolGuard (RBAC Functional Guard) (3)
    ✓ Caso 1 (Sin sesión): debe llamar a iniciarLogin con la URL de destino y retornar false
    ✓ Caso 2 (Rol insuficiente): usuario autenticado sin el rol requerido es redirigido a /sin-acceso
    ✓ Caso 3 (Rol correcto): usuario autenticado con rol G1_MAYORISTA accede exitosamente
  ✓ 3. Pruebas Unitarias - authInterceptor (HTTP Inyección y Refresco) (5)
    ✓ Caso 1 (Bearer): adjunta Authorization Bearer a peticiones del backend :8081 y omite Keycloak
    ✓ Caso 2 (401 -> Refresh -> Reintento): ante 401 refresca token y reintenta exitosamente con 200
    ✓ Caso 3 (Refresh fallido): si el refresco falla, redirige a login y no reintenta
    ✓ Caso 4 (403 Forbidden): NUNCA dispara refresco y propaga el error de autorización
    ✓ Caso 5 (Refresco Compartido): múltiples peticiones paralelas con 401 ejecutan UN SOLO POST de refresh

Test Files: 1 passed (1) | Tests: 10 passed (10) | Duration: 1.29s"""
code_block(code_tests, "src/app/core/auth/auth.spec.ts — Cobertura completa de PKCE, Guards e Interceptor")

# Sección 5: Error o Hallazgo Técnico
heading("5. Error o Hallazgo Técnico Diagnosticado", level=1)
p_err = p()
run(p_err, "Incidencia Detectada: ", bold=True, color=NAVY)
run(p_err, "Durante las pruebas del flujo Authorization Code + PKCE, al abrir la pantalla de autenticación en una pestaña nueva o recargar el callback manualmente, la petición de intercambio de token devolvía error HTTP 400 Bad Request desde Keycloak con la descripción ", color=BODY)
run(p_err, "'PKCE verification failed: invalid code_verifier'", italic=True, color=RED)
run(p_err, ".\n", color=BODY)

run(p_err, "Causa Raíz: ", bold=True, color=NAVY)
run(p_err, "El code_verifier inicial se intentó retener exclusivamente en una variable de memoria de Angular. Al redireccionar la ventana del navegador hacia el dominio externo de Keycloak (window.location.href) y regresar a la SPA en /auth/callback, el contexto de ejecución de JavaScript se reinicializó por completo, destruyendo la variable y enviando un verifier vacío o nulo en el cuerpo de la petición POST.\n", color=BODY)

run(p_err, "Solución Implementada: ", bold=True, color=NAVY)
run(p_err, "Se adoptó el patrón estándar OIDC: el code_verifier y el state se resguardan de forma efímera en sessionStorage únicamente durante la transición de redirección, y se eliminan de inmediato (sessionStorage.removeItem) en el milisegundo exacto en que /auth/callback lee el código y completa el intercambio. De esta forma, el token definitivo reside única y exclusivamente en memoria volátil de Angular Signals.\n", color=BODY)

run(p_err, "Aclaración sobre la Protección RBAC (403): ", bold=True, color=NAVY)
run(p_err, "La redirección a la vista /sin-acceso es una acción exclusiva de experiencia de usuario ejecutada por rolGuard en el cliente para evitar pantallas rotas; el rechazo HTTP 403 Forbidden formal e inviolable lo impone directamente el Resource Server Spring Boot mediante firma criptográfica RS256.", color=BODY)

p(after=6)

# Sección 6: Reflexión Técnica Breve (Caso British Airways y Recarga F5)
heading("6. Reflexión Técnica Breve (Caso British Airways y Recarga F5)", level=1)
t_ref = doc.add_table(rows=1, cols=1)
t_ref.alignment = WD_TABLE_ALIGNMENT.CENTER
t_ref.autofit = False
t_ref.columns[0].width = Inches(6.8)
c_ref = t_ref.cell(0, 0)
shade(c_ref, 'FEF3C7')
cell_margins(c_ref, 100, 120, 100, 120)
table_borders(t_ref, color='F59E0B', size='6')
p_ref = c_ref.paragraphs[0]
p_ref.paragraph_format.line_spacing = 1.15
p_ref.paragraph_format.space_after = Pt(0)

texto_ba = (
    "El caso de British Airways (1.6) aplica perfectamente a una SPA moderna porque demostró que un atacante "
    "no necesita interceptar la contraseña ni quebrar el canal TLS: mediante la inyección de 22 líneas de JavaScript "
    "(ataque de cadena de suministro tipo Magecart), extrajo datos directamente desde el contexto del navegador. "
    "En una SPA, si el Access Token o Refresh Token se almacenan en localStorage o cookies accesibles por script, "
    "cualquier dependencia de npm comprometida o script inyectado puede leerlos y exfiltrarlos silenciosamente. "
    "Mantener el token estrictamente en memoria (Angular Signals) garantiza que no exista superficie de persistencia en disco "
    "ni API accesible vía window.storage. El costo operacional ineludible de esta decisión es la volatilidad: al recargar "
    "la página (F5), el estado en memoria se destruye de inmediato. En SITRA-ORO mitigamos este costo sin vulnerar la memoria: "
    "rolGuard detecta la ausencia de token y redirige a Keycloak preservando el destino; al existir la cookie de sesión SSO "
    "HttpOnly en el Identity Provider, Keycloak reautentica silenciosamente sin pedir credenciales, emitiendo un nuevo código "
    "que /auth/callback canjea inmediatamente por tokens en memoria, restaurando la navegación de forma transparente."
)
run(p_ref, texto_ba, italic=False, color='78350F', size=8.8)

p(after=8)

# Sección 7: Anexo — Preguntas de Defensa Oficiales (4.5)
heading("7. Anexo: Preguntas de Defensa del Informe (S11 - Sección 4.5)", level=1)
preguntas_defensa = [
    ("1. ¿Por qué una SPA pública (sin secreto de cliente) no puede usar Direct access grants de forma segura, aunque técnicamente funcione?",
     "Porque Direct Access Grants exige que la SPA recolecte y manipule directamente las credenciales (usuario y contraseña) del operador, rompiendo el principio de delegación de OIDC. Además, al no poder resguardar un client_secret de forma confidencial en el código JavaScript del navegador, cualquier atacante que intercepte o inspeccione la SPA puede suplantar la identidad del cliente."),

    ("2. ¿Qué problema concreto resuelve PKCE que Authorization Code por sí solo no resuelve?",
     "Resuelve el ataque de intercepción del código de autorización (Authorization Code Interception Attack). En clientes públicos donde no hay secreto, un atacante o app maliciosa en el mismo dispositivo podría interceptar el 'code' en la redirección. Con PKCE, el atacante no puede canjearlo porque desconoce el 'code_verifier' criptográfico original que generó el 'code_challenge' SHA-256."),

    ("3. ¿Por qué el code_verifier sí se guarda en sessionStorage, si el resto de la sesión vive en memoria?",
     "Porque el navegador ejecuta una navegación completa (full-page redirect) hacia el servidor de Keycloak y de vuelta a la SPA, lo que reinicia la memoria de JavaScript. sessionStorage es el único almacenamiento que sobrevive a dicha redirección en la misma pestaña pero se destruye al cerrarla, y el verifier se elimina inmediatamente después de canjear el código."),

    ("4. ¿Qué pierde tu aplicación al elegir memoria en vez de localStorage para el token, y por qué esa pérdida es aceptable?",
     "Se pierde la persistencia ante recargas de página (F5), requiriendo reautenticar o renegociar el token. Esta pérdida es plenamente aceptable porque elimina el vector de ataque más severo en aplicaciones financieras/empresariales: el robo de tokens persistentes mediante ataques XSS o extensiones maliciosas del navegador."),

    ("5. ¿Por qué un 401 dispara un intento de refresco y un 403 no?",
     "Un 401 Unauthorized indica un problema de credenciales o autenticación (típicamente que el Access Token expiró tras sus 300 segundos de vigencia), el cual se subsana renovando el token con el Refresh Token. Un 403 Forbidden indica que el usuario está válidamente autenticado pero carece de permisos suficientes (RBAC); reintentar con otro token con el mismo rol devolvería exactamente el mismo rechazo."),

    ("6. Si tu guard de rol dejara pasar a un usuario sin el rol correcto, ¿seguiría tu backend rechazando la petición? ¿Por qué eso no vuelve innecesario el guard?",
     "Sí, el backend Spring Boot 3 Resource Server rechaza la petición con 403 porque valida criptográficamente el JWT y sus autoridades en cada endpoint. El guard de Angular no es innecesario porque cumple la función vital de Experiencia de Usuario (UX) y defensa en profundidad: evita renderizar vistas rotas, previene llamadas fallidas al servidor y orienta al operador con claridad."),

    ("7. ¿Qué pasaría si tu interceptor reintentara una petición en un bucle, sin límite, cada vez que recibiera un 401?",
     "Generaría un bucle infinito de peticiones (DoS accidental) que saturaría la red del cliente y los servidores de backend y Keycloak. Para evitarlo, el interceptor debe limitar el reintento a una sola ejecución mediante switchMap y, si el refresco falla o devuelve error, forzar el cierre de sesión y redirección a login.")
]

for q_num, (pregunta, respuesta) in enumerate(preguntas_defensa):
    qp = p(after=2, keep=True)
    run(qp, pregunta, bold=True, color=NAVY, size=8.8)
    ap = p(after=4, keep=True)
    run(ap, respuesta, color=BODY, size=8.5)

try:
    doc.save(str(OUT))
    print(f"Documento guardado exitosamente en: {OUT}")
except PermissionError:
    alt_out = DOCS / "S11_LP2_Equipo05_FaijoCalisayaHelioPaul_actualizado.docx"
    doc.save(str(alt_out))
    print(f"AVISO: El archivo principal está abierto en Word. Se guardó copia en: {alt_out}")
